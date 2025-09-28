import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HeaderTabsProps {
  onSavedPress?: () => void;
  onHomePress?: () => void;
  onSearchPress?: () => void;
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({
  onSavedPress,
  onHomePress,
  onSearchPress,
}) => {
  return (
    <View style={styles.tabs}>
      {/* Saved tab - Left */}
      <TouchableOpacity style={styles.tabButton} onPress={onSavedPress}>
        <Icon name="bookmark-outline" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Home tab - Center */}
      <TouchableOpacity style={styles.tabButton} onPress={onHomePress}>
        <Icon name="radio-button-on-outline" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Genre Search tab - Right */}
      <TouchableOpacity style={styles.tabButton} onPress={onSearchPress}>
        <Icon name="search-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default HeaderTabs;
