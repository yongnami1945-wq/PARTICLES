import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Download, Code2, Globe,
  BookOpen, Cpu, Sparkles, Image as ImageIcon, Zap, Waves, Camera, FileCode2,
  Layers, HardDrive, Palette, Sliders, Music, Radio, ChevronDown, ChevronUp,
  X, ArrowLeftRight, Plus, Eye, Maximize2, Minimize2, Bookmark, Check,
  Circle, Star, Diamond, CircleDot, Hexagon, Square, Cloud, Sun, PanelRightOpen, PanelRightClose,
  Type, Trash2, ArrowRight, CornerDownRight, Wind, Activity, Video,
  Undo2, Redo2, History, Clock
} from 'lucide-react';
import { 
  MorphConfig, MorphShape, PerformanceStats, NoiseType, 
  DelayMode, ParticleType, ColorMixMode, MorphEasing, HistoryItem
} from '../types';
import { audioEngine } from '../utils/audioEngine';
import { exportPointCloudPLY, exportPointCloudOBJ, exportPointCloudXYZ, exportPointCloudCSV } from '../utils/pointCloudExporter';
import { BUILTIN_PRESETS } from '../utils/presetManager';
import { VisualTimelineEditor, EASING_OPTIONS } from './VisualTimelineEditor';
import { isTransparentBackground } from './ParticleCanvas';

export type RibbonTabType = 'shapes' | 'morph' | 'physics' | 'visuals' | 'fx_audio' | 'export' | null;

interface RibbonMenuBarProps {
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
  onSwapShapes: () => void;
  onOpenUpload: () => void;
  onOpenWebHub: () => void;
  onOpenHtmlEditor: () => void;
  onOpenPythonModal: () => void;
  onOpenWasmModal: () => void;
  onOpenTheoryModal: (page?: number) => void;
  onOpenColorMixer: () => void;
  onOpenGCodeModal?: () => void;
  onOpenVideoModal?: () => void;
  onOpenSaveNamedPreset?: () => void;
  onOpenImportNamedPreset?: () => void;
  onCaptureSnapshot: () => void;
  onExportHtml: () => void;
  onExportPureHtml: () => void;
  onExportPureCmd?: () => void;
  fps: number;
  stats?: PerformanceStats;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  // Global State History Stack & Undo / Redo
  canUndo?: boolean;
  canRedo?: boolean;
  undoCount?: number;
  redoCount?: number;
  lastPastDescription?: string;
  nextFutureDescription?: string;
  historyList?: HistoryItem[];
  onUndo?: () => void;
  onRedo?: () => void;
  onClearHistory?: () => void;
}

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

