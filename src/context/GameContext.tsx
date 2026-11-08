import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  DailyExplorationTarget,
  HistoricalMissionId,
  UserAchievement,
  AchievementId,
} from '../types';
import { storage, DEFAULT_USER_PROGRESS } from '../utils/storage';
import { sound } from '../utils/sound';
import { voiceManager } from '../utils/voiceManager';
import { getDailyMissionsForDate, DAILY_COMPLETION_BONUS_POINTS } from '../data/dailyMissions';
import { evaluateAchievements } from '../data/achievements';

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
  isDailyMissionsOpen: boolean;
  openDailyMissions: () => void;
  closeDailyMissions: () => void;
  answerDailyTrivia: (missionId: string, answerIndex: number) => { isCorrect: boolean; pointsAwarded: number; explanation: string };
  completeDailyExploration: (target: DailyExplorationTarget) => boolean;
  claimDailyBonus: () => boolean;
  isHistoricalMissionsOpen: boolean;
  activeHistoricalMissionId: HistoricalMissionId | null;
  openHistoricalMissions: (missionId?: HistoricalMissionId) => void;
  closeHistoricalMissions: () => void;
  recordHistoricalMissionCompletion: (
    missionId: HistoricalMissionId,
    score: number,
    details?: any
  ) => void;
  isAchievementsOpen: boolean;
  openAchievements: () => void;
  closeAchievements: () => void;
  newAchievementToast: UserAchievement | null;
  clearAchievementToast: () => void;
  unlockAchievement: (id: AchievementId) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(() => storage.load());
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [isHistoricalMissionsOpen, setIsHistoricalMissionsOpen] = useState(false);
  const [activeHistoricalMissionId, setActiveHistoricalMissionId] = useState<HistoricalMissionId | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [newAchievementToast, setNewAchievementToast] = useState<UserAchievement | null>(null);
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(() => storage.hasSavedGame());
  const [newFactToast, setNewFactToast] = useState<string | null>(null);
  const [newClueToast, setNewClueToast] = useState<ClueId | null>(null);
  const [isFreshCharacterSetup, setIsFreshCharacterSetup] = useState<boolean>(false);
  const [activeCipherPuzzle, setActiveCipherPuzzle] = useState<CipherPuzzleId | null>(null);

  const unlockedAchievementIdsRef = useRef<Set<string>>(
    new Set(storage.load().unlockedAchievementIds || [])
  );

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
      updateProgress((prev) => {
        let nextCompletedAt = prev.completedAt;
        let nextTotalTimeSeconds = prev.totalPlayTimeSeconds;

        if (screen === 'SUMMARY' && !nextTotalTimeSeconds) {
          const now = Date.now();
          const startMs = prev.startedAt ? new Date(prev.startedAt).getTime() : now - 240000;
          const elapsed = Math.max(1, Math.round((now - startMs) / 1000));
          nextCompletedAt = nextCompletedAt || new Date(now).toISOString();
          nextTotalTimeSeconds = elapsed;
        }

        return {
          ...prev,
          currentScreen: screen,
          completedAt: nextCompletedAt,
          totalPlayTimeSeconds: nextTotalTimeSeconds,
        };
      });
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
        startedAt: new Date().toISOString(),
        completedAt: undefined,
        totalPlayTimeSeconds: undefined,
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
    updateProgress((prev) => {
      const now = Date.now();
      const startMs = prev.startedAt ? new Date(prev.startedAt).getTime() : now - 240000;
      const elapsed = prev.totalPlayTimeSeconds || Math.max(1, Math.round((now - startMs) / 1000));
      return {
        ...prev,
        completedRecapOrder: true,
        chapter1Completed: true,
        completedAt: prev.completedAt || new Date(now).toISOString(),
        totalPlayTimeSeconds: elapsed,
      };
    });
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
      completedRecapOrder: false,
      startedAt: new Date().toISOString(),
      completedAt: undefined,
      totalPlayTimeSeconds: undefined,
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

  const openDailyMissions = useCallback(() => {
    sound.playClick();
    setIsDailyMissionsOpen(true);
  }, []);

  const closeDailyMissions = useCallback(() => {
    sound.playClick();
    setIsDailyMissionsOpen(false);
  }, []);

  const completeDailyExploration = useCallback(
    (target: DailyExplorationTarget): boolean => {
      let completedAny = false;
      updateProgress((prev) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const currentDaily = getDailyMissionsForDate(todayStr, prev.dailyMissions);
        let pointsEarned = 0;
        const updatedMissions = currentDaily.missions.map((m) => {
          if (m.type === 'EXPLORATION' && m.explorationTarget === target && !m.completed) {
            completedAny = true;
            pointsEarned += m.points;
            return { ...m, completed: true };
          }
          return m;
        });

        if (!completedAny) return prev;

        sound.playSuccess();
        return {
          ...prev,
          scholarPoints: (prev.scholarPoints || 0) + pointsEarned,
          dailyMissions: {
            ...currentDaily,
            missions: updatedMissions,
          },
        };
      });
      return completedAny;
    },
    [updateProgress]
  );

  const answerDailyTrivia = useCallback(
    (missionId: string, answerIndex: number) => {
      let result = { isCorrect: false, pointsAwarded: 0, explanation: '' };
      updateProgress((prev) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const currentDaily = getDailyMissionsForDate(todayStr, prev.dailyMissions);
        const mission = currentDaily.missions.find((m) => m.id === missionId);
        if (!mission || mission.completed) {
          return prev;
        }

        const isCorrect = answerIndex === mission.correctIndex;
        const pointsAwarded = isCorrect ? mission.points : 0;
        result = {
          isCorrect,
          pointsAwarded,
          explanation: mission.explanation || '',
        };

        if (isCorrect) {
          sound.playSuccess();
        } else {
          sound.playError();
        }

        const updatedMissions = currentDaily.missions.map((m) => {
          if (m.id === missionId) {
            return {
              ...m,
              completed: isCorrect,
              userAnswerIndex: answerIndex,
            };
          }
          return m;
        });

        return {
          ...prev,
          scholarPoints: (prev.scholarPoints || 0) + pointsAwarded,
          dailyMissions: {
            ...currentDaily,
            missions: updatedMissions,
          },
        };
      });
      return result;
    },
    [updateProgress]
  );

  const claimDailyBonus = useCallback((): boolean => {
    let success = false;
    updateProgress((prev) => {
      const todayStr = new Date().toISOString().slice(0, 10);
      const currentDaily = getDailyMissionsForDate(todayStr, prev.dailyMissions);
      const allCompleted = currentDaily.missions.length === 3 && currentDaily.missions.every((m) => m.completed);
      if (!allCompleted || currentDaily.dailyBonusClaimed) {
        return prev;
      }

      success = true;
      sound.playChapterVictory();
      return {
        ...prev,
        scholarPoints: (prev.scholarPoints || 0) + DAILY_COMPLETION_BONUS_POINTS,
        dailyMissions: {
          ...currentDaily,
          dailyBonusClaimed: true,
          lastCompletedDate: todayStr,
        },
      };
    });
    return success;
  }, [updateProgress]);

  const openCodex = useCallback(
    (factId?: string) => {
      voiceManager.stop();
      sound.playClick();
      setSelectedFactId(factId || null);
      setIsCodexOpen(true);
      completeDailyExploration('READ_CODEX');
    },
    [completeDailyExploration]
  );

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
      completeDailyExploration('SOLVE_CIPHER');
      updateProgress((prev) => {
        if (prev.solvedCiphers?.includes(puzzleId)) return prev;
        return {
          ...prev,
          solvedCiphers: [...(prev.solvedCiphers || []), puzzleId],
        };
      });
    },
    [updateProgress, completeDailyExploration]
  );

  const openHistoricalMissions = useCallback((missionId?: HistoricalMissionId) => {
    sound.playClick();
    setActiveHistoricalMissionId(missionId || null);
    setIsHistoricalMissionsOpen(true);
  }, []);

  const closeHistoricalMissions = useCallback(() => {
    sound.playClick();
    setIsHistoricalMissionsOpen(false);
    setActiveHistoricalMissionId(null);
  }, []);

  const recordHistoricalMissionCompletion = useCallback(
    (missionId: HistoricalMissionId, score: number, details?: any) => {
      sound.playSuccess();
      updateProgress((prev) => {
        const prevCompleted = prev.historicalMissions?.completedMissionIds || [];
        const isNewCompletion = !prevCompleted.includes(missionId);
        const nextCompleted = isNewCompletion ? [...prevCompleted, missionId] : prevCompleted;

        const bonusPoints = isNewCompletion ? 100 : 25;
        const currentPoints = prev.scholarPoints || 0;

        let nextHistorical = {
          ...(prev.historicalMissions || { completedMissionIds: [] }),
          completedMissionIds: nextCompleted,
        };

        if (missionId === 'MISSION_TACTICAL_SANDTABLE' && details) {
          nextHistorical = {
            ...nextHistorical,
            sandtableDecisions: {
              ...(nextHistorical.sandtableDecisions || {}),
              ...details,
              score: Math.max(score, nextHistorical.sandtableDecisions?.score || 0),
            },
          };
        } else if (missionId === 'MISSION_CO_LOA_BALLISTICS' && details) {
          nextHistorical = {
            ...nextHistorical,
            archaeologyDecisions: {
              ...(nextHistorical.archaeologyDecisions || { assembledParts: [], testedAerodynamics: false, discoveredExcavation: false }),
              ...details,
              score: Math.max(score, nextHistorical.archaeologyDecisions?.score || 0),
            },
          };
        } else if (missionId === 'MISSION_WAR_COUNCIL_DEBATE' && details) {
          nextHistorical = {
            ...nextHistorical,
            warCouncilDecisions: {
              ...(nextHistorical.warCouncilDecisions || {}),
              ...details,
              score: Math.max(score, nextHistorical.warCouncilDecisions?.score || 0),
            },
          };
        } else if (missionId === 'MISSION_LOGISTICS_AND_PEOPLE' && details) {
          nextHistorical = {
            ...nextHistorical,
            logisticsDecisions: {
              ...(nextHistorical.logisticsDecisions || { woodLogged: false, ironForged: false, pitchSealed: false }),
              ...details,
              score: Math.max(score, nextHistorical.logisticsDecisions?.score || 0),
            },
          };
        }

        return {
          ...prev,
          scholarPoints: currentPoints + bonusPoints,
          historicalMissions: nextHistorical,
        };
      });
    },
    [updateProgress]
  );

  const openAchievements = useCallback(() => {
    sound.playClick();
    setIsAchievementsOpen(true);
  }, []);

  const closeAchievements = useCallback(() => {
    sound.playClick();
    setIsAchievementsOpen(false);
  }, []);

  const clearAchievementToast = useCallback(() => {
    setNewAchievementToast(null);
  }, []);

  const unlockAchievement = useCallback((id: AchievementId) => {
    if (!unlockedAchievementIdsRef.current.has(id)) {
      unlockedAchievementIdsRef.current.add(id);
      updateProgress((prev) => ({
        ...prev,
        unlockedAchievementIds: Array.from(unlockedAchievementIdsRef.current),
      }));
    }
  }, [updateProgress]);

  // Theo dõi mở khóa thành tựu theo thời gian thực và thông báo cho người chơi
  useEffect(() => {
    const elapsed = progress.totalPlayTimeSeconds || 240;
    const all = evaluateAchievements(progress, elapsed);
    const newlyUnlocked: UserAchievement[] = [];

    all.forEach((ach) => {
      if (ach.isUnlocked && !unlockedAchievementIdsRef.current.has(ach.id)) {
        unlockedAchievementIdsRef.current.add(ach.id);
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      sound.playSuccess();
      setNewAchievementToast(newlyUnlocked[newlyUnlocked.length - 1]);
      updateProgress((prev) => ({
        ...prev,
        unlockedAchievementIds: Array.from(unlockedAchievementIdsRef.current),
      }));
    }
  }, [
    progress.solvedCiphers,
    progress.collectedClues,
    progress.discoveredFacts,
    progress.challengeAttempts,
    progress.historicalMissions,
    progress.scholarPoints,
    progress.coLoaProgress,
    progress.completedRecapOrder,
    progress.chapter1Completed,
    updateProgress,
  ]);

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
        isDailyMissionsOpen,
        openDailyMissions,
        closeDailyMissions,
        answerDailyTrivia,
        completeDailyExploration,
        claimDailyBonus,
        isHistoricalMissionsOpen,
        activeHistoricalMissionId,
        openHistoricalMissions,
        closeHistoricalMissions,
        recordHistoricalMissionCompletion,
        isAchievementsOpen,
        openAchievements,
        closeAchievements,
        newAchievementToast,
        clearAchievementToast,
        unlockAchievement,
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
