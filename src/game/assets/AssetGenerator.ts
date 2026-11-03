import Phaser from 'phaser';

/**
 * Bộ khởi tạo tài nguyên đồ họa 2D Top-Down Minh Họa cho Phaser 3.
 * Vẽ chi tiết nhân vật (có đầu, tóc, khăn vấn, khuôn mặt, vạt áo giao lĩnh, thắt lưng, tay chân bước đi),
 * các NPC đặc trưng từng vai trò, nhà tranh vách đất, lều quân sự, lò rèn đỏ lửa, cây đa, rặng tre,
 * thuyền gỗ, cột mốc đá đo thủy triều và bãi cọc bịt sắt.
 */
export class AssetGenerator {
  public static generateAll(scene: Phaser.Scene) {
    this.createCharacterSpritesheet(scene, 'player_brown', {
      tunic: '#7C4D2B',
      collar: '#F5EFE1',
      sash: '#9B1D20',
      headband: '#9B1D20',
      hair: '#23170F',
      skin: '#F3C697',
      bag: true,
    });

    this.createCharacterSpritesheet(scene, 'player_indigo', {
      tunic: '#234B6E',
      collar: '#F5EFE1',
      sash: '#C99726',
      headband: '#C99726',
      hair: '#23170F',
      skin: '#F3C697',
      bag: true,
    });

    // NPC Cụ Trưởng Thôn (tóc bạc, râu dài, áo nâu trầm, chống gậy)
    this.createCharacterSpritesheet(scene, 'npc_elder', {
      tunic: '#5C3D28',
      collar: '#DEC59C',
      sash: '#8C6B38',
      headband: '#6E4D25',
      hair: '#DCD7CE',
      skin: '#E8BC8E',
      beard: '#EAE6DF',
      staff: true,
    });

    // NPC Đội Trưởng Lê (giáp hộ tâm, khăn đỏ viền đồng)
    this.createCharacterSpritesheet(scene, 'npc_commander', {
      tunic: '#8B1E1E',
      collar: '#C99726',
      sash: '#C99726',
      headband: '#8B1E1E',
      hair: '#1F120B',
      skin: '#E6B583',
      armorChest: '#4A2F22',
    });

    // NPC Bác Thợ Rèn Tạo (tạp dề da, khăn đỏ, tay cầm búa rèn)
    this.createCharacterSpritesheet(scene, 'npc_blacksmith', {
      tunic: '#A65E2E',
      collar: '#5C3A21',
      sash: '#2F1B12',
      headband: '#C43D38',
      hair: '#1F120B',
      skin: '#D99B66',
      beard: '#2A1B12',
      armorChest: '#3A2113',
      hammer: true,
    });

    // NPC Trinh Sát Hải (áo chàm thủy quân, nón lá đeo lưng)
    this.createCharacterSpritesheet(scene, 'npc_scout', {
      tunic: '#184F63',
      collar: '#D5EFF4',
      sash: '#C99726',
      headband: '#237B96',
      hair: '#1F120B',
      skin: '#ECC090',
      backHat: true,
    });

    // NPC Dân binh & Quân sĩ vạt cọc
    this.createCharacterSpritesheet(scene, 'npc_villager', {
      tunic: '#6E4D25',
      collar: '#EBDDC1',
      sash: '#4A2F22',
      headband: '#8C6B38',
      hair: '#23170F',
      skin: '#E8BC8E',
    });

    // NPC Tiền Ngô Vương Ngô Quyền (Áo bào đỏ son, giáp đồng vàng, mũ đâu mâu)
    this.createCharacterSpritesheet(scene, 'npc_ngo_quyen', {
      tunic: '#9B1D20',
      collar: '#F5E1A4',
      sash: '#C99726',
      headband: '#C99726',
      hair: '#1F120B',
      skin: '#ECC092',
      armorChest: '#C99726',
      crown: true,
    });

    this.createEnvironmentAssets(scene);
  }

