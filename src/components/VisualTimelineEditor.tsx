import React, { useState, useRef } from 'react';
import { 
  GripVertical, ArrowRight, ArrowDown, Plus, Trash2, Copy, 
  ArrowLeftRight, Shuffle, Repeat, Zap, Play, Pause, 
  RotateCcw, Sparkles, ChevronLeft, ChevronRight, Check,
  Layers, MoveHorizontal, Disc, ChevronDown, ChevronUp,
  PanelLeft, PanelBottom, X, SlidersHorizontal
} from 'lucide-react';
import { MorphShape, MorphConfig, MorphEasing } from '../types';

export const EASING_OPTIONS: {
  id: MorphEasing;
  name: string;
  engName: string;
  desc: string;
  iconSvg: string;
  badge: string;
}[] = [
  {
    id: 'ease-in-out',
    name: '부드러운 가감속 (Ease In-Out)',
    engName: 'Ease In-Out',
    desc: '출발과 도착 시 부드러운 3차 S-커브 가감속 (권장 기본값)',
    iconSvg: 'M 2 22 C 14 22, 22 2, 34 2',
    badge: 'SMOOTH S-CURVE',
  },
  {
    id: 'linear',
    name: '선형 등속 (Linear)',
    engName: 'Linear',
    desc: '가속도 없이 일정한 등속도로 균일하게 전환',
    iconSvg: 'M 2 22 L 34 2',
    badge: 'UNIFORM CONSTANT',
  },
  {
    id: 'bounce',
    name: '탄성 바운스 (Bounce)',
    engName: 'Bounce',
    desc: '도착 지점에서 공이 튀어오르듯 다단 물리 바운딩',
    iconSvg: 'M 2 22 C 10 22, 16 2, 22 2 C 24 16, 26 22, 28 22 C 30 14, 32 22, 34 22',
    badge: 'ELASTIC REBOUND',
  },
  {
    id: 'elastic',
    name: '스프링 엘라스틱 (Elastic)',
    engName: 'Elastic',
    desc: '감쇠 진동 스프링 관성으로 경쾌하게 흔들리며 안착',
    iconSvg: 'M 2 22 C 8 22, 12 -4, 18 10 C 22 -2, 26 4, 34 2',
    badge: 'SPRING DAMPED',
  },
  {
    id: 'cubic-in',
    name: '급가속 진입 (Cubic In)',
    engName: 'Cubic In',
    desc: '초반에 서서히 움직이다가 후반에 폭발적으로 가속',
    iconSvg: 'M 2 22 Q 26 22, 34 2',
    badge: 'FAST IN',
  },
  {
    id: 'cubic-out',
    name: '감속 안착 (Cubic Out)',
    engName: 'Cubic Out',
    desc: '빠르게 도달한 뒤 목표 정점에서 부드럽게 감속',
    iconSvg: 'M 2 22 Q 10 2, 34 2',
    badge: 'SMOOTH OUT',
  },
  {
    id: 'back-out',
    name: '오버슈트 앤 리턴 (Back Out)',
    engName: 'Back Out',
    desc: '목표 정점을 살짝 지나친 후 탄성으로 되돌아와 안착',
    iconSvg: 'M 2 22 C 14 14, 22 -8, 28 -2 C 30 0, 32 2, 34 2',
    badge: 'OVERSHOOT',
  },
];

interface VisualTimelineEditorProps {
  shapes: MorphShape[];
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds: string[];
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
  onAddWaypoint: (shapeId?: string) => void;
  onRemoveWaypoint: (index: number) => void;
  onUpdateWaypoint: (index: number, shapeId: string) => void;
  onReorderChain: (newChainIds: string[]) => void;
  onSwapShapes: () => void;
  className?: string;
  isCompact?: boolean;
  placement?: 'bottom' | 'side';
  onChangePlacement?: (placement: 'bottom' | 'side') => void;
  onClose?: () => void;
}

