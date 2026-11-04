import type { HistoricalSource } from '../types';

export const HISTORICAL_SOURCES: HistoricalSource[] = [
  {
    id: 'src-dvsktt-ngo-quyen',
    name: 'Đại Việt Sử Ký Toàn Thư (Ngoại kỷ, Quyển V — Kỷ nhà Ngô, Tiền Ngô Vương)',
    authorOrInstitution: 'Ngô Sĩ Liên và các sử thần triều Hậu Lê biên soạn; Bản dịch Viện Khoa học Xã hội Việt Nam (Ngô Đức Thọ dịch, Hà Văn Tấn hiệu đính), NXB Khoa học Xã hội, Hà Nội, 1993.',
    details: 'Ngoại kỷ, Quyển V, tờ 20a–22b (Mục năm Đinh Dậu 937 và năm Mậu Tuất 938).',
    supportedClaims: 'Xác nhận: (1) Tháng 3 năm Đinh Dậu (937), Kiều Công Tiễn giết Dương Đình Nghệ; (2) Mùa đông năm Mậu Tuất (938), Ngô Quyền từ Ái Châu举 binh讨 Công Tiễn, Công Tiễn sai sứ cầu cứu nhà Nam Hán; (3) Vua Nam Hán Lưu Cung cho con là Vạn Vương Hoằng Tháo đem thủy quân sang; (4) Ngô Quyền giết Công Tiễn, sai người đem cọc lớn vạt nhọn đầu bịt sắt đóng ngầm ở trước cửa biển; (5) Khi nước triều lên cho thuyền nhỏ ra khiêu chiến giả thua nhử địch, đợi khi triều rút mạnh thì đánh quật lại khiến thuyền giặc vướng cọc đắm, Hoằng Tháo chết.',
    url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BA%A1i_Vi%E1%BB%87t_s%E1%BB%AD_k%C3%BD_to%C3%A0n_th%C6%B0',
    isPrimary: true,
  },
  {
    id: 'src-kdvstgcm',
    name: 'Khâm Định Việt Sử Thông Giám Cương Mục (Tiền biên, Quyển V)',
    authorOrInstitution: 'Quốc sử quán triều Nguyễn biên soạn; Bản dịch Viện Sử học, NXB Giáo dục, Hà Nội, 1998.',
    details: 'Tiền biên, Quyển V (Mục Đinh Dậu 937 và Mậu Tuất 938).',
    supportedClaims: 'Xác nhận trình tự nhân quả sự kiện năm 937–938: Kiều Công Tiễn giết chủ tướng Dương Đình Nghệ và cầu viện Nam Hán; Ngô Quyền từ Ái Châu tiến quân diệt Công Tiễn, bố trí cọc ngầm bịt sắt ở cửa sông Bạch Đằng, lợi dụng thủy triều lên xuống phá tan quân Nam Hán, giết Lưu Hoằng Tháo.',
    url: 'https://vi.wikipedia.org/wiki/Kh%C3%A2m_%C4%91%E1%BB%8Bnh_Vi%E1%BB%87t_s%E1%BB%AD_Th%C3%B4ng_gi%C3%A1m_c%C6%B0%C6%A1ng_m%E1%BB%A5c',
    isPrimary: true,
  },
  {
    id: 'src-archaeology-note',
    name: 'Tư liệu Khảo cổ học về các bãi cọc trên lưu vực sông Bạch Đằng',
    authorOrInstitution: 'Viện Khảo cổ học Việt Nam & Bảo tàng Lịch sử Quốc gia',
    details: 'Các báo cáo khai quật bãi cọc Yên Giang (1953, 1984, 1988), Đồng Vạn Muối (2005) tại Quảng Ninh và Cao Quỳ (2019) tại Hải Phòng.',
    supportedClaims: 'Lưu ý phân định niên đại: Các bãi cọc khảo cổ đã khai quật tại Yên Giang, Đồng Vạn Muối và Cao Quỳ chủ yếu được giới nghiên cứu xác định thuộc chiến thắng Bạch Đằng năm 1288 (thời Trần) hoặc đang tiếp tục nghiên cứu thêm. Đối với trận Bạch Đằng năm 938 của Ngô Quyền, căn cứ xác thực hiện nay là ghi chép trong chính sử ("cọc lớn vạt nhọn đầu, bịt sắt đóng ngầm ở trước cửa biển"), còn vị trí bãi cọc 938 trên thực địa và chủng loại gỗ cụ thể năm 938 chưa có kết luận khảo cổ học dứt khoát.',
    isPrimary: false,
  }
];
