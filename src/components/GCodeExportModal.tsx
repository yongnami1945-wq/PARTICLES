import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, FileCode2, Zap, Settings, Eye, Copy, 
  Check, Play, Layers, Maximize2, Sparkles, Sliders, 
  RotateCcw, Info, Cpu, HardDrive
} from 'lucide-react';
import { 
  GCodeExportOptions, XYZExportOptions, generateGCode, 
  exportGCodeFile, exportPointCloudXYZ, exportPointCloudCSV, 
  exportPointCloudPLY, exportPointCloudOBJ, prepareCNCPoints, GCodeStats 
} from '../utils/pointCloudExporter';
import { MorphShape } from '../types';

interface GCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceShape: MorphShape;
  targetShape: MorphShape;
  morphProgress: number;
  particleCount: number;
}

export const GCodeExportModal: React.FC<GCodeExportModalProps> = ({
  isOpen,
  onClose,
  sourceShape,
  targetShape,
  morphProgress,
  particleCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'gcode' | 'xyz' | 'preview'>('gcode');

  // G-Code Options State
  const [gcodeOptions, setGcodeOptions] = useState<GCodeExportOptions>({
    mode: 'laser_pulse',
    dialect: 'grbl',
    bedWidth: 200,
    bedHeight: 200,
    origin: 'center',
    scaleMm: 120,
    maxPoints: 3000,
    laserPowerMax: 1000,
    laserPowerMin: 0,
    feedrateEngrave: 1500,
    feedrateTravel: 4000,
    pulseDwellMs: 8,
    enableZRelief: false,
    zMaxDepth: 5.0,
    zSafeHeight: 3.0,
    invertPower: false
  });

  // XYZ Options State
  const [xyzOptions, setXyzOptions] = useState<XYZExportOptions>({
    includeColors: true,
    delimiter: 'space',
    maxPoints: 10000
  });

  // Calculate Interpolated Static Positions and Colors at current progress
  const getInterpolatedBuffer = () => {
    const count = particleCount || 40000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const srcPos = sourceShape.positions;
    const dstPos = targetShape.positions;
    const srcCol = sourceShape.colors;
    const dstCol = targetShape.colors;
    const t = morphProgress;

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

    return { pos, col };
  };

  const [generatedResult, setGeneratedResult] = useState<{ gcode: string; stats: GCodeStats } | null>(null);

  // Generate GCode & Stats whenever parameters change
  useEffect(() => {
    if (!isOpen) return;
    const { pos, col } = getInterpolatedBuffer();
    const result = generateGCode(pos, col, gcodeOptions);
    setGeneratedResult(result);
  }, [isOpen, gcodeOptions, sourceShape, targetShape, morphProgress, particleCount]);

  // Draw 2D Machine Bed & Laser Toolpath Simulation
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !generatedResult) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(0, 0, width, height);

    const bedW = gcodeOptions.bedWidth;
    const bedH = gcodeOptions.bedHeight;
    const pad = 30;
    const availW = width - pad * 2;
    const availH = height - pad * 2;
    const bedScale = Math.min(availW / bedW, availH / bedH);

    const bedPixelW = bedW * bedScale;
    const bedPixelH = bedH * bedScale;
    const bedStartX = (width - bedPixelW) / 2;
    const bedStartY = (height - bedPixelH) / 2;

    // Bed Grid
    ctx.fillStyle = '#10121A';
    ctx.fillRect(bedStartX, bedStartY, bedPixelW, bedPixelH);
    ctx.strokeStyle = '#1E2230';
    ctx.lineWidth = 1;

    // Grid lines every 20mm
    const gridStep = 20 * bedScale;
    for (let x = bedStartX; x <= bedStartX + bedPixelW; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, bedStartY);
      ctx.lineTo(x, bedStartY + bedPixelH);
      ctx.stroke();
    }
    for (let y = bedStartY; y <= bedStartY + bedPixelH; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(bedStartX, y);
      ctx.lineTo(bedStartX + bedPixelW, y);
      ctx.stroke();
    }

    // Bed Outer Border
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bedStartX, bedStartY, bedPixelW, bedPixelH);

    // Bed Center Axis
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(bedStartX + bedPixelW / 2, bedStartY);
    ctx.lineTo(bedStartX + bedPixelW / 2, bedStartY + bedPixelH);
    ctx.moveTo(bedStartX, bedStartY + bedPixelH / 2);
    ctx.lineTo(bedStartX + bedPixelW, bedStartY + bedPixelH / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Origin (0,0) Marker
    const originX = gcodeOptions.origin === 'center' ? bedStartX + bedPixelW / 2 : bedStartX;
    const originY = gcodeOptions.origin === 'center' ? bedStartY + bedPixelH / 2 : bedStartY + bedPixelH;

    ctx.fillStyle = '#FFE600';
    ctx.beginPath();
    ctx.arc(originX, originY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFE600';
    ctx.font = '9px monospace';
    ctx.fillText('ORIGIN (0,0)', originX + 7, originY - 4);

    // Prepare point coordinates
    const { pos, col } = getInterpolatedBuffer();
    const { points } = prepareCNCPoints(pos, col, gcodeOptions);

    // Draw Toolpaths or Laser Points
    if (gcodeOptions.mode === 'laser_vector') {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const px = originX + pt.x * bedScale;
        const py = originY - pt.y * bedScale; // Invert Y for CNC bed
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Draw Laser Pulse Dots
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const px = originX + pt.x * bedScale;
      const py = originY - pt.y * bedScale;

      const normP = pt.power / (gcodeOptions.laserPowerMax || 1000);
      const dotRadius = Math.max(0.8, normP * 2.2);

      if (gcodeOptions.mode === 'laser_pulse') {
        ctx.fillStyle = normP > 0.6 ? '#00F0FF' : normP > 0.3 ? '#FF007F' : '#64748B';
      } else {
        ctx.fillStyle = '#00F0FF';
      }
      ctx.fillRect(px - dotRadius / 2, py - dotRadius / 2, dotRadius, dotRadius);
    }

    // Work Area Boundary Box
    if (generatedResult.stats.boundsMm) {
      const b = generatedResult.stats.boundsMm;
      const bMinPxX = originX + b.minX * bedScale;
      const bMaxPxX = originX + b.maxX * bedScale;
      const bMinPxY = originY - b.maxY * bedScale;
      const bMaxPxY = originY - b.minY * bedScale;

      ctx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(bMinPxX, bMinPxY, bMaxPxX - bMinPxX, bMaxPxY - bMinPxY);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 230, 0, 0.9)';
      ctx.font = '8.5px monospace';
      ctx.fillText(`${b.sizeX}mm × ${b.sizeY}mm`, bMinPxX + 4, bMinPxY - 4);
    }

    // Bed info text
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px monospace';
    ctx.fillText(`MACHINE BED: ${bedW}mm × ${bedH}mm`, bedStartX + 6, bedStartY + 14);
  }, [isOpen, generatedResult, gcodeOptions]);

  if (!isOpen) return null;

  const handleCopyGCode = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult.gcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadGCode = (extension: 'gcode' | 'nc' | 'tap') => {
    const { pos, col } = getInterpolatedBuffer();
    const filename = `laser_cnc_${sourceShape.id}_t${Math.floor(morphProgress * 100)}_${gcodeOptions.mode}.${extension}`;
    exportGCodeFile(pos, col, filename, gcodeOptions);
  };

  const handleDownloadXYZ = () => {
    const { pos, col } = getInterpolatedBuffer();
    const filename = `point_cloud_${sourceShape.id}_t${Math.floor(morphProgress * 100)}.xyz`;
    exportPointCloudXYZ(pos, col, filename, xyzOptions);
  };

  const handleDownloadCSV = () => {
    const { pos, col } = getInterpolatedBuffer();
    const filename = `point_cloud_${sourceShape.id}_t${Math.floor(morphProgress * 100)}.csv`;
    exportPointCloudCSV(pos, col, filename, xyzOptions);
  };

  const handleDownloadPLY = () => {
    const { pos, col } = getInterpolatedBuffer();
    const filename = `point_cloud_${sourceShape.id}_t${Math.floor(morphProgress * 100)}.ply`;
    exportPointCloudPLY(pos, col, filename);
  };

  const handleDownloadOBJ = () => {
    const { pos, col } = getInterpolatedBuffer();
    const filename = `point_cloud_${sourceShape.id}_t${Math.floor(morphProgress * 100)}.obj`;
    exportPointCloudOBJ(pos, col, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0D0D12] border border-[#00F0FF]/50 w-full max-w-5xl rounded-xs shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] text-[#E0E0E0] font-mono select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2E] bg-[#08080C]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#00F0FF]/15 border border-[#00F0FF] flex items-center justify-center shadow-[0_0_10px_#00F0FF]">
              <Zap className="w-4 h-4 text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  CNC 레이저 각인 & 3D 프린터 정점 내보내기 (G-Code & Point Cloud)
                </h2>
                <span className="text-[9px] bg-[#00F0FF] text-black font-bold px-1.5 py-0.2">
                  CNC V3.5
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                현재 3D 파티클 형상(진행도: {Math.round(morphProgress * 100)}%)을 CNC 레이저 조각기(LaserGRBL, LightBurn) 및 3D 프린터, CAD/CAM 소프트웨어 표준 파일로 변환합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1F1F24] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* Left: 2D Machine Bed Simulation Visualizer (5 Cols) */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-[#2A2A2E] bg-[#0A0A0E] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  CNC 베드 가공 시뮬레이션
                </span>
                <span className="text-[9px] text-[#FFE600] bg-[#FFE600]/10 border border-[#FFE600]/30 px-1.5 py-0.5">
                  {gcodeOptions.origin === 'center' ? 'CENTER (0,0)' : 'BOTTOM-LEFT (0,0)'}
                </span>
              </div>

              {/* Canvas Preview */}
              <div className="relative w-full aspect-square bg-[#05060A] border border-[#1E2230] rounded-xs overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Quick Bed Legend */}
              <div className="grid grid-cols-3 gap-1 mt-2 text-[8px] text-gray-400 text-center">
                <div className="p-1 bg-[#10121A] border border-[#1E2230]">
                  <span className="text-[#00F0FF] font-bold block">가공 선폭/도트</span>
                  <span>레이저 각인 경로</span>
                </div>
                <div className="p-1 bg-[#10121A] border border-[#1E2230]">
                  <span className="text-[#FFE600] font-bold block">노란 점 (0,0)</span>
                  <span>머신 가공 원점</span>
                </div>
                <div className="p-1 bg-[#10121A] border border-[#1E2230]">
                  <span className="text-gray-300 font-bold block">점선 사각형</span>
                  <span>형상 가공 영역</span>
                </div>
              </div>
            </div>

            {/* Machining Stats Panel */}
            {generatedResult && (
              <div className="bg-[#10121A] border border-[#2A2A2E] p-3 space-y-2">
                <div className="text-[10px] font-bold text-[#00F0FF] uppercase flex items-center justify-between">
                  <span>가공 예측 리포트 (ESTIMATED METRICS)</span>
                  <span className="text-[#FFE600]">
                    ~{Math.floor(generatedResult.stats.estimatedTimeSec / 60)}분 {generatedResult.stats.estimatedTimeSec % 60}초
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div className="bg-[#0A0A0E] p-1.5 border border-[#1E2230]">
                    <span className="text-gray-400 block">생성 정점 수</span>
                    <span className="font-bold text-white">
                      {generatedResult.stats.pointCount.toLocaleString()} Pts
                    </span>
                  </div>
                  <div className="bg-[#0A0A0E] p-1.5 border border-[#1E2230]">
                    <span className="text-gray-400 block">가공 바운딩 크기</span>
                    <span className="font-bold text-[#00F0FF]">
                      {generatedResult.stats.boundsMm.sizeX} × {generatedResult.stats.boundsMm.sizeY} mm
                    </span>
                  </div>
                  <div className="bg-[#0A0A0E] p-1.5 border border-[#1E2230]">
                    <span className="text-gray-400 block">총 이송 거리</span>
                    <span className="font-bold text-white">
                      {(generatedResult.stats.totalTravelMm / 1000).toFixed(2)} m
                    </span>
                  </div>
                  <div className="bg-[#0A0A0E] p-1.5 border border-[#1E2230]">
                    <span className="text-gray-400 block">레이저 출력 (S)</span>
                    <span className="font-bold text-[#FF007F]">
                      S0 ~ S{gcodeOptions.laserPowerMax}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Export Controls & Parameter Settings (7 Cols) */}
          <div className="lg:col-span-7 p-4 space-y-4 bg-[#0D0D12]">
            {/* Tab Selector */}
            <div className="flex border-b border-[#2A2A2E] gap-2">
              <button
                onClick={() => setActiveTab('gcode')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gcode'
                    ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>01. CNC G-Code 파라미터</span>
              </button>

              <button
                onClick={() => setActiveTab('xyz')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'xyz'
                    ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>02. XYZ 포인트 클라우드</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'text-[#00F0FF] border-b-2 border-[#00F0FF]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>03. G-Code 구문 미리보기</span>
              </button>
            </div>

            {/* TAB 1: G-CODE SETTINGS */}
            {activeTab === 'gcode' && (
              <div className="space-y-4">
                {/* 1. CNC Mode & Machine Preset */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      가공 방식 (Machining Mode)
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'laser_pulse', name: '펄스 도트', desc: '점 타격 각인' },
                        { id: 'laser_vector', name: '연속 벡터', desc: '선 조각' },
                        { id: 'cnc_3d_relief', name: '3D 부조', desc: 'Z레이어 적층' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setGcodeOptions({ ...gcodeOptions, mode: m.id as any })}
                          className={`p-2 border text-left transition cursor-pointer ${
                            gcodeOptions.mode === m.id
                              ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                              : 'bg-[#141418] border-[#2A2A2E] text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-[10px]">{m.name}</div>
                          <div className="text-[7.5px] text-gray-400">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                      머신 제어 펌웨어 (Dialect)
                    </label>
                    <select
                      value={gcodeOptions.dialect}
                      onChange={(e) => {
                        const d = e.target.value as any;
                        const pMax = d === 'marlin' ? 255 : 1000;
                        setGcodeOptions({ ...gcodeOptions, dialect: d, laserPowerMax: pMax });
                      }}
                      className="w-full bg-[#141418] border border-[#2A2A2E] text-white text-[11px] p-2 focus:border-[#00F0FF] outline-none"
                    >
                      <option value="grbl">GRBL / LaserGRBL / LightBurn (S0-1000)</option>
                      <option value="marlin">Marlin 3D Printer (S0-255)</option>
                      <option value="reprap">RepRap / Duet3D (M3/M5)</option>
                      <option value="mach3">Mach3 / LinuxCNC (Standard G-Code)</option>
                      <option value="generic">Generic ISO G-Code (G0/G1/M3)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Bed Size & Point Subsampling */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-[#141418] border border-[#2A2A2E] p-2">
                    <label className="text-[9px] text-gray-400 block mb-1">베드 가로 (X mm)</label>
                    <input
                      type="number"
                      value={gcodeOptions.bedWidth}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, bedWidth: Math.max(50, parseInt(e.target.value) || 200) })}
                      className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-[#00F0FF] font-bold p-1 text-xs"
                    />
                  </div>

                  <div className="bg-[#141418] border border-[#2A2A2E] p-2">
                    <label className="text-[9px] text-gray-400 block mb-1">베드 세로 (Y mm)</label>
                    <input
                      type="number"
                      value={gcodeOptions.bedHeight}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, bedHeight: Math.max(50, parseInt(e.target.value) || 200) })}
                      className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-[#00F0FF] font-bold p-1 text-xs"
                    />
                  </div>

                  <div className="bg-[#141418] border border-[#2A2A2E] p-2">
                    <label className="text-[9px] text-gray-400 block mb-1">가공 크기 (Scale mm)</label>
                    <input
                      type="number"
                      value={gcodeOptions.scaleMm}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, scaleMm: Math.max(10, parseInt(e.target.value) || 100) })}
                      className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-[#FFE600] font-bold p-1 text-xs"
                    />
                  </div>

                  <div className="bg-[#141418] border border-[#2A2A2E] p-2">
                    <label className="text-[9px] text-gray-400 block mb-1">정점 샘플링 수</label>
                    <select
                      value={gcodeOptions.maxPoints}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, maxPoints: parseInt(e.target.value) })}
                      className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-white p-1 text-xs"
                    >
                      <option value="1000">1,000 Pts (테스트)</option>
                      <option value="3000">3,000 Pts (표준 권장)</option>
                      <option value="5000">5,000 Pts (고밀도)</option>
                      <option value="10000">10,000 Pts (초정밀)</option>
                      <option value="25000">25,000 Pts (초고밀도)</option>
                      <option value="60000">전체 정점 (Full)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Speed & Power Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#141418] border border-[#2A2A2E] p-3">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>각인 이송 속도 (Feedrate F)</span>
                      <span className="font-bold text-[#00F0FF]">{gcodeOptions.feedrateEngrave} mm/min</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="6000"
                      step="100"
                      value={gcodeOptions.feedrateEngrave}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, feedrateEngrave: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>최대 레이저 파워 (Max S)</span>
                      <span className="font-bold text-[#FF007F]">S{gcodeOptions.laserPowerMax}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="25"
                      value={gcodeOptions.laserPowerMax}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, laserPowerMax: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FF007F]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>펄스 체류 시간 (Dwell Time)</span>
                      <span className="font-bold text-[#FFE600]">{gcodeOptions.pulseDwellMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      step="1"
                      value={gcodeOptions.pulseDwellMs}
                      onChange={(e) => setGcodeOptions({ ...gcodeOptions, pulseDwellMs: parseInt(e.target.value) })}
                      className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FFE600]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>가공 원점 위치 (Origin)</span>
                      <span className="font-bold text-white">
                        {gcodeOptions.origin === 'center' ? '베드 중앙 (0,0)' : '좌측 하단 (0,0)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setGcodeOptions({ ...gcodeOptions, origin: 'center' })}
                        className={`py-1 text-[9px] border transition cursor-pointer ${
                          gcodeOptions.origin === 'center'
                            ? 'bg-[#00F0FF] text-black font-bold border-[#00F0FF]'
                            : 'bg-[#0A0A0C] text-gray-400 border-[#2A2A2E]'
                        }`}
                      >
                        중앙 (Center)
                      </button>
                      <button
                        onClick={() => setGcodeOptions({ ...gcodeOptions, origin: 'bottom_left' })}
                        className={`py-1 text-[9px] border transition cursor-pointer ${
                          gcodeOptions.origin === 'bottom_left'
                            ? 'bg-[#00F0FF] text-black font-bold border-[#00F0FF]'
                            : 'bg-[#0A0A0C] text-gray-400 border-[#2A2A2E]'
                        }`}
                      >
                        좌측하단 (Corner)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. 3D Relief & Z-Depth Settings */}
                <div className="bg-[#141418] border border-[#2A2A2E] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gcodeOptions.enableZRelief}
                        onChange={(e) => setGcodeOptions({ ...gcodeOptions, enableZRelief: e.target.checked })}
                        className="accent-[#00F0FF]"
                      />
                      <span>3차원 Z축 부조/적층 모드 활성화 (3D Z-Depth Relief)</span>
                    </label>
                    <span className="text-[8px] text-gray-500">CNC 라우터 및 3D 프린터용</span>
                  </div>

                  {gcodeOptions.enableZRelief && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2A2E]">
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                          <span>최대 Z 가공 깊이 (Max Z)</span>
                          <span className="font-bold text-[#00F0FF]">{gcodeOptions.zMaxDepth} mm</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="20.0"
                          step="0.5"
                          value={gcodeOptions.zMaxDepth}
                          onChange={(e) => setGcodeOptions({ ...gcodeOptions, zMaxDepth: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#00F0FF]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                          <span>Z 안전 높이 (Safe Z)</span>
                          <span className="font-bold text-[#FFE600]">{gcodeOptions.zSafeHeight} mm</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="15.0"
                          step="0.5"
                          value={gcodeOptions.zSafeHeight}
                          onChange={(e) => setGcodeOptions({ ...gcodeOptions, zSafeHeight: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer accent-[#FFE600]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: XYZ POINT CLOUD SETTINGS */}
            {activeTab === 'xyz' && (
              <div className="space-y-4">
                <div className="bg-[#141418] border border-[#2A2A2E] p-3 space-y-3">
                  <h4 className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>XYZ 포인트 클라우드 포맷 설정 (.xyz / .csv / .pts)</span>
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    MeshLab, CloudCompare, AutoCAD, Rhino, SolidWorks, Blender, 3D 프린터 슬라이서 등에서 직접 열 수 있는 순수 좌표 및 색상 데이터셋입니다.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">구분 기호 (Delimiter)</label>
                      <select
                        value={xyzOptions.delimiter}
                        onChange={(e) => setXyzOptions({ ...xyzOptions, delimiter: e.target.value as any })}
                        className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-white p-2 text-xs"
                      >
                        <option value="space">공백 (Space - 표준 .xyz / .pts)</option>
                        <option value="comma">쉼표 (Comma - 표준 .csv)</option>
                        <option value="tab">탭 (Tab - 탭 구분 텍스트)</option>
                        <option value="semicolon">세미콜론 (Semicolon - 유럽 표준)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase block mb-1">최대 정점 수</label>
                      <select
                        value={xyzOptions.maxPoints}
                        onChange={(e) => setXyzOptions({ ...xyzOptions, maxPoints: parseInt(e.target.value) })}
                        className="w-full bg-[#0A0A0C] border border-[#2A2A2E] text-white p-2 text-xs"
                      >
                        <option value="5000">5,000 Pts</option>
                        <option value="10000">10,000 Pts</option>
                        <option value="25000">25,000 Pts</option>
                        <option value="60000">60,000 Pts (전체)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] text-gray-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={xyzOptions.includeColors}
                        onChange={(e) => setXyzOptions({ ...xyzOptions, includeColors: e.target.checked })}
                        className="accent-[#00F0FF]"
                      />
                      <span>RGB 버텍스 색상 값 포함 (X Y Z R G B 포맷)</span>
                    </label>
                  </div>
                </div>

                {/* Point Cloud Formats Quick Download Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={handleDownloadXYZ}
                    className="p-3 bg-[#141418] border border-[#00F0FF]/40 hover:border-[#00F0FF] hover:bg-[#00F0FF]/15 text-[#00F0FF] transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs flex items-center gap-1 mb-1">
                      <Download className="w-3 h-3" />
                      <span>.XYZ 다운로드</span>
                    </div>
                    <div className="text-[8px] text-gray-400">MeshLab / CloudCompare</div>
                  </button>

                  <button
                    onClick={handleDownloadCSV}
                    className="p-3 bg-[#141418] border border-[#FFE600]/40 hover:border-[#FFE600] hover:bg-[#FFE600]/15 text-[#FFE600] transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs flex items-center gap-1 mb-1">
                      <Download className="w-3 h-3" />
                      <span>.CSV 다운로드</span>
                    </div>
                    <div className="text-[8px] text-gray-400">Excel / CAD/CAM</div>
                  </button>

                  <button
                    onClick={handleDownloadPLY}
                    className="p-3 bg-[#141418] border border-[#FF007F]/40 hover:border-[#FF007F] hover:bg-[#FF007F]/15 text-[#FF007F] transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs flex items-center gap-1 mb-1">
                      <Download className="w-3 h-3" />
                      <span>.PLY 다운로드</span>
                    </div>
                    <div className="text-[8px] text-gray-400">Blender / Houdini</div>
                  </button>

                  <button
                    onClick={handleDownloadOBJ}
                    className="p-3 bg-[#141418] border border-white/40 hover:border-white hover:bg-white/15 text-white transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs flex items-center gap-1 mb-1">
                      <Download className="w-3 h-3" />
                      <span>.OBJ 다운로드</span>
                    </div>
                    <div className="text-[8px] text-gray-400">Unreal / Maya 3D</div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: G-CODE LIVE SYNTAX PREVIEW */}
            {activeTab === 'preview' && generatedResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    생성된 G-Code 파일 실시간 미리보기 (처음 80줄 표시)
                  </span>
                  <button
                    onClick={handleCopyGCode}
                    className="px-2 py-1 bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs text-[#00F0FF] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '복사 완료!' : 'G-Code 전체 복사'}</span>
                  </button>
                </div>

                <div className="h-64 bg-[#05060A] border border-[#1E2230] p-3 rounded-xs font-mono text-[10px] text-gray-300 overflow-y-auto leading-relaxed select-text">
                  {generatedResult.gcode.split('\n').slice(0, 80).map((line, idx) => {
                    const isComment = line.trim().startsWith(';');
                    const isG0 = line.includes('G0');
                    const isG1 = line.includes('G1');
                    const isLaser = line.includes('M3') || line.includes('M4') || line.includes('M5');
                    return (
                      <div key={idx} className="flex">
                        <span className="w-8 text-gray-600 text-right pr-2 select-none">{idx + 1}</span>
                        <span className={
                          isComment ? 'text-gray-500' :
                          isLaser ? 'text-[#FF007F] font-bold' :
                          isG0 ? 'text-[#FFE600]' :
                          isG1 ? 'text-[#00F0FF]' : 'text-gray-300'
                        }>
                          {line}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-4 py-3 border-t border-[#2A2A2E] bg-[#08080C] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[#00F0FF] font-bold">
              형상: {sourceShape.name} ➔ {targetShape.name} ({Math.round(morphProgress * 100)}%)
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              GRBL / Marlin / LightBurn / LaserGRBL 호환
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadGCode('nc')}
              className="px-3 py-2 bg-[#1A1A1E] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs font-bold text-gray-300 uppercase transition cursor-pointer flex items-center gap-1.5"
              title="산업용 CNC 밀링 & 라우터용 .NC 파일"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>.NC 가공 파일</span>
            </button>

            <button
              onClick={() => handleDownloadGCode('gcode')}
              className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black text-xs font-bold uppercase transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>G-Code (.gcode) 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
