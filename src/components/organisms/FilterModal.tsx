import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { ProductFilters, MainCategory } from '../../types/product';
import CategoryFilter from '../molecules/CategoryFilter';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  initialFilters: ProductFilters;
  onApplyFilters: (filters: ProductFilters) => void;
}

function FilterModal({
  visible,
  onClose,
  initialFilters,
  onApplyFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState<'dateFrom' | 'dateTo' | 'expirationFrom' | 'expirationTo'>('dateFrom');

  useEffect(() => {
    setFilters(initialFilters);
    setSelectedCategory(initialFilters.category || null);
  }, [initialFilters]);

  const handleCategorySelect = (category: MainCategory | null) => {
    setSelectedCategory(category);
    setFilters(prev => ({
      ...prev,
      category: category || undefined,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        [dateType]: selectedDate,
      }));
    }
  };

  const showDatePickerFor = (type: 'dateFrom' | 'dateTo' | 'expirationFrom' | 'expirationTo') => {
    setDateType(type);
    setShowDatePicker(true);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: ProductFilters = {
      category: undefined,
      brand: '',
      priceFrom: undefined,
      priceTo: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      expirationFrom: undefined,
      expirationTo: undefined,
      isOpened: undefined,
      status: 'all',
      priority: 'all',
      sortBy: undefined,
      sortOrder: 'asc',
    };
    setFilters(resetFilters);
    setSelectedCategory(null);
    onApplyFilters(resetFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.title}>Filter Products</Text>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Category</Text>
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Brand</Text>
              <TextInput
                style={styles.input}
                value={filters.brand}
                onChangeText={(brand) => setFilters(prev => ({ ...prev, brand }))}
                placeholder="Enter brand name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={filters.priceFrom?.toString()}
                  onChangeText={(value) => 
                    setFilters(prev => ({ ...prev, priceFrom: value ? Number(value) : undefined }))
                  }
                  placeholder="Min price"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  value={filters.priceTo?.toString()}
                  onChangeText={(value) => 
                    setFilters(prev => ({ ...prev, priceTo: value ? Number(value) : undefined }))
                  }
                  placeholder="Max price"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.rowContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.dateButton]} 
                  onPress={() => showDatePickerFor('dateFrom')}
                >
                  <Text style={styles.dateButtonText}>
                    {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : 'From Date'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.dateButton]} 
                  onPress={() => showDatePickerFor('dateTo')}
                >
                  <Text style={styles.dateButtonText}>
                    {filters.dateTo ? filters.dateTo.toLocaleDateString() : 'To Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Expiration Range</Text>
              <View style={styles.rowContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.dateButton]} 
                  onPress={() => showDatePickerFor('expirationFrom')}
                >
                  <Text style={styles.dateButtonText}>
                    {filters.expirationFrom ? filters.expirationFrom.toLocaleDateString() : 'From Date'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.dateButton]} 
                  onPress={() => showDatePickerFor('expirationTo')}
                >
                  <Text style={styles.dateButtonText}>
                    {filters.expirationTo ? filters.expirationTo.toLocaleDateString() : 'To Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.rowContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.status}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, status: value }))
                    }
                  >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="In Use" value="in_use" />
                    <Picker.Item label="Not Started" value="not_started" />
                    <Picker.Item label="Finished" value="finished" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.rowContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.priority}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="High" value="high" />
                    <Picker.Item label="Medium" value="medium" />
                    <Picker.Item label="Low" value="low" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Opened Status</Text>
              <View style={styles.rowContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.isOpened}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, isOpened: value }))
                    }
                  >
                    <Picker.Item label="All" value={undefined} />
                    <Picker.Item label="Opened" value={true} />
                    <Picker.Item label="Not Opened" value={false} />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.rowContainer}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, sortBy: value }))
                    }
                  >
                    <Picker.Item label="None" value={undefined} />
                    <Picker.Item label="Name" value="name" />
                    <Picker.Item label="Brand" value="brand" />
                    <Picker.Item label="Date Added" value="date" />
                    <Picker.Item label="Price" value="price" />
                    <Picker.Item label="Expiration" value="expiration" />
                  </Picker>
                </View>
                {filters.sortBy && (
                  <View style={[styles.pickerContainer, { marginLeft: 8 }]}>
                    <Picker
                      selectedValue={filters.sortOrder}
                      onValueChange={(value) =>
                        setFilters(prev => ({ ...prev, sortOrder: value }))
                      }
                    >
                      <Picker.Item label="Ascending" value="asc" />
                      <Picker.Item label="Descending" value="desc" />
                    </Picker>
                  </View>
                )}
              </View>
            </View>

            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={filters[dateType] || new Date()}
                mode="date"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]} 
                onPress={handleReset}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.applyButton]} 
                onPress={handleApply}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.closeButton]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateButton: {
    flex: 0.48,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  closeButton: {
    backgroundColor: '#9e9e9e',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default FilterModal;
