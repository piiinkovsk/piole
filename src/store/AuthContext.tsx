import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// User type definition
export interface User {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  socialLogin: (provider: 'apple' | 'google', token: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          // Validate token and fetch user data here
          // For now, we'll just set the token
          setState({
            ...state,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to load auth token:', error);
        setState({
          ...state,
          isLoading: false,
        });
      }
    };

    loadToken();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      setState({ ...state, isLoading: true });
      
      // In a real app, you would call your authentication API here
      // const response = await authService.login(email, password);
      
      // For now, we'll just mock a successful login
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      // Save token securely
      await SecureStore.setItemAsync('auth_token', mockToken);
      
      // Update state
      setState({
        user: mockUser,
        token: mockToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name?: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      // In a real app, you would call your registration API here
      // const response = await authService.register(email, password, name);
      
      // For now, we'll just simulate a successful registration
      // In a real app, this might redirect to email verification
      const mockUser: User = {
        id: '1',
        email,
        name: name || 'New User',
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      // Save token securely
      await SecureStore.setItemAsync('auth_token', mockToken);
      
      // Update state
      setState({
        user: mockUser,
        token: mockToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove token
      await SecureStore.deleteItemAsync('auth_token');
      
      // Reset state
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Email verification
  const verifyEmail = async (email: string, code: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      // In a real app, you would call your verification API here
      // const response = await authService.verifyEmail(email, code);
      
      // For now, we'll just simulate a successful verification
      const mockUser: User = {
        id: '1',
        email,
        name: 'Verified User',
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      // Save token securely
      await SecureStore.setItemAsync('auth_token', mockToken);
      
      // Update state
      setState({
        user: mockUser,
        token: mockToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Verification error:', error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      // In a real app, you would call your forgot password API here
      // const response = await authService.forgotPassword(email);
      
      // For now, we'll just simulate a successful request
      setState({ ...state, isLoading: false });
      
      // This would normally send a reset email to the user
      return;
    } catch (error) {
      console.error('Forgot password error:', error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      // In a real app, you would call your reset password API here
      // const response = await authService.resetPassword(token, password);
      
      // For now, we'll just simulate a successful reset
      setState({ ...state, isLoading: false });
      
      return;
    } catch (error) {
      console.error('Reset password error:', error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  // Social login
  const socialLogin = async (provider: 'apple' | 'google', token: string) => {
    try {
      setState({ ...state, isLoading: true });
      
      // In a real app, you would validate the social token with your backend
      // const response = await authService.socialLogin(provider, token);
      
      // For now, we'll just simulate a successful social login
      const mockUser: User = {
        id: '1',
        email: `${provider}_user@example.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      };
      
      const mockToken = 'mock_token_' + Date.now();
      
      // Save token securely
      await SecureStore.setItemAsync('auth_token', mockToken);
      
      // Update state
      setState({
        user: mockUser,
        token: mockToken,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setState({ ...state, isLoading: false });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    socialLogin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
