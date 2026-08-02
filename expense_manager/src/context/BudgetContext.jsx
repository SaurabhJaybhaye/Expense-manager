import React, { createContext, useContext, useState, useEffect } from 'react';

const BudgetContext = createContext(null);

const INITIAL_DEFAULT_BUDGETS = {
  'Food & Dining': 12000,
  'Entertainment & Subscriptions': 4000,
  'Shopping & Apparel': 8000,
  'Transportation & Fuel': 6000,
  'Rent & Utilities': 25000
};

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgetsState] = useState(() => {
    const saved = localStorage.getItem('expense_manager_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEFAULT_BUDGETS;
      }
    }
    return INITIAL_DEFAULT_BUDGETS;
  });

  useEffect(() => {
    localStorage.setItem('expense_manager_budgets', JSON.stringify(budgets));
  }, [budgets]);

  const setBudgetCap = (category, capAmount) => {
    const num = Number(capAmount);
    setBudgetsState((prev) => ({
      ...prev,
      [category]: num > 0 ? num : 0
    }));
  };

  const removeBudgetCap = (category) => {
    setBudgetsState((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        setBudgetCap,
        removeBudgetCap
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);
