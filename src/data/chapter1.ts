import type {
  ClueId,
  HistoricalFact,
  InventoryItem,
  QuestStage,
  VisualClue,
} from '../types';

export const VISUAL_CLUES: Record<ClueId, VisualClue> = {
  clue_a_cipher_note: {
    id: 'clue_a_cipher_note',
    challenge: 'A',
    title: 'Mật Tín Điểm Hẹn Trong Làng',
    shortSummary:
      'Tìm ngôi nhà hội đủ 3 dấu hiệu: (1) Mái tranh có khói bếp trắng, (2) Đôi chum sành trước hiên, (3) Cột cờ buộc dải lụa đỏ.',
    iconType: 'scroll',
    classification: 'FICTION',
  },
  clue_b_wood_stake: {
    id: 'clue_b_wood_stake',
    challenge: 'B',
    title: 'Quy Cách 1: Thân Cọc Gỗ Lớn Vạt Nhọn',
    shortSummary:
      'Quân Sĩ Vạt Cọc cho biết: Chiến thuyền Nam Hán rất lớn, phải dùng thân gỗ lớn vạt nhọn đầu (không dùng bó tre nứa mảnh).',
    iconType: 'wood',
    classification: 'HISTORICAL_FACT',
  },
  clue_b_iron_band: {
    id: 'clue_b_iron_band',
    challenge: 'B',
    title: 'Quy Cách 2: Đầu Cọc Bọc Đai Sắt Tôi Cứng',
    shortSummary:
      'Bác Thợ Rèn Tạo cho biết: Đầu cọc gỗ phải bọc đai sắt nung đỏ tôi cứng (không để mũi gỗ trần dễ tước).',
    iconType: 'anvil',
    classification: 'HISTORICAL_FACT',
  },
  clue_b_estuary_map: {
    id: 'clue_b_estuary_map',
    challenge: 'B',
    title: 'Quy Cách 3: Tập Kết Ở Giá Phía Đông Lò Rèn',
    shortSummary:
      'Bàn Bản Đồ ghi rõ: Lô cọc lớn đã bịt sắt đạt chuẩn được xếp trên giá ở phía Đông Lò Rèn để chuyển ra cửa biển.',
    iconType: 'map',
    classification: 'INTERPRETATION',
  },
  clue_c_low_tide_mark: {
    id: 'clue_c_low_tide_mark',
    challenge: 'C',
    title: 'Dấu Nước 1: Pha Nước Ròng Lộ Bãi Cọc',
    shortSummary:
      'Khi nước ở vạch thấp dưới chân Cột Mốc Đá, Lối Đá Thấp khô ráo và hàng cọc bịt sắt ngoài sông lộ rõ mồn một.',
    iconType: 'tide_low',
    classification: 'INTERPRETATION',
  },
  clue_c_high_tide_flood: {
    id: 'clue_c_high_tide_flood',
    challenge: 'C',
    title: 'Dấu Nước 2: Triều Lên Giấu Cọc — Triều Rút Phá Giặc',
    shortSummary:
      'Khi nước dâng chạm vạch đỏ Cột Mốc Đá, bãi cọc chìm khuất và Lối Đá Thấp bị ngập. Phải đợi lúc nước bắt đầu rút mạnh mới phát cờ phản công!',
    iconType: 'tide_high',
    classification: 'HISTORICAL_FACT',
  },
  clue_secret_ancient_well: {
    id: 'clue_secret_ancient_well',
    challenge: 'A',
    title: 'Mật Thư Ẩn 1: Kế Lấy Yếu Thắng Mạnh (Giếng Làng)',
    shortSummary:
      'Mảnh mật thư trong ống tre bên giếng cổ chép lời dặn: "Quân ta cậy mưu trí biến sông núi hiểm trở thành mồ chôn thuyền giặc".',
    iconType: 'scroll',
    classification: 'INTERPRETATION',
  },
  clue_secret_shrine_cache: {
    id: 'clue_secret_shrine_cache',
    challenge: 'A',
    title: 'Mật Thư Ẩn 2: Lời Thề Ái Châu (Miếu Cổ Cây Đa)',
    shortSummary:
      'Tờ văn hịch giấu sau bát hương miếu cổ: Nhắc nhở chí căm thù tên phản nghịch Kiều Công Tiễn và lòng quyết tâm giữ vẹn giang sơn.',
    iconType: 'scroll',
    classification: 'HISTORICAL_FACT',
  },
  clue_secret_boat_pitch: {
    id: 'clue_secret_boat_pitch',
    challenge: 'C',
    title: 'Mật Thư Ẩn 3: Thuyền Nhẹ Lướt Sóng (Bến Đò Bác Năm)',
    shortSummary:
      'Bản khắc gỗ kỹ thuật trét dầu rái: Giúp thuyền nhẹ của quân ta kín nước, lướt nhanh hơn thuyền lớn đáy bằng của Nam Hán.',
    iconType: 'map',
    classification: 'INTERPRETATION',
  },
};

