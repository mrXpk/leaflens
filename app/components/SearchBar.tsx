import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Text, FlatList, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { identifyPlant } from '../services/plantIdentificationService';
import { getSearchHistory, addToSearchHistory, SearchHistoryItem, searchPlants } from '../services/plantSearchService';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsFocused(false);
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      await addToSearchHistory(searchQuery.trim());
      const results = await searchPlants(searchQuery.trim());
      
      if (results.length > 0) {
        // Navigate directly to plant details if we found a match
        router.push({
          pathname: '/plant-details',
          params: { plant: JSON.stringify(results[0]) }
        });
      } else {
        // Show search results if no exact match
        router.push({
          pathname: '/search-results',
          params: { query: searchQuery.trim() }
        });
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching for plants. Please try again.');
    } finally {
      setIsLoading(false);
      setQuery('');
      await loadSearchHistory();
    }
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    handleSearch(item.query);
  };

  const handleImagePick = async (useCamera: boolean) => {
    try {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          });

      if (!result.canceled && result.assets[0].base64) {
        setIsLoading(true);
        try {
          const identificationResults = await identifyPlant(result.assets[0].base64);
          router.push({
            pathname: '/identification-results',
            params: { results: JSON.stringify(identificationResults) }
          });
        } catch (error) {
          console.error('Error identifying plant:', error);
          alert('Failed to identify plant. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}
    >
      <Ionicons name="time-outline" size={16} color="#666" style={styles.historyIcon} />
      <Text style={styles.historyText}>{item.query}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search plants..."
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={() => handleSearch(query)}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#2ecc71" />
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => handleImagePick(true)}
              style={styles.actionButton}
            >
              <Ionicons name="camera" size={24} color="#2ecc71" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleImagePick(false)}
              style={styles.actionButton}
            >
              <Ionicons name="images" size={24} color="#2ecc71" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isFocused && searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.timestamp.toString()}
            style={styles.historyList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  historyContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 300,
  },
  historyList: {
    padding: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
});
