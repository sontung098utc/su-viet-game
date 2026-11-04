import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { CoLoa3DScene } from '../../game3d/CoLoa3DScene';
import { CoLoaHUD } from '../game3d/CoLoaHUD';
import { RelicInspectionModal } from '../game3d/RelicInspectionModal';
import { CoLoaPrologueModal } from '../game3d/CoLoaPrologueModal';
import { CoLoaPuzzleModal } from '../game3d/CoLoaPuzzleModal';
import { CoLoaDecoyModal, DECOYS_DATA, type DecoyInfo } from '../game3d/CoLoaDecoyModal';
import { useGame } from '../../context/GameContext';
import type { CoLoaRelicId } from '../../types';
import { CO_LOA_STORY } from '../../data/chapterCoLoa';

export const CoLoa3DScreen: React.FC = () => {
  const { progress, setScreen, toggleSound, openCodex, completeDailyExploration, openHistoricalMissions } = useGame();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CoLoa3DScene | null>(null);

  // Gameplay State
  const [collectedShards, setCollectedShards] = useState<CoLoaRelicId[]>(
    progress.coLoaProgress?.collectedShards || []
  );
  const [inspectedRelic, setInspectedRelic] = useState<CoLoaRelicId | null>(null);
  const [hoveredPrompt, setHoveredPrompt] = useState<{ id: string; name: string; prompt: string } | null>(null);
  const [compassYaw, setCompassYaw] = useState<number>(0);
  const [compassTargets, setCompassTargets] = useState<{ id: string; name: string; angle: number; distance: number }[]>([]);
  const [isCrossbowReady, setIsCrossbowReady] = useState<boolean>(collectedShards.length >= 3);
  const [isCrossbowAssembled, setIsCrossbowAssembled] = useState<boolean>(false);
  const [targetsHit, setTargetsHit] = useState<number>(0);
  const [isChapterVictory, setIsChapterVictory] = useState<boolean>(false);

  // Modal States (Prologue, Puzzles, Decoys)
  const [isPrologueOpen, setIsPrologueOpen] = useState<boolean>(
    !progress.coLoaProgress?.chapterCompleted && collectedShards.length === 0
  );
  const [activePuzzleRelic, setActivePuzzleRelic] = useState<CoLoaRelicId | null>(null);
  const [activeDecoy, setActiveDecoy] = useState<DecoyInfo | null>(null);

  // Khởi tạo Scene 3D
  useEffect(() => {
    if (!mountRef.current) return;
    completeDailyExploration('EXPLORE_CO_LOA');

    const sceneInstance = new CoLoa3DScene(
      mountRef.current,
      {
        onHoverInteractable: (info) => {
          setHoveredPrompt(info);
        },
        onOpenPuzzle: (relicId) => {
          setActivePuzzleRelic(relicId);
        },
        onInspectRelic: (relicId) => {
          completeDailyExploration('INSPECT_RELIC');
          setCollectedShards((prev) => {
            const next = Array.from(new Set([...prev, relicId]));
            if (next.length >= 3) {
              setIsCrossbowReady(true);
            }
            return next;
          });
          setInspectedRelic(relicId);
        },
        onInspectDecoy: (decoyId) => {
          const decoy = DECOYS_DATA[decoyId];
          if (decoy) {
            setActiveDecoy(decoy);
          }
        },
        onCrossbowReadyToAssemble: () => {
          setIsCrossbowAssembled(true);
        },
        onTargetHit: (count) => {
          setTargetsHit(count);
        },
        onChapterComplete: () => {
          setIsChapterVictory(true);
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 },
          });
        },
        onCompassUpdate: (yaw, targets) => {
          setCompassYaw(yaw);
          setCompassTargets(targets);
        },
      },
      collectedShards
    );

    sceneRef.current = sceneInstance;

    return () => {
      sceneInstance.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Xử lý khi giải mã thành công câu đố
  const handleSolvePuzzleSuccess = (relicId: CoLoaRelicId) => {
    setActivePuzzleRelic(null);
    if (sceneRef.current) {
      sceneRef.current.grantSolvedRelic(relicId);
    }
  };

  const handleInteractClick = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.handleInteractKey();
    }
  }, []);

  const handleMobileMove = useCallback((x: number, y: number) => {
    if (sceneRef.current) {
      sceneRef.current.setMobileMoveVector(x, y);
    }
  }, []);

  const handleExitToMenu = () => {
    setScreen('START');
  };

  const handleRestartChapter = () => {
    setCollectedShards([]);
    setInspectedRelic(null);
    setActivePuzzleRelic(null);
    setActiveDecoy(null);
    setIsCrossbowReady(false);
    setIsCrossbowAssembled(false);
    setTargetsHit(0);
    setIsChapterVictory(false);
    setScreen('START');
    setTimeout(() => {
      setScreen('GAME_3D_CO_LOA');
    }, 50);
  };

  const handleContinueToBachDang = () => {
    setScreen('GAME');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* 3D First-Person HUD */}
      <CoLoaHUD
        collectedShards={collectedShards}
        hoveredPrompt={hoveredPrompt}
        compassYaw={compassYaw}
        compassTargets={compassTargets}
        isCrossbowReady={isCrossbowReady}
        isCrossbowAssembled={isCrossbowAssembled}
        targetsHit={targetsHit}
        onInteractClick={handleInteractClick}
        onExitToMenu={handleExitToMenu}
        onOpenCodex={openCodex}
        onOpenHistoricalMissions={() => openHistoricalMissions('MISSION_CO_LOA_BALLISTICS')}
        soundEnabled={progress.soundEnabled}
        onToggleSound={toggleSound}
        onMobileMove={handleMobileMove}
      />

      {/* 1. Màn Hình Dẫn Truyện Khởi Đầu (Prologue Intro) */}
      <CoLoaPrologueModal
        isOpen={isPrologueOpen}
        onStart={() => setIsPrologueOpen(false)}
      />

      {/* 2. Màn Hình Cơ Quan Giải Mật Mã Cổ (Puzzles) */}
      <CoLoaPuzzleModal
        relicId={activePuzzleRelic}
        isOpen={Boolean(activePuzzleRelic)}
        onSolveSuccess={handleSolvePuzzleSuccess}
        onClose={() => setActivePuzzleRelic(null)}
      />

      {/* 3. Màn Hình Cảnh Báo Bẫy Nghi Binh / Tin Giả (Decoys) */}
      <CoLoaDecoyModal
        decoy={activeDecoy}
        onClose={() => setActiveDecoy(null)}
      />

      {/* 4. Khảo Sát Cổ Vật 3D Xoay 360 Độ (Relic 3D Inspection) */}
      <RelicInspectionModal
        relicId={inspectedRelic}
        onClose={() => setInspectedRelic(null)}
      />

      {/* 5. Cột Mốc Vinh Quang & Phục Dựng Lịch Sử (Chapter Victory) */}
      {isChapterVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-xl w-full bg-parchment-100 border-4 border-bronze rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-bronze pointer-events-none opacity-60" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-bronze pointer-events-none opacity-60" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-bronze pointer-events-none opacity-60" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-bronze pointer-events-none opacity-60" />

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 mx-auto mb-4 flex items-center justify-center shadow-xl border-2 border-white">
              <Trophy className="w-8 h-8 text-lacquer animate-bounce" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-crimson uppercase tracking-wider mb-2">
              Thời Khắc Phục Dựng Lịch Sử Thành Công!
            </div>

            <h2 className="font-title text-2xl sm:text-3xl font-extrabold text-lacquer mb-3">
              NỎ THẦN LIÊN CHÂU • THÀNH CỔ LOA
            </h2>

            <p className="text-xs sm:text-sm text-lacquer/90 font-serif leading-relaxed mb-5 bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-justify">
              {CO_LOA_STORY.epilogueText}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-lacquer">
              <div className="p-2.5 rounded-lg bg-parchment-200 border border-bronze/40">
                <div className="font-bold text-crimson">Thân Nỏ</div>
                <div className="text-[11px] text-lacquer/80">Gỗ dâu rừng</div>
              </div>
              <div className="p-2.5 rounded-lg bg-parchment-200 border border-bronze/40">
                <div className="font-bold text-crimson">Lẫy Móng Rùa</div>
                <div className="text-[11px] text-lacquer/80">Khóa hãm đồng</div>
              </div>
              <div className="p-2.5 rounded-lg bg-parchment-200 border border-bronze/40">
                <div className="font-bold text-crimson">Mũi Tên</div>
                <div className="text-[11px] text-lacquer/80">Ba cạnh Cầu Vực</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleRestartChapter}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-parchment-300 bg-parchment-200 hover:bg-parchment-300 text-lacquer text-xs font-semibold transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-lacquer" />
                <span>Chơi lại Chương 1</span>
              </button>

              <button
                onClick={handleContinueToBachDang}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-crimson to-amber-700 hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tiến sang Chương 2: Bạch Đằng 938</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
