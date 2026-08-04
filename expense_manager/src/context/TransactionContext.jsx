import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  fetchUserTransactions, 
  createTransaction, 
  removeTransaction, 
  batchRemoveTransactions,
  batchCreateTransactions,
  fetchUserAccounts,
  saveUserAccounts,
  updateTransactionsAccountName,
  editTransactionInFirestore 
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
      const userId = currentUser?.uid || 'local_default_user';

      setLoading(true);
      try {
        const [userTxList, userAccs] = await Promise.all([
          fetchUserTransactions(userId),
          fetchUserAccounts(userId)
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
    const userId = currentUser?.uid || 'local_default_user';
    saveUserAccounts(userId, newAccounts);
  };

  // Add transaction
  const addTransaction = async (txData) => {
    const userId = currentUser?.uid || 'local_default_user';
    const newTx = await createTransaction(userId, txData);
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Update existing transaction
  const updateTransaction = async (updatedTx) => {
    if (!updatedTx?.id) return;
    const userId = currentUser?.uid || 'local_default_user';
    setTransactions((prev) => prev.map(tx => tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx));
    await editTransactionInFirestore(userId, updatedTx.id, updatedTx);
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

  // Delete single transaction
  const deleteTransaction = async (id) => {
    const userId = currentUser?.uid || 'local_default_user';
    await removeTransaction(userId, id);
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Bulk Delete multiple transactions
  const bulkDeleteTransactions = async (transactionIds) => {
    if (!transactionIds || transactionIds.length === 0) return;
    const userId = currentUser?.uid || 'local_default_user';
    await batchRemoveTransactions(userId, transactionIds);
    setTransactions((prev) => prev.filter((tx) => !transactionIds.includes(tx.id)));
  };

  // Cascade Delete all transactions matching a specific category
  const deleteTransactionsByCategory = async (categoryName) => {
    if (!categoryName) return 0;
    const targetIds = transactions
      .filter(tx => tx.category?.toLowerCase() === categoryName.toLowerCase())
      .map(tx => tx.id);

    if (targetIds.length > 0) {
      await bulkDeleteTransactions(targetIds);
    }
    return targetIds.length;
  };

  // Batch import transactions
  const importTransactions = async (importedList) => {
    const userId = currentUser?.uid || 'local_default_user';
    const validItems = importedList.filter((tx) => tx.isValid);
    const created = await batchCreateTransactions(userId, validItems);
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

      const userId = currentUser?.uid || 'local_default_user';
      updateTransactionsAccountName(userId, oldName, updatedAcc.name);
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
        updateTransaction,
        addTransfer,
        deleteTransaction,
        bulkDeleteTransactions,
        deleteTransactionsByCategory,
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
