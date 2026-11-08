const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export function formatCurrency(value: number): string {
  return formatter.format(value);
}

export function formatSignedCurrency(value: number): string {
  if (Math.abs(value) < 0.005) return formatter.format(0);
  return `${value > 0 ? '+' : '−'}${formatter.format(Math.abs(value))}`;
}