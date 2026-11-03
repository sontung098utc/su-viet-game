# BÁO CÁO THẨM ĐỊNH SỬ LIỆU & PHÂN ĐỊNH NỘI DUNG (BẢN LÀM LẠI 2D RPG)
### Dự án: MẬT MÃ SỬ VIỆT — Đoạn chơi mẫu: Bến Sông Bạch Đằng Năm 938

---

## 1. KẾT QUẢ RÀ SOÁT & HIỆU ĐÍNH LỊCH SỬ TỪ BẢN CŨ

Thực hiện yêu cầu thẩm định nghiêm ngặt tại Mục 9, toàn bộ dữ liệu của phiên bản trước đã được rà soát lại đối chiếu với chính sử:

1. **Loại bỏ các giờ đồng hồ và số đo mét giả định không có trong sử liệu năm 938**:
   - *Bản cũ*: Có ghi các mốc giờ cụ thể (`06:00 Sáng`, `11:00 Trưa`, `15:00 Chiều`) và con số độ sâu cụ thể (`3–4 mét`, `~5m`).
   - *Hiệu đính ở bản mới*: Chính sử viết về năm 938 (*Đại Việt sử ký toàn thư*, *Khâm định Việt sử thông giám cương mục*) **không** ghi giờ đồng hồ hay độ sâu bằng mét. Bản mới đã xóa bỏ các thông số giả định này và chỉ sử dụng **các pha thủy triều tương đối** theo đúng tinh thần sử liệu: **Pha Nước Ròng (Triều xuống thấp)**, **Pha Nước Lớn (Triều dâng ngập cọc)** và **Pha Nước Rút (Triều rút mạnh)**.
2. **Phân định rõ tư liệu bãi cọc khảo cổ học (1288) và chính sử năm 938**:
   - *Bản cũ*: Gộp chung các bãi cọc khảo cổ Yên Giang, Đồng Vạn Muối (Quảng Ninh), Cao Quỳ (Hải Phòng) và tên loại gỗ (gỗ lim, gỗ sến) vào dữ kiện đã xác minh của năm 938.
   - *Hiệu đính ở bản mới*: Các bãi cọc khảo cổ đã khai quật tại Yên Giang, Đồng Vạn Muối, Cao Quỳ chủ yếu được giới khảo cổ học xác định niên đại thuộc **trận Bạch Đằng năm 1288 (thời Trần)** hoặc vẫn đang tiếp tục nghiên cứu đối sánh. Đối với **trận Bạch Đằng năm 938 của Ngô Quyền**, sử liệu gốc (*Đại Việt sử ký toàn thư*, Ngoại kỷ, Quyển V) chỉ chép rõ: **“sai người đem cọc lớn vạt nhọn đầu, bịt sắt, đóng ngầm ở trước cửa biển”**. Do đó, thông tin về các bãi cọc khảo cổ thực địa đã được tách riêng sang mục `fact-archaeology-distinction` với trạng thái `PENDING_VERIFICATION` (*Đang tiếp tục nghiên cứu khảo cứu*).

---

## 2. DANH MỤC NGUỒN SỬ LIỆU & NỘI DUNG HỖ TRỢ CỤ THỂ

| Mã Nguồn | Tên Ấn Bản / Tài Liệu | Thông Tin Xuất Bản / Bản Dịch | Nội Dung Cụ Thể Được Nguồn Này Hỗ Trợ |
| :--- | :--- | :--- | :--- |
| `src-dvsktt-ngo-quyen` | **Đại Việt Sử Ký Toàn Thư** | Ngô Sĩ Liên và các sử thần triều Hậu Lê biên soạn. Bản dịch Viện Khoa học Xã hội Việt Nam (Ngô Đức Thọ dịch, Hà Văn Tấn hiệu đính), NXB Khoa học Xã hội, Hà Nội, 1993. Ngoại kỷ, Quyển V, tờ 20a–22b. | 1. Tháng 3 năm Đinh Dậu (937), Kiều Công Tiễn giết Dương Đình Nghệ.<br>2. Mùa đông năm Mậu Tuất (938), Ngô Quyền từ Ái Châu tiến quân hỏi tội Công Tiễn; Công Tiễn cầu cứu nhà Nam Hán.<br>3. Vua Nam Hán Lưu Cung sai con là Vạn Vương Hoằng Tháo đem thủy quân sang.<br>4. Ngô Quyền giết Công Tiễn, sai đem **cọc lớn vạt nhọn đầu, bịt sắt** đóng ngầm trước cửa biển.<br>5. Khi **nước triều lên** cho thuyền nhẹ ra khiêu chiến giả thua nhử địch; đợi khi **triều rút mạnh** đánh quật lại khiến thuyền giặc vướng cọc vỡ đắm, Hoằng Tháo tử trận. |
| `src-kdvstgcm` | **Khâm Định Việt Sử Thông Giám Cương Mục** | Quốc sử quán triều Nguyễn biên soạn. Bản dịch Viện Sử học, NXB Giáo dục, Hà Nội, 1998. Tiền biên, Quyển V. | Xác nhận trình tự nhân quả sự kiện năm 937–938: Kiều Công Tiễn phản nghịch và cầu viện Nam Hán; Ngô Quyền từ Ái Châu ra diệt nội phản, đóng cọc bịt sắt ngầm ở cửa sông Bạch Đằng, nhân lúc nước triều lên xuống phá quân Nam Hán, giết Lưu Hoằng Tháo. |
| `src-archaeology-note` | **Tư liệu Khảo cổ học lưu vực sông Bạch Đằng** | Viện Khảo cổ học Việt Nam & Bảo tàng Lịch sử Quốc gia (Báo cáo khai quật Yên Giang, Đồng Vạn Muối, Cao Quỳ). | Hỗ trợ lưu ý phân biệt niên đại: Các bãi cọc đã khai quật thực địa chủ yếu gắn với trận Bạch Đằng năm 1288 (thời Trần); vị trí bãi cọc năm 938 của Ngô Quyền trên thực địa hiện vẫn là chủ đề nghiên cứu khảo cổ (`PENDING_VERIFICATION`). |

