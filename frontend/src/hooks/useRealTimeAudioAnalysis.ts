import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

interface AudioData {
  lows: number;
  mids: number;
  highs: number;
  peak: number;
}

export const useRealTimeAudioAnalysis = (audioUrl: string, isPlaying: boolean, isActive: boolean) => {
  const [audioData, setAudioData] = useState<AudioData>({
    lows: 0,
    mids: 0,
    highs: 0,
    peak: 0
  });
  
  const audioRef = useRef<Audio.Sound | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sampleRateRef = useRef<number>(44100);
  const binWidthRef = useRef<number>(0);
  const decayRateRef = useRef<number>(0.95);
  const currentPeakRef = useRef<number>(0);

  // Initialize audio context and analyser
  const initAudio = async () => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128; // Higher = more frequency detail, but slower
      
      // Create array to hold frequency data (half of fftSize)
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Get sample rate and calculate bin width
      sampleRateRef.current = audioContextRef.current.sampleRate;
      binWidthRef.current = sampleRateRef.current / analyserRef.current.fftSize;
      
      console.log('Audio analysis initialized - Sample Rate:', sampleRateRef.current, 'Bin Width:', binWidthRef.current);
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
    }
  };

  // Connect audio to analyser
  const connectAudioToAnalyser = async () => {
    if (!audioRef.current || !analyserRef.current || !audioContextRef.current) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Get the native audio element from expo-av
      const audioElement = (audioRef.current as any)._nativeTag;
      if (audioElement) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        console.log('Audio connected to analyser');
      }
    } catch (error) {
      console.error('Failed to connect audio to analyser:', error);
    }
  };

  // Calculate peak with decay (ported from original JavaScript)
  const calculatePeakWithDecay = (frequencyData: Uint8Array, startBin: number, endBin: number, currentPeak: number) => {
    // Find current maximum in range
    let currentMax = 0;
    for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
      currentMax = Math.max(currentMax, frequencyData[i] / 255);
    }
    
    // Either use new peak or decay previous peak
    return Math.max(currentMax, currentPeak * decayRateRef.current);
  };

  // Update audio data (ported from original JavaScript)
  const updateAudioData = () => {
    // Add safety check to prevent crashes when audio isn't loaded
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average values for each frequency band instead of storing arrays
    let startBin = 0;
    let endBin = Math.floor(1000 / binWidthRef.current);
    let lowsSlice = dataArrayRef.current.slice(startBin, endBin + 1);
    let rawLows = lowsSlice.length > 0 ? lowsSlice.reduce((sum, val) => sum + val, 0) / lowsSlice.length / 255 : 0;
    
    startBin = Math.floor(500 / binWidthRef.current);
    endBin = Math.floor(1500 / binWidthRef.current);
    let midsSlice = dataArrayRef.current.slice(startBin, endBin + 1);
    let rawMids = midsSlice.length > 0 ? midsSlice.reduce((sum, val) => sum + val, 0) / midsSlice.length / 255 : 0;
    
    startBin = Math.floor(1500 / binWidthRef.current);
    endBin = Math.floor(2000 / binWidthRef.current);
    let highsSlice = dataArrayRef.current.slice(startBin, endBin + 1);
    let rawHighs = highsSlice.length > 0 ? highsSlice.reduce((sum, val) => sum + val, 0) / highsSlice.length / 255 : 0;
    
    // Apply exponential scaling to make beats more pronounced
    // Values closer to 0 stay small, values closer to 1 get amplified dramatically
    const processedLows = Math.pow(rawLows, 0.5); // Square root makes more sensitive to changes
    const processedMids = Math.pow(rawMids, 0.5);
    const processedHighs = Math.pow(rawHighs, 0.5);
    
    startBin = Math.floor(2000 / binWidthRef.current);
    endBin = Math.floor(20000 / binWidthRef.current);
    let data = dataArrayRef.current.slice(startBin, endBin + 1);
    const newPeak = calculatePeakWithDecay(data, startBin, endBin, currentPeakRef.current);
    currentPeakRef.current = newPeak;
    
    setAudioData({
      lows: processedLows,
      mids: processedMids,
      highs: processedHighs,
      peak: newPeak
    });
    
    console.log('Audio Data:', {
      lows: processedLows.toFixed(3),
      mids: processedMids.toFixed(3),
      highs: processedHighs.toFixed(3),
      peak: newPeak.toFixed(3)
    });
  };

  // Animation loop
  const animate = () => {
    if (!isPlaying || !isActive) return;
    
    updateAudioData();
    animationRef.current = requestAnimationFrame(animate);
  };

  // Load and setup audio
  useEffect(() => {
    const loadAudio = async () => {
      try {
        if (!audioUrl) return;

        // Initialize audio analysis
        await initAudio();

        // Load audio
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false, isLooping: true }
        );
        
        audioRef.current = sound;
        
        // Connect to analyser after a short delay to ensure audio is ready
        setTimeout(() => {
          connectAudioToAnalyser();
        }, 100);
        
      } catch (error) {
        console.error('Failed to load audio for analysis:', error);
      }
    };

    loadAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && isActive) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isActive]);

  return audioData;
};
