import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import TabToggle from "./components/TabToggle";
import FeaturedPlants from "./components/FeaturedPlants";
import { searchPlants } from "./services/plantSearchService";
import type { PlantSearchResult, SearchHistoryItem } from "./services/plantSearchService";
import { getSearchHistory } from "./services/plantSearchService";

type Tab = 'featured' | 'history';

const FEATURED_PLANTS = [
  'Rose',
  'Monstera',
  'Aloe Vera',
  'Snake Plant',
  'Peace Lily',
  'Orchid'
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('featured');
  const [featuredPlants, setFeaturedPlants] = useState<PlantSearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadFeaturedPlants = useCallback(async () => {
    try {
      setIsLoading(true);
      const results = await Promise.all(
        FEATURED_PLANTS.map(plant => searchPlants(plant))
      );
      // Flatten the results array and take the first result from each search
      const plants = results
        .map(result => result[0])
        .filter(plant => plant); // Remove any undefined results
      setFeaturedPlants(plants);
    } catch (error) {
      console.error('Error loading featured plants:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSearchHistory = useCallback(async () => {
    try {
      const history = await getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  useEffect(() => {
    loadFeaturedPlants();
    loadSearchHistory();
  }, [loadFeaturedPlants, loadSearchHistory]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >
        <SearchBar />
        <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'featured' ? (
          <FeaturedPlants
            plants={featuredPlants}
            isLoading={isLoading}
          />
        ) : (
          <View style={styles.historyContainer}>
            {searchHistory.map((item) => (
              <TouchableOpacity
                key={item.timestamp}
                style={styles.historyItem}
                onPress={() => {
                  router.push({
                    pathname: '/search-results',
                    params: { query: item.query }
                  });
                }}
              >
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.historyText}>{item.query}</Text>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/')}
        >
          <Ionicons name="home" size={24} color="#2ecc71" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/discovery')}
        >
          <Ionicons name="earth-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/chat')}
        >
          <Ionicons name="leaf-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: {
    padding: 8,
  },
  historyContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
});
