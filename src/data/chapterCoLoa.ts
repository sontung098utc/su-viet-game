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
