import { createContext, useContext, useState, useEffect } from 'react';
import { auth, users } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('onyx_token');
    const savedUser = localStorage.getItem('onyx_user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally fetch fresh user data
      users.getMe()
        .then(response => {
          setUser(response.data);
          localStorage.setItem('onyx_user', JSON.stringify(response.data));
        })
        .catch(() => {
          // Token might be invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await auth.login(credentials);
    const { user, token } = response.data;

    localStorage.setItem('onyx_token', token);
    localStorage.setItem('onyx_user', JSON.stringify(user));
    setUser(user);

    return user;
  };

  const register = async (data) => {
    const response = await auth.register(data);
    const { user, token } = response.data;

    localStorage.setItem('onyx_token', token);
    localStorage.setItem('onyx_user', JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem('onyx_token');
    localStorage.removeItem('onyx_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
