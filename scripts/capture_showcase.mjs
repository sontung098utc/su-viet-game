import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/sontu/.gemini/antigravity/brain/85d2f58c-e37f-4354-aa69-10b753d3bee3';
const URL = 'http://localhost:5173/';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Viewport: Làng Ven Sông + Hội thoại có giọng nói tiếng Việt
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Thiết lập trạng thái người chơi tại Sân Làng Ven Sông (gần Cụ Trưởng Thôn và dân làng đang trò chuyện)
  await page.evaluate(() => {
    const state = {
      schemaVersion: 2,
      playerName: 'Tiểu Kỳ',
      avatarOutfit: 'brown',
      gameMode: 'GUIDED',
      soundEnabled: true,
      audioSettings: {
        soundEnabled: true,
        voiceEnabled: true,
        voiceVolume: 0.9,
        bgmVolume: 0.45,
        sfxVolume: 0.7,
        useBrowserTtsFallback: false,
      },
      currentScreen: 'GAME',
      questStage: 'STAGE_0_PROLOGUE',
      inventory: ['order_token'],
      riverTidePhase: 'LOW_TIDE',
      playerPosition: { x: 485, y: 1015, zone: 'VILLAGE' },
      observedLowTideMarker: false,
      observedHighTideMarker: false,
      helpedVillagerWood: false,
      floodedPathSolution: 'NONE',
      missions: {
        'mission-1': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
        'mission-2': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
        'mission-3': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
      },
      discoveredFacts: ['fact-simulation-and-fiction-note', 'fact-kieu-cong-tien-cause'],
      chapter1Completed: false,
      completedRecapOrder: false,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem('MAT_MA_SU_VIET_PROGRESS_V1', JSON.stringify(state));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  // Nhấn phím E để mở hội thoại có giọng nói tiếng Việt với Cụ Trưởng Thôn
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'showcase_1_village_voice_dialogue.png'),
  });
  console.log('Saved showcase_1_village_voice_dialogue.png');

  // 2. Desktop Viewport: Lối Đá Thấp + Bác Chèo Đò Năm + Bảng Trộn Âm Thanh (Audio Mixer)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('MAT_MA_SU_VIET_PROGRESS_V1'));
    raw.playerPosition = { x: 930, y: 1065, zone: 'VILLAGE' };
    raw.questStage = 'STAGE_5_FIRST_RIVER_VISIT';
    localStorage.setItem('MAT_MA_SU_VIET_PROGRESS_V1', JSON.stringify(raw));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  // Mở Bảng Trộn Âm Thanh (Audio Mixer)
  const audioBtn = page.locator('button[title*="Cài đặt Âm lượng"]');
  if (await audioBtn.count()) {
    await audioBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'showcase_2_audio_mixer_and_low_causeway.png'),
  });
  console.log('Saved showcase_2_audio_mixer_and_low_causeway.png');

  // 3. Desktop Viewport: Tình huống Nước Triều Dâng làm ngập Lối Đá Thấp & Che khuất bãi cọc (2 Cách giải quyết)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('MAT_MA_SU_VIET_PROGRESS_V1'));
    raw.playerPosition = { x: 1185, y: 1090, zone: 'RIVER' };
    raw.questStage = 'STAGE_6_FLOODED_PATH_CHOICE';
    raw.riverTidePhase = 'HIGH_TIDE';
    raw.inventory = ['order_token', 'tide_report'];
    localStorage.setItem('MAT_MA_SU_VIET_PROGRESS_V1', JSON.stringify(raw));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'showcase_3_pier_flooded_situation.png'),
  });
  console.log('Saved showcase_3_pier_flooded_situation.png');

  // 4. Mobile Viewport (390x844): Giao diện Điện thoại cảm ứng tại Khu Làng Nối Với Bến Sông
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(URL, { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    const state = {
      schemaVersion: 2,
      playerName: 'Tiểu Kỳ',
      avatarOutfit: 'indigo',
      gameMode: 'GUIDED',
      soundEnabled: true,
      audioSettings: {
        soundEnabled: true,
        voiceEnabled: true,
        voiceVolume: 0.9,
        bgmVolume: 0.45,
        sfxVolume: 0.7,
        useBrowserTtsFallback: false,
      },
      currentScreen: 'GAME',
      questStage: 'STAGE_5_FIRST_RIVER_VISIT',
      inventory: ['iron_bands'],
      riverTidePhase: 'LOW_TIDE',
      playerPosition: { x: 960, y: 1060, zone: 'VILLAGE' },
      observedLowTideMarker: false,
      observedHighTideMarker: false,
      helpedVillagerWood: true,
      floodedPathSolution: 'NONE',
      missions: {
        'mission-1': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
        'mission-2': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
        'mission-3': { completed: false, score: 0, unlockedClues: [], attempts: 0 },
      },
      discoveredFacts: ['fact-simulation-and-fiction-note', 'fact-kieu-cong-tien-cause'],
      chapter1Completed: false,
      completedRecapOrder: false,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem('MAT_MA_SU_VIET_PROGRESS_V1', JSON.stringify(state));
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1800);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'showcase_4_mobile_viewport.png'),
  });
  console.log('Saved showcase_4_mobile_viewport.png');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
