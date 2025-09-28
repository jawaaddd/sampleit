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

// Footer Component - matches Figma structure: footer → details, Buttons
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
    <View style={styles.footer}>
      {/* Details Section - matches Figma details structure */}
      <View style={styles.details}>
        <View style={styles.textIconGroup}>
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
        <View style={styles.detailsBackground} />
      </View>

      {/* Buttons Section - matches Figma Buttons structure */}
      <View style={styles.buttons}>
        {/* Button Row 1 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bShare]}
            onPress={() => handleControlPress('share')}
          >
            <Icon name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bChop]}
            onPress={() => handleControlPress('chop')}
          >
            <Icon name="cut-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bCloud]}
            onPress={() => handleControlPress('upload')}
          >
            <Icon name="cloud-upload-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Button Row 2 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bUp]}
            onPress={() => handleControlPress('pitch')}
          >
            <Icon name="trending-up-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bClock]}
            onPress={() => handleControlPress('timer')}
          >
            <Icon name="time-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bVol]}
            onPress={() => handleControlPress('volume')}
          >
            <Icon name="volume-high-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonsBackground} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  
  // Details Section Styles
  details: {
    marginBottom: 20,
  },
  textIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  detailsBackground: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 8,
  },
  
  // Buttons Section Styles
  buttons: {
    marginHorizontal: -20, // Extend beyond footer padding
    paddingHorizontal: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: 60,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  
  // Individual Button Styles (matching Figma naming)
  bShare: {
    // Share button specific styles
  },
  bChop: {
    // Chop button specific styles
  },
  bCloud: {
    // Cloud/Upload button specific styles
  },
  bUp: {
    // Pitch/Up button specific styles
  },
  bClock: {
    // Timer/Clock button specific styles
  },
  bVol: {
    // Volume button specific styles
  },
  
  buttonsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    zIndex: -1,
  },
});

export default Footer;

