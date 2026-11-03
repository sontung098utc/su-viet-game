import Phaser from 'phaser';
import { AssetGenerator } from '../assets/AssetGenerator';
import type {
  AvatarOutfit,
  DialogueLine,
  QuestStage,
  RiverTidePhase,
  InventoryItemId,
  FloodedPathSolution,
  ClueId,
  CipherPuzzleId,
} from '../../types';
import { DIALOGUE_SCRIPTS } from '../../data/voiceDialogue';
import { sound } from '../../utils/sound';

export interface WorldBridgeCallbacks {
  onOpenDialogue: (lines: DialogueLine[], onFinish?: () => void) => void;
  onZoneChange: (zone: 'VILLAGE' | 'CAMP' | 'RIVER') => void;
  onNearbyPromptChange: (promptText: string | null) => void;
  onSavePosition: (x: number, y: number, zone: 'VILLAGE' | 'CAMP' | 'RIVER') => void;
  onAdvanceQuest: (
    nextStage: QuestStage,
    options?: {
      addItems?: InventoryItemId[];
      removeItems?: InventoryItemId[];
      unlockFacts?: string[];
      unlockClues?: ClueId[];
      tidePhase?: RiverTidePhase;
      completedChapter?: boolean;
      floodedPathSolution?: FloodedPathSolution;
    }
  ) => void;
  onUnlockClue: (clueId: ClueId) => void;
  onOpenCipherPuzzle: (puzzleId: CipherPuzzleId) => void;
  onRecordChallengeAttempt: (challenge: 'A' | 'B' | 'C') => void;
  onMarkMarkerObserved: (tide: 'LOW' | 'HIGH') => void;
  onMarkHelpedVillager: () => void;
  onClimaxComplete: () => void;
}

interface InteractiveEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  priorityBoost?: number;
  sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  nameTag?: Phaser.GameObjects.Text;
  questMarker?: Phaser.GameObjects.Container;
}

