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
  Platform,
  Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ChipCategorySelector from '../components/molecules/ChipCategorySelector';

import { useTheme } from '../store/ThemeContext';
import { MainCategory, CategoryPath } from '../types/product';
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
  onSave: (data: PreviewData & { categoryPath: CategoryPath[] }) => void;
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
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(previewData?.name || '');
  const [brand, setBrand] = useState(previewData?.brand || '');
  const [price, setPrice] = useState(previewData?.price || '');
  const [mainCategory, setMainCategory] = useState<MainCategory>(previewData?.mainCategory || MainCategory.OTHER);
  const [selectedPath, setSelectedPath] = useState<CategoryPath[]>([{
    id: previewData?.mainCategory || MainCategory.OTHER,
    name: previewData?.mainCategory || MainCategory.OTHER,
    level: 'main'
  }]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Effect to update fields when previewData changes
  React.useEffect(() => {
    if (visible) {
      setName(previewData?.name || '');
      setBrand(previewData?.brand || '');
      setPrice(previewData?.price || '');
      
      // Maintain category path state
      const initialMainCategory = previewData?.mainCategory || MainCategory.OTHER;
      setMainCategory(initialMainCategory);
      
      // Initialize with existing path or just main category
      setSelectedPath([{
        id: initialMainCategory,
        name: initialMainCategory,
        level: 'main'
      }]);
    }
  }, [previewData, visible]);

  const handleCategorySelect = (paths: CategoryPath[]) => {
    setSelectedPath(paths);
    const mainCategoryPath = paths.find(p => p.level === 'main');
    if (mainCategoryPath) {
      setMainCategory(mainCategoryPath.name as MainCategory);
    }
  };

  const resetForm = () => {
    setName('');
    setBrand('');
    setPrice('');
    setMainCategory(MainCategory.OTHER);
    setSelectedPath([{
      id: MainCategory.OTHER,
      name: MainCategory.OTHER,
      level: 'main'
    }]);
    setResetTrigger(prev => prev + 1);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    // Ensure we have at least a main category
    if (!selectedPath.length) {
      const defaultPath: CategoryPath[] = [{
        id: mainCategory,
        name: mainCategory,
        level: 'main'
      }];
      setSelectedPath(defaultPath);
      onSave({
        ...previewData,
        name: name.trim(),
        brand: brand.trim(),
        price,
        mainCategory,
        categoryPath: defaultPath,
      });
    } else {
      onSave({
        ...previewData,
        name: name.trim(),
        brand: brand.trim(),
        price,
        mainCategory,
        categoryPath: selectedPath,
      });
    }

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <View 
        style={[
          styles.modalContainer, 
          { 
            backgroundColor: colors.background,
            paddingTop: insets.top, // Add padding for the status bar
          }
        ]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Add to {isWishlist ? 'Wishlist' : 'Collection'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              {previewData.imageUrl && !imageError ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: previewData.imageUrl }}
                    style={styles.productImage}
                    resizeMode="contain"
                    onError={() => setImageError(true)}
                  />
                </View>
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="image-outline" size={48} color={colors.secondaryText} />
                </View>
              )}

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

              <View style={[styles.inputGroup, styles.categoryGroup]}>
                <Text style={[styles.label, { color: colors.secondaryText }]}>Category</Text>
                <ChipCategorySelector
                  selectedPath={selectedPath}
                  onSelectCategory={handleCategorySelect}
                  resetTrigger={resetTrigger}
                />
              </View>
            </View>
          </ScrollView>

          <View 
            style={[
              styles.modalFooter,
              { 
                paddingBottom: Math.max(insets.bottom, 16), // Ensure enough padding at bottom
                backgroundColor: colors.background,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
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
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [urlInput, setUrlInput] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData>({
    name: '',
    brand: '',
    imageUrl: '',
    price: '',
    mainCategory: MainCategory.OTHER,
    purchaseLink: '',
  });

  // Handle back navigation
  const handleBack = async () => {
    if (showQuickAdd) {
      setShowQuickAdd(false);
      return;
    }
    if (canGoBack) {
      webViewRef.current?.goBack();
      return;
    }
    // Return to previous screen
    navigation.goBack();
  };

  const extractMetadata = () => {
    const script = `
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
        
        const brandSelectors = [
          'meta[property="product:brand"]',
          'meta[name="brand"]',
          '[class*="brand-name"]',
          '[class*="brandName"]'
        ];
        
        const priceSelectors = [
          'meta[property="product:price:amount"]',
          'meta[property="og:price:amount"]',
          'span[class*="price"]:not([class*="old"]):not([class*="regular"])',
          'div[class*="price"]:not([class*="old"]):not([class*="regular"])',
          '[data-price]',
          '[itemprop="price"]'
        ];
        
        const imageSelectors = [
          'meta[property="og:image"]',
          'meta[property="og:image:secure_url"]',
          'meta[name="twitter:image"]',
          'meta[name="twitter:image:src"]',
          'meta[property="product:image"]',
          'meta[property="product:image:secure_url"]',
          'img[class*="product-image"]',
          'img[class*="productImage"]',
          'img[class*="main-image"]',
          'img[class*="mainImage"]',
          'img[class*="featured"]',
          'img[class*="primary"]',
          // Fallback to any large image
          'img[width="600"]',
          'img[width="800"]',
          'img[width="1200"]'
        ];

        let data = {
          name: '',
          brand: '',
          imageUrl: '',
          price: ''
        };

        // Extract name
        const nameElement = findElement(nameSelectors);
        if (nameElement) {
          data.name = nameElement.getAttribute('content') || cleanText(nameElement.textContent);
        }
        if (!data.name) {
          data.name = document.title.split('|')[0].trim();
        }

        // Extract brand
        const brandElement = findElement(brandSelectors);
        if (brandElement) {
          data.brand = brandElement.getAttribute('content') || cleanText(brandElement.textContent);
        }

        // Extract price
        const priceElement = findElement(priceSelectors);
        if (priceElement) {
          const priceText = priceElement.getAttribute('content') || cleanText(priceElement.textContent);
          const priceMatch = priceText.match(/[$€£¥]?\\s*([0-9]+(?:\\.[0-9]{2})?)/);
          if (priceMatch) {
            data.price = priceMatch[1];
          }
        }

        // Extract image
        // Enhanced image extraction
        const imageElement = findElement(imageSelectors);
        if (imageElement) {
          // Try to get the highest quality image
          const srcset = imageElement.getAttribute('srcset');
          if (srcset) {
            // Parse srcset and get the largest image
            const sources = srcset.split(',')
              .map(src => {
                const [url, width] = src.trim().split(' ');
                return { url, width: parseInt(width) || 0 };
              })
              .sort((a, b) => b.width - a.width);
            
            if (sources.length > 0) {
              data.imageUrl = sources[0].url;
            }
          }
          
          // Fallback to content or src if no srcset
          if (!data.imageUrl) {
            data.imageUrl = imageElement.getAttribute('content') || imageElement.getAttribute('src');
          }
          
          // Ensure absolute URL
          if (data.imageUrl && !data.imageUrl.startsWith('http')) {
            data.imageUrl = new URL(data.imageUrl, window.location.href).href;
          }
        }

        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      })();
    `;

    webViewRef.current?.injectJavaScript(script);
  };

  const handleQuickAdd = (isWish: boolean = false) => {
    setIsWishlist(isWish);
    extractMetadata();
    setShowQuickAdd(true);
  };

  const handleAddProduct = (updatedData: PreviewData & { categoryPath: CategoryPath[] }) => {
    try {
      const timestamp = new Date().toISOString();
      const id = generateUUID();
      const categoryPath = updatedData.categoryPath;
      
      const productData = {
        id,
        name: previewData.name || 'Untitled Product',
        brand: previewData.brand || '',
        mainCategory: previewData.mainCategory,
        categoryPath,
        subCategories: [],
        imageUrl: previewData.imageUrl || '',
        purchaseLink: previewData.purchaseLink || currentUrl,
        price: previewData.price ? parseFloat(previewData.price) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (isWishlist) {
        dispatch({
          type: 'ADD_TO_WISHLIST',
          payload: {
            ...productData,
            priority: 'medium' as const,
          }
        });
        navigation.navigate('Wishlist', { screen: 'WishlistHome' });
      } else {
        dispatch({
          type: 'ADD_TO_COLLECTION',
          payload: {
            ...productData,
            expirationDate: undefined,
            isOpened: false,
            openedDate: undefined,
            periodAfterOpening: undefined,
          }
        });
        navigation.navigate('Collection', { screen: 'CollectionHome' });
      }
      setShowQuickAdd(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { marginRight: 8 }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TextInput
          style={[styles.urlInput, { color: colors.text, backgroundColor: colors.card }]}
          value={urlInput}
          onChangeText={setUrlInput}
          onSubmitEditing={() => {
            const processedUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
            setCurrentUrl(processedUrl);
          }}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter URL"
          placeholderTextColor={colors.secondaryText}
          selectTextOnFocus
        />
      </View>

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          onNavigationStateChange={(navState) => {
            setCurrentUrl(navState.url);
            setUrlInput(navState.url);
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
          }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              setPreviewData(prev => ({
                ...prev,
                ...data,
                purchaseLink: currentUrl
              }));
            } catch (error) {
              console.error('Failed to parse metadata:', error);
            }
          }}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>

      <View style={[styles.bottomToolbar, { backgroundColor: colors.card, paddingBottom: insets.bottom }]}>
        <View style={styles.toolbarContent}>
          <TouchableOpacity
            style={[styles.toolbarButton, canGoBack ? null : styles.disabledButton]}
            onPress={() => canGoBack && webViewRef.current?.goBack()}
            disabled={!canGoBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, canGoForward ? null : styles.disabledButton]}
            onPress={() => canGoForward && webViewRef.current?.goForward()}
            disabled={!canGoForward}
          >
            <Ionicons name="arrow-forward" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toolbarButton, { backgroundColor: colors.primary }]}
            onPress={() => handleQuickAdd(false)}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolbarButton, { backgroundColor: colors.primary }]}
            onPress={() => handleQuickAdd(true)}
          >
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => webViewRef.current?.reload()}
          >
            <Ionicons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSave={handleAddProduct}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  urlInput: {
    flex: 1,
    fontSize: 16,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomToolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 44,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  categoryGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 50,
  },
  modalFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BrowserScreen;
