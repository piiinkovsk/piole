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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../store/ThemeContext';
import { useStoreContext } from '../store/StoreContext';
import { MainCategory } from '../types/product';
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
  const [notes, setNotes] = useState(product.notes || '');
  const [purchaseLink, setPurchaseLink] = useState(product.purchaseLink || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    product.expirationDate ? new Date(product.expirationDate) : null
  );
  const [isOpened, setIsOpened] = useState(
    'isOpened' in product ? product.isOpened || false : false
  );
  const [openedDate, setOpenedDate] = useState<Date | null>(
    'openedDate' in product && product.openedDate ? new Date(product.openedDate) : null
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
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
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
      
      <ScrollView style={styles.content}>
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
        
        {/* Collection-specific fields */}
        {!isWishlist && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Collection Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Expiration Date</Text>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.card 
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>
                  {expirationDate ? formatDate(expirationDate) : 'Set expiration date'}
                </Text>
                <Ionicons name="calendar" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={expirationDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
            
            <View style={styles.switchGroup}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Opened</Text>
              <Switch
                value={isOpened}
                onValueChange={setIsOpened}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            
            {isOpened && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Opened Date</Text>
                  <TouchableOpacity
                    style={[styles.dateButton, { 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    onPress={() => setShowOpenedDatePicker(true)}
                  >
                    <Text style={{ color: colors.text }}>
                      {openedDate ? formatDate(openedDate) : 'Set opened date'}
                    </Text>
                    <Ionicons name="calendar" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                  
                  {showOpenedDatePicker && (
                    <DateTimePicker
                      value={openedDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={handleOpenedDateChange}
                    />
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>
                    Period After Opening (months)
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      borderColor: colors.border, 
                      backgroundColor: colors.card 
                    }]}
                    value={periodAfterOpening}
                    onChangeText={(text) => setPeriodAfterOpening(text.replace(/[^0-9]/g, ''))}
                    placeholder="Enter PAO in months (e.g., 12)"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="number-pad"
                  />
                </View>
              </>
            )}
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
      </ScrollView>
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
    fontWeight: '600',
    marginBottom: 16,
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default EditProductScreen;
