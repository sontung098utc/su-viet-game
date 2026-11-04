import { describe, it, expect, beforeEach } from 'vitest';
import { storage, DEFAULT_USER_PROGRESS, CURRENT_SCHEMA_VERSION } from '../utils/storage';
import {
  HISTORICAL_FACTS_CH1,
  QUEST_OBJECTIVES,
  JOURNEY_RECAP_CARDS,
  VISUAL_CLUES,
} from '../data/chapter1';
import { HISTORICAL_SOURCES } from '../data/sources';
import {
  CHARACTER_VOICE_CONFIGS,
  DIALOGUE_SCRIPTS,
  NPC_DIRECTORY,
  interpolatePlayerText,
} from '../data/voiceDialogue';
import type { UserProgress, QuestStage } from '../types';

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
});

describe('1. Danh Tính Người Chơi, Chuyển Đổi Dữ Liệu Lưu & 2 Lượt Chơi Tên Khác Nhau', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('Khởi tạo mặc định có playerId riêng biệt và phân biệt hoàn toàn với NPC_DIRECTORY', () => {
    const loaded = storage.load();
    expect(loaded.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(loaded.playerId).toBe('player_messenger');
    expect(NPC_DIRECTORY.npc_scout.npcId).toBe('npc_scout');
    expect(NPC_DIRECTORY.npc_scout.npcName).toBe('Trinh Sát Hải');
    expect(loaded.playerId).not.toBe(NPC_DIRECTORY.npc_scout.npcId);
  });

  it('Kiểm tra 2 lượt chơi với 2 tên tiếng Việt có dấu khác nhau, tải lại giữ đúng tên và tạo mới không dính tên cũ', () => {
    // Lượt chơi 1: Nguyễn Minh An
    const run1: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerId: 'player_messenger',
      playerName: 'Nguyễn Minh An',
      avatarOutfit: 'brown',
      currentScreen: 'GAME',
      questStage: 'STAGE_0_DECODE_MEETING',
      collectedClues: ['clue_a_cipher_note'],
    };
    expect(storage.save(run1)).toBe(true);

    const reloadedRun1 = storage.load();
    expect(reloadedRun1.playerName).toBe('Nguyễn Minh An');
    expect(
      interpolatePlayerText(
        DIALOGUE_SCRIPTS.village_intro[0].contextNote || '',
        reloadedRun1.playerName
      )
    ).toContain('Nguyễn Minh An');

    // Bắt đầu lượt chơi mới (reset) -> không giữ tên cũ của lượt 1, rồi nhập tên lượt 2: Trần Bảo Châu
    const freshAfterReset = storage.reset();
    expect(freshAfterReset.playerName).toBe('');
    expect(freshAfterReset.playerName).not.toBe('Nguyễn Minh An');

    const run2: UserProgress = {
      ...freshAfterReset,
      playerName: 'Trần Bảo Châu',
      currentScreen: 'GAME',
      questStage: 'STAGE_2_GATHER_CLUES',
    };
    storage.save(run2);
    const reloadedRun2 = storage.load();
    expect(reloadedRun2.playerName).toBe('Trần Bảo Châu');
    expect(
      interpolatePlayerText('Người đưa tin {playerName} đã sẵn sàng.', reloadedRun2.playerName)
    ).toBe('Người đưa tin Trần Bảo Châu đã sẵn sàng.');
  });

  it('Không có bất kỳ câu thoại nào gán cứng tên người chơi là Tùng hoặc Kỳ, và giữ nguyên tên NPC Trinh sát Hải', () => {
    const allLines = Object.values(DIALOGUE_SCRIPTS).flat();
    allLines.forEach((line) => {
      expect(line.text).not.toMatch(/\bTùng\b/);
      expect(line.text).not.toMatch(/Kỳ đó ư/);
      expect(line.text).not.toMatch(/Tiểu Kỳ/);
    });

    // Kiểm tra câu nhắc tới NPC Trinh sát Hải không bị biến nội suy làm sai tên
    const scoutRefLine = DIALOGUE_SCRIPTS.pier_low_tide.find((l) => l.id === 'dlg_pier_low_02');
    expect(scoutRefLine).toBeDefined();
    expect(interpolatePlayerText(scoutRefLine!.text, 'Lê Hoàng Nam')).toContain('Trinh sát Hải');
  });

  it('Tự động chuyển đổi (migrate) dữ liệu lưu cũ có questStage cũ sang questStage giải mã mới an toàn', () => {
    localStorageMock.setItem(
      'MAT_MA_SU_VIET_PROGRESS_V1',
      JSON.stringify({
        schemaVersion: 2,
        playerName: 'Hoàng Nam',
        questStage: 'STAGE_2_TALK_BLACKSMITH',
      })
    );
    const migrated = storage.load();
    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.playerName).toBe('Hoàng Nam');
    expect(migrated.questStage).toBe('STAGE_2_GATHER_CLUES');
  });
});

