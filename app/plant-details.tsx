import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getPlantDetails, PlantSearchResult } from './services/plantSearchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PlantDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const plantId = route.params?.plantId;
  const [plant, setPlant] = useState<PlantSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!plantId) {
      setError('No plant ID provided');
      return;
    }
    loadPlantDetails();
  }, [plantId]);

  const loadPlantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await getPlantDetails(plantId);
      if (details) {
        setPlant(details);
      } else {
        setError('Could not find plant details');
      }
    } catch (err) {
      setError('Error loading plant details');
      console.error('Error in loadPlantDetails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadPlantDetails();
  };

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open URL:", url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading plant details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="plant-off" size={48} color="#666" />
        <Text style={styles.notFoundText}>Plant not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = [plant.imageUrl, ...(plant.gallery || [])].filter(Boolean);

  return (
    <ScrollView style={styles.container}>
      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        {images.length > 0 ? (
          <>
            <Image
              source={{ uri: images[currentImageIndex] }}
              style={styles.image}
              resizeMode="cover"
            />
            {images.length > 1 && (
              <View style={styles.thumbnailContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImageIndex(index)}
                      style={[
                        styles.thumbnail,
                        currentImageIndex === index && styles.selectedThumbnail,
                      ]}
                    >
                      <Image
                        source={{ uri: img }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <MaterialCommunityIcons name="image-off" size={48} color="#666" />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
      </View>

      {/* Plant Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.commonName}>{plant.commonName}</Text>
        <Text style={styles.scientificName}>{plant.scientificName}</Text>

        {/* Taxonomy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxonomy</Text>
          <Text style={styles.taxonomyText}>Family: {plant.family}</Text>
          {plant.genus && <Text style={styles.taxonomyText}>Genus: {plant.genus}</Text>}
          {plant.order && <Text style={styles.taxonomyText}>Order: {plant.order}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{plant.description}</Text>
        </View>

        {/* Care Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Guide</Text>
          <View style={styles.careGuideContainer}>
            <View style={styles.careItem}>
              <MaterialCommunityIcons name="water" size={24} color="#2196F3" />
              <Text style={styles.careText}>Watering: {plant.watering}</Text>
            </View>
            <View style={styles.careItem}>
              <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#FFC107" />
              <Text style={styles.careText}>
                Sunlight: {plant.sunlight?.join(', ') || 'Not specified'}
              </Text>
            </View>
            <View style={styles.careItem}>
              <MaterialCommunityIcons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.careText}>Care Level: {plant.careLevel}</Text>
            </View>
          </View>
        </View>

        {/* Uses */}
        {plant.uses && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Uses</Text>
            <Text style={styles.usesText}>{plant.uses}</Text>
          </View>
        )}

        {/* Distribution */}
        {plant.distribution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribution</Text>
            <Text style={styles.distributionText}>{plant.distribution}</Text>
          </View>
        )}

        {/* Sources */}
        {(plant.wikipediaUrl || plant.otherSources?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sources</Text>
            {plant.wikipediaUrl && (
              <TouchableOpacity
                style={styles.sourceItem}
                onPress={() => openLink(plant.wikipediaUrl!)}
              >
                <MaterialCommunityIcons name="wikipedia" size={24} color="#666" />
                <Text style={styles.sourceText}>Wikipedia</Text>
              </TouchableOpacity>
            )}
            {plant.otherSources?.map((source, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sourceItem}
                onPress={() => openLink(source.url)}
              >
                <MaterialCommunityIcons name="link" size={24} color="#666" />
                <Text style={styles.sourceText}>{source.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  notFoundText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 250,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  thumbnailContainer: {
    height: 50,
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
  },
  commonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scientificName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  taxonomyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  careGuideContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  careText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  usesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  distributionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 10,
  },
  sourceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});
