const INJECTION_PREFIX = /^[=+\-@\t\r]/;

function escapeCsvCell(cell: string): string {
  const raw = String(cell);
  const safe = INJECTION_PREFIX.test(raw) ? "'" + raw : raw;
  const quoted = safe.replace(/"/g, '""');
  return '"' + quoted + '"';
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}