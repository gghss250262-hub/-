import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Stage, Substance } from '../types/game';
import { SUBSTANCES } from '../data/substances';
import {
  Rotate3d,
  Maximize2,
  ZoomIn,
  Eye,
  Info,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface VirtualLab3DProps {
  stage: Stage;
  currentTemp: number;
  targetTemp: number;
  valveOpen: boolean;
  onToggleValve: () => void;
  // Stage 1 density solid
  stage1Liquid: 'none' | 'water' | 'salt_water';
  stage1ScoopedPP: boolean;
  stage1ScoopedPS: boolean;
  onScoopPP: () => void;
  onScoopPS: () => void;
  // Stage 2 density liquid
  funnelLevels: { oil: number; water: number; ccl4: number };
  // Stage 3 boiling point
  hasBoilingChips: boolean;
  coolingWaterOn: boolean;
  distilledEthanol: number;
  onAddBoilingChips: () => void;
  // Stage 4 & 5 solubility
  sandSaltStep: string;
  kno3Step: string;
  precipitatedGrams: number;
  masterStep: number;
}

export const VirtualLab3D: React.FC<VirtualLab3DProps> = ({
  stage,
  currentTemp,
  targetTemp,
  valveOpen,
  onToggleValve,
  stage1Liquid,
  stage1ScoopedPP,
  stage1ScoopedPS,
  onScoopPP,
  onScoopPS,
  funnelLevels,
  hasBoilingChips,
  coolingWaterOn,
  distilledEthanol,
  onAddBoilingChips,
  sandSaltStep,
  kno3Step,
  precipitatedGrams,
  masterStep
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const apparatusGroupRef = useRef<THREE.Group | null>(null);

  // Dynamic mesh references for 60fps animations
  const dynamicMeshes = useRef<{
    valveHandle?: THREE.Mesh;
    oilLayer?: THREE.Mesh;
    waterLayer?: THREE.Mesh;
    ccl4Layer?: THREE.Mesh;
    boilingBubbles?: THREE.Group;
    distillDrops?: THREE.Group;
    steamParticles?: THREE.Points;
    precipitateCrystals?: THREE.Group;
    thermometerMercury?: THREE.Mesh;
    hotplateGlow?: THREE.Mesh;
    ppChips?: THREE.Group;
    psChips?: THREE.Group;
    tankWater?: THREE.Mesh;
  }>({});

  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene, Camera, Renderer Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 2. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent camera from going beneath table
    controls.minDistance = 2.0;
    controls.maxDistance = 9.0;
    controls.target.set(0, 1.4, 0);
    controlsRef.current = controls;

    // 3. Lighting Rig (Warm Key + Cool Fill + Floor Grounding)
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.7);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    // 4. Laboratory Environment: Bench, Tiles & Contact Grounding
    const tableGroup = new THREE.Group();

    // Lab Bench Table Top (Dark Acid-Resistant Epoxy Finish)
    const benchGeo = new THREE.BoxGeometry(6.5, 0.2, 4);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.1
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -0.1, 0);
    bench.receiveShadow = true;
    tableGroup.add(bench);

    // Table Bevel Trim
    const trimGeo = new THREE.BoxGeometry(6.56, 0.04, 4.06);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.7
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.02, 0);
    tableGroup.add(trim);

    // Bench Grid Decal (Safety Marking Tiles)
    const gridHelper = new THREE.GridHelper(5.5, 11, 0x334155, 0x1e293b);
    gridHelper.position.set(0, 0.01, 0);
    tableGroup.add(gridHelper);

    // Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(6, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05070d,
      transparent: true,
      opacity: 0.75
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.005, 0);
    tableGroup.add(shadowPlane);

    scene.add(tableGroup);

    // 5. Build Procedural 3D Apparatus Group
    const apparatusGroup = new THREE.Group();
    apparatusGroupRef.current = apparatusGroup;
    scene.add(apparatusGroup);

    build3DApparatus(stage, apparatusGroup, dynamicMeshes.current);

    // 6. Raycasting for Tooltip / Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(apparatusGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name && obj !== apparatusGroup) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          setHoveredPart(obj.name);
        } else {
          setHoveredPart(null);
        }
      } else {
        setHoveredPart(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(apparatusGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name && obj !== apparatusGroup) {
          obj = obj.parent;
        }
        if (obj && obj.name) {
          if (obj.name.includes('밸브') || obj.name.includes('꼭지')) {
            onToggleValve();
          } else if (obj.name.includes('끓임쪽') || obj.name.includes('비등석')) {
            onAddBoilingChips();
          } else if (obj.name.includes('PP')) {
            onScoopPP();
          } else if (obj.name.includes('PS')) {
            onScoopPS();
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 7. Render Loop with High-Frequency Physics
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      // Dynamic bubbling animation when heating in distillation
      if (dynamicMeshes.current.boilingBubbles) {
        dynamicMeshes.current.boilingBubbles.children.forEach((child, i) => {
          child.position.y += delta * 0.4;
          if (child.position.y > 0.45) {
            child.position.y = -0.15;
            child.position.x = (Math.random() - 0.5) * 0.35;
            child.position.z = (Math.random() - 0.5) * 0.35;
          }
        });
      }

      // Distill droplets dripping
      if (dynamicMeshes.current.distillDrops) {
        dynamicMeshes.current.distillDrops.children.forEach((drop, i) => {
          drop.position.y -= delta * 1.2;
          if (drop.position.y < -0.4) {
            drop.position.y = 0.5;
          }
        });
      }

      // Steam particles rising in evaporation
      if (dynamicMeshes.current.steamParticles) {
        const positions = dynamicMeshes.current.steamParticles.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          let y = positions.getY(i) + delta * 0.5;
          if (y > 1.2) y = 0.1;
          positions.setY(i, y);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, [stage.id]);

  // Sync Dynamic Props to 3D Meshes in real-time
  useEffect(() => {
    // 1. Valve Rotation (Stopcock)
    if (dynamicMeshes.current.valveHandle) {
      dynamicMeshes.current.valveHandle.rotation.y = valveOpen ? Math.PI / 2 : 0;
    }

    // 2. Liquid Layer Scales in Separatory Funnel
    if (dynamicMeshes.current.ccl4Layer) {
      const s = Math.max(0.01, funnelLevels.ccl4 / 40);
      dynamicMeshes.current.ccl4Layer.scale.set(s, s, s);
      dynamicMeshes.current.ccl4Layer.visible = funnelLevels.ccl4 > 0;
    }
    if (dynamicMeshes.current.waterLayer) {
      const s = Math.max(0.01, funnelLevels.water / 40);
      dynamicMeshes.current.waterLayer.scale.set(s, s, s);
      dynamicMeshes.current.waterLayer.visible = funnelLevels.water > 0;
    }
    if (dynamicMeshes.current.oilLayer) {
      const s = Math.max(0.01, funnelLevels.oil / 40);
      dynamicMeshes.current.oilLayer.scale.set(s, s, s);
      dynamicMeshes.current.oilLayer.visible = funnelLevels.oil > 0;
    }

    // 3. Stage 1 Plastic chips floating heights
    if (dynamicMeshes.current.ppChips) {
      dynamicMeshes.current.ppChips.position.y =
        stage1Liquid === 'none' ? 0.35 : 1.35; // floats in water
      dynamicMeshes.current.ppChips.visible = !stage1ScoopedPP;
    }
    if (dynamicMeshes.current.psChips) {
      dynamicMeshes.current.psChips.position.y =
        stage1Liquid === 'salt_water' ? 1.35 : 0.35; // floats only in salt water
      dynamicMeshes.current.psChips.visible = !stage1ScoopedPS;
    }
    if (dynamicMeshes.current.tankWater) {
      dynamicMeshes.current.tankWater.visible = stage1Liquid !== 'none';
      if (dynamicMeshes.current.tankWater.material instanceof THREE.MeshStandardMaterial) {
        dynamicMeshes.current.tankWater.material.color.setHex(
          stage1Liquid === 'salt_water' ? 0x2dd4bf : 0x38bdf8
        );
      }
    }

    // 4. Hotplate heater glow
    if (dynamicMeshes.current.hotplateGlow) {
      if (dynamicMeshes.current.hotplateGlow.material instanceof THREE.MeshBasicMaterial) {
        dynamicMeshes.current.hotplateGlow.material.color.setHex(
          currentTemp > 60 ? 0xff4500 : 0x334155
        );
      }
    }

    // 5. Thermometer Mercury Column height
    if (dynamicMeshes.current.thermometerMercury) {
      const fraction = Math.min(1.0, Math.max(0.05, currentTemp / 120));
      dynamicMeshes.current.thermometerMercury.scale.y = fraction;
    }

    // 6. Recrystallization crystal count / visibility
    if (dynamicMeshes.current.precipitateCrystals) {
      dynamicMeshes.current.precipitateCrystals.visible = kno3Step === 'cooled_crystals';
    }
  }, [
    valveOpen,
    funnelLevels,
    stage1Liquid,
    stage1ScoopedPP,
    stage1ScoopedPS,
    currentTemp,
    kno3Step
  ]);

  // Camera Presets
  const setCameraPreset = (preset: 'default' | 'closeup' | 'top') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (preset === 'default') {
      cameraRef.current.position.set(0, 3.2, 5.8);
      controlsRef.current.target.set(0, 1.4, 0);
    } else if (preset === 'closeup') {
      cameraRef.current.position.set(0, 1.8, 3.2);
      controlsRef.current.target.set(0, 1.4, 0);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 5.8, 1.8);
      controlsRef.current.target.set(0, 1.0, 0);
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* 3D Canvas Mounting Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Controls: Top Left Spec Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md">
          <Rotate3d className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-xs font-bold text-white">3D 가상 과학 실험실</span>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
            Interactive PBR
          </span>
        </div>

        {hoveredPart && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-500/80 text-amber-200 text-xs font-bold shadow-lg animate-fade-in">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>선택: {hoveredPart} (클릭하여 조작)</span>
          </div>
        )}
      </div>

      {/* Floating 3D HUD Controls: Top Right Camera Angle Switcher */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
        <button
          onClick={() => setCameraPreset('default')}
          className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="기본 시점"
        >
          <Eye className="w-3.5 h-3.5" /> 기본 시점
        </button>
        <button
          onClick={() => setCameraPreset('closeup')}
          className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="장치 확대"
        >
          <ZoomIn className="w-3.5 h-3.5" /> 장치 확대
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
          title="상단 투시"
        >
          <Maximize2 className="w-3.5 h-3.5" /> 상단 뷰
        </button>
      </div>

      {/* 3D Navigation Guide Tip */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800/80">
        <span>🖱️ 마우스 드래그로 회전 | 스크롤로 줌 | 3D 부품 직접 클릭 조작 가능</span>
      </div>
    </div>
  );
};

// =========================================================================
// Procedural 3D Apparatus Construction
// =========================================================================
function build3DApparatus(stage: Stage, group: THREE.Group, dynamicRefs: any) {
  // Clear any existing children
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  // Common PBR Materials
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.93,
    opacity: 1,
    transparent: true,
    roughness: 0.08,
    ior: 1.52,
    thickness: 0.4,
    depthWrite: false
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.35
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.25
  });

  // Retort Stand (Base + Rod + Clamp)
  function createRetortStand(xOffset = 0, yHeight = 2.8) {
    const stand = new THREE.Group();

    // Heavy Cast Iron Base
    const baseGeo = new THREE.BoxGeometry(1.2, 0.1, 0.9);
    const baseMesh = new THREE.Mesh(baseGeo, ironMat);
    baseMesh.position.set(xOffset, 0.05, 0);
    baseMesh.castShadow = true;
    stand.add(baseMesh);

    // Vertical Iron Rod
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, yHeight, 16);
    const rodMesh = new THREE.Mesh(rodGeo, ironMat);
    rodMesh.position.set(xOffset - 0.4, yHeight / 2 + 0.1, 0);
    rodMesh.castShadow = true;
    stand.add(rodMesh);

    // Ring Clamp
    const clampRingGeo = new THREE.TorusGeometry(0.5, 0.03, 12, 32);
    const clampRingMesh = new THREE.Mesh(clampRingGeo, brassMat);
    clampRingMesh.rotation.x = Math.PI / 2;
    clampRingMesh.position.set(xOffset, yHeight * 0.65, 0);
    stand.add(clampRingMesh);

    // Clamp Arm connection
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12);
    const armMesh = new THREE.Mesh(armGeo, brassMat);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.set(xOffset - 0.2, yHeight * 0.65, 0);
    stand.add(armMesh);

    return stand;
  }

  // =========================================================================
  // STAGE 1 & 7: DENSITY SOLID BATH (PP & PS PLASTIC OR RICE SEEDS)
  // =========================================================================
  if (stage.id === 'stage_1' || stage.id === 'stage_7') {
    // Transparent Acrylic Tank
    const tankGroup = new THREE.Group();

    const tankOuterGeo = new THREE.BoxGeometry(2.4, 1.8, 1.6);
    const tankMesh = new THREE.Mesh(tankOuterGeo, glassMat);
    tankMesh.position.set(0, 0.95, 0);
    tankGroup.add(tankMesh);

    // Tank Base Frame
    const frameGeo = new THREE.BoxGeometry(2.5, 0.08, 1.7);
    const frameMesh = new THREE.Mesh(frameGeo, ironMat);
    frameMesh.position.set(0, 0.04, 0);
    tankGroup.add(frameMesh);

    // Water Volume
    const waterGeo = new THREE.BoxGeometry(2.3, 1.2, 1.5);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.75, 0);
    dynamicRefs.tankWater = waterMesh;
    tankGroup.add(waterMesh);

    // PP Plastic Chips (Green, Density 0.90)
    const ppGroup = new THREE.Group();
    ppGroup.name = 'PP 플라스틱 조각 (0.90g/cm³)';
    const ppMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    for (let i = 0; i < 18; i++) {
      const chipGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
      const chip = new THREE.Mesh(chipGeo, ppMat);
      chip.position.set(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 1.0
      );
      chip.rotation.set(Math.random(), Math.random(), Math.random());
      ppGroup.add(chip);
    }
    ppGroup.position.set(0, 0.35, 0);
    dynamicRefs.ppChips = ppGroup;
    tankGroup.add(ppGroup);

    // PS Plastic Chips (Red, Density 1.05)
    const psGroup = new THREE.Group();
    psGroup.name = 'PS 플라스틱 조각 (1.05g/cm³)';
    const psMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
    for (let i = 0; i < 18; i++) {
      const chipGeo = new THREE.BoxGeometry(0.12, 0.08, 0.12);
      const chip = new THREE.Mesh(chipGeo, psMat);
      chip.position.set(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 1.0
      );
      chip.rotation.set(Math.random(), Math.random(), Math.random());
      psGroup.add(chip);
    }
    psGroup.position.set(0, 0.35, 0);
    dynamicRefs.psChips = psGroup;
    tankGroup.add(psGroup);

    group.add(tankGroup);
  }

  // =========================================================================
  // STAGE 2: SEPARATORY FUNNEL (DENSITY LIQUID - OIL, WATER, CCL4)
  // =========================================================================
  else if (stage.id === 'stage_2') {
    // Retort Stand
    group.add(createRetortStand(0, 3.2));

    const funnelGroup = new THREE.Group();
    funnelGroup.position.set(0, 2.0, 0);

    // Pear-shaped Glass Funnel Body using LatheGeometry
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0.04, -0.6)); // Stem bottom
    points.push(new THREE.Vector2(0.04, -0.1)); // Stem top
    points.push(new THREE.Vector2(0.12, 0.0));  // Stopcock neck
    points.push(new THREE.Vector2(0.45, 0.5));  // Lower bulb
    points.push(new THREE.Vector2(0.55, 0.8));  // Upper bulb
    points.push(new THREE.Vector2(0.5, 1.1));   // Shoulder
    points.push(new THREE.Vector2(0.2, 1.3));   // Neck
    points.push(new THREE.Vector2(0.22, 1.35)); // Rim

    const funnelGeo = new THREE.LatheGeometry(points, 32);
    const funnelMesh = new THREE.Mesh(funnelGeo, glassMat);
    funnelGroup.add(funnelMesh);

    // Glass Stopper at Top
    const stopperGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.3, 16);
    const stopperMesh = new THREE.Mesh(stopperGeo, glassMat);
    stopperMesh.position.set(0, 1.45, 0);
    funnelGroup.add(stopperMesh);

    // 3D Stopcock Valve Block & Rotatable Handle
    const valveBlockGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
    const valveBlockMesh = new THREE.Mesh(valveBlockGeo, glassMat);
    valveBlockMesh.rotation.z = Math.PI / 2;
    valveBlockMesh.position.set(0, -0.05, 0);
    funnelGroup.add(valveBlockMesh);

    // Valve Handle Lever (Interactive Clickable)
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.name = '분별깔때기 밸브 꼭지 (클릭하여 개폐)';
    handleMesh.rotation.x = Math.PI / 2;
    handleMesh.position.set(0.15, -0.05, 0);
    dynamicRefs.valveHandle = handleMesh;
    funnelGroup.add(handleMesh);

    // Liquid Layers inside Funnel
    // 1. Bottom: CCl4 (Purple, density 1.59)
    const ccl4Geo = new THREE.ConeGeometry(0.35, 0.35, 24);
    const ccl4Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    });
    const ccl4Mesh = new THREE.Mesh(ccl4Geo, ccl4Mat);
    ccl4Mesh.rotation.x = Math.PI;
    ccl4Mesh.position.set(0, 0.25, 0);
    dynamicRefs.ccl4Layer = ccl4Mesh;
    funnelGroup.add(ccl4Mesh);

    // 2. Middle: Water (Cyan, density 1.00)
    const waterGeo = new THREE.CylinderGeometry(0.48, 0.35, 0.3, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, 0.55, 0);
    dynamicRefs.waterLayer = waterMesh;
    funnelGroup.add(waterMesh);

    // 3. Top: Oil (Golden, density 0.92)
    const oilGeo = new THREE.CylinderGeometry(0.52, 0.48, 0.3, 24);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    });
    const oilMesh = new THREE.Mesh(oilGeo, oilMat);
    oilMesh.position.set(0, 0.85, 0);
    dynamicRefs.oilLayer = oilMesh;
    funnelGroup.add(oilMesh);

    // Receiving Beaker on Table
    const beakerGeo = new THREE.CylinderGeometry(0.45, 0.4, 0.8, 24);
    const beakerMesh = new THREE.Mesh(beakerGeo, glassMat);
    beakerMesh.position.set(0, 0.4, 0);
    funnelGroup.add(beakerMesh);

    group.add(funnelGroup);
  }

  // =========================================================================
  // STAGE 3 & 8: DISTILLATION (ETHANOL/WATER OR CRUDE OIL)
  // =========================================================================
  else if (stage.id === 'stage_3' || stage.id === 'stage_8') {
    // 1. Hot Plate Base with Glowing Element
    const heaterGroup = new THREE.Group();
    heaterGroup.position.set(-1.2, 0.25, 0);

    const heaterBodyGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
    const heaterBodyMesh = new THREE.Mesh(heaterBodyGeo, ironMat);
    heaterBodyMesh.castShadow = true;
    heaterGroup.add(heaterBodyMesh);

    // Glowing Ceramic Burner Ring
    const burnerRingGeo = new THREE.TorusGeometry(0.45, 0.08, 16, 32);
    const burnerMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const burnerMesh = new THREE.Mesh(burnerRingGeo, burnerMat);
    burnerMesh.rotation.x = Math.PI / 2;
    burnerMesh.position.set(0, 0.21, 0);
    dynamicRefs.hotplateGlow = burnerMesh;
    heaterGroup.add(burnerMesh);

    group.add(heaterGroup);

    // 2. Round-bottom Flask with Branch (가지 달린 둥근바닥 플라스크)
    const distilFlask = new THREE.Group();
    distilFlask.position.set(-1.2, 1.0, 0);

    const sphereGeo = new THREE.SphereGeometry(0.65, 32, 24);
    const sphereMesh = new THREE.Mesh(sphereGeo, glassMat);
    distilFlask.add(sphereMesh);

    // Flask Neck
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.9, 24);
    const neckMesh = new THREE.Mesh(neckGeo, glassMat);
    neckMesh.position.set(0, 0.8, 0);
    distilFlask.add(neckMesh);

    // Side-arm branch tube extending towards condenser
    const branchGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16);
    const branchMesh = new THREE.Mesh(branchGeo, glassMat);
    branchMesh.rotation.z = -Math.PI / 3;
    branchMesh.position.set(0.35, 0.85, 0);
    distilFlask.add(branchMesh);

    // Mixture Liquid in flask
    const liquidGeo = new THREE.SphereGeometry(0.62, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.set(0, 0, 0);
    distilFlask.add(liquidMesh);

    // 3D Boiling Chips (끓임쪽) inside flask
    const chipsGroup = new THREE.Group();
    chipsGroup.name = '끓임쪽(비등석) - 돌비 현상 방지';
    for (let i = 0; i < 4; i++) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.06);
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set((i - 1.5) * 0.1, -0.55, (Math.random() - 0.5) * 0.15);
      chipsGroup.add(stone);
    }
    distilFlask.add(chipsGroup);

    // Boiling Bubbles Group
    const bubblesGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const bGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const bMat = new THREE.MeshBasicMaterial({ color: 0xa7f3d0, transparent: true, opacity: 0.8 });
      const b = new THREE.Mesh(bGeo, bMat);
      b.position.set((Math.random() - 0.5) * 0.4, -0.3 + Math.random() * 0.5, (Math.random() - 0.5) * 0.4);
      bubblesGroup.add(b);
    }
    dynamicRefs.boilingBubbles = bubblesGroup;
    distilFlask.add(bubblesGroup);

    // Thermometer (온도계)
    const thermGroup = new THREE.Group();
    thermGroup.name = '온도계 (구부가 가지 입구 높이에 위치)';
    thermGroup.position.set(0, 1.2, 0);

    const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.2, 16);
    const stemMesh = new THREE.Mesh(stemGeo, glassMat);
    thermGroup.add(stemMesh);

    const mercGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12);
    const mercMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const mercMesh = new THREE.Mesh(mercGeo, mercMat);
    mercMesh.position.set(0, -0.15, 0);
    dynamicRefs.thermometerMercury = mercMesh;
    thermGroup.add(mercMesh);

    distilFlask.add(thermGroup);
    group.add(distilFlask);

    // 3. Liebig Condenser (리비히 냉각기)
    const condenser = new THREE.Group();
    condenser.position.set(0.65, 1.45, 0);
    condenser.rotation.z = -Math.PI / 6;

    // Outer Cooling Jacket
    const jacketGeo = new THREE.CylinderGeometry(0.22, 0.22, 2.2, 24);
    const jacketMesh = new THREE.Mesh(jacketGeo, glassMat);
    condenser.add(jacketMesh);

    // Inner Vapor Tube
    const innerTubeGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.6, 16);
    const innerTubeMesh = new THREE.Mesh(innerTubeGeo, glassMat);
    condenser.add(innerTubeMesh);

    // Water Inlet / Outlet Nozzles
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const inNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), nozzleMat);
    inNozzle.position.set(0.22, -0.8, 0);
    inNozzle.rotation.z = Math.PI / 2;
    condenser.add(inNozzle);

    const outNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12), nozzleMat);
    outNozzle.position.set(0.22, 0.8, 0);
    outNozzle.rotation.z = Math.PI / 2;
    condenser.add(outNozzle);

    group.add(condenser);

    // 4. Receiving Flask / Erlenmeyer at the end
    const receivingFlask = new THREE.Group();
    receivingFlask.position.set(1.8, 0.5, 0);

    const erlenGeo = new THREE.CylinderGeometry(0.12, 0.5, 0.9, 24);
    const erlenMesh = new THREE.Mesh(erlenGeo, glassMat);
    receivingFlask.add(erlenMesh);

    // Dripping Drops inside
    const drops = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const dropMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x34d399 })
      );
      dropMesh.position.set(0, 0.2 - i * 0.2, 0);
      drops.add(dropMesh);
    }
    dynamicRefs.distillDrops = drops;
    receivingFlask.add(drops);

    group.add(receivingFlask);
  }

  // =========================================================================
  // STAGE 4, 5, 6: SOLUBILITY / RECRYSTALLIZATION / MASTER
  // =========================================================================
  else {
    // Retort Stand with Funnel & Filter Paper
    group.add(createRetortStand(-0.5, 3.0));

    const filtrationGroup = new THREE.Group();
    filtrationGroup.position.set(-0.5, 1.8, 0);

    // Glass Funnel
    const funnelPoints: THREE.Vector2[] = [];
    funnelPoints.push(new THREE.Vector2(0.05, -0.6));
    funnelPoints.push(new THREE.Vector2(0.05, 0.0));
    funnelPoints.push(new THREE.Vector2(0.55, 0.6));
    funnelPoints.push(new THREE.Vector2(0.56, 0.65));

    const funnelGeo = new THREE.LatheGeometry(funnelPoints, 24);
    const funnelMesh = new THREE.Mesh(funnelGeo, glassMat);
    filtrationGroup.add(funnelMesh);

    // Conical White Filter Paper (거름종이)
    const paperGeo = new THREE.ConeGeometry(0.52, 0.55, 24, 1, true);
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const paperMesh = new THREE.Mesh(paperGeo, paperMat);
    paperMesh.position.set(0, 0.3, 0);
    paperMesh.name = '원뿔형 거름종이 (녹지 않는 모래/결정 걸러냄)';
    filtrationGroup.add(paperMesh);

    // Receiving Beaker underneath
    const catchBeaker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.4, 0.8, 24),
      glassMat
    );
    catchBeaker.position.set(0, -1.35, 0);
    filtrationGroup.add(catchBeaker);

    group.add(filtrationGroup);

    // Evaporating Dish on Hot Plate (Right Side)
    const evapGroup = new THREE.Group();
    evapGroup.position.set(1.4, 0.4, 0);

    // Tripod & Ceramic Wire Gauze (삼발이 & 쇠그물)
    const tripodGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 24);
    const tripodMesh = new THREE.Mesh(tripodGeo, ironMat);
    tripodMesh.position.set(0, 0.35, 0);
    evapGroup.add(tripodMesh);

    // Ceramic Porcelain Evaporating Dish (증발 접시)
    const dishGeo = new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25
    });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI;
    dishMesh.position.set(0, 0.7, 0);
    evapGroup.add(dishMesh);

    // Burner Flame underneath
    const flameGeo = new THREE.ConeGeometry(0.18, 0.35, 12);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(0, 0.15, 0);
    evapGroup.add(flameMesh);

    // Precipitate Crystals (KNO3 재결정)
    const crystals = new THREE.Group();
    crystals.name = '질산칼륨(KNO₃) 석출 결정';
    for (let i = 0; i < 20; i++) {
      const cGeo = new THREE.OctahedronGeometry(0.06);
      const cMat = new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        metalness: 0.5,
        roughness: 0.1
      });
      const c = new THREE.Mesh(cGeo, cMat);
      c.position.set(
        (Math.random() - 0.5) * 0.45,
        0.55 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.45
      );
      crystals.add(c);
    }
    dynamicRefs.precipitateCrystals = crystals;
    evapGroup.add(crystals);

    // Steam Particles in Evaporation
    const steamGeo = new THREE.BufferGeometry();
    const steamCount = 30;
    const pos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 0.5;
      pos[i + 1] = 0.6 + Math.random() * 0.6;
      pos[i + 2] = (Math.random() - 0.5) * 0.5;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.4
    });
    const steamPts = new THREE.Points(steamGeo, steamMat);
    dynamicRefs.steamParticles = steamPts;
    evapGroup.add(steamPts);

    group.add(evapGroup);
  }
}
