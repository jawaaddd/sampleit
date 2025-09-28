// Audio Effects Utility
// Custom reverb implementation using multiple audio instances

export interface EchoSettings {
  delay: number;    // 0-1, echo delay time
  feedback: number; // 0-1, echo feedback amount
  wetLevel: number; // 0-1, mix of dry/wet signal
  dryLevel: number; // 0-1, level of original signal
}

export class AudioEffects {
  private static instance: AudioEffects;
  private audioInstances: any[] = [];
  private echoSettings: EchoSettings = {
    delay: 0.3,
    feedback: 0.4,
    wetLevel: 0.3,
    dryLevel: 0.7
  };

  static getInstance(): AudioEffects {
    if (!AudioEffects.instance) {
      AudioEffects.instance = new AudioEffects();
    }
    return AudioEffects.instance;
  }

  // Create echo effect by layering multiple delayed audio instances
  async createEchoEffect(audioUrl: string, settings?: Partial<EchoSettings>): Promise<any[]> {
    const { Audio } = require('expo-av');
    
    // Update settings if provided
    if (settings) {
      this.echoSettings = { ...this.echoSettings, ...settings };
    }

    console.log('Creating echo effect with settings:', this.echoSettings);
    const instances = [];
    
    try {
      // Create main audio instance (dry signal) - this will be the primary audio
      const { sound: mainSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: false,
          volume: this.echoSettings.dryLevel,
          rate: 1.0
        }
      );
      instances.push(mainSound);
      console.log('Main audio instance created with volume:', this.echoSettings.dryLevel);

      // Create multiple echo instances for reverb-like effect
      const numEchoes = 8; // More echoes for reverb-like effect
      const baseDelay = this.echoSettings.delay * 1000; // Convert to milliseconds
      
      for (let i = 0; i < numEchoes; i++) {
        // Create varying delays for more natural reverb
        const delayVariation = (i + 1) * baseDelay + (Math.random() * 100 - 50); // Add slight randomness
        const echoVolume = this.echoSettings.wetLevel * Math.pow(this.echoSettings.feedback, i + 1);
        
        console.log(`Creating echo instance ${i + 1} with delay ${delayVariation.toFixed(0)}ms and volume ${echoVolume.toFixed(3)}`);
        
        const { sound: echoSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { 
            shouldPlay: false,
            volume: echoVolume,
            rate: 1.0 + (Math.random() * 0.02 - 0.01) // Slight pitch variation for realism
          }
        );
        instances.push(echoSound);
      }

      this.audioInstances = instances;
      console.log(`Echo effect created with ${instances.length} total instances`);
      return instances;
      
    } catch (error) {
      console.error('Error creating echo effect:', error);
      return [];
    }
  }

  // Play echo effect
  async playEchoEffect(instances: any[], delay: number = 0) {
    try {
      console.log(`Playing reverb-like echo effect with ${instances.length} instances`);
      
      // Play main sound immediately
      console.log('Playing main audio instance');
      await instances[0].playAsync();
      
      // Play multiple echo layers with varying delays for reverb-like effect
      const baseDelay = this.echoSettings.delay * 1000; // Convert to milliseconds
      const numEchoes = instances.length - 1; // Subtract 1 for main audio
      
      console.log(`Scheduling ${numEchoes} echo instances with base delay ${baseDelay}ms`);
      
      for (let i = 1; i < instances.length; i++) {
        // Create varying delays for more natural reverb
        const delayVariation = (i) * baseDelay + (Math.random() * 100 - 50); // Add slight randomness
        const echoDelay = delay + Math.max(50, delayVariation); // Minimum 50ms delay
        
        console.log(`Scheduling echo instance ${i} to play in ${echoDelay.toFixed(0)}ms`);
        
        setTimeout(async () => {
          try {
            console.log(`Playing echo instance ${i}`);
            await instances[i].playAsync();
            console.log(`Echo instance ${i} started playing`);
          } catch (error) {
            console.error(`Error playing echo layer ${i}:`, error);
          }
        }, echoDelay);
      }
    } catch (error) {
      console.error('Error playing echo effect:', error);
    }
  }

  // Stop all echo instances
  async stopEchoEffect(instances: any[]) {
    try {
      for (const instance of instances) {
        await instance.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping echo effect:', error);
    }
  }

  // Clean up instances
  async unloadEchoEffect(instances: any[]) {
    try {
      for (const instance of instances) {
        await instance.unloadAsync();
      }
      this.audioInstances = [];
    } catch (error) {
      console.error('Error unloading echo effect:', error);
    }
  }

  // Update echo settings
  updateEchoSettings(settings: Partial<EchoSettings>) {
    this.echoSettings = { ...this.echoSettings, ...settings };
  }

  // Get current echo settings
  getEchoSettings(): EchoSettings {
    return { ...this.echoSettings };
  }
}

// Predefined echo presets (now reverb-like with multiple trailing echoes)
export const EchoPresets = {
  SHORT: {
    delay: 0.15, // 150ms base delay
    feedback: 0.4, // Higher feedback for more trailing
    wetLevel: 0.25,
    dryLevel: 0.75
  },
  MEDIUM: {
    delay: 0.25, // 250ms base delay
    feedback: 0.6, // Higher feedback for more trailing
    wetLevel: 0.35,
    dryLevel: 0.65
  },
  LONG: {
    delay: 0.4, // 400ms base delay
    feedback: 0.75, // Higher feedback for more trailing
    wetLevel: 0.45,
    dryLevel: 0.55
  },
  OFF: {
    delay: 0,
    feedback: 0,
    wetLevel: 0,
    dryLevel: 1
  }
};
