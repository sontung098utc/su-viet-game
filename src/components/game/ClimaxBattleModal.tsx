import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, ChevronRight, Volume2, VolumeX, Swords, ShieldAlert, Sparkles } from 'lucide-react';
import { battleSound } from '../../utils/battleSoundSynthesizer';
import { sound } from '../../utils/sound';

interface ClimaxBattleModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onUnlockDrummerAchievement?: () => void;
}

type BattlePhase = 'DRUM_RHYTHM' | 'FLEET_CHARGE' | 'VICTORY_EPILOGUE';

export const ClimaxBattleModal: React.FC<ClimaxBattleModalProps> = ({
  isOpen,
  onComplete,
  onUnlockDrummerAchievement,
}) => {
  const [phase, setPhase] = useState<BattlePhase>('DRUM_RHYTHM');
  const [morale, setMorale] = useState<number>(20);
  const [combo, setCombo] = useState<number>(0);
  const [hitFeedback, setHitFeedback] = useState<{ text: string; color: string; id: number } | null>(null);
  const [warCry, setWarCry] = useState<string>('');
  const [drumScale, setDrumScale] = useState<number>(1);
  const [beatRingScale, setBeatRingScale] = useState<number>(2.2);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cinematicStep, setCinematicStep] = useState<number>(0);

  const beatAnimRef = useRef<number | null>(null);
  const ringScaleRef = useRef<number>(2.2);
  const lastTargetTimeRef = useRef<number>(Date.now());
  const beatIntervalMs = 1200; // Nhịp trống 1.2s mỗi nhịp

  // Âm thanh toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    battleSound.setMuted(next);
  };

  // --- VÒNG LẶP NHỊP ĐIỆU (RHYTHM LOOP) CHO GIAI ĐOẠN 1 ---
  useEffect(() => {
    if (!isOpen || phase !== 'DRUM_RHYTHM') return;

    lastTargetTimeRef.current = Date.now() + beatIntervalMs;

    const animateBeat = () => {
      const now = Date.now();
      const timeToTarget = lastTargetTimeRef.current - now;

      // Khi vòng co về 1.0 (trùng với viền trống)
      let scale = 1.0 + (timeToTarget / beatIntervalMs) * 1.2;
      if (scale < 0.9) {
        // Hết chu kỳ nhịp, tự động lặp lại nhịp tiếp theo
        lastTargetTimeRef.current = now + beatIntervalMs;
        scale = 2.2;
      }
      ringScaleRef.current = Math.max(0.9, scale);
      setBeatRingScale(ringScaleRef.current);

      beatAnimRef.current = requestAnimationFrame(animateBeat);
    };

    beatAnimRef.current = requestAnimationFrame(animateBeat);

    return () => {
      if (beatAnimRef.current) cancelAnimationFrame(beatAnimRef.current);
    };
  }, [isOpen, phase]);

  // Xử lý khi người chơi gõ trống
  const handleDrumHit = useCallback(() => {
    if (phase !== 'DRUM_RHYTHM') return;

    const currentScale = ringScaleRef.current;
    const diff = Math.abs(currentScale - 1.0); // 1.0 là vòng chuẩn

    // Hiệu ứng nảy mặt trống
    setDrumScale(0.94);
    setTimeout(() => setDrumScale(1.05), 60);
    setTimeout(() => setDrumScale(1.0), 150);

    let quality: 'perfect' | 'good' | 'miss' = 'miss';
    let addedMorale = 0;
    let feedbackText = '';
    let feedbackColor = '';

    if (diff < 0.22) {
      quality = 'perfect';
      addedMorale = 18;
      feedbackText = 'HOÀN HẢO! (PERFECT)';
      feedbackColor = '#FBBF24';
      battleSound.playWarDrum('perfect');
      sound.playSuccess();
    } else if (diff < 0.45) {
      quality = 'good';
      addedMorale = 10;
      feedbackText = 'CHUẨN XÁC! (GOOD)';
      feedbackColor = '#34D399';
      battleSound.playWarDrum('good');
    } else {
      quality = 'miss';
      addedMorale = -4;
      feedbackText = 'LỆCH NHỊP!';
      feedbackColor = '#F87171';
      battleSound.playWarDrum('normal');
    }

    setHitFeedback({ text: feedbackText, color: feedbackColor, id: Date.now() });

    if (quality !== 'miss') {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo >= 3) {
        setWarCry('TIỀN NGÔ VƯƠNG: "ĐÁNH! ĐÁNH! ĐÁNH!"');
      }
    } else {
      setCombo(0);
      setWarCry('');
    }

    setMorale((prev) => {
      const next = Math.min(100, Math.max(10, prev + addedMorale));
      if (next >= 100) {
        // Đạt đỉnh Sĩ Khí 100% -> Chuyển sang giai đoạn 2
        if (onUnlockDrummerAchievement) {
          onUnlockDrummerAchievement();
        }
        setTimeout(() => {
          setPhase('FLEET_CHARGE');
          battleSound.playBattleHorn();
        }, 600);
      }
      return next;
    });
  }, [phase, combo, onUnlockDrummerAchievement]);

  // Lắng nghe phím Space
  useEffect(() => {
    if (!isOpen || phase !== 'DRUM_RHYTHM') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDrumHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, handleDrumHit]);

  // --- QUẢN LÝ TIẾN TRÌNH GIAI ĐOẠN 2: THỦY QUÂN QUẬT KÍCH (CINEMATIC) ---
  useEffect(() => {
    if (phase !== 'FLEET_CHARGE') return;

    // Bước 1: Nước rút cực đại, bãi cọc nhô lên (0s - 4s)
    setCinematicStep(1);

    // Bước 2: Thuyền nhẹ xông trận từ hai cánh (4s)
    const t1 = setTimeout(() => {
      setCinematicStep(2);
      battleSound.playBattleHorn();
    }, 4200);

    // Bước 3: Chiến hạm Hoằng Tháo lao vào bãi cọc & vỡ mạn thuyền (8s)
    const t2 = setTimeout(() => {
      setCinematicStep(3);
      battleSound.playShipCrash();
      sound.playCipherTurn();
    }, 8500);

    // Bước 4: Chuyển sang Giai đoạn 3 Tuyên cáo Đại thắng (14s)
    const t3 = setTimeout(() => {
      setPhase('VICTORY_EPILOGUE');
      battleSound.playVictoryChime();
    }, 14500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md select-none text-amber-100 font-sans p-4">
      {/* Nút bật/tắt âm thanh góc trên */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 border border-amber-600/40 text-amber-300 transition-colors shadow-lg"
        title="Âm thanh chiến trận"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 1: HIỆU LỆNH TRỐNG TRẬN (WAR DRUM RHYTHM) */}
      {/* ========================================================================= */}
      {phase === 'DRUM_RHYTHM' && (
        <div className="relative w-full max-w-2xl flex flex-col items-center text-center">
          {/* Tiêu đề & Bối cảnh */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-900/60 border border-amber-500/40 text-amber-300 mb-2">
              <Swords className="w-3.5 h-3.5" /> Giai Đoạn 1: Hiệu Lệnh Trống Ngũ Liên
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-200 tracking-wide drop-shadow-md">
              THÚC TRỐNG XUẤT KÍCH!
            </h2>
            <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-md mx-auto">
              Nhấn <kbd className="px-2 py-0.5 rounded bg-stone-800 border border-amber-500/50 text-amber-300 font-bold">Space</kbd> hoặc <strong className="text-amber-300">Chạm / Click</strong> vào mặt trống khi vòng nhịp co sát viền vàng!
            </p>
          </div>

          {/* Thanh Sĩ Khí Ba Quân */}
          <div className="w-full max-w-md bg-stone-900/90 rounded-full h-7 border-2 border-amber-600/60 p-0.5 mb-6 relative overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2 bg-gradient-to-r from-red-800 via-amber-600 to-yellow-400 shadow-md"
              style={{ width: `${morale}%` }}
            >
              <span className="text-[11px] font-bold text-stone-950 pr-1">
                {morale}%
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider uppercase text-amber-100 drop-shadow">
              SĨ KHÍ QUÂN TA {morale >= 100 ? '⚡ SẴN SÀNG TỔNG TẤN CÔNG!' : ''}
            </div>
          </div>

          {/* Mặt Trống Đồng Đông Sơn Tương Tác & Vòng Nhịp */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center cursor-pointer my-2" onClick={handleDrumHit}>
            {/* Vòng co nhịp điệu (Rhythm Beat Ring) */}
            <div
              className="absolute rounded-full border-4 border-amber-400/80 pointer-events-none transition-transform duration-75"
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${beatRingScale})`,
                opacity: Math.max(0.15, 1.2 - Math.abs(beatRingScale - 1.0) * 1.5),
              }}
            />

            {/* Vòng mục tiêu chuẩn 1.0 */}
            <div className="absolute w-full h-full rounded-full border-2 border-dashed border-amber-500/40 pointer-events-none animate-pulse" />

            {/* Mặt Trống Đồng SVG Chi Tiết */}
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-2xl transition-transform duration-100"
              style={{ transform: `scale(${drumScale})` }}
            >
              {/* Thùng trống gỗ viền đồng */}
              <circle cx="100" cy="100" r="96" fill="#451a03" stroke="#b45309" strokeWidth="6" />
              <circle cx="100" cy="100" r="88" fill="#78350f" stroke="#d97706" strokeWidth="3" />
              
              {/* Vành hoa văn chim Lạc */}
              <circle cx="100" cy="100" r="76" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
              <circle cx="100" cy="100" r="62" fill="none" stroke="#d97706" strokeWidth="1.5" />

              {/* Chim Lạc bay ngược chiều kim đồng hồ quanh vành */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  d="M 100 28 Q 112 32 108 40 Q 98 36 100 28 Z"
                  fill="#fbbf24"
                  transform={`rotate(${deg} 100 100)`}
                />
              ))}

              {/* Ngôi sao mặt trời 14 tia ở trung tâm */}
              <circle cx="100" cy="100" r="26" fill="#92400e" stroke="#f59e0b" strokeWidth="2" />
              {[0, 25.7, 51.4, 77.1, 102.8, 128.5, 154.2, 180, 205.7, 231.4, 257.1, 282.8, 308.5, 334.2].map((deg) => (
                <line
                  key={deg}
                  x1="100"
                  y1="100"
                  x2={100 + 24 * Math.cos((deg * Math.PI) / 180)}
                  y2={100 + 24 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                />
              ))}
              <circle cx="100" cy="100" r="8" fill="#fde68a" />
            </svg>

            {/* Chữ bấm gợi ý ở giữa trống */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-xs md:text-sm font-black text-amber-200 uppercase tracking-widest drop-shadow-md">
                GÕ TRỐNG
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">(CLICK / SPACE)</span>
            </div>
          </div>

          {/* Phản hồi Nhịp Đánh & Combo */}
          <div className="h-14 flex flex-col items-center justify-center mt-3">
            {hitFeedback && (
              <span
                key={hitFeedback.id}
                className="text-base md:text-lg font-black tracking-wider animate-bounce"
                style={{ color: hitFeedback.color }}
              >
                {hitFeedback.text}
              </span>
            )}
            {combo > 1 && (
              <span className="text-xs font-bold text-yellow-400 tracking-wider">
                🔥 COMBO x{combo}!
              </span>
            )}
            {warCry && (
              <span className="text-xs font-black text-red-400 tracking-wide mt-1 animate-pulse">
                {warCry}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 2: THỦY QUÂN QUẬT KÍCH & BÃI CỌC PHÁT UY (CINEMATIC ACTION) */}
      {/* ========================================================================= */}
      {phase === 'FLEET_CHARGE' && (
        <div className="relative w-full max-w-4xl flex flex-col items-center text-center p-4">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-900/60 border border-red-500/40 text-red-300 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Giai Đoạn 2: Thủy Quân Quật Khởi & Bãi Cọc Phát Uy
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-amber-300 tracking-wide">
              QUYẾT CHIẾN TRÊN SÔNG BẠCH ĐẰNG
            </h2>
          </div>

          {/* Khung Tranh Chiến Trận Động (Animated Battle Canvas) */}
          <div className="relative w-full aspect-video max-h-[420px] rounded-2xl overflow-hidden border-2 border-amber-600/60 bg-gradient-to-b from-[#1c1917] via-[#1e293b] to-[#0f172a] shadow-2xl flex items-center justify-center">
            {/* Lớp nền: Bầu trời hoàng hôn ráng đỏ & mây khói */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-stone-900/80 to-stone-950 pointer-events-none" />

            {/* Dòng nước sông Bạch Đằng triều rút cực đại */}
            <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-teal-950 via-cyan-950/80 to-transparent">
              {/* Sóng bọt trắng gợn cuộn */}
              <div className="absolute inset-x-0 bottom-12 h-1 bg-cyan-400/30 blur-sm animate-pulse" />
              <div className="absolute inset-x-0 bottom-24 h-0.5 bg-teal-300/20 blur-xs" />
            </div>

            {/* BÃI CỌC GỖ BỊT SẮT NHÔ CAO (Step 1+) */}
            <div className="absolute bottom-8 inset-x-0 flex justify-around px-8 pointer-events-none transition-all duration-1000 ease-out"
                 style={{ transform: cinematicStep >= 1 ? 'translateY(0)' : 'translateY(80px)', opacity: cinematicStep >= 1 ? 1 : 0 }}>
              {[
                { h: 72, tilt: -12, left: '10%' },
                { h: 96, tilt: -6, left: '22%' },
                { h: 110, tilt: 4, left: '38%' },
                { h: 88, tilt: -8, left: '52%' },
                { h: 104, tilt: 10, left: '68%' },
                { h: 78, tilt: 5, left: '84%' },
              ].map((stake, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col items-center"
                  style={{ transform: `rotate(${stake.tilt}deg)` }}
                >
                  {/* Đầu búp cọc bịt sắt đen trùi trũi sắc bén */}
                  <div
                    className="w-0 h-0 border-x-[7px] border-x-transparent border-b-[26px] border-b-stone-300 drop-shadow"
                    style={{ borderBottomColor: '#71717a' }}
                  />
                  {/* Thân cọc gỗ lim vạt nhọn */}
                  <div
                    className="w-3.5 bg-stone-800 rounded-b shadow-lg border-x border-stone-700"
                    style={{ height: `${stake.h}px` }}
                  />
                  {/* Vòng bọt nước quanh chân cọc */}
                  <div className="w-8 h-2 rounded-full bg-cyan-200/30 blur-xs -mt-1" />
                </div>
              ))}
            </div>

            {/* 6 CHIẾN THUYỀN NHẸ QUÂN TA LAO RA PHẢN KÍCH (Step 2+) */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-1000"
              style={{ opacity: cinematicStep >= 2 ? 1 : 0 }}
            >
              {/* Cánh thuyền bên trái lao ra */}
              <div
                className="absolute left-6 bottom-20 flex gap-4 transition-transform duration-1000 ease-out"
                style={{ transform: cinematicStep >= 2 ? 'translateX(40px)' : 'translateX(-220px)' }}
              >
                {[1, 2, 3].map((b) => (
                  <div key={b} className="relative flex flex-col items-center">
                    <div className="w-16 h-4 bg-amber-900 rounded-b-xl border border-amber-600 shadow-md" />
                    {/* Cột cờ đỏ sao vàng Tiền Ngô Vương */}
                    <div className="w-0.5 h-10 bg-stone-300 absolute -top-8 left-6">
                      <div className="w-6 h-4 bg-red-600 rounded-r border-t border-b border-yellow-300 -mt-1 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Cánh thuyền bên phải lao ra */}
              <div
                className="absolute right-6 bottom-24 flex gap-4 transition-transform duration-1000 ease-out"
                style={{ transform: cinematicStep >= 2 ? 'translateX(-40px)' : 'translateX(220px)' }}
              >
                {[4, 5, 6].map((b) => (
                  <div key={b} className="relative flex flex-col items-center">
                    <div className="w-16 h-4 bg-amber-900 rounded-b-xl border border-amber-600 shadow-md" />
                    <div className="w-0.5 h-10 bg-stone-300 absolute -top-8 right-6">
                      <div className="w-6 h-4 bg-red-600 rounded-l border-t border-b border-yellow-300 -mt-1 mr-0.5 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHIẾN HẠM HOẰNG THÁO MẮC CẠN VỠ MẠN THUYỀN (Step 3) */}
            <div
              className="absolute transition-all duration-700 ease-out flex flex-col items-center"
              style={{
                top: cinematicStep >= 3 ? '32%' : '15%',
                transform: cinematicStep >= 3 ? 'rotate(-18deg) scale(1.15)' : 'rotate(0deg) scale(0.9)',
                opacity: cinematicStep >= 1 ? 1 : 0,
              }}
            >
              {/* Cột buồm gãy đổ */}
              <div
                className="w-1.5 h-24 bg-stone-800 transition-transform duration-500 origin-bottom"
                style={{ transform: cinematicStep >= 3 ? 'rotate(54deg) translateY(12px)' : 'none' }}
              >
                <div className="w-16 h-12 bg-stone-600/60 border border-stone-500 -ml-7 mt-2" />
              </div>

              {/* Thân thuyền to cồng kềnh Lưu Hoằng Tháo */}
              <div className="relative w-48 h-14 bg-stone-900 rounded-b-3xl border-2 border-stone-700 shadow-2xl flex items-center justify-center">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                  Soái Hạm Nam Hán
                </span>

                {/* Vết vỡ toác mạn thuyền & mảnh gỗ văng (Khi Step 3) */}
                {cinematicStep >= 3 && (
                  <div className="absolute -bottom-3 inset-x-8 flex justify-center items-center">
                    <div className="w-14 h-6 bg-red-600/80 rounded-full blur-xs animate-ping" />
                    <div className="absolute text-yellow-300 text-xs font-black animate-bounce">
                      💥 VỠ TOÁC!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lời dẫn truyện diễn biến chiến trận */}
            <div className="absolute bottom-3 inset-x-4 bg-stone-950/85 backdrop-blur-md rounded-xl p-3 border border-amber-600/40 text-center">
              <p className="text-xs md:text-sm text-amber-200 font-serif leading-relaxed">
                {cinematicStep === 1 && '🌊 Triều rút cực đại! Hàng vạn cọc gỗ bịt sắt nhô lên khỏi ngọn sóng sủi bọt trắng xóa!'}
                {cinematicStep === 2 && '⚡ Sáu cánh chiến thuyền Tiền Ngô Vương quật khởi từ lau sậy, chia cắt hoàn toàn đội hình giặc!'}
                {cinematicStep >= 3 && '🔥 Chiến hạm Lưu Hoằng Tháo trúng kế mắc cạn, mạn thuyền đâm vào cọc nhọn vỡ toác, quân giặc đại bại tan tác!'}
              </p>
            </div>
          </div>

          {/* Nút bỏ qua / xem nhanh */}
          <button
            onClick={() => {
              setPhase('VICTORY_EPILOGUE');
              battleSound.playVictoryChime();
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-xs text-amber-300/80 flex items-center gap-1 border border-stone-600/50 transition-colors"
          >
            Tiếp tục ngay <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GIAI ĐOẠN 3: TUYÊN CÁO ĐẠI THẮNG (VICTORY EPILOGUE) */}
      {/* ========================================================================= */}
      {phase === 'VICTORY_EPILOGUE' && (
        <div className="relative w-full max-w-2xl flex flex-col items-center text-center p-6 bg-stone-900/90 rounded-2xl border-2 border-amber-500/80 shadow-2xl animate-fade-in">
          {/* Huy hiệu khải hoàn hoàng kim */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 p-1 mb-4 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-yellow-400 animate-spin-slow" />
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-yellow-950/80 border border-yellow-500/50 text-yellow-300 mb-2">
            KHẢI HOÀN CA NĂM 938
          </span>

          <h2 className="text-2xl md:text-4xl font-serif font-black text-amber-300 tracking-wide mb-4 drop-shadow-md">
            ĐẠI PHÁ HOẰNG THÁO TRÊN SÔNG BẠCH ĐẰNG
          </h2>

          {/* Dải lụa đỏ ghi lời tuyên cáo lịch sử */}
          <div className="w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-y-2 border-amber-500/60 p-4 md:p-6 rounded-lg my-2 shadow-inner">
            <p className="text-sm md:text-base text-yellow-100 font-serif italic leading-relaxed">
              &ldquo;Sông Bạch Đằng cuộn sóng chôn vùi dã tâm xâm lược. Tiền Ngô Vương xưng Vương, chấm dứt hơn một nghìn năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ muôn đời cho nước Đại Việt!&rdquo;
            </p>
            <p className="text-xs text-amber-300/80 text-right mt-2 font-mono">
              — Theo Đại Việt Sử Ký Toàn Thư (Ngoại Kỷ - Quyển V)
            </p>
          </div>

          {/* Nút chuyển tiếp sang SummaryScreen */}
          <button
            onClick={onComplete}
            className="mt-6 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-base md:text-lg tracking-wider uppercase shadow-xl hover:shadow-yellow-500/30 transition-all flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            Xem Bảng Vàng Công Trạng
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
