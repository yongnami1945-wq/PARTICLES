import React from 'react';
import { 
  X, Palette, Sparkles, Sliders, Disc, Eye, 
  Circle, Star, Diamond, CircleDot, Hexagon, Square, Cloud, Sun, 
  Layers, Zap, Flame, RefreshCw, Check, Waves, Wind
} from 'lucide-react';
import { MorphConfig, ParticleType, ColorMixMode } from '../types';

interface ColorMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
}

const PARTICLE_TYPES: { id: ParticleType; name: string; desc: string; icon: React.ReactNode; previewBadge: string }[] = [
  { 
    id: 'circle', 
    name: '원형 도트 (Soft Circle)', 
    desc: '중심 핵 발광과 부드러운 오라 글로우',
    icon: <Circle className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'SOFT CORE'
  },
  { 
    id: 'bird', 
    name: '🦅 Boids 조류 날개짓 (Flocking Bird)', 
    desc: 'Three.js GPGPU Boids 군집 비행 3각 날개짓 & 와류',
    icon: <Wind className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'BOIDS WING'
  },
  { 
    id: 'feather', 
    name: '🪶 에어로다이내믹 깃털 (Aerodynamic Feather)', 
    desc: '중앙 깃대 라키스 척추와 유선형 솜털 글로우 블레이드',
    icon: <Sparkles className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'BIONIC PLUME'
  },
  { 
    id: 'delta', 
    name: '🔺 초음속 델타 윙 (Delta Wing)', 
    desc: '초음속 쐐기형 델타익과 후방 트윈 이온 스트림라인',
    icon: <Zap className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'DELTA JET'
  },
  { 
    id: 'star', 
    name: '십자 스타 (Cross Star)', 
    desc: '4각 및 8각 회절 스파크 광선 갈라짐',
    icon: <Star className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'DIFFRACTION'
  },
  { 
    id: 'diamond', 
    name: '다이아몬드 (Diamond Spark)', 
    desc: '선명한 45도 회전 마름모 결정체',
    icon: <Diamond className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'RHOMBUS'
  },
  { 
    id: 'ring', 
    name: '네온 링 (Neon Ring)', 
    desc: '속이 빈 2D 토러스 도넛 림 윤곽선',
    icon: <CircleDot className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'TORUS RIM'
  },
  { 
    id: 'hexagon', 
    name: '사이버 헥사곤 (Hexagon)', 
    desc: 'SF 테크니컬 6각형 폴리곤 격자',
    icon: <Hexagon className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'POLYGON 6'
  },
  { 
    id: 'cube', 
    name: '스퀘어 픽셀 (Square Pixel)', 
    desc: '디지털 매트릭스 복셀 큐브 블록',
    icon: <Square className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'VOXEL BLOCK'
  },
  { 
    id: 'cloud', 
    name: '네뷸라 클라우드 (Nebula Cloud)', 
    desc: '우주 성운 먼지와 유체 안개 스모크',
    icon: <Cloud className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'VAPOR DUST'
  },
  { 
    id: 'bokeh', 
    name: '보케 렌즈 (Bokeh Flare)', 
    desc: '카메라 조리개 밝은 외곽 림 플레어',
    icon: <Sun className="w-5 h-5 text-[#00F0FF]" />,
    previewBadge: 'OPTICAL RIM'
  },
];

const COLOR_PRESETS = [
  { name: 'Cyberpunk Neon', a: '#00F0FF', b: '#FF007F', c: '#FFE600' },
  { name: 'Solar Flare', a: '#FF3B00', b: '#FF9500', c: '#FFF066' },
  { name: 'Cosmic Galaxy', a: '#7928CA', b: '#0070F3', c: '#00DFD8' },
  { name: 'Matrix Emerald', a: '#00FF66', b: '#00B4D8', c: '#E0FF00' },
  { name: 'Sunset Twilight', a: '#FF0055', b: '#7928CA', c: '#FF9900' },
  { name: 'Electric Plasma', a: '#00FFFF', b: '#9D00FF', c: '#FFFFFF' },
  { name: 'Liquid Gold', a: '#FFB703', b: '#FB8500', c: '#FFF3B0' },
  { name: 'Ice & Fire', a: '#00E5FF', b: '#FF0055', c: '#FFFFFF' },
];

