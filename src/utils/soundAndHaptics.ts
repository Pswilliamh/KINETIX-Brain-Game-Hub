/**
 * Dynamic Rhythm Synthesizer, Harmonic Bell Chimes & Haptic Feedback Engine
 * Uses Web Audio API oscillators synced to difficulty level BPM and intensity,
 * with distinct harmonic bell chimes for Block Set Completion (3-piece tray cleared)
 * and Game Level Completion, plus navigator.vibrate + visual tactile fallback triggers.
 */

class SoundAndHapticsEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public hapticsEnabled: boolean = true;
  private beatIntervalId: number | null = null;
  private currentStep: number = 0;

  // Pentatonic scale frequencies (Hz) for harmonic arcade feedback
  private readonly SCALE = [
    220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25,
  ];

  private ensureContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public triggerHaptic(pattern: number | number[], onVisualPulse?: () => void) {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore on unsupported browsers
    }
    if (onVisualPulse) {
      onVisualPulse();
    }
  }

  /**
   * Plays a crystalline bell chime note with fundamental + octave overtone
   */
  private playBellNote(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    peakGain: number = 0.16
  ) {
    // Fundamental sine bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    gain1.gain.setValueAtTime(0.001, startTime);
    gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(startTime);
    osc1.stop(startTime + duration + 0.02);

    // Harmonic 2x overtone for bell shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    gain2.gain.setValueAtTime(0.001, startTime);
    gain2.gain.linearRampToValueAtTime(peakGain * 0.35, startTime + 0.008);
    gain2.gain.exponentialRampToValueAtTime(
      0.0008,
      startTime + duration * 0.65
    );

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.7);
  }

  public playBlockSelect() {
    this.triggerHaptic(8);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.055);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playBlockRotate() {
    this.triggerHaptic(10);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(392, now);
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.07);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playBlockPlace(combo: number, level: number) {
    this.triggerHaptic(15);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noteIndex = (this.currentStep + combo + level) % this.SCALE.length;
    const freq = this.SCALE[noteIndex];
    this.currentStep = (this.currentStep + 1) % 16;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = level >= 3 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.09);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * AUDIO CHIME 1: Block Set Complete Chime
   * Fires whenever all 3 blocks in a tray set have been placed (or when a block pattern set completes).
   * Plays a crisp 3-note ascending crystalline C-Major bell chime (C5 -> E5 -> G5).
   */
  public playBlockSetCompleteChime(onVisualPulse?: () => void) {
    this.triggerHaptic([20, 30, 40], onVisualPulse);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz), C6 (1046.50 Hz)
    const chimeNotes = [523.25, 659.25, 783.99, 1046.5];
    chimeNotes.forEach((freq, idx) => {
      this.playBellNote(ctx, freq, now + idx * 0.075, 0.42, 0.15);
    });
  }

  public playLineClear(
    linesCleared: number,
    combo: number,
    onVisualPulse?: () => void
  ) {
    this.triggerHaptic([25, 30, 45], onVisualPulse);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes =
      linesCleared >= 2
        ? [440, 554.37, 659.25, 880]
        : [392, 493.88, 587.33];

    notes.forEach((freq, idx) => {
      const pitchBoost = Math.min(1 + combo * 0.05, 1.5);
      this.playBellNote(ctx, freq * pitchBoost, now + idx * 0.06, 0.35, 0.16);
    });
  }

  public playPatternComplete(onVisualPulse?: () => void) {
    this.triggerHaptic([35, 40, 60, 40, 80], onVisualPulse);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((freq, idx) => {
      this.playBellNote(ctx, freq, now + idx * 0.065, 0.48, 0.18);
    });
  }

  /**
   * AUDIO CHIME 2: Game Level Complete Chime
   * Fires whenever the player completes a level and advances to a new difficulty tier.
   * Plays a rich, resonant 6-note celebratory grand bell chime arpeggio with warm sustain.
   */
  public playLevelCompleteChime(onVisualPulse?: () => void) {
    this.triggerHaptic([45, 40, 60, 40, 110], onVisualPulse);
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Celebratory Maj9 bell chime fanfare: C5 -> E5 -> G5 -> B5 -> D6 -> G6
    const levelChime = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
    levelChime.forEach((freq, i) => {
      const isFinalNote = i === levelChime.length - 1;
      this.playBellNote(
        ctx,
        freq,
        now + i * 0.085,
        isFinalNote ? 0.85 : 0.48,
        isFinalNote ? 0.22 : 0.17
      );
    });
  }

  public playLevelUp() {
    this.playLevelCompleteChime();
  }

  public playGameOver(onVisualPulse?: () => void) {
    this.triggerHaptic([60, 50, 110], onVisualPulse);
    this.stopRhythmLoop();
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      gain.gain.setValueAtTime(0.1, now + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.26);
    });
  }

  /**
   * Starts a subtle background low-end pulse synced dynamically with the level's BPM
   */
  public startRhythmLoop(
    bpm: number,
    level: number,
    onBeatTick?: (beat: number) => void
  ) {
    this.stopRhythmLoop();
    const intervalMs = Math.round((60 / bpm) * 1000);
    let beatCount = 0;

    this.beatIntervalId = window.setInterval(() => {
      beatCount = (beatCount + 1) % 4;
      if (onBeatTick) onBeatTick(beatCount);

      if (!this.soundEnabled) return;
      const ctx = this.ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const baseBass = beatCount === 0 ? 73.42 : 55.0 + level * 2;
      osc.frequency.setValueAtTime(baseBass * 1.4, now);
      osc.frequency.exponentialRampToValueAtTime(baseBass, now + 0.08);

      gain.gain.setValueAtTime(beatCount === 0 ? 0.055 : 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }, intervalMs);
  }

  public stopRhythmLoop() {
    if (this.beatIntervalId !== null) {
      clearInterval(this.beatIntervalId);
      this.beatIntervalId = null;
    }
  }
}

export const soundEngine = new SoundAndHapticsEngine();
