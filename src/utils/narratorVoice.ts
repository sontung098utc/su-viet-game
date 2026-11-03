// Bộ Quản Lý Giọng Người Dẫn Chuyện Lịch Sử (Narrator Voice Engine)
// Sử dụng Web Speech Synthesis với giọng tiếng Việt tự nhiên + hiệu ứng chuông khánh đồng & trống trận

import { sound } from './sound';
import { vietnameseAmbientMusic } from './vietnameseAmbientMusic';

export interface NarrationSegment {
  id: string;
  actTitle: string; // Tên Hồi
  chapterTitle: string;
  historicalEra: string;
  sourceQuote: string; // Trích từ Đại Việt Sử Ký Toàn Thư
  content: string; // Lời dẫn chuyện truyền cảm hứng
  speakerRole: string; // "Người Dẫn Chuyện Sử Việt" | "Thần Kim Quy" | "Tướng Quân Cao Lỗ" | "Vua An Dương Vương"
}

class NarratorVoiceEngine {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Pre-warm voices
      };
    }
  }

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking);
    return () => this.listeners.delete(listener);
  }

  private setSpeaking(speaking: boolean) {
    this.isSpeaking = speaking;
    this.listeners.forEach((l) => l(speaking));
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  public isVoiceEnabled(): boolean {
    return this.enabled;
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public speak(text: string, onEnd?: () => void) {
    this.stop();
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Âm thanh khánh đồng vang lên trước lời dẫn
      sound.playRelicFound();
      vietnameseAmbientMusic.setVoiceDucking(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95; // Nhịp kể chuyện điềm tĩnh, trang nghiêm
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.toLowerCase().includes('vi'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
        vietnameseAmbientMusic.setVoiceDucking(false);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.setSpeaking(false);
        vietnameseAmbientMusic.setVoiceDucking(false);
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.setSpeaking(false);
      vietnameseAmbientMusic.setVoiceDucking(false);
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    this.setSpeaking(false);
    vietnameseAmbientMusic.setVoiceDucking(false);
    this.currentUtterance = null;
  }
}

export const narratorVoice = new NarratorVoiceEngine();