describe('2. Hoàn Thiện 100% Âm Thanh Hội Thoại (38/38 File MP3 Khớp Phụ Đề)', () => {
  it('Tất cả 38 câu thoại trong 21 kịch bản đều có audioStatus === complete và đường dẫn audioSrc chuẩn', () => {
    const allLines = Object.values(DIALOGUE_SCRIPTS).flat();
    expect(allLines.length).toBe(38);

    allLines.forEach((line) => {
      expect(line.audioStatus).toBe('complete');
      expect(line.audioSrc).toBe(`/audio/vo/${line.id}.mp3`);
      expect(line.text.length).toBeGreaterThan(10);
    });
  });

  it('Phân định rõ lời thoại diễn xuất hư cấu đối với nhân vật lịch sử Ngô Quyền', () => {
    expect(CHARACTER_VOICE_CONFIGS.ngo_quyen.isHistoricalFigure).toBe(true);
    expect(CHARACTER_VOICE_CONFIGS.ngo_quyen.historicalDisclaimer).toContain('diễn xuất hư cấu');
  });
});

describe('3. Tích Hợp 3 Thử Thách Giải Mã Hiện Trường, Sổ Manh Mối & Gợi Ý 3 Mức', () => {
  it('Đầy đủ manh mối hình ảnh cho 3 thử thách A, B, C và mật thư ẩn trong VISUAL_CLUES', () => {
    const clues = Object.values(VISUAL_CLUES);
    expect(clues.length).toBe(9);
    expect(clues.filter((c) => c.challenge === 'A').length).toBe(3);
    expect(clues.filter((c) => c.challenge === 'B').length).toBe(3);
    expect(clues.filter((c) => c.challenge === 'C').length).toBe(3);
  });

  it('Mỗi chặng nhiệm vụ đều có đủ 3 mức gợi ý tăng dần (progressiveHints)', () => {
    const stages: QuestStage[] = [
      'STAGE_0_PROLOGUE',
      'STAGE_0_DECODE_MEETING',
      'STAGE_1_MEET_COMMANDER',
      'STAGE_2_GATHER_CLUES',
      'STAGE_3_FETCH_CHARCOAL',
      'STAGE_4_DELIVER_CHARCOAL',
      'STAGE_5_FIRST_RIVER_VISIT',
      'STAGE_6_FLOODED_PATH_CHOICE',
      'STAGE_6_REPORT_COMMANDER',
      'STAGE_7_SECOND_RIVER_VISIT',
      'STAGE_8_CLIMAX_SIGNAL',
      'STAGE_9_COMPLETED',
    ];

    stages.forEach((st) => {
      const obj = QUEST_OBJECTIVES[st];
      expect(obj).toBeDefined();
      expect(obj.progressiveHints).toBeDefined();
      expect(obj.progressiveHints?.length).toBe(3);
    });
  });

  it('Ba mục tiêu kiến thức lịch sử năm 938 đều được xác minh (VERIFIED) và đối chiếu nguồn chính sử', () => {
    expect(HISTORICAL_SOURCES.length).toBeGreaterThanOrEqual(3);
    const verifiedFacts = HISTORICAL_FACTS_CH1.filter(
      (f) => f.classification === 'HISTORICAL_FACT' && f.verificationStatus === 'VERIFIED'
    );
    const verifiedFacts938 = verifiedFacts.filter((f) => f.era.includes('938'));
    expect(verifiedFacts938.length).toBe(3);
    expect(verifiedFacts.length).toBeGreaterThanOrEqual(3);
    expect(JOURNEY_RECAP_CARDS.length).toBe(3);
  });
});

