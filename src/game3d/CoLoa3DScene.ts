import * as THREE from 'three';
import type { CoLoaRelicId } from '../types';
import { CO_LOA_RELICS } from '../data/chapterCoLoa';
import { sound } from '../utils/sound';

export interface CoLoaBridgeCallbacks {
  onHoverInteractable: (info: { id: string; name: string; prompt: string } | null) => void;
  onOpenPuzzle: (relicId: CoLoaRelicId) => void;
  onInspectRelic: (relicId: CoLoaRelicId) => void;
  onInspectDecoy: (decoyId: string) => void;
  onCrossbowReadyToAssemble: () => void;
  onTargetHit: (hitCount: number) => void;
  onChapterComplete: () => void;
  onCompassUpdate: (yawAngleDegrees: number, targets: { id: string; name: string; angle: number; distance: number }[]) => void;
}

// Helper: Tạo Texture Đồ Họa Procedural độ nét cao trực tiếp trên Canvas
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

  // Player & Controls State
  // Bắt đầu gần cổng thành Tây, đứng vững trên mặt đất y: 1.7
  private playerPos = new THREE.Vector3(0, 1.7, -4);
  private playerVel = new THREE.Vector3();
  private cameraPitch = 0; // X-axis (up/down)
  private cameraYaw = 0;   // Y-axis (left/right)
  private isPointerLocked = false;
  private keysPressed: Record<string, boolean> = {};

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
    // Near plane rất nhỏ (0.05) để tuyệt đối không bị clipping camera vào vật thể gần
    this.camera = new THREE.PerspectiveCamera(72, container.clientWidth / container.clientHeight, 0.05, 1000);
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
    this.setupEventListeners();

    this.isRunning = true;
    this.animate();
  }

  // --- TẠO CÁC TEXTURE PROCEDURAL CHI TIẾT ---
  private generateProceduralTextures() {
    // 1. Mặt đất châu thổ sông Hồng: Đất nện pha sỏi & rêu cỏ
    this.textures.terrain = createProceduralTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#5c4328';
      ctx.fillRect(0, 0, w, h);
      // Đốm cỏ & đất sét
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2 + 1;
        ctx.fillStyle = Math.random() > 0.5 ? '#6a5134' : Math.random() > 0.5 ? '#483520' : '#4f5c2a';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Vệt nứt nẻ đất phù sa
      ctx.strokeStyle = '#382515';
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * w, Math.random() * h);
        ctx.lineTo(Math.random() * w, Math.random() * h);
        ctx.stroke();
      }
    });
    this.textures.terrain.repeat.set(24, 24);

    // 2. Tường thành lũy đất nén Cổ Loa (Đất sét vàng nện chặt xen đá ong cổ)
    this.textures.rampart = createProceduralTexture(512, 512, (ctx, w, h) => {
      ctx.fillStyle = '#785536';
      ctx.fillRect(0, 0, w, h);
      // Các tầng lớp đất nện khảo cổ (Ramming layers)
      for (let y = 0; y < h; y += 24) {
        ctx.fillStyle = y % 48 === 0 ? '#634428' : '#8a623f';
        ctx.fillRect(0, y, w, 12);
        // Lỗ đá ong & mảnh gốm cổ Loa
        for (let x = 0; x < w; x += 18) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = '#47311d';
            ctx.fillRect(x + Math.random() * 6, y + Math.random() * 6, 6, 4);
          }
        }
      }
    });
    this.textures.rampart.repeat.set(8, 2);

    // 3. Gỗ xẻ dâu rừng & lim cổ (Thân nỏ, vọng lâu, cọc rào)
    this.textures.wood = createProceduralTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#52341b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3d2511';
      for (let x = 0; x < w; x += 8) {
        ctx.fillRect(x, 0, 3 + Math.random() * 2, h);
      }
    });
    this.textures.wood.repeat.set(4, 4);

    // 4. Đồng thau Đông Sơn cổ nạm hoa văn chim Lạc & mặt trời
    this.textures.bronze = createProceduralTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#9c7a36';
      ctx.fillRect(0, 0, w, h);
      // Gỉ đồng xanh cổ kính (patina)
      for (let i = 0; i < 600; i++) {
        ctx.fillStyle = Math.random() > 0.6 ? '#326b5e' : '#bfa254';
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Cờ lệnh ngũ sắc Âu Lạc (Đỏ viền răng cưa vàng)
    this.textures.banner = createProceduralTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#a61c1e';
      ctx.fillRect(0, 0, w, h);
      // Viền vàng răng cưa Đông Sơn
      ctx.fillStyle = '#f0b830';
      ctx.fillRect(0, 0, 20, h);
      ctx.fillRect(w - 20, 0, 20, h);
      ctx.fillRect(0, 0, w, 20);
      ctx.fillRect(0, h - 20, w, 20);
      // Hình mặt trời 14 tia ở trung tâm
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 45, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // --- MÔI TRƯỜNG & KHÔNG GIAN BẦU TRỜI HOÀNG HÔN ---
  private setupEnvironment() {
    this.scene.background = new THREE.Color(0xd47f48);
    this.scene.fog = new THREE.FogExp2(0xd47f48, 0.012);

    // Vòm trời hoàng hôn ráng chiều đa tầng
    const skyGeo = new THREE.SphereGeometry(380, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xc8703c,
      side: THREE.BackSide,
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // Dãy núi Tam Đảo / Ba Vì mờ sương xa xa phía chân trời
    const mountainMat = new THREE.MeshBasicMaterial({ color: 0x6e4531 });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 320;
      const mHeight = 45 + Math.sin(i * 1.5) * 20;
      const mWidth = 70 + Math.cos(i) * 25;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(mWidth, mHeight, 6), mountainMat);
      mountain.position.set(Math.cos(angle) * dist, mHeight / 2 - 10, Math.sin(angle) * dist);
      this.scene.add(mountain);
    }

    // Ánh sáng môi trường
    const hemiLight = new THREE.HemisphereLight(0xffdfba, 0x5a3e2a, 0.85);
    this.scene.add(hemiLight);

    // Mặt trời hoàng hôn rực rỡ chiếu xiên
    const sunLight = new THREE.DirectionalLight(0xff8c3b, 1.6);
    sunLight.position.set(-80, 55, -60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 300;
    const d = 70;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    this.scene.add(sunLight);

    // Quả cầu mặt trời hoàng hôn
    const sunGeo = new THREE.SphereGeometry(18, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(-260, 140, -190);
    this.scene.add(sunMesh);
  }

  // --- ĐỊA HÌNH & HỆ THỐNG THÀNH LŨY XOẮN ỐC NỆN ĐẤT ---
  private buildTerrainAndSpiralRamparts() {
    // 1. Mặt đất chính với Texture đất nén phù sa
    const groundGeo = new THREE.PlaneGeometry(360, 360, 64, 64);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      if (dist > 30) {
        pos.setZ(i, Math.sin(x * 0.04) * Math.cos(y * 0.04) * 1.8);
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

    // 2. Lũy Đất Vòng Cung Cổ Loa (Đắp đất cao 4m)
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.textures.rampart,
      roughness: 0.95,
      metalness: 0.02,
    });

    const rampartShape = new THREE.Shape();
    rampartShape.moveTo(-4.5, 0);
    rampartShape.lineTo(-2.2, 4.0);
    rampartShape.lineTo(2.2, 4.0);
    rampartShape.lineTo(4.5, 0);
    rampartShape.closePath();

    const rampartCurves = [
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-28, 0, -28),
        new THREE.Vector3(-38, 0, 16),
        new THREE.Vector3(-12, 0, 32)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-12, 0, 32),
        new THREE.Vector3(26, 0, 34),
        new THREE.Vector3(38, 0, 6)
      ),
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(38, 0, 6),
        new THREE.Vector3(30, 0, -32),
        new THREE.Vector3(0, 0, -34)
      ),
    ];

    rampartCurves.forEach((curve) => {
      const extrudeSettings = { steps: 36, bevelEnabled: false, extrudePath: curve };
      const wallGeo = new THREE.ExtrudeGeometry(rampartShape, extrudeSettings);
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.scene.add(wallMesh);
    });

    // 3. Hào nước sông Hoàng Giang (Moat)
    const waterGeo = new THREE.RingGeometry(44, 72, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1f4749,
      roughness: 0.15,
      metalness: 0.45,
      transparent: true,
      opacity: 0.9,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.25;
    this.scene.add(waterMesh);
  }

  // --- CÂY XANH, BỤI TRE, LAU SẬY ĐẬM CHẤT LÀNG QUÊ VIỆT CỔ ---
  private buildFoliageAndAtmosphere() {
    // 1. Rừng Tre Ngà (Bamboo Groves)
    const bambooTrunkMat = new THREE.MeshStandardMaterial({ color: 0x828a38, roughness: 0.6 });
    const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x476326, roughness: 0.5, side: THREE.DoubleSide });

    const createBambooCluster = (cx: number, cz: number, count: number) => {
      const group = new THREE.Group();
      group.position.set(cx, 0, cz);

      for (let i = 0; i < count; i++) {
        const bx = (Math.random() - 0.5) * 5;
        const bz = (Math.random() - 0.5) * 5;
        const height = 6 + Math.random() * 3.5;

        // Thân tre nhiều đốt
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, height, 6),
          bambooTrunkMat
        );
        stalk.position.set(bx, height / 2, bz);
        stalk.rotation.z = (Math.random() - 0.5) * 0.15;
        stalk.rotation.x = (Math.random() - 0.5) * 0.15;
        stalk.castShadow = true;
        group.add(stalk);

        // Tán lá tre trên ngọn
        for (let l = 0; l < 4; l++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 4), bambooLeafMat);
          leaf.position.set(bx, height - 0.3 * l, bz);
          leaf.rotation.z = 0.8 * (l % 2 === 0 ? 1 : -1);
          group.add(leaf);
        }
      }
      this.scene.add(group);
    };

    createBambooCluster(-24, -10, 14);
    createBambooCluster(25, 12, 12);
    createBambooCluster(-6, -26, 10);

    // 2. Bãi Lau Sậy Bờ Nước (Reeds)
    const reedMat = new THREE.MeshStandardMaterial({ color: 0xa89f68, roughness: 0.7 });
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const rx = Math.cos(angle) * 41;
      const rz = Math.sin(angle) * 41;

      const reedGroup = new THREE.Group();
      reedGroup.position.set(rx, 0, rz);

      for (let k = 0; k < 6; k++) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 2.5, 4), reedMat);
        stalk.position.set((Math.random() - 0.5) * 0.8, 1.25, (Math.random() - 0.5) * 0.8);
        stalk.rotation.z = (Math.random() - 0.5) * 0.2;
        reedGroup.add(stalk);
      }
      this.scene.add(reedGroup);
      this.animatedReeds.push(reedGroup);
    }

    // 3. Hệ thống hạt tàn lửa bay lơ lửng trong không khí (Sparks particles)
    const sparkCount = 120;
    const sparkGeo = new THREE.BufferGeometry();
    this.sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      this.sparkPositions[i * 3] = (Math.random() - 0.5) * 40;
      this.sparkPositions[i * 3 + 1] = Math.random() * 8 + 0.5;
      this.sparkPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(this.sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa22,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.sparkParticles = new THREE.Points(sparkGeo, sparkMat);
    this.scene.add(this.sparkParticles);
  }

  // --- CHIẾN BINH ÂU LẠC 3D VÀ KHÍ TÀI PHÒNG THỦ ---
  private buildSoldiersAndDefenses() {
    // Tạo 2 chiến binh canh cổng thành Âu Lạc (Stylized Bronze Age Warriors)
    const createWarrior = (x: number, z: number, rotationY: number) => {
      const warrior = new THREE.Group();
      warrior.position.set(x, 0, z);
      warrior.rotation.y = rotationY;

      // Thân mình & áo khố da
      const skinMat = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.7 });
      const clothMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.8 });
      const bronzeArmorMat = new THREE.MeshStandardMaterial({
        map: this.textures.bronze,
        metalness: 0.8,
        roughness: 0.3,
      });

      // Chân
      const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.9, 6);
      const legL = new THREE.Mesh(legGeo, skinMat);
      legL.position.set(-0.16, 0.45, 0);
      warrior.add(legL);

      const legR = new THREE.Mesh(legGeo, skinMat);
      legR.position.set(0.16, 0.45, 0);
      warrior.add(legR);

      // Thân & Tấm hộ tâm phiến đồng tròn trước ngực
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.9, 8), clothMat);
      torso.position.y = 1.25;
      warrior.add(torso);

      const chestDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 12), bronzeArmorMat);
      chestDisc.rotation.x = Math.PI / 2;
      chestDisc.position.set(0, 1.35, 0.22);
      warrior.add(chestDisc);

      // Đầu quấn khăn cắm lông chim Lạc
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

      // Giáo đồng Cổ Loa cầm tay dài 2.8m
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

    // 2 lính gác cổng thành Tây
    createWarrior(-2.4, -6.5, 0);
    createWarrior(2.4, -6.5, 0);

    // 1 lính canh trên bờ thành
    createWarrior(8.0, 18.0, -Math.PI / 3);

    // Giá để giáo mác & khiên đồng
    this.buildWeaponRack(new THREE.Vector3(-4.5, 0, -4.5));
    // Xe thồ gỗ chở mũi tên đồng
    this.buildSupplyCart(new THREE.Vector3(4.5, 0, -3.5));
  }

  // Giá để vũ khí Đông Sơn
  private buildWeaponRack(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.7 });
    const bronzeMat = new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.8 });

    // Khung chữ A
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

    // 3 Khiên đồng tròn Đông Sơn treo trên giá
    for (let i = -1; i <= 1; i++) {
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16), bronzeMat);
      shield.rotation.x = Math.PI / 2;
      shield.position.set(i * 0.6, 0.65, 0.05);
      group.add(shield);
    }

    this.scene.add(group);
  }

  // Xe thồ gỗ quân dụng
  private buildSupplyCart(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = 0.4;

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.2), woodMat);
    bed.position.y = 0.65;
    group.add(bed);

    // 2 Bánh xe gỗ lớn
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12);
    const wheelL = new THREE.Mesh(wheelGeo, woodMat);
    wheelL.rotation.z = Math.PI / 2;
    wheelL.position.set(0, 0.5, 0.7);
    group.add(wheelL);

    const wheelR = new THREE.Mesh(wheelGeo, woodMat);
    wheelR.rotation.z = Math.PI / 2;
    wheelR.position.set(0, 0.5, -0.7);
    group.add(wheelR);

    // Thùng đựng bao tên đồng
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
    // 1. CỔNG THÀNH TÂY & ĐỐNG LỬA TRẠI TRUNG TÂM
    this.buildCampfire(new THREE.Vector3(0, 0, -3));
    this.buildAncientStele(new THREE.Vector3(3.8, 0, -1.8));

    // 2. LÒ RÈN VŨ KHÍ CAO LỖ (x: -16, z: 8)
    this.buildBlacksmithFoundry(new THREE.Vector3(-16, 0, 8));

    // 3. ĐỀN TẾ KIM QUY & GIẾNG NGỌC CỔ LOA (x: 18, z: -10)
    this.buildSacredWellAndShrine(new THREE.Vector3(18, 0, -10));

    // 4. KHO KHÍ GIỚI NGẦM CỔ LOA (x: -10, z: -20)
    this.buildArsenalVault(new THREE.Vector3(-10, 0, -20));
  }

  // Lửa trại bập bùng
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

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x2e1c11, roughness: 0.9 });
    const logGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.4, 5);
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(logGeo, woodMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (i * Math.PI) / 2;
      log.position.y = 0.25;
      group.add(log);
    }

    const emberMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
    const ember = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 6), emberMat);
    ember.position.y = 0.35;
    group.add(ember);

    const fireLight = new THREE.PointLight(0xff7722, 2.5, 20, 1.4);
    fireLight.position.y = 1.1;
    fireLight.castShadow = true;
    group.add(fireLight);
    this.torchLights.push({ light: fireLight, baseIntensity: 2.5, phase: Math.random() * 10 });

    this.scene.add(group);
  }

  // Bia đá cổ tích Cổ Loa
  private buildAncientStele(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x5a5651, roughness: 0.9 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.2), baseMat);
    base.position.y = 0.22;
    group.add(base);

    const steleMat = new THREE.MeshStandardMaterial({ color: 0x6e6860, roughness: 0.85 });
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 0.28), steleMat);
    stele.position.y = 1.35;
    group.add(stele);

    const topGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.28, 16);
    const top = new THREE.Mesh(topGeo, steleMat);
    top.rotation.z = Math.PI / 2;
    top.position.y = 2.4;
    group.add(top);

    this.scene.add(group);
  }

  // Lò rèn danh tướng Cao Lỗ
  private buildBlacksmithFoundry(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Mái tranh
    const thatchMat = new THREE.MeshStandardMaterial({ color: 0x8a6e3e, roughness: 0.95 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.4, 4), thatchMat);
    roof.position.y = 3.8;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // 4 Cột gỗ
    const pillarMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.4, 6);
    [
      [-2.2, -2.2],
      [-2.2, 2.2],
      [2.2, -2.2],
      [2.2, 2.2],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 1.7, pz);
      group.add(p);
    });

    // Lò nung gạch đất
    const kilnMat = new THREE.MeshStandardMaterial({ color: 0x733d26, roughness: 0.9 });
    const kiln = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 1.6, 12), kilnMat);
    kiln.position.set(-1.0, 0.8, 0);
    group.add(kiln);

    // Ánh than hồng rực rỡ
    const forgeLight = new THREE.PointLight(0xff3300, 3.5, 16, 1.2);
    forgeLight.position.set(-1.0, 1.6, 0);
    group.add(forgeLight);
    this.torchLights.push({ light: forgeLight, baseIntensity: 3.5, phase: Math.random() * 10 });

    // Đe sắt rèn nỏ
    const anvilMat = new THREE.MeshStandardMaterial({ color: 0x22262a, metalness: 0.9, roughness: 0.25 });
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.6), anvilMat);
    anvil.position.set(1.0, 0.4, 0);
    group.add(anvil);

    // Bể nước tôi kim loại
    const tub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.6, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 })
    );
    tub.position.set(0.6, 0.45, 1.6);
    group.add(tub);

    // Cờ lệnh tướng Cao Lỗ
    this.buildAncientFlag(group, new THREE.Vector3(2.8, 0, -2.2));

    this.scene.add(group);
  }

  // Đền tế thần Kim Quy & Giếng Ngọc & Trống đồng lớn
  private buildSacredWellAndShrine(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    // Giếng Ngọc thành đá hoa sen
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x6e6860, roughness: 0.7 });
    const wellWall = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.9, 16, 1, true), wellMat);
    wellWall.position.y = 0.45;
    group.add(wellWall);

    const wellWater = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x228b8d, roughness: 0.1, metalness: 0.5 })
    );
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.25;
    group.add(wellWater);

    // Đàn tế đá
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.5, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x8a7b66, roughness: 0.6 })
    );
    altar.position.set(0, 0.5, -3.8);
    group.add(altar);

    // Tượng rùa vàng Kim Quy
    const turtleMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.85,
      roughness: 0.25,
    });
    const turtleShell = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), turtleMat);
    turtleShell.scale.set(1.5, 0.6, 1.9);
    turtleShell.position.set(0, 1.2, -3.8);
    group.add(turtleShell);

    // ĐẠI TRỐNG ĐỒNG ĐÔNG SƠN (Đường kính 1.6m đặt cạnh đàn tế)
    const drumGroup = new THREE.Group();
    drumGroup.position.set(3.8, 0, -2.0);
    const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.95, 1.2, 16), turtleMat);
    drumBody.position.y = 0.6;
    drumGroup.add(drumBody);

    const drumRim = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 16), turtleMat);
    drumRim.position.y = 1.25;
    drumGroup.add(drumRim);
    group.add(drumGroup);

    // 2 Cột đuốc chầu
    this.buildStandingTorch(group, new THREE.Vector3(-2.4, 0, -3.8));
    this.buildStandingTorch(group, new THREE.Vector3(2.4, 0, -3.8));

    this.scene.add(group);
  }

  // Kho khí giới ngầm
  private buildArsenalVault(pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const shelterMat = new THREE.MeshStandardMaterial({ color: 0x544738, roughness: 0.9 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 4.2), shelterMat);
    roof.position.set(0, 2.7, 0);
    roof.rotation.x = 0.15;
    group.add(roof);

    const pillarMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    [
      [-2.1, -1.9],
      [2.1, -1.9],
      [-2.1, 1.9],
      [2.1, 1.9],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.8, 6), pillarMat);
      p.position.set(px, 1.4, pz);
      group.add(p);
    });

    const boxMat = new THREE.MeshStandardMaterial({ color: 0x523d2b, roughness: 0.85 });
    const bronzeBoxMat = new THREE.MeshStandardMaterial({
      map: this.textures.bronze,
      metalness: 0.8,
      roughness: 0.3,
    });

    const box1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 0.9), boxMat);
    box1.position.set(-1.1, 0.45, 0);
    group.add(box1);

    const bronzeCrate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.0), bronzeBoxMat);
    bronzeCrate.position.set(0.9, 0.5, -0.2);
    group.add(bronzeCrate);

    this.scene.add(group);
  }

  // Cột đuốc
  private buildStandingTorch(parent: THREE.Group, pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6),
      new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 })
    );
    pole.position.y = 1.2;
    group.add(pole);

    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.12, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0x261d15, metalness: 0.6 })
    );
    bowl.position.y = 2.4;
    group.add(bowl);

    const torchLight = new THREE.PointLight(0xff6611, 2.2, 14, 1.3);
    torchLight.position.y = 2.6;
    group.add(torchLight);
    this.torchLights.push({ light: torchLight, baseIntensity: 2.2, phase: Math.random() * 10 });

    parent.add(group);
  }

  // Cờ ngũ sắc Âu Lạc
  private buildAncientFlag(parent: THREE.Group, pos: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(pos);

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 5.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x3d2716 })
    );
    pole.position.y = 2.75;
    group.add(pole);

    const bannerGeo = new THREE.PlaneGeometry(1.8, 1.3, 8, 4);
    const bannerMat = new THREE.MeshStandardMaterial({
      map: this.textures.banner,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0.95, 4.6, 0);
    group.add(banner);
    this.animatedBanners.push(banner);

    parent.add(group);
  }

  // --- CÁC MẢNH GHÉP CỔ VẬT 3D ĐẶT TRONG THẾ GIỚI ---
  private buildRelicPickups() {
    // 1. MẢNH THÂN NỎ ĐÔNG SƠN (tại Lò Rèn Cao Lỗ)
    if (!this.collectedShards.has('SHARD_CROSSBOW_STOCK')) {
      const stockGroup = new THREE.Group();
      stockGroup.position.set(-15, 1.15, 8.5);

      const woodStock = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.2, 0.2),
        new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.6 })
      );
      stockGroup.add(woodStock);

      const crossArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, 1.5),
        new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.6 })
      );
      crossArm.position.x = 0.5;
      stockGroup.add(crossArm);

      const aura = new THREE.PointLight(0xffaa22, 2.5, 5.0);
      stockGroup.add(aura);

      this.scene.add(stockGroup);
      this.interactableObjects.push({
        mesh: stockGroup,
        id: 'SHARD_CROSSBOW_STOCK',
        name: CO_LOA_RELICS.SHARD_CROSSBOW_STOCK.name,
        prompt: '[E] Khảo sát Thân Nỏ Gỗ Dâu Rừng',
        radius: 4.0,
        interactionPos: new THREE.Vector3(-15, 1.7, 8.5),
      });
    }

    // 2. LẪY MÓNG RÙA KIM QUY (tại Đàn Tế Giếng Ngọc)
    if (!this.collectedShards.has('SHARD_TURTLE_TRIGGER')) {
      const triggerGroup = new THREE.Group();
      triggerGroup.position.set(18, 1.55, -13.5);

      const triggerMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.5, 0.25),
        new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.9, roughness: 0.25 })
      );
      triggerGroup.add(triggerMesh);

      const aura = new THREE.PointLight(0x44ffaa, 2.8, 5.5);
      triggerGroup.add(aura);

      this.scene.add(triggerGroup);
      this.interactableObjects.push({
        mesh: triggerGroup,
        id: 'SHARD_TURTLE_TRIGGER',
        name: CO_LOA_RELICS.SHARD_TURTLE_TRIGGER.name,
        prompt: '[E] Tiếp nhận Lẫy Móng Rùa Kim Quy',
        radius: 4.0,
        interactionPos: new THREE.Vector3(18, 1.7, -13.5),
      });
    }

    // 3. ỐNG TÊN ĐỒNG BA CẠNH CẦU VỰC (tại Kho Khí Giới)
    if (!this.collectedShards.has('SHARD_BRONZE_ARROWS')) {
      const arrowsGroup = new THREE.Group();
      arrowsGroup.position.set(-9.2, 1.25, -20.2);

      const quiver = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 1.0, 12),
        new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.8, roughness: 0.35 })
      );
      arrowsGroup.add(quiver);

      for (let i = 0; i < 6; i++) {
        const arrow = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.04, 0.7, 3),
          new THREE.MeshStandardMaterial({ color: 0x3d4428, metalness: 0.9 })
        );
        arrow.position.set((Math.random() - 0.5) * 0.18, 0.55, (Math.random() - 0.5) * 0.18);
        arrowsGroup.add(arrow);
      }

      const aura = new THREE.PointLight(0xd4af37, 2.5, 5.0);
      arrowsGroup.add(aura);

      this.scene.add(arrowsGroup);
      this.interactableObjects.push({
        mesh: arrowsGroup,
        id: 'SHARD_BRONZE_ARROWS',
        name: CO_LOA_RELICS.SHARD_BRONZE_ARROWS.name,
        prompt: '[E] Khảo sát & Mở Khóa Kho Tên Đồng',
        radius: 4.0,
        interactionPos: new THREE.Vector3(-9.2, 1.7, -20.2),
      });
    }
  }

  // --- CÁC VẬT THỂ NGHI BINH & THÔNG TIN GIẢ (DECOYS) ---
  private buildDecoyPickups() {
    // 1. Decoy 1: Nỏ Tre Rừng (Tại Bãi Luyện Bắn Dã Ngoại Tây x: -24, z: -6)
    const decoyBowGroup = new THREE.Group();
    decoyBowGroup.position.set(-24, 0.9, -6);
    const bambooBow = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x9e8a52, roughness: 0.9 })
    );
    decoyBowGroup.add(bambooBow);
    const bowString = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.8),
      new THREE.MeshBasicMaterial({ color: 0x666666 })
    );
    bowString.rotation.x = Math.PI / 2;
    decoyBowGroup.add(bowString);
    this.scene.add(decoyBowGroup);

    this.interactableObjects.push({
      mesh: decoyBowGroup,
      id: 'DECOY_HUNTING_BOW',
      name: 'Nỏ Tre Rừng Dân Gian',
      prompt: '[E] Kiểm tra Nỏ Tre Rừng (Khí tài lạ)',
      radius: 3.5,
      interactionPos: new THREE.Vector3(-24, 1.7, -6),
    });

    // 2. Decoy 2: Rương Mũi Tên Sắt Giặc Nam Việt (Tại Doanh Trại Quân Sĩ x: 12, z: 14)
    const decoyIronGroup = new THREE.Group();
    decoyIronGroup.position.set(12, 0.5, 14);
    const ironCrate = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.7, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x2e2d2b, roughness: 0.8, metalness: 0.5 })
    );
    decoyIronGroup.add(ironCrate);
    this.scene.add(decoyIronGroup);

    this.interactableObjects.push({
      mesh: decoyIronGroup,
      id: 'DECOY_IRON_ARROWS',
      name: 'Rương Tên Sắt Bị Bỏ Lại',
      prompt: '[E] Soi xét Rương Mũi Tên Sắt (Đồ giặc để lại)',
      radius: 3.5,
      interactionPos: new THREE.Vector3(12, 1.7, 14),
    });

    // 3. Decoy 3: Mật Thư Gián Điệp Rơi Vãi (Tại Gốc Cây Bờ Hào x: -16, z: -20)
    const decoyLetterGroup = new THREE.Group();
    decoyLetterGroup.position.set(-16, 0.4, -20);
    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4c29a, roughness: 0.7 })
    );
    scroll.rotation.z = Math.PI / 2;
    decoyLetterGroup.add(scroll);
    this.scene.add(decoyLetterGroup);

    this.interactableObjects.push({
      mesh: decoyLetterGroup,
      id: 'DECOY_SPY_LETTER',
      name: 'Mảnh Giấy Da Rơi Vãi',
      prompt: '[E] Đọc Mảnh Giấy Da Bí Mật (Nghi vấn)',
      radius: 3.5,
      interactionPos: new THREE.Vector3(-16, 1.7, -20),
    });
  }

  // --- TRẠM LẮP RÁP NỎ THẦN TRÊN VỌNG LÂU BỜ THÀNH (SỬA TRIỆT ĐỂ LỖI GIẬT MÀN HÌNH) ---
  private buildCrossbowStation() {
    this.crossbowStand = new THREE.Group();
    // Vọng lâu đặt ở gò bờ thành phía Nam (x: 0, y: 3.5, z: 22)
    this.crossbowStand.position.set(0, 3.5, 22);

    const woodMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.75 });

    // 1. Bục gỗ lớn vững chãi không bị lơ lửng
    const platform = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.8, 6.5), woodMat);
    platform.position.y = -0.4;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.crossbowStand.add(platform);

    // Lan can gỗ xung quanh bảo vệ bờ thành
    const railMat = new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.8 });
    const railingBack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 0.15), railMat);
    railingBack.position.set(0, 0.45, -3.1);
    this.crossbowStand.add(railingBack);

    const railingLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 6.2), railMat);
    railingLeft.position.set(-3.1, 0.45, 0);
    this.crossbowStand.add(railingLeft);

    const railingRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 6.2), railMat);
    railingRight.position.set(3.1, 0.45, 0);
    this.crossbowStand.add(railingRight);

    // 2. CẦU THANG BẬC GỖ DẪN LÊN ĐÀI BẮN (Ramp & Stairs)
    // Giúp người chơi bước lên tự nhiên, không bị nhảy giật Y đột ngột!
    const stairsGeo = new THREE.BoxGeometry(3.2, 0.2, 1.2);
    for (let step = 0; step < 7; step++) {
      const stair = new THREE.Mesh(stairsGeo, woodMat);
      // Đi từ z: 15 lên z: 20
      stair.position.set(0, (step * 0.5) - 3.2, -4.5 + step * 0.9);
      this.crossbowStand.add(stair);
    }

    // 3. Chân giá đỡ Nỏ Thần Thập Bát Tiễn
    const standPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.3, 8), woodMat);
    standPillar.position.set(0, 0.65, 0.5);
    this.crossbowStand.add(standPillar);

    const swivelHead = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.5), woodMat);
    swivelHead.position.set(0, 1.35, 0.5);
    this.crossbowStand.add(swivelHead);

    // 4. MÔ HÌNH NỎ THẦN LIÊN CHÂU ĐẠI ĐỒNG CHI TIẾT
    this.assembledCrossbowMesh = new THREE.Group();
    this.assembledCrossbowMesh.position.set(0, 1.55, 0.5);

    // Thân nỏ gỗ lim nạm đồng
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.25, 2.4),
      new THREE.MeshStandardMaterial({ map: this.textures.wood, roughness: 0.5 })
    );
    this.assembledCrossbowMesh.add(stock);

    // Cánh cung nỏ kép 2 tầng chịu lực
    const bowUpper = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.18, 0.2),
      new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.85, roughness: 0.3 })
    );
    bowUpper.position.z = 1.05;
    this.assembledCrossbowMesh.add(bowUpper);

    const bowLower = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.14, 0.18),
      new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.85, roughness: 0.3 })
    );
    bowLower.position.set(0, -0.15, 1.05);
    this.assembledCrossbowMesh.add(bowLower);

    // Hộp cò lẫy móng rùa bằng đồng sáng lóa
    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.28, 0.2),
      new THREE.MeshStandardMaterial({ map: this.textures.bronze, metalness: 0.95, roughness: 0.2 })
    );
    trigger.position.set(0, 0.18, -0.3);
    this.assembledCrossbowMesh.add(trigger);

    // Hộp chứa rãnh phóng tên liên châu (5 mũi tên đồng nằm sẵn)
    for (let a = -2; a <= 2; a++) {
      const readyArrow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 1.4, 4),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 })
      );
      readyArrow.rotation.x = Math.PI / 2;
      readyArrow.position.set(a * 0.05, 0.16, 0.3);
      this.assembledCrossbowMesh.add(readyArrow);
    }

    // Dây nỏ đan từ gân thú căng như dây đàn
    const stringMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const stringL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.5), stringMat);
    stringL.position.set(-0.7, 0.05, 0.4);
    stringL.rotation.z = Math.PI / 4;
    this.assembledCrossbowMesh.add(stringL);

    const stringR = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.5), stringMat);
    stringR.position.set(0.7, 0.05, 0.4);
    stringR.rotation.z = -Math.PI / 4;
    this.assembledCrossbowMesh.add(stringR);

    this.assembledCrossbowMesh.visible = false;
    this.crossbowStand.add(this.assembledCrossbowMesh);

    // 2 Đuốc hai bên đài bắn
    this.buildStandingTorch(this.crossbowStand, new THREE.Vector3(-2.6, 0, 0.5));
    this.buildStandingTorch(this.crossbowStand, new THREE.Vector3(2.6, 0, 0.5));

    this.scene.add(this.crossbowStand);

    this.interactableObjects.push({
      mesh: this.crossbowStand,
      id: 'STATION_CROSSBOW',
      name: 'Vọng Lâu Nỏ Thần Cổ Loa',
      prompt: '[E] Bàn Lắp Ráp & Giương Nỏ Thần',
      radius: 5.5,
      interactionPos: new THREE.Vector3(0, 3.5, 22),
    });
  }

  // --- CÁC BIA TIÊU CỜ GIẶC NGOÀI THÀNH ---
  private buildEnemyTargets() {
    const targetPositions = [
      new THREE.Vector3(-20, 2.0, 68),
      new THREE.Vector3(0, 2.5, 75),
      new THREE.Vector3(20, 2.0, 70),
    ];

    targetPositions.forEach((pos) => {
      const group = new THREE.Group();
      group.position.copy(pos);

      // Tháp canh cắm cờ giặc Triệu Đà giả định
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 5.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x3d3024 })
      );
      pole.position.y = 2.6;
      group.add(pole);

      // Bia gỗ tròn hồng tâm lớn
      const targetDisk = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 0.18, 16),
        new THREE.MeshStandardMaterial({ color: 0x8a2020, roughness: 0.6 })
      );
      targetDisk.rotation.x = Math.PI / 2;
      targetDisk.position.y = 3.6;
      group.add(targetDisk);

      // Vòng tâm trắng
      const bullseye = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      bullseye.rotation.x = Math.PI / 2;
      bullseye.position.set(0, 3.6, 0.01);
      group.add(bullseye);

      // Cờ giặc hình tam giác đen
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.2, 3),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      flag.position.set(0.6, 4.8, 0);
      flag.rotation.z = Math.PI / 2;
      group.add(flag);

      this.scene.add(group);
      this.targetPavilions.push({ group, hit: false, position: pos });
    });
  }

  // --- CONTROLLER & EVENT LISTENERS ---
  private setupEventListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.renderer.domElement.addEventListener('click', this.requestPointerLock);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousemove', this.onMouseMove);

    this.renderer.domElement.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.renderer.domElement.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.renderer.domElement.addEventListener('touchend', this.onTouchEnd, { passive: false });

    window.addEventListener('resize', this.onWindowResize);
  }

  private requestPointerLock = () => {
    if (!this.isPointerLocked) {
      this.renderer.domElement.requestPointerLock();
    }
  };

  private onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerLocked) return;
    const sens = 0.0022;
    this.cameraYaw -= e.movementX * sens;
    this.cameraPitch -= e.movementY * sens;
    this.cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.cameraPitch));
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;

    if (e.code === 'KeyE') {
      this.handleInteractKey();
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
        this.cameraYaw -= dx * touchSens;
        this.cameraPitch -= dy * touchSens;
        this.cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.cameraPitch));
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

    // Thoát Pointer Lock ngay lập tức khi tương tác để con trỏ chuột tự do click trên giao diện modal
    if (document.pointerLockElement) {
      document.exitPointerLock();
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

    // 2. Tương tác với Vật Thể Nghi Binh / Thông Tin Giả
    if (this.currentHoveredId.startsWith('DECOY_')) {
      this.callbacks.onInspectDecoy(this.currentHoveredId);
      return;
    }

    // 3. Tương tác với Mảnh Ghép Cổ Vật: Mở Cơ Quan Giải Đố Lịch Sử!
    const relicId = this.currentHoveredId as CoLoaRelicId;
    this.callbacks.onOpenPuzzle(relicId);
  }

  // Trao mảnh ghép sau khi người chơi giải đúng câu đố lịch sử
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

    // Hướng camera nhìn thẳng ra bờ thành phía mục tiêu
    this.cameraYaw = 0;
    this.cameraPitch = 0.04;

    this.callbacks.onCrossbowReadyToAssemble();
  }

  public fireCrossbow() {
    if (!this.isCrossbowAssembled) return;

    sound.playCrossbowRelease();
    // Giật lùi camera (Recoil)
    this.recoilOffset = 0.22;

    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xffe066,
      emissive: 0xff9900,
      emissiveIntensity: 1.0,
      metalness: 0.9,
    });

    const startPos = new THREE.Vector3(0, 4.9, 23.5);
    const unhitTarget = this.targetPavilions.find((t) => !t.hit) || this.targetPavilions[0];

    for (let i = 0; i < 5; i++) {
      const arrowGroup = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), arrowMat);
      shaft.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);

      const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 3), arrowMat);
      head.rotation.x = -Math.PI / 2;
      head.position.z = 0.75;
      arrowGroup.add(head);

      arrowGroup.position.copy(startPos);
      arrowGroup.position.x += (i - 2) * 0.4;
      this.scene.add(arrowGroup);

      const targetWithSpread = unhitTarget.position.clone();
      targetWithSpread.x += (i - 2) * 0.9;
      targetWithSpread.y += (Math.random() - 0.5) * 0.6;

      const dir = targetWithSpread.clone().sub(startPos).normalize();
      const speed = 52 + Math.random() * 4;

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

  // CẬP NHẬT DI CHUYỂN NGƯỜI CHƠI (SỬA TRIỆT ĐỂ LỖI GIẬT MÀN HÌNH)
  private updatePlayerMovement(delta: number) {
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
      const speed = 5.2;
      this.playerVel.x = moveDir.x * speed;
      this.playerVel.z = moveDir.z * speed;
      sound.playFootstep();
    } else {
      this.playerVel.x *= 0.8;
      this.playerVel.z *= 0.8;
    }

    this.playerPos.x += this.playerVel.x * delta;
    this.playerPos.z += this.playerVel.z * delta;

    // Giữ trong bán kính thành 42m
    const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
    if (distFromCenter > 42) {
      const angle = Math.atan2(this.playerPos.z, this.playerPos.x);
      this.playerPos.x = Math.cos(angle) * 42;
      this.playerPos.z = Math.sin(angle) * 42;
    }

    // --- TÍNH TOÁN ĐỘ CAO (Y) MƯỢT MÀ, KHÔNG BAO GIỜ BỊ GIẬT ---
    // Đài nỏ đặt tại x: 0, z: 22. Cầu thang kéo dài từ z: 15 đến z: 22
    let targetGroundY = 0;
    const dxToTower = this.playerPos.x - 0;
    const dzToTower = this.playerPos.z - 22;
    const horizDistToTower = Math.hypot(dxToTower, dzToTower);

    if (horizDistToTower < 3.2) {
      // Đang đứng trên sàn đài bắn cung
      targetGroundY = 3.5;
    } else if (Math.abs(this.playerPos.x) < 2.0 && this.playerPos.z >= 14 && this.playerPos.z < 22) {
      // Đang đi trên cầu thang dẫn lên đài: dốc thoải mượt mà từ 0m lên 3.5m!
      const stairProgress = (this.playerPos.z - 14) / (22 - 14);
      targetGroundY = stairProgress * 3.5;
    }

    const eyeHeight = 1.7;
    const targetEyeY = targetGroundY + eyeHeight;
    // Dùng nội suy mượt mà (Linear Interpolation) để camera lướt êm ái
    this.playerPos.y += (targetEyeY - this.playerPos.y) * 0.15;

    // Giảm độ giật lùi recoil
    if (this.recoilOffset > 0.001) {
      this.recoilOffset *= 0.88;
    }

    // Cập nhật Camera
    this.camera.position.set(
      this.playerPos.x,
      this.playerPos.y,
      this.playerPos.z + this.recoilOffset
    );
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.cameraYaw;
    this.camera.rotation.x = this.cameraPitch;
  }

  // Cập nhật ánh sáng, hạt tàn lửa & lau sậy đung đưa
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

    // Cập nhật hạt tàn lửa bay
    if (this.sparkParticles && this.sparkPositions) {
      const posAttr = this.sparkParticles.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) + delta * 1.4;
        if (y > 9) y = 0.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  }

  // Cập nhật mũi tên đang bay
  private updateFlyingArrows(delta: number) {
    for (let i = this.activeFlyingArrows.length - 1; i >= 0; i--) {
      const arrow = this.activeFlyingArrows[i];
      arrow.mesh.position.addScaledVector(arrow.vel, delta);
      arrow.life += delta;

      if (arrow.mesh.position.distanceTo(arrow.targetPos) < 2.2 || arrow.life > 1.6) {
        sound.playArrowHit();

        const target = this.targetPavilions.find((t) => !t.hit);
        if (target) {
          target.hit = true;
          target.group.rotation.x = 0.5;
          target.group.position.y -= 0.6;

          // Thêm ngọn lửa bốc cháy trên bia tiêu
          const fireLight = new THREE.PointLight(0xff3300, 3.5, 12);
          fireLight.position.set(0, 3.0, 0);
          target.group.add(fireLight);
          target.fireLight = fireLight;

          this.targetsDestroyed++;
          this.callbacks.onTargetHit(this.targetsDestroyed);

          if (this.targetsDestroyed >= 3) {
            sound.playBronzeDrum();
            sound.playChapterVictory();
            this.callbacks.onChapterComplete();
          }
        }

        this.scene.remove(arrow.mesh);
        this.activeFlyingArrows.splice(i, 1);
      }
    }
  }

  // Raycasting tương tác
  private checkRaycastInteractions() {
    let closestInteractable: { id: string; name: string; prompt: string } | null = null;
    let minDistance = 4.5;

    const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);

    this.interactableObjects.forEach((item) => {
      // Tính khoảng cách tới vị trí tương tác
      const toItem = item.interactionPos.clone().sub(this.camera.position);
      const dist = toItem.length();

      if (dist <= item.radius) {
        toItem.normalize();
        const dot = cameraForward.dot(toItem);
        if (dot > 0.65 && dist < minDistance) {
          minDistance = dist;
          let prompt = item.prompt;
          if (item.id === 'STATION_CROSSBOW') {
            if (this.collectedShards.size < 3) {
              prompt = `[E] Giá Nỏ Thần (Cần tìm đủ 3 mảnh ghép: ${this.collectedShards.size}/3)`;
            } else if (!this.isCrossbowAssembled) {
              prompt = '[E] Lắp Ráp & Kéo Căng Dây Nỏ Thần!';
            } else {
              prompt = '[E hoặc Click] BẮN NỎ THẦN LIÊN CHÂU!';
            }
          }
          closestInteractable = { id: item.id, name: item.name, prompt };
        }
      }
    });

    if (closestInteractable && (closestInteractable as { id: string }).id !== this.currentHoveredId) {
      this.currentHoveredId = (closestInteractable as { id: string }).id;
      this.callbacks.onHoverInteractable(closestInteractable);
    } else if (!closestInteractable && this.currentHoveredId) {
      this.currentHoveredId = null;
      this.callbacks.onHoverInteractable(null);
    }
  }

  // Cập nhật la bàn phương vị 3D
  private updateCompassRadar() {
    const yawDeg = ((this.cameraYaw * 180) / Math.PI) % 360;

    const targets = this.interactableObjects.map((item) => {
      const dx = item.interactionPos.x - this.playerPos.x;
      const dz = item.interactionPos.z - this.playerPos.z;
      const targetAngle = (Math.atan2(dx, -dz) * 180) / Math.PI;
      const relativeAngle = ((targetAngle - yawDeg + 540) % 360) - 180;
      const dist = Math.round(Math.sqrt(dx * dx + dz * dz));

      return {
        id: item.id,
        name: item.name,
        angle: relativeAngle,
        distance: dist,
      };
    });

    this.callbacks.onCompassUpdate(yawDeg, targets);
  }

  // Dọn dẹp tài nguyên
  public dispose() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('click', this.requestPointerLock);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }

  private onWindowResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };
}
