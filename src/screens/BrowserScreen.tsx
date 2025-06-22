import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { useTheme } from '../store/ThemeContext';

// Default URL for the browser
const DEFAULT_URL = 'https://www.sephora.com';

const BrowserScreen: React.FC = () => {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [urlInput, setUrlInput] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  
  // Handle URL input submission
  const handleUrlSubmit = () => {
    let url = urlInput.trim();
    
    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setCurrentUrl(url);
    setUrlInput(url);
  };
  
  // Handle navigation state change
  const handleNavigationStateChange = (navState: any) => {
    setCurrentUrl(navState.url);
    setUrlInput(navState.url);
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
  };
  
  // Handle go back
  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };
  
  // Handle go forward
  const handleGoForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
  // Handle go home
  const handleGoHome = () => {
    setCurrentUrl(DEFAULT_URL);
    setUrlInput(DEFAULT_URL);
  };
  
  // Handle add to collection
  const handleAddToCollection = () => {
    Alert.alert(
      'Add to Collection',
      'Would you like to add this product to your collection?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: () => {
            // Extract product details from the webpage (would require a backend service in production)
            Alert.alert('Success', 'Product added to your collection');
          },
        },
      ]
    );
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = () => {
    Alert.alert(
      'Add to Wishlist',
      'Would you like to add this product to your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: () => {
            // Extract product details from the webpage (would require a backend service in production)
            Alert.alert('Success', 'Product added to your wishlist');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.urlBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.urlInput, { color: colors.text }]}
            value={urlInput}
            onChangeText={setUrlInput}
            onSubmitEditing={handleUrlSubmit}
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="go"
            selectTextOnFocus
            placeholderTextColor={colors.secondaryText}
          />
          {urlInput ? (
            <TouchableOpacity onPress={() => setUrlInput('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleUrlSubmit} style={styles.goButton}>
            <Ionicons name="arrow-forward" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webView}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <View style={[styles.toolbar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.toolbarButton, !canGoBack && styles.disabledButton]} 
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={canGoBack ? colors.text : colors.secondaryText} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolbarButton, !canGoForward && styles.disabledButton]} 
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Ionicons 
            name="arrow-forward" 
            size={24} 
            color={canGoForward ? colors.text : colors.secondaryText} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton} onPress={handleGoHome}>
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.actionsBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={handleAddToCollection}
        >
          <MaterialIcons name="collections" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add to Collection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primaryDark }]} 
          onPress={handleAddToWishlist}
        >
          <MaterialIcons name="favorite" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add to Wishlist</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 8,
    borderBottomWidth: 1,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  urlInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  goButton: {
    marginLeft: 4,
    padding: 4,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  toolbarButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.49,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
});

export default BrowserScreen;
