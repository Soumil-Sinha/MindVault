import React, { createContext, useState, useEffect } from 'react';
import { getUser, saveUser, clearUser } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInit = async () => {
      const u = await getUser();
      if (u) setUser(u);
      setLoading(false);
    };
    loadInit();
  }, []);

  const signIn = async (email) => {
    const defaultName = email ? email.split('@')[0] : 'Player';
    await saveUser(defaultName);
    setUser({ email: defaultName });
  };

  const signOut = async () => {
    await clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
