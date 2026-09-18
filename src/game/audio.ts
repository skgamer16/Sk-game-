// Web Audio API Synthesizer for "SK"
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private railOsc: OscillatorNode | null = null;
  private railGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.6;
  
  // Music loop state
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private currentTrack: 'cyber' | 'overdrive' | 'boss' | 'zen' = 'cyber';

  constructor() {
    // Initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('AudioContext initialization failed', e);
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx && !!this.sfxGain;
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, music));
    if (this.ctx && this.sfxGain && this.musicGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playDoubleJump() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc2.type = 'sine';
    
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  public playSlide() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.2);
  }

  public playSlash() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Laser blade slice
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playDeflect() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Metallic chime + sharp blast
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1800, now);
    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }

  public playCollectShard(comboCount: number = 0) {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Pentatonic scale based on combo
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const pitch = notes[comboCount % notes.length] || 659.25;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playHyperShard() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Multi-tone arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  public startRailSound() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain || this.railOsc) return;
    try {
      const now = this.ctx.currentTime;
      this.railOsc = this.ctx.createOscillator();
      this.railGain = this.ctx.createGain();

      this.railOsc.type = 'sawtooth';
      this.railOsc.frequency.setValueAtTime(180, now);

      this.railGain.gain.setValueAtTime(0.01, now);
      this.railGain.gain.linearRampToValueAtTime(0.12, now + 0.1);

      this.railOsc.connect(this.railGain);
      this.railGain.connect(this.sfxGain);

      this.railOsc.start(now);
    } catch {
      // Ignored
    }
  }

  public stopRailSound() {
    if (this.railOsc && this.railGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.railGain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        this.railOsc.stop(now + 0.06);
      } catch {
        // Ignored
      }
      this.railOsc = null;
      this.railGain = null;
    }
  }

  public playOverdrive() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub bass drop + explosive riser
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.6);

    // Riser
    const leadOsc = this.ctx.createOscillator();
    const leadGain = this.ctx.createGain();
    leadOsc.type = 'sawtooth';
    leadOsc.frequency.setValueAtTime(300, now);
    leadOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.4);
    leadGain.gain.setValueAtTime(0.35, now);
    leadGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    leadOsc.connect(leadGain);
    leadGain.connect(this.sfxGain);
    leadOsc.start(now);
    leadOsc.stop(now + 0.45);
  }

  public playHit() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playEnemyExplode() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playBossWarning() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Cyber alarm siren
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.15);
    osc.frequency.linearRampToValueAtTime(400, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playGameOver() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const chords = [392.00, 329.63, 261.63, 196.00];
    chords.forEach((note, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playUIClick() {
    if (!this.ensureContext() || this.isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- SYNTHWAVE MUSIC SEQUENCER ---

  public startMusic(track: 'cyber' | 'overdrive' | 'boss' | 'zen' = 'cyber') {
    this.currentTrack = track;
    if (!this.ensureContext() || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.musicStep = 0;

    const bpm = track === 'overdrive' ? 145 : track === 'boss' ? 140 : track === 'zen' ? 95 : 128;
    const stepInterval = (60 / bpm) / 4 * 1000; // 16th notes

    this.musicInterval = window.setInterval(() => {
      this.playMusicTick();
    }, stepInterval);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public setTrack(track: 'cyber' | 'overdrive' | 'boss' | 'zen') {
    if (this.currentTrack !== track) {
      this.currentTrack = track;
      if (this.isMusicPlaying) {
        this.stopMusic();
        this.startMusic(track);
      }
    }
  }

  private playMusicTick() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const step = this.musicStep % 16;
    const bar = Math.floor(this.musicStep / 16) % 4;

    // Bass notes (A minor / F / C / G progression)
    const bassProgression = [110, 87.31, 130.81, 98.00]; // A2, F2, C3, G2
    const currentBass = bassProgression[bar];

    // Play Kick on 0, 4, 8, 12
    if (step % 4 === 0 && this.currentTrack !== 'zen') {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

      kickGain.gain.setValueAtTime(0.25, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.1);
    }

    // Play Snare on 4, 12
    if ((step === 4 || step === 12) && this.currentTrack !== 'zen') {
      const snareBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
      const data = snareBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;

      const snareSource = this.ctx.createBufferSource();
      snareSource.buffer = snareBuffer;

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.18, now);
      snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      snareSource.connect(snareGain);
      snareGain.connect(this.musicGain);

      snareSource.start(now);
      snareSource.stop(now + 0.1);
    }

    // Hi-hat on every odd step
    if (step % 2 === 1 && this.currentTrack !== 'zen') {
      const hatOsc = this.ctx.createOscillator();
      const hatGain = this.ctx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(8000, now);

      hatGain.gain.setValueAtTime(0.04, now);
      hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      hatOsc.connect(hatGain);
      hatGain.connect(this.musicGain);

      hatOsc.start(now);
      hatOsc.stop(now + 0.035);
    }

    // Bassline synth
    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bGain = this.ctx.createGain();

      bassOsc.type = this.currentTrack === 'overdrive' ? 'sawtooth' : 'triangle';
      const octaveMultiplier = step === 2 || step === 10 ? 1.5 : 1.0;
      bassOsc.frequency.setValueAtTime(currentBass * octaveMultiplier, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(450, now);
      bassFilter.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      bGain.gain.setValueAtTime(0.2, now);
      bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bGain);
      bGain.connect(this.musicGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.14);
    }

    // Synth Arpeggio
    if (this.currentTrack === 'overdrive' || this.currentTrack === 'boss' || (bar % 2 === 1 && step % 2 === 0)) {
      const arpNotes = [440, 523.25, 659.25, 783.99, 880, 1046.5];
      const noteIdx = (step * 2 + bar) % arpNotes.length;
      const arpFreq = arpNotes[noteIdx];

      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpFreq, now);

      arpGain.gain.setValueAtTime(0.1, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      arpOsc.connect(arpGain);
      arpGain.connect(this.musicGain);

      arpOsc.start(now);
      arpOsc.stop(now + 0.09);
    }

    this.musicStep++;
  }
}

export const sound = new SoundManager();
