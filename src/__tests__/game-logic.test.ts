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
    expect(verifiedFacts.length).toBe(3);
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
