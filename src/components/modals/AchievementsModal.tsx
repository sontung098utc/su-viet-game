import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { evaluateAchievements } from '../../data/achievements';
import { AchievementSeal } from '../common/AchievementSeal';
import { AchievementDetailModal } from '../common/AchievementDetailModal';
import { sound } from '../../utils/sound';
import type { UserAchievement, AchievementCategory } from '../../types';
import {
  X,
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  BookOpen,
  Compass,
  KeyRound,
  Shield,
  Layers,
} from 'lucide-react';

export const AchievementsModal: React.FC = () => {
  const {
    isAchievementsOpen,
    closeAchievements,
    progress,
    openCodex,
    openHistoricalMissions,
  } = useGame();

  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('all');
  const [onlyUnlocked, setOnlyUnlocked] = useState<boolean>(false);
  const [selectedAchievement, setSelectedAchievement] = useState<UserAchievement | null>(null);

  // Tính toán thời gian chơi thực tế
  const effectivePlayTimeSeconds = useMemo(() => {
    if (progress.totalPlayTimeSeconds && progress.totalPlayTimeSeconds > 0) {
      return progress.totalPlayTimeSeconds;
    }
    return 240;
  }, [progress.totalPlayTimeSeconds]);

  // Đánh giá tất cả thành tựu
  const achievements = useMemo(
    () => evaluateAchievements(progress, effectivePlayTimeSeconds),
    [progress, effectivePlayTimeSeconds]
  );

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.isUnlocked).length,
    [achievements]
  );

  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Đếm theo bậc (tier)
  const tierCounts = useMemo(() => {
    const unlockedList = achievements.filter((a) => a.isUnlocked);
    return {
      gold: unlockedList.filter((a) => a.tier === 'gold').length,
      silver: unlockedList.filter((a) => a.tier === 'silver').length,
      jade: unlockedList.filter((a) => a.tier === 'jade').length,
      bronze: unlockedList.filter((a) => a.tier === 'bronze').length,
    };
  }, [achievements]);

  // Lọc danh sách theo Tab
  const filteredAchievements = useMemo(() => {
    let list = achievements;
    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (onlyUnlocked) {
      list = list.filter((a) => a.isUnlocked);
    }
    return list;
  }, [achievements, activeCategory, onlyUnlocked]);

  if (!isAchievementsOpen) return null;

  const handleBadgeClick = (ach: UserAchievement) => {
    sound.playClick();
    setSelectedAchievement(ach);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-lacquer-dark/85 backdrop-blur-sm animate-fadeIn select-none"
      onClick={closeAchievements}
    >
      <div
        className="bg-parchment-50 w-full max-w-4xl max-h-[92dvh] rounded-3xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-parchment-200 border-b border-parchment-300 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white flex items-center justify-center text-lacquer shadow-md shrink-0">
              <Trophy className="w-5 h-5 text-crimson" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title text-base sm:text-lg font-bold text-lacquer leading-tight">
                  Kho Báu Thành Tựu & Huy Hiệu Lịch Sử
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
                  {unlockedCount}/{totalCount} Đã Mở Khóa ({completionPercentage}%)
                </span>
              </div>
              <p className="text-[11px] text-lacquer/70 font-serif">
                Ghi nhận từng cột mốc giải mã, thám hiểm địa danh và mưu lược qua các triều đại
              </p>
            </div>
          </div>

          <button
            onClick={closeAchievements}
            className="p-1.5 rounded-lg hover:bg-parchment-300 text-lacquer transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Banner: Tiến độ tổng & Phân loại bậc huy hiệu */}
        <div className="px-4 sm:px-6 pt-4 pb-2">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2A1810] via-lacquer to-[#2A1810] border-2 border-amber-400/80 shadow-lg text-amber-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tiến trình thanh */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Danh hiệu người chơi:{' '}
                    <strong className="text-white font-title text-sm">
                      {completionPercentage >= 80
                        ? 'Đại Học Sĩ Toàn Bích'
                        : completionPercentage >= 50
                        ? 'Bậc Thầy Giải Mật'
                        : completionPercentage >= 25
                        ? 'Nhà Thám Hiểm Lịch Sử'
                        : 'Sĩ Tử Khởi Nghiệp'}
                    </strong>
                  </span>
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {unlockedCount} / {totalCount} Huy hiệu
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-black/50 border border-amber-500/40 p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.max(5, completionPercentage)}%` }}
                />
              </div>
            </div>

            {/* Bậc Huy Hiệu Đã Đạt */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs font-bold">
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow" />
                <span>Vàng: {tierCounts.gold}</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-slate-300/20 border border-slate-300 text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shadow" />
                <span>Bạc: {tierCounts.silver}</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow" />
                <span>Ngọc: {tierCounts.jade}</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-orange-700/20 border border-orange-500 text-orange-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow" />
                <span>Đồng: {tierCounts.bronze}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bộ Lọc Danh Mục Tabs & Checkbox Đã Mở */}
        <div className="px-4 sm:px-6 py-2 bg-parchment-100/70 border-y border-parchment-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Tất cả', icon: Layers },
              { id: 'milestone', label: 'Cột mốc đầu', icon: Award },
              { id: 'puzzle', label: 'Giải mật mã', icon: KeyRound },
              { id: 'exploration', label: 'Thám hiểm', icon: Compass },
              { id: 'tactics', label: 'Chiến lược', icon: Shield },
              { id: 'mastery', label: 'Toàn bích', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(tab.id as AchievementCategory);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-crimson text-white border-bronze shadow'
                      : 'bg-white/80 text-lacquer border-parchment-300 hover:bg-parchment-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-1.5 text-xs text-lacquer font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnlocked}
              onChange={(e) => {
                sound.playClick();
                setOnlyUnlocked(e.target.checked);
              }}
              className="rounded text-crimson focus:ring-crimson"
            />
            <span>Chỉ hiện đã mở khóa ({unlockedCount})</span>
          </label>
        </div>

        {/* Lưới Huy Hiệu Kỹ Thuật Số */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.isUnlocked;
              return (
                <div
                  key={ach.id}
                  onClick={() => handleBadgeClick(ach)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between relative group hover:scale-[1.02] ${
                    isUnlocked
                      ? 'bg-parchment-100/90 border-bronze shadow-md hover:border-crimson hover:shadow-xl'
                      : 'bg-parchment-100/40 border-parchment-300/80 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Trạng thái góc trên */}
                  <div className="absolute top-2 right-2">
                    {isUnlocked ? (
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 shadow-sm flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Huy chương số (SVG Dong Son Seal) */}
                  <div className="my-2">
                    <AchievementSeal
                      achievement={ach}
                      size="md"
                      showDetails={false}
                    />
                  </div>

                  {/* Thông tin huy hiệu */}
                  <div className="w-full mt-1 space-y-0.5">
                    <span className="text-[10px] font-serif uppercase tracking-wider text-bronze-dark font-bold line-clamp-1">
                      {ach.sealName}
                    </span>
                    <h4 className="font-title font-bold text-xs sm:text-sm text-lacquer leading-tight line-clamp-1">
                      {ach.title}
                    </h4>
                    <p className="text-[11px] text-lacquer/70 font-serif line-clamp-2 mt-0.5">
                      {ach.subtitle}
                    </p>
                  </div>

                  {/* Tiến độ hoặc Trạng thái */}
                  <div className="mt-2.5 pt-2 border-t border-parchment-300/80 w-full text-center">
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        ĐÃ MỞ KHÓA
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-lacquer/75 bg-stone-200/80 px-2 py-0.5 rounded-full font-mono">
                        {ach.progressLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="py-12 text-center text-lacquer/60 text-xs font-serif">
              Không tìm thấy huy hiệu nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="bg-parchment-200 border-t border-parchment-300 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-lacquer/75">
            <Award className="w-4 h-4 text-crimson shrink-0" />
            <span>Mỗi huy hiệu kỹ thuật số được lưu trữ vĩnh viễn trên thiết bị của bạn</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeAchievements();
                openHistoricalMissions();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-950 font-bold transition-all flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5 text-crimson" />
              <span>Phòng Sa Bàn</span>
            </button>
            <button
              onClick={() => {
                closeAchievements();
                openCodex();
              }}
              className="px-3 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-300 border border-parchment-400 text-lacquer font-bold transition-all flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-crimson" />
              <span>Sổ Tay Sử Việt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chi Tiết Huy Chương Khi Bấm Vào */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};