export const ALL_CLUE_IDS: ClueId[] = [
  'clue_a_cipher_note',
  'clue_b_wood_stake',
  'clue_b_iron_band',
  'clue_b_estuary_map',
  'clue_c_low_tide_mark',
  'clue_c_high_tide_flood',
  'clue_secret_ancient_well',
  'clue_secret_shrine_cache',
  'clue_secret_boat_pitch',
];

export const HISTORICAL_FACTS_CH1: HistoricalFact[] = [
  {
    id: 'fact-kieu-cong-tien-cause',
    title: 'Mục tiêu kiến thức 1: Biến cố Kiều Công Tiễn & Nguyên nhân giặc Nam Hán xâm lược',
    summary:
      'Năm 937, Kiều Công Tiễn giết Dương Đình Nghệ để đoạt quyền; khi bị Ngô Quyền đem quân hỏi tội, Công Tiễn cầu cứu nhà Nam Hán.',
    detailedContent:
      'Theo Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Quyển V) và Khâm Định Việt Sử Thông Giám Cương Mục (Tiền biên, Quyển V): Tháng 3 năm Đinh Dậu (937), nha tướng Kiều Công Tiễn giết chủ tướng là Tiết độ sứ Dương Đình Nghệ để thay chức. Mùa đông năm Mậu Tuất (938), Ngô Quyền (con rể Dương Đình Nghệ, đang giữ Ái Châu) cử binh tiến ra vây đánh Công Tiễn. Công Tiễn sức cùng lực kiệt bèn sai sứ sang đút lót và cầu cứu vua Nam Hán Lưu Cung. Lưu Cung muốn nhân cơ hội xâm chiếm nước ta, liền phong con trai là Lưu Hoằng Tháo làm Vạn Vương, thống lĩnh thủy quân tiến sang. Ngô Quyền đã hạ thành giết chết Kiều Công Tiễn trước khi quân Nam Hán kịp vào ứng cứu.',
    classification: 'HISTORICAL_FACT',
    verificationStatus: 'VERIFIED',
    sourceIds: ['src-dvsktt-ngo-quyen', 'src-kdvstgcm'],
    sourceNotes:
      'Đối chiếu trực tiếp từ Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Q.V, tờ 20a–20b, bản dịch Viện KHXHVN 1993) và Cương Mục (Tiền biên, Q.V).',
    era: 'Năm 937–938',
    keyTakeaway:
      'Sự phản bội và cầu viện ngoại bang của Kiều Công Tiễn là nguyên nhân trực tiếp dẫn đến cuộc xâm lược của quân Nam Hán; Ngô Quyền đã kịp thời trừ nội phản trước khi đánh giặc ngoài.',
  },
  {
    id: 'fact-stake-preparation-938',
    title: 'Mục tiêu kiến thức 2: Chuẩn bị cọc lớn vạt nhọn bịt sắt ở cửa biển Bạch Đằng',
    summary:
      'Ngô Quyền nhận định giặc mạnh ở thuyền lớn nên sai quân lấy cọc lớn vạt nhọn đầu, bịt sắt đóng ngầm trước cửa biển.',
    detailedContent:
      'Sau khi diệt Kiều Công Tiễn, nghe tin Lưu Hoằng Tháo sắp đem thủy quân tới, Ngô Quyền bàn với các tướng rằng quân Hoằng Tháo từ xa đến mỏi mệt, lại mất kẻ nội ứng là Công Tiễn nên khí thế đã giảm, nhưng giặc có lợi thế ở chiến thuyền lớn, nếu không phòng bị trước thì chưa chắc nắm phần thắng. Ông liền sai người lấy cọc lớn, vạt nhọn đầu và bịt sắt, đem đóng ngầm ở trước cửa biển sông Bạch Đằng.',
    classification: 'HISTORICAL_FACT',
    verificationStatus: 'VERIFIED',
    sourceIds: ['src-dvsktt-ngo-quyen', 'src-kdvstgcm'],
    sourceNotes:
      'Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Q.V, tờ 20b–21a) ghi rõ chi tiết "cọc lớn vạt nhọn đầu, bịt sắt đóng ngầm ở trước cửa biển". Chính sử không ghi cụ thể tên loại gỗ hay số lượng cọc của năm 938.',
    era: 'Mùa đông năm 938',
    keyTakeaway:
      'Việc đóng cọc lớn vạt nhọn bịt sắt ngầm dưới cửa biển là biện pháp chủ động nhằm khắc chế ưu thế chiến thuyền lớn của thủy quân Nam Hán.',
  },
  {
    id: 'fact-tide-decisive-victory',
    title: 'Mục tiêu kiến thức 3: Nhử địch theo con nước thủy triều & Đại thắng năm 938',
    summary:
      'Lợi dụng lúc nước triều lên để nhử thuyền giặc vượt qua bãi cọc ngầm, rồi tổng phản công khi nước triều rút mạnh.',
    detailedContent:
      'Khi Lưu Hoằng Tháo dẫn binh thuyền tiến vào cửa biển đang lúc nước triều dâng lên che khuất bãi cọc ngầm, Ngô Quyền sai người đem thuyền nhẹ ra khiêu chiến rồi giả thua rút chạy để nhử giặc đuổi theo vượt qua vùng cắm cọc. Hoằng Tháo quả nhiên thúc quân đuổi theo. Đợi đến khi nước triều bắt đầu rút mạnh, Ngô Quyền mới dốc toàn quân đánh quật lại. Thuyền chiến quân Nam Hán quay đầu tháo chạy gặp lúc nước rút, va phải cọc nhọn bịt sắt ngầm nên vỡ đắm rất nhiều. Quân Nam Hán đại bại, quá nửa chết đuối, chủ tướng Lưu Hoằng Tháo tử trận. Chiến thắng này chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ lâu dài.',
    classification: 'HISTORICAL_FACT',
    verificationStatus: 'VERIFIED',
    sourceIds: ['src-dvsktt-ngo-quyen', 'src-kdvstgcm'],
    sourceNotes:
      'Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Q.V, tờ 21a). Lưu ý: Chính sử chỉ chép hai pha tương đối là "khi nước triều lên" và "đợi khi nước triều rút", không ghi giờ đồng hồ hay độ sâu bằng mét.',
    era: 'Mùa đông năm 938',
    keyTakeaway:
      'Sự kết hợp giữa bãi cọc ngầm và thời điểm nước triều lên — triều rút là yếu tố quyết định làm tan vỡ hạm đội Nam Hán.',
  },
  {
    id: 'fact-archaeology-distinction',
    title: 'Lưu ý thẩm định: Phân biệt sử liệu năm 938 và các bãi cọc khảo cổ học',
    summary:
      'Không tự ý gán tư liệu các bãi cọc khảo cổ thời Trần (1288) thành khẳng định chắc chắn cho trận Bạch Đằng năm 938.',
    detailedContent:
      'Trong nghiên cứu hiện đại, các bãi cọc đã được khai quật khảo cổ học như Yên Giang, Đồng Vạn Muối (Quảng Yên, Quảng Ninh) hay Cao Quỳ (Thủy Nguyên, Hải Phòng) thường được giới khảo cổ học xác định niên đại gắn với chiến thắng Bạch Đằng năm 1288 thời nhà Trần, hoặc vẫn đang được tiếp tục nghiên cứu đối sánh. Đối với trận Bạch Đằng năm 938 của Ngô Quyền, nguồn xác thực trực tiếp nhất hiện nay là ghi chép trong chính sử (Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục). Vì vậy, các thông số cụ thể về loại gỗ hay vị trí bãi cọc thực địa của riêng năm 938 được đánh dấu là đang tiếp tục nghiên cứu khảo cứu.',
    classification: 'INTERPRETATION',
    verificationStatus: 'PENDING_VERIFICATION',
    sourceIds: ['src-archaeology-note', 'src-dvsktt-ngo-quyen'],
    sourceNotes:
      'Phân định rõ giữa chính văn sử liệu năm 938 và kết quả khai quật khảo cổ học các bãi cọc năm 1288 để đảm bảo tính trung thực khoa học.',
    era: 'Thẩm định sử liệu & khảo cổ',
    keyTakeaway:
      'Học lịch sử nghiêm túc cần phân biệt rõ chi tiết đã có trong chính sử năm 938 với tư liệu khảo cổ của các thời kỳ khác.',
  },
  {
    id: 'fact-simulation-and-fiction-note',
    title: 'Phân biệt: Mô phỏng môi trường, 3 Thử thách Giải mã & Tuyến truyện hư cấu',
    summary:
      'Nhân vật người đưa tin trẻ, các NPC dân làng/thợ rèn và 3 thử thách giải mã hiện trường là tình tiết hư cấu phục vụ trải nghiệm nhập vai.',
    detailedContent:
      'Trong trò chơi này:\n1. Phần Hư cấu phục vụ gameplay (FICTION): Nhân vật người đưa tin trẻ (do bạn điều khiển), Trưởng thôn, Đội trưởng Lê, Bác thợ rèn Tạo, Trinh sát Hải, Bác chèo đò Năm cùng 3 thử thách giải mã (A: Giải mã dấu hiệu Điểm hẹn trong làng; B: Ghép thông tin chọn đúng lô cọc bịt sắt; C: Vượt lạch nước ngập triều qua Cầu Tre Gò Cao hoặc Đò Bác Năm) là tình tiết hư cấu để bạn bước vào không khí chuẩn bị kháng chiến năm 938. Người chơi là một mắt xích nhỏ chứng kiến lịch sử, không thay thế vai trò chỉ huy của Ngô Quyền.\n2. Phần Mô phỏng & Dựng cảnh tái hiện (INTERPRETATION): Khu chuẩn bị vạt cọc — rèn đai sắt, cột mốc đá ven sông và sự thay đổi mực nước theo các pha tương đối (Nước Ròng lộ cọc — Nước Lớn ngập cọc — Nước Rút lộ cọc phá giặc) là mô phỏng giản lược dựa trên ghi chép sử học về "cọc lớn vạt nhọn bịt sắt" và "nước triều lên/rút".',
    classification: 'FICTION',
    verificationStatus: 'GAMEPLAY_MECHANIC',
    sourceIds: ['src-dvsktt-ngo-quyen'],
    sourceNotes:
      'Ghi chú minh bạch ranh giới giữa lịch sử xác thực (Ngô Quyền, Kiều Công Tiễn, Lưu Hoằng Tháo, kế sách cọc bịt sắt & thủy triều năm 938) và cơ chế giải mã nhập vai.',
    era: 'Quy ước thiết kế trò chơi',
    keyTakeaway:
      'Trải nghiệm giải mã giúp bạn nhớ lâu qua hành động, trong khi Sổ tay giữ sự chuẩn xác tuyệt đối về nguồn sử liệu.',
  },
];

