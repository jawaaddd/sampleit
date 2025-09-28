import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Video, Audio } from 'expo-av';

interface VideoPlayerProps {
  videoUri: any; // Changed to any to handle require() objects
  isActive: boolean;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  isActive,
  isPlaying,
  onPlayPause,
}) => {
  const videoRef = useRef<Video>(null);

  // Set up audio mode for video playback
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
        console.log('Failed to set audio mode', error);
      }
    };
    setupAudio();
  }, []);

  const handlePress = () => {
    onPlayPause(!isPlaying);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={1}>
      <Video
        ref={videoRef}
        source={videoUri}
        style={styles.video}
        resizeMode="cover"
        isLooping
        shouldPlay={isPlaying}
        volume={1.0}
        rate={1.0}
        muted={false}
      />
      
      {/* Play/Pause overlay */}
      {!isPlaying && (
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 0,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: '#000',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
});

export default VideoPlayer;