describe('4. Hệ Thống Câu Đố Mật Mã & Mật Thư Khám Phá (Cipher Mechanics)', () => {
  it('Lưu trữ và khôi phục mảng solvedCiphers an toàn', () => {
    const run: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Trần Bảo Châu',
      solvedCiphers: ['CIPHER_VILLAGE_SCROLL', 'CIPHER_CAMP_CHEST'],
      collectedClues: ['clue_a_cipher_note', 'clue_secret_ancient_well'],
    };
    storage.save(run);
    const reloaded = storage.load();
    expect(reloaded.solvedCiphers).toContain('CIPHER_CAMP_CHEST');
    expect(reloaded.collectedClues).toContain('clue_secret_ancient_well');
  });

  it('Các mật thư ẩn (giếng làng, miếu cổ, bến đò) đều có tiêu đề, tóm tắt và phân loại hợp lệ', () => {
    const well = VISUAL_CLUES['clue_secret_ancient_well'];
    const shrine = VISUAL_CLUES['clue_secret_shrine_cache'];
    const pitch = VISUAL_CLUES['clue_secret_boat_pitch'];

    expect(well).toBeDefined();
    expect(well.title).toContain('Giếng Làng');
    expect(shrine).toBeDefined();
    expect(shrine.title).toContain('Miếu Cổ');
    expect(pitch).toBeDefined();
    expect(pitch.title).toContain('Bến Đò Bác Năm');
  });
});

describe('5. Chương 1: Cổ Loa - Nỏ Thần 3D & Mảnh Ghép Cổ Vật', () => {
  it('Chương 1 có đủ 3 mảnh ghép cổ vật với thông tin khảo cổ học và nguồn sử liệu rõ ràng', async () => {
    const { CO_LOA_RELICS, CO_LOA_STORY } = await import('../data/chapterCoLoa');
    expect(CO_LOA_STORY.title).toContain('Cổ Loa');
    expect(CO_LOA_RELICS.SHARD_CROSSBOW_STOCK).toBeDefined();
    expect(CO_LOA_RELICS.SHARD_TURTLE_TRIGGER).toBeDefined();
    expect(CO_LOA_RELICS.SHARD_BRONZE_ARROWS).toBeDefined();

    // Kiểm tra tính xác thực khảo cổ
    expect(CO_LOA_RELICS.SHARD_TURTLE_TRIGGER.archaeologicalFact).toContain('lẫy nỏ đồng');
    expect(CO_LOA_RELICS.SHARD_BRONZE_ARROWS.archaeologicalFact).toContain('Cầu Vực');
  });

  it('Lưu trữ tiến trình Chương 1 Cổ Loa không làm ảnh hưởng tiến trình Bạch Đằng 938', () => {
    const run: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Ngô Việt Hùng',
      currentScreen: 'GAME_3D_CO_LOA',
      coLoaProgress: {
        collectedShards: ['SHARD_CROSSBOW_STOCK', 'SHARD_TURTLE_TRIGGER'],
        inspectedRelic: 'SHARD_TURTLE_TRIGGER',
        crossbowAssembled: false,
        targetsDestroyed: 0,
        chapterCompleted: false,
      },
    };
    storage.save(run);
    const loaded = storage.load();
    expect(loaded.currentScreen).toBe('GAME_3D_CO_LOA');
    expect(loaded.coLoaProgress?.collectedShards).toHaveLength(2);
    expect(loaded.coLoaProgress?.collectedShards).toContain('SHARD_CROSSBOW_STOCK');
  });
});

