import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkles, CheckCircle2, RotateCw, X } from 'lucide-react';
import type { CoLoaRelicId } from '../../types';
import { CO_LOA_RELICS } from '../../data/chapterCoLoa';

interface RelicInspectionModalProps {
  relicId: CoLoaRelicId | null;
  onClose: () => void;
}

export const RelicInspectionModal: React.FC<RelicInspectionModalProps> = ({ relicId, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // 1. Thoát Pointer Lock ngay lập tức khi mở modal
  useEffect(() => {
    if (relicId && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [relicId]);

  // 2. Cho phép bấm phím tắt để đóng modal tiện lợi
  useEffect(() => {
    if (!relicId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [relicId, onClose]);

  // 3. Khởi tạo Không Gian Trưng Bày Bảo Tàng 3D Ánh Sáng Cao Cấp
  useEffect(() => {
    if (!relicId || !mountRef.current) return;
    const relic = CO_LOA_RELICS[relicId];
    if (!relic) return;

    const container = mountRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    // Nền gradient ấm áp phong cách phòng trưng bày di sản quốc gia
    scene.background = new THREE.Color(0x2a1c14);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45; // Tăng sáng rực rỡ
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // --- HỆ THỐNG ÁNH SÁNG SPOTLIGHT PHÒNG TRƯNG BÀY CAO CẤP ---
    // 1. Ánh sáng môi trường dịu ấm
    const ambientLight = new THREE.AmbientLight(0xffedd5, 1.4);
    scene.add(ambientLight);

    // 2. Đèn chiếu rọi chính (Key Spotlight) từ trên xuống rọi thẳng vào cổ vật
    const keySpot = new THREE.SpotLight(0xfff3d1, 4.2, 12, Math.PI / 4, 0.35, 1.2);
    keySpot.position.set(1.5, 4.0, 2.8);
    keySpot.castShadow = true;
    scene.add(keySpot);

    // 3. Đèn hắt cạnh viền (Rim Light) ánh vàng hoàng gia
    const rimLight = new THREE.DirectionalLight(0xffa726, 2.5);
    rimLight.position.set(-2.5, 2.0, -2.5);
    scene.add(rimLight);

    // 4. Đèn hắt dưới bục (Pedestal Underlight) ánh xanh ngọc dịu
    const underLight = new THREE.PointLight(0x44ffaa, 1.8, 4.0);
    underLight.position.set(0, -0.6, 0.5);
    scene.add(underLight);

    // --- BỤC TRƯNG BÀY CỔ VẬT HOÀNG KIM (DISPLAY PEDESTAL) ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -1.1;

    // Bệ đá hoa sen mạ vàng
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d2716,
      roughness: 0.5,
      metalness: 0.6,
    });
    const baseCylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.5, 32), baseMat);
    baseCylinder.receiveShadow = true;
    pedestalGroup.add(baseCylinder);

    // Vành đồng sáng bóng quanh bục
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x5a3f0a,
    });
    const goldenRing = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.05, 16, 48), ringMat);
    goldenRing.rotation.x = Math.PI / 2;
    goldenRing.position.y = 0.25;
    pedestalGroup.add(goldenRing);

    scene.add(pedestalGroup);

    // --- MÔ HÌNH CỔ VẬT 3D CHI TIẾT & SÁNG RỰC RỠ ---
    const relicGroup = new THREE.Group();
    relicGroup.position.y = -0.15;

    // Chất liệu đồng thau Đông Sơn bóng bẩy phản chiếu ánh sáng
    const brightBronzeMat = new THREE.MeshStandardMaterial({
      color: 0xdfab3f,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x4a320d,
      emissiveIntensity: 0.35,
    });

    if (relic.modelType === 'trigger') {
      // 1. LẪY NỎ ĐỒNG KIM QUY (3 BỘ PHẬN CHUYỂN ĐỘNG)
      // Hộp cò lẫy
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.55), brightBronzeMat);
      body.castShadow = true;
      relicGroup.add(body);

      // Ngàm giữ dây nỏ vút cong
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 8), brightBronzeMat);
      claw.position.set(0, 0.75, 0.12);
      claw.rotation.x = 0.25;
      claw.castShadow = true;
      relicGroup.add(claw);

      // Lẫy cò bên dưới
      const triggerArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.25), brightBronzeMat);
      triggerArm.position.set(0, -0.7, -0.12);
      triggerArm.rotation.x = -0.35;
      triggerArm.castShadow = true;
      relicGroup.add(triggerArm);

      // Hạt ngọc Kim Quy phát sáng giữa tâm lẫy
      const gem = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x44ffaa, emissive: 0x00ff88, emissiveIntensity: 0.9 })
      );
      gem.position.set(0, 0.1, 0.3);
      relicGroup.add(gem);
    } else if (relic.modelType === 'stock') {
      // 2. THÂN NỎ ĐÔNG SƠN (GỖ DÂU RỪNG NẠM ĐỒNG)
      const polishedWoodMat = new THREE.MeshStandardMaterial({
        color: 0x8a481d,
        roughness: 0.45,
        metalness: 0.15,
      });

      const stock = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 0.28), polishedWoodMat);
      stock.castShadow = true;
      relicGroup.add(stock);

      // Rãnh trượt tên đồng bằng kim loại sáng
      const bronzeTracks = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.32), brightBronzeMat);
      bronzeTracks.position.y = 0.16;
      bronzeTracks.castShadow = true;
      relicGroup.add(bronzeTracks);

      // Cánh ngang giữ nỏ
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 2.0), brightBronzeMat);
      crossBeam.position.x = 0.85;
      crossBeam.castShadow = true;
      relicGroup.add(crossBeam);
    } else {
      // 3. ỐNG ĐỰNG TÊN ĐỒNG 3 CẠNH CẦU VỰC
      const quiverMat = new THREE.MeshStandardMaterial({
        color: 0xc99c38,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x3d2708,
      });

      // Ống đựng bằng đồng thau chạm hoa văn
      const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.55, 1.8, 24), quiverMat);
      quiver.castShadow = true;
      relicGroup.add(quiver);

      // Vành đai hoa văn chim Lạc
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.2, 24), brightBronzeMat);
      rim.position.y = 0.8;
      relicGroup.add(rim);

      // Chùm 7 mũi tên đồng 3 cạnh hình cánh én nhô lên sáng bóng
      const arrowTipMat = new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0x4a3408,
      });

      for (let i = 0; i < 7; i++) {
        const arrowGroup = new THREE.Group();
        const angle = (i / 7) * Math.PI * 2;
        arrowGroup.position.set(Math.cos(angle) * 0.24, 1.1 + (i % 2) * 0.18, Math.sin(angle) * 0.24);

        // Mũi tên 3 cạnh hình cánh én
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.75, 3), arrowTipMat);
        head.rotation.x = Math.PI;
        arrowGroup.add(head);

        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6),
          new THREE.MeshStandardMaterial({ color: 0x5c4028 })
        );
        shaft.position.y = -0.4;
        arrowGroup.add(shaft);

        relicGroup.add(arrowGroup);
      }
    }

    scene.add(relicGroup);

    // Kéo chuột xoay cổ vật
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      prevMouseX = clientX;
      prevMouseY = clientY;

      relicGroup.rotation.y += dx * 0.012;
      relicGroup.rotation.x += dy * 0.012;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    let frameId: number;
    const animateRelic = () => {
      frameId = requestAnimationFrame(animateRelic);
      if (!isDragging) {
        relicGroup.rotation.y += 0.009; // Tự động xoay chậm nhẹ nhàng
      }
      renderer.render(scene, camera);
    };
    animateRelic();

    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [relicId]);

  if (!relicId) return null;
  const relic = CO_LOA_RELICS[relicId];
  if (!relic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-parchment-100 border-2 border-bronze rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-lacquer via-crimson to-lacquer p-3.5 text-parchment-100 flex items-center justify-between border-b border-bronze/50 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-200/90 font-mono">
                Cổ Vật Đã Thu Nhận • 3D Inspection
              </span>
              <h3 className="font-title text-base sm:text-lg font-bold text-white leading-tight">
                {relic.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block px-2.5 py-1 rounded bg-black/40 border border-amber-400/40 text-xs font-mono text-amber-200">
              {relic.locationName}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Đóng (phím ESC / E)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Model Viewport (Ánh sáng rực rỡ phong cách bảo tàng cao cấp) */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#3a281c] via-[#241710] to-[#140c08] flex items-center justify-center border-b border-bronze/40 shadow-inner">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-amber-400/30 text-[11px] text-amber-200 pointer-events-none shadow-md">
            <RotateCw className="w-3 h-3 text-amber-400 animate-spin-slow" />
            <span>Kéo chuột / Vuốt để xoay 360°</span>
          </div>
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-[10px] text-amber-300 font-mono">
            ★ Phòng Trưng Bày Bảo Vật Quốc Gia
          </div>
        </div>

        {/* Thông tin khảo cổ & lịch sử */}
        <div className="p-4 overflow-y-auto space-y-3 text-sm text-lacquer">
          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
            <h4 className="text-xs font-bold text-crimson uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Bằng Chứng Khảo Cổ Học</span>
            </h4>
            <p className="text-xs sm:text-sm text-lacquer/90 leading-relaxed font-serif">
              {relic.archaeologicalFact}
            </p>
          </div>

          <div className="text-[11px] text-lacquer/70 font-mono">
            <strong>Nguồn sử liệu & di tích:</strong> {relic.historicalSource}
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-3 bg-parchment-200 border-t border-parchment-300 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-lacquer/70 font-mono hidden sm:block">
            Mẹo: Bấm phím <strong className="text-crimson">[E]</strong> hoặc <strong className="text-crimson">[Enter]</strong> để đóng
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-crimson to-amber-700 text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>[Phím E] Lưu Vào Bàn Lắp Ráp & Tiếp Tục</span>
          </button>
        </div>
      </div>
    </div>
  );
};
