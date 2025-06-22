import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../store/ThemeContext';
import { useStoreContext } from '../store/StoreContext';
import { CollectionProduct, WishlistProduct } from '../types/product';
import { ProductDetailsScreenProps, CollectionStackParamList, WishlistStackParamList } from '../navigation/types';

type CombinedStackParamList = CollectionStackParamList & WishlistStackParamList;
type CombinedNavigationProp = NativeStackNavigationProp<CombinedStackParamList>;

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({ 
  navigation,
  route
}) => {
  const { product, isWishlist } = route.params;
  const { colors } = useTheme();
  const { dispatch } = useStoreContext();
  
  // Check if the product is from the collection (has expirationDate property)
  const isCollectionProduct = (product: any): product is CollectionProduct => {
    return 'expirationDate' in product;
  };
  
  // Check if the product is from the wishlist (has priority property)
  const isWishlistProduct = (product: any): product is WishlistProduct => {
    return 'priority' in product;
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format price for display
  const formatPrice = (price?: number) => {
    if (price === undefined) return 'Not set';
    return `$${price.toFixed(2)}`;
  };

  // Format priority for display
  const formatPriority = (priority?: 'low' | 'medium' | 'high') => {
    if (!priority) return 'Not set';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };
  
  // Handle opening purchase link
  const handleOpenLink = async () => {
    if (!product.purchaseLink) return;
    
    const canOpen = await Linking.canOpenURL(product.purchaseLink);
    
    if (canOpen) {
      await Linking.openURL(product.purchaseLink);
    } else {
      Alert.alert('Error', 'Cannot open this URL');
    }
  };
  
  // Handle delete action
  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete this ${isWishlist ? 'wishlist item' : 'product'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (isWishlist) {
              dispatch({ type: 'DELETE_FROM_WISHLIST', payload: product.id });
            } else {
              dispatch({ type: 'DELETE_FROM_COLLECTION', payload: product.id });
            }
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  // Handle move action
  const handleMove = () => {
    Alert.alert(
      'Move Product',
      `Move this product to your ${isWishlist ? 'collection' : 'wishlist'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: () => {
            if (isWishlist) {
              dispatch({ type: 'MOVE_TO_COLLECTION', payload: product as WishlistProduct });
            } else {
              dispatch({ type: 'MOVE_TO_WISHLIST', payload: product as CollectionProduct });
            }
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  // Handle edit action
  const handleEdit = () => {
    // TODO: Fix type casting once navigation types are properly resolved
    (navigation as any).navigate('EditProduct', {
      product,
      isWishlist: isWishlist || false
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <MaterialIcons name="edit" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMove} style={styles.headerButton}>
            <MaterialIcons 
              name={isWishlist ? "add-shopping-cart" : "favorite-border"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <MaterialIcons name="delete-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.productBrand, { color: colors.secondaryText }]}>{product.brand}</Text>
          
          {product.price !== undefined && (
            <Text style={[styles.productPrice, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>
          )}
        </View>
        
        <View style={[styles.detailsSection, { borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Category</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{product.mainCategory}</Text>
          </View>
          
          {isCollectionProduct(product) && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Expiration Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(product.expirationDate)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Status</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.isOpened ? 'Opened' : 'Unopened'}
                </Text>
              </View>
              
              {product.isOpened && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Opened Date</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {formatDate(product.openedDate)}
                    </Text>
                  </View>
                  
                  {product.periodAfterOpening && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Period After Opening</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {product.periodAfterOpening} months
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
          
          {isWishlistProduct(product) && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>Priority</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatPriority(product.priority)}
              </Text>
            </View>
          )}
          
          {product.purchaseLink && (
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: colors.border }]} 
              onPress={handleOpenLink}
            >
              <MaterialIcons name="link" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                View Purchase Link
              </Text>
            </TouchableOpacity>
          )}
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
  headerButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  infoSection: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 18,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  detailsSection: {
    padding: 16,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProductDetailsScreen;