  /**
   * Tạo spritesheet nhân vật 4 frames (0: Idle 1, 1: Walk Left, 2: Idle 2, 3: Walk Right)
   * Kích thước mỗi frame: 64x72 px
   */
  private static createCharacterSpritesheet(
    scene: Phaser.Scene,
    key: string,
    cfg: {
      tunic: string;
      collar: string;
      sash: string;
      headband: string;
      hair: string;
      skin: string;
      beard?: string;
      armorChest?: string;
      bag?: boolean;
      staff?: boolean;
      hammer?: boolean;
      backHat?: boolean;
      crown?: boolean;
    }
  ) {
    if (scene.textures.exists(key)) return;

    const frameW = 64;
    const frameH = 72;
    const totalFrames = 4;
    const canvasTexture = scene.textures.createCanvas(key, frameW * totalFrames, frameH);
    if (!canvasTexture) return;
    const ctx = canvasTexture.getContext();

    for (let f = 0; f < totalFrames; f++) {
      const ox = f * frameW;
      const walkSwing = f === 1 ? -5 : f === 3 ? 5 : 0;
      const bobY = f === 1 || f === 3 ? -2 : f === 2 ? 1 : 0;

      ctx.save();
      ctx.translate(ox, 0);

      // 1. Bóng đổ dưới chân
      ctx.fillStyle = 'rgba(28, 15, 10, 0.28)';
      ctx.beginPath();
      ctx.ellipse(32, 64, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Nón lá đeo sau lưng (nếu có)
      if (cfg.backHat) {
        ctx.fillStyle = '#DEC59C';
        ctx.strokeStyle = '#6E4D25';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(32, 32 + bobY, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 3. Đôi chân & Quần (chuyển động bước đi rõ rệt)
      const leftLegY = 53 + (walkSwing > 0 ? -3 : walkSwing < 0 ? 3 : 0);
      const rightLegY = 53 + (walkSwing > 0 ? 3 : walkSwing < 0 ? -3 : 0);

      // Quần vải
      ctx.fillStyle = '#EAE2D3';
      ctx.strokeStyle = '#3D271D';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, 22, leftLegY - 6, 8, 13, 3, true, true);
      this.roundRect(ctx, 34, rightLegY - 6, 8, 13, 3, true, true);

      // Giày/xà cạp
      ctx.fillStyle = '#4A2F22';
      this.roundRect(ctx, 22, leftLegY + 4, 8, 5, 2, true, false);
      this.roundRect(ctx, 34, rightLegY + 4, 8, 5, 2, true, false);

      // 4. Thân áo giao lĩnh / Áo chiến
      ctx.fillStyle = cfg.tunic;
      ctx.strokeStyle = '#2A1810';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(20, 32 + bobY);
      ctx.lineTo(44, 32 + bobY);
      ctx.lineTo(47, 55 + bobY);
      ctx.lineTo(17, 55 + bobY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Giáp ngực / Tạp dề (nếu có)
      if (cfg.armorChest) {
        ctx.fillStyle = cfg.armorChest;
        this.roundRect(ctx, 22, 34 + bobY, 20, 17, 3, true, true);
      }

      // Cổ áo vạt chéo chữ Y
      ctx.strokeStyle = cfg.collar;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(26, 32 + bobY);
      ctx.lineTo(32, 42 + bobY);
      ctx.lineTo(38, 32 + bobY);
      ctx.stroke();

      // Đai lưng (Sash)
      ctx.fillStyle = cfg.sash;
      ctx.fillRect(19, 45 + bobY, 26, 4);

      // Túi đeo chéo của người đưa tin
      if (cfg.bag) {
        ctx.strokeStyle = '#D8B378';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(22, 33 + bobY);
        ctx.lineTo(42, 49 + bobY);
        ctx.stroke();
        ctx.fillStyle = '#B88B4B';
        this.roundRect(ctx, 38, 44 + bobY, 9, 8, 2, true, true);
      }

      // 5. Đôi tay vung theo nhịp bước
      const leftArmY = 34 + bobY - walkSwing * 0.6;
      const rightArmY = 34 + bobY + walkSwing * 0.6;

      ctx.fillStyle = cfg.tunic;
      ctx.strokeStyle = '#2A1810';
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, 13, leftArmY, 7, 13, 3, true, true);
      this.roundRect(ctx, 44, rightArmY, 7, 13, 3, true, true);

      // Bàn tay
      ctx.fillStyle = cfg.skin;
      ctx.beginPath();
      ctx.arc(16.5, leftArmY + 13, 3, 0, Math.PI * 2);
      ctx.arc(47.5, rightArmY + 13, 3, 0, Math.PI * 2);
      ctx.fill();

      // Công cụ cầm tay (Gậy trúc của Trưởng thôn hoặc Búa của Thợ rèn)
      if (cfg.staff) {
        ctx.strokeStyle = '#8C6D18';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, 22 + bobY);
        ctx.lineTo(50, 64);
        ctx.stroke();
      }
      if (cfg.hammer) {
        ctx.strokeStyle = '#5C3A21';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(48, rightArmY + 14);
        ctx.lineTo(56, rightArmY + 4);
        ctx.stroke();
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(52, rightArmY + 1, 8, 5);
      }

      // 6. Đầu, Khuôn mặt & Tóc
      ctx.fillStyle = cfg.skin;
      ctx.strokeStyle = '#4A2F22';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(32, 22 + bobY, 11, 11.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Búi tóc đỉnh đầu & Mái tóc
      ctx.fillStyle = cfg.hair;
      ctx.beginPath();
      ctx.arc(32, 9 + bobY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(32, 19 + bobY, 11, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();

      // Khăn vấn trán hoặc Mũ Đâu Mâu
      ctx.fillStyle = cfg.headband;
      ctx.fillRect(21, 14 + bobY, 22, 4);
      if (cfg.crown) {
        ctx.fillStyle = '#C99726';
        ctx.beginPath();
        ctx.moveTo(22, 15 + bobY);
        ctx.lineTo(32, 6 + bobY);
        ctx.lineTo(42, 15 + bobY);
        ctx.closePath();
        ctx.fill();
      }

      // Đôi mắt, chân mày và miệng
      ctx.fillStyle = '#1F120B';
      ctx.beginPath();
      ctx.arc(28, 22 + bobY, 1.6, 0, Math.PI * 2);
      ctx.arc(36, 22 + bobY, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Chòm râu (nếu có)
      if (cfg.beard) {
        ctx.fillStyle = cfg.beard;
        ctx.beginPath();
        ctx.moveTo(26, 28 + bobY);
        ctx.quadraticCurveTo(32, 39 + bobY, 38, 28 + bobY);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.strokeStyle = '#7A3E26';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(32, 26 + bobY, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    }

    canvasTexture.refresh();

    // Chia frame vào texture để Phaser.Animations sử dụng
    const tex = scene.textures.get(key);
    for (let f = 0; f < totalFrames; f++) {
      tex.add(f, 0, f * frameW, 0, frameW, frameH);
    }

    // Đăng ký animation đứng yên và bước đi
    if (!scene.anims.exists(`${key}_idle`)) {
      scene.anims.create({
        key: `${key}_idle`,
        frames: [
          { key, frame: 0 },
          { key, frame: 2 },
        ],
        frameRate: 2.5,
        repeat: -1,
      });
    }

    if (!scene.anims.exists(`${key}_walk`)) {
      scene.anims.create({
        key: `${key}_walk`,
        frames: [
          { key, frame: 1 },
          { key, frame: 0 },
          { key, frame: 3 },
          { key, frame: 2 },
        ],
        frameRate: 7,
        repeat: -1,
      });
    }
  }

  private static createEnvironmentAssets(scene: Phaser.Scene) {
    // 1. Nhà tranh vách đất (Village House - 180x140)
    if (!scene.textures.exists('house_thatch')) {
      const t = scene.textures.createCanvas('house_thatch', 180, 140)!;
      const ctx = t.getContext();
      // Bóng nhà
      ctx.fillStyle = 'rgba(28, 15, 10, 0.22)';
      this.roundRect(ctx, 14, 48, 156, 86, 10, true, false);
      // Vách đất vàng nâu & Hiên gỗ
      ctx.fillStyle = '#D9BE96';
      ctx.strokeStyle = '#4A2F22';
      ctx.lineWidth = 3;
      this.roundRect(ctx, 20, 62, 140, 64, 4, true, true);
      // Cửa gỗ & Cửa sổ song tre
      ctx.fillStyle = '#4A2F22';
      ctx.fillRect(74, 82, 32, 44);
      ctx.fillStyle = '#6E4D25';
      ctx.fillRect(34, 80, 24, 22);
      ctx.fillRect(122, 80, 24, 22);
      // Mái lá cọ / rơm nhiều tầng
      ctx.fillStyle = '#9E7B42';
      ctx.strokeStyle = '#4A2F22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 72);
      ctx.lineTo(35, 18);
      ctx.lineTo(145, 18);
      ctx.lineTo(172, 72);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Sống nóc mái & Khói rơm
      ctx.fillStyle = '#6E4D25';
      ctx.fillRect(32, 14, 116, 8);
      ctx.strokeStyle = '#7A5A2B';
      ctx.lineWidth = 1.5;
      for (let x = 22; x < 160; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 24);
        ctx.lineTo(x - 6, 70);
        ctx.stroke();
      }
      t.refresh();
    }

    // 2. Lều chỉ huy doanh trại (Command Tent - 190x150)
    if (!scene.textures.exists('tent_command')) {
      const t = scene.textures.createCanvas('tent_command', 190, 150)!;
      const ctx = t.getContext();
      ctx.fillStyle = 'rgba(28, 15, 10, 0.25)';
      ctx.beginPath();
      ctx.ellipse(95, 125, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vải lều màu kem viền đỏ son
      ctx.fillStyle = '#EFE3C8';
      ctx.strokeStyle = '#7B1E1E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(15, 115);
      ctx.lineTo(95, 22);
      ctx.lineTo(175, 115);
      ctx.lineTo(150, 130);
      ctx.lineTo(40, 130);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cửa lều vén hai bên
      ctx.fillStyle = '#2F1B12';
      ctx.beginPath();
      ctx.moveTo(70, 130);
      ctx.lineTo(95, 72);
      ctx.lineTo(120, 130);
      ctx.closePath();
      ctx.fill();

      // Cờ đại kỳ trên đỉnh lều
      ctx.fillStyle = '#9B1D20';
      ctx.fillRect(93, 4, 4, 24);
      ctx.beginPath();
      ctx.moveTo(97, 5);
      ctx.lineTo(132, 12);
      ctx.lineTo(97, 20);
      ctx.closePath();
      ctx.fill();
      t.refresh();
    }

    // 3. Lò rèn dã chiến (Blacksmith Forge - 140x110)
    if (!scene.textures.exists('forge_station')) {
      const t = scene.textures.createCanvas('forge_station', 140, 110)!;
      const ctx = t.getContext();
      // Bệ đá lò rèn
      ctx.fillStyle = '#5A534A';
      ctx.strokeStyle = '#2A2520';
      ctx.lineWidth = 3;
      this.roundRect(ctx, 12, 24, 72, 58, 8, true, true);
      // Lửa than hồng đỏ rực
      const grad = ctx.createRadialGradient(48, 52, 4, 48, 52, 26);
      grad.addColorStop(0, '#FFF3B0');
      grad.addColorStop(0.5, '#F97316');
      grad.addColorStop(1, '#9B1D20');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(48, 52, 22, 0, Math.PI * 2);
      ctx.fill();
      // Đe sắt bên phải
      ctx.fillStyle = '#374151';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      this.roundRect(ctx, 96, 48, 32, 18, 4, true, true);
      // Thùng gỗ đựng nước tôi sắt
      ctx.fillStyle = '#7C4D2B';
      ctx.beginPath();
      ctx.arc(110, 86, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3EA2BD';
      ctx.beginPath();
      ctx.arc(110, 86, 11, 0, Math.PI * 2);
      ctx.fill();
      t.refresh();
    }

    // 4. Cây đa cổ thụ & Bụi tre làng
    if (!scene.textures.exists('tree_banyan')) {
      const t = scene.textures.createCanvas('tree_banyan', 150, 150)!;
      const ctx = t.getContext();
      ctx.fillStyle = 'rgba(20, 30, 15, 0.24)';
      ctx.beginPath();
      ctx.ellipse(75, 128, 52, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // Thân cây đa nhiều rễ phụ
      ctx.fillStyle = '#6E4D25';
      ctx.strokeStyle = '#3D271D';
      ctx.lineWidth = 2.5;
      ctx.fillRect(62, 78, 26, 48);
      ctx.strokeRect(62, 78, 26, 48);
      // Tán lá nhiều tầng xanh mát
      const circles = [
        { x: 45, y: 65, r: 32, c: '#2D5A27' },
        { x: 105, y: 65, r: 32, c: '#2D5A27' },
        { x: 75, y: 45, r: 40, c: '#3B7A33' },
        { x: 60, y: 55, r: 28, c: '#4C9141' },
        { x: 92, y: 55, r: 26, c: '#4C9141' },
      ];
      circles.forEach((c) => {
        ctx.fillStyle = c.c;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });
      t.refresh();
    }

    if (!scene.textures.exists('tree_bamboo')) {
      const t = scene.textures.createCanvas('tree_bamboo', 100, 120)!;
      const ctx = t.getContext();
      ctx.fillStyle = 'rgba(20, 30, 15, 0.2)';
      ctx.beginPath();
      ctx.ellipse(50, 106, 32, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Các thân tre có đốt
      [36, 48, 60, 68].forEach((bx, i) => {
        ctx.strokeStyle = i % 2 === 0 ? '#4D7C0F' : '#65A30D';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(bx, 104);
        ctx.quadraticCurveTo(bx + (i - 1.5) * 5, 55, bx + (i - 1.5) * 9, 18);
        ctx.stroke();
      });
      // Tán lá tre
      ctx.fillStyle = '#4D7C0F';
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.ellipse(25 + (i % 4) * 16, 22 + Math.floor(i / 4) * 16, 14, 6, (i % 3) * 0.4 - 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      t.refresh();
    }

    // 5. Đống cọc gỗ vạt nhọn bịt sắt trên bờ (Stake Pile - 110x70)
    if (!scene.textures.exists('stake_pile')) {
      const t = scene.textures.createCanvas('stake_pile', 110, 70)!;
      const ctx = t.getContext();
      for (let i = 0; i < 4; i++) {
        const y = 16 + i * 12;
        // Thân gỗ lớn
        ctx.fillStyle = '#8C5835';
        ctx.strokeStyle = '#3D271D';
        ctx.lineWidth = 2;
        ctx.fillRect(12, y, 68, 10);
        ctx.strokeRect(12, y, 68, 10);
        // Đầu vạt nhọn bịt sắt xám bạc
        ctx.fillStyle = '#9CA3AF';
        ctx.beginPath();
        ctx.moveTo(80, y);
        ctx.lineTo(102, y + 5);
        ctx.lineTo(80, y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      t.refresh();
    }

    // 6. Cọc gỗ bịt sắt đóng dưới lòng sông (River Stake - 36x64)
    if (!scene.textures.exists('river_stake')) {
      const t = scene.textures.createCanvas('river_stake', 36, 64)!;
      const ctx = t.getContext();
      // Thân cọc gỗ dưới nước
      ctx.fillStyle = '#7C4D2B';
      ctx.strokeStyle = '#2F1B12';
      ctx.lineWidth = 2;
      ctx.fillRect(11, 22, 14, 34);
      ctx.strokeRect(11, 22, 14, 34);
      // Đầu cọc vạt nhọn bịt sắt
      ctx.fillStyle = '#D1D5DB';
      ctx.beginPath();
      ctx.moveTo(18, 4);
      ctx.lineTo(27, 23);
      ctx.lineTo(9, 23);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gợn nước quanh chân cọc
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(18, 52, 15, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      t.refresh();
    }

    // 7. Cột Mốc Đá Đo Thủy Triều (Tide Marker Pillar - 56x96)
    if (!scene.textures.exists('tide_marker')) {
      const t = scene.textures.createCanvas('tide_marker', 56, 96)!;
      const ctx = t.getContext();
      // Trụ đá khắc vạch
      ctx.fillStyle = '#9CA3AF';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2.5;
      this.roundRect(ctx, 14, 10, 28, 78, 5, true, true);
      // Các vạch khắc mực nước (Đỏ: Nước lớn, Vàng: Trung bình, Xanh: Nước ròng)
      ctx.strokeStyle = '#9B1D20';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(16, 26);
      ctx.lineTo(40, 26);
      ctx.stroke();

      ctx.strokeStyle = '#D97706';
      ctx.beginPath();
      ctx.moveTo(16, 48);
      ctx.lineTo(40, 48);
      ctx.stroke();

      ctx.strokeStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.moveTo(16, 70);
      ctx.lineTo(40, 70);
      ctx.stroke();
      t.refresh();
    }

    // 8. Thuyền Trinh Sát Nhẹ của Quân Ta (Scout Boat - 130x56)
    if (!scene.textures.exists('boat_scout')) {
      const t = scene.textures.createCanvas('boat_scout', 130, 56)!;
      const ctx = t.getContext();
      ctx.fillStyle = '#8C5835';
      ctx.strokeStyle = '#2F1B12';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, 28);
      ctx.quadraticCurveTo(65, 4, 122, 28);
      ctx.quadraticCurveTo(65, 52, 8, 28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Khoang ván thuyền
      ctx.fillStyle = '#CFA872';
      ctx.fillRect(36, 20, 56, 16);
      // Lá cờ đỏ nhỏ ở mũi thuyền
      ctx.fillStyle = '#9B1D20';
      ctx.beginPath();
      ctx.moveTo(110, 10);
      ctx.lineTo(126, 16);
      ctx.lineTo(110, 22);
      ctx.closePath();
      ctx.fill();
      t.refresh();
    }

    // 9. Chiến Thuyền Lớn Nam Hán (Enemy Warship - 170x76)
    if (!scene.textures.exists('boat_enemy')) {
      const t = scene.textures.createCanvas('boat_enemy', 170, 76)!;
      const ctx = t.getContext();
      ctx.fillStyle = '#3F2318';
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 38);
      ctx.quadraticCurveTo(85, 4, 160, 38);
      ctx.quadraticCurveTo(85, 72, 10, 38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Lầu thuyền chiến nặng nề
      ctx.fillStyle = '#581C1C';
      ctx.fillRect(48, 20, 74, 36);
      ctx.strokeRect(48, 20, 74, 36);
      t.refresh();
    }

    // 10. Vật phẩm Bao Than Củi trên bến làng (Charcoal Bundle - 48x48)
    if (!scene.textures.exists('item_charcoal')) {
      const t = scene.textures.createCanvas('item_charcoal', 48, 48)!;
      const ctx = t.getContext();
      ctx.fillStyle = '#A67C52';
      ctx.strokeStyle = '#3D271D';
      ctx.lineWidth = 2;
      this.roundRect(ctx, 8, 14, 32, 26, 8, true, true);
      // Than đen nhô lên miệng bao
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(20, 14, 6, 0, Math.PI * 2);
      ctx.arc(28, 13, 6, 0, Math.PI * 2);
      ctx.fill();
      // Dây thừng buộc bao
      ctx.strokeStyle = '#C99726';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, 22);
      ctx.lineTo(36, 22);
      ctx.stroke();
      t.refresh();
    }
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }
}
