import { MorphConfig, MorphShape, StateSnapshot, SerializedMorphShape } from '../types';
import { serializeMorphShape } from './presetManager';

export const MAX_HISTORY_STACK_DEPTH = 50;

/**
 * Deep clones a MorphConfig object ensuring no reference leaks.
 */
export function cloneConfig(config?: MorphConfig | Partial<MorphConfig>): MorphConfig {
  if (!config) {
    return {
      waypointShapeIds: [],
    } as unknown as MorphConfig;
  }
  return {
    ...config,
    waypointShapeIds: Array.isArray(config.waypointShapeIds) ? [...config.waypointShapeIds] : [],
  } as MorphConfig;
}

/**
 * Creates a normalized StateSnapshot from current workspace parameters.
 */
export function createStateSnapshot(
  sourceShapeId: string,
  targetShapeId: string,
  waypointShapeIds: string[] = [],
  config: MorphConfig,
  shapes: MorphShape[] = [],
  description: string = '상태 변경'
): StateSnapshot {
  const safeWaypoints = Array.isArray(waypointShapeIds) ? waypointShapeIds : [];
  const customShapesToSave = (shapes || [])
    .filter((s) => s.type !== 'preset')
    .map((s) => serializeMorphShape(s, 5000));

  return {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    description,
    sourceShapeId: sourceShapeId || 'sphere',
    targetShapeId: targetShapeId || 'torus',
    waypointShapeIds: [...safeWaypoints],
    config: cloneConfig(config),
    customShapes: customShapesToSave.length > 0 ? customShapesToSave : undefined,
  };
}

/**
 * Checks if two snapshots are meaningfully different (excluding continuous animation progress).
 */
export function isMeaningfullyDifferent(a?: StateSnapshot | null, b?: StateSnapshot | null): boolean {
  if (!a || !b) return true;
  if (a.sourceShapeId !== b.sourceShapeId) return true;
  if (a.targetShapeId !== b.targetShapeId) return true;
  const aWps = Array.isArray(a.waypointShapeIds) ? a.waypointShapeIds : [];
  const bWps = Array.isArray(b.waypointShapeIds) ? b.waypointShapeIds : [];
  if (aWps.length !== bWps.length) return true;
  for (let i = 0; i < aWps.length; i++) {
    if (aWps[i] !== bWps[i]) return true;
  }

  // Compare config keys excluding volatile progress
  const keysToCompare: (keyof MorphConfig)[] = [
    'particleCount', 'playSpeed', 'playMode', 'morphEasing',
    'noiseAmp', 'noiseFreq', 'noiseSpeed', 'noiseType',
    'delayMode', 'delaySpread', 'durationVariance', 'attractStrength', 'damping',
    'particleType', 'shapeRotation', 'coreRatio',
    'colorMixMode', 'colorScheme', 'colorA', 'colorB', 'colorC', 'colorMixRatio',
    'velocityColorShift', 'colorGamma', 'pointSize', 'glowIntensity', 'blending',
    'autoRotate', 'rotateSpeed', 'depthTest', 'backgroundColor',
    'trailsEnabled', 'trailLength', 'motionBlurIntensity',
    'mouseGravityEnabled', 'mouseGravityRadius', 'mouseGravityStrength', 'mouseGravityMode', 'ambientDriftAmp',
    'audioReactiveEnabled', 'audioSensitivity', 'audioBassScale', 'audioTrebleGlitter', 'audioSourceType',
    'blackHoleEnabled', 'blackHoleMass', 'blackHoleRadius',
    'chromaticAberration', 'glitchIntensity',
    'gridOverlayEnabled', 'gridOverlayPlane', 'gridOverlaySize', 'gridOverlayDivisions', 'gridOverlayShowAxes', 'gridOverlayShowBounds'
  ];

  for (const k of keysToCompare) {
    if (a.config[k] !== b.config[k]) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a human-friendly Korean action description for config updates.
 */
export function describeConfigChange(patch: Partial<MorphConfig>): string {
  if ('particleType' in patch) return `파티클 외형 [${patch.particleType}] 변경`;
  if ('colorScheme' in patch || 'colorA' in patch || 'colorB' in patch || 'colorC' in patch) return '색상 팔레트 & 틴트 변경';
  if ('colorMixMode' in patch) return `컬러 믹스 모드 [${patch.colorMixMode}] 변경`;
  if ('noiseType' in patch) return `유체 노이즈 타입 [${patch.noiseType}] 변경`;
  if ('noiseAmp' in patch || 'noiseFreq' in patch || 'noiseSpeed' in patch) return '유체 난류/주파수 물리값 조절';
  if ('delayMode' in patch || 'delaySpread' in patch) return '시차 딜레이 분산 필드 변경';
  if ('morphEasing' in patch) return `가속도 이징 [${patch.morphEasing}] 변경`;
  if ('particleCount' in patch) return `정점 파티클 수 [${patch.particleCount?.toLocaleString()}] 변경`;
  if ('pointSize' in patch || 'glowIntensity' in patch || 'blending' in patch) return '셰이더 포인트/발광 광원 설정';
  if ('mouseGravityEnabled' in patch || 'mouseGravityStrength' in patch || 'mouseGravityRadius' in patch) return '마우스 중력장 파라미터 조절';
  if ('blackHoleEnabled' in patch || 'blackHoleMass' in patch) return '블랙홀 특이점 물리 필드 설정';
  if ('trailsEnabled' in patch || 'trailLength' in patch) return '모션 블러 & 트레일 잔상 설정';
  if ('backgroundColor' in patch) return '3D 캔버스 배경색 변경';
  if ('audioReactiveEnabled' in patch || 'audioSensitivity' in patch) return '오디오 반응형 비주얼라이저 설정';
  if ('gridOverlayEnabled' in patch) return '3D 엔지니어링 좌표 격자 토글';

  return '파라미터 설정 변경';
}
