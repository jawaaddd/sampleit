import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
  currentScreen?: 'main' | 'saved';
}

// Header Component - matches Figma structure: header → Tabs → Circle, Menu, Bookmark
const Header: React.FC<HeaderProps> = ({ currentScreen = 'main' }) => {
  const isSavedScreen = currentScreen === 'saved';
  
  return (
    <View style={styles.header}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Tabs Container - matches Figma Tabs section */}
      <View style={styles.tabs}>
        {/* Search tab - Left (swapped with bookmark) */}
        <TouchableOpacity style={styles.tabButton}>
          <Icon name="search-outline" size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Home tab - Center */}
        <TouchableOpacity style={styles.tabButton}>
          <Icon 
            name={isSavedScreen ? "ellipse-outline" : "ellipse"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        {/* Saved tab - Right (swapped with search) */}
        <TouchableOpacity style={styles.tabButton}>
          <Icon 
            name={isSavedScreen ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
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
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tabButton: {
    padding: 8,
  },
});

export default Header;

