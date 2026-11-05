import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { useGame } from '../../context/GameContext';
import { BachDangWorldScene } from '../../game/scenes/BachDangWorldScene';
import {
  QUEST_OBJECTIVES,
  INVENTORY_ITEMS,
  HISTORICAL_FACTS_CH1,
  VISUAL_CLUES,
  ALL_CLUE_IDS,
} from '../../data/chapter1';
import {
  CHARACTER_VOICE_CONFIGS,
  DIALOGUE_SCRIPTS,
  interpolatePlayerText,
} from '../../data/voiceDialogue';
import type { CipherPuzzleId, DialogueLine, VisualClue } from '../../types';
import { CharacterPortrait } from '../game/Portraits';
import { VirtualControls } from '../game/VirtualControls';
import { voiceManager, type VoicePlaybackState } from '../../utils/voiceManager';
import {
  BookOpen,
  Compass,
  Volume2,
  VolumeX,
  Package,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Home,
  Award,
  Sliders,
  RotateCw,
  Mic,
  MicOff,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Smartphone,
  X,
  Zap,
  CheckCircle2,
  Lock,
  KeyRound,
  Scroll,
  Trophy,
} from 'lucide-react';

export const AdventureGameScreen: React.FC = () => {
  const {
    progress,
    openCodex,
    toggleSound,
    updateAudioSettings,
    toggleReducedEffects,
    setScreen,
    advanceQuest,
    unlockFact,
    unlockClue,
    recordChallengeAttempt,
    savePlayerPosition,
    markMarkerObserved,
    markHelpedVillager,
    restartAdventure,
    newFactToast,
    clearFactToast,
    openCipherPuzzle,
    activeCipherPuzzle,
    openDailyMissions,
    openHistoricalMissions,
    openAchievements,
  } = useGame();

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<BachDangWorldScene | null>(null);
  const dialogueOpenedAtRef = useRef<number>(0);

  const [currentZone, setCurrentZone] = useState<'VILLAGE' | 'CAMP' | 'RIVER'>(
    progress.playerPosition.zone || 'VILLAGE'
  );
  const [nearbyPrompt, setNearbyPrompt] = useState<string | null>(null);
  const [dialogueQueue, setDialogueQueue] = useState<DialogueLine[]>([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const dialogueFinishCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Hệ thống gợi ý tăng dần 3 mức (0 = ẩn, 1 = mức 1, 2 = mức 2, 3 = mức 3)
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);
  const [showClueNotebook, setShowClueNotebook] = useState(false);
  const [showMenuPopover, setShowMenuPopover] = useState(false);
  const [showAudioPopover, setShowAudioPopover] = useState(false);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  // Phát hiện màn hình dọc trên thiết bị di động để gợi ý xoay ngang nhẹ nhàng (không khóa màn hình)
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth && window.innerWidth < 768;
  });
  const [dismissedPortraitNotice, setDismissedPortraitNotice] = useState(false);

  const [voiceState, setVoiceState] = useState<VoicePlaybackState>({
    isPlaying: false,
    activeLineId: null,
    mode: 'idle',
    errorMessage: null,
  });

  const isDialogueOpen = dialogueQueue.length > 0;
  const activeObjective =
    QUEST_OBJECTIVES[progress.questStage] || QUEST_OBJECTIVES.STAGE_0_PROLOGUE;

  // Khi sang giai đoạn nhiệm vụ mới, đặt lại mức gợi ý về 0
  useEffect(() => {
    setHintLevel(0);
  }, [progress.questStage]);

  // Lấy vật phẩm nhiệm vụ chính đang mang
  const primaryHeldItem =
    progress.inventory.length > 0
      ? INVENTORY_ITEMS[progress.inventory[progress.inventory.length - 1]]
      : null;

  // Đăng ký nhận trạng thái phát giọng nói từ VoiceManager
  useEffect(() => {
    return voiceManager.subscribe((st) => {
      setVoiceState(st);
    });
  }, []);

  // Dừng giọng nói khi tháo component
  useEffect(() => {
    return () => {
      voiceManager.stop();
    };
  }, []);

  // Lắng nghe thay đổi kích thước khung nhìn, thanh địa chỉ trình duyệt mobile (visualViewport) và xoay màn hình
  useEffect(() => {
    const handleViewportUpdate = () => {
      const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setIsPortraitMobile(vh > vw && vw < 768);
      if (phaserGameRef.current && phaserGameRef.current.scale) {
        phaserGameRef.current.scale.resize(vw, vh);
      }
    };

    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('orientationchange', handleViewportUpdate);
    window.visualViewport?.addEventListener('resize', handleViewportUpdate);

    return () => {
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('orientationchange', handleViewportUpdate);
      window.visualViewport?.removeEventListener('resize', handleViewportUpdate);
    };
  }, []);

  const handleOpenDialogue = useCallback(
    (lines: DialogueLine[], onFinish?: () => void) => {
      if (!lines || lines.length === 0) return;
      voiceManager.stop();
      voiceManager.preloadDialogueLines(lines);

      dialogueOpenedAtRef.current = performance.now();
      setDialogueQueue(lines);
      setDialogueIndex(0);
      dialogueFinishCallbackRef.current = onFinish;

      if (lines[0].unlockFactId) {
        unlockFact(lines[0].unlockFactId);
      }
      if (lines[0].unlockClueId) {
        unlockClue(lines[0].unlockClueId);
      }
      voiceManager.playLine(lines[0]);
    },
    [unlockFact, unlockClue]
  );

  const handleNextDialogue = useCallback(() => {
    // Chống hiện tượng 1 lần bấm phím/chạm vừa mở hội thoại vừa nhảy qua câu đầu
    if (performance.now() - dialogueOpenedAtRef.current < 260) {
      return;
    }

    voiceManager.unlockAudio();
    // Luôn dừng ngay giọng câu trước khi chuyển câu hoặc đóng hội thoại (không bao giờ chồng 2 giọng)
    voiceManager.stop();

    if (dialogueIndex < dialogueQueue.length - 1) {
      const nextIdx = dialogueIndex + 1;
      setDialogueIndex(nextIdx);
      const nextLine = dialogueQueue[nextIdx];
      if (nextLine.unlockFactId) {
        unlockFact(nextLine.unlockFactId);
      }
      if (nextLine.unlockClueId) {
        unlockClue(nextLine.unlockClueId);
      }
      voiceManager.playLine(nextLine);
    } else {
      const finishCb = dialogueFinishCallbackRef.current;
      dialogueFinishCallbackRef.current = undefined;
      setDialogueQueue([]);
      setDialogueIndex(0);
      if (finishCb) finishCb();
    }
  }, [dialogueIndex, dialogueQueue, unlockFact, unlockClue]);

  const handleReplayVoice = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    voiceManager.unlockAudio();
    voiceManager.replay();
  }, []);

  // Cho phép nhấn phím E / Space / Enter để qua lượt hội thoại, R để nghe lại
  useEffect(() => {
    if (!isDialogueOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextDialogue();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        voiceManager.unlockAudio();
        voiceManager.replay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDialogueOpen, handleNextDialogue]);

  // Tự ẩn thông báo mở khóa sổ tay sau 4 giây
  useEffect(() => {
    if (!newFactToast) return;
    const timer = setTimeout(() => clearFactToast(), 4000);
    return () => clearTimeout(timer);
  }, [newFactToast, clearFactToast]);

  // Khởi tạo Phaser 3 World Scene
  useEffect(() => {
    if (!gameContainerRef.current || phaserGameRef.current) return;

    const worldScene = new BachDangWorldScene();
    sceneRef.current = worldScene;

    worldScene.initData({
      outfit: progress.avatarOutfit,
      playerName: progress.playerName,
      questStage: progress.questStage,
      riverTidePhase: progress.riverTidePhase,
      spawnX: progress.playerPosition.x,
      spawnY: progress.playerPosition.y,
      showGuidance: progress.gameMode === 'GUIDED' || hintLevel > 0,
      reducedEffects: progress.reducedEffects,
      collectedClues: progress.collectedClues,
      callbacks: {
        onOpenDialogue: handleOpenDialogue,
        onZoneChange: (zone) => setCurrentZone(zone),
        onNearbyPromptChange: (promptText) => setNearbyPrompt(promptText),
        onSavePosition: (x, y, zone) => savePlayerPosition(x, y, zone),
        onAdvanceQuest: (nextStage, opts) => advanceQuest(nextStage, opts),
        onUnlockClue: (clueId) => unlockClue(clueId),
        onOpenCipherPuzzle: (puzzleId) => {
          voiceManager.stop();
          openCipherPuzzle(puzzleId);
        },
        onRecordChallengeAttempt: (challengeKey) => recordChallengeAttempt(challengeKey),
        onMarkMarkerObserved: (tide) => markMarkerObserved(tide),
        onMarkHelpedVillager: () => markHelpedVillager(),
        onClimaxComplete: () => {
          voiceManager.stop();
          setTimeout(() => {
            setScreen('SUMMARY');
          }, 1200);
        },
      },
    });

    const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: vw,
      height: vh,
      backgroundColor: '#184F63',
      render: {
        antialias: true,
        powerPreference: 'high-performance',
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [worldScene],
    };

    phaserGameRef.current = new Phaser.Game(config);

    // Hỗ trợ mở nhanh hội thoại mẫu hoặc bảng trộn âm thanh qua query param khi kiểm thử
    const params = new URLSearchParams(window.location.search);
    const demoDlg = params.get('demoDialogue');
    if (demoDlg && DIALOGUE_SCRIPTS[demoDlg]) {
      setTimeout(() => {
        handleOpenDialogue(DIALOGUE_SCRIPTS[demoDlg]);
      }, 600);
    }
    if (params.get('openAudioMixer') === '1') {
      setShowAudioPopover(true);
    }
    if (params.get('openClueNotebook') === '1') {
      setShowClueNotebook(true);
    }
    const cipherParam = params.get('openCipher');
    if (cipherParam) {
      setTimeout(() => {
        openCipherPuzzle(cipherParam as CipherPuzzleId);
      }, 500);
    }

    return () => {
      voiceManager.stop();
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
        sceneRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ trạng thái từ React sang Phaser Scene khi có thay đổi
  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.syncStateFromReact({
      questStage: progress.questStage,
      riverTidePhase: progress.riverTidePhase,
      showGuidance: progress.gameMode === 'GUIDED' || hintLevel > 0,
      isDialogueOpen: isDialogueOpen || showClueNotebook || Boolean(activeCipherPuzzle),
      heldItemName: primaryHeldItem ? primaryHeldItem.name : null,
      reducedEffects: progress.reducedEffects,
      collectedClues: progress.collectedClues,
    });
  }, [
    progress.playerName,
    progress.questStage,
    progress.riverTidePhase,
    progress.gameMode,
    progress.reducedEffects,
    progress.collectedClues,
    hintLevel,
    isDialogueOpen,
    showClueNotebook,
    activeCipherPuzzle,
    primaryHeldItem,
  ]);

  const cycleHintLevel = () => {
    setHintLevel((prev) => {
      if (prev === 0) return 1;
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 0;
    });
  };

  const zoneTitleMap = {
    VILLAGE: 'Khu vực A: Làng Ven Sông',
    CAMP: 'Khu vực B: Khu Chuẩn Bị',
    RIVER: 'Khu vực C: Bến Sông Bạch Đằng',
  };

  const currentLine = isDialogueOpen ? dialogueQueue[dialogueIndex] : null;
  const currentSpeakerCfg = currentLine
    ? CHARACTER_VOICE_CONFIGS[currentLine.speakerId]
    : null;
  const unlockedFactObj = newFactToast
    ? HISTORICAL_FACTS_CH1.find((f) => f.id === newFactToast)
    : null;

  const audioCfg = progress.audioSettings || {
    soundEnabled: progress.soundEnabled,
    voiceEnabled: true,
    voiceVolume: 0.9,
    bgmVolume: 0.45,
    sfxVolume: 0.7,
  };

  const renderClueIllustration = (iconType: VisualClue['iconType']) => {
    switch (iconType) {
      case 'scroll':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#2C1E14] border border-bronze p-1 shrink-0">
            {/* Khói trắng + Đôi chum sành + Cột cờ dải lụa đỏ */}
            <path d="M16 40 C14 30, 20 24, 17 14" stroke="#F8FAFC" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="38" cy="39" rx="7" ry="9" fill="#B45309" stroke="#FDE68A" strokeWidth="1.2" />
            <ellipse cx="50" cy="40" rx="6" ry="8" fill="#92400E" stroke="#FDE68A" strokeWidth="1.2" />
            <line x1="64" y1="10" x2="64" y2="48" stroke="#D97706" strokeWidth="2.5" />
            <path d="M64 14 Q74 17 69 24 Q75 27 65 30 Z" fill="#DC2626" />
          </svg>
        );
      case 'wood':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#3B2618] border border-bronze p-1 shrink-0">
            <rect x="10" y="21" width="44" height="14" rx="2" fill="#9A5B32" stroke="#FDE68A" strokeWidth="1.2" />
            <polygon points="54,21 72,28 54,35" fill="#D9A066" stroke="#FDE68A" strokeWidth="1.2" />
          </svg>
        );
      case 'anvil':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#27272A] border border-bronze p-1 shrink-0">
            <rect x="12" y="22" width="36" height="12" fill="#8C5835" />
            <polygon points="48,20 68,28 48,36" fill="#E5E7EB" stroke="#F97316" strokeWidth="1.5" />
            <circle cx="56" cy="15" r="3" fill="#FDBA74" />
          </svg>
        );
      case 'map':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#FEF3C7] border border-bronze p-1 shrink-0">
            <path d="M8 36 Q35 20 72 34" stroke="#0284C7" strokeWidth="6" fill="none" />
            <circle cx="54" cy="28" r="5" fill="#DC2626" />
            <line x1="50" y1="24" x2="58" y2="32" stroke="#FFF" strokeWidth="1.5" />
            <line x1="58" y1="24" x2="50" y2="32" stroke="#FFF" strokeWidth="1.5" />
          </svg>
        );
      case 'tide_low':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#0F3847] border border-bronze p-1 shrink-0">
            <rect x="16" y="10" width="12" height="38" fill="#9CA3AF" />
            <line x1="16" y1="36" x2="28" y2="36" stroke="#38BDF8" strokeWidth="2.5" />
            <polygon points="46,46 50,24 54,46" fill="#D1D5DB" />
            <polygon points="60,46 64,24 68,46" fill="#D1D5DB" />
          </svg>
        );
      case 'tide_high':
        return (
          <svg viewBox="0 0 80 56" className="w-16 h-12 rounded-lg bg-[#0F3847] border border-bronze p-1 shrink-0">
            <rect x="16" y="10" width="12" height="38" fill="#9CA3AF" />
            <line x1="16" y1="18" x2="28" y2="18" stroke="#EF4444" strokeWidth="3" />
            <path d="M34 22 Q50 17 72 22 L72 48 L34 48 Z" fill="#0284C7" opacity="0.8" />
          </svg>
        );
    }
  };

  const displaySpeakerName = currentLine
    ? currentLine.speakerId === 'messenger'
      ? progress.playerName || 'Người Đưa Tin'
      : interpolatePlayerText(currentLine.speaker, progress.playerName)
    : '';

  const displayContextNote =
    currentLine && currentLine.contextNote
      ? interpolatePlayerText(currentLine.contextNote, progress.playerName)
      : null;

  const isVoiceBlockedOrError =
    voiceState.mode === 'blocked_autoplay' || voiceState.mode === 'error_load';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-river-900 select-none"
      style={{ height: '100dvh' }}
    >
      {/* 1. Thế giới 2D Phaser chiếm trọn màn hình */}
      <div ref={gameContainerRef} className="w-full h-full" />

      {/* 2. HUD Góc Trên Trái: Tên Khu Vực + Mục Tiêu Ngắn Hiện Tại + Nút Thu Gọn trên Mobile */}
      <div
        className="fixed top-14 sm:top-2.5 left-2.5 right-2.5 sm:right-auto sm:max-w-sm z-20 pointer-events-none flex flex-col gap-1.5"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        }}
      >
        <div className="pointer-events-auto bg-lacquer-dark/88 backdrop-blur-md border-2 border-bronze/80 rounded-2xl px-3 py-2 text-parchment-50 shadow-xl w-full sm:max-w-sm">
          <div className="flex items-center justify-between gap-2 text-[11px] text-bronze-light font-semibold">
            <span className="truncate">{zoneTitleMap[currentZone]}</span>
            <button
              onClick={() => setIsHudCollapsed((prev) => !prev)}
              className="px-1.5 py-0.5 rounded bg-parchment-100/10 hover:bg-parchment-100/20 text-parchment-100 flex items-center gap-0.5 text-[10px] shrink-0"
              title={isHudCollapsed ? 'Mở rộng mục tiêu' : 'Thu gọn mục tiêu'}
            >
              <span>{isHudCollapsed ? 'Mở' : 'Gọn'}</span>
              {isHudCollapsed ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </button>
          </div>

          <div className="text-xs sm:text-sm font-bold text-parchment-50 leading-snug mt-0.5">
            🎯 {interpolatePlayerText(activeObjective.shortTitle, progress.playerName)}
          </div>

          {!isHudCollapsed && (
            <>
              {/* Gợi ý nhanh khi đang ở tình huống ngập Lối Đá Thấp */}
              {progress.questStage === 'STAGE_6_FLOODED_PATH_CHOICE' && (
                <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-crimson/40 border border-bronze-light/60 text-[11px] text-parchment-100 leading-snug">
                  🌊 <strong>Lối đá thấp đã ngập:</strong> Chọn{' '}
                  <span className="text-bronze-light font-bold">Cầu Tre Gò Cao (Bắc)</span> hoặc{' '}
                  <span className="text-bronze-light font-bold">Đò Bác Năm (Nam)</span>.
                </div>
              )}

              {/* Hành trang & Nút mở nhanh Sổ Manh Mối Hình Ảnh */}
              <div className="mt-1.5 pt-1.5 border-t border-parchment-400/20 flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-parchment-200/80 flex items-center gap-1">
                    <Package className="w-3 h-3 text-bronze-light" />
                    <span>{progress.playerName}:</span>
                  </span>
                  {progress.inventory.length > 0 ? (
                    progress.inventory.map((itemId) => {
                      const item = INVENTORY_ITEMS[itemId];
                      if (!item) return null;
                      return (
                        <span
                          key={itemId}
                          className="px-2 py-0.5 rounded-full bg-bronze/25 border border-bronze text-[10px] font-semibold text-bronze-light"
                          title={item.description}
                        >
                          {item.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-parchment-200/60 italic">Chưa mang vật phẩm</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    voiceManager.stop();
                    if (
                      progress.questStage === 'STAGE_0_PROLOGUE' ||
                      progress.questStage === 'STAGE_0_DECODE_MEETING'
                    ) {
                      openCipherPuzzle('CIPHER_VILLAGE_SCROLL');
                    } else if (
                      progress.questStage === 'STAGE_7_SECOND_RIVER_VISIT' ||
                      progress.questStage === 'STAGE_8_CLIMAX_SIGNAL'
                    ) {
                      openCipherPuzzle('CIPHER_TIDE_STELE');
                    } else {
                      openCipherPuzzle('CIPHER_CAMP_CHEST');
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg bg-crimson/25 hover:bg-crimson/35 border border-bronze text-[10px] font-bold text-amber-200 flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3 text-amber-300" />
                  <span>Mật mã ({progress.solvedCiphers?.length || 0}/3)</span>
                </button>

                <button
                  onClick={() => {
                    voiceManager.stop();
                    setShowClueNotebook(true);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/25 hover:bg-amber-500/35 border border-amber-300/70 text-[10px] font-bold text-amber-200 flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Manh mối ({progress.collectedClues.length}/{ALL_CLUE_IDS.length})</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Hộp gợi ý 3 mức tăng dần khi người chơi bấm nút Gợi ý */}
        {hintLevel > 0 && (
          <div className="pointer-events-auto bg-parchment-50/95 border-2 border-bronze rounded-xl p-2.5 text-xs text-lacquer shadow-lg max-w-sm">
            <div className="font-bold text-crimson mb-1 flex items-center justify-between gap-2">
              <span>
                🧭 Gợi ý mức {hintLevel}/3{' '}
                {hintLevel === 1
                  ? '(Hướng suy luận)'
                  : hintLevel === 2
                  ? '(Vị trí quan sát)'
                  : '(Hướng dẫn chi tiết)'}
              </span>
              <div className="flex items-center gap-1.5">
                {hintLevel < 3 && (
                  <button
                    onClick={() => setHintLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))}
                    className="px-2 py-0.5 rounded bg-crimson text-white text-[10px] font-bold"
                  >
                    Thêm gợi ý
                  </button>
                )}
                <button
                  onClick={() => setHintLevel(0)}
                  className="text-[11px] underline text-lacquer/70"
                >
                  Ẩn
                </button>
              </div>
            </div>
            <p className="leading-relaxed text-[11px] sm:text-xs">
              {interpolatePlayerText(
                activeObjective.progressiveHints?.[hintLevel - 1] || activeObjective.hint,
                progress.playerName
              )}
            </p>
          </div>
        )}

        {/* Gợi ý xoay ngang nhẹ nhàng trên điện thoại cầm dọc (nằm gọn dưới thẻ mục tiêu, không đè nút) */}
        {isPortraitMobile && !dismissedPortraitNotice && (
          <div className="pointer-events-auto bg-lacquer-dark/95 border border-bronze rounded-xl px-3 py-2 text-parchment-100 text-[11px] flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-bronze-light rotate-90 shrink-0" />
              <span>
                <strong>Mẹo di động:</strong> Xoay ngang màn hình để có tầm nhìn rộng nhất (hoặc tiếp tục chơi ở màn dọc).
              </span>
            </div>
            <button
              onClick={() => setDismissedPortraitNotice(true)}
              className="px-2 py-1 rounded bg-parchment-100/15 hover:bg-parchment-100/25 text-parchment-100 font-bold shrink-0"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* 3. HUD Góc Trên Phải: Nút Gợi ý, Manh Mối, Sổ Tay, Âm Thanh & Menu (Touch target >= 44px) */}
      <div
        className="fixed top-2.5 right-2.5 z-20 flex items-center gap-1.5"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <button
          onClick={cycleHintLevel}
          className={`min-h-[42px] px-2.5 py-2 rounded-xl border-2 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95 ${
            hintLevel > 0
              ? 'bg-bronze text-lacquer-dark border-parchment-100'
              : 'bg-lacquer-dark/85 text-parchment-100 border-bronze/70 hover:bg-lacquer'
          }`}
          title="Bật gợi ý từng bước và mũi tên chỉ hướng khu vực"
        >
          <Compass className="w-4 h-4 text-bronze-light shrink-0" />
          <span className="hidden md:inline">
            {hintLevel > 0 ? `Gợi ý ${hintLevel}/3` : 'Gợi ý'}
          </span>
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            if (
              progress.questStage === 'STAGE_0_PROLOGUE' ||
              progress.questStage === 'STAGE_0_DECODE_MEETING'
            ) {
              openCipherPuzzle('CIPHER_VILLAGE_SCROLL');
            } else if (
              progress.questStage === 'STAGE_7_SECOND_RIVER_VISIT' ||
              progress.questStage === 'STAGE_8_CLIMAX_SIGNAL'
            ) {
              openCipherPuzzle('CIPHER_TIDE_STELE');
            } else {
              openCipherPuzzle('CIPHER_CAMP_CHEST');
            }
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"
          title="Mở Bàn Giải Mật Mã Cổ"
        >
          <KeyRound className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden xl:inline">Mật mã</span>
          <span className="px-1.5 py-0.2 rounded-full bg-crimson text-white text-[10px]">
            {progress.solvedCiphers?.length || 0}/3
          </span>
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            setShowClueNotebook(true);
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"
          title="Mở Sổ Manh Mối Hình Ảnh để giải mã"
        >
          <Search className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden lg:inline">Manh mối</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px]">
            {progress.collectedClues.length}/{ALL_CLUE_IDS.length}
          </span>
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            openCodex();
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"
          title="Mở Sổ tay Sử Việt & Nguồn tham khảo"
        >
          <BookOpen className="w-4 h-4 text-bronze-light shrink-0" />
          <span className="hidden sm:inline">Sổ tay</span>
          <span className="px-1.5 py-0.2 rounded-full bg-crimson text-white text-[10px]">
            {progress.discoveredFacts.length}/{HISTORICAL_FACTS_CH1.length}
          </span>
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            openDailyMissions();
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-amber-950/85 hover:bg-amber-900 text-amber-100 border-2 border-amber-500/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95 relative"
          title="Mở Nhiệm Vụ Sử Học Hằng Ngày"
        >
          <Scroll className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden sm:inline">Nhiệm vụ</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px]">
            {progress.scholarPoints || 0}đ
          </span>
          {(progress.dailyMissions?.missions?.filter((m) => !m.completed).length ?? 3) > 0 && (
            <span className="w-2 h-2 rounded-full bg-crimson absolute -top-0.5 -right-0.5 ring-2 ring-amber-950 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            openHistoricalMissions('MISSION_TACTICAL_SANDTABLE');
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-red-950/85 hover:bg-red-900 text-red-100 border-2 border-red-500/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"
          title="Mở Sa Bàn Bày Trận Cọc Ngầm Sông Bạch Đằng & Nhiệm Vụ Sử Học"
        >
          <Compass className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden xl:inline">Sa Bàn Sử</span>
          <span className="px-1.5 py-0.2 rounded-full bg-crimson text-white text-[10px]">
            {progress.historicalMissions?.completedMissionIds?.length || 0}/4
          </span>
        </button>

        <button
          onClick={() => {
            voiceManager.stop();
            openAchievements();
          }}
          className="min-h-[42px] px-2.5 py-2 rounded-xl bg-amber-950/85 hover:bg-amber-900 text-amber-100 border-2 border-amber-500/70 text-xs font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95"
          title="Xem Kỳ Tích & Huy Chương Dấu Ấn Lịch Sử"
        >
          <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="hidden xl:inline">Thành tựu</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px]">
            {progress.unlockedAchievementIds?.length || 0}
          </span>
        </button>

        {/* Nút Bật/Tắt nhanh tổng âm thanh */}
        <button
          onClick={() => {
            voiceManager.unlockAudio();
            toggleSound();
          }}
          className="min-h-[42px] min-w-[42px] p-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 shadow-lg flex items-center justify-center transition-all active:scale-95"
          title={progress.soundEnabled ? 'Tắt toàn bộ âm thanh' : 'Bật âm thanh'}
        >
          {progress.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-red-400" />
          )}
        </button>

        {/* Bảng Trộn Âm Thanh (Audio Mixer: Giọng nói / Nhạc nền / Hiệu ứng) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAudioPopover((prev) => !prev);
              setShowMenuPopover(false);
            }}
            className="min-h-[42px] px-2.5 py-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 text-xs font-bold flex items-center gap-1 shadow-lg"
            title="Cài đặt Âm lượng Giọng nói, Nhạc nền và Hiệu ứng"
          >
            <Sliders className="w-4 h-4 text-bronze-light" />
            <span className="hidden xl:inline">Âm thanh</span>
          </button>

          {showAudioPopover && (
            <div className="absolute right-0 mt-2 w-72 bg-parchment-50 border-2 border-bronze rounded-2xl shadow-2xl p-3.5 text-xs text-lacquer space-y-3 z-40">
              <div className="flex items-center justify-between border-b border-parchment-300 pb-2">
                <span className="font-bold text-crimson text-sm flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Bảng Trộn Âm Thanh
                </span>
                <button
                  onClick={() => setShowAudioPopover(false)}
                  className="text-[11px] underline text-lacquer/70"
                >
                  Đóng
                </button>
              </div>

              {/* 1. Bật/Tắt Giọng nói riêng nhưng vẫn giữ phụ đề */}
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  {audioCfg.voiceEnabled ? (
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5 text-red-600" />
                  )}
                  Giọng lồng tiếng (Giữ phụ đề)
                </span>
                <button
                  onClick={() =>
                    updateAudioSettings({ voiceEnabled: !audioCfg.voiceEnabled })
                  }
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                    audioCfg.voiceEnabled
                      ? 'bg-emerald-700 text-white border-emerald-900'
                      : 'bg-parchment-200 text-lacquer/70 border-parchment-400'
                  }`}
                >
                  {audioCfg.voiceEnabled ? 'Đang BẬT' : 'Đang TẮT'}
                </button>
              </div>

              {/* 2. Thanh trượt Âm lượng Giọng nói */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Âm lượng Giọng nói (Voice)</span>
                  <span className="font-bold text-crimson">
                    {Math.round(audioCfg.voiceVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audioCfg.voiceVolume * 100)}
                  onChange={(e) =>
                    updateAudioSettings({ voiceVolume: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-crimson cursor-pointer"
                />
              </div>

              {/* 3. Thanh trượt Âm lượng Nhạc nền (tự giảm khi có thoại) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Nhạc nền môi trường (Tự giảm khi thoại)</span>
                  <span className="font-bold text-lacquer">
                    {Math.round(audioCfg.bgmVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audioCfg.bgmVolume * 100)}
                  onChange={(e) =>
                    updateAudioSettings({ bgmVolume: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-bronze cursor-pointer"
                />
              </div>

              {/* 4. Thanh trượt Âm lượng Hiệu ứng (SFX) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Hiệu ứng bước chân & sóng (SFX)</span>
                  <span className="font-bold text-lacquer">
                    {Math.round(audioCfg.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audioCfg.sfxVolume * 100)}
                  onChange={(e) =>
                    updateAudioSettings({ sfxVolume: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-bronze cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Nút Menu */}
        <div className="relative">
          <button
            onClick={() => {
              voiceManager.stop();
              setShowMenuPopover((prev) => !prev);
              setShowAudioPopover(false);
            }}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-lacquer-dark/85 hover:bg-lacquer text-parchment-100 border-2 border-bronze/70 text-xs font-bold shadow-lg"
          >
            Menu
          </button>

          {showMenuPopover && (
            <div className="absolute right-0 mt-2 w-60 bg-parchment-50 border-2 border-bronze rounded-2xl shadow-2xl p-2.5 text-xs text-lacquer space-y-1.5 z-40">
              <div className="px-2.5 py-1.5 rounded-lg bg-parchment-100 border border-parchment-300 text-[11px]">
                Người đưa tin: <strong className="text-crimson">{progress.playerName}</strong>
              </div>

              <button
                onClick={toggleReducedEffects}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment-200 font-medium flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Giảm hiệu ứng (Máy yếu)</span>
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    progress.reducedEffects
                      ? 'bg-emerald-700 text-white'
                      : 'bg-parchment-300 text-lacquer'
                  }`}
                >
                  {progress.reducedEffects ? 'BẬT' : 'TẮT'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  openAchievements();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment-200 font-bold text-amber-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Kỳ Tích & Huy Chương Số</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  {progress.unlockedAchievementIds?.length || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  setScreen('SUMMARY');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment-200 font-bold text-crimson flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-crimson" />
                  <span>Bảng Tổng Kết & Dấu Ấn</span>
                </span>
                {progress.chapter1Completed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Đã hoàn thành
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  restartAdventure();
                  window.location.reload();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment-200 font-medium flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Chơi lại từ đầu chương
              </button>
              <button
                onClick={() => {
                  setShowMenuPopover(false);
                  setScreen('START');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment-200 font-medium flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Về màn hình chính
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thông báo nhỏ khi mở khóa mục mới trong Sổ tay */}
      {unlockedFactObj && (
        <div
          onClick={() => {
            openCodex(unlockedFactObj.id);
            clearFactToast();
          }}
          className="fixed top-16 right-3 z-30 max-w-xs bg-parchment-50 border-2 border-bronze rounded-xl px-3.5 py-2.5 shadow-xl cursor-pointer flex items-center gap-2.5 animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-crimson shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-crimson">Đã ghi vào Sổ tay Sử Việt!</div>
            <div className="text-lacquer line-clamp-1 font-medium">{unlockedFactObj.title}</div>
          </div>
        </div>
      )}

      {/* 4. Modal Sổ Manh Mối Hình Ảnh (Visual Clue Notebook phục vụ 3 Thử Thách Giải Mã A, B, C) */}
      {showClueNotebook && (
        <div
          className="fixed inset-0 z-50 bg-lacquer-dark/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={() => setShowClueNotebook(false)}
        >
          <div
            className="bg-parchment-50 border-4 border-bronze rounded-2xl max-w-3xl w-full max-h-[88dvh] flex flex-col overflow-hidden text-lacquer shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-parchment-200 border-b border-parchment-300 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-crimson" />
                <div>
                  <h3 className="font-title font-bold text-base sm:text-lg text-lacquer">
                    Sổ Manh Mối Hiện Trường Của {progress.playerName}
                  </h3>
                  <p className="text-[11px] text-lacquer/70">
                    Quan sát cảnh vật và ghép thông tin từ các nhân vật để giải mã 3 thử thách trên bản đồ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClueNotebook(false)}
                className="p-1.5 rounded-lg hover:bg-parchment-300 text-lacquer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {ALL_CLUE_IDS.map((clueId) => {
                const clue = VISUAL_CLUES[clueId];
                const isCollected = progress.collectedClues.includes(clueId);
                return (
                  <div
                    key={clueId}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 ${
                      isCollected
                        ? 'bg-parchment-100 border-bronze shadow-sm'
                        : 'bg-parchment-200/50 border-dashed border-parchment-400 opacity-70'
                    }`}
                  >
                    {isCollected ? (
                      renderClueIllustration(clue.iconType)
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-parchment-300 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-lacquer/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-crimson/15 text-crimson text-[10px] font-bold">
                          Thử thách {clue.challenge}
                        </span>
                        {isCollected && (
                          <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Đã thu thập
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-lacquer">
                        {isCollected ? clue.title : 'Manh mối chưa khám phá'}
                      </h4>
                      <p className="text-[11px] text-lacquer/80 leading-relaxed mt-0.5">
                        {isCollected
                          ? clue.shortSummary
                          : 'Hãy trò chuyện với người dân, quân sĩ hoặc quan sát đồ vật tại khu vực tương ứng để mở khóa.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-parchment-100 border-t border-parchment-300 px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-lacquer/75">
                Đã thu thập: <strong>{progress.collectedClues.length}/{ALL_CLUE_IDS.length}</strong> manh mối
              </span>
              <button
                onClick={() => setShowClueNotebook(false)}
                className="px-4 py-1.5 rounded-xl bg-crimson text-white font-bold text-xs shadow"
              >
                Tiếp tục khám phá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Cần điều khiển ảo & Nút tương tác cho Điện thoại / Máy tính bảng */}
      <VirtualControls
        disabled={isDialogueOpen || showClueNotebook || Boolean(activeCipherPuzzle)}
        nearbyTargetName={nearbyPrompt}
        onMoveVector={(vx, vy) => {
          sceneRef.current?.setVirtualJoystick(vx, vy);
        }}
        onInteract={() => {
          voiceManager.unlockAudio();
          sceneRef.current?.triggerInteraction();
        }}
      />

      {/* 6. Khung Hội Thoại Có Giọng Nói Tiếng Việt, Phụ Đề Hiện Ngay, Không Nhãn Kỹ Thuật */}
      {isDialogueOpen && currentLine && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 p-2.5 sm:p-5 bg-gradient-to-t from-lacquer-dark/95 via-lacquer-dark/60 to-transparent flex justify-center"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
            paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 10px)',
            paddingRight: 'calc(env(safe-area-inset-right, 0px) + 10px)',
          }}
        >
          <div
            onClick={handleNextDialogue}
            className="w-full max-w-3xl bg-parchment-50 border-3 sm:border-4 border-bronze rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 cursor-pointer"
          >
            {/* Hàng trên ở mobile / Cột trái ở desktop: Chân dung + Tên người nói */}
            <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1 shrink-0">
              <CharacterPortrait
                portraitId={currentLine.portraitId}
                outfit={progress.avatarOutfit}
                className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow shrink-0"
              />
              <div className="flex flex-col sm:items-center text-left sm:text-center min-w-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-parchment-200 text-lacquer/85 font-semibold max-w-[140px] truncate">
                  {currentLine.speakerRole}
                </span>
              </div>
            </div>

            {/* Nội dung lượt thoại ngắn (Hiển thị toàn bộ câu ngay lập tức, khớp 100% giọng đọc) */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4
                    data-testid="dialogue-speaker-name"
                    className="font-title font-bold text-sm sm:text-lg text-crimson"
                  >
                    {displaySpeakerName}
                  </h4>

                  {/* Chỉ báo sóng âm thanh gọn gàng (đã bỏ nhãn kỹ thuật & chỉ dẫn diễn xuất) */}
                  {audioCfg.soundEnabled && audioCfg.voiceEnabled && voiceState.isPlaying && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" />
                      <span>Đang nói</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-lacquer/60 font-semibold">
                  {dialogueIndex + 1}/{dialogueQueue.length}
                </span>
              </div>

              {/* Toàn bộ văn bản câu thoại hiện ngay lập tức */}
              <p
                data-testid="dialogue-subtitle-text"
                className="text-xs sm:text-base text-lacquer font-medium leading-relaxed"
              >
                “{interpolatePlayerText(currentLine.text, progress.playerName)}”
              </p>

              {/* Dòng bối cảnh chỉ có chữ (nếu có) dùng để hiển thị tên người chơi tùy chỉnh mà không làm lệch giọng thu âm */}
              {displayContextNote && (
                <div
                  data-testid="dialogue-context-note"
                  className="mt-1.5 text-[11px] text-lacquer/75 italic bg-parchment-100/90 border-l-2 border-bronze px-2.5 py-1 rounded"
                >
                  {displayContextNote}
                </div>
              )}

              {/* Nếu trình duyệt di động chặn tự phát âm thanh hoặc mạng chậm, hiện nút rõ ràng để chạm nghe lại */}
              {isVoiceBlockedOrError && audioCfg.soundEnabled && audioCfg.voiceEnabled && (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={handleReplayVoice}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Chạm để nghe lại giọng đọc</span>
                  </button>
                </div>
              )}

              {/* Lưu ý phân định rõ diễn xuất hư cấu đối với nhân vật lịch sử Ngô Quyền */}
              {(currentLine.isHistoricalFigureFiction ||
                currentSpeakerCfg?.isHistoricalFigure) && (
                <div className="mt-2 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                  <span>
                    <strong>Lưu ý sử liệu:</strong> Đây là lời thoại và giọng diễn xuất hư cấu phục vụ trải nghiệm, không phải phục dựng giọng lịch sử có thật.
                  </span>
                </div>
              )}
            </div>

            {/* Cụm nút điều khiển: Nghe lại & Chuyển câu / Đóng (Touch target >= 44px) */}
            <div className="shrink-0 flex sm:flex-col items-center justify-end gap-2 pt-1 sm:pt-0 self-end sm:self-center w-full sm:w-auto">
              <button
                onClick={handleReplayVoice}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-lacquer font-bold text-xs flex items-center justify-center gap-1.5 border border-bronze/70 shadow-sm active:scale-95"
                title="Nghe lại giọng câu thoại này (Phím R)"
              >
                <RotateCw className="w-3.5 h-3.5 text-crimson" />
                <span>Nghe lại</span>
              </button>

              <button
                data-testid="dialogue-next-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextDialogue();
                }}
                className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-crimson hover:bg-crimson-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-md border border-bronze active:scale-95"
                title="Dừng giọng hiện tại và chuyển sang câu tiếp theo (Phím E / Space)"
              >
                <span>
                  {dialogueIndex < dialogueQueue.length - 1 ? 'Tiếp tục' : 'Đóng'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
