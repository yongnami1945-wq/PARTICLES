import React from 'react';
import { 
  Play, Pause, RotateCcw, Download, Code2, Globe,
  BookOpen, Cpu, Sparkles, Image as ImageIcon, Zap, Waves, Camera, FileCode2,
  Layers, HardDrive, Activity
} from 'lucide-react';
import { MorphConfig, PerformanceStats } from '../types';

interface HeaderProps {
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  sourceName: string;
  targetName: string;
  onOpenUpload: () => void;
  onOpenWebHub: () => void;
  onOpenHtmlEditor: () => void;
  onOpenPythonModal: () => void;
  onOpenWasmModal: () => void;
  onOpenTheoryModal: () => void;
  onOpenColorMixer: () => void;
  onCaptureSnapshot: () => void;
  onExportHtml: () => void;
  onExportPureHtml?: () => void;
  fps: number;
  stats?: PerformanceStats;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeConfig,
  sourceName,
  targetName,
  onOpenUpload,
  onOpenWebHub,
  onOpenHtmlEditor,
  onOpenPythonModal,
  onOpenWasmModal,
  onOpenTheoryModal,
  onOpenColorMixer,
  onCaptureSnapshot,
  onExportHtml,
  onExportPureHtml,
  fps,
  stats,
}) => {
  const activeVertices = stats?.vertexCount ?? config.particleCount ?? 60000;
  const formattedVertices = activeVertices >= 1000 
    ? `${(activeVertices / 1000).toFixed(0)}K` 
    : activeVertices.toString();
  const fullVerticesStr = activeVertices.toLocaleString();
  const vramMbStr = stats?.gpuMemoryMb ? `~${stats.gpuMemoryMb.toFixed(1)} MB` : '~18.4 MB';
  const vboMbStr = stats?.vboMemoryMb ? `${stats.vboMemoryMb.toFixed(1)} MB` : '3.9 MB';
  const renderBufferMbStr = stats?.renderBufferMemoryMb ? `${stats.renderBufferMemoryMb.toFixed(1)} MB` : '14.5 MB';
  return (
    <header className="h-14 sm:h-16 border-b border-[#2A2A2E] flex items-center justify-between px-3 sm:px-6 bg-[#0F0F12] font-mono text-[#E0E0E0] z-30 select-none flex-wrap gap-2">
      {/* Brand & Active Morph Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00F0FF] rounded-xs rotate-45 shadow-[0_0_10px_#00F0FF] flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-black -rotate-45" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold tracking-tighter uppercase text-white">
              Particle Morph 3D
            </span>
            <span className="text-[10px] bg-[#1A1A1E] px-2 py-0.5 rounded text-[#FFE600] border border-[#FFE600]/40 hidden md:inline-block font-bold">
              WebGL GPU + Python Engine
            </span>
          </div>
        </div>

        {/* Current Morph Pair Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-[#1A1A1E] border border-[#2A2A2E] px-3 py-1 text-[11px] text-gray-300">
          <span className="text-gray-500 uppercase">STAGE:</span>
          <span className="font-bold text-[#00F0FF] max-w-[90px] truncate">{sourceName}</span>
          <span className="text-gray-600 font-mono">──▶</span>
          <span className="font-bold text-white max-w-[90px] truncate">{targetName}</span>
        </div>
      </div>

      {/* Center Playback Quick Bar */}
      <div className="flex items-center gap-2 bg-[#1A1A1E] border border-[#2A2A2E] px-3 py-1">
        <button
          onClick={() => onChangeConfig({ isPlaying: !config.isPlaying })}
          className={`px-2.5 py-1 text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
            config.isPlaying
              ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_#00F0FF]'
              : 'bg-[#2A2A2E] text-white hover:bg-[#3A3A3E]'
          }`}
          title={config.isPlaying ? '일시 정지 (Pause)' : '실시간 애니메이션 재생 (Play)'}
        >
          {config.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span className="hidden md:inline">{config.isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          onClick={() => onChangeConfig({ progress: 0 })}
          className="p-1 bg-[#2A2A2E] hover:bg-[#3A3A3E] text-gray-300 hover:text-white transition cursor-pointer"
          title="처음으로 리셋"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {/* Quick progress slider */}
        <div className="flex items-center gap-2 px-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={config.progress}
            onChange={(e) => {
              onChangeConfig({ progress: parseFloat(e.target.value), isPlaying: false });
            }}
            className="w-20 sm:w-28 h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono text-[#00F0FF] w-8 text-right font-bold">
            {(config.progress * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine Switcher */}
        <div className="hidden sm:flex items-center bg-[#1A1A1E] border border-[#2A2A2E] p-0.5 text-[10px]">
          <button
            onClick={() => onChangeConfig({ engineMode: 'glsl' })}
            className={`px-2 py-1 font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              config.engineMode === 'glsl'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_6px_#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
            title="GPU WebGL Shader 즉시 가속 (브라우저 내장 100% 구동)"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>WebGL GPU</span>
          </button>
          <button
            onClick={() => onChangeConfig({ engineMode: 'wasm' })}
            className={`px-2 py-1 font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
              config.engineMode === 'wasm'
                ? 'bg-[#00F0FF] text-black shadow-[0_0_6px_#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
            title="브라우저 고속 SIMD JS 엔진"
          >
            <Cpu className="w-2.5 h-2.5" />
            <span>CPU JS</span>
          </button>
        </div>

        {/* Motion Trails Toggle Button */}
        <button
          onClick={() => onChangeConfig({ trailsEnabled: !config.trailsEnabled })}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border text-xs font-mono uppercase transition cursor-pointer ${
            config.trailsEnabled
              ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.25)]'
              : 'bg-[#1A1A1E] border-[#2A2A2E] text-gray-300 hover:border-gray-500'
          }`}
          title={config.trailsEnabled ? '궤적 렌더링 켜짐 (Ghost Trails Active)' : '파티클 궤적 렌더링 켜기'}
        >
          <Waves className={`w-3 h-3 ${config.trailsEnabled ? 'text-[#00F0FF] animate-pulse' : 'text-gray-400'}`} />
          <span className="hidden sm:inline">
            궤적 {config.trailsEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Web Particle Hub / particles.js Auto Importer Button */}
        <button
          onClick={onOpenWebHub}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF] text-xs font-mono uppercase text-[#00F0FF] transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          title="particles.js.org 및 인터넷 파티클 프리셋/JSON 자동 연동 웹 허브"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-bold">웹 허브</span>
        </button>

        {/* HTML Particle File Editor & Importer Button */}
        <button
          onClick={onOpenHtmlEditor}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FF007F]/15 hover:bg-[#FF007F] hover:text-white border border-[#FF007F] text-xs font-mono uppercase text-[#FF007F] transition cursor-pointer shadow-[0_0_12px_rgba(255,0,127,0.25)]"
          title="기존에 만들어진 HTML 파티클 파일을 열어 셰이더 및 파라미터를 수정하고 불러오기"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span className="font-bold">HTML 파일 수정</span>
        </button>

        {/* Color Mixing & Particle Shape Studio Modal Button */}
        <button
          onClick={onOpenColorMixer}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#2A2A2E] text-xs font-mono uppercase text-gray-200 transition cursor-pointer"
          title="파티클 종류 & 색혼합 실험실"
        >
          <div className="w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_6px_#00F0FF]" style={{ backgroundColor: config.colorA || '#00F0FF' }} />
          <span className="hidden sm:inline">색혼합 & 파티클</span>
        </button>

        {/* Upload Image Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#2A2A2E] text-xs font-mono uppercase text-gray-200 transition cursor-pointer"
        >
          <ImageIcon className="w-3 h-3 text-[#00F0FF]" />
          <span className="hidden sm:inline">이미지 변환</span>
        </button>

        {/* Python Script Exporter Button */}
        <button
          onClick={onOpenPythonModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#1A1A1E] hover:border-[#FFE600] hover:text-[#FFE600] border border-[#2A2A2E] text-xs font-mono uppercase text-gray-200 transition cursor-pointer"
          title="Python NumPy / Matplotlib 3D 파티클 시뮬레이터 코드 및 스크립트 다운로드"
        >
          <FileCode2 className="w-3.5 h-3.5 text-[#FFE600]" />
          <span className="hidden md:inline">Python 스크립트</span>
        </button>

        {/* C++ Code Button */}
        <button
          onClick={onOpenWasmModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] border border-[#2A2A2E] text-xs font-mono uppercase text-gray-400 hover:text-gray-200 transition cursor-pointer"
          title="C++ & WebAssembly Source Code Reference"
        >
          <Code2 className="w-3 h-3 text-gray-400" />
          <span className="hidden lg:inline">C++ 코드</span>
        </button>

        {/* Tech Theory / Docs / Manual */}
        <button
          onClick={onOpenTheoryModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF] text-xs font-mono uppercase text-[#00F0FF] transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          title="3D 파티클 몰핑 공식 사용설명서 (I:\다른 컴퓨터\내 Mac\yoonhtml\particleworld\particle-morphing-studio\사용설명서 - 13p~16p 신기능 포함)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-bold">사용설명서 (16P)</span>
        </button>

        {/* 3D Viewport Snapshot Capture Button */}
        <button
          onClick={onCaptureSnapshot}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] hover:text-[#00F0FF] border border-[#2A2A2E] text-xs font-mono uppercase text-gray-200 transition cursor-pointer"
          title="현재 3D 뷰포트 고해상도 스냅샷 캡처 및 이미지 다운로드 (PNG)"
        >
          <Camera className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span className="hidden sm:inline">스냅샷</span>
        </button>

        {/* Standalone HTML Export */}
        <button
          onClick={onExportHtml}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-[#00F0FF] hover:bg-white text-black text-xs font-bold uppercase transition-colors shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
          title="모든 HUD 컨트롤러가 포함된 단독 실행형 인터랙티브 HTML 파일 다운로드"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="tracking-tight">풀 HTML</span>
        </button>

        {/* Pure Particle Scene HTML Export */}
        <button
          onClick={onExportPureHtml}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] text-xs font-bold uppercase transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
          title="UI 컨트롤러 없이 지정한 배경색의 순수 3D 파티클 장면만 단독 실행되는 깔끔한 HTML 파일 다운로드"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="tracking-tight">✨ 순수 파티클</span>
        </button>

        {/* Real-time Hardware Telemetry HUD (Vertices, GPU VRAM, FPS) */}
        <div 
          className="hidden lg:flex items-center gap-2.5 bg-[#141418] border border-[#2A2A2E] px-2.5 py-1.5 text-[10px] font-mono select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] cursor-help"
          title={`[실시간 GPU 하드웨어 텔레메트리]\n• 활성 정점 수(Vertex Count): ${fullVerticesStr} Vertices\n• 총 GPU VRAM 점유량: ${vramMbStr}\n   - VBO 지오메트리 버퍼: ${vboMbStr}\n   - 렌더/프레임 버퍼: ${renderBufferMbStr}\n• 실시간 렌더링 속도: ${fps} FPS\n• 파티클 드로우 콜: ${stats?.drawCalls ?? 1}`}
        >
          {/* Active Vertex Count Display */}
          <div className="flex items-center gap-1.5 text-gray-300 border-r border-[#2A2A2E] pr-2.5">
            <Layers className="w-3 h-3 text-[#00F0FF]" />
            <span className="text-gray-400 text-[9px] uppercase hidden 2xl:inline">VTX:</span>
            <span className="text-[#00F0FF] font-bold tracking-tight">{fullVerticesStr}</span>
            <span className="text-[8px] text-gray-500 hidden xl:inline">vtx</span>
          </div>

          {/* Real-time GPU Memory Usage Display */}
          <div className="flex items-center gap-1.5 text-gray-300 border-r border-[#2A2A2E] pr-2.5">
            <HardDrive className="w-3 h-3 text-[#FFE600]" />
            <span className="text-gray-400 text-[9px] uppercase hidden 2xl:inline">VRAM:</span>
            <span className="text-[#FFE600] font-bold tracking-tight">{vramMbStr}</span>
          </div>

          {/* Real-time FPS Display */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              fps >= 50 ? 'bg-[#22c55e]' : fps >= 30 ? 'bg-[#eab308]' : 'bg-[#ef4444]'
            }`} />
            <span className="text-gray-400 text-[9px] uppercase hidden 2xl:inline">FPS:</span>
            <strong className="text-white font-bold">{fps}</strong>
          </div>
        </div>
      </div>
    </header>
  );
};
