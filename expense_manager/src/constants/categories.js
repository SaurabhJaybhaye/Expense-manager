export const DEFAULT_CATEGORIES = {
  INCOME: [
    {
      id: 'cat_salary',
      name: 'Salary / Wages',
      type: 'income',
      icon: 'Briefcase',
      color: '#00ff87',
      subcategories: ['Base Pay', 'Performance Bonus', 'Overtime', 'Commission']
    },
    {
      id: 'cat_freelance',
      name: 'Freelance & Side Gigs',
      type: 'income',
      icon: 'Laptop',
      color: '#60a5fa',
      subcategories: ['Client Consulting', 'Digital Products', 'Content Creation']
    },
    {
      id: 'cat_investments',
      name: 'Investments & Dividends',
      type: 'income',
      icon: 'TrendingUp',
      color: '#a855f7',
      subcategories: ['Stock Dividends', 'Mutual Funds', 'Interest Yield', 'Crypto Gains']
    },
    {
      id: 'cat_other_income',
      name: 'Other Inflow',
      type: 'income',
      icon: 'Coins',
      color: '#10b981',
      subcategories: ['Gifts & Refunds', 'Cashback Rewards']
    }
  ],
  EXPENSE: [
    {
      id: 'cat_food',
      name: 'Food & Dining',
      type: 'expense',
      icon: 'Utensils',
      color: '#ec4899',
      subcategories: ['Groceries & Supermarket', 'Restaurants & Cafes', 'Food Delivery (Swiggy/Zomato)', 'Coffee & Snacks']
    },
    {
      id: 'cat_shopping',
      name: 'Shopping & Apparel',
      type: 'expense',
      icon: 'ShoppingBag',
      color: '#a855f7',
      subcategories: ['Clothing & Footwear', 'Electronics & Tech', 'Home Decor']
    },
    {
      id: 'cat_housing',
      name: 'Rent & Utilities',
      type: 'expense',
      icon: 'Home',
      color: '#60a5fa',
      subcategories: ['House Rent', 'Electricity & Power', 'Wi-Fi & Broadband', 'Water & Gas']
    },
    {
      id: 'cat_transport',
      name: 'Transportation & Fuel',
      type: 'expense',
      icon: 'Car',
      color: '#f59e0b',
      subcategories: ['Petrol & Fuel', 'Uber & Taxi', 'Public Transport', 'Vehicle Service & Maintenance']
    },
    {
      id: 'cat_entertainment',
      name: 'Entertainment & Subscriptions',
      type: 'expense',
      icon: 'Tv',
      color: '#00ff87',
      subcategories: ['Streaming (Netflix/Spotify)', 'Gaming & Apps', 'Movies & Concerts']
    },
    {
      id: 'cat_health',
      name: 'Medical & Healthcare',
      type: 'expense',
      icon: 'HeartPulse',
      color: '#ef4444',
      subcategories: ['Doctor Consultation', 'Medicines & Pharmacy', 'Gym & Fitness']
    },
    {
      id: 'cat_other_expense',
      name: 'Miscellaneous Outflow',
      type: 'expense',
      icon: 'HelpCircle',
      color: '#9ca3af',
      subcategories: ['General Expenses', 'Bank Fees & Charges']
    }
  ]
};
