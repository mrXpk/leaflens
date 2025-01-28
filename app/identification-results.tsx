import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlantIdentification } from './services/plantIdentificationService';
import { Ionicons } from '@expo/vector-icons';

export default function IdentificationResults() {
  const router = useRouter();
  const params = useLocalSearchParams<{ results: string }>();
  const results: PlantIdentification[] = params.results ? JSON.parse(params.results) : [];

  const renderConfidenceBar = (confidence: number) => {
    return (
      <View style={styles.confidenceBar}>
        <View style={[styles.confidenceFill, { width: `${confidence * 100}%` }]} />
        <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identification Results</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {results.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            style={styles.resultCard}
            onPress={() => router.push({
              pathname: '/plant-details',
              params: { plant: JSON.stringify(plant) }
            })}
          >
            {plant.imageUrl && (
              <Image
                source={{ uri: plant.imageUrl }}
                style={styles.plantImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              {plant.commonNames.length > 0 && (
                <Text style={styles.commonNames}>
                  {plant.commonNames.slice(0, 2).join(', ')}
                </Text>
              )}
              {renderConfidenceBar(plant.confidence)}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  resultCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  commonNames: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  confidenceFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
  },
  confidenceText: {
    position: 'absolute',
    right: 8,
    top: 2,
    fontSize: 12,
    color: '#333',
  },
});
