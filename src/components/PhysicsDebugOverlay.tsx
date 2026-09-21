import React, { useState } from 'react';
import { 
  Activity, Zap, Eye, EyeOff, Sliders, 
  Layers, Compass, Disc, Wind, ChevronDown, ChevronUp, Radio
} from 'lucide-react';
import { MorphConfig, MorphShape } from '../types';
import { PhysicsDebugMetrics } from '../utils/physicsFieldVisualizer';

interface PhysicsDebugOverlayProps {
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  metrics: PhysicsDebugMetrics;
  sourceShape: MorphShape;
  targetShape: MorphShape;
}

export const PhysicsDebugOverlay: React.FC<PhysicsDebugOverlayProps> = ({
  config,
  onChangeConfig,
  metrics,
  sourceShape,
  targetShape,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const isEnabled = !!config.physicsDebugEnabled;

  const toggleMasterDebug = () => {
    onChangeConfig({ physicsDebugEnabled: !isEnabled });
  };

  return (
    <div className="absolute top-4 right-4 z-30 font-mono pointer-events-none select-none flex flex-col items-end gap-2 max-w-[340px] sm:max-w-[380px]">
      {/* Master Toggle Badge Button (Always Visible & Interactive) */}
      <div className="pointer-events-auto flex items-center gap-1.5 shadow-2xl">
        <button
          onClick={toggleMasterDebug}
          className={`px-3 py-1.5 border font-bold text-xs uppercase flex items-center gap-2 transition cursor-pointer backdrop-blur-md ${
            isEnabled
              ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.35)]'
              : 'bg-[#0A0A0C]/85 border-[#2A2A2E] text-gray-300 hover:border-[#00F0FF] hover:text-white'
          }`}
          title="물리 벡터 필드 및 인력/중력 디버그 오버레이 토글 (단축키: P)"
        >
          <Activity className={`w-3.5 h-3.5 ${isEnabled ? 'animate-pulse text-[#00FF66]' : 'text-gray-400'}`} />
          <span>물리 디버그 (PHYSICS DEBUG)</span>
          <span className={`text-[9px] px-1.5 py-0.2 font-bold ${isEnabled ? 'bg-[#00FF66] text-black' : 'bg-[#2A2A2E] text-gray-400'}`}>
            {isEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {isEnabled && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-[#0A0A0C]/85 border border-[#2A2A2E] hover:border-[#00FF66] text-gray-300 hover:text-white transition cursor-pointer backdrop-blur-md"
            title={isExpanded ? '패널 접기' : '패널 펼치기'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#00FF66]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#00FF66]" />}
          </button>
        )}
      </div>

      {/* Expanded Live Telemetry & Vector Control HUD */}
      {isEnabled && isExpanded && (
        <div className="pointer-events-auto w-full bg-[#0A0A0E]/92 border border-[#00FF66]/40 backdrop-blur-xl p-3.5 space-y-3.5 text-xs shadow-[0_8px_32px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header & Live Stream Status */}
          <div className="flex items-center justify-between border-b border-[#1F1F28] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              <span className="font-bold text-[11px] text-white tracking-wider uppercase">
                3D 벡터 포스 필드 모니터
              </span>
            </div>
            <span className="text-[9px] text-[#00FF66] bg-[#00FF66]/10 px-1.5 py-0.5 border border-[#00FF66]/30 font-bold">
              {metrics.activeVectorsCount.toLocaleString()} VECTORS
            </span>
          </div>

          {/* Real-time Force Gauges */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* 1. Attraction Force */}
            <div className="bg-[#121218] border border-[#FFE600]/30 p-2 space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1 text-[#FFE600] font-bold">
                  <Compass className="w-3 h-3" />
                  몰핑 인력 (F_attr)
                </span>
                <span className="font-bold text-white">{metrics.totalAttractionForce} N</span>
              </div>
              <div className="w-full bg-[#1F1F28] h-1.5 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#FFE600] h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, metrics.totalAttractionForce * 8)}%` }}
                />
              </div>
            </div>

            {/* 2. Noise Vorticity */}
            <div className="bg-[#121218] border border-[#00F0FF]/30 p-2 space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1 text-[#00F0FF] font-bold">
                  <Wind className="w-3 h-3" />
                  와류 세기 (∇×v)
                </span>
                <span className="font-bold text-white">{metrics.noiseVorticity} rad/s</span>
              </div>
              <div className="w-full bg-[#1F1F28] h-1.5 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#00F0FF] h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, metrics.noiseVorticity * 15)}%` }}
                />
              </div>
            </div>

            {/* 3. Gravity Field */}
            <div className="bg-[#121218] border border-[#FF007F]/30 p-2 space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1 text-[#FF007F] font-bold">
                  <Disc className="w-3 h-3" />
                  중력장 (F_grav)
                </span>
                <span className="font-bold text-white">{metrics.gravityMagnitude} G</span>
              </div>
              <div className="w-full bg-[#1F1F28] h-1.5 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#FF007F] h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (metrics.gravityMagnitude / (config.mouseGravityStrength || 3.5)) * 50)}%` }}
                />
              </div>
            </div>

            {/* 4. Net Kinetic Energy */}
            <div className="bg-[#121218] border border-[#00FF66]/30 p-2 space-y-1">
              <div className="flex justify-between items-center text-gray-400">
                <span className="flex items-center gap-1 text-[#00FF66] font-bold">
                  <Zap className="w-3 h-3" />
                  운동 에너지 (E_k)
                </span>
                <span className="font-bold text-white">{metrics.netKineticEnergy} J</span>
              </div>
              <div className="w-full bg-[#1F1F28] h-1.5 rounded-xs overflow-hidden">
                <div 
                  className="bg-[#00FF66] h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, metrics.netKineticEnergy * 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Layer Matrix Toggle Chips */}
          <div className="space-y-1.5 pt-1 border-t border-[#1F1F28]">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
              벡터 필드 레이어 선택 (LAYERS)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Noise Field Toggle */}
              <button
                onClick={() => onChangeConfig({ physicsDebugShowNoise: config.physicsDebugShowNoise === false ? true : false })}
                className={`p-1.5 border text-[9px] font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  config.physicsDebugShowNoise !== false
                    ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                    : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                  <span>노이즈 플로우</span>
                </div>
                <span>{config.physicsDebugShowNoise !== false ? 'ON' : 'OFF'}</span>
              </button>

              {/* Attraction Field Toggle */}
              <button
                onClick={() => onChangeConfig({ physicsDebugShowAttraction: config.physicsDebugShowAttraction === false ? true : false })}
                className={`p-1.5 border text-[9px] font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  config.physicsDebugShowAttraction !== false
                    ? 'bg-[#FFE600]/15 border-[#FFE600] text-[#FFE600]'
                    : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
                  <span>몰핑 인력선</span>
                </div>
                <span>{config.physicsDebugShowAttraction !== false ? 'ON' : 'OFF'}</span>
              </button>

              {/* Gravity Field Toggle */}
              <button
                onClick={() => onChangeConfig({ physicsDebugShowGravity: config.physicsDebugShowGravity === false ? true : false })}
                className={`p-1.5 border text-[9px] font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  config.physicsDebugShowGravity !== false
                    ? 'bg-[#FF007F]/15 border-[#FF007F] text-[#FF007F]'
                    : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF007F]" />
                  <span>중력 & 블랙홀</span>
                </div>
                <span>{config.physicsDebugShowGravity !== false ? 'ON' : 'OFF'}</span>
              </button>

              {/* Velocity Vectors Toggle */}
              <button
                onClick={() => onChangeConfig({ physicsDebugShowVelocity: config.physicsDebugShowVelocity === false ? true : false })}
                className={`p-1.5 border text-[9px] font-bold uppercase flex items-center justify-between transition cursor-pointer ${
                  config.physicsDebugShowVelocity !== false
                    ? 'bg-[#00FF66]/15 border-[#00FF66] text-[#00FF66]'
                    : 'bg-[#0A0A0C] border-[#2A2A2E] text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                  <span>입자 순간 속도</span>
                </div>
                <span>{config.physicsDebugShowVelocity !== false ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Tuning Sliders (Vector Scale & Density) */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1F1F28] text-[9px]">
            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>벡터 화살표 배율</span>
                <span className="text-[#00FF66] font-bold">{(config.physicsDebugVectorScale ?? 1.0).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.physicsDebugVectorScale ?? 1.0}
                onChange={(e) => onChangeConfig({ physicsDebugVectorScale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#1F1F28] appearance-none cursor-pointer accent-[#00FF66]"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-0.5">
                <span>샘플링 격자 밀도</span>
                <span className="text-[#00FF66] font-bold">{config.physicsDebugDensity ?? 6}³</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={config.physicsDebugDensity ?? 6}
                onChange={(e) => onChangeConfig({ physicsDebugDensity: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#1F1F28] appearance-none cursor-pointer accent-[#00FF66]"
              />
            </div>
          </div>

          {/* Optical Legend */}
          <div className="bg-[#101015] border border-[#2A2A2E] p-2 text-[8px] text-gray-400 space-y-1">
            <div className="font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>포스 벡터 범례 (VECTOR LEGEND)</span>
              <span className="text-[#00F0FF]">{sourceShape?.name?.slice(0, 10)} ➔ {targetShape?.name?.slice(0, 10)}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#00F0FF]" />
                <span className="text-gray-300">사이언: 3D 노이즈 와류장</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#FFE600]" />
                <span className="text-gray-300">골드: 타깃 형상 인력</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#FF007F]" />
                <span className="text-gray-300">마젠타: 마우스/블랙홀 중력</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#00FF66]" />
                <span className="text-gray-300">그린: 입자 합성 운동 벡터</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
