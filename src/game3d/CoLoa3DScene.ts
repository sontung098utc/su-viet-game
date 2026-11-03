import * as THREE from 'three';
import type { CoLoaRelicId } from '../types';
import { sound } from '../utils/sound';

export interface CoLoaBridgeCallbacks {
  onHoverInteractable: (info: { id: string; name: string; prompt: string } | null) => void;
  onOpenPuzzle: (relicId: CoLoaRelicId) => void;
  onOpenSmelting?: () => void;
  onOpenNarration?: (actId: string) => void;
  onInspectRelic: (relicId: CoLoaRelicId) => void;
  onInspectDecoy: (decoyId: string) => void;
  onCrossbowReadyToAssemble: () => void;
  onTargetHit: (hitCount: number) => void;
  onChapterComplete: () => void;
  onCompassUpdate: (yawAngleDegrees: number, targets: { id: string; name: string; angle: number; distance: number }[]) => void;
  onCameraModeChange?: (mode: 'FIRST_PERSON' | 'THIRD_PERSON') => void;
}

// Định nghĩa hình học va chạm vật lý Scene Collider chống đi xuyên tường / đồ vật
export interface SceneCollider {
  type: 'circle' | 'box';
  name?: string;
  x?: number;
  z?: number;
  radius?: number;
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
}

