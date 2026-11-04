// Dữ liệu Hệ Thống Nhiệm Vụ Sử Học Đa Dạng (Historical Missions)
// Dành riêng cho học sinh, sinh viên: học thông qua nhập vai, tương tác sa bàn, giải phẫu khảo cổ và tranh biện quân cơ.

import type { HistoricalMissionId, HistoricalMissionCategory } from '../types';

export interface HistoricalMissionDef {
  id: HistoricalMissionId;
  category: HistoricalMissionCategory;
  title: string;
  subtitle: string;
  eraBadge: string;
  shortSummary: string;
  studentLearningObjective: string;
  primarySources: {
    sourceName: string;
    quoteOrEvidence: string;
  }[];
  scholarPointsReward: number;
}

export const HISTORICAL_MISSIONS_CATALOG: Record<HistoricalMissionId, HistoricalMissionDef> = {
  MISSION_TACTICAL_SANDTABLE: {
    id: 'MISSION_TACTICAL_SANDTABLE',
    category: 'TACTICAL_SANDTABLE',
    title: 'Sa Bàn Bạch Đằng — Bày Trận Thủy Triều',
    subtitle: 'Nghệ Thuật Quân Sự Kết Hợp Thủy Văn Học Sông Bạch Đằng Năm 938',
    eraBadge: 'Tháng 11 năm 938 • Tiền Ngô Vương',
    shortSummary:
      'Học sinh trực tiếp điều chỉnh sa bàn tác chiến cửa sông: chọn thời điểm con nước dâng/rút, chất liệu cọc gỗ bịt sắt, góc cắm chịu lực va chạm và bố trí hạm đội khiêu chiến.',
    studentLearningObjective:
      'Hiểu rõ mối tương quan giữa hiện tượng nhật triều biển Đông (chênh lệch 3.5 - 4.0m) với quy luật đạn đạo/va chạm vật lý, lý giải vì sao Ngô Quyền không chặn giặc nơi ải hiểm trên bộ mà chọn cửa sông Bạch Đằng.',
    primarySources: [
      {
        sourceName: 'Đại Việt Sử Ký Toàn Thư (Ngoại kỷ Quyển V)',
        quoteOrEvidence:
          '“Quyền bảo các tướng tá rằng: Hoằng Tháo là một đứa trẻ dại, đem quân từ xa đến, quân lính mỏi mệt, lại nghe Công Tiễn đã chết, không có người làm nội ứng, khí thế đã mất một nửa rồi. Quân ta lấy sức còn khỏe địch với quân mỏi mệt, tất phá được. Song họ có lợi ở thuyền to, nếu ta không phòng bị trước thì thế được thua chưa biết ra sao. Nếu sai người vót nhọn cọc gỗ, đầu bịt sắt đóng ngầm ở cửa biển, thuyền giặc nhân khi nước triều lên tiến vào bên trong hàng cọc, bấy giờ ta dốc quân đánh, không kế gì hơn kế ấy cả.”',
      },
      {
        sourceName: 'Khảo cổ học Bãi cọc Yên Giang (Quảng Ninh, khai quật 1953, 1988)',
        quoteOrEvidence:
          'Cọc cắm sâu vào lớp bùn sét đáy sông từ 1.0 - 1.5m; cọc nghiêng theo góc 45° - 60° xuôi theo dòng nước chảy về phía biển; thân cọc bằng gỗ lim, sến, táu đường kính 20 - 30cm, vạt nhọn một đầu.',
      },
    ],
    scholarPointsReward: 120,
  },

  MISSION_CO_LOA_BALLISTICS: {
    id: 'MISSION_CO_LOA_BALLISTICS',
    category: 'ARCHAEOLOGY_RESTORE',
    title: 'Khảo Cổ Cổ Loa — Giải Phẫu Lẫy Nỏ & Khí Động Học',
    subtitle: 'Phục Dựng Kỹ Thuật Đạn Đạo & Cơ Khí Độc Bản Thời Âu Lạc',
    eraBadge: 'Thế kỷ III TCN • Nhà nước Âu Lạc',
    shortSummary:
      'Người học nhập vai nhà nghiên cứu khảo cổ học: giải phẫu 4 bộ phận cơ học của lẫy nỏ đồng Đông Sơn (thước ngắm, ngàm giữ, chốt hãm, cò bóp) và làm thí nghiệm khí động học mũi tên đồng ba cạnh Cầu Vực.',
    studentLearningObjective:
      'Phân biệt giữa yếu tố thần thoại huyền sử (thần Kim Quy ban móng) và thành tựu luyện kim cơ khí đỉnh cao có thật của tổ tiên thời dựng nước, rèn luyện tư duy khoa học giải mã di sản.',
    primarySources: [
      {
        sourceName: 'Bảo tàng Lịch sử Quốc gia (Bảo vật Quốc gia: Lẫy nỏ đồng Cổ Loa)',
        quoteOrEvidence:
          'Bộ lẫy nỏ bằng đồng thau gồm 4 chi tiết liên kết bằng các chốt đồng, hoạt động theo nguyên lý đòn bẩy kép, có thước ngắm điều chỉnh cự ly và giữ được lực căng cung tên hàng trăm kilogram.',
      },
      {
        sourceName: 'Di chỉ khảo cổ học Cầu Vực (Cổ Loa, Đông Anh, Hà Nội 1959)',
        quoteOrEvidence:
          'Phát hiện kho chứa hàng vạn mũi tên đồng 3 cạnh (ba cánh én). Trọng tâm dồn về đầu mũi tên, rãnh xẻ khí động học giúp mũi tên xoay tròn tự ổn định trong không khí tương tự rãnh khương tuyến súng đạn hiện đại.',
      },
    ],
    scholarPointsReward: 100,
  },

  MISSION_WAR_COUNCIL_DEBATE: {
    id: 'MISSION_WAR_COUNCIL_DEBATE',
    category: 'WAR_COUNCIL',
    title: 'Hội Nghị Quân Cơ — Tranh Biện Chiến Lược Tiền Ngô Vương',
    subtitle: 'Nhập Vai Tham Mưu Quân Sư Đối Thoại Với Ngô Quyền & Các Tướng Lĩnh',
    eraBadge: 'Cuối năm 938 • Doanh trại cửa biển',
    shortSummary:
      'Trực tiếp tham gia 3 phiên tranh biện lịch sử: (1) Diệt gian thần Kiều Công Tiễn trước hay nghênh chiến Hoằng Tháo trước? (2) Đánh trận địa trên bộ hay trận địa thủy triều cửa sông? (3) Nghệ thuật nhử địch và tổng phản công đúng thời khắc chuyển dòng.',
    studentLearningObjective:
      'Phát triển tư duy phản biện lịch sử (Historical Thinking & Decision Making), thấu hiểu nghệ thuật quân sự “Lấy đoản binh chế trường trận, lấy sức nhàn thắng sức mỏi”.',
    primarySources: [
      {
        sourceName: 'Đại Việt Sử Ký Toàn Thư (Bình luận của Sử thần Lê Văn Hưu)',
        quoteOrEvidence:
          '“Ngô Quyền cứu nước giúp dân, giết tên nghịch tặc Kiều Công Tiễn, phá được mưu gian của nhà Nam Hán, lấy lại đất nước, xưng vương dựng nghiệp... Mưu lược ấy thật là tài giỏi, đánh một trận mà dứt được họa ngoại xâm nghìn năm!”',
      },
      {
        sourceName: 'Khâm Định Việt Sử Thông Giám Cương Mục (Tiền Biên Quyển V)',
        quoteOrEvidence:
          '“Mùa đông, tháng 11, Ngô Quyền đem quân ra Giao Châu, bắt giết Kiều Công Tiễn. Hoằng Tháo vừa đến cửa biển, Quyền bảo các tướng: Ta nhân nước triều dâng, trước hết cho thuyền nhẹ ra khiêu chiến, giả vờ thua chạy để dẫn giặc vào sâu...”',
      },
    ],
    scholarPointsReward: 110,
  },

  MISSION_LOGISTICS_AND_PEOPLE: {
    id: 'MISSION_LOGISTICS_AND_PEOPLE',
    category: 'LOGISTICS_CIVILIAN',
    title: 'Ký Sự Hậu Cần — Toàn Dân Đồng Lòng Đánh Giặc',
    subtitle: 'Rừng Lim Chí Linh, Lò Rèn Than Hoa & Bí Ký Dầu Rái Thuyền Nan',
    eraBadge: 'Thu Đông năm 938 • Hậu phương toàn dân',
    shortSummary:
      'Khám phá ba trạm hậu cần dân gian: tuyển chọn gỗ lim sến ngàn năm ở rừng Yên Hưng, nung đai sắt tôi than già bảo vệ đầu cọc, và kỹ thuật dùng vôi tôi trộn dầu rái trét thuyền nan nhẹ lướt sóng của ngư dân vùng duyên hải.',
    studentLearningObjective:
      'Nhận thức sâu sắc rằng thắng lợi Bạch Đằng không chỉ là tài cầm quân của tướng lĩnh mà là kỳ tích hiệp đồng của hàng vạn nhân dân lao động từ thợ rèn, thợ mộc đến ngư dân sông biển.',
    primarySources: [
      {
        sourceName: 'Truyền thuyết & Di tích Lịch sử Vùng Quảng Yên — Thủy Nguyên',
        quoteOrEvidence:
          'Các thôn làng ven sông Đằng truyền tụng câu ca: “Đẵn gỗ ngàn năm về cắm bãi, Đập đai sắt nguội giữ bờ sông”. Dân làng hiến đồ đồng, đồ sắt gia dụng cho quân đội đúc đai cọc và vũ khí.',
      },
      {
        sourceName: 'Tư liệu Đóng Thuyền Cổ Truyền Việt Nam (Viện Nghiên cứu Hàng hải)',
        quoteOrEvidence:
          'Dầu cây rái (dipterocarpus) trộn bột vỏ sò vôi tôi tạo thành hợp chất trám kín nước tuyệt hảo, chống hà bám và giúp thuyền vỏ mỏng lướt nhanh trên mặt nước cạn.',
      },
    ],
    scholarPointsReward: 90,
  },
};

