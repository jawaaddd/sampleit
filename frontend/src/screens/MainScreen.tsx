import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';
import Footer from '../components/Footer';
import VisualizerBackground from '../components/VisualizerBackground';

const { width, height } = Dimensions.get('window');

// Sample data structure - replace with your actual data
const sampleData = [
  {
    id: '1',
    videoUri: 'file:///path/to/sample1.mp4',
    audioUri: 'file:///path/to/sample1.mp3',
    artist: 'Kanye West',
    songName: 'runaway',
    genre: 'Hip Hop',
  },
  {
    id: '2',
    videoUri: 'file:///path/to/sample2.mp4',
    audioUri: 'file:///path/to/sample2.mp3',
    artist: 'Daft Punk',
    songName: 'One More Time',
    genre: 'Electronic',
  },
  {
    id: '3',
    videoUri: 'file:///path/to/sample3.mp4',
    audioUri: 'file:///path/to/sample3.mp3',
    artist: 'The Weeknd',
    songName: 'Blinding Lights',
    genre: 'Pop',
  },
];

const MainScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.videoContainer}>
      <VideoPlayer
        videoUri={item.videoUri}
        audioUri={item.audioUri}
        isActive={index === currentIndex}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
      />
      <VisualizerBackground isActive={index === currentIndex} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={sampleData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
        />
      </View>

      <Footer
        currentSample={sampleData[currentIndex]}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
  },
  videoContainer: {
    width,
    height,
    position: 'relative',
  },
});

export default MainScreen;

