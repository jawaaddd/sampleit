import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface SpeechBubbleProps {
  visible: boolean;
  text: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <View style={styles.speechBubble}>
      <View style={styles.speechBubbleContent}>
        <Text style={styles.speechBubbleText}>{text}</Text>
      </View>
      <View style={styles.speechBubbleTail} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Speech Bubble Styles
  speechBubble: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  speechBubbleContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speechBubbleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  speechBubbleTail: {
    position: 'absolute',
    bottom: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default SpeechBubble;
