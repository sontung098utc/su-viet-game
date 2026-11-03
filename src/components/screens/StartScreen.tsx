import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Play, HelpCircle, Volume2, VolumeX, Shield, Trash2, ArrowRight, BookOpen, Sparkles, Box } from 'lucide-react';
import { HowToPlayModal } from '../common/HowToPlayModal';
import { ResetConfirmModal } from '../common/ResetConfirmModal';

export const StartScreen: React.FC = () => {
  const {
    progress,
    setScreen,
    startNewCharacterSetup,
    toggleSound,
    hasSavedGame,
    resetGame,
    openCodex,
  } = useGame();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleStartNew = () => {
    startNewCharacterSetup();
  };

  const handleContinue = () => {
    setScreen('GAME');
  };

  const handleStartChapter1_3D = () => {
    setScreen('GAME_3D_CO_LOA');
  };

  return (
    <div className="min-h-screen bg-parchment-pattern flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Decorative corner motifs */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-bronze pointer-events-none opacity-60" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-bronze pointer-events-none opacity-60" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-bronze pointer-events-none opacity-60" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-bronze pointer-events-none opacity-60" />

      {/* Top Bar Controls */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="seal-stamp text-xs bg-parchment-100/90 shadow-sm">
          Phiêu Lưu Nhập Vai 2D • Năm 938
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCodex()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment-200/90 border border-parchment-300 text-xs font-semibold text-lacquer hover:bg-parchment-300 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-crimson" />
            <span>Sổ tay Sử Việt</span>
          </button>
          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-parchment-200/90 border border-parchment-300 text-xs font-semibold text-lacquer hover:bg-parchment-300 transition-colors shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-crimson" />
            <span>Điều khiển</span>
          </button>
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-full bg-parchment-200/90 border border-parchment-300 text-lacquer hover:bg-parchment-300 transition-colors shadow-sm"
            title={progress.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {progress.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-crimson" />
            )}
          </button>
        </div>
      </div>

      {/* Main Center Content */}
      <div className="max-w-2xl mx-auto w-full my-auto text-center z-10 py-6">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-5">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
            <circle cx="100" cy="100" r="94" fill="#FAF4E6" stroke="#9B1D20" strokeWidth="5" />
            <circle cx="100" cy="100" r="84" fill="#184F63" stroke="#C99726" strokeWidth="3" />
            {/* Bờ làng và cây đa phía xa */}
            <path d="M 22 108 Q 65 92 115 106 T 178 104 L 178 140 L 22 140 Z" fill="#6E9446" />
            {/* Mặt sông Bạch Đằng */}
            <path d="M 20 122 Q 65 112 100 122 T 180 122 L 180 175 Q 100 192 20 175 Z" fill="#237B96" />
            {/* Hàng cọc vạt nhọn bịt sắt */}
            <polygon points="62,155 68,104 74,155" fill="#8C5835" stroke="#2F1B12" strokeWidth="1.5" />
            <polygon points="65,114 68,102 71,114" fill="#D1D5DB" />
            <polygon points="94,158 100,98 106,158" fill="#8C5835" stroke="#2F1B12" strokeWidth="1.5" />
            <polygon points="97,110 100,96 103,110" fill="#D1D5DB" />
            <polygon points="126,155 132,106 138,155" fill="#8C5835" stroke="#2F1B12" strokeWidth="1.5" />
            <polygon points="129,116 132,104 135,116" fill="#D1D5DB" />
            {/* Thuyền nhẹ truyền tin */}
            <path d="M 48 134 C 75 134 125 134 152 134 L 140 146 L 60 146 Z" fill="#CFA872" stroke="#2F1B12" strokeWidth="2" />
            <polygon points="100,110 100,134 124,122" fill="#9B1D20" />
          </svg>
        </div>

        <h1 className="font-title text-3xl sm:text-5xl font-extrabold text-lacquer tracking-tight leading-tight mb-2">
          MẬT MÃ SỬ VIỆT
        </h1>

        <div className="inline-block px-4 py-1.5 rounded-full bg-parchment-200/90 border border-bronze/50 shadow-inner mb-3">
          <p className="font-serif italic text-crimson font-semibold text-sm sm:text-base">
            Bến Sông Bạch Đằng Năm 938 — Hành Trình Người Đưa Tin
          </p>
        </div>

        <p className="text-xs sm:text-sm text-lacquer/85 max-w-lg mx-auto mb-6 leading-relaxed">
          Bước qua <strong>Cổng Thời Không</strong>, tự tay tìm kiếm các mảnh ghép di sản bị thất lạc và phục dựng những trang sử vàng chói lọi của dân tộc!
        </p>

        {/* HERO CARD: CHƯƠNG 1 (3D FPS) - CỔ LOA NỎ THẦN */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-lacquer to-amber-950/80 border-2 border-amber-400/80 shadow-2xl text-left max-w-lg mx-auto relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-crimson text-amber-200 text-[10px] font-bold tracking-wider uppercase border border-amber-300 animate-pulse">
            Chương 1 Mới • 3D Góc Nhìn Thứ Nhất
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shrink-0 shadow-md border border-white/40">
              <Box className="w-6 h-6 text-lacquer" />
            </div>
            <div>
              <h3 className="font-title text-base sm:text-lg font-bold text-amber-200 leading-tight">
                Cổ Loa — Nỏ Thần Kim Quy
              </h3>
              <p className="text-xs text-parchment-200/90 font-serif mt-1 leading-relaxed">
                Khám phá thành ốc 3D, tìm 3 mảnh ghép cổ vật (Thân nỏ, Lẫy rùa vàng, Mũi tên đồng Cầu Vực), lắp ráp và giương nỏ thần bắn giặc!
              </p>
            </div>
          </div>
          <button
            onClick={handleStartChapter1_3D}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-lacquer font-bold text-sm shadow-lg transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-crimson" />
            <span>Khám Phá Thành Cổ Loa 3D (FPS)</span>
            <ArrowRight className="w-4 h-4 text-lacquer" />
          </button>
        </div>

        {/* SECTION: CHƯƠNG 2 (2D) - BẠCH ĐẰNG 938 */}
        <div className="text-xs font-bold text-lacquer/80 uppercase tracking-wider mb-2.5">
          Hoặc tiếp tục: Chương 2 • Bạch Đằng Năm 938 (2D)
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {hasSavedGame ? (
            <>
              <button
                onClick={handleContinue}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-sm shadow-md transition-all border border-bronze active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Tiếp tục Bạch Đằng ({progress.playerName})</span>
              </button>

              <button
                onClick={handleStartNew}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-lacquer font-semibold text-xs border border-parchment-400 shadow-sm transition-all active:scale-95"
              >
                <span>Tạo nhân vật mới</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStartNew}
              className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-sm shadow-md transition-all border border-bronze active:scale-95"
            >
              <span>Vào Chơi Bạch Đằng 938</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasSavedGame && (
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-lacquer/70">
            <span>
              Vị trí đã lưu:{' '}
              <strong>
                {progress.playerPosition.zone === 'VILLAGE'
                  ? 'Làng Ven Sông'
                  : progress.playerPosition.zone === 'CAMP'
                  ? 'Khu Chuẩn Bị'
                  : 'Bến Quan Sát'}
              </strong>
            </span>
            <span>•</span>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-red-700 hover:text-red-900 underline flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3 h-3" />
              Xóa tiến trình
            </button>
          </div>
        )}
      </div>

      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-lacquer/65 z-10 pt-4 border-t border-parchment-300/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-bronze-dark" />
          <span>Sử liệu đối chiếu: Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Quyển V)</span>
        </div>
        <div className="text-[11px] text-lacquer/55">
          Điều khiển WASD / Phím mũi tên + [E] hoặc Cảm ứng di động
        </div>
      </footer>

      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetGame}
      />
    </div>
  );
};
