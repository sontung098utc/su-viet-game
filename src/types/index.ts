// Định nghĩa kiểu dữ liệu cho trò chơi phiêu lưu giải mã 2D MẬT MÃ SỬ VIỆT

export type ContentClassification = 'HISTORICAL_FACT' | 'INTERPRETATION' | 'FICTION';
export type VerificationStatus = 'VERIFIED' | 'PENDING_VERIFICATION' | 'GAMEPLAY_MECHANIC';
export type GameMode = 'GUIDED' | 'DISCOVERY';
export type AvatarOutfit = 'brown' | 'indigo';

export interface HistoricalSource {
  id: string;
  name: string;
  authorOrInstitution: string;
  details: string;
  supportedClaims: string;
  url?: string;
  isPrimary: boolean;
}

export interface HistoricalFact {
  id: string;
  title: string;
  summary: string;
  detailedContent: string;
  classification: ContentClassification;
  verificationStatus: VerificationStatus;
  sourceIds: string[];
  sourceNotes: string;
  era: string;
  keyTakeaway?: string;
}

// Danh tính tách biệt rõ giữa Người chơi (playerId) và NPC (npcId)
export type PlayerId = 'player_messenger';

export type NpcId =
  | 'npc_elder'
  | 'npc_boatman'
  | 'npc_contact'
  | 'npc_commander'
  | 'npc_blacksmith'
  | 'npc_woodworker'
  | 'npc_villager_pier'
  | 'npc_scout'
  | 'npc_ngo_quyen';

export type SpeakerId =
  | 'messenger'
  | 'elder'
  | 'commander'
  | 'blacksmith'
  | 'scout'
  | 'boatman'
  | 'villager'
  | 'ngo_quyen';

export type PortraitId = SpeakerId;

export interface NpcIdentity {
  npcId: NpcId;
  npcName: string;
  speakerId: SpeakerId;
  roleTitle: string;
  classification: ContentClassification;
}

export type VoiceEmotion = 'calm' | 'worried' | 'happy' | 'urgent' | 'whisper';
export type VoiceAudioStatus = 'missing' | 'draft' | 'complete';

export interface CharacterVoiceConfig {
  speakerId: SpeakerId;
  displayName: string;
  roleTitle: string;
  voiceDescription: string;
  voiceActorOrEngine: string;
  gainMultiplier: number;
  fallbackPitch: number;
  fallbackRate: number;
  isHistoricalFigure: boolean;
  historicalDisclaimer?: string;
}

export interface DialogueLine {
  id: string;                          // ID ổn định (VD: 'dlg_village_intro_01')
  speakerId: SpeakerId;                // Mã giọng nhân vật phát âm
  npcId?: NpcId;                       // Mã định danh NPC (nếu người nói là NPC)
  speaker: string;                     // Tên hiển thị của người nói
  speakerRole: string;                 // Vai trò hiển thị
  portraitId: PortraitId;              // Chân dung hiển thị
  text: string;                        // Phụ đề khớp 100% với giọng đọc
  contextNote?: string;                // Ghi chú chỉ có chữ (hỗ trợ nội suy {playerName} rõ ràng)
  emotion: VoiceEmotion;               // Cảm xúc diễn xuất (lưu trong dữ liệu, không hiện nhãn kỹ thuật lên HUD)
  actingDirection: string;             // Chỉ dẫn diễn xuất (lưu trong dữ liệu/báo cáo)
  audioSrc?: string;                   // Đường dẫn file âm thanh tĩnh
  audioStatus: VoiceAudioStatus;       // 'missing' | 'draft' | 'complete'
  isHistoricalFigureFiction?: boolean; // Đánh dấu lời thoại hư cấu của nhân vật lịch sử
  unlockFactId?: string;
  unlockClueId?: ClueId;
}

export interface AudioMixSettings {
  soundEnabled: boolean;          // Công tắc âm thanh tổng
  voiceEnabled: boolean;          // Bật/tắt giọng lồng tiếng (vẫn giữ phụ đề)
  voiceVolume: number;            // Âm lượng giọng nói (0..1)
  bgmVolume: number;              // Âm lượng nhạc nền/môi trường (0..1)
  sfxVolume: number;              // Âm lượng hiệu ứng (0..1)
  useBrowserTtsFallback: boolean; // Dự phòng speechSynthesis
}

