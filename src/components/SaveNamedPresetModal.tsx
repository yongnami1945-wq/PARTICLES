import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Download, Copy, Check, BookmarkPlus, Sparkles, 
  ArrowRight, FileJson, Layers, ShieldCheck, CheckCircle2,
  Tag, Plus, RefreshCw, Hash, Sliders, Cpu, Sun
} from 'lucide-react';
import { MorphConfig, MorphShape } from '../types';
import { 
  createNamedPresetPackage, 
  downloadNamedPresetJson,
  generateAutoPresetTags
} from '../utils/presetManager';

interface SaveNamedPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MorphConfig;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds?: string[];
  shapes: MorphShape[];
  onSaveToSlot?: (slot: number, name: string, tags?: string[]) => void;
}

export const SaveNamedPresetModal: React.FC<SaveNamedPresetModalProps> = ({
  isOpen,
  onClose,
  config,
  sourceShapeId,
  targetShapeId,
  waypointShapeIds = [],
  shapes,
  onSaveToSlot,
}) => {
  const sourceShape = shapes.find((s) => s.id === sourceShapeId);
  const targetShape = shapes.find((s) => s.id === targetShapeId);

  const defaultName = `${sourceShape?.name || sourceShapeId} ➔ ${targetShape?.name || targetShapeId} ${config.colorScheme || 'Custom'}`;
  
  const [presetName, setPresetName] = useState<string>(defaultName);
  const [description, setDescription] = useState<string>(
    `${sourceShape?.name || sourceShapeId}에서 ${targetShape?.name || targetShapeId}로 이어지는 ${config.particleType} / ${config.noiseType} 파티클 몰핑 프리셋`
  );
  const [author, setAuthor] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [saveSlot, setSaveSlot] = useState<number>(1);

  // Automatic & User-Managed Tags State
  const initialAutoTags = useMemo(() => {
    return generateAutoPresetTags({
      config,
      sourceShapeId,
      targetShapeId,
      waypointShapeIds,
      shapes
    });
  }, [config, sourceShapeId, targetShapeId, waypointShapeIds, shapes]);

  const [tags, setTags] = useState<string[]>(() => initialAutoTags);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setPresetName(defaultName);
      setDescription(
        `${sourceShape?.name || sourceShapeId}에서 ${targetShape?.name || targetShapeId}로 이어지는 ${config.particleType} / ${config.noiseType} 파티클 몰핑 프리셋`
      );
      setTags(initialAutoTags);
    }
  }, [isOpen, defaultName, initialAutoTags, sourceShape, targetShape, sourceShapeId, targetShapeId, config.particleType, config.noiseType]);

  if (!isOpen) return null;

  const safeWaypoints = waypointShapeIds || [];
  const currentChainIds = [sourceShapeId, ...safeWaypoints, targetShapeId];
  const customShapesInChain = shapes.filter((s) => 
    s.type !== 'preset' && currentChainIds.includes(s.id)
  );

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#+/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleResetAutoTags = () => {
    const freshTags = generateAutoPresetTags({
      config,
      sourceShapeId,
      targetShapeId,
      waypointShapeIds,
      shapes
    });
    setTags(freshTags);
  };

  const handleDownload = () => {
    downloadNamedPresetJson({
      name: presetName.trim() || defaultName,
      description,
      author,
      config,
      sourceShapeId,
      targetShapeId,
      waypointShapeIds,
      shapes,
      tags,
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyJson = () => {
    const pkg = createNamedPresetPackage({
      name: presetName.trim() || defaultName,
      description,
      author,
      config,
      sourceShapeId,
      targetShapeId,
      waypointShapeIds,
      shapes,
      tags,
    });
    navigator.clipboard.writeText(JSON.stringify(pkg, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const previewPackage = createNamedPresetPackage({
    name: presetName.trim() || defaultName,
    description,
    author,
    config,
    sourceShapeId,
    targetShapeId,
    waypointShapeIds,
    shapes,
    tags,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-[#0E0E12] border border-[#00F0FF] max-w-2xl w-full p-6 text-white space-y-5 shadow-[0_0_40px_rgba(0,240,255,0.25)] relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-[#1A1A22] rounded transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#22222A] pb-3">
          <div className="p-2 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF]">
            <FileJson className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>이름 지정 JSON 프리셋 파일 저장</span>
              <span className="text-[10px] px-2 py-0.5 bg-[#00F0FF] text-black font-mono font-bold">
                .JSON PRESET
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              현재 형상 시퀀스, 커스텀 포인트 클라우드, 물리 파라미터, 스마트 자동 태그를 독립형 JSON 파일로 패키징하여 내보냅니다.
            </p>
          </div>
        </div>

        {/* Current Morph Chain Summary */}
        <div className="p-3 bg-[#14141A] border border-[#2A2A34] space-y-1.5">
          <div className="text-[10px] text-gray-400 font-mono uppercase flex items-center justify-between">
            <span>포함되는 몰핑 시퀀스 체인:</span>
            <span className="text-[#FFE600] font-bold">총 {currentChainIds.length}단계 피사체</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-bold pt-0.5">
            <span className="px-2 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF]">
              출발: {sourceShape?.name || sourceShapeId}
            </span>

            {safeWaypoints.map((wpId, idx) => {
              const wpShape = shapes.find((s) => s.id === wpId);
              return (
                <React.Fragment key={`${wpId}-${idx}`}>
                  <ArrowRight className="w-3 h-3 text-[#FFE600]" />
                  <span className="px-2 py-1 bg-[#FFE600]/15 border border-[#FFE600] text-[#FFE600]">
                    경유#{idx + 1}: {wpShape?.name || wpId}
                  </span>
                </React.Fragment>
              );
            })}

            <ArrowRight className="w-3 h-3 text-white" />
            <span className="px-2 py-1 bg-white/15 border border-white text-white">
              목표: {targetShape?.name || targetShapeId}
            </span>
          </div>

          {customShapesInChain.length > 0 && (
            <div className="pt-2 border-t border-[#222228] text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                사용자 생성 커스텀 형상 {customShapesInChain.length}개({customShapesInChain.map((c) => c.name).join(', ')})의 3D 정점 좌표가 JSON 내부에 무손실 인코딩됩니다.
              </span>
            </div>
          )}
        </div>

        {/* Preset Configuration Form */}
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 uppercase tracking-wider">
              프리셋 이름 (Preset Name) <span className="text-[#00F0FF]">*</span>
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="예: Cyber Matrix Neon Vortex"
              className="w-full bg-[#070709] border border-[#2A2A34] focus:border-[#00F0FF] px-3 py-2 text-sm text-white font-bold outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                제작자 / 작성자 (Author, 선택)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: Particle Artist"
                className="w-full bg-[#070709] border border-[#2A2A34] focus:border-[#00F0FF] px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                파티클 수량 & 스프라이트 유형
              </label>
              <div className="px-3 py-1.5 bg-[#070709] border border-[#2A2A34] text-xs text-gray-300 flex items-center justify-between">
                <span className="text-[#FFE600] font-mono font-bold">
                  {(config.particleCount || 60000).toLocaleString()} Particles
                </span>
                <span className="text-[#00F0FF] font-mono">{config.particleType}</span>
              </div>
            </div>
          </div>

          {/* Automatic Tags Section */}
          <div className="p-3 bg-[#121218] border border-[#2A2A34] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>스마트 자동 태그 (Auto-Generated Tags)</span>
                <span className="text-[10px] text-gray-400 font-mono font-normal">
                  ({tags.length}개 활성화)
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetAutoTags}
                className="text-[10px] text-gray-400 hover:text-[#00F0FF] flex items-center gap-1 font-mono transition cursor-pointer"
                title="현재 형상과 파티클 수량을 기준으로 자동 태그를 다시 계산합니다."
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>태그 기본값 재설정</span>
              </button>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              프리셋에 사용된 <strong className="text-cyan-300">형상(Shapes)</strong>, <strong className="text-amber-300">파티클 수량(Particle Count)</strong>, <strong className="text-purple-300">물리/노이즈 설정</strong>을 분석하여 검색 및 필터링에 최적화된 메타데이터 태그를 자동으로 부여합니다.
            </p>

            {/* Tag Chips Breakdown by Category */}
            <div className="space-y-2">
              {/* Category Counts Bar */}
              <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
                <span className="px-2 py-0.5 bg-cyan-950/70 border border-cyan-700/80 text-cyan-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>형상/시퀀스 태그 ({tags.filter((t) => t.startsWith('Shape:') || t.startsWith('Morph:') || t.startsWith('Chain:') || t.startsWith('Category:') || shapes.some((s) => t.toLowerCase().includes(s.id.toLowerCase())) || t.includes('Stage')).length})</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-950/70 border border-amber-700/80 text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>파티클 밀도 태그 ({tags.filter((t) => t.includes('Particles') || t.startsWith('Count') || t.includes('Lite') || t.includes('Standard') || t.includes('Dense') || t.includes('Extreme')).length})</span>
                </span>
                <span className="px-2 py-0.5 bg-pink-950/70 border border-pink-700/80 text-pink-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                  <span>블룸/광원 태그 ({tags.filter((t) => t.includes('Bloom') || t.includes('Post-Processing') || t.startsWith('Sprite:') || t.startsWith('Theme:')).length})</span>
                </span>
              </div>

              {/* Tag Chips Container */}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-2 bg-[#070709] border border-[#1E1E26]">
                {tags.length === 0 ? (
                  <span className="text-[10px] text-gray-500 italic py-1 px-2">등록된 태그가 없습니다. 아래에서 태그를 추가하세요.</span>
                ) : (
                  tags.map((tag) => {
                    const isShapeTag = tag.startsWith('Shape:') || tag.startsWith('Morph:') || tag.startsWith('Chain:') || tag.startsWith('Category:') || shapes.some((s) => tag.toLowerCase().includes(s.id.toLowerCase())) || tag.includes('Stage');
                    const isCountTag = tag.includes('Particles') || tag.startsWith('Count') || tag.includes('Lite') || tag.includes('Standard') || tag.includes('Dense') || tag.includes('Extreme');
                    const isBloomTag = tag.includes('Bloom') || tag.includes('Post-Processing');
                    const isDynamicTag = tag.startsWith('Sprite:') || tag.startsWith('Noise:') || tag.startsWith('Theme:');

                    let chipStyle = 'bg-[#181824] border-[#3A3A4A] text-gray-200';
                    if (isShapeTag) {
                      chipStyle = 'bg-cyan-950/60 border-cyan-600/80 text-cyan-200';
                    } else if (isCountTag) {
                      chipStyle = 'bg-amber-950/60 border-amber-600/80 text-amber-200';
                    } else if (isBloomTag) {
                      chipStyle = 'bg-pink-950/60 border-pink-600/80 text-pink-200';
                    } else if (isDynamicTag) {
                      chipStyle = 'bg-purple-950/60 border-purple-600/80 text-purple-200';
                    } else if (tag.includes('Trails') || tag.includes('Gravity') || tag.includes('Orbit') || tag.includes('Audio')) {
                      chipStyle = 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200';
                    }

                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border rounded-sm transition group ${chipStyle}`}
                      >
                        <Hash className="w-2.5 h-2.5 opacity-60" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="opacity-50 group-hover:opacity-100 hover:text-red-400 p-0.5 cursor-pointer ml-0.5"
                          title={`'${tag}' 태그 삭제`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add Custom Tag Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="relative flex-1">
                <Hash className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="커스텀 태그 추가 (예: presentation, cinematic, demo) 후 Enter..."
                  className="w-full bg-[#070709] border border-[#2A2A34] focus:border-[#00F0FF] pl-7 pr-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTagInput.trim()}
                className="px-3 py-1.5 bg-[#1E1E2A] hover:bg-[#00F0FF] text-gray-300 hover:text-black border border-[#2E2E3E] hover:border-[#00F0FF] text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>태그 추가</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1 uppercase tracking-wider">
              프리셋 설명 / 메모 (Description, 선택)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프리셋에 대한 상세 설명이나 모핑 연출 의도를 입력하세요."
              className="w-full bg-[#070709] border border-[#2A2A34] focus:border-[#00F0FF] px-3 py-1.5 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>

        {/* JSON Preview Accordion */}
        <div className="border border-[#222228] bg-[#070709]">
          <button
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="w-full px-3 py-2 text-left text-[11px] font-mono text-gray-400 hover:text-white flex items-center justify-between cursor-pointer"
          >
            <span>JSON 구조 미리보기 (Schema: {previewPackage.schema} | Tags: {previewPackage.tags?.length || 0}개)</span>
            <span className="text-[10px] text-[#00F0FF]">{showJsonPreview ? '접기 ▲' : '펼치기 ▼'}</span>
          </button>
          {showJsonPreview && (
            <pre className="p-3 text-[10px] font-mono text-emerald-400 bg-black/60 max-h-40 overflow-y-auto custom-scrollbar border-t border-[#222228] leading-tight">
              {JSON.stringify(previewPackage, null, 2)}
            </pre>
          )}
        </div>

        {/* Actions & Export Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#22222A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="py-3 px-4 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black font-bold text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.35)]"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-black" />
                  <span>.JSON 프리셋 파일 다운로드</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyJson}
              className="py-3 px-4 bg-[#1A1A22] hover:bg-[#252530] text-gray-200 hover:text-white border border-[#3A3A46] font-bold text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00FF66]" />
                  <span className="text-[#00FF66]">클립보드 복사 완료</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-400" />
                  <span>JSON 코드 클립보드 복사</span>
                </>
              )}
            </button>
          </div>

          {/* Optional: Also Save to Local Storage Slot */}
          {onSaveToSlot && (
            <div className="pt-2 flex items-center justify-between p-2.5 bg-[#121218] border border-[#222228]">
              <div className="text-[11px] text-gray-300 flex items-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>동시에 로컬 스토리지 슬롯에 영구 저장:</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={saveSlot}
                  onChange={(e) => setSaveSlot(parseInt(e.target.value, 10))}
                  className="bg-[#0A0A0E] border border-[#2A2A34] text-[#FFE600] text-xs px-2 py-1 font-mono outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((s) => (
                    <option key={s} value={s}>슬롯 #{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    onSaveToSlot(saveSlot, presetName.trim() || defaultName, tags);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-[#FFE600]/15 hover:bg-[#FFE600] text-[#FFE600] hover:text-black border border-[#FFE600] text-[10px] font-bold uppercase transition cursor-pointer"
                >
                  슬롯 #{saveSlot} 저장 후 닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