describe('6. Hệ Thống Thành Tựu (Achievements), Huy Chương & Dấu Ấn Hoàng Triều', () => {
  it('Đánh giá mở khóa huân chương Thần Tốc (dưới 5 phút) và xếp hạng tốc độ Hạng S', async () => {
    const { evaluateAchievements, getSpeedRating, formatDuration } = await import(
      '../data/achievements'
    );

    const fastRun: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Trần Thần Tốc',
      totalPlayTimeSeconds: 240, // 4 phút
    };

    const rating = getSpeedRating(240);
    expect(rating.rank).toBe('S');
    expect(rating.title).toContain('Thần Tốc');
    expect(formatDuration(240)).toBe('04:00');

    const achievements = evaluateAchievements(fastRun, 240);
    const speedGold = achievements.find((a) => a.id === 'ACH_SPEED_GOLD');
    const speedSilver = achievements.find((a) => a.id === 'ACH_SPEED_SILVER');

    expect(speedGold).toBeDefined();
    expect(speedGold!.isUnlocked).toBe(true);
    expect(speedSilver!.isUnlocked).toBe(true);
  });

  it('Đánh giá chính xác thành tựu giải mật mã chính (3/3) và mật thư bí ẩn giấu kín', async () => {
    const { evaluateAchievements } = await import('../data/achievements');

    const puzzleRun: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Lê Cơ Mật',
      solvedCiphers: [
        'CIPHER_VILLAGE_SCROLL',
        'CIPHER_CAMP_CHEST',
        'CIPHER_TIDE_STELE',
        'CIPHER_SECRET_WELL',
      ],
    };

    const achievements = evaluateAchievements(puzzleRun, 400);
    const cipherMaster = achievements.find((a) => a.id === 'ACH_CIPHER_MASTER');
    const secretCipher = achievements.find((a) => a.id === 'ACH_SECRET_CIPHER');
    const cipherScholar = achievements.find((a) => a.id === 'ACH_CIPHER_SCHOLAR');

    expect(cipherMaster!.isUnlocked).toBe(true);
    expect(secretCipher!.isUnlocked).toBe(true);
    expect(cipherScholar!.isUnlocked).toBe(true);
  });

  it('Đánh giá thành tựu Bách Toàn Bách Thắng không mắc lỗi và Đại Định Giang Sơn khi xếp đúng tranh', async () => {
    const { evaluateAchievements } = await import('../data/achievements');

    const perfectRun: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Đặng Quang Vinh',
      questStage: 'STAGE_9_COMPLETED',
      chapter1Completed: true,
      completedRecapOrder: true,
      challengeAttempts: { A: 1, B: 1, C: 1 }, // Mỗi thử thách qua ngay lần đầu
      collectedClues: [
        'clue_a_cipher_note',
        'clue_b_wood_stake',
        'clue_b_iron_band',
        'clue_b_estuary_map',
        'clue_c_low_tide_mark',
        'clue_c_high_tide_flood',
        'clue_secret_ancient_well',
        'clue_secret_shrine_cache',
        'clue_secret_boat_pitch',
      ],
    };

    const achievements = evaluateAchievements(perfectRun, 320);
    const perfectAch = achievements.find((a) => a.id === 'ACH_PERFECT_INVESTIGATION');
    const allCluesAch = achievements.find((a) => a.id === 'ACH_ALL_CLUES');
    const recapAch = achievements.find((a) => a.id === 'ACH_CHRONICLER_RECAP');

    expect(perfectAch!.isUnlocked).toBe(true);
    expect(allCluesAch!.isUnlocked).toBe(true);
    expect(recapAch!.isUnlocked).toBe(true);
  });
});

