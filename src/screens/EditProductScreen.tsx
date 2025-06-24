import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../store/ThemeContext';
import { useStoreContext } from '../store/StoreContext';
import { MainCategory, CollectionProduct } from '../types/product';
import { EditProductScreenProps } from '../navigation/types';

const EditProductScreen: React.FC<EditProductScreenProps> = ({ 
  navigation,
  route
}) => {
  const { product, isWishlist } = route.params;
  const { colors } = useTheme();
  const { dispatch } = useStoreContext();

  // Initialize state with existing product data
  const [productName, setProductName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [price, setPrice] = useState(product.price?.toString() || '');
  const [category, setCategory] = useState<MainCategory>(product.mainCategory);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [notes, setNotes] = useState(
    'notes' in product ? (product as CollectionProduct).notes || '' : ''
  );
  const [purchaseLink, setPurchaseLink] = useState(product.purchaseLink || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    !isWishlist && 'expirationDate' in product && (product as CollectionProduct).expirationDate 
      ? new Date((product as CollectionProduct).expirationDate!) 
      : null
  );
  const [isOpened, setIsOpened] = useState(
    !isWishlist && 'isOpened' in product 
      ? (product as CollectionProduct).isOpened || false 
      : false
  );
  const [openedDate, setOpenedDate] = useState<Date | null>(
    !isWishlist && 'openedDate' in product && (product as CollectionProduct).openedDate 
      ? new Date((product as CollectionProduct).openedDate!) 
      : null
  );
  const [showOpenedDatePicker, setShowOpenedDatePicker] = useState(false);
  const [periodAfterOpening, setPeriodAfterOpening] = useState(
    'periodAfterOpening' in product && product.periodAfterOpening ? 
    product.periodAfterOpening.toString() : ''
  );
  
  // Validation
  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    
    if (!brand.trim()) {
      Alert.alert('Error', 'Brand name is required');
      return false;
    }
    
    if (!imageUrl) {
      Alert.alert('Error', 'Product image is required');
      return false;
    }
    
    return true;
  };
  
  // Handle image picking
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos to add product images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };
  
  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpirationDate(selectedDate);
    }
  };
  
  // Handle opened date selection
  const handleOpenedDateChange = (event: any, selectedDate?: Date) => {
    setShowOpenedDatePicker(false);
    if (selectedDate) {
      setOpenedDate(selectedDate);
      // If PAO is set, auto-calculate expiration date
      if (periodAfterOpening) {
        const expiryDate = new Date(selectedDate);
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(periodAfterOpening, 10));
        setExpirationDate(expiryDate);
      }
    }
  };
  
  // Handle PAO changes
  const handlePAOChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setPeriodAfterOpening(cleanText);
    
    // If opened date is set, update expiration date based on new PAO
    if (openedDate && cleanText) {
      const expiryDate = new Date(openedDate);
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(cleanText, 10));
      setExpirationDate(expiryDate);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;
    
    // Prepare common product data
    const updatedData = {
      ...product,
      name: productName.trim(),
      brand: brand.trim(),
      mainCategory: category,
      imageUrl: imageUrl,
      notes: notes.trim(),
      purchaseLink: purchaseLink.trim(),
      price: price ? parseFloat(price) : undefined,
      updatedAt: new Date().toISOString(),
    };
    
    if (isWishlist) {
      // Update in wishlist
      dispatch({
        type: 'UPDATE_WISHLIST_ITEM',
        payload: updatedData,
      });
    } else {
      // Update in collection with collection-specific fields
      dispatch({
        type: 'UPDATE_COLLECTION_ITEM',
        payload: {
          ...updatedData,
          expirationDate: expirationDate ? expirationDate.toISOString() : undefined,
          isOpened,
          openedDate: openedDate ? openedDate.toISOString() : undefined,
          periodAfterOpening: periodAfterOpening ? parseInt(periodAfterOpening, 10) : undefined,
        },
      });
    }
    
    // Navigate back to product details with updated product
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Edit {isWishlist ? 'Wishlist Item' : 'Product'}
              </Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              {/* Image Picker */}
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerContainer}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                    <Ionicons name="camera" size={40} color={colors.secondaryText} />
                    <Text style={[styles.imagePlaceholderText, { color: colors.secondaryText }]}>
                      Tap to change image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Basic Info Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Product Name *</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Enter product name"
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Brand *</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    value={brand}
                    onChangeText={setBrand}
                    placeholder="Enter brand name"
                    placeholderTextColor={colors.secondaryText}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Price</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    value={price}
                    onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
                    placeholder="Enter price (optional)"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="decimal-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
                    {Object.values(MainCategory).map((cat: string) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          { borderColor: colors.border },
                          category === cat && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setCategory(cat as MainCategory)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: category === cat ? 'white' : colors.text }
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Purchase Link</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    value={purchaseLink}
                    onChangeText={setPurchaseLink}
                    placeholder="Enter purchase link (optional)"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              
              {/* Collection Details */}
              {!isWishlist && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Collection Details</Text>

                  <View style={styles.switchGroup}>
                    <Text style={[styles.label, { color: colors.secondaryText }]}>Product is Opened</Text>
                    <Switch
                      value={isOpened}
                      onValueChange={(value) => {
                        setIsOpened(value);
                        if (!value) {
                          setOpenedDate(null);
                          setPeriodAfterOpening('');
                        }
                      }}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>

                  {isOpened && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.secondaryText }]}>When did you open this product?</Text>
                        <TouchableOpacity
                          style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                          onPress={() => setShowOpenedDatePicker(true)}
                        >
                          <Text style={{ color: colors.text }}>{openedDate ? formatDate(openedDate) : 'Select opened date'}</Text>
                          <Ionicons name="calendar" size={20} color={colors.secondaryText} />
                        </TouchableOpacity>

                        {showOpenedDatePicker && (
                          <DateTimePicker
                            value={openedDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleOpenedDateChange}
                            maximumDate={new Date()}
                          />
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.secondaryText }]}>Period After Opening (PAO)</Text>
                        <Text style={[styles.helpText, { color: colors.secondaryText }]}>
                          Look for the jar symbol (🧴) with a number and 'M' on your product
                        </Text>
                        <TextInput
                          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                          value={periodAfterOpening}
                          onChangeText={handlePAOChange}
                          placeholder="Enter months (e.g., 12)"
                          placeholderTextColor={colors.secondaryText}
                          keyboardType="number-pad"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.secondaryText }]}>
                      {isOpened ? 'Calculated Expiration Date' : 'Expiration Date'}
                    </Text>
                    {isOpened && openedDate && periodAfterOpening ? (
                      <View style={[styles.dateInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={{ color: colors.text }}>{formatDate(expirationDate)}</Text>
                        <Text style={[styles.helpText, { color: colors.secondaryText }]}>
                          Based on opened date and PAO
                        </Text>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Text style={{ color: colors.text }}>
                            {expirationDate ? formatDate(expirationDate) : 'Select expiration date'}
                          </Text>
                          <Ionicons name="calendar" size={20} color={colors.secondaryText} />
                        </TouchableOpacity>

                        {showDatePicker && (
                          <DateTimePicker
                            value={expirationDate || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
              )}
              
              {/* Notes Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea, 
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any notes about this product"
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  helpText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  dateInfo: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default EditProductScreen;
