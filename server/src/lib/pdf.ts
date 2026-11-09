import pdf from 'pdf-parse';
import { LineItem } from '../engine/types';
import { AiConfig, AiError, AiPart, callAi, parseAiJson } from './ai';

export interface ParsedDoc {
  vendor: string;
  referenceNumber: string;
  taxRate: number;
  chargedTax: number | null;
  bankAccount: string;
  lines: LineItem[];
  rawText: string;
}

export class ParseError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'ParseError';
  }
}

const MIN_TEXT_LENGTH = 100;
const MAX_VISION_PAGES = 5;

function hasUsableContent(doc: ParsedDoc): boolean {
  return doc.lines.length > 0;
}

function looksScanned(text: string): boolean {
  return text.trim().length < MIN_TEXT_LENGTH;
}

export async function parsePdf(
  buffer: Buffer,
  kind: 'po' | 'invoice',
  aiConfig?: AiConfig | null
): Promise<ParsedDoc> {
  const hasConfig = !!aiConfig && (aiConfig.apiKey ?? '').trim().length > 10;
  let text = '';

  try {
    const data = await pdf(buffer);
    text = data.text ?? '';
  } catch (err) {
    console.error('[pdf] pdf-parse failed, attempting vision fallback:', err);
    if (!hasConfig || !aiConfig) {
      throw new ParseError('invalid_pdf_format', err instanceof Error ? err.message : 'PDF parse error');
    }
    const visionDoc = await parseScannedPdf(buffer, kind, aiConfig);
    if (!hasUsableContent(visionDoc)) {
      throw new ParseError('vision_extraction_failed', 'Could not extract line items from this PDF.');
    }
    return visionDoc;
  }

  const textDoc = parseDocumentText(text, kind);
  const textHasLines = textDoc.lines.length > 0;

  if (!looksScanned(text) && textHasLines) {
    if (hasConfig && aiConfig) {
      try {
        const apiDoc = await parseWithApi(text, kind, aiConfig);
        if (hasUsableContent(apiDoc)) return apiDoc;
      } catch (apiError) {
        console.error('[pdf] API text parse failed, using regex:', apiError);
      }
    }
    return textDoc;
  }

  if (!hasConfig || !aiConfig) {
    throw new ParseError(
      'api_key_required_for_scanned_pdf',
      'PDF has no readable text layer. Configure an AI provider in Detection Rules to read scanned documents.'
    );
  }

  const visionDoc = await parseScannedPdf(buffer, kind, aiConfig);
  if (!hasUsableContent(visionDoc)) {
    if (textHasLines) return textDoc;
    throw new ParseError('vision_extraction_failed', 'Could not extract line items from this scanned PDF.');
  }
  return visionDoc;
}

async function parseScannedPdf(
  buffer: Buffer,
  kind: 'po' | 'invoice',
  aiConfig: AiConfig
): Promise<ParsedDoc> {
  let toImages: (buf: Buffer, opts?: { scale?: number }) => Promise<AsyncIterable<Buffer>>;
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string
    ) => Promise<any>;
    const mod = await dynamicImport('pdf-to-img');
    toImages = mod.pdf as unknown as typeof toImages;
  } catch {
    throw new ParseError(
      'vision_dependency_missing',
      'pdf-to-img is not installed. Run `npm install` in server/.'
    );
  }

  const imageBuffers: Buffer[] = [];
  try {
    const doc = await toImages(buffer, { scale: 2 });
    let rendered = 0;
    for await (const page of doc) {
      if (rendered >= MAX_VISION_PAGES) break;
      imageBuffers.push(page as Buffer);
      rendered++;
    }
  } catch (err) {
    throw new ParseError(
      'vision_extraction_failed',
      err instanceof Error ? err.message : 'Could not render PDF pages.'
    );
  }

  if (imageBuffers.length === 0) {
    throw new ParseError('vision_extraction_failed', 'No pages could be rendered from PDF.');
  }

  return parseWithVision(imageBuffers, kind, aiConfig);
}

async function parseWithVision(
  images: Buffer[],
  kind: 'po' | 'invoice',
  aiConfig: AiConfig
): Promise<ParsedDoc> {
  const schema = `{
    "vendor": "string",
    "referenceNumber": "string",
    "taxRate": number,
    "chargedTax": number or null,
    "bankAccount": "string",
    "lines": [
      { "sku": "string", "description": "string", "qty": number, "unitPrice": number }
    ]
  }`;
  const prompt = `Extract structured data from this ${kind === 'po' ? 'purchase order' : 'invoice'}, which may span multiple pages. Return ONLY valid JSON matching this schema:
${schema}
Rules:
- sku: use the product code if visible, otherwise SKU-<index>.
- qty and unitPrice: numbers only, no currency symbols.
- taxRate: decimal (8% => 0.08).
- chargedTax: printed tax amount, or null.
- bankAccount: masked account if shown (e.g. bullets 1234).
- Merge line items across all pages.`;

  const parts: AiPart[] = [{ type: 'text', text: prompt }];
  for (const img of images) {
    parts.push({ type: 'image', mimeType: 'image/png', dataBase64: img.toString('base64') });
  }

  let raw: string;
  try {
    raw = await callAi(aiConfig, parts);
  } catch (err) {
    if (err instanceof AiError) {
      throw new ParseError('vision_extraction_failed', err.message);
    }
    throw new ParseError(
      'vision_extraction_failed',
      err instanceof Error ? err.message : 'Vision call failed'
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = parseAiJson(raw);
  } catch {
    throw new ParseError('vision_extraction_failed', 'Vision returned invalid JSON');
  }

  return {
    vendor: String(parsed.vendor ?? '').slice(0, 200),
    referenceNumber: String(parsed.referenceNumber ?? '').slice(0, 100),
    taxRate: normalizeRate(parsed.taxRate),
    chargedTax: parsed.chargedTax == null ? null : Number(parsed.chargedTax) || null,
    bankAccount: String(parsed.bankAccount ?? ''),
    lines: normalizeLines(parsed.lines),
    rawText: ''
  };
}

function normalizeRate(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 1 ? n / 100 : n;
}

function normalizeLines(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return [];
  const lines: LineItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const l = raw[i] as Record<string, unknown> | null | undefined;
    if (!l) continue;
    const qty = Number(l.qty);
    const unitPrice = Number(l.unitPrice);
    if (!Number.isFinite(qty) || !Number.isFinite(unitPrice) || qty <= 0) continue;
    const desc = String(l.description ?? '').trim();
    if (!desc) continue;
    const sku = String(l.sku ?? '').trim() || `SKU-${i + 1}`;
    lines.push({ sku, description: desc, qty, unitPrice });
  }
  return lines;
}

