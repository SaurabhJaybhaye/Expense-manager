import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const CategoryContext = createContext(null);

const INITIAL_CUSTOM_CATEGORIES = {
  income: [],
  expense: []
};

export const CategoryProvider = ({ children }) => {
  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem('expense_manager_custom_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CUSTOM_CATEGORIES;
      }
    }
    return INITIAL_CUSTOM_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('expense_manager_custom_categories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Combine default category names with custom categories
  const defaultIncomeNames = DEFAULT_CATEGORIES.INCOME.map(c => c.name);
  const defaultExpenseNames = DEFAULT_CATEGORIES.EXPENSE.map(c => c.name);

  const incomeCategories = Array.from(new Set([...defaultIncomeNames, ...(customCategories.income || [])]));
  const expenseCategories = Array.from(new Set([...defaultExpenseNames, ...(customCategories.expense || [])]));

  const addCategory = (name, type = 'expense') => {
    if (!name || typeof name !== 'string') return;
    const cleanName = name.trim();
    if (!cleanName) return;

    setCustomCategories((prev) => {
      const targetList = prev[type] || [];
      if (targetList.includes(cleanName)) return prev;
      return {
        ...prev,
        [type]: [...targetList, cleanName]
      };
    });
  };

  const updateCategory = (oldName, newName, type = 'expense') => {
    if (!oldName || !newName) return;
    const cleanNew = newName.trim();
    if (!cleanNew) return;

    setCustomCategories((prev) => {
      const targetList = prev[type] || [];
      return {
        ...prev,
        [type]: targetList.map((item) => (item === oldName ? cleanNew : item))
      };
    });
  };

  const deleteCategory = (name, type = 'expense') => {
    if (!name) return;
    setCustomCategories((prev) => {
      const targetList = prev[type] || [];
      return {
        ...prev,
        [type]: targetList.filter((item) => item !== name)
      };
    });
  };

  return (
    <CategoryContext.Provider
      value={{
        incomeCategories,
        expenseCategories,
        customCategories,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
