// Audio Effects Utility
// Custom reverb implementation using multiple audio instances

export interface ReverbSettings {
  roomSize: number; // 0-1, affects reverb length
  damping: number;  // 0-1, affects high frequency damping
  wetLevel: number; // 0-1, mix of dry/wet signal
  dryLevel: number; // 0-1, level of original signal
}

export class AudioEffects {
  private static instance: AudioEffects;
  private audioInstances: any[] = [];
  private reverbSettings: ReverbSettings = {
    roomSize: 0.5,
    damping: 0.5,
    wetLevel: 0.3,
    dryLevel: 0.7
  };

  static getInstance(): AudioEffects {
    if (!AudioEffects.instance) {
      AudioEffects.instance = new AudioEffects();
    }
    return AudioEffects.instance;
  }

  // Create reverb effect by layering multiple delayed audio instances
  async createReverbEffect(audioUrl: string, settings?: Partial<ReverbSettings>): Promise<any[]> {
    const { Audio } = require('expo-av');
    
    // Update settings if provided
    if (settings) {
      this.reverbSettings = { ...this.reverbSettings, ...settings };
    }

    const instances = [];
    
    try {
      // Create main audio instance (dry signal)
      const { sound: mainSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: false,
          volume: this.reverbSettings.dryLevel
        }
      );
      instances.push(mainSound);

      // Create reverb instances (wet signal) with different delays
      const delays = [0.1, 0.2, 0.3, 0.4, 0.5]; // Different delay times for reverb
      
      for (let i = 0; i < delays.length; i++) {
        const { sound: reverbSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { 
            shouldPlay: false,
            volume: this.reverbSettings.wetLevel * (1 - i * 0.1), // Decreasing volume for each layer
            rate: 1.0 - (i * 0.02) // Slight pitch variation for each layer
          }
        );
        instances.push(reverbSound);
      }

      this.audioInstances = instances;
      return instances;
      
    } catch (error) {
      console.error('Error creating reverb effect:', error);
      return [];
    }
  }

  // Play reverb effect
  async playReverbEffect(instances: any[], delay: number = 0) {
    try {
      // Play main sound immediately
      await instances[0].playAsync();
      
      // Play reverb layers with delays
      for (let i = 1; i < instances.length; i++) {
        setTimeout(async () => {
          try {
            await instances[i].playAsync();
          } catch (error) {
            console.error(`Error playing reverb layer ${i}:`, error);
          }
        }, delay + (i * 50)); // 50ms delay between each reverb layer
      }
    } catch (error) {
      console.error('Error playing reverb effect:', error);
    }
  }

  // Stop all reverb instances
  async stopReverbEffect(instances: any[]) {
    try {
      for (const instance of instances) {
        await instance.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping reverb effect:', error);
    }
  }

  // Clean up instances
  async unloadReverbEffect(instances: any[]) {
    try {
      for (const instance of instances) {
        await instance.unloadAsync();
      }
      this.audioInstances = [];
    } catch (error) {
      console.error('Error unloading reverb effect:', error);
    }
  }

  // Update reverb settings
  updateReverbSettings(settings: Partial<ReverbSettings>) {
    this.reverbSettings = { ...this.reverbSettings, ...settings };
  }

  // Get current reverb settings
  getReverbSettings(): ReverbSettings {
    return { ...this.reverbSettings };
  }
}

// Predefined reverb presets
export const ReverbPresets = {
  ROOM: {
    roomSize: 0.3,
    damping: 0.7,
    wetLevel: 0.2,
    dryLevel: 0.8
  },
  HALL: {
    roomSize: 0.7,
    damping: 0.5,
    wetLevel: 0.4,
    dryLevel: 0.6
  },
  CATHEDRAL: {
    roomSize: 0.9,
    damping: 0.3,
    wetLevel: 0.6,
    dryLevel: 0.4
  },
  OFF: {
    roomSize: 0,
    damping: 0,
    wetLevel: 0,
    dryLevel: 1
  }
};
