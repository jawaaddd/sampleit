import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { AudioEffects, EchoPresets } from '../../utils/AudioEffects';
import AudioDataDisplay from '../AudioDataDisplay';
import { useRealAudioAnalysis } from '../../hooks/useRealAudioAnalysis';

interface VideoPlayerProps {
  videoUri: any; // Default background video
  audioUrl: string; // Audio from backend API
  isActive: boolean;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  pitchValue?: number; // Pitch adjustment in semitones
  reverbValue?: number; // Echo control (0-3: Off, Short, Medium, Long)
  speedValue?: number; // Speed control (0-4: 0.5x to 1.5x)
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  audioUrl,
  isActive,
  isPlaying,
  onPlayPause,
  pitchValue = 0,
  reverbValue = 0,
  speedValue = 2,
}) => {
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const reverbInstancesRef = useRef<any[]>([]);
  const audioEffects = useRef(AudioEffects.getInstance());
  
  // Real-time audio analysis
  const audioData = useRealAudioAnalysis(audioUrl, isPlaying, isActive);

  // Set up audio mode and load audio
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

        // Load the audio from backend
        if (audioUrl) {
          // Test if the URL is accessible first
          try {
            console.log('Testing audio URL accessibility:', audioUrl);
            const testResponse = await fetch(audioUrl, { 
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'audio/mpeg, audio/wav, audio/*',
                'Accept-Language': 'en-US,en;q=0.9',
              }
            });
            console.log('Audio URL test response:', testResponse.status);
            
            if (testResponse.ok) {
              console.log('Creating audio sound object...');
              const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: false, isLooping: true }
              );
              audioRef.current = sound;
              console.log('Audio sound object created successfully');
              
              // Auto-play if this is the active video and should be playing
              if (isActive && isPlaying) {
                console.log('Auto-playing audio after creation');
                await sound.playAsync();
              }
            } else {
              console.log('Audio URL not accessible, status:', testResponse.status);
            }
          } catch (fetchError) {
            console.log('Audio URL fetch test failed:', fetchError);
          }
        }
      } catch (error) {
        console.log('Failed to set up audio', error);
      }
    };
    setupAudio();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
      
      // Clean up echo instances when component unmounts or audio URL changes
      if (reverbInstancesRef.current.length > 0) {
        console.log('Audio URL change: cleaning up echo instances');
        audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
        audioEffects.current.unloadEchoEffect(reverbInstancesRef.current);
        reverbInstancesRef.current = [];
      }
    };
  }, [audioUrl]);

  // Handle play/pause for audio
  useEffect(() => {
    const handlePlayPause = async () => {
      // If echo is active, handle echo instances instead of main audio
      if (reverbInstancesRef.current.length > 0) {
        console.log('Echo play/pause - isPlaying:', isPlaying, 'isActive:', isActive);
        try {
          if (isPlaying && isActive) {
            console.log('Playing echo effect...');
            await audioEffects.current.playEchoEffect(reverbInstancesRef.current);
            console.log('Echo play command sent');
          } else {
            console.log('Pausing echo effect...');
            await audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
            console.log('Echo pause command sent');
          }
        } catch (playError) {
          console.log('Echo play/pause error:', playError);
        }
      } else if (audioRef.current) {
        // Normal audio play/pause when no echo is active
        console.log('Audio play/pause - isPlaying:', isPlaying, 'isActive:', isActive);
        try {
          if (isPlaying && isActive) {
            console.log('Playing audio...');
            await audioRef.current.playAsync();
            console.log('Audio play command sent');
          } else {
            console.log('Pausing audio...');
            await audioRef.current.pauseAsync();
            console.log('Audio pause command sent');
          }
        } catch (playError) {
          console.log('Audio play/pause error:', playError);
        }
      } else {
        console.log('No audio reference available - audio still loading');
      }
    };
    handlePlayPause();
  }, [isPlaying, isActive]);

  // Stop audio when video becomes inactive
  useEffect(() => {
    if (!isActive) {
      console.log('Video became inactive, stopping all audio');
      
      // Stop main audio if it exists
      if (audioRef.current) {
        audioRef.current.stopAsync();
      }
      
      // Stop and clean up echo instances
      if (reverbInstancesRef.current.length > 0) {
        console.log('Video became inactive, cleaning up echo instances');
        audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
        audioEffects.current.unloadEchoEffect(reverbInstancesRef.current);
        reverbInstancesRef.current = [];
      }
    } else if (isActive) {
      // Video became active - make sure no old echo instances are running
      if (reverbInstancesRef.current.length > 0) {
        console.log('Video became active, cleaning up any old echo instances');
        audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
        audioEffects.current.unloadEchoEffect(reverbInstancesRef.current);
        reverbInstancesRef.current = [];
      }
    }
  }, [isActive]);

  // Handle pitch changes (pitch-only effect using layered audio)
  useEffect(() => {
    const applyPitchChange = async () => {
      if (audioRef.current && isActive && audioUrl) {
        try {
          console.log(`VideoPlayer: Applying pitch change: ${pitchValue} semitones`);
          
          
          if (pitchValue === 0) {
            // Reset to normal
            try {
              await audioRef.current.setRateAsync(1.0, true);
              await audioRef.current.setVolumeAsync(1.0);
              console.log('VideoPlayer: Pitch reset to normal');
              return;
            } catch (error) {
              console.log('VideoPlayer: Pitch reset failed:', error);
            }
          }
          
          // Create pitch effect by replacing the original audio
          const pitchRatio = Math.pow(2, pitchValue / 12);
          
          try {
            // Stop and unload the original audio
            await audioRef.current.stopAsync();
            await audioRef.current.unloadAsync();
            
            // Create new audio instance with pitch-shifted rate
            const { sound: pitchSound } = await Audio.Sound.createAsync(
              { uri: audioUrl },
              { 
                shouldPlay: false,
                rate: pitchRatio,
                volume: 1.0,
                isLooping: false,
              }
            );
            
            // Replace the original audio reference
            audioRef.current = pitchSound;
            
            // Play the pitch-shifted audio if it should be playing
            if (isPlaying) {
              await pitchSound.playAsync();
            }
            
            console.log(`VideoPlayer: Pitch effect applied (ratio: ${pitchRatio.toFixed(3)})`);
            
          } catch (error) {
            console.log('VideoPlayer: Pitch effect creation failed:', error);
            
            // Fallback: reload original audio if pitch effect fails
            try {
              const { sound: fallbackSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { 
                  shouldPlay: false,
                  rate: 1.0,
                  volume: 1.0,
                  isLooping: false,
                }
              );
              audioRef.current = fallbackSound;
              console.log('VideoPlayer: Fallback audio reloaded');
            } catch (fallbackError) {
              console.log('VideoPlayer: Fallback audio reload failed:', fallbackError);
            }
          }
          
        } catch (error) {
          console.error('VideoPlayer: Error applying pitch change:', error);
        }
      } else {
        console.log(`VideoPlayer: Skipping pitch change - audioRef: ${!!audioRef.current}, isActive: ${isActive}`);
      }
    };
    
    applyPitchChange();
  }, [pitchValue, isActive, audioUrl]);

  // Handle echo changes
  useEffect(() => {
    const applyEchoChange = async () => {
      if (audioRef.current && isActive && audioUrl) {
        try {
          const echoTypes = ['Off', 'Short', 'Medium', 'Long'];
          console.log(`VideoPlayer: Applying echo change: ${echoTypes[reverbValue]} for video ${audioUrl}`);
          
          // Clean up existing echo instances
          if (reverbInstancesRef.current.length > 0) {
            console.log('Cleaning up existing echo instances before applying new echo');
            await audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
            await audioEffects.current.unloadEchoEffect(reverbInstancesRef.current);
            reverbInstancesRef.current = [];
          }
          
          // Apply echo effect if not off
          if (reverbValue > 0) {
            let echoSettings;
            
            switch (reverbValue) {
              case 1: // Short
                echoSettings = EchoPresets.SHORT;
                break;
              case 2: // Medium
                echoSettings = EchoPresets.MEDIUM;
                break;
              case 3: // Long
                echoSettings = EchoPresets.LONG;
                break;
              default:
                echoSettings = EchoPresets.OFF;
            }
            
            // Stop the original audio to prevent double playback
            if (audioRef.current) {
              console.log('Stopping original audio for echo effect');
              await audioRef.current.stopAsync();
            }
            
            // Create echo effect instances
            const echoInstances = await audioEffects.current.createEchoEffect(
              audioUrl, 
              echoSettings
            );
            
            reverbInstancesRef.current = echoInstances;
            
            console.log(`VideoPlayer: Echo effect created with ${echoInstances.length} instances`);
            
            // Play the echo effect if audio should be playing
            if (isPlaying) {
              console.log('Auto-playing echo effect');
              await audioEffects.current.playEchoEffect(echoInstances);
            }
          } else {
            // Echo turned off - make sure to stop and clean up any existing echo instances
            if (reverbInstancesRef.current.length > 0) {
              console.log('VideoPlayer: Stopping and cleaning up echo instances');
              await audioEffects.current.stopEchoEffect(reverbInstancesRef.current);
              await audioEffects.current.unloadEchoEffect(reverbInstancesRef.current);
              reverbInstancesRef.current = [];
            }
            console.log('VideoPlayer: Echo turned off');
          }
          
        } catch (error) {
          console.error('VideoPlayer: Error applying echo change:', error);
        }
      } else {
        console.log(`VideoPlayer: Skipping echo change - audioRef: ${!!audioRef.current}, isActive: ${isActive}`);
      }
    };
    
    applyEchoChange();
  }, [reverbValue, isActive, audioUrl]);

  // Handle speed changes (now using the limited rate approach for better control)
  useEffect(() => {
    const applySpeedChange = async () => {
      if (audioRef.current && isActive) {
        try {
          const speeds = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'];
          console.log(`VideoPlayer: Applying speed change: ${speeds[speedValue]}`);
          
          if (speedValue === 2) {
            // Reset to normal speed
            try {
              await audioRef.current.setRateAsync(1.0, true);
              await audioRef.current.setVolumeAsync(1.0);
              console.log('VideoPlayer: Speed reset to normal');
              return;
            } catch (error) {
              console.log('VideoPlayer: Speed reset failed:', error);
            }
          }
          
          // Calculate speed rate with limited range for better control
          let speedRate = 1.0;
          
          switch (speedValue) {
            case 0: // 0.5x (Half Speed)
              speedRate = 0.5;
              break;
            case 1: // 0.75x (Slow)
              speedRate = 0.75;
              break;
            case 2: // 1x (Normal)
              speedRate = 1.0;
              break;
            case 3: // 1.25x (Fast)
              speedRate = 1.25;
              break;
            case 4: // 1.5x (Double Speed)
              speedRate = 1.5;
              break;
          }
          
          // Limit the rate change to provide smoother speed control
          const limitedRate = Math.max(0.5, Math.min(1.5, speedRate));
          
          console.log(`VideoPlayer: Speed rate: ${speedRate}, limited rate: ${limitedRate.toFixed(3)}`);
          
          try {
            // Apply speed change with limited range
            await audioRef.current.setRateAsync(limitedRate, true);
            
            // Adjust volume slightly to compensate for speed change
            const volumeAdjustment = 1.0 - (Math.abs(speedValue - 2) * 0.05); // Slight volume reduction for extreme speeds
            const finalVolume = Math.max(0.7, Math.min(1.0, volumeAdjustment));
            await audioRef.current.setVolumeAsync(finalVolume);
            
            console.log(`VideoPlayer: Speed applied (rate: ${limitedRate.toFixed(3)}, volume: ${finalVolume.toFixed(3)})`);
            
          } catch (error) {
            console.log('VideoPlayer: Speed adjustment failed:', error);
          }
          
        } catch (error) {
          console.error('VideoPlayer: Error applying speed change:', error);
        }
      } else {
        console.log(`VideoPlayer: Skipping speed change - audioRef: ${!!audioRef.current}, isActive: ${isActive}`);
      }
    };
    
    applySpeedChange();
  }, [speedValue, isActive]);

  const handlePress = () => {
    onPlayPause(!isPlaying);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={1}>
      <Video
        ref={videoRef}
        source={videoUri}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={true}
        volume={0.0}
        rate={1.0}
        isMuted={true}
      />
      
      {/* Real-time Audio Data Display */}
      <AudioDataDisplay
        audioData={audioData}
        isPlaying={isPlaying}
        isActive={isActive}
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

