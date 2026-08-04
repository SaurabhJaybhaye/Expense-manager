import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchUserTransactions, 
  createTransaction, 
  removeTransaction, 
  batchCreateTransactions,
  fetchUserAccounts,
  saveUserAccounts,
  updateTransactionsAccountName 
} from '../services/firestoreService';
import { INITIAL_ACCOUNTS } from '../constants/accountTypes';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');

  // Load transactions and user accounts directly from Firestore whenever currentUser changes
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!currentUser) {
        setTransactions([]);
        setAccounts(INITIAL_ACCOUNTS);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [userTxList, userAccs] = await Promise.all([
          fetchUserTransactions(currentUser.uid),
          fetchUserAccounts(currentUser.uid)
        ]);

        if (isMounted) {
          setTransactions(userTxList || []);
          setAccounts(userAccs || INITIAL_ACCOUNTS);
        }
      } catch (err) {
        console.error('Error loading user data from Firestore:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUserData();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Save accounts directly to Firestore
  const updateAndSaveAccounts = (newAccounts) => {
    setAccounts(newAccounts);
    if (currentUser) {
      saveUserAccounts(currentUser.uid, newAccounts);
    }
  };

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
    if (!currentUser) return 0;
    const validItems = importedList.filter((tx) => tx.isValid);
    const created = await batchCreateTransactions(currentUser.uid, validItems);
    setTransactions((prev) => [...created, ...prev]);
    return created.length;
  };

  // Account Management CRUD with Renaming Cascade
  const addAccount = (newAcc) => {
    const updated = [...accounts, { ...newAcc, id: `acc_${Date.now()}` }];
    updateAndSaveAccounts(updated);
  };

  const updateAccount = (updatedAcc) => {
    const oldAccount = accounts.find(acc => acc.id === updatedAcc.id);
    const oldName = oldAccount ? oldAccount.name : null;

    const updatedAccs = accounts.map(acc => acc.id === updatedAcc.id ? { ...acc, ...updatedAcc } : acc);
    updateAndSaveAccounts(updatedAccs);

    // If the account name was changed, update all associated transactions in state & Firestore!
    if (oldName && updatedAcc.name && oldName !== updatedAcc.name) {
      setTransactions(prev => prev.map(tx => {
        if (tx.account === oldName) {
          return { ...tx, account: updatedAcc.name };
        }
        return tx;
      }));

      if (currentUser) {
        updateTransactionsAccountName(currentUser.uid, oldName, updatedAcc.name);
      }
    }
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
