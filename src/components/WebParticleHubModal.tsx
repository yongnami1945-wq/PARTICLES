import React, { useState } from 'react';
import { 
  X, Globe, Download, Upload, Copy, Check, ExternalLink, 
  Sparkles, Play, Search, Filter, RefreshCw, AlertCircle, 
  FileJson, CheckCircle2, Waves, Palette, Sliders, Layers,
  Terminal, Code2, BookOpen
} from 'lucide-react';
import { MorphConfig } from '../types';
import { 
  ONLINE_PRESET_COLLECTION, 
  OnlineParticlePreset, 
  convertOnlineParticleJsonToMorphConfig,
  fetchOnlineParticlePreset
} from '../utils/onlineParticlePresets';

interface WebParticleHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
}

export const WebParticleHubModal: React.FC<WebParticleHubModalProps> = ({
  isOpen,
  onClose,
  onChangeConfig,
  onSelectSource,
  onSelectTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'url_fetch' | 'json_paste' | 'resources'>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null);

  // URL Fetcher State
  const [fetchUrl, setFetchUrl] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState<string | null>(null);
  const [fetchedResult, setFetchedResult] = useState<any | null>(null);

  // Raw JSON Paste State
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [jsonParseSuccess, setJsonParseSuccess] = useState<string | null>(null);

  // Inspection modal / view raw JSON
  const [inspectingPreset, setInspectingPreset] = useState<OnlineParticlePreset | null>(null);

  if (!isOpen) return null;

  // Apply a curated online preset
  const handleApplyPreset = (preset: OnlineParticlePreset) => {
    onChangeConfig(preset.config);
    if (preset.sourceShapeId) onSelectSource(preset.sourceShapeId);
    if (preset.targetShapeId) onSelectTarget(preset.targetShapeId);
    setAppliedPresetId(preset.id);
    setTimeout(() => setAppliedPresetId(null), 2500);
  };

  // Copy raw JSON
  const handleCopyJson = (obj: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle URL fetch
  const handleFetchFromUrl = async (urlToFetch?: string) => {
    const targetUrl = urlToFetch || fetchUrl;
    if (!targetUrl.trim()) {
      setFetchError('다운로드할 URL을 입력해주세요.');
      return;
    }
    setFetchError(null);
    setFetchSuccessMsg(null);
    setIsFetching(true);

    try {
      const { data, converted } = await fetchOnlineParticlePreset(targetUrl);
      setFetchedResult({ data, converted });
      onChangeConfig(converted.config);
      setFetchSuccessMsg(`성공: [${converted.detectedFormat}] 설정을 파싱하여 3D 엔진에 즉시 적용했습니다!`);
    } catch (err: any) {
      setFetchError(err.message || '가져오기 실패');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle direct JSON parsing & applying
  const handleParseAndApplyJson = () => {
    if (!jsonInput.trim()) {
      setJsonParseError('JSON 코드를 붙여넣어주세요.');
      return;
    }
    setJsonParseError(null);
    setJsonParseSuccess(null);

    try {
      const converted = convertOnlineParticleJsonToMorphConfig(jsonInput);
      onChangeConfig(converted.config);
      setJsonParseSuccess(`성공: ${converted.summary}`);
    } catch (err: any) {
      setJsonParseError(`파싱 오류: ${err.message}`);
    }
  };

  // Filter presets
  const filteredPresets = ONLINE_PRESET_COLLECTION.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory || p.sourceEco === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.author.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-5xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.25)]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>인터넷 파티클 자료 자동 연동 & 웹 허브</span>
                <span className="px-1.5 py-0.2 bg-[#00F0FF]/15 text-[#00F0FF] text-[9px] border border-[#00F0FF]/40 font-bold">
                  PARTICLES.JS // TSPARTICLES // THREE.JS AUTO-IMPORTER
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                https://particles.js.org 및 깃허브 등 웹 상의 파티클 프리셋/JSON을 자동으로 분석하고 3D 몰핑 엔진에 즉시 변환 적용합니다.
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

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-b border-[#2A2A2E] bg-[#0A0A0B] text-[10px]">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>1. 웹 파티클 프리셋 갤러리 ({ONLINE_PRESET_COLLECTION.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('url_fetch')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'url_fetch'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <Download className="w-3 h-3" />
              <span>2. URL 자동 다운로드 & 변환</span>
            </button>
            <button
              onClick={() => setActiveTab('json_paste')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'json_paste'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <FileJson className="w-3 h-3" />
              <span>3. JSON 직접 붙여넣기 변환</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'resources'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>4. 공식 사이트 & 기술 레퍼런스</span>
            </button>
          </div>

          <a
            href="https://particles.js.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#00F0FF] hover:underline text-[10px] font-bold"
          >
            <span>particles.js.org 방문</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Tab 1: Gallery Body */}
        {activeTab === 'gallery' && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#0A0A0B] space-y-4 custom-scrollbar">
            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-[#141417] p-2.5 border border-[#2A2A2E]">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="NASA, 우주, 네온, 불꽃, tsParticles 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-white text-xs pl-8 pr-3 py-1.5 outline-none focus:border-[#00F0FF] font-mono placeholder-gray-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1 w-full sm:w-auto text-[9px]">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'particles.js', label: 'particles.js' },
                  { id: 'tsparticles', label: 'tsParticles' },
                  { id: 'three.js', label: 'Three.js 3D' },
                  { id: 'space', label: '우주/성단' },
                  { id: 'cyber', label: '사이버/네온' },
                  { id: 'explosive', label: '불꽃/폭발' },
                  { id: 'nature', label: '자연/눈' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-1 uppercase font-bold transition border cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : 'bg-[#1A1A1E] text-gray-400 border-[#2A2A2E] hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isApplied = appliedPresetId === preset.id;
                const pConfig = preset.config;
                const colorA = pConfig.colorA || '#00F0FF';
                const colorB = pConfig.colorB || '#FF007F';
                const colorC = pConfig.colorC || '#FFE600';

                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 bg-[#141417] border transition flex flex-col justify-between ${
                      isApplied 
                        ? 'border-[#00F0FF] bg-[#181822] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'border-[#2A2A2E] hover:border-[#3A3A45]'
                    }`}
                  >
                    <div>
                      {/* Card Top: Ecosystem Badge & Links */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border uppercase ${
                          preset.sourceEco === 'particles.js' ? 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10' :
                          preset.sourceEco === 'tsparticles' ? 'text-[#FFE600] border-[#FFE600]/40 bg-[#FFE600]/10' :
                          'text-[#FF00AA] border-[#FF00AA]/40 bg-[#FF00AA]/10'
                        }`}>
                          {preset.sourceEco}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* 3-Color Swatch */}
                          <div className="flex items-center gap-0.5 p-0.5 bg-[#0A0A0B] border border-[#2A2A2E] rounded-xs">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorA }} />
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorB }} />
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorC }} />
                          </div>

                          <a
                            href={preset.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-500 hover:text-[#00F0FF] transition"
                            title="출처 원본 웹페이지 열기"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-bold text-white tracking-wide mb-1">
                        {preset.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-2.5">
                        {preset.description}
                      </p>

                      {/* Parameter Badges */}
                      <div className="flex flex-wrap gap-1 mb-3 text-[8px] font-mono text-gray-400 uppercase">
                        <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                          {pConfig.particleType}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                          {pConfig.noiseType}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                          {((pConfig.particleCount || 30000) / 1000).toFixed(0)}K PTS
                        </span>
                        {preset.sourceShapeId && preset.targetShapeId && (
                          <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                            {preset.sourceShapeId} ➔ {preset.targetShapeId}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[#222228]">
                      <button
                        onClick={() => handleApplyPreset(preset)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isApplied
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_#00F0FF]'
                            : 'bg-[#1E1E24] hover:bg-[#00F0FF] text-white hover:text-black border border-[#33333C] hover:border-[#00F0FF]'
                        }`}
                      >
                        {isApplied ? <CheckCircle2 className="w-3 h-3 text-black" /> : <Play className="w-3 h-3 fill-current" />}
                        <span>{isApplied ? '적용됨!' : '3D 엔진에 적용'}</span>
                      </button>

                      <button
                        onClick={() => setInspectingPreset(preset)}
                        className="px-2 py-1.5 bg-[#0A0A0B] hover:bg-[#1A1A1E] text-gray-400 hover:text-white border border-[#2A2A2E] text-[9px] uppercase transition cursor-pointer"
                        title="JSON 원본 코드 확인"
                      >
                        <Code2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: URL Fetcher Body */}
        {activeTab === 'url_fetch' && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#0A0A0B] space-y-4 custom-scrollbar text-xs">
            <div className="p-3.5 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>인터넷 URL 자동 다운로드 & 3D 파티클 변환기</span>
                </span>
                <span className="text-[9px] text-gray-500 font-mono">LIVE FETCHER</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                particles.js / tsParticles의 공식 JSON URL, GitHub raw JSON 주소, 또는 웹 API 주소를 입력하면 실시간으로 데이터를 다운로드하고 3D WebGL 셰이더 매개변수로 자동 변환합니다.
              </p>

              {/* URL Input Box */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://particles.js.org/... 또는 raw.githubusercontent.com/.../particles.json"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  className="flex-1 bg-[#0A0A0B] border border-[#2A2A2E] text-white text-xs px-3 py-2 outline-none focus:border-[#00F0FF] font-mono"
                />
                <button
                  onClick={() => handleFetchFromUrl()}
                  disabled={isFetching}
                  className="px-4 py-2 bg-[#00F0FF] hover:bg-white text-black font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)] disabled:opacity-50"
                >
                  {isFetching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{isFetching ? '가져오는 중...' : '가져와서 즉시 적용'}</span>
                </button>
              </div>

              {/* Quick Sample URLs */}
              <div className="pt-2">
                <div className="text-[9px] text-gray-400 uppercase font-bold mb-1.5">
                  빠른 샘플 인터넷 템플릿 (1-클릭 테스트):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                  {[
                    { label: 'NASA Deep Space', preset: ONLINE_PRESET_COLLECTION[0] },
                    { label: 'Hyperspace Warp', preset: ONLINE_PRESET_COLLECTION[1] },
                    { label: 'Winter Ice Crystals', preset: ONLINE_PRESET_COLLECTION[2] },
                    { label: 'Fireworks Explosion', preset: ONLINE_PRESET_COLLECTION[4] },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => handleApplyPreset(sample.preset)}
                      className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] text-left transition cursor-pointer"
                    >
                      <div className="text-[10px] font-bold text-[#00F0FF] truncate">{sample.label}</div>
                      <div className="text-[8px] text-gray-500 font-mono truncate">{sample.preset.sourceEco}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {fetchError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">오류 발생:</span> {fetchError}
                  <div className="text-[10px] text-gray-400 mt-1">
                    CORS 정책으로 직접 URL 접근이 차단된 경우, '3. JSON 직접 붙여넣기' 탭에 복사한 JSON 코드를 붙여넣어 즉시 적용하실 수 있습니다.
                  </div>
                </div>
              </div>
            )}

            {fetchSuccessMsg && (
              <div className="p-3 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{fetchSuccessMsg}</span>
              </div>
            )}

            {/* Fetched Conversion Result Inspector */}
            {fetchedResult && (
              <div className="p-4 bg-[#141417] border border-[#2A2A2E] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-200">
                  <span className="text-[#00F0FF]">분석 및 3D 매핑 결과</span>
                  <span className="text-[10px] text-gray-400 font-mono">{fetchedResult.converted.detectedFormat}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E]">
                    <span className="text-gray-500 block">파티클 수</span>
                    <strong className="text-white">{fetchedResult.converted.config.particleCount} 개</strong>
                  </div>
                  <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E]">
                    <span className="text-gray-500 block">외형 형상</span>
                    <strong className="text-white">{fetchedResult.converted.config.particleType}</strong>
                  </div>
                  <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E]">
                    <span className="text-gray-500 block">노이즈 알고리즘</span>
                    <strong className="text-white">{fetchedResult.converted.config.noiseType}</strong>
                  </div>
                  <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E]">
                    <span className="text-gray-500 block">메인 팔레트</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fetchedResult.converted.config.colorA }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fetchedResult.converted.config.colorB }} />
                      <span className="text-[9px] text-gray-300">{fetchedResult.converted.config.colorA}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct JSON Paste Body */}
        {activeTab === 'json_paste' && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#0A0A0B] space-y-4 custom-scrollbar text-xs">
            <div className="p-3.5 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  <span>particles.js / tsParticles JSON 직접 붙여넣기 변환기</span>
                </span>
                <span className="text-[9px] text-gray-500 font-mono">SMART TRANSLATOR</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                https://particles.js.org, CodePen, 웹 사이트 등에서 복사한 `particles.json` 코드를 아래에 붙여넣으면 색상, 속도, 크기, 형태, 노이즈, 궤적 매개변수를 3D WebGL 파티클 엔진으로 즉시 변환합니다.
              </p>

              <textarea
                rows={9}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`여기에 particles.js 또는 tsParticles JSON 설정을 붙여넣으세요...\n\n예시:\n{\n  "particles": {\n    "number": { "value": 200 },\n    "color": { "value": ["#00f0ff", "#ff007f"] },\n    "shape": { "type": "star" },\n    "move": { "speed": 3, "direction": "none" }\n  }\n}`}
                className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-gray-200 text-[11px] font-mono p-3 outline-none focus:border-[#00F0FF]"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setJsonInput(JSON.stringify(ONLINE_PRESET_COLLECTION[0].rawJson, null, 2));
                    }}
                    className="px-2.5 py-1 bg-[#1A1A1E] text-gray-400 hover:text-white border border-[#2A2A2E] text-[10px] font-mono cursor-pointer"
                  >
                    샘플 JSON 채우기 (NASA)
                  </button>
                  <button
                    onClick={() => setJsonInput('')}
                    className="px-2.5 py-1 bg-[#1A1A1E] text-gray-400 hover:text-white border border-[#2A2A2E] text-[10px] font-mono cursor-pointer"
                  >
                    지우기
                  </button>
                </div>

                <button
                  onClick={handleParseAndApplyJson}
                  className="px-5 py-2 bg-[#00F0FF] hover:bg-white text-black font-bold uppercase text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D 파티클 엔진에 즉시 변환 적용</span>
                </button>
              </div>
            </div>

            {jsonParseError && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{jsonParseError}</span>
              </div>
            )}

            {jsonParseSuccess && (
              <div className="p-3 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{jsonParseSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Resources & Manual */}
        {activeTab === 'resources' && (
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#0A0A0B] space-y-4 custom-scrollbar text-xs text-gray-300 leading-relaxed">
            <div className="p-4 bg-[#141417] border border-[#2A2A2E] space-y-3">
              <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>파티클 생태계 주요 웹사이트 및 기술 레퍼런스</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                인터넷의 파티클 시뮬레이터와 WebGL 엔진을 본 3D 몰핑 시스템과 연동하는 기술적 원리 및 추천 사이트 목록입니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <a
                  href="https://particles.js.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] transition block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00F0FF] mb-1">
                    <span>tsParticles / particles.js 공식 홈</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00F0FF]" />
                  </div>
                  <div className="text-[9px] text-[#00F0FF] font-mono mb-1.5">https://particles.js.org/</div>
                  <p className="text-[10px] text-gray-400">
                    전 세계에서 가장 널리 쓰이는 오픈소스 웹 파티클 라이브러리. 50개 이상의 다양한 2D/3D 물리 프리셋과 실시간 에디터 제공.
                  </p>
                </a>

                <a
                  href="https://github.com/matteobruni/tsparticles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] transition block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00F0FF] mb-1">
                    <span>tsParticles GitHub 공식 레포지토리</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00F0FF]" />
                  </div>
                  <div className="text-[9px] text-[#00F0FF] font-mono mb-1.5">github.com/matteobruni/tsparticles</div>
                  <p className="text-[10px] text-gray-400">
                    수많은 파티클 플러그인, 셰이더, 상호작용 인터랙션 코드 및 JSON 프리셋 데이터베이스 저장소.
                  </p>
                </a>

                <a
                  href="https://threejs.org/examples/#webgl_points_waves"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] transition block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00F0FF] mb-1">
                    <span>Three.js Points & GPU Particle Shaders</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00F0FF]" />
                  </div>
                  <div className="text-[9px] text-[#00F0FF] font-mono mb-1.5">threejs.org/examples</div>
                  <p className="text-[10px] text-gray-400">
                    WebGL GPU 버텍스 셰이더 기반의 대용량 포인트클라우드 파티클 시뮬레이션 공식 예제 모음.
                  </p>
                </a>

                <a
                  href="https://www.shadertoy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-[#0A0A0B] border border-[#2A2A2E] hover:border-[#00F0FF] transition block group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00F0FF] mb-1">
                    <span>Shadertoy GLSL 파티클 셰이더</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#00F0FF]" />
                  </div>
                  <div className="text-[9px] text-[#00F0FF] font-mono mb-1.5">shadertoy.com</div>
                  <p className="text-[10px] text-gray-400">
                    Curl Noise, 볼텍스 소용돌이, 프랙탈 유체 등 고급 GPU 파티클 수학 수식 및 GLSL 코드 저장소.
                  </p>
                </a>
              </div>
            </div>

            {/* Technical Mapping Explanation */}
            <div className="p-4 bg-[#141417] border border-[#2A2A2E] space-y-2 text-[11px]">
              <div className="text-xs font-bold text-[#FFE600] uppercase">
                ⚙️ 2D particles.js ➔ 3D WebGL GPU 수학적 변환 원리
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-gray-400 pl-1">
                <li><strong className="text-white">입자 수 밀도 확장:</strong> 2D 캔버스의 소량 입자(50~300개)를 3D 공간 밀도에 맞춰 15,000 ~ 60,000개의 볼류메트릭 포인트 클라우드로 자동 스케일링합니다.</li>
                <li><strong className="text-white">벡터 필드 및 컬 노이즈 매핑:</strong> 2D move 속도 및 방향 벡터를 3차원 Divergence-Free 3D Curl Noise 유체 방정식(Curl F = ∇ × Ψ)으로 승격하여 공간 입체감을 형성합니다.</li>
                <li><strong className="text-white">색상 및 발광 보간:</strong> 단색 또는 다색 배열을 3단 RGB 가산 광원 램프 및 운동 속도(Velocity Kinetic) 발광 셰이더와 결합합니다.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>선택한 프리셋은 3D WebGL GPU 엔진에서 실시간 60 FPS로 즉시 시뮬레이션됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-xs uppercase transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Raw JSON Code Inspector Modal */}
      {inspectingPreset && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0F0F12] border border-[#00F0FF] w-full max-w-2xl p-4 space-y-3 font-mono shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#00F0FF]" />
                <span>{inspectingPreset.title} - 원본 JSON 코드</span>
              </div>
              <button
                onClick={() => setInspectingPreset(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] text-gray-300 text-[10px] overflow-x-auto max-h-80 custom-scrollbar">
              <code>{JSON.stringify(inspectingPreset.rawJson, null, 2)}</code>
            </pre>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleCopyJson(inspectingPreset.rawJson, inspectingPreset.id)}
                className="px-3 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === inspectingPreset.id ? <Check className="w-3.5 h-3.5 text-[#00F0FF]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === inspectingPreset.id ? '복사됨!' : 'JSON 복사'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleApplyPreset(inspectingPreset);
                    setInspectingPreset(null);
                  }}
                  className="px-4 py-1.5 bg-[#00F0FF] text-black text-xs font-bold uppercase transition cursor-pointer"
                >
                  3D 엔진에 적용
                </button>
                <button
                  onClick={() => setInspectingPreset(null)}
                  className="px-3 py-1.5 bg-[#1A1A1E] text-gray-400 text-xs uppercase cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
