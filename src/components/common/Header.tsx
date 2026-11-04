import React from 'react';
import { useGame } from '../../context/GameContext';
import { Volume2, VolumeX, BookOpen, Home, HelpCircle, Scroll, Compass } from 'lucide-react';
import { HISTORICAL_FACTS_CH1 } from '../../data/chapter1';

interface HeaderProps {
  onOpenHowToPlay?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowToPlay }) => {
  const { progress, setScreen, toggleSound, openCodex, openDailyMissions, openHistoricalMissions } = useGame();
  const unlockedCount = progress.discoveredFacts.length;
  const totalCount = HISTORICAL_FACTS_CH1.length;
  const scholarPoints = progress.scholarPoints || 0;
  const pendingDaily = progress.dailyMissions?.missions?.filter((m) => !m.completed).length ?? 3;

  return (
    <header className="sticky top-0 z-30 bg-parchment-100/95 backdrop-blur-md border-b-2 border-parchment-300 px-3 sm:px-6 py-2.5 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div
          onClick={() => progress.playerName && setScreen('GAME')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-full bg-crimson border-2 border-bronze flex items-center justify-center text-parchment-100 font-bold shadow-md">
            <span>Sử</span>
          </div>
          <div>
            <div className="font-title font-bold text-base sm:text-lg text-lacquer tracking-wide flex items-center gap-1.5 leading-tight">
              MẬT MÃ SỬ VIỆT
            </div>
            <div className="text-[11px] text-lacquer/70 hidden sm:block font-serif italic">
              Phiêu lưu nhập vai lịch sử 2D — Năm 938
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => openHistoricalMissions()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-300 text-xs sm:text-sm font-semibold text-red-950 transition-colors shadow-sm"
            title="Sa bàn tác chiến & Nhiệm vụ sử học chuyên sâu"
          >
            <Compass className="w-4 h-4 text-crimson" />
            <span className="hidden sm:inline">Sa Bàn Sử</span>
          </button>

          <button
            onClick={openDailyMissions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs sm:text-sm font-semibold text-amber-950 transition-colors shadow-sm relative"
            title="Nhiệm vụ sử học hằng ngày"
          >
            <Scroll className="w-4 h-4 text-amber-800" />
            <span className="hidden xs:inline">Nhiệm vụ</span>
            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded">
              {scholarPoints}đ
            </span>
            {pendingDaily > 0 && (
              <span className="w-2 h-2 rounded-full bg-crimson absolute -top-0.5 -right-0.5 ring-2 ring-parchment-100 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => openCodex()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-parchment-200 hover:bg-parchment-300 border border-parchment-400 text-xs sm:text-sm font-semibold text-lacquer transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-crimson" />
            <span>Sổ tay</span>
            <span className="bg-crimson text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {unlockedCount}/{totalCount}
            </span>
          </button>

          {onOpenHowToPlay && (
            <button
              onClick={onOpenHowToPlay}
              className="p-2 rounded-lg bg-parchment-200 hover:bg-parchment-300 border border-parchment-300 text-lacquer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-parchment-200 border border-parchment-300 text-lacquer"
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setScreen('START')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-river-500 hover:bg-river-600 text-white text-xs sm:text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Trang đầu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
