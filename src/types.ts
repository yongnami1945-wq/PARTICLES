export type EngineMode = 'glsl' | 'wasm';

export type DelayMode = 'none' | 'linear_y' | 'linear_x' | 'radial' | 'brightness' | 'random';

export type MorphEasing = 
  | 'linear'       // 선형 등속 (Uniform Constant Velocity)
  | 'ease-in-out'  // 부드러운 가감속 (Smooth Cubic S-Curve)
  | 'bounce'       // 탄성 바운스 (Elastic Rebound)
  | 'elastic'      // 스프링 엘라스틱 (Damped Spring Oscillation)
  | 'cubic-in'     // 급가속 진입 (Fast Acceleration In)
  | 'cubic-out'    // 부드러운 감속 안착 (Smooth Deceleration Out)
  | 'back-out';    // 오버슈트 후 안착 (Overshoot & Return);

export type NoiseType = 'curl' | 'simplex' | 'turbulence' | 'vortex';

export type ParticleType = 
  | 'circle'          // 원형 부드러운 도트 (Soft Glow Circle)
  | 'snowflake1'      // ❄️ Three.js 스노우 스프라이트 1 (Crystal Snowflake 1)
  | 'snowflake2'      // ❄️ Three.js 스노우 스프라이트 2 (Star Snowflake 2)
  | 'snowflake3'      // ❄️ Three.js 스노우 스프라이트 3 (Dendrite Snowflake 3)
  | 'snowflake4'      // ❄️ Three.js 스노우 스프라이트 4 (Ice Flake 4)
  | 'snowflake5'      // ❄️ Three.js 스노우 스프라이트 5 (Micro Crystal 5)
  | 'snowflake_multi' // 🌨️ 5단 멀티 스노우 스프라이트 레이어 (5-Layer Multi Blizzard)
  | 'bird'            // 🦅 Boids 조류 날개짓 (Flocking Bird Wing)
  | 'feather'         // 🪶 에어로다이내믹 깃털 (Aerodynamic Feather)
  | 'delta'           // 🔺 초음속 델타 윙 (Supersonic Delta Wing)
  | 'star'            // 십자 빛갈라짐 스타 (Cross Star Sparkle)
  | 'diamond'         // 다이아몬드 / 마름모 (Diamond Spark)
  | 'ring'            // 네온 링 / 버블 (Neon Ring / Bubble)
  | 'hexagon'         // 사이버 헥사곤 (Cyber Hexagon)
  | 'cube'            // 디지털 정사각형 블록 (Square Pixel)
  | 'cloud'           // 네뷸라 성운 스모크 (Nebula Cloud)
  | 'bokeh';          // 보케 렌즈 림 (Bokeh Flare)

export type ColorMixMode = 
  | 'interpolate'    // 소스 ➔ 타깃 형상 색상 자연 보간
  | 'gradient'       // 커스텀 3색 그라디언트 램프
  | 'velocity'       // 파티클 이동 속도 및 운동에너지 기반 발광 변색
  | 'height'         // Y축 수직 고도 기반 그라디언트
  | 'radial'         // 중심점 거리 기반 방사형 스펙트럼
  | 'additive_mix'   // RGB 가산 광원 혼합
  | 'palette';       // 프리셋 테마 팔레트

export interface ParticlePoint {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface MorphShape {
  id: string;
  name: string;
  type: 'preset' | 'image' | 'text';
  icon?: string;
  positions: Float32Array; // [x, y, z, ...] length: count * 3
  colors: Float32Array;    // [r, g, b, ...] length: count * 3
  previewUrl?: string;
  description?: string;
}

export interface MorphConfig {
  particleCount: number;
  progress: number;
  isPlaying: boolean;
  playSpeed: number;
  playMode: 'loop' | 'pingpong' | 'once' | 'sequence';
  morphEasing: MorphEasing; // 'linear' | 'ease-in-out' | 'bounce' | 'elastic' | 'cubic-in' | 'cubic-out' | 'back-out'
  
  // Physics & Noise
  noiseAmp: number;
  noiseFreq: number;
  noiseSpeed: number;
  noiseType: NoiseType;
  delayMode: DelayMode;
  delaySpread: number;
  durationVariance: number;
  attractStrength: number;
  damping: number;
  
  // Particle Shape & Type
  particleType: ParticleType;
  shapeRotation: number; // 0 ~ 360 deg or auto spin
  coreRatio: number;     // 0.1 ~ 1.0 (hot center sharpness)

