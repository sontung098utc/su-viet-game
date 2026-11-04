import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Compass,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Flame,
  Waves,
  Hammer,
  Trees,
  Anchor,
  Crosshair,
  Zap,
} from 'lucide-react';
import {
  HISTORICAL_MISSIONS_CATALOG,
  SANDTABLE_LEVELS,
  WAR_COUNCIL_DEBATES,
} from '../../data/historicalMissions';
import type { HistoricalMissionId } from '../../types';

export const HistoricalMissionsModal: React.FC = () => {
  const {
    isHistoricalMissionsOpen,
    activeHistoricalMissionId,
    closeHistoricalMissions,
    progress,
    recordHistoricalMissionCompletion,
  } = useGame();

  const [activeTab, setActiveTab] = useState<HistoricalMissionId>(
    activeHistoricalMissionId || 'MISSION_TACTICAL_SANDTABLE'
  );

  // States cho Sa Bàn Bạch Đằng
  const [sandtableStep, setSandtableStep] = useState<number>(0);
  const [selectedSandtableChoices, setSelectedSandtableChoices] = useState<Record<string, string>>({});
  const [sandtableFeedback, setSandtableFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // States cho Khảo Cổ Cổ Loa
  const [assembledParts, setAssembledParts] = useState<string[]>([]);
  const [selectedArrowType, setSelectedArrowType] = useState<'TWO_WINGED' | 'THREE_WINGED' | null>(null);

  // States cho Hội Nghị Quân Cơ
  const [debateStep, setDebateStep] = useState<number>(0);
  const [debateChoices, setDebateChoices] = useState<Record<string, string>>({});
  const [debateFeedback, setDebateFeedback] = useState<{ text: string; isBest: boolean } | null>(null);

  // States cho Hậu Cần Dân Gian
  const [logisticsTimber, setLogisticsTimber] = useState<boolean>(false);
  const [logisticsForge, setLogisticsForge] = useState<boolean>(false);
  const [logisticsPitch, setLogisticsPitch] = useState<boolean>(false);

  if (!isHistoricalMissionsOpen) return null;

  const completedList = progress.historicalMissions?.completedMissionIds || [];
  const currentMissionDef = HISTORICAL_MISSIONS_CATALOG[activeTab];

  // 1. Xử lý Sa Bàn Bạch Đằng
  const handleSelectSandtableOption = (stepId: string, optionId: string, consequence: string, isCorrect: boolean) => {
    sound.playClick();
    setSelectedSandtableChoices((prev) => ({ ...prev, [stepId]: optionId }));
    setSandtableFeedback({ text: consequence, isCorrect });

    if (isCorrect) {
      if (sandtableStep < SANDTABLE_LEVELS.length - 1) {
        setTimeout(() => {
          setSandtableStep((prev) => prev + 1);
          setSandtableFeedback(null);
        }, 1200);
      } else {
        recordHistoricalMissionCompletion('MISSION_TACTICAL_SANDTABLE', 100, {
          tideTiming: 'NOON_FLOOD_AFTERNOON_EBB',
          woodMaterial: 'IRONWOOD_LIM',
          stakeAngle: 'SLANTED_45_EBB',
          fleetTactic: 'FEIGNED_RETREAT_BAIT',
        });
        try {
          confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
        } catch {}
      }
    }
  };

  // 2. Xử lý Khảo Cổ Cổ Loa
  const toggleAssemblePart = (partId: string) => {
    sound.playClick();
    setAssembledParts((prev) => {
      const next = prev.includes(partId) ? prev.filter((p) => p !== partId) : [...prev, partId];
      if (next.length === 4 && selectedArrowType === 'THREE_WINGED') {
        recordHistoricalMissionCompletion('MISSION_CO_LOA_BALLISTICS', 100, {
          assembledParts: next,
          testedAerodynamics: true,
          discoveredExcavation: true,
        });
        try {
          confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
        } catch {}
      }
      return next;
    });
  };

  const handleSelectArrow = (type: 'TWO_WINGED' | 'THREE_WINGED') => {
    sound.playClick();
    setSelectedArrowType(type);
    if (assembledParts.length === 4 && type === 'THREE_WINGED') {
      recordHistoricalMissionCompletion('MISSION_CO_LOA_BALLISTICS', 100, {
        assembledParts,
        testedAerodynamics: true,
        discoveredExcavation: true,
      });
      try {
        confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // 3. Xử lý Hội Nghị Quân Cơ
  const handleSelectDebate = (topicId: string, optionId: string, feedback: string, isBest: boolean) => {
    sound.playClick();
    setDebateChoices((prev) => ({ ...prev, [topicId]: optionId }));
    setDebateFeedback({ text: feedback, isBest });

    if (isBest) {
      if (debateStep < WAR_COUNCIL_DEBATES.length - 1) {
        setTimeout(() => {
          setDebateStep((prev) => prev + 1);
          setDebateFeedback(null);
        }, 1300);
      } else {
        recordHistoricalMissionCompletion('MISSION_WAR_COUNCIL_DEBATE', 100, {
          q1Verdict: 'ELIMINATE_TRAITOR_FIRST',
          q2Verdict: 'WATERWAY_VULNERABILITY',
          q3Verdict: 'RIGHT_TIDE_REVERSAL',
        });
        try {
          confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
        } catch {}
      }
    }
  };

  // 4. Xử lý Hậu Cần Dân Gian
  const handleCompleteLogisticsStep = (station: 'timber' | 'forge' | 'pitch') => {
    sound.playClick();
    let nextTimber = logisticsTimber;
    let nextForge = logisticsForge;
    let nextPitch = logisticsPitch;

    if (station === 'timber') nextTimber = true;
    if (station === 'forge') nextForge = true;
    if (station === 'pitch') nextPitch = true;

    setLogisticsTimber(nextTimber);
    setLogisticsForge(nextForge);
    setLogisticsPitch(nextPitch);

    if (nextTimber && nextForge && nextPitch) {
      recordHistoricalMissionCompletion('MISSION_LOGISTICS_AND_PEOPLE', 90, {
        woodLogged: true,
        ironForged: true,
        pitchSealed: true,
      });
      try {
        confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
      } catch {}
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-lacquer-dark/85 backdrop-blur-sm animate-fadeIn select-none"
      onClick={closeHistoricalMissions}
    >
      <div
        className="bg-parchment-50 w-full max-w-4xl max-h-[92dvh] rounded-3xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-parchment-200 border-b border-parchment-300 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson border-2 border-bronze flex items-center justify-center text-parchment-100 shadow-sm shrink-0">
              <Compass className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-title text-base sm:text-lg font-bold text-lacquer leading-tight">
                  Phòng Sa Bàn & Nhiệm Vụ Sử Học
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                  Dành Cho Học Sinh - Sinh Viên
                </span>
              </div>
              <p className="text-[11px] text-lacquer/70 font-serif">
                Học qua trải nghiệm sa bàn tác chiến, giải phẫu cổ vật khảo cổ và tranh biện quân cơ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-xs font-bold text-amber-950">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>{completedList.length}/4 Hoàn Thành</span>
            </div>
            <button
              onClick={closeHistoricalMissions}
              className="p-1.5 rounded-lg hover:bg-parchment-300 text-lacquer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Tabs Điều Hướng */}
        <div className="bg-parchment-100/80 border-b border-parchment-300 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'MISSION_TACTICAL_SANDTABLE', label: '1. Sa Bàn Bạch Đằng', icon: Waves },
              { id: 'MISSION_CO_LOA_BALLISTICS', label: '2. Khảo Cổ Cổ Loa', icon: Crosshair },
              { id: 'MISSION_WAR_COUNCIL_DEBATE', label: '3. Hội Nghị Quân Cơ', icon: Shield },
              { id: 'MISSION_LOGISTICS_AND_PEOPLE', label: '4. Toàn Dân Hậu Cần', icon: Hammer },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isDone = completedList.includes(tab.id);
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isCurrent
                    ? 'bg-crimson text-white border-bronze shadow-md scale-102'
                    : 'bg-white/80 text-lacquer border-parchment-300 hover:bg-parchment-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-300' : 'text-crimson'}`} />
                <span>{tab.label}</span>
                {isDone && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ml-0.5 ${
                      isCurrent ? 'text-emerald-300' : 'text-emerald-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mission Meta Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-parchment-100 to-amber-50 border border-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-crimson text-white">
                  {currentMissionDef.eraBadge}
                </span>
                <span className="font-bold text-lacquer text-sm font-title">
                  {currentMissionDef.title}
                </span>
              </div>
              <p className="text-[11px] text-lacquer/80 font-serif leading-relaxed">
                <strong>Mục tiêu học tập:</strong> {currentMissionDef.studentLearningObjective}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-200/90 text-amber-950 font-bold text-xs border border-amber-400">
              <Sparkles className="w-3.5 h-3.5 text-crimson" />
              <span>+{currentMissionDef.scholarPointsReward} Điểm Học Giả</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: SA BÀN BẠCH ĐẰNG — BÀY TRẬN THỦY TRIỀU */}
          {/* ========================================================================= */}
          {activeTab === 'MISSION_TACTICAL_SANDTABLE' && (
            <div className="space-y-4">
              {/* Sa Bàn Đồ Họa Cửa Sông */}
              <div className="relative rounded-2xl bg-[#133240] border-4 border-bronze p-4 text-white overflow-hidden shadow-2xl min-h-[190px]">
                {/* Lưới tọa độ sa bàn */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#C99726_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-white/20 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Sa Bàn Quân Sự: Cửa Biển Bạch Đằng (Quảng Yên - Hải Phòng)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-parchment-200">
                    <Waves className="w-3.5 h-3.5 text-blue-300" />
                    <span>Biên độ triều cường: 3.5m - 4.0m</span>
                  </div>
                </div>

                {/* Minh họa trực quan dòng sông & bãi cọc */}
                <div className="relative h-28 w-full bg-gradient-to-b from-[#1C4E63] via-[#0E2E3D] to-[#1C4E63] rounded-xl border border-white/20 flex items-center justify-between px-4 overflow-hidden">
                  {/* Bờ Bắc (Phục binh Ngô Quyền) */}
                  <div className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/50">
                    Rừng Ngập Mặn (Phục binh Dương Tam Kha)
                  </div>

                  {/* Trung tâm: Luồng lạch & bãi cọc ngầm */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-end gap-2 my-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-2.5 h-6 bg-[#C08A4E] border border-lacquer rounded-t transform -rotate-12 relative shadow-sm">
                            <div className="w-full h-2 bg-slate-300 rounded-t" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-amber-200 uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded">
                      Bãi cọc vạt nhọn bọc sắt Yên Giang
                    </span>
                  </div>

                  {/* Cửa biển (Hạm thuyền Nam Hán tiến vào) */}
                  <div className="text-[10px] text-red-300 font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/50">
                    Cửa Biển (Lưu Hoằng Tháo tiến nhập)
                  </div>
                </div>

                <div className="mt-2 text-right text-[10px] text-amber-300/80 italic">
                  * Trích dẫn khảo cổ học: Cọc nghiêng 45°-60° xuôi dòng nước rút, cắm sâu 1.5m vào bùn sét.
                </div>
              </div>

              {/* Tiến trình 4 bước sa bàn */}
              <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-crimson uppercase tracking-wide">
                    Quyết sách {sandtableStep + 1} / {SANDTABLE_LEVELS.length}: {SANDTABLE_LEVELS[sandtableStep].stepName}
                  </span>
                  <div className="flex items-center gap-1">
                    {SANDTABLE_LEVELS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full ${
                          idx < sandtableStep
                            ? 'bg-emerald-600'
                            : idx === sandtableStep
                            ? 'bg-crimson animate-pulse'
                            : 'bg-parchment-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-lacquer leading-relaxed">
                  {SANDTABLE_LEVELS[sandtableStep].prompt}
                </p>

                {/* Các phương án */}
                <div className="space-y-2 pt-1">
                  {SANDTABLE_LEVELS[sandtableStep].options.map((opt) => {
                    const isSelected = selectedSandtableChoices[SANDTABLE_LEVELS[sandtableStep].stepId] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          handleSelectSandtableOption(
                            SANDTABLE_LEVELS[sandtableStep].stepId,
                            opt.id,
                            opt.consequence,
                            opt.isCorrect
                          )
                        }
                        className={`w-full text-left p-3 rounded-xl border text-xs leading-snug transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950'
                              : 'bg-rose-100 border-rose-400 font-bold text-rose-950'
                            : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                        }`}
                      >
                        <div className="mt-0.5 w-4 h-4 rounded-full border border-lacquer/40 flex items-center justify-center shrink-0">
                          {isSelected && <div className="w-2 h-2 rounded-full bg-crimson" />}
                        </div>
                        <div className="flex-1">
                          <span>{opt.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Nhận xét phản hồi */}
                {sandtableFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
                      sandtableFeedback.isCorrect
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {sandtableFeedback.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{sandtableFeedback.text}</span>
                  </div>
                )}
              </div>

              {/* Sử liệu đối chiếu */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs space-y-1.5 font-serif">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                  <span>Sử Liệu Gốc Đối Chiếu: Đại Việt Sử Ký Toàn Thư</span>
                </div>
                <p className="italic text-lacquer/85 leading-relaxed text-[11px]">
                  “Hoằng Tháo là đứa trẻ dại, đem quân từ xa đến... Song họ có lợi ở thuyền to. Nếu sai người vót nhọn cọc gỗ, đầu bịt sắt đóng ngầm ở cửa biển, thuyền giặc nhân khi nước triều lên tiến vào bên trong hàng cọc, bấy giờ ta dốc quân đánh, không kế gì hơn kế ấy cả.”
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: KHẢO CỔ CỔ LOA — GIẢI PHẪU LẪY NỎ & KHÍ ĐỘNG HỌC */}
          {/* ========================================================================= */}
          {activeTab === 'MISSION_CO_LOA_BALLISTICS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phần 1: Giải phẫu Lẫy Nỏ Đồng Đông Sơn */}
                <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crimson uppercase tracking-wide flex items-center gap-1.5">
                      <Crosshair className="w-4 h-4" />
                      1. Lắp Ghép Lẫy Nỏ Đồng Đông Sơn
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                      {assembledParts.length}/4 Chi Tiết
                    </span>
                  </div>

                  <p className="text-[11px] text-lacquer/80 leading-relaxed font-serif">
                    Hiện vật lẫy nỏ đồng Cổ Loa là một phát minh cơ khí đáng kinh ngạc: chịu được sức kéo hàng trăm cân của dây gân thú nhờ nguyên lý đòn bẩy kép. Hãy chạm để kiểm tra và lắp ghép từng bộ phận:
                  </p>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'PART_SIGHT',
                        name: '1. Thước Ngắm (Rear Sight)',
                        desc: 'Thước ngắm đồng nhô cao ở đuôi nỏ, giúp xạ thủ điều chỉnh góc bắn đạn đạo chính xác theo cự ly xa gần.',
                      },
                      {
                        id: 'PART_CLAW',
                        name: '2. Ngàm Giữ Dây Cung (Móng Rùa)',
                        desc: 'Hai mấu đồng giữ chặt dây cung khi căng; tương truyền chính là hình tượng "móng rùa Kim Quy" trong huyền sử.',
                      },
                      {
                        id: 'PART_CASING',
                        name: '3. Hộp Quy Đồng (Cò Khung Bao)',
                        desc: 'Vỏ bọc đồng thau nguyên khối ôm khít các chốt trục, chịu áp lực va đập cực lớn khi bắn liên thanh.',
                      },
                      {
                        id: 'PART_TRIGGER',
                        name: '4. Cò Bấm Cơ Học (Finger Trigger)',
                        desc: 'Tay gạt dài phía dưới, cho phép bóp cò nhẹ nhàng chỉ với lực tay 1-2kg để nhả ngàm giữ dây cung hàng trăm kg.',
                      },
                    ].map((part) => {
                      const isInstalled = assembledParts.includes(part.id);
                      return (
                        <div
                          key={part.id}
                          onClick={() => toggleAssemblePart(part.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isInstalled
                              ? 'bg-amber-100 border-amber-500 font-bold text-amber-950 shadow-sm'
                              : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{part.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isInstalled
                              ? 'bg-emerald-600 text-white'
                              : 'bg-parchment-300 text-lacquer/70'
                              }`}
                            >
                              {isInstalled ? 'Đã lắp khớp' : 'Chạm để lắp'}
                            </span>
                          </div>
                          <p className="text-[11px] text-lacquer/75 mt-1 font-serif leading-snug">
                            {part.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Phần 2: Thí nghiệm Khí Động Học Mũi Tên Đồng Cầu Vực */}
                <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-crimson uppercase tracking-wide flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      2. Thí Nghiệm Khí Động Học Mũi Tên
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                      Di chỉ Cầu Vực 1959
                    </span>
                  </div>

                  <p className="text-[11px] text-lacquer/80 leading-relaxed font-serif">
                    Năm 1959, tại Cầu Vực (Cổ Loa), các nhà khảo cổ đã tìm thấy kho tên chứa hơn <strong>10.000 mũi tên đồng ba cạnh</strong>. Hãy so sánh hai loại mũi tên để hiểu tính ưu việt khí động học của người Việt cổ:
                  </p>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleSelectArrow('TWO_WINGED')}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedArrowType === 'TWO_WINGED'
                          ? 'bg-amber-100 border-amber-500'
                          : 'bg-white border-parchment-300 hover:bg-parchment-200'
                      }`}
                    >
                      <div className="font-bold text-lacquer mb-1">Mũi Tên 2 Cạnh Phẳng Thông Thường</div>
                      <p className="text-[11px] text-lacquer/70 font-serif leading-snug">
                        Dễ gia công đúc khuôn nhưng khi gặp gió ngang dễ bị chao đảo, quỹ đạo bay lệch tâm và lực xuyên phá áo giáp yếu.
                      </p>
                    </button>

                    <button
                      onClick={() => handleSelectArrow('THREE_WINGED')}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedArrowType === 'THREE_WINGED'
                          ? 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950 shadow-md ring-1 ring-emerald-400'
                          : 'bg-white border-parchment-300 hover:bg-parchment-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-950">
                          Mũi Tên Đồng Ba Cạnh Cầu Vực (Đông Sơn)
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Khí Động Học Chuẩn
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900/85 font-serif leading-snug">
                        Ba cánh én tạo độ cân bằng trọng tâm hoàn hảo, khiến mũi tên xoay tròn tự ổn định dọc trục bay (tương tự đạn súng có rãnh khương tuyến). Đâm xuyên giáp trụ và tạo vết thương khó lành!
                      </p>
                    </button>
                  </div>

                  {selectedArrowType === 'THREE_WINGED' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-serif leading-relaxed">
                      <strong>Kết luận khoa học:</strong> Huyền thoại Nỏ Thần bắn một phát trăm mũi tên chính là hiện thân cho đỉnh cao luyện kim đúc đồng và sự chính xác cơ khí của người Âu Lạc dưới thời An Dương Vương và tướng Cao Lỗ.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HỘI NGHỊ QUÂN CƠ TIỀN NGÔ VƯƠNG */}
          {/* ========================================================================= */}
          {activeTab === 'MISSION_WAR_COUNCIL_DEBATE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2A1810] via-[#1C1008] to-[#2A1810] border-4 border-bronze text-amber-100 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-amber-900/60 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="font-title font-bold text-amber-200 text-sm sm:text-base">
                      Đại Bản Doanh Tiền Ngô Vương: Luận Bàn Quân Cơ
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-400/90 font-serif">
                    Nghị sự {debateStep + 1} / {WAR_COUNCIL_DEBATES.length}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-serif italic text-amber-200/95 leading-relaxed mb-4 p-3 rounded-xl bg-black/40 border border-amber-900/50">
                  {WAR_COUNCIL_DEBATES[debateStep].question}
                </div>

                {/* Các phương án tranh luận */}
                <div className="space-y-3">
                  {WAR_COUNCIL_DEBATES[debateStep].options.map((opt) => {
                    const isSelected = debateChoices[WAR_COUNCIL_DEBATES[debateStep].topicId] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          handleSelectDebate(
                            WAR_COUNCIL_DEBATES[debateStep].topicId,
                            opt.id,
                            opt.feedback,
                            opt.isBest
                          )
                        }
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? opt.isBest
                              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold ring-2 ring-emerald-500'
                              : 'bg-rose-950/90 border-rose-400 text-rose-100 font-bold'
                            : 'bg-black/50 border-amber-900/70 text-amber-100 hover:bg-black/70'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                          {opt.speaker}
                        </div>
                        <div className="font-serif leading-relaxed text-xs">{opt.argument}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Phản hồi từ Tiền Ngô Vương */}
                {debateFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-xl text-xs font-serif leading-relaxed flex items-start gap-2.5 ${
                      debateFeedback.isBest
                        ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500'
                        : 'bg-amber-900/60 text-amber-200 border border-amber-500'
                    }`}
                  >
                    {debateFeedback.isBest ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>{debateFeedback.text}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KÝ SỰ HẬU CẦN — TOÀN DÂN ĐỒNG LÒNG ĐÁNH GIẶC */}
          {/* ========================================================================= */}
          {activeTab === 'MISSION_LOGISTICS_AND_PEOPLE' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-lacquer font-serif leading-relaxed">
                Chiến thắng Bạch Đằng không chỉ là sự mưu lược của vị chủ soái mà còn là kết tinh của <strong>sức mạnh toàn dân</strong>: hàng ngàn người dân đẵn gỗ, quạt bễ rèn đai sắt và trét thuyền phục vụ mặt trận. Hãy tương tác với 3 trạm hậu cần dân gian:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Trạm 1: Rừng Gỗ Lim Yên Hưng */}
                <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-crimson text-xs uppercase mb-1">
                      <Trees className="w-4 h-4" />
                      1. Đẵn Gỗ Rừng Lim
                    </div>
                    <p className="text-[11px] text-lacquer/80 font-serif leading-relaxed">
                      Tuyển chọn cây gỗ lim, sến, táu đường kính 25-30cm, thân thẳng dài 2.5 - 3 mét từ rừng Yên Hưng về bãi cắm cọc.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteLogisticsStep('timber')}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logisticsTimber
                        ? 'bg-emerald-600 text-white'
                        : 'bg-crimson hover:bg-crimson-light text-white'
                    }`}
                  >
                    {logisticsTimber ? <CheckCircle2 className="w-4 h-4" /> : <Hammer className="w-4 h-4" />}
                    <span>{logisticsTimber ? 'Đã Tuyển Gỗ Lim Đạt Chuẩn' : 'Vận Chuyển Gỗ Về Bến'}</span>
                  </button>
                </div>

                {/* Trạm 2: Lò Rèn Sắt Dân Gian */}
                <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-crimson text-xs uppercase mb-1">
                      <Flame className="w-4 h-4" />
                      2. Tôi Sắt Bọc Mũi Cọc
                    </div>
                    <p className="text-[11px] text-lacquer/80 font-serif leading-relaxed">
                      Lò than hoa quạt bễ lửa già nung đai sắt tôi cứng bọc kín đầu cọc nhọn để chống tước khi đâm thủng lườn thuyền giặc.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteLogisticsStep('forge')}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logisticsForge
                        ? 'bg-emerald-600 text-white'
                        : 'bg-crimson hover:bg-crimson-light text-white'
                    }`}
                  >
                    {logisticsForge ? <CheckCircle2 className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    <span>{logisticsForge ? 'Đã Rèn Đai Sắt Tôi Cứng' : 'Quạt Bễ Rèn Đai Sắt'}</span>
                  </button>
                </div>

                {/* Trạm 3: Xưởng Trét Dầu Rái Thuyền Nan */}
                <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-bronze flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-crimson text-xs uppercase mb-1">
                      <Anchor className="w-4 h-4" />
                      3. Dầu Rái Thuyền Nan
                    </div>
                    <p className="text-[11px] text-lacquer/80 font-serif leading-relaxed">
                      Trộn bột vỏ hàu tôi vôi với nhựa dầu rái trét kín mép thuyền nan, giúp thuyền nhẹ mớn nước nông lướt nhanh trên sóng.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteLogisticsStep('pitch')}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logisticsPitch
                        ? 'bg-emerald-600 text-white'
                        : 'bg-crimson hover:bg-crimson-light text-white'
                    }`}
                  >
                    {logisticsPitch ? <CheckCircle2 className="w-4 h-4" /> : <Anchor className="w-4 h-4" />}
                    <span>{logisticsPitch ? 'Đã Trét Kín Dầu Rái' : 'Trét Thuyền Phục Vụ Trận'}</span>
                  </button>
                </div>
              </div>

              {logisticsTimber && logisticsForge && logisticsPitch && (
                <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-serif leading-relaxed flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>
                    Toàn bộ hậu cần tiền tuyến đã hoàn tất! Hàng ngàn cọc gỗ bịt sắt và đội thuyền nhẹ sẵn sàng xuất kích. Tinh thần toàn dân quyết chiến làm nên chiến thắng nghìn năm!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-parchment-100 border-t border-parchment-300 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-lacquer/70">
            <BookOpen className="w-4 h-4 text-crimson" />
            <span>Tích lũy Điểm Học Giả ({progress.scholarPoints || 0}đ) thăng hàm Quốc Tử Giám</span>
          </div>

          <button
            onClick={closeHistoricalMissions}
            className="px-5 py-2 rounded-xl bg-lacquer text-parchment-100 font-bold hover:bg-lacquer-dark transition-all"
          >
            Đóng bảng nhiệm vụ
          </button>
        </div>
      </div>
    </div>
  );
};
