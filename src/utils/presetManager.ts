import { 
  MorphConfig, 
  MorphShape, 
  NumberedPreset, 
  SerializedMorphShape, 
  WorkspacePersistenceState,
  SingleMorphPresetPackage,
  ImportedPresetResult
} from '../types';

export const BUILTIN_PRESETS: NumberedPreset[] = [
  {
    slot: 1,
    id: 'preset_1_cyber_vortex',
    name: 'Cyber Matrix Vortex',
    category: 'builtin',
    sourceShapeId: 'sphere',
    targetShapeId: 'torus',
    waypointShapeIds: ['saturn'],
    morphChain: ['sphere', 'saturn', 'torus'],
    description: '사이버펑크 네온 색채와 볼텍스 소용돌이 궤적 몰핑',
    tags: ['Sphere', 'Saturn', 'Torus', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Hexagon', 'Noise: Vortex', 'Theme: Cyberpunk', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'hexagon',
      shapeRotation: 30,
      coreRatio: 0.85,
      noiseType: 'vortex',
      noiseAmp: 2.2,
      noiseFreq: 0.9,
      noiseSpeed: 0.8,
      delayMode: 'radial',
      delaySpread: 0.5,
      colorMixMode: 'gradient',
      colorScheme: 'cyberpunk',
      colorA: '#00F0FF',
      colorB: '#FF007F',
      colorC: '#FFE600',
      pointSize: 2.8,
      glowIntensity: 1.6,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.88,
      motionBlurIntensity: 1.2,
      playSpeed: 0.9,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.7,
    },
  },
  {
    slot: 2,
    id: 'preset_2_supernova_star',
    name: 'Supernova Starburst',
    category: 'builtin',
    sourceShapeId: 'sphere',
    targetShapeId: 'heart',
    waypointShapeIds: ['galaxy'],
    morphChain: ['sphere', 'galaxy', 'heart'],
    description: '십자 스타 회절 광채와 고에너지 난류 폭발',
    tags: ['Sphere', 'Galaxy', 'Heart', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Star', 'Noise: Curl', 'Theme: Fire', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'star',
      shapeRotation: 0,
      coreRatio: 0.95,
      noiseType: 'curl',
      noiseAmp: 3.2,
      noiseFreq: 1.1,
      noiseSpeed: 1.2,
      delayMode: 'brightness',
      delaySpread: 0.6,
      colorMixMode: 'velocity',
      colorScheme: 'fire',
      colorA: '#FF1A00',
      colorB: '#FF8800',
      colorC: '#FFFF55',
      velocityColorShift: 1.8,
      pointSize: 3.2,
      glowIntensity: 2.0,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.92,
      motionBlurIntensity: 1.4,
      playSpeed: 1.1,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.8,
    },
  },
  {
    slot: 3,
    id: 'preset_3_cosmic_nebula',
    name: 'Cosmic Nebula Swarm',
    category: 'builtin',
    sourceShapeId: 'cosmic-drift',
    targetShapeId: 'galaxy',
    waypointShapeIds: ['quantum-field'],
    morphChain: ['cosmic-drift', 'quantum-field', 'galaxy'],
    description: '네뷸라 성운 스모크와 은하수 유체 컬 노이즈',
    tags: ['Cosmic Drift', 'Quantum Field', 'Galaxy', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Cloud', 'Noise: Turbulence', 'Theme: Galaxy', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'cloud',
      shapeRotation: 0,
      coreRatio: 0.4,
      noiseType: 'turbulence',
      noiseAmp: 1.8,
      noiseFreq: 0.6,
      noiseSpeed: 0.5,
      delayMode: 'random',
      delaySpread: 0.4,
      colorMixMode: 'radial',
      colorScheme: 'galaxy',
      colorA: '#9D00FF',
      colorB: '#00F0FF',
      colorC: '#FF00AA',
      pointSize: 3.5,
      glowIntensity: 1.5,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.82,
      playSpeed: 0.7,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.4,
    },
  },
  {
    slot: 4,
    id: 'preset_4_neon_helix',
    name: 'Neon DNA Helix Ring',
    category: 'builtin',
    sourceShapeId: 'dna',
    targetShapeId: 'torus',
    waypointShapeIds: [],
    morphChain: ['dna', 'torus'],
    description: '에메랄드 네온 링과 Y축 고도 그라디언트',
    tags: ['DNA', 'Torus', '2-Stage (Direct)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Ring', 'Noise: Simplex', 'Theme: Emerald', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'ring',
      shapeRotation: 0,
      coreRatio: 0.7,
      noiseType: 'simplex',
      noiseAmp: 1.4,
      noiseFreq: 0.8,
      noiseSpeed: 0.6,
      delayMode: 'linear_y',
      delaySpread: 0.6,
      colorMixMode: 'height',
      colorScheme: 'emerald',
      colorA: '#00FF88',
      colorB: '#00FFFF',
      colorC: '#FFFF00',
      pointSize: 2.8,
      glowIntensity: 1.4,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.78,
      playSpeed: 0.8,
      playMode: 'loop',
      autoRotate: true,
      rotateSpeed: 0.6,
    },
  },
  {
    slot: 5,
    id: 'preset_5_voxel_cascade',
    name: 'Retro Voxel Cascade',
    category: 'builtin',
    sourceShapeId: 'cube',
    targetShapeId: 'skull',
    waypointShapeIds: [],
    morphChain: ['cube', 'skull'],
    description: '선명한 스퀘어 픽셀과 수직 낙하 폭포 시뮬레이션',
    tags: ['Cube', 'Skull', '2-Stage (Direct)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Cube', 'Noise: Simplex', 'Theme: Sunset', 'Auto-Orbit'],
    config: {
      particleType: 'cube',
      shapeRotation: 0,
      coreRatio: 0.9,
      noiseType: 'simplex',
      noiseAmp: 1.6,
      noiseFreq: 0.9,
      noiseSpeed: 0.7,
      delayMode: 'linear_y',
      delaySpread: 0.7,
      colorMixMode: 'gradient',
      colorScheme: 'sunset',
      colorA: '#FF4500',
      colorB: '#FFA500',
      colorC: '#4A00E0',
      pointSize: 2.4,
      glowIntensity: 1.1,
      blending: 'normal',
      trailsEnabled: false,
      trailLength: 0.6,
      playSpeed: 0.85,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.5,
    },
  },
  {
    slot: 6,
    id: 'preset_6_diamond_prism',
    name: 'Diamond Prism Morph',
    category: 'builtin',
    sourceShapeId: 'diamond',
    targetShapeId: 'trefoil',
    waypointShapeIds: ['wings'],
    morphChain: ['diamond', 'wings', 'trefoil'],
    description: '45도 다이아몬드 스파크와 가산 광원 굴절',
    tags: ['Diamond', 'Wings', 'Trefoil', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Diamond', 'Noise: Curl', 'Theme: Original', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'diamond',
      shapeRotation: 45,
      coreRatio: 0.8,
      noiseType: 'curl',
      noiseAmp: 2.0,
      noiseFreq: 1.0,
      noiseSpeed: 0.8,
      delayMode: 'random',
      delaySpread: 0.45,
      colorMixMode: 'interpolate',
      colorScheme: 'original',
      colorA: '#00F0FF',
      colorB: '#FF007F',
      colorC: '#FFE600',
      pointSize: 2.6,
      glowIntensity: 1.7,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.90,
      playSpeed: 0.9,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.7,
    },
  },
  {
    slot: 7,
    id: 'preset_7_deep_ocean',
    name: 'Deep Ocean Biolum',
    category: 'builtin',
    sourceShapeId: 'sphere',
    targetShapeId: 'gravity-vortex',
    waypointShapeIds: [],
    morphChain: ['sphere', 'gravity-vortex'],
    description: '심해 생물 발광 보케 렌즈와 방사형 스펙트럼',
    tags: ['Sphere', 'Gravity Vortex', '2-Stage (Direct)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Bokeh', 'Noise: Vortex', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'bokeh',
      shapeRotation: 0,
      coreRatio: 0.6,
      noiseType: 'vortex',
      noiseAmp: 2.4,
      noiseFreq: 0.7,
      noiseSpeed: 0.6,
      delayMode: 'radial',
      delaySpread: 0.55,
      colorMixMode: 'radial',
      colorScheme: 'custom',
      colorA: '#001A33',
      colorB: '#00E5FF',
      colorC: '#0066FF',
      pointSize: 3.8,
      glowIntensity: 1.8,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.86,
      playSpeed: 0.75,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.4,
    },
  },
  {
    slot: 8,
    id: 'preset_8_kinetic_lightning',
    name: 'Kinetic Ion Lightning',
    category: 'builtin',
    sourceShapeId: 'saturn',
    targetShapeId: 'starship',
    waypointShapeIds: [],
    morphChain: ['saturn', 'starship'],
    description: '고속 도플러 변색과 초장거리 이온 광원 궤적',
    tags: ['Saturn', 'Starship', '2-Stage (Direct)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Star', 'Noise: Turbulence', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'star',
      shapeRotation: 0,
      coreRatio: 1.0,
      noiseType: 'turbulence',
      noiseAmp: 3.8,
      noiseFreq: 1.4,
      noiseSpeed: 1.6,
      delayMode: 'brightness',
      delaySpread: 0.65,
      colorMixMode: 'velocity',
      colorScheme: 'custom',
      colorA: '#FFFFFF',
      colorB: '#00F0FF',
      colorC: '#7A00FF',
      velocityColorShift: 2.0,
      pointSize: 2.8,
      glowIntensity: 2.4,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.96,
      playSpeed: 1.3,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.9,
    },
  },
  {
    slot: 9,
    id: 'preset_9_gpgpu_flocking_birds',
    name: '🦅 GPGPU 군집 비행 (Flocking Birds)',
    category: 'builtin',
    sourceShapeId: 'cosmic-drift',
    targetShapeId: 'flocking-birds',
    waypointShapeIds: ['wings'],
    morphChain: ['cosmic-drift', 'wings', 'flocking-birds'],
    description: 'Three.js GPGPU Boids 군집 알고리즘과 3D 날개짓 조류 편대 비행 시뮬레이션',
    tags: ['Cosmic Drift', 'Wings', 'Flocking Birds', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Star', 'Noise: Vortex', 'Interactive-Gravity', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'star',
      shapeRotation: 15,
      coreRatio: 0.9,
      noiseType: 'vortex',
      noiseAmp: 2.4,
      noiseFreq: 0.8,
      noiseSpeed: 1.0,
      delayMode: 'radial',
      delaySpread: 0.45,
      colorMixMode: 'velocity',
      colorScheme: 'custom',
      colorA: '#00F0FF',
      colorB: '#00FFAA',
      colorC: '#FFE600',
      velocityColorShift: 1.8,
      pointSize: 2.8,
      glowIntensity: 2.0,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.92,
      playSpeed: 0.95,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.65,
      mouseGravityEnabled: true,
      mouseGravityMode: 'vortex',
      mouseGravityRadius: 7.5,
      mouseGravityStrength: 4.0,
    },
  },
  {
    slot: 10,
    id: 'preset_10_threejs_webgpu_earth',
    name: '🌍 Three.js WebGPU 지구 & 대기권 (Earth Atmosphere)',
    category: 'builtin',
    sourceShapeId: 'saturn',
    targetShapeId: 'earth',
    waypointShapeIds: ['tree'],
    morphChain: ['saturn', 'tree', 'earth'],
    description: '첨부파일 기반 Three.js WebGPU 대기권 프레넬 글로우(#4db2ff/#bc490b)와 대륙/해양 3D 글로브',
    tags: ['Saturn', 'Tree', 'Earth', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Bokeh', 'Noise: Curl', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'bokeh',
      shapeRotation: 0,
      coreRatio: 0.85,
      noiseType: 'curl',
      noiseAmp: 1.8,
      noiseFreq: 0.65,
      noiseSpeed: 0.6,
      delayMode: 'radial',
      delaySpread: 0.5,
      colorMixMode: 'gradient',
      colorScheme: 'custom',
      colorA: '#4DB2FF',
      colorB: '#BC490B',
      colorC: '#FFFFFF',
      velocityColorShift: 1.2,
      pointSize: 2.6,
      glowIntensity: 1.9,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.85,
      playSpeed: 0.8,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.5,
      ambientDriftAmp: 0.8,
    },
  },
  {
    slot: 11,
    id: 'preset_11_orbital_starship_earth',
    name: '🛸 궤도 우주선 ➔ 푸른 지구 (Orbital Rendezvous)',
    category: 'builtin',
    sourceShapeId: 'starship',
    targetShapeId: 'earth',
    waypointShapeIds: ['saturn'],
    morphChain: ['starship', 'saturn', 'earth'],
    description: '사이버 스타십 궤도 비행에서 푸른 지구 대기권 진입으로 전환되는 SF 시네마틱 몰핑',
    tags: ['Starship', 'Saturn', 'Earth', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Star', 'Noise: Turbulence', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'star',
      shapeRotation: 25,
      coreRatio: 0.9,
      noiseType: 'turbulence',
      noiseAmp: 2.8,
      noiseFreq: 1.0,
      noiseSpeed: 1.1,
      delayMode: 'brightness',
      delaySpread: 0.55,
      colorMixMode: 'velocity',
      colorScheme: 'custom',
      colorA: '#00F0FF',
      colorB: '#4DB2FF',
      colorC: '#FFE600',
      velocityColorShift: 2.0,
      pointSize: 2.8,
      glowIntensity: 2.2,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.92,
      playSpeed: 1.0,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.7,
    },
  },
  {
    slot: 12,
    id: 'preset_12_snowflake_glacial_earth',
    name: '❄️ 빙하기 스노우 & 결정체 (Glacial Snowflake)',
    category: 'builtin',
    sourceShapeId: 'snowflake-crystal',
    targetShapeId: 'earth',
    waypointShapeIds: ['text-hygothic'],
    morphChain: ['snowflake-crystal', 'text-hygothic', 'earth'],
    description: '6방 대칭 덴드라이트 스노우 결정체와 5단 가변 눈꽃 스프라이트 블리자드 몰핑',
    tags: ['Snowflake Crystal', 'HY-Taegothic', 'Earth', '3-Stage (Waypoint)', '60K Particles', 'Standard (30K-75K)', 'Sprite: Snowflake', 'Typography-3D', 'Noise: Simplex', 'Rainbow-Cycle', 'Motion-Trails', 'Auto-Orbit'],
    config: {
      particleType: 'snowflake_multi',
      spriteHslCycle: true,
      snowflakeMultiSize: true,
      snowflakeCustomBlending: true,
      shapeRotation: 0,
      coreRatio: 0.9,
      noiseType: 'simplex',
      noiseAmp: 2.0,
      noiseFreq: 0.75,
      noiseSpeed: 0.8,
      delayMode: 'random',
      delaySpread: 0.5,
      colorMixMode: 'gradient',
      colorScheme: 'custom',
      colorA: '#E0F7FA',
      colorB: '#00E5FF',
      colorC: '#80D8FF',
      pointSize: 3.2,
      glowIntensity: 2.0,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.88,
      playSpeed: 0.85,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.45,
    },
  },
];