export const INVENTORY_ITEMS: Record<string, InventoryItem> = {
  cipher_scroll: {
    id: 'cipher_scroll',
    name: 'Mật Tín Điểm Hẹn',
    description:
      'Mảnh mật tín hư cấu ghi 3 dấu hiệu nhận diện nơi nhận Thẻ Lệnh: Khói bếp trắng, Đôi chum sành trước hiên và Cột cờ dải lụa đỏ.',
  },
  order_token: {
    id: 'order_token',
    name: 'Thẻ Lệnh Doanh Trại',
    description:
      'Thẻ gỗ khắc tín hiệu của Đội Truyền Tin cho phép đi lại giữa Làng, Khu Chuẩn Bị và Bến Quan Sát.',
  },
  charcoal_sack: {
    id: 'charcoal_sack',
    name: 'Bao Than Củi Già',
    description:
      'Than củi đượm lửa của dân làng gom góp gửi cho lò rèn dã chiến để rèn đai sắt bịt đầu cọc.',
  },
  iron_bands: {
    id: 'iron_bands',
    name: 'Bó Đai Sắt Bịt Cọc',
    description:
      'Những mũi sắt vừa được bác thợ rèn Tạo tôi cứng, dùng để bọc vào đầu những cây cọc gỗ lớn vạt nhọn.',
  },
  tide_report: {
    id: 'tide_report',
    name: 'Thẻ Báo Cáo Con Nước',
    description:
      'Ghi nhận của Trinh sát Hải: Bãi cọc cửa sông đã đóng xong lúc nước ròng, mực nước đã dâng cao che kín bãi cọc.',
  },
  battle_flag: {
    id: 'battle_flag',
    name: 'Cờ Hiệu Xuất Kích',
    description:
      'Lệnh cờ truyền xuống Bến Quan Sát để phát tín hiệu tổng phản công ngay khi nước triều bắt đầu rút mạnh.',
  },
};

