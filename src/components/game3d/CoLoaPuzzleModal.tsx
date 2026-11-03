import React, { useState, useEffect } from 'react';
import { KeyRound, RotateCw, X, HelpCircle, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
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
  // 1. Tự động thoát Pointer Lock ngay khi Modal mở ra để con trỏ chuột tự do di chuyển và click
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

  // --- MINI-GAME 1 STATE: Khóa 3 Bánh Răng & Khớp Then Cơ Khí Cao Lỗ ---
  // Mỗi bánh răng có góc xoay: 0, 90, 180, 270 độ.
  // Khi góc là 0 hoặc 180 độ -> rãnh nằm ngang (kết nối đường truyền lực).
  const [gearAngles, setGearAngles] = useState<[number, number, number]>([90, 270, 90]);
  const [isGearUnlocked, setIsGearUnlocked] = useState(false);

  // --- MINI-GAME 2 STATE: Bàn Đá Xoay Bát Quái Tứ Linh & Chim Lạc ---
  // Vòng ngoài: 4 phương (Bắc = 0, Đông = 90, Nam = 180, Tây = 270). Bắt đầu lệch ở 180.
  // Vòng trong: Kim Chim Lạc (0, 90, 180, 270). Bắt đầu lệch ở 90.
  const [outerRingAngle, setOuterRingAngle] = useState<number>(180);
  const [innerRingAngle, setInnerRingAngle] = useState<number>(90);
  const [isAltarUnlocked, setIsAltarUnlocked] = useState(false);

  // --- MINI-GAME 3 STATE: Ổ Khóa Ống Đồng Cryptex 3 Trục Lăn ---
  const shapeOptions = ['1 Cạnh Tròn', '2 Cạnh Dẹp', '3 Cánh Én', '4 Cạnh Vuông'];
  const locationOptions = ['Bạch Hạc', 'Mê Linh', 'Cầu Vực', 'Hoa Lư'];
  const eraOptions = ['TK X SCN', 'TK I SCN', 'TK III TCN', 'TK XV SCN'];

  const [shapeIdx, setShapeIdx] = useState<number>(0);
  const [locIdx, setLocIdx] = useState<number>(1);
  const [eraIdx, setEraIdx] = useState<number>(0);
  const [isCryptexUnlocked, setIsCryptexUnlocked] = useState(false);

  // Reset state khi mở puzzle mới
  useEffect(() => {
    if (isOpen) {
      setGearAngles([90, 270, 90]);
      setIsGearUnlocked(false);
      setOuterRingAngle(180);
      setInnerRingAngle(90);
      setIsAltarUnlocked(false);
      setShapeIdx(0);
      setLocIdx(1);
      setEraIdx(0);
      setIsCryptexUnlocked(false);
    }
  }, [isOpen, relicId]);

  // --- LOGIC MINI-GAME 1: XOAY BÁNH RĂNG ---
  const handleRotateGear = (gearIndex: 0 | 1 | 2) => {
    if (isGearUnlocked) return;
    sound.playCipherTurn();

    const newAngles: [number, number, number] = [...gearAngles];
    newAngles[gearIndex] = (newAngles[gearIndex] + 90) % 360;
    setGearAngles(newAngles);

    // Kiểm tra xem cả 3 bánh răng có rãnh nằm ngang không (góc 0 hoặc 180)
    const isAligned =
      (newAngles[0] % 180 === 0) &&
      (newAngles[1] % 180 === 0) &&
      (newAngles[2] % 180 === 0);

    if (isAligned) {
      setIsGearUnlocked(true);
      sound.playChestUnlock();
      setTimeout(() => {
        if (relicId) onSolveSuccess(relicId);
      }, 1200);
    }
  };

  // --- LOGIC MINI-GAME 2: BÀN XOAY BÁT QUÁI ---
  const handleRotateOuterRing = () => {
    if (isAltarUnlocked) return;
    sound.playCipherTurn();
    const nextAngle = (outerRingAngle + 90) % 360;
    setOuterRingAngle(nextAngle);
    checkAltarSolution(nextAngle, innerRingAngle);
  };

  const handleRotateInnerRing = () => {
    if (isAltarUnlocked) return;
    sound.playCipherTurn();
    const nextAngle = (innerRingAngle + 90) % 360;
    setInnerRingAngle(nextAngle);
    checkAltarSolution(outerRingAngle, nextAngle);
  };

  const checkAltarSolution = (outer: number, inner: number) => {
    // Đỉnh Bắc là 0 độ. Cả vòng ngoài (Rùa Vàng) và vòng trong (Chim Lạc) đều phải ở 0 độ!
    if (outer === 0 && inner === 0) {
      setIsAltarUnlocked(true);
      sound.playChestUnlock();
      setTimeout(() => {
        if (relicId) onSolveSuccess(relicId);
      }, 1200);
    }
  };

  // --- LOGIC MINI-GAME 3: Ổ KHÓA ỐNG ĐỒNG CRYPTEX ---
  const cycleTumbler = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    len: number,
    newShape: number,
    newLoc: number,
    newEra: number
  ) => {
    if (isCryptexUnlocked) return;
    sound.playCipherTurn();
    setter((prev) => {
      const next = (prev + delta + len) % len;
      return next;
    });

    // Đáp án đúng: Shape = 2 (3 Cánh Én), Loc = 2 (Cầu Vực), Era = 2 (TK III TCN)
    if (newShape === 2 && newLoc === 2 && newEra === 2) {
      setIsCryptexUnlocked(true);
      sound.playChestUnlock();
      setTimeout(() => {
        if (relicId) onSolveSuccess(relicId);
      }, 1200);
    }
  };

  if (!isOpen || !relicId) return null;
  const relic = CO_LOA_RELICS[relicId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-parchment-100 border-4 border-bronze rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-lacquer via-crimson to-lacquer p-4 text-parchment-100 flex items-center justify-between border-b-2 border-bronze/60 shadow-md">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-200/90 font-mono">
                Cơ Quan Giải Mã Cơ Khí • {relic.locationName}
              </span>
              <h3 className="font-title text-base sm:text-lg font-bold text-white leading-tight">
                {relic.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Đóng (phím ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Mini-game theo từng Cổ vật */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-lacquer">
          {/* ========================================================================= */}
          {/* MINI-GAME 1: KHÓA BÁNH RĂNG TRUYỀN LỰC CAO LỖ (THÂN NỎ) */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_CROSSBOW_STOCK' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-crimson" />
                  <span>Manh mối cơ khí Lò Rèn Cao Lỗ:</span>
                </p>
                <p className="italic text-lacquer/90">
                  "Rương chứa Thân Nỏ bị khóa bằng 3 bánh răng đồng. Hãy chạm/click vào từng bánh răng để xoay sao cho <strong>cả 3 rãnh dẫn lực nằm ngang thẳng hàng</strong>, truyền động mở chốt then!"
                </p>
              </div>

              {/* Bàn Cơ Khí 3 Bánh Răng Tương Tác */}
              <div className="bg-gradient-to-b from-[#3a281c] to-[#1e130c] p-6 rounded-2xl border-2 border-amber-600/50 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                {/* Đường dẫn lực nền */}
                <div className="absolute top-1/2 left-8 right-8 h-2 bg-amber-950/80 -translate-y-1/2 border-y border-amber-500/30" />

                <div className="flex items-center justify-center gap-4 sm:gap-8 z-10">
                  {([0, 1, 2] as const).map((idx) => {
                    const angle = gearAngles[idx];
                    const isHorizontal = angle % 180 === 0;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => handleRotateGear(idx)}
                          disabled={isGearUnlocked}
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 transition-transform duration-300 flex items-center justify-center shadow-2xl relative cursor-pointer active:scale-95 ${
                            isHorizontal
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400 border-amber-200'
                              : 'bg-gradient-to-tr from-stone-800 to-stone-700 border-stone-500 hover:border-amber-400'
                          }`}
                          style={{
                            transform: `rotate(${angle}deg)`,
                          }}
                        >
                          {/* Răng cưa bên ngoài */}
                          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300/40 animate-spin-slow" />
                          {/* Rãnh then truyền lực */}
                          <div
                            className={`w-full h-4 sm:h-5 rounded-full shadow-md transition-colors ${
                              isHorizontal
                                ? 'bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-300 shadow-emerald-400/50'
                                : 'bg-stone-900 border border-stone-600'
                            }`}
                          />
                          {/* Trục đồng tâm */}
                          <div className="absolute w-6 h-6 rounded-full bg-amber-900 border-2 border-amber-400 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-amber-200" />
                          </div>
                        </button>

                        <button
                          onClick={() => handleRotateGear(idx)}
                          disabled={isGearUnlocked}
                          className="px-3 py-1 rounded-lg bg-black/60 hover:bg-amber-600 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Xoay 90°</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Trạng thái mở khóa */}
                {isGearUnlocked ? (
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>CẠCH! THEN CÀI ĐÃ MỞ — THU NHẬN THÂN NỎ!</span>
                  </div>
                ) : (
                  <div className="mt-4 text-[11px] font-mono text-amber-300/80">
                    Trạng thái rãnh: [{gearAngles[0] % 180 === 0 ? '─ KHỚP' : '| LỆCH'}] - [
                    {gearAngles[1] % 180 === 0 ? '─ KHỚP' : '| LỆCH'}] - [
                    {gearAngles[2] % 180 === 0 ? '─ KHỚP' : '| LỆCH'}]
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MINI-GAME 2: BÀN ĐÁ XOAY BÁT QUÁI KIM QUY (LẪY MÓNG RÙA) */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_TURTLE_TRIGGER' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-crimson" />
                  <span>Lời sấm trên đàn sen đá Giếng Ngọc:</span>
                </p>
                <p className="italic text-lacquer/90">
                  "Linh vật Kim Quy thuộc hành Thủy, ngự tại phương Bắc. Khi <strong>đầu Rùa Vàng</strong> ở vòng ngoài và <strong>mỏ Chim Lạc</strong> ở vòng trong cùng hội tụ về <strong>Trục Bắc (Đỉnh Trên)</strong>, hộp lẫy thần sẽ khai mở!"
                </p>
              </div>

              {/* Bàn Đá Xoay Bát Quái Đồng Tâm */}
              <div className="bg-gradient-to-b from-[#221c16] to-[#120e0a] p-6 rounded-2xl border-2 border-emerald-600/50 shadow-inner flex flex-col items-center justify-center relative">
                {/* Trục Bắc chỉ thị */}
                <div className="absolute top-2 flex flex-col items-center text-amber-300 font-mono text-[11px] font-bold">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping mb-0.5" />
                  <span>TRỤC BẮC (ĐÍNH HỘI TỤ)</span>
                </div>

                {/* Vòng đĩa đá tương tác */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-4">
                  {/* VÒNG NGOÀI: 4 THẦN THÚ TỨ TƯỢNG */}
                  <div
                    className="absolute inset-0 rounded-full border-4 border-amber-500/70 bg-gradient-to-tr from-stone-800 via-amber-950 to-stone-800 shadow-2xl transition-transform duration-500 flex items-center justify-center"
                    style={{ transform: `rotate(${outerRingAngle}deg)` }}
                  >
                    {/* 4 Thần Thú tại 4 hướng */}
                    <div className="absolute top-2 text-[11px] font-bold text-emerald-300 flex flex-col items-center">
                      <span>🐢 KIM QUY (BẮC)</span>
                      <span className="text-[9px] text-amber-300">★ HÀNH THỦY</span>
                    </div>
                    <div className="absolute right-2 text-[10px] font-bold text-cyan-300 rotate-90">
                      🐉 THANH LONG (ĐÔNG)
                    </div>
                    <div className="absolute bottom-2 text-[10px] font-bold text-red-400">
                      🦅 CHU TƯỚC (NAM)
                    </div>
                    <div className="absolute left-2 text-[10px] font-bold text-amber-200 -rotate-90">
                      🐅 BẠCH HỔ (TÂY)
                    </div>
                  </div>

                  {/* VÒNG TRONG: MẶT TRỐNG ĐỒNG & CHIM LẠC */}
                  <div
                    className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-amber-300 bg-gradient-to-tr from-amber-600 to-amber-800 shadow-xl transition-transform duration-500 flex items-center justify-center"
                    style={{ transform: `rotate(${innerRingAngle}deg)` }}
                  >
                    {/* Mặt trời 14 tia */}
                    <div className="w-12 h-12 rounded-full bg-amber-300 border-2 border-white flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-crimson" />
                    </div>
                    {/* Kim Chim Lạc chỉ hướng */}
                    <div className="absolute top-1 text-[11px] font-bold text-white flex flex-col items-center">
                      <span>▲ CHIM LẠC</span>
                    </div>
                  </div>
                </div>

                {/* Nút điều khiển xoay 2 vòng */}
                <div className="flex items-center gap-3 w-full justify-center">
                  <button
                    onClick={handleRotateOuterRing}
                    disabled={isAltarUnlocked}
                    className="px-4 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-700 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xoay Vòng Ngoài (Tứ Tượng)</span>
                  </button>

                  <button
                    onClick={handleRotateInnerRing}
                    disabled={isAltarUnlocked}
                    className="px-4 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-700 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Xoay Vòng Trong (Chim Lạc)</span>
                  </button>
                </div>

                {/* Trạng thái mở khóa */}
                {isAltarUnlocked && (
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>ĐÀN SEN ĐÁ TỎA ÁNH KIM — THU NHẬN LẪY MÓNG RÙA!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MINI-GAME 3: Ổ KHÓA ỐNG ĐỒNG CRYPTEX 3 TRỤC (MŨI TÊN ĐỒNG) */}
          {/* ========================================================================= */}
          {relicId === 'SHARD_BRONZE_ARROWS' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm font-serif leading-relaxed">
                <p className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-crimson" />
                  <span>Mật lệnh trên giấy da niêm phong kho tên:</span>
                </p>
                <p className="italic text-lacquer/90">
                  "Mũi tên giết giặc có <strong>3 cánh én</strong> xé gió, hàng vạn mũi chôn sâu nơi <strong>Cầu Vực</strong>, đúc từ thời vua Thục dựng nước Âu Lạc (<strong>TK III TCN</strong>). Hãy lăn 3 trục đồng để mở khóa hòm!"
                </p>
              </div>

              {/* Ổ Khóa Ống Đồng Cryptex 3 Trục */}
              <div className="bg-gradient-to-b from-[#2b1f17] to-[#170f0a] p-6 rounded-2xl border-2 border-amber-600/50 shadow-inner flex flex-col items-center justify-center">
                {/* 3 Trục lăn cơ học */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md">
                  {/* TRỤC 1: HÌNH DẠNG MŨI TÊN */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-2">
                      Trục 1: Hình Dạng
                    </span>
                    <button
                      onClick={() =>
                        cycleTumbler(setShapeIdx, -1, shapeOptions.length, (shapeIdx - 1 + 4) % 4, locIdx, eraIdx)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div
                      className={`my-2 px-2 py-3 rounded-lg w-full text-center font-bold text-xs sm:text-sm border transition-all ${
                        shapeIdx === 2
                          ? 'bg-amber-600/90 text-white border-amber-300 shadow-md'
                          : 'bg-stone-800 text-stone-300 border-stone-600'
                      }`}
                    >
                      {shapeOptions[shapeIdx]}
                    </div>
                    <button
                      onClick={() =>
                        cycleTumbler(setShapeIdx, 1, shapeOptions.length, (shapeIdx + 1) % 4, locIdx, eraIdx)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TRỤC 2: DI CHỈ KHẢO CỔ */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-2">
                      Trục 2: Di Chỉ
                    </span>
                    <button
                      onClick={() =>
                        cycleTumbler(setLocIdx, -1, locationOptions.length, shapeIdx, (locIdx - 1 + 4) % 4, eraIdx)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div
                      className={`my-2 px-2 py-3 rounded-lg w-full text-center font-bold text-xs sm:text-sm border transition-all ${
                        locIdx === 2
                          ? 'bg-amber-600/90 text-white border-amber-300 shadow-md'
                          : 'bg-stone-800 text-stone-300 border-stone-600'
                      }`}
                    >
                      {locationOptions[locIdx]}
                    </div>
                    <button
                      onClick={() =>
                        cycleTumbler(setLocIdx, 1, locationOptions.length, shapeIdx, (locIdx + 1) % 4, eraIdx)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TRỤC 3: NIÊN ĐẠI ÂU LẠC */}
                  <div className="flex flex-col items-center bg-stone-900/80 p-2.5 rounded-xl border border-amber-500/40 shadow-md">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase mb-2">
                      Trục 3: Niên Đại
                    </span>
                    <button
                      onClick={() =>
                        cycleTumbler(setEraIdx, -1, eraOptions.length, shapeIdx, locIdx, (eraIdx - 1 + 4) % 4)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <div
                      className={`my-2 px-2 py-3 rounded-lg w-full text-center font-bold text-xs sm:text-sm border transition-all ${
                        eraIdx === 2
                          ? 'bg-amber-600/90 text-white border-amber-300 shadow-md'
                          : 'bg-stone-800 text-stone-300 border-stone-600'
                      }`}
                    >
                      {eraOptions[eraIdx]}
                    </div>
                    <button
                      onClick={() =>
                        cycleTumbler(setEraIdx, 1, eraOptions.length, shapeIdx, locIdx, (eraIdx + 1) % 4)
                      }
                      className="p-1.5 rounded bg-amber-800/60 hover:bg-amber-600 text-amber-200 cursor-pointer active:scale-95"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Đèn báo khớp tổ hợp mật mã */}
                <div className="flex items-center gap-3 mt-4 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        shapeIdx === 2 ? 'bg-emerald-400 shadow-md shadow-emerald-400' : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-amber-200 text-[10px]">Cánh Én</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        locIdx === 2 ? 'bg-emerald-400 shadow-md shadow-emerald-400' : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-amber-200 text-[10px]">Cầu Vực</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        eraIdx === 2 ? 'bg-emerald-400 shadow-md shadow-emerald-400' : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-amber-200 text-[10px]">TK III TCN</span>
                  </div>
                </div>

                {/* Trạng thái mở khóa */}
                {isCryptexUnlocked && (
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 animate-bounce shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>CẠCH! ỐNG ĐỒNG MỞ NẮP — THU NHẬN CHÙM TÊN ĐỒNG!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
