import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 12;
const CARD_WIDTH = (width - (SPACING * (COLUMN_COUNT + 1))) / COLUMN_COUNT;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

export default function AllPlantsScreen() {
  const router = useRouter();
  const { sectionTitle, sectionId } = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Get plants from the section
  const getSectionPlants = () => {
    // This would typically come from your plant service
    const FEATURED_SECTIONS = {
      trending: {
        title: "Trending Plants",
        filters: ['all', 'tropical', 'indoor', 'outdoor'],
        plants: [/* ... your plants data ... */]
      },
      beginner: {
        title: "Perfect for Beginners",
        filters: ['all', 'easy-care', 'low-light', 'drought-tolerant'],
        plants: [/* ... your plants data ... */]
      },
      rare: {
        title: "Rare Beauties",
        filters: ['all', 'variegated', 'exotic', 'collector'],
        plants: [/* ... your plants data ... */]
      },
      flowering: {
        title: "Beautiful Bloomers",
        filters: ['all', 'seasonal', 'indoor', 'fragrant'],
        plants: [/* ... your plants data ... */]
      }
    };
    
    return FEATURED_SECTIONS[sectionId as keyof typeof FEATURED_SECTIONS] || { title: "", plants: [], filters: [] };
  };

  const section = getSectionPlants();
  const filters = section.filters;

  const renderFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item && styles.filterTextActive
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
      </Text>
    </TouchableOpacity>
  );

  const renderPlantCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({
        pathname: '/plant-details',
        params: { plant: JSON.stringify(item) }
      })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.plantImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.cardContent}>
            <Text style={styles.plantName} numberOfLines={1}>
              {item.commonName}
            </Text>
            <Text style={styles.scientificName} numberOfLines={1}>
              {item.scientificName}
            </Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={14} color="#fff" />
                <Text style={styles.detailText}>{item.water}</Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2d3436" />
        </TouchableOpacity>
        <Text style={styles.title}>{sectionTitle}</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Ionicons name="options-outline" size={24} color="#2d3436" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filters}
        renderItem={renderFilter}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterList}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={styles.loader} />
      ) : (
        <FlatList
          data={section.plants}
          renderItem={renderPlantCard}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  filterIcon: {
    padding: 8,
  },
  filterList: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2ecc71',
  },
  filterText: {
    color: '#636e72',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  gridContainer: {
    padding: SPACING,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  blurContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  cardContent: {
    gap: 4,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  scientificName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#fff',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(46,204,113,0.9)',
  },
  difficultyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
