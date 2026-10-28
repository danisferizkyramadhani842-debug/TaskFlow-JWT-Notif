import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, getMe } from '../services/authService';

const AuthContext = createContext(null);
const TOKEN_KEY = 'taskflow_access_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!saved) return;
        const me = await getMe(saved);
        if (active) {
          setToken(saved);
          setUser(me);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        if (active) setLoading(false);
      }
    }
    restoreSession();
    return () => { active = false; };
  }, []);

  async function signIn(email, password) {
    const data = await loginUser(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, loading, signIn, signOut }), [token, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