// Chi tiết các bài tập & tình huống tương tác cho Sa Bàn Bạch Đằng
export const SANDTABLE_LEVELS = [
  {
    stepId: 'TIDE_CALCULATION',
    stepName: 'Bước 1: Tính Toán Con Nước Thủy Triều',
    prompt:
      'Theo âm lịch, vùng cửa sông Bạch Đằng thuộc chế độ nhật triều (mỗi ngày một lần nước dâng và một lần nước rút, chênh lệch mặt nước lên tới 3.5m - 4m). Hãy chọn mốc thời gian tối ưu để dụ hạm thuyền Nam Hán lọt trọn vào bãi cọc:',
    options: [
      {
        id: 'MORNING_EBB',
        title: 'Buổi sáng (Lúc nước ròng - triều cạn nhất)',
        consequence:
          'Sai lầm! Khi nước cạn, hàng cọc nhọn nhô lên khỏi mặt nước 1-2 mét, trinh sát thuyền giặc sẽ nhìn thấy bãi cọc từ xa và không bao giờ tiến vào.',
        isCorrect: false,
      },
      {
        id: 'NOON_FLOOD_AFTERNOON_EBB',
        title: 'Giờ Ngọ (Đỉnh triều dâng ngập cọc) rồi đánh dốc vào buổi chiều (Triều rút mạnh)',
        consequence:
          'Chính xác tuyệt đối! Giờ Ngọ nước dâng cao ngập đầu cọc từ 2 - 2.5m, thuyền lớn giặc vượt qua bãi cọc êm ru tưởng ta thua chạy. Đến chiều nước rút mạnh với dòng chảy xiết, bãi cọc nhô lên chặn đường rút, thuyền giặc đâm vỡ tan tành!',
        isCorrect: true,
      },
      {
        id: 'NIGHT_FLOOD',
        title: 'Đêm khuya (Triều dâng cao trong bóng tối)',
        consequence:
          'Không khả thi! Đêm tối không thể quan sát cờ hiệu điều động hạm đội khiêu chiến và phục binh trên sông rộng mênh mông.',
        isCorrect: false,
      },
    ],
  },
  {
    stepId: 'STAKE_MATERIAL',
    stepName: 'Bước 2: Tuyển Chọn Chất Liệu Cọc Ngầm',
    prompt:
      'Hạm thuyền chiến của Lưu Hoằng Tháo là loại thuyền lầu (lâu thuyền) trọng tải nặng hàng chục tấn, lườn thuyền đóng bằng gỗ thông dày. Loại cọc nào sau đây chịu được lực đâm va khi nước rút xiết?',
    options: [
      {
        id: 'BAMBOO',
        title: 'Bó tre gai kết bè đóng san sát',
        consequence:
          'Tre gai giòn, khi thuyền lớn hàng chục tấn trôi theo dòng nước xiết đè lên sẽ bị uốn cong hoặc dập gãy ngay tức khắc.',
        isCorrect: false,
      },
      {
        id: 'IRONWOOD_LIM',
        title: 'Cọc gỗ lim/sến/táu đường kính 25-30cm, vạt nhọn và bọc đai sắt nung tôi cứng',
        consequence:
          'Đúng như kết quả khảo cổ học Yên Giang! Gỗ lim ngâm nước mặn càng cứng như đá, đầu bịt sắt sắc nhọn đủ sức xé toạc lớp vỏ lườn thuyền giặc đang trôi xuôi dòng theo quán tính.',
        isCorrect: true,
      },
      {
        id: 'SOFT_PINE',
        title: 'Gỗ thông mềm dễ đẽo gọt nhưng không bọc sắt',
        consequence:
          'Gỗ mềm khi gặp lườn thuyền cứng sẽ bị tước đầu, không tạo được lỗ thủng ngập nước.',
        isCorrect: false,
      },
    ],
  },
  {
    stepId: 'STAKE_ANGLE',
    stepName: 'Bước 3: Góc Độ & Thế Cắm Cọc Dưới Lòng Sông',
    prompt:
      'Tại di chỉ khảo cổ Yên Giang, các nhà khoa học phát hiện cọc không cắm thẳng đứng 90°. Vì sao các tướng lĩnh Ngô Quyền cho cắm cọc nghiêng 45° - 60° xuôi theo chiều nước triều rút?',
    options: [
      {
        id: 'VERTICAL_90',
        title: 'Cắm thẳng đứng 90° để tạo thành hàng rào ngăn thuyền',
        consequence:
          'Cọc thẳng đứng dễ bị đáy thuyền gạt nghiêng hoặc thuyền trượt ngang qua mà không tạo lực đâm thủng lườn thuyền.',
        isCorrect: false,
      },
      {
        id: 'SLANTED_45_EBB',
        title: 'Cắm nghiêng 45° - 60° chĩa mũi nhọn ngược dòng triều rút (hướng về phía hạ lưu)',
        consequence:
          'Thiết kế cơ học tuyệt hảo! Khi thuyền giặc tháo chạy xuôi theo dòng nước triều rút, lườn thuyền lao thẳng vào mũi cọc đang chĩa xiên lên đón đầu, tạo hiệu ứng đâm xuyên tối đa giống như mũi lao đâm thẳng vào bụng cá.',
        isCorrect: true,
      },
      {
        id: 'OPPOSITE_45',
        title: 'Cắm nghiêng tự do không cần hướng theo con nước',
        consequence:
          'Dòng nước chảy xiết và phù sa bùn lầy sẽ làm lung lay gốc cọc nếu không tính toán hướng nghiêng chịu lực.',
        isCorrect: false,
      },
    ],
  },
  {
    stepId: 'FLEET_TACTICS',
    stepName: 'Bước 4: Chiến Thuật Dẫn Dụ & Đột Kích',
    prompt:
      'Ngô Quyền phân công tướng Nguyễn Tất Tố đảm nhiệm vai trò gì để dụ toàn bộ soái hạm Lưu Hoằng Tháo vào ổ phục kích?',
    options: [
      {
        id: 'FRONTAL_CHARGE',
        title: 'Dốc toàn bộ thuyền chiến dàn trận quyết tử đâm va trực diện giữa sông',
        consequence:
          'Thất sách! Quân Nam Hán thuyền to người đông, đâm va trực diện sẽ biến lợi thế của ta thành bất lợi.',
        isCorrect: false,
      },
      {
        id: 'FEIGNED_RETREAT_BAIT',
        title: 'Dùng đội thuyền nan nhẹ khiêu chiến, giả thua rút chạy vượt qua bãi cọc nhử địch đuổi theo',
        consequence:
          'Mưu kế thiên tài! Thuyền nhẹ mớn nước nông lướt qua bãi cọc an toàn; tướng giặc ngạo mạn nghĩ ta khiếp sợ liền xua đại quân truy đuổi, sa trọn vào trận địa cọc ngầm đúng lúc con nước bắt đầu rút cạn.',
        isCorrect: true,
      },
      {
        id: 'SHORE_DEFENSE',
        title: 'Cho quân lên bờ nấp đợi giặc đổ bộ rồi mới đánh giáp lá cà',
        consequence:
          'Nếu để giặc đổ bộ lên bờ, ta sẽ mất hoàn toàn ưu thế địa lợi hiểm trở của bãi cọc sông Bạch Đằng.',
        isCorrect: false,
      },
    ],
  },
];

