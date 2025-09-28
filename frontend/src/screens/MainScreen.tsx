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

// Sample data structure - update paths to your actual asset files
const sampleData = [
  {
    id: '1',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Kanye West',
    songName: 'runaway',
    genre: 'Hip Hop',
  },
  {
    id: '2',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Daft Punk',
    songName: 'One More Time',
    genre: 'Electronic',
  },
  {
    id: '3',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'The Weeknd',
    songName: 'Blinding Lights',
    genre: 'Pop',
  },
  {
    id: '4',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Tame Impala',
    songName: 'The Less I Know The Better',
    genre: 'Psychedelic Rock',
  },
  {
    id: '5',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Frank Ocean',
    songName: 'Nights',
    genre: 'R&B',
  },
  {
    id: '6',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Kendrick Lamar',
    songName: 'HUMBLE.',
    genre: 'Hip Hop',
  },
  {
    id: '7',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Flume',
    songName: 'Never Be Like You',
    genre: 'Electronic',
  },
  {
    id: '8',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Tyler, The Creator',
    songName: 'EARFQUAKE',
    genre: 'Hip Hop',
  },
  {
    id: '9',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Billie Eilish',
    songName: 'bad guy',
    genre: 'Pop',
  },
  {
    id: '10',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Mac Miller',
    songName: 'Self Care',
    genre: 'Hip Hop',
  },
  {
    id: '11',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Childish Gambino',
    songName: 'Redbone',
    genre: 'R&B',
  },
  {
    id: '12',
    videoUri: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    audioUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    artist: 'Travis Scott',
    songName: 'SICKO MODE',
    genre: 'Hip Hop',
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

