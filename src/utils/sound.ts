import type { AudioMixSettings } from '../types';

export const DEFAULT_AUDIO_MIX: AudioMixSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  voiceVolume: 0.95,
  bgmVolume: 0.35,
  sfxVolume: 0.75,
  useBrowserTtsFallback: false,
};

class SoundController {
  private ctx: AudioContext | null = null;
  private mix: AudioMixSettings = { ...DEFAULT_AUDIO_MIX };
  private isVoiceDucking: boolean = false;
  private lastFootstepTime: number = 0;

  // Ambient river/village background loop nodes
  private bgmGainNode: GainNode | null = null;
  private bgmRunning: boolean = false;

  public setMixSettings(settings: AudioMixSettings) {
    this.mix = { ...settings };
    this.updateBgmGain();
  }

  public getMixSettings(): AudioMixSettings {
    return this.mix;
  }

  public setMuted(muted: boolean) {
    this.mix.soundEnabled = !muted;
    this.updateBgmGain();
  }

  // Khi nhân vật đang nói, giảm nhẹ âm lượng nhạc nền/môi trường (Audio Ducking)
  public setVoiceDucking(ducking: boolean) {
    this.isVoiceDucking = ducking;
    this.updateBgmGain();
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public startAmbientBgm() {
    if (this.bgmRunning || typeof window === 'undefined') return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Tạo âm thanh gió sông và tiếng sóng rì rầm rất nhẹ làm nền môi trường
      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const mod = 0.6 + 0.4 * Math.sin((i / bufferSize) * Math.PI * 2);
        data[i] = (Math.random() * 2 - 1) * 0.12 * mod;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.bgmGainNode = this.ctx.createGain();
      this.bgmRunning = true;
      this.updateBgmGain();

      source.connect(filter);
      filter.connect(this.bgmGainNode);
      this.bgmGainNode.connect(this.ctx.destination);
      source.start();
    } catch {
      // Ignore
    }
  }

  private updateBgmGain() {
    if (!this.bgmGainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (!this.mix.soundEnabled) {
      this.bgmGainNode.gain.setTargetAtTime(0.0001, now, 0.1);
      return;
    }
    const baseBgm = this.mix.bgmVolume * 0.25;
    const target = this.isVoiceDucking ? baseBgm * 0.22 : baseBgm;
    this.bgmGainNode.gain.setTargetAtTime(Math.max(0.0001, target), now, 0.15);
  }

  private getEffectiveSfxGain(base: number): number {
    if (!this.mix.soundEnabled) return 0;
    const duckFactor = this.isVoiceDucking ? 0.45 : 1.0;
    return base * this.mix.sfxVolume * duckFactor;
  }

  public playClick() {
    const level = this.getEffectiveSfxGain(0.14);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(level, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Ignore
    }
  }

  public playCipherTurn() {
    const level = this.getEffectiveSfxGain(0.16);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore
    }
  }

  public playChestUnlock() {
    const level = this.getEffectiveSfxGain(0.2);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Tiếng chốt đồng bật mở + hòa âm chuông vàng vang lên
      const freqs = [330, 440, 659.25, 880, 1318.5];
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        gain.gain.setValueAtTime(level * (i === 0 ? 0.7 : 0.9), now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  public playFootstep(surface: 'dirt' | 'wood' = 'dirt') {
    const level = this.getEffectiveSfxGain(0.06);
    if (level <= 0.001) return;
    const nowMs = Date.now();
    if (nowMs - this.lastFootstepTime < 260) return;
    this.lastFootstepTime = nowMs;

    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = surface === 'wood' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(surface === 'wood' ? 185 : 115, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.055);

      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Ignore
    }
  }

  public playAnvilStrike() {
    const level = this.getEffectiveSfxGain(0.12);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1320, 1760].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.35);

        gain.gain.setValueAtTime(level / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  public playSteamQuench() {
    const level = this.getEffectiveSfxGain(0.22);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.22));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Ignore
    }
  }

  public playWaveSplash() {
    const level = this.getEffectiveSfxGain(0.16);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.4;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(level, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Ignore
    }
  }

  public playWarDrumAndHorn() {
    const level = this.getEffectiveSfxGain(0.32);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const beats = [0, 0.28, 0.52, 0.72, 0.92, 1.12];
      beats.forEach((offset) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(115, now + offset);
        osc.frequency.exponentialRampToValueAtTime(42, now + offset + 0.22);

        gain.gain.setValueAtTime(level, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.24);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.24);
      });
    } catch {
      // Ignore
    }
  }

  public playClueFound() {
    const level = this.getEffectiveSfxGain(0.16);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392.0, 523.25, 587.33];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(level, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  public playSuccess() {
    const level = this.getEffectiveSfxGain(0.18);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(level, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  public playChapterVictory() {
    const level = this.getEffectiveSfxGain(0.15);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [
        [392.0, 523.25],
        [440.0, 587.33],
        [523.25, 659.25, 783.99],
        [659.25, 783.99, 1046.5]
      ];
      chords.forEach((chord, i) => {
        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.2);

          gain.gain.setValueAtTime(level, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.6);
        });
      });
    } catch {
      // Ignore
    }
  }

  public playError() {
    const level = this.getEffectiveSfxGain(0.18);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [220, 185].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(level * 0.8, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  // Âm thanh 3D Góc Nhìn Thứ Nhất: Nhặt Cổ Vật Phát Quang
  public playRelicFound() {
    const level = this.getEffectiveSfxGain(0.22);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880, 1108.7].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(level, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  // Âm thanh kéo căng dây nỏ thần
  public playCrossbowDraw() {
    const level = this.getEffectiveSfxGain(0.25);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Tiếng rít căng dây cung
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.4);
      gain.gain.setValueAtTime(level * 0.4, now);
      gain.gain.linearRampToValueAtTime(level, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  // Âm thanh bung nỏ thần: "Phựtttt - Vùuuu" xé toạc màn sương
  public playCrossbowRelease() {
    const level = this.getEffectiveSfxGain(0.35);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Tiếng bật dây nỏ
      const oscSnap = this.ctx.createOscillator();
      const gainSnap = this.ctx.createGain();
      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime(450, now);
      oscSnap.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gainSnap.gain.setValueAtTime(level, now);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      oscSnap.connect(gainSnap);
      gainSnap.connect(this.ctx.destination);
      oscSnap.start(now);
      oscSnap.stop(now + 0.15);

      // 2. Tiếng chùm tên xé gió
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
      const gainNoise = this.ctx.createGain();
      gainNoise.gain.setValueAtTime(level * 0.7, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Ignore
    }
  }

  // Âm thanh tên đồng cắm phập vào bia gỗ cờ giặc
  public playArrowHit() {
    const level = this.getEffectiveSfxGain(0.3);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  // Âm thanh tiếng trống đồng Đông Sơn rền vang hào hùng
  public playBronzeDrum() {
    const level = this.getEffectiveSfxGain(0.3);
    if (level <= 0.001) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.25, 0.5, 0.75, 1.0].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95, now + delay);
        osc.frequency.exponentialRampToValueAtTime(55, now + delay + 0.4);
        gain.gain.setValueAtTime(level, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.5);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundController();
