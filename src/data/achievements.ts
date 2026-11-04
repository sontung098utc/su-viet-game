import type {
  AchievementDefinition,
  UserAchievement,
  UserProgress,
} from '../types';

export const ACHIEVEMENTS_CATALOG: AchievementDefinition[] = [
  {
    id: 'ACH_SPEED_GOLD',
    title: 'Bạch Đằng Thần Tốc',
    subtitle: 'Kỷ Lục Hoàn Thành Thần Hành',
    sealName: 'Ấn Triện Thần Hành',
    category: 'speed',
    tier: 'gold',
    iconType: 'speed',
    description: 'Hoàn thành chiến dịch Bạch Đằng năm 938 trong thời gian thần tốc (dưới 5 phút).',
    loreContext:
      'Quân lệnh của Ngô Quyền đòi hỏi tin tức từ bến sông truyền về đại bản doanh phải nhanh như tên bay trước khi thủy triều đổi dòng.',
    targetCriteria: 'Thời gian hoàn thành < 05:00',
  },
  {
    id: 'ACH_SPEED_SILVER',
    title: 'Phi Mã Truyền Thư',
    subtitle: 'Nhanh Nhạy Vượt Gian Nan',
    sealName: 'Binh Phù Tốc Hành',
    category: 'speed',
    tier: 'silver',
    iconType: 'speed',
    description: 'Hoàn thành chuyến đưa tin và bố phòng trận địa trong vòng dưới 10 phút.',
    loreContext:
      'Băng qua đồng ruộng làng xóm và bãi bồi sình lầy để chuyển kịp than củi, đai sắt ra bến sông trước giờ xuất kích.',
    targetCriteria: 'Thời gian hoàn thành < 10:00',
  },
  {
    id: 'ACH_CIPHER_MASTER',
    title: 'Kỳ Mưu Giải Mật',
    subtitle: 'Bậc Thầy Giải Mã Quân Cơ',
    sealName: 'Hoàng Kim Bảo Triện',
    category: 'puzzle',
    tier: 'gold',
    iconType: 'cipher',
    description: 'Giải trọn vẹn cả 3 mật mã quân cơ: Chiếu Thư Làng Ven Sông, Hòm Cơ Mật 938 và Trận Đồ Thủy Triều.',
    loreContext:
      'Nắm vững toàn bộ mưu lược: mật ước dân làng, quy cách cọc bịt sắt của lò rèn, và quy luật con nước triều dâng ngập - rút lộ cọc.',
    targetCriteria: 'Giải 3/3 mật mã quân cơ chính',
  },
  {
    id: 'ACH_CIPHER_SCHOLAR',
    title: 'Thấu Đạt Mật Tín',
    subtitle: 'Trí Dũng Khai Thông Mật Thư',
    sealName: 'Bạch Ngân Bảo Ấn',
    category: 'puzzle',
    tier: 'silver',
    iconType: 'cipher',
    description: 'Giải thành công ít nhất 2 câu đố mật mã trên hành trình.',
    loreContext:
      'Góp phần giải tỏa những gút thắt thông tin cơ mật, giúp nghĩa quân và dân làng đồng lòng phối hợp.',
    targetCriteria: 'Giải từ 2 câu đố mật mã trở lên',
  },
  {
    id: 'ACH_SECRET_CIPHER',
    title: 'Tuyệt Mật Cổ Thư',
    subtitle: 'Khai Mở Cơ Mật Giấu Kín',
    sealName: 'Huyền Ngọc Triện Ấn',
    category: 'secret',
    tier: 'jade',
    iconType: 'secret',
    description: 'Khám phá và giải thành công ít nhất 1 Mật thư bí ẩn giấu kín (Giếng Cổ, Miếu Cổ Cây Đa, Bến Đò Bác Năm).',
    loreContext:
      'Tìm thấy lời căn dặn sâu xa của tiền nhân được giấu kín trong kẽ đá và ống tre lưu truyền hào khí chống giặc ngoại xâm.',
    targetCriteria: 'Giải ít nhất 1 mật thư cổ ẩn',
  },
  {
    id: 'ACH_PERFECT_INVESTIGATION',
    title: 'Bách Toàn Bách Thắng',
    subtitle: 'Mưu Lược Tuyệt Không Sơ Suất',
    sealName: 'Ấn Triện Hoàng Đế',
    category: 'puzzle',
    tier: 'gold',
    iconType: 'accuracy',
    description: 'Vượt qua cả 3 Thử thách hiện trường (A: Điểm hẹn, B: Chọn cọc bịt sắt, C: Phất cờ phản công) mà không chọn nhầm lần nào.',
    loreContext:
      'Như lời sử thần Ngô Sĩ Liên ca ngợi trong Toàn Thư: "Ngô Quyền liệu việc như thần, giết Kiều Công Tiễn, phá Hoằng Tháo, bảo vệ vững chắc non sông."',
    targetCriteria: 'Đạt chuẩn 3/3 thử thách ngay lần đầu (0 lần sai)',
  },
  {
    id: 'ACH_ALL_CLUES',
    title: 'Vạn Lý Tầm Thư',
    subtitle: 'Thu Thập Trọn Vẹn Dấu Tích',
    sealName: 'Bạch Ngân Binh Phù',
    category: 'secret',
    tier: 'silver',
    iconType: 'clues',
    description: 'Tìm kiếm và thu thập đủ 9/9 manh mối hiện vật và mật thư trên bản đồ 2D.',
    loreContext:
      'Mỗi mảnh bằng chứng từ dải lụa đỏ, vạt cọc gỗ, đai sắt đến cột mốc đá đều là chứng tích sống động về công cuộc chuẩn bị đại thắng Bạch Đằng.',
    targetCriteria: 'Thu thập đủ 9/9 manh mối & mật thư',
  },
  {
    id: 'ACH_HISTORICAL_CODEX',
    title: 'Bác Cổ Thông Kim',
    subtitle: 'Khai Mở Kho Tàng Sử Ký',
    sealName: 'Ấn Triện Sử Quan',
    category: 'mastery',
    tier: 'bronze',
    iconType: 'codex',
    description: 'Khám phá các trang tư liệu lịch sử xác thực trong Sổ Tay Sử Việt và nắm vững ba bài học năm 938.',
    loreContext:
      'Hiểu rõ ranh giới giữa tư liệu chính sử (Toàn Thư, Cương Mục) và những tình tiết mô phỏng tương tác nhập vai.',
    targetCriteria: 'Mở khóa 3 sự kiện sử liệu xác thực',
  },
  {
    id: 'ACH_CHRONICLER_RECAP',
    title: 'Đại Định Giang Sơn',
    subtitle: 'Kim Khánh Hoàng Triều Bạch Đằng',
    sealName: 'Kim Khánh Hoàng Triều',
    category: 'mastery',
    tier: 'gold',
    iconType: 'recap',
    description: 'Sắp xếp chuẩn xác toàn bộ 3 bức tranh kể lại diễn biến lịch sử năm 938 trên màn hình tổng kết.',
    loreContext:
      'Ghi danh chiến công chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc Việt Nam.',
    targetCriteria: 'Sắp xếp đúng thứ tự tranh lịch sử',
  },
];

