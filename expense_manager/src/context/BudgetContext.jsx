import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserBudgets, saveUserBudgets } from '../services/firestoreService';

const BudgetContext = createContext(null);

const INITIAL_DEFAULT_BUDGETS = {};

export const BudgetProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [budgets, setBudgetsState] = useState(INITIAL_DEFAULT_BUDGETS);

  // Load budgets from Firestore when currentUser changes
  useEffect(() => {
    let isMounted = true;
    const loadBudgets = async () => {
      if (!currentUser) {
        setBudgetsState(INITIAL_DEFAULT_BUDGETS);
        return;
      }
      const data = await fetchUserBudgets(currentUser.uid);
      if (isMounted && data) {
        setBudgetsState(data);
      }
    };
    loadBudgets();
    return () => { isMounted = false; };
  }, [currentUser]);

  const updateAndSaveBudgets = (newBudgets) => {
    setBudgetsState(newBudgets);
    if (currentUser) {
      saveUserBudgets(currentUser.uid, newBudgets);
    }
  };

  const setBudgetCap = (category, capAmount) => {
    const num = Number(capAmount);
    const updated = {
      ...budgets,
      [category]: num > 0 ? num : 0
    };
    updateAndSaveBudgets(updated);
  };

  const removeBudgetCap = (category) => {
    const updated = { ...budgets };
    delete updated[category];
    updateAndSaveBudgets(updated);
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
