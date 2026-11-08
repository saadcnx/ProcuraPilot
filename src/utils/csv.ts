export function toCsv(rows: string[][]): string {
  return rows.
  map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).
  join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}