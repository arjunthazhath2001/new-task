import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        setUser(JSON.parse(localStorage.getItem('user')));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const register = async (username, password) => {
    try {
      await axios.post('http://localhost:5000/api/register', { username, password });
      return true;
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};