async function parseWithApi(
  text: string,
  kind: 'po' | 'invoice',
  aiConfig: AiConfig
): Promise<ParsedDoc> {
  const prompt = `Extract the following data from this ${kind === 'po' ? 'purchase order' : 'invoice'} text and return ONLY a valid JSON object matching this exact schema:
{
  "vendor": "string",
  "referenceNumber": "string",
  "taxRate": number (e.g., 0.08 for 8%),
  "chargedTax": number or null,
  "bankAccount": "string",
  "lines": [
    { "sku": "string", "description": "string", "qty": number, "unitPrice": number }
  ]
}
Text:
${text}`;

  const raw = await callAi(aiConfig, [{ type: 'text', text: prompt }]);
  const parsed = parseAiJson(raw);

  return {
    vendor: String(parsed.vendor ?? ''),
    referenceNumber: String(parsed.referenceNumber ?? ''),
    taxRate: normalizeRate(parsed.taxRate),
    chargedTax: parsed.chargedTax == null ? null : Number(parsed.chargedTax) || null,
    bankAccount: String(parsed.bankAccount ?? ''),
    lines: normalizeLines(parsed.lines),
    rawText: text
  };
}

export function parseDocumentText(text: string, kind: 'po' | 'invoice'): ParsedDoc {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return {
    vendor: detectVendor(rawLines),
    referenceNumber: detectRef(text, kind),
    taxRate: detectTaxRate(text),
    chargedTax: detectChargedTax(text),
    bankAccount: detectBankAccount(text),
    lines: detectLines(rawLines),
    rawText: text
  };
}

function detectVendor(lines: string[]): string {
  const skip = /^(purchase\s*order|invoice|bill|from|to|date|page|ref|tel|fax|address|www|http|\+?\d)/i;
  for (const line of lines) {
    if (line.length < 3) continue;
    if (skip.test(line)) continue;
    if (/^\d/.test(line)) continue;
    return line.slice(0, 120);
  }
  return 'Unknown vendor';
}

function detectRef(text: string, kind: 'po' | 'invoice'): string {
  const patterns = kind === 'po'
    ? [/purchase\s*order\s*[#:]*\s*([A-Z0-9][A-Z0-9\-/]{2,})/i, /\bPO[-#\s:]*([A-Z0-9][A-Z0-9\-/]{2,})/i]
    : [/invoice\s*(?:number|no|#|:)*\s*([A-Z0-9][A-Z0-9\-/]{2,})/i, /\bINV[-#\s:]*([A-Z0-9][A-Z0-9\-/]{2,})/i];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].length >= 3) return m[1];
  }
  return '';
}

function detectTaxRate(text: string): number {
  const m = text.match(/tax(?:\s*rate)?[^\d%]{0,20}(\d+(?:\.\d+)?)\s*%/i);
  if (m) return Number(m[1]) / 100;
  return 0;
}

function detectChargedTax(text: string): number | null {
  const m = text.match(/(?:sales\s*)?tax[^\d$]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

function detectBankAccount(text: string): string {
  const patterns = [/••••\s*(\d{3,6})/, /[*xX]{2,}\s*(\d{3,6})/, /(?:ending|last\s*4|acct|account)[^\d]{0,15}(\d{3,6})/i];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return `•••• ${m[1]}`;
  }
  return '';
}

function detectLines(lines: string[]): LineItem[] {
  const items: LineItem[] = [];
  for (let line of lines) {
    line = line.trim();
    const m = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+(?:@\s*)?\$?([\d,]+\.\d{2})(?:\s+(?:=?\s*\$?([\d,]+\.\d{2}))?)?$/);
    if (!m) continue;
    const desc = m[1].trim();
    if (desc.length < 2 || /^[0-9\s]+$/.test(desc)) continue;
    const qty = Number(m[2]);
    const unitPrice = Number(m[3].replace(/,/g, ''));
    if (!qty || !unitPrice || unitPrice < 0.01) continue;

    let sku = `SKU-${items.length + 1}`;
    let description = desc;
    const skuMatch = desc.match(/^([A-Za-z0-9\-_]{3,15})\s+(.+)$/);
    if (skuMatch && /[A-Za-z]/.test(skuMatch[1])) {
      sku = skuMatch[1];
      description = skuMatch[2];
    }

    items.push({ sku, description, qty, unitPrice });
  }
  return items;
}