import React from 'react';
import { X, Compass } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-lacquer-dark/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-parchment-50 w-full max-w-2xl max-h-[90vh] rounded-2xl border-4 border-bronze shadow-2xl flex flex-col overflow-hidden text-lacquer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-parchment-200 border-b border-parchment-300 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-crimson" />
            <h2 className="font-title text-lg sm:text-xl font-bold text-lacquer">
              Hướng Dẫn Điều Khiển & Khám Phá 2D
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-parchment-300 text-lacquer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3.5 text-sm text-lacquer-light">
          <div className="p-3.5 rounded-xl bg-parchment-200/80 border border-bronze/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center shrink-0 font-bold text-xs">
              PC
            </div>
            <div>
              <h3 className="font-bold text-lacquer text-sm">Điều khiển trên Máy tính</h3>
              <p className="text-xs text-lacquer/80 mt-0.5 leading-relaxed">
                • Dùng các phím <strong>W, A, S, D</strong> hoặc <strong>Phím Mũi Tên</strong> để điều khiển nhân vật đi lại tự do giữa 3 khu vực.<br />
                • Khi đến gần NPC hoặc vật phẩm có nhãn nổi lên, nhấn phím <strong>[E]</strong> hoặc <strong>[Space]</strong> để trò chuyện / tương tác.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-parchment-200/80 border border-bronze/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-river-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              ĐT
            </div>
            <div>
              <h3 className="font-bold text-lacquer text-sm">Điều khiển trên Điện thoại / Máy tính bảng</h3>
              <p className="text-xs text-lacquer/80 mt-0.5 leading-relaxed">
                • Kéo <strong>Cần điều khiển ảo (góc dưới bên trái)</strong> để di chuyển.<br />
                • Chạm vào <strong>Nút Tương Tác [E] (góc dưới bên phải)</strong> khi lại gần nhân vật hoặc vật thể.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-parchment-200/80 border border-bronze/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="font-bold text-lacquer text-sm">Ba Khu Vực Liên Thông Trong Thế Giới</h3>
              <p className="text-xs text-lacquer/80 mt-0.5 leading-relaxed">
                • <strong>Khu A — Làng Ven Sông (Phía Tây):</strong> Nơi xuất phát, gặp Cụ Trưởng Thôn và lấy Bao Than Củi ở bến nhỏ.<br />
                • <strong>Khu B — Khu Chuẩn Bị (Phía Đông Bắc):</strong> Nơi gặp Đội Trưởng Lê, Lò Rèn của Bác Tạo và bãi vạt cọc bịt sắt.<br />
                • <strong>Khu C — Bến Quan Sát Dòng Sông (Phía Đông Nam):</strong> Nơi có Cột Mốc Đá đo mực nước, Trinh Sát Hải và bãi cọc cửa biển.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-200 border-t border-parchment-300 p-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-crimson hover:bg-crimson-light text-white font-semibold text-xs sm:text-sm shadow transition-all active:scale-95"
          >
            Sẵn sàng lên đường!
          </button>
        </div>
      </div>
    </div>
  );
};
