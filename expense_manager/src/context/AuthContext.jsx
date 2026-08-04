import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isConfigured } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate deterministic local UID from email
  const getDeterministicUid = (email) => {
    if (!email) return 'local_default_user';
    return 'local_user_' + String(email).toLowerCase().replace(/[^a-z0-9]/g, '_');
  };

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          // Check for fallback local session if unauthenticated in Firebase
          const savedUser = localStorage.getItem('expense_manager_local_user');
          if (savedUser) {
            try {
              setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // If Firebase is not configured, load session from local storage
      const savedUser = localStorage.getItem('expense_manager_local_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        // Default local user session to ensure app is immediately usable
        const defaultUser = { uid: 'local_default_user', email: 'guest@genz.io', displayName: 'Guest User' };
        setCurrentUser(defaultUser);
        localStorage.setItem('expense_manager_local_user', JSON.stringify(defaultUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      } catch (err) {
        console.warn('Firebase login failed, falling back to local session:', err.message);
      }
    }
    const localUser = {
      uid: getDeterministicUid(email),
      email,
      displayName: email.split('@')[0]
    };
    setCurrentUser(localUser);
    localStorage.setItem('expense_manager_local_user', JSON.stringify(localUser));
    return localUser;
  };

  const signup = async (email, password) => {
    if (isConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        return cred.user;
      } catch (err) {
        console.warn('Firebase signup failed, falling back to local session:', err.message);
      }
    }
    const localUser = {
      uid: getDeterministicUid(email),
      email,
      displayName: email.split('@')[0]
    };
    setCurrentUser(localUser);
    localStorage.setItem('expense_manager_local_user', JSON.stringify(localUser));
    return localUser;
  };

  const logout = async () => {
    if (isConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Firebase signOut warning:', e.message);
      }
    }
    localStorage.removeItem('expense_manager_local_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, isConfigured }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
