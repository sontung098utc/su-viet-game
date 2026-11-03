import type { CoLoaRelic, CoLoaRelicId } from '../types';

export const CO_LOA_RELICS: Record<CoLoaRelicId, CoLoaRelic> = {
  SHARD_CROSSBOW_STOCK: {
    id: 'SHARD_CROSSBOW_STOCK',
    name: 'Thân Nỏ Gỗ Quý Cổ Loa',
    subtitle: 'Khung Nỏ Liên Châu Đông Sơn',
    locationName: 'Lò Rèn Binh Khí Cao Lỗ',
    hint: 'Tìm thấy cạnh đe rèn và bễ than hồng của danh tướng Cao Lỗ dưới chân thành.',
    archaeologicalFact:
      'Thân nỏ được đẽo từ gỗ cứng (gỗ dâu/lim), rãnh nỏ được xẻ chính xác để đặt nhiều mũi tên đồng song song, tạo nên cơ chế bắn liên châu độc nhất vô nhị thời bấy giờ.',
    modelType: 'stock',
    historicalSource: 'Đại Việt Sử Ký Toàn Thư (Kỷ An Dương Vương) & Nghiên cứu Viện Khảo cổ học Việt Nam.',
  },
  SHARD_TURTLE_TRIGGER: {
    id: 'SHARD_TURTLE_TRIGGER',
    name: 'Lẫy Móng Rùa Kim Quy',
    subtitle: 'Bộ Khóa Hãm Đồng Thau Cơ Học',
    locationName: 'Đền Tế & Bờ Giếng Ngọc',
    hint: 'Nằm trên đàn tế đá hoa sen cạnh bờ nước Giếng Ngọc trong vắt.',
    archaeologicalFact:
      'Hiện vật khảo cổ thật tại Cổ Loa cho thấy lẫy nỏ đồng gồm 3 bộ phận chuyển động: lẫy cò, ngàm giữ dây cung và thước ngắm. Khóa hãm chịu được sức kéo hàng trăm cân của dây cung đan từ gân thú.',
    modelType: 'trigger',
    historicalSource: 'Hiện vật Lẫy nỏ đồng Cổ Loa - Bảo tàng Lịch sử Quốc gia Việt Nam (Bảo vật Quốc gia).',
  },
  SHARD_BRONZE_ARROWS: {
    id: 'SHARD_BRONZE_ARROWS',
    name: 'Ống Tên Đồng Ba Cạnh Cầu Vực',
    subtitle: 'Vũ Khí Sát Thương Khí Động Học Âu Lạc',
    locationName: 'Kho Binh Khí Cổng Thành Tây',
    hint: 'Cất giữ trong hòm đồng niêm phong sau lũy đất bảo vệ cổng thành phía Tây.',
    archaeologicalFact:
      'Năm 1959, tại Cầu Vực (Cổ Loa), các nhà khảo cổ đã khai quật kho tên đồng chứa hàng vạn mũi tên đồng 3 cạnh hình cánh én. Thiết kế 3 cạnh giúp mũi tên bay thẳng, đâm xuyên giáp trụ và tạo vết thương khó lành.',
    modelType: 'arrows',
    historicalSource: 'Di tích Kho tên đồng Cầu Vực (Cổ Loa, Đông Anh, Hà Nội).',
  },
};

export interface NarrationAct {
  id: string;
  actNumber: number;
  title: string;
  historicalPeriod: string;
  dvskttSource: string; // Trích chính sử Đại Việt Sử Ký Toàn Thư
  scriptText: string;   // Lời dẫn chuyện của Người Kể Sử
  speaker: string;
}

