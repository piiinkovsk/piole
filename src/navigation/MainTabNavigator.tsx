import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../store/ThemeContext';
import CollectionScreen from '../screens/CollectionScreen';
import WishlistScreen from '../screens/WishlistScreen';
import BrowserScreen from '../screens/BrowserScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Define tab param list
export type MainTabParamList = {
  Collection: undefined;
  Wishlist: undefined;
  Browser: undefined;
  Profile: undefined;
};

// Create bottom tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          title: 'My Collection',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="collections" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Browser"
        component={BrowserScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="public" size={size} color={color} />
          ),
          headerShown: false, // Hide the header in browser mode
          tabBarStyle: { display: 'none' }, // Hide the tab bar in browser mode
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-o" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
