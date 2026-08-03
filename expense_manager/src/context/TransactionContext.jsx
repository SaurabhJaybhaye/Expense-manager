import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserTransactions, createTransaction, removeTransaction, batchCreateTransactions } from '../services/firestoreService';
import { INITIAL_ACCOUNTS } from '../constants/accountTypes';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('expense_manager_currency') || 'INR';
  });

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('expense_manager_currency', newCurrency);
  };

  // Load transactions whenever currentUser changes
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!currentUser) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await fetchUserTransactions(currentUser.uid);
      
      if (isMounted) {
        setTransactions(data || []);
        setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Add transaction
  const addTransaction = async (txData) => {
    if (!currentUser) return;
    const newTx = await createTransaction(currentUser.uid, txData);
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Add Account-to-Account Transfer
  const addTransfer = async ({ fromAccount, toAccount, amount, date, description }) => {
    if (!currentUser) return;
    const transferOut = await createTransaction(currentUser.uid, {
      amount,
      type: 'expense',
      isTransfer: true,
      category: 'Account Transfer',
      account: fromAccount,
      date,
      description: `${description} (${fromAccount} → ${toAccount})`
    });

    const transferIn = await createTransaction(currentUser.uid, {
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
    if (!currentUser) return;
    await removeTransaction(currentUser.uid, id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Batch import transactions
  const importTransactions = async (importedList) => {
    if (!currentUser) return;
    const validItems = importedList.filter((tx) => tx.isValid);
    const created = await batchCreateTransactions(currentUser.uid, validItems);
    setTransactions((prev) => [...created, ...prev]);
    return created.length;
  };

  // Add custom account
  const addAccount = (newAcc) => {
    setAccounts(prev => [...prev, { ...newAcc, id: `acc_${Date.now()}` }]);
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
        addAccount
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
