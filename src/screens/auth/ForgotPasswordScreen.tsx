import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      await forgotPassword(email);
      setEmailSent(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {emailSent 
              ? `We've sent a password reset link to ${email}`
              : 'Enter your email to receive a password reset link'}
          </Text>
        </View>
        
        <View style={styles.form}>
          {!emailSent ? (
            <>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Email</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.secondaryText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={[styles.successText, { color: colors.text }]}>
                Check your email for the password reset link. If you don't see it, check your spam folder.
              </Text>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Back to Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resendButton, { borderColor: colors.border }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                  {isLoading ? 'Sending...' : 'Resend Link'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!emailSent && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.backButtonText, { color: colors.secondaryText }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    height: 24,
  },
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 14,
  },
  successContainer: {
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    lineHeight: 24,
  },
  resendButton: {
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
