import type { UserProgress, QuestStage, ClueId } from '../types';
import { QUEST_OBJECTIVES, VISUAL_CLUES } from '../data/chapter1';

const STORAGE_KEY = 'MAT_MA_SU_VIET_PROGRESS_V1';
export const CURRENT_SCHEMA_VERSION = 3;

export const DEFAULT_USER_PROGRESS: UserProgress = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  playerId: 'player_messenger',
  playerName: '',
  avatarOutfit: 'brown',
  gameMode: 'GUIDED',
  soundEnabled: true,
  reducedEffects: false,
  audioSettings: {
    soundEnabled: true,
    voiceEnabled: true,
    voiceVolume: 0.9,
    bgmVolume: 0.45,
    sfxVolume: 0.7,
    useBrowserTtsFallback: false,
  },
  currentScreen: 'START',
  questStage: 'STAGE_0_PROLOGUE',
  floodedPathSolution: 'NONE',
  inventory: [],
  collectedClues: [],
  solvedCiphers: [],
  challengeAttempts: {
    A: 0,
    B: 0,
    C: 0,
  },
  riverTidePhase: 'LOW_TIDE',
  playerPosition: { x: 420, y: 1050, zone: 'VILLAGE' },
  observedLowTideMarker: false,
  observedHighTideMarker: false,
  helpedVillagerWood: false,
  missions: {
    'mission-1': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
    'mission-2': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
    'mission-3': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
  },
  discoveredFacts: ['fact-simulation-and-fiction-note'],
  chapter1Completed: false,
  selectedChapter: 'CHAPTER_1_CO_LOA',
  coLoaProgress: {
    collectedShards: [],
    inspectedRelic: null,
    crossbowAssembled: false,
    targetsDestroyed: 0,
    chapterCompleted: false,
  },
  completedRecapOrder: false,
  lastSavedAt: new Date().toISOString(),
};

export const storage = {
  load(): UserProgress {
    if (typeof window === 'undefined') return DEFAULT_USER_PROGRESS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_USER_PROGRESS;

      const parsed = JSON.parse(raw) as Partial<UserProgress>;
      const validScreens: UserProgress['currentScreen'][] = ['START', 'SETUP', 'GAME', 'SUMMARY', 'GAME_3D_CO_LOA'];
      const mappedScreen: UserProgress['currentScreen'] =
        parsed.currentScreen && validScreens.includes(parsed.currentScreen)
          ? parsed.currentScreen
          : parsed.playerName
          ? 'GAME'
          : 'START';

      const rawStage = parsed.questStage === 'STAGE_2_TALK_BLACKSMITH'
        ? 'STAGE_2_GATHER_CLUES'
        : parsed.questStage;

      const mappedStage: QuestStage =
        rawStage && rawStage in QUEST_OBJECTIVES
          ? rawStage
          : DEFAULT_USER_PROGRESS.questStage;

      const validClues: ClueId[] = Array.isArray(parsed.collectedClues)
        ? parsed.collectedClues.filter((cid): cid is ClueId => cid in VISUAL_CLUES)
        : [];

      return {
        ...DEFAULT_USER_PROGRESS,
        ...parsed,
        playerId: 'player_messenger',
        playerName: typeof parsed.playerName === 'string' ? parsed.playerName.trim() : '',
        currentScreen: mappedScreen,
        questStage: mappedStage,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        reducedEffects: Boolean(parsed.reducedEffects),
        audioSettings: {
          ...DEFAULT_USER_PROGRESS.audioSettings,
          ...(parsed.audioSettings || {}),
          soundEnabled:
            parsed.audioSettings?.soundEnabled !== undefined
              ? parsed.audioSettings.soundEnabled
              : parsed.soundEnabled !== undefined
              ? parsed.soundEnabled
              : true,
        },
        floodedPathSolution: parsed.floodedPathSolution || 'NONE',
        inventory: Array.isArray(parsed.inventory)
          ? parsed.inventory
          : DEFAULT_USER_PROGRESS.inventory,
        collectedClues: validClues,
        solvedCiphers: Array.isArray(parsed.solvedCiphers)
          ? parsed.solvedCiphers
          : DEFAULT_USER_PROGRESS.solvedCiphers,
        challengeAttempts: {
          ...DEFAULT_USER_PROGRESS.challengeAttempts,
          ...(parsed.challengeAttempts || {}),
        },
        discoveredFacts: Array.isArray(parsed.discoveredFacts)
          ? Array.from(new Set(['fact-simulation-and-fiction-note', ...parsed.discoveredFacts]))
          : DEFAULT_USER_PROGRESS.discoveredFacts,
        playerPosition:
          parsed.playerPosition && typeof parsed.playerPosition.x === 'number'
            ? parsed.playerPosition
            : DEFAULT_USER_PROGRESS.playerPosition,
        missions: {
          ...DEFAULT_USER_PROGRESS.missions,
          ...(parsed.missions || {}),
        },
      };
    } catch (err) {
      console.warn('Lỗi khi tải tiến trình từ localStorage, khôi phục mặc định:', err);
      return DEFAULT_USER_PROGRESS;
    }
  },

  save(progress: UserProgress): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const updated: UserProgress = {
        ...progress,
        playerId: 'player_messenger',
        schemaVersion: CURRENT_SCHEMA_VERSION,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Không thể lưu tiến trình vào localStorage:', err);
      return false;
    }
  },

  clear(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.error('Không thể xóa tiến trình:', err);
      return false;
    }
  },

  reset(): UserProgress {
    this.clear();
    return {
      ...DEFAULT_USER_PROGRESS,
      lastSavedAt: new Date().toISOString(),
    };
  },

  hasSavedGame(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return Boolean(parsed && parsed.playerName && String(parsed.playerName).trim().length > 0);
    } catch {
      return false;
    }
  },
};