// Manh mối hình ảnh thu thập được trong 3 Thử thách Giải mã (A, B, C) & Mật thư ẩn
export type ClueId =
  | 'clue_a_cipher_note'      // Mật tín 3 dấu hiệu điểm hẹn ở Làng Ven Sông
  | 'clue_b_wood_stake'       // Manh mối 1: Cọc gỗ lớn vạt nhọn đầu (từ Quân sĩ vạt cọc)
  | 'clue_b_iron_band'        // Manh mối 2: Đai sắt tôi lửa than già bọc mũi cọc (từ Bác thợ rèn Tạo)
  | 'clue_b_estuary_map'      // Manh mối 3: Sơ đồ đóng cọc ngầm cửa biển (từ Bàn bản đồ)
  | 'clue_c_low_tide_mark'    // Manh mối 4: Dấu nước ròng lộ bãi cọc & lối đá thấp
  | 'clue_c_high_tide_flood'  // Manh mối 5: Dấu nước lớn giấu cọc & làm ngập lối đá thấp
  | 'clue_secret_ancient_well'   // Mật thư ẩn 1: Kế Đóng Cọc Lấy Yếu Thắng Mạnh (tại Giếng Làng Cổ)
  | 'clue_secret_shrine_cache'   // Mật thư ẩn 2: Chiếu Lệnh Khởi Binh Ái Châu (tại Hốc Đá Miếu Cổ)
  | 'clue_secret_boat_pitch';    // Mật thư ẩn 3: Bí Quyết Thuyền Nhẹ Lướt Sóng (tại Bến Đò Bác Năm)

export type CipherPuzzleId =
  | 'CIPHER_VILLAGE_SCROLL'   // Cuộn mật thư thơ lục bát ẩn tự & hoa tiêu phương vị ở Làng
  | 'CIPHER_CAMP_CHEST'        // Hòm cơ mật quân lệnh khóa 3 trục số 9-3-8 ở Doanh trại
  | 'CIPHER_TIDE_STELE'        // Bia đá cổ khắc trận đồ con nước thủy triều Bạch Đằng
  | 'CIPHER_SECRET_WELL'       // Mật thư cổ ẩn tại Giếng Làng
  | 'CIPHER_SECRET_SHRINE'     // Mật thư cổ ẩn tại Miếu Cổ Cây Đa
  | 'CIPHER_SECRET_PITCH';     // Mật thư cổ ẩn tại Bến Đò Bác Năm

// Mảnh ghép Cổ vật Chương 1: Cổ Loa - Nỏ Thần 3D
export type CoLoaRelicId =
  | 'SHARD_CROSSBOW_STOCK'     // Thân Nỏ Gỗ Dâu Rừng Đông Sơn (tại Lò Rèn Cao Lỗ)
  | 'SHARD_TURTLE_TRIGGER'     // Lẫy Móng Rùa Kim Quy Bằng Đồng (tại Đàn Tế Giếng Ngọc)
  | 'SHARD_BRONZE_ARROWS';     // Ống Mũi Tên Đồng Ba Cạnh Cầu Vực (tại Kho Binh Khí)

export interface CoLoaRelic {
  id: CoLoaRelicId;
  name: string;
  subtitle: string;
  locationName: string;
  hint: string;
  archaeologicalFact: string;
  modelType: 'trigger' | 'stock' | 'arrows';
  historicalSource: string;
}

export interface VisualClue {
  id: ClueId;
  challenge: 'A' | 'B' | 'C';
  title: string;
  shortSummary: string;
  iconType: 'scroll' | 'wood' | 'anvil' | 'map' | 'tide_low' | 'tide_high';
  classification: ContentClassification;
}

