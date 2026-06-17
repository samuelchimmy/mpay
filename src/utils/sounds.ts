/**
 * Web Audio API synthesizer for gamified and polished financial sounds.
 * Bypasses asset load delays to give instantaneous, rich acoustic feedback.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (browser security restriction on first load)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.play('click');
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  play(type: 'click' | 'keypress' | 'woosh' | 'confirm' | 'success' | 'error') {
    if (this.isMuted) return;
    
    try {
      this.init();
      if (!this.ctx) return;
      
      const destination = this.ctx.destination;
      
      switch (type) {
        case 'click': {
          // Quick soft click sound
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.04);
          
          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
          
          osc.connect(gain);
          gain.connect(destination);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
          break;
        }
        
        case 'keypress': {
          // Extremely light popping percussion
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.02);
          
          gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
          
          osc.connect(gain);
          gain.connect(destination);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 0.03);
          break;
        }
        
        case 'woosh': {
          // Sweeping white-ish noise or quick frequency sweep
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(100, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.2);
          
          gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
          
          osc.connect(gain);
          gain.connect(destination);
          
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
          break;
        }
        
        case 'confirm': {
          // Warm harmonic double-beep
          const now = this.ctx.currentTime;
          [523.25, 659.25].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.08, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);
            
            osc.connect(gain);
            gain.connect(destination);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.15);
          });
          break;
        }
        
        case 'success': {
          // Playful ascending chord progression
          const now = this.ctx.currentTime;
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major chord)
          
          notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const oscHarmonic = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            const noteStart = now + index * 0.08;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);
            
            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(freq * 2, noteStart); // Octave multiplier for shimmer
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.setValueAtTime(0.06, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);
            
            osc.connect(gain);
            oscHarmonic.connect(gain);
            gain.connect(destination);
            
            osc.start(noteStart);
            oscHarmonic.start(noteStart);
            
            osc.stop(noteStart + 0.4);
            oscHarmonic.stop(noteStart + 0.4);
          });
          break;
        }
        
        case 'error': {
          // Decisive dual buzzer
          const now = this.ctx.currentTime;
          [130.81, 120.00].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
            
            // Apply low pass filter to make it warmer/buzzier rather than harsh screech
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(destination);
            
            osc.start(now);
            osc.stop(now + 0.26);
          });
          break;
        }
      }
    } catch (e) {
      console.warn("Audio Context sound failed to play", e);
    }
  }
}

export const sound = new SoundEffectsEngine();
