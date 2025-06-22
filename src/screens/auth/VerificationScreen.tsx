import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Verification'>;

const VerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { colors } = useTheme();
  const { verifyEmail } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  
  // References for each input field
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Set up the input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);
  
  // Handle input change
  const handleCodeChange = (text: string, index: number) => {
    // Only accept numbers
    if (!/^[0-9]*$/.test(text)) return;
    
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-advance to next input if current input is filled
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle verification
  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }
    
    try {
      setIsLoading(true);
      await verifyEmail(email, verificationCode);
    } catch (error) {
      Alert.alert('Verification Failed', 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = () => {
    Alert.alert('Code Resent', `A new verification code has been sent to ${email}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Email Verification</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            We've sent a 6-digit verification code to {email}
          </Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View 
                key={index}
                style={[
                  styles.codeInputContainer, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: digit ? colors.primary : colors.border 
                  }
                ]}
              >
                <TextInput
                  ref={ref => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.codeInput, { color: colors.text }]}
                  value={digit}
                  onChangeText={text => handleCodeChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.secondaryText }]}>
              Didn't receive a code?
            </Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={[styles.resendLink, { color: colors.primary }]}>
                Resend Code
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.secondaryText }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInputContainer: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
    height: '100%',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    marginRight: 4,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 32,
  },
  backButtonText: {
    fontSize: 14,
  },
});

export default VerificationScreen;
