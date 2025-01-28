import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PlantSearchResult } from '../services/plantSearchService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface FeaturedPlantsProps {
  plants: PlantSearchResult[];
  isLoading?: boolean;
}

// Curated list of high-quality plant images and information
const FEATURED_SECTIONS = {
  trending: {
    title: "Trending Plants",
    plants: [
      {
        id: 'monstera',
        commonName: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        description: 'Known for its stunning split leaves, this tropical beauty is a popular houseplant.',
        imageUrl: 'https://images.pexels.com/photos/3125195/pexels-photo-3125195.jpeg',
        category: 'Tropical',
        difficulty: 'Easy',
        light: 'Bright indirect',
        water: 'Weekly',
        featured: true
      },
      {
        id: 'fiddle',
        commonName: 'Fiddle Leaf Fig',
        scientificName: 'Ficus lyrata',
        description: 'With its large, violin-shaped leaves, this striking plant has become an icon of modern design.',
        imageUrl: 'https://images.pexels.com/photos/6297518/pexels-photo-6297518.jpeg',
        category: 'Indoor',
        difficulty: 'Medium',
        light: 'Bright indirect',
        water: 'Moderate',
        featured: true
      }
    ]
  },
  beginner: {
    title: "Perfect for Beginners",
    plants: [
      {
        id: 'snake',
        commonName: 'Snake Plant',
        scientificName: 'Sansevieria trifasciata',
        description: 'A hardy succulent with striking upright leaves, perfect for purifying air.',
        imageUrl: 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg',
        category: 'Succulent',
        difficulty: 'Easy',
        light: 'Any light',
        water: 'Low',
        featured: true
      },
      {
        id: 'pothos',
        commonName: 'Golden Pothos',
        scientificName: 'Epipremnum aureum',
        description: 'A versatile vine that can tolerate various light conditions and irregular watering.',
        imageUrl: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg',
        category: 'Vine',
        difficulty: 'Easy',
        light: 'Low to bright',
        water: 'Moderate',
        featured: true
      }
    ]
  },
  rare: {
    title: "Rare Beauties",
    plants: [
      {
        id: 'pink-princess',
        commonName: 'Pink Princess Philodendron',
        scientificName: 'Philodendron erubescens',
        description: 'Stunning variegated leaves with pink patches make this a coveted collector\'s item.',
        imageUrl: 'https://images.pexels.com/photos/7663987/pexels-photo-7663987.jpeg',
        category: 'Rare',
        difficulty: 'Medium',
        light: 'Bright indirect',
        water: 'Weekly',
        featured: true
      },
      {
        id: 'string-of-pearls',
        commonName: 'String of Pearls',
        scientificName: 'Senecio rowleyanus',
        description: 'Unique succulent with cascading pearl-like leaves, perfect for hanging baskets.',
        imageUrl: 'https://images.pexels.com/photos/4505456/pexels-photo-4505456.jpeg',
        category: 'Rare',
        difficulty: 'Medium',
        light: 'Bright indirect',
        water: 'Low',
        featured: true
      }
    ]
  },
  flowering: {
    title: "Beautiful Bloomers",
    plants: [
      {
        id: 'orchid',
        commonName: 'Phalaenopsis Orchid',
        scientificName: 'Phalaenopsis spp.',
        description: 'Elegant flowering plant known for its long-lasting blooms and graceful appearance.',
        imageUrl: 'https://images.pexels.com/photos/4622976/pexels-photo-4622976.jpeg',
        category: 'Flowering',
        difficulty: 'Medium',
        light: 'Bright indirect',
        water: 'Weekly',
        featured: true
      },
      {
        id: 'peace-lily',
        commonName: 'Peace Lily',
        scientificName: 'Spathiphyllum',
        description: 'Beautiful white flowers and glossy leaves, perfect for indoor spaces.',
        imageUrl: 'https://images.pexels.com/photos/6297074/pexels-photo-6297074.jpeg',
        category: 'Flowering',
        difficulty: 'Easy',
        light: 'Low to bright',
        water: 'Weekly',
        featured: true
      }
    ]
  }
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 0.9;
const SPACING = 16;

const FeaturedPlants: React.FC<FeaturedPlantsProps> = ({ isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const handlePlantPress = async (plant: any) => {
    try {
      // Get additional plant details from AI
      const plantService = new PlantSearchService();
      const details = await plantService.getPlantDetails(plant.scientificName);
      
      // Merge the details with our featured plant data
      const enrichedPlant = {
        ...plant,
        ...details,
        // Ensure we keep the high-quality image from our curated list
        imageUrl: plant.imageUrl
      };

      router.push({
        pathname: '/(tabs)/plant-details',
        params: { 
          plant: JSON.stringify(enrichedPlant),
          fromFeatured: 'true'
        }
      });
    } catch (error) {
      console.error('Error getting plant details:', error);
      // If AI fetch fails, still navigate with basic info
      router.push({
        pathname: '/(tabs)/plant-details',
        params: { 
          plant: JSON.stringify(plant),
          fromFeatured: 'true'
        }
      });
    }
  };

  const handleSeeAllPress = (sectionId: string, title: string) => {
    router.push({
      pathname: '/(tabs)/all-plants',
      params: { 
        sectionId,
        sectionTitle: title
      }
    });
  };

  const renderPlantCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePlantPress(item)}
      activeOpacity={0.95}
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
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.plantName}>{item.commonName}</Text>
                <Text style={styles.scientificName}>{item.scientificName}</Text>
              </View>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={16} color="#fff" />
                <Text style={styles.detailText}>{item.water}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="sunny-outline" size={16} color="#fff" />
                <Text style={styles.detailText}>{item.light}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="leaf-outline" size={16} color="#fff" />
                <Text style={styles.detailText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
        </BlurView>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSection = ({ section, index }: { section: any, index: number }) => (
    <View style={[styles.section, index === 0 ? styles.firstSection : null]}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionSubtitle}>
            {section.plants.length} plants available
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={() => handleSeeAllPress(Object.keys(FEATURED_SECTIONS)[index], section.title)}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="arrow-forward" size={16} color="#2ecc71" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={section.plants}
        renderItem={renderPlantCard}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      />
    </View>
  );

  return (
    <FlatList
      data={Object.values(FEATURED_SECTIONS)}
      renderItem={({ item, index }) => renderSection({ section: item, index })}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  firstSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeAllText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
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
    height: '65%',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardContent: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46,204,113,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default FeaturedPlants;
