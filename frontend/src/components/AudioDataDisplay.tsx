import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface AudioData {
  lows: number;
  mids: number;
  highs: number;
  peak: number;
}

interface AudioDataDisplayProps {
  audioData: AudioData;
  isPlaying: boolean;
  isActive: boolean;
}

const AudioDataDisplay: React.FC<AudioDataDisplayProps> = ({ audioData, isPlaying, isActive }) => {
  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Audio Analysis</Text>
        <View style={[styles.statusDot, { backgroundColor: isPlaying ? '#00ff00' : '#ff0000' }]} />
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Lows:</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${audioData.lows * 100}%`, backgroundColor: '#ff6b6b' }]} />
        </View>
        <Text style={styles.value}>{audioData.lows.toFixed(3)}</Text>
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Mids:</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${audioData.mids * 100}%`, backgroundColor: '#4ecdc4' }]} />
        </View>
        <Text style={styles.value}>{audioData.mids.toFixed(3)}</Text>
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Highs:</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${audioData.highs * 100}%`, backgroundColor: '#45b7d1' }]} />
        </View>
        <Text style={styles.value}>{audioData.highs.toFixed(3)}</Text>
      </View>
      
      <View style={styles.dataRow}>
        <Text style={styles.label}>Peak:</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${audioData.peak * 100}%`, backgroundColor: '#f9ca24' }]} />
        </View>
        <Text style={styles.value}>{audioData.peak.toFixed(3)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    width: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    width: 35,
    fontFamily: 'monospace',
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  value: {
    color: '#fff',
    fontSize: 9,
    width: 35,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
});

export default AudioDataDisplay;
