import React, { useState } from 'react';
import { 
  Grid, Compass, Box, Maximize, ChevronDown, ChevronUp
} from 'lucide-react';
import { MorphConfig, MorphShape } from '../types';

interface CoordinateGridOverlayProps {
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  sourceShape?: MorphShape;
  targetShape?: MorphShape;
}

export const CoordinateGridOverlay: React.FC<CoordinateGridOverlayProps> = ({
  config,
  onChangeConfig,
  sourceShape,
  targetShape,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const isEnabled = !!config.gridOverlayEnabled;
  const currentPlane = config.gridOverlayPlane || 'xz';
  const showAxes = config.gridOverlayShowAxes ?? true;
  const showBounds = config.gridOverlayShowBounds ?? true;
  const showLabels = config.gridOverlayShowLabels ?? true;
  const opacity = config.gridOverlayOpacity ?? 0.6;

  const toggleMasterGrid = () => {
    onChangeConfig({ gridOverlayEnabled: !isEnabled });
  };

  return (
    <div className="absolute top-14 left-4 z-30 font-mono pointer-events-none select-none flex flex-col items-start gap-2 max-w-[340px] sm:max-w-[380px]">
      {/* Master Toggle Badge Button */}
      <div className="pointer-events-auto flex items-center gap-1.5 shadow-2xl">
        <button
          onClick={toggleMasterGrid}
          className={`px-3 py-1.5 border font-bold text-xs uppercase flex items-center gap-2 transition cursor-pointer backdrop-blur-md ${
            isEnabled
              ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.35)]'
              : 'bg-[#0A0A0C]/85 border-[#2A2A2E] text-gray-300 hover:border-[#00F0FF] hover:text-white'
          }`}
          title="3D 형상 정렬 및 기준 좌표 그리드 오버레이 토글 (단축키: G)"
        >
          <Grid className={`w-3.5 h-3.5 ${isEnabled ? 'text-[#00F0FF] animate-pulse' : 'text-gray-400'}`} />
          <span>3D 좌표 그리드 (ALIGN GRID)</span>
          <span className={`text-[9px] px-1.5 py-0.2 font-bold ${isEnabled ? 'bg-[#00F0FF] text-black' : 'bg-[#2A2A2E] text-gray-400'}`}>
            {isEnabled ? 'ON' : 'OFF'}
          </span>
          <span className="text-[8px] opacity-60 ml-0.5">[G]</span>
        </button>

        {isEnabled && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-[#0A0A0C]/85 border border-[#2A2A2E] hover:border-[#00F0FF] text-gray-300 hover:text-white transition cursor-pointer backdrop-blur-md"
            title={isExpanded ? '패널 접기' : '패널 펼치기'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#00F0FF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF]" />}
          </button>
        )}
      </div>

      {/* Expanded Control & Alignment HUD */}
      {isEnabled && isExpanded && (
        <div className="pointer-events-auto w-full bg-[#0A0A0C]/90 border border-[#00F0FF]/60 p-3 backdrop-blur-md space-y-3 shadow-[0_4px_25px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-1 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#22222A] pb-2">
            <div className="flex items-center gap-1.5 text-[#00F0FF] font-bold text-[11px] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>형상 정밀 정렬 & 축 기준선</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
              <span>3D SPATIAL ALIGN</span>
            </div>
          </div>

          {/* Plane Selector Tabs */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-between">
              <span>기준 그리드 평면 (GRID PLANE)</span>
              <span className="text-[#FFE600] text-[9px]">
                {currentPlane === 'xz' ? 'XZ 바닥 (Ground)' :
                 currentPlane === 'xy' ? 'XY 정면 (Front/2D)' :
                 currentPlane === 'yz' ? 'YZ 측면 (Side/Profile)' : '전체 3D 케이지 (Full)'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => onChangeConfig({ gridOverlayPlane: 'xz' })}
                className={`py-1 px-1.5 text-[9px] font-bold uppercase border transition cursor-pointer text-center ${
                  currentPlane === 'xz'
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-[#141418] text-gray-400 border-[#2A2A2E] hover:text-white hover:border-gray-500'
                }`}
                title="XZ 바닥 수평 평면 (3D 프로시저럴 입체 형상 정렬에 최적)"
              >
                XZ 바닥
              </button>

              <button
                onClick={() => onChangeConfig({ gridOverlayPlane: 'xy' })}
                className={`py-1 px-1.5 text-[9px] font-bold uppercase border transition cursor-pointer text-center ${
                  currentPlane === 'xy'
                    ? 'bg-[#FF007F] text-white border-[#FF007F] shadow-[0_0_8px_rgba(255,0,127,0.4)]'
                    : 'bg-[#141418] text-gray-400 border-[#2A2A2E] hover:text-white hover:border-gray-500'
                }`}
                title="XY 정면 수직 평면 (2D 텍스트 및 이미지 로고 정렬에 최적)"
              >
                XY 정면
              </button>

              <button
                onClick={() => onChangeConfig({ gridOverlayPlane: 'yz' })}
                className={`py-1 px-1.5 text-[9px] font-bold uppercase border transition cursor-pointer text-center ${
                  currentPlane === 'yz'
                    ? 'bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.4)]'
                    : 'bg-[#141418] text-gray-400 border-[#2A2A2E] hover:text-white hover:border-gray-500'
                }`}
                title="YZ 측면 수직 평면 (측면 깊이 프로필 정렬에 최적)"
              >
                YZ 측면
              </button>

              <button
                onClick={() => onChangeConfig({ gridOverlayPlane: 'all' })}
                className={`py-1 px-1.5 text-[9px] font-bold uppercase border transition cursor-pointer text-center ${
                  currentPlane === 'all'
                    ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,0.4)]'
                    : 'bg-[#141418] text-gray-400 border-[#2A2A2E] hover:text-white hover:border-gray-500'
                }`}
                title="3개 축 평면 전체 표시 (3D 정밀 케이지 모드)"
              >
                3D 전체
              </button>
            </div>
          </div>

          {/* Sub-Feature Toggles */}
          <div className="space-y-1.5 pt-1 border-t border-[#1C1C24]">
            {/* RGB Axes Toggle */}
            <div className="flex items-center justify-between p-1.5 bg-[#121216] border border-[#222228]">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-200">
                <div className="flex items-center gap-0.5">
                  <span className="w-2 h-2 rounded-xs bg-[#FF0055]" title="X: Red" />
                  <span className="w-2 h-2 rounded-xs bg-[#00FF66]" title="Y: Green" />
                  <span className="w-2 h-2 rounded-xs bg-[#00F0FF]" title="Z: Blue" />
                </div>
                <span>RGB 3D 좌표축 (+X, +Y, +Z 화살표)</span>
              </div>
              <button
                onClick={() => onChangeConfig({ gridOverlayShowAxes: !showAxes })}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition cursor-pointer ${
                  showAxes
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]'
                    : 'bg-[#1A1A1E] text-gray-500 border-[#2A2A2E]'
                }`}
              >
                {showAxes ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Bounding Box Guide Toggle */}
            <div className="flex items-center justify-between p-1.5 bg-[#121216] border border-[#222228]">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-200">
                <Box className="w-3 h-3 text-[#00F0FF]" />
                <span>공간 바운딩 박스 & 중심점 피벗 (0,0,0)</span>
              </div>
              <button
                onClick={() => onChangeConfig({ gridOverlayShowBounds: !showBounds })}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition cursor-pointer ${
                  showBounds
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]'
                    : 'bg-[#1A1A1E] text-gray-500 border-[#2A2A2E]'
                }`}
              >
                {showBounds ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Scale Graduation Labels */}
            <div className="flex items-center justify-between p-1.5 bg-[#121216] border border-[#222228]">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-200">
                <Maximize className="w-3 h-3 text-[#FFE600]" />
                <span>거리 눈금자 라벨 (-10, -5, +5, +10)</span>
              </div>
              <button
                onClick={() => onChangeConfig({ gridOverlayShowLabels: !showLabels })}
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border transition cursor-pointer ${
                  showLabels
                    ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]'
                    : 'bg-[#1A1A1E] text-gray-500 border-[#2A2A2E]'
                }`}
              >
                {showLabels ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Grid Opacity Slider */}
          <div className="space-y-1 pt-1 border-t border-[#1C1C24]">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>그리드 투명도 (OPACITY)</span>
              <span className="text-white font-mono">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeConfig({ gridOverlayOpacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#1A1A1E] rounded appearance-none cursor-pointer accent-[#00F0FF]"
            />
          </div>

          {/* Active Shape Alignment Info */}
          {(sourceShape || targetShape) && (
            <div className="pt-2 border-t border-[#1C1C24] text-[9px] text-gray-400 space-y-0.5">
              <div className="flex justify-between">
                <span>출발 피사체:</span>
                <span className="text-[#00F0FF] font-bold truncate max-w-[150px]">{sourceShape?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>도착 피사체:</span>
                <span className="text-white font-bold truncate max-w-[150px]">{targetShape?.name}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
