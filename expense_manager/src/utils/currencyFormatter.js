/**
 * Format numerical amount into Indian Rupee (INR - ₹) standard representation.
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatCompactNumber = (num) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(n);
};