export const RibbonMenuBar: React.FC<RibbonMenuBarProps> = ({
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
  onSwapShapes,
  onOpenUpload,
  onOpenWebHub,
  onOpenHtmlEditor,
  onOpenPythonModal,
  onOpenWasmModal,
  onOpenTheoryModal,
  onOpenColorMixer,
  onOpenGCodeModal,
  onOpenVideoModal,
  onOpenSaveNamedPreset,
  onOpenImportNamedPreset,
  onCaptureSnapshot,
  onExportHtml,
  onExportPureHtml,
  onExportPureCmd,
  fps,
  stats,
  isSidebarOpen,
  onToggleSidebar,
  canUndo = false,
  canRedo = false,
  undoCount = 0,
  redoCount = 0,
  lastPastDescription,
  nextFutureDescription,
  historyList = [],
  onUndo,
  onRedo,
  onClearHistory,
}) => {
  const [activeRibbon, setActiveRibbon] = useState<RibbonTabType>(null);
  const [isHistoryPopoverOpen, setIsHistoryPopoverOpen] = useState<boolean>(false);
  const [audioFileInput, setAudioFileInput] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('HY태고딕 3D');
  const [textTargetSlot, setTextTargetSlot] = useState<'source' | 'target' | 'waypoint'>('waypoint');
  const audioFileRef = useRef<HTMLInputElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const historyPopoverRef = useRef<HTMLDivElement>(null);

  const sourceShape = shapes.find((s) => s.id === sourceShapeId) || shapes[0];
  const targetShape = shapes.find((s) => s.id === targetShapeId) || shapes[1] || shapes[0];

  const handleExecuteTextLoad = (slot: 'source' | 'target' | 'waypoint') => {
    if (!textInput.trim()) return;
    if (onLoadTextShape) {
      onLoadTextShape(textInput.trim(), slot);
    }
  };

  const activeVertices = stats?.vertexCount ?? config.particleCount ?? 60000;
  const fullVerticesStr = activeVertices.toLocaleString();
  const vramMbStr = stats?.gpuMemoryMb ? `~${stats.gpuMemoryMb.toFixed(1)} MB` : '~18.4 MB';
  const vboMbStr = stats?.vboMemoryMb ? `${stats.vboMemoryMb.toFixed(1)} MB` : '3.9 MB';
  const renderBufferMbStr = stats?.renderBufferMemoryMb ? `${stats.renderBufferMemoryMb.toFixed(1)} MB` : '14.5 MB';

  // Toggle ribbon dropdown on tab click
  const handleToggleRibbon = (tab: RibbonTabType) => {
    setActiveRibbon((prev) => (prev === tab ? null : tab));
  };

  // Close ribbon and history popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setActiveRibbon(null);
      }
      if (historyPopoverRef.current && !historyPopoverRef.current.contains(e.target as Node)) {
        setIsHistoryPopoverOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveRibbon(null);
        setIsHistoryPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    const srcPos = sourceShape.positions;
    const dstPos = targetShape.positions;
    const srcCol = sourceShape.colors;
    const dstCol = targetShape.colors;
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
    exportPointCloudPLY(pos, col, `particle_morph_${sourceShape.id}_to_${targetShape.id}_t${Math.floor(t * 100)}.ply`);
  };

  const handleExportPointsOBJ = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const srcPos = sourceShape.positions;
    const dstPos = targetShape.positions;
    const srcCol = sourceShape.colors;
    const dstCol = targetShape.colors;
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
    exportPointCloudOBJ(pos, col, `particle_morph_${sourceShape.id}_to_${targetShape.id}_t${Math.floor(t * 100)}.obj`);
  };

  const handleExportPointsXYZ = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const srcPos = sourceShape.positions;
    const dstPos = targetShape.positions;
    const srcCol = sourceShape.colors;
    const dstCol = targetShape.colors;
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
    exportPointCloudXYZ(pos, col, `particle_morph_${sourceShape.id}_to_${targetShape.id}_t${Math.floor(t * 100)}.xyz`, { includeColors: true, maxPoints: 10000 });
  };

  const handleExportPointsCSV = () => {
    const count = config.particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const srcPos = sourceShape.positions;
    const dstPos = targetShape.positions;
    const srcCol = sourceShape.colors;
    const dstCol = targetShape.colors;
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
    exportPointCloudCSV(pos, col, `particle_morph_${sourceShape.id}_to_${targetShape.id}_t${Math.floor(t * 100)}.csv`, { maxPoints: 10000 });
  };

  return (
    <div ref={ribbonRef} className="relative z-40 bg-[#0F0F12] border-b border-[#2A2A2E] text-[#E0E0E0] font-mono select-none">
      {/* ================= TOP APP BAR ================= */}
      <div className="h-12 px-3 sm:px-5 flex items-center justify-between border-b border-[#1F1F24] bg-[#0A0A0C] gap-3">
        {/* Left: Brand Logo & Current Active Morph Flow */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-[#00F0FF] rounded-xs rotate-45 shadow-[0_0_10px_#00F0FF] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-black -rotate-45" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tighter uppercase text-white">
              Particle Morph 3D
            </span>
          </div>

          {/* Current Stage Morph Route Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#141418] border border-[#2A2A2E] px-2.5 py-1 text-[10px]">
            <span className="text-gray-500 font-bold uppercase">ROUTE:</span>
            <span className="font-bold text-[#00F0FF] max-w-[90px] truncate">{sourceShape.name}</span>
            {(waypointShapeIds || []).length > 0 && (
              <>
                <span className="text-gray-600 font-mono">──▶</span>
                <span className="font-bold text-amber-400">경유 {(waypointShapeIds || []).length}곳</span>
              </>
            )}
            <span className="text-gray-600 font-mono">──▶</span>
            <span className="font-bold text-white max-w-[90px] truncate">{targetShape.name}</span>
          </div>

          {/* Global State History & Undo / Redo Control Cluster */}
          <div className="relative flex items-center bg-[#141418] border border-[#2A2A2E] p-0.5 rounded-xs">
            {/* Undo Button */}
            <button
              onClick={() => onUndo && onUndo()}
              disabled={!canUndo}
              className={`px-2 py-1 text-[11px] font-bold flex items-center gap-1.5 transition rounded-xs cursor-pointer ${
                canUndo
                  ? 'text-[#00F0FF] hover:bg-[#00F0FF]/20 hover:text-white border border-transparent hover:border-[#00F0FF]/40 active:scale-95 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'text-gray-600 cursor-not-allowed opacity-35'
              }`}
              title={
                canUndo
                  ? `실행 취소 (Undo: Ctrl+Z)\n◀ 이전 작업: ${lastPastDescription || '이전 상태'}\n(보관된 스택: ${undoCount}개)`
                  : '실행 취소할 이전 내역이 없습니다 (Ctrl+Z)'
              }
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">실행 취소</span>
              {undoCount > 0 && (
                <span className="text-[9px] px-1 py-0.2 bg-[#00F0FF]/20 text-[#00F0FF] rounded font-mono font-bold">
                  {undoCount}
                </span>
              )}
            </button>

            <div className="w-[1px] h-3.5 bg-[#2A2A2E] mx-0.5" />

            {/* Redo Button */}
            <button
              onClick={() => onRedo && onRedo()}
              disabled={!canRedo}
              className={`px-2 py-1 text-[11px] font-bold flex items-center gap-1.5 transition rounded-xs cursor-pointer ${
                canRedo
                  ? 'text-[#FFE600] hover:bg-[#FFE600]/20 hover:text-white border border-transparent hover:border-[#FFE600]/40 active:scale-95 shadow-[0_0_8px_rgba(255,230,0,0.2)]'
                  : 'text-gray-600 cursor-not-allowed opacity-35'
              }`}
              title={
                canRedo
                  ? `다시 실행 (Redo: Ctrl+Y / Shift+Ctrl+Z)\n▶ 다음 작업: ${nextFutureDescription || '다음 상태'}\n(남은 스택: ${redoCount}개)`
                  : '다시 실행할 내역이 없습니다 (Ctrl+Y)'
              }
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">다시 실행</span>
              {redoCount > 0 && (
                <span className="text-[9px] px-1 py-0.2 bg-[#FFE600]/20 text-[#FFE600] rounded font-mono font-bold">
                  {redoCount}
                </span>
              )}
            </button>

            <div className="w-[1px] h-3.5 bg-[#2A2A2E] mx-0.5" />

            {/* History Stack Dropdown Toggle Button */}
            <button
              onClick={() => setIsHistoryPopoverOpen((prev) => !prev)}
              className={`px-1.5 py-1 text-[10px] flex items-center gap-1 transition rounded-xs cursor-pointer ${
                isHistoryPopoverOpen
                  ? 'bg-[#00F0FF] text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#202028]'
              }`}
              title="스냅샷 히스토리 스택 목록 보기"
            >
              <History className="w-3.5 h-3.5" />
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isHistoryPopoverOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* History Popover Modal / Dropdown */}
            {isHistoryPopoverOpen && (
              <div 
                ref={historyPopoverRef}
                className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-[#121218] border border-[#00F0FF]/50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A2A2E]">
                  <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
                    <History className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>상태 히스토리 스택 (Snapshots)</span>
                  </div>
                  <button
                    onClick={() => setIsHistoryPopoverOpen(false)}
                    className="text-gray-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[10px] text-gray-400 mb-2 flex items-center justify-between">
                  <span>단축키: <strong className="text-[#00F0FF]">Ctrl+Z</strong> / <strong className="text-[#FFE600]">Ctrl+Y</strong></span>
                  <span>보관 스택: <strong className="text-white">{undoCount + redoCount + 1}</strong>개</span>
                </div>

                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 my-1">
                  {historyList.map((item, idx) => {
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-2 border text-[10px] flex items-center justify-between gap-2 transition ${
                          item.isCurrent
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white font-bold'
                            : 'bg-[#0D0D10] border-[#1F1F24] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {item.isCurrent ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                          )}
                          <span className="truncate">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] text-gray-500">
                          {item.isCurrent && (
                            <span className="text-[8px] bg-[#00F0FF] text-black px-1 font-bold">현재</span>
                          )}
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {onClearHistory && (
                  <div className="pt-2 mt-2 border-t border-[#2A2A2E] flex justify-end">
                    <button
                      onClick={() => {
                        onClearHistory();
                        setIsHistoryPopoverOpen(false);
                      }}
                      className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>히스토리 스택 비우기</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Telemetry HUD, Manual & Unified Sidebar Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Hardware Telemetry HUD (VTX / VRAM / FPS) */}
          <div 
            className="flex items-center gap-2 bg-[#141418] border border-[#2A2A2E] px-2.5 py-1 text-[10px] cursor-help"
            title={`[실시간 GPU 텔레메트리]\n• 정점 수(VTX): ${fullVerticesStr}\n• GPU VRAM: ${vramMbStr} (VBO: ${vboMbStr}, 렌더버퍼: ${renderBufferMbStr})\n• 렌더링 속도: ${fps} FPS`}
          >
            <div className="flex items-center gap-1 border-r border-[#2A2A2E] pr-2">
              <Layers className="w-3 h-3 text-[#00F0FF]" />
              <span className="text-[#00F0FF] font-bold">{fullVerticesStr}</span>
              <span className="text-[8px] text-gray-500">vtx</span>
            </div>

            <div className="hidden md:flex items-center gap-1 border-r border-[#2A2A2E] pr-2">
              <HardDrive className="w-3 h-3 text-[#FFE600]" />
              <span className="text-[#FFE600] font-bold">{vramMbStr}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                fps >= 50 ? 'bg-[#22c55e]' : fps >= 30 ? 'bg-[#eab308]' : 'bg-[#ef4444]'
              }`} />
              <strong className="text-white font-bold">{fps}</strong>
              <span className="text-[8px] text-gray-500">FPS</span>
            </div>
          </div>

          {/* Quick Manual button */}
          <button
            onClick={() => onOpenTheoryModal(1)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#141418] hover:bg-[#1F1F26] border border-[#2A2A2E] hover:border-[#00F0FF] text-[10px] text-gray-300 hover:text-[#00F0FF] transition cursor-pointer font-bold"
            title="3D 파티클 몰핑 공식 사용설명서 (19P)"
          >
            <BookOpen className="w-3 h-3 text-[#00F0FF]" />
            <span>사용설명서 (19P)</span>
          </button>

          {/* Unified Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className={`px-2.5 py-1 border text-[11px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
              isSidebarOpen
                ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_10px_#00F0FF]'
                : 'bg-[#141418] border-[#2A2A2E] text-gray-300 hover:text-white hover:border-gray-500'
            }`}
            title={isSidebarOpen ? '사이드바 닫기 (캔버스 전체화면)' : '세부 파라미터 사이드바 열기'}
          >
            {isSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSidebarOpen ? '사이드바 닫기' : '세부설정'}</span>
          </button>
        </div>
      </div>

      {/* ================= 6-CATEGORY RIBBON MENU BAR ================= */}
      <div className="h-10 px-2 sm:px-4 flex items-center justify-between overflow-x-auto custom-scrollbar bg-[#0F0F12] border-b border-[#222228] text-xs">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Menu 1: Shapes & Presets */}
          <button
            onClick={() => handleToggleRibbon('shapes')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'shapes'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                : 'text-gray-300 hover:bg-[#1C1C22] hover:text-white border border-transparent hover:border-[#2A2A2E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>01. 형상 & 프리셋</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'shapes' ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu 2: Morph & Motion */}
          <button
            onClick={() => handleToggleRibbon('morph')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'morph'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                : 'text-gray-300 hover:bg-[#1C1C22] hover:text-white border border-transparent hover:border-[#2A2A2E]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>02. 모핑 & 모션</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'morph' ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu 3: Physics & Forces */}
          <button
            onClick={() => handleToggleRibbon('physics')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'physics'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                : 'text-gray-300 hover:bg-[#1C1C22] hover:text-white border border-transparent hover:border-[#2A2A2E]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>03. 물리 & 중력장</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'physics' ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu 4: Visuals & Shaders */}
          <button
            onClick={() => handleToggleRibbon('visuals')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'visuals'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                : 'text-gray-300 hover:bg-[#1C1C22] hover:text-white border border-transparent hover:border-[#2A2A2E]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>04. 비주얼 & 배경색</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'visuals' ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu 5: FX & Audio */}
          <button
            onClick={() => handleToggleRibbon('fx_audio')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'fx_audio'
                ? 'bg-[#FF007F] text-white shadow-[0_0_10px_#FF007F]'
                : 'text-[#FF007F] hover:bg-[#FF007F]/15 border border-transparent hover:border-[#FF007F]/40'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>05. 오디오 & FX</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'fx_audio' ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu 6: Export & Tools */}
          <button
            onClick={() => handleToggleRibbon('export')}
            className={`px-3 py-1.5 font-bold uppercase transition flex items-center gap-1.5 rounded-xs cursor-pointer ${
              activeRibbon === 'export'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                : 'text-gray-300 hover:bg-[#1C1C22] hover:text-white border border-transparent hover:border-[#2A2A2E]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>06. 내보내기 & 툴</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeRibbon === 'export' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Quick Theory / Manual direct button */}
        <button
          onClick={() => onOpenTheoryModal(1)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-gray-400 hover:text-[#00F0FF] transition cursor-pointer"
          title="3D 파티클 몰핑 공식 사용설명서 (19P)"
        >
          <BookOpen className="w-3 h-3 text-[#00F0FF]" />
          <span>사용설명서 (19P)</span>
        </button>
      </div>

      {/* ================= EXPANDABLE FLOATING RIBBON PANELS ================= */}
      {activeRibbon && (
        <div className="absolute top-full left-0 w-full bg-[#121216]/98 backdrop-blur-md border-b border-[#00F0FF]/40 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-50 p-4 max-h-[75vh] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto">
            {/* Header with category title & close button */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2A2A2E]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00F0FF] rotate-45" />
                <span className="font-bold text-sm text-[#00F0FF] uppercase tracking-wider">
                  {activeRibbon === 'shapes' && '📂 01. 형상 선택 & 프리셋 라이브러리 (Shapes & Presets)'}
                  {activeRibbon === 'morph' && '⚡ 02. 모핑 타임라인 & 모션 가속도 제어 (Morph & Motion)'}
                  {activeRibbon === 'physics' && '🌊 03. 유체 컬 노이즈 & 마우스 중력장 제어 (Physics & Force)'}
                  {activeRibbon === 'visuals' && '🎨 04. 파티클 외형, 셰이더 & 배경색 설정 (Visuals & Shaders)'}
                  {activeRibbon === 'fx_audio' && '🎵 05. 오디오 반응형 비주얼라이저 & 블랙홀 특이점 & 3D 내보내기 (FX & Audio)'}
                  {activeRibbon === 'export' && '💾 06. 단독실행형 다운로드 & 파이썬 / C++ 스튜디오 툴 (Export & Tools)'}
                </span>
              </div>
              <button
                onClick={() => setActiveRibbon(null)}
                className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition cursor-pointer"
                title="리본 메뉴 닫기 (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ---------- RIBBON 1: SHAPES & PRESETS ---------- */}
            {activeRibbon === 'shapes' && (
              <div className="space-y-5">
                {/* 1-0. Direct 2D Multi-Line Text Particle Input Bar (Up to 3 lines, 1.7x Large Size) */}
                <div className="bg-[#16161D] border border-[#00F0FF]/40 p-3.5 shadow-[0_4px_20px_rgba(0,240,255,0.1)]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#00F0FF] text-black shrink-0 mt-0.5">
                        <Type className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2 flex-wrap">
                          <span>✍️ 2D 멀티라인 텍스트 파티클 직접 로딩</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-normal">
                            길이 기준 캔버스 정중앙 자동 정렬 · 긴 텍스트 화각 자동 맞춤(Auto-Fit) · HY태고딕
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          텍스트들의 길이를 기준으로 중심점이 캔버스 정중앙(0,0,0)에 일치하며, 텍스트가 아무리 길어도 캔버스 화면 내에 자동으로 최적 스케일링됩니다. (Ctrl+Enter 로딩)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-stretch gap-2.5 flex-wrap sm:flex-nowrap">
                      <textarea
                        rows={3}
                        value={textInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          const splitLines = val.split('\n');
                          if (splitLines.length <= 3) {
                            setTextInput(val);
                          } else {
                            setTextInput(splitLines.slice(0, 3).join('\n'));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleExecuteTextLoad(textTargetSlot);
                          }
                        }}
                        placeholder={`1줄: 3D PARTICLE STUDIO\n2줄: HY태고딕 고선명도\n3줄: 3-LINE 2D TYPO`}
                        className="bg-[#0A0A0E] border border-[#2A2A34] focus:border-[#00F0FF] px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none w-64 sm:w-80 font-sans font-bold resize-none leading-relaxed custom-scrollbar"
                      />

                      {/* Loading Slot Buttons */}
                      <div className="flex flex-col justify-between gap-1 shrink-0">
                        <button
                          onClick={() => handleExecuteTextLoad('source')}
                          className="px-2.5 py-1 bg-[#1C1C24] hover:bg-[#00F0FF] hover:text-black border border-[#2A2A34] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                          title="입력한 3줄 텍스트를 [01.출발 형태]로 로딩"
                        >
                          <span>[출발] 로딩</span>
                        </button>

                        <button
                          onClick={() => handleExecuteTextLoad('waypoint')}
                          className="px-3 py-1 bg-[#FFE600]/15 hover:bg-[#FFE600] hover:text-black text-[#FFE600] border border-[#FFE600] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer shadow-[0_0_8px_rgba(255,230,0,0.2)]"
                          title="입력한 3줄 텍스트를 [+ 새 경유지 피사체]로 로딩"
                        >
                          <Plus className="w-3 h-3" />
                          <span>[+ 경유지] 로딩</span>
                        </button>

                        <button
                          onClick={() => handleExecuteTextLoad('target')}
                          className="px-2.5 py-1 bg-[#1C1C24] hover:bg-white hover:text-black border border-[#2A2A34] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                          title="입력한 3줄 텍스트를 [02.목표 피사체]로 로딩"
                        >
                          <span>[목표] 로딩</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-1. Interactive Visual Timeline Editor (Multi-Stage Morphing Sequence with Drag & Drop) */}
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
                />

                {/* 1-2. 3D Shape Libraries (Source, Target, and Presets) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Source Shape Selector */}
                  <div className="space-y-2.5 bg-[#0D0D10] border border-[#222228] p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                        <span>01. 출발 형태 선택 (Origin)</span>
                      </h4>
                      <button
                        onClick={onSwapShapes}
                        className="text-[10px] px-2 py-0.5 bg-[#1A1A1E] hover:bg-[#00F0FF] hover:text-black border border-[#2A2A2E] transition flex items-center gap-1 cursor-pointer"
                        title="출발과 목표 피사체 위치 맞바꾸기"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>맞바꾸기</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto custom-scrollbar p-1 bg-[#070709] border border-[#222228]">
                      {shapes.map((s) => {
                        const isSel = s.id === sourceShapeId;
                        return (
                          <div
                            key={`src-${s.id}`}
                            className={`p-1.5 border text-[10px] transition relative group ${
                              isSel
                                ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                                : 'border-[#222228] bg-[#121216] text-gray-400 hover:text-white'
                            }`}
                          >
                            <button
                              onClick={() => onSelectSource(s.id)}
                              className="w-full text-left cursor-pointer truncate font-bold"
                            >
                              <div className="truncate">{s.name}</div>
                              <div className="text-[8px] opacity-70 uppercase">{s.type}</div>
                            </button>
                            <div className="hidden group-hover:flex items-center gap-1 mt-1 pt-1 border-t border-[#2A2A2E]">
                              <button
                                onClick={() => onSelectSource(s.id)}
                                className="flex-1 py-0.5 bg-[#00F0FF]/20 text-[#00F0FF] text-[8px] uppercase font-bold text-center"
                              >
                                출발
                              </button>
                              <button
                                onClick={() => onAddWaypoint && onAddWaypoint(s.id)}
                                className="flex-1 py-0.5 bg-amber-400/20 text-amber-400 text-[8px] uppercase font-bold text-center"
                              >
                                +경유
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Target Shape Selector */}
                  <div className="space-y-2.5 bg-[#0D0D10] border border-[#222228] p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        <span>02. 최종 목표 피사체 선택</span>
                      </h4>
                      <button
                        onClick={onOpenUpload}
                        className="text-[10px] px-2 py-0.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] transition flex items-center gap-1 cursor-pointer"
                        title="내 컴퓨터 이미지(PNG/JPG)를 3D 파티클로 변환"
                      >
                        <Plus className="w-3 h-3" />
                        <span>이미지 변환</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto custom-scrollbar p-1 bg-[#070709] border border-[#222228]">
                      {shapes.map((s) => {
                        const isSel = s.id === targetShapeId;
                        return (
                          <div
                            key={`dst-${s.id}`}
                            className={`p-1.5 border text-[10px] transition relative group ${
                              isSel
                                ? 'border-white bg-white/15 text-white font-bold'
                                : 'border-[#222228] bg-[#121216] text-gray-400 hover:text-white'
                            }`}
                          >
                            <button
                              onClick={() => onSelectTarget(s.id)}
                              className="w-full text-left cursor-pointer truncate font-bold"
                            >
                              <div className="truncate">{s.name}</div>
                              <div className="text-[8px] opacity-70 uppercase">{s.type}</div>
                            </button>
                            <div className="hidden group-hover:flex items-center gap-1 mt-1 pt-1 border-t border-[#2A2A2E]">
                              <button
                                onClick={() => onSelectTarget(s.id)}
                                className="flex-1 py-0.5 bg-white/20 text-white text-[8px] uppercase font-bold text-center"
                              >
                                목표
                              </button>
                              <button
                                onClick={() => onAddWaypoint && onAddWaypoint(s.id)}
                                className="flex-1 py-0.5 bg-amber-400/20 text-amber-400 text-[8px] uppercase font-bold text-center"
                              >
                                +경유
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 3: Built-in Cinematic Presets & Web Hub */}
                  <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#FFE600] uppercase flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>원클릭 시네마틱 프리셋</span>
                      </h4>
                      <button
                        onClick={onOpenWebHub}
                        className="text-[10px] px-2 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition cursor-pointer"
                      >
                        온라인 허브
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto custom-scrollbar p-0.5">
                      {BUILTIN_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            onChangeConfig(preset.config);
                            if (preset.sourceShapeId) onSelectSource(preset.sourceShapeId);
                            if (preset.targetShapeId) onSelectTarget(preset.targetShapeId);
                            const safeWaypoints = Array.isArray(preset.waypointShapeIds) ? preset.waypointShapeIds : [];
                            if (safeWaypoints.length > 0 && onReorderChain) {
                              const fullChain = [
                                preset.sourceShapeId || sourceShapeId,
                                ...safeWaypoints,
                                preset.targetShapeId || targetShapeId
                              ];
                              onReorderChain(fullChain);
                            } else if (preset.morphChain && onReorderChain) {
                              onReorderChain(preset.morphChain);
                            }
                            setActiveRibbon(null);
                          }}
                          className={`p-2 bg-[#0A0A0C] border text-left transition cursor-pointer ${
                            preset.id === 'preset_10_threejs_webgpu_earth'
                              ? 'border-[#00F0FF] hover:border-white bg-[#00F0FF]/15 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                              : preset.id === 'preset_9_gpgpu_flocking_birds'
                              ? 'border-[#00F0FF]/60 hover:border-[#00F0FF] bg-[#00F0FF]/10'
                              : preset.id === 'preset_12_snowflake_glacial_earth'
                              ? 'border-[#80D8FF]/60 hover:border-[#80D8FF] bg-[#80D8FF]/10'
                              : 'border-[#2A2A2E] hover:border-[#FFE600]'
                          }`}
                        >
                          <div className={`font-bold text-[10px] truncate ${
                            preset.id === 'preset_10_threejs_webgpu_earth' ? 'text-[#00F0FF]' :
                            preset.id === 'preset_9_gpgpu_flocking_birds' ? 'text-[#00FFAA]' :
                            preset.id === 'preset_12_snowflake_glacial_earth' ? 'text-[#80D8FF]' : 'text-gray-200'
                          }`}>
                            #{preset.slot}. {preset.name}
                          </div>
                          <div className="text-[8px] text-gray-500 truncate">{preset.category}</div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#2A2A2E] flex items-center gap-2">
                      <button
                        onClick={onOpenWebHub}
                        className="flex-1 py-2 bg-[#1A1A22] hover:bg-[#00F0FF] hover:text-black border border-[#2A2A2E] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>particles.js 연동 웹 허브</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RIBBON 2: MORPH & TIMELINE ---------- */}
            {activeRibbon === 'morph' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 2-1. Timeline & Progress */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase">01. 몰핑 진행도 & 타임라인</h4>
                    <span className="text-sm font-bold text-white">{(config.progress * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={config.progress}
                    onChange={(e) => onChangeConfig({ progress: parseFloat(e.target.value), isPlaying: false })}
                    className="w-full h-2 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onChangeConfig({ isPlaying: !config.isPlaying })}
                      className={`py-2 text-xs font-bold uppercase flex items-center justify-center gap-1 transition ${
                        config.isPlaying ? 'bg-[#00F0FF] text-black' : 'bg-[#222228] text-white hover:bg-[#33333C]'
                      }`}
                    >
                      {config.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{config.isPlaying ? '일시정지' : '재생'}</span>
                    </button>
                    <button
                      onClick={() => onChangeConfig({ progress: 0 })}
                      className="py-2 bg-[#222228] hover:bg-[#33333C] text-xs font-bold uppercase flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>0% (처음)</span>
                    </button>
                    <button
                      onClick={() => onChangeConfig({ progress: 1 })}
                      className="py-2 bg-[#222228] hover:bg-[#33333C] text-xs font-bold uppercase flex items-center justify-center gap-1"
                    >
                      <span>100% (끝)</span>
                    </button>
                  </div>
                </div>

                {/* 2-2. Loop & Speed */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase">02. 반복 모드 & 속도</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['pingpong', 'loop', 'once'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => onChangeConfig({ playMode: m })}
                        className={`py-1.5 text-[10px] font-bold uppercase border transition ${
                          config.playMode === m
                            ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                            : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-400 hover:text-white'
                        }`}
                      >
                        {m === 'pingpong' ? '핑퐁 왕복' : m === 'loop' ? '무한 루프' : '1회 재생'}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>재생 속도 (Play Speed)</span>
                      <span className="font-bold text-[#00F0FF]">
                        {config.playSpeed.toFixed(2)}x
                        {(waypointShapeIds || []).length > 0 && (
                          <span className="ml-1.5 text-[9px] text-amber-300 font-normal">
                            (다단계 경유: 2배 연장)
                          </span>
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={config.playSpeed}
                      onChange={(e) => onChangeConfig({ playSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[9px] text-amber-300/90 bg-amber-400/10 border border-amber-400/30 px-2 py-1">
                      <span>✨ 정점 선명도 극대화</span>
                      <span className="font-bold">⏱️ 각 경유 피사체 1초 정지</span>
                    </div>
                  </div>
                </div>

                {/* 2-3. Morph Easing Curve Settings */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-[#FFE600] uppercase flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
                      <span>03. 가속도 이징 곡선 (Easing)</span>
                    </h4>
                    <span className="text-[9px] font-mono text-[#FFE600]">
                      {(config.morphEasing || 'ease-in-out').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
                    {EASING_OPTIONS.map((easing) => {
                      const isSelected = (config.morphEasing || 'ease-in-out') === easing.id;
                      return (
                        <button
                          key={`ribbon-easing-${easing.id}`}
                          onClick={() => onChangeConfig({ morphEasing: easing.id })}
                          className={`p-1.5 border text-left transition cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#FFE600]/15 border-[#FFE600] text-[#FFE600]'
                              : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-300 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          <svg viewBox="0 0 36 24" className="w-6 h-4 shrink-0 bg-[#050508] border border-[#222228] p-0.5">
                            <path
                              d={easing.iconSvg}
                              fill="none"
                              stroke={isSelected ? '#FFE600' : '#888899'}
                              strokeWidth={isSelected ? '2.5' : '1.5'}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="truncate">
                            <div className="text-[9px] font-bold truncate">{easing.engName}</div>
                            <div className="text-[7.5px] text-gray-500 truncate">{easing.badge}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2-4. Delay Matrix & Engine */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase">04. 지연 분산 매트릭스</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'random', name: '랜덤 지연' },
                      { id: 'radial', name: '방사형 확산' },
                      { id: 'linear_y', name: '수직 Y축' },
                      { id: 'linear_x', name: '수평 X축' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => onChangeConfig({ delayMode: d.id as DelayMode })}
                        className={`py-1.5 px-2 text-left text-[10px] font-bold uppercase border transition ${
                          config.delayMode === d.id
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                            : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-400 hover:text-white'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>지연 분산도 (Spread)</span>
                      <span className="font-bold text-[#00F0FF]">{config.delaySpread.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.0"
                      step="0.02"
                      value={config.delaySpread}
                      onChange={(e) => onChangeConfig({ delaySpread: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RIBBON 3: PHYSICS & FORCES ---------- */}
            {activeRibbon === 'physics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 3-1. Mouse Gravity Force Field */}
                <div className="space-y-3 bg-[#141418] border border-[#00F0FF]/30 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>01. 마우스 중력 상호작용</span>
                    </h4>
                    <button
                      onClick={() => onChangeConfig({ mouseGravityEnabled: !config.mouseGravityEnabled })}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition ${
                        config.mouseGravityEnabled
                          ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                          : 'bg-[#0A0A0C] text-gray-400 border-[#3A3A3E]'
                      }`}
                    >
                      {config.mouseGravityEnabled ? '중력 ON' : '중력 OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { mode: 'attract', label: '🧲 인력 수렴', desc: '모임' },
                      { mode: 'vortex', label: '🌀 와류 회전', desc: '소용돌이' },
                      { mode: 'repel', label: '💥 척력 산란', desc: '밀어냄' },
                    ].map((m) => (
                      <button
                        key={m.mode}
                        onClick={() => onChangeConfig({ mouseGravityMode: m.mode as any, mouseGravityEnabled: true })}
                        className={`p-1.5 text-center border transition ${
                          config.mouseGravityMode === m.mode && config.mouseGravityEnabled
                            ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] font-bold'
                            : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-bold">{m.label}</div>
                        <div className="text-[8px] opacity-70">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>중력 세기 (Strength)</span>
                      <span className="font-bold text-[#00F0FF]">{(config.mouseGravityStrength ?? 3.5).toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10.0"
                      step="0.5"
                      value={config.mouseGravityStrength ?? 3.5}
                      onChange={(e) => onChangeConfig({ mouseGravityStrength: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>자유 부유 운동 (Free Drift)</span>
                      <span className="font-bold text-[#00F0FF]">{(config.ambientDriftAmp ?? 1.3).toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="4.0"
                      step="0.1"
                      value={config.ambientDriftAmp ?? 1.3}
                      onChange={(e) => onChangeConfig({ ambientDriftAmp: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>
                </div>

                {/* 3-2. Noise Solver Algorithm */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase">02. 3D 노이즈 알고리즘</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'curl', name: '3D Curl Noise', desc: '유체 와류' },
                      { id: 'simplex', name: 'Simplex 3D', desc: '유기적 흩어짐' },
                      { id: 'turbulence', name: 'Turbulence', desc: '프랙탈 난류' },
                      { id: 'vortex', name: 'Vortex Spin', desc: '스핀 왜곡' },
                    ].map((n) => (
                      <button
                        key={n.id}
                        onClick={() => onChangeConfig({ noiseType: n.id as NoiseType })}
                        className={`p-2 border text-left transition ${
                          config.noiseType === n.id
                            ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                            : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-[10px]">{n.name}</div>
                        <div className="text-[8px] opacity-70">{n.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>난류 진폭 (Turbulence Amp)</span>
                      <span className="font-bold text-[#00F0FF]">{config.noiseAmp.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6.0"
                      step="0.05"
                      value={config.noiseAmp}
                      onChange={(e) => onChangeConfig({ noiseAmp: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>
                </div>

                {/* 3-3. Noise Frequency & Evolution */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase">03. 주파수 및 진화 속도</h4>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>공간 주파수 (Noise Frequency)</span>
                      <span className="font-bold text-[#00F0FF]">{config.noiseFreq.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.05"
                      value={config.noiseFreq}
                      onChange={(e) => onChangeConfig({ noiseFreq: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>진화 속도 (Evolution Speed)</span>
                      <span className="font-bold text-[#00F0FF]">{config.noiseSpeed.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={config.noiseSpeed}
                      onChange={(e) => onChangeConfig({ noiseSpeed: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>
                </div>

                {/* 3-4. Real-Time Physics Field Debug Overlay (NEW) */}
                <div className="space-y-3 bg-[#141418] border border-[#00FF66]/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#00FF66] uppercase flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00FF66]" />
                      <span>04. 물리 디버그 오버레이</span>
                    </h4>
                    <button
                      onClick={() => onChangeConfig({ physicsDebugEnabled: !config.physicsDebugEnabled })}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition ${
                        config.physicsDebugEnabled
                          ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                          : 'bg-[#0A0A0C] text-gray-400 border-[#3A3A3E]'
                      }`}
                    >
                      {config.physicsDebugEnabled ? '디버그 ON' : '디버그 OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                    <button
                      onClick={() => onChangeConfig({ physicsDebugShowNoise: config.physicsDebugShowNoise === false ? true : false })}
                      className={`p-1 border flex items-center justify-between ${
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
                      className={`p-1 border flex items-center justify-between ${
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
                      className={`p-1 border flex items-center justify-between ${
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
                      className={`p-1 border flex items-center justify-between ${
                        config.physicsDebugShowVelocity !== false
                          ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66]'
                          : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                      }`}
                    >
                      <span>입자 속도선</span>
                      <span className="font-bold">{config.physicsDebugShowVelocity !== false ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>벡터 화살표 배율</span>
                      <span className="font-bold text-[#00FF66]">{(config.physicsDebugVectorScale ?? 1.0).toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.0"
                      step="0.1"
                      value={config.physicsDebugVectorScale ?? 1.0}
                      onChange={(e) => onChangeConfig({ physicsDebugVectorScale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00FF66]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RIBBON 4: VISUALS, SHAPES & BACKGROUND ---------- */}
            {activeRibbon === 'visuals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 4-1. Particle Shape & Density */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase">01. 파티클 외형 & 밀도</h4>
                    <button
                      onClick={onOpenColorMixer}
                      className="text-[9px] px-2 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-black transition"
                    >
                      전체 실험실
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {PARTICLE_SHAPES.map((ps) => {
                      const isSel = config.particleType === ps.id;
                      return (
                        <button
                          key={ps.id}
                          onClick={() => onChangeConfig({ particleType: ps.id })}
                          className={`p-1 text-center border text-[9px] transition cursor-pointer flex flex-col items-center gap-0.5 ${
                            isSel
                              ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] font-bold'
                              : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                          }`}
                        >
                          {ps.icon}
                          <span className="truncate w-full">{ps.name.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[15000, 30000, 60000, 100000].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => onChangeConfig({ particleCount: cnt })}
                        className={`py-1 border font-bold text-[9px] uppercase transition cursor-pointer ${
                          config.particleCount === cnt
                            ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                            : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-400 hover:text-white'
                        }`}
                      >
                        {(cnt / 1000)}K
                      </button>
                    ))}
                  </div>

                  {/* Snowflake & Sprite Controls */}
                  <div className="pt-2 border-t border-[#222228] space-y-1.5">
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-400">실시간 HSL 무지개 회전</span>
                      <button
                        onClick={() => onChangeConfig({ spriteHslCycle: !config.spriteHslCycle })}
                        className={`px-2 py-0.5 border font-bold uppercase transition ${
                          config.spriteHslCycle ? 'bg-[#FFE600] text-black border-[#FFE600]' : 'bg-[#0A0A0C] text-gray-400 border-[#2A2A2E]'
                        }`}
                      >
                        {config.spriteHslCycle ? 'HSL ON' : 'HSL OFF'}
                      </button>
                    </div>

                    <button
                      onClick={onOpenUpload}
                      className="w-full py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>첨부 파일 파티클 외형&밀도 장착</span>
                    </button>
                  </div>
                </div>

                {/* 4-2. Color Mixing & 3-Stop Gradient */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase">02. 색혼합 모드 & 3단 광원</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'interpolate', name: '형상 보간' },
                      { id: 'gradient', name: '3단 램프' },
                      { id: 'velocity', name: '속도 변색' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onChangeConfig({ colorMixMode: m.id as ColorMixMode })}
                        className={`p-1 text-center border text-[9px] transition ${
                          config.colorMixMode === m.id
                            ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                            : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>

                  {/* Gradient bar preview */}
                  <div
                    className="w-full h-2.5 border border-[#2A2A2E]"
                    style={{
                      background: `linear-gradient(90deg, ${config.colorA || '#00F0FF'} 0%, ${config.colorB || '#FF007F'} 50%, ${config.colorC || '#FFE600'} 100%)`,
                    }}
                  />

                  {/* 3 Color Pickers */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="flex items-center gap-1 bg-[#0A0A0C] p-1 border border-[#2A2A2E]">
                      <input
                        type="color"
                        value={config.colorA || '#00f0ff'}
                        onChange={(e) => onChangeConfig({ colorA: e.target.value })}
                        className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <span className="text-[8px] text-gray-400 uppercase">A (베이스)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0A0A0C] p-1 border border-[#2A2A2E]">
                      <input
                        type="color"
                        value={config.colorB || '#ff007f'}
                        onChange={(e) => onChangeConfig({ colorB: e.target.value })}
                        className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <span className="text-[8px] text-gray-400 uppercase">B (미드)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0A0A0C] p-1 border border-[#2A2A2E]">
                      <input
                        type="color"
                        value={config.colorC || '#ffe600'}
                        onChange={(e) => onChangeConfig({ colorC: e.target.value })}
                        className="w-4 h-4 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <span className="text-[8px] text-gray-400 uppercase">C (피크)</span>
                    </div>
                  </div>
                </div>

                {/* 4-3. Background Color & Motion Trails */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase">03. 캔버스 배경색 & 궤적</h4>
                    <span className="text-[9px] text-[#00F0FF] font-mono">
                      {isTransparentBackground(config.backgroundColor)
                        ? '투명 (색상 없음)'
                        : config.backgroundColor || '#030712'}
                    </span>
                  </div>

                  {/* Background palettes */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Transparent Option */}
                    <button
                      type="button"
                      onClick={() => onChangeConfig({ backgroundColor: 'transparent' })}
                      className={`w-6 h-6 rounded border transition cursor-pointer canvas-transparent-bg flex items-center justify-center ${
                        isTransparentBackground(config.backgroundColor)
                          ? 'border-[#00F0FF] scale-110 shadow-[0_0_8px_#00F0FF]'
                          : 'border-[#2A2A2E]'
                      }`}
                      title="색상 없음 (투명)"
                    >
                      <span className="text-[8px] font-bold text-gray-800 bg-white/70 px-0.5 rounded">∅</span>
                    </button>

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
                        className={`w-6 h-6 rounded border transition cursor-pointer ${
                          !isTransparentBackground(config.backgroundColor) &&
                          (config.backgroundColor || '#030712').toLowerCase() === item.color.toLowerCase()
                            ? 'border-[#00F0FF] scale-110 shadow-[0_0_8px_#00F0FF]'
                            : 'border-[#2A2A2E]'
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={isTransparentBackground(config.backgroundColor) ? '#000000' : (config.backgroundColor || '#030712')}
                      onChange={(e) => onChangeConfig({ backgroundColor: e.target.value })}
                      className="w-6 h-6 rounded bg-transparent cursor-pointer border border-[#2A2A2E] ml-auto"
                      title="직접 색상 선택"
                    />
                  </div>

                  {/* Motion Blur & Trails sliders */}
                  <div className="pt-1 space-y-2 border-t border-[#222228]">
                    {/* Motion Blur Intensity Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-300 mb-1">
                        <span className="flex items-center gap-1 text-[#00FF66] font-bold">
                          <Wind className="w-3 h-3" />
                          모션 블러 강도 (Blur Intensity)
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
                        className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00FF66]"
                      />
                    </div>

                    {/* Trail Persistence Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>모션 궤적 지속 (Ghost Trails)</span>
                        <span className="font-bold text-[#00F0FF]">
                          {config.trailsEnabled ? `${((config.trailLength ?? 0.85) * 100).toFixed(0)}%` : 'OFF'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.98"
                        step="0.02"
                        value={config.trailLength ?? 0.85}
                        onChange={(e) => onChangeConfig({ trailLength: parseFloat(e.target.value), trailsEnabled: true })}
                        className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { label: 'OFF', blur: 0.0, len: 0.50 },
                        { label: '0.6x', blur: 0.6, len: 0.75 },
                        { label: '1.2x', blur: 1.2, len: 0.88 },
                        { label: '2.2x', blur: 2.2, len: 0.96 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => onChangeConfig({ 
                            trailsEnabled: preset.blur > 0.05,
                            motionBlurIntensity: preset.blur,
                            trailLength: preset.len
                          })}
                          className="py-0.5 px-1 bg-[#0A0A0C] border border-[#2A2A2E] hover:border-[#00FF66] text-[8px] font-mono text-center text-gray-300 hover:text-[#00FF66] transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4-4. Bloom & Post-processing */}
                <div className="space-y-3 bg-[#141418] border border-[#FF007F]/40 p-3.5 shadow-[0_0_12px_rgba(255,0,127,0.1)]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#FF007F] uppercase flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" />
                      <span>04. 블룸 & 후처리 광원</span>
                    </h4>
                    <button
                      onClick={() => onChangeConfig({ bloomEnabled: config.bloomEnabled === false ? true : false })}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition cursor-pointer ${
                        config.bloomEnabled !== false
                          ? 'bg-[#FF007F] text-black border-[#FF007F] shadow-[0_0_8px_rgba(255,0,127,0.4)]'
                          : 'bg-[#0A0A0C] text-gray-400 border-[#3A3A3E]'
                      }`}
                    >
                      {config.bloomEnabled !== false ? `ON ${(config.bloomStrength ?? 1.2).toFixed(1)}x` : 'OFF'}
                    </button>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-2 text-[10px]">
                    <div>
                      <div className="flex justify-between text-gray-300 mb-0.5">
                        <span className="text-[#FF007F] font-bold">블룸 강도 (Strength)</span>
                        <span className="font-mono text-[#FF007F]">{(config.bloomStrength ?? 1.2).toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="3.5"
                        step="0.05"
                        value={config.bloomStrength ?? 1.2}
                        onChange={(e) => onChangeConfig({ bloomStrength: parseFloat(e.target.value), bloomEnabled: true })}
                        className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-400 mb-0.5">
                        <span>확산 반경 (Radius)</span>
                        <span className="font-mono text-[#00F0FF]">{(config.bloomRadius ?? 0.6).toFixed(2)}</span>
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

                    <div>
                      <div className="flex justify-between text-gray-400 mb-0.5">
                        <span>휘도 컷오프 (Threshold)</span>
                        <span className="font-mono text-[#FFE600]">{(config.bloomThreshold ?? 0.15).toFixed(2)}</span>
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
                    </div>
                  </div>

                  {/* Quick Bloom mood buttons */}
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[#222228]">
                    {[
                      { label: '소프트', str: 0.7, rad: 0.4, th: 0.25 },
                      { label: '네온', str: 1.5, rad: 0.7, th: 0.12 },
                      { label: '하이퍼', str: 2.8, rad: 1.1, th: 0.05 },
                    ].map((bp) => (
                      <button
                        key={bp.label}
                        onClick={() => onChangeConfig({
                          bloomEnabled: true,
                          bloomStrength: bp.str,
                          bloomRadius: bp.rad,
                          bloomThreshold: bp.th,
                        })}
                        className="py-1 px-0.5 bg-[#0A0A0C] border border-[#2A2A2E] hover:border-[#FF007F] text-[9px] text-gray-300 hover:text-[#FF007F] text-center transition cursor-pointer"
                      >
                        {bp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RIBBON 5: FX & AUDIO REACTIVE ---------- */}
            {activeRibbon === 'fx_audio' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 5-1. Audio Reactive Engine */}
                <div className="space-y-3 bg-[#141418] border border-[#FF007F]/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#FF007F] uppercase flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>01. 오디오 비주얼라이저</span>
                    </h4>
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
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition ${
                        config.audioReactiveEnabled
                          ? 'bg-[#FF007F] text-white border-[#FF007F]'
                          : 'bg-[#0A0A0C] text-gray-400 border-[#2A2A2E]'
                      }`}
                    >
                      {config.audioReactiveEnabled ? '오디오 ON' : '오디오 OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'synth', label: 'EDM 신스' },
                      { id: 'mic', label: '마이크' },
                      { id: 'file', label: '음악 파일' },
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
                        className={`p-1.5 text-center text-[9px] border transition ${
                          config.audioSourceType === src.id
                            ? 'border-[#FF007F] bg-[#FF007F]/20 text-[#FF007F] font-bold'
                            : 'border-[#2A2A2E] bg-[#0A0A0C] text-gray-400 hover:text-white'
                        }`}
                      >
                        {src.label}
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

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>저음 킥 펄스 (Bass Pulse)</span>
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
                </div>

                {/* 5-2. Black Hole Singularity */}
                <div className="space-y-3 bg-[#141418] border border-[#FFE600]/40 p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#FFE600] uppercase flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>02. 블랙홀 특이점 포스</span>
                    </h4>
                    <button
                      onClick={() => onChangeConfig({ blackHoleEnabled: !config.blackHoleEnabled })}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition ${
                        config.blackHoleEnabled
                          ? 'bg-[#FFE600] text-black border-[#FFE600]'
                          : 'bg-[#0A0A0C] text-gray-400 border-[#2A2A2E]'
                      }`}
                    >
                      {config.blackHoleEnabled ? '블랙홀 ON' : '블랙홀 OFF'}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>특이점 질량 인력 (Mass Pull)</span>
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

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>사건의 지평선 (Event Horizon)</span>
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

                {/* 5-3. Glitch & 3D Point Cloud Export */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase">03. 3D 포인트 클라우드 & CNC</h4>
                    <button
                      onClick={() => {
                        if (onOpenGCodeModal) onOpenGCodeModal();
                        setActiveRibbon(null);
                      }}
                      className="px-2 py-0.5 bg-[#00F0FF] text-black font-bold text-[9px] uppercase shadow-[0_0_8px_#00F0FF] cursor-pointer"
                    >
                      ⚡ CNC 가공기
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>디지털 글리치 왜곡 (Glitch Jitter)</span>
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

                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#2A2A2E]">
                    <button
                      onClick={() => {
                        if (onOpenGCodeModal) onOpenGCodeModal();
                        setActiveRibbon(null);
                      }}
                      className="p-1.5 bg-[#0A0A0C] border border-[#00F0FF] hover:bg-[#00F0FF]/15 text-[#00F0FF] transition text-left cursor-pointer"
                      title="CNC 레이저 각인기 / 3D 프린터용 G-Code 내보내기 스튜디오 열기"
                    >
                      <div className="font-bold text-[9px] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#00F0FF]" />
                        <span>.GCODE / .NC</span>
                      </div>
                      <div className="text-[7px] text-gray-400">CNC 레이저 / 3D프린터</div>
                    </button>
                    <button
                      onClick={handleExportPointsXYZ}
                      className="p-1.5 bg-[#0A0A0C] border border-[#FFE600]/60 hover:border-[#FFE600] hover:bg-[#FFE600]/15 text-[#FFE600] transition text-left cursor-pointer"
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
                      className="p-1.5 bg-[#0A0A0C] border border-[#00F0FF]/40 hover:border-[#00F0FF] text-gray-300 hover:text-white transition text-left cursor-pointer"
                      title="Blender / Houdini 용 PLY 포인트 클라우드"
                    >
                      <div className="font-bold text-[9px]">.PLY 내보내기</div>
                      <div className="text-[7px] text-gray-400">Blender / Houdini</div>
                    </button>
                    <button
                      onClick={handleExportPointsOBJ}
                      className="p-1.5 bg-[#0A0A0C] border border-[#FF007F]/40 hover:border-[#FF007F] text-gray-300 hover:text-[#FF007F] transition text-left cursor-pointer"
                      title="Unreal / Maya 용 OBJ 포인트 클라우드"
                    >
                      <div className="font-bold text-[9px]">.OBJ 내보내기</div>
                      <div className="text-[7px] text-gray-400">Unreal / Maya</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- RIBBON 6: EXPORT & TOOLS ---------- */}
            {activeRibbon === 'export' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* 6-1. Standalone File Exports (HTML & Windows CMD & Video) */}
                <div className="space-y-3 bg-[#141418] border border-[#00F0FF]/40 p-3.5">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>01. 단독실행형 & 미디어 다운로드</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {onOpenSaveNamedPreset && (
                      <button
                        onClick={() => {
                          onOpenSaveNamedPreset();
                          setActiveRibbon(null);
                        }}
                        className="p-2.5 bg-[#00F0FF]/20 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-between transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                        title="현재 형상과 모든 파라미터를 이름 지정 독립형 .JSON 프리셋 파일로 저장"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-[#00F0FF]" />
                          <span>💾 이름 지정 .JSON 프리셋 파일 저장</span>
                        </div>
                        <span className="text-[9px] bg-[#00F0FF] text-black px-1.5 py-0.5 font-bold">.JSON</span>
                      </button>
                    )}

                    {onOpenImportNamedPreset && (
                      <button
                        onClick={() => {
                          onOpenImportNamedPreset();
                          setActiveRibbon(null);
                        }}
                        className="p-2.5 bg-[#1A1A24] hover:bg-[#2A2A38] text-gray-200 hover:text-white border border-[#2A2A38] hover:border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-between transition cursor-pointer"
                        title="기존에 저장된 .JSON 프리셋 파일을 워크스페이스에 불러오기"
                      >
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-[#FFE600]" />
                          <span>📂 .JSON 프리셋 파일 불러오기</span>
                        </div>
                        <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 font-bold">IMPORT</span>
                      </button>
                    )}

                    {onOpenVideoModal && (
                      <button
                        onClick={() => {
                          onOpenVideoModal();
                          setActiveRibbon(null);
                        }}
                        className="p-2.5 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/50 hover:border-red-500 font-bold text-xs uppercase flex items-center justify-between transition shadow-[0_0_14px_rgba(239,68,68,0.25)] cursor-pointer"
                        title="60FPS 무손실 비디오 녹화기 열기 (MediaRecorder WebM / MP4)"
                      >
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-red-400" />
                          <span>🎥 60FPS 비디오 녹화기</span>
                        </div>
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 font-bold">● REC</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onExportHtml();
                        setActiveRibbon(null);
                      }}
                      className="p-2.5 bg-[#00F0FF] hover:bg-white text-black font-bold text-xs uppercase flex items-center justify-between transition shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4" />
                        <span>풀 스튜디오 HTML 내보내기</span>
                      </div>
                      <span className="text-[9px] bg-black text-[#00F0FF] px-1.5 py-0.5">FULL UI</span>
                    </button>

                    <button
                      onClick={() => {
                        onExportPureHtml();
                        setActiveRibbon(null);
                      }}
                      className="p-2.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>✨ 순수 파티클 HTML 내보내기</span>
                      </div>
                      <span className="text-[9px] bg-[#00F0FF] text-black px-1.5 py-0.5">NO UI</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onExportPureCmd) onExportPureCmd();
                        setActiveRibbon(null);
                      }}
                      className="p-2.5 bg-[#FFE600]/15 hover:bg-[#FFE600] hover:text-black text-[#FFE600] border border-[#FFE600] font-bold text-xs uppercase flex items-center justify-between transition cursor-pointer shadow-[0_0_8px_rgba(255,230,0,0.2)]"
                      title="더블클릭 시 오프라인에서 브라우저를 띄워 순수 파티클 3D 뷰어를 즉시 실행하는 윈도우 실행 파일 (.cmd)"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FFE600]" />
                        <span>⚡ 순수 파티클 CMD 내보내기 (.cmd)</span>
                      </div>
                      <span className="text-[9px] bg-[#FFE600] text-black px-1.5 py-0.5 font-bold">WIN CMD</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenGCodeModal) onOpenGCodeModal();
                        setActiveRibbon(null);
                      }}
                      className="p-2.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] font-bold text-xs uppercase flex items-center justify-between transition cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                      title="CNC 레이저 각인기 / 3D 프린터용 G-Code 및 XYZ 포인트 클라우드 내보내기 스튜디오"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#00F0FF]" />
                        <span>⚡ CNC 레이저 / 3D프린터 G-Code</span>
                      </div>
                      <span className="text-[9px] bg-[#00F0FF] text-black px-1.5 py-0.5 font-bold">CNC / XYZ</span>
                    </button>
                  </div>
                </div>

                {/* 6-2. Code Simulators & HTML Editor */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-[#FFE600] uppercase flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>02. 스크립트 코드 & HTML 수정기</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => {
                        onOpenHtmlEditor();
                        setActiveRibbon(null);
                      }}
                      className="p-2 bg-[#FF007F]/15 hover:bg-[#FF007F] hover:text-white border border-[#FF007F] text-[#FF007F] font-bold text-[10px] uppercase flex items-center gap-2 transition cursor-pointer"
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>기존 HTML 파티클 파일 열기 & 수정</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenPythonModal();
                        setActiveRibbon(null);
                      }}
                      className="p-2 bg-[#0A0A0C] hover:border-[#FFE600] hover:text-[#FFE600] border border-[#2A2A2E] text-gray-300 font-bold text-[10px] uppercase flex items-center gap-2 transition cursor-pointer"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#FFE600]" />
                      <span>Python 3D NumPy 시뮬레이터 코드</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenWasmModal();
                        setActiveRibbon(null);
                      }}
                      className="p-2 bg-[#0A0A0C] hover:border-[#00F0FF] border border-[#2A2A2E] text-gray-400 hover:text-white font-bold text-[10px] uppercase flex items-center gap-2 transition cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>C++ & WebAssembly SIMD 코드</span>
                    </button>
                  </div>
                </div>

                {/* 6-3. Manual & Viewport Controls */}
                <div className="space-y-3 bg-[#141418] border border-[#2A2A2E] p-3.5">
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>03. 공식 사용설명서 & 뷰포트</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => {
                        onOpenTheoryModal(1);
                        setActiveRibbon(null);
                      }}
                      className="p-2 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF] text-[#00F0FF] font-bold text-[10px] uppercase flex items-center gap-2 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>공식 사용설명서 (19P 기능별 조작·효과 완벽 총람)</span>
                    </button>

                    <button
                      onClick={() => {
                        onCaptureSnapshot();
                        setActiveRibbon(null);
                      }}
                      className="p-2 bg-[#0A0A0C] hover:border-[#00F0FF] border border-[#2A2A2E] text-gray-300 font-bold text-[10px] uppercase flex items-center gap-2 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>현재 3D 뷰포트 4K 스냅샷 저장 (PNG)</span>
                    </button>
                  </div>
                </div>

                {/* 6-4. Global State History & Snapshots */}
                <div className="space-y-3 bg-[#141418] border border-[#FFE600]/40 p-3.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#FFE600] uppercase flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-[#FFE600]" />
                        <span>04. 상태 히스토리 스택</span>
                      </div>
                      <span className="text-[9px] bg-[#FFE600]/20 text-[#FFE600] px-1.5 py-0.5 font-bold">
                        스택 {undoCount + redoCount + 1}
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 mb-2.5">
                      <button
                        onClick={() => onUndo && onUndo()}
                        disabled={!canUndo}
                        className={`p-2 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition border rounded-xs cursor-pointer ${
                          canUndo
                            ? 'bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'bg-[#0A0A0C] border-[#1F1F24] text-gray-600 cursor-not-allowed opacity-40'
                        }`}
                        title="실행 취소 (Ctrl+Z)"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Undo ({undoCount})</span>
                      </button>

                      <button
                        onClick={() => onRedo && onRedo()}
                        disabled={!canRedo}
                        className={`p-2 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition border rounded-xs cursor-pointer ${
                          canRedo
                            ? 'bg-[#FFE600]/15 hover:bg-[#FFE600] hover:text-black border-[#FFE600] text-[#FFE600] shadow-[0_0_10px_rgba(255,230,0,0.2)]'
                            : 'bg-[#0A0A0C] border-[#1F1F24] text-gray-600 cursor-not-allowed opacity-40'
                        }`}
                        title="다시 실행 (Ctrl+Y)"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                        <span>Redo ({redoCount})</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-gray-400 bg-[#0A0A0C] p-2 border border-[#1F1F24] space-y-1">
                      <div className="flex items-center justify-between text-gray-500 text-[9px]">
                        <span>◀ 직전 작업:</span>
                        <span className="text-[#00F0FF] truncate max-w-[120px] font-bold">{lastPastDescription || '없음'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 text-[9px]">
                        <span>▶ 다음 작업:</span>
                        <span className="text-[#FFE600] truncate max-w-[120px] font-bold">{nextFutureDescription || '없음'}</span>
                      </div>
                    </div>
                  </div>

                  {onClearHistory && (
                    <button
                      onClick={onClearHistory}
                      className="w-full py-1 text-[9px] text-gray-500 hover:text-red-400 border border-[#1F1F24] hover:border-red-500/40 bg-[#0A0A0C] flex items-center justify-center gap-1.5 transition cursor-pointer mt-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>히스토리 스택 초기화</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
