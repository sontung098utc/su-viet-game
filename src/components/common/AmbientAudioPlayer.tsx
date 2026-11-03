import React, { useState, useEffect } from 'react';
import {
  vietnameseAmbientMusic,
  AMBIENT_TRACKS,
  type PlayerState,
} from '../../utils/vietnameseAmbientMusic';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Sliders,
  ChevronDown,
  Waves,
  Sparkles,
} from 'lucide-react';

export const AmbientAudioPlayer: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>(() =>
    vietnameseAmbientMusic.getState()
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = vietnameseAmbientMusic.subscribe((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  const currentTrack = AMBIENT_TRACKS[playerState.currentTrackIndex] || AMBIENT_TRACKS[0];

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    vietnameseAmbientMusic.toggleMute();
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    vietnameseAmbientMusic.togglePlay();
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    vietnameseAmbientMusic.nextTrack();
  };

  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    vietnameseAmbientMusic.prevTrack();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    vietnameseAmbientMusic.setVolume(vol);
  };

  const handleToggleLoFiAmbient = (e: React.MouseEvent) => {
    e.stopPropagation();
    vietnameseAmbientMusic.toggleLoFiAmbient();
  };

  const isAudioActive = playerState.isPlaying && !playerState.isMuted;

  return (
    <>
      {/* Nút bấm / Thanh mini player nổi cố định */}
      <aside
        aria-label="Nhạc nền truyền thống"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 select-none transition-all duration-300"
      >
        <div className="relative group">
          {/* Thanh hiển thị gọn (Compact Bar) */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 ${
              isAudioActive
                ? 'bg-parchment-100/95 border-bronze/80 text-lacquer shadow-bronze/20 ring-1 ring-bronze/30'
                : 'bg-parchment-200/90 border-parchment-400/60 text-lacquer/80 shadow-black/10'
            }`}
          >
            {/* Visualizer sóng âm nhạc ngũ cung nhỏ */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 focus:outline-none cursor-pointer"
              title="Mở bảng điều khiển nhạc truyền thống"
            >
              <div className="w-6 h-6 rounded-full bg-bronze/15 border border-bronze/40 flex items-center justify-center shrink-0">
                <Music className={`w-3.5 h-3.5 ${isAudioActive ? 'text-crimson animate-pulse' : 'text-lacquer/60'}`} />
              </div>

              {/* Sóng equalizer mô phỏng nhịp điệu ngũ cung */}
              <div className="flex items-end gap-0.5 h-3.5 w-4 px-0.5">
                <span
                  className={`w-0.5 bg-bronze rounded-full transition-all duration-150 ${
                    isAudioActive ? 'h-3 animate-pulse' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className={`w-0.5 bg-crimson rounded-full transition-all duration-150 ${
                    isAudioActive ? 'h-2 animate-pulse' : 'h-1.5 opacity-40'
                  }`}
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className={`w-0.5 bg-bronze rounded-full transition-all duration-150 ${
                    isAudioActive ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '300ms' }}
                />
              </div>

              {/* Tên bài hát hiển thị trên màn hình máy tính/tablet */}
              <div className="hidden md:flex flex-col text-left pr-1 max-w-[170px]">
                <span className="text-[11px] font-bold truncate leading-tight text-lacquer">
                  {currentTrack.title}
                </span>
                <span className="text-[9px] text-lacquer/60 truncate leading-tight font-serif italic">
                  {currentTrack.instruments}
                </span>
              </div>
            </button>

            <div className="h-4 w-px bg-parchment-400/50" />

            {/* Nút Bật/Tắt tiếng (MUTE / UNMUTE) - Tính năng cốt lõi */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-1.5 rounded-full transition-transform active:scale-90 cursor-pointer ${
                playerState.isMuted
                  ? 'bg-crimson/15 text-crimson hover:bg-crimson/25'
                  : 'bg-emerald-600/15 text-emerald-800 hover:bg-emerald-600/25'
              }`}
              title={playerState.isMuted ? 'Bật tiếng nhạc nền' : 'Tắt tiếng nhạc nền (Mute)'}
              aria-label={playerState.isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              {playerState.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Nút Play / Pause */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-1.5 rounded-full bg-bronze/20 hover:bg-bronze/30 text-lacquer transition-transform active:scale-90 cursor-pointer"
              title={playerState.isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc nền'}
              aria-label={playerState.isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
            >
              {playerState.isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.2" />
              )}
            </button>

            {/* Nút mở rộng tùy chỉnh chi tiết */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full text-lacquer/70 hover:text-lacquer hover:bg-parchment-300 transition-colors"
              title={isExpanded ? 'Thu gọn' : 'Tùy chỉnh nhạc cụ và âm lượng'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <Sliders className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Bảng điều khiển mở rộng (Expanded Modal/Card) */}
        {isExpanded && (
          <div className="absolute bottom-12 right-0 w-[310px] sm:w-[350px] p-4 rounded-2xl bg-parchment-100 border-2 border-bronze shadow-2xl z-50 text-lacquer wood-frame animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header bảng nhạc */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-parchment-300">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-crimson text-parchment-100 flex items-center justify-center font-bold text-xs shadow-sm">
                  <span>♫</span>
                </div>
                <div>
                  <h4 className="font-title font-bold text-sm text-lacquer leading-tight">
                    Nhạc Cụ Sử Việt Low-Fi
                  </h4>
                  <p className="text-[10px] text-lacquer/70 font-serif italic">
                    Giai điệu ngũ cung & Không gian lịch sử
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-full hover:bg-parchment-300 text-lacquer/60 hover:text-lacquer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin bài đang phát */}
            <div className="bg-parchment-200/80 p-3 rounded-xl border border-parchment-300 mb-3 shadow-inner">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-title font-bold text-base text-crimson leading-snug">
                    {currentTrack.title}
                  </div>
                  <div className="text-[11px] font-semibold text-bronze-dark mt-0.5">
                    {currentTrack.subtitle}
                  </div>
                </div>
                <div className="seal-stamp text-[9px] px-1.5 py-0.5 bg-parchment-100">
                  {currentTrack.scaleType === 'NAM' ? 'Điệu Nam' : currentTrack.scaleType === 'BAC' ? 'Điệu Bắc' : 'Điệu Oán'}
                </div>
              </div>

              <div className="mt-2 text-[11px] text-lacquer/80 font-serif leading-relaxed italic bg-parchment-100/70 p-2 rounded-lg border border-parchment-300/50">
                "{currentTrack.description}"
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-lacquer/70">
                <Sparkles className="w-3 h-3 text-bronze shrink-0" />
                <span className="font-medium">Nhạc cụ: {currentTrack.instruments}</span>
              </div>
            </div>

            {/* Danh sách 3 khúc ca sử thi để chọn nhanh */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-lacquer/60 px-1">
                Chọn khúc ca:
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {AMBIENT_TRACKS.map((t, idx) => {
                  const isCurrent = playerState.currentTrackIndex === idx;
                  return (
                    <button
                      key={t.id}
                      onClick={() => vietnameseAmbientMusic.setTrack(idx)}
                      className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-parchment-300/90 border-bronze font-bold text-lacquer shadow-sm'
                          : 'bg-parchment-100/70 border-parchment-300/70 text-lacquer/80 hover:bg-parchment-200'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{t.title}</div>
                        <div className="text-[9px] font-normal text-lacquer/60 truncate font-serif">
                          {t.instruments}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-crimson animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Các nút điều hướng bài (Previous / Play / Next / Mute) */}
            <div className="flex items-center justify-center gap-3 py-2 bg-parchment-200/50 rounded-xl border border-parchment-300 mb-3">
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-full hover:bg-parchment-300 text-lacquer/80 active:scale-95 transition-all"
                title="Khúc ca trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-crimson hover:bg-crimson-light text-parchment-100 flex items-center justify-center shadow-md active:scale-95 transition-all"
                title={playerState.isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {playerState.isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-full hover:bg-parchment-300 text-lacquer/80 active:scale-95 transition-all"
                title="Khúc ca kế tiếp"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-parchment-400/50 mx-1" />

              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-full border transition-all active:scale-95 ${
                  playerState.isMuted
                    ? 'bg-crimson/15 text-crimson border-crimson/30 hover:bg-crimson/25'
                    : 'bg-emerald-600/15 text-emerald-800 border-emerald-600/30 hover:bg-emerald-600/25'
                }`}
                title={playerState.isMuted ? 'Bật âm thanh (Unmute)' : 'Tắt âm thanh (Mute)'}
              >
                {playerState.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Thanh trượt Âm lượng (Volume Slider) */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs font-semibold px-1">
                <span className="flex items-center gap-1 text-[11px] text-lacquer/80">
                  <Sliders className="w-3.5 h-3.5 text-bronze" />
                  Âm lượng nhạc nền:
                </span>
                <span className="text-[11px] font-mono font-bold text-crimson">
                  {playerState.isMuted ? '0%' : `${Math.round(playerState.volume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={playerState.isMuted ? 0 : playerState.volume}
                onChange={handleVolumeChange}
                disabled={playerState.isMuted}
                className="w-full h-2 bg-parchment-300 rounded-lg appearance-none cursor-pointer accent-crimson"
              />
            </div>

            {/* Nút bật/tắt tiếng Sóng & Gió sông Low-Fi */}
            <div className="flex items-center justify-between pt-2 border-t border-parchment-300 text-xs">
              <button
                onClick={handleToggleLoFiAmbient}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  playerState.lofiAmbientEnabled
                    ? 'bg-river-50 text-river-700 border-river-300'
                    : 'bg-parchment-200 text-lacquer/60 border-parchment-300'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Tiếng nước & gió sông</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-black/10">
                  {playerState.lofiAmbientEnabled ? 'Bật' : 'Tắt'}
                </span>
              </button>

              <span className="text-[10px] text-lacquer/50 italic">
                *Tự hạ âm khi có thoại
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