// Preset Multi-Stage Sequence Templates for rapid creation
const SEQUENCE_TEMPLATES: { name: string; desc: string; ids: string[]; badge: string }[] = [
  {
    name: '🌌 우주와 생명 4단계 대서사',
    desc: '자유 부유 입자장 ➔ 토성 ➔ 코스믹 은하 ➔ DNA 이중 나선',
    ids: ['cosmic-drift', 'saturn', 'galaxy', 'dna'],
    badge: 'COSMOS 4-STAGE',
  },
  {
    name: '🦅 생체 비행 & 초공간 4단계',
    desc: 'GPGPU 군집 비행 ➔ 천사 날개 ➔ 스타쉽 ➔ 뫼비우스 매듭',
    ids: ['flocking-birds', 'wings', 'starship', 'trefoil'],
    badge: 'FLIGHT 4-STAGE',
  },
  {
    name: '✍️ 타이포그래피 & 사이버 네온 4단계',
    desc: 'HY태고딕 2D ➔ 사이버 스컬 ➔ 다이아몬드 ➔ 3D 네온 하트',
    ids: ['text-hygothic', 'skull', 'diamond', 'heart'],
    badge: 'CYBER 4-STAGE',
  },
  {
    name: '🍩 기하학 5단계 완전 순환 루프',
    desc: '양자 에너지장 ➔ 토러스 ➔ 구체 ➔ 생명의 나무 ➔ 양자 에너지장',
    ids: ['quantum-field', 'torus', 'sphere', 'tree', 'quantum-field'],
    badge: 'GEOMETRY 5-LOOP',
  },
];