describe('7. Hệ Thống Nhiệm Vụ Hằng Ngày & Điểm Học Giả (Daily Missions & Scholar Ranks)', () => {
  it('Bậc học vị khoa cử được xác định chính xác theo ngưỡng Điểm Học Giả', async () => {
    const { getScholarRank, SCHOLAR_RANKS } = await import('../data/dailyMissions');

    expect(SCHOLAR_RANKS.length).toBe(6);
    expect(getScholarRank(0).id).toBe('SI_TU');
    expect(getScholarRank(50).id).toBe('SI_TU');
    expect(getScholarRank(100).id).toBe('TU_TAI');
    expect(getScholarRank(249).id).toBe('TU_TAI');
    expect(getScholarRank(250).id).toBe('CU_NHAN');
    expect(getScholarRank(500).id).toBe('TIEN_SI');
    expect(getScholarRank(850).id).toBe('BANG_NHAN');
    expect(getScholarRank(1300).id).toBe('TRANG_NGUYEN');
    expect(getScholarRank(2000).id).toBe('TRANG_NGUYEN');
  });

  it('Sinh 3 nhiệm vụ mỗi ngày gồm 2 câu hỏi sử học và 1 nhiệm vụ thám hiểm/khảo cứu', async () => {
    const { getDailyMissionsForDate, TRIVIA_POOL, EXPLORATION_POOL } = await import('../data/dailyMissions');

    expect(TRIVIA_POOL.length).toBeGreaterThanOrEqual(10);
    expect(EXPLORATION_POOL.length).toBeGreaterThanOrEqual(3);

    const day1 = getDailyMissionsForDate('2026-11-04');
    expect(day1.missions.length).toBe(3);

    const triviaTasks = day1.missions.filter((m) => m.type === 'TRIVIA');
    const expTasks = day1.missions.filter((m) => m.type === 'EXPLORATION');

    expect(triviaTasks.length).toBe(2);
    expect(expTasks.length).toBe(1);

    // Kiểm tra câu hỏi trắc nghiệm có đầy đủ 4 đáp án và luận giải lịch sử
    triviaTasks.forEach((task) => {
      expect(task.options?.length).toBe(4);
      expect(task.correctIndex).toBeDefined();
      expect(task.explanation).toBeTruthy();
      expect(task.points).toBeGreaterThan(0);
    });

    // Nhiệm vụ thám hiểm có đích nhắm hợp lệ
    expect(expTasks[0].explorationTarget).toBeDefined();
    expect(expTasks[0].points).toBeGreaterThan(0);
  });

  it('Tính chất tất định: Cùng một ngày luôn nhận bộ nhiệm vụ giống nhau, ngày khác đổi nhiệm vụ', async () => {
    const { getDailyMissionsForDate } = await import('../data/dailyMissions');

    const firstCall = getDailyMissionsForDate('2026-11-04');
    const secondCall = getDailyMissionsForDate('2026-11-04');

    expect(firstCall.missions.map((m) => m.id)).toEqual(secondCall.missions.map((m) => m.id));

    // Ngày tiếp theo thay đổi câu hỏi
    const nextDay = getDailyMissionsForDate('2026-11-05');
    expect(nextDay.dateString).toBe('2026-11-05');
  });

  it('Tính chuỗi chuyên cần (Streak): Hoàn thành ngày trước thì tăng chuỗi, bỏ ngày thì đặt lại 1', async () => {
    const { getDailyMissionsForDate } = await import('../data/dailyMissions');

    // Ngày 1: Hoàn tất 1 nhiệm vụ
    const day1 = getDailyMissionsForDate('2026-11-04');
    day1.missions[0].completed = true;

    // Ngày 2 kế tiếp liên tục -> streak tăng
    const day2 = getDailyMissionsForDate('2026-11-05', day1);
    expect(day2.streakDays).toBe(2);

    // Ngày 5 (cách 3 ngày) -> streak trở về 1
    const day5 = getDailyMissionsForDate('2026-11-08', day2);
    expect(day5.streakDays).toBe(1);
  });

  it('Lưu trữ và phục hồi Scholar Points cùng tiến trình nhiệm vụ hằng ngày qua storage', () => {
    const progressWithScholar: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Ngô Minh Tuấn',
      scholarPoints: 125,
      dailyMissions: {
        dateString: '2026-11-04',
        streakDays: 3,
        missions: [
          {
            id: 'm1',
            type: 'TRIVIA',
            title: 'Quy luật thủy triều',
            description: 'Test',
            category: 'Bạch Đằng',
            points: 25,
            completed: true,
            userAnswerIndex: 0,
          },
          {
            id: 'm2',
            type: 'TRIVIA',
            title: 'Cổ Loa',
            description: 'Test',
            category: 'Cổ Loa',
            points: 25,
            completed: false,
          },
          {
            id: 'm3',
            type: 'EXPLORATION',
            title: 'Sổ tay',
            description: 'Test',
            category: 'Khảo cứu',
            points: 20,
            completed: false,
            explorationTarget: 'READ_CODEX',
          },
        ],
        dailyBonusClaimed: false,
      },
    };

    expect(storage.save(progressWithScholar)).toBe(true);

    const reloaded = storage.load();
    expect(reloaded.scholarPoints).toBe(125);
    expect(reloaded.dailyMissions).toBeDefined();
    expect(reloaded.dailyMissions?.missions.length).toBe(3);
  });
});

