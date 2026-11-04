import type {
  DailyMission,
  DailyMissionsState,
  ScholarRank,
  DailyExplorationTarget,
} from '../types';

export const SCHOLAR_RANKS: ScholarRank[] = [
  {
    id: 'SI_TU',
    title: 'Sĩ Tử',
    minPoints: 0,
    nextPoints: 100,
    badge: 'Mực Nghiên Khởi Đầu',
    hatIcon: 'Mũ Vải',
    description: 'Người mới bước chân vào chốn nghiên bút, bắt đầu tìm hiểu sử tích non sông.',
    historicalNote: 'Sĩ tử là cách gọi chung học trò xưa dùi mài kinh sử chuẩn bị thi cử.',
  },
  {
    id: 'TU_TAI',
    title: 'Tú Tài',
    minPoints: 100,
    nextPoints: 250,
    badge: 'Hương Thí Đỗ Đạt',
    hatIcon: 'Mũ Tú Tài',
    description: 'Đã thông thuộc các triều đại và chiến công lớn, nắm vững sử lược nước nhà.',
    historicalNote: 'Tú tài là học vị dành cho người đỗ khoa thi Hương ở các phủ, huyện xưa.',
  },
  {
    id: 'CU_NHAN',
    title: 'Cử Nhân',
    minPoints: 250,
    nextPoints: 500,
    badge: 'Quốc Tử Giám Ghi Tên',
    hatIcon: 'Mũ Cử Nhân',
    description: 'Tài năng xuất chúng, am hiểu thấu đáo binh thư, chiến địa và niên biểu lịch sử.',
    historicalNote: 'Cử nhân được vào học Quốc Tử Giám - trường đại học quốc gia đầu tiên lập năm 1076.',
  },
  {
    id: 'TIEN_SI',
    title: 'Tiến Sĩ',
    minPoints: 500,
    nextPoints: 850,
    badge: 'Bia Đá Khắc Tên',
    hatIcon: 'Mũ Cánh Chuồn Đồng',
    description: 'Bậc đại khoa hiểu sâu ngọn nguồn biến cố lịch sử, giải mã mọi huyền cơ trận đồ.',
    historicalNote: 'Tên tuổi Tiến sĩ được khắc trên bia rùa đá Văn Miếu để lưu danh muôn đời.',
  },
  {
    id: 'BANG_NHAN',
    title: 'Bảng Nhãn',
    minPoints: 850,
    nextPoints: 1300,
    badge: 'Tam Khôi Triều Đình',
    hatIcon: 'Mũ Cánh Chuồn Mạ Bạc',
    description: 'Học vấn uyên bác bậc nhì thiên hạ, thấu suốt quân mưu và khảo cổ học nước nhà.',
    historicalNote: 'Bảng nhãn là danh vị đỗ thứ nhì trong kỳ thi Đình (sau Trạng nguyên).',
  },
  {
    id: 'TRANG_NGUYEN',
    title: 'Trạng Nguyên',
    minPoints: 1300,
    nextPoints: null,
    badge: 'Ngựa Chàng Về Vinh Quy',
    hatIcon: 'Mũ Cánh Chuồn Dát Vàng',
    description: 'Bậc tột đỉnh kỳ tài sử Việt, am tường quá khứ vị lai, vinh quy bái tổ nghìn năm.',
    historicalNote: 'Trạng nguyên là danh vị cao quý nhất trong hệ thống khoa cử phong kiến Việt Nam.',
  },
];

export function getScholarRank(points: number): ScholarRank {
  const safePoints = Math.max(0, points || 0);
  for (let i = SCHOLAR_RANKS.length - 1; i >= 0; i--) {
    if (safePoints >= SCHOLAR_RANKS[i].minPoints) {
      return SCHOLAR_RANKS[i];
    }
  }
  return SCHOLAR_RANKS[0];
}

export interface TriviaQuestion {
  id: string;
  category: string;
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
  explanation: string;
  hint: string;
}

