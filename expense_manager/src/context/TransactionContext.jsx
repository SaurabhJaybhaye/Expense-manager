import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchUserTransactions, 
  createTransaction, 
  removeTransaction, 
  batchCreateTransactions,
  fetchUserAccounts,
  saveUserAccounts 
} from '../services/firestoreService';
import { INITIAL_ACCOUNTS } from '../constants/accountTypes';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState(() => {
    const userId = currentUser?.uid;
    const key = userId ? `expense_manager_accounts_${userId}` : 'expense_manager_accounts';
    try {
      const saved = localStorage.getItem(key) || localStorage.getItem('expense_manager_accounts');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch (e) {
      return INITIAL_ACCOUNTS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('expense_manager_currency') || 'INR';
  });

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('expense_manager_currency', newCurrency);
  };

  // Load transactions and user accounts whenever currentUser changes
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      const userId = currentUser?.uid || 'local_default_user';

      setLoading(true);
      try {
        const [userTxList, userAccs] = await Promise.all([
          fetchUserTransactions(userId),
          fetchUserAccounts(userId)
        ]);

        if (isMounted) {
          setTransactions(userTxList || []);
          if (userAccs && userAccs.length > 0) {
            setAccounts(userAccs);
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Persist accounts whenever accounts state is modified
  const updateAndSaveAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    const userId = currentUser?.uid || 'local_default_user';
    saveUserAccounts(userId, newAccounts);
  };

  // Add transaction
  const addTransaction = async (txData) => {
    const userId = currentUser?.uid || 'local_default_user';
    const newTx = await createTransaction(userId, txData);
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Add Account-to-Account Transfer
  const addTransfer = async ({ fromAccount, toAccount, amount, date, description }) => {
    const userId = currentUser?.uid || 'local_default_user';
    const transferOut = await createTransaction(userId, {
      amount,
      type: 'expense',
      isTransfer: true,
      category: 'Account Transfer',
      account: fromAccount,
      date,
      description: `${description} (${fromAccount} → ${toAccount})`
    });

    const transferIn = await createTransaction(userId, {
      amount,
      type: 'income',
      isTransfer: true,
      category: 'Account Transfer',
      account: toAccount,
      date,
      description: `${description} (${fromAccount} → ${toAccount})`
    });

    setTransactions((prev) => [transferOut, transferIn, ...prev]);
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    const userId = currentUser?.uid || 'local_default_user';
    await removeTransaction(userId, id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Batch import transactions
  const importTransactions = async (importedList) => {
    const userId = currentUser?.uid || 'local_default_user';
    const validItems = importedList.filter((tx) => tx.isValid);
    const created = await batchCreateTransactions(userId, validItems);
    setTransactions((prev) => [...created, ...prev]);
    return created.length;
  };

  // Account Management CRUD
  const addAccount = (newAcc) => {
    const updated = [...accounts, { ...newAcc, id: `acc_${Date.now()}` }];
    updateAndSaveAccounts(updated);
  };

  const updateAccount = (updatedAcc) => {
    const updated = accounts.map(acc => acc.id === updatedAcc.id ? { ...acc, ...updatedAcc } : acc);
    updateAndSaveAccounts(updated);
  };

  const deleteAccount = (accountId) => {
    const updated = accounts.filter(acc => acc.id !== accountId);
    updateAndSaveAccounts(updated);
  };

  // Calculate totals excluding internal transfers from gross income/expense
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        accounts,
        loading,
        currency,
        setCurrency,
        totalIncome,
        totalExpenses,
        totalBalance,
        addTransaction,
        addTransfer,
        deleteTransaction,
        importTransactions,
        addAccount,
        updateAccount,
        deleteAccount
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
