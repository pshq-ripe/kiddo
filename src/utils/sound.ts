// Web Audio Synthesizer for delightful sandbox sounds

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgOscillator: OscillatorNode | null = null;
  private bgGain: GainNode | null = null;
  public musicPlaying: boolean = false;
  private musicInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Haptic feedback for mobile touches
  public vibrate(pattern: number | number[] = 10) {
    if (!this.enabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }

  // Playful pop sound for buttons and touches
  public playPop(frequency = 520, duration = 0.1) {
    this.vibrate(8);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.ctx.currentTime + duration * 0.4);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before first user gesture
    }
  }

  // Joyful bell / chord for positive achievements and saving
  public playSuccess() {
    this.vibrate([15, 40, 20]);
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.28, 'triangle', 0.15);
      }, idx * 70);
    });
  }

  // Celebratory fanfare for unlocking achievement badges
  public playFanfare() {
    this.vibrate([30, 50, 30, 80]);
    if (!this.enabled) return;
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 100 },
      { f: 783.99, d: 0.12, t: 200 },
      { f: 1046.5, d: 0.4, t: 300 }
    ];
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'triangle', 0.22);
      }, n.t);
    });
  }

  // Magic sparkle sound
  public playSparkle() {
    this.vibrate(12);
    if (!this.enabled) return;
    const notes = [880, 1174, 1396, 1760, 2093];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.16, 'sine', 0.1);
      }, idx * 45);
    });
  }

  // Camera shutter click & flash sound
  public playCamera() {
    this.vibrate([25, 30, 15]);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      // High click followed by mechanical whirr
      this.playTone(1200, 0.04, 'square', 0.2);
      setTimeout(() => {
        this.playTone(800, 0.08, 'triangle', 0.15);
      }, 50);
    } catch {
      // ignore
    }
  }

  // Water splash / drip sound
  public playWater() {
    if (!this.enabled) return;
    const freqs = [600, 900, 1200];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPop(freq, 0.08);
      }, idx * 60);
    });
  }

  // Playful eating/snack crunch sound
  public playNom() {
    this.vibrate(12);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const freqs = [360, 480, 410];
      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPop(freq, 0.07);
        }, idx * 70);
      });
    } catch {
      // ignore
    }
  }

  // Interactive raindrop shattering / splash sound
  public playRainSplash() {
    this.vibrate(8);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Aquatic droplet pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const baseFreq = 720 + Math.random() * 320;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.07);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // Micro droplet drip
      setTimeout(() => {
        if (!this.ctx) return;
        const now2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.35, now2);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now2 + 0.05);
        gain2.gain.setValueAtTime(0.08, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.06);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.07);
      }, 35);
    } catch {
      // ignore
    }
  }

  // Interactive snowflake blooming / crystalline chime sound
  public playSnowBloom() {
    this.vibrate(10);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const chimeFreqs = [1567.98, 1760.0, 2093.0, 2637.02, 3135.96]; // G6, A6, C7, E7, G7
      const randomPitch = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
      const notes = [randomPitch, randomPitch * 1.25, randomPitch * 1.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.22, 'sine', 0.07);
        }, idx * 42);
      });
    } catch {
      // ignore
    }
  }

  // Lamp switch click
  public playClick() {
    this.playTone(400, 0.03, 'sine', 0.2);
  }

  // Fun squeak / giggle
  public playBoing() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.22);
    } catch {
      // ignore
    }
  }

  // General tone generator
  public playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }

  // Pet sounds: Meow, Bark, Chirp, Squeak, Purr
  public playPetSound(type: 'meow' | 'bark' | 'chirp' | 'squeak' | 'purr' = 'meow') {
    this.vibrate(type === 'bark' ? [15, 20, 15] : 12);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      if (type === 'meow') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.linearRampToValueAtTime(720, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.35);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'bark') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'chirp') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.linearRampToValueAtTime(2200, now + 0.08);
        osc.frequency.linearRampToValueAtTime(1600, now + 0.16);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } else if (type === 'squeak') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(1900, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else {
        // Purr: low rumbling oscillation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
      }
    } catch {
      // ignore
    }
  }

  // Play sound effect matching changed weather
  public playWeatherSound(weather: 'sun' | 'rainbow' | 'snow' | 'rain' | 'night') {
    if (!this.enabled) return;
    this.vibrate(15);
    try {
      this.initContext();
      if (!this.ctx) return;

      if (weather === 'sun') {
        // Bright, warm cheerful ascending arpeggio
        const sunNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        sunNotes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playTone(freq, 0.28, 'triangle', 0.12);
          }, idx * 70);
        });
      } else if (weather === 'snow') {
        // Delicate, tinkling icy wind chime
        const chimeNotes = [1174.66, 1318.51, 1567.98, 1760.0, 2093.0]; // D6, E6, G6, A6, C7
        chimeNotes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playTone(freq, 0.35, 'sine', 0.08);
          }, idx * 60 + (idx % 2 === 0 ? 20 : 0));
        });
      } else if (weather === 'rain') {
        // Cute soft raindrops
        const rainFreqs = [440, 523, 620, 480, 550, 698];
        rainFreqs.forEach((freq, idx) => {
          setTimeout(() => {
            this.playPop(freq, 0.06);
          }, idx * 65);
        });
      } else if (weather === 'rainbow') {
        // Magical glittering chime
        const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playTone(freq, 0.4, 'triangle', 0.15);
          }, idx * 80);
        });
      } else if (weather === 'night') {
        // Dreamy soft lullaby harmony
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playTone(freq, 0.5, 'sine', 0.1);
          }, idx * 110);
        });
      }
    } catch {
      // ignore
    }
  }

  // Playful coin chime sound
  public playCoin() {
    this.vibrate([8, 12]);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1975.53, now); // B6
      osc2.frequency.setValueAtTime(2637.02, now + 0.08); // E7

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  // Gift opening crescendo sound with sparkles
  public playGiftOpen() {
    this.vibrate([15, 25, 35]);
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chords.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.25, 'triangle', 0.12);
        }, idx * 55);
      });
      setTimeout(() => {
        this.playSnowBloom();
      }, 260);
    } catch {
      // ignore
    }
  }

  // Toggle background playful melody
  public toggleMusic(callback?: (playing: boolean) => void) {
    this.initContext();
    this.musicPlaying = !this.musicPlaying;

    if (this.musicPlaying && this.enabled) {
      this.startMelodyLoop();
    } else {
      this.stopMelodyLoop();
    }

    if (callback) callback(this.musicPlaying);
  }

  private startMelodyLoop() {
    if (this.musicInterval) clearInterval(this.musicInterval);
    const melody = [523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 880, 783.99]; // Gentle music box
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (!this.musicPlaying || !this.enabled) return;
      const note = melody[step % melody.length];
      this.playTone(note, 0.35, 'sine', 0.04);
      step++;
    }, 450);
  }

  private stopMelodyLoop() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundManager();