// Helper: Tạo Texture Đồ Họa Procedural độ nét cao trực tiếp trên Canvas (Zero 404 assets)
function createProceduralTexture(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export class CoLoa3DScene {
  private container: HTMLElement;
  private callbacks: CoLoaBridgeCallbacks;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Hệ thống va chạm vật lý thực tế chống đi xuyên tường / cây cối / đồ vật
  private sceneColliders: SceneCollider[] = [];

  // Player & Controls State (Bắt đầu tại Thành Nội gần Bia Ký An Dương Vương)
  private playerPos = new THREE.Vector3(0, 1.7, -4);
  private playerVel = new THREE.Vector3();
  private cameraPitch = 0; // X-axis (up/down)
  private cameraYaw = 0;   // Y-axis (left/right)
  private targetPitch = 0;
  private targetYaw = 0;
  private isPointerLocked = false;
  private isMouseDown = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private keysPressed: Record<string, boolean> = {};

  // Chế độ góc nhìn: FIRST_PERSON (Thứ nhất) hoặc THIRD_PERSON (Thứ ba)
  private cameraMode: 'FIRST_PERSON' | 'THIRD_PERSON' = 'THIRD_PERSON';
  private playerCharacterMesh!: THREE.Group;
  private leftLeg: THREE.Group | null = null;
  private rightLeg: THREE.Group | null = null;
  private leftArm: THREE.Group | null = null;
  private rightArm: THREE.Group | null = null;
  private walkPhase = 0;

  // First-Person Weapon Model (Nỏ Thần cầm tay góc nhìn thứ nhất)
  private fpsCrossbowMesh!: THREE.Group;

  // Touch look state for Mobile
  private touchLookId: number | null = null;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private mobileMoveVector = { x: 0, y: 0 };

  // Lighting, Anim & Particle objects
  private torchLights: { light: THREE.PointLight; baseIntensity: number; phase: number }[] = [];
  private animatedBanners: THREE.Mesh[] = [];
  private animatedReeds: THREE.Group[] = [];
  private sparkParticles: THREE.Points | null = null;
  private sparkPositions: Float32Array | null = null;

  // Interactive 3D Objects
  private interactableObjects: {
    mesh: THREE.Object3D;
    id: string;
    name: string;
    prompt: string;
    radius: number;
    interactionPos: THREE.Vector3;
  }[] = [];
  private collectedShards = new Set<CoLoaRelicId>();
  private currentHoveredId: string | null = null;

  // Crossbow & Firing sequence state
  private crossbowStand: THREE.Group | null = null;
  private assembledCrossbowMesh: THREE.Group | null = null;
  private isCrossbowAssembled = false;
  private isAimingCrossbow = false;
  private targetsDestroyed = 0;
  private targetPavilions: { group: THREE.Group; hit: boolean; position: THREE.Vector3; fireLight?: THREE.PointLight }[] = [];
  private activeFlyingArrows: { mesh: THREE.Group; vel: THREE.Vector3; targetPos: THREE.Vector3; life: number }[] = [];

  // Recoil effect
  private recoilOffset = 0;

  private isRunning = false;
  private animFrameId: number | null = null;

  // Textures cache
  private textures: Record<string, THREE.CanvasTexture> = {};

  constructor(container: HTMLElement, callbacks: CoLoaBridgeCallbacks, initialCollected: CoLoaRelicId[] = []) {
    this.container = container;
    this.callbacks = callbacks;
    initialCollected.forEach((id) => this.collectedShards.add(id));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, container.clientWidth / container.clientHeight, 0.05, 1200);
    this.camera.position.copy(this.playerPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    this.generateProceduralTextures();
    this.setupEnvironment();
    this.buildTerrainAndSpiralRamparts();
    this.buildFoliageAndAtmosphere();
    this.buildSoldiersAndDefenses();
    this.buildLandmarks();
    this.buildRelicPickups();
    this.buildDecoyPickups();
    this.buildCrossbowStation();
    this.buildEnemyTargets();
    this.buildSceneColliders();
    this.buildPlayerCharacter();
    this.buildFpsViewModel();
    this.setupEventListeners();

    this.isRunning = true;
    this.animate();
  }

  // --- SINH TEXTURE PROCEDURAL CHUẨN MỸ THUẬT ĐÔNG SƠN & NỆN ĐẤT THÀNH CỔ ---
  private generateProceduralTextures() {
    // 1. Texture Đất Nén Phù Sa Cổ Loa (Đất sét + đá ong dăm gạch)
    this.textures.terrain = createProceduralTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#654e38';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2.5;
        ctx.fillStyle = Math.random() > 0.4 ? '#4e3a27' : '#826548';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 2. Texture Bờ Lũy Đất Nện 9 Vòng Xoáy Cổ Loa
    this.textures.rampart = createProceduralTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#7c5e43';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 14) {
        ctx.fillStyle = y % 28 === 0 ? '#59412d' : '#8f6f52';
        ctx.fillRect(0, y, w, 7);
      }
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = 'rgba(40, 25, 15, 0.2)';
        ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
      }
    });

    // 3. Texture Đồng Thau Đông Sơn (Bronze với hoa văn chim Lạc & răng cưa)
    this.textures.bronze = createProceduralTexture(512, 512, (ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#c9933b');
      grad.addColorStop(0.5, '#e5b65f');
      grad.addColorStop(1, '#8f6320');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#5a3d13';
      ctx.lineWidth = 4;
      for (let x = 30; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 20, 30);
        ctx.lineTo(x, 60);
        ctx.stroke();
      }

      ctx.strokeStyle = '#38250b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Texture Giáp Ngực Hộ Tâm Phiến Đông Sơn (Mặt Trời 14 Tia & Chim Lạc Bay)
    this.textures.warriorArmor = createProceduralTexture(512, 512, (ctx, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w / 2);
      grad.addColorStop(0, '#f5c563');
      grad.addColorStop(0.5, '#b87c28');
      grad.addColorStop(0.85, '#784810');
      grad.addColorStop(1, '#422405');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Mặt trời 14 tia chính giữa
      ctx.fillStyle = '#ffde82';
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f7c348';
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const tipX = cx + Math.cos(angle) * 88;
        const tipY = cy + Math.sin(angle) * 88;
        const leftAngle = angle - Math.PI / 16;
        const rightAngle = angle + Math.PI / 16;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(leftAngle) * 32, cy + Math.sin(leftAngle) * 32);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(cx + Math.cos(rightAngle) * 32, cy + Math.sin(rightAngle) * 32);
        ctx.closePath();
        ctx.fill();
      }

      // Vòng tròn đồng tâm hoa văn vòng tròn tiếp tuyến & răng cưa
      ctx.strokeStyle = '#3b2005';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 115, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 175, 0, Math.PI * 2);
      ctx.stroke();

      // Họa tiết chim Lạc bay ngược chiều kim đồng hồ
      ctx.strokeStyle = '#ffd875';
      ctx.lineWidth = 3;
      for (let b = 0; b < 8; b++) {
        const bAngle = (b / 8) * Math.PI * 2;
        const bx = cx + Math.cos(bAngle) * 145;
        const by = cy + Math.sin(bAngle) * 145;
        ctx.beginPath();
        ctx.arc(bx, by, 10, bAngle, bAngle + Math.PI);
        ctx.stroke();
      }

      // Viền đinh tán bảo vệ viền ngoài
      for (let r = 0; r < 24; r++) {
        const rAngle = (r / 24) * Math.PI * 2;
        ctx.fillStyle = '#ffeaa6';
        ctx.beginPath();
        ctx.arc(cx + Math.cos(rAngle) * 230, cy + Math.sin(rAngle) * 230, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Texture Khố Vải Dệt Chàm & Hoa Văn Hình Thoi Chiến Binh Đông Sơn
    this.textures.warriorKilt = createProceduralTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#2b1a13';
      ctx.fillRect(0, 0, w, h);

      // Kẻ sợi dệt thô mộc
      ctx.fillStyle = '#1c100b';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }

      // Dải hoa văn thổ cẩm đỏ chu sa & vàng đồng
      ctx.fillStyle = '#8a1f18';
      ctx.fillRect(0, 40, w, 60);
      ctx.fillRect(0, h - 100, w, 60);

      ctx.strokeStyle = '#e0aa38';
      ctx.lineWidth = 4;
      for (let x = 0; x < w; x += 40) {
        // Hình thoi Đông Sơn
        ctx.beginPath();
        ctx.moveTo(x + 20, 50);
        ctx.lineTo(x + 40, 70);
        ctx.lineTo(x + 20, 90);
        ctx.lineTo(x, 70);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + 20, h - 90);
        ctx.lineTo(x + 40, h - 70);
        ctx.lineTo(x + 20, h - 50);
        ctx.lineTo(x, h - 70);
        ctx.closePath();
        ctx.stroke();
      }
    });

    // 6. Texture Gỗ Dâu Rừng / Lim Cổ
    this.textures.wood = createProceduralTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#533722';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3a2414';
      for (let y = 0; y < h; y += 6) {
        ctx.fillRect(0, y, w, 2);
      }
    });

    // 7. Texture Ngói Vảy Cá Cung Đình Lạc Việt
    this.textures.tile = createProceduralTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#a6442e';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#6e2717';
      ctx.lineWidth = 3;
      for (let y = 0; y < h; y += 18) {
        for (let x = 0; x < w; x += 22) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI);
          ctx.stroke();
        }
      }
    });
  }

  // --- THIẾT LẬP BẦU TRỜI & ÁNH SÁNG STUDIO PBR ---
  private setupEnvironment() {
    this.scene.background = new THREE.Color(0xb26b38);
    this.scene.fog = new THREE.FogExp2(0xb26b38, 0.007);

    // Dãy núi Ba Vì & Thất Diệu Sơn ở chân trời phía xa
    const mountainMat = new THREE.MeshBasicMaterial({ color: 0x48291b });
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const dist = 380;
      const mHeight = 55 + Math.sin(i * 1.5) * 25;
      const mWidth = 85 + Math.cos(i) * 30;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(mWidth, mHeight, 6), mountainMat);
      mountain.position.set(Math.cos(angle) * dist, mHeight / 2 - 10, Math.sin(angle) * dist);
      this.scene.add(mountain);
    }

    // Ánh sáng môi trường tự nhiên
    const hemiLight = new THREE.HemisphereLight(0xffdfba, 0x5a3e2a, 0.9);
    this.scene.add(hemiLight);

    // Mặt trời hoàng hôn rực rỡ chiếu xiên tạo bóng đổ đổ dài cổ kính
    const sunLight = new THREE.DirectionalLight(0xff8c3b, 1.8);
    sunLight.position.set(-90, 65, -70);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 400;
    const d = 110;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    this.scene.add(sunLight);

    // Quả cầu mặt trời hoàng hôn
    const sunGeo = new THREE.SphereGeometry(22, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xff4800 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(-320, 160, -240);
    this.scene.add(sunMesh);
  }

  // --- ĐỊA HÌNH & 3 VÒNG THÀNH XOẮN ỐC NỆN ĐẤT HÙNG VĨ ---
  private buildTerrainAndSpiralRamparts() {
    // 1. Mặt đất chính rộng 450m
    const groundGeo = new THREE.PlaneGeometry(450, 450, 64, 64);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      if (dist > 25) {
        pos.setZ(i, Math.sin(x * 0.03) * Math.cos(y * 0.03) * 2.2);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      map: this.textures.terrain,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Lũy Đất 3 Vòng Xoáy Cổ Loa (Đắp đất cao 4.2m)
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.textures.rampart,
      roughness: 0.95,
      metalness: 0.02,
    });

    const rampartShape = new THREE.Shape();
    rampartShape.moveTo(-5.0, 0);
    rampartShape.lineTo(-2.4, 4.2);
    rampartShape.lineTo(2.4, 4.2);
    rampartShape.lineTo(5.0, 0);
    rampartShape.closePath();

    // VÒNG 1: THÀNH NỘI (Hoàng Cung & Bia Ký r=26m)
    const innerCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-24, 0, -22),
        new THREE.Vector3(-30, 0, 12),
        new THREE.Vector3(-10, 0, 26)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-10, 0, 26),
        new THREE.Vector3(22, 0, 28),
        new THREE.Vector3(28, 0, 4)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(28, 0, 4),
        new THREE.Vector3(22, 0, -26),
        new THREE.Vector3(-4, 0, -26)
      ),
    ];

    // VÒNG 2: THÀNH TRUNG (Doanh trại & Lò Rèn r=58m)
    const midCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-52, 0, -45),
        new THREE.Vector3(-66, 0, 25),
        new THREE.Vector3(-25, 0, 58)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-25, 0, 58),
        new THREE.Vector3(45, 0, 62),
        new THREE.Vector3(60, 0, 15)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(60, 0, 15),
        new THREE.Vector3(50, 0, -55),
        new THREE.Vector3(-10, 0, -56)
      ),
    ];

    // VÒNG 3: THÀNH NGOẠI (Giếng Ngọc & Bến Sông Hoàng Giang r=95m)
    const outerCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-90, 0, -80),
        new THREE.Vector3(-105, 0, 40),
        new THREE.Vector3(-40, 0, 95)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-40, 0, 95),
        new THREE.Vector3(75, 0, 100),
        new THREE.Vector3(98, 0, 25)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(98, 0, 25),
        new THREE.Vector3(85, 0, -90),
        new THREE.Vector3(-20, 0, -92)
      ),
    ];

    [...innerCurves, ...midCurves, ...outerCurves].forEach((curve) => {
      const extrudeSettings = { steps: 36, bevelEnabled: false, extrudePath: curve };
      const wallGeo = new THREE.ExtrudeGeometry(rampartShape, extrudeSettings);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.scene.add(wallMesh);
    });

    // 3. Hào nước sông Hoàng Giang bao bọc (Moat r=105m - 145m)
    const waterGeo = new THREE.RingGeometry(105, 145, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1d4345,
      roughness: 0.12,
      metalness: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.25;
    this.scene.add(waterMesh);
  }

  // --- CÂY XANH, RỪNG TRE NGÀ & LAU SẬY ĐẬM CHẤT LÀNG QUÊ VIỆT ---
  private buildFoliageAndAtmosphere() {
    const bambooTrunkMat = new THREE.MeshStandardMaterial({ color: 0x828a38, roughness: 0.6 });
    const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x476326, roughness: 0.5, side: THREE.DoubleSide });

    const createBambooCluster = (cx: number, cz: number, count: number) => {
      const group = new THREE.Group();
      group.position.set(cx, 0, cz);

      for (let i = 0; i < count; i++) {
        const bx = (Math.random() - 0.5) * 6;
        const bz = (Math.random() - 0.5) * 6;
        const height = 6.5 + Math.random() * 4.0;

        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, height, 6),
          bambooTrunkMat
        );
        stalk.position.set(bx, height / 2, bz);
        stalk.rotation.z = (Math.random() - 0.5) * 0.15;
        stalk.rotation.x = (Math.random() - 0.5) * 0.15;
        stalk.castShadow = true;
        group.add(stalk);

        for (let l = 0; l < 4; l++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.0, 4), bambooLeafMat);
          leaf.position.set(bx, height - 0.35 * l, bz);
          leaf.rotation.z = 0.8 * (l % 2 === 0 ? 1 : -1);
          group.add(leaf);
        }
      }
      this.scene.add(group);
    };

    createBambooCluster(-24, -10, 14);
    createBambooCluster(25, 12, 12);
    createBambooCluster(-38, 35, 16);
    createBambooCluster(42, -40, 15);
    createBambooCluster(-70, -20, 20);
    createBambooCluster(75, 50, 18);

    // Bãi Lau Sậy Bờ Nước Sông Hoàng Giang
    const reedMat = new THREE.MeshStandardMaterial({ color: 0xa89f68, roughness: 0.7 });
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const rx = Math.cos(angle) * 104;
      const rz = Math.sin(angle) * 104;

      const reedGroup = new THREE.Group();
      reedGroup.position.set(rx, 0, rz);

      for (let k = 0; k < 6; k++) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 2.6, 4), reedMat);
        stalk.position.set((Math.random() - 0.5) * 0.9, 1.3, (Math.random() - 0.5) * 0.9);
        stalk.rotation.z = (Math.random() - 0.5) * 0.2;
        reedGroup.add(stalk);
      }
      this.scene.add(reedGroup);
      this.animatedReeds.push(reedGroup);
    }

    // Hạt tàn lửa bay lơ lửng trong không khí (Sparks)
    const sparkCount = 140;
    const sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      this.sparkPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.sparkPositions[i * 3 + 1] = Math.random() * 10 + 0.5;
      this.sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa22,
      size: 0.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(this.sparkParticles);
  }

  // --- CHIẾN BINH ÂU LẠC 3D VÀ KHÍ TÀI PHÒNG THỦ ---
  private buildSoldiersAndDefenses() {
    const createWarrior = (x: number, z: number, rotationY: number) => {
      const warrior = new THREE.Group();
      warrior.position.set(x, 0, z);
      warrior.rotation.y = rotationY;

      const skinMat = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.7 });
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.8 });
      const bronzeArmorMat = new THREE.MeshStandardMaterial({
        map: this.textures.bronze,
        metalness: 0.8,
        roughness: 0.3,
      });

      const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.9, 6);
      const legL = new THREE.Mesh(legGeo, skinMat);
      legL.position.set(-0.16, 0.45, 0);
      warrior.add(legL);

      const legR = new THREE.Mesh(legGeo, skinMat);
      legR.position.set(0.16, 0.45, 0);
      warrior.add(legR);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.9, 8), clothMat);
      torso.position.y = 1.25;
      warrior.add(torso);

      const chestDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12), bronzeArmorMat);
      chestDisc.rotation.x = Math.PI / 2;
      chestDisc.position.set(0, 1.35, 0.22);
      warrior.add(chestDisc);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
      head.position.y = 1.85;
      warrior.add(head);

      const feather = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.45, 4),
        new THREE.MeshStandardMaterial({ color: 0xd43828 })
      );
      feather.position.set(0.1, 2.15, -0.05);
      feather.rotation.z = -0.3;
      warrior.add(feather);

      const spear = new THREE.Group();
      spear.position.set(0.35, 0.8, 0.15);
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a321d })
      );
      shaft.position.y = 0.6;
      spear.add(shaft);

      const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 4), bronzeArmorMat);
      spearHead.position.y = 2.1;
      spear.add(spearHead);
      warrior.add(spear);

      this.scene.add(warrior);
    };

    // Lính gác cổng thành Tây & Vọng Lâu
    createWarrior(-2.4, -6.5, 0);
    createWarrior(2.4, -6.5, 0);
    createWarrior(8.0, 18.0, -Math.PI / 3);
    createWarrior(-34.0, 12.0, Math.PI / 4);
    createWarrior(36.0, -18.0, -Math.PI / 2);

    this.buildWeaponRack(new THREE.Vector3(-4.5, 0, -4.5));
    this.buildWeaponRack(new THREE.Vector3(-18.0, 0, 14.0));
    this.buildSupplyCart(new THREE.Vector3(4.5, 0, -3.5));
    this.buildSupplyCart(new THREE.Vector3(-14.0, 0, 4.0));

    // Bãi cọc tre vạt nhọn phòng ngự ngoài bờ thành
    this.buildSpikeBarriers();
  }

  // Bãi cọc tre vạt nhọn chống kỵ binh
  private buildSpikeBarriers() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2a, roughness: 0.8 });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const x = Math.cos(angle) * 85;
      const z = Math.sin(angle) * 85;

      const cluster = new THREE.Group();
      cluster.position.set(x, 0, z);

      for (let k = 0; k < 4; k++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 1.8, 4), woodMat);
        spike.position.set((k - 1.5) * 0.4, 0.7, 0);
        spike.rotation.x = 0.35 * (k % 2 === 0 ? 1 : -1);
        spike.rotation.z = (Math.random() - 0.5) * 0.2;
        spike.castShadow = true;
        cluster.add(spike);
      }
      this.scene.add(cluster);
    }
  }

  private buildWeaponRack(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.7 });
    const bronzeMat = new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.8 });

    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), woodMat);
    post1.position.set(-0.8, 0.9, 0);
    group.add(post1);

    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), woodMat);
    post2.position.set(0.8, 0.9, 0);
    group.add(post2);

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), woodMat);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = 1.2;
    group.add(beam);

    for (let i = -1; i <= 1; i++) {
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16), bronzeMat);
      shield.rotation.x = Math.PI / 2;
      shield.position.set(i * 0.6, 0.65, 0.05);
      group.add(shield);
    }

    this.scene.add(group);
  }

  private buildSupplyCart(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = 0.4;

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.2), woodMat);
    bed.position.y = 0.65;
    group.add(bed);

    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12);
    const wheelL = new THREE.Mesh(wheelGeo, woodMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(0, 0.5, 0.7);
    group.add(wheelL);

    const wheelR = new THREE.Mesh(wheelGeo, woodMat);
    wheelR.rotation.z = Math.PI / 2;
    wheelR.position.set(0, 0.5, -0.7);
    group.add(wheelR);

    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.6, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.9 })
    );
    crate.position.set(-0.2, 1.0, 0);
    group.add(crate);

    this.scene.add(group);
  }

  // --- CÁC ĐỊA DANH LỊCH SỬ KHÁM PHÁ CHI TIẾT ---
  private buildLandmarks() {
    // 1. CỔNG THÀNH TÂY & ĐỐNG LỬA TRẠI TRUNG TÂM (Thành Nội)
    this.buildCampfire(new THREE.Vector3(0, 0, -3));
    const stele = this.buildAncientStele(new THREE.Vector3(3.8, 0, -1.8));

    // 2. LÒ RÈN VŨ KHÍ CAO LỖ (Thành Trung x: -28, z: 12)
    const foundry = this.buildBlacksmithFoundry(new THREE.Vector3(-28, 0, 12));

    // 3. ĐÀN TẾ THẦN KIM QUY (Thành Nội x: 18, z: -10)
    const shrine = this.buildSacredShrine(new THREE.Vector3(18, 0, -10));

    // 4. GIẾNG NGỌC TRỌNG THỦY - MỴ CHÂU (Thành Ngoại x: 48, z: -35)
    const well = this.buildSacredWell(new THREE.Vector3(48, 0, -35));

    // 5. BẾN THUYỀN CHIẾN SÔNG HOÀNG GIANG (Thành Ngoại x: -75, z: 65)
    this.buildBoatPier(new THREE.Vector3(-75, 0, 65));

    // 6. KHO MŨI TÊN ĐỒNG CẦU VỰC (Thành Trung x: -16, z: -32)
    this.buildArsenalVault(new THREE.Vector3(-16, 0, -32));

    this.interactableObjects.push({
      mesh: stele,
      id: 'STELE_AN_DUONG_VUONG',
      name: 'Bia Ký Thành Cổ Loa',
      prompt: '[E] Nghe Sử Ký: Hồi 1 - Vua Thục Xây Thành Cổ Loa',
      radius: 4.5,
      interactionPos: new THREE.Vector3(3.8, 1.7, -1.8),
    });

    this.interactableObjects.push({
      mesh: foundry,
      id: 'SMELTING_FOUNDRY_CAO_LO',
      name: 'Lò Nung & Đúc Tên Đồng Cao Lỗ',
      prompt: '[E] Quy Trình Luyện Kim 3 Giai Đoạn Đúc Tên Đồng',
      radius: 5.5,
      interactionPos: new THREE.Vector3(-28, 1.7, 12),
    });

    this.interactableObjects.push({
      mesh: shrine,
      id: 'ALTAR_GOLDEN_TURTLE',
      name: 'Đàn Tế Thần Kim Quy Hiển Linh',
      prompt: '[E] Nghe Sử Ký: Hồi 2 - Thần Kim Quy Ban Móng Rùa',
      radius: 5.0,
      interactionPos: new THREE.Vector3(18, 1.7, -10),
    });

    this.interactableObjects.push({
      mesh: well,
      id: 'DECOY_WELL_TRONG_THUY',
      name: 'Giếng Ngọc Trọng Thủy - Mỵ Châu',
      prompt: '[E] Khảo Sát Giếng Ngọc & Di Tích Lịch Sử',
      radius: 5.0,
      interactionPos: new THREE.Vector3(48, 1.7, -35),
    });
  }

  private buildCampfire(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), stoneMat);
      stone.position.set(Math.cos(angle) * 1.0, 0.18, Math.sin(angle) * 1.0);
      group.add(stone);
    }

    const fireMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff5500,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 6), fireMat);
    flameMesh.position.y = 0.7;
    group.add(flameMesh);

    const fireLight = new THREE.PointLight(0xff7700, 2.8, 16);
    fireLight.position.set(0, 1.2, 0);
    fireLight.castShadow = true;
    group.add(fireLight);
    this.torchLights.push({ light: fireLight, baseIntensity: 2.8, phase: Math.random() * Math.PI });

    this.scene.add(group);
  }

  // Bia đá An Dương Vương
  private buildAncientStele(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5c5852, roughness: 0.85 });
    const turtleBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.5, 8), stoneMat);
    turtleBase.position.y = 0.25;
    group.add(turtleBase);

    const steleBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 0.35), stoneMat);
    steleBody.position.y = 1.6;
    steleBody.castShadow = true;
    group.add(steleBody);

    const steleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.0, 8), stoneMat);
    steleCap.rotation.z = Math.PI / 2;
    steleCap.position.y = 3.0;
    group.add(steleCap);

    this.scene.add(group);
    return group;
  }

  // Lò rèn Cao Lỗ
  private buildBlacksmithFoundry(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x733d28, roughness: 0.9 });
    const kiln = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 3.2, 10), brickMat);
    kiln.position.y = 1.6;
    kiln.castShadow = true;
    group.add(kiln);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const kilnDoor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.3), glowMat);
    kilnDoor.position.set(0, 0.9, 1.8);
    group.add(kilnDoor);

    const fireLight = new THREE.PointLight(0xff4400, 3.8, 18);
    fireLight.position.set(0, 1.2, 2.0);
    group.add(fireLight);
    this.torchLights.push({ light: fireLight, baseIntensity: 3.8, phase: 0 });

    const ironMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.3 });
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 1.1), ironMat);
    anvil.position.set(2.4, 0.6, 1.5);
    anvil.castShadow = true;
    group.add(anvil);

    this.scene.add(group);
    return group;
  }

  // Đàn tế Thần Kim Quy
  private buildSacredShrine(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6e685f, roughness: 0.8 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.0, 0.6, 8), stoneMat);
    plinth.position.y = 0.3;
    group.add(plinth);

    const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 1.2, 16), stoneMat);
    altar.position.y = 1.2;
    group.add(altar);

    const bronzeMat = new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.85 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 0.7, 16), bronzeMat);
    drum.position.y = 2.0;
    group.add(drum);

    this.scene.add(group);
    return group;
  }

  // Giếng Ngọc Trọng Thủy - Mỵ Châu với Lầu Bát Giác Mái Cong Ngói Vảy
  private buildSacredWell(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5a554e, roughness: 0.9 });
    const wellCurb = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.0, 16), stoneMat);
    wellCurb.position.y = 0.5;
    wellCurb.castShadow = true;
    group.add(wellCurb);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x116666,
      roughness: 0.1,
      metalness: 0.4,
    });
    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.9, 16), waterMat);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.6;
    group.add(wellWater);

    // 4 Cột gỗ lim & Mái lầu ngói vảy cá
    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.7 });
    const tileMat = new THREE.MeshStandardMaterial({ map: this.textures.tile, roughness: 0.6 });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.6, 8), woodMat);
      col.position.set(Math.cos(angle) * 3.0, 1.8, Math.sin(angle) * 3.0);
      col.castShadow = true;
      group.add(col);
    }

    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.6, 8), tileMat);
    roof.position.y = 4.2;
    roof.castShadow = true;
    group.add(roof);

    this.scene.add(group);
    return group;
  }

  // Bến Thuyền Chiến Sông Hoàng Giang (Thuyền Độc Mộc Đông Sơn)
  private buildBoatPier(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    const pier = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.4, 4.0), woodMat);
    pier.position.y = 0.4;
    pier.castShadow = true;
    group.add(pier);

    // 2 Thuyền độc mộc Đông Sơn mũi cong chạm chim Lạc
    for (let i = -1; i <= 1; i += 2) {
      const boat = new THREE.Group();
      boat.position.set(i * 4.5, 0.1, 4.5);
      boat.rotation.y = Math.PI / 2;

      const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 8.0, 8), woodMat);
      hull.rotation.z = Math.PI / 2;
      boat.add(hull);

      const prow = new THREE.Mesh(
        new THREE.ConeGeometry(0.7, 2.0, 4),
        new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.8 })
      );
      prow.rotation.z = -Math.PI / 2;
      prow.position.x = 4.8;
      boat.add(prow);

      group.add(boat);
    }

    this.scene.add(group);
  }

  // Kho khí giới ngầm
  private buildArsenalVault(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4e4a44, roughness: 0.95 });
    const vault = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.2, 5.0), stoneMat);
    vault.position.y = 1.6;
    vault.castShadow = true;
    group.add(vault);

    const woodDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 0.2),
      new THREE.MeshStandardMaterial({ map: this.textures.wood })
    );
    woodDoor.position.set(0, 1.1, 2.5);
    group.add(woodDoor);

    this.scene.add(group);
  }

  // --- 3 MẢNH GHÉP CỔ VẬT CHÍNH (RELICS) ---
  private buildRelicPickups() {
    // 1. Thân Nỏ (Cạnh Lò Rèn Cao Lỗ x: -25, z: 10)
    if (!this.collectedShards.has('SHARD_CROSSBOW_STOCK')) {
      const stockMesh = this.createFloatingRelicIcon('SHARD_CROSSBOW_STOCK', new THREE.Vector3(-25, 1.2, 10));
      this.interactableObjects.push({
        mesh: stockMesh,
        id: 'SHARD_CROSSBOW_STOCK',
        name: 'Thân Nỏ Gỗ Quý Cổ Loa',
        prompt: '[E] Giải Mã Cơ Quan 4 Then Bánh Răng Lò Rèn',
        radius: 4.5,
        interactionPos: new THREE.Vector3(-25, 1.7, 10),
      });
    }

    // 2. Lẫy Móng Rùa Kim Quy (Tại Đàn Tế Hoa Sen x: 18, z: -10)
    if (!this.collectedShards.has('SHARD_TURTLE_TRIGGER')) {
      const triggerMesh = this.createFloatingRelicIcon('SHARD_TURTLE_TRIGGER', new THREE.Vector3(18, 2.4, -10));
      this.interactableObjects.push({
        mesh: triggerMesh,
        id: 'SHARD_TURTLE_TRIGGER',
        name: 'Lẫy Móng Rùa Kim Quy',
        prompt: '[E] Giải Mã Kỳ Trận Trống Đồng 3 Tầng Thiên Văn',
        radius: 4.5,
        interactionPos: new THREE.Vector3(18, 1.7, -10),
      });
    }

    // 3. Ống Tên Đồng Cầu Vực (Tại Kho Binh Khí x: -16, z: -30)
    if (!this.collectedShards.has('SHARD_BRONZE_ARROWS')) {
      const arrowMesh = this.createFloatingRelicIcon('SHARD_BRONZE_ARROWS', new THREE.Vector3(-16, 1.2, -30));
      this.interactableObjects.push({
        mesh: arrowMesh,
        id: 'SHARD_BRONZE_ARROWS',
        name: 'Ống Tên Đồng Ba Cạnh Cầu Vực',
        prompt: '[E] Khảo Sát & Giải Mã Mật Thư Thẻ Tre Khảo Cổ',
        radius: 4.5,
        interactionPos: new THREE.Vector3(-16, 1.7, -30),
      });
    }
  }

  // Biểu tượng cổ vật lơ lửng phát sáng
  private createFloatingRelicIcon(_relicId: CoLoaRelicId, pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);

    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.7, 16), haloMat);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    const relicMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xff9900,
      emissiveIntensity: 0.4,
    });
    const iconCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), relicMat);
    iconCore.position.y = 0.3;
    group.add(iconCore);

    const light = new THREE.PointLight(0xffaa00, 2.5, 8);
    light.position.y = 0.5;
    group.add(light);

    this.scene.add(group);
    return group;
  }

  // --- CÁC HÒM NGHI BINH & MANH MỐI LỊCH SỬ ---
  private buildDecoyPickups() {
    const createDecoyChest = (id: string, name: string, prompt: string, pos: THREE.Vector3) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      const chestMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.6), chestMat);
      base.position.y = 0.3;
      base.castShadow = true;
      group.add(base);

      const lidMat = new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.7 });
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 8), lidMat);
      lid.rotation.z = Math.PI / 2;
      lid.position.y = 0.6;
      group.add(lid);

      this.scene.add(group);

      this.interactableObjects.push({
        mesh: group,
        id,
        name,
        prompt,
        radius: 4.0,
        interactionPos: new THREE.Vector3(pos.x, 1.7, pos.z),
      });
    };

    createDecoyChest(
      'DECOY_IRON_ARROWS',
      'Rương Mũi Tên Sắt Rỉ Sét',
      '[E] Khảo Sát Hiện Vật Thời Đồ Sắt',
      new THREE.Vector3(12, 0, 8)
    );

    createDecoyChest(
      'DECOY_SILK_QUIVER',
      'Hòm Ống Tên Thêu Gấm Nhà Hán',
      '[E] Kiểm Tra Dấu Vết Quân Xâm Lược',
      new THREE.Vector3(-8, 0, 16)
    );

    createDecoyChest(
      'DECOY_GOLDEN_BOW',
      'Cung Gỗ Khảm Vàng Cung Đình',
      '[E] Phân Biệt Cung Thông Thường & Nỏ Thần',
      new THREE.Vector3(26, 0, -18)
    );
  }

  // --- ĐÀI BẮN NỎ THẦN & VỌNG LÂU TRÊN BỜ THÀNH NAM ---
  private buildCrossbowStation() {
    const stationGroup = new THREE.Group();
    // Đặt tại bờ thành Nam x: 0, z: 22
    stationGroup.position.set(0, 0, 22);

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });

    // Sàn gỗ trên mặt thành cao 3.5m
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.4, 7.0), woodMat);
    deck.position.y = 3.5;
    deck.castShadow = true;
    stationGroup.add(deck);

    // Cầu thang dốc thoải từ z: 14 đến z: 22
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 8.5), woodMat);
    ramp.position.set(0, 1.75, -4.2);
    ramp.rotation.x = -Math.atan2(3.5, 8.0);
    ramp.castShadow = true;
    stationGroup.add(ramp);

    // Lan can bảo vệ
    const railMat = new THREE.MeshStandardMaterial({ color: 0x4a3420 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 7.0), railMat);
    railL.position.set(-3.4, 4.2, 0);
    stationGroup.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 7.0), railMat);
    railR.position.set(3.4, 4.2, 0);
    stationGroup.add(railR);

    // Giá đỡ Nỏ Thần
    this.crossbowStand = new THREE.Group();
    this.crossbowStand.position.set(0, 3.7, 1.5);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.1, 8), woodMat);
    pillar.position.y = 0.55;
    this.crossbowStand.add(pillar);

    // Nỏ Thần Hoàn Chỉnh (Linh Quang Kim Trảo Thần Nỏ)
    this.assembledCrossbowMesh = new THREE.Group();
    this.assembledCrossbowMesh.position.set(0, 1.2, 0);

    const bronzeMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.85,
      roughness: 0.25,
    });

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 2.2), woodMat);
    stock.position.z = -0.3;
    this.assembledCrossbowMesh.add(stock);

    const bowArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.8, 8), bronzeMat);
    bowArmL.rotation.z = Math.PI / 3;
    bowArmL.position.set(-0.8, 0, 0.7);
    this.assembledCrossbowMesh.add(bowArmL);

    const bowArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.8, 8), bronzeMat);
    bowArmR.rotation.z = -Math.PI / 3;
    bowArmR.position.set(0.8, 0, 0.7);
    this.assembledCrossbowMesh.add(bowArmR);

    // Lẫy móng rùa vàng
    const claw = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.45, 4),
      new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xff9900, emissiveIntensity: 0.6 })
    );
    claw.position.set(0, 0.18, -0.4);
    this.assembledCrossbowMesh.add(claw);

    this.assembledCrossbowMesh.visible = false;
    this.crossbowStand.add(this.assembledCrossbowMesh);
    stationGroup.add(this.crossbowStand);

    this.scene.add(stationGroup);

    this.interactableObjects.push({
      mesh: this.crossbowStand,
      id: 'STATION_CROSSBOW',
      name: 'Vọng Lâu & Đài Nỏ Thần Cổ Loa',
      prompt: '[E] Lắp Ráp & Kích Hoạt Nỏ Thần Liên Châu',
      radius: 4.8,
      interactionPos: new THREE.Vector3(0, 5.2, 23.0),
    });
  }

  // --- 5 MỤC TIÊU BÈ THUYỀN CHIẾN GIẶC TRÊN SÔNG HOÀNG GIANG ---
  private buildEnemyTargets() {
    const targetMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.9 });
    const flagMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });

    const targetPositions = [
      new THREE.Vector3(-24, 0.3, 115),
      new THREE.Vector3(-10, 0.3, 125),
      new THREE.Vector3(8, 0.3, 120),
      new THREE.Vector3(26, 0.3, 128),
      new THREE.Vector3(42, 0.3, 118),
    ];

    targetPositions.forEach((pos) => {
      const boatGroup = new THREE.Group();
      boatGroup.position.copy(pos);

      // Thân bè mảng gỗ
      const raft = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.5, 3.2), targetMat);
      raft.position.y = 0.25;
      raft.castShadow = true;
      boatGroup.add(raft);

      // Khiên giáp & bia ngắm
      const shield = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.0, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 })
      );
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0, 1.4, 0);
      boatGroup.add(shield);

      // Tâm hồng tâm màu đỏ
      const bullseye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0xd92626 })
      );
      bullseye.rotation.x = Math.PI / 2;
      bullseye.position.set(0, 1.4, 0.05);
      boatGroup.add(bullseye);

      // Cờ hiệu giặc Nam Việt
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6), targetMat);
      flagPole.position.set(-2.2, 1.6, 0);
      boatGroup.add(flagPole);

      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.04), flagMat);
      flag.position.set(-1.4, 2.6, 0);
      boatGroup.add(flag);
      this.animatedBanners.push(flag);

      this.scene.add(boatGroup);
      this.targetPavilions.push({ group: boatGroup, hit: false, position: pos });
    });
  }

  // --- HỆ THỐNG VA CHẠM VẬT LÝ THỰC TẾ CHỐNG ĐI XUYÊN TƯỜNG & ĐỒ VẬT ---
  private buildSceneColliders() {
    this.sceneColliders = [];

    const addCircle = (x: number, z: number, radius: number, name?: string) => {
      this.sceneColliders.push({ type: 'circle', x, z, radius, name });
    };
    const addBox = (minX: number, maxX: number, minZ: number, maxZ: number, name?: string) => {
      this.sceneColliders.push({ type: 'box', minX, maxX, minZ, maxZ, name });
    };

    // 1. Địa danh lịch sử & công trình trọng yếu Thành Cổ Loa
    addCircle(0, -3.0, 1.4, 'Campfire');
    addCircle(3.8, -1.8, 1.5, 'Stele An Duong Vuong');
    addCircle(-28.0, 12.0, 3.8, 'Cao Lo Foundry');
    addCircle(-25.6, 13.5, 1.4, 'Anvil');
    addCircle(18.0, -10.0, 3.4, 'Kim Quy Shrine');
    addCircle(48.0, -35.0, 3.6, 'Trong Thuy Well');
    addBox(-19.5, -12.5, -35.0, -29.0, 'Arsenal Vault');
    addBox(-82.0, -68.0, 63.0, 67.0, 'Boat Pier');
    addCircle(-79.5, 69.5, 2.2, 'Boat 1');
    addCircle(-70.5, 69.5, 2.2, 'Boat 2');

    // 2. Chân Trụ Vọng Lâu Bờ Thành Phía Nam
    addCircle(3.0, 18.5, 1.0, 'Tower Pillar SE');
    addCircle(-3.0, 18.5, 1.0, 'Tower Pillar SW');
    addCircle(3.0, 25.5, 1.0, 'Tower Pillar NE');
    addCircle(-3.0, 25.5, 1.0, 'Tower Pillar NW');

    // 3. Khí giới & Quân nhu & Xe vận tải
    addCircle(-4.5, -4.5, 1.2, 'Weapon Rack 1');
    addCircle(-18.0, 14.0, 1.2, 'Weapon Rack 2');
    addCircle(4.5, -3.5, 1.6, 'Supply Cart 1');
    addCircle(-14.0, 4.0, 1.6, 'Supply Cart 2');

    // 4. Lính gác Âu Lạc
    addCircle(-2.4, -6.5, 0.8, 'Guard West Gate L');
    addCircle(2.4, -6.5, 0.8, 'Guard West Gate R');
    addCircle(8.0, 18.0, 0.8, 'Guard Tower Gate');
    addCircle(-34.0, 12.0, 0.8, 'Guard Foundry Gate');
    addCircle(36.0, -18.0, 0.8, 'Guard East Outpost');

    // 5. Bụi tre ngà đại thụ
    addCircle(-24, -10, 3.0, 'Bamboo Grove 1');
    addCircle(25, 12, 3.0, 'Bamboo Grove 2');
    addCircle(-38, 35, 3.0, 'Bamboo Grove 3');
    addCircle(42, -40, 3.0, 'Bamboo Grove 4');
    addCircle(-70, -20, 3.5, 'Bamboo Grove 5');
    addCircle(75, 50, 3.5, 'Bamboo Grove 6');

    // 6. Bãi cọc tre vạt nhọn chống kỵ binh
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const x = Math.cos(angle) * 85;
      const z = Math.sin(angle) * 85;
      addCircle(x, z, 1.5, `Spike Barrier ${i}`);
    }

    // 7. Lũy đất 3 vòng nện đất Cổ Loa (Đắp đất cao 4.2m)
    const sampleCurves = [
      // THÀNH NỘI: r ~ 26m
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-24, 0, -22), new THREE.Vector3(-30, 0, 12), new THREE.Vector3(-10, 0, 26)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-10, 0, 26), new THREE.Vector3(22, 0, 28), new THREE.Vector3(28, 0, 4)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(28, 0, 4), new THREE.Vector3(22, 0, -26), new THREE.Vector3(-4, 0, -26)),
      // THÀNH TRUNG: r ~ 58m
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-52, 0, -45), new THREE.Vector3(-66, 0, 25), new THREE.Vector3(-25, 0, 58)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-25, 0, 58), new THREE.Vector3(45, 0, 62), new THREE.Vector3(60, 0, 15)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(60, 0, 15), new THREE.Vector3(50, 0, -55), new THREE.Vector3(-10, 0, -56)),
      // THÀNH NGOẠI: r ~ 95m
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-90, 0, -80), new THREE.Vector3(-105, 0, 40), new THREE.Vector3(-40, 0, 95)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-40, 0, 95), new THREE.Vector3(75, 0, 100), new THREE.Vector3(98, 0, 25)),
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(98, 0, 25), new THREE.Vector3(85, 0, -90), new THREE.Vector3(-20, 0, -92)),
    ];

    sampleCurves.forEach((curve, cIdx) => {
      const stepCount = 20;
      for (let s = 0; s <= stepCount; s++) {
        const pt = curve.getPoint(s / stepCount);

        // Chừa lối đi cho các cửa thành thông thoáng
        const isSouthRampToTower = Math.abs(pt.x) < 4.5 && pt.z > 12.0 && pt.z < 26.0;
        const isThanhNoiWestGate = pt.x < -18.0 && pt.x > -32.0 && Math.abs(pt.z) < 6.0;
        const isThanhNoiEastGate = pt.x > 14.0 && pt.x < 30.0 && pt.z > -16.0 && pt.z < -4.0;
        const isThanhNoiNorthGate = Math.abs(pt.x) < 5.0 && pt.z < -18.0;

        const isThanhTrungWest = pt.x < -48.0 && pt.x > -68.0 && Math.abs(pt.z) < 9.0;
        const isThanhTrungEast = pt.x > 45.0 && pt.x < 65.0 && Math.abs(pt.z) < 9.0;
        const isThanhTrungNorth = Math.abs(pt.x) < 8.0 && pt.z < -45.0;
        const isThanhTrungSouth = Math.abs(pt.x) < 8.0 && pt.z > 45.0;

        const isThanhNgoaiWellPath = pt.x > 38.0 && pt.x < 60.0 && pt.z < -25.0 && pt.z > -45.0;
        const isThanhNgoaiPierPath = pt.x < -65.0 && pt.x > -88.0 && pt.z > 50.0 && pt.z < 76.0;
        const isThanhNgoaiSouthGate = Math.abs(pt.x) < 12.0 && pt.z > 85.0;

        const isGate =
          isSouthRampToTower ||
          isThanhNoiWestGate ||
          isThanhNoiEastGate ||
          isThanhNoiNorthGate ||
          isThanhTrungWest ||
          isThanhTrungEast ||
          isThanhTrungNorth ||
          isThanhTrungSouth ||
          isThanhNgoaiWellPath ||
          isThanhNgoaiPierPath ||
          isThanhNgoaiSouthGate;

        if (!isGate) {
          addCircle(pt.x, pt.z, 2.7, `Rampart Wall ${cIdx}-${s}`);
        }
      }
    });
  }

  // --- GIẢI QUYẾT VA CHẠM VẬT LÝ VỚI MÔI TRƯỜNG (CHỐNG ĐI XUYÊN TƯỜNG / ĐỒ VẬT) ---
  private resolvePlayerCollisions(candidateX: number, candidateZ: number): { x: number; z: number } {
    let px = candidateX;
    let pz = candidateZ;
    const playerRadius = 0.52;

    // 2-pass collision resolution cho phép trượt mượt mà dọc theo góc và tường cong
    for (let pass = 0; pass < 2; pass++) {
      for (const col of this.sceneColliders) {
        if (col.type === 'circle' && col.x !== undefined && col.z !== undefined && col.radius !== undefined) {
          const dx = px - col.x;
          const dz = pz - col.z;
          const distSq = dx * dx + dz * dz;
          const minDist = col.radius + playerRadius;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const push = minDist - dist;
              px += (dx / dist) * push;
              pz += (dz / dist) * push;
            } else {
              px += minDist;
            }
          }
        } else if (col.type === 'box' && col.minX !== undefined && col.maxX !== undefined && col.minZ !== undefined && col.maxZ !== undefined) {
          const expMinX = col.minX - playerRadius;
          const expMaxX = col.maxX + playerRadius;
          const expMinZ = col.minZ - playerRadius;
          const expMaxZ = col.maxZ + playerRadius;
          if (px > expMinX && px < expMaxX && pz > expMinZ && pz < expMaxZ) {
            const dLeft = px - expMinX;
            const dRight = expMaxX - px;
            const dTop = pz - expMinZ;
            const dBottom = expMaxZ - pz;
            const minD = Math.min(dLeft, dRight, dTop, dBottom);
            if (minD === dLeft) px = expMinX;
            else if (minD === dRight) px = expMaxX;
            else if (minD === dTop) pz = expMinZ;
            else pz = expMaxZ;
          }
        }
      }

      // Giới hạn bờ sông Hoàng Giang (Moat Boundary): Không cho rơi xuống nước sâu
      const distFromCenter = Math.hypot(px, pz);
      if (distFromCenter > 102) {
        const angle = Math.atan2(pz, px);
        px = Math.cos(angle) * 102;
        pz = Math.sin(angle) * 102;
      }
    }

    return { x: px, z: pz };
  }

  // --- MÔ HÌNH NHÂN VẬT TƯỚNG SĨ XẠ THỦ ÂU LẠC 3D (ĐẬM CHẤT VĂN HÓA ĐÔNG SƠN) ---
  private buildPlayerCharacter() {
    this.playerCharacterMesh = new THREE.Group();

    // Vật liệu chuẩn PBR mỹ thuật Đông Sơn
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x9e6840,
      roughness: 0.65,
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.85,
      roughness: 0.28,
    });
    const armorPlateMat = new THREE.MeshStandardMaterial({
      map: this.textures.warriorArmor,
      metalness: 0.88,
      roughness: 0.22,
    });
    const kiltMat = new THREE.MeshStandardMaterial({
      map: this.textures.warriorKilt,
      roughness: 0.9,
    });
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x3b2414,
      roughness: 0.8,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const featherRed = new THREE.MeshStandardMaterial({ color: 0xd92626, roughness: 0.5 });
    const featherGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const featherWhite = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.5 });

    // 1. THÂN TRÊN & TẤM HỘ TÂM PHIẾN ĐỒNG MẶT TRỜI ĐÔNG SƠN
    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.23, 0.78, 12),
      leatherMat
    );
    torsoMesh.position.y = 1.15;
    torsoMesh.castShadow = true;
    this.playerCharacterMesh.add(torsoMesh);

    // Tấm che ngực bằng đồng (Hộ Tâm Phiến) khắc mặt trời 14 tia & chim Lạc sải cánh
    const chestPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24),
      armorPlateMat
    );
    chestPlate.rotation.x = Math.PI / 2;
    chestPlate.position.set(0, 1.25, 0.17);
    chestPlate.castShadow = true;
    this.playerCharacterMesh.add(chestPlate);

    // Núm vàng bảo hộ trung tâm tấm hộ tâm phiến
    const chestBoss = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), goldMat);
    chestBoss.position.set(0, 1.25, 0.22);
    this.playerCharacterMesh.add(chestBoss);

    // Tấm giáp lưng đồng
    const backPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.06, 16),
      bronzeMat
    );
    backPlate.rotation.x = Math.PI / 2;
    backPlate.position.set(0, 1.25, -0.16);
    this.playerCharacterMesh.add(backPlate);

    // Dây đai da bắt chéo lưng và ngực giữ giáp
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.70, 0.32), leatherMat);
    strapL.rotation.z = 0.4;
    strapL.position.set(0, 1.22, 0);
    this.playerCharacterMesh.add(strapL);

    const strapR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.70, 0.32), leatherMat);
    strapR.rotation.z = -0.4;
    strapR.position.set(0, 1.22, 0);
    this.playerCharacterMesh.add(strapR);

    // Tấm Hộ Giáp Vai Hai Bên (Pauldrons)
    const pauldronGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.16, 8);
    const pauldronL = new THREE.Mesh(pauldronGeo, bronzeMat);
    pauldronL.position.set(-0.35, 1.48, 0);
    pauldronL.rotation.z = 0.3;
    this.playerCharacterMesh.add(pauldronL);

    const pauldronR = new THREE.Mesh(pauldronGeo, bronzeMat);
    pauldronR.position.set(0.35, 1.48, 0);
    pauldronR.rotation.z = -0.3;
    this.playerCharacterMesh.add(pauldronR);

    // 2. THẮT LƯNG & KHỐ CHIẾN BINH ĐÔNG SƠN
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16), leatherMat);
    belt.position.y = 0.82;
    this.playerCharacterMesh.add(belt);

    // Khóa thắt lưng bằng đồng hình rùa thiêng
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.05), goldMat);
    buckle.position.set(0, 0.82, 0.27);
    this.playerCharacterMesh.add(buckle);

    // Vạt khố trước thổ cẩm hoa văn hình thoi Đông Sơn
    const frontKilt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.52, 0.04), kiltMat);
    frontKilt.position.set(0, 0.58, 0.17);
    this.playerCharacterMesh.add(frontKilt);

    // Vạt khố sau
    const backKilt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.04), kiltMat);
    backKilt.position.set(0, 0.60, -0.17);
    this.playerCharacterMesh.add(backKilt);

    // 3. CHÂN & GIÁP ỐNG CHÂN (GREAVES)
    // Chân Trái
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.82, 0);

    const thighGeo = new THREE.CylinderGeometry(0.10, 0.085, 0.44, 8);
    const thighL = new THREE.Mesh(thighGeo, skinMat);
    thighL.position.y = -0.22;
    thighL.castShadow = true;
    this.leftLeg.add(thighL);

    const kneeL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8), bronzeMat);
    kneeL.rotation.x = Math.PI / 2;
    kneeL.position.set(0, -0.42, 0.07);
    this.leftLeg.add(kneeL);

    const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.40, 8), bronzeMat);
    shinL.position.y = -0.62;
    shinL.castShadow = true;
    this.leftLeg.add(shinL);

    const footL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.22), leatherMat);
    footL.position.set(0, -0.82, 0.04);
    this.leftLeg.add(footL);

    this.playerCharacterMesh.add(this.leftLeg);

    // Chân Phải
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.82, 0);

    const thighR = new THREE.Mesh(thighGeo, skinMat);
    thighR.position.y = -0.22;
    thighR.castShadow = true;
    this.rightLeg.add(thighR);

    const kneeR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8), bronzeMat);
    kneeR.rotation.x = Math.PI / 2;
    kneeR.position.set(0, -0.42, 0.07);
    this.rightLeg.add(kneeR);

    const shinR = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.40, 8), bronzeMat);
    shinR.position.y = -0.62;
    shinR.castShadow = true;
    this.rightLeg.add(shinR);

    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.22), leatherMat);
    footR.position.set(0, -0.82, 0.04);
    this.rightLeg.add(footR);

    this.playerCharacterMesh.add(this.rightLeg);

    // 4. CÁNH TAY & BAO CỔ TAY ĐỒNG & DAO GĂM ĐÔNG SƠN
    // Tay Trái
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.35, 1.45, 0);

    const bicepGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.32, 8);
    const bicepL = new THREE.Mesh(bicepGeo, skinMat);
    bicepL.position.y = -0.16;
    this.leftArm.add(bicepL);

    const armVambraceL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.28, 8), bronzeMat);
    armVambraceL.position.y = -0.42;
    this.leftArm.add(armVambraceL);

    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.09), skinMat);
    handL.position.set(0, -0.58, 0);
    this.leftArm.add(handL);

    this.playerCharacterMesh.add(this.leftArm);

    // Tay Phải Cầm Dao Găm Đồng Chuôi Hình Người Đông Sơn
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.35, 1.45, 0);

    const bicepR = new THREE.Mesh(bicepGeo, skinMat);
    bicepR.position.y = -0.16;
    this.rightArm.add(bicepR);

    const armVambraceR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.28, 8), bronzeMat);
    armVambraceR.position.y = -0.42;
    this.rightArm.add(armVambraceR);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.09), skinMat);
    handR.position.set(0, -0.58, 0);
    this.rightArm.add(handR);

    // Dao Găm Chuôi Hình Người Đặc Trưng Đông Sơn
    const daggerGroup = new THREE.Group();
    daggerGroup.position.set(0, -0.62, 0.05);
    daggerGroup.rotation.x = Math.PI / 4;

    const daggerHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), goldMat);
    daggerGroup.add(daggerHilt);

    const daggerCrossguard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.04), goldMat);
    daggerCrossguard.position.y = 0.08;
    daggerGroup.add(daggerCrossguard);

    const daggerBlade = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.36, 4), bronzeMat);
    daggerBlade.position.y = 0.25;
    daggerGroup.add(daggerBlade);

    this.rightArm.add(daggerGroup);
    this.playerCharacterMesh.add(this.rightArm);

    // 5. ĐẦU & BÚI TÓC CỦ HÀNH & MŨ LÔNG CHIM LẠC HOÀNG GIA (5 TẦNG LÔNG)
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.55;

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.16, 8), skinMat);
    neck.position.y = 0.08;
    headGroup.add(neck);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), skinMat);
    headMesh.position.y = 0.22;
    headGroup.add(headMesh);

    // Mắt & Lông mày chiến binh
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.02), eyeMat);
    eyeL.position.set(-0.06, 0.24, 0.15);
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.02), eyeMat);
    eyeR.position.set(0.06, 0.24, 0.15);
    headGroup.add(eyeR);

    // Hoa tai đồng tròn
    const earringL = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), goldMat);
    earringL.position.set(-0.165, 0.21, 0);
    earringL.rotation.y = Math.PI / 2;
    headGroup.add(earringL);

    const earringR = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), goldMat);
    earringR.position.set(0.165, 0.21, 0);
    earringR.rotation.y = Math.PI / 2;
    headGroup.add(earringR);

    // Búi tóc củ hành cổ truyền thời An Dương Vương
    const hairBunMat = new THREE.MeshStandardMaterial({ color: 0x1c130d, roughness: 0.9 });
    const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), hairBunMat);
    hairBun.position.set(0, 0.38, -0.06);
    headGroup.add(hairBun);

    // Vòng trán bằng đồng chạm nổi hoa văn răng cưa
    const browBand = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.045, 16), goldMat);
    browBand.position.y = 0.28;
    headGroup.add(browBand);

    // Mũ Lông Chim Lạc Hoàng Gia (5 Lông Chim Xòe Đuôi Quạt Hùng Dũng)
    const featherCenter = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.65, 4), featherRed);
    featherCenter.position.set(0, 0.60, -0.08);
    featherCenter.rotation.x = -0.22;
    headGroup.add(featherCenter);

    const featherInnerL = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.55, 4), featherGold);
    featherInnerL.position.set(-0.06, 0.54, -0.07);
    featherInnerL.rotation.x = -0.24;
    featherInnerL.rotation.z = 0.18;
    headGroup.add(featherInnerL);

    const featherInnerR = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.55, 4), featherGold);
    featherInnerR.position.set(0.06, 0.54, -0.07);
    featherInnerR.rotation.x = -0.24;
    featherInnerR.rotation.z = -0.18;
    headGroup.add(featherInnerR);

    const featherOuterL = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.44, 4), featherWhite);
    featherOuterL.position.set(-0.11, 0.48, -0.06);
    featherOuterL.rotation.x = -0.26;
    featherOuterL.rotation.z = 0.32;
    headGroup.add(featherOuterL);

    const featherOuterR = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.44, 4), featherWhite);
    featherOuterR.position.set(0.11, 0.48, -0.06);
    featherOuterR.rotation.x = -0.26;
    featherOuterR.rotation.z = -0.32;
    headGroup.add(featherOuterR);

    this.playerCharacterMesh.add(headGroup);

    // 6. TRANG BỊ SAU LƯNG: ỐNG TÊN ĐỒNG CẦU VỰC & CUNG GỖ SƠN SON
    const backGear = new THREE.Group();
    backGear.position.set(0, 1.25, -0.22);
    backGear.rotation.z = -0.35; // Đeo chéo lưng chiến binh

    // Ống tên đồng
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.72, 8), bronzeMat);
    quiver.position.y = -0.05;
    quiver.castShadow = true;
    backGear.add(quiver);

    // 5 Mũi tên đồng ba cạnh Cổ Loa nhô ra từ ống tên
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x4a321d });
    for (let i = 0; i < 5; i++) {
      const arrowGroup = new THREE.Group();
      arrowGroup.position.set((i - 2) * 0.025, 0.38 + (i % 2) * 0.05, 0);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), shaftMat);
      arrowGroup.add(shaft);

      const fletching = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), featherRed);
      fletching.position.y = 0.12;
      arrowGroup.add(fletching);

      backGear.add(arrowGroup);
    }

    // Cung gỗ sơn son đeo chéo
    const bowWoodMat = new THREE.MeshStandardMaterial({ color: 0x822115, roughness: 0.6 });
    const bowCurve = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.025, 8, 20, Math.PI * 0.75), bowWoodMat);
    bowCurve.position.set(-0.15, 0, -0.06);
    bowCurve.rotation.y = Math.PI / 2;
    bowCurve.rotation.z = 0.6;
    backGear.add(bowCurve);

    this.playerCharacterMesh.add(backGear);

    // Bóng đổ giả dưới chân (Giúp tiếp đất thị giác chân thực)
    const shadowGeo = new THREE.CircleGeometry(0.65, 18);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    this.playerCharacterMesh.add(shadowMesh);

    this.scene.add(this.playerCharacterMesh);
  }

  // --- MÔ HÌNH NỎ THẦN CẦM TAY GÓC NHÌN THỨ NHẤT (FPS WEAPON VIEWMODEL) ---
  private buildFpsViewModel() {
    this.fpsCrossbowMesh = new THREE.Group();
    // Đặt nỏ ở góc dưới bên phải màn hình camera
    this.fpsCrossbowMesh.position.set(0.24, -0.22, -0.5);

    const bronzeMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.85,
      roughness: 0.3,
    });
    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.7 });

    // Khung nỏ gỗ lim
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.6), woodMat);
    stock.position.z = 0.15;
    this.fpsCrossbowMesh.add(stock);

    // Cánh nỏ đồng phía trước
    const bowArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), bronzeMat);
    bowArm.position.z = -0.12;
    this.fpsCrossbowMesh.add(bowArm);

    // Lẫy nỏ đồng & đầu ngắm chim Lạc
    const sight = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4), bronzeMat);
    sight.position.set(0, 0.07, -0.12);
    this.fpsCrossbowMesh.add(sight);

    // Tay áo lụa chàm của xạ thủ Âu Lạc
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.85 })
    );
    sleeve.rotation.x = Math.PI / 3;
    sleeve.position.set(0.05, -0.15, 0.25);
    this.fpsCrossbowMesh.add(sleeve);

    this.camera.add(this.fpsCrossbowMesh);
    this.scene.add(this.camera);

    // Mặc định ban đầu ở Third Person nên ẩn FPS ViewModel
    this.fpsCrossbowMesh.visible = false;
  }

  public toggleCameraMode(): 'FIRST_PERSON' | 'THIRD_PERSON' {
    this.cameraMode = this.cameraMode === 'FIRST_PERSON' ? 'THIRD_PERSON' : 'FIRST_PERSON';
    sound.playClick();
    if (this.callbacks.onCameraModeChange) {
      this.callbacks.onCameraModeChange(this.cameraMode);
    }
    return this.cameraMode;
  }

  public getCameraMode(): 'FIRST_PERSON' | 'THIRD_PERSON' {
    return this.cameraMode;
  }

  public setCameraMode(mode: 'FIRST_PERSON' | 'THIRD_PERSON') {
    this.cameraMode = mode;
    if (this.callbacks.onCameraModeChange) {
      this.callbacks.onCameraModeChange(this.cameraMode);
    }
  }

  // --- CONTROLLER & EVENT LISTENERS (HỖ TRỢ CẢ POINTER LOCK LẪN MOUSE DRAG) ---
  private setupEventListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse Listeners
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);

    // Pointer Lock change
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    // Touch Listeners for Mobile
    this.renderer.domElement.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.renderer.domElement.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.renderer.domElement.addEventListener('touchend', this.onTouchEnd, { passive: false });

    window.addEventListener('resize', this.onWindowResize);
  }

  private onMouseDown = (e: MouseEvent) => {
    // Chỉ kích hoạt khi click vào chính canvas WebGL
    if (e.target !== this.renderer.domElement) return;

    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    // Yêu cầu Pointer Lock nếu chưa có
    if (!this.isPointerLocked) {
      this.renderer.domElement.requestPointerLock().catch(() => {
        // Trình duyệt không cho phép hoặc bị chặn - vẫn xoay được 100% nhờ Mouse Drag!
      });
    }
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };

  private onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
  };

  private onMouseMove = (e: MouseEvent) => {
    let deltaX = 0;
    let deltaY = 0;

    if (this.isPointerLocked) {
      deltaX = e.movementX;
      deltaY = e.movementY;
    } else if (this.isMouseDown) {
      deltaX = e.clientX - this.lastMouseX;
      deltaY = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    } else {
      return;
    }

    const sens = 0.0024;
    this.targetYaw -= deltaX * sens;
    this.targetPitch -= deltaY * sens;
    // Giới hạn góc ngẩng / cúi
    this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;

    if (e.code === 'KeyE') {
      this.handleInteractKey();
    }
    if (e.code === 'KeyV') {
      this.toggleCameraMode();
    }
    if (e.code === 'Space' && this.isAimingCrossbow) {
      this.fireCrossbow();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onTouchStart = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.clientX > window.innerWidth * 0.4 && this.touchLookId === null) {
        this.touchLookId = touch.identifier;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
      }
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchLookId) {
        const dx = touch.clientX - this.lastTouchX;
        const dy = touch.clientY - this.lastTouchY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;

        const touchSens = 0.004;
        this.targetYaw -= dx * touchSens;
        this.targetPitch -= dy * touchSens;
        this.targetPitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.targetPitch));
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.touchLookId) {
        this.touchLookId = null;
      }
    }
  };

  public setMobileMoveVector(x: number, y: number) {
    this.mobileMoveVector = { x, y };
  }

  // --- TƯƠNG TÁC THẾ GIỚI 3D ---
  public handleInteractKey() {
    if (!this.currentHoveredId) return;

    // Thoát Pointer Lock ngay lập tức khi mở modal giao diện
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // 0. Tương tác với các địa danh lịch sử / Lò rèn / Đền tế / Bia đá / Giếng Ngọc
    if (this.currentHoveredId === 'SMELTING_FOUNDRY_CAO_LO') {
      if (this.callbacks.onOpenSmelting) this.callbacks.onOpenSmelting();
      return;
    }
    if (this.currentHoveredId === 'STELE_AN_DUONG_VUONG') {
      if (this.callbacks.onOpenNarration) this.callbacks.onOpenNarration('ACT_1_BUILD_CITADEL');
      return;
    }
    if (this.currentHoveredId === 'ALTAR_GOLDEN_TURTLE') {
      if (this.callbacks.onOpenNarration) this.callbacks.onOpenNarration('ACT_2_KIM_QUY_MEMENTO');
      return;
    }
    if (this.currentHoveredId === 'DECOY_WELL_TRONG_THUY') {
      this.callbacks.onInspectDecoy('DECOY_WELL_TRONG_THUY');
      return;
    }

    // 1. Tương tác Vọng Lâu Đài Nỏ Thần
    if (this.currentHoveredId === 'STATION_CROSSBOW') {
      if (this.collectedShards.size < 3) {
        this.callbacks.onCrossbowReadyToAssemble();
      } else if (!this.isCrossbowAssembled) {
        this.assembleCrossbow();
      } else {
        this.fireCrossbow();
      }
      return;
    }

    // 2. Tương tác với Hòm Nghi Binh
    if (this.currentHoveredId.startsWith('DECOY_')) {
      this.callbacks.onInspectDecoy(this.currentHoveredId);
      return;
    }

    // 3. Tương tác với Mảnh Ghép Cổ Vật: Mở Cơ Quan Giải Đố Lịch Sử
    const relicId = this.currentHoveredId as CoLoaRelicId;
    this.callbacks.onOpenPuzzle(relicId);
  }

  // Trao mảnh ghép sau khi giải mã đúng câu đố
  public grantSolvedRelic(relicId: CoLoaRelicId) {
    this.collectedShards.add(relicId);
    sound.playRelicFound();

    const itemIndex = this.interactableObjects.findIndex((o) => o.id === relicId);
    if (itemIndex >= 0) {
      const obj = this.interactableObjects[itemIndex];
      this.scene.remove(obj.mesh);
      this.interactableObjects.splice(itemIndex, 1);
    }

    this.currentHoveredId = null;
    this.callbacks.onHoverInteractable(null);
    this.callbacks.onInspectRelic(relicId);
  }

  public assembleCrossbow() {
    if (this.isCrossbowAssembled || !this.assembledCrossbowMesh) return;
    this.isCrossbowAssembled = true;
    this.isAimingCrossbow = true;
    this.assembledCrossbowMesh.visible = true;

    sound.playChestUnlock();
    sound.playCrossbowDraw();

    // Hướng camera nhìn thẳng ra phía khúc sông Hoàng Giang có mục tiêu
    this.targetYaw = 0;
    this.targetPitch = 0.03;

    this.callbacks.onCrossbowReadyToAssemble();
  }

  public fireCrossbow() {
    if (!this.isCrossbowAssembled) return;

    sound.playCrossbowRelease();
    this.recoilOffset = 0.25;

    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xff9900,
      emissiveIntensity: 1.0,
      metalness: 0.9,
    });

    const startPos = new THREE.Vector3(0, 4.9, 23.5);
    const unhitTarget = this.targetPavilions.find((t) => !t.hit) || this.targetPavilions[0];

    // Bắn một phát chùm 5 mũi tên đồng bay theo quỹ đạo parabol xé gió!
    for (let i = 0; i < 5; i++) {
      const arrowGroup = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), arrowMat);
      shaft.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 3), arrowMat);
      head.rotation.x = -Math.PI / 2;
      head.position.z = 0.75;
      arrowGroup.add(head);

      arrowGroup.position.copy(startPos);
      arrowGroup.position.x += (i - 2) * 0.45;
      this.scene.add(arrowGroup);

      const targetWithSpread = unhitTarget.position.clone();
      targetWithSpread.x += (i - 2) * 1.1;
      targetWithSpread.y += (Math.random() - 0.5) * 0.7;

      const dir = targetWithSpread.clone().sub(startPos).normalize();
      const speed = 56 + Math.random() * 4;

      this.activeFlyingArrows.push({
        mesh: arrowGroup,
        vel: dir.multiplyScalar(speed),
        targetPos: targetWithSpread,
        life: 0,
      });
    }
  }

  // --- MAIN ANIMATION & UPDATE LOOP ---
  private animate = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    this.updatePlayerMovement(delta);
    this.updateLightingAndAtmosphere(time, delta);
    this.updateFlyingArrows(delta);
    this.checkRaycastInteractions();
    this.updateCompassRadar();

    this.renderer.render(this.scene, this.camera);
  };

  // CẬP NHẬT DI CHUYỂN NGƯỜI CHƠI (KHẮC PHỤC TRIỆT ĐỂ LỖI CAMERA & LẮC RUNG)
  private updatePlayerMovement(delta: number) {
    // 1. Damping mượt mà cho camera Yaw & Pitch loại bỏ hoàn toàn giật rung
    this.cameraYaw = THREE.MathUtils.damp(this.cameraYaw, this.targetYaw, 28, delta);
    this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, this.targetPitch, 28, delta);

    // Vector chỉ hướng nhìn ngang của camera
    const forward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

    const moveDir = new THREE.Vector3();

    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) moveDir.add(forward);
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) moveDir.sub(forward);
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) moveDir.sub(right);
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) moveDir.add(right);

    if (Math.abs(this.mobileMoveVector.x) > 0.05 || Math.abs(this.mobileMoveVector.y) > 0.05) {
      moveDir.add(right.clone().multiplyScalar(this.mobileMoveVector.x));
      moveDir.add(forward.clone().multiplyScalar(-this.mobileMoveVector.y));
    }

    const isMoving = moveDir.lengthSq() > 0.01;
    if (isMoving) {
      moveDir.normalize();
      const speed = 5.5;
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;
      sound.playFootstep();
    } else {
      this.playerVel.x *= 0.75;
      this.playerVel.z *= 0.75;
    }

    const candidateX = this.playerPos.x + this.playerVel.x * delta;
    const candidateZ = this.playerPos.z + this.playerVel.z * delta;

    // Xử lý va chạm vật lý thực tế: Cản trở đi xuyên tường / cây cối / đồ vật / lũy thành
    const resolved = this.resolvePlayerCollisions(candidateX, candidateZ);
    this.playerPos.x = resolved.x;
    this.playerPos.z = resolved.z;

    // --- TÍNH TOÁN ĐỘ CAO (Y) MƯỢT MÀ & GIỚI HẠN LAN CAN ĐÀI VỌNG LÂU ---
    let targetGroundY = 0;
    const dxToTower = this.playerPos.x - 0;
    const dzToTower = this.playerPos.z - 22;
    const horizDistToTower = Math.hypot(dxToTower, dzToTower);

    if (horizDistToTower < 3.4) {
      targetGroundY = 3.5;
      // Khóa lan can sàn đài Vọng Lâu: Không cho bước hụt rơi ra ngoài không khí
      this.playerPos.x = Math.max(-3.1, Math.min(3.1, this.playerPos.x));
      this.playerPos.z = Math.max(14.0, Math.min(25.2, this.playerPos.z));
    } else if (Math.abs(this.playerPos.x) < 2.2 && this.playerPos.z >= 13.5 && this.playerPos.z < 22) {
      const stairProgress = (this.playerPos.z - 13.5) / (22 - 13.5);
      targetGroundY = stairProgress * 3.5;
    }

    const eyeHeight = 1.7;
    const targetEyeY = targetGroundY + eyeHeight;
    this.playerPos.y += (targetEyeY - this.playerPos.y) * 0.16;

    if (this.recoilOffset > 0.001) {
      this.recoilOffset *= 0.86;
    }

    // CẬP NHẬT HOẠT ẢNH NHÂN VẬT & GÓC NHÌN
    if (isMoving) {
      this.walkPhase += delta * 10.0;
      const swing = Math.sin(this.walkPhase) * 0.6;
      if (this.leftLeg) this.leftLeg.rotation.x = swing;
      if (this.rightLeg) this.rightLeg.rotation.x = -swing;
      if (this.leftArm) this.leftArm.rotation.x = -swing * 0.7;
      if (this.rightArm) this.rightArm.rotation.x = swing * 0.7;

      if (this.playerCharacterMesh) {
        const moveAngle = Math.atan2(moveDir.x, moveDir.z);
        this.playerCharacterMesh.rotation.y = THREE.MathUtils.damp(
          this.playerCharacterMesh.rotation.y,
          moveAngle,
          15,
          delta
        );
      }
    } else {
      if (this.leftLeg) this.leftLeg.rotation.x *= 0.8;
      if (this.rightLeg) this.rightLeg.rotation.x *= 0.8;
      if (this.leftArm) this.leftArm.rotation.x *= 0.8;
      if (this.rightArm) this.rightArm.rotation.x *= 0.8;

      if (this.playerCharacterMesh) {
        this.playerCharacterMesh.rotation.y = THREE.MathUtils.damp(
          this.playerCharacterMesh.rotation.y,
          this.cameraYaw + Math.PI,
          12,
          delta
        );
      }
    }

    // CẬP NHẬT CAMERA THEO CHẾ ĐỘ FPS / TPS
    if (this.cameraMode === 'FIRST_PERSON') {
      if (this.playerCharacterMesh) this.playerCharacterMesh.visible = false;
      if (this.fpsCrossbowMesh) {
        this.fpsCrossbowMesh.visible = true;
        // Weapon bobbing nhịp thở bước chân
        const bobX = Math.sin(this.walkPhase * 0.5) * 0.012;
        const bobY = Math.abs(Math.sin(this.walkPhase)) * 0.016;
        this.fpsCrossbowMesh.position.set(0.24 + bobX, -0.22 + bobY, -0.5 + this.recoilOffset);
      }

      this.camera.position.set(
        this.playerPos.x,
        this.playerPos.y,
        this.playerPos.z + this.recoilOffset
      );
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.cameraYaw;
      this.camera.rotation.x = this.cameraPitch;
    } else {
      // GÓC NHÌN THỨ BA (THIRD PERSON)
      if (this.playerCharacterMesh) {
        this.playerCharacterMesh.visible = true;
        this.playerCharacterMesh.position.set(
          this.playerPos.x,
          this.playerPos.y - eyeHeight,
          this.playerPos.z
        );
      }
      if (this.fpsCrossbowMesh) this.fpsCrossbowMesh.visible = false;

      const thirdPersonDist = 3.8;
      const thirdPersonHeight = 1.3;
      const sideOffset = 0.45;

      const forwardCam = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      const rightCam = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

      const camTargetPos = this.playerPos.clone()
        .sub(forwardCam.clone().multiplyScalar(thirdPersonDist * Math.cos(this.cameraPitch)))
        .add(rightCam.clone().multiplyScalar(sideOffset))
        .add(new THREE.Vector3(0, thirdPersonHeight + Math.sin(this.cameraPitch) * thirdPersonDist + this.recoilOffset, 0));

      // Không bao giờ cho camera cắm xuống đất
      camTargetPos.y = Math.max(camTargetPos.y, targetGroundY + 0.45);

      this.camera.position.copy(camTargetPos);
      const lookAtTarget = this.playerPos.clone()
        .add(new THREE.Vector3(0, 0.2, 0))
        .add(rightCam.clone().multiplyScalar(sideOffset * 0.35));
      this.camera.lookAt(lookAtTarget);
    }
  }

  private updateLightingAndAtmosphere(time: number, delta: number) {
    this.torchLights.forEach((t) => {
      t.light.intensity = t.baseIntensity + Math.sin(time * 8 + t.phase) * 0.4 + Math.cos(time * 15) * 0.2;
    });

    this.animatedBanners.forEach((b, idx) => {
      b.rotation.y = Math.sin(time * 3 + idx) * 0.22;
    });

    this.animatedReeds.forEach((r, idx) => {
      r.rotation.z = Math.sin(time * 2 + idx) * 0.12;
    });

    if (this.sparkParticles && this.sparkPositions) {
      const posAttr = this.sparkParticles.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) + delta * 1.5;
        if (y > 11) y = 0.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  }

  private updateFlyingArrows(delta: number) {
    for (let i = this.activeFlyingArrows.length - 1; i >= 0; i--) {
      const arrow = this.activeFlyingArrows[i];
      arrow.mesh.position.addScaledVector(arrow.vel, delta);
      arrow.life += delta;

      if (arrow.mesh.position.distanceTo(arrow.targetPos) < 2.5 || arrow.life > 1.8) {
        sound.playArrowHit();

        const target = this.targetPavilions.find((t) => !t.hit);
        if (target) {
          target.hit = true;
          target.group.rotation.x = 0.55;
          target.group.position.y -= 0.6;

          const fireLight = new THREE.PointLight(0xff3300, 4.0, 14);
          fireLight.position.set(0, 3.0, 0);
          target.group.add(fireLight);
          target.fireLight = fireLight;

          this.targetsDestroyed++;
          this.callbacks.onTargetHit(this.targetsDestroyed);

          // Cần bắn hạ 5 mục tiêu để bảo vệ Cổ Loa hoàn toàn!
          if (this.targetsDestroyed >= 5) {
            sound.playBronzeDrum();
            sound.playSuccess();
            setTimeout(() => {
              this.callbacks.onChapterComplete();
            }, 1200);
          }
        }

        this.scene.remove(arrow.mesh);
        this.activeFlyingArrows.splice(i, 1);
      }
    }
  }

  // --- KIỂM TRA TƯƠNG TÁC TẦM GẦN VỚI VẬT THỂ ---
  private checkRaycastInteractions() {
    let closestObj: (typeof this.interactableObjects)[0] | null = null;
    let closestDist = Infinity;

    for (const obj of this.interactableObjects) {
      const dist = this.playerPos.distanceTo(obj.interactionPos);
      if (dist <= obj.radius && dist < closestDist) {
        closestDist = dist;
        closestObj = obj;
      }
    }

    if (closestObj) {
      if (this.currentHoveredId !== closestObj.id) {
        this.currentHoveredId = closestObj.id;
        this.callbacks.onHoverInteractable({
          id: closestObj.id,
          name: closestObj.name,
          prompt: closestObj.prompt,
        });
      }
    } else {
      if (this.currentHoveredId !== null) {
        this.currentHoveredId = null;
        this.callbacks.onHoverInteractable(null);
      }
    }
  }

  // --- CẬP NHẬT RADAR LA BÀN ĐỊNH HƯỚNG ---
  private updateCompassRadar() {
    const yawDeg = ((this.cameraYaw * 180) / Math.PI) % 360;
    const normalizedYaw = (yawDeg + 360) % 360;

    const targets = this.interactableObjects.map((obj) => {
      const dx = obj.interactionPos.x - this.playerPos.x;
      const dz = obj.interactionPos.z - this.playerPos.z;
      const distance = Math.hypot(dx, dz);
      const angleRad = Math.atan2(dx, -dz);
      let angleDeg = (angleRad * 180) / Math.PI;
      angleDeg = (angleDeg + 360) % 360;

      return {
        id: obj.id,
        name: obj.name,
        angle: angleDeg,
        distance: Math.round(distance),
      };
    });

    this.callbacks.onCompassUpdate(normalizedYaw, targets);
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // --- DỌN DẸP BỘ NHỚ WEBGL SẠCH SẼ KHI UNMOUNT ---
  public dispose() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderer.domElement.removeEventListener('touchstart', this.onTouchStart);
    this.renderer.domElement.removeEventListener('touchmove', this.onTouchMove);
    this.renderer.domElement.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