export const VisualTimelineEditor: React.FC<VisualTimelineEditorProps> = ({
  shapes,
  sourceShapeId,
  targetShapeId,
  waypointShapeIds,
  config,
  onChangeConfig,
  onSelectSource,
  onSelectTarget,
  onAddWaypoint,
  onRemoveWaypoint,
  onUpdateWaypoint,
  onReorderChain,
  onSwapShapes,
  className = '',
  isCompact = false,
  placement = 'bottom',
  onChangePlacement,
  onClose,
}) => {
  const isSideMode = placement === 'side';
  const [isEasingExpanded, setIsEasingExpanded] = useState<boolean>(false);
  const [isTemplatesExpanded, setIsTemplatesExpanded] = useState<boolean>(false);

  // Construct linear array of IDs for the complete chain
  const chainIds = [sourceShapeId, ...(waypointShapeIds || []), targetShapeId];
  const numStages = chainIds.length;
  const numSegments = Math.max(1, numStages - 1);

  // Drag & Drop local state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(null);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...chainIds];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    onReorderChain(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle Drag End
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move Station Left
  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const updated = [...chainIds];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onReorderChain(updated);
  };

  // Move Station Right
  const handleMoveRight = (index: number) => {
    if (index >= chainIds.length - 1) return;
    const updated = [...chainIds];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onReorderChain(updated);
  };

  // Duplicate a station at index
  const handleDuplicateStation = (index: number) => {
    const shapeIdToDup = chainIds[index];
    const updated = [...chainIds];
    updated.splice(index + 1, 0, shapeIdToDup);
    onReorderChain(updated);
  };

  // Insert a new shape at specific index
  const handleInsertStationAt = (index: number, shapeId?: string) => {
    const nextId = shapeId || shapes[Math.floor(Math.random() * shapes.length)]?.id || shapes[0]?.id;
    const updated = [...chainIds];
    updated.splice(index, 0, nextId);
    onReorderChain(updated);
  };

  // Remove a station at index
  const handleRemoveStationAt = (index: number) => {
    if (chainIds.length <= 2) {
      alert('모핑 체인은 최소 출발과 목표 2개 이상의 피사체가 필요합니다.');
      return;
    }
    const updated = chainIds.filter((_, i) => i !== index);
    onReorderChain(updated);
  };

  // Reverse entire sequence
  const handleReverseEntireChain = () => {
    const reversed = [...chainIds].reverse();
    onReorderChain(reversed);
  };

  // Close Loop (Make seamless circular sequence by appending start shape to the end)
  const handleCloseLoop = () => {
    const firstShapeId = chainIds[0];
    if (chainIds[chainIds.length - 1] === firstShapeId) {
      alert('이미 시작 피사체와 끝 피사체가 일치하여 순환 루프 상태입니다.');
      return;
    }
    const updated = [...chainIds, firstShapeId];
    onReorderChain(updated);
  };

  // Shuffle sequence (Randomize intermediate waypoints or entire chain)
  const handleShuffleChain = () => {
    if (chainIds.length <= 2) {
      onSwapShapes();
      return;
    }
    const start = chainIds[0];
    const end = chainIds[chainIds.length - 1];
    const middle = chainIds.slice(1, chainIds.length - 1);
    
    // Fisher-Yates shuffle on middle
    for (let i = middle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [middle[i], middle[j]] = [middle[j], middle[i]];
    }
    onReorderChain([start, ...middle, end]);
  };

  // Load a sequence template
  const handleApplyTemplate = (templateIds: string[]) => {
    // Filter to available shapes
    const validIds = templateIds.filter((id) => shapes.some((s) => s.id === id));
    if (validIds.length >= 2) {
      onReorderChain(validIds);
    }
  };

  return (
    <div className={`bg-[#0E0E12] border border-[#26262E] p-3 space-y-2.5 select-none font-mono ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#222228]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/40">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>{isSideMode ? '타임라인 시퀀스' : '비주얼 타임라인 시퀀스 에디터'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#1A1A24] text-[#00F0FF] border border-[#00F0FF]/30">
                {numStages}단계
              </span>
            </div>
            {!isSideMode && (
              <div className="text-[9px] text-gray-400">
                드래그 앤 드롭으로 출발·경유·목표 피사체의 모핑 순서를 실시간 재배치합니다.
              </div>
            )}
          </div>
        </div>

        {/* Global Sequence Actions & Placement Mode Controls */}
        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
          <button
            onClick={() => handleInsertStationAt(chainIds.length - 1)}
            className="px-2 py-1 bg-[#FFE600]/15 hover:bg-[#FFE600] hover:text-black text-[#FFE600] border border-[#FFE600] text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer shadow-[0_0_8px_rgba(255,230,0,0.15)]"
            title="새로운 경유 피사체를 시퀀스에 추가합니다"
          >
            <Plus className="w-3 h-3" />
            <span>+ 경유</span>
          </button>

          <button
            onClick={handleReverseEntireChain}
            className="px-1.5 py-1 bg-[#1A1A22] hover:bg-[#2A2A35] text-gray-300 hover:text-white border border-[#33333E] text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            title="전체 모핑 경로 순서를 거꾸로 반전합니다 (출발 ↔ 목표 ↔ 경유지 전체 역순)"
          >
            <ArrowLeftRight className="w-3 h-3 text-[#00F0FF]" />
            <span>반전</span>
          </button>

          <button
            onClick={handleCloseLoop}
            className="px-1.5 py-1 bg-[#1A1A22] hover:bg-[#2A2A35] text-gray-300 hover:text-white border border-[#33333E] text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            title="시작 피사체를 마지막 끝에 추가하여 끊김 없는 360도 무한 순환 루프를 형성합니다"
          >
            <Repeat className="w-3 h-3 text-[#FFE600]" />
            <span>루프</span>
          </button>

          <button
            onClick={handleShuffleChain}
            className="px-1.5 py-1 bg-[#1A1A22] hover:bg-[#2A2A35] text-gray-300 hover:text-white border border-[#33333E] text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            title="경유 피사체들의 순서를 무작위로 섞습니다"
          >
            <Shuffle className="w-3 h-3 text-[#FF007F]" />
            <span>셔플</span>
          </button>

          {/* Placement Switcher (Side vs Bottom) */}
          {onChangePlacement && (
            <div className="flex items-center bg-[#15151C] border border-[#2B2B36] p-0.5 rounded text-[10px]">
              <button
                type="button"
                onClick={() => onChangePlacement('side')}
                className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer font-bold ${
                  isSideMode
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_#00F0FF]'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="사이드 패널로 배치 (하단메뉴바 및 3D 캔버스와 겹치지 않음)"
              >
                <PanelLeft className="w-3 h-3" />
                <span className="hidden sm:inline">사이드</span>
              </button>
              <button
                type="button"
                onClick={() => onChangePlacement('bottom')}
                className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer font-bold ${
                  !isSideMode
                    ? 'bg-[#FFE600] text-black shadow-[0_0_8px_#FFE600]'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="하단 도크로 배치"
              >
                <PanelBottom className="w-3 h-3" />
                <span className="hidden sm:inline">하단</span>
              </button>
            </div>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#262632] rounded transition cursor-pointer ml-0.5"
              title="타임라인 에디터 닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Drag-and-Drop Sequence Rail */}
      <div className="relative py-1">
        <div
          className={
            isSideMode
              ? 'flex flex-col gap-2 max-h-[36vh] sm:max-h-[40vh] overflow-y-auto pr-1.5 custom-scrollbar py-1'
              : 'flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2.5 pt-1 px-1'
          }
        >
          {chainIds.map((shapeId, index) => {
            const shape = shapes.find((s) => s.id === shapeId) || {
              id: shapeId,
              name: '알 수 없는 피사체',
              type: 'custom',
            };

            const isStart = index === 0;
            const isEnd = index === chainIds.length - 1;
            const isWaypoint = !isStart && !isEnd;
            const isDragging = draggedIndex === index;
            const isDropTarget = dragOverIndex === index;

            // Calculated progress milestone for this station
            const milestoneProgress = index / numSegments;
            const isCurrentlyActive = Math.abs(config.progress - milestoneProgress) < (0.5 / numSegments);

            return (
              <React.Fragment key={`timeline-station-${index}-${shapeId}`}>
                {/* Visual Inter-stage Arrow & Quick Insert Dropzone */}
                {index > 0 && (
                  isSideMode ? (
                    <div className="flex items-center justify-center shrink-0 py-0.5 relative group/arrow">
                      <div className="flex items-center text-gray-600 group-hover/arrow:text-[#00F0FF] transition font-mono text-xs">
                        <ArrowDown className="w-3.5 h-3.5 text-[#00F0FF]/60" />
                      </div>
                      <button
                        onClick={() => handleInsertStationAt(index)}
                        className="opacity-0 group-hover/arrow:opacity-100 absolute right-2 px-1.5 py-0.5 bg-[#00F0FF] text-black text-[8px] font-bold rounded transition shadow-[0_0_8px_#00F0FF] cursor-pointer hover:scale-105"
                        title="이 사이에 새로운 경유 피사체 삽입"
                      >
                        + 경유 삽입
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center shrink-0 px-0.5 group/arrow relative">
                      <div className="flex items-center text-gray-600 group-hover/arrow:text-[#00F0FF] transition font-mono text-xs">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      {/* Quick Insert (+) Button between stages */}
                      <button
                        onClick={() => handleInsertStationAt(index)}
                        className="opacity-0 group-hover/arrow:opacity-100 absolute -top-2 px-1.5 py-0.5 bg-[#00F0FF] text-black text-[8px] font-bold rounded-full transition shadow-[0_0_8px_#00F0FF] cursor-pointer hover:scale-110"
                        title="이 사이에 새로운 경유 피사체 삽입"
                      >
                        +
                      </button>
                    </div>
                  )
                )}

                {/* Draggable Station Card */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`shrink-0 ${
                    isSideMode ? 'w-full p-2' : 'w-52 p-2.5'
                  } border-2 transition-all duration-200 relative group cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? 'opacity-40 scale-95 border-dashed border-gray-400 bg-[#1F1F28]'
                      : isDropTarget
                      ? 'border-[#00F0FF] scale-105 bg-[#00F0FF]/15 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                      : isStart
                      ? 'border-[#00F0FF] bg-[#0A0E14] shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : isEnd
                      ? 'border-white bg-[#121216] shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                      : 'border-amber-400 bg-[#16140E] shadow-[0_0_12px_rgba(255,230,0,0.12)]'
                  }`}
                >
                  {/* Top Bar: Grip Handle, Station Tag & Quick Actions */}
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase mb-1.5">
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition" />
                      <span
                        className={`px-1.5 py-0.5 border font-mono ${
                          isStart
                            ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50'
                            : isEnd
                            ? 'bg-white/20 text-white border-white/50'
                            : 'bg-amber-400/20 text-amber-400 border-amber-400/50'
                        }`}
                      >
                        {isStart ? '01. 출발 (START)' : isEnd ? `0${index + 1}. 목표 (TARGET)` : `경유 0${index} (WP)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      {/* Move Left Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLeft(index);
                        }}
                        disabled={index === 0}
                        className={`p-0.5 rounded transition ${
                          index === 0
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white hover:bg-[#2A2A35]'
                        }`}
                        title="왼쪽 앞으로 이동"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>

                      {/* Move Right Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveRight(index);
                        }}
                        disabled={index === chainIds.length - 1}
                        className={`p-0.5 rounded transition ${
                          index === chainIds.length - 1
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white hover:bg-[#2A2A35]'
                        }`}
                        title="오른쪽 뒤로 이동"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {/* Duplicate Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateStation(index);
                        }}
                        className="p-0.5 text-gray-400 hover:text-[#00F0FF] hover:bg-[#2A2A35] rounded transition"
                        title="이 스테이션 복제"
                      >
                        <Copy className="w-3 h-3" />
                      </button>

                      {/* Delete Button (Allowed if chain > 2) */}
                      {chainIds.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStationAt(index);
                          }}
                          className="p-0.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded transition"
                          title="이 스테이션 제거"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Station Shape Name & Selector */}
                  <div className="space-y-1">
                    <select
                      value={shapeId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        const updated = [...chainIds];
                        updated[index] = newId;
                        onReorderChain(updated);
                      }}
                      className={`w-full bg-[#070709] border text-xs font-bold p-1.5 outline-none cursor-pointer truncate ${
                        isStart
                          ? 'border-[#00F0FF]/60 text-[#00F0FF]'
                          : isEnd
                          ? 'border-white/60 text-white'
                          : 'border-amber-400/60 text-amber-300'
                      }`}
                    >
                      {shapes.map((s) => (
                        <option key={`st-opt-${index}-${s.id}`} value={s.id}>
                          {s.name} ({s.type})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between text-[9px] text-gray-400 px-0.5">
                      <span className="truncate">{shape.description || shape.type}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeConfig({ progress: milestoneProgress, isPlaying: false });
                        }}
                        className={`font-mono text-[9px] px-1 py-0.2 rounded transition cursor-pointer ${
                          isCurrentlyActive
                            ? 'bg-[#00F0FF] text-black font-bold'
                            : 'text-gray-500 hover:text-[#00F0FF]'
                        }`}
                        title="이 정점 진행도로 뷰포트 점프"
                      >
                        {Math.round(milestoneProgress * 100)}%
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Morph Easing & Acceleration Curve Settings */}
      <div className="pt-2 border-t border-[#222228]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-[#FFE600] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>모핑 가속도 이징 곡선</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/40 font-mono">
              {(config.morphEasing || 'ease-in-out').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick compact select dropdown */}
            <select
              value={config.morphEasing || 'ease-in-out'}
              onChange={(e) => onChangeConfig({ morphEasing: e.target.value as MorphEasing })}
              className="bg-[#121216] border border-[#2A2A35] text-[10px] text-gray-200 px-2 py-0.5 rounded cursor-pointer font-mono"
            >
              {EASING_OPTIONS.map((opt) => (
                <option key={`easing-sel-${opt.id}`} value={opt.id}>
                  {opt.engName} ({opt.badge})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsEasingExpanded(!isEasingExpanded)}
              className="text-[9px] font-bold text-gray-300 hover:text-[#FFE600] flex items-center gap-1 bg-[#16161E] hover:bg-[#1E1E28] border border-[#282834] px-2 py-0.5 cursor-pointer transition"
            >
              <span>{isEasingExpanded ? '곡선 접기' : '곡선 7종 펼치기'}</span>
              {isEasingExpanded ? <ChevronUp className="w-3 h-3 text-[#FFE600]" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Easing Options Grid (Expanded view) */}
        {isEasingExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 pt-1">
            {EASING_OPTIONS.map((easing) => {
              const isSelected = (config.morphEasing || 'ease-in-out') === easing.id;
              return (
                <button
                  key={`easing-btn-${easing.id}`}
                  onClick={() => onChangeConfig({ morphEasing: easing.id })}
                  className={`p-2 border text-left transition flex flex-col justify-between cursor-pointer rounded-none group ${
                    isSelected
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                      : 'bg-[#101014] hover:bg-[#16161C] border-[#26262E] hover:border-gray-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[8px] font-mono uppercase font-bold ${
                        isSelected ? 'text-[#00F0FF]' : 'text-gray-500 group-hover:text-gray-400'
                      }`}>
                        {easing.badge}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
                      )}
                    </div>

                    {/* SVG Curve Thumbnail Visualizer */}
                    <div className={`h-8 w-full flex items-center justify-center border mb-1.5 bg-[#050508] ${
                      isSelected ? 'border-[#00F0FF]/40' : 'border-[#1C1C22]'
                    }`}>
                      <svg viewBox="0 0 36 24" className="w-full h-full p-1">
                        {/* Grid background reference lines */}
                        <line x1="2" y1="22" x2="34" y2="22" stroke="#222228" strokeWidth="0.5" />
                        <line x1="2" y1="2" x2="34" y2="2" stroke="#222228" strokeWidth="0.5" strokeDasharray="1,1" />
                        <line x1="2" y1="2" x2="2" y2="22" stroke="#222228" strokeWidth="0.5" />
                        <line x1="34" y1="2" x2="34" y2="22" stroke="#222228" strokeWidth="0.5" />
                        {/* Curve Path */}
                        <path
                          d={easing.iconSvg}
                          fill="none"
                          stroke={isSelected ? '#00F0FF' : '#888899'}
                          strokeWidth={isSelected ? '2' : '1.2'}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className={`font-bold text-[10px] truncate ${
                      isSelected ? 'text-[#00F0FF]' : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {easing.engName}
                    </div>
                  </div>

                  <div className="text-[8px] text-gray-400 leading-tight mt-1 line-clamp-2">
                    {easing.desc}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Preset Cinematic Templates Strip */}
      <div className="pt-2 border-t border-[#222228]">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#FFE600]" />
            <span>원클릭 시퀀스 템플릿 (4종)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsTemplatesExpanded(!isTemplatesExpanded)}
            className="text-[9px] font-bold text-gray-300 hover:text-[#FFE600] flex items-center gap-1 bg-[#16161E] hover:bg-[#1E1E28] border border-[#282834] px-2 py-0.5 cursor-pointer transition"
          >
            <span>{isTemplatesExpanded ? '템플릿 접기' : '템플릿 4종 펼치기'}</span>
            {isTemplatesExpanded ? <ChevronUp className="w-3 h-3 text-[#FFE600]" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Templates Grid (Expanded view) */}
        {isTemplatesExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
            {SEQUENCE_TEMPLATES.map((tmpl, tIdx) => (
              <button
                key={`seq-tmpl-${tIdx}`}
                onClick={() => handleApplyTemplate(tmpl.ids)}
                className="p-2 bg-[#121216] hover:bg-[#181822] border border-[#282834] hover:border-[#FFE600] text-left transition flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-[8px] font-mono text-[#FFE600] mb-0.5">
                    <span className="font-bold">{tmpl.badge}</span>
                    <span className="opacity-70 group-hover:opacity-100 group-hover:text-white">적용 ➔</span>
                  </div>
                  <div className="font-bold text-[10px] text-gray-200 group-hover:text-white truncate">
                    {tmpl.name}
                  </div>
                </div>
                <div className="text-[8px] text-gray-500 truncate mt-1">
                  {tmpl.desc}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
