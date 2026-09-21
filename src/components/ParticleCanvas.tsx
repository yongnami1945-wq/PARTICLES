import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Camera, CheckCircle2, Sparkles, Music, Waves, Radio, Wind, Video, Grid, Sun, Palette } from 'lucide-react';
import { MorphConfig, MorphShape, PerformanceStats, MorphEasing } from '../types';
import { particleVertexShader, particleFragmentShader } from '../utils/shaders';
import { WasmParticleEngine } from '../utils/wasmEngine';
import { audioEngine } from '../utils/audioEngine';
import { createSnowflakeCanvasTexture } from '../utils/snowflakeTextures';
import { PhysicsFieldVisualizer, PhysicsDebugMetrics } from '../utils/physicsFieldVisualizer';
import { PhysicsDebugOverlay } from './PhysicsDebugOverlay';
import { CoordinateGridVisualizer } from '../utils/coordinateGridOverlay';
import { CoordinateGridOverlay } from './CoordinateGridOverlay';

export function isTransparentBackground(color?: string): boolean {
  if (!color) return false;
  const clean = color.trim().toLowerCase();
  return clean === 'transparent' || clean === 'none' || clean === '' || clean === 'rgba(0,0,0,0)' || clean === 'rgba(0, 0, 0, 0)';
}

export function isLightBackgroundColor(hexOrRgb?: string): boolean {
  if (!hexOrRgb) return false;
  const clean = hexOrRgb.trim().toLowerCase();
  if (isTransparentBackground(clean)) return true;
  if (clean === 'white' || clean === '#fff' || clean === '#ffffff') return true;
  if (clean.startsWith('#')) {
    let hex = clean.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return lum > 0.45;
    }
  }
  return false;
}

export function applyMorphEasing(t: number, easing: MorphEasing = 'ease-in-out'): number {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'linear':
      return clamped;
    case 'ease-in-out':
      return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
    case 'bounce': {
      const n1 = 7.5625;
      const d1 = 2.75;
      let x = clamped;
      if (x < 1 / d1) {
        return n1 * x * x;
      } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
      } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
      } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
      }
    }
    case 'elastic': {
      if (clamped === 0) return 0;
      if (clamped === 1) return 1;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;
    }
    case 'cubic-in':
      return clamped * clamped * clamped;
    case 'cubic-out':
      return 1 - Math.pow(1 - clamped, 3);
    case 'back-out': {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
    }
    default:
      return clamped < 0.5
        ? 4 * clamped * clamped * clamped
        : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
  }
}

export interface ParticleCanvasHandle {
  captureSnapshot: () => void;
  getCanvasElement: () => HTMLCanvasElement | null;
}

interface ParticleCanvasProps {
  config: MorphConfig;
  sourceShape: MorphShape;
  targetShape: MorphShape;
  morphChain?: MorphShape[];
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  onUpdateFps: (fps: number) => void;
  onUpdatePerformanceStats?: (stats: PerformanceStats) => void;
  onOpenVideoModal?: () => void;
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(({
  config,
  sourceShape,
  targetShape,
  morphChain,
  onChangeConfig,
  onUpdateFps,
  onUpdatePerformanceStats,
  onOpenVideoModal,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const wasmEngineRef = useRef<WasmParticleEngine>(new WasmParticleEngine());
  const physicsVisualizerRef = useRef<PhysicsFieldVisualizer | null>(null);
  const gridVisualizerRef = useRef<CoordinateGridVisualizer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const renderPassRef = useRef<RenderPass | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  const [isFlashing, setIsFlashing] = useState(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [holdingStationInfo, setHoldingStationInfo] = useState<{ index: number; name: string } | null>(null);
  const [physicsMetrics, setPhysicsMetrics] = useState<PhysicsDebugMetrics>({
    totalAttractionForce: 0,
    noiseVorticity: 0,
    gravityMagnitude: 0,
    netKineticEnergy: 0,
    activeVectorsCount: 0,
  });
  
  // Animation state refs for render loop access
  const configRef = useRef(config);
  configRef.current = config;
  const sourceShapeRef = useRef(sourceShape);
  sourceShapeRef.current = sourceShape;
  const targetShapeRef = useRef(targetShape);
  targetShapeRef.current = targetShape;

  const morphChainRef = useRef<MorphShape[]>(morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape]);
  morphChainRef.current = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];

  const activeSegmentRef = useRef<number>(0);
  const holdRemainingRef = useRef<number>(0);
  const lastHeldStationRef = useRef<number>(-1);

  const currentProgressRef = useRef(config.progress);
  // Keep internal progress ref in sync when user manually adjusts slider
  useEffect(() => {
    currentProgressRef.current = config.progress;
    // Reset hold station lock when user manually scrubs
    lastHeldStationRef.current = -1;
    holdRemainingRef.current = 0;
    setHoldingStationInfo(null);
  }, [config.progress]);

  const playDirectionRef = useRef(1);

  // Snapshot Capture Method
  const captureSnapshot = () => {
    if (!rendererRef.current) return;
    const renderer = rendererRef.current;
    const canvas = renderer.domElement;

    // Trigger visual camera shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    try {
      // Direct high-resolution PNG data URL extraction from preserved WebGL buffer
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const progPercent = Math.round((configRef.current.progress || 0) * 100);
      
      const srcName = sourceShapeRef.current.name.split(' ')[0].replace(/[^a-zA-Z0-9가-힣_-]/g, '');
      const dstName = targetShapeRef.current.name.split(' ')[0].replace(/[^a-zA-Z0-9가-힣_-]/g, '');
      
      const filename = `particle_snapshot_${srcName}_to_${dstName}_p${progPercent}_${dateStr}_${timeStr}.png`;
      
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnapshotToast(filename);
      setTimeout(() => {
        setSnapshotToast((prev) => (prev === filename ? null : prev));
      }, 3500);
    } catch (err) {
      console.error('Failed to capture canvas snapshot:', err);
    }
  };

  useImperativeHandle(ref, () => ({
    captureSnapshot,
    getCanvasElement: () => rendererRef.current?.domElement || null,
  }));

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const isInitialTransparent = isTransparentBackground(config.backgroundColor);
    const isInitialLight = isLightBackgroundColor(config.backgroundColor);
    const initialBgHex = isInitialTransparent
      ? '#000000'
      : config.backgroundColor || (isInitialLight ? '#FFFFFF' : '#030712');
    const initialBgCol = new THREE.Color(initialBgHex);

    const scene = new THREE.Scene();
    if (!isInitialTransparent) {
      scene.fog = new THREE.FogExp2(initialBgHex, isInitialLight ? 0.003 : 0.015);
    }
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 14);
    cameraRef.current = camera;

