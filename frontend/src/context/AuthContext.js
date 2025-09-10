import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth'; // Update this import

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(user) });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.login(email, password);

      // Check if response indicates error
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  const register = async (username, email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.register(username, email, password);

      // Check if response indicates error
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);