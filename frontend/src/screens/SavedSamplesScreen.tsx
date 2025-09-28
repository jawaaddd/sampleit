import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// API Response Types
interface SavedSampleResponse {
  sample_id: string;
  user_id: string;
  save_date: string;
}

interface SampleDetailResponse {
  id: string;
  name: string;
  sample_url: string;
  ext: string;
  music_key: string | null;
  bpm: number | null;
  tags: string[];
}

interface SavedSampleWithDetails {
  sample_id: string;
  user_id: string;
  save_date: string;
  name: string;
  sample_url: string;
  ext: string;
  music_key: string | null;
  bpm: number | null;
  tags: string[];
}

interface SavedSamplesScreenProps {
  onBack: () => void;
}

const SavedSamplesScreen: React.FC<SavedSamplesScreenProps> = ({ onBack }) => {
  const [savedSamples, setSavedSamples] = useState<SavedSampleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<Audio.Sound | null>(null);
  
  // Animation for swipe back
  const swipeBackAnimation = useRef(new Animated.Value(0)).current;

  // Set up audio mode
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log('Failed to set up audio mode:', error);
      }
    };
    setupAudio();

    // Cleanup audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  // Fetch saved samples and their details
  useEffect(() => {
    const fetchSavedSamples = async () => {
      try {
        console.log('Fetching saved samples...');
        
        // First, get the list of saved sample IDs
        const savedResponse = await fetch('http://10.0.0.60:8000/user/saves/?user_id=1');
        if (!savedResponse.ok) {
          throw new Error(`HTTP error! status: ${savedResponse.status}`);
        }
        
        const savedSamplesList: SavedSampleResponse[] = await savedResponse.json();
        console.log('Saved samples list:', savedSamplesList);

        // Then, fetch details for each saved sample
        const samplesWithDetails: SavedSampleWithDetails[] = [];
        
        for (const savedSample of savedSamplesList) {
          try {
            const detailResponse = await fetch(`http://10.0.0.60:8000/samples/${savedSample.sample_id}`);
            if (detailResponse.ok) {
              const sampleDetails: SampleDetailResponse = await detailResponse.json();
              samplesWithDetails.push({
                ...savedSample,
                ...sampleDetails,
              });
            }
          } catch (error) {
            console.log(`Failed to fetch details for sample ${savedSample.sample_id}:`, error);
          }
        }

        console.log('Samples with details:', samplesWithDetails);
        setSavedSamples(samplesWithDetails);
      } catch (error) {
        console.error('Failed to fetch saved samples:', error);
        Alert.alert('Error', 'Failed to load saved samples');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSamples();
  }, []);

  const formatSampleName = (name: string) => {
    // Extract artist and song from filename like "The Japanese House - Over There [dDlvR43LbpA].mp3"
    const withoutExt = name.replace(/\.[^/.]+$/, ''); // Remove file extension
    const withoutBrackets = withoutExt.replace(/\[.*?\]/g, ''); // Remove [dDlvR43LbpA] part
    const parts = withoutBrackets.split(' - ');
    
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        song: parts[1].trim(),
      };
    }
    
    return {
      artist: 'Unknown Artist',
      song: withoutBrackets.trim(),
    };
  };

  // Handle swipe back gesture
  const onSwipeBackGesture = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      // During swipe right, update animation
      if (translationX > 0) {
        const progress = Math.min(translationX / width, 1);
        swipeBackAnimation.setValue(progress * width);
      }
    } else if (state === State.END) {
      // Swipe right (positive translationX) - Go back
      if (translationX > 100) {
        // Complete the swipe back animation
        Animated.timing(swipeBackAnimation, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onBack();
        });
      } else {
        // Reset animation if swipe wasn't far enough
        Animated.timing(swipeBackAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // Play/pause audio
  const togglePlayback = async (sample: SavedSampleWithDetails) => {
    try {
      // If this sample is already playing, pause it
      if (currentlyPlaying === sample.sample_id && isPlaying) {
        if (audioRef.current) {
          await audioRef.current.pauseAsync();
          setIsPlaying(false);
        }
        return;
      }

      // If a different sample is playing, stop it first
      if (audioRef.current && currentlyPlaying !== sample.sample_id) {
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }

      // If this sample is paused, resume it
      if (currentlyPlaying === sample.sample_id && !isPlaying) {
        if (audioRef.current) {
          await audioRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Load and play new sample
      console.log('Loading audio:', sample.sample_url);
      const { sound } = await Audio.Sound.createAsync(
        { uri: sample.sample_url },
        { shouldPlay: true, isLooping: true }
      );
      
      audioRef.current = sound;
      setCurrentlyPlaying(sample.sample_id);
      setIsPlaying(true);
      
      console.log('Audio started playing');
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const renderSampleItem = ({ item }: { item: SavedSampleWithDetails }) => {
    const { artist, song } = formatSampleName(item.name);
    const isCurrentlyPlaying = currentlyPlaying === item.sample_id;
    const isThisPlaying = isCurrentlyPlaying && isPlaying;
    
    return (
      <TouchableOpacity style={styles.sampleItem} onPress={() => togglePlayback(item)}>
        <View style={styles.thumbnail}>
          <Icon name="musical-notes" size={24} color="#666" />
        </View>
        <View style={styles.sampleInfo}>
          <Text style={styles.songName}>{song}</Text>
          <Text style={styles.artistName}>{artist}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.playButton, isCurrentlyPlaying && styles.playingButton]} 
          onPress={() => togglePlayback(item)}
        >
          <Icon 
            name={isThisPlaying ? "pause" : "play"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <PanGestureHandler
      onGestureEvent={onSwipeBackGesture}
      onHandlerStateChange={onSwipeBackGesture}
      activeOffsetX={[-1000, 10]}
      failOffsetY={[-5, 5]}
      shouldCancelWhenOutside={true}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateX: swipeBackAnimation }]
          }
        ]}
      >
        <SafeAreaView style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={styles.searchPlaceholder}>Search here...</Text>
              <Icon name="search-outline" size={20} color="#666" />
            </View>
          </View>

          {/* Saved Samples List */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading saved samples...</Text>
              </View>
            ) : savedSamples.length > 0 ? (
              <FlatList
                data={savedSamples}
                renderItem={renderSampleItem}
                keyExtractor={(item) => item.sample_id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="heart-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>No saved samples yet</Text>
                <Text style={styles.emptySubtext}>Swipe right on samples to save them</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 60, // Add top margin to account for header
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  thumbnail: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sampleInfo: {
    flex: 1,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  artistName: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
    textDecorationLine: 'underline',
  },
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SavedSamplesScreen;
