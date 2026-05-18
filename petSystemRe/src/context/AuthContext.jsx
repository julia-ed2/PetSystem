import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await authService.getCurrentUser();
          setUser(res.user);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (loginField, password) => {
    try {
      setLoading(true);
      const res = await authService.login(loginField, password);
      
      localStorage.setItem('access_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('refresh_token', res.refresh_token);
      }
      
      setToken(res.access_token);
      setUser(res.user);
      
      return { success: true, user: res.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao fazer login',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (nome, login, password, tipo = 'usuario') => {
    try {
      setLoading(true);
      const res = await authService.register({
        nome,
        login,
        password,
        tipo,
      });

      localStorage.setItem('access_token', res.access_token);
      if (res.refresh_token) {
        localStorage.setItem('refresh_token', res.refresh_token);
      }

      setToken(res.access_token);
      setUser(res.user);

      return { success: true, user: res.user };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Erro ao registrar',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
