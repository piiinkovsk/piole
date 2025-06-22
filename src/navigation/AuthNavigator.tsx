import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../store/AuthContext';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Define auth stack param list
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Define main stack param list
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Loading: undefined;
};

// Create the navigation stacks
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth stack navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Verification" component={VerificationScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Root navigator - manages auth state
const AuthNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLoading ? (
        <RootStack.Screen name="Loading" component={LoadingScreen} />
      ) : isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default AuthNavigator;
