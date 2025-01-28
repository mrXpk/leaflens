import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import PlantCard from './PlantCard';
import { PlantImage } from '../services/imageService';

interface PlantListProps {
  plants: PlantImage[];
  onPlantPress: (plant: PlantImage) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function PlantList({ plants, onPlantPress }: PlantListProps) {
  if (!plants.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={plants}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        snapToInterval={CARD_WIDTH + 16} // Card width + margin
        decelerationRate="fast"
        renderItem={({ item }) => (
          <PlantCard
            name={item.alt}
            image={item.url}
            onPress={() => onPlantPress(item)}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
});