const PRESETS_STORAGE_KEY = 'particle_morph_preset_library_v2';
const WORKSPACE_STORAGE_KEY = 'particle_morph_workspace_state_v2';
const AUTO_RESTORE_STORAGE_KEY = 'particle_morph_auto_restore_flag_v2';

// -------------------------------------------------------------
// Shape Serialization Helpers (Compact JSON Safe)
// -------------------------------------------------------------

export function serializeMorphShape(shape: MorphShape, maxPoints = 5000): SerializedMorphShape {
  const totalCount = Math.floor(shape.positions.length / 3);
  let positions: number[];
  let colors: number[];

  if (totalCount <= maxPoints) {
    positions = Array.from(shape.positions);
    colors = Array.from(shape.colors);
  } else {
    // Subsample evenly for compact local storage footprint
    const step = totalCount / maxPoints;
    positions = [];
    colors = [];
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.floor(i * step);
      const pIdx = idx * 3;
      positions.push(
        Math.round(shape.positions[pIdx] * 1000) / 1000,
        Math.round(shape.positions[pIdx + 1] * 1000) / 1000,
        Math.round(shape.positions[pIdx + 2] * 1000) / 1000
      );
      colors.push(
        Math.round(shape.colors[pIdx] * 100) / 100,
        Math.round(shape.colors[pIdx + 1] * 100) / 100,
        Math.round(shape.colors[pIdx + 2] * 100) / 100
      );
    }
  }

  return {
    id: shape.id,
    name: shape.name,
    type: shape.type,
    icon: shape.icon,
    positions,
    colors,
    previewUrl: shape.previewUrl,
    description: shape.description,
  };
}

