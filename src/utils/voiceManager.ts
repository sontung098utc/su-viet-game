import type { DialogueLine } from '../types';
import { CHARACTER_VOICE_CONFIGS } from '../data/voiceDialogue';
import { sound } from './sound';

export type VoicePlaybackMode =
  | 'idle'
  | 'loading'
  | 'file'
  | 'browser_tts'
  | 'subtitle_only'
  | 'blocked_autoplay'
  | 'error_load';

export interface VoicePlaybackState {
  isPlaying: boolean;
  activeLineId: string | null;
  mode: VoicePlaybackMode;
  errorMessage: string | null;
}

type StateListener = (state: VoicePlaybackState) => void;

class VoiceManager {
  private currentAudio: HTMLAudioElement | null = null;
  private preloadedCache: Map<string, HTMLAudioElement> = new Map();
  private activeLine: DialogueLine | null = null;
  private voiceEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private voiceVolume: number = 0.9;
  private useBrowserTtsFallback: boolean = false;
  private audioUnlocked: boolean = false;
  private playToken: number = 0;

  private state: VoicePlaybackState = {
    isPlaying: false,
    activeLineId: null,
    mode: 'idle',
    errorMessage: null,
  };
  private listeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Dừng tiếng ngay khi chuyển ứng dụng hoặc ẩn tab trên điện thoại để tránh chồng tiếng khi quay lại
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        }
      });
      window.addEventListener('pagehide', () => {
        this.stop();
      });
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(next: Partial<VoicePlaybackState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((l) => l(this.state));
  }

  /**
   * Mở khóa âm thanh trên trình duyệt di động (iOS Safari / Chrome Mobile) ngay sau thao tác chạm đầu tiên của người chơi.
   */
  public unlockAudio() {
    if (this.audioUnlocked || typeof window === 'undefined') return;
    this.audioUnlocked = true;
    try {
      sound.startAmbientBgm();
    } catch {
      // Ignore
    }
  }

  public syncSettings(settings: {
    soundEnabled: boolean;
    voiceEnabled: boolean;
    voiceVolume: number;
  }) {
    this.soundEnabled = settings.soundEnabled;
    this.voiceEnabled = settings.voiceEnabled;
    this.voiceVolume = Math.max(0, Math.min(1, settings.voiceVolume));

    if (!this.soundEnabled || !this.voiceEnabled) {
      this.stop();
      return;
    }

    if (this.currentAudio && this.activeLine) {
      const cfg = CHARACTER_VOICE_CONFIGS[this.activeLine.speakerId];
      const gain = cfg ? cfg.gainMultiplier : 1.0;
      this.currentAudio.volume = Math.max(0, Math.min(1, this.voiceVolume * gain));
    }
  }

  public setBrowserTtsFallback(enabled: boolean) {
    this.useBrowserTtsFallback = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getBrowserTtsFallback(): boolean {
    return this.useBrowserTtsFallback;
  }

  /**
   * Chỉ tải trước (preload) các câu thoại thuộc cuộc trò chuyện hiện tại,
   * đồng thời giải phóng bớt cache cũ nếu vượt quá 16 file để tiết kiệm RAM trên điện thoại.
   */
  public preloadDialogueLines(lines: DialogueLine[]) {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;

    if (this.preloadedCache.size > 16) {
      const keepSrcs = new Set(lines.map((l) => l.audioSrc).filter(Boolean));
      for (const [src, audioEl] of this.preloadedCache.entries()) {
        if (!keepSrcs.has(src) && audioEl !== this.currentAudio) {
          audioEl.src = '';
          this.preloadedCache.delete(src);
        }
      }
    }

    lines.forEach((line) => {
      if (
        line.audioSrc &&
        line.audioStatus !== 'missing' &&
        !this.preloadedCache.has(line.audioSrc)
      ) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = line.audioSrc;
          this.preloadedCache.set(line.audioSrc, audio);
        } catch {
          // Ignore preload errors in headless test environments
        }
      }
    });
  }

  /**
   * Dừng ngay lập tức mọi giọng đang phát và khôi phục nhạc nền.
   * Tăng playToken để hủy mọi callback bất đồng bộ của câu cũ (tránh bộ quản lý giọng dừng nhầm câu mới).
   */
  public stop() {
    this.playToken += 1;

    if (this.currentAudio) {
      try {
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.oncanplaythrough = null;
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    sound.setVoiceDucking(false);
    this.setState({
      isPlaying: false,
      activeLineId: this.activeLine ? this.activeLine.id : null,
      mode: 'idle',
      errorMessage: null,
    });
  }

  /**
   * Phát giọng nói của một câu thoại.
   * Phân biệt rõ: thiếu file vs trình duyệt chặn autoplay vs lỗi đường dẫn/mạng.
   */
  public playLine(line: DialogueLine) {
    this.activeLine = line;
    this.stop();
    const currentToken = this.playToken;

    if (!this.soundEnabled || !this.voiceEnabled) {
      this.setState({
        isPlaying: false,
        activeLineId: line.id,
        mode: 'subtitle_only',
        errorMessage: null,
      });
      return;
    }

    const cfg = CHARACTER_VOICE_CONFIGS[line.speakerId];
    const gain = cfg ? cfg.gainMultiplier : 1.0;
    const effectiveVolume = Math.max(0, Math.min(1, this.voiceVolume * gain));

    if (line.audioSrc && line.audioStatus !== 'missing' && typeof Audio !== 'undefined') {
      try {
        let audio = this.preloadedCache.get(line.audioSrc);
        if (!audio) {
          audio = new Audio(line.audioSrc);
          this.preloadedCache.set(line.audioSrc, audio);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }

        audio.volume = effectiveVolume;
        this.currentAudio = audio;

        sound.setVoiceDucking(true);
        this.setState({
          isPlaying: true,
          activeLineId: line.id,
          mode: 'file',
          errorMessage: null,
        });

        audio.onended = () => {
          if (this.playToken !== currentToken) return;
          this.currentAudio = null;
          sound.setVoiceDucking(false);
          this.setState({
            isPlaying: false,
            activeLineId: line.id,
            mode: 'file',
            errorMessage: null,
          });
        };

        audio.onerror = () => {
          if (this.playToken !== currentToken) return;
          this.currentAudio = null;
          sound.setVoiceDucking(false);
          this.setState({
            isPlaying: false,
            activeLineId: line.id,
            mode: 'error_load',
            errorMessage: 'Không tải được file âm thanh. Chạm để thử nghe lại.',
          });
        };

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: unknown) => {
            if (this.playToken !== currentToken) return;
            this.currentAudio = null;
            sound.setVoiceDucking(false);

            const errName =
              err && typeof err === 'object' && 'name' in err
                ? String((err as { name?: string }).name)
                : '';

            if (errName === 'NotAllowedError') {
              // Trình duyệt di động chặn tự động phát trước khi có tương tác trực tiếp
              this.setState({
                isPlaying: false,
                activeLineId: line.id,
                mode: 'blocked_autoplay',
                errorMessage: 'Trình duyệt tạm chặn tự phát tiếng. Chạm nút bên cạnh để nghe.',
              });
            } else {
              this.fallbackOrReportError(line, currentToken);
            }
          });
        }
        return;
      } catch {
        this.fallbackOrReportError(line, currentToken);
        return;
      }
    }

    this.fallbackOrReportError(line, currentToken);
  }

  private fallbackOrReportError(line: DialogueLine, token: number) {
    if (this.playToken !== token) return;

    if (
      this.useBrowserTtsFallback &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    ) {
      try {
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = 'vi-VN';
        const cfg = CHARACTER_VOICE_CONFIGS[line.speakerId];
        if (cfg) {
          utterance.pitch = cfg.fallbackPitch;
          utterance.rate = cfg.fallbackRate;
        }
        utterance.volume = this.voiceVolume;

        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find((v) => v.lang.toLowerCase().includes('vi'));
        if (viVoice) {
          utterance.voice = viVoice;
        }

        sound.setVoiceDucking(true);
        this.setState({
          isPlaying: true,
          activeLineId: line.id,
          mode: 'browser_tts',
          errorMessage: null,
        });

        utterance.onend = () => {
          if (this.playToken !== token) return;
          sound.setVoiceDucking(false);
          this.setState({
            isPlaying: false,
            activeLineId: line.id,
            mode: 'browser_tts',
            errorMessage: null,
          });
        };

        utterance.onerror = () => {
          if (this.playToken !== token) return;
          sound.setVoiceDucking(false);
          this.setState({
            isPlaying: false,
            activeLineId: line.id,
            mode: 'error_load',
            errorMessage: 'Chưa thể phát giọng đọc lúc này. Chạm để nghe lại.',
          });
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        // Fallback below
      }
    }

    sound.setVoiceDucking(false);
    this.setState({
      isPlaying: false,
      activeLineId: line.id,
      mode: line.audioStatus === 'missing' ? 'subtitle_only' : 'error_load',
      errorMessage:
        line.audioStatus === 'missing'
          ? null
          : 'Không thể phát tự động trên thiết bị. Chạm "Nghe lại" để phát tiếng.',
    });
  }

  /**
   * Nghe lại câu thoại đang mở (sau khi người chơi chạm trực tiếp trên mobile)
   */
  public replay() {
    this.unlockAudio();
    if (this.activeLine) {
      this.playLine(this.activeLine);
    }
  }
}

export const voiceManager = new VoiceManager();
