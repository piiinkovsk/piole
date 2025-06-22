import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useTheme } from '../store/ThemeContext';
import { MainCategory } from '../types/product';
import { useStoreContext } from '../store/StoreContext';
import { generateUUID } from '../utils/uuid';
import { RootTabParamList, CollectionStackParamList, WishlistStackParamList } from '../navigation/types';

// Constants
const DEFAULT_URL = 'https://www.sephora.com';

// Types
interface PreviewData {
  name: string;
  brand: string;
  imageUrl: string;
  price: string;
  mainCategory: MainCategory;
  purchaseLink: string;
}

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  previewData: PreviewData;
  isWishlist: boolean;
}

// Type for the combined navigation prop
type BrowserScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Browser'>,
  NativeStackNavigationProp<CollectionStackParamList & WishlistStackParamList>
>;

// QuickAdd Modal Component
const QuickAddModal: React.FC<QuickAddModalProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  previewData, 
  isWishlist 
}) => {
  const { colors } = useTheme();
  const { dispatch } = useStoreContext();
  const [name, setName] = useState(previewData?.name || '');
  const [brand, setBrand] = useState(previewData?.brand || '');
  const [price, setPrice] = useState(previewData?.price || '');
  const [mainCategory, setMainCategory] = useState<MainCategory>(previewData?.mainCategory || MainCategory.OTHER);

  // Effect to update fields when previewData changes
  React.useEffect(() => {
    setName(previewData?.name || '');
    setBrand(previewData?.brand || '');
    setPrice(previewData?.price || '');
    setMainCategory(previewData?.mainCategory || MainCategory.OTHER);
  }, [previewData]);

  const handleSaveAndClose = () => {
    // Update preview data with edited values
    const updatedData = {
      ...previewData,
      name,
      brand,
      price,
      mainCategory
    };
    
    // Pass back updated data
    onSave();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Add to {isWishlist ? 'Wishlist' : 'Collection'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Product name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Brand</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Brand name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Price</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Price"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
                  {Object.values(MainCategory).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { borderColor: colors.border },
                        mainCategory === cat && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setMainCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: mainCategory === cat ? 'white' : colors.text }
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveAndClose}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const BrowserScreen: React.FC = () => {
  const { colors } = useTheme();
  const { dispatch } = useStoreContext();
  const navigation = useNavigation<BrowserScreenNavigationProp>();
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [urlInput, setUrlInput] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [previewData, setPreviewData] = useState<PreviewData>({
    name: '',
    brand: '',
    imageUrl: '',
    price: '',
    mainCategory: MainCategory.OTHER,
    purchaseLink: '',
  });

  // Extract metadata from the current webpage
  const extractMetadata = () => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        function findElement(selectors) {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
          }
          return null;
        }

        function cleanText(text) {
          return text
            .replace(/\\s+/g, ' ')
            .replace(/\\([^)]*\\)/g, '')
            .replace(/[0-9]+\\s*reviews?/gi, '')
            .trim();
        }

        // Get product name
        const nameSelectors = [
          'meta[property="og:title"]',
          'meta[name="twitter:title"]',
          'meta[property="product:name"]',
          'h1[class*="product-name"]',
          'h1[class*="productName"]',
          'h1[class*="product-title"]',
          'h1[class*="productTitle"]',
          'h1'
        ];
        
        let name = '';
        const nameElement = findElement(nameSelectors);
        if (nameElement) {
          name = nameElement.getAttribute('content') || cleanText(nameElement.textContent);
        }
        if (!name) {
          name = document.title.split('|')[0].trim();
        }
        
        // Get product image
        const imageSelectors = [
          'meta[property="og:image"]',
          'meta[name="twitter:image"]',
          'meta[property="product:image"]',
          'img[class*="product-image"]',
          'img[class*="productImage"]'
        ];
        
        let imageUrl = '';
        const imageElement = findElement(imageSelectors);
        if (imageElement) {
          imageUrl = imageElement.getAttribute('content') || imageElement.getAttribute('src');
        }
        
        // Get price
        const priceSelectors = [
          'meta[property="product:price:amount"]',
          'meta[property="og:price:amount"]',
          'span[class*="price"]:not([class*="old"]):not([class*="regular"])',
          'div[class*="price"]:not([class*="old"]):not([class*="regular"])',
          '[data-price]',
          '[itemprop="price"]'
        ];
        
        let price = '';
        const priceElement = findElement(priceSelectors);
        if (priceElement) {
          const priceText = priceElement.getAttribute('content') || cleanText(priceElement.textContent);
          const priceMatch = priceText.match(/[$€£¥]?\\s*([0-9]+(?:\\.[0-9]{2})?)/);
          if (priceMatch) {
            price = priceMatch[1];
          }
        }
        
        // Get brand
        const brandSelectors = [
          'meta[property="product:brand"]',
          'meta[name="brand"]',
          'meta[property="og:brand"]',
          '[class*="brand-name"]',
          '[class*="brandName"]',
          '[itemprop="brand"]'
        ];
        
        let brand = '';
        const brandElement = findElement(brandSelectors);
        if (brandElement) {
          brand = brandElement.getAttribute('content') || cleanText(brandElement.textContent);
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
        purchaseLink: extractedData.sourceUrl,
      });

      setShowQuickAdd(true);
      setShowToolbar(false);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
  
  // Handle navigation state change
  const handleNavigationStateChange = (navState: { 
    url: string; 
    canGoBack: boolean; 
    canGoForward: boolean; 
  }) => {
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

  // Handle quick add save
  const handleQuickAddSave = () => {
    const productId = generateUUID();
    const now = new Date().toISOString();
    
    const commonData = {
      id: productId,
      name: previewData.name,
      brand: previewData.brand,
      mainCategory: previewData.mainCategory,
      subCategories: [],
      imageUrl: previewData.imageUrl || 'https://via.placeholder.com/200',
      purchaseLink: previewData.purchaseLink,
      price: previewData.price ? parseFloat(previewData.price) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (isWishlist) {
      dispatch({
        type: 'ADD_TO_WISHLIST',
        payload: {
          ...commonData,
          priority: 'medium',
        },
      });
    } else {
      dispatch({
        type: 'ADD_TO_COLLECTION',
        payload: {
          ...commonData,
          expirationDate: undefined,
          isOpened: false,
          openedDate: undefined,
          periodAfterOpening: undefined,
        },
      });
    }

    Alert.alert(
      'Success',
      `Product "${previewData.name}" has been added to your ${isWishlist ? 'wishlist' : 'collection'}.`
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
        onMessage={handleWebViewMessage}
        style={styles.webView}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      {showToolbar && (
        <>
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
              onPress={() => {
                setIsWishlist(false);
                extractMetadata();
              }}
            >
              <MaterialIcons name="collections" size={20} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primaryDark }]} 
              onPress={() => {
                setIsWishlist(true);
                extractMetadata();
              }}
            >
              <MaterialIcons name="favorite" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
      
      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => {
          setShowQuickAdd(false);
          setShowToolbar(true);
        }}
        onSave={handleQuickAddSave}
        previewData={previewData}
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
  actionsBar: {
    position: 'absolute',
    bottom: 80,
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
  clearButton: {
    padding: 4,
  },
  goButton: {
    marginLeft: 4,
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Modal styles
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoidingView: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 280,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 44,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  categoryScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
  },
});

export default BrowserScreen;
