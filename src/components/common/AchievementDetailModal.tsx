import React from 'react';
import type { UserAchievement } from '../../types';
import { AchievementSeal } from './AchievementSeal';
import { X, Award, CheckCircle2, Lock, Scroll, Sparkles } from 'lucide-react';

interface AchievementDetailModalProps {
  achievement: UserAchievement | null;
  onClose: () => void;
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  onClose,
}) => {
  if (!achievement) return null;

  const { isUnlocked, title, subtitle, sealName, tier, description, loreContext, targetCriteria, progressLabel } = achievement;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-lacquer-dark/80 backdrop-blur-sm animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="bg-parchment-50 w-full max-w-lg rounded-3xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh tiêu đề */}
        <div className="bg-parchment-200 border-b border-parchment-300 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-crimson" />
            <h3 className="font-title font-bold text-base sm:text-lg text-lacquer">
              Bảo Vật & Ấn Tín Chiến Công
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-parchment-300 text-lacquer transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Huy chương / Triện ấn phóng to */}
          <div className="flex flex-col items-center justify-center pt-2">
            <AchievementSeal
              achievement={achievement}
              size="lg"
              showDetails={false}
              isSelected={false}
            />

            <div className="mt-4 text-center">
              <span className="text-xs font-serif uppercase tracking-widest text-bronze-dark font-bold">
                {sealName}
              </span>
              <h2 className="font-title text-xl sm:text-2xl font-black text-lacquer mt-1">
                {title}
              </h2>
              <p className="text-xs text-lacquer/75 font-medium mt-0.5">
                {subtitle}
              </p>
            </div>

            {/* Trạng thái xác nhận ấn */}
            <div className="mt-3">
              {isUnlocked ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>ĐÃ CHÍNH THỨC KHẮC ẤN VÀO SỬ KÝ</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>CHƯA MỞ KHÓA ẤN TÍN NÀY</span>
                </div>
              )}
            </div>
          </div>

          {/* Tiêu chí & Tiến độ */}
          <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lacquer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-crimson" />
                <span>Mục tiêu thử thách:</span>
              </span>
              <span className="font-bold text-crimson font-serif">{targetCriteria}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-parchment-200">
              <span className="text-lacquer/80">Chiến tích của bạn:</span>
              <span className="font-mono font-bold text-lacquer tabular-nums">
                {progressLabel}
              </span>
            </div>
            <p className="text-lacquer/85 leading-relaxed pt-1">{description}</p>
          </div>

          {/* Bối cảnh quân sự & Sử liệu thời Ngô Quyền */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-bronze/40 space-y-1.5">
            <h4 className="font-title font-bold text-xs text-bronze-dark uppercase tracking-wider flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-crimson" />
              <span>Bối Cảnh Lịch Sử Năm 938</span>
            </h4>
            <p className="text-xs text-lacquer/85 italic leading-relaxed">
              “{loreContext}”
            </p>
          </div>

          {/* Phẩm hàm huân chương */}
          <div className="text-[11px] text-lacquer/70 text-center">
            Hạng ấn: <strong className="capitalize">{tier === 'gold' ? 'Hoàng Kim (Vàng)' : tier === 'silver' ? 'Bạch Ngân (Bạc)' : tier === 'jade' ? 'Huyền Ngọc (Bích)' : 'Đồng Cổ (Thau)'}</strong> · Ghi danh trong Biên niên sử Bạch Đằng
          </div>

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm shadow border border-bronze transition-transform active:scale-98"
          >
            Trở về Bảng Thành Tựu
          </button>
        </div>
      </div>
    </div>
  );
};
