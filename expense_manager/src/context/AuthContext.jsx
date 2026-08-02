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

  // Demo user for testing when Firebase auth is unconfigured or in offline mode
  const setDemoUser = () => {
    const demo = {
      uid: 'genz_demo_user_101',
      email: 'alex@genz.io',
      displayName: 'Alex Rivers',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };
    setCurrentUser(demo);
    localStorage.setItem('expense_manager_demo_user', JSON.stringify(demo));
    setLoading(false);
  };

  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          // Fallback to local demo user if present
          const savedDemo = localStorage.getItem('expense_manager_demo_user');
          if (savedDemo) {
            setCurrentUser(JSON.parse(savedDemo));
          } else {
            setDemoUser();
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      const savedDemo = localStorage.getItem('expense_manager_demo_user');
      if (savedDemo) {
        setCurrentUser(JSON.parse(savedDemo));
      } else {
        setDemoUser();
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isConfigured && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    }
    const demo = { uid: 'genz_user_' + Date.now(), email, displayName: email.split('@')[0] };
    setCurrentUser(demo);
    localStorage.setItem('expense_manager_demo_user', JSON.stringify(demo));
    return demo;
  };

  const signup = async (email, password) => {
    if (isConfigured && auth) {
      return createUserWithEmailAndPassword(auth, email, password);
    }
    const demo = { uid: 'genz_user_' + Date.now(), email, displayName: email.split('@')[0] };
    setCurrentUser(demo);
    localStorage.setItem('expense_manager_demo_user', JSON.stringify(demo));
    return demo;
  };

  const logout = async () => {
    if (isConfigured && auth) {
      await signOut(auth);
    }
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
