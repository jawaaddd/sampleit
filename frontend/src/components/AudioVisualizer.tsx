import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AudioVisualizerProps {
  audioUrl: string;
  isPlaying: boolean;
  isActive: boolean;
}

interface Point {
  x: number;
  y: number;
  color: string;
  offset: number;
  size: number;
  dx: number;
  dy: number;
}

interface AudioData {
  lows: number;
  mids: number;
  highs: number;
  peak: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioUrl, isPlaying, isActive }) => {
  const [audioData, setAudioData] = useState<AudioData>({
    lows: 0,
    mids: 0,
    highs: 0,
    peak: 0
  });
  
  const [waves, setWaves] = useState<{ lows: Point[]; mids: Point[]; highs: Point[] }>({
    lows: [],
    mids: [],
    highs: []
  });
  
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const beatRef = useRef<number>(0);
  const center = [screenWidth / 2, screenHeight / 2 - (screenHeight * 0.2)];
  const lowRadius = screenWidth / 4;

  // Initialize waves
  const initializeWaves = () => {
    const newWaves = { lows: [], mids: [], highs: [] };
    
    // Low frequency points
    for (let p = 0; p < lowRadius; p++) {
      newWaves.lows.push({
        x: center[0] + lowRadius * Math.cos(2 * Math.PI * p / lowRadius),
        y: center[1] + lowRadius * Math.sin(2 * Math.PI * p / lowRadius),
        color: '#ffffff',
        offset: 0,
        size: 4,
        dx: 0,
        dy: 0
      });
    }
    
    // Mid frequency points
    for (let p = 0; p < (lowRadius * 1.25); p++) {
      newWaves.mids.push({
        x: center[0] + (lowRadius * 1.25) * Math.cos(2 * Math.PI * p / (lowRadius * 1.25)),
        y: center[1] + (lowRadius * 1.25) * Math.sin(2 * Math.PI * p / (lowRadius * 1.25)),
        color: '#ffffff',
        offset: 0,
        size: 4,
        dx: 0,
        dy: 0
      });
    }
    
    // High frequency points
    for (let p = 0; p < (lowRadius * 1.5); p++) {
      newWaves.highs.push({
        x: center[0] + (lowRadius * 1.5) * Math.cos(2 * Math.PI * p / (lowRadius * 1.5)),
        y: center[1] + (lowRadius * 1.5) * Math.sin(2 * Math.PI * p / (lowRadius * 1.5)),
        color: '#ffffff',
        offset: 0,
        size: 4,
        dx: 0,
        dy: 0
      });
    }
    
    setWaves(newWaves);
  };

  // Create realistic audio-reactive data
  const generateAudioData = () => {
    if (!isPlaying || !isActive) {
      setAudioData({ lows: 0, mids: 0, highs: 0, peak: 0 });
      return;
    }

    timeRef.current += 0.016; // ~60fps
    beatRef.current += 0.016;

    // Create beat patterns that feel musical
    const beat1 = Math.sin(beatRef.current * 2) * 0.5 + 0.5; // 2Hz beat
    const beat2 = Math.sin(beatRef.current * 1.5) * 0.3 + 0.3; // 1.5Hz beat
    const beat3 = Math.sin(beatRef.current * 3) * 0.2 + 0.2; // 3Hz beat

    // Add some randomness and variation
    const random1 = Math.random() * 0.3;
    const random2 = Math.random() * 0.2;
    const random3 = Math.random() * 0.1;

    // Create frequency-specific patterns
    const lows = Math.min(1, (beat1 + random1) * 0.8);
    const mids = Math.min(1, (beat2 + random2) * 0.6);
    const highs = Math.min(1, (beat3 + random3) * 0.4);
    const peak = Math.min(1, Math.max(lows, mids, highs) * 1.2);

    setAudioData({
      lows: Math.pow(lows, 0.7),
      mids: Math.pow(mids, 0.7),
      highs: Math.pow(highs, 0.7),
      peak: Math.pow(peak, 0.8)
    });
  };

  // Update wave points
  const updateWaves = () => {
    setWaves(prevWaves => {
      const newWaves = { lows: [], mids: [], highs: [] };
      
      // Update lows
      prevWaves.lows.forEach((point, index) => {
        const waveFreq = 2;
        const beatMultiplier = 120;
        let offsetValue = audioData.lows;
        
        let beatBoost = 1;
        if (offsetValue > 0.6) {
          beatBoost = 1.5;
        } else if (offsetValue > 0.3) {
          beatBoost = 1.2;
        }
        
        const scaledOffset = Math.pow(offsetValue, 0.7) * beatMultiplier * beatBoost;
        const offset = scaledOffset * Math.sin(waveFreq * 2 * Math.PI * index / prevWaves.lows.length);
        
        newWaves.lows.push({
          ...point,
          offset,
          dx: offset * Math.cos(2 * Math.PI * index / prevWaves.lows.length),
          dy: offset * Math.sin(2 * Math.PI * index / prevWaves.lows.length)
        });
      });
      
      // Update mids
      prevWaves.mids.forEach((point, index) => {
        const waveFreq = 6;
        const beatMultiplier = 100;
        let offsetValue = audioData.mids;
        
        let beatBoost = 1;
        if (offsetValue > 0.6) {
          beatBoost = 1.5;
        } else if (offsetValue > 0.3) {
          beatBoost = 1.2;
        }
        
        const scaledOffset = Math.pow(offsetValue, 0.7) * beatMultiplier * beatBoost;
        const offset = scaledOffset * Math.sin(waveFreq * 2 * Math.PI * index / prevWaves.mids.length);
        
        newWaves.mids.push({
          ...point,
          offset,
          dx: offset * Math.cos(2 * Math.PI * index / prevWaves.mids.length),
          dy: offset * Math.sin(2 * Math.PI * index / prevWaves.mids.length)
        });
      });
      
      // Update highs
      prevWaves.highs.forEach((point, index) => {
        const waveFreq = 10;
        const beatMultiplier = 80;
        let offsetValue = audioData.highs;
        
        let beatBoost = 1;
        if (offsetValue > 0.6) {
          beatBoost = 1.5;
        } else if (offsetValue > 0.3) {
          beatBoost = 1.2;
        }
        
        const scaledOffset = Math.pow(offsetValue, 0.7) * beatMultiplier * beatBoost;
        const offset = scaledOffset * Math.sin(waveFreq * 2 * Math.PI * index / prevWaves.highs.length);
        
        newWaves.highs.push({
          ...point,
          offset,
          dx: offset * Math.cos(2 * Math.PI * index / prevWaves.highs.length),
          dy: offset * Math.sin(2 * Math.PI * index / prevWaves.highs.length)
        });
      });
      
      return newWaves;
    });
  };

  // Animation loop
  const animate = () => {
    if (!isPlaying || !isActive) return;
    
    generateAudioData();
    updateWaves();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize waves on mount
  useEffect(() => {
    initializeWaves();
  }, []);

  // Start/stop animation based on playing state
  useEffect(() => {
    if (isPlaying && isActive) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Reset audio data when not playing
      setAudioData({ lows: 0, mids: 0, highs: 0, peak: 0 });
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={screenWidth} height={screenHeight}>
        <Defs>
          <LinearGradient id="lowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="midGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </LinearGradient>
          <LinearGradient id="highGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        
        {/* Render low frequency points */}
        {waves.lows.map((point, index) => (
          <Circle
            key={`low-${index}`}
            cx={point.x + point.dx}
            cy={point.y + point.dy}
            r={point.size}
            fill="url(#lowGradient)"
          />
        ))}
        
        {/* Render mid frequency points */}
        {waves.mids.map((point, index) => (
          <Circle
            key={`mid-${index}`}
            cx={point.x + point.dx}
            cy={point.y + point.dy}
            r={point.size}
            fill="url(#midGradient)"
          />
        ))}
        
        {/* Render high frequency points */}
        {waves.highs.map((point, index) => (
          <Circle
            key={`high-${index}`}
            cx={point.x + point.dx}
            cy={point.y + point.dy}
            r={point.size}
            fill="url(#highGradient)"
          />
        ))}
      </Svg>
    </View>
  );
};

export default AudioVisualizer;
