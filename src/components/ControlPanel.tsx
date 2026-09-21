import React, { useState, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Sliders, Waves, Palette, 
  Layers, Plus, ArrowLeftRight, Sparkles, Circle, Star, 
  Diamond, CircleDot, Hexagon, Square, Cloud, Sun, Zap, Maximize2,
  Bookmark, FileCode2, Globe, Music, Radio, Download, BookOpen, HardDrive, Disc,
  Type, Trash2, ArrowRight, Wind, Activity, Video, Grid, Compass, Box
} from 'lucide-react';
import { MorphConfig, MorphShape, NoiseType, DelayMode, ParticleType, ColorMixMode, MorphEasing } from '../types';
import { PresetLibraryTab } from './PresetLibraryTab';
import { audioEngine } from '../utils/audioEngine';
import { exportPointCloudPLY, exportPointCloudOBJ, exportPointCloudXYZ, exportPointCloudCSV } from '../utils/pointCloudExporter';
import { VisualTimelineEditor, EASING_OPTIONS } from './VisualTimelineEditor';

interface ControlPanelProps {
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  shapes: MorphShape[];
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds?: string[];
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
  onAddWaypoint?: (shapeId?: string) => void;
  onRemoveWaypoint?: (index: number) => void;
  onUpdateWaypoint?: (index: number, shapeId: string) => void;
  onReorderChain?: (newChainIds: string[]) => void;
  onLoadTextShape?: (text: string, targetSlot: 'source' | 'target' | 'waypoint', waypointIndex?: number) => void;
  onAddCustomShape?: (shape: MorphShape) => void;
  onOpenUploadModal: () => void;
  onSwapShapes: () => void;
  onOpenColorMixer?: () => void;
  onOpenGCodeModal?: () => void;
  onOpenWebHub?: () => void;
  onOpenHtmlEditor?: () => void;
  onOpenTheoryModal?: (page?: number) => void;
  onOpenVideoModal?: () => void;
  onExportHtml?: () => void;
  onExportPureHtml?: () => void;
  onExportPureCmd?: () => void;
}

type TabType = 'shapes' | 'morph' | 'physics' | 'visuals' | 'fx_audio' | 'presets';

