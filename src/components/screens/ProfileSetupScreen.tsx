import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import type { GameMode, AvatarOutfit } from '../../types';
import { CharacterPortrait } from '../game/Portraits';
import { Compass, Lightbulb, User, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const ProfileSetupScreen: React.FC = () => {
  const { progress, isFreshCharacterSetup, setPlayerProfile, setScreen } = useGame();
  // Khi bắt đầu lượt chơi mới (isFreshCharacterSetup = true), không giữ lại tên của lượt chơi cũ!
  const [name, setName] = useState(() =>
    isFreshCharacterSetup ? '' : progress.playerName || ''
  );
  const [outfit, setOutfit] = useState<AvatarOutfit>(progress.avatarOutfit || 'brown');
  const [mode, setMode] = useState<GameMode>(progress.gameMode || 'GUIDED');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên nhân vật của bạn (hoặc chạm chọn một tên gợi ý bên dưới).');
      return;
    }
    if (trimmed.length > 24) {
      setError('Tên nhân vật không nên dài quá 24 ký tự.');
      return;
    }
    setPlayerProfile(trimmed, outfit, mode);
  };

  return (
    <div className="min-h-screen bg-parchment-pattern flex flex-col justify-center items-center p-4 select-none">
      <div className="max-w-xl w-full bg-parchment-50 rounded-2xl border-4 border-bronze shadow-2xl p-6 sm:p-8 text-lacquer relative">
        <button
          onClick={() => setScreen('START')}
          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-parchment-200 text-lacquer/70 hover:text-lacquer transition-colors"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-5 pt-2">
          <div className="seal-stamp text-[11px] mb-1.5">Nhập Vai Bối Cảnh Năm 938</div>
          <h2 className="font-title text-2xl sm:text-3xl font-bold text-lacquer">
            Tạo Nhân Vật Người Đưa Tin
          </h2>
          <p className="text-xs sm:text-sm text-lacquer/75 mt-1">
            Bạn là một người đưa tin trẻ (nhân vật hư cấu) tại Làng Ven Sông Bạch Đằng mùa đông năm 938
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Chọn ngoại hình nhân vật & Xem trước chân dung */}
          <div className="p-4 rounded-2xl bg-parchment-100 border-2 border-parchment-300 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0 flex flex-col items-center">
              <CharacterPortrait
                portraitId="messenger"
                outfit={outfit}
                className="w-24 h-24 drop-shadow-md"
              />
              <span className="text-[11px] font-bold text-crimson mt-1">
                {name.trim() || 'Chưa nhập tên'}
              </span>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lacquer/80 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-crimson" />
                  Tên nhân vật của bạn:
                </label>
                <input
                  data-testid="player-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Nhập tên của bạn (VD: Minh An, Hoàng Nam...)"
                  maxLength={24}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-parchment-300 focus:border-crimson focus:outline-none text-sm text-lacquer font-semibold"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-lacquer/65">Gợi ý nhanh:</span>
                  {['Minh An', 'Hoàng Nam', 'Thanh Trúc', 'Bảo Châu'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setName(preset);
                        setError('');
                      }}
                      className="px-2.5 py-1 rounded-full bg-parchment-200 hover:bg-parchment-300 border border-bronze/50 text-[11px] font-semibold text-lacquer active:scale-95"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lacquer/80 mb-1.5">
                  Ngoại hình trang phục:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOutfit('brown')}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      outfit === 'brown'
                        ? 'bg-amber-100 border-crimson text-lacquer shadow-sm'
                        : 'bg-parchment-50 border-parchment-300 text-lacquer/70'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#7C4D2B] border border-lacquer" />
                    Áo Nâu Sồng
                  </button>

                  <button
                    type="button"
                    onClick={() => setOutfit('indigo')}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      outfit === 'indigo'
                        ? 'bg-sky-100 border-river-600 text-lacquer shadow-sm'
                        : 'bg-parchment-50 border-parchment-300 text-lacquer/70'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-[#234B6E] border border-lacquer" />
                    Áo Lam Chàm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chọn chế độ dẫn đường */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lacquer/80 mb-2">
              Chế Độ Dẫn Đường Trong Thế Giới:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode('GUIDED')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'GUIDED'
                    ? 'bg-parchment-200 border-crimson shadow-md'
                    : 'bg-parchment-100/80 border-parchment-300 hover:bg-parchment-200/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-crimson text-white">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-lacquer">Có hướng dẫn</h4>
                </div>
                <p className="text-xs text-lacquer/75 leading-relaxed">
                  Hiển thị mũi tên la bàn dưới chân và dấu hiệu rõ ràng dẫn tới khu vực cần đến.
                </p>
              </div>

              <div
                onClick={() => setMode('DISCOVERY')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'DISCOVERY'
                    ? 'bg-parchment-200 border-bronze-dark shadow-md'
                    : 'bg-parchment-100/80 border-parchment-300 hover:bg-parchment-200/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-bronze-dark text-white">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-lacquer">Tự khám phá</h4>
                </div>
                <p className="text-xs text-lacquer/75 leading-relaxed">
                  Tự quan sát biển chỉ đường ở các ngã rẽ (vẫn có thể bật nút Chỉ đường khi cần).
                </p>
              </div>
            </div>

            <div className="mt-2.5 p-2.5 rounded-lg bg-parchment-100 border border-parchment-300 text-[11px] text-lacquer/75 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Lưu ý: Bạn vào vai nhân vật đưa tin hư cấu để chứng kiến và góp sức nhỏ, không thay thế người chỉ huy lịch sử.
              </span>
            </div>
          </div>

          <button
            data-testid="start-adventure-submit"
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-bronze active:scale-95"
          >
            <span>Bước Vào Làng Ven Sông Bạch Đằng (938)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