export const HISTORICAL_NARRATIONS: Record<string, NarrationAct> = {
  ACT_1_BUILD_CITADEL: {
    id: 'ACT_1_BUILD_CITADEL',
    actNumber: 1,
    title: 'Hồi 1: Đắp Thành Cổ Loa Chín Tầng Xoắn Ốc',
    historicalPeriod: 'Năm 257 TCN — Nước Âu Lạc thời Thục An Dương Vương',
    dvskttSource:
      'Đại Việt Sử Ký Toàn Thư, Ngoại kỷ Quyển I: "Vua đã thôn tính được Văn Lang, đổi quốc hiệu là Âu Lạc... đắp thành ở Việt Thường, rộng nghìn trượng, cuốn như hình con ốc, cho nên gọi là Loa Thành."',
    scriptText:
      'Chào mừng người lữ khách thời không! Ngươi đang đứng trên mảnh đất Phong Khê linh thiêng, trước tòa thành ốc 9 vòng xoáy kỳ vĩ của vua Thục An Dương Vương. Thành đắp bằng đất nung, dựa vào thế sông Hoàng Giang quanh co. Buổi đầu đắp thành, thành đắp xong lại lở, có quỷ kê tinh ở núi Thất Diệu quấy nhiễu. Phải nhờ đến sự tương trợ của Thần Rùa Vàng Kim Quy, kinh đô Âu Lạc mới nên hình vóc muôn đời!',
    speaker: 'Người Dẫn Chuyện Lịch Sử',
  },
  ACT_2_KIM_QUY_MEMENTO: {
    id: 'ACT_2_KIM_QUY_MEMENTO',
    actNumber: 2,
    title: 'Hồi 2: Thần Kim Quy Hiển Linh & Lời Răn Giữ Nước',
    historicalPeriod: 'Sông Hoàng Giang — Cửa ngõ thành Cổ Loa',
    dvskttSource:
      'Đại Việt Sử Ký Toàn Thư: "Rùa Vàng ở phương Đông lại, nổi trên mặt nước... Vua cảm tạ ơn, hỏi rằng: Nước nhờ ơn thần đã được yên ổn, nếu có giặc ngoài đến thì lấy gì mà chống? Rùa Vàng bèn nhổ móng chân đưa cho vua mà dặn: Giữ được thành hay chăng, cốt ở lòng người và vũ khí."',
    scriptText:
      'Hãy lắng nghe tiếng chuông ngân bên bờ Giếng Ngọc! Thần Kim Quy từ làn nước biếc sông Hoàng Giang hiện lên, trao lại chiếc móng chân thiêng cho Vua Thục. Thần căn dặn: non sông này có vững bền hay không, không chỉ ở thành cao hào sâu, mà là ở lòng dân đoàn kết và vũ khí sắc bén. Lẫy Nỏ Thần đang được cất giữ nơi đàn tế đá hoa sen, hãy tiến lại gần để giải mã cơ quan!',
    speaker: 'Thần Kim Quy (Tiếng Vọng Non Sông)',
  },
  ACT_3_CAO_LO_FORGE: {
    id: 'ACT_3_CAO_LO_FORGE',
    actNumber: 3,
    title: 'Hồi 3: Danh Tướng Cao Lỗ & Đỉnh Cao Cơ Khí Đông Sơn',
    historicalPeriod: 'Lò Rèn Binh Khí Dưới Chân Thành Cổ Loa',
    dvskttSource:
      'Đại Việt Sử Ký Toàn Thư: "Vua sai tướng là Cao Lỗ chế ra nỏ thần, lấy móng rùa làm lẫy, gọi là Linh Quang Kim Trảo Thần Nỗ, bắn một phát ra hàng chục mũi tên."',
    scriptText:
      'Đây chính là xưởng rèn của danh tướng Cao Lỗ! Nỏ Thần không phải phép thuật huyền ảo, mà là đỉnh cao của cơ khí học cổ đại. Khung nỏ bằng gỗ dâu rừng dẻo dai, dây nỏ xe từ gân mãnh thú, và bộ lẫy khóa cơ học chịu lực ngàn cân. Cạnh đe rèn và bễ than tổ ong, chiếc thân nỏ huyền thoại đang chờ ngươi lắp ghép!',
    speaker: 'Tướng Quân Cao Lỗ',
  },
  ACT_4_BRONZE_ARROWS_SECRETS: {
    id: 'ACT_4_BRONZE_ARROWS_SECRETS',
    actNumber: 4,
    title: 'Hồi 4: Hàng Vạn Mũi Tên Đồng Cầu Vực & Nghệ Thuật Luyện Kim',
    historicalPeriod: 'Kho Binh Khí Cổng Thành Tây & Khảo Cổ Cầu Vực',
    dvskttSource:
      'Di chỉ Khảo cổ học Cổ Loa (1959): Khai quật hàng vạn mũi tên đồng 3 cạnh cánh én tại Cầu Vực. Tỷ lệ hợp kim đồng thau Đông Sơn: 75% Đồng (Cu), 20% Thiếc (Sn), 5% Chì (Pb).',
    scriptText:
      'Các nhà khảo cổ học Việt Nam năm 1959 đã khai quật được kho tên đồng Cầu Vực với hàng vạn mũi tên đồng 3 cạnh hình cánh én. Thiết kế 3 cạnh khí động học hoàn hảo giúp mũi tên xé gió bay xa hàng trăm bước chân mà không lệch hướng. Hãy bước vào bàn luyện kim, hòa trộn đúng tỷ lệ hợp kim cổ đại để đúc nên chùm tên đồng thần thánh!',
    speaker: 'Người Dẫn Chuyện Lịch Sử',
  },
  ACT_5_DEFENSE_VICTORY: {
    id: 'ACT_5_DEFENSE_VICTORY',
    actNumber: 5,
    title: 'Hồi 5: Tiếng Nỏ Rền Vang — Âu Lạc Bất Diệt',
    historicalPeriod: 'Vọng Lâu Bờ Thành Nam & Chiến Thắng Vĩ Đại',
    dvskttSource:
      'Đại Việt Sử Ký Toàn Thư: "Quân giặc nghe tiếng nỏ thần, tên bay như mưa rào, khiếp sợ lui binh không dám xâm phạm."',
    scriptText:
      'Ba mảnh ghép bảo vật quốc gia đã hội tụ! Giờ đây, hãy bước lên Vọng Lâu bờ thành phía Nam, kéo căng dây nỏ, ngắm chuẩn hướng gió và tiêu diệt các chiến thuyền giặc đang lăm le xâm lấn cửa sông Hoàng Giang! Lịch sử ngàn năm đang nằm trong tay ngươi!',
    speaker: 'Người Dẫn Chuyện Lịch Sử',
  },
};

