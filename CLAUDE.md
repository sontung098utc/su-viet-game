# Mật Mã Sử Việt — Game Studio Agent Architecture

Dự án phát triển trò chơi phiêu lưu giải đố lịch sử Việt Nam ("Mật Mã Sử Việt") được điều phối qua 49 Claude Code Subagents và 74 Game Skills từ Claude Code Game Studios.

## 1. Công nghệ & Nền tảng (Technology Stack)

- **Frontend Core**: React 19 + TypeScript + Vite + Tailwind CSS
- **Game Engine & Rendering**:
  - Three.js: Màn phiêu lưu 3D Thành Cổ Loa, nỏ thần, sa bàn Bạch Đằng
  - Phaser 4: Các mini-game 2D, giải đố, cơ chế chiến thuật
  - Canvas Confetti & Web Audio API: Hiệu ứng chiến thắng, âm thanh nhạc cụ dân tộc
- **Testing & Quality Assurance**: Vitest (Unit & Integration tests)
- **Code Linter**: Oxlint
- **Build Output**: `dist/` (Tối ưu hóa chạy trên Web & Mobile Browser)

## 2. Các lệnh phát triển nhanh (Development Commands)

- Chạy dev server: `npm run dev` (cổng 3000)
- Chạy test kiểm thử: `npm test`
- Build sản phẩm: `npm run build`
- Kiểm tra lint: `npm run lint`

## 3. Cấu trúc Studio & Thư mục Dự án

- `src/`: Mã nguồn giao diện, màn chơi (Adventure, Cổ Loa 3D, Summary), modals, context
- `src/data/`: Dữ liệu câu đố lịch sử, thành tựu (`achievements.ts`), nhiệm vụ (`dailyMissions.ts`, `historicalMissions.ts`)
- `public/`: Tài nguyên âm thanh (trống đồng, nỏ thần), hình ảnh, 3D models
- `design/`: Tài liệu Game Design Documents (GDD), kịch bản chi tiết, cơ chế gameplay
- `production/`: Quản lý sprints, user stories và bằng chứng QA test
- `.claude/`: 49 Agents chuyên trách (Game Designer, Narrative Director, Three.js/Gameplay Programmer, QA Lead) và 74 Skills điều phối

## 4. Tài liệu Lịch sử & Kịch bản Tham chiếu

- `CONTENT_FACTSHEET.md`: Bộ dữ liệu sự kiện lịch sử đã được kiểm chứng (Bạch Đằng 938, Cổ Loa An Dương Vương, Nỏ Liên Châu)
- `ASSET_CATALOG.md`: Danh mục tài nguyên đồ họa và âm thanh
- `VOICE_SCRIPT_EXPORT.md`: Kịch bản hội thoại và lồng tiếng các nhân vật lịch sử

## 5. Quy tắc phối hợp Studio (Studio Coordination Rules)

1. **Bảo tồn tính xác thực lịch sử**: Mọi câu đố, tình tiết và nhân vật phải bám sát `CONTENT_FACTSHEET.md`.
2. **Kiểm thử trước khi đóng story**: Chạy `npm test` và `npm run build` đảm bảo không có lỗi TypeScript hay vỡ chunk.
3. **Trải nghiệm trực quan (Visual Verification)**: Mọi thay đổi về UI, màn 3D Cổ Loa phải được kiểm tra hiển thị mượt mà trên cả màn hình máy tính và điện thoại.
