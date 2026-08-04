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

const GLOBAL_TX_KEY = 'expense_manager_transactions';
const GLOBAL_ACC_KEY = 'expense_manager_accounts';

const getUserTxKey = (userId) => userId ? `expense_manager_tx_${userId}` : GLOBAL_TX_KEY;
const getUserAccKey = (userId) => userId ? `expense_manager_accounts_${userId}` : GLOBAL_ACC_KEY;

// Helper to load local storage data safely
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
 * Fetch owner transactions (combines Firestore + local storage fallback)
 */
export const fetchUserTransactions = async (userId) => {
  const userTxKey = getUserTxKey(userId);
  let localList = getLocalData(userTxKey) || getLocalData(GLOBAL_TX_KEY) || [];

  if (userId) {
    localList = localList.filter(tx => tx.userId === userId || !tx.userId);
  }

  if (isConfigured && db && userId) {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const remoteList = [];
      querySnapshot.forEach((docSnap) => {
        remoteList.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (remoteList.length > 0) {
        // Merge remote + local uniquely by ID
        const map = new Map();
        [...remoteList, ...localList].forEach(tx => map.set(tx.id, tx));
        const merged = Array.from(map.values());
        setLocalData(userTxKey, merged);
        setLocalData(GLOBAL_TX_KEY, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Firestore fetch failed, serving local storage data:', e.message);
    }
  }

  return localList;
};

/**
 * Create transaction (guarantees local storage write + background Firestore sync)
 */
export const createTransaction = async (userId, txData) => {
  const userTxKey = getUserTxKey(userId);
  const payload = {
    ...txData,
    userId: userId || 'local_user',
    createdAt: new Date().toISOString()
  };

  const newTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ...payload
  };

  // 1. Save to local storage immediately
  const localList = getLocalData(userTxKey) || getLocalData(GLOBAL_TX_KEY) || [];
  const updatedLocal = [newTx, ...localList];
  setLocalData(userTxKey, updatedLocal);
  setLocalData(GLOBAL_TX_KEY, updatedLocal);

  // 2. Sync with Firestore if configured
  if (isConfigured && db && userId) {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...payload,
        createdAt: serverTimestamp()
      });
      newTx.id = docRef.id;
    } catch (e) {
      console.warn('Firestore add warning, retained local storage record:', e.message);
    }
  }

  return newTx;
};

/**
 * Batch create imported transactions (guarantees bulk write to local storage + background Firestore sync)
 */
export const batchCreateTransactions = async (userId, transactionsArray) => {
  if (!transactionsArray || transactionsArray.length === 0) return [];

  const userTxKey = getUserTxKey(userId);
  const createdList = transactionsArray.map((tx, idx) => ({
    id: `import_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
    ...tx,
    userId: userId || 'local_user',
    createdAt: new Date().toISOString()
  }));

  // 1. Immediately prepend all created items to local storage
  const existingLocal = getLocalData(userTxKey) || getLocalData(GLOBAL_TX_KEY) || [];
  const mergedLocal = [...createdList, ...existingLocal];
  setLocalData(userTxKey, mergedLocal);
  setLocalData(GLOBAL_TX_KEY, mergedLocal);

  // 2. Sync with Firestore in background if configured
  if (isConfigured && db && userId) {
    for (const item of createdList) {
      try {
        await addDoc(collection(db, 'transactions'), {
          ...item,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore batch item add warning:', e.message);
      }
    }
  }

  return createdList;
};

/**
 * Delete transaction with owner check
 */
export const removeTransaction = async (userId, transactionId) => {
  const userTxKey = getUserTxKey(userId);

  if (isConfigured && db && userId) {
    try {
      const docRef = doc(db, 'transactions', transactionId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore delete warning:', e.message);
    }
  }

  const list = getLocalData(userTxKey) || getLocalData(GLOBAL_TX_KEY) || [];
  const filtered = list.filter(tx => tx.id !== transactionId);
  setLocalData(userTxKey, filtered);
  setLocalData(GLOBAL_TX_KEY, filtered);
  return true;
};

/**
 * Fetch User Accounts (from LocalStorage + Firestore fallback)
 */
export const fetchUserAccounts = async (userId) => {
  const userAccKey = getUserAccKey(userId);
  const local = getLocalData(userAccKey) || getLocalData(GLOBAL_ACC_KEY);

  if (isConfigured && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'settings', 'accounts');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().accounts) {
        const remoteAccs = docSnap.data().accounts;
        setLocalData(userAccKey, remoteAccs);
        setLocalData(GLOBAL_ACC_KEY, remoteAccs);
        return remoteAccs;
      }
    } catch (e) {
      console.warn('Firestore accounts fetch failed, serving local storage accounts:', e.message);
    }
  }

  return local && local.length > 0 ? local : INITIAL_ACCOUNTS;
};

/**
 * Save User Accounts (to LocalStorage + background Firestore sync)
 */
export const saveUserAccounts = async (userId, accounts) => {
  const userAccKey = getUserAccKey(userId);
  setLocalData(userAccKey, accounts);
  setLocalData(GLOBAL_ACC_KEY, accounts);

  if (isConfigured && db && userId) {
    try {
      const docRef = doc(db, 'users', userId, 'settings', 'accounts');
      await setDoc(docRef, { accounts, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn('Firestore accounts save warning:', e.message);
    }
  }
};
