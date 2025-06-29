import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MultiLevelCategoryFilter from '../components/molecules/MultiLevelCategoryFilter';

import { useTheme } from '../store/ThemeContext';
import { useStoreContext } from '../store/StoreContext';
import { MainCategory, ProductFilters, CategoryPath } from '../types/product';
import { CollectionStackParamList } from '../navigation/types';
import ProductCard from '../components/molecules/ProductCard';

const { width } = Dimensions.get('window');

// Internal FilterModal component
interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  initialFilters: ProductFilters;
  onApplyFilters: (filters: ProductFilters) => void;
}

const InternalFilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  initialFilters,
  onApplyFilters,
}) => {
  const { colors } = useTheme();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(
    initialFilters.category || null
  );
  const [selectedPaths, setSelectedPaths] = useState<CategoryPath[]>(
    initialFilters.categoryPath || []
  );

  useEffect(() => {
    setFilters(initialFilters);
    setSelectedMainCategory(initialFilters.category || null);
    setSelectedPaths(initialFilters.categoryPath || []);
  }, [initialFilters]);

  const handleCategorySelect = (paths: CategoryPath[]) => {
    setSelectedPaths(paths);
    
    // Find the main category if any main level is selected
    const mainCategoryPath = paths.find(p => p.level === 'main');
    setSelectedMainCategory(mainCategoryPath ? mainCategoryPath.name as MainCategory : null);
    
    setFilters(prev => ({
      ...prev,
      category: mainCategoryPath ? mainCategoryPath.name as MainCategory : undefined,
      categoryPath: paths,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
          <View style={styles.modalCloseButtonSpacer} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Categories Tree View */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Categories</Text>
            <View style={[styles.categoryFilterContainer, { borderColor: colors.border }]}>
              <MultiLevelCategoryFilter
                mainCategory={selectedMainCategory}
                selectedPath={selectedPaths}
                onSelectCategory={handleCategorySelect}
              />
            </View>
          </View>

          {/* Brand Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Brand</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.card 
              }]}
              value={filters.brand}
              onChangeText={(text) => setFilters(prev => ({ ...prev, brand: text }))}
              placeholder="Filter by brand"
              placeholderTextColor={colors.secondaryText}
            />
          </View>

          {/* Selected Filters Summary */}
          {(selectedPaths.length > 0 || filters.brand) && (
            <View style={styles.filterSection}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Selected Filters</Text>
              <View style={styles.selectedFilters}>
                {selectedPaths.map((path) => (
                  <View 
                    key={path.id} 
                    style={[
                      styles.filterChip,
                      { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.filterChipText, { color: colors.primary }]}>
                      {path.name}
                    </Text>
                  </View>
                ))}
                {filters.brand && (
                  <View 
                    style={[
                      styles.filterChip,
                      { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                  >
                    <Text style={[styles.filterChipText, { color: colors.primary }]}>
                      Brand: {filters.brand}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Apply Button */}
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onApplyFilters(filters);
              onClose();
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export type CollectionScreenProps = NativeStackScreenProps<CollectionStackParamList, 'CollectionHome'>;

const CollectionScreen: React.FC<CollectionScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { state } = useStoreContext();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [filteredProducts, setFilteredProducts] = useState(state.collection);

  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Collection',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: '600',
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduct', { isWishlist: false })}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  useEffect(() => {
    let filtered = state.collection;
    
    // Apply category filter from quick filters
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

    // Apply advanced filters
    const categoryPath = filters.categoryPath;
    if (categoryPath && categoryPath.length > 0) {
      const deepCategory = categoryPath[categoryPath.length - 1];
      filtered = filtered.filter(product => 
        product.categoryPath?.some(cat => cat.id === deepCategory.id)
      );
    } else if (filters.category) {
      filtered = filtered.filter(product => product.mainCategory === filters.category);
    }

    if (filters.brand) {
      const brandQuery = filters.brand.toLowerCase();
      filtered = filtered.filter(product => product.brand.toLowerCase().includes(brandQuery));
    }

    setFilteredProducts(filtered);
  }, [state.collection, searchQuery, selectedCategory, filters]);

  const handleApplyFilters = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setSelectedCategory(null); // Clear quick filter when applying advanced filters
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Collection</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor={colors.secondaryText}
          />
          <TouchableOpacity
            style={[styles.filterButton, { borderColor: colors.border }]}
            onPress={() => setShowFilterModal(true)}
          >
            <FontAwesome name="sliders" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScrollView}
        >
          <TouchableOpacity
          style={[
            styles.categoryButton,
            { borderColor: colors.border },
            selectedCategory === null && { backgroundColor: colors.primary }
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryButtonText,
            { color: selectedCategory === null ? '#fff' : colors.text }
          ]}>All</Text>
        </TouchableOpacity>
        {Object.values(MainCategory).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { borderColor: colors.border },
              selectedCategory === category && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
          >
            <Text style={[
              styles.categoryButtonText,
              { color: selectedCategory === category ? '#fff' : colors.text }
            ]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      {/* Filter Modal */}
      <InternalFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="collections-bookmark" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Your collection is empty
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
              Start adding your beauty products by tapping the + button above!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScrollView: {
    marginLeft: -4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCloseButton: {
    width: 40,
    alignItems: 'center',
  },
  modalCloseButtonSpacer: {
    width: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryFilterContainer: {
    minHeight: 300,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
  },
  selectedFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  applyButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    padding: 8,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  productCardContainer: {
    width: (width - 36) / 2, // Account for padding and gap
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CollectionScreen;
