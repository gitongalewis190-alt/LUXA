// lib/utils/formatCurrency.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}
