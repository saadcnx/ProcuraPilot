import { AuditEntry } from '../../shared/types';

export const seedAuditLog: AuditEntry[] = [
{
  id: 'audit-0004',
  timestamp: '2026-11-06T16:42:09',
  invoiceId: 'pinecrest-2231',
  invoiceNumber: 'PC-2231',
  vendor: 'Pinecrest Catering',
  variance: 182.4,
  flagCount: 1,
  decision: 'force-approved',
  actor: 'Sana Mirza',
  actorRole: 'boss',
  reason:
  'Weekend surcharge agreed by the ops lead on a call; written confirmation filed under PO-20371.'
},
{
  id: 'audit-0003',
  timestamp: '2026-11-05T11:03:51',
  invoiceId: 'delta-9910',
  invoiceNumber: 'DF-9910',
  vendor: 'Delta Fasteners',
  variance: 1240,
  flagCount: 3,
  decision: 'rejected',
  actor: 'Ayesha Khan',
  actorRole: 'boss'
},
{
  id: 'audit-0002',
  timestamp: '2026-11-04T09:27:14',
  invoiceId: 'brightway-4410',
  invoiceNumber: 'BJ-4410',
  vendor: 'Brightway Janitorial',
  variance: 0,
  flagCount: 0,
  decision: 'approved',
  actor: 'Auto-match',
  actorRole: 'system'
},
{
  id: 'audit-0001',
  timestamp: '2026-11-03T15:55:30',
  invoiceId: 'coastal-1102',
  invoiceNumber: 'CFP-1102',
  vendor: 'Coastal Freight Partners',
  variance: 640,
  flagCount: 1,
  decision: 'force-approved',
  actor: 'Sana Mirza',
  actorRole: 'boss',
  reason: 'Fuel surcharge per contract clause 7.2; amount within the quarterly cap.'
}];