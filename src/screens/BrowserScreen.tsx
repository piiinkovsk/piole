import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { useTheme } from '../store/ThemeContext';
import { MainCategory } from '../types/product';
import ProductPreviewModal, { ProductPreviewData } from '../components/organisms/ProductPreviewModal';

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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<ProductPreviewData>({
    name: '',
    brand: '',
    imageUrl: '',
    price: '',
    mainCategory: MainCategory.OTHER,
    sourceUrl: '',
  });
  const [isWishlist, setIsWishlist] = useState(false);
  
  // Extract metadata from the current webpage
  const extractMetadata = () => {
    // Inject JavaScript to extract product information from the current page
    webViewRef.current?.injectJavaScript(`
      (function() {
        // Get the page title as a fallback for product name
        let name = document.title.split('|')[0].trim();
        
        // Try to find better product name using meta tags
        const nameMetaTag = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
        if (nameMetaTag) {
          name = nameMetaTag.getAttribute('content');
        }
        
        // Try to find product image
        let imageUrl = '';
        const imageMetaTag = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
        if (imageMetaTag) {
          imageUrl = imageMetaTag.getAttribute('content');
        }
        
        // Try to find product price
        let price = '';
        const priceElements = document.querySelectorAll('.price, [class*="price"], [id*="price"], [class*="Price"], [id*="Price"]');
        if (priceElements.length > 0) {
          // Get text from the first price element and extract numbers with decimal point
          const priceText = priceElements[0].textContent.trim();
          const priceMatch = priceText.match(/[0-9]+\\.[0-9]+/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }
        
        // Try to find brand
        let brand = '';
        // Common brand elements or meta tags
        const brandMetaTag = document.querySelector('meta[property="product:brand"], meta[name="brand"]');
        if (brandMetaTag) {
          brand = brandMetaTag.getAttribute('content');
        } else {
          // Look for common brand elements
          const brandElements = document.querySelectorAll('[class*="brand"], [id*="brand"], [class*="Brand"], [id*="Brand"]');
          if (brandElements.length > 0) {
            brand = brandElements[0].textContent.trim();
          }
        }
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          name,
          brand,
          imageUrl,
          price,
          sourceUrl: window.location.href
        }));
        
        return true;
      })();
    `);
  };
  
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
  
  // Handle WebView message events (metadata extraction results)
  const handleWebViewMessage = (event: any) => {
    try {
      const extractedData = JSON.parse(event.nativeEvent.data);
      
      // Determine category based on URL or content
      let category = MainCategory.OTHER;
      const url = extractedData.sourceUrl.toLowerCase();
      
      if (url.includes('makeup') || url.includes('face') || url.includes('lips') || url.includes('eyes')) {
        category = MainCategory.MAKEUP;
      } else if (url.includes('skincare') || url.includes('skin-care') || url.includes('face')) {
        category = MainCategory.SKINCARE;
      } else if (url.includes('hair') || url.includes('shampoo') || url.includes('conditioner')) {
        category = MainCategory.HAIRCARE;
      } else if (url.includes('perfume') || url.includes('fragrance') || url.includes('scent')) {
        category = MainCategory.PERFUME;
      } else if (url.includes('body') || url.includes('lotion') || url.includes('bath')) {
        category = MainCategory.BODYCARE;
      }
      
      setPreviewData({
        name: extractedData.name || '',
        brand: extractedData.brand || '',
        imageUrl: extractedData.imageUrl || '',
        price: extractedData.price || '',
        mainCategory: category,
        sourceUrl: extractedData.sourceUrl,
      });
      
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
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
    setIsWishlist(false);
    extractMetadata();
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = () => {
    setIsWishlist(true);
    extractMetadata();
  };
  
  // Handle save product
  const handleSaveProduct = (productData: ProductPreviewData) => {
    // In a real app, this would save to a database or state management
    // For now, we'll just show a success message
    Alert.alert(
      'Success',
      `Product "${productData.name}" added to your ${isWishlist ? 'wishlist' : 'collection'}.`,
      [{ text: 'OK' }]
    );
    
    setShowPreviewModal(false);
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
        onMessage={handleWebViewMessage}
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
      
      <View style={[styles.actionsBar, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]} 
          onPress={handleAddToCollection}
        >
          <MaterialIcons name="collections" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primaryDark }]} 
          onPress={handleAddToWishlist}
        >
          <MaterialIcons name="favorite" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ProductPreviewModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onSave={handleSaveProduct}
        initialData={previewData}
        isWishlist={isWishlist}
      />
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
    position: 'absolute',
    bottom: 80, // Position above the toolbar
    right: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 110,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
    fontSize: 14,
  },
});

export default BrowserScreen;
