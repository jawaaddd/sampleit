import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';

const Header = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Saved icon */}
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="bookmark-outline" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Home/Center icon */}
      <TouchableOpacity style={styles.centerButton}>
        <Icon name="radio-button-on-outline" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Menu icon */}
      <TouchableOpacity style={styles.iconButton}>
        <Icon name="menu" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iconButton: {
    padding: 8,
  },
  centerButton: {
    padding: 8,
  },
});

export default Header;

