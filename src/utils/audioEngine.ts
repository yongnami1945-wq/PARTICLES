// Web Audio API Realtime Frequency Spectrum & Beat Analyzer
export interface AudioAnalysis {
  bass: number;       // 0.0 ~ 1.0 (Low frequencies: 20Hz ~ 250Hz)
  mid: number;        // 0.0 ~ 1.0 (Mid frequencies: 250Hz ~ 2kHz)
  treble: number;     // 0.0 ~ 1.0 (High frequencies: 2kHz ~ 16kHz)
  volume: number;     // 0.0 ~ 1.0 overall RMS
  beatPulse: number;  // Sudden transient spike factor
  frequencyData: Uint8Array;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | AudioBufferSourceNode | OscillatorNode | null = null;
  private stream: MediaStream | null = null;
  private isRunning = false;
  private freqArray: Uint8Array = new Uint8Array(128);
  private lastBass = 0;
  private beatPulseDecay = 0;
  private synthInterval: number | null = null;
  private audioMode: 'mic' | 'synth' | 'file' = 'synth';

  public async init(mode: 'mic' | 'synth' | 'file' = 'synth'): Promise<boolean> {
    try {
      this.stop();
      this.audioMode = mode;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.ctx = new AudioContextClass();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);

      if (mode === 'mic') {
        if (!navigator.mediaDevices?.getUserMedia) {
          console.warn('Microphone not supported on this browser');
          return this.init('synth');
        }
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const micSource = this.ctx.createMediaStreamSource(this.stream);
        micSource.connect(this.analyser);
        this.sourceNode = micSource;
      } else if (mode === 'synth') {
        // Built-in rhythmic procedural music generator (EDM / Ambient Arpeggio)
        this.startSyntheticBeat();
      }

      this.isRunning = true;
      return true;
    } catch (err) {
      console.warn('Audio Engine init fallback to synthetic synth:', err);
      if (mode !== 'synth') {
        return this.init('synth');
      }
      return false;
    }
  }

  private startSyntheticBeat() {
    if (!this.ctx || !this.analyser) return;

    // Master gain for synth
    const masterGain = this.ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(this.analyser);
    masterGain.connect(this.ctx.destination);

    let step = 0;
    const bpm = 124;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes

    const playStep = () => {
      if (!this.ctx || !this.isRunning || this.audioMode !== 'synth') return;
      const now = this.ctx.currentTime;

      // 1. Bass Kick on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }

      // 2. Hi-Hat on offbeats
      if (step % 2 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'highpass' as any;
        osc.frequency.setValueAtTime(6000 + Math.random() * 2000, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
      }

      // 3. Ambient Synth Arpeggio Note
      const notes = [220, 261.63, 329.63, 392.00, 440, 523.25, 659.25];
      const noteFreq = notes[(step * 3) % notes.length];
      const synthOsc = this.ctx.createOscillator();
      const synthGain = this.ctx.createGain();
      synthOsc.type = (step % 8 === 0) ? 'sawtooth' : 'triangle';
      synthOsc.frequency.setValueAtTime(noteFreq, now);
      synthGain.gain.setValueAtTime(0.2, now);
      synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      synthOsc.connect(synthGain);
      synthGain.connect(masterGain);
      synthOsc.start(now);
      synthOsc.stop(now + 0.3);

      step = (step + 1) % 16;
    };

    this.synthInterval = window.setInterval(playStep, intervalMs);
  }

  public async loadAudioFile(file: File): Promise<boolean> {
    try {
      this.stop();
      this.audioMode = 'file';
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = true;
      source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      source.start(0);

      this.sourceNode = source;
      this.isRunning = true;
      return true;
    } catch (err) {
      console.error('Failed to load audio file:', err);
      return false;
    }
  }

  public getAnalysis(sensitivity = 1.0): AudioAnalysis {
    if (!this.analyser || !this.isRunning) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        beatPulse: 0,
        frequencyData: this.freqArray,
      };
    }

    this.analyser.getByteFrequencyData(this.freqArray);
    const binCount = this.freqArray.length;

    // Bass: bins 1 ~ 6 (approx 30Hz ~ 250Hz)
    let bassSum = 0;
    const bassEnd = Math.max(1, Math.floor(binCount * 0.1));
    for (let i = 0; i < bassEnd; i++) bassSum += this.freqArray[i];
    const bass = Math.min(1.0, (bassSum / (bassEnd * 255)) * sensitivity);

    // Mid: bins 10% ~ 45%
    let midSum = 0;
    const midEnd = Math.floor(binCount * 0.45);
    for (let i = bassEnd; i < midEnd; i++) midSum += this.freqArray[i];
    const mid = Math.min(1.0, (midSum / ((midEnd - bassEnd) * 255)) * sensitivity);

    // Treble: bins 45% ~ 90%
    let trebleSum = 0;
    const trebleEnd = Math.floor(binCount * 0.9);
    for (let i = midEnd; i < trebleEnd; i++) trebleSum += this.freqArray[i];
    const treble = Math.min(1.0, (trebleSum / ((trebleEnd - midEnd) * 255)) * sensitivity);

    // Overall Volume
    let totalSum = 0;
    for (let i = 0; i < binCount; i++) totalSum += this.freqArray[i];
    const volume = Math.min(1.0, (totalSum / (binCount * 255)) * sensitivity);

    // Transient Beat Spike Detector
    const bassDiff = Math.max(0, bass - this.lastBass);
    if (bassDiff > 0.15) {
      this.beatPulseDecay = Math.min(1.0, this.beatPulseDecay + bassDiff * 2.5);
    } else {
      this.beatPulseDecay *= 0.88; // decay
    }
    this.lastBass = bass;

    return {
      bass,
      mid,
      treble,
      volume,
      beatPulse: this.beatPulseDecay,
      frequencyData: this.freqArray,
    };
  }

  public stop() {
    this.isRunning = false;
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.sourceNode) {
      try {
        (this.sourceNode as any).stop?.();
        this.sourceNode.disconnect();
      } catch (_) {}
      this.sourceNode = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (_) {}
      this.ctx = null;
    }
  }

  public getActiveMode() {
    return this.audioMode;
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const audioEngine = new AudioEngine();
