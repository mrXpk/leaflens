import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeatureItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const features: FeatureItem[] = [
  { id: '1', title: 'Plant Care Tips', icon: 'leaf', color: '#2ecc71' },
  { id: '2', title: 'Disease Detection', icon: 'search', color: '#e74c3c' },
  { id: '3', title: 'Plant Chat AI', icon: 'chatbubbles', color: '#3498db' },
  { id: '4', title: 'Plant Library', icon: 'library', color: '#9b59b6' },
];

export default function Features() {
  return (
    <View style={styles.grid}>
      {features.map((feature) => (
        <TouchableOpacity key={feature.id} style={styles.feature}>
          <View style={[styles.iconContainer, { backgroundColor: feature.color }]}>
            <Ionicons name={feature.icon} size={24} color="#fff" />
          </View>
          <Text style={styles.featureTitle}>{feature.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  feature: {
    width: '45%',
    backgroundColor: '#f5f6fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