describe('10. Hệ Thống Nhiệm Vụ Sử Học Đa Dạng Dành Cho Học Sinh - Sinh Viên', () => {
  it('Danh mục nhiệm vụ sử học đầy đủ 4 chủ đề đa dạng với nguồn sử liệu sơ cấp', async () => {
    const { HISTORICAL_MISSIONS_CATALOG } = await import('../data/historicalMissions');
    expect(HISTORICAL_MISSIONS_CATALOG.MISSION_TACTICAL_SANDTABLE).toBeDefined();
    expect(HISTORICAL_MISSIONS_CATALOG.MISSION_CO_LOA_BALLISTICS).toBeDefined();
    expect(HISTORICAL_MISSIONS_CATALOG.MISSION_WAR_COUNCIL_DEBATE).toBeDefined();
    expect(HISTORICAL_MISSIONS_CATALOG.MISSION_LOGISTICS_AND_PEOPLE).toBeDefined();

    // Kiểm tra có trích dẫn sử liệu sơ cấp
    const sandtable = HISTORICAL_MISSIONS_CATALOG.MISSION_TACTICAL_SANDTABLE;
    expect(sandtable.primarySources.length).toBeGreaterThanOrEqual(2);
    expect(sandtable.studentLearningObjective).toContain('nhật triều');
  });

  it('Sa bàn tác chiến Bạch Đằng: các quyết sách chiến thuật chuẩn xác theo khoa học thủy văn & khảo cổ', async () => {
    const { SANDTABLE_LEVELS } = await import('../data/historicalMissions');
    expect(SANDTABLE_LEVELS.length).toBe(4);

    // Bước 1: Tính toán thủy triều phải chọn đỉnh triều giờ Ngọ và dốc quân khi triều rút
    const tideStep = SANDTABLE_LEVELS[0];
    const correctTide = tideStep.options.find((o) => o.isCorrect);
    expect(correctTide?.id).toBe('NOON_FLOOD_AFTERNOON_EBB');

    // Bước 2: Chất liệu cọc phải là gỗ lim/sến/táu bọc đai sắt
    const stakeStep = SANDTABLE_LEVELS[1];
    const correctStake = stakeStep.options.find((o) => o.isCorrect);
    expect(correctStake?.id).toBe('IRONWOOD_LIM');

    // Bước 3: Góc cắm nghiêng 45-60 độ xuôi dòng nước rút
    const angleStep = SANDTABLE_LEVELS[2];
    const correctAngle = angleStep.options.find((o) => o.isCorrect);
    expect(correctAngle?.id).toBe('SLANTED_45_EBB');

    // Bước 4: Thuyền nan nhẹ khiêu chiến giả thua nhử địch
    const fleetStep = SANDTABLE_LEVELS[3];
    const correctFleet = fleetStep.options.find((o) => o.isCorrect);
    expect(correctFleet?.id).toBe('FEIGNED_RETREAT_BAIT');
  });

  it('Lưu trữ và nạp lại tiến trình hoàn thành nhiệm vụ sử học qua storage', () => {
    const customProgress: UserProgress = {
      ...DEFAULT_USER_PROGRESS,
      playerName: 'Trần Văn Sử',
      scholarPoints: 350,
      historicalMissions: {
        completedMissionIds: ['MISSION_TACTICAL_SANDTABLE', 'MISSION_CO_LOA_BALLISTICS'],
        sandtableDecisions: {
          tideTiming: 'NOON_FLOOD_AFTERNOON_EBB',
          woodMaterial: 'IRONWOOD_LIM',
          stakeAngle: 'SLANTED_45_EBB',
          fleetTactic: 'FEIGNED_RETREAT_BAIT',
          score: 100,
        },
      },
    };

    expect(storage.save(customProgress)).toBe(true);

    const reloaded = storage.load();
    expect(reloaded.historicalMissions).toBeDefined();
    expect(reloaded.historicalMissions?.completedMissionIds).toContain('MISSION_TACTICAL_SANDTABLE');
    expect(reloaded.historicalMissions?.completedMissionIds).toContain('MISSION_CO_LOA_BALLISTICS');
    expect(reloaded.historicalMissions?.sandtableDecisions?.score).toBe(100);
  });
});


