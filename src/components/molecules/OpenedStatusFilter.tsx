import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useTheme } from '../../store/ThemeContext';

export enum OpenedStatusFilter {
  ALL = 'All',
  OPENED = 'Opened',
  UNOPENED = 'Unopened',
}

interface OpenedStatusFilterProps {
  selectedStatus: OpenedStatusFilter;
  onSelectStatus: (status: OpenedStatusFilter) => void;
}

const OpenedStatusFilterComponent: React.FC<OpenedStatusFilterProps> = ({
  selectedStatus,
  onSelectStatus,
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.filterContainer}>
        {Object.values(OpenedStatusFilter).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && { backgroundColor: colors.primary },
              { borderColor: colors.border }
            ]}
            onPress={() => onSelectStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                { color: selectedStatus === status ? 'white' : colors.text }
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OpenedStatusFilterComponent;
