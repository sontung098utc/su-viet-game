/**
 * battleSoundSynthesizer.ts
 * Bộ tổng hợp âm thanh chiến trận thuần Web Audio API (không phụ thuộc file âm thanh ngoài)
 * Phục vụ màn cao trào: "QUYẾT CHIẾN ĐẰNG GIANG NĂM 938"
 */

class BattleSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Tiếng Trống Trận Đông Sơn / Trống Ngũ Liên
   * Âm thanh rền vang, dội trầm với cú gõ dùi đanh gọn và độ ngân thùng trống
   */
  public playWarDrum(hitQuality: 'normal' | 'good' | 'perfect' = 'good') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isPerfect = hitQuality === 'perfect';

    // 1. Âm trầm cơ bản của mặt da trâu (Fundamental Tone với pitch drop)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = isPerfect ? 165 : 140;
    const endFreq = isPerfect ? 48 : 42;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isPerfect ? 1.0 : 0.75, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isPerfect ? 0.75 : 0.5));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);

    // 2. Tiếng dùi gõ đanh (Stick Attack Click)
    const attackOsc = ctx.createOscillator();
    const attackGain = ctx.createGain();
    attackOsc.type = 'triangle';
    attackOsc.frequency.setValueAtTime(isPerfect ? 420 : 360, now);
    attackOsc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    attackGain.gain.setValueAtTime(0.6, now);
    attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    attackOsc.connect(attackGain);
    attackGain.connect(ctx.destination);

    attackOsc.start(now);
    attackOsc.stop(now + 0.08);

    // 3. Tiếng dội cộng hưởng thùng gỗ (Sub Rumble)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(isPerfect ? 0.8 : 0.5, now + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + (isPerfect ? 1.1 : 0.8));

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 1.2);
  }

  /**
   * Tiếng Tù Và Chiến Trận (Battle Horn Fanfare)
   * Giọng tù và ốc biển / sừng trâu cổ xưa ngân dài báo hiệu tổng phản công
   */
  public playBattleHorn() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [196, 261.63, 329.63, 392]; // G3, C4, E4, G4 hùng tráng

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.28;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc2.frequency.setValueAtTime(freq * 1.006, noteTime); // Chút detune tạo độ dày

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, noteTime);
      filter.frequency.linearRampToValueAtTime(1400, noteTime + 0.2);

      const isLast = idx === notes.length - 1;
      const duration = isLast ? 1.4 : 0.35;

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.08);
      gain.gain.setValueAtTime(0.35, noteTime + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc2.start(noteTime);
      osc.stop(noteTime + duration);
      osc2.stop(noteTime + duration);
    });
  }

  /**
   * Tiếng Chiến Hạm Mắc Cạn Vỡ Mạn Thuyền (Ship Crash & Splintering)
   * Tiếng gỗ gãy răng rắc, nước bắn tung tóe và va chạm sắt đá rền vang
   */
  public playShipCrash() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Cú va đập vật lý cực lớn (Heavy Impact)
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(110, now);
    impactOsc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

    impactGain.gain.setValueAtTime(0.9, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);
    impactOsc.start(now);
    impactOsc.stop(now + 1.0);

    // 2. Tiếng gỗ vạt nhọn xé toạc mạn thuyền (Splintering noise)
    const bufferSize = ctx.sampleRate * 1.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(800, now);
    bandpass.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    whiteNoise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 1.2);

    // 3. Tiếng sóng nước cuộn trào sủi bọt (Water splash rumble)
    const waterOsc = ctx.createOscillator();
    const waterGain = ctx.createGain();
    waterOsc.type = 'sine';
    waterOsc.frequency.setValueAtTime(70, now + 0.2);
    waterOsc.frequency.exponentialRampToValueAtTime(25, now + 1.4);

    waterGain.gain.setValueAtTime(0.001, now + 0.2);
    waterGain.gain.linearRampToValueAtTime(0.5, now + 0.35);
    waterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    waterOsc.connect(waterGain);
    waterGain.connect(ctx.destination);
    waterOsc.start(now + 0.2);
    waterOsc.stop(now + 1.6);
  }

  /**
   * Chuông Khải Hoàn Đại Thắng (Victory Chimes / Đồng Âm Khánh Đồng)
   */
  public playVictoryChime() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Điệu thức Ngũ Cung truyền thống (C4, D4, E4, G4, A4, C5)
    const bellPitches = [523.25, 659.25, 783.99, 1046.5];

    bellPitches.forEach((freq, idx) => {
      const startTime = now + idx * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Hòa âm chuông đồng
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 2.3);
    });
  }
}

export const battleSound = new BattleSoundSynthesizer();
