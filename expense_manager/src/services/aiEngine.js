/**
 * AI & Pattern Matching Merchant Auto-Categorization Rule Engine
 */

const MERCHANT_PATTERNS = [
  // Food & Dining
  { keywords: ['swiggy', 'zomato', 'ubereats', 'doordash', 'blinkit', 'zepto', 'd-mart', 'dmart', 'bigbasket', 'instamart', 'starbucks', 'mcdonalds', 'kfc', 'dominos', 'pizza', 'restaurant', 'cafe', 'bistro', 'bakery', 'dinner', 'lunch', 'breakfast', 'food', 'groceries', 'supermarket'], category: 'Food & Dining', type: 'expense' },

  // Transportation & Fuel
  { keywords: ['uber', 'ola', 'rapido', 'lyft', 'shell', 'hpcl', 'bpcl', 'iocL', 'petrol', 'diesel', 'fuel', 'metro', 'auto', 'cab', 'taxi', 'toll', 'fastag', 'parking'], category: 'Transportation & Fuel', type: 'expense' },

  // Rent & Utilities
  { keywords: ['rent', 'landlord', 'electricity', 'power', 'bescom', 'mseb', 'tata power', 'wifi', 'broadband', 'airtel', 'jio', 'vi', 'vodafone', 'water', 'gas', 'lpg', 'pipeline'], category: 'Rent & Utilities', type: 'expense' },

  // Entertainment & Subscriptions
  { keywords: ['netflix', 'spotify', 'prime', 'amazon prime', 'hotstar', 'youtube', 'apple', 'icloud', 'disney', 'hbo', 'playstation', 'xbox', 'steam', 'cinema', 'pvr', 'inox', 'movie', 'concert'], category: 'Entertainment & Subscriptions', type: 'expense' },

  // Shopping & Apparel
  { keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'uniqlo', 'ajio', 'meesho', 'reliancetrends', 'decathlon', 'nike', 'adidas', 'puma', 'shopping', 'apparel', 'clothes', 'shoes', 'electronics'], category: 'Shopping & Apparel', type: 'expense' },

  // Medical & Healthcare
  { keywords: ['apollo', 'pharmeasy', '1mg', 'pharmacy', 'chemist', 'hospital', 'clinic', 'doctor', 'lab', 'pathology', 'cultfit', 'gym', 'fitness', 'medical', 'dental'], category: 'Medical & Healthcare', type: 'expense' },

  // Salary & Income
  { keywords: ['salary', 'payroll', 'wages', 'stipend', 'employer', 'inc', 'ltd', 'technologies', 'bonus', 'commission'], category: 'Salary / Wages', type: 'income' },

  // Freelance & Side Gigs
  { keywords: ['upwork', 'fiverr', 'toptal', 'consulting', 'client', 'payout', 'freelance', 'stripe', 'paypal'], category: 'Freelance & Side Gigs', type: 'income' },

  // Investments & Dividends
  { keywords: ['zerodha', 'groww', 'upstox', 'coinbase', 'binance', 'dividend', 'interest', 'mutual fund', 'stocks', 'equity'], category: 'Investments & Dividends', type: 'income' }
];

/**
 * Predicts transaction category based on description text.
 * Returns prediction object: { category: string, confidence: number, matchedKeyword: string }
 */
export const predictCategory = (description = '') => {
  if (!description || typeof description !== 'string') {
    return { category: null, confidence: 0, matchedKeyword: '' };
  }

  const cleanText = description.toLowerCase().trim();
  if (!cleanText) {
    return { category: null, confidence: 0, matchedKeyword: '' };
  }

  for (const pattern of MERCHANT_PATTERNS) {
    for (const kw of pattern.keywords) {
      if (cleanText.includes(kw)) {
        return {
          category: pattern.category,
          confidence: 0.92, // High confidence match
          matchedKeyword: kw,
          recommendedType: pattern.type
        };
      }
    }
  }

  return { category: null, confidence: 0, matchedKeyword: '' };
};