export const formatDuration = (totalSeconds: number): string => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export interface SpeedRating {
  rank: 'S' | 'A' | 'B' | 'C';
  title: string;
  badgeColor: string;
  description: string;
}

export const getSpeedRating = (seconds: number): SpeedRating => {
  if (seconds <= 300) {
    return {
      rank: 'S',
      title: 'Thần Tốc Báo Tiệp',
      badgeColor: 'text-amber-700 bg-amber-100 border-amber-400',
      description: 'Phản ứng chớp nhoáng, truyền tin như gió thoảng!',
    };
  }
  if (seconds <= 480) {
    return {
      rank: 'A',
      title: 'Thần Hành Xuất Sắc',
      badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-400',
      description: 'Nhanh nhẹn, phán đoán sắc bén và kịp thời!',
    };
  }
  if (seconds <= 720) {
    return {
      rank: 'B',
      title: 'Kiên Cường Vững Dạ',
      badgeColor: 'text-blue-700 bg-blue-100 border-blue-400',
      description: 'Vượt qua mọi thử thách với lòng quả cảm bền bỉ.',
    };
  }
  return {
    rank: 'C',
    title: 'Điềm Đạm Chu Đáo',
    badgeColor: 'text-stone-700 bg-stone-100 border-stone-400',
    description: 'Cẩn trọng tìm tòi từng chi tiết lịch sử quý giá.',
  };
};

/**
 * Đánh giá trạng thái từng thành tựu dựa trên dữ liệu người chơi và thời gian chơi thực tế
 */