export function deserializeMorphShape(s: SerializedMorphShape, targetCount = 60000): MorphShape {
  const posCount = Math.floor(s.positions.length / 3);
  const fullPositions = new Float32Array(targetCount * 3);
  const fullColors = new Float32Array(targetCount * 3);

  if (posCount === 0) {
    return {
      id: s.id,
      name: s.name,
      type: s.type,
      positions: fullPositions,
      colors: fullColors,
      description: s.description,
      previewUrl: s.previewUrl,
    };
  }

  for (let i = 0; i < targetCount; i++) {
    const srcIdx = (i % posCount) * 3;
    const dstIdx = i * 3;
    fullPositions[dstIdx] = s.positions[srcIdx] || 0;
    fullPositions[dstIdx + 1] = s.positions[srcIdx + 1] || 0;
    fullPositions[dstIdx + 2] = s.positions[srcIdx + 2] || 0;

    fullColors[dstIdx] = s.colors[srcIdx] !== undefined ? s.colors[srcIdx] : 1;
    fullColors[dstIdx + 1] = s.colors[srcIdx + 1] !== undefined ? s.colors[srcIdx + 1] : 1;
    fullColors[dstIdx + 2] = s.colors[srcIdx + 2] !== undefined ? s.colors[srcIdx + 2] : 1;
  }

  return {
    id: s.id,
    name: s.name,
    type: s.type,
    icon: s.icon,
    positions: fullPositions,
    colors: fullColors,
    previewUrl: s.previewUrl,
    description: s.description,
  };
}

