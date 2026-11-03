import React, { useState } from 'react';
import { Compass, Crosshair, ArrowLeft, Target, BookOpen, Volume2, VolumeX, ShieldAlert, Eye } from 'lucide-react';
import type { CoLoaRelicId } from '../../types';
import { CO_LOA_RELICS } from '../../data/chapterCoLoa';

interface CoLoaHUDProps {
  collectedShards: CoLoaRelicId[];
  hoveredPrompt: { id: string; name: string; prompt: string } | null;
  compassYaw: number;
  compassTargets: { id: string; name: string; angle: number; distance: number }[];
  isCrossbowReady: boolean;
  isCrossbowAssembled: boolean;
  targetsHit: number;
  cameraMode: 'FIRST_PERSON' | 'THIRD_PERSON';
  onToggleCameraMode: () => void;
  onOpenNarration: (actId?: string) => void;
  onInteractClick: () => void;
  onExitToMenu: () => void;
  onOpenCodex: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onMobileMove: (x: number, y: number) => void;
}

export const CoLoaHUD: React.FC<CoLoaHUDProps> = ({
  collectedShards,
  hoveredPrompt,
  compassYaw,
  compassTargets,
  isCrossbowReady,
  isCrossbowAssembled,
  targetsHit,
  cameraMode,
  onToggleCameraMode,
  onOpenNarration,
  onInteractClick,
  onExitToMenu,
  onOpenCodex,
  soundEnabled,
  onToggleSound,
  onMobileMove,
}) => {
  // Virtual Joystick state for Mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Trạng thái thu gọn / mở rộng bảng nhiệm vụ để màn hình chơi game luôn rộng rãi
  const [isQuestCollapsed, setIsQuestCollapsed] = useState(false);

  const allRelicKeys: CoLoaRelicId[] = ['SHARD_CROSSBOW_STOCK', 'SHARD_TURTLE_TRIGGER', 'SHARD_BRONZE_ARROWS'];

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
    setStickOffset({ x: 0, y: 0 });
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.touches[0];
    const maxRadius = 40;
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setStickOffset({ x: nx, y: ny });
    onMobileMove(nx / maxRadius, ny / maxRadius);
  };

  const handleJoystickTouchEnd = () => {
    setTouchStart(null);
    setStickOffset({ x: 0, y: 0 });
    onMobileMove(0, 0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      {/* --- TOP BAR: COMPASS RADAR & QUEST PROGRESS --- */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 pointer-events-auto">
        {/* Back button & Title */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onExitToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-200 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Âu Lạc • Cổ Loa 3D</span>
          </div>
        </div>

        {/* Dynamic 3D Radar Ribbon */}
        <div className="hidden lg:flex flex-col items-center">
          <div className="w-64 h-8 px-3 rounded-full bg-black/70 border border-amber-500/50 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-amber-300 relative overflow-hidden">
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{Math.round(compassYaw)}°</span>
            </div>
            {compassTargets.slice(0, 2).map((tgt) => (
              <div
                key={tgt.id}
                className="flex items-center gap-1 text-[10px] bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30 text-amber-100"
              >
                <span>{tgt.name.slice(0, 10)}..</span>
                <span className="font-bold text-emerald-400">{tgt.distance}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side controls: Camera Toggle, Story Narration, Codex, Sound */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Nút chuyển đổi Góc nhìn Thứ 3 / Thứ 1 (3rd / 1st Person) */}
          <button
            onClick={onToggleCameraMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 border border-amber-400/80 text-amber-300 text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            title="Chuyển đổi góc nhìn thứ nhất / thứ ba (Phím tắt: V)"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{cameraMode === 'THIRD_PERSON' ? 'Góc nhìn: 3rd [V]' : 'Góc nhìn: 1st [V]'}</span>
          </button>

          {/* Nút Nghe Sử Ký Toàn Thư */}
          <button
            onClick={() => onOpenNarration()}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-crimson hover:bg-crimson-light border border-amber-300 text-white text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
            title="Nghe lời dẫn Đại Việt Sử Ký Toàn Thư"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-200" />
            <span>Sử Ký Toàn Thư</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Sổ tay</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
            title="Bật/tắt âm thanh"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-crimson" />
            )}
          </button>
        </div>
      </div>

      {/* --- RELIC SHARDS HUD TRACKER (Mảnh Ghép Đã Thu Thập - Thiết Kế Gọn Gàng, Thu Phóng Linh Hoạt) --- */}
      <div className="self-center sm:self-start mt-1 pointer-events-auto">
        {/* Nút thu gọn / mở rộng bảng nhiệm vụ */}
        {isQuestCollapsed ? (
          <button
            onClick={() => setIsQuestCollapsed(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 border border-amber-400/80 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer group"
            title="Bấm để mở chi tiết nhiệm vụ nỏ thần"
          >
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span>🏹</span>
              <span>Nỏ Thần:</span>
              <span className="text-white">{collectedShards.length}/3</span>
            </span>
            <div className="flex items-center gap-1">
              {allRelicKeys.map((key) => (
                <span
                  key={key}
                  className={`w-2 h-2 rounded-full transition-all ${
                    collectedShards.includes(key)
                      ? 'bg-amber-400 shadow-sm shadow-amber-300'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            {isCrossbowReady && !isCrossbowAssembled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/80 text-white font-bold animate-pulse">
                Lắp Ráp!
              </span>
            )}
            {isCrossbowAssembled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                Bắn: {targetsHit}/5
              </span>
            )}
            <span className="text-[10px] text-amber-400 group-hover:translate-y-0.5 transition-transform">
              ▾
            </span>
          </button>
        ) : (
          <div className="px-3 py-2 rounded-2xl bg-black/80 border border-amber-500/50 backdrop-blur-md text-white text-xs shadow-2xl flex flex-col gap-1.5 max-w-xs transition-all animate-fade-in">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-amber-300 border-b border-white/10 pb-1">
              <span className="flex items-center gap-1">
                <span>🏹</span>
                <span>MẢNH GHÉP NỎ ({collectedShards.length}/3)</span>
              </span>
              <button
                onClick={() => setIsQuestCollapsed(true)}
                className="text-[10px] text-white/60 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-0.5 cursor-pointer"
                title="Thu gọn bảng nhiệm vụ để thoáng màn hình"
              >
                <span>Thu gọn</span>
                <span>▴</span>
              </button>
            </div>

            {/* Danh sách 3 mảnh ghép */}
            <div className="grid grid-cols-3 gap-1.5">
              {allRelicKeys.map((key) => {
                const has = collectedShards.includes(key);
                const relic = CO_LOA_RELICS[key];
                return (
                  <div
                    key={key}
                    className={`px-1.5 py-1 rounded-lg text-center transition-all ${
                      has
                        ? 'bg-gradient-to-b from-amber-600/90 to-amber-700/90 border border-amber-300 text-white font-bold shadow-sm'
                        : 'bg-white/10 border border-white/10 text-white/50'
                    }`}
                  >
                    <div className="text-[9px] truncate font-medium">{relic.name.split(' ')[0]}</div>
                    <div className="text-[11px] font-bold leading-tight">{has ? '✓' : '○'}</div>
                  </div>
                );
              })}
            </div>

            {/* Chỉ dẫn súc tích */}
            <div className="text-[10px] text-amber-100/90 italic font-serif leading-tight">
              {!isCrossbowReady && (
                <span>🔍 Tìm 3 cổ vật phát quang và nhấn [E].</span>
              )}
              {isCrossbowReady && !isCrossbowAssembled && (
                <span className="text-emerald-300 font-bold not-italic">
                  🏹 Đã đủ 3 mảnh! Lên Vọng Lâu bờ thành Nam lắp nỏ.
                </span>
              )}
              {isCrossbowAssembled && (
                <span className="text-amber-300 font-bold not-italic">
                  🎯 Bấm [E] hoặc Chạm BẮN diệt thuyền ({targetsHit}/5)!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- CENTER CROSSHAIR & INTERACTION PROMPT --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Center Crosshair */}
        <div
          className={`w-6 h-6 flex items-center justify-center transition-transform duration-200 ${
            hoveredPrompt ? 'scale-150 text-amber-300' : 'text-white/60'
          }`}
        >
          <Crosshair className="w-5 h-5 drop-shadow-md" />
        </div>

        {/* Hover Interaction Tooltip */}
        {hoveredPrompt && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-black/85 border-2 border-amber-400 text-white text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>{hoveredPrompt.prompt}</span>
          </div>
        )}
      </div>

      {/* --- BOTTOM CONTROLS & MOBILE TOUCH JOYSTICK --- */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Left: Mobile Virtual Thumbstick */}
        <div
          className="relative w-28 h-28 rounded-full bg-black/40 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center touch-none sm:hidden"
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
        >
          <div className="text-[10px] text-white/40 pointer-events-none">DI CHUYỂN</div>
          <div
            className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white/70 shadow-lg pointer-events-none transition-transform"
            style={{
              transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)`,
            }}
          />
        </div>

        {/* Desktop Helper Guide */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-[11px] text-white/80 font-mono backdrop-blur-md shadow-md">
          <span>
            <strong className="text-amber-300">W, A, S, D / Phím Mũi Tên</strong> Di chuyển
          </span>
          <span>•</span>
          <span>
            <strong className="text-amber-300">[V]</strong> Đổi góc nhìn 1st/3rd
          </span>
          <span>•</span>
          <span>
            <strong className="text-amber-300">Kéo Chuột / Pointer</strong> Xoay 360°
          </span>
          <span>•</span>
          <span>
            <strong className="text-amber-300">[E]</strong> Tương tác
          </span>
        </div>

        {/* Right: Big Action Button (Mobile & Desktop) */}
        <div className="flex flex-col items-end gap-2">
          {/* Firing Target Counter */}
          {isCrossbowAssembled && (
            <div className="px-3 py-1 rounded-full bg-crimson border border-amber-300 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span>Tiêu diệt: {targetsHit}/5 chiến thuyền</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onInteractClick}
            disabled={!hoveredPrompt && !isCrossbowAssembled}
            className={`px-5 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-2xl transition-all active:scale-95 ${
              isCrossbowAssembled
                ? 'bg-gradient-to-r from-red-600 via-crimson to-amber-600 text-white border-2 border-amber-300 animate-pulse'
                : hoveredPrompt
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-lacquer border-2 border-white'
                : 'bg-black/40 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            {isCrossbowAssembled ? (
              <>
                <Target className="w-5 h-5 text-amber-300" />
                <span>BẮN NỎ THẦN!</span>
              </>
            ) : hoveredPrompt ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>TƯƠNG TÁC [E]</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-white/30" />
                <span>Tiến lại gần cổ vật</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
