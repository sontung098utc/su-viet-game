import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RotateCw,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Scroll,
} from 'lucide-react';
import type { CoLoaRelicId } from '../../types';
import { CO_LOA_RELICS } from '../../data/chapterCoLoa';
import { sound } from '../../utils/sound';

interface CoLoaPuzzleModalProps {
  relicId: CoLoaRelicId | null;
  isOpen: boolean;
  onSolveSuccess: (relicId: CoLoaRelicId) => void;
  onClose: () => void;
}

export const CoLoaPuzzleModal: React.FC<CoLoaPuzzleModalProps> = ({
  relicId,
  isOpen,
  onSolveSuccess,
  onClose,
}) => {
  // Thoát Pointer Lock ngay khi Modal mở ra để con trỏ chuột tự do click
  useEffect(() => {
    if (isOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isOpen]);

  // Phím tắt ESC để đóng
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // =========================================================================
  // MINI-GAME 1: CƠ QUAN KHÓA LẪY NỎ 4 THEN BÁNH RĂNG LIÊN ĐỘNG CAO LỖ
  // Quy luật:
  // - Trục A xoay kéo Trục B quay ngược chiều (delta = -90°)
  // - Trục B xoay kéo Trục C quay cùng chiều (delta = +90°)
  // - Trục C xoay kéo Trục D quay ngược chiều (delta = -90°)
  // - Trục D xoay kéo Trục A quay cùng chiều (delta = +90°)
  // Cả 4 trục phải đạt 0° (Then khớp 100% thẳng hàng) để chịu lực 400 lbs!
  // =========================================================================
  const [gears, setGears] = useState<[number, number, number, number]>([90, 180, 270, 90]);
  const [isGearsUnlocked, setIsGearsUnlocked] = useState(false);
  const [tensionPounds, setTensionPounds] = useState(120);

  // =========================================================================
  // MINI-GAME 2: KỲ TRẬN TRỐNG ĐỒNG ĐÔNG SƠN - BÁT QUÁI THIÊN VĂN (3 TẦNG ĐỒNG TÂM)
  // Vòng 1 (Tâm - Mặt trời 14 tia): Cần hướng về Khảm (Bắc - 0°)
  // Vòng 2 (Giữa - Đàn Chim Lạc 18 con): Cần hướng về Tốn (Đông Nam - 135°)
  // Vòng 3 (Ngoài - Thuyền Chiến Giao Long & Quẻ Dịch): Cần hướng về Đoài (Tây - 270°)
  // Xoay Vòng Ngoài kéo Vòng Giữa quay thêm 45° (hiệu ứng thiên văn quay)
  // =========================================================================
  const [ringSun, setRingSun] = useState<number>(90);       // Mục tiêu: 0°
  const [ringBirds, setRingBirds] = useState<number>(45);   // Mục tiêu: 135°
  const [ringBoats, setRingBoats] = useState<number>(180);  // Mục tiêu: 270°
  const [isDrumUnlocked, setIsDrumUnlocked] = useState(false);

  // =========================================================================
  // MINI-GAME 3: KHÓA ỐNG ĐỒNG CRYPTEX THẺ TRE KHẢO CỔ 4 TRỤC LĂN
  // =========================================================================
  const eraOptions = [
    { label: 'TK X SCN', desc: 'Ngô Quyền - Bạch Đằng' },
    { label: 'TK III TCN', desc: 'Thục An Dương Vương - Âu Lạc' },
    { label: 'TK I SCN', desc: 'Hai Bà Trưng - Mê Linh' },
    { label: 'TK XV SCN', desc: 'Lê Lợi - Lam Sơn' },
  ];
  const locationOptions = [
    { label: 'Bạch Đằng', desc: 'Cọc gỗ ngập triều' },
    { label: 'Cầu Vực', desc: 'Hàng vạn mũi tên đồng' },
    { label: 'Hoa Lư', desc: 'Kinh đô đá che chở' },
    { label: 'Vạn Kiếp', desc: 'Lục Đầu Giang phòng ngự' },
  ];
  const aeroOptions = [
    { label: 'Mũi Tròn Nặng', desc: 'Lực đập đá thô sơ' },
    { label: '2 Cạnh Dẹp', desc: 'Dễ chao đảo khi gặp gió' },
    { label: '3 Cánh Én', desc: 'Khí động học xé gió xuyên giáp' },
    { label: '4 Cạnh Khối', desc: 'Quá nặng làm giảm tầm bắn' },
  ];
  const alloyOptions = [
    { label: '90% Cu - 10% Sn', desc: 'Quá dẻo, cong khi gặp khiên' },
    { label: '75% Cu - 20% Sn - 5% Pb', desc: 'Tỷ lệ Đông Sơn chuẩn xác' },
    { label: '50% Cu - 50% Sn', desc: 'Quá giòn, vỡ nát khi va chạm' },
    { label: '65% Cu - 35% Sn', desc: 'Độ cứng kém, dễ biến dạng' },
  ];

  const [crypEra, setCrypEra] = useState<number>(0);
  const [crypLoc, setCrypLoc] = useState<number>(0);
  const [crypAero, setCrypAero] = useState<number>(1);
  const [crypAlloy, setCrypAlloy] = useState<number>(0);
  const [cryptexFeedback, setCryptexFeedback] = useState<string | null>(null);
  const [isCryptexUnlocked, setIsCryptexUnlocked] = useState(false);

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setGears([90, 180, 270, 90]);
      setIsGearsUnlocked(false);
      setTensionPounds(120);

      setRingSun(90);
      setRingBirds(45);
      setRingBoats(180);
      setIsDrumUnlocked(false);

      setCrypEra(0);
      setCrypLoc(0);
      setCrypAero(1);
      setCrypAlloy(0);
      setCryptexFeedback(null);
      setIsCryptexUnlocked(false);
    }
  }, [isOpen, relicId]);

  // --- LOGIC MINI-GAME 1: XOAY BÁNH RĂNG LIÊN ĐỘNG ---
  const handleTurnGear = (gearIndex: 0 | 1 | 2 | 3) => {
    if (isGearsUnlocked) return;
    sound.playCipherTurn();

    const nextGears: [number, number, number, number] = [...gears];
    // Xoay bánh răng được chọn +90 độ
    nextGears[gearIndex] = (nextGears[gearIndex] + 90) % 360;

    // Tác động liên đới cơ học
    if (gearIndex === 0) {
      nextGears[1] = (nextGears[1] - 90 + 360) % 360;
    } else if (gearIndex === 1) {
      nextGears[2] = (nextGears[2] + 90) % 360;
    } else if (gearIndex === 2) {
      nextGears[3] = (nextGears[3] - 90 + 360) % 360;
    } else if (gearIndex === 3) {
      nextGears[0] = (nextGears[0] + 90) % 360;
    }

    setGears(nextGears);

    // Tính toán lực căng nỏ (Tension)
    let matching = 0;
    nextGears.forEach((angle) => {
      if (angle === 0) matching++;
    });
    const calculatedTension = 100 + matching * 75;
    setTensionPounds(calculatedTension);

    // Kiểm tra nếu cả 4 then cài đều khớp về 0°
    if (nextGears[0] === 0 && nextGears[1] === 0 && nextGears[2] === 0 && nextGears[3] === 0) {
      setIsGearsUnlocked(true);
      setTensionPounds(400);
      sound.playChestUnlock();
      setTimeout(() => {
        if (relicId) onSolveSuccess(relicId);
      }, 1500);
    }
  };

  const handleResetGears = () => {
    sound.playClick();
    setGears([90, 180, 270, 90]);
    setTensionPounds(120);
    setIsGearsUnlocked(false);
  };

  // --- LOGIC MINI-GAME 2: BÀN TRỐNG ĐỒNG ĐÔNG SƠN ---
  const rotateRingSun = () => {
    if (isDrumUnlocked) return;
    sound.playCipherTurn();
    const next = (ringSun + 45) % 360;
    setRingSun(next);
    checkDrumSolution(next, ringBirds, ringBoats);
  };

  const rotateRingBirds = () => {
    if (isDrumUnlocked) return;
    sound.playCipherTurn();
    const next = (ringBirds + 45) % 360;
    setRingBirds(next);
    checkDrumSolution(ringSun, next, ringBoats);
  };

  const rotateRingBoats = () => {
    if (isDrumUnlocked) return;
    sound.playCipherTurn();
    const nextBoats = (ringBoats + 45) % 360;
    // Hiệu ứng thiên văn: xoay vòng thuyền kéo vòng chim Lạc lệch 45°
    const nextBirds = (ringBirds + 45) % 360;
    setRingBoats(nextBoats);
    setRingBirds(nextBirds);
    checkDrumSolution(ringSun, nextBirds, nextBoats);
  };

  const checkDrumSolution = (sun: number, birds: number, boats: number) => {
    if (sun === 0 && birds === 135 && boats === 270) {
      setIsDrumUnlocked(true);
      sound.playBronzeDrum();
      sound.playChestUnlock();
      setTimeout(() => {
        if (relicId) onSolveSuccess(relicId);
      }, 1600);
    }
  };

  const handleResetDrum = () => {
    sound.playClick();
    setRingSun(90);
    setRingBirds(45);
    setRingBoats(180);
    setIsDrumUnlocked(false);
  };

  // --- LOGIC MINI-GAME 3: KHÓA ỐNG ĐỒNG CRYPTEX ---
  const handleCheckCryptex = () => {
    sound.playClick();
    // Đáp án chuẩn khảo cổ học:
    // Era = 1 (TK III TCN - Thục An Dương Vương)
    // Loc = 1 (Cầu Vực - Cổ Loa)
    // Aero = 2 (3 Cánh Én Khí Động Học)
    // Alloy = 1 (75% Cu - 20% Sn - 5% Pb)

    if (crypEra !== 1) {
      sound.playError();
      setCryptexFeedback('❌ Trục 1 sai: Thành Cổ Loa và Nỏ Thần được xây dựng thời Thục An Dương Vương (TK III TCN), không phải thời Ngô Quyền hay Lam Sơn!');
      return;
    }
    if (crypLoc !== 1) {
      sound.playError();
      setCryptexFeedback('❌ Trục 2 sai: Năm 1959, kho hàng vạn mũi tên đồng được khai quật tại Cầu Vực (Cổ Loa), là kho vũ khí khảo cổ lớn nhất Đông Nam Á!');
      return;
    }
    if (crypAero !== 2) {
      sound.playError();
      setCryptexFeedback('❌ Trục 3 sai: Mũi tên đồng Cổ Loa có 3 cạnh hình cánh én, giúp tạo rãnh thoát khí động học, bay xa gấp 3 lần mũi tên thường!');
      return;
    }
    if (crypAlloy !== 1) {
      sound.playError();
      setCryptexFeedback('❌ Trục 4 sai: Kết quả phân tích đồng vị kim loại chứng minh hợp kim nỏ Cổ Loa đạt tỷ lệ đỉnh cao: 75% Đồng (độ bền), 20% Thiếc (độ sắc), 5% Chì (chảy đều vào khuôn đá 3 mang)!');
      return;
    }

    // Đúng cả 4 trục!
    setIsCryptexUnlocked(true);
    setCryptexFeedback('✨ TUYỆT VỜI! Mật thư thẻ tre đã được giải mã! Hòm đồng khai mở, thu nhận Ống Tên Đồng Ba Cạnh Cầu Vực!');
    sound.playSuccess();
    sound.playChestUnlock();
    setTimeout(() => {
      if (relicId) onSolveSuccess(relicId);
    }, 1600);
  };

  if (!isOpen || !relicId) return null;
  const relic = CO_LOA_RELICS[relicId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-parchment-100 border-4 border-bronze rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header Mỹ Thuật Đông Sơn Cung Đình */}
        <div className="bg-gradient-to-r from-lacquer via-crimson to-lacquer p-4 text-parchment-100 flex items-center justify-between border-b-2 border-bronze/60 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-200/90 font-mono flex items-center gap-1.5">
                <span>Cơ Quan Giải Mật Mã Cổ Loa</span>
                <span>•</span>
                <span className="text-white/80">{relic.locationName}</span>
              </span>
              <h3 className="font-title text-base sm:text-lg font-bold text-white leading-tight">
                {relic.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Đóng (phím ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Nội Dung Giải Đố */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-lacquer">
          {/* ========================================================================= */}
          {/* CÂU ĐỐ 1: KHÓA BÁNH RĂNG TRUYỀN LỰC 4 THEN CAO LỖ */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_CROSSBOW_STOCK' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-crimson flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-crimson" />
                    Bản Vẽ Cơ Khí Lò Rèn Cao Lỗ (Bảo Vật Quốc Gia):
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/80 font-mono font-bold text-lacquer">
                    ĐỘ KHÓ: CAO
                  </span>
                </div>
                <p className="italic text-lacquer/90">
                  "Lẫy nỏ liên châu gồm 4 bộ phận truyền động cơ khí liên hoàn: <strong>Then Cò (A)</strong>, <strong>Hãm Dây (B)</strong>, <strong>Khóa Chốt (C)</strong> và <strong>Thước Ngắm (D)</strong>. Do các bánh răng cắn khớp chéo nhau, xoay một then sẽ kéo then khác chuyển động! Hãy đưa <strong>cả 4 then cài về góc 0° (thẳng đứng vào ngàm khóa)</strong> để đạt lực căng cực đại <strong>400 cân lực (400 lbs)</strong>."
                </p>
              </div>

              {/* Bảng Đo Lực Căng Dây Nỏ (Tension Meter) */}
              <div className="bg-gradient-to-r from-stone-900 via-lacquer to-stone-900 p-3 rounded-2xl border border-amber-500/40 text-parchment-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-200 font-mono">
                      Áp Lực Dây Gân Nỏ (Tension)
                    </span>
                    <div className="text-base font-bold font-mono text-white flex items-center gap-1.5">
                      <span>{tensionPounds}</span>
                      <span className="text-xs text-amber-300">/ 400 LBS</span>
                    </div>
                  </div>
                </div>

                <div className="w-48 bg-stone-800 rounded-full h-3.5 overflow-hidden border border-stone-600 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tensionPounds >= 400
                        ? 'bg-gradient-to-r from-emerald-400 to-amber-300 shadow-lg shadow-emerald-400/50'
                        : 'bg-gradient-to-r from-amber-600 to-amber-400'
                    }`}
                    style={{ width: `${(tensionPounds / 400) * 100}%` }}
                  />
                </div>

                <button
                  onClick={handleResetGears}
                  disabled={isGearsUnlocked}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] flex items-center gap-1 border border-stone-600 cursor-pointer"
                  title="Đặt lại vị trí ban đầu"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Bàn Cơ Khí 4 Bánh Răng Tương Tác */}
              <div className="bg-gradient-to-b from-[#3a281c] to-[#1a110a] p-5 sm:p-6 rounded-2xl border-2 border-amber-600/50 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full z-10">
                  {([
                    { name: 'Then A (Cò)', desc: 'Liên kết ngược B' },
                    { name: 'Then B (Hãm)', desc: 'Liên kết thuận C' },
                    { name: 'Then C (Khóa)', desc: 'Liên kết ngược D' },
                    { name: 'Then D (Ngắm)', desc: 'Liên kết thuận A' },
                  ] as const).map((gearInfo, idx) => {
                    const angle = gears[idx as 0 | 1 | 2 | 3];
                    const isAligned = angle === 0;
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center bg-stone-900/60 p-3 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-colors"
                      >
                        <span className="text-[11px] font-bold text-amber-300 mb-0.5">
                          {gearInfo.name}
                        </span>
                        <span className="text-[9px] text-amber-200/60 font-mono mb-2">
                          {gearInfo.desc}
                        </span>

                        <button
                          onClick={() => handleTurnGear(idx as 0 | 1 | 2 | 3)}
                          disabled={isGearsUnlocked}
                          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 transition-transform duration-300 flex items-center justify-center shadow-xl relative cursor-pointer active:scale-95 ${
                            isAligned
                              ? 'bg-gradient-to-tr from-emerald-700 via-amber-600 to-amber-400 border-amber-200 shadow-emerald-500/30'
                              : 'bg-gradient-to-tr from-stone-800 to-stone-700 border-stone-500 hover:border-amber-400'
                          }`}
                          style={{ transform: `rotate(${angle}deg)` }}
                        >
                          {/* Rãnh răng cưa đồng */}
                          <div className="absolute inset-0 rounded-full border border-dashed border-amber-300/40" />
                          {/* Then cài đồng */}
                          <div
                            className={`w-3 sm:w-3.5 h-full rounded-full shadow-md transition-colors ${
                              isAligned
                                ? 'bg-gradient-to-b from-amber-200 via-white to-amber-200 shadow-white/60'
                                : 'bg-stone-900 border border-stone-600'
                            }`}
                          />
                          {/* Trục tâm hoa sen Đông Sơn */}
                          <div className="absolute w-6 h-6 rounded-full bg-amber-950 border-2 border-amber-300 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </button>

                        <div className="mt-2 text-center">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isAligned
                                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {angle}° {isAligned ? '✓ KHỚP' : '✗ LỆCH'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleTurnGear(idx as 0 | 1 | 2 | 3)}
                          disabled={isGearsUnlocked}
                          className="mt-2 w-full py-1 rounded bg-amber-800/60 hover:bg-amber-600 border border-amber-400/40 text-amber-200 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Xoay Then</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {isGearsUnlocked ? (
                  <div className="mt-4 px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce shadow-xl">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>CẠCH! BỐN THEN ĐỒNG ĐÃ ĂN KHỚP HOÀN TOÀN — THU NHẬN THÂN NỎ!</span>
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] font-mono text-amber-300/80 text-center">
                    Gợi ý cơ học: Xoay các then có chu kỳ truyền động ngược chiều nhau để triệt tiêu độ lệch!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CÂU ĐỐ 2: KỲ TRẬN TRỐNG ĐỒNG ĐÔNG SƠN - BÁT QUÁI THIÊN VĂN */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_TURTLE_TRIGGER' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-crimson flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-crimson" />
                    Lời Sấm Trên Văn Bia Trống Đồng Ngọc Lũ (Đàn Sen Đá Giếng Ngọc):
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/80 font-mono font-bold text-lacquer">
                    ĐỘ KHÓ: THIÊN VĂN
                  </span>
                </div>
                <p className="italic text-lacquer/90 leading-relaxed">
                  "Mặt trời mười bốn tia soi <strong>Cõi Khảm (Bắc - 0°)</strong>,<br />
                  Đàn chim Lạc sải cánh nghìn năm hướng về <strong>Cõi Tốn (Đông Nam - 135°)</strong> đón gió mùa lúa nước,<br />
                  Thuyền rồng Giao Long rẽ sóng tiến thẳng <strong>Cõi Đoài (Tây - 270°)</strong> bảo vệ cửa ngõ Loa Thành.<br />
                  Tam giới hòa quyện, hộp lẫy Móng Rùa tự khắc mở then!"
                </p>
                <p className="text-[11px] text-crimson/80 mt-1 font-mono font-bold">
                  * Chú ý: Vòng Ngoài (Thuyền Rồng) khi xoay sẽ tạo luồng khí đẩy Vòng Giữa (Chim Lạc) lệch 45°!
                </p>
              </div>

              {/* Bàn Đá Xoay Trống Đồng 3 Tầng Đồng Tâm */}
              <div className="bg-gradient-to-b from-[#221c16] to-[#120e0a] p-5 sm:p-6 rounded-2xl border-2 border-emerald-600/50 shadow-inner flex flex-col items-center justify-center relative">
                {/* La Bàn Phương Hướng Tham Chiếu */}
                <div className="flex items-center justify-between w-full max-w-sm mb-2 text-[10px] font-mono text-amber-200">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Tâm Trời: 0° (Bắc - Khảm)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Chim Lạc: 135° (Đông Nam - Tốn)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Thuyền Rồng: 270° (Tây - Đoài)</span>
                  </span>
                </div>

                {/* VÒNG ĐỒNG TÂM 3 LỚP */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-3">
                  {/* VÒNG 3 (NGOÀI CÙNG): 8 QUẺ DỊCH VÀ THUYỀN RỒNG GIAO LONG */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-amber-600/70 bg-gradient-to-tr from-stone-800 via-amber-950 to-stone-800 shadow-2xl transition-transform duration-500 flex items-center justify-center"
                    style={{ transform: `rotate(${ringBoats}deg)` }}
                  >
                    {/* Thuyền rồng định hướng tại đỉnh kim */}
                    <div className="absolute top-1 text-[10px] font-bold text-cyan-300 flex flex-col items-center">
                      <span>⚓ THUYỀN RỒNG GIAO LONG</span>
                      <span className="text-[8px] text-white">▲ ĐẦU MŨI THUYỀN</span>
                    </div>
                    <div className="absolute right-2 text-[9px] font-bold text-amber-300 rotate-90">
                      QUẺ LY (NAM)
                    </div>
                    <div className="absolute bottom-2 text-[9px] font-bold text-amber-300">
                      QUẺ CÀN (TRỜI)
                    </div>
                    <div className="absolute left-2 text-[9px] font-bold text-amber-300 -rotate-90">
                      QUẺ KHÔN (ĐẤT)
                    </div>
                  </div>

                  {/* VÒNG 2 (GIỮA): 18 CHIM LẠC SẢI CÁNH BAY */}
                  <div
                    className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-700 via-stone-800 to-amber-900 shadow-xl transition-transform duration-500 flex items-center justify-center"
                    style={{ transform: `rotate(${ringBirds}deg)` }}
                  >
                    <div className="absolute top-1 text-[10px] font-bold text-amber-200 flex flex-col items-center">
                      <span>🕊️ ĐẦU ĐÀN CHIM LẠC</span>
                      <span className="text-[8px] text-amber-300">▲ HƯỚNG MỎ BAY</span>
                    </div>
                  </div>

                  {/* VÒNG 1 (TRONG CÙNG): MẶT TRỜI 14 TIA SÁNG ĐÔNG SƠN */}
                  <div
                    className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full border-3 border-amber-200 bg-gradient-to-tr from-amber-500 to-amber-700 shadow-2xl transition-transform duration-500 flex items-center justify-center"
                    style={{ transform: `rotate(${ringSun}deg)` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-crimson border-2 border-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-200" />
                    </div>
                    <div className="absolute top-0.5 text-[9px] font-bold text-white flex flex-col items-center">
                      <span>☀️ TIA CHÍNH</span>
                    </div>
                  </div>
                </div>

                {/* 3 Nút Điều Khiển Xoay Từng Vòng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full mt-2">
                  <button
                    onClick={rotateRingSun}
                    disabled={isDrumUnlocked}
                    className="px-3 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-700 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xoay Mặt Trời (+45°) [{ringSun}°]</span>
                  </button>

                  <button
                    onClick={rotateRingBirds}
                    disabled={isDrumUnlocked}
                    className="px-3 py-2 rounded-xl bg-amber-800/80 hover:bg-amber-600 border border-amber-300/50 text-amber-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xoay Chim Lạc (+45°) [{ringBirds}°]</span>
                  </button>

                  <button
                    onClick={rotateRingBoats}
                    disabled={isDrumUnlocked}
                    className="px-3 py-2 rounded-xl bg-cyan-900/80 hover:bg-cyan-700 border border-cyan-400/50 text-cyan-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xoay Thuyền Rồng (+45°) [{ringBoats}°]</span>
                  </button>
                </div>

                <div className="flex items-center justify-between w-full mt-2">
                  <button
                    onClick={handleResetDrum}
                    disabled={isDrumUnlocked}
                    className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 border border-stone-600 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Vị Trí</span>
                  </button>

                  <div className="text-[11px] font-mono text-amber-300">
                    Trạng thái: [Tâm: {ringSun === 0 ? '✓' : '✗'}] [Chim: {ringBirds === 135 ? '✓' : '✗'}] [Thuyền: {ringBoats === 270 ? '✓' : '✗'}]
                  </div>
                </div>

                {isDrumUnlocked && (
                  <div className="mt-3 px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce shadow-xl">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>TIẾNG TRỐNG ĐỒNG VANG VỌNG — THU NHẬN LẪY MÓNG RÙA KIM QUY!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CÂU ĐỐ 3: KHÓA ỐNG ĐỒNG CRYPTEX THẺ TRE KHẢO CỔ 4 TRỤC */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_BRONZE_ARROWS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-crimson flex items-center gap-1.5">
                    <Scroll className="w-4 h-4 text-crimson" />
                    Mật Lệnh Thẻ Tre Khảo Cổ Kho Tên Đồng Cổ Loa:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/80 font-mono font-bold text-lacquer">
                    ĐỘ KHÓ: KHẢO CỔ HỌC
                  </span>
                </div>
                <p className="italic text-lacquer/90 leading-relaxed">
                  "Để mở chiếc hòm đồng chứa hàng vạn mũi tên bí mật, người giữ sử phải thấu hiểu 4 yếu tố cốt lõi được ghi chép trong <em>Đại Việt Sử Ký Toàn Thư</em> và <em>Khảo cổ học Cổ Loa 1959</em>: <strong>Thời đại lập quốc</strong>, <strong>Địa danh phát lộ kho tên</strong>, <strong>Hình dạng khí động học</strong> và <strong>Tỷ lệ hợp kim đồng thau Đông Sơn</strong>."
                </p>
              </div>

              {/* 4 Trục Lăn Con Lăn Khảo Cổ */}
              <div className="bg-gradient-to-b from-[#2b1f17] to-[#170f0a] p-4 sm:p-6 rounded-2xl border-2 border-amber-600/50 shadow-inner flex flex-col items-center justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
                  {/* TRỤC 1: NIÊN ĐẠI LỊCH SỬ */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-1">
                      1. Niên Đại
                    </span>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypEra((prev) => (prev - 1 + eraOptions.length) % eraOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="my-1.5 px-1 py-2 rounded w-full text-center bg-amber-950/80 border border-amber-500/60">
                      <div className="font-bold text-xs text-white">{eraOptions[crypEra].label}</div>
                      <div className="text-[9px] text-amber-300/80 mt-0.5">{eraOptions[crypEra].desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypEra((prev) => (prev + 1) % eraOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* TRỤC 2: ĐỊA DANH KHẢO CỔ */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-1">
                      2. Địa Danh
                    </span>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypLoc((prev) => (prev - 1 + locationOptions.length) % locationOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="my-1.5 px-1 py-2 rounded w-full text-center bg-amber-950/80 border border-amber-500/60">
                      <div className="font-bold text-xs text-white">{locationOptions[crypLoc].label}</div>
                      <div className="text-[9px] text-amber-300/80 mt-0.5">{locationOptions[crypLoc].desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypLoc((prev) => (prev + 1) % locationOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* TRỤC 3: DẠNG KHÍ ĐỘNG HỌC */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-1">
                      3. Khí Động Học
                    </span>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypAero((prev) => (prev - 1 + aeroOptions.length) % aeroOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="my-1.5 px-1 py-2 rounded w-full text-center bg-amber-950/80 border border-amber-500/60">
                      <div className="font-bold text-xs text-white">{aeroOptions[crypAero].label}</div>
                      <div className="text-[9px] text-amber-300/80 mt-0.5">{aeroOptions[crypAero].desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypAero((prev) => (prev + 1) % aeroOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* TRỤC 4: TỶ LỆ HỢP KIM ĐÔNG SƠN */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-1">
                      4. Hợp Kim Đúc
                    </span>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypAlloy((prev) => (prev - 1 + alloyOptions.length) % alloyOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="my-1.5 px-1 py-2 rounded w-full text-center bg-amber-950/80 border border-amber-500/60">
                      <div className="font-bold text-xs text-white">{alloyOptions[crypAlloy].label}</div>
                      <div className="text-[9px] text-amber-300/80 mt-0.5">{alloyOptions[crypAlloy].desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        sound.playCipherTurn();
                        setCrypAlloy((prev) => (prev + 1) % alloyOptions.length);
                        setCryptexFeedback(null);
                      }}
                      className="p-1 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Phản hồi phân tích khảo cổ học */}
                {cryptexFeedback && (
                  <div className={`mt-3 p-3 rounded-xl w-full text-xs font-serif leading-relaxed flex items-start gap-2 border ${
                    isCryptexUnlocked
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/80 border-red-500 text-red-200'
                  }`}>
                    {isCryptexUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>{cryptexFeedback}</span>
                  </div>
                )}

                {/* Nút Thử Khóa */}
                {!isCryptexUnlocked && (
                  <button
                    onClick={handleCheckCryptex}
                    className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-crimson to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-bold text-xs tracking-wider uppercase shadow-xl transition-all cursor-pointer active:scale-95 border border-amber-300"
                  >
                    Kiểm Tra Mật Mã Khảo Cổ & Khai Mở Khóa
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
