export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('BDT', '৳');
}

export function formatBDTFull(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('BDT', '৳');
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 100000)
    return `৳${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000)
    return `৳${(amount / 1000).toFixed(1)}K`;
  return formatBDT(amount);
}
