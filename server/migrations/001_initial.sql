CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('inspector','boss')),
  active BOOLEAN NOT NULL DEFAULT true,
  force_approvals INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checks (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  po_number TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  invoice_tax_charged NUMERIC(14,2) NOT NULL DEFAULT 0,
  bank_account TEXT NOT NULL DEFAULT '',
  bank_on_file TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held','approved','rejected')),
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_checks_status_received ON checks(status, received_at DESC);

CREATE TABLE IF NOT EXISTS line_items (
  id BIGSERIAL PRIMARY KEY,
  check_id TEXT NOT NULL REFERENCES checks(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('po','invoice')),
  sku TEXT NOT NULL,
  description TEXT NOT NULL,
  qty NUMERIC(14,3) NOT NULL,
  unit_price NUMERIC(14,4) NOT NULL,
  position INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_line_items_check ON line_items(check_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  check_id TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invoice_number TEXT NOT NULL,
  vendor TEXT NOT NULL,
  variance NUMERIC(14,2) NOT NULL,
  flag_count INT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected','force-approved')),
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log("timestamp" DESC);

CREATE TABLE IF NOT EXISTS rules (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tolerance_amount NUMERIC(14,2) NOT NULL DEFAULT 5,
  tolerance_percent NUMERIC(6,3) NOT NULL DEFAULT 1,
  bank_check BOOLEAN NOT NULL DEFAULT true,
  panic_threshold NUMERIC(14,2) NOT NULL DEFAULT 10000,
  panic_email TEXT NOT NULL DEFAULT 'cfo@procurapilot.com',
  api_key_encrypted TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO rules (id) VALUES (1) ON CONFLICT DO NOTHING;