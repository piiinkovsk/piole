import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import { useTheme } from '../store/ThemeContext';
import { MainCategory, WishlistProduct } from '../types/product';
import ProductCard from '../components/molecules/ProductCard';
import CategoryFilter from '../components/molecules/CategoryFilter';

// Mock data for wishlist products
const MOCK_WISHLIST_PRODUCTS: WishlistProduct[] = [
  {
    id: '1',
    name: 'Rose Facial Spray',
    brand: 'Mario Badescu',
    mainCategory: MainCategory.SKINCARE,
    subCategories: ['facial-spray', 'toner'],
    imageUrl: 'https://picsum.photos/300',
    price: 7.99,
    createdAt: '2024-05-10T10:30:00Z',
    updatedAt: '2024-05-10T10:30:00Z',
    priority: 'medium',
  },
  {
    id: '2',
    name: 'Translucent Setting Powder',
    brand: 'Laura Mercier',
    mainCategory: MainCategory.MAKEUP,
    subCategories: ['face', 'powder'],
    imageUrl: 'https://picsum.photos/301',
    price: 39.99,
    createdAt: '2024-06-05T14:20:00Z',
    updatedAt: '2024-06-05T14:20:00Z',
    priority: 'high',
  },
  {
    id: '3',
    name: 'Lip Balm',
    brand: 'Laneige',
    mainCategory: MainCategory.MAKEUP,
    subCategories: ['lips', 'lip-balm'],
    imageUrl: 'https://picsum.photos/302',
    price: 22.00,
    createdAt: '2024-05-15T09:15:00Z',
    updatedAt: '2024-05-15T09:15:00Z',
    priority: 'low',
  },
  {
    id: '4',
    name: 'Bond Repair Treatment',
    brand: 'Olaplex',
    mainCategory: MainCategory.HAIRCARE,
    subCategories: ['treatment', 'repair'],
    imageUrl: 'https://picsum.photos/303',
    price: 28.00,
    createdAt: '2024-06-01T16:45:00Z',
    updatedAt: '2024-06-01T16:45:00Z',
    priority: 'medium',
  },
];

const WishlistScreen: React.FC = () => {
  const { colors } = useTheme();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<WishlistProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load products on component mount
  useEffect(() => {
    // Simulate API call to fetch products
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // For now, we'll just use the mock data
        setTimeout(() => {
          setProducts(MOCK_WISHLIST_PRODUCTS);
          setFilteredProducts(MOCK_WISHLIST_PRODUCTS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products based on search query and selected category
  useEffect(() => {
    let filtered = products;
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.mainCategory === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.brand.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);
  
  // Handle category selection
  const handleCategorySelect = (category: MainCategory | null) => {
    setSelectedCategory(category);
  };
  
  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="heart-o" size={64} color={colors.secondaryText} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Your wishlist is empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
        Add products to your wishlist for future purchases
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => {}}
      >
        <Text style={styles.emptyButtonText}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.text }]}>
        Loading your wishlist...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search your wishlist"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />
      
      {isLoading ? (
        renderLoadingState()
      ) : filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard product={item} isWishlist />
          )}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => {}}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80, // Extra padding for FAB
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default WishlistScreen;