export const TRIVIA_POOL: TriviaQuestion[] = [
  {
    id: 'triv_bachdang_tide',
    category: 'Bạch Đằng 938',
    title: 'Quy luật Thủy Triều',
    question: 'Ngô Quyền đã tận dụng quy luật tự nhiên nào của sông Bạch Đằng để đánh bại quân Nam Hán?',
    options: [
      'Nước triều lên ngập bãi cọc nhử thuyền vào, nước ròng hạ thấp cọc đâm thủng thuyền',
      'Lũ quét đầu nguồn đổ về làm chìm chiến thuyền địch',
      'Gió mùa đông bắc tạo sóng lớn lật úp thuyền địch',
      'Sương mù dày đặc để đánh phục kích ban đêm',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Sông Bạch Đằng có biên độ triều rất lớn (lên tới gần 4 mét). Ngô Quyền cho đóng cọc ngầm bịt sắt, lúc triều dâng nhử địch vượt qua, khi nước ròng rút nhanh bãi cọc nhô lên chặn đường và xé nát thuyền chiến Nam Hán.',
    hint: 'Hãy nhớ lại dấu cọc và dấu mực nước tại Bến Thuyền.',
  },
  {
    id: 'triv_coloan_rings',
    category: 'Cổ Loa Thành',
    title: 'Kiến Trúc Thành Cổ Loa',
    question: 'Thành Cổ Loa thời An Dương Vương (thế kỷ 3 TCN) có kiến trúc xoáy trôn ốc gồm bao nhiêu vòng thành?',
    options: [
      '3 vòng thành: Thành Ngoại, Thành Trung và Thành Nội',
      '2 vòng thành: Thành Đông và Thành Tây',
      '4 vòng thành theo 4 hướng la bàn',
      '1 bức tường thành độc nhất bao quanh sông Hoàng',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Thành Cổ Loa gồm 3 vòng thành khép kín hình trôn ốc (xoáy trôn ốc), chu vi gần 16km, kết hợp hào sâu và sông Hoàng Giang tạo thành hệ thống phòng thủ kiên cố bậc nhất Đông Nam Á thời bấy giờ.',
    hint: 'Kiến trúc được ví như hình con ốc uốn lượn nhiều tầng.',
  },
  {
    id: 'triv_caolo_crossbow',
    category: 'Vũ Khí Cổ',
    title: 'Thần Nỏ Cao Lỗ',
    question: 'Tướng quân nào dưới thời An Dương Vương được truyền tụng là người phát minh ra Nỏ Thần Liên Châu?',
    options: [
      'Tướng quân Cao Lỗ',
      'Tướng quân Phạm Ngũ Lão',
      'Tiết độ sứ Khúc Thừa Dụ',
      'Đại vương Triệu Quang Phục',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Theo dã sử và truyền thuyết dân gian, tướng quân Cao Lỗ (Đô Lỗ) là vị tướng tài ba chỉ huy đắp thành Cổ Loa và chế tạo thành công nỏ Liên Châu bắn một lần được nhiều mũi tên đồng sắc nhọn.',
    hint: 'Tên ngài gắn liền với lò rèn vũ khí dưới chân thành.',
  },
  {
    id: 'triv_bronze_arrows',
    category: 'Khảo Cổ Học',
    title: 'Kho Mũi Tên Cầu Vực',
    question: 'Năm 1959, các nhà khảo cổ đã khai quật được hàng vạn mũi tên đồng Cổ Loa tại địa danh nào?',
    options: [
      'Cầu Vực (Đông Anh, Hà Nội)',
      'Bến Rừng (Yên Hưng, Quảng Ninh)',
      'Hoa Lư (Ninh Bình)',
      'Đồng Đậu (Vĩnh Phúc)',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Năm 1959, tại khu vực Cầu Vực (xã Cổ Loa, huyện Đông Anh, Hà Nội), các nhà khảo cổ học đã phát hiện một kho mũi tên đồng ba cạnh gồm gần 1 vạn chiếc, minh chứng xác thực cho truyền thuyết nỏ thần thời Âu Lạc.',
    hint: 'Địa danh nằm ngay cửa thành Cổ Loa ở huyện Đông Anh.',
  },
  {
    id: 'triv_quoc_tu_giam',
    category: 'Văn Hóa - Giáo Dục',
    title: 'Quốc Tử Giám',
    question: 'Trường đại học đầu tiên của Việt Nam – Quốc Tử Giám – được thành lập vào năm nào dưới triều đại nào?',
    options: [
      'Năm 1076 dưới triều vua Lý Nhân Tông',
      'Năm 938 dưới triều Ngô Quyền',
      'Năm 1258 dưới triều Trần Thái Tông',
      'Năm 1428 dưới triều Lê Thái Tổ',
    ],
    correctIndex: 25,
    points: 25,
    explanation: 'Năm 1070, vua Lý Thánh Tông cho lập Văn Miếu. Đến năm 1076, vua Lý Nhân Tông cho lập Quốc Tử Giám kề bên, trở thành trường đại học đầu tiên đào tạo hiền tài cho đất nước.',
    hint: 'Thế kỷ 11, vào thời nhà Lý rực rỡ.',
  },
  {
    id: 'triv_stakes_iron',
    category: 'Bạch Đằng 938',
    title: 'Bí Mật Cọc Gỗ Bạch Đằng',
    question: 'Vì sao cọc gỗ trận Bạch Đằng 938 lại được đẽo nhọn và bọc đai sắt ở đầu cọc?',
    options: [
      'Để tăng độ cứng đâm thủng đáy thuyền chiến gỗ của địch khi triều rút',
      'Để cọc không bị mục nát khi ngâm nước ngọt',
      'Để làm nam châm hút thuyền sắt của địch',
      'Để dễ phát sáng báo hiệu trong đêm tối',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Gỗ lim/sến vạt nhọn khi bọc thêm đai sắt tôi lửa than già sẽ đạt độ cứng cực đại. Khi đáy thuyền địch bằng gỗ va chạm với lực của dòng thủy triều rút xiết, mũi bọc sắt sẽ xé toạc vỏ thuyền.',
    hint: 'Hãy nhớ lại lời dặn của Bác thợ rèn Tạo trong làng.',
  },
  {
    id: 'triv_dinh_bo_linh',
    category: 'Kỷ Nguyên Độc Lập',
    title: 'Quốc Hiệu Đại Cồ Việt',
    question: 'Sau khi dẹp yên loạn 12 sứ quân năm 968, Đinh Bộ Lĩnh lên ngôi Hoàng đế và đặt quốc hiệu nước ta là gì?',
    options: [
      'Đại Cồ Việt',
      'Đại Việt',
      'Âu Lạc',
      'Vạn Xuân',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Năm 968, Đinh Bộ Lĩnh xưng là Đinh Tiên Hoàng Đế, đặt tên nước là Đại Cồ Việt, đóng đô ở Hoa Lư (Ninh Bình), khẳng định nền độc lập tự chủ sánh ngang các hoàng đế phương Bắc.',
    hint: 'Chữ Cồ trong tiếng Việt cổ có nghĩa là Lớn.',
  },
  {
    id: 'triv_dong_son_drum',
    category: 'Khảo Cổ Học',
    title: 'Trống Đồng Đông Sơn',
    question: 'Hình tượng ngôi sao nhiều cánh ở chính giữa mặt trống đồng Đông Sơn biểu trưng cho điều gì?',
    options: [
      'Mặt trời - nguồn sáng và sự sống trong tín ngưỡng cư dân nông nghiệp lúa nước',
      'Ngôi sao Bắc Đẩu chỉ hướng đi biển',
      'Huy hiệu của nhà vua thời Hùng Vương',
      'Hình ảnh mô phỏng hoa sen nở',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Hình tượng mặt trời nhiều cánh tỏa tia sáng ở tâm mặt trống đồng biểu thị sự sùng bái thần Mặt Trời của cư dân nông nghiệp lúa nước Văn Lang - Âu Lạc, mang lại mùa màng bội thu.',
    hint: 'Gắn liền với tín ngưỡng thờ nguồn năng lượng tự nhiên mang lại lúa gạo.',
  },
  {
    id: 'triv_ngo_quyen_capital',
    category: 'Bạch Đằng 938',
    title: 'Kinh Đô Cổ Loa',
    question: 'Sau chiến thắng Bạch Đằng năm 938, Ngô Quyền đã chọn nơi nào làm kinh đô của nước Việt độc lập?',
    options: [
      'Cổ Loa (Đông Anh, Hà Nội ngày nay)',
      'Hoa Lư (Ninh Bình)',
      'Thăng Long (Hà Nội)',
      'Đại La (Hà Nội)',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Ngô Quyền không chọn Đại La (nơi đặt bộ máy cai trị của phong kiến phương Bắc) mà chọn lại Cổ Loa - kinh đô cũ thời An Dương Vương - nhằm nối lại quốc thống nghìn năm của tổ tiên.',
    hint: 'Nơi có tòa thành xoáy ốc huyền thoại thời An Dương Vương.',
  },
  {
    id: 'triv_hai_ba_trung',
    category: 'Khởi Nghĩa Chống Bắc Thuộc',
    title: 'Khởi Nghĩa Hai Bà Trưng',
    question: 'Khởi nghĩa Hai Bà Trưng bùng nổ vào mùa xuân năm bao nhiêu để rửa thù nhà, đền nợ nước?',
    options: [
      'Năm 40 sau Công Nguyên',
      'Năm 248 sau Công Nguyên',
      'Năm 542 sau Công Nguyên',
      'Năm 938 sau Công Nguyên',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Mùa xuân năm 40 (Canh Tý), Trưng Trắc cùng em gái là Trưng Nhị phất cờ khởi nghĩa tại Hát Môn (Hà Nội). Cuộc khởi nghĩa nhanh chóng lật đổ ách thống trị của thái thú Tô Định nhà Đông Hán.',
    hint: 'Câu khẩu hiệu: "Một xin rửa sạch nước thù / Hai xin dựng lại nghiệp xưa họ Hùng".',
  },
  {
    id: 'triv_tam_khoi',
    category: 'Khoa Cử Xưa',
    title: 'Tam Khôi Khoa Bảng',
    question: 'Trong kỳ thi Đình thời phong kiến Việt Nam, "Tam Khôi" gồm ba danh vị đỗ đầu nào?',
    options: [
      'Trạng Nguyên, Bảng Nhãn, Thám Hoa',
      'Tú Tài, Cử Nhân, Tiến Sĩ',
      'Hoàng Giáp, Tiến Sĩ, Phó Bảng',
      'Trạng Nguyên, Hoàng Giáp, Thám Hoa',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Tam Khôi là ba người đỗ đầu kỳ thi Đình: Đỗ thứ nhất gọi là Trạng Nguyên, thứ nhì gọi là Bảng Nhãn, thứ ba gọi là Thám Hoa.',
    hint: 'Người đứng đầu mang danh hiệu Trạng, người thứ hai là Bảng.',
  },
  {
    id: 'triv_bachdang_river_location',
    category: 'Địa Lý Lịch Sử',
    title: 'Dòng Sông Huyền Thoại',
    question: 'Sông Bạch Đằng ngày nay là ranh giới tự nhiên giữa hai địa phương nào?',
    options: [
      'Thành phố Hải Phòng và tỉnh Quảng Ninh',
      'Tỉnh Ninh Bình và tỉnh Thanh Hóa',
      'Thành phố Hà Nội và tỉnh Bắc Ninh',
      'Tỉnh Thái Bình và tỉnh Nam Định',
    ],
    correctIndex: 0,
    points: 25,
    explanation: 'Sông Bạch Đằng là con sông lịch sử dài khoảng 32km, tạo thành ranh giới tự nhiên giữa thị xã Quảng Yên (Quảng Ninh) và huyện Thủy Nguyên (Hải Phòng), đổ ra vịnh Bắc Bộ qua cửa Nam Triệu.',
    hint: 'Khu vực giáp ranh giữa thành phố Hoa Phượng Đỏ và vùng mỏ than.',
  },
];

// Fix for Quoc Tu Giam question options & correct index
TRIVIA_POOL[4].options = [
  'Năm 1076 dưới triều vua Lý Nhân Tông',
  'Năm 938 dưới triều Ngô Quyền',
  'Năm 1258 dưới triều Trần Thái Tông',
  'Năm 1428 dưới triều Lê Thái Tổ',
];
TRIVIA_POOL[4].correctIndex = 0;

export interface ExplorationTask {
  id: string;
  category: string;
  title: string;
  description: string;
  explorationTarget: DailyExplorationTarget;
  actionLabel: string;
  points: number;
  hint: string;
}

export const EXPLORATION_POOL: ExplorationTask[] = [
  {
    id: 'exp_read_codex',
    category: 'Khảo Cứu',
    title: 'Mở Sổ Tay Sử Việt',
    description: 'Vào Sổ tay Sử Việt để tra cứu các mốc biên niên sử và sự kiện cọc ngầm Bạch Đằng.',
    explorationTarget: 'READ_CODEX',
    actionLabel: 'Mở Sổ Tay',
    points: 20,
    hint: 'Bấm nút "Sổ tay Sử Việt" trên thanh công cụ hoặc màn hình khởi đầu.',
  },
  {
    id: 'exp_explore_coloan',
    category: 'Du Hành 3D',
    title: 'Khám Phá Cổ Loa Thành 3D',
    description: 'Bước vào sa bàn 3D Cổ Loa Thành để chiêm ngưỡng lũy hào và lò rèn Cao Lỗ.',
    explorationTarget: 'EXPLORE_CO_LOA',
    actionLabel: 'Vào Cổ Loa 3D',
    points: 30,
    hint: 'Bấm nút "Cổ Loa Thành 3D" trên màn hình chọn chương để bắt đầu.',
  },
  {
    id: 'exp_solve_cipher',
    category: 'Mật Mã',
    title: 'Giải Mã Cổ Thư',
    description: 'Thử tài quan sát bằng cách giải ít nhất một mật thư hoặc cơ quan trận đồ.',
    explorationTarget: 'SOLVE_CIPHER',
    actionLabel: 'Giải Mật Mã',
    points: 30,
    hint: 'Tìm cuộn thư trong làng hoặc tương tác với cơ quan mật mã trong chuyến phiêu lưu.',
  },
  {
    id: 'exp_inspect_relic',
    category: 'Giám Định',
    title: 'Soi Chiếu Cổ Vật Cổ Loa',
    description: 'Xoay và soi chiếu 3D mảnh cổ vật nỏ thần hoặc cọc nhọn bọc sắt.',
    explorationTarget: 'INSPECT_RELIC',
    actionLabel: 'Soi Chiếu',
    points: 25,
    hint: 'Trong chế độ Cổ Loa 3D, bấm vào mảnh cổ vật đã tìm thấy để xem chi tiết.',
  },
];

/**
 * Deterministic pseudo-random generator based on date string (YYYY-MM-DD).
 * Ensures all players get the exact same daily missions on the same calendar day,
 * while rotating reliably day by day.
 */
function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getDailyMissionsForDate(
  dateStr: string,
  existingState?: DailyMissionsState
): DailyMissionsState {
  // If existing state matches today's date and has missions, keep it intact
  if (
    existingState &&
    existingState.dateString === dateStr &&
    existingState.missions &&
    existingState.missions.length === 3
  ) {
    return existingState;
  }

  // Calculate streak
  let streakDays = 1;
  if (existingState && existingState.dateString) {
    const prevDate = new Date(existingState.dateString);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Consecutive day: advance streak if previous day had completed at least one task or bonus
      const completedYesterday = existingState.missions.some((m) => m.completed) || existingState.dailyBonusClaimed;
      streakDays = completedYesterday ? (existingState.streakDays || 1) + 1 : 1;
    } else if (diffDays === 0) {
      streakDays = existingState.streakDays || 1;
    } else {
      // Missed a day or brand new
      streakDays = 1;
    }
  }

  const hash = hashDateString(dateStr);

  // Pick 2 trivia questions from TRIVIA_POOL
  const triviaIndex1 = hash % TRIVIA_POOL.length;
  const triviaIndex2 = (hash + 5) % TRIVIA_POOL.length !== triviaIndex1
    ? (hash + 5) % TRIVIA_POOL.length
    : (hash + 1) % TRIVIA_POOL.length;

  const t1 = TRIVIA_POOL[triviaIndex1];
  const t2 = TRIVIA_POOL[triviaIndex2];

  // Pick 1 exploration task from EXPLORATION_POOL
  const expIndex = (hash >> 2) % EXPLORATION_POOL.length;
  const e1 = EXPLORATION_POOL[expIndex];

  const mission1: DailyMission = {
    id: `daily_${dateStr}_${t1.id}`,
    type: 'TRIVIA',
    title: t1.title,
    description: `Hỏi đáp sử lược: ${t1.title}`,
    category: t1.category,
    points: t1.points,
    completed: false,
    question: t1.question,
    options: t1.options,
    correctIndex: t1.correctIndex,
    explanation: t1.explanation,
    hint: t1.hint,
  };

  const mission2: DailyMission = {
    id: `daily_${dateStr}_${t2.id}`,
    type: 'TRIVIA',
    title: t2.title,
    description: `Hỏi đáp sử lược: ${t2.title}`,
    category: t2.category,
    points: t2.points,
    completed: false,
    question: t2.question,
    options: t2.options,
    correctIndex: t2.correctIndex,
    explanation: t2.explanation,
    hint: t2.hint,
  };

  const mission3: DailyMission = {
    id: `daily_${dateStr}_${e1.id}`,
    type: 'EXPLORATION',
    title: e1.title,
    description: e1.description,
    category: e1.category,
    points: e1.points,
    completed: false,
    explorationTarget: e1.explorationTarget,
    actionLabel: e1.actionLabel,
    hint: e1.hint,
  };

  return {
    dateString: dateStr,
    streakDays,
    missions: [mission1, mission2, mission3],
    dailyBonusClaimed: false,
    lastCompletedDate: existingState?.lastCompletedDate,
  };
}

export const DAILY_COMPLETION_BONUS_POINTS = 50;
