# DANH MỤC TÀI NGUYÊN HÌNH ẢNH 2D & PROMPT BỔ SUNG MỸ THUẬT
### Dự án: MẬT MÃ SỬ VIỆT — Thế giới 2D Bạch Đằng Năm 938

---

## 1. HIỆN TRẠNG TÀI NGUYÊN TRONG BẢN BÀN GIAO

Trong bản chơi mẫu hiện tại, toàn bộ nhân vật, NPC, chân dung đối thoại, công trình và vật thể môi trường được kết xuất bằng **Vector / Canvas 2D nhiều lớp (`src/game/assets/AssetGenerator.ts` và `src/components/game/Portraits.tsx`)** với hình dáng cơ thể, khuôn mặt, trang phục, công cụ và 4 frame hoạt ảnh bước đi rõ ràng (không sử dụng hình tròn, hình chữ nhật đơn điệu hay emoji).

Tuy nhiên, đây vẫn là **đồ họa Vector/Canvas lập trình ước lệ (Procedural Illustrated Sprites)** chứ chưa phải bộ tranh vẽ tay frame-by-frame hoàn thiện từ họa sĩ 2D chuyên nghiệp. Dưới đây là danh mục đầy đủ các tài nguyên hiện có, mức độ giả định lịch sử và bộ Prompt chuẩn để đội ngũ mỹ thuật / công cụ AI tạo ảnh bổ sung trong giai đoạn sản xuất tiếp theo.

---

## 2. MỨC ĐỘ GIẢ ĐỊNH VỀ TRANG PHỤC, KIẾN TRÚC & VẬT DỤNG THẾ KỶ X (NĂM 938)

Do tư liệu hình ảnh trực quan về thế kỷ X (thời kỳ khúc giao thời tự chủ — Tiền Ngô Vương) tại Việt Nam còn rất hạn chế, các thiết kế trong game áp dụng quy tắc **tái hiện ước lệ có kiểm soát**:
- **Trang phục dân thường & người đưa tin**: Áo ngắn hoặc áo giao lĩnh (cổ chéo chữ Y) vải thô màu nâu sồng hoặc lam chàm, quần vải, thắt lưng vải, tóc búi đỉnh đầu và quấn khăn vải quanh trán. (Mức độ: *Ước lệ dân gian cổ phong Việt Nam, tránh dùng mũ mão quan lại triều Nguyễn hoặc giáp trụ thời Minh/Thanh*).
- **Trang phục quân sĩ & chỉ huy**: Quân sĩ mặc áo chàm/đỏ sẫm gọn gàng, đội khăn đầu rìu hoặc nón lá đeo lưng; người chỉ huy mặc giáp hộ tâm bằng da/vải dày đính đinh đồng, Tiền Ngô Vương mặc áo bào đỏ son và giáp đồng mũ Đâu Mâu ước lệ.
- **Kiến trúc & Vật dụng**: Nhà dân vùng ven sông dựng bằng gỗ tre, vách đất, mái lợp lá cọ/rơm; lều doanh trại dã chiến bằng vải thô và cọc gỗ; lò rèn dã chiến gồm bệ đá đốt than củi, đe sắt và thùng gỗ đựng nước tôi; cọc gỗ lớn vạt nhọn bọc mũi sắt theo đúng mô tả trong *Đại Việt Sử Ký Toàn Thư*.

---

## 3. DANH MỤC ASSET & PROMPT HÌNH ẢNH ĐỂ NÂNG CẤP MỸ THUẬT

| Mã Asset | Loại Tài Nguyên | Kích Thước Khuyến Nghị | Trạng Thái Hiện Tại | Prompt Tạo Hình Ảnh (Đồng bộ phong cách 2D Top-Down Illustrated RPG) |
| :--- | :--- | :--- | :--- | :--- |
| `player_brown` / `player_indigo` | Spritesheet Nhân vật chính (4 hướng × 4 frame) | `256x288 px` (`64x72` mỗi frame) | Canvas 2D 4-frame (Đứng thở & Bước đi) | *"2D top-down RPG character spritesheet, 4 directions, 4-frame walk cycle, young 10th-century Vietnamese messenger, wearing traditional brown/indigo cross-collar tunic (ao giao linh), red cloth headband, carrying a woven bamboo message scroll pouch across chest, clean hand-drawn ink and warm watercolor style, transparent background"* |
| `npc_elder` | Spritesheet Cụ Trưởng Thôn | `256x288 px` | Canvas 2D có râu bạc & gậy trúc | *"2D top-down RPG NPC spritesheet, elderly 10th-century Vietnamese village chief, white hair in topknot, long white beard, wearing dark brown traditional cross-collar robe, holding a bamboo walking staff, warm hand-drawn 2D illustration, transparent background"* |
| `npc_commander` | Spritesheet Đội Trưởng Lê | `256x288 px` | Canvas 2D giáp hộ tâm & khăn đỏ | *"2D top-down RPG NPC spritesheet, 10th-century Vietnamese military officer, wearing crimson tunic with bronze-studded leather chest armor, red headband with bronze plate, resolute expression, hand-drawn 2D historical illustration, transparent background"* |
| `npc_blacksmith` | Spritesheet Bác Thợ Rèn Tạo | `256x288 px` | Canvas 2D tạp dề da & vung búa | *"2D top-down RPG NPC spritesheet, muscular 10th-century Vietnamese blacksmith hammering iron, wearing dark leather apron over ochre tunic, holding iron hammer, warm hand-drawn 2D game art, transparent background"* |
| `npc_scout` | Spritesheet Trinh Sát Hải | `256x288 px` | Canvas 2D áo chàm & nón lá đeo lưng | *"2D top-down RPG NPC spritesheet, 10th-century Vietnamese river scout, wearing indigo tunic, traditional conical bamboo hat slung on back, agile posture, hand-drawn 2D game art, transparent background"* |
| `house_thatch` | Công trình Nhà tranh vách đất | `180x140 px` | Canvas 2D mái rơm & vách đất | *"2D top-down RPG building asset, ancient 10th-century northern Vietnamese thatched roof house, mud-plastered walls, wooden porch, palm-leaf roof with layered straw texture, warm painterly 2D style, transparent background"* |
| `forge_station` | Lò rèn dã chiến & Đe sắt | `140x110 px` | Canvas 2D có lửa hồng & thùng nước | *"2D top-down RPG prop, medieval Vietnamese field blacksmith forge, stone hearth with glowing orange charcoal embers, iron anvil, wooden water quenching barrel, hand-drawn 2D illustration, transparent background"* |
| `river_stake` | Cọc gỗ vạt nhọn bịt sắt | `36x64 px` | Canvas 2D thân gỗ & mũi sắt | *"2D top-down RPG prop, large sharpened wooden stake with forged iron cap protruding from river water, ripples around base, hand-drawn 2D historical game asset, transparent background"* |
| `boat_scout` & `boat_enemy` | Thuyền nhẹ quân ta & Chiến thuyền Nam Hán | `130x56 px` & `170x76 px` | Canvas 2D thuyền gỗ mũi cong | *"2D top-down RPG wooden river boats: (1) agile 10th-century Vietnamese light wooden scout boat with oars; (2) large heavy Southern Han wooden warship with deck cabin, hand-drawn 2D historical style, transparent background"* |
| `portraits/*` | Chân dung hội thoại (6 nhân vật) | `512x512 px` | SVG Minh họa đa lớp (`Portraits.tsx`) | *"2D half-body character portrait for historical RPG dialogue box, 10th-century Vietnam Bach Dang 938 setting, expressive face, traditional cross-collar attire, warm parchment and ink-wash aesthetic"* |
