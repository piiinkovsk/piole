import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define theme storage key
const THEME_STORAGE_KEY = '@theme_preference';

// Theme colors
export const COLORS = {
  light: {
    primary: '#5ECDB1', // Pastel mint
    primaryLight: '#A7E8D9',
    primaryDark: '#3B9E83',
    background: '#FFFFFF',
    card: '#F9F9F9',
    text: '#121212',
    secondaryText: '#666666',
    border: '#EEEEEE',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
  },
  dark: {
    primary: '#5ECDB1', // Keeping mint as accent
    primaryLight: '#A7E8D9',
    primaryDark: '#3B9E83',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    secondaryText: '#AAAAAA',
    border: '#333333',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#30D158',
  },
};

// Theme context type
interface ThemeContextType {
  theme: ThemeType;
  colors: typeof COLORS.light;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() as 'light' | 'dark';
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadTheme();
  }, []);
  
  // Save theme preference when changed
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Revert theme state if save fails
      setThemeState(theme);
    }
  };
  
  // Determine if dark mode is active
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
  
  // Get the appropriate color palette
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  const value = {
    theme,
    colors,
    setTheme,
    isDark,
  };
  
  if (!isLoaded) {
    return null; // Or a loading indicator if preferred
  }
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
