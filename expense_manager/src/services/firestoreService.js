import { db, isConfigured } from './firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  setDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { INITIAL_ACCOUNTS } from '../constants/accountTypes';

/**
 * Fetch user transactions directly from Cloud Firestore
 */
export const fetchUserTransactions = async (userId) => {
  if (!userId || !isConfigured || !db) return [];

  try {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort newest first by date/createdAt
    return list.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  } catch (e) {
    console.error('Firestore fetchUserTransactions error:', e.message);
    return [];
  }
};

/**
 * Create a new transaction directly in Cloud Firestore
 */
export const createTransaction = async (userId, txData) => {
  const payload = {
    ...txData,
    userId: userId || 'anonymous',
    createdAt: new Date().toISOString()
  };

  if (isConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...payload,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...payload };
    } catch (e) {
      console.error('Firestore createTransaction error:', e.message);
    }
  }

  return { id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...payload };
};

/**
 * Batch create imported transactions directly in Cloud Firestore
 */
export const batchCreateTransactions = async (userId, transactionsArray) => {
  if (!transactionsArray || transactionsArray.length === 0) return [];
  const results = [];

  for (const item of transactionsArray) {
    const created = await createTransaction(userId, item);
    results.push(created);
  }

  return results;
};

/**
 * Delete a transaction directly from Cloud Firestore
 */
export const removeTransaction = async (userId, transactionId) => {
  if (isConfigured && db && transactionId) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Firestore removeTransaction error:', e.message);
    }
  }
  return false;
};

/**
 * Update transaction account references when an account is renamed
 */
export const updateTransactionsAccountName = async (userId, oldName, newName) => {
  if (!userId || !isConfigured || !db || !oldName || !newName || oldName === newName) return;

  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('account', '==', oldName)
    );
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    querySnapshot.forEach((docSnap) => {
      updatePromises.push(setDoc(doc(db, 'transactions', docSnap.id), { account: newName }, { merge: true }));
    });
    await Promise.all(updatePromises);
  } catch (e) {
    console.error('Firestore updateTransactionsAccountName error:', e.message);
  }
};

/**
 * Fetch User Accounts directly from Cloud Firestore
 */
export const fetchUserAccounts = async (userId) => {
  if (!userId || !isConfigured || !db) return INITIAL_ACCOUNTS;

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'accounts');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().accounts) {
      return docSnap.data().accounts;
    }
  } catch (e) {
    console.error('Firestore fetchUserAccounts error:', e.message);
  }

  return INITIAL_ACCOUNTS;
};

/**
 * Save User Accounts directly to Cloud Firestore
 */
export const saveUserAccounts = async (userId, accounts) => {
  if (!userId || !isConfigured || !db) return;

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'accounts');
    await setDoc(docRef, { accounts, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error('Firestore saveUserAccounts error:', e.message);
  }
};

/**
 * Fetch Custom Categories directly from Cloud Firestore
 */
export const fetchUserCategories = async (userId) => {
  if (!userId || !isConfigured || !db) return { income: [], expense: [] };

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'categories');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().categories) {
      return docSnap.data().categories;
    }
  } catch (e) {
    console.error('Firestore fetchUserCategories error:', e.message);
  }

  return { income: [], expense: [] };
};

/**
 * Save Custom Categories directly to Cloud Firestore
 */
export const saveUserCategories = async (userId, categories) => {
  if (!userId || !isConfigured || !db) return;

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'categories');
    await setDoc(docRef, { categories, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error('Firestore saveUserCategories error:', e.message);
  }
};

/**
 * Fetch Category Budgets directly from Cloud Firestore
 */
export const fetchUserBudgets = async (userId) => {
  if (!userId || !isConfigured || !db) return {};

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'budgets');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().budgets) {
      return docSnap.data().budgets;
    }
  } catch (e) {
    console.error('Firestore fetchUserBudgets error:', e.message);
  }

  return {};
};

/**
 * Save Category Budgets directly to Cloud Firestore
 */
export const saveUserBudgets = async (userId, budgets) => {
  if (!userId || !isConfigured || !db) return;

  try {
    const docRef = doc(db, 'users', userId, 'settings', 'budgets');
    await setDoc(docRef, { budgets, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.error('Firestore saveUserBudgets error:', e.message);
  }
};
