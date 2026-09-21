import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  FileCode2, Upload, Download, Copy, Play, Check, 
  Sparkles, Sliders, RefreshCw, Layers, Eye, Code,
  CheckCircle2, AlertTriangle, ArrowRight, X, ExternalLink, Globe, Palette
} from 'lucide-react';
import { MorphConfig, MorphShape, ParticleType } from '../types';
import { parseParticleHtml, ParsedHtmlResult } from '../utils/htmlParser';
import { exportMorphToStandaloneHtml, exportPureParticleHtml } from '../utils/htmlExporter';
import { 
  generateSaturn, generateStarship, generateTreeOfLife, 
  generateAngelWings, generateDiamondCrystal, generateGalaxy 
} from '../utils/shapeGenerators';

interface HtmlFileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToWorkspace: (sourceShape: MorphShape, targetShape: MorphShape, config: Partial<MorphConfig>) => void;
  currentSourceShape: MorphShape;
  currentTargetShape: MorphShape;
  currentConfig: MorphConfig;
  allShapes: MorphShape[];
}

export const HtmlFileEditorModal: React.FC<HtmlFileEditorModalProps> = ({
  isOpen,
  onClose,
  onApplyToWorkspace,
  currentSourceShape,
  currentTargetShape,
  currentConfig,
  allShapes,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('particle_morph_showcase.html');
  const [parseResult, setParseResult] = useState<ParsedHtmlResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Editable parameters extracted from the HTML
  const [editTitle, setEditTitle] = useState<string>('Particle Morphing Studio');
  const [editSrcName, setEditSrcName] = useState<string>('출발 형상 (Source)');
  const [editDstName, setEditDstName] = useState<string>('도착 형상 (Target)');
  const [editConfig, setEditConfig] = useState<MorphConfig>(currentConfig);
  const [editSourceShape, setEditSourceShape] = useState<MorphShape>(currentSourceShape);
  const [editTargetShape, setEditTargetShape] = useState<MorphShape>(currentTargetShape);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const prevIsOpenRef = useRef<boolean>(false);

  // Initialize with current workspace state ONLY when opening modal
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const generated = exportMorphToStandaloneHtml(
        currentSourceShape,
        currentTargetShape,
        currentConfig,
        allShapes
      );
      setHtmlContent(generated);
      const parsed = parseParticleHtml(generated);
      setParseResult(parsed);
      setEditTitle(parsed.title || 'Particle Morphing Studio');
      setEditSrcName(currentSourceShape.name);
      setEditDstName(currentTargetShape.name);
      setEditConfig({ ...currentConfig });
      setEditSourceShape(currentSourceShape);
      setEditTargetShape(currentTargetShape);
      setFileName(`particle_morph_${currentSourceShape.name}_to_${currentTargetShape.name}.html`.replace(/[^a-zA-Z0-9_\-\.]/g, '_'));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Handle File Upload or Drop
  const handleFileLoad = (file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('.html 또는 .htm 확장자의 파티클 파일만 지원됩니다.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setHtmlContent(content);
        const parsed = parseParticleHtml(content);
        setParseResult(parsed);
        if (parsed.isSuccess) {
          setEditTitle(parsed.title);
          setEditSrcName(parsed.sourceShape.name);
          setEditDstName(parsed.targetShape.name);
          setEditSourceShape(parsed.sourceShape);
          setEditTargetShape(parsed.targetShape);
          setEditConfig((prev) => ({ ...prev, ...parsed.config }));
          setFlashMessage(`✅ '${file.name}' 파티클 파일을 성공적으로 파싱했습니다!`);
          setTimeout(() => setFlashMessage(null), 3500);
        } else {
          setFlashMessage(`⚠️ 파일 파싱 중 경고: ${parsed.error}`);
          setTimeout(() => setFlashMessage(null), 4000);
        }
      }
    };
    reader.readAsText(file);
  };

  // Preset Template loader
  const handleLoadSamplePreset = (presetType: 'saturn' | 'starship' | 'tree') => {
    let src: MorphShape;
    let dst: MorphShape;
    let sampleConfig: Partial<MorphConfig> = {};

    if (presetType === 'saturn') {
      const saturnData = generateSaturn(50000);
      const galaxyData = generateGalaxy(50000);
      src = {
        id: 'sample_saturn',
        name: '🪐 토성 행성계 (Saturn & Rings)',
        type: 'preset',
        positions: saturnData.positions,
        colors: saturnData.colors,
        description: '카시니 간극 고리와 27도 자전축 3D 토성',
      };
      dst = {
        id: 'sample_galaxy',
        name: '🌌 코스믹 나선 은하 (Milky Way)',
        type: 'preset',
        positions: galaxyData.positions,
        colors: galaxyData.colors,
        description: '4나선 소용돌이 은하 파티클 클라우드',
      };
      sampleConfig = {
        particleCount: 50000,
        noiseAmp: 2.2,
        noiseFreq: 1.1,
        noiseType: 'vortex',
        particleType: 'star',
        colorA: '#FFD700',
        colorB: '#00F0FF',
        colorC: '#9D00FF',
        colorMixMode: 'velocity',
        glowIntensity: 1.6,
      };
    } else if (presetType === 'starship') {
      const shipData = generateStarship(45000);
      const wingsData = generateAngelWings(45000);
      src = {
        id: 'sample_starship',
        name: '🛸 사이버 스타십 (Cyber Interceptor)',
        type: 'preset',
        positions: shipData.positions,
        colors: shipData.colors,
        description: '델타익 퓨슬라지와 트윈 이온 플라즈마 추진기',
      };
      dst = {
        id: 'sample_wings',
        name: '🪽 천사의 날개 (Angel Wings)',
        type: 'preset',
        positions: wingsData.positions,
        colors: wingsData.colors,
        description: '3D 곡면 깃털 아치 날개와 홀로그램 오로라',
      };
      sampleConfig = {
        particleCount: 45000,
        noiseAmp: 1.8,
        noiseFreq: 0.9,
        noiseType: 'curl',
        particleType: 'diamond',
        colorA: '#00F0FF',
        colorB: '#FF007F',
        colorC: '#FFFFFF',
        colorMixMode: 'additive_mix',
        trailsEnabled: true,
        trailLength: 0.88,
      };
    } else {
      const treeData = generateTreeOfLife(55000);
      const gemData = generateDiamondCrystal(55000);
      src = {
        id: 'sample_tree',
        name: '🌳 생명의 나무 (Tree of Life)',
        type: 'preset',
        positions: treeData.positions,
        colors: treeData.colors,
        description: '3D 프랙탈 가지와 생체 발광 에메랄드 캐노피',
      };
      dst = {
        id: 'sample_gem',
        name: '💎 스타 다이아몬드 (Prismatic Gem)',
        type: 'preset',
        positions: gemData.positions,
        colors: gemData.colors,
        description: '다면체 결정체와 궤도 프리즘 파편',
      };
      sampleConfig = {
        particleCount: 55000,
        noiseAmp: 2.5,
        noiseFreq: 0.75,
        noiseType: 'turbulence',
        particleType: 'ring',
        colorA: '#00FF66',
        colorB: '#00F0FF',
        colorC: '#FFE600',
        colorMixMode: 'gradient',
        glowIntensity: 1.8,
      };
    }

    const updatedConfig = { ...editConfig, ...sampleConfig };
    setEditSourceShape(src);
    setEditTargetShape(dst);
    setEditSrcName(src.name);
    setEditDstName(dst.name);
    setEditConfig(updatedConfig);

    const regenerated = exportMorphToStandaloneHtml(src, dst, updatedConfig, allShapes);
    setHtmlContent(regenerated);
    setParseResult(parseParticleHtml(regenerated));
    setFileName(`sample_${presetType}_morph.html`);
    setFlashMessage(`✨ '${src.name} ➔ ${dst.name}' 샘플 템플릿을 불러왔습니다!`);
    setTimeout(() => setFlashMessage(null), 3000);
  };

  // Re-generate HTML from current visual edits
  const handleRegenerateFromEdits = useCallback(() => {
    const updatedSrc: MorphShape = {
      ...editSourceShape,
      name: editSrcName,
    };
    const updatedDst: MorphShape = {
      ...editTargetShape,
      name: editDstName,
    };

    const newHtml = exportMorphToStandaloneHtml(
      updatedSrc,
      updatedDst,
      editConfig,
      allShapes
    );

    setHtmlContent(newHtml);
    setParseResult(parseParticleHtml(newHtml));
    setFlashMessage('🔄 수정한 파라미터로 HTML 코드가 실시간 재생성되었습니다!');
    setTimeout(() => setFlashMessage(null), 2500);
  }, [editSourceShape, editTargetShape, editSrcName, editDstName, editConfig, allShapes]);

  // Apply directly to main application workspace
  const handleApplyToWorkspace = () => {
    const updatedSrc: MorphShape = {
      ...editSourceShape,
      name: editSrcName,
    };
    const updatedDst: MorphShape = {
      ...editTargetShape,
      name: editDstName,
    };

    onApplyToWorkspace(updatedSrc, updatedDst, editConfig);
    onClose();
  };

  // Download pure particle scene HTML
  const handleDownloadPureHtml = () => {
    try {
      const pureHtml = exportPureParticleHtml(
        editSourceShape,
        editTargetShape,
        editConfig,
        editConfig.backgroundColor
      );
      const blob = new Blob([pureHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `pure_particle_${editSourceShape.name}_to_${editTargetShape.name}.html`
        .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFlashMessage('✨ 순수 파티클 장면 HTML 파일이 성공적으로 다운로드되었습니다!');
      setTimeout(() => setFlashMessage(null), 3000);
    } catch (err) {
      alert('순수 파티클 HTML 다운로드 중 오류가 발생했습니다: ' + err);
    }
  };

  // Download standalone modified HTML
  const handleDownloadHtml = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'modified_particle_morph.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFlashMessage('💾 수정된 인터랙티브 HTML 파일이 성공적으로 다운로드되었습니다!');
      setTimeout(() => setFlashMessage(null), 3000);
    } catch (err) {
      alert('HTML 다운로드 중 오류가 발생했습니다: ' + err);
    }
  };

  // Copy HTML code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      setFlashMessage('📋 HTML 전체 소스코드가 클립보드에 복사되었습니다!');
      setTimeout(() => setFlashMessage(null), 2500);
    } catch (err) {
      alert('클립보드 복사 실패: ' + err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#0F0F12] border border-[#2A2A2E] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono text-[#E0E0E0]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#2A2A2E] bg-[#141417] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  HTML 파티클 파일 편집기 & 가져오기 스튜디오
                </h2>
                <span className="text-[9px] bg-[#00F0FF] text-black font-bold px-1.5 py-0.5 uppercase">
                  v2.0 LOSSLESS
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                기존에 내보낸 독립 실행형 HTML 파티클 파일을 불러와 파라미터, 셰이더, 형상을 자유롭게 수정하고 3D 작업 공간에 즉시 적용합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2A2E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Sample Presets & File Upload Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0A0A0B] border-b border-[#2A2A2E] flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              빠른 템플릿 테스트:
            </span>
            <button
              onClick={() => handleLoadSamplePreset('saturn')}
              className="px-2.5 py-1 bg-[#1A1A1E] hover:bg-[#00F0FF]/20 hover:text-[#00F0FF] hover:border-[#00F0FF] border border-[#2A2A2E] text-gray-300 transition text-[10px] cursor-pointer"
            >
              🪐 토성 ➔ 은하
            </button>
            <button
              onClick={() => handleLoadSamplePreset('starship')}
              className="px-2.5 py-1 bg-[#1A1A1E] hover:bg-[#FF007F]/20 hover:text-[#FF007F] hover:border-[#FF007F] border border-[#2A2A2E] text-gray-300 transition text-[10px] cursor-pointer"
            >
              🛸 스타십 ➔ 천사 날개
            </button>
            <button
              onClick={() => handleLoadSamplePreset('tree')}
              className="px-2.5 py-1 bg-[#1A1A1E] hover:bg-[#00FF66]/20 hover:text-[#00FF66] hover:border-[#00FF66] border border-[#2A2A2E] text-gray-300 transition text-[10px] cursor-pointer"
            >
              🌳 생명의 나무 ➔ 다이아몬드
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileLoad(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF] text-[#00F0FF] text-xs font-bold uppercase transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>내 PC에서 HTML 파일 열기</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-[#2A2A2E] bg-[#141417] text-xs font-bold uppercase tracking-wider flex-shrink-0">
          <button
            onClick={() => setActiveTab('visual')}
            className={`py-3 flex items-center justify-center gap-2 transition ${
              activeTab === 'visual'
                ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>01. 시각적 파라미터 편집</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 flex items-center justify-center gap-2 transition ${
              activeTab === 'code'
                ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>02. HTML 소스 코드 인스펙터</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 flex items-center justify-center gap-2 transition ${
              activeTab === 'preview'
                ? 'bg-[#0F0F12] text-[#00F0FF] border-b-2 border-[#00F0FF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>03. 독립형 HTML 실시간 미리보기</span>
          </button>
        </div>

        {/* Flash Notification */}
        {flashMessage && (
          <div className="px-4 py-2 bg-[#00F0FF]/15 border-b border-[#00F0FF] text-[#00F0FF] text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{flashMessage}</span>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          
          {/* TAB 1: VISUAL PARAMETERS EDITOR */}
          {activeTab === 'visual' && (
            <div className="space-y-6">
              
              {/* Drag and drop banner */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileLoad(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white'
                    : 'border-[#2A2A2E] hover:border-[#00F0FF]/60 bg-[#141417] text-gray-400'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-[#00F0FF]" />
                <div className="text-xs font-bold text-gray-200">
                  수정할 .html 파티클 파일을 이곳에 드래그 & 드롭하거나 클릭하여 선택하세요
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  현재 로드된 파일: <strong className="text-[#00F0FF]">{fileName}</strong> ({editConfig.particleCount?.toLocaleString()} 파티클)
                </div>
              </div>

              {/* Grid 1: Basic Titles & Shape Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#141417] border border-[#2A2A2E] p-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-300 mb-1.5">
                    01. 출발 형상 이름 (Source Name)
                  </label>
                  <input
                    type="text"
                    value={editSrcName}
                    onChange={(e) => setEditSrcName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#2A2A2E] focus:border-[#00F0FF] px-3 py-2 text-xs text-[#00F0FF] font-bold outline-none"
                    placeholder="예: 🪐 토성 행성계 (Saturn)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-300 mb-1.5">
                    02. 도착 형상 이름 (Target Name)
                  </label>
                  <input
                    type="text"
                    value={editDstName}
                    onChange={(e) => setEditDstName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#2A2A2E] focus:border-white px-3 py-2 text-xs text-white font-bold outline-none"
                    placeholder="예: 🌌 코스믹 나선 은하 (Milky Way)"
                  />
                </div>
              </div>

              {/* Grid 2: Physics, Particle Type & Noise Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Panel A: Particle Engine & Shape */}
                <div className="bg-[#141417] border border-[#2A2A2E] p-4 space-y-4">
                  <h3 className="text-xs font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    파티클 수 & 도트 형태
                  </h3>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>파티클 총 개수 (Count)</span>
                      <span className="text-[#00F0FF] font-bold">{editConfig.particleCount?.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={120000}
                      step={5000}
                      value={editConfig.particleCount}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, particleCount: parseInt(e.target.value, 10) }))}
                      className="w-full h-1.5 bg-[#2A2A2E] accent-[#00F0FF] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1.5">파티클 도트 셰이프 (Shape)</label>
                    <select
                      value={editConfig.particleType}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, particleType: e.target.value as ParticleType }))}
                      className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-xs text-white p-2 outline-none focus:border-[#00F0FF]"
                    >
                      <option value="circle">원형 도트 (Soft Circle)</option>
                      <option value="star">십자 스타 (Cross Star)</option>
                      <option value="diamond">다이아몬드 (Diamond Spark)</option>
                      <option value="ring">네온 링 (Neon Ring)</option>
                      <option value="hexagon">사이버 헥사곤 (Hexagon)</option>
                      <option value="cube">스퀘어 픽셀 (Square Pixel)</option>
                      <option value="cloud">네뷸라 클라우드 (Nebula Cloud)</option>
                      <option value="bokeh">보케 렌즈 (Bokeh Flare)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>입자 크기 (Point Size)</span>
                      <span className="text-[#00F0FF] font-bold">{editConfig.pointSize?.toFixed(1)} px</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8.0}
                      step={0.2}
                      value={editConfig.pointSize}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, pointSize: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-[#2A2A2E] accent-[#00F0FF] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Panel B: Physics & Turbulence */}
                <div className="bg-[#141417] border border-[#2A2A2E] p-4 space-y-4">
                  <h3 className="text-xs font-bold text-[#FFE600] uppercase flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    물리 난류 및 노이즈
                  </h3>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>노이즈 세기 (Turbulence Amp)</span>
                      <span className="text-[#FFE600] font-bold">{editConfig.noiseAmp?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5.0}
                      step={0.1}
                      value={editConfig.noiseAmp}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, noiseAmp: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-[#2A2A2E] accent-[#FFE600] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>노이즈 주파수 (Frequency)</span>
                      <span className="text-[#FFE600] font-bold">{editConfig.noiseFreq?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={3.0}
                      step={0.05}
                      value={editConfig.noiseFreq}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, noiseFreq: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-[#2A2A2E] accent-[#FFE600] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>시차 분산 (Stagger Spread)</span>
                      <span className="text-[#FFE600] font-bold">{editConfig.delaySpread?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1.0}
                      step={0.05}
                      value={editConfig.delaySpread}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, delaySpread: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-[#2A2A2E] accent-[#FFE600] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Panel C: Color Ramp & Lighting */}
                <div className="bg-[#141417] border border-[#2A2A2E] p-4 space-y-4">
                  <h3 className="text-xs font-bold text-[#FF007F] uppercase flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    색상 램프 & 광원 혼합
                  </h3>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1.5">색상 혼합 방식 (Color Mix Mode)</label>
                    <select
                      value={editConfig.colorMixMode}
                      onChange={(e) => setEditConfig((prev) => ({ ...prev, colorMixMode: e.target.value as any }))}
                      className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-xs text-white p-2 outline-none focus:border-[#FF007F]"
                    >
                      <option value="interpolate">자연 형상 보간 (Src ➔ Dst)</option>
                      <option value="gradient">3단 커스텀 램프 (3-Stop Ramp)</option>
                      <option value="velocity">운동속도 변색 (Velocity Kinetic)</option>
                      <option value="height">수직 고도 그라데이션 (Y-Axis)</option>
                      <option value="radial">방사형 스펙트럼 (Radial)</option>
                      <option value="additive_mix">가산 광원 혼합 (Additive Mix)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="block text-[9px] text-gray-500 mb-1 font-bold">Color A</span>
                      <input
                        type="color"
                        value={editConfig.colorA || '#00F0FF'}
                        onChange={(e) => setEditConfig((prev) => ({ ...prev, colorA: e.target.value }))}
                        className="w-full h-8 bg-transparent cursor-pointer border border-[#2A2A2E]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-500 mb-1 font-bold">Color B</span>
                      <input
                        type="color"
                        value={editConfig.colorB || '#FF007F'}
                        onChange={(e) => setEditConfig((prev) => ({ ...prev, colorB: e.target.value }))}
                        className="w-full h-8 bg-transparent cursor-pointer border border-[#2A2A2E]"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-500 mb-1 font-bold">Color C</span>
                      <input
                        type="color"
                        value={editConfig.colorC || '#FFE600'}
                        onChange={(e) => setEditConfig((prev) => ({ ...prev, colorC: e.target.value }))}
                        className="w-full h-8 bg-transparent cursor-pointer border border-[#2A2A2E]"
                      />
                    </div>
                  </div>

                  {/* 🎨 캔버스 배경색 지정 */}
                  <div className="pt-2 border-t border-[#2A2A2E]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-[#00F0FF]" />
                        캔버스 배경색 (Background Color)
                      </span>
                      <span className="text-[10px] font-mono text-[#00F0FF]">
                        {editConfig.backgroundColor || '#030712'}
                      </span>
                    </div>
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
                          onClick={() => setEditConfig((prev) => ({ ...prev, backgroundColor: item.color }))}
                          className={`w-6 h-6 rounded border transition ${
                            (editConfig.backgroundColor || '#030712').toLowerCase() === item.color.toLowerCase()
                              ? 'border-[#00F0FF] scale-110 shadow-[0_0_8px_#00F0FF]'
                              : 'border-[#2A2A2E] hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={`${item.label} (${item.color})`}
                        />
                      ))}
                      <input
                        type="color"
                        value={editConfig.backgroundColor || '#030712'}
                        onChange={(e) => setEditConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-6 h-6 rounded bg-transparent cursor-pointer border border-[#2A2A2E]"
                        title="직접 색상 선택"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input
                        type="checkbox"
                        checked={editConfig.trailsEnabled}
                        onChange={(e) => setEditConfig((prev) => ({ ...prev, trailsEnabled: e.target.checked }))}
                        className="accent-[#00F0FF] w-4 h-4 cursor-pointer"
                      />
                      <span>입자 모션 궤적 (Ghost Trails) 활성화</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Action Bar for Tab 1 */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#141417] border border-[#2A2A2E]">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                  <span>파라미터를 수정한 후 아래 버튼으로 즉시 적용하거나 저장할 수 있습니다.</span>
                </div>
                <button
                  onClick={handleRegenerateFromEdits}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2E] hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF]/60 text-xs font-bold uppercase transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>수정 사항 HTML에 반영 및 재생성</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE HTML CODE INSPECTOR & EDITOR */}
          {activeTab === 'code' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-[#00F0FF] font-bold">
                  <Code className="w-4 h-4" />
                  HTML & Three.js 셰이더 소스 코드 (직접 편집 가능)
                </span>
                <button
                  onClick={() => {
                    const parsed = parseParticleHtml(htmlContent);
                    setParseResult(parsed);
                    if (parsed.isSuccess) {
                      setEditTitle(parsed.title);
                      setEditSrcName(parsed.sourceShape.name);
                      setEditDstName(parsed.targetShape.name);
                      setEditConfig((prev) => ({ ...prev, ...parsed.config }));
                      setFlashMessage('✅ 수정한 HTML 코드를 다시 파싱하여 상태를 동기화했습니다!');
                      setTimeout(() => setFlashMessage(null), 3000);
                    }
                  }}
                  className="px-3 py-1 bg-[#1A1A1E] hover:bg-[#00F0FF] hover:text-black border border-[#00F0FF]/50 text-[#00F0FF] text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>코드 다시 파싱 & 검증</span>
                </button>
              </div>

              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full flex-1 min-h-[420px] bg-[#0A0A0B] border border-[#2A2A2E] focus:border-[#00F0FF] p-4 text-[11px] font-mono text-gray-300 leading-relaxed outline-none resize-none custom-scrollbar"
                spellCheck={false}
              />
            </div>
          )}

          {/* TAB 3: LIVE SANDBOX IFRAME PREVIEW */}
          {activeTab === 'preview' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Eye className="w-4 h-4" />
                  실제 독립 실행형 HTML 파일 실시간 가동 화면 (Sandboxed WebGL Canvas)
                </span>
                <span className="text-[10px] text-gray-500">
                  HUD 슬라이더 및 카메라 궤도 제어가 브라우저와 동일하게 동작합니다
                </span>
              </div>

              <div className="w-full flex-1 min-h-[460px] bg-black border border-[#2A2A2E] relative overflow-hidden">
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlContent}
                  title="Particle Morph Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-downloads"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer & Global Actions */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-[#2A2A2E] bg-[#141417] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1E] hover:bg-[#2A2A2E] text-gray-300 border border-[#2A2A2E] text-xs font-bold uppercase transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? '복사 완료!' : 'HTML 소스 복사'}</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1E] hover:bg-[#00F0FF]/20 hover:text-[#00F0FF] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] text-xs font-bold uppercase transition cursor-pointer"
              title="전체 슬라이더와 HUD 제어기가 포함된 인터랙티브 스튜디오 HTML 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>풀 스튜디오 HTML</span>
            </button>

            <button
              onClick={handleDownloadPureHtml}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#00F0FF]/15 hover:bg-[#00F0FF] hover:text-black text-[#00F0FF] border border-[#00F0FF] text-xs font-bold uppercase transition cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              title="UI 없이 순수 3D 파티클 장면만 포함된 깔끔한 HTML 파일 다운로드 (배경색 적용)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ 순수 파티클 HTML</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1A1A1E] hover:bg-[#2A2A2E] text-gray-400 hover:text-white border border-[#2A2A2E] text-xs font-bold uppercase transition cursor-pointer"
            >
              닫기
            </button>

            <button
              onClick={handleApplyToWorkspace}
              className="flex items-center gap-2 px-5 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black text-xs font-bold uppercase transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <ArrowRight className="w-4 h-4" />
              <span>현재 3D 시뮬레이터에 적용하기</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
