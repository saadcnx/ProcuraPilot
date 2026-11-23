CREATE TABLE IF NOT EXISTS system_activity (
  id TEXT PRIMARY KEY,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_system_activity_timestamp ON system_activity("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_system_activity_actor ON system_activity(actor_id);