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
  const [name, setName] = useState(previewData?.name || '');
  const [brand, setBrand] = useState(previewData?.brand || '');
  const [price, setPrice] = useState(previewData?.price || '');
  const [mainCategory, setMainCategory] = useState<MainCategory>(previewData?.mainCategory || MainCategory.OTHER);
  const [selectedPath, setSelectedPath] = useState<CategoryPath[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Effect to update fields when previewData changes
  React.useEffect(() => {
    if (visible) {
      setName(previewData?.name || '');
      setBrand(previewData?.brand || '');
      setPrice(previewData?.price || '');
      setMainCategory(previewData?.mainCategory || MainCategory.OTHER);
      setSelectedPath([]);
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
    setSelectedPath([]);
    setResetTrigger(prev => prev + 1);
  };

  const handleSaveAndClose = () => {
    onSave({
      ...previewData,
      name,
      brand,
      price,
      mainCategory,
      categoryPath: selectedPath,
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        resetForm();
        onClose();
      }}
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
              <TouchableOpacity 
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
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
                <ChipCategorySelector
                  selectedPath={selectedPath}
                  onSelectCategory={handleCategorySelect}
                  resetTrigger={resetTrigger}
                />
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
                onPress={() => {
                  resetForm();
                  onClose();
                }}
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
          'meta[name="twitter:image"]',
          'meta[property="product:image"]',
          'img[class*="product-image"]',
          'img[class*="productImage"]'
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
        const imageElement = findElement(imageSelectors);
        if (imageElement) {
          data.imageUrl = imageElement.getAttribute('content') || imageElement.getAttribute('src');
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
    maxHeight: '85%',
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
});

export default BrowserScreen;
