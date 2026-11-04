import React from 'react';
import type { UserAchievement, AchievementTier } from '../../types';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AchievementSealProps {
  achievement: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export const AchievementSeal: React.FC<AchievementSealProps> = ({
  achievement,
  size = 'md',
  showDetails = true,
  onClick,
  isSelected = false,
}) => {
  const { isUnlocked, tier, iconType, title, sealName, progressLabel } = achievement;

  const getTierColors = (t: AchievementTier, unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: '#3A2E26',
        border: '#5C4A3E',
        glow: 'rgba(92, 74, 62, 0.2)',
        primary: '#8C7767',
        accent: '#5C4A3E',
        stamp: '#736152',
        ribbon: '#4A3B31',
        text: 'text-stone-400',
      };
    }
    switch (t) {
      case 'gold':
        return {
          bg: 'radial-gradient(circle, #523719 0%, #2A170A 100%)',
          border: '#D4AF37',
          glow: 'rgba(212, 175, 55, 0.45)',
          primary: '#F5D77F',
          accent: '#B8860B',
          stamp: '#9B1D20',
          ribbon: '#9B1D20',
          text: 'text-amber-300',
        };
      case 'silver':
        return {
          bg: 'radial-gradient(circle, #334155 0%, #1E293B 100%)',
          border: '#E2E8F0',
          glow: 'rgba(226, 232, 240, 0.35)',
          primary: '#F8FAFC',
          accent: '#94A3B8',
          stamp: '#1E3A8A',
          ribbon: '#1E3A8A',
          text: 'text-slate-200',
        };
      case 'jade':
        return {
          bg: 'radial-gradient(circle, #064E3B 0%, #022C22 100%)',
          border: '#10B981',
          glow: 'rgba(16, 185, 129, 0.4)',
          primary: '#6EE7B7',
          accent: '#059669',
          stamp: '#047857',
          ribbon: '#047857',
          text: 'text-emerald-300',
        };
      case 'bronze':
      default:
        return {
          bg: 'radial-gradient(circle, #452414 0%, #261208 100%)',
          border: '#CD7F32',
          glow: 'rgba(205, 127, 50, 0.35)',
          primary: '#FDBA74',
          accent: '#9A3412',
          stamp: '#9B1D20',
          ribbon: '#7C2D12',
          text: 'text-amber-200',
        };
    }
  };

  const colors = getTierColors(tier, isUnlocked);

  // SVG Iconographic Center Emblem for Dong Son styled Seal
  const renderEmblem = () => {
    switch (iconType) {
      case 'speed':
        // Chim Lạc sải cánh & Mũi tên thần tốc
        return (
          <g>
            {/* Cánh chim vươn dài */}
            <path
              d="M 50 24 C 62 34 76 38 88 32 C 80 44 68 48 50 48 C 32 48 20 44 12 32 C 24 38 38 34 50 24 Z"
              fill={colors.primary}
              opacity={isUnlocked ? '0.95' : '0.4'}
            />
            {/* Thân & Mỏ chim */}
            <path
              d="M 50 22 L 53 38 L 47 38 Z"
              fill={colors.accent}
            />
            {/* Tia chớp / ngọn gió tốc hành */}
            <path
              d="M 48 44 L 54 54 L 46 56 L 52 74 L 42 60 L 48 58 Z"
              fill={isUnlocked ? '#FACC15' : colors.primary}
            />
          </g>
        );

      case 'cipher':
        // Ổ khóa đồng cổ & Cuộn mật thư khắc chữ
        return (
          <g>
            {/* Vòng quai khóa đồng */}
            <path
              d="M 38 46 L 38 34 C 38 27 62 27 62 34 L 62 46"
              stroke={colors.primary}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Thân khóa triện vuông/bát giác */}
            <rect
              x="30"
              y="44"
              width="40"
              height="32"
              rx="6"
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth="2.5"
            />
            {/* Lỗ khóa chữ Cổ */}
            <circle cx="50" cy="56" r="4" fill={isUnlocked ? '#FACC15' : '#1C1917'} />
            <polygon points="48,58 52,58 54,68 46,68" fill={isUnlocked ? '#FACC15' : '#1C1917'} />
          </g>
        );

      case 'secret':
        // Rùa thần Kim Quy / Miếu cổ bí mật
        return (
          <g>
            {/* Mai rùa lục giác */}
            <polygon
              points="50,28 68,38 68,62 50,72 32,62 32,38"
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth="3"
            />
            {/* Hoa văn tâm mai */}
            <polygon
              points="50,38 60,44 60,56 50,62 40,56 40,44"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
            />
            {/* Đầu & 4 chân rùa */}
            <circle cx="50" cy="22" r="5" fill={colors.primary} />
            <circle cx="28" cy="34" r="3.5" fill={colors.primary} />
            <circle cx="72" cy="34" r="3.5" fill={colors.primary} />
            <circle cx="28" cy="66" r="3.5" fill={colors.primary} />
            <circle cx="72" cy="66" r="3.5" fill={colors.primary} />
          </g>
        );

      case 'accuracy':
        // Bia ngực tên đồng trúng hồng tâm
        return (
          <g>
            <circle cx="50" cy="50" r="24" stroke={colors.accent} strokeWidth="3" fill="none" />
            <circle cx="50" cy="50" r="15" stroke={colors.primary} strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="50" r="6" fill={isUnlocked ? '#EF4444' : colors.primary} />
            {/* Mũi tên ba cạnh Đông Sơn xuyên tâm */}
            <line x1="20" y1="80" x2="46" y2="54" stroke={colors.primary} strokeWidth="3" />
            <polygon points="50,50 42,54 46,58" fill={colors.primary} />
            {/* Đuôi tên lông chim */}
            <polygon points="18,82 14,86 24,84" fill={colors.accent} />
          </g>
        );

      case 'clues':
        // Bản đồ da thuộc & Kính hoa soi dấu
        return (
          <g>
            <rect
              x="26"
              y="28"
              width="48"
              height="44"
              rx="4"
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth="2.5"
            />
            {/* Nếp gập bản đồ & đường hải trình */}
            <path d="M 34 38 Q 50 48 66 38" stroke={colors.primary} strokeWidth="2" fill="none" />
            <path d="M 40 58 Q 50 50 60 58" stroke={colors.primary} strokeWidth="2" fill="none" />
            <circle cx="48" cy="46" r="3.5" fill={isUnlocked ? '#FACC15' : '#1C1917'} />
          </g>
        );

      case 'codex':
        // Cuộn thư sử thiêng liêng
        return (
          <g>
            <path
              d="M 28 32 C 28 26 40 26 50 30 C 60 26 72 26 72 32 L 72 68 C 72 74 60 74 50 70 C 40 74 28 74 28 68 Z"
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth="2.5"
            />
            <line x1="50" y1="30" x2="50" y2="70" stroke={colors.primary} strokeWidth="2" />
            {/* Hàng chữ thư tịch */}
            <line x1="34" y1="42" x2="44" y2="42" stroke={colors.primary} strokeWidth="1.5" />
            <line x1="34" y1="50" x2="44" y2="50" stroke={colors.primary} strokeWidth="1.5" />
            <line x1="56" y1="42" x2="66" y2="42" stroke={colors.primary} strokeWidth="1.5" />
            <line x1="56" y1="50" x2="66" y2="50" stroke={colors.primary} strokeWidth="1.5" />
          </g>
        );

      case 'recap':
      default:
        // Cờ hiệu chiến thắng Bạch Đằng & Trống đồng
        return (
          <g>
            {/* Mặt trời 12 tia Đông Sơn */}
            <circle cx="50" cy="50" r="10" fill={isUnlocked ? '#F59E0B' : colors.accent} />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="50"
                x2={50 + 22 * Math.cos((deg * Math.PI) / 180)}
                y2={50 + 22 * Math.sin((deg * Math.PI) / 180)}
                stroke={colors.primary}
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            <circle cx="50" cy="50" r="18" stroke={colors.primary} strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
          </g>
        );
    }
  };

  const dimensionClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'bg-amber-100/90 ring-2 ring-crimson border-2 border-bronze scale-[1.02] shadow-lg'
          : 'bg-parchment-50/80 border border-parchment-300 hover:border-bronze hover:bg-parchment-100/80 hover:shadow-md'
      }`}
    >
      {/* Khung Huân Chương / Triện Ấn Cổ */}
      <div className="relative flex items-center justify-center">
        {/* Vòng hào quang nếu đã mở khóa */}
        {isUnlocked && (
          <div
            className="absolute inset-0 rounded-full blur-md opacity-60 animate-pulse-glow"
            style={{ backgroundColor: colors.glow }}
          />
        )}

        <svg
          viewBox="0 0 100 100"
          className={`${dimensionClasses} relative transition-transform duration-300 group-hover:scale-105`}
        >
          <defs>
            {/* Vòng nền gradient */}
            <radialGradient id={`seal-bg-${achievement.id}`} cx="50%" cy="50%" r="50%">
              {tier === 'gold' && (
                <>
                  <stop offset="0%" stopColor={isUnlocked ? '#613E1B' : '#33241A'} />
                  <stop offset="70%" stopColor={isUnlocked ? '#381C09' : '#21150F'} />
                  <stop offset="100%" stopColor={isUnlocked ? '#1A0D04' : '#140D09'} />
                </>
              )}
              {tier === 'silver' && (
                <>
                  <stop offset="0%" stopColor={isUnlocked ? '#475569' : '#28313D'} />
                  <stop offset="100%" stopColor={isUnlocked ? '#1E293B' : '#151A21'} />
                </>
              )}
              {tier === 'jade' && (
                <>
                  <stop offset="0%" stopColor={isUnlocked ? '#065F46' : '#1E3B32'} />
                  <stop offset="100%" stopColor={isUnlocked ? '#022C22' : '#0F211C'} />
                </>
              )}
              {tier === 'bronze' && (
                <>
                  <stop offset="0%" stopColor={isUnlocked ? '#572E15' : '#362013'} />
                  <stop offset="100%" stopColor={isUnlocked ? '#2A1307' : '#1F120A'} />
                </>
              )}
            </radialGradient>
          </defs>

          {/* Vòng ngoài cùng hoa văn răng cưa trống đồng */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill={`url(#seal-bg-${achievement.id})`}
            stroke={colors.border}
            strokeWidth={isUnlocked ? '3' : '2'}
          />

          {/* Hàng đinh tán hoặc chấm tròn cổ */}
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="none"
            stroke={colors.accent}
            strokeWidth="1.5"
            strokeDasharray={isUnlocked ? '2 3' : '1 4'}
          />

          {/* Vòng tròn gân trong */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke={colors.border}
            strokeWidth="1.2"
          />

          {/* Biểu tượng nội dung trung tâm */}
          {renderEmblem()}

          {/* Dấu triện son đỏ (Vermilion seal stamp mark) đóng đè nếu đã mở khóa */}
          {isUnlocked ? (
            <g transform="translate(62, 60) rotate(-12)">
              <rect
                x="0"
                y="0"
                width="26"
                height="26"
                rx="4"
                fill="#9B1D20"
                stroke="#FDE047"
                strokeWidth="1.2"
                opacity="0.95"
              />
              <text
                x="13"
                y="17"
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#FFFFFF"
                fontFamily="serif"
              >
                ẤN
              </text>
            </g>
          ) : (
            /* Biểu tượng ổ khóa mờ nếu chưa mở */
            <g transform="translate(64, 62)">
              <circle cx="10" cy="10" r="10" fill="#292524" stroke="#78716C" strokeWidth="1" />
              <path
                d="M 7 11 L 7 8 C 7 6 13 6 13 8 L 13 11"
                fill="none"
                stroke="#A8A29E"
                strokeWidth="1.2"
              />
              <rect x="5.5" y="10.5" width="9" height="7" rx="1.5" fill="#57534E" />
            </g>
          )}
        </svg>

        {/* Huy hiệu hạng (Tier badge tag) */}
        <div className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm flex items-center gap-1 bg-parchment-50 text-lacquer border-bronze">
          {isUnlocked ? (
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
          ) : (
            <Lock className="w-2.5 h-2.5 text-stone-500" />
          )}
          <span>
            {tier === 'gold' && 'Hoàng Kim'}
            {tier === 'silver' && 'Bạch Ngân'}
            {tier === 'jade' && 'Huyền Ngọc'}
            {tier === 'bronze' && 'Đồng Cổ'}
          </span>
        </div>
      </div>

      {/* Thông tin văn bản */}
      {showDetails && (
        <div className="mt-4 w-full">
          <div className="text-[11px] font-serif uppercase tracking-wider text-bronze-dark font-semibold">
            {sealName}
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-lacquer mt-0.5 line-clamp-1">
            {title}
          </h4>

          {/* Tiến độ hoặc Trạng thái */}
          <div className="mt-1.5">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã khắc ấn</span>
              </span>
            ) : (
              <div className="text-[11px] text-lacquer/70 font-mono tabular-nums">
                {progressLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
