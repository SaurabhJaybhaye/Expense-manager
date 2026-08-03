export const ACCOUNT_TYPES = {
  CASH: {
    id: 'cash',
    name: 'Cash In Hand',
    icon: 'Banknote',
    color: '#00ff87'
  },
  BANK: {
    id: 'bank',
    name: 'Bank Account',
    icon: 'Building2',
    color: '#60a5fa'
  },
  CREDIT_CARD: {
    id: 'credit_card',
    name: 'Credit Card',
    icon: 'CreditCard',
    color: '#ec4899'
  },
  SAVINGS: {
    id: 'savings',
    name: 'Savings Vault',
    icon: 'PiggyBank',
    color: '#a855f7'
  }
};

export const INITIAL_ACCOUNTS = [
  { id: 'acc_cash', name: 'Cash In Hand', type: 'cash', balance: 0, currency: 'INR' },
  { id: 'acc_bank', name: 'Primary Bank Account', type: 'bank', balance: 0, currency: 'INR' },
  { id: 'acc_cc', name: 'Credit Card', type: 'credit_card', balance: 0, currency: 'INR' }
];