    // WebGL Renderer with Drawing Buffer Preservation for Motion Ghost Trails
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (isInitialTransparent) {
      renderer.setClearColor(0x000000, 0);
    } else {
      renderer.setClearColor(initialBgCol, 1);
    }
    renderer.autoClear = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Trail Screen-space Fade Scene (Orthographic)
    const fadeScene = new THREE.Scene();
    const fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fadeMaterial = new THREE.MeshBasicMaterial({
      color: initialBgCol,
      transparent: true,
      opacity: 0.15,
      depthTest: false,
      depthWrite: false,
    });
    const fadePlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMaterial);
    fadeScene.add(fadePlane);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 80;
    controls.minDistance = 2;
    controlsRef.current = controls;

    // Background Subtle Starfield / Grid Plane (hidden on transparent / light backgrounds)
    const gridHelper = new THREE.GridHelper(30, 30, 0x2a2a2e, 0x141417);
    gridHelper.position.y = -6.5;
    gridHelper.visible = !isInitialTransparent && !isInitialLight;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 3D Precision Coordinate Alignment Grid Visualizer
    const gridVisualizer = new CoordinateGridVisualizer();
    scene.add(gridVisualizer.group);
    gridVisualizerRef.current = gridVisualizer;

    // Physics Field Vector Visualizer
    const physicsVisualizer = new PhysicsFieldVisualizer();
    scene.add(physicsVisualizer.group);
    physicsVisualizerRef.current = physicsVisualizer;

    // EffectComposer & UnrealBloomPass for Cinematic Post-Processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    renderPassRef.current = renderPass;
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      config.bloomStrength ?? 1.2,
      config.bloomRadius ?? 0.6,
      config.bloomThreshold ?? 0.15
    );
    bloomPassRef.current = bloomPass;
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composerRef.current = composer;

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
      if (bloomPassRef.current) {
        bloomPassRef.current.resolution.set(width, height);
      }
    });
    resizeObserver.observe(container);

    // Interactive 3D Mouse Gravity Raycasting
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const mouseNDC = new THREE.Vector2(-999, -999);
    let isHovered = false;
    let isMouseDown = false;

    const onPointerMove = (e: PointerEvent) => {
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      isHovered = true;

      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir).negate();
      plane.setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3(0, 0, 0));
      raycaster.setFromCamera(mouseNDC, camera);
      raycaster.ray.intersectPlane(plane, mouse3D);
    };

    const onPointerEnter = () => {
      isHovered = true;
    };

    const onPointerLeave = () => {
      isHovered = false;
      isMouseDown = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isMouseDown = true;
      }
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let lastUiSyncTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // FPS & Performance Stats tracking (every 500ms)
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        onUpdateFps(calculatedFps);

        if (onUpdatePerformanceStats) {
          const curPts = pointsRef.current;
          const posAttr = curPts?.geometry?.getAttribute('position') as THREE.BufferAttribute | undefined;
          const vertexCount = posAttr ? posAttr.count : (configRef.current.particleCount || 60000);

          // Calculate VBO GPU buffer memory in Bytes
          let vboBytes = 0;
          if (curPts?.geometry?.attributes) {
            const attrs = curPts.geometry.attributes;
            for (const key in attrs) {
              const attr = attrs[key] as THREE.BufferAttribute;
              if (attr && attr.array) {
                vboBytes += attr.array.byteLength;
              }
            }
          } else {
            vboBytes = vertexCount * 68; // 68 bytes per particle vertex
          }

          // Calculate Render Target & Framebuffer Memory
          const canvasEl = renderer.domElement;
          const fbW = canvasEl.width || (container.clientWidth * Math.min(window.devicePixelRatio, 2));
          const fbH = canvasEl.height || (container.clientHeight * Math.min(window.devicePixelRatio, 2));
          // Color (RGBA8 4B * 2 buffers) + Depth24Stencil8 (4B) + Ghost Trail Fade Buffer (4B) = ~16B/pixel
          const renderBufferBytes = fbW * fbH * 16;

          const vboMb = vboBytes / (1024 * 1024);
          const renderBufferMb = renderBufferBytes / (1024 * 1024);
          const totalGpuMb = parseFloat((vboMb + renderBufferMb).toFixed(1));

          onUpdatePerformanceStats({
            fps: calculatedFps,
            vertexCount,
            gpuMemoryMb: totalGpuMb,
            vboMemoryMb: parseFloat(vboMb.toFixed(1)),
            renderBufferMemoryMb: parseFloat(renderBufferMb.toFixed(1)),
            drawCalls: renderer.info.render.calls || (configRef.current.trailsEnabled ? 2 : 1),
          });
        }

        frameCount = 0;
        lastFpsTime = now;
      }

      const curConfig = configRef.current;
      const curMaterial = materialRef.current;
      const curPoints = pointsRef.current;

      // Handle Automatic Playback in render loop with 1.0s Rest Stop at Waypoints & Endpoints
      let renderProgress = currentProgressRef.current;
      if (curConfig.isPlaying) {
        // Multi-stage waypoint active check (경유지 포함 다단계 체인 여부)
        const chainForSpeed = morphChainRef.current && morphChainRef.current.length >= 2
          ? morphChainRef.current
          : [sourceShapeRef.current, targetShapeRef.current];
        const isMultiStage = chainForSpeed.length > 2;
        const waypointSpeedFactor = isMultiStage ? 0.5 : 1.0;
        const numSegments = Math.max(1, chainForSpeed.length - 1);
        const dir = playDirectionRef.current;

        if (holdRemainingRef.current > 0) {
          // 피사체의 형태를 선명하게 감상할 수 있도록 1.0초간 스톱 유지
          holdRemainingRef.current -= dt;
          if (lastHeldStationRef.current >= 0) {
            const snappedProg = lastHeldStationRef.current / numSegments;
            renderProgress = Math.min(0.999999, Math.max(0, snappedProg));
            currentProgressRef.current = snappedProg;
          }
          if (holdRemainingRef.current <= 0) {
            setHoldingStationInfo(null);
          }
        } else {
          const step = dt * curConfig.playSpeed * 0.45 * waypointSpeedFactor * dir;
          const prevProg = currentProgressRef.current;
          let nextProg = prevProg + step;

          // Check if crossing any waypoint/endpoint station (k = 0, 1, ..., numSegments)
          let triggeredStation = -1;
          for (let k = 0; k <= numSegments; k++) {
            const stationProg = k / numSegments;
            if (lastHeldStationRef.current === k) continue;

            if (dir > 0) {
              if (prevProg < stationProg && nextProg >= stationProg - 0.0001) {
                triggeredStation = k;
                break;
              }
            } else if (dir < 0) {
              if (prevProg > stationProg && nextProg <= stationProg + 0.0001) {
                triggeredStation = k;
                break;
              }
            }
          }

          if (triggeredStation >= 0) {
            // Snap to exact station position and hold for 1.0s (1초간 정지)
            nextProg = triggeredStation / numSegments;
            holdRemainingRef.current = 1.0;
            lastHeldStationRef.current = triggeredStation;

            const stShape = chainForSpeed[triggeredStation] || (triggeredStation === 0 ? sourceShapeRef.current : targetShapeRef.current);
            setHoldingStationInfo({
              index: triggeredStation,
              name: stShape.name || (triggeredStation === 0 ? '출발 피사체' : '목표 피사체'),
            });
          }

          // Boundary handling (1.0 or 0.0)
          if (nextProg >= 1.0) {
            nextProg = 1.0;
            if (curConfig.playMode === 'pingpong') {
              playDirectionRef.current = -1;
            } else if (curConfig.playMode === 'loop') {
              if (holdRemainingRef.current <= 0) {
                nextProg = 0.0;
                holdRemainingRef.current = 1.0;
                lastHeldStationRef.current = 0;
                const stShape = chainForSpeed[0] || sourceShapeRef.current;
                setHoldingStationInfo({ index: 0, name: stShape.name });
              }
            } else {
              if (holdRemainingRef.current <= 0) {
                onChangeConfig({ isPlaying: false });
              }
            }
          } else if (nextProg <= 0.0) {
            nextProg = 0.0;
            if (curConfig.playMode === 'pingpong') {
              playDirectionRef.current = 1;
            }
          }

          currentProgressRef.current = nextProg;
          renderProgress = nextProg;
        }

        // Throttled UI state synchronization (~20 fps) to avoid blocking WebGL render thread
        if (now - lastUiSyncTime >= 50) {
          onChangeConfig({ progress: renderProgress });
          lastUiSyncTime = now;
        }
      }

      // Render Progress Calculation (Multi-stage waypoint support)
      const chain = morphChainRef.current && morphChainRef.current.length >= 2
        ? morphChainRef.current
        : [sourceShapeRef.current, targetShapeRef.current];
      const numSegments = Math.max(1, chain.length - 1);
      const clampedProg = Math.max(0, Math.min(0.999999, renderProgress));
      const scaledT = clampedProg * numSegments;
      const curSeg = Math.min(Math.floor(scaledT), numSegments - 1);
      const localT = scaledT - curSeg;

      // Switch segment buffer data if active segment index changes
      if (curPoints && activeSegmentRef.current !== curSeg) {
        activeSegmentRef.current = curSeg;
        const src = chain[curSeg];
        const dst = chain[curSeg + 1];
        const count = curConfig.particleCount;

        const geom = curPoints.geometry;
        const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
        const colAttr = geom.getAttribute('color') as THREE.BufferAttribute;
        const aColorAttr = geom.getAttribute('aColor') as THREE.BufferAttribute;
        const aTargetAttr = geom.getAttribute('aTarget') as THREE.BufferAttribute;
        const aTargetColorAttr = geom.getAttribute('aTargetColor') as THREE.BufferAttribute;

        if (posAttr && aTargetAttr && src && dst) {
          const srcPositions = src.positions.slice(0, count * 3);
          const srcColors = src.colors.slice(0, count * 3);
          const dstPositions = dst.positions.slice(0, count * 3);
          const dstColors = dst.colors.slice(0, count * 3);

          (posAttr.array as Float32Array).set(srcPositions);
          posAttr.needsUpdate = true;

          if (colAttr) {
            (colAttr.array as Float32Array).set(srcColors);
            colAttr.needsUpdate = true;
          }
          if (aColorAttr) {
            (aColorAttr.array as Float32Array).set(srcColors);
            aColorAttr.needsUpdate = true;
          }
          if (aTargetAttr) {
            (aTargetAttr.array as Float32Array).set(dstPositions);
            aTargetAttr.needsUpdate = true;
          }
          if (aTargetColorAttr) {
            (aTargetColorAttr.array as Float32Array).set(dstColors);
            aTargetColorAttr.needsUpdate = true;
          }
        }
      }

      // Auto Rotation
      if (curConfig.autoRotate && curPoints) {
        curPoints.rotation.y = time * curConfig.rotateSpeed * 0.15;
        curPoints.rotation.x = Math.sin(time * 0.1) * 0.04;
      }

      // Calculate eased progress based on configured morph easing curve
      const easedLocalT = applyMorphEasing(localT, curConfig.morphEasing || 'ease-in-out');

      // Update Engine
      if (curConfig.engineMode === 'wasm' && curPoints) {
        // High-Speed JS Vector Engine step
        const noiseTypeInt =
          curConfig.noiseType === 'simplex' ? 0 :
          curConfig.noiseType === 'curl' ? 1 :
          curConfig.noiseType === 'turbulence' ? 2 : 3;

        wasmEngineRef.current.step(
          easedLocalT,
          time,
          curConfig.noiseAmp,
          curConfig.noiseFreq,
          curConfig.noiseSpeed,
          curConfig.delaySpread,
          noiseTypeInt
        );

        const posAttr = curPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const colAttr = curPoints.geometry.getAttribute('color') as THREE.BufferAttribute;
        if (posAttr && colAttr) {
          posAttr.copyArray(wasmEngineRef.current.getCurrentPositions());
          posAttr.needsUpdate = true;
          colAttr.copyArray(wasmEngineRef.current.getCurrentColors());
          colAttr.needsUpdate = true;
        }

        if (curMaterial) {
          curMaterial.uniforms.uProgress.value = 0.0; // Handled directly in buffer
          curMaterial.uniforms.uNoiseAmp.value = 0.0;
          curMaterial.uniforms.uPointSize.value = curConfig.pointSize;
          curMaterial.uniforms.uGlowIntensity.value = curConfig.glowIntensity;
        }
      } else if (curMaterial) {
        // GPU WebGL Shader Engine update (Zero CPU overhead)
        curMaterial.uniforms.uProgress.value = easedLocalT;
        curMaterial.uniforms.uTime.value = time;
        curMaterial.uniforms.uNoiseAmp.value = curConfig.noiseAmp;
        curMaterial.uniforms.uNoiseFreq.value = curConfig.noiseFreq;
        curMaterial.uniforms.uNoiseSpeed.value = curConfig.noiseSpeed;
        curMaterial.uniforms.uDelaySpread.value = curConfig.delaySpread;
        curMaterial.uniforms.uPointSize.value = curConfig.pointSize;
        curMaterial.uniforms.uGlowIntensity.value = curConfig.glowIntensity;

        // Interactive Mouse Gravity & Ambient Free-Floating Drift Uniforms
        const isGravityActive = curConfig.mouseGravityEnabled !== false && isHovered ? 1.0 : 0.0;
        const clickMultiplier = isMouseDown ? 1.8 : 1.0;
        curMaterial.uniforms.uMousePos.value.copy(mouse3D);
        curMaterial.uniforms.uMouseRadius.value = (curConfig.mouseGravityRadius ?? 6.0) * (isMouseDown ? 1.25 : 1.0);
        curMaterial.uniforms.uMouseStrength.value = (curConfig.mouseGravityStrength ?? 3.5) * clickMultiplier;
        const mouseModeInt = curConfig.mouseGravityMode === 'repel' ? 1 : curConfig.mouseGravityMode === 'vortex' ? 2 : 0;
        curMaterial.uniforms.uMouseMode.value = mouseModeInt;
        curMaterial.uniforms.uMouseActive.value = isGravityActive;
        curMaterial.uniforms.uAmbientDrift.value = curConfig.ambientDriftAmp ?? 1.3;

        const noiseTypeInt =
          curConfig.noiseType === 'simplex' ? 0 :
          curConfig.noiseType === 'curl' ? 1 :
          curConfig.noiseType === 'turbulence' ? 2 : 3;
        curMaterial.uniforms.uNoiseType.value = noiseTypeInt;

        const delayModeInt =
          curConfig.delayMode === 'random' ? 0 :
          curConfig.delayMode === 'linear_y' ? 1 :
          curConfig.delayMode === 'linear_x' ? 2 :
          curConfig.delayMode === 'radial' ? 3 :
          curConfig.delayMode === 'brightness' ? 4 : 0;
        curMaterial.uniforms.uDelayMode.value = delayModeInt;

        // Color Mixing Uniforms
        const colorMixModeInt =
          curConfig.colorMixMode === 'interpolate' ? 0 :
          curConfig.colorMixMode === 'gradient' ? 1 :
          curConfig.colorMixMode === 'velocity' ? 2 :
          curConfig.colorMixMode === 'height' ? 3 :
          curConfig.colorMixMode === 'radial' ? 4 :
          curConfig.colorMixMode === 'additive_mix' ? 5 : 6;
        curMaterial.uniforms.uColorMixMode.value = colorMixModeInt;

        const colorModeInt =
          curConfig.colorScheme === 'original' ? 0 :
          curConfig.colorScheme === 'cyberpunk' ? 1 :
          curConfig.colorScheme === 'fire' ? 2 :
          curConfig.colorScheme === 'galaxy' ? 3 :
          curConfig.colorScheme === 'emerald' ? 4 :
          curConfig.colorScheme === 'sunset' ? 5 : 6;
        curMaterial.uniforms.uColorMode.value = colorModeInt;

        const colA = new THREE.Color(curConfig.colorA || '#00F0FF');
        const colB = new THREE.Color(curConfig.colorB || '#FF007F');
        const colC = new THREE.Color(curConfig.colorC || '#FFE600');
        curMaterial.uniforms.uColorA.value.set(colA.r, colA.g, colA.b);
        curMaterial.uniforms.uColorB.value.set(colB.r, colB.g, colB.b);
        curMaterial.uniforms.uColorC.value.set(colC.r, colC.g, colC.b);

        curMaterial.uniforms.uColorMixRatio.value = curConfig.colorMixRatio ?? 0.5;
        curMaterial.uniforms.uVelocityShift.value = curConfig.velocityColorShift ?? 1.0;
        curMaterial.uniforms.uColorGamma.value = curConfig.colorGamma ?? 1.0;

        // Particle Shape / Type
        const particleTypeInt =
          curConfig.particleType === 'circle' ? 0 :
          curConfig.particleType === 'star' ? 1 :
          curConfig.particleType === 'diamond' ? 2 :
          curConfig.particleType === 'ring' ? 3 :
          curConfig.particleType === 'hexagon' ? 4 :
          curConfig.particleType === 'cube' ? 5 :
          curConfig.particleType === 'cloud' ? 6 :
          curConfig.particleType === 'bokeh' ? 7 :
          curConfig.particleType === 'bird' ? 8 :
          curConfig.particleType === 'feather' ? 9 :
          curConfig.particleType === 'delta' ? 10 :
          curConfig.particleType === 'snowflake1' ? 11 :
          curConfig.particleType === 'snowflake2' ? 12 :
          curConfig.particleType === 'snowflake3' ? 13 :
          curConfig.particleType === 'snowflake4' ? 14 :
          curConfig.particleType === 'snowflake5' ? 15 : 16;
        curMaterial.uniforms.uParticleType.value = particleTypeInt;
        curMaterial.uniforms.uSpriteHslCycle.value = curConfig.spriteHslCycle ? 1.0 : 0.0;

        const rotRad = ((curConfig.shapeRotation || 0) * Math.PI) / 180 + (curConfig.particleType === 'star' ? time * 0.4 : 0);
        curMaterial.uniforms.uShapeRotation.value = rotRad;
        curMaterial.uniforms.uCoreRatio.value = curConfig.coreRatio ?? 0.8;

        // Audio Reactivity (Page 14 Feature)
        if (curConfig.audioReactiveEnabled) {
          const analysis = audioEngine.getAnalysis(curConfig.audioSensitivity ?? 1.0);
          curMaterial.uniforms.uAudioBass.value = analysis.bass * (curConfig.audioBassScale ?? 1.5);
          curMaterial.uniforms.uAudioTreble.value = analysis.treble * (curConfig.audioTrebleGlitter ?? 1.2);
          curMaterial.uniforms.uAudioPulse.value = analysis.beatPulse;
        } else {
          curMaterial.uniforms.uAudioBass.value = 0.0;
          curMaterial.uniforms.uAudioTreble.value = 0.0;
          curMaterial.uniforms.uAudioPulse.value = 0.0;
        }

        // Force Fields & Black Hole Singularity (Page 15 Feature)
        curMaterial.uniforms.uBlackHoleActive.value = curConfig.blackHoleEnabled ? 1.0 : 0.0;
        curMaterial.uniforms.uBlackHoleMass.value = curConfig.blackHoleMass ?? 3.0;
        curMaterial.uniforms.uBlackHoleRadius.value = curConfig.blackHoleRadius ?? 7.0;

        // Cinematic Glitch Distortion (Page 16 Feature)
        curMaterial.uniforms.uGlitchIntensity.value = curConfig.glitchIntensity ?? 0.0;

        // Dynamic Motion Blur Intensity Uniform
        curMaterial.uniforms.uMotionBlurIntensity.value = curConfig.motionBlurIntensity ?? 1.0;

        // Dynamic Background Color Sync & High-Contrast Light / Transparent Mode Adaptation
        const isTransparent = isTransparentBackground(curConfig.backgroundColor);
        const isLight = isLightBackgroundColor(curConfig.backgroundColor);

        if (curMaterial.uniforms.uIsLightBackground) {
          curMaterial.uniforms.uIsLightBackground.value = (isLight || isTransparent) ? 1.0 : 0.0;
        }

        const isSnowflake = curConfig.particleType && curConfig.particleType.startsWith('snowflake');
        const targetBlending = (isLight || isTransparent)
          ? THREE.NormalBlending
          : curConfig.snowflakeCustomBlending && isSnowflake ? THREE.AdditiveBlending :
            curConfig.blending === 'screen' ? THREE.CustomBlending :
            curConfig.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending;

        if (curMaterial.blending !== targetBlending) {
          curMaterial.blending = targetBlending;
          curMaterial.needsUpdate = true;
        }

        if (gridHelperRef.current) {
          gridHelperRef.current.visible = !isTransparent && !isLight;
        }

        if (isTransparent) {
          renderer.setClearColor(0x000000, 0);
          if (scene.fog) {
            scene.fog = null;
          }
        } else if (curConfig.backgroundColor) {
          const bgCol = new THREE.Color(curConfig.backgroundColor);
          renderer.setClearColor(bgCol, 1);
          if (!scene.fog) {
            scene.fog = new THREE.FogExp2(bgCol, isLight ? 0.003 : 0.015);
          } else {
            scene.fog.color.copy(bgCol);
            (scene.fog as THREE.FogExp2).density = isLight ? 0.003 : 0.015;
          }
          fadeMaterial.color.copy(bgCol);
        }
      }

      controls.update();

      // Update 3D Precision Coordinate Alignment Grid
      if (gridVisualizerRef.current) {
        gridVisualizerRef.current.update(curConfig);
      }

      // Update Real-Time Physics Field Visualizer (Vectors, Noise Flow, Attraction, Gravity)
      if (physicsVisualizerRef.current) {
        physicsVisualizerRef.current.update(
          time,
          curConfig,
          sourceShapeRef.current,
          targetShapeRef.current,
          mouse3D,
          isHovered,
          easedLocalT,
          curPoints?.rotation.y || 0
        );

        // Throttle React State updates to ~10Hz for super fluid UI performance
        if (now - lastUiSyncTime >= 100 && curConfig.physicsDebugEnabled) {
          setPhysicsMetrics({ ...physicsVisualizerRef.current.metrics });
          lastUiSyncTime = now;
        }
      }

      // Render with Bloom Post-Processing or Motion Blur Trails / Standard Clean Clear
      // Note: On white/light or transparent canvas, bloom and trails are bypassed to guarantee
      // crisp THREE.NormalBlending without ghost washout or dark accumulation!
      const isTransparent = isTransparentBackground(curConfig.backgroundColor);
      const isLight = isLightBackgroundColor(curConfig.backgroundColor);
      const isBloomActive = curConfig.bloomEnabled !== false && !isLight && !isTransparent;
      const isTrailsActive = Boolean(curConfig.trailsEnabled) && !isLight && !isTransparent;

      if (isBloomActive && composerRef.current && bloomPassRef.current) {
        // Sync dynamic bloom parameters & ACES Filmic tone mapping
        bloomPassRef.current.strength = curConfig.bloomStrength ?? 1.2;
        bloomPassRef.current.radius = curConfig.bloomRadius ?? 0.6;
        bloomPassRef.current.threshold = curConfig.bloomThreshold ?? 0.15;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = curConfig.bloomToneMappingExposure ?? 1.0;

        if (isTrailsActive) {
          renderer.autoClearColor = false;
          const blurIntensity = curConfig.motionBlurIntensity ?? 1.0;
          const baseTrailLen = Math.max(0.10, Math.min(0.98, curConfig.trailLength ?? 0.85));
          const scaledPersistence = Math.max(0.05, Math.min(0.988, 1.0 - (1.0 - baseTrailLen) / Math.max(0.15, blurIntensity)));
          const fadeAlpha = Math.max(0.012, Math.min(0.95, (1.0 - scaledPersistence) * (1.0 / Math.max(0.3, Math.sqrt(blurIntensity)))));
          fadeMaterial.opacity = fadeAlpha;
          renderer.render(fadeScene, fadeCamera);
          renderer.clearDepth();
        }

        composerRef.current.render(dt);
      } else if (isTrailsActive) {
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.autoClearColor = false;
        
        const blurIntensity = curConfig.motionBlurIntensity ?? 1.0;
        const baseTrailLen = Math.max(0.10, Math.min(0.98, curConfig.trailLength ?? 0.85));
        const scaledPersistence = Math.max(0.05, Math.min(0.988, 1.0 - (1.0 - baseTrailLen) / Math.max(0.15, blurIntensity)));
        const fadeAlpha = Math.max(0.012, Math.min(0.95, (1.0 - scaledPersistence) * (1.0 / Math.max(0.3, Math.sqrt(blurIntensity)))));
        fadeMaterial.opacity = fadeAlpha;

        // Render full screen fade quad over preserved buffer to dim old particle positions
        renderer.render(fadeScene, fadeCamera);
        renderer.clearDepth();

        // Render particle system on top, leaving a luminous decaying ghost path
        renderer.render(scene, camera);
      } else {
        // Standard clean render - clears color & depth completely every frame
        // This guarantees THREE.NormalBlending composites razor-sharp with no canvas color artifacts!
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.autoClear = true;
        renderer.autoClearColor = true;
        renderer.autoClearDepth = true;
        renderer.render(scene, camera);
      }
    };

    animate();

    // Keyboard shortcut handler for Bloom (Key: 'b'/'B'), Physics Debug (Key: 'p'/'P') and Grid (Key: 'g'/'G')
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'b' || e.key === 'B') {
        onChangeConfig({ bloomEnabled: !configRef.current.bloomEnabled });
      }
      if (e.key === 'p' || e.key === 'P') {
        onChangeConfig({ physicsDebugEnabled: !configRef.current.physicsDebugEnabled });
      }
      if (e.key === 'g' || e.key === 'G') {
        onChangeConfig({ gridOverlayEnabled: !configRef.current.gridOverlayEnabled });
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      if (gridVisualizerRef.current) {
        gridVisualizerRef.current.dispose();
      }
      if (physicsVisualizerRef.current) {
        physicsVisualizerRef.current.dispose();
      }
      if (composerRef.current) {
        composerRef.current.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // Update Geometry & Buffers when source/target shapes or particle count changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (rendererRef.current) {
      rendererRef.current.clear();
    }

    if (pointsRef.current) {
      scene.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      pointsRef.current = null;
    }

    const count = config.particleCount;
    const geometry = new THREE.BufferGeometry();

    const chain = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];
    const numSegments = Math.max(1, chain.length - 1);
    const clampedProg = Math.max(0, Math.min(0.999999, config.progress || 0));
    const scaledT = clampedProg * numSegments;
    const curSeg = Math.min(Math.floor(scaledT), numSegments - 1);
    activeSegmentRef.current = curSeg;

    const src = chain[curSeg] || sourceShape;
    const dst = chain[curSeg + 1] || targetShape;

    // Source attributes
    const srcPositions = src.positions.slice(0, count * 3);
    const srcColors = src.colors.slice(0, count * 3);
    // Target attributes
    const dstPositions = dst.positions.slice(0, count * 3);
    const dstColors = dst.colors.slice(0, count * 3);

    // Random noise/delay factors and sprite layers per particle
    const randomOffsets = new Float32Array(count);
    const delayVals = new Float32Array(count);
    const spriteIndices = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randomOffsets[i] = Math.random();
      spriteIndices[i] = i % 5;
      // Brightness or coordinate delay
      const r = srcColors[i * 3 + 0];
      const g = srcColors[i * 3 + 1];
      const b = srcColors[i * 3 + 2];
      delayVals[i] = (r * 0.3 + g * 0.59 + b * 0.11);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(srcPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(srcColors, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(srcColors, 3));
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(dstPositions, 3));
    geometry.setAttribute('aTargetColor', new THREE.BufferAttribute(dstColors, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomOffsets, 1));
    geometry.setAttribute('aDelayVal', new THREE.BufferAttribute(delayVals, 1));
    geometry.setAttribute('aSpriteIndex', new THREE.BufferAttribute(spriteIndices, 1));

    // Generate snowflake sprite textures
    const tex1 = createSnowflakeCanvasTexture(1);
    const tex2 = createSnowflakeCanvasTexture(2);
    const tex3 = createSnowflakeCanvasTexture(3);
    const tex4 = createSnowflakeCanvasTexture(4);
    const tex5 = createSnowflakeCanvasTexture(5);

    // Shader Material
    const isTransBg = isTransparentBackground(config.backgroundColor);
    const isLightBg = isLightBackgroundColor(config.backgroundColor);
    const isSnowflake = config.particleType && config.particleType.startsWith('snowflake');
    const blendingMode = (isLightBg || isTransBg)
      ? THREE.NormalBlending
      : config.snowflakeCustomBlending && isSnowflake ? THREE.AdditiveBlending :
        config.blending === 'screen' ? THREE.CustomBlending :
        config.blending === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending;

    const initColA = new THREE.Color(config.colorA || '#00F0FF');
    const initColB = new THREE.Color(config.colorB || '#FF007F');
    const initColC = new THREE.Color(config.colorC || '#FFE600');

    const material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uProgress: { value: config.progress },
        uTime: { value: 0.0 },
        uNoiseAmp: { value: config.noiseAmp },
        uNoiseFreq: { value: config.noiseFreq },
        uNoiseSpeed: { value: config.noiseSpeed },
        uDelaySpread: { value: config.delaySpread },
        uNoiseType: { value: 0 },
        uDelayMode: { value: 0 },
        uPointSize: { value: config.pointSize },
        uColorMixMode: { value: 0 },
        uColorMode: { value: 0 },
        uColorA: { value: new THREE.Vector3(initColA.r, initColA.g, initColA.b) },
        uColorB: { value: new THREE.Vector3(initColB.r, initColB.g, initColB.b) },
        uColorC: { value: new THREE.Vector3(initColC.r, initColC.g, initColC.b) },
        uColorMixRatio: { value: config.colorMixRatio ?? 0.5 },
        uVelocityShift: { value: config.velocityColorShift ?? 1.0 },
        uColorGamma: { value: config.colorGamma ?? 1.0 },
        uGlowIntensity: { value: config.glowIntensity },
        uIsLightBackground: { value: (isLightBg || isTransBg) ? 1.0 : 0.0 },
        uParticleType: { value: 0 },
        uShapeRotation: { value: 0 },
        uCoreRatio: { value: config.coreRatio ?? 0.8 },
        uSpriteHslCycle: { value: config.spriteHslCycle ? 1.0 : 0.0 },
        uUseSpriteTexture: { value: 0 },
        uSpriteTexture1: { value: tex1 },
        uSpriteTexture2: { value: tex2 },
        uSpriteTexture3: { value: tex3 },
        uSpriteTexture4: { value: tex4 },
        uSpriteTexture5: { value: tex5 },
        uMousePos: { value: new THREE.Vector3(0, 0, 0) },
        uMouseRadius: { value: config.mouseGravityRadius ?? 6.0 },
        uMouseStrength: { value: config.mouseGravityStrength ?? 3.5 },
        uMouseMode: { value: config.mouseGravityMode === 'repel' ? 1 : config.mouseGravityMode === 'vortex' ? 2 : 0 },
        uMouseActive: { value: 0.0 },
        uAmbientDrift: { value: config.ambientDriftAmp ?? 1.3 },
        uAudioBass: { value: 0.0 },
        uAudioTreble: { value: 0.0 },
        uAudioPulse: { value: 0.0 },
        uBlackHoleActive: { value: config.blackHoleEnabled ? 1.0 : 0.0 },
        uBlackHoleMass: { value: config.blackHoleMass ?? 3.0 },
        uBlackHoleRadius: { value: config.blackHoleRadius ?? 7.0 },
        uGlitchIntensity: { value: config.glitchIntensity ?? 0.0 },
        uMotionBlurIntensity: { value: config.motionBlurIntensity ?? 1.0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: config.depthTest,
      blending: blendingMode,
    });
    materialRef.current = material;

    // Initialize WASM fallback engine
    wasmEngineRef.current.init(
      count,
      srcPositions,
      dstPositions,
      srcColors,
      dstColors,
      randomOffsets
    );

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

  }, [sourceShape, targetShape, morphChain, config.particleCount, config.blending, config.depthTest]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 1.5, 14);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const chain = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];

  const isTransparent = isTransparentBackground(config.backgroundColor);
  const isLight = isLightBackgroundColor(config.backgroundColor);

  return (
    <div
      className={`relative w-full h-full overflow-hidden font-mono transition-colors duration-300 ${
        isTransparent ? 'canvas-transparent-bg' : ''
      }`}
      style={{
        backgroundColor: isTransparent
          ? 'transparent'
          : config.backgroundColor || (isLight ? '#FFFFFF' : '#030712'),
      }}
    >
      {/* Background Radial Dot Grid (Only shown in dark mode) */}
      {!isTransparent && !isLight && (
        <div className="absolute inset-0 pointer-events-none opacity-20 hud-grid-bg" />
      )}

      {/* Viewport Corner HUD Technical Markers */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none text-[10px] text-gray-500 tracking-widest uppercase">
        VIEWPORT_PRIMARY_01
      </div>

      <div className="absolute top-3 right-4 z-20 pointer-events-none flex items-center gap-3 text-[10px] text-gray-500 tracking-wider font-mono">
        <span className="text-[#00F0FF] text-[9px] bg-[#1A1A1E] px-1.5 py-0.5 border border-[#2A2A2E]">
          {chain.length > 2 ? `MULTI_STAGE_${chain.length}X` : 'MORPHING_STAGED'}
        </span>
        <span className="text-gray-400 text-[9px] bg-[#1A1A1E] px-1.5 py-0.5 border border-[#2A2A2E]">
          BOUNDS_OK
        </span>
      </div>

      {/* Center Top HUD Banner with Full Morph Chain Sequence */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-1.5 max-w-[90vw]">
        <div className="flex items-center gap-1.5 bg-[#0F0F12]/90 border border-[#2A2A2E] px-3.5 py-1 text-xs text-[#E0E0E0] shadow-[0_0_15px_rgba(0,0,0,0.8)] overflow-x-auto">
          <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse shrink-0" />
          {chain.map((shape, idx) => (
            <React.Fragment key={`${shape.id}-${idx}`}>
              {idx > 0 && <span className="text-gray-600 font-mono text-[11px]">────▶</span>}
              <span className={`font-bold whitespace-nowrap text-[11px] ${
                holdingStationInfo?.index === idx
                  ? 'text-amber-300 bg-amber-400/20 px-1.5 py-0.5 border border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : idx === 0
                  ? 'text-[#00F0FF]'
                  : idx === chain.length - 1
                  ? 'text-white'
                  : 'text-amber-400'
              }`}>
                {idx === 0 ? `[출발] ${shape.name}` : idx === chain.length - 1 ? `[목표] ${shape.name}` : `[경유${idx}] ${shape.name}`}
              </span>
            </React.Fragment>
          ))}
          <span className="text-gray-600 font-mono text-[11px]">|</span>
          <span className="font-mono text-[#00F0FF] font-bold text-[11px] shrink-0">
            {config.particleCount.toLocaleString()} PTS
          </span>
        </div>

        {/* 1.0s Rest Stop Active Notification */}
        {holdingStationInfo && (
          <div className="flex items-center gap-1.5 bg-[#1C1808]/95 border border-amber-400 text-amber-300 px-3 py-0.5 text-[10px] font-bold tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.35)] animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>⏱️ 1초간 정지 관찰 중: {holdingStationInfo.name}</span>
          </div>
        )}
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Real-Time Physics Field Debug HUD Overlay (Top-Right) */}
      <PhysicsDebugOverlay
        config={config}
        onChangeConfig={onChangeConfig}
        metrics={physicsMetrics}
        sourceShape={sourceShape}
        targetShape={targetShape}
      />

      {/* Visual 3D Coordinate Grid & Shape Alignment Overlay (Top-Left) */}
      <CoordinateGridOverlay
        config={config}
        onChangeConfig={onChangeConfig}
        sourceShape={sourceShape}
        targetShape={targetShape}
      />

      {/* Snapshot Shutter Flash Effect */}
      {isFlashing && (
        <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-[2px] pointer-events-none transition-opacity duration-300 animate-out fade-out" />
      )}

      {/* Snapshot Saved Toast Banner */}
      {snapshotToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#0F0F12]/95 border border-[#00F0FF] px-4 py-2 text-xs text-white shadow-[0_0_25px_rgba(0,240,255,0.4)] animate-in fade-in slide-in-from-top-2">
          <div className="p-1 bg-[#00F0FF] text-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-bold text-[#00F0FF] text-[10px] uppercase tracking-wider">3D 스냅샷 저장 완료</div>
            <div className="text-[10px] text-gray-300 font-mono truncate max-w-xs">{snapshotToast}</div>
          </div>
        </div>
      )}

      {/* Floating Canvas Quick Controls (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-[#0F0F12]/90 backdrop-blur-md border border-[#2A2A2E] px-2.5 py-1.5 text-xs text-[#E0E0E0] shadow-xl">
        {/* Background Contrast Mode Quick Switcher: 3 Modes */}
        <button
          onClick={() => onChangeConfig({ backgroundColor: 'transparent' })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 font-bold ${
            isTransparent
              ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:text-[#00F0FF]'
          }`}
          title="캔버스 색상 없음 (투명): 배경색을 완전히 제거하고 파티클만 투명하게 렌더링"
        >
          <span>🏁 색상 없음 (투명)</span>
        </button>
        <button
          onClick={() => onChangeConfig({ backgroundColor: '#FFFFFF' })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 font-bold ${
            !isTransparent && isLight
              ? 'bg-amber-300 text-black border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
              : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-amber-300'
          }`}
          title="백색 배경 모드: 잉크 고대비 셰이더 및 노멀 블렌딩 자동 적용"
        >
          <span>☀️ 화이트</span>
        </button>
        <button
          onClick={() => onChangeConfig({ backgroundColor: '#030712' })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 font-bold ${
            !isTransparent && !isLight
              ? 'bg-[#030712] text-[#00F0FF] border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="다크 네온 모드: 딥 스페이스 배경 및 발광 블렌딩 적용"
        >
          <span>🌌 다크</span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={handleResetCamera}
          className="px-2 py-1 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#2A2A2E] text-gray-300 hover:text-white transition font-mono uppercase text-[10px] cursor-pointer"
          title="Reset 3D Camera View"
        >
          RESET CAMERA
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => onChangeConfig({ gridOverlayEnabled: !config.gridOverlayEnabled })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            config.gridOverlayEnabled
              ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="3D 형상 정밀 정렬 좌표 그리드 토글 (단축키: G)"
        >
          <Grid className="w-2.5 h-2.5" />
          <span>GRID: {config.gridOverlayEnabled ? 'ON' : 'OFF'}</span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => {
            if (!config.mouseGravityEnabled) {
              onChangeConfig({ mouseGravityEnabled: true, mouseGravityMode: 'attract' });
            } else if (config.mouseGravityMode === 'attract') {
              onChangeConfig({ mouseGravityMode: 'vortex' });
            } else if (config.mouseGravityMode === 'vortex') {
              onChangeConfig({ mouseGravityMode: 'repel' });
            } else {
              onChangeConfig({ mouseGravityEnabled: false });
            }
          }}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            config.mouseGravityEnabled
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'bg-[#1A1A1E] text-gray-500 border-[#2A2A2E] hover:text-white'
          }`}
          title="마우스 커서 중력 상호작용 모드 변경 (인력 ➔ 와류 ➔ 척력 ➔ 끄기)"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>
            {config.mouseGravityEnabled
              ? `중력: ${config.mouseGravityMode === 'attract' ? '인력 수렴' : config.mouseGravityMode === 'vortex' ? '와류 회전' : '척력 산란'}`
              : '중력: OFF'}
          </span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={async () => {
            const nextVal = !config.audioReactiveEnabled;
            if (nextVal) {
              await audioEngine.init(config.audioSourceType || 'synth');
            } else {
              audioEngine.stop();
            }
            onChangeConfig({ audioReactiveEnabled: nextVal });
          }}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            config.audioReactiveEnabled
              ? 'bg-[#FF007F]/20 text-[#FF007F] border-[#FF007F] font-bold shadow-[0_0_10px_rgba(255,0,127,0.3)] animate-pulse'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="오디오 주파수 비트 반응형 모핑 (Page 14 기능)"
        >
          <Music className="w-2.5 h-2.5" />
          <span>오디오: {config.audioReactiveEnabled ? 'ON' : 'OFF'}</span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => onChangeConfig({ blackHoleEnabled: !config.blackHoleEnabled })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            config.blackHoleEnabled
              ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600] font-bold shadow-[0_0_10px_rgba(255,230,0,0.3)]'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="블랙홀 특이점 포스 필드 활성화 (Page 15 기능)"
        >
          <Radio className="w-2.5 h-2.5" />
          <span>블랙홀: {config.blackHoleEnabled ? 'ON' : 'OFF'}</span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => {
            const currentInt = config.motionBlurIntensity ?? (config.trailsEnabled ? 1.0 : 0.0);
            if (currentInt <= 0.1) {
              onChangeConfig({ trailsEnabled: true, motionBlurIntensity: 1.0 });
            } else if (currentInt <= 1.0) {
              onChangeConfig({ trailsEnabled: true, motionBlurIntensity: 2.0 });
            } else {
              onChangeConfig({ trailsEnabled: false, motionBlurIntensity: 0.0 });
            }
          }}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            (config.motionBlurIntensity && config.motionBlurIntensity > 0.1) || config.trailsEnabled
              ? 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66] font-bold shadow-[0_0_10px_rgba(0,255,102,0.2)]'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="모션 블러 잔상 강도 순환 (OFF ➔ 1.0x ➔ 2.0x ➔ OFF)"
        >
          <Wind className="w-2.5 h-2.5" />
          <span>
            BLUR: {(config.motionBlurIntensity ?? (config.trailsEnabled ? 1.0 : 0.0)) > 0.1 ? `${(config.motionBlurIntensity ?? 1.0).toFixed(1)}x` : 'OFF'}
          </span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => onChangeConfig({ bloomEnabled: !config.bloomEnabled })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer flex items-center gap-1 ${
            config.bloomEnabled
              ? 'bg-[#FF007F]/20 text-[#FF007F] border-[#FF007F] font-bold shadow-[0_0_12px_rgba(255,0,127,0.35)]'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
          title="언리얼 블룸 & 후처리 광원 토글 (단축키: B)"
        >
          <Sun className={`w-2.5 h-2.5 ${config.bloomEnabled ? 'text-[#FF007F] animate-pulse' : 'text-gray-400'}`} />
          <span>BLOOM: {config.bloomEnabled ? `${(config.bloomStrength ?? 1.2).toFixed(1)}x` : 'OFF'}</span>
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={() => onChangeConfig({ autoRotate: !config.autoRotate })}
          className={`px-2 py-1 text-[10px] font-mono uppercase transition border cursor-pointer ${
            config.autoRotate
              ? 'bg-[#00F0FF] text-black border-[#00F0FF] font-bold'
              : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
          }`}
        >
          {config.autoRotate ? 'ORBIT: ON' : 'ORBIT: OFF'}
        </button>
        <div className="h-3.5 w-px bg-[#2A2A2E]" />
        <button
          onClick={captureSnapshot}
          className="px-2 py-1 bg-[#1A1A1E] hover:bg-[#00F0FF] hover:text-black hover:border-[#00F0FF] text-[#00F0FF] border border-[#2A2A2E] transition font-mono uppercase text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.15)]"
          title="현재 3D 화면 스냅샷 캡처 및 이미지 다운로드"
        >
          <Camera className="w-3 h-3" />
          <span>SNAPSHOT</span>
        </button>
        {onOpenVideoModal && (
          <>
            <div className="h-3.5 w-px bg-[#2A2A2E]" />
            <button
              onClick={onOpenVideoModal}
              className="px-2 py-1 bg-red-950/40 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/50 hover:border-red-500 transition font-mono uppercase text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
              title="60FPS 무손실 비디오 녹화 (MediaRecorder WebM/MP4)"
            >
              <Video className="w-3 h-3 text-red-400" />
              <span>REC VIDEO</span>
            </button>
          </>
        )}
      </div>

      {/* Technical Telemetry Readout (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-none hidden sm:flex items-center gap-4 text-[10px] text-gray-500 font-mono">
        <span>ENGINE: <strong className="text-gray-300 uppercase">{config.engineMode}</strong></span>
        <span>SHAPE_ID: <strong className="text-[#00F0FF]">{sourceShape.id}</strong></span>
        <span>LAT: <strong className="text-gray-300">0.8ms</strong></span>
      </div>
    </div>
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