// Chi tiết các tình huống Tranh biện Hội nghị Quân cơ Ngô Quyền
export const WAR_COUNCIL_DEBATES = [
  {
    topicId: 'DEBATE_KIEU_CONG_TIEN',
    topicTitle: 'Vấn Đề 1: Kế Sách Đối Phó Với Gian Thần Kiều Công Tiễn',
    question:
      'Tại triều đình Ái Châu, khi nghe tin Kiều Công Tiễn giết Tiết độ sứ Dương Đình Nghệ và sai sứ cầu cứu vua Nam Hán, các tướng bàn luận hai phương án. Bạn ủng hộ luận điểm nào trước mặt Ngô Vương?',
    options: [
      {
        id: 'WAIT_FOR_CHINESE_ARMY',
        speaker: 'Tướng thủ cựu',
        argument:
          '“Nên cố thủ Ái Châu xây lũy đắp thành, đợi quân Nam Hán kéo vào rồi hẵng xuất binh đánh cả hai bề.”',
        feedback:
          'Không thỏa đáng! Nếu để Kiều Công Tiễn còn sống ở Đại La, khi Hoằng Tháo tới hai cánh giặc sẽ hợp thành thế gọng kìm trong - ngoài, quân ta lâm vào thế bị kẹp giữa.',
        isBest: false,
      },
      {
        id: 'ELIMINATE_TRAITOR_FIRST',
        speaker: 'Ý kiến Tham mưu đắc lực (Đáp án lịch sử)',
        argument:
          '“Kiều Công Tiễn phản chủ cầu viện ngoại bang là nỗi căm thù của toàn dân. Phải thần tốc tiến quân ra Bắc diệt sạch mầm mống nội ứng Kiều Công Tiễn trước khi thủy quân Hoằng Tháo kịp đặt chân tới cửa biển!”',
        feedback:
          'Ngô Vương gật đầu tán thưởng! Diệt xong Công Tiễn, nội bộ sạch bóng gian tặc, lòng dân quy về một mối, quân ta rảnh tay dồn 100% lực lượng nghênh đón giặc ngoài cửa biển.',
        isBest: true,
      },
    ],
  },
  {
    topicId: 'DEBATE_CHOOSING_BATTLEFIELD',
    topicTitle: 'Vấn Đề 2: Chọn Chiến Trường Sông Bạch Đằng Thay Vì Ải Đường Bộ',
    question:
      'Có tướng đề nghị đem quân lên các cửa ải Lạng Sơn, Chi Lăng chặn đánh giặc trên bộ. Ngô Quyền đã chọn cửa sông Bạch Đằng. Luận cứ chiến lược sâu sắc nhất của quyết định này là gì?',
    options: [
      {
        id: 'WATERWAY_VULNERABILITY',
        speaker: 'Ý kiến Tham mưu đắc lực (Đáp án lịch sử)',
        argument:
          '“Hoằng Tháo mượn đường biển tiến vào cửa ngõ Bạch Đằng để dễ tiếp tế lương thảo. Nhưng thuyền lớn Nam Hán đáy sâu vụng về, không thông thủy thổ; sông Bạch Đằng lòng rộng, biên độ triều cường kỷ lục, hai bên rừng ngập mặn hiểm trở. Ta biến thế nước ngàn trùng thành vũ khí chôn vùi thủy quân giặc!”',
        feedback:
          'Chính xác! Bạch Đằng là con đường thủy huyết mạch vào Thăng Long, phát huy tối đa sở trường thủy chiến của người Việt và biến thuyền to của giặc thành mồ chôn di động.',
        isBest: true,
      },
      {
        id: 'MOUNTAIN_ROAD_HARD',
        speaker: 'Ý kiến đơn giản',
        argument:
          '“Chỉ vì đường rừng núi vận chuyển vũ khí mệt mỏi hơn đường sông nên chọn đánh ở bến sông cho tiện.”',
        feedback:
          'Lý lẽ quá đơn giản! Quyết sách của Tiền Ngô Vương dựa trên khoa học thủy văn và nghệ thuật biến địa hình thành bẫy tử thần, chứ không vì sự tiện lợi.',
        isBest: false,
      },
    ],
  },
  {
    topicId: 'DEBATE_COUNTERATTACK_TIMING',
    topicTitle: 'Vấn Đề 3: Thời Khắc Xuất Kích Dứt Điểm Tận Gốc',
    question:
      'Khi thuyền giặc đã lọt sâu vào trận địa, nếu ta phát động phản công quá sớm hoặc quá muộn thì hiểm họa gì sẽ xảy ra?',
    options: [
      {
        id: 'WRONG_TIMING_RISK',
        speaker: 'Ý kiến vội vàng',
        argument:
          '“Cứ thấy thuyền giặc tiến vào là xua toàn bộ quân mai phục ra đánh giáp lá cà ngay lập tức!”',
        feedback:
          'Nguy hiểm! Đánh sớm khi nước triều vẫn đang dâng cao ngập cọc, thuyền giặc vẫn có thể quay đầu rút chạy an toàn ra biển khơi mà không hề hấn gì.',
        isBest: false,
      },
      {
        id: 'RIGHT_TIDE_REVERSAL',
        speaker: 'Ý kiến Tham mưu đắc lực (Đáp án lịch sử)',
        argument:
          '“Phải kiên nhẫn đợi đúng khoảnh khắc con nước vừa chuyển pha sang triều rút xiết. Khi cờ hiệu phất lên, thuyền ta quật kích dồn giặc lùi lại, thuyền giặc không còn đường tháo lui và cắm thẳng vào bãi cọc nhô dần lên khỏi mặt nước!”',
        feedback:
          'Tuyệt vời! Đây chính là thiên tài quân sự của Ngô Quyền: dùng quy luật thiên nhiên làm đòn bẩy chiến thuật, khiến quân giặc vỡ trận không kịp trở tay!',
        isBest: true,
      },
    ],
  },
];
