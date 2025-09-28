import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import VideoPlayer from '../components/video/VideoPlayer';
import Footer from '../components/Footer';
import SavedSamplesScreen from './SavedSamplesScreen';

const { width, height } = Dimensions.get('window');

// Backend API types
interface BackendSample {
  id: number;
  name: string;
  sample_url: string;
  tags: string;
}

interface Sample {
  id: string;
  audioUrl: string;
  artist: string;
  songName: string;
  genre: string;
}

// Local video backgrounds for different samples
const videoBackgrounds = [
  require('../../assets/samples/videos/clairo_sofia.mp4'),
  require('../../assets/samples/videos/feng_leftforusa.mp4'),
  require('../../assets/samples/videos/jpegmafia_ghostofrankingdread.mp4'),
  require('../../assets/samples/videos/playboicarti_longtime.mp4'),
  require('../../assets/samples/videos/yeule_poisonarrow.mp4'),
];

const MainScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSavedSamples, setShowSavedSamples] = useState(false);
  const [pitchValue, setPitchValue] = useState(0);
  const [reverbValue, setReverbValue] = useState(0); // Start with reverb off
  const [speedValue, setSpeedValue] = useState(2); // Start at normal speed (1x)
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const savedSamplesOpacity = useRef(new Animated.Value(0)).current;

  // Save/like a sample
  const saveSample = async (sample: Sample) => {
    try {
      console.log('Saving sample:', sample);
      const response = await fetch('http://10.0.0.60:8000/user/saves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Using demo user ID
          sample_id: sample.id,
        }),
      });

      if (response.ok) {
        console.log('Sample saved successfully');
        Alert.alert('Saved!', `${sample.artist} - ${sample.songName} has been saved to your library`);
      } else {
        console.log('Failed to save sample, status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
        Alert.alert('Error', 'Failed to save sample');
      }
    } catch (error) {
      console.error('Error saving sample:', error);
      Alert.alert('Error', 'Failed to save sample');
    }
  };

  // Fetch samples from backend API
  const fetchSamples = async () => {
      try {
        console.log('Fetching samples from API...');
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('http://10.0.0.60:8000/samples/', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const backendSamples: BackendSample[] = await response.json();
        console.log('Backend samples received:', backendSamples);
        
        // Transform backend data to frontend format
        const transformedSamples: Sample[] = backendSamples.map((sample) => ({
          id: sample.id.toString(),
          audioUrl: sample.sample_url,
          artist: sample.name.split(' - ')[0] || 'Unknown Artist',
          songName: sample.name.split(' - ')[1] || sample.name,
          genre: sample.tags || 'Unknown Genre',
        }));
        
        console.log('Transformed samples:', transformedSamples);
        setSamples(transformedSamples);
      } catch (error) {
        console.error('Failed to fetch samples:', error);
        
        if (error.name === 'AbortError') {
          console.log('Request timed out after 10 seconds');
        }
        
        // Fallback to mock data if API fails
        const fallbackSamples = [
          {
            id: '1',
            audioUrl: require('../../assets/samples/audio/clairo_sofia.mp3'),
            artist: 'Clairo',
            songName: 'Sofia',
            genre: 'Indie Pop',
          },
        ];
        console.log('Using fallback samples:', fallbackSamples);
        setSamples(fallbackSamples);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleUploadSuccess = () => {
    console.log('Upload successful, refreshing samples...');
    fetchSamples();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setIsPlaying(true); // Auto-play new video when switching
      }
    }
  }).current;

  // Handle swipe gestures with animation
  const onGestureEvent = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      // During swipe, update animation based on translation
      if (translationX < 0) {
        // Swiping left - show saved samples preview
        const progress = Math.min(Math.abs(translationX) / width, 1);
        slideAnimation.setValue(-progress * width);
        savedSamplesOpacity.setValue(progress);
      }
    } else if (state === State.END) {
      // Swipe right (positive translationX) - Save sample
      if (translationX > 100) {
        const currentSample = samples[currentIndex];
        if (currentSample) {
          saveSample(currentSample);
        }
        // Reset animation
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(savedSamplesOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
      // Swipe left (negative translationX) - Show saved samples
      else if (translationX < -100) {
        // Complete the slide animation
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: -width,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(savedSamplesOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSavedSamples(true);
        });
      } else {
        // Reset animation if swipe wasn't far enough
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(savedSamplesOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }: { item: Sample; index: number }) => {
    // Cycle through video backgrounds based on index
    const videoIndex = index % videoBackgrounds.length;
    const videoBackground = videoBackgrounds[videoIndex];

    return (
      <View style={styles.videoContainer}>
               <VideoPlayer
                 videoUri={videoBackground}
                 audioUrl={item.audioUrl}
                 isActive={index === currentIndex}
                 isPlaying={index === currentIndex && isPlaying}
                 onPlayPause={setIsPlaying}
               pitchValue={pitchValue}
               reverbValue={reverbValue}
               speedValue={speedValue}
               />
      </View>
    );
  };

  console.log('MainScreen render - loading:', loading, 'samples:', samples.length, 'currentIndex:', currentIndex);

  // Show saved samples screen if toggled
  if (showSavedSamples) {
    return (
      <SavedSamplesScreen 
        onBack={() => {
          setShowSavedSamples(false);
          // Reset animations when going back
          slideAnimation.setValue(0);
          savedSamplesOpacity.setValue(0);
        }}
      />
    );
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onGestureEvent}
      activeOffsetX={[-10, 10]}
      failOffsetY={[-5, 5]}
      shouldCancelWhenOutside={true}
    >
      <View style={styles.container}>
        {/* Main Screen */}
        <Animated.View 
          style={[
            styles.screenContainer,
            {
              transform: [{ translateX: slideAnimation }]
            }
          ]}
        >
          <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  {/* Loading state - could add a spinner here */}
                </View>
              ) : samples.length > 0 ? (
                <View style={styles.gestureContainer}>
                  <FlatList
                    ref={flatListRef}
                    data={samples}
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
              ) : (
                <View style={styles.loadingContainer}>
                  {/* No samples available */}
                </View>
              )}
            </View>

                   {!loading && samples.length > 0 && (
                     <Footer
                       currentSample={samples[currentIndex]}
                       isPlaying={isPlaying}
                       onPlayPause={setIsPlaying}
           pitchValue={pitchValue}
           onPitchChange={setPitchValue}
           reverbValue={reverbValue}
           onReverbChange={setReverbValue}
           speedValue={speedValue}
           onSpeedChange={setSpeedValue}
           onUploadSuccess={handleUploadSuccess}
                     />
                   )}
          </SafeAreaView>
        </Animated.View>

        {/* Saved Samples Screen (animated overlay) */}
        <Animated.View 
          style={[
            styles.savedSamplesOverlay,
            {
              opacity: savedSamplesOpacity,
              transform: [{ translateX: Animated.add(slideAnimation, width) }]
            }
          ]}
        >
          <SavedSamplesScreen 
            onBack={() => {
              // Animate back to main screen
              Animated.parallel([
                Animated.timing(slideAnimation, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(savedSamplesOpacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
          />
        </Animated.View>
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  screenContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  savedSamplesOverlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  gestureContainer: {
    flex: 1,
  },
  videoContainer: {
    width,
    height,
    position: 'relative',
  },
});

export default MainScreen;

