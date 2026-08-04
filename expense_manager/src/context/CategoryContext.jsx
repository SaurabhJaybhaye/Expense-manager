import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { useAuth } from './AuthContext';
import { fetchUserCategories, saveUserCategories } from '../services/firestoreService';

const CategoryContext = createContext(null);

const INITIAL_CUSTOM_CATEGORIES = {
  income: [],
  expense: [],
  deletedDefaults: []
};

export const CategoryProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [customCategories, setCustomCategories] = useState(INITIAL_CUSTOM_CATEGORIES);

  // Load custom categories from Firestore when currentUser changes
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!currentUser) {
        setCustomCategories(INITIAL_CUSTOM_CATEGORIES);
        return;
      }
      const data = await fetchUserCategories(currentUser.uid);
      if (isMounted && data) {
        setCustomCategories({
          income: data.income || [],
          expense: data.expense || [],
          deletedDefaults: data.deletedDefaults || []
        });
      }
    };
    loadCategories();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Helper to update and save categories to Firestore
  const updateAndSaveCategories = (newCategories) => {
    setCustomCategories(newCategories);
    const userId = currentUser?.uid || 'local_default_user';
    saveUserCategories(userId, newCategories);
  };

  // Combine default category names with custom categories, excluding deleted default tags
  const deletedDefaults = customCategories.deletedDefaults || [];
  const defaultIncomeNames = DEFAULT_CATEGORIES.INCOME.map(c => c.name).filter(name => !deletedDefaults.includes(name));
  const defaultExpenseNames = DEFAULT_CATEGORIES.EXPENSE.map(c => c.name).filter(name => !deletedDefaults.includes(name));

  const incomeCategories = Array.from(new Set([...defaultIncomeNames, ...(customCategories.income || [])]));
  const expenseCategories = Array.from(new Set([...defaultExpenseNames, ...(customCategories.expense || [])]));

  const addCategory = (name, type = 'expense') => {
    if (!name || typeof name !== 'string') return;
    const cleanName = name.trim();
    if (!cleanName) return;

    // If it was previously in deletedDefaults, remove it from deletedDefaults
    const currentDeleted = customCategories.deletedDefaults || [];
    const updatedDeleted = currentDeleted.filter(item => item !== cleanName);

    const targetList = customCategories[type] || [];
    if (targetList.includes(cleanName) && !currentDeleted.includes(cleanName)) return;

    const updated = {
      ...customCategories,
      deletedDefaults: updatedDeleted,
      [type]: Array.from(new Set([...targetList, cleanName]))
    };
    updateAndSaveCategories(updated);
  };

  const updateCategory = (oldName, newName, type = 'expense') => {
    if (!oldName || !newName) return;
    const cleanNew = newName.trim();
    if (!cleanNew) return;

    const targetList = customCategories[type] || [];
    const updated = {
      ...customCategories,
      [type]: targetList.map((item) => (item === oldName ? cleanNew : item))
    };
    updateAndSaveCategories(updated);
  };

  const deleteCategory = (name, type = 'expense') => {
    if (!name) return;
    const targetList = customCategories[type] || [];
    const currentDeleted = customCategories.deletedDefaults || [];
    
    // Add to deletedDefaults if it's a default category tag
    const updatedDeleted = Array.from(new Set([...currentDeleted, name]));

    const updated = {
      ...customCategories,
      deletedDefaults: updatedDeleted,
      [type]: targetList.filter((item) => item !== name)
    };
    updateAndSaveCategories(updated);
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
