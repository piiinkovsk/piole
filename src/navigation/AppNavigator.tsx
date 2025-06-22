import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  RootTabParamList,
  CollectionStackParamList,
  WishlistStackParamList
} from './types';
import { useTheme } from '../store/ThemeContext';

// Screens
import CollectionScreen from '../screens/CollectionScreen';
import BrowserScreen from '../screens/BrowserScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Create navigators
const Tab = createBottomTabNavigator<RootTabParamList>();
const CollectionStack = createNativeStackNavigator<CollectionStackParamList>();
const WishlistStack = createNativeStackNavigator<WishlistStackParamList>();

// Collection stack navigator
const CollectionNavigator = () => {
  return (
    <CollectionStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CollectionStack.Screen 
        name="CollectionHome" 
        component={CollectionScreen}
      />
      <CollectionStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
      />
      <CollectionStack.Screen
        name="AddProduct"
        component={AddProductScreen}
      />
      <CollectionStack.Screen
        name="EditProduct"
        component={EditProductScreen}
      />
    </CollectionStack.Navigator>
  );
};

// Wishlist stack navigator
const WishlistNavigator = () => {
  return (
    <WishlistStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WishlistStack.Screen 
        name="WishlistHome" 
        component={WishlistScreen}
      />
      <WishlistStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
      />
      <WishlistStack.Screen
        name="AddProduct"
        component={AddProductScreen}
      />
      <WishlistStack.Screen
        name="EditProduct"
        component={EditProductScreen}
      />
    </WishlistStack.Navigator>
  );
};

// Tab navigator
export const AppNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondaryText,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Collection"
          component={CollectionNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="lipstick" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Browser"
          component={BrowserScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Wishlist"
          component={WishlistNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