export interface QuestObjectiveConfig {
  shortTitle: string;
  hint: string;
  progressiveHints: [string, string, string];
  targetZone: 'VILLAGE' | 'CAMP' | 'RIVER';
  targetId: string;
}

export const QUEST_OBJECTIVES: Record<QuestStage, QuestObjectiveConfig> = {
  STAGE_0_PROLOGUE: {
    shortTitle: 'Trò chuyện với Cụ Trưởng Thôn ở sân Làng Ven Sông',
    hint: 'Đi lại gần Cụ Trưởng Thôn đứng cạnh gốc đa cổ thụ giữa sân làng và nhấn Tương tác.',
    progressiveHints: [
      'Gợi ý 1: Cụ Trưởng Thôn đang đứng ngay cạnh gốc cây đa cổ thụ ở trung tâm sân Làng Ven Sông.',
      'Gợi ý 2: Dùng cần điều khiển bên trái đi lại gần Cụ Trưởng Thôn cho tới khi nút Tương tác sáng lên.',
      'Gợi ý 3: Chạm nút Tương tác (hoặc phím E) để nhận Mật Tín Điểm Hẹn từ Cụ Trưởng Thôn.',
    ],
    targetZone: 'VILLAGE',
    targetId: 'npc_elder',
  },
  STAGE_0_DECODE_MEETING: {
    shortTitle: 'Thử thách A: Quan sát sân làng tìm Điểm Hẹn khớp 3 dấu hiệu Mật Tín',
    hint: 'Mở Sổ Manh Mối xem 3 dấu hiệu (Khói bếp trắng, Đôi chum sành, Cột cờ dải lụa đỏ) và đi kiểm tra các nếp nhà quanh sân làng.',
    progressiveHints: [
      'Gợi ý 1: Hãy nhìn kỹ mái nhà, hiên nhà và cột cờ bên cạnh 3 điểm quanh sân làng (Nhà Tây Nam, Miếu Gốc Đa, Nhà Đông Bắc).',
      'Gợi ý 2: Nhà Tây Nam buộc vải xanh và không có khói bếp; Miếu Gốc Đa không phải nhà tranh có đôi chum sành.',
      'Gợi ý 3: Hãy kiểm tra ngôi nhà tranh ở góc Đông Bắc sân làng (nơi có khói bếp trắng, đôi chum sành và cột cờ dải lụa đỏ).',
    ],
    targetZone: 'VILLAGE',
    targetId: 'npc_elder', // Mũi tên chỉ vùng sân làng chung, không chỉ lộ đáp án ngôi nhà đúng!
  },
  STAGE_1_MEET_COMMANDER: {
    shortTitle: 'Theo đường mòn Đông Bắc lên Khu Chuẩn Bị gặp Đội Trưởng Lê',
    hint: 'Từ sân Làng Ven Sông đi lên phía Bắc rồi rẽ phải vào cổng Khu Chuẩn Bị để gặp Đội Trưởng Lê.',
    progressiveHints: [
      'Gợi ý 1: Con đường đất dẫn lên Khu Chuẩn Bị nằm ở phía Bắc sân Làng Ven Sông (giữa hai ngôi nhà tranh).',
      'Gợi ý 2: Đi thẳng lên phía Bắc rồi rẽ sang hướng Đông qua cổng rào gỗ của Khu Chuẩn Bị.',
      'Gợi ý 3: Đội Trưởng Lê đang đứng trước lều chỉ huy lớn ở phía Bắc Khu Chuẩn Bị.',
    ],
    targetZone: 'CAMP',
    targetId: 'npc_commander',
  },
  STAGE_2_TALK_BLACKSMITH: {
    shortTitle: 'Thử thách B: Thu thập thông tin ở Khu Chuẩn Bị để chọn đúng Giá Cọc chuẩn',
    hint: 'Hỏi Quân Sĩ Vạt Cọc, Bác Thợ Rèn Tạo và xem Bàn Bản Đồ để biết quy cách cọc, sau đó kiểm tra các kiện hàng trong trại.',
    progressiveHints: [
      'Gợi ý 1: Hãy nói chuyện với Quân Sĩ Vạt Cọc và Bác Thợ Rèn Tạo trong Khu Chuẩn Bị để thu thập manh mối vào Sổ Manh Mối.',
      'Gợi ý 2: Cọc đóng cửa biển phải là thân gỗ lớn vạt nhọn VÀ đầu cọc đã được bọc đai sắt tôi cứng.',
      'Gợi ý 3: Sau khi có đủ manh mối, hãy lại gần kiểm tra Giá Cọc Lớn Đã Bịt Đầu Sắt ở phía Đông Lò Rèn.',
    ],
    targetZone: 'CAMP',
    targetId: 'npc_blacksmith',
  },
  STAGE_2_GATHER_CLUES: {
    shortTitle: 'Thử thách B: Ghép manh mối từ các thợ quân khí & Chọn đúng Giá Cọc đạt chuẩn',
    hint: 'Trò chuyện với Quân Sĩ Vạt Cọc, Bác Thợ Rèn Tạo và xem Bàn Bản Đồ để ghép đủ quy cách cọc, rồi chọn đúng kiện cọc trong xưởng.',
    progressiveHints: [
      'Gợi ý 1: Mỗi người trong Khu Chuẩn Bị nắm một phần thông tin: Quân Sĩ Vạt Cọc biết về loại thân gỗ, Bác Tạo biết về đầu mũi cọc, Bàn Bản Đồ chỉ vị trí.',
      'Gợi ý 2: Loại bỏ các bó tre nứa mảnh và đống cọc gỗ để trần chưa bọc sắt vì không chịu nổi thuyền lớn Nam Hán.',
      'Gợi ý 3: Khi đã thu thập ít nhất 2 manh mối, hãy tương tác với Giá Cọc Lớn Đã Bịt Đầu Sắt ở phía Đông Lò Rèn.',
    ],
    targetZone: 'CAMP',
    targetId: 'obj_tactical_table', // Chỉ dẫn về trung tâm bàn bản đồ để người chơi tự chọn kiện hàng
  },
  STAGE_3_FETCH_CHARCOAL: {
    shortTitle: 'Mang Bó Đai Sắt qua Lối Đá Thấp xuống Bến Quan Sát gặp Trinh Sát Hải',
    hint: 'Đi xuống Bến Quan Sát Dòng Sông (phía Đông Nam) để xem Cột Mốc Đá lúc nước ròng và gặp Trinh Sát Hải.',
    progressiveHints: [
      'Gợi ý 1: Bạn có thể đi theo đường phía Nam từ Khu Chuẩn Bị hoặc qua Lối Đá Thấp từ Làng Ven Sông để ra Bến Quan Sát.',
      'Gợi ý 2: Quan sát Cột Mốc Đá ven bờ và hàng cọc bịt sắt đang lộ rõ trên bãi bùn lúc Nước Ròng.',
      'Gợi ý 3: Tương tác với Trinh Sát Hải đang đứng trên cầu tàu gỗ.',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
  STAGE_4_DELIVER_CHARCOAL: {
    shortTitle: 'Mang Bó Đai Sắt xuống Bến Quan Sát gặp Trinh Sát Hải',
    hint: 'Đi xuống Bến Quan Sát Dòng Sông (phía Đông Nam) để gặp Trinh Sát Hải trên cầu tàu.',
    progressiveHints: [
      'Gợi ý 1: Bến Quan Sát nằm ở góc Đông Nam bản đồ.',
      'Gợi ý 2: Hãy nhìn xuống bãi bùn ven sông để thấy hàng cọc bịt sắt lúc nước ròng.',
      'Gợi ý 3: Lại gần Trinh Sát Hải trên cầu tàu gỗ và nhấn Tương tác.',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
  STAGE_5_FIRST_RIVER_VISIT: {
    shortTitle: 'Qua Lối Đá Thấp ra Bến Quan Sát xem Cột Mốc Đá & gặp Trinh Sát Hải',
    hint: 'Đi xuống Bến Quan Sát (phía Đông Nam), quan sát Cột Mốc Đá lúc Nước Ròng và trao Bó Đai Sắt cho Trinh Sát Hải.',
    progressiveHints: [
      'Gợi ý 1: Lúc đang là Pha Nước Ròng, Lối Đá Thấp nối giữa Làng và Bến Sông vẫn khô ráo.',
      'Gợi ý 2: Hãy nhìn Cột Mốc Đá cạnh cầu tàu và hàng cọc bịt sắt đang nhô lên trên bãi bùn.',
      'Gợi ý 3: Trò chuyện với Trinh Sát Hải ngay trên cầu tàu gỗ để giao Bó Đai Sắt.',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
  STAGE_6_FLOODED_PATH_CHOICE: {
    shortTitle: 'Thử thách C1: Lối đá thấp đã ngập triều! Hãy tìm đường vượt lạch nước về làng',
    hint: 'Quan sát địa hình hai bên lạch nước đang ngập để tìm lối vượt qua an toàn (trên gò cao phía Bắc hoặc bến thuyền phía Nam).',
    progressiveHints: [
      'Gợi ý 1: Nước triều dâng đã che khuất bãi cọc ngoài sông và làm ngập sâu Lối Đá Thấp ở giữa lạch.',
      'Gợi ý 2: Đừng lội qua Lối Đá Thấp đang ngập. Hãy đi dọc bờ lạch lên phía Bắc hoặc xuống phía Nam để quan sát địa hình.',
      'Gợi ý 3: Bạn có thể chọn 1 trong 2 cách: bước qua Cầu Tre Gò Cao (phía Bắc) HOẶC gọi thuyền tại Bến Đò Bác Năm (phía Nam).',
    ],
    targetZone: 'RIVER',
    targetId: 'obj_flooded_low_path', // Không giải hộ bằng cách trỏ thẳng vào đáp án
  },
  STAGE_6_REPORT_COMMANDER: {
    shortTitle: 'Mang báo cáo con nước lên Khu Chuẩn Bị trình Đội Trưởng Lê',
    hint: 'Sau khi vượt qua lạch nước ngập, hãy đi lên Khu Chuẩn Bị (Đông Bắc) báo tin cho Đội Trưởng Lê.',
    progressiveHints: [
      'Gợi ý 1: Đi theo con đường đất hướng Đông Bắc để quay lại Khu Chuẩn Bị.',
      'Gợi ý 2: Đội Trưởng Lê đang đợi báo cáo của bạn trước lều chỉ huy.',
      'Gợi ý 3: Tương tác với Đội Trưởng Lê để nhận Cờ Hiệu Xuất Kích.',
    ],
    targetZone: 'CAMP',
    targetId: 'npc_commander',
  },
  STAGE_7_SECOND_RIVER_VISIT: {
    shortTitle: 'Thử thách C2: Kiểm tra Cột Mốc Đá ở Bến Quan Sát để canh đúng pha Nước Rút',
    hint: 'Quay lại Bến Quan Sát, quan sát Cột Mốc Đá Đo Nước để xác nhận thời điểm nước triều bắt đầu rút mạnh trước khi phát cờ!',
    progressiveHints: [
      'Gợi ý 1: Đội Trưởng Lê dặn không được phát cờ tổng phản công khi nước còn đầy ắp mà phải đợi lúc nước triều bắt đầu rút.',
      'Gợi ý 2: Nếu phất cờ ngay trên cầu tàu khi chưa kiểm tra Cột Mốc Đá, thuyền giặc sẽ còn đủ nước sâu để thoát ra biển.',
      'Gợi ý 3: Hãy lại gần Cột Mốc Đá Đo Mực Nước (bên phải cầu tàu) và nhấn Tương tác để chuyển sang thời điểm Nước Triều Bắt Đầu Rút!',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout', // Chỉ vùng bến sông chung, người chơi phải tự nhớ kiểm tra Cột Mốc Đá trước khi phát cờ!
  },
  STAGE_8_CLIMAX_SIGNAL: {
    shortTitle: 'Nước triều đã bắt đầu rút! Mau trao Cờ Hiệu cho Trinh Sát Hải phát lệnh!',
    hint: 'Lại gần Trinh Sát Hải ngay trên cầu tàu gỗ và nhấn Tương tác để phất Cờ Hiệu Xuất Kích tổng phản công!',
    progressiveHints: [
      'Gợi ý 1: Bạn đã xác nhận mực nước bắt đầu rút trên Cột Mốc Đá.',
      'Gợi ý 2: Trinh Sát Hải đang đứng ngay trên cầu tàu gỗ cạnh bạn.',
      'Gợi ý 3: Nhấn Tương tác với Trinh Sát Hải để phát hiệu lệnh tổng phản công trên sông Bạch Đằng!',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
  STAGE_CLIMAX_BATTLE: {
    shortTitle: 'Thúc trống ngũ liên & chỉ huy thủy quân quyết chiến Đằng Giang!',
    hint: 'Gõ trống đồng Đông Sơn đúng nhịp điệu nâng cao Sĩ Khí quân ta đập tan chiến hạm Hoằng Tháo!',
    progressiveHints: [
      'Gợi ý 1: Nhấn phím Space hoặc click chuột / chạm vào mặt trống khi vòng nhịp co lại tâm điểm.',
      'Gợi ý 2: Đạt chuỗi Combo gõ chuẩn xác để nâng thanh Sĩ Khí Quân Ta lên 100%.',
      'Gợi ý 3: Thủy quân ta tràn ra bãi sậy kết hợp bãi cọc nhọn đâm thủng thuyền giặc đại thắng vang dội!',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
  STAGE_9_COMPLETED: {
    shortTitle: 'Đã hoàn thành nhiệm vụ truyền tin & giải mã trên bến Bạch Đằng năm 938!',
    hint: 'Bạn có thể tự do đi dạo quanh 3 khu vực, trò chuyện với mọi người hoặc mở màn Tổng kết & Sổ tay Sử Việt.',
    progressiveHints: [
      'Bạn đã hoàn thành toàn bộ hành trình Chương 1.',
      'Mở Menu để xem lại màn Tổng kết hành trình hoặc mở Sổ tay Sử Việt.',
      'Bạn cũng có thể bắt đầu lượt chơi mới với tên nhân vật khác từ màn hình chính.',
    ],
    targetZone: 'RIVER',
    targetId: 'npc_scout',
  },
};

export interface JourneyRecapCard {
  id: string;
  correctOrder: number;
  title: string;
  caption: string;
  sceneType: 'village_cause' | 'camp_stakes' | 'river_tide';
}

export const JOURNEY_RECAP_CARDS: JourneyRecapCard[] = [
  {
    id: 'recap-1',
    correctOrder: 1,
    title: 'Làng Quê Đồng Lòng Sau Biến Cố Phản Nghịch',
    caption:
      'Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu nhà Nam Hán. Ngô Quyền từ Ái Châu tiến ra trừ nội phản và hiệu triệu quân dân chuẩn bị kháng chiến.',
    sceneType: 'village_cause',
  },
  {
    id: 'recap-2',
    correctOrder: 2,
    title: 'Rèn Sắt Bịt Đầu Cọc Ngầm Nơi Cửa Biển',
    caption:
      'Để khắc chế chiến thuyền lớn của Lưu Hoằng Tháo, quân sĩ và dân công khẩn trương vạt nhọn cọc gỗ lớn, rèn sắt bịt đầu cọc đem đóng ngầm lúc nước ròng.',
    sceneType: 'camp_stakes',
  },
  {
    id: 'recap-3',
    correctOrder: 3,
    title: 'Con Nước Thủy Triều Xoay Chuyển Thế Trận',
    caption:
      'Nước triều dâng cao giấu kín bãi cọc để thuyền nhẹ ra nhử địch vượt qua; khi triều rút mạnh, quân ta phản công khiến thuyền giặc vướng cọc vỡ đắm.',
    sceneType: 'river_tide',
  },
];
