/**
 * Format numerical amount into localized currency string.
 * Supported currency codes: INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), AUD (A$)
 */
export const CURRENCY_MAP = {
  INR: { label: 'Indian Rupee (₹)', symbol: '₹', locale: 'en-IN' },
  USD: { label: 'US Dollar ($)', symbol: '$', locale: 'en-US' },
  EUR: { label: 'Euro (€)', symbol: '€', locale: 'de-DE' },
  GBP: { label: 'British Pound (£)', symbol: '£', locale: 'en-GB' },
  JPY: { label: 'Japanese Yen (¥)', symbol: '¥', locale: 'ja-JP' },
  AUD: { label: 'Australian Dollar (A$)', symbol: 'A$', locale: 'en-AU' }
};

export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount) || 0;
  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;

  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2
  }).format(Math.abs(num));

  if (num < 0) {
    return `- ${formatted}`;
  }
  return formatted;
};

export const formatCompactNumber = (num) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(n);
};
