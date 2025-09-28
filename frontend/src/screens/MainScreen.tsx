import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import VideoPlayer from '../components/video/VideoPlayer';
import Footer from '../components/Footer';

const { width, height } = Dimensions.get('window');

// Sample data structure - using your actual local asset files
const sampleData = [
  {
    id: '1',
    videoUri: require('../../assets/samples/videos/clairo_sofia.mp4'),
    audioUri: require('../../assets/samples/audio/clairo_sofia.mp3'),
    artist: 'Clairo',
    songName: 'Sofia',
    genre: 'Indie Pop',
  },
  {
    id: '2',
    videoUri: require('../../assets/samples/videos/feng_leftforusa.mp4'),
    audioUri: require('../../assets/samples/audio/feng_leftforusa.mp3'),
    artist: 'Feng',
    songName: 'Left for USA',
    genre: 'Electronic',
  },
  {
    id: '3',
    videoUri: require('../../assets/samples/videos/jpegmafia_ghostofrankingdread.mp4'),
    audioUri: require('../../assets/samples/audio/jpegmafia_ghostofrankingdread.mp3'),
    artist: 'JPEGMAFIA',
    songName: 'Ghost of Ranking Dread',
    genre: 'Experimental Hip Hop',
  },
  {
    id: '4',
    videoUri: require('../../assets/samples/videos/playboicarti_longtime.mp4'),
    audioUri: require('../../assets/samples/audio/playboicarti_longtime.mp3'),
    artist: 'Playboi Carti',
    songName: 'Long Time',
    genre: 'Trap',
  },
  {
    id: '5',
    videoUri: require('../../assets/samples/videos/yeule_poisonarrow.mp4'),
    audioUri: require('../../assets/samples/audio/yeule_poisonarrow.mp3'),
    artist: 'yeule',
    songName: 'Poison Arrow',
    genre: 'Ambient Pop',
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

