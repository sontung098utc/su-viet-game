import React, { useEffect, useState } from 'react';
import { Volume2, BookOpen, X, Sparkles, ChevronRight, Pause } from 'lucide-react';
import { HISTORICAL_NARRATIONS, type NarrationAct } from '../../data/chapterCoLoa';
import { narratorVoice } from '../../utils/narratorVoice';
import { sound } from '../../utils/sound';

interface StoryNarrationModalProps {
  actId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onProceed?: () => void;
}

export const StoryNarrationModal: React.FC<StoryNarrationModalProps> = ({
  actId,
  isOpen,
  onClose,
  onProceed,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const act: NarrationAct =
    (actId && HISTORICAL_NARRATIONS[actId]) || HISTORICAL_NARRATIONS.ACT_1_BUILD_CITADEL;

  useEffect(() => {
    const unsub = narratorVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  // Tự động đọc lời dẫn khi mở modal nếu người chơi bật tiếng
  useEffect(() => {
    if (isOpen && act) {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      sound.playBronzeDrum();
      narratorVoice.speak(act.scriptText);
    } else {
      narratorVoice.stop();
    }
    return () => {
      narratorVoice.stop();
    };
  }, [isOpen, act]);

  const handleToggleVoice = () => {
    if (isSpeaking) {
      narratorVoice.stop();
    } else {
      narratorVoice.speak(act.scriptText);
    }
  };

  const handleCloseAndProceed = () => {
    narratorVoice.stop();
    onClose();
    if (onProceed) onProceed();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-5 sm:p-7 rounded-2xl bg-parchment-100 border-2 border-bronze shadow-2xl wood-frame text-lacquer overflow-hidden">
        {/* Họa tiết góc cổ phong */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-bronze pointer-events-none opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-parchment-300">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-crimson text-white flex items-center justify-center font-bold shadow-md">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-crimson">
                {act.historicalPeriod}
              </span>
              <h3 className="font-title font-bold text-lg sm:text-xl text-lacquer leading-tight">
                {act.title}
              </h3>
            </div>
          </div>
          <button
            onClick={handleCloseAndProceed}
            className="p-1.5 rounded-full hover:bg-parchment-300 text-lacquer/60 hover:text-lacquer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trích dẫn Đại Việt Sử Ký Toàn Thư */}
        <div className="bg-parchment-200/90 p-3 rounded-xl border border-bronze/40 mb-4 text-xs font-serif italic text-lacquer/90 shadow-inner leading-relaxed">
          <div className="font-sans font-bold text-[10px] uppercase text-bronze-dark not-italic mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-crimson" />
            <span>Trích Đại Việt Sử Ký Toàn Thư (Ngoại kỷ Quyển I):</span>
          </div>
          "{act.dvskttSource}"
        </div>

        {/* Lời Người Dẫn Chuyện */}
        <div className="p-4 rounded-xl bg-parchment-50/90 border border-parchment-300 mb-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-crimson mb-2 pb-1.5 border-b border-parchment-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson animate-ping" />
              Lời Dẫn: {act.speaker}
            </span>
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-crimson/15 text-crimson border-crimson/30 animate-pulse'
                  : 'bg-emerald-600/15 text-emerald-800 border-emerald-600/30'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Đang đọc...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span>Nghe giọng đọc</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-lacquer/90 font-serif leading-relaxed text-justify">
            {act.scriptText}
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-parchment-300">
          <button
            onClick={handleCloseAndProceed}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-crimson to-amber-700 hover:from-crimson-light hover:to-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>Tiến Vào Khám Phá Thành Cổ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
