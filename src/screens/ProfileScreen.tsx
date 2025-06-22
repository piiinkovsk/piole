import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../store/ThemeContext';
import { useAuth } from '../store/AuthContext';

const ProfileScreen: React.FC = () => {
  const { colors, theme, setTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Logout Failed', 'An error occurred during logout');
    }
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  // Handle theme selection
  const handleThemeSelection = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={[styles.profileImageContainer, { backgroundColor: colors.card }]}>
            {user?.profileImage ? (
              <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <MaterialIcons name="person" size={60} color={colors.secondaryText} />
            )}
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <TouchableOpacity 
            style={[styles.editProfileButton, { borderColor: colors.border }]}
            onPress={() => Alert.alert('Edit Profile', 'This feature is coming soon!')}
          >
            <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                theme === 'light' && [styles.selectedThemeOption, { borderColor: colors.primary }]
              ]}
              onPress={() => handleThemeSelection('light')}
            >
              <View style={[styles.themeCircle, { backgroundColor: '#FFFFFF', borderColor: '#EEEEEE' }]} />
              <Text style={[styles.themeLabel, { color: colors.text }]}>Light</Text>
              {theme === 'light' && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                theme === 'dark' && [styles.selectedThemeOption, { borderColor: colors.primary }]
              ]}
              onPress={() => handleThemeSelection('dark')}
            >
              <View style={[styles.themeCircle, { backgroundColor: '#121212', borderColor: '#333333' }]} />
              <Text style={[styles.themeLabel, { color: colors.text }]}>Dark</Text>
              {theme === 'dark' && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                theme === 'system' && [styles.selectedThemeOption, { borderColor: colors.primary }]
              ]}
              onPress={() => handleThemeSelection('system')}
            >
              <View style={[styles.themeCircle, { backgroundColor: '#FFFFFF', borderColor: '#EEEEEE' }]}>
                <View style={styles.systemThemeInner} />
              </View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>System</Text>
              {theme === 'system' && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => Alert.alert('Notifications', 'This feature is coming soon!')}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => Alert.alert('Privacy', 'This feature is coming soon!')}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => Alert.alert('Help & Support', 'This feature is coming soon!')}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="help-circle-outline" size={24} color={colors.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.secondaryText }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themeOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '30%',
  },
  selectedThemeOption: {
    borderWidth: 2,
  },
  themeCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemThemeInner: {
    width: '50%',
    height: '100%',
    backgroundColor: '#121212',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  themeLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
  },
});

export default ProfileScreen;
