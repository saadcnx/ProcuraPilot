import { exec } from 'child_process';
import path from 'path';

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
  const payload = JSON.stringify(log).replace(/'/g, "'\\''");
  const scriptPath = path.join(__dirname, '../../scripts/log_activity.py');
  
  exec(`python3 '${scriptPath}' '${payload}'`, { env: process.env }, (error) => {
    if (error) {
      console.error('[ActivityLogger] Python script failed:', error);
    }
  });
}