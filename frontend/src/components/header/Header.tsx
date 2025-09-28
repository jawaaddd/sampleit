import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HeaderTabs from './HeaderTabs';

// Header Component - matches Figma structure: header → Tabs
const Header = () => {
  const handleSavedPress = () => {
    console.log('Saved tab pressed');
  };

  const handleHomePress = () => {
    console.log('Home tab pressed');
  };

  const handleSearchPress = () => {
    console.log('Search tab pressed');
  };

  return (
    <View style={styles.header}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Tabs Container - matches Figma Tabs section */}
      <HeaderTabs
        onSavedPress={handleSavedPress}
        onHomePress={handleHomePress}
        onSearchPress={handleSearchPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
});

export default Header;