// Các chặng cốt truyện tích hợp 3 Thử thách Giải mã (A, B, C) + tương thích dữ liệu lưu cũ
export type QuestStage =
  | 'STAGE_0_PROLOGUE'            // Tương thích bản lưu cũ -> chuyển vào gặp Cụ Trưởng Thôn nhận Mật tín A
  | 'STAGE_0_DECODE_MEETING'      // THỬ THÁCH A: Quan sát 3 điểm trong Làng để giải mã đúng Điểm Hẹn nhận Thẻ Lệnh
  | 'STAGE_1_MEET_COMMANDER'      // Lên Khu Chuẩn Bị gặp Đội Trưởng Lê nhận nhiệm vụ ghép manh mối Cọc Bịt Sắt
  | 'STAGE_2_TALK_BLACKSMITH'     // Tương thích bản lưu cũ
  | 'STAGE_2_GATHER_CLUES'        // THỬ THÁCH B: Trò chuyện & quan sát để ghép manh mối chọn đúng Giá Cọc Bịt Sắt
  | 'STAGE_3_FETCH_CHARCOAL'      // Tương thích bản lưu cũ
  | 'STAGE_4_DELIVER_CHARCOAL'    // Tương thích bản lưu cũ
  | 'STAGE_5_FIRST_RIVER_VISIT'   // Xuống Bến Quan Sát lúc Nước Ròng, xem Cột Mốc Đá & gặp Trinh Sát Hải
  | 'STAGE_6_FLOODED_PATH_CHOICE' // THỬ THÁCH C (Phần 1): Nước triều dâng ngập Lối Đá Thấp -> Chọn Cầu Tre Gò Cao hoặc Thuyền Bác Năm
  | 'STAGE_6_REPORT_COMMANDER'    // Báo tin cho Đội Trưởng Lê và nhận Cờ Hiệu Xuất Kích
  | 'STAGE_7_SECOND_RIVER_VISIT'  // Quay lại Bến Quan Sát kiểm tra Cột Mốc Đá lúc Nước Lớn
  | 'STAGE_8_CLIMAX_SIGNAL'       // THỬ THÁCH C (Phần 2): Chọn đúng thời điểm chuyển pha Nước Rút để phất Cờ Hiệu cùng Trinh Sát Hải
  | 'STAGE_9_COMPLETED';          // Hoàn thành chương

export type FloodedPathSolution = 'NONE' | 'HIGH_BRIDGE' | 'BOATMAN_FERRY';

export type InventoryItemId =
  | 'cipher_scroll'
  | 'order_token'
  | 'charcoal_sack'
  | 'iron_bands'
  | 'tide_report'
  | 'battle_flag';

export interface InventoryItem {
  id: InventoryItemId;
  name: string;
  description: string;
}

export type RiverTidePhase = 'LOW_TIDE' | 'HIGH_TIDE' | 'EBBING_CLIMAX';

export interface MissionProgress {
  completed: boolean;
  score: number;
  unlockedClues: string[];
  attempts: number;
  completedAt?: string;
}

export interface UserProgress {
  schemaVersion: number;
  playerId: PlayerId;
  playerName: string;
  avatarOutfit: AvatarOutfit;
  gameMode: GameMode;
  soundEnabled: boolean;
  reducedEffects: boolean;
  audioSettings: AudioMixSettings;
  currentScreen: 'START' | 'SETUP' | 'GAME' | 'SUMMARY' | 'GAME_3D_CO_LOA';
  selectedChapter?: 'CHAPTER_1_CO_LOA' | 'CHAPTER_2_BACH_DANG';
  coLoaProgress?: {
    collectedShards: CoLoaRelicId[];
    inspectedRelic: CoLoaRelicId | null;
    crossbowAssembled: boolean;
    targetsDestroyed: number;
    chapterCompleted: boolean;
  };
  questStage: QuestStage;
  floodedPathSolution: FloodedPathSolution;
  inventory: InventoryItemId[];
  collectedClues: ClueId[];
  solvedCiphers: CipherPuzzleId[];
  challengeAttempts: {
    A: number;
    B: number;
    C: number;
  };
  riverTidePhase: RiverTidePhase;
  playerPosition: { x: number; y: number; zone: 'VILLAGE' | 'CAMP' | 'RIVER' };
  observedLowTideMarker: boolean;
  observedHighTideMarker: boolean;
  helpedVillagerWood: boolean;
  missions: {
    [missionId: string]: MissionProgress;
  };
  discoveredFacts: string[];
  chapter1Completed: boolean;
  completedRecapOrder: boolean;
  startedAt?: string;
  completedAt?: string;
  totalPlayTimeSeconds?: number;
  scholarPoints?: number;
  dailyMissions?: DailyMissionsState;
  historicalMissions?: HistoricalMissionsProgress;
  lastSavedAt: string;
}