// -------------------------------------------------------------
// Preset Storage Management
// -------------------------------------------------------------

export function loadSavedPresets(): NumberedPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY) || localStorage.getItem('particle_morph_preset_library_v1');
    if (!raw) return BUILTIN_PRESETS;
    const parsed = JSON.parse(raw) as NumberedPreset[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with default builtin presets if user presets don't cover all slots
      const userSlotMap = new Map<number, NumberedPreset>();
      parsed.forEach((p) => {
        if (p && typeof p.slot === 'number') {
          userSlotMap.set(p.slot, {
            ...p,
            waypointShapeIds: Array.isArray(p.waypointShapeIds)
              ? p.waypointShapeIds
              : (Array.isArray(p.morphChain) && p.morphChain.length > 2 ? p.morphChain.slice(1, -1) : []),
          });
        }
      });
      
      BUILTIN_PRESETS.forEach((bp) => {
        if (!userSlotMap.has(bp.slot)) {
          userSlotMap.set(bp.slot, bp);
        }
      });
      return Array.from(userSlotMap.values()).sort((a, b) => a.slot - b.slot);
    }
    return BUILTIN_PRESETS;
  } catch (e) {
    console.warn('Failed to load presets from localStorage', e);
    return BUILTIN_PRESETS;
  }
}

export function savePresetsToStorage(presets: NumberedPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.warn('Failed to save presets to localStorage', e);
  }
}

export function exportPresetsToJson(presets: NumberedPreset[]): string {
  return JSON.stringify(presets, null, 2);
}

export function importPresetsFromJson(jsonStr: string): NumberedPreset[] | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.filter((p) => typeof p.slot === 'number' && p.name && p.config);
    }
    return null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Live Workspace State Persistence (Across Browser Sessions)
// -------------------------------------------------------------

export function saveWorkspaceState(state: WorkspacePersistenceState): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save workspace state to localStorage', e);
  }
}

export function loadWorkspaceState(): WorkspacePersistenceState | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspacePersistenceState;
    if (parsed && typeof parsed.sourceShapeId === 'string') {
      return parsed;
    }
    return null;
  } catch (e) {
    console.warn('Failed to load workspace state from localStorage', e);
    return null;
  }
}

export function clearWorkspaceState(): void {
  try {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear workspace state from localStorage', e);
  }
}

export function setAutoRestoreEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_RESTORE_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Failed to save auto-restore setting', e);
  }
}