  // Color Mixing & Shader Visuals
  colorMixMode: ColorMixMode;
  colorScheme: 'original' | 'cyberpunk' | 'fire' | 'galaxy' | 'emerald' | 'sunset' | 'custom';
  colorA: string;        // Base / Source color (Hex #RRGGBB)
  colorB: string;        // Mid / Transition color (Hex #RRGGBB)
  colorC: string;        // Peak / Highlight color (Hex #RRGGBB)
  colorMixRatio: number; // 0.0 ~ 1.0 mix curve
  velocityColorShift: number; // 0.0 ~ 2.0 kinetic color excitation
  colorGamma: number;    // 0.5 ~ 2.0 color power
  
  pointSize: number;
  glowIntensity: number;
  blending: 'additive' | 'normal' | 'screen';
  autoRotate: boolean;
  rotateSpeed: number;
  depthTest: boolean;
  backgroundColor: string; // #000000, #030712, #0A0A0B, #0F172A, #FFFFFF, etc.
  
  // Motion Trails & Ghost Path Rendering
  trailsEnabled: boolean;
  trailLength: number; // 0.10 ~ 0.98 (persistence factor)
  motionBlurIntensity?: number; // 0.0 ~ 3.0 (dynamically scales trail alpha persistence & velocity streak length)
  
  // Bloom & Post-Processing (Three.js UnrealBloomPass & ACES Filmic Tone Mapping)
  bloomEnabled?: boolean;               // Master toggle for Bloom post-processing
  bloomStrength?: number;              // 0.0 ~ 3.5 (Bloom radiance & halo intensity, default 1.2)
  bloomRadius?: number;                // 0.0 ~ 2.0 (Bloom blur dispersion radius, default 0.6)
  bloomThreshold?: number;             // 0.0 ~ 1.0 (Luminance cutoff threshold, default 0.15)
  bloomToneMappingExposure?: number;   // 0.2 ~ 3.0 (Tone mapping exposure, default 1.0)

  // Interactive Mouse Gravity & Ambient Free-Floating Field
  mouseGravityEnabled: boolean;
  mouseGravityRadius: number;    // 1.0 ~ 15.0 world units
  mouseGravityStrength: number;  // 0.5 ~ 10.0 force magnitude
  mouseGravityMode: 'attract' | 'repel' | 'vortex'; // Gravitational mode
  ambientDriftAmp: number;       // 0.0 ~ 5.0 free-floating wandering amplitude

  // Audio Reactivity (Page 14 Manual Feature)
  audioReactiveEnabled: boolean;
  audioSensitivity: number;      // 0.5 ~ 3.0
  audioBassScale: number;        // 0.0 ~ 4.0 (bass pulse expansion)
  audioTrebleGlitter: number;    // 0.0 ~ 3.0 (treble sparkle frequency)
  audioSourceType: 'mic' | 'synth' | 'file';

  // Force Fields & Black Hole Singularity (Page 15 Manual Feature)
  blackHoleEnabled: boolean;
  blackHoleMass: number;         // 0.5 ~ 8.0 (gravitational pull)
  blackHoleRadius: number;       // 1.0 ~ 12.0 event horizon

  // Cinematic FX & Glitch (Page 16 Manual Feature)
  chromaticAberration: number;   // 0.0 ~ 2.0 (RGB split)
  glitchIntensity: number;       // 0.0 ~ 2.0 (digital glitch distortion)

  // Three.js Snowflake Sprites & Multi-Density Blizzard (Attached File Features)
  spriteHslCycle?: boolean;          // Real-time HSL color cycle (materials[i].color.setHSL)
  snowflakeMultiSize?: boolean;      // 5-Layer Multi Size Scale (20, 15, 10, 8, 5 px)
  snowflakeCustomBlending?: boolean; // Pre-multiplied Alpha Custom Blending (OneFactor / OneMinusSrcAlphaFactor)
  snowflakeDensityMultiplier?: number; // 0.5 ~ 3.0 density scaling

  // Multi-Stage Waypoints (Intermediate Morphing Stages)
  waypointShapeIds?: string[]; // List of intermediate shape IDs between source and target
  