export const ColorMixerModal: React.FC<ColorMixerModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-5xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1A1A1E] text-[#00F0FF] border border-[#2A2A2E]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>PARTICLE SHAPE & COLOR MIXING LABORATORY</span>
                <span className="px-1.5 py-0.2 bg-[#00F0FF]/10 text-[#00F0FF] text-[9px] border border-[#00F0FF]/30">
                  SHAPE SDF // COLOR ENGINE
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                실시간 파티클 지오메트리 외형(SDF) 선택 및 고급 광원 색혼합 제어
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1A1A1E] border border-transparent hover:border-[#2A2A2E] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 custom-scrollbar">
          {/* Left Column: Particle Type Selection (5 cols) */}
          <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-[#2A2A2E] space-y-4 bg-[#0D0D10]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                01. 파티클 종류 선택 (SHAPE)
              </span>
              <span className="text-[9px] text-gray-400 bg-[#1A1A1E] px-2 py-0.5 border border-[#2A2A2E]">
                {config.particleType.toUpperCase()}
              </span>
            </div>

            {/* Shape Grid */}
            <div className="grid grid-cols-2 gap-2">
              {PARTICLE_TYPES.map((pt) => {
                const isSelected = config.particleType === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => onChangeConfig({ particleType: pt.id })}
                    className={`p-3 text-left border transition relative flex flex-col justify-between h-[82px] cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181E] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'bg-[#121215] border-[#2A2A2E] hover:border-gray-500 hover:bg-[#16161A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1 border ${isSelected ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-[#2A2A2E] bg-[#1A1A1E]'}`}>
                        {pt.icon}
                      </div>
                      <span className={`text-[8px] px-1 py-0.2 font-mono ${isSelected ? 'text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30' : 'text-gray-500'}`}>
                        {pt.previewBadge}
                      </span>
                    </div>
                    <div>
                      <div className={`text-[11px] font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {pt.name.split(' (')[0]}
                      </div>
                      <div className="text-[9px] text-gray-500 truncate">
                        {pt.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00F0FF] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Shape Fine-tuning Sliders */}
            <div className="p-3.5 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>지오메트리 미세 조정</span>
                <span className="text-[#00F0FF]">SDF PARAMS</span>
              </div>

              {/* Point Size */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>입자 크기 (Point Size)</span>
                  <span className="text-[#00F0FF]">{config.pointSize.toFixed(1)} px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.1"
                  value={config.pointSize}
                  onChange={(e) => onChangeConfig({ pointSize: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Shape Rotation */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>스프라이트 회전각 (Sprite Rotation)</span>
                  <span className="text-[#00F0FF]">{config.shapeRotation ?? 0}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={config.shapeRotation ?? 0}
                  onChange={(e) => onChangeConfig({ shapeRotation: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Core Hardness Ratio */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>중심 발광 코어 경도 (Core Ratio)</span>
                  <span className="text-[#00F0FF]">{(config.coreRatio ?? 0.8).toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={config.coreRatio ?? 0.8}
                  onChange={(e) => onChangeConfig({ coreRatio: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Advanced Color Mixing System (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4 bg-[#0A0A0B]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1.5 uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5" />
                02. 파티클 색혼합 방식 (COLOR MIXING MODES)
              </span>
              <span className="text-[9px] text-gray-400 bg-[#1A1A1E] px-2 py-0.5 border border-[#2A2A2E]">
                {config.colorMixMode.toUpperCase()}
              </span>
            </div>

            {/* Mixing Mode Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'interpolate', label: '자연 형상 보간', sub: 'Src ➔ Dst' },
                { id: 'gradient', label: '3단 커스텀 램프', sub: '3-Stop Ramp' },
                { id: 'velocity', label: '운동속도 변색', sub: 'Kinetic Shift' },
                { id: 'height', label: '수직 고도 그라디언트', sub: 'Y-Axis Ramp' },
                { id: 'radial', label: '방사형 스펙트럼', sub: 'Radial Hue' },
                { id: 'additive_mix', label: '가산 광원 혼합', sub: 'Additive Mix' },
              ].map((mode) => {
                const isSelected = config.colorMixMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onChangeConfig({ colorMixMode: mode.id as ColorMixMode })}
                    className={`p-2.5 text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#18181E] border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-[#141417] border-[#2A2A2E] hover:border-gray-500'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-white truncate">{mode.label}</div>
                    <div className="text-[8px] text-[#00F0FF] font-mono">{mode.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* 3-Color Custom Mixing Palette */}
            <div className="p-4 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>3단 광원 컬러 팔레트 (RGB MIXING PALETTE)</span>
                <span className="text-[9px] text-[#00F0FF]">LIVE INTERPOLATOR</span>
              </div>

              {/* Dynamic Gradient Bar Preview */}
              <div
                className="w-full h-4 border border-[#2A2A2E] shadow-inner"
                style={{
                  background: `linear-gradient(90deg, ${config.colorA || '#00F0FF'} 0%, ${config.colorB || '#FF007F'} 50%, ${config.colorC || '#FFE600'} 100%)`,
                }}
              />

              {/* 3 Color Pickers */}
              <div className="grid grid-cols-3 gap-3">
                {/* Color A */}
                <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] space-y-1.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Color A (베이스)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorA || '#00f0ff'}
                      onChange={(e) => onChangeConfig({ colorA: e.target.value })}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorA || '#00f0ff'}
                      onChange={(e) => onChangeConfig({ colorA: e.target.value })}
                      className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-[10px] text-white px-1.5 py-1 uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Color B */}
                <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] space-y-1.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Color B (전이/미드)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorB || '#ff007f'}
                      onChange={(e) => onChangeConfig({ colorB: e.target.value })}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorB || '#ff007f'}
                      onChange={(e) => onChangeConfig({ colorB: e.target.value })}
                      className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-[10px] text-white px-1.5 py-1 uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Color C */}
                <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] space-y-1.5">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">Color C (피크/에너지)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.colorC || '#ffe600'}
                      onChange={(e) => onChangeConfig({ colorC: e.target.value })}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorC || '#ffe600'}
                      onChange={(e) => onChangeConfig({ colorC: e.target.value })}
                      className="w-full bg-[#1A1A1E] border border-[#2A2A2E] text-[10px] text-white px-1.5 py-1 uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Swatches */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[9px] text-gray-400 uppercase font-bold">인기 프리셋 테마 원클릭 적용:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => onChangeConfig({ colorA: p.a, colorB: p.b, colorC: p.c, colorMixMode: 'gradient' })}
                      className="p-1.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] text-left transition flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: p.a }} />
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: p.b }} />
                        <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: p.c }} />
                      </div>
                      <span className="text-[9px] text-gray-300 truncate group-hover:text-white">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mixing Ratio & Dynamic Physics Shader Tuning */}
            <div className="p-4 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>색상 커브 및 셰이더 광학 튜닝</span>
                <span className="text-[#00F0FF]">CURVE SOLVER</span>
              </div>

              {/* Color Mix Bias */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>색상 전이 바이어스 (Mix Curve Ratio)</span>
                  <span className="text-[#00F0FF]">{((config.colorMixRatio ?? 0.5) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.02"
                  value={config.colorMixRatio ?? 0.5}
                  onChange={(e) => onChangeConfig({ colorMixRatio: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Velocity Color Shift */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>비행 속도 기반 발광 변색도 (Kinetic Energy Shift)</span>
                  <span className="text-[#00F0FF]">{(config.velocityColorShift ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.1"
                  value={config.velocityColorShift ?? 1.0}
                  onChange={(e) => onChangeConfig({ velocityColorShift: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Glow Intensity & Blending */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>네온 발광 (Glow Intensity)</span>
                    <span className="text-[#00F0FF]">{config.glowIntensity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3.5"
                    step="0.1"
                    value={config.glowIntensity}
                    onChange={(e) => onChangeConfig({ glowIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#1A1A1E] rounded-none appearance-none cursor-pointer accent-[#00F0FF]"
                  />
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 mb-1">블렌딩 모드 (Blending Mode)</div>
                  <div className="flex gap-1">
                    {(['additive', 'screen', 'normal'] as const).map((b) => (
                      <button
                        key={b}
                        onClick={() => onChangeConfig({ blending: b })}
                        className={`flex-1 py-1 text-[9px] font-bold uppercase border transition cursor-pointer ${
                          config.blending === b
                            ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                            : 'bg-[#0A0A0B] text-gray-400 border-[#2A2A2E]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 04. Motion Trails & Path Highlighting */}
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase">
                    <Waves className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>파티클 궤적 고스트 라인 (Motion Trails)</span>
                  </div>
                  <button
                    onClick={() => onChangeConfig({ trailsEnabled: !config.trailsEnabled })}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition cursor-pointer ${
                      config.trailsEnabled
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#1A1A1E] text-gray-400 border-[#3A3A3E]'
                    }`}
                  >
                    {config.trailsEnabled ? 'TRAILS ACTIVE' : 'ENABLE TRAILS'}
                  </button>
                </div>
                
                {config.trailsEnabled && (
                  <div className="space-y-2 pt-1 border-t border-[#1A1A1E]">
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>잔상 지속도 (Trail Persistence)</span>
                      <span className="text-[#00F0FF]">{((config.trailLength ?? 0.85) * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.98"
                      step="0.02"
                      value={config.trailLength ?? 0.85}
                      onChange={(e) => onChangeConfig({ trailLength: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#1A1A1E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>모든 색혼합 및 파티클 종류는 실시간 Three.js 뷰포트에 즉각 반영됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#00F0FF] hover:bg-white text-black font-bold text-xs uppercase transition shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            적용 및 창 닫기 (APPLY)
          </button>
        </div>
      </div>
    </div>
  );
};
