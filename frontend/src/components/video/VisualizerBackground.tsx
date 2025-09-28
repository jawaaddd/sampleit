import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface VisualizerBackgroundProps {
  isActive: boolean;
}

const VisualizerBackground: React.FC<VisualizerBackgroundProps> = ({ isActive }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isActive, animatedValue]);

  const generateLines = () => {
    const lines = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    
    for (let i = 0; i < 20; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = startY + (Math.random() - 0.5) * 200;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      lines.push(
        <Line
          key={i}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth={2}
          opacity={0.7}
        />
      );
    }
    return lines;
  };

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.visualizerContainer,
          {
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.8, 0.3],
            }),
          },
        ]}
      >
        <Svg height={height} width={width} style={styles.svg}>
          <Defs>
            <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.8" />
              <Stop offset="25%" stopColor="#4ECDC4" stopOpacity="0.6" />
              <Stop offset="50%" stopColor="#45B7D1" stopOpacity="0.8" />
              <Stop offset="75%" stopColor="#96CEB4" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FFEAA7" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          {generateLines()}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  visualizerContainer: {
    flex: 1,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default VisualizerBackground;

