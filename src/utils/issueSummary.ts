import { flagMeta } from '../data/flagMeta';
import { ComparisonResult } from './compare';

export function issueSummary(result: ComparisonResult): string {
  if (result.mismatchedItems > 0) {
    return `${result.mismatchedItems} of ${result.rows.length} items mismatched`;
  }
  const first = result.flags[0];
  return first ? flagMeta[first.kind].label : 'Matched';
}