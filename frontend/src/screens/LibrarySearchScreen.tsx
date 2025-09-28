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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// API Response Types
interface BackendSample {
  id: number;
  name: string;
  sample_url: string;
  tags: string | string[];
}

interface Sample {
  id: string;
  audioUrl: string;
  artist: string;
  songName: string;
  genre: string;
}

interface LibrarySearchScreenProps {
  onBack: () => void;
  initialSearchQuery?: string;
}

const LibrarySearchScreen: React.FC<LibrarySearchScreenProps> = ({ onBack, initialSearchQuery = '' }) => {
  const [allSamples, setAllSamples] = useState<Sample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<Audio.Sound | null>(null);
  
  // Animation for swipe back
  const swipeBackAnimation = useRef(new Animated.Value(0)).current;

  // Format sample name to extract artist and song
  const formatSampleName = (name: string) => {
    // Remove file extension
    const withoutExt = name.replace(/\.[^/.]+$/, '');
    
    // Try different formats:
    // 1. artist_songname.mp3 format
    if (withoutExt.includes('_')) {
      const parts = withoutExt.split('_');
      if (parts.length >= 2) {
        // Join all parts except the last one as artist, last part as song
        const artist = parts.slice(0, -1).join('_').replace(/_/g, ' ');
        const song = parts[parts.length - 1].replace(/_/g, ' ');
        return {
          artist: artist.trim(),
          song: song.trim(),
        };
      }
    }
    
    // 2. artist - song format (original format)
    if (withoutExt.includes(' - ')) {
      const withoutBrackets = withoutExt.replace(/\[.*?\]/g, ''); // Remove [dDlvR43LbpA] part
      const parts = withoutBrackets.split(' - ');
      
      if (parts.length >= 2) {
        return {
          artist: parts[0].trim(),
          song: parts[1].trim(),
        };
      }
    }
    
    // 3. Fallback: treat entire name as song
    return {
      artist: 'Unknown Artist',
      song: withoutExt.replace(/_/g, ' ').trim(),
    };
  };

  // Update search query when initialSearchQuery prop changes
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

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

  // Fetch all samples from the library
  useEffect(() => {
    const fetchAllSamples = async () => {
      try {
        console.log('Fetching all samples from library...');
        
        const response = await fetch('http://35.0.131.210:8000/samples/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const backendSamples: BackendSample[] = await response.json();
        console.log('Backend samples received:', backendSamples);
        
        // Transform backend data to frontend format
        const transformedSamples: Sample[] = backendSamples.map((sample) => {
          const { artist, song } = formatSampleName(sample.name);
          
          // Handle tags - could be string or array
          let genre = 'Unknown Genre';
          if (sample.tags) {
            if (Array.isArray(sample.tags)) {
              genre = sample.tags.join(', ');
            } else if (typeof sample.tags === 'string') {
              genre = sample.tags;
            }
          }
          
          return {
            id: sample.id.toString(),
            audioUrl: sample.sample_url,
            artist: artist,
            songName: song,
            genre: genre,
          };
        });
        
        console.log('Transformed samples:', transformedSamples);
        setAllSamples(transformedSamples);
        setFilteredSamples(transformedSamples); // Initialize filtered samples
      } catch (error) {
        console.error('Failed to fetch samples:', error);
        Alert.alert('Error', 'Failed to load library samples');
      } finally {
        setLoading(false);
      }
    };

    fetchAllSamples();
  }, []);

  // Filter samples based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSamples(allSamples);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allSamples.filter(sample => {
      // Search in song name
      const songMatch = sample.songName.toLowerCase().includes(query);
      
      // Search in artist name
      const artistMatch = sample.artist.toLowerCase().includes(query);
      
      // Search in genre/tags
      const genreMatch = sample.genre && sample.genre.toLowerCase().includes(query);
      
      return songMatch || artistMatch || genreMatch;
    });
    
    setFilteredSamples(filtered);
  }, [searchQuery, allSamples]);

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
  const togglePlayback = async (sample: Sample) => {
    try {
      // If this sample is already playing, pause it
      if (currentlyPlaying === sample.id && isPlaying) {
        if (audioRef.current) {
          await audioRef.current.pauseAsync();
          setIsPlaying(false);
        }
        return;
      }

      // If a different sample is playing, stop it first
      if (audioRef.current && currentlyPlaying !== sample.id) {
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }

      // If this sample is paused, resume it
      if (currentlyPlaying === sample.id && !isPlaying) {
        if (audioRef.current) {
          await audioRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Load and play new sample
      console.log('Loading audio:', sample.audioUrl);
      const { sound } = await Audio.Sound.createAsync(
        { uri: sample.audioUrl },
        { shouldPlay: true, isLooping: true }
      );
      
      audioRef.current = sound;
      setCurrentlyPlaying(sample.id);
      setIsPlaying(true);
      
      console.log('Audio started playing');
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const renderSampleItem = ({ item }: { item: Sample }) => {
    const isCurrentlyPlaying = currentlyPlaying === item.id;
    const isThisPlaying = isCurrentlyPlaying && isPlaying;
    
    return (
      <TouchableOpacity style={styles.sampleItem} onPress={() => togglePlayback(item)}>
        <View style={styles.thumbnail}>
          <Icon name="musical-notes" size={24} color="#666" />
        </View>
        <View style={styles.sampleInfo}>
          <Text style={styles.songName}>{item.songName}</Text>
          <Text style={styles.artistName}>{item.artist}</Text>
          <Text style={styles.genreText}>{item.genre || 'Unknown Genre'}</Text>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Library Search</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search entire library..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                autoFocus={true}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <Icon name="search-outline" size={20} color="#666" />
              )}
            </View>
          </View>

          {/* Results Count */}
          {!loading && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {searchQuery ? `${filteredSamples.length} results` : `${allSamples.length} total songs`}
              </Text>
            </View>
          )}

          {/* Library Samples List */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading library...</Text>
              </View>
            ) : filteredSamples.length > 0 ? (
              <FlatList
                data={filteredSamples}
                renderItem={renderSampleItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name={searchQuery ? "search-outline" : "musical-notes-outline"} size={48} color="#666" />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No results found" : "Library is empty"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery 
                    ? `No songs match "${searchQuery}"` 
                    : "No songs available in the library"
                  }
                </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
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
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 0,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  resultsText: {
    color: '#666',
    fontSize: 14,
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
    marginBottom: 2,
  },
  genreText: {
    color: '#666',
    fontSize: 12,
    opacity: 0.8,
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

export default LibrarySearchScreen;
