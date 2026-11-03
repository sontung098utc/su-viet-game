import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  Unlock,
  KeyRound,
  Scroll,
  Compass,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Waves,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const CipherPuzzleModal: React.FC = () => {
  const {
    activeCipherPuzzle,
    closeCipherPuzzle,
    solveCipher,
    progress,
    unlockClue,
    unlockFact,
  } = useGame();

  // State cho Mật Mã 1 (Chiếu Thư Ẩn Tự)
  const [scrollKeyword, setScrollKeyword] = useState<string>('');
  const [scrollDirection, setScrollDirection] = useState<string>('');
  const [scrollFeedback, setScrollFeedback] = useState<string | null>(null);

  // State cho Mật Mã 2 (Hòm Cơ Mật 3 Số)
  const [dial1, setDial1] = useState<number>(0);
  const [dial2, setDial2] = useState<number>(0);
  const [dial3, setDial3] = useState<number>(0);
  const [chestFeedback, setChestFeedback] = useState<string | null>(null);

  // State cho Mật Mã 3 (Bia Đá Cổ Thủy Triều)
  const [tideChoice1, setTideChoice1] = useState<string>('');
  const [tideChoice2, setTideChoice2] = useState<string>('');
  const [tideFeedback, setTideFeedback] = useState<string | null>(null);

  if (!activeCipherPuzzle) return null;

  const isAlreadySolved = progress.solvedCiphers?.includes(activeCipherPuzzle);

  // Xoay bánh lăn trục mật mã
  const rotateDial = (dialNum: 1 | 2 | 3, direction: 1 | -1) => {
    sound.playCipherTurn();
    if (dialNum === 1) {
      setDial1((prev) => (prev + direction + 10) % 10);
    } else if (dialNum === 2) {
      setDial2((prev) => (prev + direction + 10) % 10);
    } else {
      setDial3((prev) => (prev + direction + 10) % 10);
    }
    setChestFeedback(null);
  };

  // 1. Kiểm tra Mật Thư Điểm Hẹn (Làng Ven Sông)
  const handleSolveScroll = () => {
    if (scrollKeyword === 'RED_SILK' && scrollDirection === 'NORTHEAST') {
      sound.playSuccess();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
      solveCipher('CIPHER_VILLAGE_SCROLL');
      unlockClue('clue_a_cipher_note');
      unlockFact('fact-kieu-cong-tien-cause');
      setScrollFeedback('Chính xác! Mật thư chỉ rõ: Điểm hẹn chính là Nhà Tranh Đông Bắc có dải lụa đỏ và khói bếp trắng.');
    } else {
      sound.playClick();
      setScrollFeedback('Chưa đúng mật mã! Hãy đọc kỹ bài thơ: Dải buộc cột là gì? Và con đường làng dẫn lên doanh trại theo hướng nào?');
    }
  };

  // 2. Kiểm tra Mở Hòm Cơ Mật Quân Lệnh 938
  const handleUnlockChest = () => {
    if (dial1 === 9 && dial2 === 3 && dial3 === 8) {
      sound.playChestUnlock();
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.55 } });
      } catch {
        // Ignore
      }
      solveCipher('CIPHER_CAMP_CHEST');
      unlockClue('clue_b_iron_band');
      unlockClue('clue_b_estuary_map');
      setChestFeedback('CẠCH! Ổ khóa đồng đã bật mở! Năm Đại Thắng 938 chính là mật mã cơ mật của Tiền Ngô Vương.');
    } else {
      sound.playClick();
      setChestFeedback(`Mã [${dial1} - ${dial2} - ${dial3}] chưa đúng! Gợi ý: Hãy ghép 3 con số trên Cọc Gỗ, Đai Sắt và Bản Đồ để tìm năm đại thắng của Ngô Quyền!`);
    }
  };

  // 3. Kiểm tra Trận Đồ Bia Đá Thủy Triều
  const handleSolveTideStele = () => {
    if (tideChoice1 === 'BAIT_HIGH' && tideChoice2 === 'STRIKE_EBB') {
      sound.playSuccess();
      try {
        confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
      solveCipher('CIPHER_TIDE_STELE');
      unlockClue('clue_c_low_tide_mark');
      unlockClue('clue_c_high_tide_flood');
      unlockFact('fact-tide-decisive-victory');
      setTideFeedback('Chính xác! Đúng quy luật thủy triều: Nước lên dụ địch vào cọc ngầm — Nước rút dốc quân tổng phản công!');
    } else {
      sound.playClick();
      setTideFeedback('Chiến thuật chưa khớp với sử liệu! Lúc nước triều dâng giấu bãi cọc thì nên làm gì? Và lúc nước triều rút mạnh thì xuất kích ra sao?');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-lacquer-dark/85 backdrop-blur-sm animate-fadeIn select-none"
      onClick={closeCipherPuzzle}
    >
      <div
        className="bg-parchment-50 w-full max-w-2xl max-h-[92dvh] rounded-3xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tiêu đề Modal */}
        <div className="bg-parchment-200 border-b border-parchment-300 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-crimson" />
            <div>
              <h3 className="font-title text-base sm:text-lg font-bold text-lacquer flex items-center gap-2">
                <span>
                  {activeCipherPuzzle === 'CIPHER_VILLAGE_SCROLL' && 'Mật Thư Cổ: Chiếu Lệnh Ẩn Tự'}
                  {activeCipherPuzzle === 'CIPHER_CAMP_CHEST' && 'Hòm Cơ Mật Quân Lệnh 938'}
                  {activeCipherPuzzle === 'CIPHER_TIDE_STELE' && 'Bia Đá Cổ: Trận Đồ Thủy Triều'}
                  {activeCipherPuzzle === 'CIPHER_SECRET_WELL' && 'Mật Thư Ẩn: Lời Dặn Bên Giếng Cổ'}
                  {activeCipherPuzzle === 'CIPHER_SECRET_SHRINE' && 'Mật Thư Ẩn: Hịch Văn Miếu Cổ'}
                  {activeCipherPuzzle === 'CIPHER_SECRET_PITCH' && 'Mật Thư Ẩn: Kỹ Thuật Thuyền Nhẹ'}
                </span>
                {isAlreadySolved && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Đã giải mã
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-lacquer/70">
                Giải mã mật tự và đối chiếu manh mối lịch sử năm 938
              </p>
            </div>
          </div>
          <button
            onClick={closeCipherPuzzle}
            className="p-1.5 rounded-lg hover:bg-parchment-300 text-lacquer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung tương tác từng loại mật mã */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* ===================================================================== */}
          {/* 1. MẬT MÃ: CHIẾU THƯ ẨN TỰ (LÀNG VEN SÔNG) */}
          {/* ===================================================================== */}
          {activeCipherPuzzle === 'CIPHER_VILLAGE_SCROLL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-bronze/60 shadow-inner font-serif relative">
                <div className="text-center font-bold text-xs uppercase text-bronze-dark tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                  <Scroll className="w-4 h-4 text-crimson" />
                  Bản Mật Lệnh Của Cụ Trưởng Thôn
                </div>
                <div className="text-sm sm:text-base text-lacquer leading-relaxed text-center italic space-y-1">
                  <p>“Ái Châu dấy nghĩa trừ gian tặc,”</p>
                  <p>“Bạch Đằng sóng cuộn đợi Lưu lang.”</p>
                  <p>“Mái tranh khói tỏa, chum đôi đón,”</p>
                  <p className="font-bold text-crimson">
                    “[ . . . . . . . . ] phất phơ vững dạ chàng.”
                  </p>
                </div>
              </div>

              {/* Phần câu hỏi giải đố */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 space-y-2">
                  <label className="font-bold text-lacquer flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-crimson" />
                    1. Từ ngữ bị ẩn giấu trong mật lệnh:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'RED_SILK', label: 'Dải lụa đỏ buộc cột cờ' },
                      { key: 'BLUE_CLOTH', label: 'Dải vải chàm xanh' },
                      { key: 'YELLOW_FLAG', label: 'Lá cờ nheo vàng' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sound.playClick();
                          setScrollKeyword(opt.key);
                          setScrollFeedback(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg border font-medium transition-all ${
                          scrollKeyword === opt.key
                            ? 'bg-amber-200 border-crimson font-bold text-crimson'
                            : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 space-y-2">
                  <label className="font-bold text-lacquer flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-crimson" />
                    2. Phương vị của điểm hẹn bí mật:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'NORTHEAST', label: 'Hướng Đông Bắc (Đường lên doanh trại)' },
                      { key: 'SOUTHWEST', label: 'Hướng Tây Nam (Gần rặng tre ven bờ)' },
                      { key: 'CENTER', label: 'Ngay gốc đa miếu đá giữa sân' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sound.playClick();
                          setScrollDirection(opt.key);
                          setScrollFeedback(null);
                        }}
                        className={`w-full text-left p-2 rounded-lg border font-medium transition-all ${
                          scrollDirection === opt.key
                            ? 'bg-amber-200 border-crimson font-bold text-crimson'
                            : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {scrollFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    isAlreadySolved
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scrollFeedback}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSolveScroll}
                  className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze active:scale-95"
                >
                  Xác nhận giải mã mật thư
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. MẬT MÃ: HÒM CƠ MẬT QUÂN LỆNH 938 (KHU CHUẨN BỊ) */}
          {/* ===================================================================== */}
          {activeCipherPuzzle === 'CIPHER_CAMP_CHEST' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-parchment-100 border border-parchment-300 text-xs text-lacquer leading-relaxed">
                <div className="font-bold text-crimson mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Ổ Khóa Cơ Mật 3 Bánh Răng Đồng
                </div>
                <p>
                  Chiếc hòm lim này chứa Bản Đồ Chiến Thuật Cửa Biển do Tiền Ngô Vương truyền lệnh. Khóa bằng <strong>3 chữ số lịch sử</strong>. Hãy xoay 3 bánh lăn số để mở khóa!
                </p>
              </div>

              {/* 3 Bánh lăn mật mã số */}
              <div className="p-5 rounded-2xl bg-[#342216] border-4 border-bronze flex items-center justify-center gap-5 sm:gap-8 shadow-inner">
                {[
                  { val: dial1, num: 1 as const },
                  { val: dial2, num: 2 as const },
                  { val: dial3, num: 3 as const },
                ].map(({ val, num }) => (
                  <div key={num} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => rotateDial(num, 1)}
                      className="p-1.5 rounded-lg bg-bronze/30 hover:bg-bronze text-parchment-100 active:scale-95 transition-all"
                      title="Tăng số"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-gradient-to-b from-[#1C110A] via-[#4A2F1D] to-[#1C110A] border-2 border-bronze shadow-2xl flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-[#FCD34D] font-mono select-none drop-shadow">
                      {val}
                    </div>
                    <button
                      onClick={() => rotateDial(num, -1)}
                      className="p-1.5 rounded-lg bg-bronze/30 hover:bg-bronze text-parchment-100 active:scale-95 transition-all"
                      title="Giảm số"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 3 Manh mối đi kèm thu thập được tại doanh trại */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-xs space-y-1.5">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  3 Dấu Vết Mật Mã Tìm Được Tại Doanh Trại:
                </span>
                <ul className="text-[11px] text-lacquer/85 space-y-1 leading-snug">
                  <li>• <strong>Chữ số 1:</strong> Thân cọc gỗ lớn — <em>“<strong>9</strong> vạn quân dân đồng lòng một chí”</em>.</li>
                  <li>• <strong>Chữ số 2:</strong> Đai sắt lò rèn — <em>“<strong>3</strong> tấc sắt tôi than già bọc cứng đầu cọc”</em>.</li>
                  <li>• <strong>Chữ số 3:</strong> Sa bàn thủy văn — <em>“<strong>8</strong> canh giờ một chu kỳ triều lên triều rút”</em>.</li>
                </ul>
              </div>

              {chestFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    isAlreadySolved
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isAlreadySolved ? (
                    <Unlock className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  )}
                  <span>{chestFeedback}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleUnlockChest}
                  className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze active:scale-95 flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Bật Chốt Mở Khóa Rương</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. MẬT MÃ: BIA ĐÁ CỔ TRẬN ĐỒ THỦY TRIỀU (BẾN QUAN SÁT) */}
          {/* ===================================================================== */}
          {activeCipherPuzzle === 'CIPHER_TIDE_STELE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#183B47] text-parchment-50 border-2 border-bronze/80 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold text-bronze-light mb-1">
                  <Waves className="w-4 h-4" />
                  Văn Bia Cổ Khắc Trận Đồ Sông Bạch Đằng
                </div>
                <p className="text-xs sm:text-sm font-serif italic text-parchment-100 leading-relaxed">
                  “Cửa biển mênh mông, cọc nhọn giấu ngầm dưới đáy nước. Kẻ cầm quân phải nắm rõ tuần hoàn con nước để xoay chuyển thế trận.”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Pha 1: Nước Triều Dâng */}
                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 space-y-2">
                  <label className="font-bold text-lacquer flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Pha 1: Lúc Nước Triều Dâng (Ngập bãi cọc)
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'BAIT_HIGH', label: 'Cho thuyền nhẹ ra khiêu chiến rồi giả thua dụ địch vượt qua bãi cọc' },
                      { key: 'ATTACK_HIGH', label: 'Dốc toàn bộ thuyền chiến lớn ra đâm va trực diện với thuyền giặc' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sound.playClick();
                          setTideChoice1(opt.key);
                          setTideFeedback(null);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-[11px] leading-snug transition-all ${
                          tideChoice1 === opt.key
                            ? 'bg-blue-100 border-blue-600 font-bold text-blue-950'
                            : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pha 2: Nước Triều Rút */}
                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 space-y-2">
                  <label className="font-bold text-lacquer flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    Pha 2: Lúc Nước Triều Bắt Đầu Rút Mạnh
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'STRIKE_EBB', label: 'Quật kích dữ dội, dồn thuyền giặc quay đầu va vỡ trên bãi cọc nhô lên' },
                      { key: 'RETREAT_EBB', label: 'Thu quân vào bờ làng phòng thủ bảo toàn lực lượng' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sound.playClick();
                          setTideChoice2(opt.key);
                          setTideFeedback(null);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg border text-[11px] leading-snug transition-all ${
                          tideChoice2 === opt.key
                            ? 'bg-red-100 border-red-600 font-bold text-red-950'
                            : 'bg-white border-parchment-300 text-lacquer hover:bg-parchment-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {tideFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    isAlreadySolved
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tideFeedback}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSolveTideStele}
                  className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze active:scale-95 flex items-center gap-1.5"
                >
                  <Waves className="w-4 h-4" />
                  <span>Kích Hoạt Trận Đồ Thủy Triều</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. CÁC MẬT THƯ ẨN CẤT GIẤU TRONG THẾ GIỚI (SECRET CACHES) */}
          {/* ===================================================================== */}
          {(activeCipherPuzzle === 'CIPHER_SECRET_WELL' ||
            activeCipherPuzzle === 'CIPHER_SECRET_SHRINE' ||
            activeCipherPuzzle === 'CIPHER_SECRET_PITCH') && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-bronze/70 shadow-sm font-serif">
                <div className="flex items-center gap-2 text-xs font-bold text-crimson mb-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bản Mật Thư Cổ Vừa Được Khám Phá</span>
                </div>

                {activeCipherPuzzle === 'CIPHER_SECRET_WELL' && (
                  <div className="space-y-2 text-xs sm:text-sm text-lacquer leading-relaxed">
                    <p className="font-bold text-sm text-lacquer">Mật thư giấu trong ống tre dưới đáy giếng làng:</p>
                    <p className="italic">
                      “Lấy yếu chống mạnh, lấy đoản chế trường. Giặc cậy thuyền lớn, ta dùng bãi cọc nhọn và con nước làm mồ chôn. Trận này thành, non sông muôn thuở vững bền!”
                    </p>
                    <p className="text-[11px] text-lacquer/70 pt-1 border-t border-parchment-300">
                      Ghi nhận: Bạn đã tìm thấy vị trí bí mật đầu tiên tại Giếng Làng Ven Sông.
                    </p>
                  </div>
                )}

                {activeCipherPuzzle === 'CIPHER_SECRET_SHRINE' && (
                  <div className="space-y-2 text-xs sm:text-sm text-lacquer leading-relaxed">
                    <p className="font-bold text-sm text-lacquer">Tờ hịch văn Ái Châu giấu sau bát hương miếu cổ:</p>
                    <p className="italic">
                      “Kiều Công Tiễn nghịch tặc giết chủ đoạt quyền, rước hổ Nam Hán vào nhà. Quân tướng Ái Châu thề cùng Ngô Vương quyết một lòng đền ơn chủ tướng, cứu vớt lê dân!”
                    </p>
                    <p className="text-[11px] text-lacquer/70 pt-1 border-t border-parchment-300">
                      Ghi nhận: Bạn đã tìm thấy vị trí bí mật thứ hai dưới gốc đa cổ thụ.
                    </p>
                  </div>
                )}

                {activeCipherPuzzle === 'CIPHER_SECRET_PITCH' && (
                  <div className="space-y-2 text-xs sm:text-sm text-lacquer leading-relaxed">
                    <p className="font-bold text-sm text-lacquer">Bản gỗ kỹ thuật thuyền nan bến sông:</p>
                    <p className="italic">
                      “Gỗ vạng dầu rái trét kín mép thuyền. Thuyền nhẹ lướt sóng nhanh như tên bắn, khiêu chiến rồi rút chạy tựa như cánh chim én trên sóng Bạch Đằng.”
                    </p>
                    <p className="text-[11px] text-lacquer/70 pt-1 border-t border-parchment-300">
                      Ghi nhận: Bạn đã tìm thấy vị trí bí mật thứ ba tại Bến Đò Bác Năm.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    solveCipher(activeCipherPuzzle);
                    if (activeCipherPuzzle === 'CIPHER_SECRET_WELL') unlockClue('clue_secret_ancient_well');
                    if (activeCipherPuzzle === 'CIPHER_SECRET_SHRINE') unlockClue('clue_secret_shrine_cache');
                    if (activeCipherPuzzle === 'CIPHER_SECRET_PITCH') unlockClue('clue_secret_boat_pitch');
                    closeCipherPuzzle();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze active:scale-95"
                >
                  Ghi vào Sổ Manh Mối
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
