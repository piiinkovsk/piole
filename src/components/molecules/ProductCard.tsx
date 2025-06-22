import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../../store/ThemeContext';
import { BaseProduct, CollectionProduct, WishlistProduct } from '../../types/product';

interface ProductCardProps {
  product: BaseProduct | CollectionProduct | WishlistProduct;
  isWishlist?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlist = false, onPress }) => {
  const { colors } = useTheme();
  
  // Format expiration date for display
  const formatExpirationDate = (date?: string) => {
    if (!date) return 'Expiration not set';
    
    const expDate = new Date(date);
    const month = expDate.getMonth() + 1;
    const year = expDate.getFullYear();
    
    return `Use by ${month}/${year}`;
  };
  
  // Format price for display
  const formatPrice = (price?: number) => {
    if (price === undefined) return '';
    
    return `$${price.toFixed(2)}`;
  };
  
  // Check if the product is from the collection (has expirationDate property)
  const isCollectionProduct = (product: any): product is CollectionProduct => {
    return 'expirationDate' in product;
  };
  
  // Check if the product is from the wishlist (has priority property)
  const isWishlistProduct = (product: any): product is WishlistProduct => {
    return 'priority' in product;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.name, { color: colors.text }]} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </Text>
        
        <Text 
          style={[styles.brand, { color: colors.secondaryText }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {product.brand}
        </Text>
        
        <View style={styles.footer}>
          {isCollectionProduct(product) ? (
            <Text 
              style={[
                styles.expiration, 
                { color: colors.secondaryText },
                !product.expirationDate && { fontStyle: 'italic' }
              ]}
              numberOfLines={1}
            >
              {formatExpirationDate(product.expirationDate)}
            </Text>
          ) : isWishlistProduct(product) && product.price ? (
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>
          ) : (
            <View />
          )}
          
          {isWishlist ? (
            <View style={[styles.priorityIndicator, { 
              backgroundColor: isWishlistProduct(product) && product.priority === 'high' 
                ? colors.error 
                : isWishlistProduct(product) && product.priority === 'medium'
                ? colors.primaryDark
                : colors.secondaryText
            }]} />
          ) : (
            <TouchableOpacity style={styles.moreButton}>
              <MaterialIcons name="more-vert" size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    minHeight: 36,
  },
  brand: {
    fontSize: 12,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiration: {
    fontSize: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreButton: {
    padding: 2,
  },
});

export default ProductCard;
