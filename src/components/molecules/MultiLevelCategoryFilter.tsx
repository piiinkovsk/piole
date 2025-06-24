import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { MainCategory, CategoryTree, CategoryPath } from '../../types/product';

interface TreeNode {
  selected: boolean;
  indeterminate: boolean;
  children: TreeViewSelection;
}

interface TreeViewSelection {
  [key: string]: TreeNode;
}

interface MultiLevelCategoryFilterProps {
  mainCategory: MainCategory | null;
  onSelectCategory: (paths: CategoryPath[]) => void;
  selectedPath: CategoryPath[];
}

const MultiLevelCategoryFilter: React.FC<MultiLevelCategoryFilterProps> = ({
  mainCategory,
  onSelectCategory,
  selectedPath,
}) => {
  const { colors } = useTheme();
  const [selection, setSelection] = useState<TreeViewSelection>({});
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Enable LayoutAnimation for smooth transitions
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  // Initialize or update selection state based on the category tree
  useEffect(() => {
    const initialSelection: TreeViewSelection = {};
    
    // Initialize all main categories
    Object.values(MainCategory).forEach(cat => {
      initialSelection[cat] = {
        selected: false,
        indeterminate: false,
        children: {}
      };
      
      // Add subcategories for each main category
      const categoryData = CategoryTree[cat as MainCategory];
      if (categoryData) {
        Object.entries(categoryData).forEach(([subKey, subValue]) => {
          initialSelection[cat].children[subKey] = {
            selected: false,
            indeterminate: false,
            children: {}
          };
          
          // Add sub-subcategories
          if (subValue.children) {
            Object.keys(subValue.children).forEach(subSubKey => {
              initialSelection[cat].children[subKey].children[subSubKey] = {
                selected: false,
                indeterminate: false,
                children: {}
              };
            });
          }
        });
      }
    });
    
    setSelection(initialSelection);
  }, []);

  // Calculate indeterminate state for a node
  const updateIndeterminateState = (node: TreeViewSelection): boolean => {
    if (Object.keys(node).length === 0) return false;

    let hasSelected = false;
    let hasUnselected = false;

    Object.values(node).forEach(child => {
      const childState = updateIndeterminateState(child.children);
      child.indeterminate = childState;
      if (child.selected || child.indeterminate) hasSelected = true;
      if (!child.selected) hasUnselected = true;
    });

    return hasSelected && hasUnselected;
  };

  const handleSelection = (path: string[], level: number) => {
    const newSelection = { ...selection };
    let current = newSelection;
    let selectedNode;

    // Navigate to the target node
    for (let i = 0; i < path.length; i++) {
      if (!current[path[i]]) {
        current[path[i]] = { selected: false, indeterminate: false, children: {} };
      }
      if (i === path.length - 1) {
        selectedNode = current[path[i]];
      } else {
        current = current[path[i]].children;
      }
    }

    if (!selectedNode) return;

    // Toggle selection
    const newSelectedState = !selectedNode.selected;
    selectedNode.selected = newSelectedState;
    selectedNode.indeterminate = false;

    // Update child selections
    const updateChildren = (node: TreeViewSelection, selected: boolean) => {
      Object.values(node).forEach(child => {
        child.selected = selected;
        child.indeterminate = false;
        updateChildren(child.children, selected);
      });
    };
    updateChildren(selectedNode.children, newSelectedState);

    // Update indeterminate states
    updateIndeterminateState(newSelection);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelection(newSelection);

    // Collect all selected paths and notify parent
    const selectedPaths: CategoryPath[] = [];
    const collectSelectedPaths = (node: TreeViewSelection, currentPath: string[]) => {
      Object.entries(node).forEach(([key, value]) => {
        if (value.selected) {
          selectedPaths.push({
            id: currentPath.concat(key).join('-'),
            name: key,
            level: currentPath.length === 0 ? 'main' :
                   currentPath.length === 1 ? 'sub1' :
                   currentPath.length === 2 ? 'sub2' : 'sub3'
          });
        }
        collectSelectedPaths(value.children, currentPath.concat(key));
      });
    };
    collectSelectedPaths(newSelection, []);
    onSelectCategory(selectedPaths);
  };

  const toggleExpand = (path: string[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nodeId = path.join('-');
    const newExpanded = new Set(expandedNodes);
    
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (path: string[]): boolean => {
    return expandedNodes.has(path.join('-'));
  };

  const renderSubSubCategories = (
    parentPath: string[],
    categories: TreeViewSelection,
  ) => {
    return Object.entries(categories).map(([name, data]) => (
      <TouchableOpacity
        key={[...parentPath, name].join('-')}
        style={[
          styles.treeNode,
          styles.level3,
          (data.selected || data.indeterminate) && styles.selectedNode,
          (data.selected || data.indeterminate) && { backgroundColor: colors.primary + '20' }
        ]}
        onPress={() => handleSelection([...parentPath, name], 2)}
        activeOpacity={0.7}
      >
        <View style={styles.nodeHeader}>
          <View style={styles.expandButtonPlaceholder} />
          <MaterialIcons
            name={data.indeterminate ? 'indeterminate-check-box' :
                  data.selected ? 'check-box' : 'check-box-outline-blank'}
            size={20}
            color={data.selected || data.indeterminate ? colors.primary : colors.text}
            style={styles.checkbox}
          />
          <Text style={[styles.nodeText, { color: colors.text }]}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderSubCategories = (
    parentPath: string[],
    categories: TreeViewSelection,
  ) => {
    return Object.entries(categories).map(([name, data]) => {
      const path = [...parentPath, name];
      const expanded = isExpanded(path);
      const hasChildren = Object.keys(data.children).length > 0;

      return (
        <View key={path.join('-')}>
          <TouchableOpacity
            style={[
              styles.treeNode,
              styles.level2,
              (data.selected || data.indeterminate) && styles.selectedNode,
              (data.selected || data.indeterminate) && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => handleSelection(path, 1)}
            activeOpacity={0.7}
          >
            <View style={styles.nodeHeader}>
              {hasChildren ? (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpand(path)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons
                    name={expanded ? 'expand-more' : 'chevron-right'}
                    size={22}
                    color={colors.text}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.expandButtonPlaceholder} />
              )}
              <MaterialIcons
                name={data.indeterminate ? 'indeterminate-check-box' :
                      data.selected ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={data.selected || data.indeterminate ? colors.primary : colors.text}
                style={styles.checkbox}
              />
              <Text style={[styles.nodeText, { color: colors.text }]}>
                {name}
                {hasChildren && (
                  <Text style={[styles.childCount, { color: colors.secondaryText }]}>
                    {" "}({Object.keys(data.children).length})
                  </Text>
                )}
              </Text>
            </View>
          </TouchableOpacity>
          {hasChildren && expanded && (
            <View style={styles.childrenContainer}>
              <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
              <View style={styles.childrenWrapper}>
                {renderSubSubCategories(path, data.children)}
              </View>
            </View>
          )}
        </View>
      );
    });
  };

  const renderMainCategories = () => {
    return Object.entries(selection).map(([name, data]) => {
      const path = [name];
      const expanded = isExpanded(path);
      const hasChildren = Object.keys(data.children).length > 0;

      return (
        <View key={name}>
          <TouchableOpacity
            style={[
              styles.treeNode,
              styles.level1,
              (data.selected || data.indeterminate) && styles.selectedNode,
              (data.selected || data.indeterminate) && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => handleSelection([name], 0)}
            activeOpacity={0.7}
          >
            <View style={styles.nodeHeader}>
              {hasChildren ? (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => toggleExpand(path)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons
                    name={expanded ? 'expand-more' : 'chevron-right'}
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.expandButtonPlaceholder} />
              )}
              <MaterialIcons
                name={data.indeterminate ? 'indeterminate-check-box' :
                      data.selected ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={data.selected || data.indeterminate ? colors.primary : colors.text}
                style={styles.checkbox}
              />
              <Text style={[styles.nodeText, styles.mainCategoryText, { color: colors.text }]}>
                {name}
                {hasChildren && (
                  <Text style={[styles.childCount, { color: colors.secondaryText }]}>
                    {" "}({Object.keys(data.children).length})
                  </Text>
                )}
              </Text>
            </View>
          </TouchableOpacity>
          {hasChildren && expanded && (
            <View style={styles.childrenContainer}>
              <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
              <View style={styles.childrenWrapper}>
                {renderSubCategories(path, data.children)}
              </View>
            </View>
          )}
        </View>
      );
    });
  };

  // Count total selected items
  const getSelectedCount = (node: TreeViewSelection): number => {
    let count = 0;
    Object.values(node).forEach(value => {
      if (value.selected) count++;
      count += getSelectedCount(value.children);
    });
    return count;
  };

  return (
    <View style={styles.wrapper}>
      {/* Selection summary */}
      <View style={[styles.summary, { borderBottomColor: colors.border }]}>
        <Text style={[styles.summaryText, { color: colors.secondaryText }]}>
          {getSelectedCount(selection)} categories selected
        </Text>
      </View>

      {/* Collapsible tree view */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderMainCategories()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  summary: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  treeNode: {
    paddingVertical: 8,
    paddingRight: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  level1: {
    paddingLeft: 8,
  },
  level2: {
    paddingLeft: 16,
  },
  level3: {
    paddingLeft: 16,
  },
  selectedNode: {
    borderRadius: 8,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    padding: 4,
    marginRight: 4,
    borderRadius: 12,
  },
  expandButtonPlaceholder: {
    width: 30,
  },
  checkbox: {
    marginRight: 8,
  },
  nodeText: {
    fontSize: 15,
    flex: 1,
  },
  mainCategoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  childCount: {
    fontSize: 14,
  },
  childrenContainer: {
    flexDirection: 'row',
  },
  verticalLine: {
    width: 1,
    marginLeft: 20,
  },
  childrenWrapper: {
    flex: 1,
  },
});

export default MultiLevelCategoryFilter;
