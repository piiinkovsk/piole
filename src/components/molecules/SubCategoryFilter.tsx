import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../store/ThemeContext';
import { SubCategory } from '../../types/product';

interface SubCategoryFilterProps {
  subCategories: SubCategory[];
  selectedSubCategories: string[];
  onSelectSubCategory: (categoryId: string) => void;
  onClearSubCategories: () => void;
  selectedPath: string[];
}

const SubCategoryFilter: React.FC<SubCategoryFilterProps> = ({
  subCategories,
  selectedSubCategories,
  onSelectSubCategory,
  onClearSubCategories,
  selectedPath
}) => {
  const { colors } = useTheme();
  
  // Show only subcategories that are children of the current path
  const filteredSubCategories = subCategories.filter(cat => {
    if (selectedPath.length === 0) {
      return cat.parentId === null;
    } else {
      return cat.parentId === selectedPath[selectedPath.length - 1];
    }
  });
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Breadcrumb navigation */}
      {selectedPath.length > 0 && (
        <View style={styles.breadcrumbs}>
          <TouchableOpacity 
            onPress={onClearSubCategories}
            style={styles.breadcrumbItem}
          >
            <Text style={[styles.breadcrumbText, { color: colors.primary }]}>All</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.secondaryText} />
          </TouchableOpacity>
          
          {selectedPath.map((path, index) => {
            const category = subCategories.find(cat => cat.id === path);
            const isLast = index === selectedPath.length - 1;
            
            if (!category) return null;
            
            return (
              <View 
                key={path} 
                style={styles.breadcrumbItem}
              >
                <Text 
                  style={[
                    styles.breadcrumbText, 
                    { color: isLast ? colors.text : colors.primary }
                  ]}
                >
                  {category.name}
                </Text>
                {!isLast && (
                  <Ionicons name="chevron-forward" size={14} color={colors.secondaryText} />
                )}
              </View>
            );
          })}
        </View>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSubCategories.length > 0 ? (
          filteredSubCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedSubCategories.includes(category.id) && { backgroundColor: colors.primary },
                { borderColor: colors.border }
              ]}
              onPress={() => onSelectSubCategory(category.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedSubCategories.includes(category.id) ? 'white' : colors.text }
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No subcategories available
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    paddingVertical: 8,
  },
});

export default SubCategoryFilter;
