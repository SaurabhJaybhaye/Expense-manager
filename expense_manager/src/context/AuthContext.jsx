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

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user || null);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // If Firebase is not configured, load session from local storage if available
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
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    }
    const localUser = { uid: 'user_' + Date.now(), email, displayName: email.split('@')[0] };
    setCurrentUser(localUser);
    localStorage.setItem('expense_manager_local_user', JSON.stringify(localUser));
    return localUser;
  };

  const signup = async (email, password) => {
    if (isConfigured && auth) {
      return createUserWithEmailAndPassword(auth, email, password);
    }
    const localUser = { uid: 'user_' + Date.now(), email, displayName: email.split('@')[0] };
    setCurrentUser(localUser);
    localStorage.setItem('expense_manager_local_user', JSON.stringify(localUser));
    return localUser;
  };

  const logout = async () => {
    if (isConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem('expense_manager_local_user');
    localStorage.removeItem('expense_manager_demo_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, isConfigured }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