const PARTICLE_SHAPES: { id: ParticleType; name: string; icon: React.ReactNode }[] = [
  { id: 'circle', name: '원형 도트', icon: <Circle className="w-3.5 h-3.5" /> },
  { id: 'bird', name: '🦅 조류 날개짓', icon: <Wind className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'feather', name: '🪶 에어로 깃털', icon: <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'delta', name: '🔺 델타 윙', icon: <Zap className="w-3.5 h-3.5 text-[#FFE600]" /> },
  { id: 'snowflake1', name: '❄️ 눈꽃 결정 1', icon: <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'snowflake2', name: '❄️ 별빛 눈꽃 2', icon: <Star className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'snowflake3', name: '❄️ 덴드라이트 3', icon: <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'snowflake4', name: '❄️ 얼음 결정 4', icon: <Hexagon className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'snowflake5', name: '❄️ 마이크로 5', icon: <Diamond className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'snowflake_multi', name: '🌨️ 5단 눈보라', icon: <Cloud className="w-3.5 h-3.5 text-[#00F0FF]" /> },
  { id: 'star', name: '십자 스타', icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'diamond', name: '다이아몬드', icon: <Diamond className="w-3.5 h-3.5" /> },
  { id: 'ring', name: '네온 링', icon: <CircleDot className="w-3.5 h-3.5" /> },
  { id: 'hexagon', name: '사이버 헥사', icon: <Hexagon className="w-3.5 h-3.5" /> },
  { id: 'cube', name: '스퀘어 픽셀', icon: <Square className="w-3.5 h-3.5" /> },
  { id: 'cloud', name: '네뷸라 성운', icon: <Cloud className="w-3.5 h-3.5" /> },
  { id: 'bokeh', name: '보케 렌즈', icon: <Sun className="w-3.5 h-3.5" /> },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  shapes,
  sourceShapeId,
  targetShapeId,
  waypointShapeIds = [],
  onSelectSource,
  onSelectTarget,
  onAddWaypoint,
  onRemoveWaypoint,
  onUpdateWaypoint,
  onReorderChain,
  onLoadTextShape,
  onAddCustomShape,
  onOpenUploadModal,
  onSwapShapes,
  onOpenColorMixer,
  onOpenGCodeModal,
  onOpenWebHub,
  onOpenHtmlEditor,
  onOpenTheoryModal,
  onOpenVideoModal,
  onExportHtml,
  onExportPureHtml,
  onExportPureCmd,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('shapes');
  const [audioFileInput, setAudioFileInput] = useState<string>('');
  const [sideTextInput, setSideTextInput] = useState<string>('HY태고딕 3D');
  const audioFileRef = useRef<HTMLInputElement>(null);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFileInput(file.name);
    const ok = await audioEngine.loadAudioFile(file);
    if (ok) {
      onChangeConfig({ audioReactiveEnabled: true, audioSourceType: 'file' });
    }
  };

  const handleExportPointsPLY = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const src = shapes.find((s) => s.id === sourceShapeId) || shapes[0];
    const dst = shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];

    const srcPos = src.positions;
    const dstPos = dst.positions;
    const srcCol = src.colors;
    const dstCol = dst.colors;

    const t = config.progress;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const sX = srcPos[idx % srcPos.length] || 0;
      const sY = srcPos[(idx + 1) % srcPos.length] || 0;
      const sZ = srcPos[(idx + 2) % srcPos.length] || 0;
      const dX = dstPos[idx % dstPos.length] || 0;
      const dY = dstPos[(idx + 1) % dstPos.length] || 0;
      const dZ = dstPos[(idx + 2) % dstPos.length] || 0;

      pos[idx] = sX + (dX - sX) * t;
      pos[idx + 1] = sY + (dY - sY) * t;
      pos[idx + 2] = sZ + (dZ - sZ) * t;

      const scR = srcCol ? srcCol[idx % srcCol.length] : 1;
      const scG = srcCol ? srcCol[(idx + 1) % srcCol.length] : 1;
      const scB = srcCol ? srcCol[(idx + 2) % srcCol.length] : 1;
      const dcR = dstCol ? dstCol[idx % dstCol.length] : 1;
      const dcG = dstCol ? dstCol[(idx + 1) % dstCol.length] : 1;
      const dcB = dstCol ? dstCol[(idx + 2) % dstCol.length] : 1;

      col[idx] = scR + (dcR - scR) * t;
      col[idx + 1] = scG + (dcG - scG) * t;
      col[idx + 2] = scB + (dcB - scB) * t;
    }

    exportPointCloudPLY(pos, col, `particle_morph_${src.id}_to_${dst.id}_t${Math.floor(t * 100)}.ply`);
  };

  const handleExportPointsOBJ = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const src = shapes.find((s) => s.id === sourceShapeId) || shapes[0];
    const dst = shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];

    const srcPos = src.positions;
    const dstPos = dst.positions;
    const srcCol = src.colors;
    const dstCol = dst.colors;

    const t = config.progress;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const sX = srcPos[idx % srcPos.length] || 0;
      const sY = srcPos[(idx + 1) % srcPos.length] || 0;
      const sZ = srcPos[(idx + 2) % srcPos.length] || 0;
      const dX = dstPos[idx % dstPos.length] || 0;
      const dY = dstPos[(idx + 1) % dstPos.length] || 0;
      const dZ = dstPos[(idx + 2) % dstPos.length] || 0;

      pos[idx] = sX + (dX - sX) * t;
      pos[idx + 1] = sY + (dY - sY) * t;
      pos[idx + 2] = sZ + (dZ - sZ) * t;

      const scR = srcCol ? srcCol[idx % srcCol.length] : 1;
      const scG = srcCol ? srcCol[(idx + 1) % srcCol.length] : 1;
      const scB = srcCol ? srcCol[(idx + 2) % srcCol.length] : 1;
      const dcR = dstCol ? dstCol[idx % dstCol.length] : 1;
      const dcG = dstCol ? dstCol[(idx + 1) % dstCol.length] : 1;
      const dcB = dstCol ? dstCol[(idx + 2) % dstCol.length] : 1;

      col[idx] = scR + (dcR - scR) * t;
      col[idx + 1] = scG + (dcG - scG) * t;
      col[idx + 2] = scB + (dcB - scB) * t;
    }

    exportPointCloudOBJ(pos, col, `particle_morph_${src.id}_to_${dst.id}_t${Math.floor(t * 100)}.obj`);
  };

  const handleExportPointsXYZ = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const src = shapes.find((s) => s.id === sourceShapeId) || shapes[0];
    const dst = shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];

    const srcPos = src.positions;
    const dstPos = dst.positions;
    const srcCol = src.colors;
    const dstCol = dst.colors;

    const t = config.progress;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const sX = srcPos[idx % srcPos.length] || 0;
      const sY = srcPos[(idx + 1) % srcPos.length] || 0;
      const sZ = srcPos[(idx + 2) % srcPos.length] || 0;
      const dX = dstPos[idx % dstPos.length] || 0;
      const dY = dstPos[(idx + 1) % dstPos.length] || 0;
      const dZ = dstPos[(idx + 2) % dstPos.length] || 0;

      pos[idx] = sX + (dX - sX) * t;
      pos[idx + 1] = sY + (dY - sY) * t;
      pos[idx + 2] = sZ + (dZ - sZ) * t;

      const scR = srcCol ? srcCol[idx % srcCol.length] : 1;
      const scG = srcCol ? srcCol[(idx + 1) % srcCol.length] : 1;
      const scB = srcCol ? srcCol[(idx + 2) % srcCol.length] : 1;
      const dcR = dstCol ? dstCol[idx % dstCol.length] : 1;
      const dcG = dstCol ? dstCol[(idx + 1) % dstCol.length] : 1;
      const dcB = dstCol ? dstCol[(idx + 2) % dstCol.length] : 1;

      col[idx] = scR + (dcR - scR) * t;
      col[idx + 1] = scG + (dcG - scG) * t;
      col[idx + 2] = scB + (dcB - scB) * t;
    }

    exportPointCloudXYZ(pos, col, `particle_morph_${src.id}_to_${dst.id}_t${Math.floor(t * 100)}.xyz`, { includeColors: true, maxPoints: 10000 });
  };

  const handleExportPointsCSV = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const src = shapes.find((s) => s.id === sourceShapeId) || shapes[0];
    const dst = shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];

    const srcPos = src.positions;
    const dstPos = dst.positions;
    const srcCol = src.colors;
    const dstCol = dst.colors;

    const t = config.progress;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const sX = srcPos[idx % srcPos.length] || 0;
      const sY = srcPos[(idx + 1) % srcPos.length] || 0;
      const sZ = srcPos[(idx + 2) % srcPos.length] || 0;
      const dX = dstPos[idx % dstPos.length] || 0;
      const dY = dstPos[(idx + 1) % dstPos.length] || 0;
      const dZ = dstPos[(idx + 2) % dstPos.length] || 0;

      pos[idx] = sX + (dX - sX) * t;
      pos[idx + 1] = sY + (dY - sY) * t;
      pos[idx + 2] = sZ + (dZ - sZ) * t;

      const scR = srcCol ? srcCol[idx % srcCol.length] : 1;
      const scG = srcCol ? srcCol[(idx + 1) % srcCol.length] : 1;
      const scB = srcCol ? srcCol[(idx + 2) % srcCol.length] : 1;
      const dcR = dstCol ? dstCol[idx % dstCol.length] : 1;
      const dcG = dstCol ? dstCol[(idx + 1) % dstCol.length] : 1;
      const dcB = dstCol ? dstCol[(idx + 2) % dstCol.length] : 1;

      col[idx] = scR + (dcR - scR) * t;
      col[idx + 1] = scG + (dcG - scG) * t;
      col[idx + 2] = scB + (dcB - scB) * t;
    }

    exportPointCloudCSV(pos, col, `particle_morph_${src.id}_to_${dst.id}_t${Math.floor(t * 100)}.csv`, { maxPoints: 10000 });
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-[#0F0F12] border-l border-[#2A2A2E] flex flex-col h-full lg:h-[calc(100vh-64px)] z-20 select-none text-[#E0E0E0] font-mono">
      {/* Top Tab Bar (6 Tabs) */}
      <div className="grid grid-cols-6 border-b border-[#2A2A2E] bg-[#0A0A0B] text-[8px] sm:text-[9px]">
        <button
          onClick={() => setActiveTab('shapes')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'shapes'
              ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
              : 'text-gray-500 hover:text-white'
          }`}
          title="01. 형상 선택 & 에셋"
        >
          <Layers className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">01.형상</span>
        </button>

        <button
          onClick={() => setActiveTab('morph')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'morph'
              ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
              : 'text-gray-500 hover:text-white'
          }`}
          title="02. 모핑 타임라인 & 지연"
        >
          <Sliders className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">02.모핑</span>
        </button>

        <button
          onClick={() => setActiveTab('physics')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'physics'
              ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
              : 'text-gray-500 hover:text-white'
          }`}
          title="03. 컬 노이즈 & 마우스 중력장"
        >
          <Waves className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">03.물리</span>
        </button>

        <button
          onClick={() => setActiveTab('visuals')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'visuals'
              ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
              : 'text-gray-500 hover:text-white'
          }`}
          title="04. 셰이더 & 색혼합"
        >
          <Palette className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">04.셰이더</span>
        </button>

        <button
          onClick={() => setActiveTab('fx_audio')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'fx_audio'
              ? 'bg-[#0F0F12] text-[#FF007F] border-b-2 border-[#FF007F]'
              : 'text-gray-500 hover:text-[#FF007F]'
          }`}
          title="05. 오디오 반응 & 블랙홀 & 3D 내보내기 (13~16P)"
        >
          <Music className="w-3 h-3 flex-shrink-0 text-[#FF007F]" />
          <span className="truncate text-[#FF007F] font-bold">05.FX/음악</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`py-2 font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
              : 'text-gray-500 hover:text-white'
          }`}
          title="06. 프리셋 라이브러리"
        >
          <Bookmark className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">06.프리셋</span>
        </button>
      </div>

      {/* Scrollable Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
        {/* ================= TAB 1: SHAPES & IMAGES ================= */}
        {activeTab === 'shapes' && (
          <div className="space-y-6">
            {/* Direct 2D Multi-line Text Shape Generator */}
            <div className="bg-[#16161D] border border-[#00F0FF]/40 p-3 shadow-[0_2px_15px_rgba(0,240,255,0.1)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>✍️ 2D 멀티라인 텍스트 (최대 3줄)</span>
                </span>
                <span className="text-[8px] bg-[#00F0FF]/15 text-[#00F0FF] px-1 py-0.5 border border-[#00F0FF]/30">
                  1.7배 대형 2D 평면
                </span>
              </div>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={sideTextInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    const splitLines = val.split('\n');
                    if (splitLines.length <= 3) {
                      setSideTextInput(val);
                    } else {
                      setSideTextInput(splitLines.slice(0, 3).join('\n'));
                    }
                  }}
                  placeholder={`1줄: 3D PARTICLE\n2줄: HY태고딕 고선명도\n3줄: 3-LINE TYPO`}
                  className="w-full bg-[#0A0A0C] border border-[#2A2A2E] focus:border-[#00F0FF] px-2.5 py-1.5 text-xs text-white outline-none font-bold resize-none leading-relaxed custom-scrollbar"
                />
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => onLoadTextShape && onLoadTextShape(sideTextInput, 'source')}
                    className="py-1 bg-[#222228] hover:bg-[#00F0FF] hover:text-black text-[9px] font-bold uppercase transition"
                  >
                    [출발] 로딩
                  </button>
                  <button
                    onClick={() => onLoadTextShape && onLoadTextShape(sideTextInput, 'waypoint')}
                    className="py-1 bg-amber-400/15 hover:bg-amber-400 hover:text-black text-amber-400 border border-amber-400/40 text-[9px] font-bold uppercase transition"
                  >
                    [+경유] 로딩
                  </button>
                  <button
                    onClick={() => onLoadTextShape && onLoadTextShape(sideTextInput, 'target')}
                    className="py-1 bg-[#222228] hover:bg-white hover:text-black text-[9px] font-bold uppercase transition"
                  >
                    [목표] 로딩
                  </button>
                </div>
              </div>
            </div>

            {/* Waypoints Sequence List */}
            {(waypointShapeIds || []).length > 0 && (
              <div className="bg-[#181610] border border-amber-400/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>중간 경유 피사체 목록 ({(waypointShapeIds || []).length}개)</span>
                  </span>
                  <span className="text-[8px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 border border-amber-400/40 font-bold">
                    ⏱️ 러닝타임 2배 적용
                  </span>
                  <button
                    onClick={() => onAddWaypoint && onAddWaypoint(shapes[2]?.id || shapes[0]?.id)}
                    className="px-2 py-0.5 bg-amber-400/20 hover:bg-amber-400 hover:text-black text-amber-300 text-[9px] font-bold border border-amber-400/40 transition"
                  >
                    + 추가
                  </button>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {(waypointShapeIds || []).map((wpId, idx) => {
                    const wpShape = shapes.find((s) => s.id === wpId) || shapes[0];
                    return (
                      <div key={`side-wp-${idx}`} className="flex items-center justify-between bg-[#0A0A0C] border border-[#2A2A2E] p-1.5 text-[10px]">
                        <span className="text-amber-400 font-bold">#{idx + 1} {wpShape.name}</span>
                        <div className="flex items-center gap-1">
                          <select
                            value={wpId}
                            onChange={(e) => onUpdateWaypoint && onUpdateWaypoint(idx, e.target.value)}
                            className="bg-[#141418] text-[9px] text-gray-300 border border-[#2A2A2E] px-1 py-0.5 outline-none"
                          >
                            {shapes.map((s) => (
                              <option key={`side-opt-${idx}-${s.id}`} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => onRemoveWaypoint && onRemoveWaypoint(idx)}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visual Timeline Editor for Drag & Drop Multi-Stage Morph Chain */}
            <VisualTimelineEditor
              shapes={shapes}
              sourceShapeId={sourceShapeId}
              targetShapeId={targetShapeId}
              waypointShapeIds={waypointShapeIds}
              config={config}
              onChangeConfig={onChangeConfig}
              onSelectSource={onSelectSource}
              onSelectTarget={onSelectTarget}
              onAddWaypoint={onAddWaypoint || (() => {})}
              onRemoveWaypoint={onRemoveWaypoint || (() => {})}
              onUpdateWaypoint={onUpdateWaypoint || (() => {})}
              onReorderChain={onReorderChain || (() => {})}
              onSwapShapes={onSwapShapes}
              className="mb-2"
            />

            {/* Quick Morph Swap & Reset Action */}
            <div className="flex items-center justify-between bg-[#1A1A1E] border border-[#2A2A2E] p-3 gap-2">
              <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider truncate">
                형상 제어 (ASSET CONTROL)
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={onSwapShapes}
                  className="px-2.5 py-1.5 bg-[#2A2A2E] hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#3A3A3E] font-bold text-[10px] uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  title="출발 형상과 도착 형상 위치 서로 맞바꾸기"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>맞바꾸기</span>
                </button>
                <button
                  onClick={() => {
                    onSelectSource('sphere');
                    onSelectTarget('torus');
                  }}
                  className="px-2.5 py-1.5 bg-[#2A2A2E] hover:bg-red-900 hover:text-white text-gray-400 hover:border-red-600 border border-[#3A3A3E] font-bold text-[10px] uppercase flex items-center gap-1 transition-colors cursor-pointer"
                  title="형상 선택 초기화 (기본 구체 ➔ 토러스)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>선택 초기화</span>
                </button>
              </div>
            </div>

            {/* Source Shape Selection: Free-Floating Particles & Ambient Origin */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-[#00F0FF] animate-pulse" />
                  01. 자유 부유 입자장 & 피사체 출발 (ORIGIN DRIFT)
                </h3>
                <span className="text-[9px] text-[#00F0FF] font-mono uppercase">자유 떠돎 / 출발</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                공간을 자유롭게 떠돌던 파티클이 피사체로 수렴하기 전의 초기 자유 부유 입자장 또는 출발 형태를 선택합니다.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {shapes.map((shape) => {
                  const isSelected = shape.id === sourceShapeId;
                  return (
                    <button
                      key={`src-${shape.id}`}
                      onClick={() => onSelectSource(shape.id)}
                      className={`p-2.5 border text-left transition relative flex flex-col justify-between min-h-[64px] ${
                        isSelected
                          ? 'border-[#00F0FF] bg-gradient-to-br from-[#00F0FF]/20 to-transparent'
                          : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:border-[#00F0FF] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {shape.previewUrl ? (
                          <img src={shape.previewUrl} alt={shape.name} className="w-6 h-6 object-cover border border-[#3A3A3E]" />
                        ) : (
                          <div className="w-6 h-6 bg-[#0A0A0B] border border-[#3A3A3E] flex items-center justify-center font-bold text-[#00F0FF] text-[9px]">
                            3D
                          </div>
                        )}
                        <div className="flex-1 truncate">
                          <div className={`font-bold text-[11px] truncate ${isSelected ? 'text-[#00F0FF]' : 'text-gray-200'}`}>
                            {shape.name}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase">{shape.type}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="self-end mt-1 text-[8px] bg-black text-[#00F0FF] px-1 font-mono uppercase border border-[#00F0FF]/40">
                          선택된 출발 상태
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Shape Selection: 3D Subject Formation & Convergence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] text-white uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                  02. 3D 피사체 형성 및 분산 목표 (CONVERGENCE TARGET)
                </h3>
                <span className="text-[9px] text-white font-mono uppercase">3D 피사체 형성</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-2 leading-relaxed">
                파티클이 모여 입체적인 3D 피사체의 형태를 이루었다가 다시 흩어지는 목표 모델을 선택합니다.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {shapes.map((shape) => {
                  const isSelected = shape.id === targetShapeId;
                  return (
                    <button
                      key={`dst-${shape.id}`}
                      onClick={() => onSelectTarget(shape.id)}
                      className={`p-2.5 border text-left transition relative flex flex-col justify-between min-h-[64px] ${
                        isSelected
                          ? 'border-white bg-gradient-to-br from-white/15 to-transparent'
                          : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:border-white hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {shape.previewUrl ? (
                          <img src={shape.previewUrl} alt={shape.name} className="w-6 h-6 object-cover border border-[#3A3A3E]" />
                        ) : (
                          <div className="w-6 h-6 bg-[#0A0A0B] border border-[#3A3A3E] flex items-center justify-center font-bold text-white text-[9px]">
                            3D
                          </div>
                        )}
                        <div className="flex-1 truncate">
                          <div className={`font-bold text-[11px] truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {shape.name}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase">{shape.type}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="self-end mt-1 text-[8px] bg-black text-white px-1 font-mono uppercase border border-white/40">
                          선택된 목표 피사체
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mouse Gravity & Free-Floating Ambient Physics Control */}
            <div className="bg-[#1A1A1E] border border-[#00F0FF]/30 p-3.5 space-y-3 shadow-[0_0_15px_rgba(0,240,255,0.06)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                  마우스 중력 상호작용 및 부유 제어
                </h3>
                <button
                  onClick={() => onChangeConfig({ mouseGravityEnabled: !config.mouseGravityEnabled })}
                  className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold border transition cursor-pointer ${
                    config.mouseGravityEnabled
                      ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                      : 'bg-[#0A0A0B] text-gray-400 border-[#3A3A3E]'
                  }`}
                >
                  {config.mouseGravityEnabled ? '중력 활성화 ON' : '중력 OFF'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { mode: 'attract', label: '🧲 인력 수렴', desc: '마우스로 모임' },
                  { mode: 'vortex', label: '🌀 와류 회전', desc: '주변 소용돌이' },
                  { mode: 'repel', label: '💥 척력 산란', desc: '마우스 밀어냄' },
                ].map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => onChangeConfig({ mouseGravityMode: m.mode as any, mouseGravityEnabled: true })}
                    className={`py-1.5 px-2 text-center border transition ${
                      config.mouseGravityMode === m.mode && config.mouseGravityEnabled
                        ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] font-bold'
                        : 'border-[#2A2A2E] bg-[#0A0A0B] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px]">{m.label}</div>
                    <div className="text-[8px] text-gray-500">{m.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-1 text-[10px]">
                <div className="flex justify-between items-center text-gray-400">
                  <span>마우스 중력 영향 반경 (Radius)</span>
                  <span className="font-bold text-[#00F0FF]">{(config.mouseGravityRadius ?? 6.0).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="15.0"
                  step="0.5"
                  value={config.mouseGravityRadius ?? 6.0}
                  onChange={(e) => onChangeConfig({ mouseGravityRadius: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />

                <div className="flex justify-between items-center text-gray-400">
                  <span>중력 세기 (Gravity Strength)</span>
                  <span className="font-bold text-[#00F0FF]">{(config.mouseGravityStrength ?? 3.5).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={config.mouseGravityStrength ?? 3.5}
                  onChange={(e) => onChangeConfig({ mouseGravityStrength: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />

                <div className="flex justify-between items-center text-gray-400">
                  <span>자유 부유 브라운 운동 (Free Drift)</span>
                  <span className="font-bold text-[#00F0FF]">{(config.ambientDriftAmp ?? 1.3).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={config.ambientDriftAmp ?? 1.3}
                  onChange={(e) => onChangeConfig({ ambientDriftAmp: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Add Custom Image & HTML Editor Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={onOpenUploadModal}
                className="w-full py-2.5 bg-[#1A1A1E] hover:bg-[#00F0FF] hover:text-black border border-[#3A3A3E] hover:border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>커스텀 이미지 업로드 (PNG / JPG)</span>
              </button>

              {onOpenHtmlEditor && (
                <button
                  onClick={onOpenHtmlEditor}
                  className="w-full py-2.5 bg-[#FF007F]/15 hover:bg-[#FF007F] hover:text-white border border-[#FF007F] text-[#FF007F] font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  title="기존에 만들어진 HTML 파티클 파일을 열어 파라미터를 수정하고 불러오기"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>HTML 파티클 파일 열기 & 수정</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: MORPH CONTROL ================= */}
        {activeTab === 'morph' && (
          <div className="space-y-6">
            {/* Progress Big Metric Block */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-4 space-y-3">
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest">
                01. MORPH PROGRESSION
              </h3>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">
                  {(config.progress * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-gray-500 pb-1 uppercase">
                  {config.progress < 0.5 ? 'STAGE: SOURCE_PHASE' : 'STAGE: TARGET_CONVERGENCE'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={config.progress}
                onChange={(e) => {
                  onChangeConfig({ progress: parseFloat(e.target.value), isPlaying: false });
                }}
                className="w-full h-1.5 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 uppercase">
                <span>0.00 (SOURCE)</span>
                <span>0.50 (TURBULENCE PEAK)</span>
                <span>1.00 (TARGET)</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-3">
                02. PLAYBACK CONTROLLER
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onChangeConfig({ isPlaying: !config.isPlaying })}
                  className={`py-2.5 font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition ${
                    config.isPlaying
                      ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                      : 'bg-[#1A1A1E] border border-[#3A3A3E] text-white hover:border-[#00F0FF]'
                  }`}
                >
                  {config.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{config.isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={() => onChangeConfig({ progress: 0 })}
                  className="py-2.5 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#3A3A3E] text-gray-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET</span>
                </button>

                <button
                  onClick={() => onChangeConfig({ progress: 1 })}
                  className="py-2.5 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#3A3A3E] text-gray-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
                >
                  <span>END [1.0]</span>
                </button>
              </div>
            </div>

            {/* Play Mode */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-3">
                03. LOOP MODE
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['pingpong', 'loop', 'once'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onChangeConfig({ playMode: mode })}
                    className={`py-2 text-[10px] font-bold uppercase transition border ${
                      config.playMode === mode
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {mode === 'pingpong' ? 'PING-PONG' : mode === 'loop' ? 'LOOP' : 'ONCE'}
                  </button>
                ))}
              </div>
            </div>

            {/* Play Speed Slider */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase">
                <span className="text-gray-400">VELOCITY SPEED</span>
                <span className="font-bold text-[#00F0FF]">{config.playSpeed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.playSpeed}
                onChange={(e) => onChangeConfig({ playSpeed: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
            </div>

            {/* 04. Morph Easing Acceleration Curve */}
            <div className="bg-[#1A1A1E] border border-[#FFE600]/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#FFE600] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
                  <span>04. 가속도 이징 곡선 (EASING)</span>
                </h3>
                <span className="text-[9px] font-mono text-[#FFE600] px-1.5 py-0.5 bg-[#FFE600]/10 border border-[#FFE600]/30">
                  {(config.morphEasing || 'ease-in-out').toUpperCase()}
                </span>
              </div>

              <p className="text-[9px] text-gray-400 leading-relaxed">
                출발지에서 각 경유지(Waypoint) 및 도착지 정점으로 도달할 때의 파티클 가감속 물리 곡선을 설정합니다.
              </p>

              <div className="grid grid-cols-2 gap-1.5">
                {EASING_OPTIONS.map((easing) => {
                  const isSelected = (config.morphEasing || 'ease-in-out') === easing.id;
                  return (
                    <button
                      key={`panel-easing-${easing.id}`}
                      onClick={() => onChangeConfig({ morphEasing: easing.id })}
                      className={`p-2 border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#FFE600] bg-[#FFE600]/15 shadow-[0_0_8px_rgba(255,230,0,0.2)]'
                          : 'border-[#2A2A2E] bg-[#0A0A0C] hover:border-gray-500 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[8px] font-mono uppercase font-bold ${
                            isSelected ? 'text-[#FFE600]' : 'text-gray-500'
                          }`}>
                            {easing.badge}
                          </span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-pulse"></span>
                          )}
                        </div>

                        <div className={`h-6 w-full flex items-center justify-center border mb-1 bg-[#050508] ${
                          isSelected ? 'border-[#FFE600]/40' : 'border-[#1C1C22]'
                        }`}>
                          <svg viewBox="0 0 36 24" className="w-full h-full p-0.5">
                            <line x1="2" y1="22" x2="34" y2="22" stroke="#222228" strokeWidth="0.5" />
                            <line x1="2" y1="2" x2="34" y2="2" stroke="#222228" strokeWidth="0.5" strokeDasharray="1,1" />
                            <path
                              d={easing.iconSvg}
                              fill="none"
                              stroke={isSelected ? '#FFE600' : '#888899'}
                              strokeWidth={isSelected ? '2.5' : '1.5'}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <div className={`text-[10px] font-bold truncate ${
                          isSelected ? 'text-[#FFE600]' : 'text-gray-200'
                        }`}>
                          {easing.engName}
                        </div>
                      </div>
                      <div className="text-[7.5px] text-gray-500 line-clamp-1 mt-0.5">
                        {easing.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PHYSICS & NOISE ================= */}
        {activeTab === 'physics' && (
          <div className="space-y-6">
            {/* Noise Algorithm Type */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-3">
                01. NOISE SOLVER ALGORITHM
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'curl', name: '3D Curl Noise', desc: 'DIV=0 유체 소용돌이' },
                  { id: 'simplex', name: 'Simplex 3D', desc: '자연스러운 유기적 흩어짐' },
                  { id: 'turbulence', name: 'Turbulence', desc: '고주파 프랙탈 난류' },
                  { id: 'vortex', name: 'Vortex Spin', desc: '회전 와류 중심 왜곡' },
                ].map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onChangeConfig({ noiseType: n.id as NoiseType })}
                    className={`p-2.5 border text-left transition ${
                      config.noiseType === n.id
                        ? 'border-[#00F0FF] bg-[#1A1A1E] text-[#00F0FF]'
                        : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{n.name}</div>
                    <div className="text-[9px] text-gray-500 uppercase">{n.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Turbulence Amp */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase">
                <span className="text-gray-400">TURBULENCE AMPLITUDE</span>
                <span className="font-bold text-[#00F0FF]">{config.noiseAmp.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6.0"
                step="0.05"
                value={config.noiseAmp}
                onChange={(e) => onChangeConfig({ noiseAmp: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
            </div>

            {/* Noise Frequency */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase">
                <span className="text-gray-400">NOISE FREQUENCY</span>
                <span className="font-bold text-[#00F0FF]">{config.noiseFreq.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={config.noiseFreq}
                onChange={(e) => onChangeConfig({ noiseFreq: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
            </div>

            {/* Noise Evolution Speed */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase">
                <span className="text-gray-400">EVOLUTION SPEED</span>
                <span className="font-bold text-[#00F0FF]">{config.noiseSpeed.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={config.noiseSpeed}
                onChange={(e) => onChangeConfig({ noiseSpeed: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
            </div>

            {/* Delay / Stagger Mode */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-3">
                02. STAGGER DELAY MATRIX
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'random', name: 'RANDOM STAGGER' },
                  { id: 'linear_y', name: 'Y-RAMP (VERTICAL)' },
                  { id: 'linear_x', name: 'X-RAMP (HORIZONTAL)' },
                  { id: 'radial', name: 'RADIAL SPREAD' },
                  { id: 'brightness', name: 'LUMINANCE MASK' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onChangeConfig({ delayMode: d.id as DelayMode })}
                    className={`p-2 border text-left transition font-bold text-[10px] uppercase truncate ${
                      config.delayMode === d.id
                        ? 'border-[#00F0FF] bg-[#1A1A1E] text-[#00F0FF]'
                        : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stagger Delay Spread Slider */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase">
                <span className="text-gray-400">STAGGER DELAY SPREAD</span>
                <span className="font-bold text-[#00F0FF]">{config.delaySpread.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.02"
                value={config.delaySpread}
                onChange={(e) => onChangeConfig({ delaySpread: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
              />
            </div>

            {/* 03. Real-Time Physics Field Debug Overlay */}
            <div className="bg-[#141418] border border-[#00FF66]/40 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
                  <span className="text-[11px] font-bold text-[#00FF66] uppercase">03. 물리 벡터 디버그 오버레이</span>
                </div>
                <button
                  onClick={() => onChangeConfig({ physicsDebugEnabled: !config.physicsDebugEnabled })}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition ${
                    config.physicsDebugEnabled
                      ? 'bg-[#00FF66] text-black border-[#00FF66]'
                      : 'bg-[#0A0A0C] text-gray-400 border-[#3A3A3E]'
                  }`}
                >
                  {config.physicsDebugEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed">
                3D 뷰포트에 실시간 노이즈 와류장(Cyan), 타깃 인력 궤적(Yellow), 중력/블랙홀장(Magenta), 입자 순간 속도(Green) 벡터를 투사합니다.
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <button
                  onClick={() => onChangeConfig({ physicsDebugShowNoise: config.physicsDebugShowNoise === false ? true : false })}
                  className={`p-1.5 border flex items-center justify-between ${
                    config.physicsDebugShowNoise !== false
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                  }`}
                >
                  <span>노이즈 와류장</span>
                  <span className="font-bold">{config.physicsDebugShowNoise !== false ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => onChangeConfig({ physicsDebugShowAttraction: config.physicsDebugShowAttraction === false ? true : false })}
                  className={`p-1.5 border flex items-center justify-between ${
                    config.physicsDebugShowAttraction !== false
                      ? 'bg-[#FFE600]/15 border-[#FFE600] text-[#FFE600]'
                      : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                  }`}
                >
                  <span>타깃 인력선</span>
                  <span className="font-bold">{config.physicsDebugShowAttraction !== false ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => onChangeConfig({ physicsDebugShowGravity: config.physicsDebugShowGravity === false ? true : false })}
                  className={`p-1.5 border flex items-center justify-between ${
                    config.physicsDebugShowGravity !== false
                      ? 'bg-[#FF007F]/15 border-[#FF007F] text-[#FF007F]'
                      : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                  }`}
                >
                  <span>중력/블랙홀</span>
                  <span className="font-bold">{config.physicsDebugShowGravity !== false ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => onChangeConfig({ physicsDebugShowVelocity: config.physicsDebugShowVelocity === false ? true : false })}
                  className={`p-1.5 border flex items-center justify-between ${
                    config.physicsDebugShowVelocity !== false
                      ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66]'
                      : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                  }`}
                >
                  <span>입자 속도선</span>
                  <span className="font-bold">{config.physicsDebugShowVelocity !== false ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: VISUALS, SHAPES & COLOR MIXING ================= */}
        {activeTab === 'visuals' && (
          <div className="space-y-6">
            {/* Quick Open Full Studio Button */}
            {onOpenColorMixer && (
              <button
                onClick={onOpenColorMixer}
                className="w-full py-2.5 bg-[#00F0FF]/10 hover:bg-[#00F0FF] text-[#00F0FF] hover:text-black border border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.15)]"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>파티클 & 색혼합 전체 실험실 열기</span>
              </button>
            )}

            {/* 01. Particle Type (Shape) Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  01. 파티클 외형 종류 (SHAPE)
                </h3>
                <span className="text-[9px] text-[#00F0FF] uppercase font-mono bg-[#1A1A1E] px-1.5 py-0.5 border border-[#2A2A2E]">
                  {config.particleType.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PARTICLE_SHAPES.map((ps) => {
                  const isSelected = config.particleType === ps.id;
                  return (
                    <button
                      key={ps.id}
                      onClick={() => onChangeConfig({ particleType: ps.id })}
                      className={`p-2 border text-left transition flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-[#00F0FF] bg-[#18181E] text-white shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                          : 'bg-[#141417] border-[#2A2A2E] text-gray-400 hover:border-gray-500 hover:text-gray-200'
                      }`}
                    >
                      <div className={`p-1 border ${isSelected ? 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10' : 'border-[#2A2A2E] text-gray-500'}`}>
                        {ps.icon}
                      </div>
                      <span className="text-[10px] font-bold truncate">{ps.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 02. Color Mixing Modes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <Palette className="w-3.5 h-3.5" />
                  02. 색혼합 방식 (COLOR MIXING)
                </h3>
                <span className="text-[9px] text-gray-400 uppercase font-mono bg-[#1A1A1E] px-1.5 py-0.5 border border-[#2A2A2E]">
                  {config.colorMixMode.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'interpolate', name: '자연 형상 보간', tag: 'Src➔Dst' },
                  { id: 'gradient', name: '3단 컬러 램프', tag: '3-Stop' },
                  { id: 'velocity', name: '운동속도 변색', tag: 'Kinetic' },
                  { id: 'height', name: '수직 고도 램프', tag: 'Y-Axis' },
                  { id: 'radial', name: '방사형 스펙트럼', tag: 'Radial' },
                  { id: 'additive_mix', name: '가산 광원 혼합', tag: 'Additive' },
                ].map((m) => {
                  const isSelected = config.colorMixMode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => onChangeConfig({ colorMixMode: m.id as ColorMixMode })}
                      className={`p-2 border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#00F0FF] bg-[#18181E] text-white shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                          : 'bg-[#141417] border-[#2A2A2E] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-[10px] font-bold truncate">{m.name}</span>
                      <span className="text-[8px] text-[#00F0FF] font-mono">{m.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03. 3-Color Swatches & Live Gradient */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3 space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-300">
                <span>3단 광원 팔레트 (RGB RAMP)</span>
                <span className="text-[#00F0FF]">LIVE</span>
              </div>

              {/* Gradient Preview Bar */}
              <div
                className="w-full h-3 border border-[#2A2A2E]"
                style={{
                  background: `linear-gradient(90deg, ${config.colorA || '#00F0FF'} 0%, ${config.colorB || '#FF007F'} 50%, ${config.colorC || '#FFE600'} 100%)`,
                }}
              />

              {/* 3 Color Pickers in a row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase mb-1">Color A (베이스)</div>
                  <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 border border-[#2A2A2E]">
                    <input
                      type="color"
                      value={config.colorA || '#00f0ff'}
                      onChange={(e) => onChangeConfig({ colorA: e.target.value })}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorA || '#00f0ff'}
                      onChange={(e) => onChangeConfig({ colorA: e.target.value })}
                      className="w-full bg-transparent text-[9px] text-white uppercase font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase mb-1">Color B (미드)</div>
                  <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 border border-[#2A2A2E]">
                    <input
                      type="color"
                      value={config.colorB || '#ff007f'}
                      onChange={(e) => onChangeConfig({ colorB: e.target.value })}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorB || '#ff007f'}
                      onChange={(e) => onChangeConfig({ colorB: e.target.value })}
                      className="w-full bg-transparent text-[9px] text-white uppercase font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase mb-1">Color C (피크)</div>
                  <div className="flex items-center gap-1 bg-[#0A0A0B] p-1 border border-[#2A2A2E]">
                    <input
                      type="color"
                      value={config.colorC || '#ffe600'}
                      onChange={(e) => onChangeConfig({ colorC: e.target.value })}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.colorC || '#ffe600'}
                      onChange={(e) => onChangeConfig({ colorC: e.target.value })}
                      className="w-full bg-transparent text-[9px] text-white uppercase font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 04. Particle Density Block */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-[10px] text-gray-400 uppercase font-bold">
                  03. PARTICLE DENSITY
                </span>
                <span className="text-sm font-bold text-[#00F0FF]">
                  {(config.particleCount / 1000).toFixed(0)}K POINTS
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[15000, 30000, 60000, 100000].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => onChangeConfig({ particleCount: cnt })}
                    className={`py-1.5 border font-bold text-[10px] uppercase transition cursor-pointer ${
                      config.particleCount === cnt
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#0A0A0B] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {(cnt / 1000)}K
                  </button>
                ))}
              </div>
            </div>

            {/* 05. Particle Point Size & Glow */}
            <div className="bg-[#1A1A1E] border border-[#2A2A2E] p-3 space-y-3">
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">POINT RADIUS (크기)</span>
                  <span className="font-bold text-[#00F0FF]">{config.pointSize.toFixed(1)}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.2"
                  value={config.pointSize}
                  onChange={(e) => onChangeConfig({ pointSize: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">EMISSION GLOW (발광)</span>
                  <span className="font-bold text-[#00F0FF]">{config.glowIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.5"
                  step="0.1"
                  value={config.glowIntensity}
                  onChange={(e) => onChangeConfig({ glowIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>

              {/* Velocity Color Shift */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">KINETIC VELOCITY SHIFT</span>
                  <span className="font-bold text-[#00F0FF]">{(config.velocityColorShift ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.1"
                  value={config.velocityColorShift ?? 1.0}
                  onChange={(e) => onChangeConfig({ velocityColorShift: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* 06. Preset Color Themes */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-2 font-bold">
                04. PRESET COLOR THEMES
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'original', name: 'ORIGINAL RGB' },
                  { id: 'cyberpunk', name: 'CYBERPUNK NEON' },
                  { id: 'fire', name: 'SOLAR FLARE' },
                  { id: 'galaxy', name: 'COSMIC VOID' },
                  { id: 'emerald', name: 'EMERALD MATRIX' },
                  { id: 'sunset', name: 'SUNSET CORAL' },
                ].map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onChangeConfig({ colorScheme: theme.id as any })}
                    className={`p-2 border text-left font-bold text-[9px] uppercase transition truncate cursor-pointer ${
                      config.colorScheme === theme.id
                        ? 'border-[#00F0FF] bg-[#1A1A1E] text-[#00F0FF]'
                        : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 07. Blending Mode */}
            <div>
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest mb-2 font-bold">
                05. BLENDING RASTER
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                {(['additive', 'screen', 'normal'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => onChangeConfig({ blending: b })}
                    className={`py-1.5 border font-bold text-[9px] uppercase transition cursor-pointer ${
                      config.blending === b
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#1A1A1E] border-[#3A3A3E] text-gray-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* 06. Motion Trails & Dynamic Motion Blur */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" />
                  06. 모션 블러 & 고스트 궤적 (MOTION BLUR)
                </h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 border uppercase ${
                  (config.motionBlurIntensity ?? 1.0) > 0.05 || config.trailsEnabled
                    ? 'text-[#00FF66] border-[#00FF66] bg-[#00FF66]/10' 
                    : 'text-gray-500 border-[#2A2A2E] bg-[#0A0A0B]'
                }`}>
                  {(config.motionBlurIntensity ?? 1.0) > 0.05 ? `${(config.motionBlurIntensity ?? 1.0).toFixed(1)}x BLUR` : 'OFF'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeConfig({ trailsEnabled: !config.trailsEnabled })}
                  className={`py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    config.trailsEnabled
                      ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>{config.trailsEnabled ? '고스트 궤적 ON' : '고스트 궤적 OFF'}</span>
                </button>

                <button
                  onClick={() => {
                    const nextInt = (config.motionBlurIntensity ?? 1.0) > 0.1 ? 0.0 : 1.2;
                    onChangeConfig({ motionBlurIntensity: nextInt, trailsEnabled: nextInt > 0 });
                  }}
                  className={`py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    (config.motionBlurIntensity ?? 1.0) > 0.05
                      ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                      : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>{(config.motionBlurIntensity ?? 1.0) > 0.05 ? '모션 블러 ON' : '모션 블러 OFF'}</span>
                </button>
              </div>

              <p className="text-[9px] text-gray-400 leading-relaxed">
                입자가 고속 몰핑 및 와류를 통과할 때 트레일 투명도(Alpha)와 지속 길이(Length)를 동적으로 스케일링하여 부드러운 속도감과 시네마틱 잔상을 형성합니다.
              </p>

              {/* Motion Blur Intensity Slider */}
              <div className="bg-[#0A0A0E] border border-[#00FF66]/30 p-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase">
                  <span className="text-[#00FF66] font-bold flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    모션 블러 강도 (MOTION BLUR INTENSITY)
                  </span>
                  <span className="font-bold text-[#00FF66]">
                    {(config.motionBlurIntensity ?? 1.0).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.05"
                  value={config.motionBlurIntensity ?? 1.0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig({ motionBlurIntensity: val, trailsEnabled: val > 0.05 });
                  }}
                  className="w-full h-1.5 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00FF66]"
                />
                <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                  <span>0.0x (선명)</span>
                  <span>1.0x (표준)</span>
                  <span>2.0x (시네마틱)</span>
                  <span>3.0x (하이퍼)</span>
                </div>
              </div>

              {/* Trail Length / Persistence Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">기본 궤적 지속 길이 (BASE PERSISTENCE)</span>
                  <span className="font-bold text-[#00F0FF]">{((config.trailLength ?? 0.85) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.98"
                  step="0.02"
                  value={config.trailLength ?? 0.85}
                  onChange={(e) => onChangeConfig({ trailLength: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Quick Blur & Trail Presets */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: 'OFF', blur: 0.0, len: 0.50, desc: '선명' },
                  { label: '부드러움', blur: 0.6, len: 0.75, desc: '0.6x' },
                  { label: '시네마틱', blur: 1.3, len: 0.88, desc: '1.3x' },
                  { label: '스트릭', blur: 2.4, len: 0.96, desc: '2.4x' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChangeConfig({ 
                      trailsEnabled: preset.blur > 0.05, 
                      motionBlurIntensity: preset.blur,
                      trailLength: preset.len 
                    })}
                    className="p-1.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00FF66] text-center transition cursor-pointer"
                  >
                    <div className="text-[9px] font-bold text-gray-200">{preset.label}</div>
                    <div className="text-[8px] text-[#00FF66] font-mono">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 07. 블룸 & 후처리 광원 (BLOOM / POST-PROCESSING) */}
            <div className="bg-[#141417] border border-[#FF007F]/40 p-3.5 space-y-3.5 shadow-[0_0_15px_rgba(255,0,127,0.12)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#FF007F] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#FF007F]" />
                  07. 블룸 & 후처리 광원 (BLOOM / POST-PROCESSING)
                </h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 border uppercase ${
                  config.bloomEnabled !== false
                    ? 'text-[#FF007F] border-[#FF007F] bg-[#FF007F]/10 font-bold shadow-[0_0_8px_rgba(255,0,127,0.3)]' 
                    : 'text-gray-500 border-[#2A2A2E] bg-[#0A0A0B]'
                }`}>
                  {config.bloomEnabled !== false ? `BLOOM ON [B] ${(config.bloomStrength ?? 1.2).toFixed(1)}x` : 'OFF'}
                </span>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed">
                Three.js UnrealBloomPass와 ACES Filmic 톤 매핑을 결합하여 고발광 파티클의 시네마틱 네온 광휘 및 헤일로(Halo) 아우라를 연출합니다.
              </p>

              {/* Master Bloom Toggle */}
              <button
                onClick={() => onChangeConfig({ bloomEnabled: config.bloomEnabled === false ? true : false })}
                className={`w-full py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition cursor-pointer ${
                  config.bloomEnabled !== false
                    ? 'bg-[#FF007F] text-black border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.4)]'
                    : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{config.bloomEnabled !== false ? '블룸 광원 활성 (BLOOM ACTIVE - 단축키: B)' : '블룸 광원 활성화 (ENABLE POST-PROCESSING BLOOM)'}</span>
              </button>

              {/* 1. Bloom Strength Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-300 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-[#FF007F]" />
                    블룸 광원 방사 강도 (BLOOM RADIANCE STRENGTH)
                  </span>
                  <span className="font-bold text-[#FF007F] font-mono">
                    {(config.bloomStrength ?? 1.2).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.5"
                  step="0.05"
                  value={config.bloomStrength ?? 1.2}
                  onChange={(e) => onChangeConfig({ bloomStrength: parseFloat(e.target.value), bloomEnabled: true })}
                  className="w-full h-1.5 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                />
                <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                  <span>0.0x (꺼짐)</span>
                  <span>0.8x (은은함)</span>
                  <span>1.5x (시네마틱)</span>
                  <span>3.5x (초발광)</span>
                </div>
              </div>

              {/* 2. Bloom Blur Dispersion Radius */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">빛 확산 반경 (BLOOM RADIUS)</span>
                  <span className="font-bold text-[#00F0FF] font-mono">
                    {(config.bloomRadius ?? 0.6).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={config.bloomRadius ?? 0.6}
                  onChange={(e) => onChangeConfig({ bloomRadius: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* 3. Luminance Threshold Cutoff */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">휘도 임계값 컷오프 (LUMINANCE THRESHOLD)</span>
                  <span className="font-bold text-[#FFE600] font-mono">
                    {(config.bloomThreshold ?? 0.15).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={config.bloomThreshold ?? 0.15}
                  onChange={(e) => onChangeConfig({ bloomThreshold: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FFE600]"
                />
                <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                  <span>0.00 (모든 입자 반응)</span>
                  <span>0.15 (표준)</span>
                  <span>1.00 (극초고휘도만)</span>
                </div>
              </div>

              {/* 4. Tone Mapping Exposure */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">ACES Filmic 노출 보정 (EXPOSURE)</span>
                  <span className="font-bold text-[#00FF66] font-mono">
                    {(config.bloomToneMappingExposure ?? 1.0).toFixed(2)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={config.bloomToneMappingExposure ?? 1.0}
                  onChange={(e) => onChangeConfig({ bloomToneMappingExposure: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00FF66]"
                />
              </div>

              {/* Quick Bloom Presets */}
              <div className="space-y-1.5 pt-1 border-t border-[#222228]">
                <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase">
                  <span>⚡ 원클릭 블룸 무드 프리셋</span>
                  <span className="text-[#FF007F]">POST-FX</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { label: '은은한 글로우', strength: 0.7, radius: 0.4, threshold: 0.25, exposure: 0.95, desc: 'Soft Glow' },
                    { label: '시네마틱 네온', strength: 1.2, radius: 0.6, threshold: 0.15, exposure: 1.0, desc: 'Default' },
                    { label: '하이퍼 볼텍스', strength: 2.0, radius: 0.85, threshold: 0.08, exposure: 1.15, desc: 'Cyberpunk' },
                    { label: '스타버스트 광휘', strength: 3.0, radius: 1.2, threshold: 0.04, exposure: 1.25, desc: 'Supernova' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => onChangeConfig({
                        bloomEnabled: true,
                        bloomStrength: preset.strength,
                        bloomRadius: preset.radius,
                        bloomThreshold: preset.threshold,
                        bloomToneMappingExposure: preset.exposure,
                      })}
                      className="p-1.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#FF007F] text-center transition cursor-pointer group"
                    >
                      <div className="text-[9px] font-bold text-gray-200 group-hover:text-[#FF007F]">{preset.label}</div>
                      <div className="text-[8px] text-[#FF007F]/80 font-mono">{preset.desc} ({preset.strength}x)</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 08. 캔버스 배경색 지정 (Background Color) */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  08. 캔버스 배경색 (BACKGROUND COLOR)
                </h3>
                <span className="text-[9px] font-mono text-[#00F0FF]">
                  {config.backgroundColor || '#030712'}
                </span>
              </div>
              <p className="text-[9px] text-gray-400">
                다운로드되는 HTML 파일 및 3D 뷰포트의 배경색을 지정합니다.
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { color: '#030712', label: '딥 스페이스' },
                  { color: '#000000', label: '순수 블랙' },
                  { color: '#0A0A0B', label: '흑요석 다크' },
                  { color: '#0F172A', label: '네이비' },
                  { color: '#18181B', label: '차콜' },
                  { color: '#FFFFFF', label: '화이트' },
                  { color: '#F1F5F9', label: '클린 라이트' },
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => onChangeConfig({ backgroundColor: item.color })}
                    className={`w-7 h-7 rounded border transition cursor-pointer ${
                      (config.backgroundColor || '#030712').toLowerCase() === item.color.toLowerCase()
                        ? 'border-[#00F0FF] scale-110 shadow-[0_0_10px_#00F0FF]'
                        : 'border-[#2A2A2E] hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={`${item.label} (${item.color})`}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="color"
                    value={config.backgroundColor || '#030712'}
                    onChange={(e) => onChangeConfig({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded bg-transparent cursor-pointer border border-[#2A2A2E]"
                    title="직접 색상 선택"
                  />
                </div>
              </div>
            </div>

            {/* 09. 3D 형상 정렬 기준 좌표 그리드 (Visual 3D Coordinate Grid) */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-[#00F0FF]" />
                  09. 3D 정밀 좌표 그리드 (ALIGN GRID)
                </h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 border uppercase ${
                  config.gridOverlayEnabled
                    ? 'text-[#00F0FF] border-[#00F0FF] bg-[#00F0FF]/10 font-bold' 
                    : 'text-gray-500 border-[#2A2A2E] bg-[#0A0A0B]'
                }`}>
                  {config.gridOverlayEnabled ? 'GRID ON [G]' : 'OFF'}
                </span>
              </div>
              <p className="text-[9px] text-gray-400">
                커스텀 텍스트 및 로고 정렬을 위한 3D 공간 기준 평면 및 XYZ 좌표축을 표시합니다.
              </p>

              <button
                onClick={() => onChangeConfig({ gridOverlayEnabled: !config.gridOverlayEnabled })}
                className={`w-full py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  config.gridOverlayEnabled
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{config.gridOverlayEnabled ? '3D 좌표 그리드 해제' : '3D 좌표 그리드 활성화 (단축키: G)'}</span>
              </button>

              {config.gridOverlayEnabled && (
                <div className="space-y-2 pt-2 border-t border-[#222228] animate-in fade-in">
                  <div className="text-[9px] text-gray-400 font-bold uppercase">기준 평면 선택</div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['xz', 'xy', 'yz', 'all'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => onChangeConfig({ gridOverlayPlane: p })}
                        className={`py-1 text-[9px] font-bold uppercase border transition cursor-pointer ${
                          (config.gridOverlayPlane || 'xz') === p
                            ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                            : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
                        }`}
                      >
                        {p === 'xz' ? 'XZ 바닥' : p === 'xy' ? 'XY 정면' : p === 'yz' ? 'YZ 측면' : '3D 전체'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[9px]">
                    <span className="text-gray-400">XYZ 축 화살표 표시</span>
                    <button
                      onClick={() => onChangeConfig({ gridOverlayShowAxes: !(config.gridOverlayShowAxes ?? true) })}
                      className={`px-2 py-0.5 font-bold border cursor-pointer ${
                        (config.gridOverlayShowAxes ?? true)
                          ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]'
                          : 'bg-[#1A1A1E] text-gray-500 border-[#2A2A2E]'
                      }`}
                    >
                      {(config.gridOverlayShowAxes ?? true) ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 10. HTML 자립형 파일 내보내기 (Export HTML Options) */}
            <div className="bg-[#141417] border border-[#00F0FF]/40 p-3.5 space-y-2.5 shadow-[0_0_15px_rgba(0,240,255,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  10. HTML 파일 다운로드 & 내보내기
                </h3>
                <span className="text-[8px] bg-[#00F0FF] text-black font-bold px-1.5 py-0.5 uppercase">
                  STANDALONE
                </span>
              </div>
              <p className="text-[9px] text-gray-400 leading-relaxed">
                설정한 배경색이 적용된 웹 브라우저 단독 실행 HTML 파일을 다운로드합니다.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onExportHtml}
                  className="p-2 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-[#00F0FF] hover:text-[#00F0FF] text-white transition cursor-pointer text-left"
                  title="전체 컨트롤러, 슬라이더, 배경색 변경기가 포함된 풀 스튜디오 HTML 다운로드"
                >
                  <div className="font-bold text-[10px] flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>풀 스튜디오 HTML</span>
                  </div>
                  <div className="text-[8px] text-gray-400">슬라이더/HUD 포함</div>
                </button>

                <button
                  onClick={onExportPureHtml}
                  className="p-2 bg-[#00F0FF]/15 border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] transition cursor-pointer text-left shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                  title="UI 없이 순수 3D 파티클 장면만 단독 실행되는 깔끔한 HTML 파일 다운로드"
                >
                  <div className="font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>순수 파티클 HTML</span>
                  </div>
                  <div className="text-[8px] opacity-80">순수 3D 장면 (UI 제거)</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: AUDIO REACTIVE, BLACK HOLE & 3D POINT EXPORT (13~16P) ================= */}
        {activeTab === 'fx_audio' && (
          <div className="space-y-6">
            {/* Quick Manual Banner */}
            <div className="bg-[#1A1A22] border border-[#FF007F]/50 p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF007F] flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-white font-bold uppercase">공식 설명서 13P ~ 16P 신기능</div>
                  <div className="text-[8px] text-gray-400">오디오 비주얼라이저 · 블랙홀 · 3D PLY/OBJ 내보내기</div>
                </div>
              </div>
              <button
                onClick={() => onOpenTheoryModal?.(13)}
                className="px-2 py-1 bg-[#FF007F] hover:bg-[#FF007F]/80 text-white font-bold text-[9px] uppercase transition cursor-pointer flex items-center gap-1"
              >
                <span>설명서 보기</span>
              </button>
            </div>

            {/* 01. AUDIO REACTIVE ENGINE (Page 14) */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#FF007F] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  01. 오디오 반응형 비주얼라이저 (PAGE 14)
                </h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 border uppercase ${
                  config.audioReactiveEnabled 
                    ? 'text-[#FF007F] border-[#FF007F] bg-[#FF007F]/10' 
                    : 'text-gray-500 border-[#2A2A2E] bg-[#0A0A0B]'
                }`}>
                  {config.audioReactiveEnabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>

              {/* Master Audio Toggle */}
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
                className={`w-full py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition cursor-pointer ${
                  config.audioReactiveEnabled
                    ? 'bg-[#FF007F] text-white border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.4)]'
                    : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>{config.audioReactiveEnabled ? '오디오 반응형 켜짐 (AUDIO ON)' : '오디오 반응 활성화 (ENABLE AUDIO)'}</span>
              </button>

              {/* Audio Source Modes */}
              <div>
                <span className="text-[10px] text-gray-400 uppercase block mb-1.5">오디오 소스 선택 (AUDIO SOURCE)</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'synth', label: '내장 EDM 신스', desc: '자동 비트' },
                    { id: 'mic', label: '실시간 마이크', desc: '음성/스피커' },
                    { id: 'file', label: '음악 파일 로드', desc: 'MP3/WAV' },
                  ].map((src) => (
                    <button
                      key={src.id}
                      onClick={async () => {
                        onChangeConfig({ audioSourceType: src.id as any });
                        if (src.id === 'file') {
                          audioFileRef.current?.click();
                        } else {
                          await audioEngine.init(src.id as any);
                          onChangeConfig({ audioReactiveEnabled: true });
                        }
                      }}
                      className={`p-1.5 border text-center transition cursor-pointer ${
                        config.audioSourceType === src.id
                          ? 'border-[#FF007F] bg-[#FF007F]/15 text-[#FF007F] font-bold'
                          : 'border-[#2A2A2E] bg-[#0A0A0B] text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[9px] font-bold">{src.label}</div>
                      <div className="text-[8px] opacity-70 font-mono">{src.desc}</div>
                    </button>
                  ))}
                </div>
                <input
                  type="file"
                  ref={audioFileRef}
                  onChange={handleAudioFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                {audioFileInput && (
                  <div className="mt-1 text-[9px] text-[#FF007F] font-mono truncate">
                    선택된 파일: {audioFileInput}
                  </div>
                )}
              </div>

              {/* Audio Sensitivity Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">오디오 감도 (SENSITIVITY)</span>
                  <span className="font-bold text-[#FF007F]">{(config.audioSensitivity ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={config.audioSensitivity ?? 1.0}
                  onChange={(e) => onChangeConfig({ audioSensitivity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                />
              </div>

              {/* Bass Kick Scale */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">저음 킥 팽창 (BASS KICK PULSE)</span>
                  <span className="font-bold text-[#FF007F]">{(config.audioBassScale ?? 1.5).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="4.0"
                  step="0.1"
                  value={config.audioBassScale ?? 1.5}
                  onChange={(e) => onChangeConfig({ audioBassScale: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                />
              </div>

              {/* Treble Glitter */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">고음 반짝임 (TREBLE GLITTER)</span>
                  <span className="font-bold text-[#FF007F]">{(config.audioTrebleGlitter ?? 1.2).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                  value={config.audioTrebleGlitter ?? 1.2}
                  onChange={(e) => onChangeConfig({ audioTrebleGlitter: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                />
              </div>
            </div>

            {/* 02. BLACK HOLE SINGULARITY (Page 15) */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] text-[#FFE600] uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  02. 블랙홀 특이점 포스 필드 (PAGE 15)
                </h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 border uppercase ${
                  config.blackHoleEnabled 
                    ? 'text-[#FFE600] border-[#FFE600] bg-[#FFE600]/10' 
                    : 'text-gray-500 border-[#2A2A2E] bg-[#0A0A0B]'
                }`}>
                  {config.blackHoleEnabled ? 'ACTIVE' : 'OFF'}
                </span>
              </div>

              {/* Black Hole Master Toggle */}
              <button
                onClick={() => onChangeConfig({ blackHoleEnabled: !config.blackHoleEnabled })}
                className={`w-full py-2 border font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition cursor-pointer ${
                  config.blackHoleEnabled
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.4)]'
                    : 'bg-[#1A1A1E] text-gray-300 border-[#2A2A2E] hover:border-gray-500'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{config.blackHoleEnabled ? '블랙홀 활성 (BLACK HOLE ON)' : '블랙홀 특이점 생성 (ENABLE SINK)'}</span>
              </button>

              {/* Mass Strength */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">특이점 질량 / 인력 (MASS PULL)</span>
                  <span className="font-bold text-[#FFE600]">{(config.blackHoleMass ?? 3.0).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={config.blackHoleMass ?? 3.0}
                  onChange={(e) => onChangeConfig({ blackHoleMass: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FFE600]"
                />
              </div>

              {/* Event Horizon Radius */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">사건의 지평선 반경 (HORIZON RADIUS)</span>
                  <span className="font-bold text-[#FFE600]">{(config.blackHoleRadius ?? 7.0).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={config.blackHoleRadius ?? 7.0}
                  onChange={(e) => onChangeConfig({ blackHoleRadius: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FFE600]"
                />
              </div>
            </div>

            {/* 03. CINEMATIC GLITCH & 3D POINT CLOUD EXPORT (Page 16) */}
            <div className="bg-[#141417] border border-[#2A2A2E] p-3.5 space-y-3">
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                03. 3D 포인트 클라우드 & FX (PAGE 16)
              </h3>

              {/* Glitch Intensity Slider */}
              <div>
                <div className="flex justify-between items-center text-[10px] uppercase mb-1">
                  <span className="text-gray-400">디지털 글리치 왜곡 (GLITCH JITTER)</span>
                  <span className="font-bold text-[#00F0FF]">{(config.glitchIntensity ?? 0.0).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={config.glitchIntensity ?? 0.0}
                  onChange={(e) => onChangeConfig({ glitchIntensity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                />
              </div>

              {/* Point Cloud Exporters */}
              <div className="space-y-2 pt-1 border-t border-[#2A2A2E]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase">3D 포인트 클라우드 & CNC</span>
                  <button
                    onClick={onOpenGCodeModal}
                    className="px-1.5 py-0.5 bg-[#00F0FF] text-black font-bold text-[8px] uppercase cursor-pointer"
                  >
                    ⚡ CNC G-Code
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={onOpenGCodeModal}
                    className="p-1.5 bg-[#0A0A0B] border border-[#00F0FF] hover:bg-[#00F0FF]/20 text-[#00F0FF] transition cursor-pointer text-left"
                    title="CNC 레이저 각인기 / 3D 프린터용 G-Code 스튜디오 열기"
                  >
                    <div className="font-bold text-[9px] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#00F0FF]" />
                      <span>.GCODE / .NC</span>
                    </div>
                    <div className="text-[7px] text-gray-400">CNC 레이저 / 3D프린터</div>
                  </button>

                  <button
                    onClick={handleExportPointsXYZ}
                    className="p-1.5 bg-[#0A0A0B] border border-[#FFE600]/60 hover:border-[#FFE600] hover:bg-[#FFE600]/15 text-[#FFE600] transition cursor-pointer text-left"
                    title="MeshLab / CloudCompare / CAD 슬라이서용 XYZ 포인트 클라우드"
                  >
                    <div className="font-bold text-[9px] flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-[#FFE600]" />
                      <span>.XYZ 내보내기</span>
                    </div>
                    <div className="text-[7px] text-gray-400">MeshLab / CAD</div>
                  </button>

                  <button
                    onClick={handleExportPointsPLY}
                    className="p-1.5 bg-[#0A0A0B] border border-[#00F0FF]/40 hover:border-[#00F0FF] hover:bg-[#00F0FF]/15 text-gray-300 hover:text-white transition cursor-pointer text-left"
                    title="Blender / Houdini 용 Stanford PLY 포인트 클라우드 (버텍스 컬러 포함)"
                  >
                    <div className="font-bold text-[9px] flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>.PLY 내보내기</span>
                    </div>
                    <div className="text-[7px] text-gray-400">Blender / Houdini</div>
                  </button>

                  <button
                    onClick={handleExportPointsOBJ}
                    className="p-1.5 bg-[#0A0A0B] border border-[#FF007F]/40 hover:border-[#FF007F] hover:bg-[#FF007F]/15 text-gray-300 hover:text-[#FF007F] transition cursor-pointer text-left"
                    title="Unreal Engine Niagara / Maya 용 Wavefront OBJ 포인트 클라우드"
                  >
                    <div className="font-bold text-[9px] flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>.OBJ 내보내기</span>
                    </div>
                    <div className="text-[7px] text-gray-400">Unreal / Maya</div>
                  </button>
                </div>
              </div>
            </div>

            {/* 04. STANDALONE DOWNLOADS (HTML & WINDOWS CMD & CNC) */}
            <div className="bg-[#141417] border border-[#00F0FF]/40 p-3.5 space-y-3">
              <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                04. 단독실행형 & 기계 가공 다운로드
              </h3>
              <div className="space-y-2">
                {/* 60FPS Video Capture Button */}
                {onOpenVideoModal && (
                  <button
                    onClick={onOpenVideoModal}
                    className="w-full p-2.5 bg-red-950/40 hover:bg-red-600 hover:text-white text-red-300 border border-red-500/50 hover:border-red-500 font-bold text-[10px] uppercase flex items-center justify-between transition shadow-[0_0_12px_rgba(239,68,68,0.25)] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-red-400" />
                      <span>🎥 60FPS 비디오 녹화기 (WebM / MP4)</span>
                    </div>
                    <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 font-bold">● REC</span>
                  </button>
                )}

                <button
                  onClick={onExportHtml}
                  className="w-full p-2 bg-[#00F0FF] hover:bg-white text-black font-bold text-[10px] uppercase flex items-center justify-between transition shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>풀 스튜디오 HTML 내보내기</span>
                  </div>
                  <span className="text-[8px] bg-black text-[#00F0FF] px-1 py-0.5 font-bold">FULL UI</span>
                </button>

                <button
                  onClick={onExportPureHtml}
                  className="w-full p-2 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] font-bold text-[10px] uppercase flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ 순수 파티클 HTML 내보내기</span>
                  </div>
                  <span className="text-[8px] bg-[#00F0FF] text-black px-1 py-0.5 font-bold">NO UI</span>
                </button>

                <button
                  onClick={onExportPureCmd}
                  className="w-full p-2 bg-[#FFE600]/15 hover:bg-[#FFE600] hover:text-black text-[#FFE600] border border-[#FFE600] font-bold text-[10px] uppercase flex items-center justify-between transition cursor-pointer shadow-[0_0_8px_rgba(255,230,0,0.2)]"
                  title="더블클릭 시 오프라인에서 브라우저를 띄워 순수 파티클 3D 뷰어를 즉시 실행하는 윈도우 실행 파일 (.cmd)"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
                    <span>⚡ 순수 파티클 CMD 내보내기 (.cmd)</span>
                  </div>
                  <span className="text-[8px] bg-[#FFE600] text-black px-1 py-0.5 font-bold">WIN CMD</span>
                </button>

                <button
                  onClick={onOpenGCodeModal}
                  className="w-full p-2 bg-[#00F0FF]/10 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF]/60 font-bold text-[10px] uppercase flex items-center justify-between transition cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.15)]"
                  title="CNC 레이저 각인기 및 3D 프린터용 G-Code/XYZ 포인트 클라우드 내보내기"
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>⚡ CNC 레이저 & 3D프린터 G-Code</span>
                  </div>
                  <span className="text-[8px] bg-[#00F0FF] text-black px-1 py-0.5 font-bold">CNC / XYZ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: PRESET LIBRARY ================= */}
        {activeTab === 'presets' && (
          <PresetLibraryTab
            config={config}
            onChangeConfig={onChangeConfig}
            sourceShapeId={sourceShapeId}
            targetShapeId={targetShapeId}
            waypointShapeIds={waypointShapeIds}
            shapes={shapes}
            onSelectSource={onSelectSource}
            onSelectTarget={onSelectTarget}
            onAddWaypoint={onAddWaypoint}
            onRemoveWaypoint={onRemoveWaypoint}
            onUpdateWaypoint={onUpdateWaypoint}
            onReorderChain={onReorderChain}
            onAddCustomShape={onAddCustomShape}
            onOpenWebHub={onOpenWebHub}
          />
        )}
      </div>

      {/* Bottom Technical Status Bar inside sidebar */}
      <div className="mt-auto p-4 border-t border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-between text-[10px] text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00F0FF] animate-pulse rounded-xs" />
          <span className="font-bold tracking-wider text-gray-200">SYSTEM READY</span>
        </div>
        <span className="text-gray-500">SIMD_VEX_OK</span>
      </div>
    </aside>
  );
};
