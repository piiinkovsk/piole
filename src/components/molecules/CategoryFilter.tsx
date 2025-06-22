import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { useTheme } from '../../store/ThemeContext';
import { MainCategory } from '../../types/product';

interface CategoryFilterProps {
  selectedCategory: MainCategory | null;
  onSelectCategory: (category: MainCategory | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const { colors } = useTheme();
  
  // Array of all main categories
  const categories = Object.values(MainCategory);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedCategory && { backgroundColor: colors.primary },
            { borderColor: colors.border }
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text
            style={[
              styles.filterText,
              { color: !selectedCategory ? 'white' : colors.text }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && { backgroundColor: colors.primary },
              { borderColor: colors.border }
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedCategory === category ? 'white' : colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
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
});

export default CategoryFilter;