  // Real-Time Physics Debug Field Visualization Overlay
  physicsDebugEnabled?: boolean;        // Toggle master 3D physics vector field overlay
  physicsDebugVectorScale?: number;    // Vector arrow length scale (0.2 ~ 3.0, default 1.0)
  physicsDebugDensity?: number;        // Spatial grid resolution (4 ~ 12, default 6)
  physicsDebugShowNoise?: boolean;      // Show noise curl / turbulence flow field
  physicsDebugShowAttraction?: boolean; // Show morph trajectory attraction forces
  physicsDebugShowGravity?: boolean;    // Show mouse gravity & black hole pull vectors
  physicsDebugShowVelocity?: boolean;   // Show particle instantaneous velocity vectors
  physicsDebugShowGrid?: boolean;       // Show spatial 3D force lattice & bounds

  // Visual 3D Precision Coordinate Grid & Alignment Overlay
  gridOverlayEnabled?: boolean;         // Toggle visual 3D coordinate grid overlay
  gridOverlayPlane?: 'xz' | 'xy' | 'yz' | 'all'; // Active grid plane ('xz' floor, 'xy' front, 'yz' side, 'all' 3D cage)
  gridOverlaySize?: number;             // Grid plane world size (default 24)
  gridOverlayDivisions?: number;        // Grid line divisions (default 24)
  gridOverlayShowAxes?: boolean;        // Show RGB XYZ 3D axis arrows & vectors
  gridOverlayShowBounds?: boolean;      // Show bounding box alignment guides
  gridOverlayShowLabels?: boolean;      // Show scale number graduations
  gridOverlayOpacity?: number;          // Grid line opacity (0.1 ~ 1.0)

  // Engine
  engineMode: EngineMode;
}

export interface ImageProcessingOptions {
  threshold: number;      // 0 ~ 255 alpha/luminance cut
  invert: boolean;
  sampleDensity: number;  // step size
  depthScale: number;     // 3D extrusion
  distribution: 'grid' | 'edge' | 'luminance_prob';
  targetSize: number;     // scale in 3D world
  colorBoost: number;
}

export interface SerializedMorphShape {
  id: string;
  name: string;
  type: 'preset' | 'image' | 'text';
  icon?: string;
  positions: number[]; // serialized float array
  colors: number[];    // serialized float array
  previewUrl?: string;
  description?: string;
}

export interface SingleMorphPresetPackage {
  schema: 'particle-morph-single-preset-v2' | 'particle-morph-preset-v2';
  version: number;
  name: string;
  description?: string;
  author?: string;
  createdAt: string;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  morphChain: string[];
  config: Partial<MorphConfig>;
  shapes: SerializedMorphShape[]; // all shapes involved in the chain (source, waypoints, target, custom shapes)
  tags?: string[];
  metadata?: {
    particleCount?: number;
    colorScheme?: string;
    engineMode?: string;
    sourceName?: string;
    targetName?: string;
    tags?: string[];
  };
}

export interface ImportedPresetResult {
  isValid: boolean;
  name: string;
  description?: string;
  config: Partial<MorphConfig>;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  morphChain: string[];
  shapes: MorphShape[];
  tags?: string[];
  rawPackage?: any;
}

export interface NumberedPreset {
  slot: number;              // 1, 2, 3, 4, 5, 6, 7, 8, ...
  id: string;
  name: string;
  category?: 'builtin' | 'user';
  createdAt?: number;
  config: Partial<MorphConfig>;
  sourceShapeId?: string;
  targetShapeId?: string;
  waypointShapeIds?: string[]; // multi-stage waypoint shape IDs
  morphChain?: string[];       // full chain [source, ...waypoints, target]
  customShapes?: SerializedMorphShape[]; // attached user-defined shapes (e.g. image/text)
  description?: string;
  tags?: string[];
}

export interface WorkspacePersistenceState {
  version: number;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  config: Partial<MorphConfig>;
  customShapes?: SerializedMorphShape[];
  lastSavedAt?: number;
  autoRestoreEnabled?: boolean;
}

export interface PerformanceStats {
  fps: number;
  vertexCount: number;
  gpuMemoryMb: number;
  vboMemoryMb: number;
  renderBufferMemoryMb: number;
  drawCalls: number;
}

// -------------------------------------------------------------
// Global State History & Undo / Redo Snapshots
// -------------------------------------------------------------

export interface StateSnapshot {
  id: string;
  timestamp: number;
  description: string;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  config: MorphConfig;
  customShapes?: SerializedMorphShape[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  description: string;
  isCurrent?: boolean;
}

export interface HistoryManagerInfo {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  lastPastDescription?: string;
  nextFutureDescription?: string;
  historyList: HistoryItem[];
}