---

## 3. BA MỤC TIÊU KIẾN THỨC & THIẾT KẾ GHI NHỚ QUA HÀNH ĐỘNG

| Mục Tiêu Kiến Thức | 1. Tiếp Cận Qua Môi Trường & Công Việc | 2. Nhắc Lại Trong Bối Cảnh Khác | 3. Tình Huống Đáng Nhớ & Củng Cố |
| :--- | :--- | :--- | :--- |
| **1. Nguyên nhân giặc Nam Hán xâm lược & Ngô Quyền diệt nội phản** | Nghe Cụ Trưởng Thôn ở **Làng Ven Sông** báo tin khẩn về việc Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu cứu Nam Hán, và Ngô Quyền đã từ Ái Châu ra trừ xong Công Tiễn. | Khi xuống **Bến Nhỏ Đầu Làng** nhận Bao Than Củi, nghe Dân Binh Tâm kể vì sao dân làng căm giận kẻ phản nghịch mà đồng lòng góp củi lửa. | Sắp xếp thẻ hình ảnh kỷ niệm số 1 ở cuối đoạn chơi và mở mục `fact-kieu-cong-tien-cause` trong Sổ tay. |
| **2. Chuẩn bị cọc lớn vạt nhọn đầu, bịt sắt đóng ngầm cửa biển** | Gặp Đội Trưởng Lê ở **Khu Chuẩn Bị** nhận Thẻ Lệnh và chứng kiến quân sĩ vạt cọc, Bác Thợ Rèn Tạo rèn đai sắt bịt đầu cọc. | Tự tay vác **Bao Than Củi** từ bến làng về lò rèn để Bác Tạo tôi mẻ **Bó Đai Sắt Bịt Cọc** (hiệu ứng lửa & hơi nước xèo trắng xóa) rồi mang ra Bến Quan Sát. | Tận mắt thấy hàng cọc bịt sắt đóng ngoài sông lúc nước ròng và sắp xếp thẻ hình ảnh số 2. |
| **3. Vai trò con nước thủy triều lên (nhử địch) — triều rút (phản công)** | Lần 1 đến **Bến Quan Sát** lúc **Pha Nước Ròng**: Quan sát Cột Mốc Đá cạn trơ chân và hàng cọc bịt sắt nhô cao khỏi mặt nước. | Lần 2 quay lại **Bến Quan Sát** lúc **Pha Nước Lớn**: Thấy nước sông đã dâng ngập bãi bùn, chạm đỉnh Cột Mốc Đá và che khuất toàn bộ bãi cọc ngầm. | Phát tín hiệu **Cờ Hiệu Xuất Kích**: Xem cảnh thuyền nhẹ nhử thuyền lớn của Hoằng Tháo qua bãi cọc lúc nước lớn, rồi nước triều rút mạnh làm lộ cọc nhọn chặn đứng thuyền giặc. |

---

## 4. PHÂN ĐỊNH RÕ PHẦN HƯ CẤU & MÔ PHỎNG GIẢN LƯỢC

- **Nhân vật & Tuyến việc hư cấu (`FICTION`)**: Nhân vật người đưa tin trẻ (do người chơi đặt tên), Cụ Trưởng Thôn, Đội Trưởng Lê, Bác Thợ Rèn Tạo, Trinh Sát Hải, Dân Binh Tâm và công việc chuyển giao bao than củi, bó đai sắt, thẻ báo cáo, cờ hiệu là hư cấu để tạo trải nghiệm nhập vai. Người chơi **không** quyết định kết quả lịch sử và **không** thay thế vai trò chỉ huy của Ngô Quyền.
- **Mô phỏng & Dựng cảnh tái hiện (`INTERPRETATION`)**:
  - Khu Chuẩn Bị (lò rèn dã chiến, bãi vạt cọc) và Cột Mốc Đá đo mực nước là dựng cảnh ước lệ dựa trên ghi chép chính sử về *"cọc lớn vạt nhọn đầu, bịt sắt"* và sự lên xuống của thủy triều.
  - Trang phục nhân vật (áo giao lĩnh vạt chéo, khăn vấn đầu, giáp hộ tâm đóng đinh tán) và kiến trúc nhà tranh vách đất được minh họa ở mức độ **ước lệ cổ phong thế kỷ X**, không tuyên bố là bản vẽ khảo cổ phục nguyên chính xác tuyệt đối từng chi tiết trang sức/hoa văn của năm 938.
