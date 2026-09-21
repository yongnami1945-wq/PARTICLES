import { MorphConfig, ParticleType, NoiseType, ColorMixMode } from '../types';

export interface OnlineParticlePreset {
  id: string;
  title: string;
  sourceEco: 'particles.js' | 'tsparticles' | 'three.js' | 'codepen' | 'shadertoy';
  sourceUrl: string;
  category: 'space' | 'nature' | 'cyber' | 'explosive' | 'fluid' | 'geometric' | 'audio';
  author: string;
  description: string;
  tags: string[];
  sourceShapeId: string;
  targetShapeId: string;
  // Converted 3D Morph Engine Configuration
  config: Partial<MorphConfig>;
  // Original / Standard Web Particles.js / tsParticles JSON format
  rawJson: Record<string, any>;
}

export const ONLINE_PRESET_COLLECTION: OnlineParticlePreset[] = [
  {
    id: 'pjs_nasa_space',
    title: 'NASA Deep Space & Constellations',
    sourceEco: 'particles.js',
    sourceUrl: 'https://particles.js.org/',
    category: 'space',
    author: 'Vincent Garreau / tsParticles Team',
    description: 'particles.js 공식 NASA 우주 성단 및 은하수 별자리 링크 네트워크',
    tags: ['NASA', 'Constellation', 'Deep Space', 'particles.js'],
    sourceShapeId: 'galaxy',
    targetShapeId: 'spiral',
    config: {
      particleType: 'star',
      particleCount: 30000,
      shapeRotation: 0,
      coreRatio: 0.95,
      noiseType: 'curl',
      noiseAmp: 1.8,
      noiseFreq: 0.8,
      noiseSpeed: 0.6,
      delayMode: 'radial',
      delaySpread: 0.45,
      colorMixMode: 'radial',
      colorScheme: 'galaxy',
      colorA: '#FFFFFF',
      colorB: '#00F0FF',
      colorC: '#9D00FF',
      pointSize: 2.8,
      glowIntensity: 2.2,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.92,
      playSpeed: 0.75,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.4,
    },
    rawJson: {
      particles: {
        number: { value: 160, density: { enable: true, value_area: 800 } },
        color: { value: ['#ffffff', '#00f0ff', '#9d00ff'] },
        shape: { type: 'star', stroke: { width: 0, color: '#000000' } },
        opacity: { value: 0.8, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 1.2, direction: 'none', random: true, straight: false, out_mode: 'out' },
      },
    },
  },
  {
    id: 'tsparticles_hyperspace',
    title: 'tsParticles Hyperspace Warp Speed',
    sourceEco: 'tsparticles',
    sourceUrl: 'https://particles.js.org/#hyperspace',
    category: 'space',
    author: 'Matteo Bruni (tsParticles)',
    description: '광속 워프 항해 방사형 입자 가속 및 이온 광원 스트림 궤적',
    tags: ['Warp', 'Hyperspace', 'tsParticles', 'Speed'],
    sourceShapeId: 'sphere',
    targetShapeId: 'torus',
    config: {
      particleType: 'star',
      particleCount: 45000,
      shapeRotation: 45,
      coreRatio: 1.0,
      noiseType: 'turbulence',
      noiseAmp: 3.5,
      noiseFreq: 1.2,
      noiseSpeed: 1.6,
      delayMode: 'brightness',
      delaySpread: 0.7,
      colorMixMode: 'velocity',
      colorScheme: 'custom',
      colorA: '#00FFFF',
      colorB: '#FFFFFF',
      colorC: '#7B2CBF',
      velocityColorShift: 2.0,
      pointSize: 3.0,
      glowIntensity: 2.5,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.96,
      playSpeed: 1.3,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.9,
    },
    rawJson: {
      preset: 'hyperspace',
      particles: {
        number: { value: 300 },
        color: { value: ['#00ffff', '#ffffff', '#7b2cbf'] },
        shape: { type: 'star' },
        size: { value: { min: 1, max: 4 } },
        move: { enable: true, speed: { min: 8, max: 20 }, direction: 'outside', trail: { enable: true, length: 15 } },
      },
    },
  },
  {
    id: 'pjs_snow_winter',
    title: 'particles.js Snow & Ice Crystals',
    sourceEco: 'particles.js',
    sourceUrl: 'https://particles.js.org/#snow',
    category: 'nature',
    author: 'Vincent Garreau',
    description: '겨울 눈송이 낙하와 다이아몬드 얼음 결정 굴절 산란',
    tags: ['Snow', 'Winter', 'Ice Crystal', 'Diamond'],
    sourceShapeId: 'cube',
    targetShapeId: 'icosahedron',
    config: {
      particleType: 'diamond',
      particleCount: 30000,
      shapeRotation: 45,
      coreRatio: 0.75,
      noiseType: 'simplex',
      noiseAmp: 1.5,
      noiseFreq: 0.6,
      noiseSpeed: 0.5,
      delayMode: 'linear_y',
      delaySpread: 0.8,
      colorMixMode: 'height',
      colorScheme: 'custom',
      colorA: '#D8F3DC',
      colorB: '#E0FAFF',
      colorC: '#80E5FF',
      pointSize: 2.6,
      glowIntensity: 1.4,
      blending: 'screen',
      trailsEnabled: true,
      trailLength: 0.75,
      playSpeed: 0.65,
      playMode: 'loop',
      autoRotate: true,
      rotateSpeed: 0.3,
    },
    rawJson: {
      particles: {
        number: { value: 200 },
        color: { value: '#ffffff' },
        shape: { type: 'polygon', polygon: { nb_sides: 6 } },
        size: { value: 4, random: true },
        move: { enable: true, speed: 2, direction: 'bottom', straight: false, out_mode: 'out' },
      },
    },
  },
  {
    id: 'pjs_cyber_neon_rings',
    title: 'Cyberpunk Neon Bubble Rings',
    sourceEco: 'particles.js',
    sourceUrl: 'https://particles.js.org/#bubble',
    category: 'cyber',
    author: 'tsParticles Community',
    description: '사이버펑크 네온 링 버블과 삼색 램프 방사형 펄스',
    tags: ['Cyberpunk', 'Neon Ring', 'Bubble', '3-Stop'],
    sourceShapeId: 'torusKnot',
    targetShapeId: 'heart',
    config: {
      particleType: 'ring',
      particleCount: 35000,
      shapeRotation: 0,
      coreRatio: 0.85,
      noiseType: 'vortex',
      noiseAmp: 2.2,
      noiseFreq: 0.9,
      noiseSpeed: 0.8,
      delayMode: 'radial',
      delaySpread: 0.55,
      colorMixMode: 'gradient',
      colorScheme: 'cyberpunk',
      colorA: '#00F0FF',
      colorB: '#FF007F',
      colorC: '#FFE600',
      pointSize: 3.2,
      glowIntensity: 1.9,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.88,
      playSpeed: 0.85,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.7,
    },
    rawJson: {
      particles: {
        number: { value: 120 },
        color: { value: ['#00f0ff', '#ff007f', '#ffe600'] },
        shape: { type: 'circle' },
        size: { value: 8, random: true },
        move: { enable: true, speed: 3, direction: 'none' },
      },
    },
  },
  {
    id: 'tsparticles_fireworks',
    title: 'tsParticles Fireworks & Explosion Flares',
    sourceEco: 'tsparticles',
    sourceUrl: 'https://particles.js.org/#fireworks',
    category: 'explosive',
    author: 'Matteo Bruni',
    description: '축제 불꽃놀이 폭발 확산과 고에너지 유체 난류 입자 버스트',
    tags: ['Fireworks', 'Explosion', 'Fire', 'Burst'],
    sourceShapeId: 'sphere',
    targetShapeId: 'pyramid',
    config: {
      particleType: 'star',
      particleCount: 50000,
      shapeRotation: 0,
      coreRatio: 0.95,
      noiseType: 'curl',
      noiseAmp: 3.6,
      noiseFreq: 1.3,
      noiseSpeed: 1.4,
      delayMode: 'brightness',
      delaySpread: 0.65,
      colorMixMode: 'velocity',
      colorScheme: 'fire',
      colorA: '#FF2A00',
      colorB: '#FFAA00',
      colorC: '#FFFF66',
      velocityColorShift: 2.0,
      pointSize: 3.4,
      glowIntensity: 2.3,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.94,
      playSpeed: 1.15,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.8,
    },
    rawJson: {
      emitters: { direction: 'top', life: { count: 0, duration: 0.1, delay: 0.4 }, rate: { quantity: 1, delay: 0.15 } },
      particles: {
        number: { value: 0 },
        color: { value: ['#ff2a00', '#ffaa00', '#ffff66'] },
        shape: { type: 'star' },
        move: { enable: true, speed: { min: 10, max: 25 }, direction: 'none', decay: 0.05 },
      },
    },
  },
  {
    id: 'tsparticles_confetti',
    title: 'tsParticles Confetti Celebration',
    sourceEco: 'tsparticles',
    sourceUrl: 'https://particles.js.org/#confetti',
    category: 'geometric',
    author: 'tsParticles Team',
    description: '회전하는 다채로운 헥사곤/스퀘어 컨페티 종이꽃 축제 효과',
    tags: ['Confetti', 'Celebration', 'Hexagon', 'Colors'],
    sourceShapeId: 'cylinder',
    targetShapeId: 'cube',
    config: {
      particleType: 'hexagon',
      particleCount: 30000,
      shapeRotation: 60,
      coreRatio: 0.9,
      noiseType: 'simplex',
      noiseAmp: 1.8,
      noiseFreq: 0.7,
      noiseSpeed: 0.9,
      delayMode: 'random',
      delaySpread: 0.6,
      colorMixMode: 'radial',
      colorScheme: 'custom',
      colorA: '#FF0055',
      colorB: '#00F0FF',
      colorC: '#FFE600',
      pointSize: 2.8,
      glowIntensity: 1.3,
      blending: 'normal',
      trailsEnabled: false,
      trailLength: 0.6,
      playSpeed: 0.9,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.6,
    },
    rawJson: {
      preset: 'confetti',
      particles: {
        number: { value: 250 },
        color: { value: ['#ff0055', '#00f0ff', '#ffe600', '#00ff88', '#9900ff'] },
        shape: { type: ['polygon', 'square'], polygon: { sides: 6 } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
        tilt: { enable: true, value: { min: 0, max: 360 }, animation: { enable: true, speed: 30 } },
      },
    },
  },
  {
    id: 'tsparticles_deep_sea',
    title: 'Bioluminescent Deep Sea Swarm',
    sourceEco: 'tsparticles',
    sourceUrl: 'https://particles.js.org/#absorbers',
    category: 'nature',
    author: 'tsParticles Ocean Preset',
    description: '심해 생물 발광 보케 플레어와 유기적 플록 떼 유체 흐름',
    tags: ['Ocean', 'Bioluminescence', 'Bokeh', 'Deep Sea'],
    sourceShapeId: 'sphere',
    targetShapeId: 'spiral',
    config: {
      particleType: 'bokeh',
      particleCount: 35000,
      shapeRotation: 0,
      coreRatio: 0.55,
      noiseType: 'vortex',
      noiseAmp: 2.4,
      noiseFreq: 0.6,
      noiseSpeed: 0.5,
      delayMode: 'radial',
      delaySpread: 0.5,
      colorMixMode: 'radial',
      colorScheme: 'emerald',
      colorA: '#001E2B',
      colorB: '#00FFB3',
      colorC: '#00A6FF',
      pointSize: 4.0,
      glowIntensity: 1.9,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.88,
      playSpeed: 0.7,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.35,
    },
    rawJson: {
      particles: {
        number: { value: 150 },
        color: { value: ['#00ffb3', '#00a6ff', '#003366'] },
        shape: { type: 'circle' },
        size: { value: 6, random: true },
        move: { enable: true, speed: 1.5, direction: 'none', attract: { enable: true, rotateX: 600, rotateY: 1200 } },
      },
    },
  },
  {
    id: 'threejs_quantum_cloud',
    title: 'Three.js Quantum Wave Superposition',
    sourceEco: 'three.js',
    sourceUrl: 'https://threejs.org/examples/#webgl_points_waves',
    category: 'fluid',
    author: 'Three.js Official Examples',
    description: '양자 확률 구름과 3차원 슈뢰딩거 파동 함수 섭동',
    tags: ['Three.js', 'Quantum', 'Wave', 'Nebula Cloud'],
    sourceShapeId: 'dna',
    targetShapeId: 'torus',
    config: {
      particleType: 'cloud',
      particleCount: 40000,
      shapeRotation: 0,
      coreRatio: 0.45,
      noiseType: 'turbulence',
      noiseAmp: 2.0,
      noiseFreq: 0.75,
      noiseSpeed: 0.7,
      delayMode: 'linear_y',
      delaySpread: 0.65,
      colorMixMode: 'height',
      colorScheme: 'galaxy',
      colorA: '#8A2BE2',
      colorB: '#00F0FF',
      colorC: '#FF1493',
      pointSize: 3.6,
      glowIntensity: 1.7,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.85,
      playSpeed: 0.8,
      playMode: 'loop',
      autoRotate: true,
      rotateSpeed: 0.5,
    },
    rawJson: {
      threejs_type: 'Points',
      geometry: 'BufferGeometry',
      material: 'ShaderMaterial',
      attributes: ['position', 'color', 'customWavePhase'],
      uniforms: { uTime: 0.0, uFreq: 0.75, uAmp: 2.0 },
    },
  },
  {
    id: 'pjs_matrix_digital_rain',
    title: 'Matrix Digital Data Torrent',
    sourceEco: 'particles.js',
    sourceUrl: 'https://particles.js.org/#matrix',
    category: 'cyber',
    author: 'CodePen & tsParticles',
    description: '매트릭스 사이버 녹색 디지털 데이터 강우 및 픽셀 블록 낙하',
    tags: ['Matrix', 'Cyber Code', 'Digital Rain', 'Voxel Cube'],
    sourceShapeId: 'cube',
    targetShapeId: 'pyramid',
    config: {
      particleType: 'cube',
      particleCount: 30000,
      shapeRotation: 0,
      coreRatio: 0.95,
      noiseType: 'simplex',
      noiseAmp: 1.4,
      noiseFreq: 0.9,
      noiseSpeed: 0.8,
      delayMode: 'linear_y',
      delaySpread: 0.75,
      colorMixMode: 'height',
      colorScheme: 'emerald',
      colorA: '#003300',
      colorB: '#00FF41',
      colorC: '#CCFFCC',
      pointSize: 2.4,
      glowIntensity: 1.5,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.80,
      playSpeed: 0.95,
      playMode: 'loop',
      autoRotate: false,
      rotateSpeed: 0.0,
    },
    rawJson: {
      particles: {
        number: { value: 200 },
        color: { value: ['#00ff41', '#ccffcc', '#003300'] },
        shape: { type: 'square' },
        size: { value: 3 },
        move: { enable: true, speed: 4, direction: 'bottom', straight: true },
      },
    },
  },
  {
    id: 'threejs_blackhole_accretion',
    title: 'Interstellar Black Hole Accretion Disk',
    sourceEco: 'three.js',
    sourceUrl: 'https://threejs.org/examples/#webgl_buffergeometry_custom_attributes_particles',
    category: 'space',
    author: 'Three.js Shader Lab',
    description: '블랙홀 사건의 지평선 흡수 원반과 중력 렌즈 왜곡 볼텍스',
    tags: ['Black Hole', 'Accretion Disk', 'Vortex', 'Relativity'],
    sourceShapeId: 'saturn',
    targetShapeId: 'spiral',
    config: {
      particleType: 'star',
      particleCount: 50000,
      shapeRotation: 30,
      coreRatio: 1.0,
      noiseType: 'vortex',
      noiseAmp: 3.2,
      noiseFreq: 1.1,
      noiseSpeed: 1.2,
      delayMode: 'radial',
      delaySpread: 0.6,
      colorMixMode: 'radial',
      colorScheme: 'fire',
      colorA: '#FF3300',
      colorB: '#FF8800',
      colorC: '#00F0FF',
      pointSize: 3.0,
      glowIntensity: 2.4,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.95,
      playSpeed: 1.1,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 1.0,
    },
    rawJson: {
      physics: { gravityWell: true, eventHorizonRadius: 1.5, angularVelocity: 2.8 },
      particles: { count: 50000, colorMap: ['#ff3300', '#ff8800', '#00f0ff'] },
    },
  },
  {
    id: 'audio_reactive_ribbons',
    title: 'Sound-Reactive Harmonic Spectrum Waves',
    sourceEco: 'shadertoy',
    sourceUrl: 'https://www.shadertoy.com/view/particle_audio_waves',
    category: 'audio',
    author: 'GLSL Sound Master',
    description: '오디오 주파수 스펙트럼 반응형 고조파 입자 리본 궤적',
    tags: ['Audio Spectrum', 'Harmonic', 'Wave', 'Sound Reactive'],
    sourceShapeId: 'dna',
    targetShapeId: 'torusKnot',
    config: {
      particleType: 'ring',
      particleCount: 40000,
      shapeRotation: 0,
      coreRatio: 0.8,
      noiseType: 'turbulence',
      noiseAmp: 2.6,
      noiseFreq: 1.4,
      noiseSpeed: 1.3,
      delayMode: 'linear_x',
      delaySpread: 0.6,
      colorMixMode: 'velocity',
      colorScheme: 'cyberpunk',
      colorA: '#FF007F',
      colorB: '#00F0FF',
      colorC: '#FFE600',
      velocityColorShift: 1.9,
      pointSize: 2.9,
      glowIntensity: 2.0,
      blending: 'additive',
      trailsEnabled: true,
      trailLength: 0.91,
      playSpeed: 1.0,
      playMode: 'pingpong',
      autoRotate: true,
      rotateSpeed: 0.7,
    },
    rawJson: {
      audio: { fftSize: 1024, smoothing: 0.85, frequencyBands: 64 },
      particles: { response: 'velocity_and_amplitude', baseShape: 'lissajous_ribbon' },
    },
  },
];

/**
 * Intelligent Universal Parser:
 * Converts raw particles.js / tsParticles / Three.js JSON data into standard 3D MorphConfig
 */
export function convertOnlineParticleJsonToMorphConfig(
  input: string | Record<string, any>
): { config: Partial<MorphConfig>; detectedFormat: string; summary: string } {
  let data: any = {};
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      throw new Error('올바른 JSON 형식의 문자열이 아닙니다.');
    }
  } else {
    data = input;
  }

  let detectedFormat = 'Generic Particle JSON';
  const outConfig: Partial<MorphConfig> = {};
  const tags: string[] = [];

  // 1. Detect particles.js vs tsParticles vs Three.js
  const pData = data.particles || data;

  if (data.particles && data.particles.number) {
    detectedFormat = data.preset ? 'tsParticles Preset' : 'particles.js (v2)';
  } else if (data.threejs_type || data.geometry) {
    detectedFormat = 'Three.js Points System';
  } else if (data.preset) {
    detectedFormat = `tsParticles (${data.preset})`;
  }

  // 2. Map Particle Count
  let num = 30000;
  if (pData.number) {
    const rawVal = typeof pData.number.value === 'number' ? pData.number.value : (typeof pData.number === 'number' ? pData.number : 100);
    // Scale 2D count (usually 50~400) to rich 3D point cloud count (15k ~ 60k)
    if (rawVal < 500) {
      num = Math.min(Math.max(rawVal * 150, 15000), 60000);
    } else {
      num = Math.min(rawVal, 100000);
    }
  } else if (data.particleCount) {
    num = Number(data.particleCount);
  }
  outConfig.particleCount = num;
  tags.push(`${(num / 1000).toFixed(0)}K 파티클`);

  // 3. Map Color / Palette
  let colorA = '#00F0FF';
  let colorB = '#FF007F';
  let colorC = '#FFE600';

  if (pData.color) {
    const cVal = pData.color.value || pData.color;
    if (Array.isArray(cVal)) {
      colorA = cVal[0] ? String(cVal[0]) : colorA;
      colorB = cVal[1] ? String(cVal[1]) : colorB;
      colorC = cVal[2] ? String(cVal[2]) : (cVal[0] || colorC);
    } else if (typeof cVal === 'string') {
      colorA = cVal;
      colorB = cVal;
      colorC = '#FFFFFF';
    } else if (cVal && typeof cVal === 'object') {
      if (cVal.r !== undefined && cVal.g !== undefined && cVal.b !== undefined) {
        const hex = `#${((1 << 24) + (cVal.r << 16) + (cVal.g << 8) + cVal.b).toString(16).slice(1)}`;
        colorA = hex;
        colorB = hex;
      }
    }
  }
  outConfig.colorA = colorA;
  outConfig.colorB = colorB;
  outConfig.colorC = colorC;

  // 4. Map Shape Type
  let particleType: ParticleType = 'circle';
  const shapeVal = pData.shape?.type || pData.shape || '';
  const sStr = (Array.isArray(shapeVal) ? shapeVal[0] : String(shapeVal)).toLowerCase();

  if (sStr.includes('star')) {
    particleType = 'star';
  } else if (sStr.includes('poly') || sStr.includes('hexa')) {
    particleType = 'hexagon';
  } else if (sStr.includes('square') || sStr.includes('cube') || sStr.includes('edge')) {
    particleType = 'cube';
  } else if (sStr.includes('diamond') || sStr.includes('triangle')) {
    particleType = 'diamond';
  } else if (sStr.includes('ring') || sStr.includes('bubble')) {
    particleType = 'ring';
  } else if (sStr.includes('cloud') || sStr.includes('smoke')) {
    particleType = 'cloud';
  } else if (sStr.includes('bokeh') || sStr.includes('flare')) {
    particleType = 'bokeh';
  } else {
    particleType = 'circle';
  }
  outConfig.particleType = particleType;
  tags.push(`외형: ${particleType}`);

  // 5. Map Speed, Noise & Physics
  let moveSpeed = 1.0;
  if (pData.move) {
    const rawSpeed = typeof pData.move.speed === 'number' ? pData.move.speed : (pData.move.speed?.max || 2);
    moveSpeed = Math.min(Math.max(rawSpeed / 2.5, 0.4), 2.5);

    // Direction & Attract analysis
    if (pData.move.attract?.enable || pData.move.direction === 'inside') {
      outConfig.noiseType = 'vortex';
    } else if (pData.move.direction === 'bottom' || pData.move.direction === 'top') {
      outConfig.noiseType = 'simplex';
      outConfig.delayMode = 'linear_y';
    } else if (pData.move.direction === 'outside' || pData.move.straight === false) {
      outConfig.noiseType = 'curl';
    } else {
      outConfig.noiseType = 'turbulence';
    }

    if (pData.move.trail?.enable || pData.move.trail?.length) {
      outConfig.trailsEnabled = true;
      outConfig.trailLength = Math.min(0.7 + (pData.move.trail?.length || 10) * 0.02, 0.96);
    } else {
      outConfig.trailsEnabled = true;
      outConfig.trailLength = 0.86;
    }
  } else {
    outConfig.noiseType = 'curl';
    outConfig.trailsEnabled = true;
    outConfig.trailLength = 0.88;
  }

  outConfig.playSpeed = moveSpeed;
  outConfig.noiseAmp = 1.8 + moveSpeed * 0.8;
  outConfig.noiseFreq = 0.9;
  outConfig.noiseSpeed = 0.8;
  outConfig.glowIntensity = 1.8;
  outConfig.pointSize = 2.8;
  outConfig.blending = 'additive';
  outConfig.colorMixMode = 'gradient';
  outConfig.autoRotate = true;
  outConfig.rotateSpeed = 0.6;
  outConfig.playMode = 'pingpong';

  return {
    config: outConfig,
    detectedFormat,
    summary: `${detectedFormat} 파싱 완료: ${tags.join(' | ')} (색상: ${colorA}, ${colorB})`,
  };
}

/**
 * Fetch online JSON preset from a web URL
 */
export async function fetchOnlineParticlePreset(url: string): Promise<{
  data: any;
  converted: ReturnType<typeof convertOnlineParticleJsonToMorphConfig>;
}> {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    throw new Error('유효한 HTTP 또는 HTTPS URL을 입력해주세요.');
  }

  try {
    const res = await fetch(trimmed);
    if (!res.ok) {
      throw new Error(`HTTP 요청 오류 (상태 코드: ${res.status})`);
    }
    const json = await res.json();
    const converted = convertOnlineParticleJsonToMorphConfig(json);
    return { data: json, converted };
  } catch (err: any) {
    throw new Error(`온라인 프리셋 다운로드 실패: ${err.message || err}`);
  }
}
