import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lacquer-dark/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-parchment-50 w-full max-w-md rounded-2xl border-4 border-crimson shadow-2xl p-6 text-lacquer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-crimson/10 border-2 border-crimson text-crimson flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-title text-xl font-bold text-center text-lacquer mb-2">
          Xác Nhận Xóa Tiến Trình Chơi?
        </h3>

        <p className="text-xs text-lacquer/80 text-center mb-4 leading-relaxed">
          Hành động này sẽ xóa toàn bộ mảnh sử đã thu thập, các dữ kiện đã mở khóa trong sổ tay và tiến trình hoàn thành chương. Bạn sẽ bắt đầu lại từ đầu như một học giả mới.
        </p>

        <div className="bg-parchment-200/80 p-3 rounded-lg border border-parchment-300 text-xs mb-4 text-center">
          Nhập chữ <span className="font-bold text-crimson tracking-wider">XOATATCA</span> vào bên dưới để xác nhận:
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="XOATATCA"
            className="w-full mt-2 px-3 py-2 bg-white border border-parchment-400 rounded text-center font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-crimson uppercase"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => { setConfirmText(''); onClose(); }}
            className="flex-1 py-2 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-lacquer font-medium text-xs transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'XOATATCA'}
            className={`flex-1 py-2 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
              confirmText === 'XOATATCA'
                ? 'bg-crimson hover:bg-crimson-light cursor-pointer'
                : 'bg-lacquer/30 cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};
