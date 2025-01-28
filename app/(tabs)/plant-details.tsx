import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { PlantSearchService, PlantSearchResult } from '../services/plantSearchService';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export default function PlantDetailsScreen() {
  const router = useRouter();
  const { plant: plantParam, fromFeatured } = useLocalSearchParams();
  const [plant, setPlant] = useState<PlantSearchResult>(JSON.parse(plantParam as string));
  const [loading, setLoading] = useState(!fromFeatured);

  useEffect(() => {
    // Only fetch additional details if not coming from featured plants
    // (featured plants already have AI-enriched data)
    if (!fromFeatured) {
      const fetchPlantDetails = async () => {
        try {
          const plantService = new PlantSearchService();
          const details = await plantService.getPlantDetails(plant.scientificName);
          setPlant(prev => ({
            ...prev,
            ...details
          }));
        } catch (error) {
          console.error('Error fetching plant details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPlantDetails();
    }
  }, [plant.scientificName, fromFeatured]);

  const plantCareItems = [
    {
      icon: 'water-outline',
      label: 'Water',
      value: plant.watering || plant.water || 'Moderate',
      color: '#3498db'
    },
    {
      icon: 'sunny-outline',
      label: 'Light',
      value: Array.isArray(plant.sunlight) ? plant.sunlight[0] : (plant.light || 'Bright indirect'),
      color: '#f1c40f'
    },
    {
      icon: 'leaf-outline',
      label: 'Difficulty',
      value: plant.careLevel || plant.difficulty || 'Medium',
      color: '#2ecc71'
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Loading plant details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} bounces={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: plant.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <BlurView intensity={80} style={styles.plantInfoContainer}>
            <View style={styles.nameContainer}>
              <View>
                <Text style={styles.commonName}>{plant.commonName}</Text>
                <Text style={styles.scientificName}>{plant.scientificName}</Text>
                {plant.family && (
                  <Text style={styles.familyText}>Family: {plant.family}</Text>
                )}
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{plant.category || 'Plant'}</Text>
              </View>
            </View>

            <View style={styles.careContainer}>
              {plantCareItems.map((item, index) => (
                <View key={index} style={styles.careItem}>
                  <View style={[styles.careIconContainer, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={styles.careLabel}>{item.label}</Text>
                  <Text style={styles.careValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>
                {plant.description || 'A beautiful plant that can enhance any space with its presence.'}
              </Text>
            </View>

            <View style={styles.careGuideContainer}>
              <Text style={styles.sectionTitle}>Care Guide</Text>
              <View style={styles.careGuideItem}>
                <Ionicons name="water" size={20} color="#3498db" />
                <View style={styles.careGuideText}>
                  <Text style={styles.careGuideTitle}>Watering</Text>
                  <Text style={styles.careGuideDescription}>
                    {plant.careGuide ? 
                      plant.careGuide.split('\n')[0] : 
                      `Water ${(plant.watering || plant.water || 'moderately').toLowerCase()}. Allow the top inch of soil to dry between waterings.
                      Reduce watering in winter.`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.careGuideItem}>
                <Ionicons name="sunny" size={20} color="#f1c40f" />
                <View style={styles.careGuideText}>
                  <Text style={styles.careGuideTitle}>Light Requirements</Text>
                  <Text style={styles.careGuideDescription}>
                    {Array.isArray(plant.sunlight) ? 
                      `Prefers ${plant.sunlight.join(' to ')} light.` :
                      `Prefers ${plant.light ? plant.light.toLowerCase() : 'bright indirect'} light. Protect from direct afternoon sun
                      which can burn the leaves.`}
                  </Text>
                </View>
              </View>

              {plant.soilType && (
                <View style={styles.careGuideItem}>
                  <Ionicons name="leaf" size={20} color="#27ae60" />
                  <View style={styles.careGuideText}>
                    <Text style={styles.careGuideTitle}>Soil Type</Text>
                    <Text style={styles.careGuideDescription}>
                      {plant.soilType}
                    </Text>
                  </View>
                </View>
              )}

              {plant.growthRate && (
                <View style={styles.careGuideItem}>
                  <Ionicons name="trending-up" size={20} color="#9b59b6" />
                  <View style={styles.careGuideText}>
                    <Text style={styles.careGuideTitle}>Growth Rate</Text>
                    <Text style={styles.careGuideDescription}>
                      {plant.growthRate}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {plant.uses && (
              <View style={styles.usesContainer}>
                <Text style={styles.sectionTitle}>Uses</Text>
                <Text style={styles.description}>{plant.uses}</Text>
              </View>
            )}
          </BlurView>
        </View>
      </ScrollView>
    </View>
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
  imageContainer: {
    height: width * 1.1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: HEADER_HEIGHT - 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  plantInfoContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    gap: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commonName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    color: '#636e72',
    fontStyle: 'italic',
  },
  categoryBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  careContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f6fa',
    borderRadius: 16,
    padding: 16,
  },
  careItem: {
    alignItems: 'center',
    gap: 8,
  },
  careIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 4,
  },
  careValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  descriptionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636e72',
  },
  careGuideContainer: {
    gap: 16,
  },
  careGuideItem: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#f5f6fa',
    padding: 16,
    borderRadius: 16,
  },
  careGuideText: {
    flex: 1,
    gap: 4,
  },
  careGuideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  careGuideDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#636e72',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#636e72',
  },
  familyText: {
    fontSize: 14,
    color: '#636e72',
    marginTop: 4,
  },
  usesContainer: {
    gap: 12,
  },
});
