import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  X,
  Info,
  Scale,
  Wind,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface SmeltingPuzzleModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const SmeltingPuzzleModal: React.FC<SmeltingPuzzleModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  // Giai đoạn quy trình luyện kim:
  // 1: Phân loại Quặng Thô (Ore Selection)
  // 2: Cân Đong Tỷ Lệ Hợp Kim Đông Sơn (Alloy Proportioning)
  // 3: Thổi Bễ Than Củi Điều Nhiệt Lò Nung (Bellows Temperature Control)
  const [phase, setPhase] = useState<1 | 2 | 3>(1);

  // Giai đoạn 1: Lựa chọn 2 quặng đồng tốt nhất
  const [selectedOres, setSelectedOres] = useState<string[]>([]);
  const [oreFeedback, setOreFeedback] = useState<string | null>(null);

  // Giai đoạn 2: Tỷ lệ phần trăm hợp kim (Tổng = 100%)
  // Mục tiêu khảo cổ Đông Sơn: 75% Đồng (Cu) | 20% Thiếc (Sn) | 5% Chì (Pb)
  const [copper, setCopper] = useState<number>(60);
  const [tin, setTin] = useState<number>(30);
  const [lead, setLead] = useState<number>(10);
  const [alloyFeedback, setAlloyFeedback] = useState<string | null>(null);

  // Giai đoạn 3: Minigame Bễ Thổi Than Củi
  // Nhiệt độ lò (C). Dải tối ưu đúc đồng thau Cổ Loa: 1085°C - 1150°C
  const [furnaceTemp, setFurnaceTemp] = useState<number>(950);
  const [holdTimeSeconds, setHoldTimeSeconds] = useState<number>(0);
  const [isCastSuccess, setIsCastSuccess] = useState<boolean>(false);
  const [tempFeedback, setTempFeedback] = useState<string | null>(null);

  // Thoát pointer lock khi mở modal
  useEffect(() => {
    if (isOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset khi mở lại modal
  useEffect(() => {
    if (isOpen) {
      setPhase(1);
      setSelectedOres([]);
      setOreFeedback(null);
      setCopper(60);
      setTin(30);
      setLead(10);
      setAlloyFeedback(null);
      setFurnaceTemp(950);
      setHoldTimeSeconds(0);
      setIsCastSuccess(false);
      setTempFeedback(null);
    }
  }, [isOpen]);

  const isCastingRef = useRef(false);
  useEffect(() => {
    isCastingRef.current = isCastSuccess;
  }, [isCastSuccess]);

  useEffect(() => {
    if (!isOpen || phase !== 3 || isCastSuccess) return;

    const interval = setInterval(() => {
      if (isCastingRef.current) return;
      setFurnaceTemp((prev) => {
        // Tự giảm nhiệt nếu người chơi không thụt bễ
        const cooled = Math.max(850, prev - 12);
        return cooled;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, phase, isCastSuccess]);

  // Kiểm tra thời gian duy trì nhiệt độ vàng 1085 - 1150
  useEffect(() => {
    if (!isOpen || phase !== 3 || isCastSuccess) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    if (furnaceTemp >= 1085 && furnaceTemp <= 1150) {
      timer = setInterval(() => {
        setHoldTimeSeconds((prev) => {
          const next = prev + 0.5;
          if (next >= 4.0) {
            // ĐÚC THÀNH CÔNG!
            setIsCastSuccess(true);
            sound.playSteamQuench();
            sound.playSuccess();
            setTempFeedback('🔥 Kim loại lỏng đã chảy tràn ngập khuôn đá 3 mang! Chùm tên đồng 3 cạnh Cầu Vực sắc bén phi thường đã hoàn tất!');
            setTimeout(() => {
              onSuccess();
            }, 1800);
          }
          return next;
        });
      }, 500);
    } else {
      setHoldTimeSeconds(0);
    }

    return () => clearInterval(timer);
  }, [furnaceTemp, phase, isCastSuccess, isOpen, onSuccess]);

  // --- LOGIC GIAI ĐOẠN 1: CHỌN QUẶNG ĐỒNG ---
  const availableOres = [
    {
      id: 'malachite',
      name: 'Quặng Đồng Xanh (Malachite)',
      desc: 'Khoáng vật cacbonat đồng màu xanh lục, hàm lượng đồng cao và dễ tách lọc.',
      isCorrect: true,
    },
    {
      id: 'chalcopyrite',
      name: 'Quặng Đồng Vàng (Chalcopyrite)',
      desc: 'Quặng sunfua đồng-sắt cổ xưa, tạo độ dẻo dai chống mài mòn cho vũ khí.',
      isCorrect: true,
    },
    {
      id: 'pyrite',
      name: 'Quặng Vàng Găm (Pyrite Giả)',
      desc: 'Khoáng vật sunfua sắt giòn rụm, khi nấu sẽ sinh khói độc làm hỏng mẻ đúc.',
      isCorrect: false,
    },
    {
      id: 'quartzite',
      name: 'Đá Thạch Anh Tạp Chất',
      desc: 'Đá silicat trơ lỳ không chứa kim loại, làm nghẽn cổ lò luyện nung.',
      isCorrect: false,
    },
  ];

  const handleToggleOre = (oreId: string) => {
    sound.playClick();
    if (selectedOres.includes(oreId)) {
      setSelectedOres((prev) => prev.filter((id) => id !== oreId));
    } else {
      if (selectedOres.length < 2) {
        setSelectedOres((prev) => [...prev, oreId]);
      }
    }
    setOreFeedback(null);
  };

  const handleConfirmOres = () => {
    sound.playClick();
    if (selectedOres.length !== 2) {
      setOreFeedback('⚠️ Cần chọn đúng 2 mẫu quặng đồng chất lượng nhất để bắt đầu mẻ nấu!');
      return;
    }

    const hasMalachite = selectedOres.includes('malachite');
    const hasChalco = selectedOres.includes('chalcopyrite');

    if (hasMalachite && hasChalco) {
      sound.playSuccess();
      setOreFeedback('✓ Tuyệt hảo! Quặng Malachite & Chalcopyrite đã được tuyển lựa tinh khiết, sẵn sàng đưa lên bàn cân!');
      setTimeout(() => {
        setPhase(2);
      }, 1000);
    } else {
      sound.playError();
      setOreFeedback('❌ Mẻ quặng có lẫn đá tạp chất hoặc Pyrite sắt giòn! Vũ khí đúc ra sẽ bị nứt vỡ khi va chạm.');
    }
  };

  // --- LOGIC GIAI ĐOẠN 2: CÂN ĐONG HỢP KIM ---
  const total = copper + tin + lead;

  const handleAdjustAlloy = (metal: 'copper' | 'tin' | 'lead', delta: number) => {
    sound.playClick();
    if (metal === 'copper') {
      setCopper((prev) => Math.max(10, Math.min(90, prev + delta)));
    } else if (metal === 'tin') {
      setTin((prev) => Math.max(5, Math.min(60, prev + delta)));
    } else {
      setLead((prev) => Math.max(0, Math.min(30, prev + delta)));
    }
    setAlloyFeedback(null);
  };

  const handleConfirmAlloy = () => {
    sound.playAnvilStrike();

    if (total !== 100) {
      setAlloyFeedback(`Tổng tỷ lệ kim loại phải đủ 100%! Hiện tại là ${total}%.`);
      return;
    }

    if (copper === 75 && tin === 20 && lead === 5) {
      sound.playSuccess();
      setAlloyFeedback('✓ Tỷ lệ hợp kim Đông Sơn hoàn hảo (75% Cu - 20% Sn - 5% Pb)! Đã cho vào nồi nấu, chuẩn bị thổi bễ nung!');
      setTimeout(() => {
        setPhase(3);
      }, 1000);
    } else if (copper > 80) {
      setAlloyFeedback('⚠️ Đồng quá nhiều (>80%): Kim loại quá dẻo, mũi tên chạm giáp sắt sẽ bị oằn cong!');
    } else if (tin > 25) {
      setAlloyFeedback('⚠️ Thiếc quá nhiều (>25%): Kim loại quá giòn, mũi tên va vào khiên gỗ sẽ gãy nát!');
    } else if (lead < 3) {
      setAlloyFeedback('⚠️ Thiếu Chì (<3%): Đồng lỏng quá nhớt, không thể lọt sâu vào 3 cánh én của khuôn đá!');
    } else {
      setAlloyFeedback('⚠️ Tỷ lệ chưa tối ưu. Hãy đối chiếu công thức khảo cổ học Cổ Loa (75% Đồng - 20% Thiếc - 5% Chì).');
    }
  };

  // --- LOGIC GIAI ĐOẠN 3: THỔI BỄ THAN CỦI ---
  const handlePumpBellows = () => {
    if (isCastSuccess) return;
    sound.playClick();
    setFurnaceTemp((prev) => {
      const nextTemp = Math.min(1300, prev + 28);
      if (nextTemp > 1200) {
        setTempFeedback('⚠️ LỬA QUÁ MẠNH (>1200°C)! Nhiệt độ quá cao làm bay hơi thiếc và cháy quặng đồng!');
      } else if (nextTemp < 1085) {
        setTempFeedback('⚠️ Lò chưa đủ nhiệt! Tiếp tục thụt bễ để đạt khoảng vàng 1085°C – 1150°C!');
      } else {
        setTempFeedback('🔥 NHIỆT ĐỘ VÀNG! Giữ vững nhịp bơm bễ trong 4 giây!');
      }
      return nextTemp;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-parchment-100 border-4 border-bronze shadow-2xl wood-frame text-lacquer flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header Mỹ Thuật Lò Rèn */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-bronze/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-crimson to-amber-600 text-white flex items-center justify-center font-bold shadow-md border border-amber-300">
              <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-crimson font-mono font-bold flex items-center gap-1.5">
                <span>Trại Quân Giới Tướng Quân Cao Lỗ</span>
                <span>•</span>
                <span>Giai Đoạn {phase}/3</span>
              </span>
              <h2 className="font-title text-base sm:text-lg font-bold text-lacquer">
                Bí Thuật Luyện Kim & Đúc Tên Đồng Cầu Vực
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-stone-300/60 hover:bg-stone-400 text-lacquer transition-colors cursor-pointer"
            title="Đóng (phím ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh Tiến Trình 3 Giai Đoạn */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-[11px] font-bold">
          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              phase === 1
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : phase > 1
                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                : 'bg-stone-200 text-stone-500 border-stone-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Tuyển Quặng</span>
          </div>

          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              phase === 2
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : phase > 2
                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                : 'bg-stone-200 text-stone-500 border-stone-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>2. Phối Hợp Kim</span>
          </div>

          <div
            className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
              phase === 3
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : isCastSuccess
                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                : 'bg-stone-200 text-stone-500 border-stone-300'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>3. Thổi Bễ Nung</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GIAI ĐOẠN 1: TUYỂN CHỌN QUẶNG ĐỒNG */}
        {/* ========================================================================= */}
        {phase === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
              <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-crimson" />
                <span>Chỉ dẫn khảo cổ học Lò Rèn Cổ Loa:</span>
              </p>
              <p className="italic text-lacquer/90">
                "Người thợ đúc thời Âu Lạc phải tinh tường phân biệt quặng tự nhiên. Hãy chọn đúng <strong>2 mẫu quặng đồng chất lượng nhất</strong> (Malachite xanh lục & Chalcopyrite vàng đồng) và loại bỏ tạp chất gây xỉ mẻ đúc!"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableOres.map((ore) => {
                const isSelected = selectedOres.includes(ore.id);
                return (
                  <button
                    key={ore.id}
                    onClick={() => handleToggleOre(ore.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-tr from-amber-100 to-amber-50 border-amber-600 shadow-md scale-[1.02]'
                        : 'bg-white/80 border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-lacquer">
                          {ore.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-600 border-amber-700 text-white'
                              : 'border-stone-400'
                          }`}
                        >
                          {isSelected && <span className="text-[10px]">✓</span>}
                        </div>
                      </div>
                      <p className="text-[11px] text-lacquer/80 font-serif leading-snug">
                        {ore.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {oreFeedback && (
              <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs text-lacquer font-serif">
                {oreFeedback}
              </div>
            )}

            <button
              onClick={handleConfirmOres}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-crimson to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-amber-300"
            >
              Nghiền Quặng & Chuyển Sang Bàn Cân ({selectedOres.length}/2)
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* GIAI ĐOẠN 2: CÂN ĐONG HỢP KIM ĐÔNG SƠN */}
        {/* ========================================================================= */}
        {phase === 2 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
              <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-crimson" />
                <span>Bí mật hợp kim mũi tên đồng Cầu Vực (1959):</span>
              </p>
              <p className="italic text-lacquer/90">
                "Mũi tên Cổ Loa đạt độ xuyên giáp thượng thừa nhờ công thức phối trộn 3 kim loại: <strong>75% Đồng (Cu)</strong> tạo độ dẻo bền, <strong>20% Thiếc (Sn)</strong> tạo độ cứng và mép cắt sắc ngọt, <strong>5% Chì (Pb)</strong> giúp kim loại lỏng len lỏi vào khuôn đá 3 mang!"
              </p>
            </div>

            {/* Bộ Điều Chỉnh 3 Kim Loại */}
            <div className="space-y-3 bg-stone-900/10 p-4 rounded-2xl border border-stone-300">
              {/* ĐỒNG */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                    Cu
                  </div>
                  <div>
                    <span className="font-bold text-xs text-lacquer">Đồng (Copper)</span>
                    <span className="text-[10px] text-stone-500 block">Tạo độ bền kết cấu</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustAlloy('copper', -5)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-lacquer">
                    {copper}%
                  </span>
                  <button
                    onClick={() => handleAdjustAlloy('copper', 5)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* THIẾC */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                    Sn
                  </div>
                  <div>
                    <span className="font-bold text-xs text-lacquer">Thiếc (Tin)</span>
                    <span className="text-[10px] text-stone-500 block">Tăng độ cứng & sắc</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustAlloy('tin', -5)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-lacquer">
                    {tin}%
                  </span>
                  <button
                    onClick={() => handleAdjustAlloy('tin', 5)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CHÌ */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-stone-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                    Pb
                  </div>
                  <div>
                    <span className="font-bold text-xs text-lacquer">Chì (Lead)</span>
                    <span className="text-[10px] text-stone-500 block">Tăng độ chảy khuôn đá</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustAlloy('lead', -1)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-lacquer">
                    {lead}%
                  </span>
                  <button
                    onClick={() => handleAdjustAlloy('lead', 1)}
                    className="w-7 h-7 rounded bg-stone-200 hover:bg-stone-300 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 px-1 text-xs font-mono font-bold">
                <span>Tổng Tỷ Lệ:</span>
                <span className={total === 100 ? 'text-emerald-700 font-extrabold' : 'text-crimson'}>
                  {total}% / 100%
                </span>
              </div>
            </div>

            {alloyFeedback && (
              <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs text-lacquer font-serif">
                {alloyFeedback}
              </div>
            )}

            <button
              onClick={handleConfirmAlloy}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-crimson to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer border border-amber-300"
            >
              Hòa Trộn Hợp Kim & Nạp Vào Nồi Nung
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* GIAI ĐOẠN 3: BƠM BỄ THỔI THAN & ĐÚC TÊN ĐỒNG */}
        {/* ========================================================================= */}
        {phase === 3 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
              <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-crimson" />
                <span>Nhiệm vụ kiểm soát bễ thụt than củi:</span>
              </p>
              <p className="italic text-lacquer/90">
                "Nhấn nút <strong>Thụt Bễ Cung Cấp Gió</strong> liên tục và nhịp nhàng để đưa nhiệt độ lò vào <strong>Khoảng Vàng Nóng Chảy (1085°C – 1150°C)</strong>. Giữ vững nhiệt độ trong <strong>4 giây</strong> để dòng đồng lỏng lấp đầy khuôn đúc đá sa thạch 3 mang!"
              </p>
            </div>

            {/* Nhiệt Kế Lò Nấu Than Củi */}
            <div className="bg-gradient-to-b from-stone-950 to-stone-900 p-5 rounded-3xl border-2 border-amber-600 text-parchment-100 flex flex-col items-center shadow-2xl relative overflow-hidden">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300/80 mb-1">
                Nhiệt Độ Lò Nung Cổ Loa
              </div>

              <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 mb-2">
                <span
                  className={
                    furnaceTemp >= 1085 && furnaceTemp <= 1150
                      ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : furnaceTemp > 1150
                      ? 'text-red-400'
                      : 'text-stone-400'
                  }
                >
                  {furnaceTemp}°C
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-sans font-bold bg-amber-900/60 border border-amber-400 text-amber-200">
                  {furnaceTemp >= 1085 && furnaceTemp <= 1150
                    ? 'KHOẢNG VÀNG'
                    : furnaceTemp > 1150
                    ? 'QUÁ NHIỆT!'
                    : 'CHƯA ĐỦ LỬA'}
                </span>
              </div>

              {/* Thanh nhiệt kế */}
              <div className="w-full bg-stone-800 rounded-full h-4 overflow-hidden border border-stone-600 p-0.5 mb-3 relative">
                {/* Vạch khoảng vàng (1085 - 1150 tương đương khoảng 60% - 75%) */}
                <div className="absolute top-0 bottom-0 left-[60%] w-[15%] bg-emerald-500/30 border-x border-emerald-400 z-10 pointer-events-none" />

                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    furnaceTemp >= 1085 && furnaceTemp <= 1150
                      ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-lg shadow-amber-400/80'
                      : furnaceTemp > 1150
                      ? 'bg-gradient-to-r from-red-600 to-red-400'
                      : 'bg-gradient-to-r from-stone-600 to-amber-700'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, ((furnaceTemp - 800) / 500) * 100))}%` }}
                />
              </div>

              {/* Đồng hồ đếm ngược giữ nhiệt độ (Hold timer) */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono text-stone-300">Thời gian rót khuôn:</span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {holdTimeSeconds.toFixed(1)}s / 4.0s
                </span>
              </div>

              {/* Nút Thụt Bễ Gió Than Củi */}
              <button
                onClick={handlePumpBellows}
                disabled={isCastSuccess}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-crimson to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-2xl transition-all cursor-pointer active:scale-95 border-2 border-amber-300 flex items-center justify-center gap-2"
              >
                <Wind className="w-5 h-5 animate-bounce" />
                <span>Thụt Bễ Cung Cấp Gió Cho Lò Than!</span>
              </button>

              {tempFeedback && (
                <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs text-amber-200 text-center font-serif leading-snug">
                  {tempFeedback}
                </div>
              )}
            </div>

            {isCastSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm text-center animate-bounce shadow-2xl flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>CHÙM MŨI TÊN ĐỒNG CẦU VỰC ĐÃ ĐÚC THÀNH CÔNG!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
