
import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('zuri_user')) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('zuri_token', data.token);
    localStorage.setItem('zuri_user', JSON.stringify(data.user));
    setUser(data.user);

    return data.user;
  };

  const register = async (formData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  };

  const logout = () => {
    localStorage.removeItem('zuri_token');
    localStorage.removeItem('zuri_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
