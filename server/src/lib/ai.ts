export type AiProvider = 'openai' | 'anthropic' | 'google';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export class AiError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'AiError';
  }
}

export type AiPart =
  | { type: 'text'; text: string }
  | { type: 'image'; mimeType: string; dataBase64: string };

export function defaultModelFor(provider: AiProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-5-sonnet-latest';
    case 'google':
      return 'gemini-1.5-flash';
  }
}

function normalizeProvider(v: string | undefined | null): AiProvider {
  if (v === 'anthropic' || v === 'google' || v === 'openai') return v;
  return 'openai';
}

export function aiConfigFromRules(r: {
  apiKey?: string;
  aiProvider?: string;
  aiModel?: string;
  aiBaseUrl?: string;
} | null | undefined): AiConfig | null {
  if (!r) return null;
  const apiKey = (r.apiKey ?? '').trim();
  if (!apiKey) return null;
  const provider = normalizeProvider(r.aiProvider);
  let model = (r.aiModel ?? '').trim();
  
  if (!model) {
    model = defaultModelFor(provider);
  } else if (provider === 'google' && !model.includes('gemini')) {
    model = 'gemini-1.5-flash';
  } else if (provider === 'anthropic' && !model.includes('claude')) {
    model = 'claude-3-5-sonnet-latest';
  } else if (provider === 'openai' && (model.includes('claude') || model.includes('gemini'))) {
    model = 'gpt-4o-mini';
  }

  const baseUrl = (r.aiBaseUrl ?? '').trim() || undefined;
  return { provider, apiKey, model, baseUrl };
}

export async function callAi(config: AiConfig, parts: AiPart[]): Promise<string> {
  if (!config.apiKey) throw new AiError('ai_key_missing');
  switch (config.provider) {
    case 'openai':
      return callOpenAiCompatible(config, parts);
    case 'anthropic':
      return callAnthropic(config, parts);
    case 'google':
      return callGoogle(config, parts);
    default:
      throw new AiError('ai_provider_unsupported', `Unsupported provider: ${config.provider as string}`);
  }
}

function openAiBase(config: AiConfig): string {
  const raw = (config.baseUrl ?? '').trim();
  if (!raw) return 'https://api.openai.com/v1';
  return raw.replace(/\/+$/, '');
}

async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) {
        if (i === retries - 1) return res;
        const delay = Math.pow(2, i) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}

async function callOpenAiCompatible(config: AiConfig, parts: AiPart[]): Promise<string> {
  const content = parts.map((p) =>
    p.type === 'text'
      ? { type: 'text', text: p.text }
      : { type: 'image_url', image_url: { url: `data:${p.mimeType};base64,${p.dataBase64}` } }
  );
  let res: Response;
  try {
    res = await fetchWithRetry(`${openAiBase(config)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_object' },
        max_tokens: 3000
      })
    });
  } catch (err) {
    throw new AiError('ai_network_error', err instanceof Error ? err.message : 'network error');
  }
  if (!res.ok) throw new AiError('ai_request_failed', `openai-compatible ${res.status}: ${await safeText(res)}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(config: AiConfig, parts: AiPart[]): Promise<string> {
  const content = parts.map((p) =>
    p.type === 'text'
      ? { type: 'text', text: p.text }
      : { type: 'image', source: { type: 'base64', media_type: p.mimeType, data: p.dataBase64 } }
  );
  let res: Response;
  try {
    res = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 3000,
        messages: [{ role: 'user', content }]
      })
    });
  } catch (err) {
    throw new AiError('ai_network_error', err instanceof Error ? err.message : 'network error');
  }
  if (!res.ok) throw new AiError('ai_request_failed', `anthropic ${res.status}: ${await safeText(res)}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  return data?.content?.[0]?.text ?? '';
}

async function callGoogle(config: AiConfig, parts: AiPart[]): Promise<string> {
  const payloadParts = parts.map((p) =>
    p.type === 'text'
      ? { text: p.text }
      : { inlineData: { mimeType: p.mimeType, data: p.dataBase64 } }
  );
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: payloadParts }] })
    });
  } catch (err) {
    throw new AiError('ai_network_error', err instanceof Error ? err.message : 'network error');
  }
  if (!res.ok) throw new AiError('ai_request_failed', `google ${res.status}: ${await safeText(res)}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 200);
  } catch {
    return '';
  }
}

export function parseAiJson(raw: string): Record<string, unknown> {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) throw new AiError('ai_empty_response');
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      /* fall through */
    }
  }
  throw new AiError('ai_invalid_json');
}