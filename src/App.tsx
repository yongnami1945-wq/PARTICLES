import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { MorphConfig, MorphShape, PerformanceStats, ImportedPresetResult } from './types';
import { 
  generateSaturn, generateStarship, generateTreeOfLife, 
  generateAngelWings, generateDiamondCrystal, generateTrefoilKnot, 
  generateCyberSkull, generateSphere, generateTorus, generateDNA, 
  generateGalaxy, generateHeart, generateCube, generateTextShape,
  generateCosmicAmbientDrift, generateGravityVortexNebula, generateQuantumField,
  generateFlockingBirds, generateSnowflakeCrystal, generateEarthGlobe
} from './utils/shapeGenerators';
import { exportMorphToStandaloneHtml, exportPureParticleHtml, exportPureParticleCmd } from './utils/htmlExporter';
import { 
  saveWorkspaceState, 
  loadWorkspaceState, 
  serializeMorphShape, 
  deserializeMorphShape, 
  getAutoRestoreEnabled 
} from './utils/presetManager';
import { RibbonMenuBar } from './components/RibbonMenuBar';
import { ParticleCanvas, ParticleCanvasHandle } from './components/ParticleCanvas';
import { ControlPanel } from './components/ControlPanel';
import { ImageUploaderModal } from './components/ImageUploaderModal';
import { WasmModal } from './components/WasmModal';
import { PythonModal } from './components/PythonModal';
import { TheoryModal } from './components/TheoryModal';
import { ColorMixerModal } from './components/ColorMixerModal';
import { WebParticleHubModal } from './components/WebParticleHubModal';
import { HtmlFileEditorModal } from './components/HtmlFileEditorModal';
import { VisualTimelineEditor } from './components/VisualTimelineEditor';
import { GCodeExportModal } from './components/GCodeExportModal';
import { VideoRecorderModal } from './components/VideoRecorderModal';
import { SaveNamedPresetModal } from './components/SaveNamedPresetModal';
import { ImportNamedPresetModal } from './components/ImportNamedPresetModal';
import { useHistoryManager } from './utils/useHistoryManager';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Waves, Camera, Sparkles, 
  PanelRightOpen, PanelRightClose, Layers, HardDrive, Maximize2,
  Zap, Clock, X, Video, Undo2, Redo2
} from 'lucide-react';

