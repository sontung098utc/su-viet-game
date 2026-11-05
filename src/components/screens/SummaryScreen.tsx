import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { JOURNEY_RECAP_CARDS, type JourneyRecapCard } from '../../data/chapter1';
import {
  evaluateAchievements,
  getSpeedRating,
  formatDuration,
} from '../../data/achievements';
import { AchievementSeal } from '../common/AchievementSeal';
import { AchievementDetailModal } from '../common/AchievementDetailModal';
import { sound } from '../../utils/sound';
import type { UserAchievement, AchievementCategory } from '../../types';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  MapPin,
  MoveUp,
  MoveDown,
  Timer,
  KeyRound,
  Scroll,
  Compass,
  Trophy,
} from 'lucide-react';
import { getScholarRank } from '../../data/dailyMissions';

export const SummaryScreen: React.FC = () => {
  const {
    progress,
    setScreen,
    openCodex,
    completeRecap,
    restartAdventure,
    openDailyMissions,
    openHistoricalMissions,
    openAchievements,
  } = useGame();

  // Xáo trộn nhẹ 3 thẻ hình ảnh ban đầu để người chơi sắp xếp kể lại hành trình
  const [cards, setCards] = useState<JourneyRecapCard[]>(() => [
    JOURNEY_RECAP_CARDS[1],
    JOURNEY_RECAP_CARDS[2],
    JOURNEY_RECAP_CARDS[0],
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [recapVerified, setRecapVerified] = useState(progress.completedRecapOrder);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Tab lọc danh mục thành tựu
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<UserAchievement | null>(null);

  // Tính thời gian chơi thực tế (khởi tạo an toàn 1 lần khi mở màn hình tổng kết)
  const [effectivePlayTimeSeconds] = useState<number>(() => {
    if (progress.totalPlayTimeSeconds && progress.totalPlayTimeSeconds > 0) {
      return progress.totalPlayTimeSeconds;
    }
    if (progress.startedAt) {
      const startMs = new Date(progress.startedAt).getTime();
      const elapsed = Math.round((Date.now() - startMs) / 1000);
      if (elapsed > 0 && elapsed < 86400) return elapsed;
    }
    return 260; // Dự phòng mặc định thời gian hợp lý
  });

  const speedRating = useMemo(() => getSpeedRating(effectivePlayTimeSeconds), [effectivePlayTimeSeconds]);

  // Đánh giá danh sách thành tựu
  const achievements = useMemo(
    () => evaluateAchievements(progress, effectivePlayTimeSeconds),
    [progress, effectivePlayTimeSeconds]
  );

  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.isUnlocked).length,
    [achievements]
  );

  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievements;
    return achievements.filter((a) => a.category === activeCategory);
  }, [achievements, activeCategory]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  }, []);

  const swapCards = (idxA: number, idxB: number) => {
    setCards((prev) => {
      const next = [...prev];
      const tmp = next[idxA];
      next[idxA] = next[idxB];
      next[idxB] = tmp;
      return next;
    });
    setFeedback(null);
  };

  const handleCardClick = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      swapCards(selectedIdx, idx);
      setSelectedIdx(null);
    }
  };

  const handleCheckRecap = () => {
    const isOrdered = cards.every((c, i) => c.correctOrder === i + 1);
    if (isOrdered) {
      setRecapVerified(true);
      setFeedback('Chính xác! Bạn đã kể lại trọn vẹn mạch hành trình và ba bài học lịch sử năm 938.');
      completeRecap();
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      } catch {
        // Ignore
      }
    } else {
      setFeedback(
        'Thứ tự chưa khớp với hành trình bạn vừa đi qua: Hãy bắt đầu từ câu chuyện ở Làng Ven Sông -> Rèn đai sắt ở Khu Chuẩn Bị -> Quan sát con nước thủy triều ở Bến Sông!'
      );
    }
  };

  const handleInspectAchievement = (ach: UserAchievement) => {
    sound.playClueFound();
    setSelectedAchievement(ach);
  };

  const renderSceneIllustration = (type: JourneyRecapCard['sceneType']) => {
    if (type === 'village_cause') {
      return (
        <svg viewBox="0 0 240 110" className="w-full h-28 rounded-lg border border-parchment-300 bg-[#88B05C]">
          <rect x="0" y="0" width="240" height="45" fill="#D5EFF4" />
          {/* Nhà tranh & Cây đa */}
          <polygon points="30,65 55,35 95,35 120,65" fill="#9E7B42" stroke="#4A2F22" strokeWidth="2" />
          <rect x="42" y="65" width="66" height="32" fill="#D9BE96" stroke="#4A2F22" strokeWidth="2" />
          <circle cx="175" cy="48" r="26" fill="#3B7A33" />
          <rect x="168" y="68" width="14" height="28" fill="#6E4D25" />
          <circle cx="135" cy="82" r="9" fill="#5C3D28" />
          <circle cx="105" cy="84" r="8" fill="#7C4D2B" />
        </svg>
      );
    }
    if (type === 'camp_stakes') {
      return (
        <svg viewBox="0 0 240 110" className="w-full h-28 rounded-lg border border-parchment-300 bg-[#C9A978]">
          {/* Lò rèn đỏ lửa & Cọc vạt nhọn bịt sắt */}
          <rect x="24" y="38" width="58" height="48" rx="6" fill="#5A534A" stroke="#2A2520" strokeWidth="2" />
          <circle cx="53" cy="62" r="15" fill="#F97316" />
          <circle cx="53" cy="62" r="8" fill="#FFF3B0" />
          {/* Các cọc lớn bịt sắt */}
          <rect x="115" y="45" width="70" height="12" fill="#8C5835" stroke="#3D271D" strokeWidth="1.5" />
          <polygon points="185,45 210,51 185,57" fill="#D1D5DB" stroke="#374151" strokeWidth="1.5" />
          <rect x="115" y="68" width="70" height="12" fill="#8C5835" stroke="#3D271D" strokeWidth="1.5" />
          <polygon points="185,68 210,74 185,80" fill="#D1D5DB" stroke="#374151" strokeWidth="1.5" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 240 110" className="w-full h-28 rounded-lg border border-parchment-300 bg-[#184F63]">
        <rect x="0" y="0" width="240" height="36" fill="#D2B88C" />
        {/* Cột mốc đá & Cọc nhô lên khi nước rút */}
        <rect x="32" y="18" width="18" height="52" rx="3" fill="#9CA3AF" stroke="#374151" strokeWidth="2" />
        <line x1="34" y1="30" x2="48" y2="30" stroke="#9B1D20" strokeWidth="2.5" />
        <polygon points="95,95 102,52 109,95" fill="#8C5835" />
        <polygon points="98,64 102,50 106,64" fill="#E5E7EB" />
        <polygon points="145,95 152,48 159,95" fill="#8C5835" />
        <polygon points="148,60 152,46 156,60" fill="#E5E7EB" />
        <path d="M 162 62 L 222 54 L 212 74 L 170 78 Z" fill="#581C1C" stroke="#111827" strokeWidth="2" />
      </svg>
    );
  };

  const coreCiphers = ['CIPHER_VILLAGE_SCROLL', 'CIPHER_CAMP_CHEST', 'CIPHER_TIDE_STELE'];
  const solvedCoreCount = coreCiphers.filter((id) => (progress.solvedCiphers || []).includes(id as any)).length;
  const secretCiphers = ['CIPHER_SECRET_WELL', 'CIPHER_SECRET_SHRINE', 'CIPHER_SECRET_PITCH'];
  const solvedSecretCount = secretCiphers.filter((id) => (progress.solvedCiphers || []).includes(id as any)).length;
  const scholarRank = getScholarRank(progress.scholarPoints || 0);

  return (
    <div className="min-h-screen bg-parchment-pattern flex flex-col justify-between p-3 sm:p-8 select-none">
      <main className="max-w-4xl mx-auto w-full space-y-6 my-auto">
        {/* Khung hoàn thành câu chuyện */}
        <div className="bg-parchment-50 rounded-3xl border-4 border-bronze shadow-2xl p-5 sm:p-8 text-lacquer">
          {/* Header chúc mừng */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-crimson text-white text-xs font-bold shadow mb-2">
              <Sparkles className="w-3.5 h-3.5 text-bronze-light" />
              <span>HOÀN THÀNH ĐOẠN CHƠI NHẬP VAI NĂM 938</span>
            </div>
            <h1 className="font-title text-2xl sm:text-4xl font-extrabold text-lacquer">
              Bến Sông Bạch Đằng Mùa Đông Năm 938
            </h1>
            <p className="text-xs sm:text-sm text-lacquer/80 max-w-2xl mx-auto mt-1.5 leading-relaxed">
              Chúc mừng người đưa tin <strong>{progress.playerName}</strong> (Học vị Quốc Tử Giám:{' '}
              <strong className="text-amber-800">{scholarRank.title}</strong> · {progress.scholarPoints || 0} Điểm Học Giả)! Qua những bước chân giữa{' '}
              <strong>Làng Ven Sông</strong>, <strong>Khu Chuẩn Bị</strong> và <strong>Bến Quan Sát</strong>, bạn đã trực tiếp trải nghiệm không khí chuẩn bị và thời khắc quyết định của chiến thắng Bạch Đằng.
            </p>
          </div>

          {/* Dải Thống Kê Nhanh (Stats Strip) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {/* Tốc độ hoàn thành */}
            <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-lacquer/75 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Timer className="w-3.5 h-3.5 text-crimson" />
                  Tốc Độ
                </span>
                <span className="font-bold text-[11px] px-1.5 py-0.2 rounded border bg-amber-50 border-amber-300 text-amber-800">
                  Hạng {speedRating.rank}
                </span>
              </div>
              <div className="font-title font-bold text-xl sm:text-2xl text-lacquer tabular-nums">
                {formatDuration(effectivePlayTimeSeconds)}
              </div>
              <p className="text-[11px] text-lacquer/70 truncate mt-0.5">
                {speedRating.title}
              </p>
            </div>

            {/* Mật mã & Mật thư đã giải */}
            <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-lacquer/75 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  Mật Mã Đã Giải
                </span>
                <span className="text-[11px] font-bold text-amber-900 font-mono">
                  {progress.solvedCiphers?.length || 0}/6
                </span>
              </div>
              <div className="font-title font-bold text-xl sm:text-2xl text-lacquer tabular-nums">
                {solvedCoreCount}/3 <span className="text-xs font-normal text-lacquer/60">Chính</span>
              </div>
              <p className="text-[11px] text-lacquer/70 truncate mt-0.5">
                {solvedSecretCount > 0 ? `+${solvedSecretCount} Mật thư cổ ẩn` : 'Chưa tìm mật thư ẩn'}
              </p>
            </div>

            {/* Dấu ấn & Huy chương đạt được */}
            <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-lacquer/75 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Award className="w-3.5 h-3.5 text-crimson" />
                  Huân Chương
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </span>
              </div>
              <div className="font-title font-bold text-xl sm:text-2xl text-lacquer tabular-nums">
                {unlockedCount} / {achievements.length}
              </div>
              <p className="text-[11px] text-lacquer/70 truncate mt-0.5">
                Dấu ấn đã khắc vào sử
              </p>
            </div>

            {/* Manh mối hiện vật */}
            <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-lacquer/75 mb-1">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Manh Mối
                </span>
                <span className="text-[11px] font-bold text-emerald-800 font-mono">
                  {progress.collectedClues.length}/9
                </span>
              </div>
              <div className="font-title font-bold text-xl sm:text-2xl text-lacquer tabular-nums">
                {progress.collectedClues.length} <span className="text-xs font-normal text-lacquer/60">Hiện vật</span>
              </div>
              <p className="text-[11px] text-lacquer/70 truncate mt-0.5">
                Thu thập tại thực địa
              </p>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* HỆ THỐNG THÀNH TỰU & HUY CHƯƠNG / DẤU ẤN (ACHIEVEMENTS SYSTEM) */}
          {/* ===================================================================== */}
          <div className="mb-6 rounded-2xl bg-parchment-100/90 border-2 border-bronze/50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-title font-bold text-base sm:text-lg text-lacquer flex items-center gap-2">
                  <Award className="w-5 h-5 text-crimson" />
                  <span>Bảng Thành Tựu & Dấu Ấn Hoàng Triều</span>
                </h3>
                <p className="text-xs text-lacquer/70">
                  Ghi danh công trạng dựa trên tốc độ hoàn thành, số lượng mật mã đã giải và độ chuẩn xác điều tra.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => openAchievements()}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/90 hover:bg-amber-800 text-amber-200 border border-amber-400/70 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  title="Mở Bảng Huy Chương & Kỳ Tích Toàn Năng"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bộ Sưu Tập Huy Chương ({unlockedCount}/{achievements.length})</span>
                </button>
              </div>
            </div>

            {/* Thanh Phân Loại / Filter Tabs (Tuân thủ Zero-Pill: Nút bấm phân đoạn) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-parchment-200/80 rounded-xl mb-4 border border-parchment-300">
              {[
                { id: 'all', label: `Tất cả (${achievements.length})` },
                { id: 'milestone', label: 'Cột mốc' },
                { id: 'exploration', label: 'Khám phá' },
                { id: 'tactics', label: 'Chiến thuật' },
                { id: 'puzzle', label: 'Mật mã' },
                { id: 'speed', label: 'Tốc độ' },
                { id: 'secret', label: 'Cơ mật' },
                { id: 'mastery', label: 'Toàn thắng' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveCategory(tab.id as AchievementCategory);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === tab.id
                      ? 'bg-parchment-50 text-crimson shadow-sm border border-bronze/50'
                      : 'text-lacquer/75 hover:text-lacquer hover:bg-parchment-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lưới Huy Chương & Dấu Ấn */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredAchievements.map((ach) => (
                <AchievementSeal
                  key={ach.id}
                  achievement={ach}
                  size="md"
                  onClick={() => handleInspectAchievement(ach)}
                />
              ))}
            </div>
          </div>

          {/* Tóm tắt rõ điều đã trải nghiệm (Hư cấu nhập vai) & Sự kiện lịch sử xác thực */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-emerald-700/40">
              <h3 className="font-title font-bold text-base text-emerald-900 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                Sự Kiện Lịch Sử Xác Thực (Năm 938)
              </h3>
              <ul className="text-xs text-lacquer space-y-2 leading-relaxed">
                <li>
                  • <strong>Nguyên nhân:</strong> Kiều Công Tiễn giết chủ tướng Dương Đình Nghệ (937) để đoạt quyền; khi bị Ngô Quyền từ Ái Châu tiến quân hỏi tội, Công Tiễn cầu cứu nhà Nam Hán.
                </li>
                <li>
                  • <strong>Chuẩn bị thế trận:</strong> Ngô Quyền diệt trừ nội phản Công Tiễn, rồi sai quân lấy <strong>cọc lớn vạt nhọn đầu, bịt sắt</strong> đóng ngầm trước cửa biển.
                </li>
                <li>
                  • <strong>Thời điểm thủy triều:</strong> Nhân lúc <strong>nước triều lên</strong> ngập bãi cọc, thuyền nhẹ ra khiêu chiến nhử quân Lưu Hoằng Tháo vượt qua; đợi lúc <strong>nước triều rút mạnh</strong>, quân ta phản công khiến thuyền giặc vướng cọc vỡ đắm, Hoằng Tháo tử trận.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze/50">
              <h3 className="font-title font-bold text-base text-lacquer mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-crimson" />
                Trải Nghiệm Nhập Vai Của Bạn
              </h3>
              <p className="text-xs text-lacquer/85 leading-relaxed mb-2">
                Vai trò người đưa tin trẻ <strong>{progress.playerName}</strong> cùng công việc vác than củi giúp Bác Thợ Rèn Tạo, mang đai sắt ra bến sông và quan sát Cột Mốc Đá qua hai pha nước (Nước Ròng lộ cọc — Nước Lớn ngập cọc) là <strong>tuyến truyện hư cấu & mô phỏng giản lược</strong>.
              </p>
              <p className="text-xs text-lacquer/75 italic">
                Người đưa tin không phải người nghĩ ra kế sách hay quyết định trận đánh, mà là hình ảnh đại diện cho muôn dân đồng lòng tiếp sức dưới cờ nghĩa của Tiền Ngô Vương Ngô Quyền.
              </p>
            </div>
          </div>

          {/* Hoạt động củng cố ngắn: Kể lại hành trình bằng 3 bức tranh đã gặp */}
          <div className="bg-parchment-100/90 rounded-2xl border-2 border-parchment-300 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-title font-bold text-base sm:text-lg text-lacquer">
                  Kể Lại Hành Trình Bằng Hình Ảnh Đã Gặp
                </h3>
                <p className="text-xs text-lacquer/70">
                  Chạm chọn 2 bức tranh để đổi chỗ (hoặc dùng nút mũi tên) theo đúng thứ tự câu chuyện bạn vừa trải qua:
                </p>
              </div>
              {recapVerified && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-1 self-start">
                  <CheckCircle2 className="w-4 h-4" /> Đã sắp xếp chuẩn xác
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {cards.map((card, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-100 border-crimson ring-2 ring-crimson/30 scale-[1.02]'
                        : 'bg-parchment-50 border-parchment-300 hover:border-bronze'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-lacquer text-parchment-50 text-[11px] font-bold">
                          Chặng {idx + 1}
                        </span>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={idx === 0}
                            onClick={() => swapCards(idx, idx - 1)}
                            className="p-1 rounded bg-parchment-200 hover:bg-parchment-300 disabled:opacity-30"
                            title="Đưa lên trước"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === cards.length - 1}
                            onClick={() => swapCards(idx, idx + 1)}
                            className="p-1 rounded bg-parchment-200 hover:bg-parchment-300 disabled:opacity-30"
                            title="Đưa ra sau"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {renderSceneIllustration(card.sceneType)}
                      <h4 className="font-bold text-xs sm:text-sm text-lacquer mt-2 mb-1">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-lacquer/75 leading-relaxed">{card.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium mb-3 ${
                  recapVerified
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {feedback}
              </div>
            )}

            {!recapVerified && (
              <button
                onClick={handleCheckRecap}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze"
              >
                Kiểm tra thứ tự hành trình
              </button>
            )}
          </div>

          {/* Nút mở Sổ tay Sử Việt hoặc Quay lại Thế giới 2D */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openCodex()}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-sm shadow-lg border-2 border-bronze flex items-center justify-center gap-2 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Mở Sổ Tay Sử Việt</span>
            </button>

            <button
              onClick={() => openDailyMissions()}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-100 font-bold text-sm shadow-lg border-2 border-amber-600 flex items-center justify-center gap-2 active:scale-95"
            >
              <Scroll className="w-4 h-4 text-amber-300" />
              <span>Nhiệm Vụ Ngày ({progress.scholarPoints || 0}đ)</span>
            </button>

            <button
              onClick={() => openHistoricalMissions()}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-red-900 hover:bg-red-950 text-amber-100 font-bold text-sm shadow-lg border-2 border-amber-500/80 flex items-center justify-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Sa Bàn Sử ({progress.historicalMissions?.completedMissionIds?.length || 0}/4)</span>
            </button>

            <button
              onClick={() => setScreen('GAME')}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-lacquer font-bold text-sm border-2 border-parchment-400 shadow flex items-center justify-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4 text-river-700" />
              <span>Dạo Bước Thế Giới 2D</span>
            </button>

            <button
              onClick={restartAdventure}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-lacquer font-semibold text-xs border border-parchment-400 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại từ đầu</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal Soi Chi Tiết Huy Chương / Triện Ấn Cổ */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};
