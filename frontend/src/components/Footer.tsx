import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/Ionicons';
import SpeechBubble from './SpeechBubble';
import FileUploadModal from './FileUploadModal';

const { width: screenWidth } = Dimensions.get('window');

interface Sample {
  id: string;
  artist: string;
  songName: string;
  genre: string;
  audioUrl: string;
}

interface FooterProps {
  currentSample: Sample;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  pitchValue?: number;
  onPitchChange?: (pitch: number) => void;
  reverbValue?: number;
  onReverbChange?: (reverb: number) => void;
  speedValue?: number;
  onSpeedChange?: (speed: number) => void;
  onUploadSuccess?: () => void;
}

// Footer Component - matches Figma structure: footer → details, Buttons
const Footer: React.FC<FooterProps> = ({ currentSample, isPlaying, onPlayPause, pitchValue = 0, onPitchChange, reverbValue = 0, onReverbChange, speedValue = 2, onSpeedChange, onUploadSuccess }) => {
  console.log('Footer: Current pitchValue:', pitchValue);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [volumeValue, setVolumeValue] = useState(50);
  const [timerValue, setTimerValue] = useState(0);
  const [infoPopupVisible, setInfoPopupVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const handleInfoPress = () => {
    setInfoPopupVisible(!infoPopupVisible);
  };

  const handleControlPress = (action: string) => {
    console.log(`${action} pressed`);
    setModalType(action);
    setModalVisible(true);
  };

  const downloadMP3 = async () => {
    try {
      // Get the audio URL from the current sample
      const audioUrl = currentSample.audioUrl;
      const fileName = `${currentSample.artist} - ${currentSample.songName}.mp3`;
      
      console.log('Downloading:', audioUrl);
      console.log('Filename:', fileName);

      // Show loading alert
      Alert.alert('Downloading', 'Please wait while the file downloads...');

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(
        audioUrl,
        FileSystem.documentDirectory + fileName
      );

      console.log('Download completed:', downloadResult.uri);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Share the downloaded file
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'audio/mpeg',
          dialogTitle: 'Share Sample',
        });
        
        Alert.alert('Success', 'File downloaded and ready to share!');
      } else {
        Alert.alert('Success', `File downloaded to: ${downloadResult.uri}`);
      }

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download the file. Please try again.');
    }
  };

  const shareSample = async () => {
    try {
      // Create a fake shareable link
      const shareLink = `www.sampleit.com/sample/${currentSample.id}`;
      const shareText = `Check out this sample: ${currentSample.artist} - ${currentSample.songName}\n\n${shareLink}`;
      
      console.log('Sharing:', shareText);

      // Copy to clipboard
      await Clipboard.setStringAsync(shareText);
      
      // Show success message
      Alert.alert(
        'Link Copied!', 
        'The sample link has been copied to your clipboard. You can now paste it anywhere!',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );

    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to copy the link. Please try again.');
    }
  };

  const adjustPitch = async (newPitchValue: number) => {
    try {
      console.log('Adjusting pitch to:', newPitchValue);
      
      // Convert pitch value to rate (range 0.5 to 2.0)
      // -12 semitones = 0.5 rate, 0 semitones = 1.0 rate, +12 semitones = 2.0 rate
      const rate = Math.pow(2, newPitchValue / 12);
      
      // Notify parent component of pitch change
      if (onPitchChange) {
        onPitchChange(newPitchValue);
      }
      
      console.log(`Pitch adjusted: ${newPitchValue} semitones (rate: ${rate.toFixed(2)})`);
      
      // No alert to avoid modal closing - pitch changes are applied in real-time
      
    } catch (error) {
      console.error('Pitch adjustment error:', error);
      // No alert to avoid modal closing
    }
  };

  const handleSliderGesture = (event: any) => {
    if (modalType === 'pitch') {
      const { translationX, state } = event.nativeEvent;
      
      if (state === State.ACTIVE || state === State.END) {
        // Simple approach: map translationX directly to pitch value
        // Each 50 pixels of translation = 1 semitone
        const pixelsPerSemitone = 50;
        const semitoneChange = Math.round(translationX / pixelsPerSemitone);
        const newPitchValue = Math.max(-12, Math.min(12, pitchValue + semitoneChange));
        
        console.log(`Gesture: translationX=${translationX}, semitoneChange=${semitoneChange}, newPitchValue=${newPitchValue}`);
        
        // Update pitch value via callback (real-time feedback)
        if (onPitchChange) {
          onPitchChange(newPitchValue);
        }
      }
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'pitch': return 'Pitch Shift';
      case 'volume': return 'Volume Control';
      case 'timer': return 'Timer';
      case 'chop': return 'Sample Chopper';
      case 'cloud': return 'Upload Sample';
      case 'upload': return 'Download & Share';
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
      case 'cloud': return 'cloud-upload-outline';
      case 'upload': return 'share-outline';
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
        
        {/* Speech Bubble Info Popup */}
        <SpeechBubble 
          visible={infoPopupVisible} 
          text={currentSample.genre} 
        />
        
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
                   onPress={() => handleControlPress('cloud')}
                 >
                   <Icon name="cloud-upload-outline" size={28} color="#fff" />
                 </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.buttonContainer, styles.bShare]}
            onPress={() => handleControlPress('upload')}
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
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setModalVisible(false)}
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
          
                 {modalType === 'upload' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <TouchableOpacity 
                       style={styles.uploadOptionButton}
                       onPress={downloadMP3}
                     >
                       <Icon name="download-outline" size={24} color="#fff" />
                       <Text style={styles.uploadOptionText}>Download</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                       style={styles.uploadOptionButton}
                       onPress={shareSample}
                     >
                       <Icon name="share-outline" size={24} color="#fff" />
                       <Text style={styles.uploadOptionText}>Share</Text>
                     </TouchableOpacity>
                   </View>
                 ) : modalType === 'pitch' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <View style={styles.pitchControls}>
                       <Text style={styles.pitchDisplay}>
                         Pitch: {pitchValue} semitones
                       </Text>
                       
                       <View style={styles.pitchButtonsRow}>
                         <TouchableOpacity 
                           style={styles.pitchButton}
                           onPress={() => {
                             const newPitch = Math.max(-12, pitchValue - 1);
                             console.log(`Pitch down: ${pitchValue} -> ${newPitch}`);
                             if (onPitchChange) onPitchChange(newPitch);
                           }}
                         >
                           <Icon name="remove" size={20} color="#fff" />
                           <Text style={styles.pitchButtonText}>-1</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={styles.pitchButton}
                           onPress={() => {
                             const newPitch = Math.max(-12, pitchValue - 2);
                             console.log(`Pitch down 2: ${pitchValue} -> ${newPitch}`);
                             if (onPitchChange) onPitchChange(newPitch);
                           }}
                         >
                           <Icon name="remove" size={20} color="#fff" />
                           <Text style={styles.pitchButtonText}>-2</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, styles.resetPitchButton]}
                           onPress={() => {
                             console.log('Reset pitch to 0');
                             if (onPitchChange) onPitchChange(0);
                           }}
                         >
                           <Icon name="refresh" size={20} color="#fff" />
                           <Text style={styles.pitchButtonText}>Reset</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={styles.pitchButton}
                           onPress={() => {
                             const newPitch = Math.min(12, pitchValue + 1);
                             console.log(`Pitch up: ${pitchValue} -> ${newPitch}`);
                             if (onPitchChange) onPitchChange(newPitch);
                           }}
                         >
                           <Icon name="add" size={20} color="#fff" />
                           <Text style={styles.pitchButtonText}>+1</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={styles.pitchButton}
                           onPress={() => {
                             const newPitch = Math.min(12, pitchValue + 2);
                             console.log(`Pitch up 2: ${pitchValue} -> ${newPitch}`);
                             if (onPitchChange) onPitchChange(newPitch);
                           }}
                         >
                           <Icon name="add" size={20} color="#fff" />
                           <Text style={styles.pitchButtonText}>+2</Text>
                         </TouchableOpacity>
                       </View>
                       
                       <View style={styles.pitchPresets}>
                         <TouchableOpacity 
                           style={styles.presetButton}
                           onPress={() => {
                             console.log('Set pitch to -12 (octave down)');
                             if (onPitchChange) onPitchChange(-12);
                           }}
                         >
                           <Text style={styles.presetButtonText}>-12 (Octave Down)</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={styles.presetButton}
                           onPress={() => {
                             console.log('Set pitch to +12 (octave up)');
                             if (onPitchChange) onPitchChange(12);
                           }}
                         >
                           <Text style={styles.presetButtonText}>+12 (Octave Up)</Text>
                         </TouchableOpacity>
                       </View>
                     </View>
                   </View>
                 ) : modalType === 'volume' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <View style={styles.pitchControls}>
                       <Text style={styles.pitchDisplay}>
                         Reverb: {reverbValue === 0 ? 'Off' : reverbValue === 1 ? 'Room' : reverbValue === 2 ? 'Hall' : 'Cathedral'}
                       </Text>
                       
                       <View style={styles.pitchButtonsRow}>
                         <TouchableOpacity 
                           style={[styles.pitchButton, reverbValue === 0 && styles.activeButton]}
                           onPress={() => {
                             console.log('Reverb: Off');
                             if (onReverbChange) onReverbChange(0);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>Off</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, reverbValue === 1 && styles.activeButton]}
                           onPress={() => {
                             console.log('Reverb: Room');
                             if (onReverbChange) onReverbChange(1);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>Room</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, reverbValue === 2 && styles.activeButton]}
                           onPress={() => {
                             console.log('Reverb: Hall');
                             if (onReverbChange) onReverbChange(2);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>Hall</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, reverbValue === 3 && styles.activeButton]}
                           onPress={() => {
                             console.log('Reverb: Cathedral');
                             if (onReverbChange) onReverbChange(3);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>Cathedral</Text>
                         </TouchableOpacity>
                       </View>
                     </View>
                   </View>
                 ) : modalType === 'timer' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <View style={styles.pitchControls}>
                       <Text style={styles.pitchDisplay}>
                         Speed: {speedValue === 0 ? '0.5x' : speedValue === 1 ? '0.75x' : speedValue === 2 ? '1x' : speedValue === 3 ? '1.25x' : '1.5x'}
                       </Text>
                       
                       <View style={styles.pitchButtonsRow}>
                         <TouchableOpacity 
                           style={[styles.pitchButton, speedValue === 0 && styles.activeButton]}
                           onPress={() => {
                             console.log('Speed: 0.5x (Half Speed)');
                             if (onSpeedChange) onSpeedChange(0);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>0.5x</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, speedValue === 1 && styles.activeButton]}
                           onPress={() => {
                             console.log('Speed: 0.75x (Slow)');
                             if (onSpeedChange) onSpeedChange(1);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>0.75x</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, speedValue === 2 && styles.activeButton]}
                           onPress={() => {
                             console.log('Speed: 1x (Normal)');
                             if (onSpeedChange) onSpeedChange(2);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>1x</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, speedValue === 3 && styles.activeButton]}
                           onPress={() => {
                             console.log('Speed: 1.25x (Fast)');
                             if (onSpeedChange) onSpeedChange(3);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>1.25x</Text>
                         </TouchableOpacity>
                         
                         <TouchableOpacity 
                           style={[styles.pitchButton, speedValue === 4 && styles.activeButton]}
                           onPress={() => {
                             console.log('Speed: 1.5x (Double Speed)');
                             if (onSpeedChange) onSpeedChange(4);
                           }}
                         >
                           <Text style={styles.pitchButtonText}>1.5x</Text>
                         </TouchableOpacity>
                       </View>
                     </View>
                   </View>
                 ) : modalType === 'chop' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <TouchableOpacity 
                       style={styles.uploadOptionButton}
                       onPress={() => Alert.alert('Coming Soon', 'Sample chopping feature will be available soon!')}
                     >
                       <Icon name="cut-outline" size={24} color="#fff" />
                       <Text style={styles.uploadOptionText}>Chop Sample</Text>
                     </TouchableOpacity>
                   </View>
                 ) : modalType === 'cloud' ? (
                   <View style={styles.uploadOptionsContainer}>
                     <TouchableOpacity 
                       style={styles.uploadOptionButton}
                       onPress={() => setUploadModalVisible(true)}
                     >
                       <Icon name="cloud-upload-outline" size={24} color="#fff" />
                       <Text style={styles.uploadOptionText}>Upload MP3</Text>
                     </TouchableOpacity>
                   </View>
                 ) : null}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>

    <FileUploadModal
      visible={uploadModalVisible}
      onClose={() => setUploadModalVisible(false)}
      onUploadSuccess={() => {
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }}
    />
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
    paddingBottom: 40, // Reduced padding to bring modal down
  },
         modalContent: {
           backgroundColor: 'rgba(255, 255, 255, 0.2)',
           borderRadius: 20,
           padding: 15,
           paddingBottom: 20,
           height: 180, // Made modal a bit taller
           marginBottom: 0, // Bring modal right up to footer
           marginHorizontal: '5%', // Makes modal 10% less wide (5% margin on each side)
         },
         modalHeader: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
           marginBottom: 10,
         },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sliderContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
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
    transform: [{ translateX: -10 }], // Use transform instead of marginLeft
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
  pitchControls: {
    alignItems: 'center',
    width: '100%',
  },
  pitchDisplay: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pitchButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  pitchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  resetPitchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeButton: {
    backgroundColor: 'rgba(155, 89, 182, 0.8)', // Purple highlight for active state
  },
  pitchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  pitchPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  presetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
         modalIcon: {
           padding: 8,
         },

  // Upload Options Styles
  uploadOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  uploadOptionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    minWidth: 100,
  },
  uploadOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
       });

       export default Footer;

