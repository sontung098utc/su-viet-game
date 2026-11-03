// Trình phát nhạc nền Low-Fi Nhạc Cụ Truyền Thống Sử Việt (Web Audio API)
// Mô phỏng âm hưởng ngũ cung Việt Nam: Đàn Tranh, Đàn Bầu (portamento), Sáo Trúc, Chuông Đồng, Tiếng Nước Sông Bạch Đằng.

export interface AmbientTrack {
  id: string;
  title: string;
  subtitle: string;
  instruments: string;
  description: string;
  bpm: number;
  scaleType: 'NAM' | 'BAC' | 'OAN';
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'bach_dang_waves',
    title: 'Sóng Nước Bạch Đằng',
    subtitle: 'Low-Fi Ngũ Cung Nam Bộ & Sông Nước',
    instruments: 'Đàn Tranh, Sáo Trúc, Tiếng Sóng Rì Rầm',
    description: 'Âm hưởng thanh bình ven sông Bạch Đằng trước giờ giáp trận, kết hợp tiếng sáo trúc vút cao và gảy đàn tranh trầm bổng.',
    bpm: 62,
    scaleType: 'NAM',
  },
  {
    id: 'co_loa_moonlight',
    title: 'Trăng Soi Thành Cổ',
    subtitle: 'Low-Fi Huyền Thoại Cổ Loa',
    instruments: 'Đàn Bầu (Luyến Láy), Chuông Đồng, Trống Bản',
    description: 'Giai điệu hoài niệm huyền tích Nỏ Thần với tiếng độc huyền cầm (Đàn Bầu) rung luyến và khánh đồng vang vọng màn sương.',
    bpm: 58,
    scaleType: 'BAC',
  },
  {
    id: 'dong_a_dawn',
    title: 'Bình Minh Làng Chài',
    subtitle: 'Low-Fi Dân Ca & Lửa Rèn',
    instruments: 'Đàn Đáy, Chuông Gió Tre, Gõ Nhịp Song Loan',
    description: 'Tiết tấu nhẹ nhàng mộc mạc của làng rèn vạt cọc gỗ ven sông, ấm áp và thư thái.',
    bpm: 66,
    scaleType: 'OAN',
  },
];

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0..1
  currentTrackIndex: number;
  lofiAmbientEnabled: boolean;
  currentBeat: number;
}

type Listener = (state: PlayerState) => void;

class VietnameseAmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.42; // default comfortable background level
  private currentTrackIndex = 0;
  private lofiAmbientEnabled = true;
  private currentBeat = 0;

  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientNoiseGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;

  private schedulerTimer: number | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private isDucking = false;

  private listeners: Set<Listener> = new Set();

  constructor() {
    // Tải cấu hình đã lưu từ localStorage nếu có
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('viet_ambient_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
        const savedVol = localStorage.getItem('viet_ambient_vol');
        if (savedVol !== null) {
          const v = parseFloat(savedVol);
          if (!isNaN(v) && v >= 0 && v <= 1) this.volume = v;
        }
        const savedTrack = localStorage.getItem('viet_ambient_track');
        if (savedTrack !== null) {
          const t = parseInt(savedTrack, 10);
          if (!isNaN(t) && t >= 0 && t < AMBIENT_TRACKS.length) {
            this.currentTrackIndex = t;
          }
        }
      } catch {
        // LocalStorage fallback
      }
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public getState(): PlayerState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrackIndex: this.currentTrackIndex,
      lofiAmbientEnabled: this.lofiAmbientEnabled,
      currentBeat: this.currentBeat,
    };
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    // Chuỗi xử lý âm thanh:
    // Music & Instruments -> lofiFilter (cắt tần số cao tạo chất ấm Low-Fi) -> musicGain -> masterGain -> destination
    this.lofiFilter = this.ctx.createBiquadFilter();
    this.lofiFilter.type = 'lowpass';
    this.lofiFilter.frequency.setValueAtTime(2800, this.ctx.currentTime); // Ấm áp như băng cassette cổ

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.updateGainLevels();

    this.lofiFilter.connect(this.musicGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Tạo âm thanh nền nước chảy & gió tre Lo-Fi
    this.initAmbientNoise();
  }

  private initAmbientNoise() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      const ch0 = buffer.getChannelData(0);
      const ch1 = buffer.getChannelData(1);

      // Pink-ish noise mô phỏng tiếng sóng sông và xào xạc rặng tre
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;

        // Sóng nước vỗ nhịp thoai thoải
        const swell = 0.6 + 0.4 * Math.sin((i / bufferSize) * Math.PI * 4);
        ch0[i] = pink * swell;
        ch1[i] = pink * (0.6 + 0.4 * Math.cos((i / bufferSize) * Math.PI * 4));
      }

      this.ambientSource = this.ctx.createBufferSource();
      this.ambientSource.buffer = buffer;
      this.ambientSource.loop = true;

      const ambFilter = this.ctx.createBiquadFilter();
      ambFilter.type = 'bandpass';
      ambFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      ambFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.ambientNoiseGain = this.ctx.createGain();
      const ambVol = this.lofiAmbientEnabled ? 0.08 : 0.0001;
      this.ambientNoiseGain.gain.setValueAtTime(ambVol, this.ctx.currentTime);

      this.ambientSource.connect(ambFilter);
      ambFilter.connect(this.ambientNoiseGain);
      this.ambientNoiseGain.connect(this.masterGain);

      this.ambientSource.start();
    } catch {
      // Audio buffer fallback
    }
  }

  private updateGainLevels() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
      return;
    }
    const duckMult = this.isDucking ? 0.35 : 1.0;
    const targetGain = Math.max(0.0001, this.volume * duckMult);
    this.masterGain.gain.setTargetAtTime(targetGain, now, 0.12);

    if (this.ambientNoiseGain) {
      const ambTarget = this.lofiAmbientEnabled ? 0.08 * duckMult : 0.0001;
      this.ambientNoiseGain.gain.setTargetAtTime(ambTarget, now, 0.1);
    }
  }

  // --- Các thang âm ngũ cung cổ truyền Việt Nam ---
  // Điệu Nam: D3, F3, G3, A3, C4, D4, F4, G4, A4, C5 (buồn, sâu lắng, sông nước)
  private readonly scaleNam = [
    146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25, 587.33,
  ];

  // Điệu Bắc: C3, D3, F3, G3, A3, C4, D4, F4, G4, A4 (hào sảng, cung đình, trang nghiêm)
  private readonly scaleBac = [
    130.81, 146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0, 523.25,
  ];

  // Điệu Oán / Dân Ca: D3, E3, G3, A3, B3, D4, E4, G4, A4 (ấm áp, dân gian làng quê)
  private readonly scaleOan = [
    146.83, 164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33,
  ];

  private getActiveScale(): number[] {
    const track = AMBIENT_TRACKS[this.currentTrackIndex];
    if (track.scaleType === 'BAC') return this.scaleBac;
    if (track.scaleType === 'OAN') return this.scaleOan;
    return this.scaleNam;
  }

  // Tổng hợp tiếng Đàn Tranh (Plucked 16-string zither)
  private playDanTranhNote(freq: number, time: number, duration: number = 1.2, vel: number = 0.22) {
    if (!this.ctx || !this.lofiFilter) return;

    // Transient móng gảy
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2.01, time); // Họa âm dây đồng

    // Bộ lọc định hình thân đàn gỗ ngô đồng
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(freq * 1.5, time);
    bodyFilter.Q.setValueAtTime(2.0, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vel, time + 0.012); // Attack cực bén của móng gảy
    gain.gain.exponentialRampToValueAtTime(vel * 0.35, time + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(bodyFilter);
    osc2.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(this.lofiFilter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  // Tổng hợp tiếng Đàn Bầu (Monochord với kỹ thuật nhấn luyến bồi âm đặc trưng)
  private playDanBauNote(freq: number, time: number, duration: number = 1.8, vel: number = 0.25) {
    if (!this.ctx || !this.lofiFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';

    // Rung luyến cần đàn bầu (Portamento): âm thanh trượt nhẹ từ 2-3 bán âm lên nốt chính
    const startFreq = freq * 0.94;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.16);

    // Kỹ thuật rung tay uốn cần (vibrato 5Hz)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.2, time);
    vibratoGain.gain.setValueAtTime(freq * 0.018, time); // Rung ~1.8% độ cao

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vel, time + 0.09); // Attack mượt mà
    gain.gain.exponentialRampToValueAtTime(vel * 0.6, time + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.lofiFilter);

    vibrato.start(time + 0.12);
    vibrato.stop(time + duration);
    osc.start(time);
    osc.stop(time + duration);
  }

  // Tổng hợp tiếng Sáo Trúc (Bamboo Flute)
  private playSaoTrucNote(freq: number, time: number, duration: number = 2.0, vel: number = 0.18) {
    if (!this.ctx || !this.lofiFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Nhẹ nhàng lấy hơi và thổi rung
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(4.8, time);
    vibratoGain.gain.setValueAtTime(freq * 0.012, time);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vel, time + 0.14); // Tiếng gió lùa vào lỗ sáo
    gain.gain.exponentialRampToValueAtTime(vel * 0.7, time + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.lofiFilter);

    vibrato.start(time + 0.1);
    vibrato.stop(time + duration);
    osc.start(time);
    osc.stop(time + duration);
  }

  // Tổng hợp tiếng Chuông Đồng / Khánh Chùa ngân nga
  private playBronzeBell(freq: number, time: number, vel: number = 0.15) {
    if (!this.ctx || !this.lofiFilter) return;

    // Họa âm phi điều hòa kim loại đặc trưng của chuông đồng Việt Nam
    const bellPartials = [1.0, 1.48, 2.04, 2.78];
    bellPartials.forEach((ratio, idx) => {
      if (!this.ctx || !this.lofiFilter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, time);

      const decayTime = 2.4 - idx * 0.4;
      gain.gain.setValueAtTime(vel / (idx + 1), time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + decayTime);

      osc.connect(gain);
      gain.connect(this.lofiFilter);

      osc.start(time);
      osc.stop(time + decayTime);
    });
  }

  // Nhịp Trống Bản / Gõ Phách nhẹ Low-Fi (đệm êm ái)
  private playFolkDrum(time: number, isKick: boolean) {
    if (!this.ctx || !this.lofiFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isKick) {
      // Tiếng trống bản gỗ trầm ấm
      osc.type = 'sine';
      osc.frequency.setValueAtTime(88, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.14);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    } else {
      // Tiếng gõ phách tre mộc
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, time);
      osc.frequency.exponentialRampToValueAtTime(140, time + 0.05);

      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.lofiFilter);

    osc.start(time);
    osc.stop(time + (isKick ? 0.25 : 0.08));
  }

  // --- Scheduler vòng lặp âm nhạc theo thời gian thực ---
  private scheduleMusic() {
    if (!this.isPlaying || !this.ctx) return;

    const track = AMBIENT_TRACKS[this.currentTrackIndex];
    const beatDuration = 60 / track.bpm;
    const lookahead = 0.2; // 200ms

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.playStep(this.nextNoteTime, this.currentStep);
      this.nextNoteTime += beatDuration / 2; // Nhịp 8th note
      this.currentStep = (this.currentStep + 1) % 32; // Vòng 16 phách (4 khuôn nhạc 4/4)
      this.currentBeat = Math.floor(this.currentStep / 2) + 1;
    }

    this.schedulerTimer = window.setTimeout(() => {
      this.scheduleMusic();
      this.notify();
    }, 80);
  }

  // Phối âm cho từng bước (Step 0..31)
  private playStep(time: number, step: number) {
    const scale = this.getActiveScale();
    const track = AMBIENT_TRACKS[this.currentTrackIndex];

    // 1. Trống bản & nhịp phách
    if (step % 8 === 0) {
      this.playFolkDrum(time, true); // Trống cái nhịp 1
    } else if (step % 8 === 4) {
      this.playFolkDrum(time, false); // Gõ phách nhịp 3
    }

    // 2. Chuông đồng ngân vang đầu mỗi đoạn 16 phách
    if (step === 0 || step === 16) {
      const bellFreq = scale[0] * 2;
      this.playBronzeBell(bellFreq, time, 0.12);
    }

    // 3. Đàn Tranh dạo ngón (Arpeggios)
    if (step % 2 === 0) {
      // Chọn nốt ngũ cung theo quy luật giai điệu truyền thống
      const chordNotes = [
        scale[0], scale[2], scale[3], scale[4],
        scale[1], scale[3], scale[4], scale[5],
        scale[0], scale[3], scale[5], scale[6],
        scale[2], scale[4], scale[6], scale[7],
      ];
      const noteIdx = (step / 2) % chordNotes.length;
      const freq = chordNotes[noteIdx];
      this.playDanTranhNote(freq, time, 1.4, 0.16);

      // Thỉnh thoảng gảy nốt hoa mỹ (grace note / á)
      if (step === 6 || step === 14 || step === 22 || step === 30) {
        setTimeout(() => {
          if (!this.ctx) return;
          this.playDanTranhNote(freq * 1.5, time + 0.12, 0.6, 0.09);
        }, 0);
      }
    }

    // 4. Đàn Bầu hoặc Sáo Trúc diễn xướng câu chính
    if (track.scaleType === 'BAC') {
      // Thành Cổ Loa: Đàn Bầu chủ đạo
      const danBauMelody: Record<number, number> = {
        0: scale[4],
        4: scale[5],
        8: scale[7],
        12: scale[5],
        16: scale[4],
        20: scale[3],
        24: scale[2],
        28: scale[0],
      };
      if (danBauMelody[step]) {
        this.playDanBauNote(danBauMelody[step], time, 2.2, 0.24);
      }
    } else {
      // Sông Nước Bạch Đằng & Làng Chài: Sáo Trúc ngân nga
      const fluteMelody: Record<number, number> = {
        2: scale[5],
        6: scale[6],
        10: scale[7],
        14: scale[6],
        18: scale[5],
        22: scale[4],
        26: scale[3],
        30: scale[2],
      };
      if (fluteMelody[step]) {
        this.playSaoTrucNote(fluteMelody[step], time, 2.4, 0.19);
      }
    }
  }

  // --- Public Controls ---
  public play() {
    this.initAudio();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.currentStep = 0;
    this.updateGainLevels();
    this.scheduleMusic();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('viet_ambient_muted', String(this.isMuted));
    }
    // Nếu bấm bật tiếng khi chưa play, tự động play luôn
    if (!this.isMuted && !this.isPlaying) {
      this.play();
    } else {
      this.updateGainLevels();
      this.notify();
    }
  }

  public setMuted(muted: boolean) {
    if (this.isMuted === muted) return;
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('viet_ambient_muted', String(this.isMuted));
    }
    this.updateGainLevels();
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('viet_ambient_vol', String(this.volume));
    }
    this.updateGainLevels();
    this.notify();
  }

  public setTrack(index: number) {
    if (index < 0 || index >= AMBIENT_TRACKS.length) return;
    this.currentTrackIndex = index;
    this.currentStep = 0;
    if (typeof window !== 'undefined') {
      localStorage.setItem('viet_ambient_track', String(index));
    }
    this.notify();
  }

  public nextTrack() {
    const next = (this.currentTrackIndex + 1) % AMBIENT_TRACKS.length;
    this.setTrack(next);
  }

  public prevTrack() {
    const prev = (this.currentTrackIndex - 1 + AMBIENT_TRACKS.length) % AMBIENT_TRACKS.length;
    this.setTrack(prev);
  }

  public toggleLoFiAmbient() {
    this.lofiAmbientEnabled = !this.lofiAmbientEnabled;
    this.updateGainLevels();
    this.notify();
  }

  // Khi nhân vật trong game hội thoại (Voiceover), hạ nhẹ âm lượng nhạc nền
  public setVoiceDucking(ducking: boolean) {
    this.isDucking = ducking;
    this.updateGainLevels();
  }
}

export const vietnameseAmbientMusic = new VietnameseAmbientMusicEngine();
