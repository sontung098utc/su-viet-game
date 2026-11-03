# MẬT MÃ SỬ VIỆT — PHIÊU LƯU NHẬP VAI LỊCH SỬ 2D (PHASER 3 + REACT)
> *Đoạn chơi mẫu (Vertical Slice 8–12 phút): Bến Sông Bạch Đằng Mùa Đông Năm 938*

Trò chơi phiêu lưu nhập vai khám phá lịch sử 2D góc nhìn từ trên xuống (Top-Down Adventure RPG), nơi người chơi trực tiếp điều khiển một người đưa tin trẻ bước đi trong không gian liên thông ba khu vực ven sông Bạch Đằng năm 938, thực hiện công việc tiếp sức cùng quân dân và tận mắt chứng kiến sự biến đổi của con nước thủy triều.

---

## 1. Kiến trúc hệ thống (Phaser 3 + React + TypeScript)

- **Thế giới Game 2D (`src/game/scenes/BachDangWorldScene.ts` & `src/game/assets/AssetGenerator.ts`)**:
  - Sử dụng **Phaser 3 (Arcade Physics & Camera System)** quản lý bản đồ liên thông `2400 x 1600 px`, va chạm vật lý với nhà tranh, lều trại, cây đa, rặng tre, lò rèn và mép sông.
  - Hệ thống hoạt ảnh nhân vật 4-frame (đứng thở, bước đi vung tay chân), khói bếp, khói lửa lò rèn, sóng vỗ và thuyền dập dềnh.
  - Camera bám theo nhân vật mượt mà, kèm bong bóng chỉ dẫn `[E]` nổi trực tiếp trên đối tượng gần nhất và mũi tên la bàn dẫn đường tự nhiên dưới chân.
- **Giao diện HUD & Sổ tay (`src/components/`)**:
  - **React 19 + Tailwind CSS** đảm nhận lớp HUD tối giản (chỉ hiển thị mục tiêu ngắn 1 dòng, vật phẩm nhiệm vụ đang mang, nút Chỉ đường, Sổ tay, Âm thanh) và hộp hội thoại ngắn cạnh dưới có chân dung nhân vật (`Portraits.tsx`).
  - Tích hợp **Cần điều khiển ảo (Virtual Joystick) + Nút Tương Tác `[E]`** (`VirtualControls.tsx`) hỗ trợ chơi trọn vẹn trên điện thoại cảm ứng và máy tính.

---

## 2. Thế giới 3 Khu vực liên thông & Cốt truyện 4 Chặng

1. **Khu vực A — Làng Ven Sông (Phía Tây & Tây Nam)**:
   - Không gian làng quê Bắc Bộ thế kỷ X với nhà tranh vách đất, cây đa cổ thụ, rặng tre và bến nước nhỏ.
   - **Cảnh mở đầu**: Nghe Cụ Trưởng Thôn dặn dò về biến cố Kiều Công Tiễn giết Dương Đình Nghệ rồi cầu viện Nam Hán, và việc Ngô Quyền từ Ái Châu tiến ra diệt nội phản, chuẩn bị chặn giặc ngoài cửa biển.
2. **Khu vực B — Khu Chuẩn Bị Doanh Trại (Phía Đông Bắc — Dựng cảnh tái hiện)**:
   - Lều chỉ huy của Đội Trưởng Lê, bãi quân sĩ vạt nhọn cọc gỗ lớn và Lò Rèn Dã Chiến của Bác Thợ Rèn Tạo.
   - **Chặng 1 & Chặng 2**: Nhận Thẻ Lệnh từ Đội Trưởng Lê, qua Lò Rèn biết Bác Tạo hết than củi, chạy về Bến Nhỏ Đầu Làng vác **Bao Than Củi Già** lên lò rèn để Bác Tạo tôi cứng **Bó Đai Sắt Bịt Đầu Cọc**.
3. **Khu vực C — Bến Quan Sát Dòng Sông Bạch Đằng (Phía Đông Nam)**:
   - Bờ sông rộng mở ra cửa biển, có **Cột Mốc Đá Đo Mực Nước**, cầu tàu gỗ, thuyền trinh sát nhẹ và bãi cọc ngầm ngoài cửa sông.
   - **Chặng 3 (Quan sát 2 thời điểm thủy triều)**:
     - *Lần đến thứ 1 (Pha Nước Ròng)*: Mực nước cạn lộ bãi bùn, Cột Mốc Đá lộ vạch thấp và 14 mũi cọc bịt sắt nhô cao khỏi mặt nước.
     - *Lần đến thứ 2 (Pha Nước Lớn)*: Sau khi về doanh trại báo tin và nhận **Cờ Hiệu Xuất Kích** quay lại, người chơi tận mắt thấy nước triều đã dâng ngập bãi bùn, chạm vạch đỉnh Cột Mốc Đá và **che khuất toàn bộ bãi cọc ngầm**.
   - **Chặng 4 (Cao trào & Kết thúc)**: Trao Cờ Hiệu cho Trinh Sát Hải trên cầu tàu, kích hoạt cảnh cao trào (trống trận, tù và, thuyền nhẹ lao ra nhử thuyền lớn Nam Hán vượt qua bãi cọc lúc nước lớn, rồi nước triều rút mạnh làm lộ cọc nhọn chặn đứng thuyền giặc).

---

## 3. Hướng dẫn cài đặt và chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy máy chủ phát triển
npm run dev

# 3. Chạy kiểm thử tự động (Unit Tests)
npm test

# 4. Build sản phẩm (TypeScript + Vite)
npm run build

# 5. Chạy máy chủ xem trước bản build
npm run preview -- --port 5173 --host
```

---

## 4. Tài liệu kèm theo

- [CONTENT_FACTSHEET.md](file:///c:/Users/sontu/OneDrive/Desktop/su-viet-game/CONTENT_FACTSHEET.md): Báo cáo thẩm định sử liệu chi tiết, đối chiếu từng dữ kiện với *Đại Việt Sử Ký Toàn Thư* (Ngoại kỷ, Quyển V), *Khâm Định Việt Sử Thông Giám Cương Mục* (Tiền biên, Quyển V) và lưu ý phân biệt niên đại khảo cổ học.
- [ASSET_CATALOG.md](file:///c:/Users/sontu/OneDrive/Desktop/su-viet-game/ASSET_CATALOG.md): Danh mục tài nguyên hình ảnh 2D, quy ước tái hiện trang phục/kiến trúc thế kỷ X và bộ Prompt chuẩn để nâng cấp mỹ thuật.
