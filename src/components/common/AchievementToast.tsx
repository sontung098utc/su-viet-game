import React, { useEffect } from 'react';
import { Trophy, X, ArrowRight } from 'lucide-react';
import { AchievementSeal } from './AchievementSeal';
import type { UserAchievement } from '../../types';

interface AchievementToastProps {
  achievement: UserAchievement | null;
  onClose: () => void;
  onOpenAchievements: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
  onOpenAchievements,
}) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5500);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      onClick={() => {
        onClose();
        onOpenAchievements();
      }}
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-gradient-to-r from-amber-950/95 via-lacquer to-amber-950/95 border-2 border-amber-400 rounded-2xl p-3.5 shadow-2xl text-amber-100 flex items-center justify-between gap-3 cursor-pointer hover:brightness-110 transition-all animate-bounceIn select-none backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 scale-90">
          <AchievementSeal achievement={achievement} size="sm" showDetails={false} />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mở Khóa Thành Tựu Mới!</span>
          </div>
          <h4 className="font-title font-bold text-xs sm:text-sm text-white leading-tight">
            {achievement.title}
          </h4>
          <p className="text-[11px] text-amber-200/80 font-serif line-clamp-1">
            {achievement.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <ArrowRight className="w-4 h-4 text-amber-400" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg hover:bg-white/10 text-amber-200 transition-colors"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
