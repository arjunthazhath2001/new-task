import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the authentication context
export const AuthContext = createContext();

// AuthProvider component to manage authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks authentication status
  const [loading, setLoading] = useState(true); // Tracks loading state while checking auth

  // Check if the user is already logged in (on component mount)
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem('token')) {
        setUser(JSON.parse(localStorage.getItem('user'))); // Retrieve user data from local storage
        setIsAuthenticated(true);
      }
      setLoading(false); // Mark loading as complete
    };

    checkLoggedIn();
  }, []);

  // Function to handle user registration
  const register = async (username, password) => {
    try {
      await axios.post('http://localhost:5000/api/register', { username, password });
      return true; // Registration successful
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return false; // Registration failed
    }
  };

  // Function to handle user login
  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token); // Store token in local storage
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Store user data
      setUser(res.data.user);
      setIsAuthenticated(true);
      return true; // Login successful
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return false; // Login failed
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('user'); // Remove user data from local storage
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