export default function App() {
  const DEFAULT_COUNT = 60000;
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  // Initialize creative and intuitive procedural 3D shapes & free-floating particle fields
  const initialShapes: MorphShape[] = useMemo(() => {
    const cosmicDrift = generateCosmicAmbientDrift(100000);
    const gravityVortex = generateGravityVortexNebula(100000);
    const quantumField = generateQuantumField(100000);
    const saturn = generateSaturn(100000);
    const starship = generateStarship(100000);
    const tree = generateTreeOfLife(100000);
    const wings = generateAngelWings(100000);
    const diamond = generateDiamondCrystal(100000);
    const trefoil = generateTrefoilKnot(100000);
    const skull = generateCyberSkull(100000);
    const galaxy = generateGalaxy(100000);
    const dna = generateDNA(100000);
    const heart = generateHeart(100000);
    const torus = generateTorus(100000);
    const sphere = generateSphere(100000);
    const flockingBirds = generateFlockingBirds(100000);
    const snowflakeCrystal = generateSnowflakeCrystal(100000);
    const earthGlobe = generateEarthGlobe(100000);
    const textShape = generateTextShape('HY태고딕 2D', 100000);

    return [
      {
        id: 'earth',
        name: '🌍 Three.js WebGPU 지구 & 대기권 (Earth Globe)',
        type: 'preset',
        positions: earthGlobe.positions,
        colors: earthGlobe.colors,
        description: 'Three.js WebGPU 기반 대륙, 해양, 구름층, 1.04x 프레넬 대기권(#4db2ff/#bc490b) 3D 지구',
      },
      {
        id: 'snowflake-crystal',
        name: '❄️ 크리스탈 스노우 (Snowflake Dendrite)',
        type: 'preset',
        positions: snowflakeCrystal.positions,
        colors: snowflakeCrystal.colors,
        description: '6방 대칭 덴드라이트 나뭇가지형 가지와 3D 얼음 결정 바늘 (Three.js Sprites)',
      },
      {
        id: 'flocking-birds',
        name: '🦅 GPGPU 군집 비행 (Flocking Birds)',
        type: 'preset',
        positions: flockingBirds.positions,
        colors: flockingBirds.colors,
        description: 'Boids 군집 알고리즘과 3D 날개짓 조류 편대 비행 (GPGPU Swarm)',
      },
      {
        id: 'text-hygothic',
        name: '✍️ HY태고딕 2D 텍스트 (2D Typography)',
        type: 'preset',
        positions: textShape.positions,
        colors: textShape.colors,
        description: 'Z=0 2D 평면 고선명도 HY태고딕 한글/고딕 파티클',
      },
      {
        id: 'cosmic-drift',
        name: '🌌 자유 부유 입자장 (Cosmic Free Drift)',
        type: 'preset',
        positions: cosmicDrift.positions,
        colors: cosmicDrift.colors,
        description: '공간 전체를 자유롭게 떠돌며 마우스 중력장에 반응하는 출발 입자장',
      },
      {
        id: 'gravity-vortex',
        name: '🌀 마우스 중력 와류 성운 (Gravity Vortex)',
        type: 'preset',
        positions: gravityVortex.positions,
        colors: gravityVortex.colors,
        description: '마우스 커서 중력장에 실시간 인력/척력/와류 반응하는 성운',
      },
      {
        id: 'quantum-field',
        name: '⚡ 양자 파동 에너지장 (Quantum Field)',
        type: 'preset',
        positions: quantumField.positions,
        colors: quantumField.colors,
        description: '3차원 양자 정상파 에너지 격자 및 파동 수렴 입자 클러스터',
      },
      {
        id: 'saturn',
        name: '🪐 토성 행성계 (Saturn & Rings)',
        type: 'preset',
        positions: saturn.positions,
        colors: saturn.colors,
        description: '카시니 간극 고리와 27도 자전축 3D 토성',
      },
      {
        id: 'starship',
        name: '🛸 사이버 스타십 (Cyber Starship)',
        type: 'preset',
        positions: starship.positions,
        colors: starship.colors,
        description: '델타익 퓨슬라지와 트윈 이온 플라즈마 추진기',
      },
      {
        id: 'tree',
        name: '🌳 생명의 나무 (Tree of Life)',
        type: 'preset',
        positions: tree.positions,
        colors: tree.colors,
        description: '3D 프랙탈 가지와 생체 발광 에메랄드 캐노피',
      },
      {
        id: 'wings',
        name: '🪽 천사의 날개 (Angel Wings)',
        type: 'preset',
        positions: wings.positions,
        colors: wings.colors,
        description: '3D 곡면 깃털 아치 날개와 홀로그램 오로라',
      },
      {
        id: 'diamond',
        name: '💎 스타 다이아몬드 (Diamond Gem)',
        type: 'preset',
        positions: diamond.positions,
        colors: diamond.colors,
        description: '다면체 결정체와 궤도 프리즘 파편',
      },
      {
        id: 'trefoil',
        name: '🌀 뫼비우스 매듭 (Trefoil Knot)',
        type: 'preset',
        positions: trefoil.positions,
        colors: trefoil.colors,
        description: '위상수학 3D 토러스 매듭과 플라즈마 스트림',
      },
      {
        id: 'skull',
        name: '💀 사이버 스컬 (Cybernetic Skull)',
        type: 'preset',
        positions: skull.positions,
        colors: skull.colors,
        description: '3D 두개골 안와 구조와 네온 턱라인',
      },
      {
        id: 'galaxy',
        name: '🌌 코스믹 은하 (Milky Way)',
        type: 'preset',
        positions: galaxy.positions,
        colors: galaxy.colors,
        description: '4나선 소용돌이 은하 파티클 클라우드',
      },
      {
        id: 'dna',
        name: '🧬 DNA 이중 나선 (DNA Helix)',
        type: 'preset',
        positions: dna.positions,
        colors: dna.colors,
        description: '염기쌍 브릿지 결합 이중 나선',
      },
      {
        id: 'heart',
        name: '❤️ 3D 네온 하트 (Heart)',
        type: 'preset',
        positions: heart.positions,
        colors: heart.colors,
        description: '카디오이드 입체 심장 형상',
      },
      {
        id: 'torus',
        name: '🍩 네온 토러스 (Torus)',
        type: 'preset',
        positions: torus.positions,
        colors: torus.colors,
        description: '원환체 도넛 3D 지오메트리',
      },
      {
        id: 'sphere',
        name: '🔮 홀로그램 구체 (Sphere)',
        type: 'preset',
        positions: sphere.positions,
        colors: sphere.colors,
        description: '균일 표면 구체 입자 분산',
      },
    ];
  }, []);

  const [shapes, setShapes] = useState<MorphShape[]>(initialShapes);
  const [sourceShapeId, setSourceShapeId] = useState<string>('cosmic-drift');
  const [targetShapeId, setTargetShapeId] = useState<string>('saturn');
  const [waypointShapeIds, setWaypointShapeIds] = useState<string[]>([]);

  // Simulation & Visual Configuration
  const [config, setConfig] = useState<MorphConfig>({
    particleCount: DEFAULT_COUNT,
    progress: 0.0,
    isPlaying: true,
    playSpeed: 0.8,
    playMode: 'pingpong',
    morphEasing: 'ease-in-out',
    
    // Physics & Noise (defaults matched with PDF Houdini & Three.js spec)
    noiseAmp: 1.5,
    noiseFreq: 0.8,
    noiseSpeed: 0.7,
    noiseType: 'curl',
    delayMode: 'random',
    delaySpread: 0.45,
    durationVariance: 0.2,
    attractStrength: 20.0,
    damping: 0.9,
    
    // Visual & Particle Types
    particleType: 'star',
    shapeRotation: 0,
    coreRatio: 0.8,

    // Color Mixing & Shader Visuals
    colorMixMode: 'interpolate',
    colorScheme: 'original',
    colorA: '#00f0ff',
    colorB: '#ff007f',
    colorC: '#ffe600',
    colorMixRatio: 0.5,
    velocityColorShift: 1.0,
    colorGamma: 1.0,

    pointSize: 2.5,
    glowIntensity: 1.4,
    blending: 'additive',
    autoRotate: true,
    rotateSpeed: 0.6,
    depthTest: false,
    backgroundColor: '#030712',

    // Motion Trails & Ghost Path Highlighting
    trailsEnabled: false,
    trailLength: 0.85,
    motionBlurIntensity: 1.0,

    // Bloom & Post-Processing (Enhanced Glowing Aesthetic)
    bloomEnabled: true,
    bloomStrength: 1.2,
    bloomRadius: 0.6,
    bloomThreshold: 0.15,
    bloomToneMappingExposure: 1.0,

    // Interactive Mouse Gravity & Free-Floating Ambient Field
    mouseGravityEnabled: true,
    mouseGravityRadius: 6.0,
    mouseGravityStrength: 3.5,
    mouseGravityMode: 'attract',
    ambientDriftAmp: 1.3,
    
    // Engine Mode (GPU GLSL Shader or WebAssembly C++ SIMD)
    engineMode: 'glsl',
  });

  const [fps, setFps] = useState<number>(60);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    vertexCount: DEFAULT_COUNT,
    gpuMemoryMb: 18.4,
    vboMemoryMb: 3.9,
    renderBufferMemoryMb: 14.5,
    drawCalls: 1,
  });
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isWebHubOpen, setIsWebHubOpen] = useState<boolean>(false);
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [isWasmModalOpen, setIsWasmModalOpen] = useState<boolean>(false);
  const [isTheoryModalOpen, setIsTheoryModalOpen] = useState<boolean>(false);
  const [theoryModalPage, setTheoryModalPage] = useState<number>(13);
  const [isColorMixerOpen, setIsColorMixerOpen] = useState<boolean>(false);
  const [isGCodeModalOpen, setIsGCodeModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isSaveNamedPresetOpen, setIsSaveNamedPresetOpen] = useState<boolean>(false);
  const [isImportNamedPresetOpen, setIsImportNamedPresetOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState<boolean>(false);

  // Action Feedback Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Global State History Stack (Undo / Redo / State Snapshots)
  const historyManager = useHistoryManager({
    config,
    sourceShapeId,
    targetShapeId,
    waypointShapeIds,
    shapes,
    setConfig,
    setSourceShapeId,
    setTargetShapeId,
    setWaypointShapeIds,
    setShapes,
    onShowToast: showToast,
  });

  // Apply Imported Named Preset
  const handleApplyNamedPreset = useCallback((result: ImportedPresetResult) => {
    if (result.shapes && result.shapes.length > 0) {
      setShapes((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const toAdd = result.shapes.filter((s) => !existingIds.has(s.id));
        return [...toAdd, ...prev];
      });
    }

    if (result.sourceShapeId) setSourceShapeId(result.sourceShapeId);
    if (result.targetShapeId) setTargetShapeId(result.targetShapeId);
    if (Array.isArray(result.waypointShapeIds)) {
      setWaypointShapeIds(result.waypointShapeIds);
    } else if (Array.isArray(result.morphChain) && result.morphChain.length >= 2) {
      setWaypointShapeIds(result.morphChain.slice(1, result.morphChain.length - 1));
    } else {
      setWaypointShapeIds([]);
    }
    if (result.morphChain && result.morphChain.length >= 2) {
      setSourceShapeId(result.morphChain[0]);
      setTargetShapeId(result.morphChain[result.morphChain.length - 1]);
    }

    if (result.config) {
      setConfig((prev) => ({
        ...prev,
        ...result.config,
        progress: prev.progress,
      }));
    }

    historyManager.recordAction(`프리셋 [${result.name || 'JSON 파일'}] 적용`);
  }, [historyManager]);

  // Restore Workspace state from Local Storage on initial startup
  useEffect(() => {
    if (getAutoRestoreEnabled()) {
      const saved = loadWorkspaceState();
      if (saved) {
        if (saved.customShapes && saved.customShapes.length > 0) {
          const restoredShapes = saved.customShapes.map(deserializeMorphShape);
          setShapes((prev) => {
            const existingIds = new Set(prev.map((s) => s.id));
            const toAdd = restoredShapes.filter((s) => !existingIds.has(s.id));
            return [...toAdd, ...prev];
          });
        }
        if (saved.sourceShapeId) setSourceShapeId(saved.sourceShapeId);
        if (saved.targetShapeId) setTargetShapeId(saved.targetShapeId);
        if (Array.isArray(saved.waypointShapeIds)) setWaypointShapeIds(saved.waypointShapeIds);
        if (saved.config) {
          setConfig((prev) => ({ ...prev, ...saved.config }));
        }
      }
    }
  }, []);

  // Continuous Debounced Auto-Save of Workspace State to Local Storage
  useEffect(() => {
    if (!getAutoRestoreEnabled()) return;
    const timer = setTimeout(() => {
      const customShapesToSave = shapes
        .filter((s) => s.type !== 'preset')
        .map((s) => serializeMorphShape(s, 5000));

      saveWorkspaceState({
        version: 2,
        sourceShapeId,
        targetShapeId,
        waypointShapeIds,
        config,
        customShapes: customShapesToSave.length > 0 ? customShapesToSave : undefined,
        lastSavedAt: Date.now(),
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [config, sourceShapeId, targetShapeId, waypointShapeIds, shapes]);

  const handleOpenTheoryPage = useCallback((page: number = 13) => {
    setTheoryModalPage(page);
    setIsTheoryModalOpen(true);
  }, []);

  // Active Shapes
  const sourceShape = useMemo(() => {
    return shapes.find((s) => s.id === sourceShapeId) || shapes[0];
  }, [shapes, sourceShapeId]);

  const targetShape = useMemo(() => {
    return shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];
  }, [shapes, targetShapeId]);

  // Full Multi-Stage Morph Chain Sequence (출발 -> 경유1 -> 경유2 -> ... -> 목표)
  const morphChain = useMemo(() => {
    const chain: MorphShape[] = [sourceShape];
    for (const wpId of waypointShapeIds) {
      const shape = shapes.find((s) => s.id === wpId);
      if (shape) chain.push(shape);
    }
    chain.push(targetShape);
    return chain;
  }, [sourceShape, targetShape, waypointShapeIds, shapes]);

  // Reorder complete morph sequence chain (Drag-and-Drop)
  const handleReorderChain = useCallback((newChainIds: string[]) => {
    if (!newChainIds || newChainIds.length < 2) return;
    setSourceShapeId(newChainIds[0]);
    setTargetShapeId(newChainIds[newChainIds.length - 1]);
    setWaypointShapeIds(newChainIds.slice(1, newChainIds.length - 1));
    historyManager.recordAction('몰핑 시퀀스 순서 재정렬');
  }, [historyManager]);

  // Waypoints Handlers
  const handleAddWaypoint = useCallback((shapeId?: string) => {
    const nextId = shapeId || shapes[2]?.id || shapes[0]?.id;
    setWaypointShapeIds((prev) => [...prev, nextId]);
    historyManager.recordAction('경유지 (Waypoint) 추가');
  }, [shapes, historyManager]);

  const handleRemoveWaypoint = useCallback((index: number) => {
    setWaypointShapeIds((prev) => prev.filter((_, i) => i !== index));
    historyManager.recordAction('경유지 (Waypoint) 삭제');
  }, [historyManager]);

  const handleUpdateWaypoint = useCallback((index: number, shapeId: string) => {
    setWaypointShapeIds((prev) => {
      const next = [...prev];
      next[index] = shapeId;
      return next;
    });
    historyManager.recordAction('경유지 (Waypoint) 형상 교체');
  }, [historyManager]);

  // Direct Text Shape Generator (HY태고딕 2D Multi-line Typography)
  const handleLoadTextShape = useCallback(
    (text: string, targetSlot: 'source' | 'target' | 'waypoint', waypointIndex?: number) => {
      const clean = (text || 'HY태고딕 2D').trim();
      const id = `text-${Date.now()}`;
      const data = generateTextShape(clean, 100000);
      const titleLines = clean.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      const displayTitle = titleLines.join(' / ');

      const newShape: MorphShape = {
        id,
        name: `✍️ ${displayTitle}`,
        type: 'text',
        positions: data.positions,
        colors: data.colors,
        description: `2D 고선명도 텍스트 파티클 (${titleLines.length}줄 - HY태고딕)`,
      };

      setShapes((prev) => [newShape, ...prev]);

      if (targetSlot === 'source') {
        setSourceShapeId(id);
      } else if (targetSlot === 'target') {
        setTargetShapeId(id);
      } else {
        if (typeof waypointIndex === 'number' && waypointIndex >= 0 && waypointIndex < waypointShapeIds.length) {
          setWaypointShapeIds((prev) => {
            const next = [...prev];
            next[waypointIndex] = id;
            return next;
          });
        } else {
          setWaypointShapeIds((prev) => [...prev, id]);
        }
      }
      historyManager.recordAction(`텍스트 형상 생성 [${displayTitle}]`);
    },
    [waypointShapeIds, historyManager]
  );

  const handleUpdateConfig = useCallback((newConfig: Partial<MorphConfig>) => {
    // Only debounce record if changes contain more than continuous animation progress scrubbing
    const keys = Object.keys(newConfig);
    const isProgressOnly = keys.length === 1 && keys[0] === 'progress';
    if (!isProgressOnly) {
      historyManager.recordConfigChangeDebounced(newConfig);
    }
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, [historyManager]);

  const handleSwapShapes = useCallback(() => {
    setSourceShapeId(targetShapeId);
    setTargetShapeId(sourceShapeId);
    setConfig((prev) => ({ ...prev, progress: 1 - prev.progress }));
    historyManager.recordAction('출발 ↔ 목표 형상 상호 스왑');
  }, [sourceShapeId, targetShapeId, historyManager]);

  const handleAddCustomShape = useCallback((newShape: MorphShape) => {
    setShapes((prev) => [...prev, newShape]);
    setTargetShapeId(newShape.id);
    historyManager.recordAction(`커스텀 형상 [${newShape.name}] 추가`);
  }, [historyManager]);

  // HTML Modified Apply Handler
  const handleApplyHtmlToWorkspace = useCallback(
    (src: MorphShape, dst: MorphShape, newConfig: Partial<MorphConfig>) => {
      setShapes((prev) => {
        const filtered = prev.filter((s) => s.id !== src.id && s.id !== dst.id);
        return [src, dst, ...filtered];
      });
      setSourceShapeId(src.id);
      setTargetShapeId(dst.id);
      setConfig((prev) => ({ ...prev, ...newConfig }));
      historyManager.recordAction('HTML 파티클 씬 워크스페이스 적용');
    },
    [historyManager]
  );

  // HTML Export Action (Full Studio with Waypoints)
  const handleExportHtml = useCallback(() => {
    try {
      const htmlContent = exportMorphToStandaloneHtml(
        sourceShape,
        targetShape,
        config,
        shapes,
        morphChain
      );

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const chainName = morphChain.map(s => s.name).join('_to_');
      const filename = `particle_morph_${chainName}.html`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('HTML 파일 내보내기 중 오류가 발생했습니다: ' + err);
    }
  }, [sourceShape, targetShape, config, shapes, morphChain]);

  // Pure Particle Scene HTML Export Action (No UI with Full Waypoints)
  const handleExportPureHtml = useCallback(() => {
    try {
      const pureHtml = exportPureParticleHtml(
        sourceShape,
        targetShape,
        config,
        config.backgroundColor || '#030712',
        morphChain
      );

      const blob = new Blob([pureHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const chainName = morphChain.map(s => s.name).join('_to_');
      const filename = `pure_particle_${chainName}.html`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('순수 파티클 HTML 파일 내보내기 중 오류가 발생했습니다: ' + err);
    }
  }, [sourceShape, targetShape, config, morphChain]);

  // Pure Particle Standalone Windows CMD Launcher File Export Action with Full Waypoints
  const handleExportPureCmd = useCallback(() => {
    try {
      const cmdContent = exportPureParticleCmd(
        sourceShape,
        targetShape,
        config,
        morphChain
      );

      const blob = new Blob([cmdContent], { type: 'application/cmd;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const chainName = morphChain.map(s => s.name).join('_to_');
      const filename = `pure_particle_${chainName}.cmd`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('순수 파티클 CMD 파일 내보내기 중 오류가 발생했습니다: ' + err);
    }
  }, [sourceShape, targetShape, config, morphChain]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0A0A0B] text-[#E0E0E0] font-mono">
      {/* Top Application Ribbon Menu Bar */}
      <RibbonMenuBar
        config={config}
        onChangeConfig={handleUpdateConfig}
        shapes={shapes}
        sourceShapeId={sourceShapeId}
        targetShapeId={targetShapeId}
        waypointShapeIds={waypointShapeIds}
        onSelectSource={setSourceShapeId}
        onSelectTarget={setTargetShapeId}
        onAddWaypoint={handleAddWaypoint}
        onRemoveWaypoint={handleRemoveWaypoint}
        onUpdateWaypoint={handleUpdateWaypoint}
        onReorderChain={handleReorderChain}
        onLoadTextShape={handleLoadTextShape}
        onSwapShapes={handleSwapShapes}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenWebHub={() => setIsWebHubOpen(true)}
        onOpenHtmlEditor={() => setIsHtmlEditorOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onOpenWasmModal={() => setIsWasmModalOpen(true)}
        onOpenTheoryModal={(page = 13) => handleOpenTheoryPage(page)}
        onOpenColorMixer={() => setIsColorMixerOpen(true)}
        onOpenGCodeModal={() => setIsGCodeModalOpen(true)}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onOpenSaveNamedPreset={() => setIsSaveNamedPresetOpen(true)}
        onOpenImportNamedPreset={() => setIsImportNamedPresetOpen(true)}
        onCaptureSnapshot={() => canvasRef.current?.captureSnapshot()}
        onExportHtml={handleExportHtml}
        onExportPureHtml={handleExportPureHtml}
        onExportPureCmd={handleExportPureCmd}
        fps={fps}
        stats={stats}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        canUndo={historyManager.canUndo}
        canRedo={historyManager.canRedo}
        undoCount={historyManager.undoCount}
        redoCount={historyManager.redoCount}
        lastPastDescription={historyManager.lastPastDescription}
        nextFutureDescription={historyManager.nextFutureDescription}
        historyList={historyManager.historyList}
        onUndo={historyManager.undo}
        onRedo={historyManager.redo}
        onClearHistory={historyManager.clearHistory}
      />

      {/* Main Workspace (Full-Width 3D Particle Canvas + Optional Slide-Over Control Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Full Viewport 3D WebGL Particle Canvas */}
        <main className="flex-1 h-full w-full relative">
          <ParticleCanvas
            ref={canvasRef}
            config={config}
            sourceShape={sourceShape}
            targetShape={targetShape}
            morphChain={morphChain}
            onChangeConfig={handleUpdateConfig}
            onUpdateFps={setFps}
            onUpdatePerformanceStats={setStats}
            onOpenVideoModal={() => setIsVideoModalOpen(true)}
          />

          {/* Floating Expandable Visual Timeline Editor Drawer (Draggable & Reorderable Morph Sequence) */}
          <AnimatePresence>
            {isTimelineDrawerOpen && (
              <motion.div
                key="timeline-drawer-panel"
                initial={{ opacity: 0, y: 36, scale: 0.96, x: '-50%' }}
                animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: 28, scale: 0.96, x: '-50%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
                className="absolute bottom-24 left-1/2 z-30 w-full max-w-4xl px-4 pointer-events-auto"
              >
                <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-2 border-amber-400/80 bg-[#0C0C10]/95 backdrop-blur-xl">
                  <button
                    onClick={() => setIsTimelineDrawerOpen(false)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white hover:bg-[#2A2A35] rounded transition cursor-pointer z-10"
                    title="타임라인 에디터 닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <VisualTimelineEditor
                    shapes={shapes}
                    sourceShapeId={sourceShapeId}
                    targetShapeId={targetShapeId}
                    waypointShapeIds={waypointShapeIds}
                    config={config}
                    onChangeConfig={handleUpdateConfig}
                    onSelectSource={setSourceShapeId}
                    onSelectTarget={setTargetShapeId}
                    onAddWaypoint={handleAddWaypoint}
                    onRemoveWaypoint={handleRemoveWaypoint}
                    onUpdateWaypoint={handleUpdateWaypoint}
                    onReorderChain={handleReorderChain}
                    onSwapShapes={handleSwapShapes}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Floating Quick Controller Dock (Minimally overlaid on Canvas with Stage Waypoints) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 select-none transition-all duration-200">
            {/* Multi-Stage Waypoint Station Track Pills (Visible when waypoints exist) */}
            {morphChain.length > 2 && (
              <div className="flex items-center gap-1.5 bg-[#0F0F14]/90 backdrop-blur-md border border-[#2A2A34] px-3 py-1 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.6)] text-[10px]">
                <span className="text-[#00F0FF] font-bold">STAGE</span>
                {morphChain.map((shape, idx) => {
                  const numSegments = morphChain.length - 1;
                  const stationP = idx / numSegments;
                  const curP = config.progress;
                  const isActive = Math.abs(curP - stationP) < (0.5 / numSegments);
                  return (
                    <React.Fragment key={`dock-st-${shape.id}-${idx}`}>
                      {idx > 0 && <span className="text-gray-600 text-[9px]">▶</span>}
                      <button
                        onClick={() => handleUpdateConfig({ progress: stationP, isPlaying: false })}
                        className={`px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                          isActive
                            ? 'bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                        title={`${idx === 0 ? '출발' : idx === morphChain.length - 1 ? '목표' : `경유${idx}`}: ${shape.name} (클릭하여 이동)`}
                      >
                        {idx === 0 ? '출발' : idx === morphChain.length - 1 ? '목표' : `경유${idx}`}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            <div className="bg-[#0F0F14]/85 hover:bg-[#0F0F14]/95 backdrop-blur-md border border-[#2A2A34] hover:border-[#00F0FF]/50 px-4 py-2 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.7)] flex items-center gap-3">
              {/* Visual Timeline Sequence Editor Drawer Toggle */}
              <button
                onClick={() => setIsTimelineDrawerOpen((prev) => !prev)}
                className={`p-1.5 px-2.5 rounded-full border text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                  isTimelineDrawerOpen
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_10px_#FFE600]'
                    : 'bg-[#18181E] border-[#2A2A2E] text-amber-400 hover:text-white'
                }`}
                title="드래그 앤 드롭 비주얼 타임라인 시퀀스 에디터 열기/닫기"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">타임라인 에디터</span>
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={() => handleUpdateConfig({ isPlaying: !config.isPlaying })}
                className={`p-2 rounded-full font-bold uppercase transition flex items-center justify-center cursor-pointer ${
                  config.isPlaying
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_#00F0FF]'
                    : 'bg-[#222228] text-white hover:bg-[#33333C]'
                }`}
                title={config.isPlaying ? '일시 정지 (Space/Click)' : '실시간 몰핑 재생'}
              >
                {config.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              {/* Reset Button */}
              <button
                onClick={() => handleUpdateConfig({ progress: 0 })}
                className="p-1.5 rounded-full bg-[#222228] hover:bg-[#33333C] text-gray-300 hover:text-white transition cursor-pointer"
                title="0% 처음으로 리셋"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Interactive Morph Progress Scrubber Slider with Waypoint Ticks */}
              <div className="flex flex-col justify-center px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400">0%</span>
                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.001"
                      value={config.progress}
                      onChange={(e) => {
                        handleUpdateConfig({ progress: parseFloat(e.target.value), isPlaying: false });
                      }}
                      className="w-32 sm:w-56 h-1.5 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                      title="몰핑 진행도 스크러빙"
                    />
                    {/* Waypoint Tick Marks along the slider */}
                    {morphChain.length > 2 && (
                      <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-0.5">
                        {morphChain.map((_, idx) => (
                          <div
                            key={`tick-${idx}`}
                            className={`w-1.5 h-1.5 rounded-full ${
                              idx === 0 ? 'bg-[#00F0FF]' : idx === morphChain.length - 1 ? 'bg-white' : 'bg-amber-400'
                            }`}
                            style={{
                              position: 'absolute',
                              left: `${(idx / (morphChain.length - 1)) * 100}%`,
                              transform: 'translateX(-50%)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#00F0FF] w-9 text-right font-bold">
                    {(config.progress * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Ghost Trails Toggle */}
              <button
                onClick={() => handleUpdateConfig({ trailsEnabled: !config.trailsEnabled })}
                className={`p-1.5 px-2.5 rounded-full border text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                  config.trailsEnabled
                    ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'bg-[#18181E] border-[#2A2A2E] text-gray-400 hover:text-white'
                }`}
                title="파티클 궤적 모션 블러 토글"
              >
                <Waves className="w-3 h-3" />
                <span className="hidden sm:inline">궤적</span>
              </button>

              {/* Quick 4K Snapshot Button */}
              <button
                onClick={() => canvasRef.current?.captureSnapshot()}
                className="p-1.5 rounded-full bg-[#18181E] hover:border-[#00F0FF] border border-[#2A2A2E] text-gray-300 hover:text-[#00F0FF] transition cursor-pointer"
                title="현재 뷰포트 고해상도 스냅샷 캡처 (PNG)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Optional Slide-Over Control Sidebar (Opens only when user requests detailed sidebar view) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Mobile backdrop overlay for clean tap-away dismissal */}
              <motion.div
                key="control-panel-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-[35] sm:hidden backdrop-blur-[2px]"
              />

              <motion.aside
                key="control-panel-sidebar"
                initial={{ x: '100%', opacity: 0.6 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0.6 }}
                transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.85 }}
                className="absolute top-0 right-0 h-full w-full sm:w-96 z-40 bg-[#0F0F12] border-l border-[#2A2A2E] shadow-[-12px_0_35px_rgba(0,0,0,0.85)] flex flex-col"
              >
                <div className="flex items-center justify-between p-3 border-b border-[#2A2A2E] bg-[#141418]">
                  <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                    <PanelRightOpen className="w-3.5 h-3.5" />
                    <span>세부 파라미터 제어 사이드바</span>
                  </span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition cursor-pointer"
                    title="사이드바 닫기 (미리보기창 전체화면)"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ControlPanel
                    config={config}
                    onChangeConfig={handleUpdateConfig}
                    shapes={shapes}
                    sourceShapeId={sourceShapeId}
                    targetShapeId={targetShapeId}
                    waypointShapeIds={waypointShapeIds}
                    onSelectSource={setSourceShapeId}
                    onSelectTarget={setTargetShapeId}
                    onAddWaypoint={handleAddWaypoint}
                    onRemoveWaypoint={handleRemoveWaypoint}
                    onUpdateWaypoint={handleUpdateWaypoint}
                    onReorderChain={handleReorderChain}
                    onLoadTextShape={handleLoadTextShape}
                    onAddCustomShape={handleAddCustomShape}
                    onOpenUploadModal={() => setIsUploadOpen(true)}
                    onOpenColorMixer={() => setIsColorMixerOpen(true)}
                    onOpenGCodeModal={() => setIsGCodeModalOpen(true)}
                    onOpenVideoModal={() => setIsVideoModalOpen(true)}
                    onOpenWebHub={() => setIsWebHubOpen(true)}
                    onOpenHtmlEditor={() => setIsHtmlEditorOpen(true)}
                    onOpenTheoryModal={(page = 13) => handleOpenTheoryPage(page)}
                    onExportHtml={handleExportHtml}
                    onExportPureHtml={handleExportPureHtml}
                    onExportPureCmd={handleExportPureCmd}
                    onSwapShapes={handleSwapShapes}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 60FPS Video Capture & Exporter Modal (MediaRecorder WebM / MP4) */}
      {isVideoModalOpen && (
        <VideoRecorderModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          getCanvasElement={() => canvasRef.current?.getCanvasElement() || null}
          config={config}
          sourceShape={sourceShape}
          targetShape={targetShape}
        />
      )}

      {/* CNC Laser & 3D Print G-Code / Point Cloud Modal */}
      {isGCodeModalOpen && (
        <GCodeExportModal
          isOpen={isGCodeModalOpen}
          onClose={() => setIsGCodeModalOpen(false)}
          sourceShape={sourceShape}
          targetShape={targetShape}
          morphProgress={config.progress}
          particleCount={config.particleCount}
        />
      )}

      {/* HTML Particle File Editor & Importer Modal */}
      {isHtmlEditorOpen && (
        <HtmlFileEditorModal
          isOpen={isHtmlEditorOpen}
          onClose={() => setIsHtmlEditorOpen(false)}
          onApplyToWorkspace={handleApplyHtmlToWorkspace}
          currentSourceShape={sourceShape}
          currentTargetShape={targetShape}
          currentConfig={config}
          allShapes={shapes}
        />
      )}

      {/* Online Particle Web Hub Modal (particles.js / tsParticles / Three.js) */}
      {isWebHubOpen && (
        <WebParticleHubModal
          isOpen={isWebHubOpen}
          onClose={() => setIsWebHubOpen(false)}
          config={config}
          onChangeConfig={handleUpdateConfig}
          onSelectSource={setSourceShapeId}
          onSelectTarget={setTargetShapeId}
        />
      )}

      {/* Particle Shape & Color Mixing Studio Modal */}
      {isColorMixerOpen && (
        <ColorMixerModal
          isOpen={isColorMixerOpen}
          onClose={() => setIsColorMixerOpen(false)}
          config={config}
          onChangeConfig={handleUpdateConfig}
        />
      )}

      {/* Image Upload & Particle Converter Modal */}
      {isUploadOpen && (
        <ImageUploaderModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onAddShape={handleAddCustomShape}
          particleCount={config.particleCount}
        />
      )}

      {/* Python 3D Simulator & Script Exporter Modal */}
      {isPythonModalOpen && (
        <PythonModal
          isOpen={isPythonModalOpen}
          onClose={() => setIsPythonModalOpen(false)}
        />
      )}

      {/* C++ & WebAssembly Source Code Modal */}
      {isWasmModalOpen && (
        <WasmModal
          isOpen={isWasmModalOpen}
          onClose={() => setIsWasmModalOpen(false)}
        />
      )}

      {/* Houdini & VEX Morphing Principles Documentation Modal */}
      {isTheoryModalOpen && (
        <TheoryModal
          isOpen={isTheoryModalOpen}
          onClose={() => setIsTheoryModalOpen(false)}
          initialPage={theoryModalPage}
        />
      )}

      {/* Save Named Preset Modal */}
      {isSaveNamedPresetOpen && (
        <SaveNamedPresetModal
          isOpen={isSaveNamedPresetOpen}
          onClose={() => setIsSaveNamedPresetOpen(false)}
          config={config}
          sourceShapeId={sourceShapeId}
          targetShapeId={targetShapeId}
          waypointShapeIds={waypointShapeIds}
          shapes={shapes}
        />
      )}

      {/* Import Named Preset Modal */}
      {isImportNamedPresetOpen && (
        <ImportNamedPresetModal
          isOpen={isImportNamedPresetOpen}
          onClose={() => setIsImportNamedPresetOpen(false)}
          onApplyPreset={handleApplyNamedPreset}
          availableShapes={shapes}
        />
      )}

      {/* Undo/Redo & Workspace Action Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 bg-[#0E0E14]/95 border border-[#00F0FF]/80 text-[#E0E0E0] px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] text-xs font-mono backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="font-bold text-white">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
