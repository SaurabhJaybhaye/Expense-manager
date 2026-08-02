/**
 * Blocks negative sign ('-') and exponential ('e', 'E') keystrokes on numeric amount inputs.
 */
export const preventNegativeKey = (e) => {
  if (e.key === '-' || e.key === 'e' || e.key === 'E') {
    e.preventDefault();
  }
};

/**
 * Strips negative signs and invalid characters from amount string.
 */
export const sanitizePositiveAmount = (val) => {
  if (typeof val !== 'string' && typeof val !== 'number') return '';
  const cleaned = String(val).replace(/[-eE]/g, '');
  return cleaned;
};

/**
 * Validates whether an amount is positive and greater than zero.
 */
export const validatePositiveAmount = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      error: 'Amount must be a positive number greater than ₹0.00'
    };
  }
  return {
    isValid: true,
    amount: num,
    error: ''
  };
};