export type HistoricalMissionId =
  | 'MISSION_TACTICAL_SANDTABLE'
  | 'MISSION_CO_LOA_BALLISTICS'
  | 'MISSION_WAR_COUNCIL_DEBATE'
  | 'MISSION_LOGISTICS_AND_PEOPLE';

export type HistoricalMissionCategory =
  | 'TACTICAL_SANDTABLE'
  | 'ARCHAEOLOGY_RESTORE'
  | 'WAR_COUNCIL'
  | 'LOGISTICS_CIVILIAN';

export interface HistoricalMissionsProgress {
  completedMissionIds: HistoricalMissionId[];
  sandtableDecisions?: {
    tideTiming?: 'MORNING_EBB' | 'NOON_FLOOD_AFTERNOON_EBB' | 'NIGHT_FLOOD';
    woodMaterial?: 'BAMBOO' | 'IRONWOOD_LIM' | 'SOFT_PINE';
    stakeAngle?: 'VERTICAL_90' | 'SLANTED_45_EBB' | 'OPPOSITE_45';
    fleetTactic?: 'FRONTAL_CHARGE' | 'FEIGNED_RETREAT_BAIT' | 'SHORE_DEFENSE';
    score?: number;
  };
  archaeologyDecisions?: {
    assembledParts: string[];
    testedAerodynamics: boolean;
    discoveredExcavation: boolean;
    score?: number;
  };
  warCouncilDecisions?: {
    q1Verdict?: string;
    q2Verdict?: string;
    q3Verdict?: string;
    score?: number;
  };
  logisticsDecisions?: {
    woodLogged: boolean;
    ironForged: boolean;
    pitchSealed: boolean;
    score?: number;
  };
}

export type ScholarRankId =
  | 'SI_TU'
  | 'TU_TAI'
  | 'CU_NHAN'
  | 'TIEN_SI'
  | 'BANG_NHAN'
  | 'TRANG_NGUYEN';

export interface ScholarRank {
  id: ScholarRankId;
  title: string;
  minPoints: number;
  nextPoints: number | null;
  badge: string;
  hatIcon: string;
  description: string;
  historicalNote: string;
}

export type DailyMissionType = 'TRIVIA' | 'EXPLORATION';

export type DailyExplorationTarget =
  | 'READ_CODEX'
  | 'EXPLORE_CO_LOA'
  | 'SOLVE_CIPHER'
  | 'PLAY_AMBIENT_MUSIC'
  | 'INSPECT_RELIC'
  | 'SMELTING_TRIAL';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  title: string;
  description: string;
  points: number;
  category: string;
  completed: boolean;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  userAnswerIndex?: number;
  explorationTarget?: DailyExplorationTarget;
  actionLabel?: string;
  hint?: string;
}

export interface DailyMissionsState {
  dateString: string;
  streakDays: number;
  missions: DailyMission[];
  dailyBonusClaimed: boolean;
  lastCompletedDate?: string;
}

export type AchievementId =
  | 'ACH_SPEED_GOLD'
  | 'ACH_SPEED_SILVER'
  | 'ACH_CIPHER_MASTER'
  | 'ACH_CIPHER_SCHOLAR'
  | 'ACH_SECRET_CIPHER'
  | 'ACH_PERFECT_INVESTIGATION'
  | 'ACH_ALL_CLUES'
  | 'ACH_HISTORICAL_CODEX'
  | 'ACH_CHRONICLER_RECAP';

export type AchievementTier = 'gold' | 'silver' | 'bronze' | 'jade';
export type AchievementCategory = 'all' | 'speed' | 'puzzle' | 'secret' | 'mastery';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  subtitle: string;
  sealName: string;
  category: 'speed' | 'puzzle' | 'secret' | 'mastery';
  tier: AchievementTier;
  description: string;
  loreContext: string;
  targetCriteria: string;
  iconType: 'speed' | 'cipher' | 'secret' | 'accuracy' | 'codex' | 'recap' | 'clues';
}

export interface UserAchievement extends AchievementDefinition {
  isUnlocked: boolean;
  progressCurrent: number;
  progressMax: number;
  progressLabel: string;
  unlockedAt?: string;
}

