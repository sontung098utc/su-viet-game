import React from 'react';
import { Shield, Sparkles, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CoLoaPrologueModalProps {
  isOpen: boolean;
  onStart: () => void;
}

export const CoLoaPrologueModal: React.FC<CoLoaPrologueModalProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  const handleStart = () => {
    sound.playBronzeDrum();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-parchment-100 border-4 border-bronze rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
        {/* Họa tiết góc cổ phong */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-bronze pointer-events-none opacity-60" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-bronze pointer-events-none opacity-60" />

        {/* Banner tiêu đề */}
        <div className="bg-gradient-to-r from-lacquer via-crimson to-lacquer p-4 text-center text-parchment-100 border-b-2 border-bronze/60 shadow-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-400/40 text-amber-300 text-xs font-mono uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Kỷ Nguyên Âu Lạc • Năm 257 TCN</span>
          </div>
          <h2 className="font-title text-2xl sm:text-3xl font-extrabold text-amber-200 tracking-tight">
            CỔ LOA — NỎ THẦN KIM QUY
          </h2>
          <p className="font-serif italic text-xs sm:text-sm text-parchment-200/90 mt-1">
            Bảo vệ thần khí trấn quốc trước dã tâm xâm lăng của Triệu Đà
          </p>
        </div>

        {/* Nội dung lời dẫn truyện */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-lacquer leading-relaxed">
          {/* Lời dẫn lịch sử */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="font-bold text-crimson uppercase tracking-wider text-xs flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-crimson" />
              <span>Bối Cảnh Lịch Sử</span>
            </div>
            <p className="font-serif text-justify text-lacquer/90 leading-relaxed">
              Vua <strong>Thục Phán</strong> xưng <strong>An Dương Vương</strong>, định đô ở Phong Khê và cho xây đắp tòa thành Cổ Loa hình trôn ốc 9 vòng kỳ vĩ. Nhờ sự phò tá của tướng quân <strong>Cao Lỗ</strong> và thần tích <strong>Kim Quy</strong>, Đại Việt chế tạo thành công chiếc <em>Linh Quang Kim Trảo Thần Nỏ</em> — kỳ tích quân sự có thể bắn liên châu hàng chục mũi tên đồng cùng lúc.
            </p>
          </div>

          {/* Tình thế khẩn cấp */}
          <div className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200 space-y-2">
            <div className="font-bold text-red-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-crimson" />
              <span>Tình Thế Khẩn Cấp & Bẫy Nghi Binh Của Gian Tế</span>
            </div>
            <p className="font-serif text-justify text-lacquer/90 leading-relaxed">
              Quân Nam Việt của Triệu Đà đang rình rập ngoài bờ cõi. Gian tế đang tìm mọi cách do thám nhằm đánh cắp bí mật chế tạo nỏ. Để bảo mật, tướng Cao Lỗ đã <strong>phong ấn 3 cơ phận then chốt</strong> bằng các mật mã cơ khí cổ và rải nhiều <strong>thông tin giả mạo</strong> (nỏ săn thường, mũi tên sắt giặc, thư từ nghi binh) để đánh lừa kẻ thù!
            </p>
          </div>

          {/* Nhiệm vụ người chơi */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Nhiệm Vụ Của Bạn (Người Lưu Trữ Thời Không)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-lacquer/85 font-serif pl-1">
              <li>Lần theo la bàn để định vị các khu vực trong thành Cổ Loa 3D.</li>
              <li>Phân biệt thật - giả: Tránh bị đánh lừa bởi khí tài giả mạo của gian tế.</li>
              <li>Giải mã 3 cơ quan mật mã tại <strong>Lò Rèn Cao Lỗ</strong>, <strong>Đàn Tế Giếng Ngọc</strong> và <strong>Kho Khí Giới</strong>.</li>
              <li>Lên đài bờ thành lắp ráp Nỏ Thần và bắn thử nghiệm chặn đứng quân thù!</li>
            </ul>
          </div>
        </div>

        {/* Nút bắt đầu */}
        <div className="p-4 bg-parchment-200 border-t border-parchment-300 flex justify-center">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-crimson via-amber-700 to-crimson hover:brightness-110 active:scale-95 text-white font-bold text-sm sm:text-base shadow-xl transition-all border-2 border-bronze cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Bước Vào Thành Cổ Loa</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
