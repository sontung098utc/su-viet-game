import React from 'react';
import type { PortraitId, AvatarOutfit } from '../../types';

interface PortraitProps {
  portraitId: PortraitId;
  outfit?: AvatarOutfit;
  className?: string;
}

export const CharacterPortrait: React.FC<PortraitProps> = ({
  portraitId,
  outfit = 'brown',
  className = 'w-16 h-16',
}) => {
  const isIndigo = outfit === 'indigo';

  switch (portraitId) {
    case 'messenger':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="bgMessenger" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EBDDC1" />
              <stop offset="100%" stopColor="#CFA872" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="47" fill="url(#bgMessenger)" stroke="#6E4D25" strokeWidth="3" />
          {/* Áo giao lĩnh trẻ trung */}
          <path
            d="M20 92 C22 70 34 64 50 64 C66 64 78 70 80 92 Z"
            fill={isIndigo ? '#234B6E' : '#7C4D2B'}
            stroke="#2F1B12"
            strokeWidth="2"
          />
          {/* Cổ áo giao lĩnh vạt chéo */}
          <path d="M37 64 L52 84 L63 64" fill="none" stroke="#F5EFE1" strokeWidth="4" />
          <path d="M39 64 L52 82 L61 64" fill="none" stroke={isIndigo ? '#C99726' : '#9B1D20'} strokeWidth="2" />
          {/* Túi thư đeo chéo vai */}
          <path d="M30 68 L68 90" stroke="#D8B378" strokeWidth="5" strokeLinecap="round" />
          {/* Cổ và khuôn mặt */}
          <rect x="44" y="54" width="12" height="12" rx="4" fill="#F1C699" />
          <ellipse cx="50" cy="43" rx="18" ry="20" fill="#F6CFA5" stroke="#5C3A21" strokeWidth="2" />
          {/* Tóc và búi tóc */}
          <circle cx="50" cy="18" r="7" fill="#2A1B12" />
          <path d="M31 40 C30 24 40 20 50 20 C60 20 70 24 69 40 C64 32 36 32 31 40 Z" fill="#2A1B12" />
          {/* Khăn vấn trán truyền tin */}
          <path d="M31 33 Q50 29 69 33 L68 38 Q50 34 32 38 Z" fill={isIndigo ? '#C99726' : '#9B1D20'} />
          {/* Mắt, lông mày, miệng */}
          <path d="M38 39 Q42 37 45 39" fill="none" stroke="#2A1B12" strokeWidth="2" strokeLinecap="round" />
          <path d="M55 39 Q58 37 62 39" fill="none" stroke="#2A1B12" strokeWidth="2" strokeLinecap="round" />
          <circle cx="42" cy="43" r="2.4" fill="#1F120B" />
          <circle cx="58" cy="43" r="2.4" fill="#1F120B" />
          <circle cx="43" cy="42.2" r="0.8" fill="#FFFFFF" />
          <circle cx="59" cy="42.2" r="0.8" fill="#FFFFFF" />
          <path d="M46 52 Q50 55 54 52" fill="none" stroke="#8C4A32" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'elder':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#E6D5B8" stroke="#5C3A21" strokeWidth="3" />
          {/* Áo nâu trưởng thôn */}
          <path d="M18 92 C21 69 34 63 50 63 C66 63 79 69 82 92 Z" fill="#5C3D28" stroke="#2F1B12" strokeWidth="2" />
          <path d="M36 63 L50 85 L64 63" fill="none" stroke="#DEC59C" strokeWidth="4" />
          {/* Cổ & Mặt */}
          <ellipse cx="50" cy="43" rx="17" ry="20" fill="#ECC194" stroke="#5C3A21" strokeWidth="2" />
          {/* Búi tóc bạc & Khăn nâu */}
          <circle cx="50" cy="17" r="7" fill="#D9D4CC" stroke="#6E655F" strokeWidth="1.5" />
          <path d="M32 37 C32 23 40 20 50 20 C60 20 68 23 68 37 Z" fill="#E2DDD5" />
          <path d="M32 32 Q50 28 68 32 L68 37 Q50 33 32 37 Z" fill="#6E4D25" />
          {/* Nếp nhăn & Mắt hiền từ */}
          <path d="M37 38 Q42 36 45 38" fill="none" stroke="#B8B2A8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M55 38 Q58 36 63 38" fill="none" stroke="#B8B2A8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="42" cy="42" r="2" fill="#2A1B12" />
          <circle cx="58" cy="42" r="2" fill="#2A1B12" />
          {/* Chòm râu bạc */}
          <path d="M40 53 Q50 56 60 53 Q57 74 50 77 Q43 74 40 53 Z" fill="#EAE6DF" stroke="#8C847A" strokeWidth="1.5" />
        </svg>
      );

    case 'commander':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#DEC59C" stroke="#8B1E1E" strokeWidth="3" />
          {/* Giáp hộ tâm & Áo chiến */}
          <path d="M16 92 C19 67 33 62 50 62 C67 62 81 67 84 92 Z" fill="#7B1E1E" stroke="#2F1B12" strokeWidth="2" />
          <path d="M29 65 L71 65 L66 92 L34 92 Z" fill="#4A2F22" stroke="#C99726" strokeWidth="2" />
          {/* Đinh tán giáp đồng */}
          <circle cx="40" cy="73" r="2" fill="#C99726" />
          <circle cx="60" cy="73" r="2" fill="#C99726" />
          <circle cx="40" cy="83" r="2" fill="#C99726" />
          <circle cx="60" cy="83" r="2" fill="#C99726" />
          {/* Khuôn mặt cương nghị */}
          <ellipse cx="50" cy="43" rx="18" ry="20" fill="#E8B888" stroke="#4A2F22" strokeWidth="2" />
          {/* Mũ khăn quân sĩ viền đồng */}
          <path d="M30 35 C31 20 40 16 50 16 C60 16 69 20 70 35 Z" fill="#8B1E1E" stroke="#2F1B12" strokeWidth="2" />
          <rect x="44" y="27" width="12" height="7" rx="1" fill="#C99726" stroke="#2F1B12" strokeWidth="1" />
          {/* Lông mày kiếm & Râu ngắn */}
          <path d="M36 38 L46 40" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M64 38 L54 40" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="42" cy="43" r="2.3" fill="#1F120B" />
          <circle cx="58" cy="43" r="2.3" fill="#1F120B" />
          <path d="M42 52 Q50 50 58 52" fill="none" stroke="#2A1B12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 57 L54 57" stroke="#6E3B26" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'blacksmith':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#E6C594" stroke="#7C3F1D" strokeWidth="3" />
          {/* Vai vạm vỡ & Tạp dề da lò rèn */}
          <path d="M14 92 C17 66 32 61 50 61 C68 61 83 66 86 92 Z" fill="#A65E2E" stroke="#2F1B12" strokeWidth="2" />
          <path d="M30 63 L70 63 L73 92 L27 92 Z" fill="#3D2314" stroke="#1C0F0A" strokeWidth="2" />
          {/* Khuôn mặt rám nắng */}
          <ellipse cx="50" cy="42" rx="19" ry="20" fill="#D99B66" stroke="#4A2F22" strokeWidth="2" />
          {/* Khăn buộc đầu thợ rèn */}
          <path d="M30 34 C32 21 41 18 50 18 C59 18 68 21 70 34 Z" fill="#4A2F22" />
          <path d="M30 31 Q50 28 70 31 L70 36 Q50 33 30 36 Z" fill="#C43D38" />
          {/* Mắt & Râu quai nón */}
          <path d="M37 39 L45 39" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M55 39 L63 39" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="42" cy="43" r="2.3" fill="#1F120B" />
          <circle cx="58" cy="43" r="2.3" fill="#1F120B" />
          <path d="M35 48 Q50 65 65 48" fill="none" stroke="#2A1B12" strokeWidth="5" strokeLinecap="round" />
          <path d="M45 52 Q50 55 55 52" fill="none" stroke="#FAF4E6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'scout':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#D5EFF4" stroke="#1B637B" strokeWidth="3" />
          {/* Nón lá treo sau lưng */}
          <circle cx="50" cy="44" r="33" fill="#E5C99B" stroke="#8C6B38" strokeWidth="2" strokeDasharray="4 2" />
          {/* Áo chàm thủy quân */}
          <path d="M19 92 C22 69 34 63 50 63 C66 63 78 69 81 92 Z" fill="#184F63" stroke="#102F3B" strokeWidth="2" />
          <path d="M38 63 L50 82 L62 63" fill="none" stroke="#E0F2FE" strokeWidth="3.5" />
          {/* Khuôn mặt nhanh nhẹn */}
          <ellipse cx="50" cy="43" rx="17" ry="19" fill="#F0C090" stroke="#4A2F22" strokeWidth="2" />
          <path d="M32 36 C33 22 41 19 50 19 C59 19 67 22 68 36 Z" fill="#23170F" />
          <path d="M32 32 Q50 28 68 32 L68 36 Q50 32 32 36 Z" fill="#237B96" />
          <circle cx="42" cy="42" r="2.3" fill="#1F120B" />
          <circle cx="58" cy="42" r="2.3" fill="#1F120B" />
          <path d="M38 38 Q42 36 46 38" fill="none" stroke="#1F120B" strokeWidth="2" strokeLinecap="round" />
          <path d="M54 38 Q58 36 62 38" fill="none" stroke="#1F120B" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 51 Q50 54 55 51" fill="none" stroke="#7A3E26" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'boatman':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#DCECF2" stroke="#5C3A21" strokeWidth="3" />
          {/* Áo bà ba nâu sẫm vùng sông nước */}
          <path d="M18 92 C21 69 34 63 50 63 C66 63 79 69 82 92 Z" fill="#6E472B" stroke="#2F1B12" strokeWidth="2" />
          {/* Khăn rằn vắt vai */}
          <path d="M32 64 L42 90" stroke="#F5EFE1" strokeWidth="6" strokeDasharray="4 3" />
          <path d="M68 64 L58 90" stroke="#F5EFE1" strokeWidth="6" strokeDasharray="4 3" />
          {/* Khuôn mặt rám nắng chất phác */}
          <ellipse cx="50" cy="44" rx="17" ry="19" fill="#DF9E68" stroke="#4A2F22" strokeWidth="2" />
          {/* Nón lá chóp cổ truyền */}
          <polygon points="50,10 16,36 84,36" fill="#E4C692" stroke="#6E4D25" strokeWidth="2.2" />
          <line x1="50" y1="10" x2="34" y2="36" stroke="#A6824B" strokeWidth="1.2" />
          <line x1="50" y1="10" x2="66" y2="36" stroke="#A6824B" strokeWidth="1.2" />
          <circle cx="42" cy="44" r="2.2" fill="#1F120B" />
          <circle cx="58" cy="44" r="2.2" fill="#1F120B" />
          <path d="M44 53 Q50 57 56 53" fill="none" stroke="#5C2E1B" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'ngo_quyen':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#F5E1A4" stroke="#9B1D20" strokeWidth="3.5" />
          {/* Áo bào đỏ son & Giáp vàng */}
          <path d="M14 92 C18 65 32 60 50 60 C68 60 82 65 86 92 Z" fill="#9B1D20" stroke="#2F1B12" strokeWidth="2" />
          <path d="M31 62 L69 62 L65 92 L35 92 Z" fill="#C99726" stroke="#5C3A21" strokeWidth="2" />
          {/* Khuôn mặt uy nghi */}
          <ellipse cx="50" cy="43" rx="18" ry="19" fill="#ECC092" stroke="#4A2F22" strokeWidth="2" />
          {/* Mũ Đâu Mâu chủ soái */}
          <path d="M29 35 C30 18 40 13 50 13 C60 13 70 18 71 35 Z" fill="#C99726" stroke="#5C3A21" strokeWidth="2" />
          <polygon points="50,4 46,15 54,15" fill="#9B1D20" />
          <path d="M36 38 L46 40" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M64 38 L54 40" stroke="#1F120B" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="42" cy="43" r="2.4" fill="#1F120B" />
          <circle cx="58" cy="43" r="2.4" fill="#1F120B" />
          {/* Râu ba chòm uy phong */}
          <path d="M41 51 Q50 53 59 51" fill="none" stroke="#1F120B" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="48,55 52,55 50,67" fill="#1F120B" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="47" fill="#EBDDC1" stroke="#6E4D25" strokeWidth="3" />
          <path d="M20 92 C23 70 35 64 50 64 C65 64 77 70 80 92 Z" fill="#6E4D25" stroke="#2F1B12" strokeWidth="2" />
          <ellipse cx="50" cy="43" rx="17" ry="19" fill="#ECC092" stroke="#4A2F22" strokeWidth="2" />
          <path d="M32 36 C33 22 41 19 50 19 C59 19 67 22 68 36 Z" fill="#2A1B12" />
          <circle cx="42" cy="43" r="2.2" fill="#1F120B" />
          <circle cx="58" cy="43" r="2.2" fill="#1F120B" />
          <path d="M45 52 Q50 55 55 52" fill="none" stroke="#7A3E26" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
