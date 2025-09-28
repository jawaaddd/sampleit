import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [pitchValue, setPitchValue] = useState(0);
  const [volumeValue, setVolumeValue] = useState(50);
  const [timerValue, setTimerValue] = useState(0);

  const handleInfoPress = () => {
    // TODO: Implement info modal
    console.log('Info pressed for:', currentSample);
  };

  const handleControlPress = (action: string) => {
    console.log(`${action} pressed`);
    setModalType(action);
    setModalVisible(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'pitch': return 'Pitch Shift';
      case 'volume': return 'Volume Control';
      case 'timer': return 'Timer';
      case 'chop': return 'Sample Chopper';
      case 'upload': return 'Upload Sample';
      case 'share': return 'Share';
      default: return 'Control';
    }
  };

  const getModalIcon = () => {
    switch (modalType) {
      case 'pitch': return 'trending-up-outline';
      case 'volume': return 'volume-high-outline';
      case 'timer': return 'time-outline';
      case 'chop': return 'cut-outline';
      case 'upload': return 'cloud-upload-outline';
      case 'share': return 'share-outline';
      default: return 'settings-outline';
    }
  };

  return (
    <>
    <LinearGradient
      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
      style={styles.footer}
    >
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
            <Icon name="information-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.detailsBackground} />
      </View>

      {/* Buttons Section - matches Figma Buttons structure */}
      <View style={styles.buttons}>
        {/* Button Row 1 */}
        <View style={[styles.buttonRow, { opacity: modalVisible ? 0 : 1 }]}>
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bChop]}
            onPress={() => handleControlPress('chop')}
          >
            <Icon name="cut-outline" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bCloud]}
            onPress={() => handleControlPress('upload')}
          >
            <Icon name="cloud-upload-outline" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bShare]}
            onPress={() => handleControlPress('share')}
          >
            <Icon name="share-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Button Row 2 */}
        <View style={[styles.buttonRow, { opacity: modalVisible ? 0 : 1 }]}>
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bUp]}
            onPress={() => handleControlPress('pitch')}
          >
            <Icon name="trending-up-outline" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bClock]}
            onPress={() => handleControlPress('timer')}
          >
            <Icon name="time-outline" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bVol]}
            onPress={() => handleControlPress('volume')}
          >
            <Icon name="volume-high-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonsBackground} />
      </View>
    </LinearGradient>

    {/* Pitch Shift Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View 
        style={styles.modalOverlay}
        onTouchEnd={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <View style={styles.modalIcon}>
              <Icon name={getModalIcon()} size={24} color="#fff" />
            </View>
          </View>
          
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderProgress, { 
                width: modalType === 'pitch' 
                  ? `${((pitchValue + 12) / 24) * 100}%`
                  : modalType === 'volume'
                  ? `${volumeValue}%`
                  : modalType === 'timer'
                  ? `${(timerValue / 60) * 100}%`
                  : '50%'
              }]} />
              <TouchableOpacity 
                style={[styles.sliderThumb, { 
                  left: modalType === 'pitch' 
                    ? `${((pitchValue + 12) / 24) * 100}%`
                    : modalType === 'volume'
                    ? `${volumeValue}%`
                    : modalType === 'timer'
                    ? `${(timerValue / 60) * 100}%`
                    : '50%'
                }]}
                onPress={() => {
                  if (modalType === 'pitch') setPitchValue(0);
                  if (modalType === 'volume') setVolumeValue(50);
                  if (modalType === 'timer') setTimerValue(0);
                }}
              />
            </View>
            <View style={styles.sliderIndicator} />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
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
    fontSize: 20,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginRight: 8,
  },
  songText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
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
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: 80,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
    maxWidth: 100,
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
    backgroundColor: 'transparent',
    borderRadius: 12,
    zIndex: -1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    paddingBottom: 40,
    minHeight: 200,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sliderContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#34495E',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 20,
  },
  sliderProgress: {
    height: 6,
    backgroundColor: '#9B59B6',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 20,
    height: 20,
    backgroundColor: '#9B59B6',
    borderRadius: 10,
    marginLeft: -10,
  },
  sliderIndicator: {
    position: 'absolute',
    left: '50%',
    top: 10,
    width: 4,
    height: 20,
    backgroundColor: '#9B59B6',
    borderRadius: 2,
    marginLeft: -2,
  },
  modalIcon: {
    padding: 8,
  },
});

export default Footer;