export const CO_LOA_STORY = {
  title: 'Chương 1: Cổ Loa — Nỏ Thần Kim Quy',
  era: 'Thời kỳ Âu Lạc (Thế kỷ III TCN)',
  protagonistRole: 'Người Lưu Trữ Thời Không (Chronicle Seeker)',
  setting: 'Thành Cổ Loa — Tòa thành ốc 9 vòng xoắn kỳ vĩ bên sông Hoàng Giang',
  prologueText:
    'Năm 257 TCN, Thục Phán dựng nước Âu Lạc, xưng An Dương Vương và chọn đất Phong Khê xây đắp thành Cổ Loa. Nhờ thần Kim Quy ban móng thiêng và tài năng cơ khí phi thường của tướng Cao Lỗ, "Linh Quang Kim Trảo Thần Nỏ" ra đời, bắn một phát ra hàng trăm mũi tên, bảo vệ non sông trước muôn trùng quân giặc. Giờ đây, các mảnh ghép cơ mật đã thất lạc, bạn hãy tìm lại 3 cổ vật để phục dựng bảo vật quốc gia!',
  epilogueText:
    'Nỏ Thần đã được phục dựng thành công! Tiếng nỏ xé toạc màn sương, bảo vệ vững chắc thành Cổ Loa. Dẫu truyền thuyết nhuốm màu huyền sử, khảo cổ học hiện đại đã chứng minh: Nỏ Thần chính là đỉnh cao trí tuệ luyện kim và kỹ thuật quân sự của cha ông thời Âu Lạc. Một bài học cảnh giác muôn đời trong sự nghiệp giữ nước!',
};
