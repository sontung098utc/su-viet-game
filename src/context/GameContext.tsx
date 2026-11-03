import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserProgress,
  GameMode,
  AvatarOutfit,
  QuestStage,
  InventoryItemId,
  RiverTidePhase,
  AudioMixSettings,
  FloodedPathSolution,
  ClueId,
  CipherPuzzleId,
} from '../types';
import { storage, DEFAULT_USER_PROGRESS } from '../utils/storage';
import { sound } from '../utils/sound';
import { voiceManager } from '../utils/voiceManager';
import { vietnameseAmbientMusic } from '../utils/vietnameseAmbientMusic';

interface AdvanceQuestOptions {
  addItems?: InventoryItemId[];
  removeItems?: InventoryItemId[];
  unlockFacts?: string[];
  unlockClues?: ClueId[];
  tidePhase?: RiverTidePhase;
  completedChapter?: boolean;
  floodedPathSolution?: FloodedPathSolution;
}

interface GameContextType {
  progress: UserProgress;
  isCodexOpen: boolean;
  selectedFactId: string | null;
  hasSavedGame: boolean;
  newFactToast: string | null;
  newClueToast: ClueId | null;
  isFreshCharacterSetup: boolean;
  activeCipherPuzzle: CipherPuzzleId | null;
  openCipherPuzzle: (puzzleId: CipherPuzzleId) => void;
  closeCipherPuzzle: () => void;
  solveCipher: (puzzleId: CipherPuzzleId) => void;
  setScreen: (screen: UserProgress['currentScreen']) => void;
  startNewCharacterSetup: () => void;
  setPlayerProfile: (name: string, outfit: AvatarOutfit, mode: GameMode) => void;
  toggleSound: () => void;
  toggleReducedEffects: () => void;
  updateAudioSettings: (partial: Partial<AudioMixSettings>) => void;
  setFloodedPathSolution: (solution: FloodedPathSolution) => void;
  unlockFact: (factId: string) => void;
  unlockClue: (clueId: ClueId) => void;
  recordChallengeAttempt: (challenge: 'A' | 'B' | 'C') => void;
  advanceQuest: (nextStage: QuestStage, options?: AdvanceQuestOptions) => void;
  savePlayerPosition: (x: number, y: number, zone: 'VILLAGE' | 'CAMP' | 'RIVER') => void;
  markMarkerObserved: (tide: 'LOW' | 'HIGH') => void;
  markHelpedVillager: () => void;
  completeRecap: () => void;
  restartAdventure: () => void;
  resetGame: () => void;
  openCodex: (factId?: string) => void;
  closeCodex: () => void;
  clearFactToast: () => void;
  clearClueToast: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => storage.load());
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(() => storage.hasSavedGame());
  const [newFactToast, setNewFactToast] = useState<string | null>(null);
  const [newClueToast, setNewClueToast] = useState<ClueId | null>(null);
  const [isFreshCharacterSetup, setIsFreshCharacterSetup] = useState<boolean>(false);
  const [activeCipherPuzzle, setActiveCipherPuzzle] = useState<CipherPuzzleId | null>(null);

  useEffect(() => {
    const audioCfg: AudioMixSettings = progress.audioSettings || {
      soundEnabled: progress.soundEnabled,
      voiceEnabled: true,
      voiceVolume: 0.9,
      bgmVolume: 0.45,
      sfxVolume: 0.7,
      useBrowserTtsFallback: false,
    };
    sound.setMixSettings(audioCfg);
    voiceManager.syncSettings(audioCfg);
    vietnameseAmbientMusic.setMuted(!audioCfg.soundEnabled);
    if (typeof audioCfg.bgmVolume === 'number') {
      vietnameseAmbientMusic.setVolume(audioCfg.bgmVolume);
    }
  }, [progress.audioSettings, progress.soundEnabled]);

  const updateProgress = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      storage.save(next);
      setHasSavedGame(storage.hasSavedGame());
      return next;
    });
  }, []);

  const setScreen = useCallback(
    (screen: UserProgress['currentScreen']) => {
      voiceManager.unlockAudio();
      voiceManager.stop();
      sound.playClick();
      updateProgress((prev) => ({
        ...prev,
        currentScreen: screen,
      }));
    },
    [updateProgress]
  );

  // Khi bấm "Tạo nhân vật mới" / "Bước vào thế giới", không giữ tên của lượt chơi cũ
  const startNewCharacterSetup = useCallback(() => {
    voiceManager.unlockAudio();
    voiceManager.stop();
    sound.playClick();
    setIsFreshCharacterSetup(true);
    updateProgress((prev) => ({
      ...prev,
      currentScreen: 'SETUP',
    }));
  }, [updateProgress]);

  const setPlayerProfile = useCallback(
    (name: string, outfit: AvatarOutfit, mode: GameMode) => {
      voiceManager.unlockAudio();
      voiceManager.stop();
      sound.playSuccess();
      setIsFreshCharacterSetup(false);
      const cleanName = name.trim() || 'Minh An';
      updateProgress((prev) => ({
        ...prev,
        playerId: 'player_messenger',
        playerName: cleanName,
        avatarOutfit: outfit,
        gameMode: mode,
        currentScreen: 'GAME',
        questStage: 'STAGE_0_PROLOGUE',
        inventory: [],
        collectedClues: [],
        challengeAttempts: { A: 0, B: 0, C: 0 },
        riverTidePhase: 'LOW_TIDE',
        playerPosition: { x: 420, y: 1050, zone: 'VILLAGE' },
        observedLowTideMarker: false,
        observedHighTideMarker: false,
        helpedVillagerWood: false,
        floodedPathSolution: 'NONE',
        chapter1Completed: false,
        completedRecapOrder: false,
      }));
    },
    [updateProgress]
  );

  const toggleSound = useCallback(() => {
    voiceManager.unlockAudio();
    setProgress((prev) => {
      const nextState = !prev.soundEnabled;
      const nextAudio: AudioMixSettings = {
        ...(prev.audioSettings || DEFAULT_USER_PROGRESS.audioSettings),
        soundEnabled: nextState,
      };
      sound.setMixSettings(nextAudio);
      voiceManager.syncSettings(nextAudio);
      if (nextState) sound.playClick();
      const next = { ...prev, soundEnabled: nextState, audioSettings: nextAudio };
      storage.save(next);
      return next;
    });
  }, []);

  const toggleReducedEffects = useCallback(() => {
    sound.playClick();
    updateProgress((prev) => ({
      ...prev,
      reducedEffects: !prev.reducedEffects,
    }));
  }, [updateProgress]);

  const updateAudioSettings = useCallback((partial: Partial<AudioMixSettings>) => {
    voiceManager.unlockAudio();
    setProgress((prev) => {
      const nextAudio: AudioMixSettings = {
        ...(prev.audioSettings || DEFAULT_USER_PROGRESS.audioSettings),
        ...partial,
      };
      sound.setMixSettings(nextAudio);
      voiceManager.syncSettings(nextAudio);
      const next: UserProgress = {
        ...prev,
        soundEnabled: nextAudio.soundEnabled,
        audioSettings: nextAudio,
      };
      storage.save(next);
      return next;
    });
  }, []);

  const setFloodedPathSolution = useCallback(
    (solution: FloodedPathSolution) => {
      updateProgress((prev) => ({
        ...prev,
        floodedPathSolution: solution,
      }));
    },
    [updateProgress]
  );

  const unlockFact = useCallback(
    (factId: string) => {
      updateProgress((prev) => {
        if (prev.discoveredFacts.includes(factId)) return prev;
        sound.playClueFound();
        setNewFactToast(factId);
        return {
          ...prev,
          discoveredFacts: [...prev.discoveredFacts, factId],
        };
      });
    },
    [updateProgress]
  );

  const unlockClue = useCallback(
    (clueId: ClueId) => {
      updateProgress((prev) => {
        if (prev.collectedClues.includes(clueId)) return prev;
        sound.playClueFound();
        setNewClueToast(clueId);
        return {
          ...prev,
          collectedClues: [...prev.collectedClues, clueId],
        };
      });
    },
    [updateProgress]
  );

  const recordChallengeAttempt = useCallback(
    (challenge: 'A' | 'B' | 'C') => {
      updateProgress((prev) => ({
        ...prev,
        challengeAttempts: {
          ...prev.challengeAttempts,
          [challenge]: (prev.challengeAttempts?.[challenge] || 0) + 1,
        },
      }));
    },
    [updateProgress]
  );

  const advanceQuest = useCallback(
    (nextStage: QuestStage, options?: AdvanceQuestOptions) => {
      sound.playClueFound();
      updateProgress((prev) => {
        let nextInventory = [...prev.inventory];
        if (options?.removeItems) {
          nextInventory = nextInventory.filter((item) => !options.removeItems!.includes(item));
        }
        if (options?.addItems) {
          options.addItems.forEach((item) => {
            if (!nextInventory.includes(item)) nextInventory.push(item);
          });
        }

        let nextFacts = [...prev.discoveredFacts];
        if (options?.unlockFacts) {
          options.unlockFacts.forEach((fid) => {
            if (!nextFacts.includes(fid)) {
              nextFacts.push(fid);
              setNewFactToast(fid);
            }
          });
        }

        let nextClues = [...prev.collectedClues];
        if (options?.unlockClues) {
          options.unlockClues.forEach((cid) => {
            if (!nextClues.includes(cid)) {
              nextClues.push(cid);
              setNewClueToast(cid);
            }
          });
        }

        return {
          ...prev,
          questStage: nextStage,
          inventory: nextInventory,
          discoveredFacts: nextFacts,
          collectedClues: nextClues,
          riverTidePhase: options?.tidePhase ?? prev.riverTidePhase,
          floodedPathSolution: options?.floodedPathSolution ?? prev.floodedPathSolution,
          chapter1Completed: options?.completedChapter ?? prev.chapter1Completed,
        };
      });
    },
    [updateProgress]
  );

  const savePlayerPosition = useCallback(
    (x: number, y: number, zone: 'VILLAGE' | 'CAMP' | 'RIVER') => {
      updateProgress((prev) => ({
        ...prev,
        playerPosition: { x: Math.round(x), y: Math.round(y), zone },
      }));
    },
    [updateProgress]
  );

  const markMarkerObserved = useCallback(
    (tide: 'LOW' | 'HIGH') => {
      updateProgress((prev) => ({
        ...prev,
        observedLowTideMarker: tide === 'LOW' ? true : prev.observedLowTideMarker,
        observedHighTideMarker: tide === 'HIGH' ? true : prev.observedHighTideMarker,
      }));
    },
    [updateProgress]
  );

  const markHelpedVillager = useCallback(() => {
    sound.playSuccess();
    updateProgress((prev) => ({
      ...prev,
      helpedVillagerWood: true,
    }));
  }, [updateProgress]);

  const completeRecap = useCallback(() => {
    voiceManager.stop();
    sound.playChapterVictory();
    updateProgress((prev) => ({
      ...prev,
      completedRecapOrder: true,
      chapter1Completed: true,
    }));
  }, [updateProgress]);

  const restartAdventure = useCallback(() => {
    voiceManager.stop();
    sound.playClick();
    updateProgress((prev) => ({
      ...prev,
      currentScreen: 'GAME',
      questStage: 'STAGE_0_PROLOGUE',
      inventory: [],
      collectedClues: [],
      challengeAttempts: { A: 0, B: 0, C: 0 },
      riverTidePhase: 'LOW_TIDE',
      playerPosition: { x: 420, y: 1050, zone: 'VILLAGE' },
      observedLowTideMarker: false,
      observedHighTideMarker: false,
      helpedVillagerWood: false,
      floodedPathSolution: 'NONE',
    }));
  }, [updateProgress]);

  const resetGame = useCallback(() => {
    voiceManager.stop();
    sound.playClick();
    storage.clear();
    setProgress(DEFAULT_USER_PROGRESS);
    setHasSavedGame(false);
    setIsFreshCharacterSetup(true);
  }, []);

  const openCodex = useCallback((factId?: string) => {
    voiceManager.stop();
    sound.playClick();
    setSelectedFactId(factId || null);
    setIsCodexOpen(true);
  }, []);

  const closeCodex = useCallback(() => {
    sound.playClick();
    setIsCodexOpen(false);
    setSelectedFactId(null);
  }, []);

  const clearFactToast = useCallback(() => {
    setNewFactToast(null);
  }, []);

  const clearClueToast = useCallback(() => {
    setNewClueToast(null);
  }, []);

  const openCipherPuzzle = useCallback((puzzleId: CipherPuzzleId) => {
    sound.playClick();
    setActiveCipherPuzzle(puzzleId);
  }, []);

  const closeCipherPuzzle = useCallback(() => {
    setActiveCipherPuzzle(null);
  }, []);

  const solveCipher = useCallback(
    (puzzleId: CipherPuzzleId) => {
      sound.playSuccess();
      updateProgress((prev) => {
        if (prev.solvedCiphers?.includes(puzzleId)) return prev;
        return {
          ...prev,
          solvedCiphers: [...(prev.solvedCiphers || []), puzzleId],
        };
      });
    },
    [updateProgress]
  );

  return (
    <GameContext.Provider
      value={{
        progress,
        isCodexOpen,
        selectedFactId,
        hasSavedGame,
        newFactToast,
        newClueToast,
        isFreshCharacterSetup,
        activeCipherPuzzle,
        openCipherPuzzle,
        closeCipherPuzzle,
        solveCipher,
        setScreen,
        startNewCharacterSetup,
        setPlayerProfile,
        toggleSound,
        toggleReducedEffects,
        updateAudioSettings,
        setFloodedPathSolution,
        unlockFact,
        unlockClue,
        recordChallengeAttempt,
        advanceQuest,
        savePlayerPosition,
        markMarkerObserved,
        markHelpedVillager,
        completeRecap,
        restartAdventure,
        resetGame,
        openCodex,
        closeCodex,
        clearFactToast,
        clearClueToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
