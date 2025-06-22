import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../store/ThemeContext';
import { MainCategory } from '../../types/product';

interface ProductPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (productData: ProductPreviewData) => void;
  initialData: ProductPreviewData;
  isWishlist: boolean;
}

export interface ProductPreviewData {
  name: string;
  brand: string;
  imageUrl: string;
  price?: string;
  mainCategory: MainCategory;
  sourceUrl: string;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  isWishlist
}) => {
  const { colors } = useTheme();
  const [productData, setProductData] = useState<ProductPreviewData>(initialData);
  
  // Handle input changes
  const handleChange = (field: keyof ProductPreviewData, value: string) => {
    setProductData(prev => ({
      ...prev,
      [field]: field === 'price' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };
  
  // Handle category selection
  const handleCategorySelect = (category: MainCategory) => {
    setProductData(prev => ({
      ...prev,
      mainCategory: category
    }));
  };
  
  // Handle save
  const handleSave = () => {
    onSave(productData);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add to {isWishlist ? 'Wishlist' : 'Collection'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContainer}>
            {productData.imageUrl ? (
              <Image 
                source={{ uri: productData.imageUrl }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                <MaterialIcons name="image" size={50} color={colors.secondaryText} />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Name</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card
                }]}
                value={productData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Product name"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Brand</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card
                }]}
                value={productData.brand}
                onChangeText={(text) => handleChange('brand', text)}
                placeholder="Brand name"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Price</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card
                }]}
                value={productData.price}
                onChangeText={(text) => handleChange('price', text)}
                placeholder="Price (optional)"
                placeholderTextColor={colors.secondaryText}
                keyboardType="decimal-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Category</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
              >
                {Object.values(MainCategory).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      { borderColor: colors.border },
                      productData.mainCategory === category && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: productData.mainCategory === category ? 'white' : colors.text }
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.secondaryText }]}>Image URL</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card
                }]}
                value={productData.imageUrl}
                onChangeText={(text) => handleChange('imageUrl', text)}
                placeholder="Image URL"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    maxHeight: '70%',
  },
  productImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProductPreviewModal;
