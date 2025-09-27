import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Sample {
  id: string;
  artist: string;
  songName: string;
  genre: string;
}

interface FooterProps {
  currentSample: Sample;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
}

const Footer: React.FC<FooterProps> = ({ currentSample, isPlaying, onPlayPause }) => {
  const handleInfoPress = () => {
    // TODO: Implement info modal
    console.log('Info pressed for:', currentSample);
  };

  const handleControlPress = (action: string) => {
    console.log(`${action} pressed`);
    // TODO: Implement producer controls
  };

  return (
    <View style={styles.container}>
      {/* Song Information */}
      <View style={styles.songInfo}>
        <TouchableOpacity onPress={() => console.log('Artist pressed')}>
          <Text style={styles.artistText}>{currentSample.artist}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log('Song pressed')}>
          <Text style={styles.songText}>{currentSample.songName}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
          <Icon name="information-circle-outline" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Producer Controls */}
      <View style={styles.controlsContainer}>
        {/* Top Row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('upload')}
          >
            <Icon name="cloud-upload-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('chop')}
          >
            <Icon name="cut-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('share')}
          >
            <Icon name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('volume')}
          >
            <Icon name="volume-high-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('timer')}
          >
            <Icon name="time-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleControlPress('pitch')}
          >
            <Icon name="trending-up-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scroll Indicator */}
      <View style={styles.scrollIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  artistText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginRight: 8,
  },
  songText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginRight: 8,
  },
  infoButton: {
    padding: 4,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  scrollIndicator: {
    width: 30,
    height: 2,
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginTop: 10,
    opacity: 0.6,
  },
});

export default Footer;

