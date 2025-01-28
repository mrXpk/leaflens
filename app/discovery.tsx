import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { searchPlantImages, PlantImage } from './services/imageService';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface PlantFact {
  id: string;
  title: string;
  fact: string;
  category: string;
  likes: number;
  image?: PlantImage;
}

const PLANT_FACTS: PlantFact[] = [
  {
    id: '1',
    title: 'Bamboo Growth',
    fact: 'Some species of bamboo can grow up to 35 inches per day, making them the fastest-growing plants on Earth!',
    category: 'Growth',
    likes: 1245,
  },
  {
    id: '2',
    title: 'Plant Communication',
    fact: 'Plants can communicate with each other through chemical signals and warn nearby plants of potential dangers.',
    category: 'Behavior',
    likes: 892,
  },
  {
    id: '3',
    title: 'Oldest Living Tree',
    fact: 'The oldest known living tree is a Great Basin Bristlecone Pine named Methuselah, over 4,800 years old!',
    category: 'History',
    likes: 2103,
  },
  {
    id: '4',
    title: 'Venus Flytrap Memory',
    fact: 'Venus flytraps can count! They only snap shut after two triggers to avoid wasting energy on false alarms.',
    category: 'Carnivorous',
    likes: 1567,
  },
  {
    id: '5',
    title: 'Rainforest Oxygen',
    fact: 'The Amazon rainforest produces about 20% of the world\'s oxygen, earning it the nickname "Lungs of the Earth".',
    category: 'Environment',
    likes: 3421,
  },
  {
    id: '6',
    title: 'Plant Music',
    fact: 'Studies show that plants grow better when exposed to classical music due to the vibration patterns!',
    category: 'Research',
    likes: 756,
  },
];

const CATEGORIES = [
  'All',
  'Growth',
  'Behavior',
  'History',
  'Carnivorous',
  'Environment',
  'Research',
];

export default function Discovery() {
  const [facts, setFacts] = useState<PlantFact[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = Dimensions.get('window');

  const loadFactImages = useCallback(async () => {
    try {
      const factsWithImages = await Promise.all(
        PLANT_FACTS.map(async (fact) => {
          const images = await searchPlantImages(fact.title);
          return {
            ...fact,
            image: images[0],
          };
        })
      );
      setFacts(factsWithImages);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFactImages();
    setRefreshing(false);
  }, [loadFactImages]);

  useEffect(() => {
    loadFactImages();
  }, [loadFactImages]);

  const filteredFacts = selectedCategory === 'All' 
    ? facts 
    : facts.filter(fact => fact.category === selectedCategory);

  const renderFactCard = ({ item }: { item: PlantFact }) => (
    <TouchableOpacity 
      style={[styles.factCard, { width: width - 32 }]}
      activeOpacity={0.9}
    >
      {item.image && (
        <Image
          source={{ uri: item.image.url }}
          style={styles.factImage}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.factContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.factTitle}>{item.title}</Text>
          <Text style={styles.factText}>{item.fact}</Text>
          <View style={styles.factFooter}>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={20} color="#fff" />
              <Text style={styles.likeCount}>{item.likes.toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.selectedCategoryChip,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item && styles.selectedCategoryChipText,
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Plants</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item}
        style={styles.categoryList}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ecc71" />
        </View>
      ) : (
        <FlatList
          data={filteredFacts}
          renderItem={renderFactCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.factsContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2ecc71"
            />
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/discovery')}
        >
          <MaterialCommunityIcons name="compass" size={24} color="#2ecc71" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/chat')}
        >
          <Ionicons name="leaf-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  searchButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginHorizontal: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#2ecc71',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  factsContainer: {
    padding: 16,
  },
  factCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 400,
  },
  factImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  factContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  factTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  factText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 12,
  },
  factFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  likeCount: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
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
});
