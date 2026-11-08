/**
 * tideAndStealth.ts
 * Module tính toán chu kỳ Thủy triều Bạch Đằng (180 giây) & Hệ thống Lén lút / Tầm nhìn địch
 * Dùng cho cả Phaser 2D World Scene và bộ kiểm thử tự động Vitest
 */

export interface DynamicTideStatus {
  elapsedSeconds: number;
  cycleProgress: number; // 0.0 -> 1.0
  phase: 'LOW_TIDE' | 'RISING_TIDE' | 'HIGH_TIDE' | 'EBBING_TIDE';
  waterLevel: number; // 0.0 (cạn nhất) -> 1.0 (ngập đỉnh)
  phaseLabel: string;
  isLowCausewayFlooded: boolean;
  speedMultiplier: number; // 1.0 (bình thường), 0.5 (lội nước cạn/trượt bùn), 0.0 (ngập sâu không qua được)
}

/**
 * Tính toán trạng thái thủy triều động theo thời gian thực (chu kỳ 180 giây)
 * @param elapsedSeconds Số giây đã trôi qua
 * @param onLowCauseway Người chơi có đang đứng trên Lối Đá Thấp hay không
 */
export function calculateDynamicTide(elapsedSeconds: number, onLowCauseway: boolean = false): DynamicTideStatus {
  const CYCLE_DURATION = 180;
  const t = Math.max(0, elapsedSeconds) % CYCLE_DURATION;
  const progress = t / CYCLE_DURATION;

  let phase: DynamicTideStatus['phase'] = 'LOW_TIDE';
  let waterLevel = 0;
  let phaseLabel = 'Nước Ròng (Bãi cọc lộ rõ)';

  if (t < 45) {
    // 0 - 45s: Nước ròng kiệt
    phase = 'LOW_TIDE';
    waterLevel = 0.08 + (t / 45) * 0.17; // 0.08 -> 0.25
    phaseLabel = 'Nước Ròng (Triều kiệt)';
  } else if (t < 95) {
    // 45 - 95s: Nước dâng nhanh
    phase = 'RISING_TIDE';
    const subProgress = (t - 45) / 50;
    waterLevel = 0.25 + subProgress * 0.7; // 0.25 -> 0.95
    phaseLabel = 'Triều Dâng (Nước ngập dần cọc)';
  } else if (t < 135) {
    // 95 - 135s: Đỉnh triều / Nước lớn
    phase = 'HIGH_TIDE';
    waterLevel = 0.95 + Math.sin((t - 95) * 0.1) * 0.05; // 0.95 -> 1.0
    phaseLabel = 'Đỉnh Triều (Bãi cọc chìm sâu)';
  } else {
    // 135 - 180s: Triều rút mạnh
    phase = 'EBBING_TIDE';
    const subProgress = (t - 135) / 45;
    waterLevel = 1.0 - subProgress * 0.92; // 1.0 -> 0.08
    phaseLabel = 'Triều Rút (Dòng xiết lộ cọc)';
  }

  const isLowCausewayFlooded = waterLevel > 0.45;
  let speedMultiplier = 1.0;

  if (onLowCauseway) {
    if (waterLevel > 0.75) {
      // Ngập sâu: hoàn toàn bị chặn đứng
      speedMultiplier = 0.0;
    } else if (waterLevel > 0.35) {
      // Nước ngập vừa: giảm 50% tốc độ di chuyển
      speedMultiplier = 0.5;
    }
  }

  return {
    elapsedSeconds,
    cycleProgress: progress,
    phase,
    waterLevel: Math.max(0, Math.min(1, waterLevel)),
    phaseLabel,
    isLowCausewayFlooded,
    speedMultiplier,
  };
}

export interface DetectionResult {
  isDetected: boolean;
  isStealthed: boolean;
  distance: number;
  inAngle: boolean;
}

/**
 * Đánh giá tính toán tầm nhìn lính tuần tra Nam Hán và trạng thái lén lút trong bụi sậy
 */
export function evaluateStealthDetection(
  player: { x: number; y: number },
  isInsideReeds: boolean,
  scout: { x: number; y: number; facingAngleRad: number; fovDegrees?: number; fovRange?: number }
): DetectionResult {
  const fovRange = scout.fovRange || 170;
  const fovAngleDeg = scout.fovDegrees || 70;
  const fovHalfRad = (fovAngleDeg * Math.PI) / 360;

  const dx = player.x - scout.x;
  const dy = player.y - scout.y;
  const distance = Math.hypot(dx, dy);

  if (distance > fovRange) {
    return { isDetected: false, isStealthed: isInsideReeds, distance, inAngle: false };
  }

  const angleToPlayer = Math.atan2(dy, dx);
  let angleDiff = Math.abs(angleToPlayer - scout.facingAngleRad);
  while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

  const inAngle = angleDiff <= fovHalfRad;

  // QUY TẮC CỐT LÕI: Khi người chơi nấp trong bụi sậy, hoàn toàn tàng hình trước lính giặc!
  const isDetected = !isInsideReeds && inAngle && distance <= fovRange;

  return {
    isDetected,
    isStealthed: isInsideReeds,
    distance,
    inAngle,
  };
}

/**
 * Tính toán quỹ đạo va chạm đạn nỏ thần liên châu với bè gỗ địch
 */
export function checkCrossbowArrowHit(
  arrowPos: { x: number; y: number; z: number },
  raftPos: { x: number; y: number; z: number },
  hitRadius: number = 2.4
): boolean {
  const dx = arrowPos.x - raftPos.x;
  const dy = arrowPos.y - raftPos.y;
  const dz = arrowPos.z - raftPos.z;
  const distSq = dx * dx + dy * dy + dz * dz;
  return distSq <= hitRadius * hitRadius;
}
