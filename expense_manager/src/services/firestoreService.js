import { db, isConfigured } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY_TX = 'expense_manager_transactions';
const LOCAL_STORAGE_KEY_ACC = 'expense_manager_accounts';

// Helper to load local storage data
const getLocalData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to update local storage', e);
  }
};

/**
 * Fetch owner transactions (enforces userId boundary)
 */
export const fetchUserTransactions = async (userId) => {
  if (!userId) return [];

  if (isConfigured && db) {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (e) {
      console.warn('Firestore fetch failed, falling back to local state:', e.message);
    }
  }

  const local = getLocalData(LOCAL_STORAGE_KEY_TX) || [];
  return local.filter(tx => tx.userId === userId);
};

/**
 * Create transaction (strictly assigns userId)
 */
export const createTransaction = async (userId, txData) => {
  const payload = {
    ...txData,
    userId,
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
      console.warn('Firestore add failed, saving locally:', e.message);
    }
  }

  const newTx = { id: `tx_local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...payload };
  const list = getLocalData(LOCAL_STORAGE_KEY_TX) || [];
  list.unshift(newTx);
  setLocalData(LOCAL_STORAGE_KEY_TX, list);
  return newTx;
};

/**
 * Batch create imported transactions
 */
export const batchCreateTransactions = async (userId, transactionsArray) => {
  const results = [];
  for (const tx of transactionsArray) {
    const created = await createTransaction(userId, tx);
    results.push(created);
  }
  return results;
};

/**
 * Delete transaction with owner check
 */
export const removeTransaction = async (userId, transactionId) => {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore delete failed:', e.message);
    }
  }

  const list = getLocalData(LOCAL_STORAGE_KEY_TX) || [];
  const filtered = list.filter(tx => !(tx.id === transactionId && tx.userId === userId));
  setLocalData(LOCAL_STORAGE_KEY_TX, filtered);
  return true;
};
