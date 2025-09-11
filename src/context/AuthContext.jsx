import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../services/http';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const userInfo = JSON.parse(localStorage.getItem('user_info'));
    
    if (token && userInfo) {
      setAuthState({
        isAuthenticated: true,
        user: userInfo
      });
    }
  };

  const login = async (credentials) => {
    try {
      const response = await http.post('/auth/login', credentials);
      
      const {token, user:{id, email, firstName}} = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_info', JSON.stringify({
        id,
        email,
        firstName
      }));

      setAuthState({
        isAuthenticated: true,
        user: {
          id,
          email,
          firstName
        }
      });
      
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      setAuthState,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}