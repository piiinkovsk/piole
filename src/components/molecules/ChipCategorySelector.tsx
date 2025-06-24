import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../store/ThemeContext';
import { MainCategory, CategoryTree, CategoryPath } from '../../types/product';

interface ChipCategorySelectorProps {
  onSelectCategory: (paths: CategoryPath[]) => void;
  selectedPath: CategoryPath[];
  resetTrigger?: number; // Increment this to trigger a reset
}

const ChipCategorySelector: React.FC<ChipCategorySelectorProps> = ({
  onSelectCategory,
  selectedPath,
  resetTrigger = 0,
}) => {
  const { colors } = useTheme();
  const [level1Selection, setLevel1Selection] = useState<MainCategory | null>(null);
  const [level2Selection, setLevel2Selection] = useState<string | null>(null);
  const [level3Selection, setLevel3Selection] = useState<string | null>(null);
  const [level2Options, setLevel2Options] = useState<string[]>([]);
  const [level3Options, setLevel3Options] = useState<string[]>([]);

  // Reset effect
  useEffect(() => {
    if (resetTrigger > 0) {
      setLevel1Selection(null);
      setLevel2Selection(null);
      setLevel3Selection(null);
      setLevel2Options([]);
      setLevel3Options([]);
    }
  }, [resetTrigger]);

  // Initialize or update selections based on selectedPath
  useEffect(() => {
    if (selectedPath.length > 0) {
      const mainCat = selectedPath[0]?.name as MainCategory;
      setLevel1Selection(mainCat);
      
      if (selectedPath.length > 1) {
        setLevel2Selection(selectedPath[1]?.name);
        updateLevel2Options(mainCat);
      }
      
      if (selectedPath.length > 2) {
        setLevel3Selection(selectedPath[2]?.name);
        updateLevel3Options(mainCat, selectedPath[1]?.name);
      }
    } else {
      // Reset when selectedPath is empty
      setLevel1Selection(null);
      setLevel2Selection(null);
      setLevel3Selection(null);
      setLevel2Options([]);
      setLevel3Options([]);
    }
  }, [selectedPath]);

  const updateLevel2Options = (mainCategory: MainCategory) => {
    const categoryData = CategoryTree[mainCategory];
    if (categoryData) {
      setLevel2Options(Object.keys(categoryData));
    } else {
      setLevel2Options([]);
    }
  };

  const updateLevel3Options = (mainCategory: MainCategory, level2: string) => {
    const categoryData = CategoryTree[mainCategory]?.[level2]?.children;
    if (categoryData) {
      setLevel3Options(Object.keys(categoryData));
    } else {
      setLevel3Options([]);
    }
  };

  const handleLevel1Select = (category: MainCategory) => {
    if (level1Selection === category) return;
    
    setLevel1Selection(category);
    setLevel2Selection(null);
    setLevel3Selection(null);
    updateLevel2Options(category);
    setLevel3Options([]);
    
    onSelectCategory([{
      id: category,
      name: category,
      level: 'main'
    }]);
  };

  const handleLevel2Select = (category: string) => {
    if (!level1Selection) return;
    
    setLevel2Selection(category);
    setLevel3Selection(null);
    updateLevel3Options(level1Selection, category);
    
    onSelectCategory([
      {
        id: level1Selection,
        name: level1Selection,
        level: 'main'
      },
      {
        id: category,
        name: category,
        level: 'sub1'
      }
    ]);
  };

  const handleLevel3Select = (category: string) => {
    if (!level1Selection || !level2Selection) return;
    
    setLevel3Selection(category);
    
    onSelectCategory([
      {
        id: level1Selection,
        name: level1Selection,
        level: 'main'
      },
      {
        id: level2Selection,
        name: level2Selection,
        level: 'sub1'
      },
      {
        id: category,
        name: category,
        level: 'sub2'
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Level 1 Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.chipContainer}
      >
        {Object.values(MainCategory).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              { borderColor: colors.border },
              level1Selection === category && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleLevel1Select(category)}
          >
            <Text
              style={[
                styles.chipText,
                { color: level1Selection === category ? 'white' : colors.text }
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Level 2 Categories */}
      {level1Selection && level2Options.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.row}
          contentContainerStyle={styles.chipContainer}
        >
          {level2Options.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                { borderColor: colors.border },
                level2Selection === category && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleLevel2Select(category)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: level2Selection === category ? 'white' : colors.text }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Level 3 Categories */}
      {level2Selection && level3Options.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.row}
          contentContainerStyle={styles.chipContainer}
        >
          {level3Options.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                { borderColor: colors.border },
                level3Selection === category && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleLevel3Select(category)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: level3Selection === category ? 'white' : colors.text }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexGrow: 0,
  },
  chipContainer: {
    paddingHorizontal: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ChipCategorySelector;
