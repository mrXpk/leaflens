import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function Header() {
  return (
    <BlurView intensity={70} style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={24} color="#2ecc71" />
        </View>
        <Text style={styles.logoText}>LeafLens</Text>
      </View>
      
      <Link href="/profile" asChild>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={32} color="#2ecc71" />
        </TouchableOpacity>
      </Link>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 204, 113, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  profileButton: {
    padding: 4,
  },
});