export function getAutoRestoreEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTO_RESTORE_STORAGE_KEY);
    return val === null ? true : val === 'true'; // Default true for seamless experience
  } catch {
    return true;
  }
}

// -------------------------------------------------------------
// Automatic Preset Tagging System (Shapes, Counts, Shaders)
// -------------------------------------------------------------

export interface GenerateTagsOptions {
  config: Partial<MorphConfig>;
  sourceShapeId?: string;
  targetShapeId?: string;
  waypointShapeIds?: string[];
  shapes?: MorphShape[];
  extraTags?: string[];
}

/**
 * Automatically generates descriptive, searchable tags based on:
 * 1. Shapes used in the sequence (source, waypoints, target, custom geometry)
 * 2. Particle count (exact rounded count and density classification)
 * 3. Morph chain complexity (2-Stage, 3-Stage, Multi-Stage)
 * 4. Particle sprite type, noise algorithm, color scheme, and active shader/physics features
 */
export function generateAutoPresetTags(options: GenerateTagsOptions): string[] {
  const {
    config = {},
    sourceShapeId = 'sphere',
    targetShapeId = 'torus',
    waypointShapeIds = [],
    shapes = [],
    extraTags = [],
  } = options || {};

  const safeWaypoints = Array.isArray(waypointShapeIds) ? waypointShapeIds : [];
  const tags = new Set<string>();

  // Helper to extract clean shape name
  const getShapeDisplayName = (id: string): string => {
    const found = (shapes || []).find((s) => s.id === id);
    if (found && found.name) {
      // Remove leading emojis/symbols for clean search tags
      const cleaned = found.name.replace(/^[\p{Emoji}\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+/u, '').trim();
      return cleaned || found.name;
    }
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
  };

  // 1. Shapes used in sequence (Names & Shape Prefixes)
  const srcName = getShapeDisplayName(sourceShapeId);
  const tgtName = getShapeDisplayName(targetShapeId);
  if (srcName) {
    tags.add(srcName);
    tags.add(`Shape: ${srcName}`);
  }
  if (tgtName && tgtName !== srcName) {
    tags.add(tgtName);
    tags.add(`Shape: ${tgtName}`);
  }

  const wpNames: string[] = [];
  safeWaypoints.forEach((wpId) => {
    const wpName = getShapeDisplayName(wpId);
    if (wpName) {
      wpNames.push(wpName);
      if (!tags.has(wpName)) tags.add(wpName);
      tags.add(`Shape: ${wpName}`);
    }
  });

  // Morph Transition Tag (e.g. "Morph: Sphere ➔ Torus")
  tags.add(`Morph: ${srcName} ➔ ${tgtName}`);
  if (wpNames.length > 0) {
    tags.add(`Chain: ${srcName} ➔ ${wpNames.join(' ➔ ')} ➔ ${tgtName}`);
  }

  // Shape Domain / Classification Tags
  const allShapeIds = [sourceShapeId, ...safeWaypoints, targetShapeId].map((id) => id.toLowerCase());
  if (allShapeIds.some((id) => ['earth', 'saturn', 'galaxy', 'cosmic-drift', 'black-hole', 'starship', 'quantum-field', 'solar-corona'].includes(id))) {
    tags.add('Category: Cosmic & Planetary');
  }
  if (allShapeIds.some((id) => ['sphere', 'torus', 'cube', 'cylinder', 'pyramid', 'cone', 'diamond', 'trefoil', 'gravity-vortex'].includes(id))) {
    tags.add('Category: 3D Primitives');
  }
  if (allShapeIds.some((id) => ['skull', 'heart', 'dna', 'rose', 'tree', 'wings', 'flocking-birds', 'snowflake-crystal'].includes(id))) {
    tags.add('Category: Organic & Nature');
  }

  // 2. Stage Complexity
  if (safeWaypoints.length === 0) {
    tags.add('2-Stage (Direct)');
  } else if (safeWaypoints.length === 1) {
    tags.add('3-Stage (Waypoint)');
  } else {
    tags.add(`Multi-Stage (${safeWaypoints.length + 2} Steps)`);
  }

  // 3. Custom / Text / Upload Geometry Tag
  const chainIds = [sourceShapeId, ...safeWaypoints, targetShapeId];
  const hasCustomShape = (shapes || []).some((s) => chainIds.includes(s.id) && s.type !== 'preset');
  if (hasCustomShape) {
    tags.add('Custom-Geometry');
    tags.add('Category: Custom Point Cloud');
  }
  const hasTextShape = (shapes || []).some((s) => chainIds.includes(s.id) && (s.type === 'text' || s.id.includes('text') || s.id.includes('gothic')));
  if (hasTextShape) {
    tags.add('Typography-3D');
    tags.add('Category: Typography');
  }

  // 4. Particle Count & Density Tier
  const count = config?.particleCount || 60000;
  const countK = Math.round(count / 1000);
  if (count >= 1000) {
    tags.add(`${countK}K Particles`);
    tags.add(`Count: ${countK}K`);
  } else {
    tags.add(`${count} Particles`);
    tags.add(`Count: ${count}`);
  }

  if (count < 30000) {
    tags.add('Lite (<30K)');
    tags.add('Count Tier: Lite (<30K)');
  } else if (count <= 75000) {
    tags.add('Standard (30K-75K)');
    tags.add('Count Tier: Standard (30K-75K)');
  } else if (count <= 120000) {
    tags.add('Dense (75K-120K)');
    tags.add('Count Tier: Dense (75K-120K)');
  } else {
    tags.add('Extreme (>120K)');
    tags.add('Count Tier: Extreme (>120K)');
  }

  // 5. Particle Sprite Type
  if (config.particleType) {
    const spriteMap: Record<string, string> = {
      circle: 'Sprite: Circle',
      square: 'Sprite: Square',
      triangle: 'Sprite: Triangle',
      star: 'Sprite: Star',
      spark: 'Sprite: Spark',
      glow_point: 'Sprite: Glow',
      ring: 'Sprite: Ring',
      diamond: 'Sprite: Diamond',
      hexagon: 'Sprite: Hexagon',
      cube: 'Sprite: Cube',
      bokeh: 'Sprite: Bokeh',
      cloud: 'Sprite: Cloud',
      snowflake_multi: 'Sprite: Snowflake',
    };
    tags.add(spriteMap[config.particleType] || `Sprite: ${config.particleType}`);
  }

  // 6. Noise Dynamics
  if (config.noiseType) {
    const noiseMap: Record<string, string> = {
      curl: 'Noise: Curl',
      simplex: 'Noise: Simplex',
      vortex: 'Noise: Vortex',
      turbulence: 'Noise: Turbulence',
    };
    tags.add(noiseMap[config.noiseType] || `Noise: ${config.noiseType}`);
  }

  // 7. Color Scheme
  if (config.colorScheme && config.colorScheme !== 'custom') {
    const themeName = config.colorScheme.charAt(0).toUpperCase() + config.colorScheme.slice(1);
    tags.add(`Theme: ${themeName}`);
  }

  // 8. Key Physical / Shader FX Flags
  if (config.trailsEnabled) tags.add('Motion-Trails');
  if (config.audioReactiveEnabled) tags.add('Audio-Reactive');
  if (config.blackHoleEnabled) tags.add('Black-Hole');
  if (config.mouseGravityEnabled) tags.add('Interactive-Gravity');
  if (config.chromaticAberration && config.chromaticAberration > 0) tags.add('Chromatic-FX');
  if (config.spriteHslCycle) tags.add('Rainbow-Cycle');
  if (config.autoRotate) tags.add('Auto-Orbit');

  // 9. Bloom & Post-processing
  if (config.bloomEnabled !== false) {
    tags.add('Bloom-FX');
    tags.add('Post-Processing');
    const str = config.bloomStrength ?? 1.2;
    if (str >= 2.0) {
      tags.add('Bloom: Hyper');
    } else if (str >= 1.0) {
      tags.add('Bloom: Neon');
    } else {
      tags.add('Bloom: Soft');
    }
  }

  // Add any extra user tags
  if (Array.isArray(extraTags)) {
    extraTags.forEach((t) => {
      const trimmed = t.trim();
      if (trimmed) tags.add(trimmed);
    });
  }

  return Array.from(tags);
}

// -------------------------------------------------------------
// Named Standalone Preset Package (.json) Export & Import
// -------------------------------------------------------------

export interface CreateNamedPresetOptions {
  name: string;
  description?: string;
  author?: string;
  config: MorphConfig;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds?: string[];
  shapes: MorphShape[];
  tags?: string[];
}

/**
 * Creates a standalone, self-contained JSON Preset Package containing all settings and shapes
 */
export function createNamedPresetPackage(options: CreateNamedPresetOptions): SingleMorphPresetPackage {
  const {
    name,
    description,
    author,
    config,
    sourceShapeId,
    targetShapeId,
    waypointShapeIds = [],
    shapes,
    tags: providedTags
  } = options;

  const safeWaypoints = Array.isArray(waypointShapeIds) ? waypointShapeIds : [];
  const currentChainIds = [sourceShapeId, ...safeWaypoints, targetShapeId];

  // Serialize all shapes used in the current morph chain (as well as custom user-imported shapes)
  const shapesToSerialize = (shapes || []).filter((s) => 
    currentChainIds.includes(s.id) || s.type === 'image' || s.type === 'text'
  );

  const serializedShapes: SerializedMorphShape[] = shapesToSerialize.map((s) => {
    // Custom user shapes get up to 10,000 sample points for high fidelity
    const maxPts = s.type === 'preset' ? 3000 : 10000;
    return serializeMorphShape(s, maxPts);
  });

  const sourceShape = (shapes || []).find((s) => s.id === sourceShapeId);
  const targetShape = (shapes || []).find((s) => s.id === targetShapeId);

  // Generate or use custom tags
  const tags = providedTags && providedTags.length > 0 
    ? providedTags 
    : generateAutoPresetTags({
        config,
        sourceShapeId,
        targetShapeId,
        waypointShapeIds: safeWaypoints,
        shapes
      });

  return {
    schema: 'particle-morph-single-preset-v2',
    version: 2,
    name: name.trim() || 'Custom Particle Morph Preset',
    description: description?.trim() || `${sourceShape?.name || sourceShapeId} ➔ ${targetShape?.name || targetShapeId} (${config.particleType} / ${config.noiseType})`,
    author: author?.trim() || 'Particle Morphing Studio',
    createdAt: new Date().toISOString(),
    sourceShapeId,
    targetShapeId,
    waypointShapeIds: [...safeWaypoints],
    morphChain: [sourceShapeId, ...safeWaypoints, targetShapeId],
    tags,
    config: {
      particleType: config.particleType,
      shapeRotation: config.shapeRotation,
      coreRatio: config.coreRatio,
      noiseType: config.noiseType,
      noiseAmp: config.noiseAmp,
      noiseFreq: config.noiseFreq,
      noiseSpeed: config.noiseSpeed,
      delayMode: config.delayMode,
      delaySpread: config.delaySpread,
      durationVariance: config.durationVariance,
      attractStrength: config.attractStrength,
      damping: config.damping,
      colorMixMode: config.colorMixMode,
      colorScheme: config.colorScheme,
      colorA: config.colorA,
      colorB: config.colorB,
      colorC: config.colorC,
      colorMixRatio: config.colorMixRatio,
      velocityColorShift: config.velocityColorShift,
      colorGamma: config.colorGamma,
      pointSize: config.pointSize,
      glowIntensity: config.glowIntensity,
      blending: config.blending,
      autoRotate: config.autoRotate,
      rotateSpeed: config.rotateSpeed,
      depthTest: config.depthTest,
      trailsEnabled: config.trailsEnabled,
      trailLength: config.trailLength,
      motionBlurIntensity: config.motionBlurIntensity,
      playSpeed: config.playSpeed,
      playMode: config.playMode,
      morphEasing: config.morphEasing,
      mouseGravityEnabled: config.mouseGravityEnabled,
      mouseGravityMode: config.mouseGravityMode,
      mouseGravityRadius: config.mouseGravityRadius,
      mouseGravityStrength: config.mouseGravityStrength,
      ambientDriftAmp: config.ambientDriftAmp,
      spriteHslCycle: config.spriteHslCycle,
      snowflakeMultiSize: config.snowflakeMultiSize,
      snowflakeCustomBlending: config.snowflakeCustomBlending,
      audioReactiveEnabled: config.audioReactiveEnabled,
      audioSourceType: config.audioSourceType,
      audioSensitivity: config.audioSensitivity,
      blackHoleEnabled: config.blackHoleEnabled,
      blackHoleMass: config.blackHoleMass,
      blackHoleRadius: config.blackHoleRadius,
      chromaticAberration: config.chromaticAberration,
      glitchIntensity: config.glitchIntensity,
      backgroundColor: config.backgroundColor,
      gridOverlayEnabled: config.gridOverlayEnabled,
      gridOverlayPlane: config.gridOverlayPlane,
      gridOverlayShowAxes: config.gridOverlayShowAxes,
      gridOverlayShowBounds: config.gridOverlayShowBounds,
      gridOverlayShowLabels: config.gridOverlayShowLabels,
      gridOverlayOpacity: config.gridOverlayOpacity,
      engineMode: config.engineMode,
      bloomEnabled: config.bloomEnabled,
      bloomStrength: config.bloomStrength,
      bloomRadius: config.bloomRadius,
      bloomThreshold: config.bloomThreshold,
      bloomToneMappingExposure: config.bloomToneMappingExposure,
    },
    shapes: serializedShapes,
    metadata: {
      particleCount: config.particleCount || 60000,
      colorScheme: config.colorScheme,
      engineMode: config.engineMode,
      sourceName: sourceShape?.name || sourceShapeId,
      targetName: targetShape?.name || targetShapeId,
      tags,
    }
  };
}

/**
 * Exports and triggers instant download of the current morph configuration as a named .json preset file
 */
export function downloadNamedPresetJson(options: CreateNamedPresetOptions): void {
  const pkg = createNamedPresetPackage(options);
  const json = JSON.stringify(pkg, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // Sanitize filename
  const safeName = (options.name.trim() || 'morph-preset')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${safeName || 'morph-preset'}-${dateStr}.preset.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Universal JSON Preset Parser:
 * Supports Single Preset Package, NumberedPreset, NumberedPreset[], and WorkspacePersistenceState.
 */
export function parseNamedPresetJson(jsonStr: string): ImportedPresetResult {
  try {
    const data = JSON.parse(jsonStr);

    // Case 1: SingleMorphPresetPackage (v2 or v1 schema)
    if (data && (data.schema === 'particle-morph-single-preset-v2' || data.schema === 'particle-morph-preset-v2' || (data.config && (data.sourceShapeId || data.morphChain)))) {
      const deserializedShapes: MorphShape[] = [];
      if (Array.isArray(data.shapes)) {
        data.shapes.forEach((s: SerializedMorphShape) => {
          if (s && s.id && Array.isArray(s.positions)) {
            deserializedShapes.push(deserializeMorphShape(s));
          }
        });
      }

      const sourceId = data.sourceShapeId || (data.morphChain && data.morphChain[0]) || 'sphere';
      const targetId = data.targetShapeId || (data.morphChain && data.morphChain[data.morphChain.length - 1]) || 'torus';
      const waypoints = Array.isArray(data.waypointShapeIds) 
        ? data.waypointShapeIds 
        : (Array.isArray(data.morphChain) && data.morphChain.length > 2 
            ? data.morphChain.slice(1, -1) 
            : []);

      const tags: string[] = Array.isArray(data.tags) 
        ? data.tags 
        : (data.metadata && Array.isArray(data.metadata.tags) 
            ? data.metadata.tags 
            : generateAutoPresetTags({
                config: data.config || {},
                sourceShapeId: sourceId,
                targetShapeId: targetId,
                waypointShapeIds: waypoints,
                shapes: deserializedShapes,
              }));

      return {
        isValid: true,
        name: data.name || 'Imported Morph Preset',
        description: data.description || '',
        config: data.config || {},
        sourceShapeId: sourceId,
        targetShapeId: targetId,
        waypointShapeIds: waypoints,
        morphChain: [sourceId, ...waypoints, targetId],
        shapes: deserializedShapes,
        tags,
        rawPackage: data,
      };
    }

    // Case 2: NumberedPreset single item
    if (data && typeof data.slot === 'number' && data.config) {
      const deserializedShapes: MorphShape[] = [];
      if (Array.isArray(data.customShapes)) {
        data.customShapes.forEach((s: SerializedMorphShape) => {
          if (s && s.id && Array.isArray(s.positions)) {
            deserializedShapes.push(deserializeMorphShape(s));
          }
        });
      }

      const sourceId = data.sourceShapeId || 'sphere';
      const targetId = data.targetShapeId || 'torus';
      const waypoints = Array.isArray(data.waypointShapeIds) ? data.waypointShapeIds : [];

      const tags: string[] = Array.isArray(data.tags)
        ? data.tags
        : generateAutoPresetTags({
            config: data.config,
            sourceShapeId: sourceId,
            targetShapeId: targetId,
            waypointShapeIds: waypoints,
            shapes: deserializedShapes,
          });

      return {
        isValid: true,
        name: data.name || `Preset #${data.slot}`,
        description: data.description || '',
        config: data.config,
        sourceShapeId: sourceId,
        targetShapeId: targetId,
        waypointShapeIds: waypoints,
        morphChain: [sourceId, ...waypoints, targetId],
        shapes: deserializedShapes,
        tags,
        rawPackage: data,
      };
    }

    // Case 3: NumberedPreset array (multi-slot preset library)
    if (Array.isArray(data) && data.length > 0 && data[0].config) {
      const first = data[0];
      const deserializedShapes: MorphShape[] = [];
      data.forEach((p: NumberedPreset) => {
        if (Array.isArray(p.customShapes)) {
          p.customShapes.forEach((s) => {
            if (s && s.id && !deserializedShapes.some((ds) => ds.id === s.id)) {
              deserializedShapes.push(deserializeMorphShape(s));
            }
          });
        }
      });

      const sourceId = first.sourceShapeId || 'sphere';
      const targetId = first.targetShapeId || 'torus';
      const waypoints = Array.isArray(first.waypointShapeIds) ? first.waypointShapeIds : [];

      const tags: string[] = Array.isArray(first.tags)
        ? first.tags
        : generateAutoPresetTags({
            config: first.config || {},
            sourceShapeId: sourceId,
            targetShapeId: targetId,
            waypointShapeIds: waypoints,
            shapes: deserializedShapes,
          });

      return {
        isValid: true,
        name: `Preset Library (${data.length} items)`,
        description: `${data.length} presets library imported`,
        config: first.config || {},
        sourceShapeId: sourceId,
        targetShapeId: targetId,
        waypointShapeIds: waypoints,
        morphChain: [sourceId, ...waypoints, targetId],
        shapes: deserializedShapes,
        tags,
        rawPackage: data,
      };
    }

    // Case 4: WorkspacePersistenceState
    if (data && typeof data.sourceShapeId === 'string' && data.config) {
      const deserializedShapes: MorphShape[] = [];
      if (Array.isArray(data.customShapes)) {
        data.customShapes.forEach((s: SerializedMorphShape) => {
          if (s && s.id) {
            deserializedShapes.push(deserializeMorphShape(s));
          }
        });
      }

      const tags = generateAutoPresetTags({
        config: data.config,
        sourceShapeId: data.sourceShapeId,
        targetShapeId: data.targetShapeId,
        waypointShapeIds: Array.isArray(data.waypointShapeIds) ? data.waypointShapeIds : [],
        shapes: deserializedShapes,
      });

      return {
        isValid: true,
        name: 'Workspace Session Preset',
        description: 'Imported full workspace session',
        config: data.config,
        sourceShapeId: data.sourceShapeId,
        targetShapeId: data.targetShapeId,
        waypointShapeIds: Array.isArray(data.waypointShapeIds) ? data.waypointShapeIds : [],
        morphChain: [data.sourceShapeId, ...(data.waypointShapeIds || []), data.targetShapeId],
        shapes: deserializedShapes,
        tags,
        rawPackage: data,
      };
    }

    return {
      isValid: false,
      name: '',
      config: {},
      sourceShapeId: '',
      targetShapeId: '',
      waypointShapeIds: [],
      morphChain: [],
      shapes: [],
    };
  } catch (err) {
    console.error('Failed to parse preset JSON:', err);
    return {
      isValid: false,
      name: '',
      config: {},
      sourceShapeId: '',
      targetShapeId: '',
      waypointShapeIds: [],
      morphChain: [],
      shapes: [],
    };
  }
}