export const evaluateAchievements = (
  progress: UserProgress,
  effectiveTimeSeconds: number
): UserAchievement[] => {
  const solved = progress.solvedCiphers || [];
  const clues = progress.collectedClues || [];
  const facts = progress.discoveredFacts || [];
  const attempts = progress.challengeAttempts || { A: 0, B: 0, C: 0 };

  const totalWrongAttempts =
    Math.max(0, (attempts.A || 0) - 1) +
    Math.max(0, (attempts.B || 0) - 1) +
    Math.max(0, (attempts.C || 0) - 1);

  const coreCiphers = ['CIPHER_VILLAGE_SCROLL', 'CIPHER_CAMP_CHEST', 'CIPHER_TIDE_STELE'];
  const solvedCoreCount = coreCiphers.filter((id) => solved.includes(id as any)).length;

  const secretCiphers = ['CIPHER_SECRET_WELL', 'CIPHER_SECRET_SHRINE', 'CIPHER_SECRET_PITCH'];
  const solvedSecretCount = secretCiphers.filter((id) => solved.includes(id as any)).length;

  return ACHIEVEMENTS_CATALOG.map((def) => {
    switch (def.id) {
      case 'ACH_SPEED_GOLD': {
        const isUnlocked = effectiveTimeSeconds > 0 && effectiveTimeSeconds <= 300;
        return {
          ...def,
          isUnlocked,
          progressCurrent: effectiveTimeSeconds,
          progressMax: 300,
          progressLabel: `${formatDuration(effectiveTimeSeconds)} / < 05:00`,
        };
      }
      case 'ACH_SPEED_SILVER': {
        const isUnlocked = effectiveTimeSeconds > 0 && effectiveTimeSeconds <= 600;
        return {
          ...def,
          isUnlocked,
          progressCurrent: effectiveTimeSeconds,
          progressMax: 600,
          progressLabel: `${formatDuration(effectiveTimeSeconds)} / < 10:00`,
        };
      }
      case 'ACH_CIPHER_MASTER': {
        const isUnlocked = solvedCoreCount >= 3;
        return {
          ...def,
          isUnlocked,
          progressCurrent: solvedCoreCount,
          progressMax: 3,
          progressLabel: `${solvedCoreCount}/3 Mật mã chính`,
        };
      }
      case 'ACH_CIPHER_SCHOLAR': {
        const totalSolved = solved.length;
        const isUnlocked = totalSolved >= 2;
        return {
          ...def,
          isUnlocked,
          progressCurrent: Math.min(2, totalSolved),
          progressMax: 2,
          progressLabel: `${totalSolved}/2 Mật mã`,
        };
      }
      case 'ACH_SECRET_CIPHER': {
        const isUnlocked = solvedSecretCount >= 1;
        return {
          ...def,
          isUnlocked,
          progressCurrent: solvedSecretCount,
          progressMax: 1,
          progressLabel: `${solvedSecretCount}/1 Mật thư ẩn`,
        };
      }
      case 'ACH_PERFECT_INVESTIGATION': {
        // Chỉ đạt khi đã hoàn thành hoặc đang ở màn tóm tắt và không mắc lỗi thử thách
        const isCompleted = progress.questStage === 'STAGE_8_CLIMAX_SIGNAL' || progress.questStage === 'STAGE_9_COMPLETED' || progress.chapter1Completed;
        const isUnlocked = isCompleted && totalWrongAttempts === 0;
        return {
          ...def,
          isUnlocked,
          progressCurrent: isUnlocked ? 3 : Math.max(0, 3 - totalWrongAttempts),
          progressMax: 3,
          progressLabel: totalWrongAttempts === 0 ? 'Hoàn hảo (0 lần sai)' : `${totalWrongAttempts} lần chọn sai`,
        };
      }
      case 'ACH_ALL_CLUES': {
        const isUnlocked = clues.length >= 9;
        return {
          ...def,
          isUnlocked,
          progressCurrent: clues.length,
          progressMax: 9,
          progressLabel: `${clues.length}/9 Manh mối & Mật thư`,
        };
      }
      case 'ACH_HISTORICAL_CODEX': {
        // Có 3 sự kiện sử liệu xác thực chính
        const verifiedFacts = facts.filter((f) => f.startsWith('fact-'));
        const count = Math.min(3, verifiedFacts.length);
        const isUnlocked = count >= 3;
        return {
          ...def,
          isUnlocked,
          progressCurrent: count,
          progressMax: 3,
          progressLabel: `${count}/3 Sự kiện xác thực`,
        };
      }
      case 'ACH_CHRONICLER_RECAP': {
        const isUnlocked = Boolean(progress.completedRecapOrder);
        return {
          ...def,
          isUnlocked,
          progressCurrent: isUnlocked ? 1 : 0,
          progressMax: 1,
          progressLabel: isUnlocked ? 'Đã sắp xếp đúng 3 chặng' : 'Chưa xếp tranh',
        };
      }
      default:
        return {
          ...def,
          isUnlocked: false,
          progressCurrent: 0,
          progressMax: 1,
          progressLabel: '0/1',
        };
    }
  });
};
