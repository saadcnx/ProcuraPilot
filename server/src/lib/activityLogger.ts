
```typescript
import { pool } from '../db/pool';

export interface ActivityLog {
  action: string;
  resource_type?: string;
  resource_id?: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  details?: Record<string, any>;
}

export function logActivity(log: ActivityLog): void {
  pool
    .query(
      `INSERT INTO system_activity (id, action, resource_type, resource_id, actor_id, actor_name, actor_role, details)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7)`,
      [
        log.action,
        log.resource_type ?? null,
        log.resource_id ?? null,
        log.actor_id ?? null,
        log.actor_name ?? '',
        log.actor_role ?? '',
        JSON.stringify(log.details ?? {})
      ]
    )
    .catch((err) => {
      console.error('[ActivityLogger] insert failed:', err);
    });
}