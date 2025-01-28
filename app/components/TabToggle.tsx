import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Tab = 'history' | 'featured';

interface TabToggleProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TabToggle({ activeTab, onTabChange }: TabToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => onTabChange('history')}
        style={styles.tabButton}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'history' && styles.activeTabText
        ]}>History</Text>
        {activeTab === 'history' && <View style={styles.underline} />}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => onTabChange('featured')}
        style={styles.tabButton}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'featured' && styles.activeTabText
        ]}>Featured Plants</Text>
        {activeTab === 'featured' && <View style={styles.underline} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tabButton: {
    marginRight: 24,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2ecc71',
    borderRadius: 1,
  },
});
