import React, { useEffect } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export interface DecoyInfo {
  id: string;
  title: string;
  location: string;
  warningNote: string;
  historicalTruth: string;
}

export const DECOYS_DATA: Record<string, DecoyInfo> = {
  DECOY_HUNTING_BOW: {
    id: 'DECOY_HUNTING_BOW',
    title: 'Thân Nỏ Tre Đan Thường (Nỏ Săn Dân Gian)',
    location: 'Bãi Luyện Bắn Dã Ngoại Phía Tây',
    warningNote:
      'CẢNH BÁO: Đây chỉ là nỏ săn thú thông thường bằng tre non của dân làng, chỉ bắn từng mũi tên một, không hề có rãnh liên châu và ngàm chịu lực của tướng Cao Lỗ!',
    historicalTruth:
      'Nỏ Thần Cổ Loa là nỏ liên châu đại quy mô, thân đẽo bằng gỗ dâu rừng chịu lực uốn kéo hàng trăm cân, khác biệt hoàn toàn với nỏ săn tre nứa dân gian.',
  },
  DECOY_IRON_ARROWS: {
    id: 'DECOY_IRON_ARROWS',
    title: 'Rương Tên Sắt Giặc Nam Việt (Vật Nghi Binh)',
    location: 'Doanh Trại Quân Sĩ Phía Bắc',
    warningNote:
      'BẪY CỦA GIAN TẾ: Rương này chứa mũi tên sắt rỉ sét do thám tử của Triệu Đà tuồn vào nhằm đánh tráo số lượng vũ khí thật của quân ta!',
    historicalTruth:
      'Năm 1959 tại Cầu Vực, các nhà khảo cổ đã chứng minh quân đội Âu Lạc dùng ĐỒNG THAU 3 CẠNH hình cánh én, có độ chuẩn xác và sát thương khí động học vượt trội tên sắt thô sơ.',
  },
  DECOY_SPY_LETTER: {
    id: 'DECOY_SPY_LETTER',
    title: 'Mật Thư Gián Điệp Nghi Binh Của Trọng Thủy',
    location: 'Gốc Cây Đa Bờ Hào Nước',
    warningNote:
      'MẬT THƯ GIẢ MẠO: "Lẫy nỏ đã được chuyển về Phiên Ngung..." - Đây là tin giả do gián điệp gài bẫy nhằm phân tán sự chú ý của quân bảo vệ thành!',
    historicalTruth:
      'Tướng quân Cao Lỗ đã lường trước dã tâm của giặc nên đã bí mật lập trận đồ niêm phong lẫy nỏ thật tại Đàn Tế Giếng Ngọc.',
  },
  DECOY_WELL_TRONG_THUY: {
    id: 'DECOY_WELL_TRONG_THUY',
    title: 'Giếng Ngọc Trọng Thủy - Mỵ Châu',
    location: 'Bờ Thành Ngoại Phía Đông Nam',
    warningNote:
      'KHẢO SÁT HIỆN TRƯỜNG: Nước giếng trong xanh thấu đáy, tương truyền đem ngọc trai rửa nước giếng này thì ngọc sáng lung linh. Nơi đây từng là nơi Trọng Thủy nhảy xuống tự vẫn sau nỗi ân hận tột cùng.',
    historicalTruth:
      'Đại Việt Sử Ký Toàn Thư chép: Trọng Thủy theo dấu lông ngỗng tìm đến bờ biển, thấy Mỵ Châu đã chết bèn ôm xác khóc lóc đem về táng ở Loa Thành, sau quá thương nhớ đâm đầu xuống giếng mà chết.',
  },
  DECOY_SILK_QUIVER: {
    id: 'DECOY_SILK_QUIVER',
    title: 'Hòm Ống Tên Thêu Gấm Nhà Hán',
    location: 'Doanh Trại Thành Trung',
    warningNote:
      'CẢNH BÁO TỬ HUYỆT: Ống tên này dùng mũi tên thép nhẹ kiểu Bắc Phương, không phù hợp với rãnh nỏ liên châu Âu Lạc, nếu nạp vào sẽ kẹt then nổ văng cung!',
    historicalTruth:
      'Nỏ thần Cổ Loa được thiết kế đặc thù cho mũi tên đồng 3 cạnh Cầu Vực với trọng tâm khí động học dồn về phía mũi tên, không thể dùng lẫn với tên ngoại lai.',
  },
  DECOY_GOLDEN_BOW: {
    id: 'DECOY_GOLDEN_BOW',
    title: 'Cung Gỗ Khảm Vàng Lễ Nghi',
    location: 'Kho Cung Đình Phía Đông',
    warningNote:
      'HIỆN VẬT LỄ NGHI: Đây là cung biểu diễn tế lễ mùa xuân của hoàng gia, tuy nạm vàng lộng lẫy nhưng lực bắn chỉ đạt 40 bước chân, không thể phòng thủ bờ thành!',
    historicalTruth:
      'Vũ khí thực chiến của tướng sĩ Âu Lạc là Nỏ Thần Cơ Khí có sức kéo 400 cân lực (400 lbs), bắn ra hàng chục mũi tên cùng lúc, uy lực vượt xa cung gỗ nghi lễ.',
  },
};

interface CoLoaDecoyModalProps {
  decoy: DecoyInfo | null;
  onClose: () => void;
}

export const CoLoaDecoyModal: React.FC<CoLoaDecoyModalProps> = ({ decoy, onClose }) => {
  useEffect(() => {
    if (decoy && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [decoy]);

  useEffect(() => {
    if (!decoy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [decoy, onClose]);

  if (!decoy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-parchment-100 border-4 border-crimson rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-crimson to-red-950 p-4 text-white flex items-center justify-between border-b-2 border-red-300/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-200 font-mono">
                Bẫy Nghi Binh • Thông Tin Giả Mạo
              </span>
              <h3 className="font-title text-base sm:text-lg font-bold text-white leading-tight">
                {decoy.title}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-black/40 text-white hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-lacquer">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 font-serif leading-relaxed">
            <p className="font-bold text-crimson mb-1">Đánh giá hiện trường:</p>
            <p>{decoy.warningNote}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-serif leading-relaxed">
            <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Kiến Thức Lịch Sử Thật:</span>
            </p>
            <p>{decoy.historicalTruth}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-parchment-200 border-t border-parchment-300 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-lacquer to-neutral-800 text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            [Phím E] Tiếp Tục Tìm Kiếm & Cảnh Giác
          </button>
        </div>
      </div>
    </div>
  );
};
