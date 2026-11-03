import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Hand } from 'lucide-react';
import { voiceManager } from '../../utils/voiceManager';

interface VirtualControlsProps {
  onMoveVector: (vx: number, vy: number) => void;
  onInteract: () => void;
  nearbyTargetName: string | null;
  disabled?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveVector,
  onInteract,
  nearbyTargetName,
  disabled = false,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const lastInteractTapRef = useRef<number>(0);

  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const maxRadius = 42;
  const deadzonePx = 7; // Vùng chết (deadzone ~16.5%) chống tự trôi nhân vật khi chạm nhẹ

  const resetJoystick = useCallback(() => {
    activePointerIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMoveVector(0, 0);
  }, [onMoveVector]);

  // Khi mở hội thoại/menu, mất focus cửa sổ hoặc chuyển tab trên điện thoại -> lập tức dừng nhân vật
  useEffect(() => {
    if (disabled) {
      resetJoystick();
    }
  }, [disabled, resetJoystick]);

  useEffect(() => {
    const handleWindowBlur = () => resetJoystick();
    const handleVisibility = () => {
      if (document.hidden) resetJoystick();
    };
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      onMoveVector(0, 0);
    };
  }, [resetJoystick, onMoveVector]);

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!baseRef.current || disabled) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    // Nếu nằm trong vùng chết (deadzone), giữ vận tốc = 0 để không tự trôi
    if (dist <= deadzonePx) {
      setKnobPos({ x: dx * 0.35, y: dy * 0.35 });
      onMoveVector(0, 0);
      return;
    }

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    // Chuẩn hóa độ lớn vector từ (deadzone..maxRadius) -> (0..1) để đi chéo không bao giờ nhanh hơn đi ngang
    const effectiveMag = (clampedDist - deadzonePx) / (maxRadius - deadzonePx);
    const vx = Math.cos(angle) * effectiveMag;
    const vy = Math.sin(angle) * effectiveMag;

    setKnobPos({ x: kx, y: ky });
    onMoveVector(vx, vy);
  };

  const handleInteractTrigger = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    const now = performance.now();
    // Chống kích hoạt kép (double-fire) trong 280ms
    if (now - lastInteractTapRef.current < 280) return;
    lastInteractTapRef.current = now;

    voiceManager.unlockAudio();
    if (!disabled && nearbyTargetName) {
      onInteract();
    }
  };

  if (disabled) return null;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.85rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.85rem, env(safe-area-inset-right))',
      }}
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-none flex items-end justify-between select-none touch-none"
    >
      {/* Cần điều khiển ảo bên trái (Hỗ trợ giữ ngón cái trái trong khi ngón phải bấm Tương tác) */}
      <div
        ref={baseRef}
        data-testid="virtual-joystick"
        onPointerDown={(e) => {
          e.stopPropagation();
          voiceManager.unlockAudio();
          activePointerIdRef.current = e.pointerId;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Ignore in synthetic test events
          }
          setIsDragging(true);
          updateJoystick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!isDragging || activePointerIdRef.current !== e.pointerId) return;
          updateJoystick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (activePointerIdRef.current === e.pointerId) {
            resetJoystick();
          }
        }}
        onPointerCancel={(e) => {
          if (activePointerIdRef.current === e.pointerId) {
            resetJoystick();
          }
        }}
        onLostPointerCapture={() => {
          resetJoystick();
        }}
        className="pointer-events-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-lacquer-dark/60 backdrop-blur-sm border-2 border-bronze/75 flex items-center justify-center relative touch-none shadow-lg"
        title="Kéo để di chuyển nhân vật"
      >
        <div className="absolute top-1.5 text-[9px] text-parchment-200/65 font-bold">B</div>
        <div className="absolute bottom-1.5 text-[9px] text-parchment-200/65 font-bold">N</div>
        <div className="absolute left-2 text-[9px] text-parchment-200/65 font-bold">T</div>
        <div className="absolute right-2 text-[9px] text-parchment-200/65 font-bold">Đ</div>

        {/* Vòng chỉ báo vùng chết (deadzone) nhẹ ở tâm */}
        <div className="w-4 h-4 rounded-full border border-parchment-200/25 pointer-events-none" />

        {/* Núm cần gạt */}
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
          className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-bronze-light to-bronze-dark border-2 border-parchment-100 shadow-md flex items-center justify-center pointer-events-none"
        >
          <div className="w-4 h-4 rounded-full bg-parchment-50/85" />
        </div>
      </div>

      {/* Nút Tương Tác bên phải (Tối thiểu >= 52px chiều cao, hỗ trợ chạm đa điểm đồng thời với Joystick) */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          data-testid="interact-button"
          onPointerDown={handleInteractTrigger}
          onClick={handleInteractTrigger}
          disabled={!nearbyTargetName}
          className={`min-h-[52px] min-w-[148px] px-4 sm:px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl border-2 transition-all active:scale-95 touch-none ${
            nearbyTargetName
              ? 'bg-crimson hover:bg-crimson-light text-white border-bronze-light cursor-pointer ring-2 ring-bronze/40'
              : 'bg-lacquer-dark/55 text-parchment-200/50 border-parchment-400/30 cursor-not-allowed'
          }`}
        >
          <Hand className="w-5 h-5 shrink-0" />
          <span className="truncate max-w-[190px] sm:max-w-[240px]">
            {nearbyTargetName ? `Tương tác: ${nearbyTargetName}` : 'Lại gần để tương tác'}
          </span>
        </button>
      </div>
    </div>
  );
};
