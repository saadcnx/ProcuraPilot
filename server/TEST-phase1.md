# Phase 1 Test Plan — Scanned PDF + OCR Fallback

## Preconditions
- Server rebuilt: `docker compose up -d --build backend`
- DB migrated (auto by compose)
- OpenAI key available (`sk-...`)
- Rules page reachable: /rules (as `boss` role)

## Test files (prepare)
1. **Digital PDF** — any PDF exported from Word/Google Docs (selectable text)
2. **Scanned PDF** — print any invoice/PO, scan it, or take a phone photo → save as PDF (no text layer)
3. **Multi-page scanned PDF** — 2+ page scan
4. **Corrupt PDF** — rename any `.txt` to `.pdf`

## Test Cases

### T1 — Digital PDF regression (must pass)
- Steps: Rules → AI key → Save. Upload digital PO + digital invoice → Run match
- Expected: invoice appears in queue (held or approved), no error toast
- Backend: `422` does NOT appear

### T2 — Scanned PDF without key
- Steps: Rules → clear AI key → Save. Upload scanned PO + scanned invoice
- Expected toast: "This looks like a scanned PDF. Add an AI key in Detection Rules..."
- Backend: `422 { error: "api_key_required_for_scanned_pdf" }`

### T3 — Scanned PDF with key (happy path)
- Steps: Rules → valid key → Save. Upload scanned PO + scanned invoice → Run match
- Expected: invoice appears in queue, line items visible on detail page, numbers sane
- Backend: `POST https://api.openai.com/v1/chat/completions` in log, `201 Created`

### T4 — Mixed (digital PO + scanned invoice)
- Steps: digital PO + scanned invoice
- Expected: both parsed, comparison table shows rows

### T5 — Multi-page scanned invoice
- Steps: 2+ page scanned invoice + digital PO
- Expected: lines from ALL pages present, no truncation

### T6 — Corrupt file
- Steps: upload `.txt` renamed to `.pdf`
- Expected: `422 { error: "invalid_pdf_format" }`, toast "Could not read the PDF format..."

### T7 — Vision failure (bad key)
- Steps: Rules → paste wrong key like `sk-invalid123` → Save. Upload scanned PDF
- Expected: `422 { error: "vision_extraction_failed" }`, toast "Could not extract data..."

## DB verification
```sql
SELECT id, vendor, invoice_number, status, created_at
  FROM checks ORDER BY created_at DESC LIMIT 5;

SELECT side, sku, description, qty, unit_price
  FROM line_items
  WHERE check_id = '<paste check id>'
  ORDER BY side, position;
```
Scanned uploads (T3/T5) must show real rows, not empty.

## Log checks
- `docker compose logs backend --tail 100`
- Must NOT contain `API parse failed`, `vision_extraction_failed` for T3
- Should NOT contain `pdf-to-img is not installed` (else Dockerfile canvas deps missing)

## Pass criteria
- T1, T3, T4, T5 → 201 + correct line items
- T2, T6, T7 → correct error codes, no crash
- No 500 errors in backend log