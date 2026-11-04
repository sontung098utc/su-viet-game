import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Award,
  Scroll,
  CheckCircle2,
  Flame,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import {
  SCHOLAR_RANKS,
  getScholarRank,
  DAILY_COMPLETION_BONUS_POINTS,
  getDailyMissionsForDate,
} from '../../data/dailyMissions';
import type { DailyMission } from '../../types';

export const DailyMissionsModal: React.FC = () => {
  const {
    progress,
    isDailyMissionsOpen,
    closeDailyMissions,
    answerDailyTrivia,
    claimDailyBonus,
    openCodex,
    setScreen,
    completeDailyExploration,
    openCipherPuzzle,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'MISSIONS' | 'RANKS'>('MISSIONS');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHintId, setShowHintId] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dailyState = getDailyMissionsForDate(todayStr, progress.dailyMissions);
  const scholarPoints = progress.scholarPoints || 0;
  const currentRank = getScholarRank(scholarPoints);
  const missions = dailyState.missions || [];

  const completedCount = missions.filter((m) => m.completed).length;
  const allMissionsCompleted = missions.length === 3 && completedCount === 3;

  if (!isDailyMissionsOpen) return null;

  const handleSelectAnswer = (mission: DailyMission, optionIndex: number) => {
    if (mission.completed) return;
    setSelectedAnswers((prev) => ({ ...prev, [mission.id]: optionIndex }));
    answerDailyTrivia(mission.id, optionIndex);
  };

  const handleClaimBonus = () => {
    const success = claimDailyBonus();
    if (success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#9B1D20', '#5C3A21', '#FAF4E6'],
      });
    }
  };

  const handleExecuteExploration = (mission: DailyMission) => {
    if (!mission.explorationTarget) return;

    if (mission.explorationTarget === 'READ_CODEX') {
      closeDailyMissions();
      openCodex();
    } else if (mission.explorationTarget === 'EXPLORE_CO_LOA') {
      completeDailyExploration('EXPLORE_CO_LOA');
      closeDailyMissions();
      setScreen('GAME_3D_CO_LOA');
    } else if (mission.explorationTarget === 'SOLVE_CIPHER') {
      completeDailyExploration('SOLVE_CIPHER');
      closeDailyMissions();
      if (progress.currentScreen !== 'GAME') {
        setScreen('GAME');
      }
      openCipherPuzzle('CIPHER_VILLAGE_SCROLL');
    } else if (mission.explorationTarget === 'INSPECT_RELIC') {
      completeDailyExploration('INSPECT_RELIC');
      closeDailyMissions();
      setScreen('GAME_3D_CO_LOA');
    }
  };

  // Next rank progress calculation
  const nextRankPoints = currentRank.nextPoints;
  const prevRankPoints = currentRank.minPoints;
  let progressPct = 100;
  if (nextRankPoints !== null) {
    const span = nextRankPoints - prevRankPoints;
    const currentSpan = Math.max(0, scholarPoints - prevRankPoints);
    progressPct = Math.min(100, Math.round((currentSpan / span) * 100));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-lacquer/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-parchment-100 rounded-lg shadow-2xl border-2 border-bronze overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b-2 border-parchment-300 bg-gradient-to-r from-parchment-200 via-parchment-100 to-parchment-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-crimson/10 border-2 border-crimson flex items-center justify-center text-crimson shadow-inner">
              <Scroll className="w-5 h-5 text-crimson" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-title text-lg sm:text-xl font-bold text-lacquer tracking-wide">
                  Nhiệm Vụ Sử Học Hằng Ngày
                </h2>
                <span className="seal-stamp text-[10px]">
                  {todayStr}
                </span>
              </div>
              <p className="text-xs text-lacquer/70 font-serif italic">
                Khảo cứu điển tích · Rèn luyện trí tuệ · Tích lũy Điểm Học Giả
              </p>
            </div>
          </div>

          <button
            onClick={closeDailyMissions}
            className="p-1.5 rounded-md hover:bg-parchment-300 text-lacquer/70 hover:text-lacquer transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scholar Banner & Rank Progress */}
        <div className="px-5 py-3.5 bg-parchment-200/80 border-b border-parchment-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Rank and points info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-900/10 border border-bronze flex flex-col items-center justify-center p-1">
                <Award className="w-5 h-5 text-amber-700" />
                <span className="text-[10px] font-bold text-amber-900 leading-none mt-0.5">
                  {currentRank.title}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-lacquer/60 font-semibold tracking-wider uppercase">
                    Học vị hiện tại
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    {currentRank.badge}
                  </span>
                </div>
                <div className="text-lg font-title font-bold text-lacquer">
                  {scholarPoints}{' '}
                  <span className="text-xs font-sans font-normal text-lacquer/70">
                    Điểm Học Giả
                  </span>
                </div>
              </div>
            </div>

            {/* Streak & Completion status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-parchment-100 rounded border border-parchment-400">
                <Flame className="w-4 h-4 text-orange-600" />
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-bold text-lacquer">
                    {dailyState.streakDays || 1} ngày
                  </div>
                  <div className="text-[10px] text-lacquer/60">
                    Chuỗi chuyên cần
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-parchment-100 rounded border border-parchment-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-bold text-lacquer">
                    {completedCount} / 3
                  </div>
                  <div className="text-[10px] text-lacquer/60">
                    Đã hoàn tất
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar to next rank */}
          {nextRankPoints !== null ? (
            <div className="mt-3 pt-2.5 border-t border-parchment-300/70">
              <div className="flex justify-between items-center text-[11px] text-lacquer/75 mb-1">
                <span>
                  Tiến độ thăng học vị:{' '}
                  <strong className="text-lacquer font-semibold">
                    {scholarPoints} / {nextRankPoints} điểm
                  </strong>
                </span>
                <span className="text-amber-800 font-medium">
                  Cần thêm {Math.max(0, nextRankPoints - scholarPoints)} điểm để đạt{' '}
                  {SCHOLAR_RANKS.find((r) => r.minPoints === nextRankPoints)?.title}
                </span>
              </div>
              <div className="w-full h-2 bg-parchment-300 rounded-full overflow-hidden border border-bronze/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-amber-800 font-serif italic text-center">
              Chúc mừng bậc Trạng Nguyên! Học vấn uyên bác đã đạt tột đỉnh khoa bảng Đại Việt.
            </div>
          )}
        </div>

        {/* Tab Controls (Zero-pill button segments) */}
        <div className="flex border-b border-parchment-300 bg-parchment-200/50 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('MISSIONS')}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'MISSIONS'
                ? 'border-crimson text-crimson font-bold'
                : 'border-transparent text-lacquer/70 hover:text-lacquer'
            }`}
          >
            Ba Nhiệm Vụ Hôm Nay ({completedCount}/3)
          </button>
          <button
            onClick={() => setActiveTab('RANKS')}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'RANKS'
                ? 'border-crimson text-crimson font-bold'
                : 'border-transparent text-lacquer/70 hover:text-lacquer'
            }`}
          >
            Bảng Học Vị Khoa Cử ({SCHOLAR_RANKS.length} Bậc)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'MISSIONS' ? (
            <>
              {/* Daily Completion Bonus Notification */}
              {allMissionsCompleted && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-950 font-title">
                        Hoàn thành xuất sắc 3 nhiệm vụ hôm nay!
                      </div>
                      <div className="text-xs text-amber-900/80">
                        {dailyState.dailyBonusClaimed
                          ? 'Bạn đã nhận thưởng chuyên cần hôm nay (+50 Điểm Học Giả). Hãy quay lại vào ngày mai!'
                          : 'Nhận thêm phần thưởng chuyên cần 50 Điểm Học Giả cho chặng đường dùi mài kinh sử.'}
                      </div>
                    </div>
                  </div>

                  {!dailyState.dailyBonusClaimed ? (
                    <button
                      onClick={handleClaimBonus}
                      className="px-4 py-2 bg-gradient-to-r from-crimson to-amber-700 text-white font-semibold text-xs rounded hover:opacity-95 shadow transition-all whitespace-nowrap"
                    >
                      Nhận +{DAILY_COMPLETION_BONUS_POINTS} Điểm Học Giả
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã nhận thưởng
                    </span>
                  )}
                </div>
              )}

              {/* Mission Cards */}
              <div className="space-y-4">
                {missions.map((mission, index) => {
                  const isTrivia = mission.type === 'TRIVIA';
                  const isExploration = mission.type === 'EXPLORATION';
                  const isCompleted = mission.completed;
                  const userAnswer = selectedAnswers[mission.id] ?? mission.userAnswerIndex;

                  return (
                    <div
                      key={mission.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-parchment-50 border-emerald-300/80'
                          : 'bg-parchment-50 border-parchment-300 hover:border-bronze/60 shadow-sm'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-lacquer/50">
                            0{index + 1}
                          </span>
                          <span className="text-xs uppercase font-semibold tracking-wider text-lacquer/60">
                            {mission.category} · {isTrivia ? 'Câu Hỏi Sử Học' : 'Thám Hiểm & Khảo Cứu'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800">
                            +{mission.points} Điểm
                          </span>
                          {isCompleted ? (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong
                            </span>
                          ) : (
                            <span className="text-xs text-lacquer/50 italic">
                              Chưa làm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="mb-3">
                        <h3 className="font-title text-base font-bold text-lacquer mb-1">
                          {mission.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-lacquer/80 font-serif leading-relaxed">
                          {isTrivia ? mission.question : mission.description}
                        </p>
                      </div>

                      {/* Trivia Options */}
                      {isTrivia && mission.options && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mission.options.map((opt, optIdx) => {
                              const isSelected = userAnswer === optIdx;
                              const isCorrectOption = optIdx === mission.correctIndex;
                              let btnClass = 'bg-parchment-100 border-parchment-300 text-lacquer hover:bg-parchment-200';

                              if (isCompleted) {
                                if (isCorrectOption) {
                                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                                } else if (isSelected && !isCorrectOption) {
                                  btnClass = 'bg-red-50 border-red-300 text-red-900 line-through opacity-75';
                                } else {
                                  btnClass = 'bg-parchment-100 border-parchment-200 text-lacquer/40';
                                }
                              } else if (isSelected) {
                                btnClass = 'bg-amber-100 border-amber-600 text-lacquer font-semibold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={isCompleted}
                                  onClick={() => handleSelectAnswer(mission, optIdx)}
                                  className={`w-full text-left p-2.5 rounded border text-xs leading-snug transition-all flex items-start gap-2 ${btnClass}`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-lacquer/20 flex-shrink-0 flex items-center justify-center font-mono text-[10px]">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Historical Explanation box once answered */}
                          {isCompleted && mission.explanation && (
                            <div className="mt-2.5 p-3 rounded bg-amber-50/80 border border-amber-200/90 text-xs text-lacquer/85 leading-relaxed font-serif">
                              <strong className="font-sans font-semibold text-amber-900 block mb-0.5">
                                Luận giải lịch sử:
                              </strong>
                              {mission.explanation}
                            </div>
                          )}

                          {/* Hint Toggle */}
                          {!isCompleted && mission.hint && (
                            <div className="mt-1">
                              <button
                                onClick={() => setShowHintId(showHintId === mission.id ? null : mission.id)}
                                className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium"
                              >
                                <HelpCircle className="w-3 h-3" />
                                {showHintId === mission.id ? 'Ẩn gợi ý' : 'Xem gợi ý manh mối'}
                              </button>
                              {showHintId === mission.id && (
                                <p className="mt-1 text-[11px] text-lacquer/75 bg-parchment-200/60 p-2 rounded border border-parchment-300 italic">
                                  {mission.hint}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Exploration Action */}
                      {isExploration && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-parchment-200">
                          <div className="text-xs text-lacquer/70 italic flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-lacquer/50" />
                            {mission.hint || 'Hoàn thành hành động để nhận Điểm Học Giả.'}
                          </div>

                          {!isCompleted ? (
                            <button
                              onClick={() => handleExecuteExploration(mission)}
                              className="px-3.5 py-1.5 rounded bg-river-600 hover:bg-river-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
                            >
                              <span>{mission.actionLabel || 'Thực hiện ngay'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn thành
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Scholar Ranks Honor Roll */
            <div className="space-y-4">
              <div className="p-3.5 bg-parchment-200/70 rounded-lg border border-parchment-300 text-xs text-lacquer/85 leading-relaxed font-serif">
                <strong className="font-sans font-semibold text-lacquer block mb-1">
                  Chế độ Khoa Cử & Quốc Tử Giám xưa:
                </strong>
                Trong lịch sử Việt Nam, từ năm 1075 triều Lý mở khoa thi đầu tiên, qua các triều Trần, Lê, Nguyễn, con đường khoa cử là bậc thang tuyển chọn hiền tài phụng sự giang sơn. Người học trò trải qua thi Hương (đỗ Tú tài, Cử nhân), thi Hội và thi Đình (đỗ Tiến sĩ, Bảng nhãn, Trạng nguyên) để ghi tên mình lên bảng vàng bia đá.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SCHOLAR_RANKS.map((rank) => {
                  const isCurrent = currentRank.id === rank.id;
                  const isUnlocked = scholarPoints >= rank.minPoints;

                  return (
                    <div
                      key={rank.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-amber-50/90 border-2 border-amber-600 shadow-md ring-1 ring-amber-400/40'
                          : isUnlocked
                          ? 'bg-parchment-50 border-parchment-300'
                          : 'bg-parchment-200/40 border-parchment-300/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-title font-bold text-base text-lacquer">
                            {rank.title}
                          </span>
                          <span className="text-xs text-lacquer/60 font-serif italic">
                            ({rank.hatIcon})
                          </span>
                        </div>
                        {isCurrent ? (
                          <span className="seal-stamp text-[10px] bg-crimson text-white border-crimson">
                            HỌC VỊ HIỆN TẠI
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã đạt
                          </span>
                        ) : (
                          <span className="text-xs text-lacquer/50 font-mono">
                            {rank.minPoints} điểm
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-semibold text-amber-900 mb-1">
                        {rank.badge}
                      </div>
                      <p className="text-xs text-lacquer/80 font-serif mb-2 leading-relaxed">
                        {rank.description}
                      </p>
                      <div className="text-[11px] text-lacquer/60 italic border-t border-parchment-200 pt-1.5">
                        {rank.historicalNote}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-parchment-300 bg-parchment-200/90 flex items-center justify-between">
          <div className="text-xs text-lacquer/60 font-serif italic">
            Nhiệm vụ tự động làm mới mỗi ngày vào 00:00 (giờ hệ thống)
          </div>

          <button
            onClick={closeDailyMissions}
            className="px-4 py-1.5 rounded bg-parchment-100 hover:bg-parchment-300 border border-parchment-400 text-xs font-semibold text-lacquer shadow-sm transition-colors"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