export class BachDangWorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerVisual!: Phaser.GameObjects.Image;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private targetHighlightRing!: Phaser.GameObjects.Ellipse;
  private playerKey: string = 'player_brown';
  private walkBobPhase: number = 0;
  private lastFacingFlipX: boolean = false;
  private lastInteractTime: number = 0;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private lowCausewayCollider?: Phaser.GameObjects.Rectangle;
  private interactives: InteractiveEntity[] = [];
  private activeNearest: InteractiveEntity | null = null;
  private worldPromptContainer!: Phaser.GameObjects.Container;
  private worldPromptText!: Phaser.GameObjects.Text;
  private guidanceArrow!: Phaser.GameObjects.Container;

  // Ambient overheard conversation bubble in the village
  private ambientBubbleContainer!: Phaser.GameObjects.Container;
  private ambientPuffs: Phaser.GameObjects.Arc[] = [];

  // Dynamic environment objects for Zone C (River, Tidal Creek & Low Causeway)
  private highTideWaterOverlay!: Phaser.GameObjects.Rectangle;
  private creekHighTideOverlay!: Phaser.GameObjects.Rectangle;
  private lowCausewayStones!: Phaser.GameObjects.Graphics;
  private lowCausewayFloodBanner!: Phaser.GameObjects.Container;
  private mudflatLayer!: Phaser.GameObjects.Rectangle;
  private tideLevelLabel!: Phaser.GameObjects.Text;
  private riverStakes: Phaser.GameObjects.Image[] = [];
  private stakeWaterRipples: Phaser.GameObjects.Arc[] = [];
  private scoutBoats: Phaser.GameObjects.Image[] = [];
  private enemyBoats: Phaser.GameObjects.Image[] = [];
  private boatmanSampan!: Phaser.GameObjects.Image;
  private heldItemIndicator!: Phaser.GameObjects.Container;
  private heldItemText!: Phaser.GameObjects.Text;

  // State synced from React
  private questStage: QuestStage = 'STAGE_0_PROLOGUE';
  private riverTidePhase: RiverTidePhase = 'LOW_TIDE';
  private collectedClues: ClueId[] = [];
  private reducedEffects: boolean = false;
  private showGuidance: boolean = true;
  private isDialogueOpen: boolean = false;
  private isCutscenePlaying: boolean = false;
  private currentZone: 'VILLAGE' | 'CAMP' | 'RIVER' = 'VILLAGE';
  private lastPositionSaveTime: number = 0;

  // Virtual joystick vector from mobile UI
  private joyVector = { x: 0, y: 0 };

  private callbacks!: WorldBridgeCallbacks;
  private initialSpawn = { x: 420, y: 1050 };

  constructor() {
    super({ key: 'BachDangWorldScene' });
  }

  public initData(config: {
    outfit: AvatarOutfit;
    playerName: string;
    questStage: QuestStage;
    riverTidePhase: RiverTidePhase;
    collectedClues: ClueId[];
    reducedEffects: boolean;
    spawnX: number;
    spawnY: number;
    showGuidance: boolean;
    callbacks: WorldBridgeCallbacks;
  }) {
    this.playerKey = config.outfit === 'indigo' ? 'player_indigo' : 'player_brown';
    this.questStage = config.questStage;
    this.riverTidePhase = config.riverTidePhase;
    this.collectedClues = config.collectedClues || [];
    this.reducedEffects = Boolean(config.reducedEffects);
    this.initialSpawn = { x: config.spawnX || 420, y: config.spawnY || 1050 };
    this.showGuidance = config.showGuidance;
    this.callbacks = config.callbacks;
  }

  public preload() {
    this.load.image('spr_house_village', '/assets/sprites/house_village.png');
    this.load.image('spr_banyan_tree', '/assets/sprites/banyan_tree.png');
    this.load.image('spr_boat_sampan', '/assets/sprites/boat_sampan.png');
    this.load.image('spr_char_messenger', '/assets/sprites/char_messenger.png');
    this.load.image('spr_char_elder', '/assets/sprites/char_elder.png');
    this.load.image('spr_char_scout', '/assets/sprites/char_scout.png');
    this.load.image('spr_char_boatman', '/assets/sprites/char_boatman.png');
    this.load.image('spr_char_commander', '/assets/sprites/char_commander.png');
    this.load.image('spr_tide_marker', '/assets/sprites/prop_tide_marker.png');
    this.load.image('spr_bamboo_bridge', '/assets/sprites/prop_bamboo_bridge.png');
    this.load.image('spr_river_stakes', '/assets/sprites/prop_river_stakes.png');
  }

  private tex(preferred: string, fallback: string): string {
    return this.textures.exists(preferred) ? preferred : fallback;
  }

  public create() {
    AssetGenerator.generateAll(this);

    const worldW = 2400;
    const worldH = 1600;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    this.obstacles = this.physics.add.staticGroup();

    // 1. Dựng thế giới 2D liên thông 3 khu vực + các dấu hiệu trực quan cho 3 Thử thách Giải mã (A, B, C)
    this.buildInterconnectedWorld(worldW, worldH);

    // 2. Tạo các NPC, điểm giải mã và vật thể tương tác
    this.buildInteractiveEntities();

    // 3. Tạo nhân vật người chơi với vùng va chạm chuẩn xác ngay dưới bàn chân
    this.player = this.physics.add.sprite(
      this.initialSpawn.x,
      this.initialSpawn.y,
      this.playerKey,
      0
    );
    this.player.setCollideWorldBounds(true);
    this.player.setAlpha(0.001);
    // Hitbox đặt gọn ở bàn chân (26x18px) để trượt mượt dọc mép vật cản mà không bị kẹt hay rung
    this.player.body?.setSize(26, 18);
    this.player.body?.setOffset(19, 23);

    this.playerShadow = this.add
      .ellipse(this.initialSpawn.x, this.initialSpawn.y, 32, 12, 0x1a110b, 0.35)
      .setDepth(Math.round(this.initialSpawn.y) - 1);

    this.targetHighlightRing = this.add
      .ellipse(0, 0, 52, 22, 0xc99726, 0.22)
      .setStrokeStyle(2, 0xfcd34d, 0.9)
      .setDepth(12)
      .setVisible(false);

    const messengerTex = this.tex('spr_char_messenger', this.playerKey);
    this.playerVisual = this.add
      .image(this.initialSpawn.x, this.initialSpawn.y, messengerTex)
      .setOrigin(0.5, 0.94)
      .setDepth(Math.round(this.initialSpawn.y));

    if (this.playerKey === 'player_indigo') {
      this.playerVisual.setTint(0xdceeff);
    }

    this.physics.add.collider(this.player, this.obstacles);

    // 4. Biểu tượng vật phẩm đang cầm trên đầu nhân vật
    this.heldItemIndicator = this.add
      .container(this.player.x, this.player.y - 88)
      .setDepth(3000);
    const badgeBg = this.add
      .rectangle(0, 0, 142, 22, 0x2f1b12, 0.9)
      .setStrokeStyle(1.5, 0xc99726);
    this.heldItemText = this.add
      .text(0, 0, '', {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '11px',
        color: '#FAF7F0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.heldItemIndicator.add([badgeBg, this.heldItemText]);
    this.heldItemIndicator.setVisible(false);

    // 5. Bong bóng chỉ dẫn tương tác nổi trên đối tượng được ưu tiên
    this.worldPromptContainer = this.add.container(0, 0).setDepth(3100).setVisible(false);
    const promptBg = this.add
      .rectangle(0, 0, 245, 28, 0x1c0f0a, 0.92)
      .setStrokeStyle(2, 0xc99726);
    this.worldPromptText = this.add
      .text(0, 0, 'Chạm để tương tác', {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '12px',
        color: '#FAF4E6',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.worldPromptContainer.add([promptBg, this.worldPromptText]);

    // 6. Mũi tên la bàn dẫn đường tự nhiên dưới chân nhân vật
    this.guidanceArrow = this.add.container(this.player.x, this.player.y).setDepth(28);
    const arrowGraphic = this.add.graphics();
    arrowGraphic.fillStyle(0xc99726, 0.92);
    arrowGraphic.lineStyle(2, 0x2f1b12, 0.95);
    arrowGraphic.beginPath();
    arrowGraphic.moveTo(46, 0);
    arrowGraphic.lineTo(30, -9);
    arrowGraphic.lineTo(34, 0);
    arrowGraphic.lineTo(30, 9);
    arrowGraphic.closePath();
    arrowGraphic.fillPath();
    arrowGraphic.strokePath();
    this.guidanceArrow.add(arrowGraphic);

    // 7. Thiết lập Camera bám ổn định theo nhân vật và giới hạn chặt trong bản đồ
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 8. Thiết lập phím điều khiển WASD + Mũi tên + E/Space (với chống kích hoạt kép)
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      };

      this.wasd.E.on('down', () => {
        if (!this.isDialogueOpen) this.triggerInteraction();
      });
      this.wasd.SPACE.on('down', () => {
        if (!this.isDialogueOpen) this.triggerInteraction();
      });
    }

    // Dừng nhân vật ngay khi cửa sổ mất focus
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      this.stopPlayerImmediately();
    });

    this.applyTideVisualState(this.riverTidePhase);
    this.updateQuestMarkers();
    sound.startAmbientBgm();
  }

  public stopPlayerImmediately() {
    this.joyVector = { x: 0, y: 0 };
    if (this.player && this.player.body) {
      this.player.setVelocity(0, 0);
    }
  }

  private buildInterconnectedWorld(worldW: number, worldH: number) {
    const bg = this.add.graphics().setDepth(1);

    // Nền cỏ đồng bằng Bắc Bộ đa sắc độ
    bg.fillStyle(0x6d9347, 1);
    bg.fillRect(0, 0, worldW, worldH);

    bg.fillStyle(0x7ea653, 1);
    bg.fillRoundedRect(60, 560, 880, 920, 48);
    bg.fillStyle(0x88b05c, 0.85);
    bg.fillCircle(460, 1020, 340);
    bg.fillCircle(720, 920, 220);

    for (let i = 0; i < 80; i++) {
      const gx = 100 + ((i * 173) % 2100);
      const gy = 180 + ((i * 293) % 1150);
      bg.fillStyle(i % 2 === 0 ? 0x5c7f39 : 0x95bc68, 0.65);
      bg.fillEllipse(gx, gy, 16, 7);
    }

    // Sân đất nện ấm áp ở trung tâm Làng Ven Sông
    bg.fillStyle(0xc8a474, 1);
    bg.fillRoundedRect(210, 880, 650, 360, 36);
    bg.fillStyle(0xdabf94, 1);
    bg.fillRoundedRect(230, 900, 610, 320, 28);

    // --- KHU VỰC B: KHU CHUẨN BỊ DOANH TRẠI (Đông Bắc: x 1020..2220, y 90..720) ---
    bg.fillStyle(0xc29e6c, 1);
    bg.fillRoundedRect(1040, 100, 1160, 610, 32);
    bg.lineStyle(5, 0x6e4d25, 1);
    bg.strokeRoundedRect(1040, 100, 1160, 610, 32);

    // --- KHU VỰC C: BẾN QUAN SÁT SÔNG BẠCH ĐẰNG (Đông Nam: x 1100..2400, y 780..1600) ---
    bg.fillStyle(0xcfb184, 1);
    bg.fillRect(1100, 800, 1300, 330);

    // --- LẠCH NƯỚC TRIỀU NGĂN GIỮA LÀNG (KHU A) VÀ BẾN SÔNG (KHU C) (x: 935..1105, y: 740..1450) ---
    bg.fillStyle(0x8c704c, 1);
    bg.fillRoundedRect(925, 745, 190, 680, 24);
    bg.fillStyle(0x236882, 1);
    bg.fillRoundedRect(955, 755, 130, 660, 18);

    // Bến nhỏ đầu làng thông với lạch nước (Tây Nam)
    bg.fillStyle(0x1f627c, 1);
    bg.fillRoundedRect(120, 1370, 880, 180, 22);
    bg.fillStyle(0x8c5a32, 1);
    bg.fillRect(330, 1335, 115, 58);

    // Bãi bùn/cát ven sông Bạch Đằng
    this.mudflatLayer = this.add
      .rectangle(1750, 1195, 1300, 150, 0x967a50, 1)
      .setDepth(3);

    // Lòng sông Bạch Đằng sâu thẫm
    this.add.rectangle(1750, 1430, 1300, 340, 0x164a5e, 1).setDepth(4);

    // Lớp nước triều dâng trên sông lớn
    this.highTideWaterOverlay = this.add
      .rectangle(1750, 1195, 1300, 165, 0x207591, 0.94)
      .setDepth(6)
      .setVisible(false);

    // Lớp nước triều dâng tràn ngập Lạch Nước & Lối Đá Thấp
    this.creekHighTideOverlay = this.add
      .rectangle(1020, 1085, 210, 480, 0x1e7898, 0.95)
      .setDepth(7)
      .setVisible(false);

    // --- HỆ THỐNG ĐƯỜNG MÒN ĐẤT ĐẦY ĐẶN, CÓ VẾT CHÂN ---
    const road = this.add.graphics().setDepth(2);
    road.fillStyle(0xd8bc90, 1);
    road.fillRoundedRect(465, 410, 105, 510, 24);
    road.fillRoundedRect(465, 380, 620, 95, 24);
    road.fillRoundedRect(350, 1180, 90, 185, 16);
    road.fillRoundedRect(760, 800, 500, 72, 18);
    road.fillRoundedRect(1180, 800, 95, 290, 18);
    road.fillRoundedRect(1490, 680, 105, 400, 20);
    road.fillRoundedRect(780, 1020, 800, 82, 18);

    road.fillStyle(0xb39264, 0.65);
    for (let rx = 520; rx <= 1480; rx += 42) {
      road.fillEllipse(rx, 1052, 14, 6);
      road.fillEllipse(rx + 18, 1068, 14, 6);
    }

    // --- LỐI ĐÁ THẤP QUA LẠCH NƯỚC ---
    this.lowCausewayStones = this.add.graphics().setDepth(5);
    this.lowCausewayStones.fillStyle(0x7c766e, 1);
    this.lowCausewayStones.lineStyle(2, 0x3f3a34, 1);
    const stonePositions = [
      [955, 1045], [982, 1062], [1010, 1048], [1038, 1064], [1066, 1048], [1090, 1060],
      [965, 1080], [998, 1084], [1030, 1082], [1062, 1080],
    ];
    stonePositions.forEach(([sx, sy]) => {
      this.lowCausewayStones.fillRoundedRect(sx - 13, sy - 9, 26, 18, 6);
      this.lowCausewayStones.strokeRoundedRect(sx - 13, sy - 9, 26, 18, 6);
    });

    // Biển cảnh báo ngập tại Lối Đá Thấp
    this.lowCausewayFloodBanner = this.add.container(1020, 1055).setDepth(1080).setVisible(false);
    const floodBg = this.add
      .rectangle(0, 0, 206, 36, 0x7f1d1d, 0.94)
      .setStrokeStyle(2, 0xfcd34d);
    const floodTxt = this.add
      .text(0, 0, '🌊 Lối đá thấp đã ngập triều!\nQuan sát tìm lối vượt Bắc ↑ hoặc Nam ↓', {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '10px',
        color: '#FEF2F2',
        align: 'center',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.lowCausewayFloodBanner.add([floodBg, floodTxt]);

    // Vật cản chặn Lối Đá Thấp khi nước dâng
    this.lowCausewayCollider = this.add.rectangle(1020, 1060, 118, 92, 0x000000, 0);
    this.physics.add.existing(this.lowCausewayCollider, true);
    this.obstacles.add(this.lowCausewayCollider);

    // Rào chắn hai bên bờ lạch nước (chừa 2 lối đi bộ thực tế: Cầu Tre Gò Cao ở y=835 và Lối Đá Thấp ở y=1060)
    this.addInvisibleWall(1020, 760, 112, 55);
    this.addInvisibleWall(1020, 945, 112, 110);
    this.addInvisibleWall(1020, 1265, 112, 275);

    // --- CẦU TRE GÒ CAO (2D Hand-Drawn Bamboo Bridge bắc qua lạch ở x: 1020, y: 835) ---
    const bridgeTex = this.tex('spr_bamboo_bridge', 'house_thatch');
    this.add.image(1020, 835, bridgeTex).setOrigin(0.5, 0.55).setDepth(8);

    // Cầu tàu gỗ Bến Quan Sát
    const pier = this.add.graphics().setDepth(8);
    pier.fillStyle(0x7c4d2b, 1);
    pier.lineStyle(3, 0x3d271d, 1);
    pier.fillRect(1480, 1060, 120, 145);
    pier.strokeRect(1480, 1060, 120, 145);
    for (let py = 1070; py < 1200; py += 14) {
      pier.lineBetween(1482, py, 1598, py);
    }

    // Hàng rào tre mộc mạc dọc lối đi trong làng
    this.drawBambooFence(270, 905, 180);
    this.drawBambooFence(640, 905, 175);
    this.drawBambooFence(770, 1115, 135);

    // Biển chỉ đường
    this.createSignpost(830, 995, '← Làng Ven Sông | ↑ Cầu Tre Gò Cao | → Lối Đá Thấp Ra Bến');
    this.createSignpost(1050, 360, 'Khu Chuẩn Bị (Tái hiện lịch sử 938)');
    this.createSignpost(1430, 860, '↓ Bến Quan Sát Cửa Sông Bạch Đằng');

    // --- DỰNG NHÀ CỬA 2D VẼ TAY & CÁC DẤU HIỆU TRỰC QUAN CHO THỬ THÁCH GIẢI MÃ A ---
    const houseTex = this.tex('spr_house_village', 'house_thatch');
    // 1. Nhà Tây Bắc (trang trí)
    this.placeYSortedBuilding(houseTex, 340, 885, 140, 38);

    // 2. Nhà Đông Bắc (ĐIỂM HẸN ĐÚNG CỦA THỬ THÁCH A: Có Khói Bếp Trắng + Đôi Chum Sành + Cột Cờ Dải Lụa Đỏ!)
    this.placeYSortedBuilding(houseTex, 720, 885, 140, 38);
    this.drawBannerPole(808, 895, 0xdc2626, 'Dải lụa đỏ');

    // 3. Nhà Tây Nam (ĐIỂM HẸN SAI 1 CỦA THỬ THÁCH A: Có Đôi Chum Sành, KHÔNG có khói bếp, Cột Cờ buộc Vải Lam Xanh!)
    this.placeYSortedBuilding(houseTex, 240, 1155, 140, 38);
    this.drawBannerPole(325, 1165, 0x2563eb, 'Dải vải chàm xanh');

    // 4. Cây đa cổ thụ & Miếu đá đầu làng (ĐIỂM HẸN SAI 2 CỦA THỬ THÁCH A: Có dải lụa đỏ nhưng là Miếu Đá, không phải nhà tranh)
    const banyanTex = this.tex('spr_banyan_tree', 'tree_banyan');
    this.placeYSortedBuilding(banyanTex, 560, 1015, 72, 32);

    // Khóm tre quanh làng
    const bambooCoords = [
      [150, 680], [260, 640], [875, 710], [910, 935],
      [165, 980], [150, 1280], [670, 1275], [840, 1215],
      [1140, 740], [1280, 760],
    ];
    bambooCoords.forEach(([bx, by]) => {
      this.placeYSortedBuilding('tree_bamboo', bx, by, 34, 20);
    });

    // Khu B: Lều chỉ huy, Lò rèn dã chiến & Bàn Bản Đồ Thủy Văn
    this.placeYSortedBuilding('tent_command', 1360, 265, 135, 45);
    this.placeYSortedBuilding('tent_command', 1960, 275, 135, 45);
    this.placeYSortedBuilding('forge_station', 1750, 365, 105, 42);

    // Bàn Bản Đồ Thủy Văn ở giữa sân Khu Chuẩn Bị (Manh mối B3)
    this.drawTacticalTable(1555, 470);

    // 3 Khu Kiện Hàng trong Khu Chuẩn Bị cho Thử thách Giải mã B:
    // (1) Kiện Bó Tre Nứa Nhỏ (Sai - x: 1170, y: 565)
    this.drawBambooBundlePile(1170, 565);
    // (2) Đống Cọc Gỗ Chưa Bịt Sắt (Sai - x: 1170, y: 455)
    this.placeYSortedBuilding('stake_pile', 1170, 455, 80, 32);
    // (3) Giá Cọc Lớn Đã Bịt Đầu Sắt Tôi Cứng (Đúng - x: 1930, y: 500, dùng sprite 2D vẽ tay cọc bịt sắt sáng loáng)
    const stakesTex = this.tex('spr_river_stakes', 'stake_pile');
    this.placeYSortedBuilding(stakesTex, 1930, 500, 82, 34);

    // Đài chỉ huy trên cao ở Bến Quan Sát
    const tower = this.add.graphics().setDepth(880);
    tower.fillStyle(0x6e4d25, 1);
    tower.lineStyle(3, 0x2f1b12, 1);
    tower.fillRoundedRect(1260, 870, 150, 110, 8);
    tower.strokeRoundedRect(1260, 870, 150, 110, 8);
    this.add
      .text(1335, 965, 'Đài Quan Sát Chỉ Huy', {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '11px',
        color: '#FAF4E6',
        backgroundColor: '#2F1B12',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(890);

    // Rào chắn mép nước sông lớn
    this.addInvisibleWall(370, 1400, 600, 40);
    this.addInvisibleWall(1280, 1145, 380, 30);
    this.addInvisibleWall(1980, 1145, 760, 30);
    this.addInvisibleWall(1540, 1215, 140, 20);

    // --- BÃI CỌC NGẦM 2D VẼ TAY & THUYỀN GỖ TRÊN SÔNG BẠCH ĐẰNG (KHU C) ---
    const stakePositions = [
      [1330, 1250], [1430, 1275], [1530, 1255], [1630, 1280],
      [1730, 1250], [1830, 1275], [1930, 1255], [2030, 1280],
      [1385, 1335], [1505, 1340], [1685, 1335], [1865, 1335],
    ];

    stakePositions.forEach(([sx, sy]) => {
      const stake = this.add
        .image(sx, sy, this.tex('spr_river_stakes', 'river_stake'))
        .setScale(0.68)
        .setDepth(9);
      this.riverStakes.push(stake);

      const ripple = this.add
        .circle(sx, sy + 10, 18, 0xd5eff4, 0.28)
        .setStrokeStyle(1.5, 0xffffff, 0.5)
        .setDepth(8)
        .setVisible(false);
      this.stakeWaterRipples.push(ripple);
    });

    this.tideLevelLabel = this.add
      .text(
        1860,
        1165,
        'TRẠNG THÁI SÔNG: PHA NƯỚC RÒNG (Triều xuống thấp — Lộ rõ bãi cọc bịt sắt & Lối đá thấp)',
        {
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: '12px',
          color: '#FAF7F0',
          backgroundColor: '#184F63',
          padding: { x: 10, y: 5 },
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setDepth(2000);

    // Thuyền gỗ 2D vẽ tay của Bác Chèo Đò Năm đậu ở Lạch Nước
    const sampanTex = this.tex('spr_boat_sampan', 'boat_scout');
    this.boatmanSampan = this.add
      .image(980, 1160, sampanTex)
      .setScale(0.78)
      .setDepth(1160);

    const boat1 = this.add.image(1410, 1190, sampanTex).setScale(0.82).setDepth(10);
    const boat2 = this.add.image(1635, 1200, sampanTex).setScale(0.82).setDepth(10);
    this.scoutBoats.push(boat1, boat2);

    const enemy1 = this.add
      .image(2250, 1390, 'boat_enemy')
      .setDepth(11)
      .setVisible(false)
      .setFlipX(true);
    const enemy2 = this.add
      .image(2350, 1460, 'boat_enemy')
      .setDepth(11)
      .setVisible(false)
      .setFlipX(true);
    this.enemyBoats.push(enemy1, enemy2);

    this.createAmbientAnimations();
  }

  private drawBannerPole(x: number, y: number, ribbonColor: number, label: string) {
    const g = this.add.graphics().setDepth(Math.round(y) + 2);
    // Cột tre
    g.fillStyle(0x6e4d25, 1);
    g.fillRect(x - 3, y - 78, 6, 78);
    // Dải lụa buộc trên cột
    g.fillStyle(ribbonColor, 1);
    g.lineStyle(1.5, 0x1c0f0a, 0.9);
    g.fillTriangle(x + 3, y - 74, x + 42, y - 62, x + 3, y - 50);
    g.strokeTriangle(x + 3, y - 74, x + 42, y - 62, x + 3, y - 50);
    void label;
  }

  private drawTacticalTable(x: number, y: number) {
    const g = this.add.graphics().setDepth(Math.round(y));
    g.fillStyle(0x5c3a21, 1);
    g.lineStyle(2.5, 0x2f1b12, 1);
    g.fillRoundedRect(x - 46, y - 34, 92, 52, 6);
    g.strokeRoundedRect(x - 46, y - 34, 92, 52, 6);
    // Bản đồ trải trên bàn
    g.fillStyle(0xf5efe1, 1);
    g.fillRect(x - 34, y - 26, 68, 36);
    g.lineStyle(2, 0x1e7898, 1);
    g.lineBetween(x - 28, y - 8, x + 28, y - 14);
    g.fillStyle(0x9b1d20, 1);
    g.fillCircle(x + 14, y - 12, 4);
    this.addInvisibleWall(x, y - 6, 86, 36);
  }

  private drawBambooBundlePile(x: number, y: number) {
    const g = this.add.graphics().setDepth(Math.round(y));
    g.fillStyle(0x6e9446, 1);
    g.lineStyle(2, 0x3b5323, 1);
    for (let row = 0; row < 3; row++) {
      g.fillRoundedRect(x - 42, y - 28 + row * 9, 84, 8, 4);
      g.strokeRoundedRect(x - 42, y - 28 + row * 9, 84, 8, 4);
    }
    this.addInvisibleWall(x, y - 10, 80, 28);
  }

  private drawBambooFence(startX: number, y: number, length: number) {
    const g = this.add.graphics().setDepth(Math.round(y));
    g.fillStyle(0x8c6d3b, 1);
    g.lineStyle(2, 0x4a3519, 1);
    g.fillRect(startX, y - 16, length, 5);
    g.fillRect(startX, y - 8, length, 5);
    for (let px = startX; px <= startX + length; px += 22) {
      g.fillRect(px, y - 24, 6, 26);
      g.strokeRect(px, y - 24, 6, 26);
    }
    this.addInvisibleWall(startX + length / 2, y - 4, length, 12);
  }

  private createSignpost(x: number, y: number, text: string) {
    const post = this.add.graphics().setDepth(Math.round(y));
    post.fillStyle(0x5c3a21, 1);
    post.fillRect(x - 4, y - 28, 8, 28);
    post.fillStyle(0xebd5b3, 1);
    post.lineStyle(2, 0x4a2f22, 1);
    post.fillRoundedRect(x - 125, y - 50, 250, 24, 5);
    post.strokeRoundedRect(x - 125, y - 50, 250, 24, 5);

    this.add
      .text(x, y - 38, text, {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '10px',
        color: '#2F1B12',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(Math.round(y) + 1);
  }

  /**
   * Đặt công trình / cây cối với tâm ở chân (origin 0.5, 0.92) và depth = footY.
   * Vùng cản vật lý chỉ đặt gọn ở chân/nền nhà, không bao giờ dùng mái nhà hay tán cây làm vùng cản!
   */
  private placeYSortedBuilding(
    key: string,
    footX: number,
    footY: number,
    bodyW: number,
    bodyH: number
  ) {
    this.add
      .ellipse(footX, footY - 4, bodyW * 1.1, bodyH * 0.9, 0x1a110b, 0.25)
      .setDepth(4);

    const img = this.add
      .image(footX, footY, key)
      .setOrigin(0.5, 0.92)
      .setDepth(Math.round(footY));

    const zone = this.add.rectangle(footX, footY - bodyH * 0.4, bodyW, bodyH, 0x000000, 0);
    this.physics.add.existing(zone, true);
    this.obstacles.add(zone);
    return img;
  }

  private addInvisibleWall(x: number, y: number, w: number, h: number) {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
    this.physics.add.existing(wall, true);
    this.obstacles.add(wall);
  }

  private drawCipherChest(x: number, y: number) {
    const depth = Math.round(y);
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(0x1a110b, 0.35);
    g.fillEllipse(x, y + 2, 44, 18);
    g.fillStyle(0x5c3a21, 1);
    g.fillRoundedRect(x - 18, y - 24, 36, 26, 4);
    g.lineStyle(2, 0xc99726, 1);
    g.strokeRoundedRect(x - 18, y - 24, 36, 26, 4);
    g.fillStyle(0xb45309, 1);
    g.fillRect(x - 4, y - 24, 8, 26);
    g.fillStyle(0xfcd34d, 1);
    g.fillCircle(x, y - 10, 4);

    const spark = this.add.circle(x, y - 32, 4, 0xfcd34d, 0.85).setDepth(depth + 1);
    this.tweens.add({
      targets: spark,
      y: y - 38,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });
  }

  private drawAncientWell(x: number, y: number) {
    const depth = Math.round(y);
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(0x1a110b, 0.3);
    g.fillEllipse(x, y + 4, 46, 22);
    g.fillStyle(0x6b7280, 1);
    g.fillEllipse(x, y - 8, 40, 20);
    g.fillStyle(0x1f2937, 1);
    g.fillEllipse(x, y - 10, 32, 14);
    g.fillStyle(0x0ea5e9, 0.8);
    g.fillEllipse(x, y - 10, 24, 10);
    g.fillStyle(0x78350f, 1);
    g.fillRect(x - 16, y - 32, 4, 26);
    g.fillRect(x + 12, y - 32, 4, 26);
    g.fillRect(x - 16, y - 32, 32, 4);

    const spark = this.add.circle(x, y - 38, 4, 0x38bdf8, 0.85).setDepth(depth + 1);
    this.tweens.add({
      targets: spark,
      scale: 1.5,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 900,
    });
  }

  private drawPitchBarrel(x: number, y: number) {
    const depth = Math.round(y);
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(0x1a110b, 0.3);
    g.fillEllipse(x, y + 2, 32, 14);
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(x - 12, y - 22, 24, 24, 3);
    g.fillStyle(0x27272a, 1);
    g.fillRect(x - 12, y - 16, 24, 4);
    g.fillRect(x - 12, y - 6, 24, 4);

    const spark = this.add.circle(x, y - 28, 3.5, 0xf59e0b, 0.85).setDepth(depth + 1);
    this.tweens.add({
      targets: spark,
      y: y - 34,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 850,
    });
  }

  private drawAncientStele(x: number, y: number) {
    const depth = Math.round(y);
    const g = this.add.graphics().setDepth(depth);
    g.fillStyle(0x1a110b, 0.35);
    g.fillEllipse(x, y + 3, 38, 16);
    g.fillStyle(0x475569, 1);
    g.lineStyle(2, 0x1e293b, 1);
    g.fillRoundedRect(x - 14, y - 38, 28, 40, 4);
    g.strokeRoundedRect(x - 14, y - 38, 28, 40, 4);
    g.lineStyle(1.5, 0x94a3b8, 1);
    g.lineBetween(x - 8, y - 26, x + 8, y - 26);
    g.lineBetween(x - 8, y - 18, x + 8, y - 18);
    g.lineBetween(x - 8, y - 10, x + 8, y - 10);

    const spark = this.add.circle(x, y - 44, 4, 0x38bdf8, 0.85).setDepth(depth + 1);
    this.tweens.add({
      targets: spark,
      scale: 1.4,
      alpha: 0.4,
      yoyo: true,
      repeat: -1,
      duration: 1000,
    });
  }

  private createAmbientAnimations() {
    // Khói bếp trắng trên mái Nhà Đông Bắc (Dấu hiệu 1 của Thử thách A) & Khói lò rèn Khu Chuẩn Bị
    // Lưu ý: Nhà Tây Nam (240, 1155) cố tình KHÔNG có khói bếp để người chơi quan sát loại trừ!
    const smokePoints = [
      { x: 350, y: 715, color: 0xf5efe1 },
      { x: 735, y: 715, color: 0xffffff }, // Khói bếp trắng rõ ở Điểm Hẹn Nhà Đông Bắc
      { x: 1730, y: 290, color: 0xf97316 },
    ];

    smokePoints.forEach((sp) => {
      const puff = this.add.circle(sp.x, sp.y, 8, sp.color, 0.55).setDepth(2200);
      this.ambientPuffs.push(puff);
      this.tweens.add({
        targets: puff,
        y: sp.y - 52,
        x: sp.x + 16,
        scale: 2.3,
        alpha: 0,
        duration: 2400 + Math.random() * 600,
        repeat: -1,
      });
    });

    this.tweens.add({
      targets: [...this.scoutBoats, this.boatmanSampan],
      y: '+=4',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private buildInteractiveEntities() {
    // 1. Cụ Trưởng Thôn (Khu A - Sân Làng Ven Sông)
    const elderImg = this.placeCharacterSprite(
      this.tex('spr_char_elder', 'npc_elder'),
      495,
      1045
    );
    this.registerInteractive('npc_elder', 'Cụ Trưởng Thôn', 495, 1045, 95, elderImg, 10);

    // --- 3 ĐIỂM QUAN SÁT GIẢI MÃ CỦA THỬ THÁCH A TRONG LÀNG VEN SÔNG ---
    // Điểm A1 (Sai): Nhà Tranh Tây Nam (Có đôi chum sành, cột vải chàm xanh, không khói bếp)
    this.registerInteractive(
      'landmark_house_southwest',
      'Nhà Tranh Tây Nam (Cột vải lam)',
      260,
      1170,
      95
    );

    // Điểm A2 (Sai): Miếu Đá Gốc Đa Cổ Thụ
    this.registerInteractive(
      'landmark_banyan_shrine',
      'Miếu Đá Gốc Đa Cổ Thụ',
      580,
      1030,
      85
    );

    // Điểm A3 (Đúng): Nhà Tranh Đông Bắc (Khói bếp trắng + Đôi chum sành + Cột cờ dải lụa đỏ)
    const contactSprite = this.add
      .sprite(755, 912, 'npc_villager', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(912);
    contactSprite.play('npc_villager_idle');
    this.registerInteractive(
      'landmark_house_northeast',
      'Nhà Tranh Đông Bắc (Cột lụa đỏ & Khói bếp)',
      745,
      912,
      100,
      contactSprite,
      12
    );

    // 2. Bác Chèo Đò Năm (Đang sửa thuyền cạnh Lối Đá Thấp bờ lạch nước)
    const boatmanImg = this.placeCharacterSprite(
      this.tex('spr_char_boatman', 'npc_villager'),
      905,
      1135
    );
    this.registerInteractive(
      'npc_boatman',
      'Bác Chèo Đò Năm (Sửa thuyền)',
      905,
      1135,
      100,
      boatmanImg
    );

    // Điểm kiểm tra Lối Đá Thấp khi bị ngập triều (để phản hồi khi người chơi thử đi lối ngập)
    this.registerInteractive(
      'obj_flooded_low_path',
      'Lối Đá Thấp Qua Lạch Nước',
      1065,
      1060,
      85
    );

    // Điểm gọi đò từ bờ bên kia lạch nước (Bến Sông) khi Lối Đá Thấp bị ngập
    const ferryPost = this.add
      .rectangle(1135, 1145, 18, 42, 0x6e4d25, 1)
      .setStrokeStyle(2, 0x2f1b12)
      .setDepth(1145);
    this.registerInteractive(
      'obj_ferry_landing',
      'Bến Đò Bác Năm (Gọi thuyền qua lạch ngập)',
      1135,
      1145,
      105,
      ferryPost as unknown as Phaser.GameObjects.Image,
      10
    );

    // Điểm vượt Cầu Tre Gò Cao (Cách giải quyết thứ 2 khi Lối Đá Thấp bị ngập)
    this.registerInteractive(
      'obj_bamboo_bridge',
      'Cầu Tre Gò Cao (Đường vòng qua lạch ngập)',
      1020,
      835,
      100,
      undefined,
      10
    );

    // 3. Hoạt cảnh đời sống: Hai người dân làng chuẩn bị lương thảo
    const villagerA = this.add
      .sprite(385, 935, 'npc_villager', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(935);
    villagerA.play('npc_villager_idle');
    const villagerB = this.add
      .sprite(430, 940, 'npc_villager', 0)
      .setOrigin(0.5, 0.92)
      .setFlipX(true)
      .setDepth(940);
    villagerB.play('npc_villager_walk');

    this.ambientBubbleContainer = this.add
      .container(408, 868)
      .setDepth(2400)
      .setVisible(false);
    const ambBg = this.add
      .rectangle(0, 0, 290, 38, 0xfaf4e6, 0.95)
      .setStrokeStyle(1.5, 0x6e4d25);
    const ambTxt = this.add
      .text(
        0,
        0,
        '💬 Dân làng: "Nước ròng lộ bãi bùn rồi!\nMau chuyển đai sắt ra bến trước khi triều lên!"',
        {
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: '10px',
          color: '#2F1B12',
          align: 'center',
          fontStyle: 'italic',
        }
      )
      .setOrigin(0.5);
    this.ambientBubbleContainer.add([ambBg, ambTxt]);

    // 4. Anh Dân Binh Tâm ở Bến Nhỏ Làng Ven Sông (Khu A)
    const villagerPier = this.add
      .sprite(450, 1315, 'npc_villager', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(1315);
    villagerPier.play('npc_villager_idle');
    this.registerInteractive('npc_villager_pier', 'Dân Binh Tâm', 450, 1315, 85, villagerPier);

    // 5. Đội Trưởng Truyền Tin Lê (Khu B - Khu Chuẩn Bị)
    const commanderImg = this.placeCharacterSprite(
      this.tex('spr_char_commander', 'npc_commander'),
      1360,
      355
    );
    this.registerInteractive('npc_commander', 'Đội Trưởng Lê', 1360, 355, 95, commanderImg, 12);

    // --- CÁC NGUỒN MANH MỐI & 3 KIỆN HÀNG CỦA THỬ THÁCH GIẢI MÃ B (KHU CHUẨN BỊ) ---
    // Nguồn B1: Quân Sĩ Vạt Cọc
    const soldierWood = this.add
      .sprite(1285, 505, 'npc_villager', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(505);
    soldierWood.play('npc_villager_walk');
    this.registerInteractive('npc_woodworker', 'Quân Sĩ Vạt Cọc', 1285, 505, 88, soldierWood, 8);

    // Nguồn B2: Bác Thợ Rèn Tạo
    const smithSprite = this.add
      .sprite(1750, 415, 'npc_blacksmith', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(415);
    smithSprite.play('npc_blacksmith_walk');
    this.registerInteractive('npc_blacksmith', 'Bác Thợ Rèn Tạo', 1750, 415, 92, smithSprite, 8);

    // Nguồn B3: Bàn Bản Đồ Thủy Văn
    this.registerInteractive(
      'obj_tactical_table',
      'Bàn Bản Đồ Thủy Văn',
      1555,
      475,
      88,
      undefined,
      8
    );

    // Lựa chọn B-Sai 1: Kiện Bó Tre Nứa Nhỏ
    this.registerInteractive(
      'station_bamboo_bundles',
      'Kiện Hàng 1: Bó Tre Nứa Nhỏ',
      1170,
      565,
      85
    );

    // Lựa chọn B-Sai 2: Đống Cọc Gỗ Chưa Bịt Sắt
    this.registerInteractive(
      'station_raw_wood_stakes',
      'Kiện Hàng 2: Cọc Gỗ Trần (Chưa Bịt Sắt)',
      1170,
      455,
      85
    );

    // Lựa chọn B-Đúng: Giá Cọc Lớn Đã Bịt Đầu Sắt Tôi Cứng
    this.registerInteractive(
      'station_iron_tipped_stakes',
      'Kiện Hàng 3: Giá Cọc Lớn Bịt Đầu Sắt',
      1930,
      500,
      95,
      undefined,
      10
    );

    // 8. Trinh Sát Hải (Khu C - Cầu Tàu Bến Quan Sát)
    const scoutImg = this.placeCharacterSprite(
      this.tex('spr_char_scout', 'npc_scout'),
      1540,
      1090
    );
    this.registerInteractive('npc_scout', 'Trinh Sát Hải', 1540, 1090, 95, scoutImg, 12);

    // 9. Cột Mốc Đá Đo Mực Nước (Khu C - Mép Nước Bến Quan Sát)
    const markerImg = this.add
      .image(1675, 1135, this.tex('spr_tide_marker', 'tide_marker'))
      .setOrigin(0.5, 0.92)
      .setDepth(1135);
    this.registerInteractive(
      'obj_tide_marker',
      'Cột Mốc Đá Đo Mực Nước',
      1675,
      1135,
      95,
      markerImg,
      12
    );

    // 10. Tiền Ngô Vương Ngô Quyền đứng trên Đài Chỉ Huy
    const ngoQuyenSprite = this.add
      .sprite(1335, 920, 'npc_ngo_quyen', 0)
      .setOrigin(0.5, 0.92)
      .setDepth(920);
    ngoQuyenSprite.play('npc_ngo_quyen_idle');
    this.registerInteractive(
      'npc_ngo_quyen',
      'Đài Chỉ Huy Tiền Ngô Vương',
      1335,
      945,
      95,
      ngoQuyenSprite
    );

    // 11. HÒM CƠ MẬT QUÂN LỆNH 938 (Khu B - Doanh Trại)
    this.drawCipherChest(1470, 395);
    this.registerInteractive(
      'obj_cipher_chest',
      'Hòm Cơ Mật Quân Lệnh 938 [Khóa 3 Số]',
      1470,
      395,
      90,
      undefined,
      14
    );

    // 12. GIẾNG CỔ ĐẦU LÀNG (Khu A - Mật thư ẩn 1)
    this.drawAncientWell(185, 1040);
    this.registerInteractive(
      'obj_village_well',
      'Giếng Cổ Đầu Làng [Mật Thư Ẩn]',
      185,
      1040,
      85,
      undefined,
      10
    );

    // 13. HỐC ĐÁ MIẾU CỔ CÂY ĐA (Khu A - Mật thư ẩn 2)
    this.registerInteractive(
      'obj_shrine_cache',
      'Bát Hương Miếu Cổ [Mật Thư Ẩn]',
      625,
      990,
      82,
      undefined,
      10
    );

    // 14. THÙNG DẦU RÁI BẾN ĐÒ (Khu A - Mật thư ẩn 3)
    this.drawPitchBarrel(290, 1330);
    this.registerInteractive(
      'obj_boat_pitch_cache',
      'Thùng Dầu Rái Bến Thuyền [Mật Thư Ẩn]',
      290,
      1330,
      85,
      undefined,
      10
    );

    // 15. BIA ĐÁ CỔ TRẬN ĐỒ THỦY TRIỀU (Khu C - Bến Sông)
    this.drawAncientStele(1380, 1040);
    this.registerInteractive(
      'obj_tide_stele',
      'Bia Đá Cổ Trận Đồ [Mật Mã Thủy Triều]',
      1380,
      1040,
      88,
      undefined,
      12
    );
  }

  private placeCharacterSprite(key: string, footX: number, footY: number) {
    this.add
      .ellipse(footX, footY - 2, 32, 12, 0x1a110b, 0.32)
      .setDepth(Math.round(footY) - 1);

    const img = this.add
      .image(footX, footY, key)
      .setOrigin(0.5, 0.94)
      .setDepth(Math.round(footY));

    this.tweens.add({
      targets: img,
      scaleY: 1.022,
      duration: 1450 + Math.random() * 350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return img;
  }

  private registerInteractive(
    id: string,
    name: string,
    x: number,
    y: number,
    radius: number,
    sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image,
    priorityBoost: number = 0
  ) {
    const nameTag = this.add
      .text(x, y + 14, name, {
        fontFamily: 'Be Vietnam Pro, sans-serif',
        fontSize: '11px',
        color: '#FAF4E6',
        backgroundColor: 'rgba(47, 27, 18, 0.84)',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(Math.round(y) + 20)
      .setVisible(false);

    const markerContainer = this.add.container(x, y - 92).setDepth(2600).setVisible(false);
    const circle = this.add.circle(0, 0, 13, 0xc99726, 1).setStrokeStyle(2, 0x2f1b12);
    const exclam = this.add
      .text(0, 0, '!', {
        fontFamily: 'Playfair Display, serif',
        fontSize: '16px',
        color: '#2F1B12',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    markerContainer.add([circle, exclam]);

    this.tweens.add({
      targets: markerContainer,
      y: y - 100,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    this.interactives.push({
      id,
      name,
      x,
      y,
      radius,
      priorityBoost,
      sprite,
      nameTag,
      questMarker: markerContainer,
    });
  }

  public syncStateFromReact(state: {
    questStage: QuestStage;
    riverTidePhase: RiverTidePhase;
    collectedClues: ClueId[];
    reducedEffects: boolean;
    showGuidance: boolean;
    isDialogueOpen: boolean;
    heldItemName: string | null;
  }) {
    const tideChanged = this.riverTidePhase !== state.riverTidePhase;
    const dialogueJustOpened = !this.isDialogueOpen && state.isDialogueOpen;

    this.questStage = state.questStage;
    this.riverTidePhase = state.riverTidePhase;
    this.collectedClues = state.collectedClues || [];
    this.reducedEffects = Boolean(state.reducedEffects);
    this.showGuidance = state.showGuidance;
    this.isDialogueOpen = state.isDialogueOpen;

    if (dialogueJustOpened) {
      this.stopPlayerImmediately();
    }

    // Chế độ giảm hiệu ứng cho điện thoại yếu
    this.ambientPuffs.forEach((p) => p.setVisible(!this.reducedEffects));

    if (tideChanged && !this.isCutscenePlaying) {
      this.applyTideVisualState(this.riverTidePhase);
    }

    if (this.heldItemIndicator && this.heldItemText) {
      if (state.heldItemName) {
        this.heldItemText.setText(`Đang mang: ${state.heldItemName}`);
        this.heldItemIndicator.setVisible(true);
      } else {
        this.heldItemIndicator.setVisible(false);
      }
    }

    this.updateQuestMarkers();
  }

  private applyTideVisualState(phase: RiverTidePhase) {
    if (!this.highTideWaterOverlay) return;

    const colliderBody = this.lowCausewayCollider?.body as
      | Phaser.Physics.Arcade.StaticBody
      | undefined;

    if (phase === 'LOW_TIDE') {
      this.highTideWaterOverlay.setVisible(false);
      this.creekHighTideOverlay.setVisible(false);
      this.lowCausewayStones.setAlpha(1);
      this.lowCausewayFloodBanner.setVisible(false);
      if (colliderBody) colliderBody.enable = false;

      this.mudflatLayer.setVisible(true);
      this.riverStakes.forEach((s) => {
        s.setVisible(true);
        s.setAlpha(1);
      });
      this.stakeWaterRipples.forEach((r) => r.setVisible(false));
      this.tideLevelLabel.setText(
        'TRẠNG THÁI SÔNG: PHA NƯỚC RÒNG (Triều xuống thấp — Lộ rõ bãi cọc bịt sắt & Lối đá thấp)'
      );
      this.tideLevelLabel.setBackgroundColor('#184F63');
    } else if (phase === 'HIGH_TIDE') {
      this.highTideWaterOverlay.setVisible(true);
      this.highTideWaterOverlay.setAlpha(0.92);
      this.creekHighTideOverlay.setVisible(true);
      this.lowCausewayStones.setAlpha(0.18);
      this.lowCausewayFloodBanner.setVisible(true);
      if (colliderBody) colliderBody.enable = true;

      this.riverStakes.forEach((s) => {
        s.setAlpha(0.16);
      });
      this.stakeWaterRipples.forEach((r) => r.setVisible(!this.reducedEffects));
      this.tideLevelLabel.setText(
        'TRẠNG THÁI SÔNG: PHA NƯỚC LỚN (Triều dâng cao — Che khuất bãi cọc & Ngập lối đá thấp!)'
      );
      this.tideLevelLabel.setBackgroundColor('#9B1D20');
    } else if (phase === 'EBBING_CLIMAX') {
      this.highTideWaterOverlay.setVisible(false);
      this.creekHighTideOverlay.setVisible(false);
      this.lowCausewayStones.setAlpha(1);
      this.lowCausewayFloodBanner.setVisible(false);
      if (colliderBody) colliderBody.enable = false;

      this.mudflatLayer.setVisible(true);
      this.riverStakes.forEach((s) => {
        s.setVisible(true);
        s.setAlpha(1);
      });
      this.stakeWaterRipples.forEach((r) => r.setVisible(!this.reducedEffects));
      this.tideLevelLabel.setText(
        'TRẠNG THÁI SÔNG: NƯỚC TRIỀU RÚT MẠNH (Cọc nhọn nhô lên chặn đứng thuyền giặc!)'
      );
      this.tideLevelLabel.setBackgroundColor('#681113');
    }
  }

  private getTargetEntityIdForStage(): string {
    switch (this.questStage) {
      case 'STAGE_0_PROLOGUE':
        return 'npc_elder';
      case 'STAGE_0_DECODE_MEETING':
        // Không chỉ thẳng vào đáp án Nhà Đông Bắc để tránh giải hộ câu đố!
        return 'npc_elder';
      case 'STAGE_1_MEET_COMMANDER':
        return 'npc_commander';
      case 'STAGE_2_TALK_BLACKSMITH':
      case 'STAGE_2_GATHER_CLUES':
        // Chỉ về trung tâm Khu Chuẩn Bị (Bàn Bản Đồ), người chơi tự hỏi NPC và chọn kiện hàng
        return 'obj_tactical_table';
      case 'STAGE_3_FETCH_CHARCOAL':
      case 'STAGE_4_DELIVER_CHARCOAL':
      case 'STAGE_5_FIRST_RIVER_VISIT':
        return 'npc_scout';
      case 'STAGE_6_FLOODED_PATH_CHOICE':
        // Chỉ vào vùng lạch ngập để người chơi tự chọn Cầu Tre Gò Cao hoặc Bến Đò Bác Năm
        return 'obj_flooded_low_path';
      case 'STAGE_6_REPORT_COMMANDER':
        return 'npc_commander';
      case 'STAGE_7_SECOND_RIVER_VISIT':
        return 'obj_tide_marker';
      case 'STAGE_8_CLIMAX_SIGNAL':
        return 'npc_scout';
      case 'STAGE_9_COMPLETED':
        return 'npc_scout';
    }
  }

  private updateQuestMarkers() {
    const targetId = this.getTargetEntityIdForStage();
    this.interactives.forEach((ent) => {
      if (!ent.questMarker) return;

      if (this.questStage === 'STAGE_0_DECODE_MEETING') {
        // Hiển thị dấu hiệu ở cả 3 địa điểm nghi vấn trong Làng để người chơi tự quan sát giải mã
        ent.questMarker.setVisible(
          ent.id === 'landmark_house_southwest' ||
            ent.id === 'landmark_banyan_shrine' ||
            ent.id === 'landmark_house_northeast'
        );
      } else if (
        this.questStage === 'STAGE_2_TALK_BLACKSMITH' ||
        this.questStage === 'STAGE_2_GATHER_CLUES'
      ) {
        // Hiển thị dấu hiệu ở các nguồn manh mối & 3 kiện hàng trong Khu Chuẩn Bị
        ent.questMarker.setVisible(
          ent.id === 'npc_woodworker' ||
            ent.id === 'npc_blacksmith' ||
            ent.id === 'obj_tactical_table' ||
            ent.id === 'station_bamboo_bundles' ||
            ent.id === 'station_raw_wood_stakes' ||
            ent.id === 'station_iron_tipped_stakes'
        );
      } else if (this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE') {
        ent.questMarker.setVisible(
          ent.id === 'obj_ferry_landing' ||
            ent.id === 'npc_boatman' ||
            ent.id === 'obj_bamboo_bridge'
        );
      } else {
        ent.questMarker.setVisible(
          ent.id === targetId && this.questStage !== 'STAGE_9_COMPLETED'
        );
      }
    });
  }

  public setVirtualJoystick(vx: number, vy: number) {
    this.joyVector = { x: vx, y: vy };
  }

  public triggerInteraction() {
    if (this.isDialogueOpen || this.isCutscenePlaying) return;
    if (!this.activeNearest) return;

    const now = performance.now();
    // Chống kích hoạt kép trong 320ms
    if (now - this.lastInteractTime < 320) return;
    this.lastInteractTime = now;

    // Quay mặt nhân vật chính về phía đối tượng đang tương tác
    const dx = this.activeNearest.x - this.player.x;
    if (Math.abs(dx) > 6) {
      this.lastFacingFlipX = dx < 0;
      this.playerVisual.setFlipX(this.lastFacingFlipX);
    }

    // Nếu đối tượng là NPC có sprite, quay mặt NPC về phía người chơi
    if (this.activeNearest.sprite && 'setFlipX' in this.activeNearest.sprite) {
      this.activeNearest.sprite.setFlipX(dx > 0);
    }

    this.stopPlayerImmediately();
    sound.playClick();
    this.handleEntityInteraction(this.activeNearest.id);
  }

  private countCampClues(): number {
    let count = 0;
    if (this.collectedClues.includes('clue_b_wood_stake')) count += 1;
    if (this.collectedClues.includes('clue_b_iron_band')) count += 1;
    if (this.collectedClues.includes('clue_b_estuary_map')) count += 1;
    return count;
  }

  private handleEntityInteraction(entityId: string) {
    // =========================================================================
    // KHU A: CỤ TRƯỞNG THÔN & THỬ THÁCH GIẢI MÃ A (ĐIỂM HẸN MẬT TÍN)
    // =========================================================================
    if (entityId === 'npc_elder') {
      if (this.questStage === 'STAGE_0_PROLOGUE') {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.village_intro, () => {
          this.callbacks.onAdvanceQuest('STAGE_0_DECODE_MEETING', {
            addItems: ['cipher_scroll'],
            unlockFacts: ['fact-kieu-cong-tien-cause'],
            unlockClues: ['clue_a_cipher_note'],
          });
        });
      } else {
        this.callbacks.onOpenDialogue([
          DIALOGUE_SCRIPTS.village_intro[2],
          DIALOGUE_SCRIPTS.village_intro[3],
        ]);
      }
      return;
    }

    // Thử thách A - Điểm sai 1: Nhà Tranh Tây Nam (Cột vải chàm xanh, không khói bếp)
    if (entityId === 'landmark_house_southwest') {
      this.callbacks.onRecordChallengeAttempt('A');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_a_wrong_southwest);
      return;
    }

    // Thử thách A - Điểm sai 2: Miếu Đá Gốc Đa
    if (entityId === 'landmark_banyan_shrine') {
      this.callbacks.onRecordChallengeAttempt('A');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_a_wrong_banyan);
      return;
    }

    // Thử thách A - Điểm ĐÚNG: Nhà Tranh Đông Bắc (Khói bếp trắng + Đôi chum sành + Cột lụa đỏ)
    if (entityId === 'landmark_house_northeast') {
      if (
        this.questStage === 'STAGE_0_PROLOGUE' ||
        this.questStage === 'STAGE_0_DECODE_MEETING'
      ) {
        sound.playSuccess();
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_a_success, () => {
          this.callbacks.onAdvanceQuest('STAGE_1_MEET_COMMANDER', {
            addItems: ['order_token'],
            unlockFacts: ['fact-kieu-cong-tien-cause'],
            unlockClues: ['clue_a_cipher_note'],
          });
        });
      } else {
        this.callbacks.onOpenDialogue([DIALOGUE_SCRIPTS.challenge_a_success[0]]);
      }
      return;
    }

    // =========================================================================
    // KHU B: ĐỘI TRƯỞNG LÊ & THỬ THÁCH GIẢI MÃ B (GHÉP MANH MỐI CHỌN GIÁ CỌC)
    // =========================================================================
    if (entityId === 'npc_commander') {
      if (
        this.questStage === 'STAGE_0_PROLOGUE' ||
        this.questStage === 'STAGE_0_DECODE_MEETING' ||
        this.questStage === 'STAGE_1_MEET_COMMANDER'
      ) {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.commander_initial, () => {
          this.callbacks.onAdvanceQuest('STAGE_2_GATHER_CLUES', {
            addItems: ['order_token'],
            unlockFacts: ['fact-stake-preparation-938'],
          });
        });
      } else if (
        this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE' ||
        this.questStage === 'STAGE_6_REPORT_COMMANDER'
      ) {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.commander_report, () => {
          this.callbacks.onAdvanceQuest('STAGE_7_SECOND_RIVER_VISIT', {
            removeItems: ['tide_report'],
            addItems: ['battle_flag'],
            tidePhase: 'HIGH_TIDE',
            unlockFacts: ['fact-tide-decisive-victory'],
          });
        });
      } else {
        this.callbacks.onOpenDialogue([DIALOGUE_SCRIPTS.commander_initial[2]]);
      }
      return;
    }

    // Nguồn manh mối B1: Quân Sĩ Vạt Cọc
    if (entityId === 'npc_woodworker') {
      this.callbacks.onUnlockClue('clue_b_wood_stake');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.clue_b_woodworker);
      return;
    }

    // Nguồn manh mối B2: Bác Thợ Rèn Tạo
    if (entityId === 'npc_blacksmith') {
      sound.playAnvilStrike();
      this.callbacks.onUnlockClue('clue_b_iron_band');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.clue_b_blacksmith, () => {
        if (this.questStage === 'STAGE_2_TALK_BLACKSMITH') {
          this.callbacks.onAdvanceQuest('STAGE_2_GATHER_CLUES', {
            unlockClues: ['clue_b_iron_band'],
          });
        }
      });
      return;
    }

    // Nguồn manh mối B3: Bàn Bản Đồ Thủy Văn
    if (entityId === 'obj_tactical_table') {
      this.callbacks.onUnlockClue('clue_b_estuary_map');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.clue_b_tactical_map);
      return;
    }

    // Thử thách B - Kiện hàng sai 1: Bó Tre Nứa Nhỏ
    if (entityId === 'station_bamboo_bundles') {
      this.callbacks.onRecordChallengeAttempt('B');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_b_wrong_bamboo);
      return;
    }

    // Thử thách B - Kiện hàng sai 2: Đống Cọc Gỗ Chưa Bịt Sắt
    if (entityId === 'station_raw_wood_stakes') {
      this.callbacks.onRecordChallengeAttempt('B');
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_b_wrong_unbanded);
      return;
    }

    // Thử thách B - Kiện hàng ĐÚNG: Giá Cọc Lớn Đã Bịt Đầu Sắt
    if (entityId === 'station_iron_tipped_stakes') {
      const isStageB =
        this.questStage === 'STAGE_1_MEET_COMMANDER' ||
        this.questStage === 'STAGE_2_TALK_BLACKSMITH' ||
        this.questStage === 'STAGE_2_GATHER_CLUES' ||
        this.questStage === 'STAGE_3_FETCH_CHARCOAL' ||
        this.questStage === 'STAGE_4_DELIVER_CHARCOAL';

      if (isStageB && this.countCampClues() < 2) {
        // Yêu cầu thu thập ít nhất 2 manh mối trước khi chọn để tránh bấm mò
        this.callbacks.onRecordChallengeAttempt('B');
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_b_need_more_clues);
        return;
      }

      sound.playSteamQuench();
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_b_success, () => {
        if (isStageB) {
          this.callbacks.onAdvanceQuest('STAGE_5_FIRST_RIVER_VISIT', {
            addItems: ['iron_bands'],
            unlockFacts: ['fact-stake-preparation-938'],
          });
        }
      });
      return;
    }

    // =========================================================================
    // KHU C: BẾN QUAN SÁT & THỬ THÁCH GIẢI MÃ C (CON NƯỚC & ĐỊA HÌNH)
    // =========================================================================
    if (entityId === 'npc_villager_pier') {
      this.callbacks.onMarkHelpedVillager();
      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.villager_charcoal);
      return;
    }

    // Kiểm tra Lối Đá Thấp khi đang ngập triều (Phản hồi thử sai ở Thử thách C1)
    if (entityId === 'obj_flooded_low_path') {
      if (this.riverTidePhase === 'HIGH_TIDE') {
        sound.playWaveSplash();
        this.callbacks.onRecordChallengeAttempt('C');
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_c_wrong_flooded_path);
      } else {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.boatman_low_tide_warn);
      }
      return;
    }

    // Cách giải quyết B của Thử thách C1: Nhờ Bác Chèo Đò Năm đưa thuyền qua lạch nước ngập
    if (entityId === 'npc_boatman' || entityId === 'obj_ferry_landing') {
      if (
        this.riverTidePhase === 'HIGH_TIDE' ||
        this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE'
      ) {
        sound.playWaveSplash();
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.boatman_ferry_help, () => {
          // Hoạt cảnh thuyền Bác Năm chở nhân vật lướt qua lạch nước (không dịch chuyển tức thời gây giật)
          this.isCutscenePlaying = true;
          const onPierSide = this.player.x > 1020;
          const destX = onPierSide ? 875 : 1165;
          const destY = 1135;

          this.tweens.add({
            targets: [this.boatmanSampan, this.player, this.playerVisual, this.playerShadow],
            x: destX,
            duration: 850,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              this.player.setPosition(destX, destY);
              this.isCutscenePlaying = false;
              if (this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE') {
                this.callbacks.onAdvanceQuest('STAGE_6_REPORT_COMMANDER', {
                  floodedPathSolution: 'BOATMAN_FERRY',
                });
              }
            },
          });
        });
      } else {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.boatman_low_tide_warn);
      }
      return;
    }

    // Cách giải quyết A của Thử thách C1: Đi bộ qua Cầu Tre Gò Cao
    if (entityId === 'obj_bamboo_bridge') {
      if (this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE') {
        sound.playSuccess();
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.bridge_high_path, () => {
          this.callbacks.onAdvanceQuest('STAGE_6_REPORT_COMMANDER', {
            floodedPathSolution: 'HIGH_BRIDGE',
          });
        });
      } else {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.bridge_high_path);
      }
      return;
    }

    // Cột Mốc Đá Đo Mực Nước ở Bến Quan Sát (Giải mã thời điểm Nước Rút ở Thử thách C2)
    if (entityId === 'obj_tide_marker') {
      sound.playWaveSplash();
      if (this.riverTidePhase === 'LOW_TIDE') {
        this.callbacks.onMarkMarkerObserved('LOW');
        this.callbacks.onUnlockClue('clue_c_low_tide_mark');
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.pier_low_tide);
      } else {
        this.callbacks.onMarkMarkerObserved('HIGH');
        this.callbacks.onUnlockClue('clue_c_high_tide_flood');
        if (this.questStage === 'STAGE_7_SECOND_RIVER_VISIT') {
          this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.tide_marker_confirm_ebb, () => {
            this.callbacks.onAdvanceQuest('STAGE_8_CLIMAX_SIGNAL', {
              unlockClues: ['clue_c_high_tide_flood'],
            });
          });
        } else {
          this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.pier_flooded_discovery);
        }
      }
      return;
    }

    // Trinh Sát Hải ở Cầu Tàu Bến Quan Sát
    if (entityId === 'npc_scout') {
      if (
        this.questStage === 'STAGE_0_PROLOGUE' ||
        this.questStage === 'STAGE_0_DECODE_MEETING' ||
        this.questStage === 'STAGE_1_MEET_COMMANDER' ||
        this.questStage === 'STAGE_2_GATHER_CLUES' ||
        this.questStage === 'STAGE_5_FIRST_RIVER_VISIT'
      ) {
        this.callbacks.onMarkMarkerObserved('LOW');
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.pier_low_tide, () => {
          sound.playWaveSplash();
          this.applyTideVisualState('HIGH_TIDE');
          this.callbacks.onMarkMarkerObserved('HIGH');

          this.time.delayedCall(350, () => {
            this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.pier_flooded_discovery, () => {
              this.callbacks.onAdvanceQuest('STAGE_6_FLOODED_PATH_CHOICE', {
                removeItems: ['iron_bands'],
                addItems: ['tide_report'],
                tidePhase: 'HIGH_TIDE',
                unlockFacts: ['fact-stake-preparation-938', 'fact-tide-decisive-victory'],
                unlockClues: ['clue_c_low_tide_mark', 'clue_c_high_tide_flood'],
              });
            });
          });
        });
      } else if (this.questStage === 'STAGE_7_SECOND_RIVER_VISIT') {
        // Nếu người chơi chưa kiểm tra Cột Mốc Đá để canh thời điểm Nước Rút mà đã vội phất cờ -> Phản hồi thử sai Thử thách C2!
        this.callbacks.onRecordChallengeAttempt('C');
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.challenge_c_wrong_early_signal);
      } else if (this.questStage === 'STAGE_8_CLIMAX_SIGNAL') {
        this.callbacks.onMarkMarkerObserved('HIGH');
        this.playClimaxCutscene();
      } else {
        this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.pier_flooded_discovery);
      }
      return;
    }

    // Hòm Cơ Mật Quân Lệnh (Khóa 3 Chữ Số 9-3-8)
    if (entityId === 'obj_cipher_chest') {
      this.callbacks.onOpenCipherPuzzle('CIPHER_CAMP_CHEST');
      return;
    }

    // Mật thư ẩn 1: Giếng Cổ Đầu Làng
    if (entityId === 'obj_village_well') {
      this.callbacks.onUnlockClue('clue_secret_ancient_well');
      this.callbacks.onOpenCipherPuzzle('CIPHER_SECRET_WELL');
      return;
    }

    // Mật thư ẩn 2: Bát Hương Miếu Cổ Cây Đa
    if (entityId === 'obj_shrine_cache') {
      this.callbacks.onUnlockClue('clue_secret_shrine_cache');
      this.callbacks.onOpenCipherPuzzle('CIPHER_SECRET_SHRINE');
      return;
    }

    // Mật thư ẩn 3: Thùng Dầu Rái Bến Thuyền
    if (entityId === 'obj_boat_pitch_cache') {
      this.callbacks.onUnlockClue('clue_secret_boat_pitch');
      this.callbacks.onOpenCipherPuzzle('CIPHER_SECRET_PITCH');
      return;
    }

    // Bia Đá Cổ Khắc Trận Đồ Thủy Triều
    if (entityId === 'obj_tide_stele') {
      this.callbacks.onOpenCipherPuzzle('CIPHER_TIDE_STELE');
      return;
    }

    // Đài Chỉ Huy Tiền Ngô Vương (Khu C)
    if (entityId === 'npc_ngo_quyen') {
      this.callbacks.onOpenDialogue([DIALOGUE_SCRIPTS.climax_victory[1]]);
    }
  }

  private playClimaxCutscene() {
    this.isCutscenePlaying = true;
    this.stopPlayerImmediately();
    sound.playWarDrumAndHorn();

    this.cameras.main.stopFollow();
    this.cameras.main.pan(1720, 1250, 1200, 'Sine.easeInOut');

    this.tweens.add({
      targets: this.scoutBoats,
      x: '+=420',
      duration: 1800,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.enemyBoats.forEach((eb) => eb.setVisible(true));

        this.tweens.add({
          targets: this.scoutBoats,
          x: '-=420',
          duration: 1800,
          ease: 'Sine.easeInOut',
        });

        this.tweens.add({
          targets: this.enemyBoats,
          x: '-=480',
          duration: 2100,
          ease: 'Quad.easeInOut',
          onComplete: () => {
            sound.playWarDrumAndHorn();
            sound.playWaveSplash();
            this.applyTideVisualState('EBBING_CLIMAX');

            this.tweens.add({
              targets: this.enemyBoats,
              angle: { from: -12, to: 14 },
              y: '+=8',
              duration: 220,
              yoyo: true,
              repeat: 5,
              onComplete: () => {
                this.cameras.main.pan(
                  this.player.x,
                  this.player.y,
                  900,
                  'Sine.easeInOut',
                  false,
                  (_cam, progress) => {
                    if (progress === 1) {
                      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
                      this.isCutscenePlaying = false;

                      this.callbacks.onOpenDialogue(DIALOGUE_SCRIPTS.climax_victory, () => {
                        this.callbacks.onAdvanceQuest('STAGE_9_COMPLETED', {
                          removeItems: ['battle_flag', 'order_token'],
                          tidePhase: 'EBBING_CLIMAX',
                          completedChapter: true,
                        });
                        this.callbacks.onClimaxComplete();
                      });
                    }
                  }
                );
              },
            });
          },
        });
      },
    });
  }

  public update(time: number, delta: number) {
    if (!this.player || !this.player.body) return;

    const dt = Math.min(delta, 100) / 1000;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const footX = body.center.x;
    const footY = body.bottom;

    this.heldItemIndicator.setPosition(footX, footY - 92);

    if (this.isDialogueOpen || this.isCutscenePlaying) {
      this.player.setVelocity(0, 0);
      this.playerVisual.setPosition(footX, footY);
      this.playerVisual.setRotation(0);
      this.playerVisual.setFlipX(this.lastFacingFlipX);
      this.playerShadow.setPosition(footX, footY - 2);
      this.guidanceArrow.setVisible(false);
      this.worldPromptContainer.setVisible(false);
      this.targetHighlightRing.setVisible(false);
      return;
    }

    // 1. Tính toán vector vận tốc chuẩn hóa (đi chéo không bao giờ nhanh hơn đi ngang, có vùng chết deadzone)
    const maxSpeed = 230;
    let rawX = this.joyVector.x;
    let rawY = this.joyVector.y;

    if (this.cursors && this.wasd) {
      let kx = 0;
      let ky = 0;
      if (this.cursors.left.isDown || this.wasd.A.isDown) kx -= 1;
      if (this.cursors.right.isDown || this.wasd.D.isDown) kx += 1;
      if (this.cursors.up.isDown || this.wasd.W.isDown) ky -= 1;
      if (this.cursors.down.isDown || this.wasd.S.isDown) ky += 1;

      if (kx !== 0 || ky !== 0) {
        const kMag = Math.hypot(kx, ky);
        rawX = kx / kMag;
        rawY = ky / kMag;
      }
    }

    const inputMag = Math.hypot(rawX, rawY);
    const deadzone = 0.12;

    if (inputMag > deadzone) {
      const clampedMag = Math.min(1, inputMag);
      const dirX = rawX / inputMag;
      const dirY = rawY / inputMag;

      const vx = dirX * clampedMag * maxSpeed;
      const vy = dirY * clampedMag * maxSpeed;
      this.player.setVelocity(vx, vy);

      // Chỉ đổi hướng lật ngang khi thành phần X đủ rõ (> 18 px/s) để chống nhấp nháy hướng khi đi dọc
      if (vx < -18) {
        this.lastFacingFlipX = true;
      } else if (vx > 18) {
        this.lastFacingFlipX = false;
      }
      this.playerVisual.setFlipX(this.lastFacingFlipX);

      // Nhịp chân tỷ lệ thuận với tốc độ di chuyển thực tế và thời gian khung hình (delta)
      const actualSpeed = Math.hypot(body.velocity.x, body.velocity.y);
      const speedRatio = Math.min(1, actualSpeed / maxSpeed);

      if (speedRatio > 0.08) {
        this.walkBobPhase += dt * 14.5 * speedRatio;
        const bobY = Math.abs(Math.sin(this.walkBobPhase)) * 4.2 * speedRatio;
        const tilt = Math.sin(this.walkBobPhase) * 0.045 * speedRatio;
        this.playerVisual.setPosition(footX, footY - bobY);
        this.playerVisual.setRotation(tilt);
      } else {
        this.walkBobPhase = 0;
        this.playerVisual.setPosition(footX, footY);
        this.playerVisual.setRotation(0);
      }
      this.playerShadow.setPosition(footX, footY - 2);

      const onPier =
        (footX > 1470 && footX < 1610 && footY > 1050) ||
        (footX > 950 && footX < 1090 && footY < 880);
      sound.playFootstep(onPier ? 'wood' : 'dirt');
    } else {
      this.player.setVelocity(0, 0);
      this.walkBobPhase = 0;
      this.playerVisual.setPosition(footX, footY);
      this.playerVisual.setRotation(0);
      this.playerVisual.setFlipX(this.lastFacingFlipX);
      this.playerShadow.setPosition(footX, footY - 2);
    }

    // 2. Y-Sorting dựa trên vị trí chân nhân vật
    const footDepth = Math.round(footY);
    this.playerVisual.setDepth(footDepth);
    this.playerShadow.setDepth(footDepth - 1);

    // Tự động ghi nhận khi người chơi đi bộ qua Cầu Tre Gò Cao sang bờ làng trong lúc Lối Đá Thấp bị ngập (không dịch chuyển nhân vật!)
    if (
      this.questStage === 'STAGE_6_FLOODED_PATH_CHOICE' &&
      footY > 790 &&
      footY < 885 &&
      footX > 890 &&
      footX < 965
    ) {
      this.handleEntityInteraction('obj_bamboo_bridge');
      return;
    }

    // Bong bóng hội thoại rì rầm của dân làng khi đi ngang qua sân làng
    const distToVillagers = Phaser.Math.Distance.Between(footX, footY, 408, 938);
    this.ambientBubbleContainer.setVisible(distToVillagers < 165);

    // 3. Xác định khu vực hiện tại
    let detectedZone: 'VILLAGE' | 'CAMP' | 'RIVER' = 'VILLAGE';
    if (footY < 740 && footX > 950) {
      detectedZone = 'CAMP';
    } else if (footX > 1030 && footY >= 740) {
      detectedZone = 'RIVER';
    }
    if (detectedZone !== this.currentZone) {
      this.currentZone = detectedZone;
      this.callbacks.onZoneChange(detectedZone);
    }

    if (time - this.lastPositionSaveTime > 2500) {
      this.lastPositionSaveTime = time;
      this.callbacks.onSavePosition(footX, footY, this.currentZone);
    }

    // 4. Chọn đối tượng tương tác ưu tiên rõ ràng khi có nhiều NPC/vật thể gần nhau
    let bestEntity: InteractiveEntity | null = null;
    let bestScore = Infinity;

    for (const ent of this.interactives) {
      const d = Phaser.Math.Distance.Between(footX, footY, ent.x, ent.y);
      if (ent.nameTag) {
        ent.nameTag.setVisible(d <= 165);
      }
      if (d <= ent.radius) {
        // Ưu tiên đối tượng đang được nhân vật hướng mặt về phía đó + đối tượng nhiệm vụ
        const isFacingEnt =
          (this.lastFacingFlipX && ent.x <= footX + 10) ||
          (!this.lastFacingFlipX && ent.x >= footX - 10);
        const facingBonus = isFacingEnt ? 14 : 0;
        const questBonus = ent.questMarker?.visible ? 22 : 0;
        const score = d - facingBonus - questBonus - (ent.priorityBoost || 0);

        if (score < bestScore) {
          bestScore = score;
          bestEntity = ent;
        }
      }
    }

    if (bestEntity !== this.activeNearest) {
      this.activeNearest = bestEntity;
      this.callbacks.onNearbyPromptChange(bestEntity ? bestEntity.name : null);
    }

    if (bestEntity) {
      this.worldPromptContainer.setPosition(bestEntity.x, bestEntity.y - 96);
      this.worldPromptText.setText(bestEntity.name);
      this.worldPromptContainer.setVisible(true);

      this.targetHighlightRing.setPosition(bestEntity.x, bestEntity.y - 2);
      this.targetHighlightRing.setVisible(true);
    } else {
      this.worldPromptContainer.setVisible(false);
      this.targetHighlightRing.setVisible(false);
    }

    // 5. Cập nhật mũi tên chỉ đường tự nhiên
    const targetId = this.getTargetEntityIdForStage();
    const targetEnt = this.interactives.find((e) => e.id === targetId);
    if (targetEnt && this.showGuidance && this.questStage !== 'STAGE_9_COMPLETED') {
      const distToTarget = Phaser.Math.Distance.Between(
        footX,
        footY,
        targetEnt.x,
        targetEnt.y
      );
      if (distToTarget > 115) {
        const angle = Phaser.Math.Angle.Between(footX, footY, targetEnt.x, targetEnt.y);
        this.guidanceArrow.setPosition(footX, footY);
        this.guidanceArrow.setRotation(angle);
        this.guidanceArrow.setVisible(true);
      } else {
        this.guidanceArrow.setVisible(false);
      }
    } else {
      this.guidanceArrow.setVisible(false);
    }
  }
}
