import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bookmark, BookmarkPlus, Download, Upload, RotateCcw, 
  Check, Sparkles, Waves, Palette, Layers, Play, Eye, Globe,
  Trash2, Copy, FileJson, CheckCircle2, Sliders, XCircle, X, ExternalLink,
  Save, RefreshCw, HardDrive, Filter, Search, ArrowRight, CornerDownRight,
  ShieldCheck, AlertCircle, Plus, FileDown, FolderOpen, Tag, Hash, Sun
} from 'lucide-react';
import { MorphConfig, MorphShape, NumberedPreset, SerializedMorphShape, ImportedPresetResult } from '../types';
import { 
  BUILTIN_PRESETS, 
  loadSavedPresets, 
  savePresetsToStorage, 
  exportPresetsToJson, 
  importPresetsFromJson,
  serializeMorphShape,
  deserializeMorphShape,
  saveWorkspaceState,
  loadWorkspaceState,
  clearWorkspaceState,
  getAutoRestoreEnabled,
  setAutoRestoreEnabled,
  downloadNamedPresetJson,
  generateAutoPresetTags
} from '../utils/presetManager';
import { SaveNamedPresetModal } from './SaveNamedPresetModal';
import { ImportNamedPresetModal } from './ImportNamedPresetModal';

interface PresetLibraryTabProps {
  config: MorphConfig;
  onChangeConfig: (newConfig: Partial<MorphConfig>) => void;
  sourceShapeId: string;
  targetShapeId: string;
  waypointShapeIds?: string[];
  shapes?: MorphShape[];
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
  onAddWaypoint?: (id: string) => void;
  onRemoveWaypoint?: (index: number) => void;
  onUpdateWaypoint?: (index: number, id: string) => void;
  onReorderChain?: (newChain: string[]) => void;
  onAddCustomShape?: (shape: MorphShape) => void;
  onOpenWebHub?: () => void;
}

export const PresetLibraryTab: React.FC<PresetLibraryTabProps> = ({
  config,
  onChangeConfig,
  sourceShapeId,
  targetShapeId,
  waypointShapeIds = [],
  shapes = [],
  onSelectSource,
  onSelectTarget,
  onAddWaypoint,
  onRemoveWaypoint,
  onUpdateWaypoint,
  onReorderChain,
  onAddCustomShape,
  onOpenWebHub,
}) => {
  const [presets, setPresets] = useState<NumberedPreset[]>(() => loadSavedPresets());
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [saveSlotNum, setSaveSlotNum] = useState<number>(1);
  const [saveName, setSaveName] = useState<string>('');
  const [saveDescription, setSaveDescription] = useState<string>('');
  const [flashFeedback, setFlashFeedback] = useState<string | null>(null);
  const [showImportBox, setShowImportBox] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'builtin' | 'user'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagCategoryFilter, setTagCategoryFilter] = useState<'all' | 'shapes' | 'counts' | 'bloom_fx'>('all');
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [extraSaveTags, setExtraSaveTags] = useState<string[]>([]);
  const [excludedAutoTags, setExcludedAutoTags] = useState<string[]>([]);
  const [autoRestore, setAutoRestore] = useState<boolean>(() => getAutoRestoreEnabled());
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>(() => new Date().toLocaleTimeString());
  const [isSaveNamedModalOpen, setIsSaveNamedModalOpen] = useState<boolean>(false);
  const [isImportNamedModalOpen, setIsImportNamedModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist presets to Local Storage whenever presets state changes
  useEffect(() => {
    savePresetsToStorage(presets);
  }, [presets]);

  // Extract all unique tags present across currently loaded presets with frequency counts
  const allAvailableTags = useMemo(() => {
    const tagCountMap: Record<string, number> = {};
    presets.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCountMap)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [presets]);

  // Compute live auto-tags for current workspace
  const currentWorkspaceAutoTags = useMemo(() => {
    return generateAutoPresetTags({
      config,
      sourceShapeId,
      targetShapeId,
      waypointShapeIds: waypointShapeIds || [],
      shapes,
    });
  }, [config, sourceShapeId, targetShapeId, waypointShapeIds, shapes]);

  // Final tags to save to slot, combining auto tags and custom user additions
  const finalWorkspaceTagsToSave = useMemo(() => {
    const list = currentWorkspaceAutoTags.filter((t) => !excludedAutoTags.includes(t));
    extraSaveTags.forEach((t) => {
      if (!list.includes(t)) list.push(t);
    });
    return list;
  }, [currentWorkspaceAutoTags, excludedAutoTags, extraSaveTags]);

  // Filtered available tags according to selected tag category
  const filteredAvailableTags = useMemo(() => {
    if (tagCategoryFilter === 'all') return allAvailableTags;
    if (tagCategoryFilter === 'shapes') {
      return allAvailableTags.filter(({ tag }) => 
        tag.startsWith('Shape:') || 
        tag.startsWith('Morph:') || 
        tag.startsWith('Chain:') || 
        tag.startsWith('Category:') || 
        shapes.some((s) => tag.toLowerCase().includes(s.id.toLowerCase())) || 
        tag.includes('Stage')
      );
    }
    if (tagCategoryFilter === 'counts') {
      return allAvailableTags.filter(({ tag }) => 
        tag.includes('Particles') || 
        tag.startsWith('Count') || 
        tag.includes('Lite') || 
        tag.includes('Standard') || 
        tag.includes('Dense') || 
        tag.includes('Extreme')
      );
    }
    if (tagCategoryFilter === 'bloom_fx') {
      return allAvailableTags.filter(({ tag }) => 
        tag.includes('Bloom') || 
        tag.includes('Post-Processing') || 
        tag.includes('Trails') || 
        tag.includes('Gravity') || 
        tag.includes('Orbit') || 
        tag.includes('Audio') || 
        tag.startsWith('Sprite:') || 
        tag.startsWith('Noise:') || 
        tag.startsWith('Theme:')
      );
    }
    return allAvailableTags;
  }, [allAvailableTags, tagCategoryFilter, shapes]);

  // Handle Auto-Restore Setting Toggle
  const handleToggleAutoRestore = () => {
    const next = !autoRestore;
    setAutoRestore(next);
    setAutoRestoreEnabled(next);
    showNotification(next ? '로컬 세션 자동 저장 활성화됨' : '로컬 세션 자동 저장 비활성화됨');
  };

  const showNotification = (msg: string) => {
    setFlashFeedback(msg);
    setTimeout(() => setFlashFeedback(null), 2500);
  };

  // Helper to get Shape Name by ID
  const getShapeName = (id: string): string => {
    const found = shapes.find((s) => s.id === id);
    if (found) return found.name;
    return id;
  };

  // Handle Apply from ImportNamedPresetModal
  const handleApplyImportedPreset = (result: ImportedPresetResult) => {
    // 1. Register any contained custom shapes
    if (result.shapes && result.shapes.length > 0 && onAddCustomShape) {
      result.shapes.forEach((shape) => {
        const exists = shapes.some((s) => s.id === shape.id);
        if (!exists) {
          onAddCustomShape(shape);
        }
      });
    }

    // 2. Apply config
    onChangeConfig({
      ...result.config,
      progress: config.progress,
    });

    // 3. Set Source
    if (result.sourceShapeId) {
      onSelectSource(result.sourceShapeId);
    }

    // 4. Set Target
    if (result.targetShapeId) {
      onSelectTarget(result.targetShapeId);
    }

    // 5. Restore chain
    if (result.morphChain && result.morphChain.length >= 2 && onReorderChain) {
      onReorderChain(result.morphChain);
    }

    setLastSavedTimestamp(new Date().toLocaleTimeString());
    showNotification(`[${result.name}] 프리셋 전체 파라미터 및 형상 복원 완료!`);
  };

  // Handle Save to slot from Import modal or Save modal
  const handleSaveImportedToSlot = (slot: number, result: ImportedPresetResult | string, customTags?: string[]) => {
    if (typeof result === 'string') {
      handleSaveToSlot(slot, result, undefined, customTags);
    } else {
      const sourceName = getShapeName(result.sourceShapeId);
      const targetName = getShapeName(result.targetShapeId);
      const safeResultWaypoints = Array.isArray(result.waypointShapeIds)
        ? result.waypointShapeIds
        : (Array.isArray(result.morphChain) && result.morphChain.length > 2 ? result.morphChain.slice(1, -1) : []);

      const tagsToSave = customTags && customTags.length > 0
        ? customTags
        : (result.tags && result.tags.length > 0
            ? result.tags
            : generateAutoPresetTags({
                config: result.config || {},
                sourceShapeId: result.sourceShapeId,
                targetShapeId: result.targetShapeId,
                waypointShapeIds: safeResultWaypoints,
                shapes: result.shapes,
              }));

      const newPreset: NumberedPreset = {
        slot,
        id: `preset_slot_${slot}_${Date.now()}`,
        name: result.name || `프리셋 #${slot}`,
        category: 'user',
        createdAt: Date.now(),
        sourceShapeId: result.sourceShapeId,
        targetShapeId: result.targetShapeId,
        waypointShapeIds: safeResultWaypoints,
        morphChain: result.morphChain || [result.sourceShapeId, ...safeResultWaypoints, result.targetShapeId],
        description: result.description || `${sourceName} ➔ ${targetName}`,
        config: result.config,
        tags: tagsToSave,
      };

      setPresets((prev) => {
        const filtered = prev.filter((p) => p.slot !== slot);
        return [...filtered, newPreset].sort((a, b) => a.slot - b.slot);
      });
      setActiveSlot(slot);
      showNotification(`슬롯 #${slot} [${newPreset.name}] 에 프리셋이 영구 등록되었습니다.`);
    }
  };

  // Download individual preset card as a named JSON file
  const handleDownloadPresetCard = (preset: NumberedPreset) => {
    downloadNamedPresetJson({
      name: preset.name,
      description: preset.description,
      config: { ...config, ...preset.config },
      sourceShapeId: preset.sourceShapeId || sourceShapeId,
      targetShapeId: preset.targetShapeId || targetShapeId,
      waypointShapeIds: preset.waypointShapeIds || [],
      shapes,
    });
    showNotification(`[${preset.name}] JSON 프리셋 파일이 다운로드되었습니다.`);
  };

  // Load a complete preset (including config, source, target, waypoints, and attached custom shapes)
  const handleLoadPreset = (preset: NumberedPreset) => {
    setActiveSlot(preset.slot);

    // 1. Restore attached custom shapes if present
    if (preset.customShapes && preset.customShapes.length > 0 && onAddCustomShape) {
      preset.customShapes.forEach((sShape) => {
        const alreadyExists = shapes.some((s) => s.id === sShape.id);
        if (!alreadyExists) {
          const restored = deserializeMorphShape(sShape);
          onAddCustomShape(restored);
        }
      });
    }

    // 2. Apply config parameters
    onChangeConfig({
      ...preset.config,
      // Preserve current playing/progress unless specified
      progress: config.progress,
    });

    // 3. Set Source Shape
    if (preset.sourceShapeId) {
      onSelectSource(preset.sourceShapeId);
    }

    // 4. Set Target Shape
    if (preset.targetShapeId) {
      onSelectTarget(preset.targetShapeId);
    }

    // 5. Restore full morph sequence chain / waypoints
    const safePresetWaypoints = Array.isArray(preset.waypointShapeIds) ? preset.waypointShapeIds : [];
    if (safePresetWaypoints.length > 0 && onReorderChain) {
      const fullChain = [
        preset.sourceShapeId || sourceShapeId,
        ...safePresetWaypoints,
        preset.targetShapeId || targetShapeId
      ];
      onReorderChain(fullChain);
    } else if (preset.morphChain && onReorderChain && preset.morphChain.length >= 2) {
      onReorderChain(preset.morphChain);
    }

    setLastSavedTimestamp(new Date().toLocaleTimeString());
    showNotification(`슬롯 #${preset.slot} [${preset.name}] 몰핑 체인 전체 적용 완료`);
  };

  // Deselect / Cancel active preset selection
  const handleDeselectPreset = () => {
    setActiveSlot(null);
    showNotification('프리셋 선택이 취소되었습니다 (사용자 정의 모드)');
  };

  // Save current workspace state (config + complete morph chain + custom shapes + auto tags) into chosen slot number
  const handleSaveToSlot = (slotToSave: number, customName?: string, customDesc?: string, customTags?: string[]) => {
    const finalName = customName?.trim() || `사용자 프리셋 #${slotToSave}`;
    
    // Identify any user-created or uploaded custom shapes involved in current chain
    const safeWaypoints = waypointShapeIds || [];
    const currentChainIds = [sourceShapeId, ...safeWaypoints, targetShapeId];
    const customShapesToSave: SerializedMorphShape[] = shapes
      .filter((s) => s.type !== 'preset' && currentChainIds.includes(s.id))
      .map((s) => serializeMorphShape(s, 5000));

    const sourceName = getShapeName(sourceShapeId);
    const targetName = getShapeName(targetShapeId);
    const chainDesc = safeWaypoints.length > 0
      ? `${sourceName} ➔ [경유 ${safeWaypoints.length}단계] ➔ ${targetName}`
      : `${sourceName} ➔ ${targetName}`;

    const tagsToSave = customTags && customTags.length > 0
      ? customTags
      : generateAutoPresetTags({
          config,
          sourceShapeId,
          targetShapeId,
          waypointShapeIds: safeWaypoints,
          shapes,
        });

    const newPreset: NumberedPreset = {
      slot: slotToSave,
      id: `preset_slot_${slotToSave}_${Date.now()}`,
      name: finalName,
      category: 'user',
      createdAt: Date.now(),
      sourceShapeId,
      targetShapeId,
      waypointShapeIds: [...safeWaypoints],
      morphChain: [sourceShapeId, ...safeWaypoints, targetShapeId],
      customShapes: customShapesToSave.length > 0 ? customShapesToSave : undefined,
      description: customDesc?.trim() || `${chainDesc} (${config.particleType} / ${config.noiseType} / ${config.colorScheme})`,
      tags: tagsToSave,
      config: {
        particleCount: config.particleCount,
        particleType: config.particleType,
        shapeRotation: config.shapeRotation,
        coreRatio: config.coreRatio,
        noiseType: config.noiseType,
        noiseAmp: config.noiseAmp,
        noiseFreq: config.noiseFreq,
        noiseSpeed: config.noiseSpeed,
        delayMode: config.delayMode,
        delaySpread: config.delaySpread,
        durationVariance: config.durationVariance,
        attractStrength: config.attractStrength,
        damping: config.damping,
        colorMixMode: config.colorMixMode,
        colorScheme: config.colorScheme,
        colorA: config.colorA,
        colorB: config.colorB,
        colorC: config.colorC,
        colorMixRatio: config.colorMixRatio,
        velocityColorShift: config.velocityColorShift,
        colorGamma: config.colorGamma,
        pointSize: config.pointSize,
        glowIntensity: config.glowIntensity,
        blending: config.blending,
        autoRotate: config.autoRotate,
        rotateSpeed: config.rotateSpeed,
        depthTest: config.depthTest,
        trailsEnabled: config.trailsEnabled,
        trailLength: config.trailLength,
        motionBlurIntensity: config.motionBlurIntensity,
        playSpeed: config.playSpeed,
        playMode: config.playMode,
        morphEasing: config.morphEasing,
        mouseGravityEnabled: config.mouseGravityEnabled,
        mouseGravityMode: config.mouseGravityMode,
        mouseGravityRadius: config.mouseGravityRadius,
        mouseGravityStrength: config.mouseGravityStrength,
        ambientDriftAmp: config.ambientDriftAmp,
        spriteHslCycle: config.spriteHslCycle,
        snowflakeMultiSize: config.snowflakeMultiSize,
        snowflakeCustomBlending: config.snowflakeCustomBlending,
        bloomEnabled: config.bloomEnabled,
        bloomStrength: config.bloomStrength,
        bloomRadius: config.bloomRadius,
        bloomThreshold: config.bloomThreshold,
        bloomToneMappingExposure: config.bloomToneMappingExposure,
      },
    };

    setPresets((prev) => {
      const filtered = prev.filter((p) => p.slot !== slotToSave);
      const next = [...filtered, newPreset].sort((a, b) => a.slot - b.slot);
      return next;
    });

    setActiveSlot(slotToSave);
    setSaveName('');
    setSaveDescription('');
    setLastSavedTimestamp(new Date().toLocaleTimeString());
    showNotification(`현재 형상 체인 & 설정(태그 ${tagsToSave.length}개)이 로컬 슬롯 #${slotToSave}에 안전하게 저장되었습니다!`);
  };

  // Duplicate a preset into the next available slot
  const handleDuplicatePreset = (preset: NumberedPreset) => {
    // Find first available slot (1..24)
    const existingSlots = new Set(presets.map((p) => p.slot));
    let nextSlot = 1;
    while (existingSlots.has(nextSlot)) {
      nextSlot++;
    }

    const cloned: NumberedPreset = {
      ...preset,
      slot: nextSlot,
      id: `preset_slot_${nextSlot}_${Date.now()}`,
      name: `${preset.name} (복사본)`,
      category: 'user',
      createdAt: Date.now(),
      tags: preset.tags ? [...preset.tags] : undefined,
    };

    setPresets((prev) => [...prev, cloned].sort((a, b) => a.slot - b.slot));
    showNotification(`슬롯 #${preset.slot}이 슬롯 #${nextSlot}으로 복제되었습니다.`);
  };

  // Delete a user preset
  const handleDeletePreset = (slotToDelete: number) => {
    const target = presets.find((p) => p.slot === slotToDelete);
    if (!target) return;
    if (window.confirm(`슬롯 #${slotToDelete} [${target.name}] 프리셋을 삭제하시겠습니까?`)) {
      setPresets((prev) => prev.filter((p) => p.slot !== slotToDelete));
      if (activeSlot === slotToDelete) setActiveSlot(null);
      showNotification(`슬롯 #${slotToDelete} 프리셋이 삭제되었습니다.`);
    }
  };

  // Reset to factory built-ins
  const handleResetBuiltins = () => {
    if (window.confirm('모든 프리셋을 초기 기본 프리셋(1~12)으로 복원하시겠습니까? 사용자 저장 프리셋은 초기화됩니다.')) {
      setPresets(BUILTIN_PRESETS);
      savePresetsToStorage(BUILTIN_PRESETS);
      setActiveSlot(1);
      showNotification('기본 프리셋으로 초기화되었습니다.');
    }
  };

  // Export JSON download
  const handleExportJson = () => {
    const json = exportPresetsToJson(presets);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `particle-presets-slots-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('프리셋 JSON 파일이 다운로드되었습니다.');
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    const json = exportPresetsToJson(presets);
    navigator.clipboard.writeText(json);
    showNotification('프리셋 JSON이 클립보드에 복사되었습니다.');
  };

  // Import JSON text
  const handleImportJson = () => {
    if (!importJsonText.trim()) return;
    const imported = importPresetsFromJson(importJsonText);
    if (imported && imported.length > 0) {
      setPresets(imported.sort((a, b) => a.slot - b.slot));
      savePresetsToStorage(imported);
      setShowImportBox(false);
      setImportJsonText('');
      showNotification(`${imported.length}개의 프리셋을 성공적으로 불러왔습니다.`);
    } else {
      alert('유효하지 않은 프리셋 JSON 형식입니다.');
    }
  };

  // Import JSON via file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const imported = importPresetsFromJson(content);
        if (imported && imported.length > 0) {
          setPresets(imported.sort((a, b) => a.slot - b.slot));
          savePresetsToStorage(imported);
          showNotification(`${imported.length}개의 프리셋 파일을 로컬 스토리지에 복원했습니다.`);
        } else {
          alert('JSON 파일 형식이 올바르지 않습니다.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered & Searched Presets
  const filteredPresets = useMemo(() => {
    return presets
      .filter((p) => {
        if (filterCategory === 'builtin') return p.category === 'builtin';
        if (filterCategory === 'user') return p.category === 'user';
        return true;
      })
      .filter((p) => {
        if (selectedTag) {
          if (!p.tags || !p.tags.includes(selectedTag)) {
            return false;
          }
        }
        return true;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const srcName = p.sourceShapeId ? getShapeName(p.sourceShapeId).toLowerCase() : '';
        const tgtName = p.targetShapeId ? getShapeName(p.targetShapeId).toLowerCase() : '';
        const waypointNames = (p.waypointShapeIds || []).map((wId) => getShapeName(wId).toLowerCase());
        const pCount = p.config.particleCount || 60000;
        const pCountStr = `${pCount}`;
        const pCountKStr = `${Math.round(pCount / 1000)}k`;

        return (
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.slot.toString().includes(q) ||
          (p.config.particleType && p.config.particleType.toLowerCase().includes(q)) ||
          (p.config.noiseType && p.config.noiseType.toLowerCase().includes(q)) ||
          (p.config.colorScheme && p.config.colorScheme.toLowerCase().includes(q)) ||
          srcName.includes(q) ||
          tgtName.includes(q) ||
          waypointNames.some((wn) => wn.includes(q)) ||
          pCountStr.includes(q) ||
          pCountKStr.includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => a.slot - b.slot);
  }, [presets, filterCategory, searchQuery, selectedTag, shapes]);

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {flashFeedback && (
        <div className="p-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[11px] font-bold flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-[#00F0FF] flex-shrink-0" />
          <span>{flashFeedback}</span>
        </div>
      )}

      {/* Persistence Telemetry & Session Auto-Restore Header Card */}
      <div className="bg-[#101015] border border-[#00F0FF]/40 p-3.5 space-y-3 shadow-[0_2px_15px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              💾 브라우저 로컬 스토리지 (Local Storage)
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#00F0FF] bg-[#00F0FF]/15 px-2 py-0.5 border border-[#00F0FF]/30 font-bold">
            PERSISTENCE ACTIVE
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-[#22222A]">
          <div className="text-[10px] text-gray-300 flex items-center gap-2">
            <span className="text-gray-400">저장된 총 프리셋:</span>
            <strong className="text-white font-mono">{presets.length}개</strong>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">마지막 동기화:</span>
            <strong className="text-[#FFE600] font-mono">{lastSavedTimestamp}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAutoRestore}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border ${
                autoRestore
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#181820] border-[#2A2A34] text-gray-400 hover:text-white'
              }`}
              title="브라우저를 새로고침하거나 재방문해도 현재 형상 체인 및 세부 설정을 자동으로 유지합니다."
            >
              <ShieldCheck className="w-3 h-3" />
              <span>세션 자동 복원 {autoRestore ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured: Three.js WebGPU Earth & Atmosphere (Attached File Integration) */}
      <div className="p-3.5 bg-gradient-to-r from-[#00F0FF]/15 via-[#1A1A26] to-[#BC490B]/20 border border-[#00F0FF] space-y-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🌍 Three.js WebGPU 지구 & 대기권 글로브</span>
            </span>
            <span className="text-[8px] bg-[#00F0FF] text-black px-1.5 py-0.5 font-bold uppercase">
              ATTACHED SCENE
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#FFE600] font-bold">SLOT #10</span>
        </div>

        <p className="text-[10px] text-gray-300 leading-relaxed">
          첨부된 <strong className="text-[#00F0FF]">Three.js WebGPU Earth</strong>의 대륙·해양 지형, 3D 구름층, 1.04x 대기권 프레넬 글로우(<span className="text-[#4DB2FF]">#4db2ff</span> 주간 / <span className="text-[#BC490B]">#bc490b</span> 황혼 석양)를 3D 파티클 엔진에 즉시 장착합니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
          <button
            onClick={() => {
              const earthPreset = presets.find((p) => p.slot === 10) || BUILTIN_PRESETS.find((p) => p.slot === 10);
              if (earthPreset) handleLoadPreset(earthPreset);
            }}
            className="py-1.5 px-2 bg-[#00F0FF] hover:bg-[#00F0FF]/80 text-black text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>프리셋 즉시 실행</span>
          </button>

          <button
            onClick={() => {
              onSelectSource('earth');
              showNotification('출발 형상(Source)으로 지구를 장착했습니다.');
            }}
            className="py-1.5 px-2 bg-[#141418] hover:bg-[#1E1E28] border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>출발 형상 지정</span>
          </button>

          <button
            onClick={() => {
              onSelectTarget('earth');
              showNotification('도착 목표(Target)로 지구를 장착했습니다.');
            }}
            className="py-1.5 px-2 bg-[#141418] hover:bg-[#1E1E28] border border-white text-white text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>도착 목표 지정</span>
          </button>

          <button
            onClick={() => {
              onChangeConfig({
                particleType: 'snowflake_multi',
                spriteHslCycle: true,
                colorA: '#4DB2FF',
                colorB: '#BC490B',
                colorC: '#FFFFFF',
              });
              onSelectTarget('earth');
              showNotification('지구 + 5단 눈꽃 블리자드 모드가 장착되었습니다.');
            }}
            className="py-1.5 px-2 bg-[#141418] hover:bg-[#1E1E28] border border-[#FFE600] text-[#FFE600] text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>눈꽃+지구 모드</span>
          </button>
        </div>
      </div>

      {/* Online Particle Web Hub Banner Button */}
      {onOpenWebHub && (
        <button
          onClick={onOpenWebHub}
          className="w-full p-3 bg-gradient-to-r from-[#00F0FF]/20 via-[#181824] to-[#9D00FF]/20 hover:from-[#00F0FF]/30 hover:to-[#9D00FF]/30 border border-[#00F0FF]/60 hover:border-[#00F0FF] text-left transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)] group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white flex items-center gap-2 group-hover:text-[#00F0FF]">
              <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>🌐 인터넷 파티클 웹 허브 (particles.js.org)</span>
            </span>
            <span className="text-[8px] bg-[#00F0FF] text-black px-1.5 py-0.5 font-bold uppercase">
              ONLINE HUB
            </span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed">
            particles.js.org, tsParticles, Three.js의 온라인 프리셋을 자동으로 가져와 3D 엔진에 즉시 변환 적용합니다.
          </p>
        </button>
      )}

      {/* Quick Slot Bar (1 ~ 12) */}
      <div className="bg-[#141417] border border-[#2A2A2E] p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400">
          <span className="flex items-center gap-1.5 text-[#00F0FF]">
            <Bookmark className="w-3.5 h-3.5" />
            빠른 슬롯 번호 (QUICK SLOTS 1 ~ 12)
          </span>
          <div className="flex items-center gap-1.5">
            {activeSlot !== null && (
              <button
                onClick={handleDeselectPreset}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-red-950/70 border border-red-700 hover:border-red-500 text-red-300 hover:text-white text-[9px] font-mono transition cursor-pointer"
                title="현재 선택된 프리셋 슬롯 선택 취소"
              >
                <X className="w-2.5 h-2.5" />
                <span>선택 취소</span>
              </button>
            )}
            <span className="text-[9px] text-gray-500 font-mono">1-CLICK LOAD</span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((slotNum) => {
            const found = presets.find((p) => p.slot === slotNum);
            const isSelected = activeSlot === slotNum;
            return (
              <button
                key={slotNum}
                onClick={() => {
                  if (isSelected) {
                    handleDeselectPreset();
                  } else if (found) {
                    handleLoadPreset(found);
                  } else {
                    handleSaveToSlot(slotNum);
                  }
                }}
                className={`py-2 px-1 text-center border font-mono transition cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : found
                    ? found.category === 'user'
                      ? 'bg-[#1A1A24] text-[#FFE600] border-[#FFE600]/40 hover:border-[#FFE600]'
                      : 'bg-[#1A1A1E] text-[#00F0FF] border-[#2A2A2E] hover:border-[#00F0FF]'
                    : 'bg-[#0A0A0B] text-gray-600 border-[#2A2A2E] hover:border-gray-500'
                }`}
                title={
                  isSelected 
                    ? `슬롯 #${slotNum} (클릭 시 선택 취소)` 
                    : found 
                    ? `슬롯 #${slotNum}: ${found.name}` 
                    : `빈 슬롯 #${slotNum} (클릭 시 현재 설정 저장)`
                }
              >
                <span className="text-[11px] font-bold">#{slotNum}</span>
                <span className="text-[8px] truncate max-w-full opacity-80">
                  {isSelected ? 'ACTIVE' : found ? found.name.split(' ')[0] : 'EMPTY'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Current Config & Morph Chain Section */}
      <div className="bg-[#141417] border border-[#00F0FF]/50 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] text-[#00F0FF] uppercase tracking-widest font-bold flex items-center gap-1.5">
            <BookmarkPlus className="w-3.5 h-3.5" />
            현재 형상 체인 & 세부 설정을 로컬에 저장
          </h3>
          <span className="text-[9px] font-mono text-[#FFE600]">FULL MORPH CHAIN</span>
        </div>

        {/* Current Chain Visual Summary */}
        <div className="p-2 bg-[#0A0A0E] border border-[#2A2A34] text-[10px] space-y-1">
          <div className="text-gray-400 uppercase text-[9px] font-mono">저장 대상 현재 몰핑 경로:</div>
          <div className="flex items-center gap-1.5 flex-wrap text-white font-bold">
            <span className="px-1.5 py-0.5 bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[9px]">
              출발: {getShapeName(sourceShapeId)}
            </span>
            {(waypointShapeIds || []).map((wpId, idx) => (
              <React.Fragment key={`${wpId}-${idx}`}>
                <ArrowRight className="w-2.5 h-2.5 text-[#FFE600]" />
                <span className="px-1.5 py-0.5 bg-[#FFE600]/15 border border-[#FFE600]/40 text-[#FFE600] text-[9px]">
                  경유#{idx + 1}: {getShapeName(wpId)}
                </span>
              </React.Fragment>
            ))}
            <ArrowRight className="w-2.5 h-2.5 text-white" />
            <span className="px-1.5 py-0.5 bg-white/15 border border-white/40 text-white text-[9px]">
              목표: {getShapeName(targetShapeId)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-1">
            <label className="text-[9px] text-gray-400 uppercase block mb-1">저장 슬롯 번호</label>
            <select
              value={saveSlotNum}
              onChange={(e) => setSaveSlotNum(parseInt(e.target.value, 10))}
              className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-[#00F0FF] text-xs p-1.5 font-mono focus:border-[#00F0FF] outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => {
                const existing = presets.find((p) => p.slot === num);
                return (
                  <option key={num} value={num}>
                    슬롯 #{num} {existing ? `(${existing.name})` : '(비어있음)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[9px] text-gray-400 uppercase block mb-1">프리셋 이름 (선택)</label>
            <input
              type="text"
              placeholder={`My Morph Preset #${saveSlotNum}`}
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-white text-xs p-1.5 placeholder-gray-600 focus:border-[#00F0FF] outline-none"
            />
          </div>
        </div>

        {/* Live Auto-Generated Tags Breakdown & Customization */}
        <div className="p-2.5 bg-[#0C0C12] border border-[#22222E] space-y-2">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-gray-300 font-mono flex items-center gap-1.5 font-bold">
              <Tag className="w-3 h-3 text-[#00F0FF]" />
              <span>자동 분류 저장 태그 ({finalWorkspaceTagsToSave.length}개):</span>
            </span>
            <span className="text-[8px] text-[#00F0FF] font-mono border border-[#00F0FF]/40 px-1.5 py-0.5 bg-[#00F0FF]/10">
              SMART AUTO-TAGGED
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono flex-wrap">
            <span className="px-1.5 py-0.5 bg-cyan-950/70 border border-cyan-700/80 text-cyan-300">
              🔷 형상 ({finalWorkspaceTagsToSave.filter((t) => t.startsWith('Shape:') || t.startsWith('Morph:') || t.startsWith('Chain:') || t.startsWith('Category:') || shapes.some((s) => t.toLowerCase().includes(s.id.toLowerCase())) || t.includes('Stage')).length})
            </span>
            <span className="px-1.5 py-0.5 bg-amber-950/70 border border-amber-700/80 text-amber-300">
              🔶 수량 ({finalWorkspaceTagsToSave.filter((t) => t.includes('Particles') || t.startsWith('Count') || t.includes('Lite') || t.includes('Standard') || t.includes('Dense') || t.includes('Extreme')).length})
            </span>
            <span className="px-1.5 py-0.5 bg-pink-950/70 border border-pink-700/80 text-pink-300">
              🌸 블룸/광원 ({finalWorkspaceTagsToSave.filter((t) => t.includes('Bloom') || t.includes('Post-Processing') || t.startsWith('Sprite:') || t.startsWith('Theme:')).length})
            </span>
          </div>

          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto custom-scrollbar p-1.5 bg-[#060608] border border-[#1A1A22]">
            {finalWorkspaceTagsToSave.map((tag) => {
              const isShapeTag = tag.startsWith('Shape:') || tag.startsWith('Morph:') || tag.startsWith('Chain:') || tag.startsWith('Category:') || shapes.some((s) => tag.toLowerCase().includes(s.id.toLowerCase())) || tag.includes('Stage');
              const isCountTag = tag.includes('Particles') || tag.startsWith('Count') || tag.includes('Lite') || tag.includes('Standard') || tag.includes('Dense') || tag.includes('Extreme');
              const isBloomTag = tag.includes('Bloom') || tag.includes('Post-Processing');

              let chipStyle = 'bg-[#181824] border-[#3A3A4A] text-gray-200';
              if (isShapeTag) {
                chipStyle = 'bg-cyan-950/70 border-cyan-600/90 text-cyan-200';
              } else if (isCountTag) {
                chipStyle = 'bg-amber-950/70 border-amber-600/90 text-amber-200';
              } else if (isBloomTag) {
                chipStyle = 'bg-pink-950/70 border-pink-600/90 text-pink-200';
              }

              return (
                <span
                  key={tag}
                  className={`px-1.5 py-0.5 border text-[9px] font-mono flex items-center gap-1 ${chipStyle}`}
                >
                  <Hash className="w-2 h-2 opacity-60" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentWorkspaceAutoTags.includes(tag)) {
                        setExcludedAutoTags((prev) => [...prev, tag]);
                      } else {
                        setExtraSaveTags((prev) => prev.filter((t) => t !== tag));
                      }
                    }}
                    className="hover:text-red-400 opacity-60 hover:opacity-100 p-0.5 cursor-pointer ml-0.5"
                    title={`'${tag}' 태그 제외`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Quick Tag Addition */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <input
              type="text"
              placeholder="추가 사용자 정의 태그 (Enter로 등록)..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmed = customTagInput.trim().replace(/^#+/, '');
                  if (trimmed && !finalWorkspaceTagsToSave.includes(trimmed)) {
                    setExtraSaveTags((prev) => [...prev, trimmed]);
                    setCustomTagInput('');
                  }
                }
              }}
              className="flex-1 bg-[#060608] border border-[#2A2A34] text-white text-[10px] px-2 py-1 font-mono focus:border-[#00F0FF] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = customTagInput.trim().replace(/^#+/, '');
                if (trimmed && !finalWorkspaceTagsToSave.includes(trimmed)) {
                  setExtraSaveTags((prev) => [...prev, trimmed]);
                  setCustomTagInput('');
                }
              }}
              disabled={!customTagInput.trim()}
              className="px-2.5 py-1 bg-[#1A1A24] hover:bg-[#00F0FF] text-gray-300 hover:text-black border border-[#2E2E3E] text-[10px] font-bold transition cursor-pointer disabled:opacity-40"
            >
              + 태그 추가
            </button>
            {excludedAutoTags.length > 0 && (
              <button
                type="button"
                onClick={() => setExcludedAutoTags([])}
                className="px-2 py-1 text-[9px] text-gray-400 hover:text-[#00F0FF] font-mono cursor-pointer"
                title="제외된 자동 태그 복원"
              >
                태그 복원
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleSaveToSlot(saveSlotNum, saveName, saveDescription, finalWorkspaceTagsToSave)}
            className="flex-1 py-2 bg-[#00F0FF] text-black font-bold text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-[#00F0FF]/90 transition cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>슬롯 #{saveSlotNum}에 현재 상태 영구 저장 (SAVE TO LOCALSTORAGE)</span>
          </button>
        </div>
      </div>

      {/* Standalone Named JSON Preset File (.json) Export & Import Hub */}
      <div className="bg-gradient-to-r from-[#121218] via-[#161622] to-[#121218] border border-[#00F0FF]/60 p-3.5 space-y-2.5 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              💾 독립형 이름 지정 JSON 프리셋 파일 (Named JSON Preset)
            </span>
          </div>
          <span className="text-[9px] font-mono text-black bg-[#00F0FF] px-2 py-0.5 font-bold uppercase">
            STANDALONE FILE
          </span>
        </div>

        <p className="text-[10px] text-gray-300 leading-relaxed">
          현재 3D 캔버스의 모든 형상(시작·경유·목표), 텍스트/이미지 커스텀 정점 데이터, 물리 파라미터, 셰이더를 <strong className="text-[#00F0FF]">독립형 .json 파일</strong>로 내보내거나 다른 환경에서 언제든 다시 불러올 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsSaveNamedModalOpen(true)}
            className="py-2.5 px-3 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black text-xs font-bold uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
          >
            <FileDown className="w-4 h-4" />
            <span>이름 지정 .JSON 프리셋 파일로 저장</span>
          </button>

          <button
            onClick={() => setIsImportNamedModalOpen(true)}
            className="py-2.5 px-3 bg-[#1A1A24] hover:bg-[#242434] text-white hover:text-[#00F0FF] border border-[#00F0FF]/50 hover:border-[#00F0FF] text-xs font-bold uppercase flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-[#00F0FF]" />
            <span>.JSON 프리셋 파일 불러오기 (Import)</span>
          </button>
        </div>
      </div>

      {/* Preset Library List Cards */}
      <div className="space-y-2.5">
        {/* Filter & Search Bar */}
        <div className="space-y-2 bg-[#121216] p-2.5 border border-[#222228]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-[#00F0FF] text-black'
                    : 'bg-[#181820] text-gray-400 hover:text-white'
                }`}
              >
                전체 ({presets.length})
              </button>
              <button
                onClick={() => setFilterCategory('builtin')}
                className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer ${
                  filterCategory === 'builtin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#181820] text-gray-400 hover:text-white'
                }`}
              >
                마스터 기본 ({presets.filter((p) => p.category === 'builtin').length})
              </button>
              <button
                onClick={() => setFilterCategory('user')}
                className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer ${
                  filterCategory === 'user'
                    ? 'bg-[#FFE600] text-black'
                    : 'bg-[#181820] text-gray-400 hover:text-white'
                }`}
              >
                사용자 저장 ({presets.filter((p) => p.category === 'user').length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 sm:w-36">
                <Search className="w-3 h-3 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="태그/이름/형상 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A0E] border border-[#2A2A34] text-white text-[10px] pl-6 pr-2 py-1 outline-none focus:border-[#00F0FF]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              <button
                onClick={handleCopyJson}
                className="p-1.5 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-gray-400 text-gray-300 text-[9px] flex items-center gap-1 cursor-pointer"
                title="전체 프리셋 JSON 클립보드 복사"
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">복사</span>
              </button>

              <button
                onClick={handleExportJson}
                className="p-1.5 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-gray-400 text-gray-300 text-[9px] flex items-center gap-1 cursor-pointer"
                title="JSON 백업 파일 다운로드"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">내보내기</span>
              </button>

              <button
                onClick={() => setShowImportBox(!showImportBox)}
                className="p-1.5 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-[#00F0FF] text-gray-300 hover:text-[#00F0FF] text-[9px] flex items-center gap-1 cursor-pointer"
                title="JSON 복원 가져오기"
              >
                <Upload className="w-3 h-3" />
                <span className="hidden sm:inline">가져오기</span>
              </button>

              <button
                onClick={handleResetBuiltins}
                className="p-1.5 bg-[#1A1A1E] border border-[#2A2A2E] hover:border-red-500 text-gray-400 hover:text-red-400 text-[9px] cursor-pointer"
                title="기본 프리셋으로 초기화"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Tag Filter Pills & Category Switcher */}
          {allAvailableTags.length > 0 && (
            <div className="pt-2 border-t border-[#1C1C24] space-y-2">
              {/* Category Selector for Tags */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
                <div className="flex items-center gap-1 text-[9px] font-mono flex-shrink-0">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#00F0FF]" />
                    <span>태그 분류:</span>
                  </span>
                  <button
                    onClick={() => setTagCategoryFilter('all')}
                    className={`px-1.5 py-0.5 transition cursor-pointer ${
                      tagCategoryFilter === 'all'
                        ? 'bg-white text-black font-bold'
                        : 'bg-[#14141C] text-gray-400 hover:text-white border border-[#22222E]'
                    }`}
                  >
                    전체 ({allAvailableTags.length})
                  </button>
                  <button
                    onClick={() => setTagCategoryFilter('shapes')}
                    className={`px-1.5 py-0.5 transition cursor-pointer flex items-center gap-1 ${
                      tagCategoryFilter === 'shapes'
                        ? 'bg-cyan-400 text-black font-bold'
                        : 'bg-cyan-950/40 text-cyan-400 hover:text-cyan-200 border border-cyan-900/60'
                    }`}
                  >
                    <span>🔷 형상별</span>
                  </button>
                  <button
                    onClick={() => setTagCategoryFilter('counts')}
                    className={`px-1.5 py-0.5 transition cursor-pointer flex items-center gap-1 ${
                      tagCategoryFilter === 'counts'
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-amber-950/40 text-amber-400 hover:text-amber-200 border border-amber-900/60'
                    }`}
                  >
                    <span>🔶 수량별</span>
                  </button>
                  <button
                    onClick={() => setTagCategoryFilter('bloom_fx')}
                    className={`px-1.5 py-0.5 transition cursor-pointer flex items-center gap-1 ${
                      tagCategoryFilter === 'bloom_fx'
                        ? 'bg-pink-400 text-black font-bold'
                        : 'bg-pink-950/40 text-pink-400 hover:text-pink-200 border border-pink-900/60'
                    }`}
                  >
                    <span>🌸 블룸 & 효과별</span>
                  </button>
                </div>

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-1.5 py-0.5 text-[9px] text-red-400 hover:text-red-300 font-mono flex items-center gap-0.5 flex-shrink-0 cursor-pointer ml-auto bg-red-950/40 border border-red-800"
                    title="선택된 태그 필터 해제"
                  >
                    <X className="w-3 h-3" />
                    <span>필터 해제 [{selectedTag}]</span>
                  </button>
                )}
              </div>

              {/* Tag Pills List */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-0.5 text-[9px] font-mono flex-shrink-0 transition cursor-pointer flex items-center gap-1 ${
                    selectedTag === null
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'bg-[#181820] text-gray-400 hover:text-white border border-[#2A2A34]'
                  }`}
                >
                  <span>필터 없음</span>
                  <span className="text-[8px] opacity-70">({presets.length})</span>
                </button>

                {filteredAvailableTags.map(({ tag, count }) => {
                  const isActive = selectedTag === tag;
                  const isShapeTag = tag.startsWith('Shape:') || tag.startsWith('Morph:') || tag.startsWith('Chain:') || tag.startsWith('Category:') || shapes.some((s) => tag.toLowerCase().includes(s.id.toLowerCase())) || tag.includes('Stage');
                  const isCountTag = tag.includes('Particles') || tag.startsWith('Count') || tag.includes('Lite') || tag.includes('Standard') || tag.includes('Dense') || tag.includes('Extreme');
                  const isBloomTag = tag.includes('Bloom') || tag.includes('Post-Processing');

                  let pillStyle = 'bg-[#14141C] text-gray-300 hover:text-white hover:border-[#00F0FF]/50 border border-[#22222E]';
                  if (isActive) {
                    pillStyle = 'bg-[#FFE600] text-black font-bold border border-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,0.3)]';
                  } else if (isShapeTag) {
                    pillStyle = 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 border border-cyan-800/60';
                  } else if (isCountTag) {
                    pillStyle = 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60';
                  } else if (isBloomTag) {
                    pillStyle = 'bg-pink-950/40 text-pink-300 hover:bg-pink-900/60 border border-pink-800/60';
                  }

                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isActive ? null : tag)}
                      className={`px-2 py-0.5 text-[9px] font-mono flex-shrink-0 transition cursor-pointer flex items-center gap-1 ${pillStyle}`}
                    >
                      <Hash className="w-2.5 h-2.5 opacity-60" />
                      <span>{tag}</span>
                      <span className={`text-[8px] px-1 rounded-full ${isActive ? 'bg-black/30 text-black' : 'bg-black/40 text-gray-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input for JSON Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* JSON Import Box */}
        {showImportBox && (
          <div className="p-3 bg-[#0A0A0B] border border-[#00F0FF]/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-[#00F0FF] font-bold uppercase flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5" />
                <span>프리셋 JSON 복원 (텍스트 붙여넣기 또는 파일 선택)</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.5 bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF] text-[9px] font-bold uppercase cursor-pointer hover:bg-[#00F0FF] hover:text-black transition"
              >
                .JSON 파일 선택
              </button>
            </div>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="여기에 복사한 프리셋 JSON 배열 코드를 붙여넣으세요..."
              className="w-full bg-[#141417] border border-[#2A2A2E] text-gray-200 text-[10px] font-mono p-2 outline-none focus:border-[#00F0FF]"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setShowImportBox(false)}
                className="px-2 py-1 bg-[#1A1A1E] text-gray-400 text-[10px] border border-[#2A2A2E] cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleImportJson}
                className="px-3 py-1 bg-[#00F0FF] text-black font-bold text-[10px] uppercase cursor-pointer"
              >
                가져오기 적용
              </button>
            </div>
          </div>
        )}

        {/* Cards Grid */}
        <div className="space-y-2">
          {filteredPresets.map((preset) => {
            const isSelected = activeSlot === preset.slot;
            const pConfig = preset.config || {};
            const colorA = pConfig.colorA || '#00F0FF';
            const colorB = pConfig.colorB || '#FF007F';
            const colorC = pConfig.colorC || '#FFE600';
            const hasWaypoints = Array.isArray(preset.waypointShapeIds) && preset.waypointShapeIds.length > 0;

            return (
              <div
                key={preset.id || preset.slot}
                className={`p-3 border transition ${
                  isSelected
                    ? 'bg-[#18181E] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-[#141417] border-[#2A2A2E] hover:border-gray-500'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                          : preset.category === 'user'
                          ? 'bg-[#FFE600]/20 text-[#FFE600] border-[#FFE600]/50'
                          : 'bg-[#0A0A0B] text-[#00F0FF] border-[#2A2A2E]'
                      }`}
                    >
                      #{preset.slot}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-gray-100 flex items-center gap-1.5 flex-wrap">
                        <span>{preset.name}</span>
                        {preset.category === 'builtin' && (
                          <span className="text-[8px] font-mono px-1 bg-purple-950/60 text-purple-300 border border-purple-800">
                            MASTER
                          </span>
                        )}
                        {preset.category === 'user' && (
                          <span className="text-[8px] font-mono px-1 bg-amber-950/60 text-amber-300 border border-amber-800">
                            CUSTOM SAVED
                          </span>
                        )}
                        {preset.customShapes && preset.customShapes.length > 0 && (
                          <span className="text-[8px] font-mono px-1 bg-cyan-950/60 text-[#00F0FF] border border-cyan-800">
                            {preset.customShapes.length}개 커스텀 형상 포함
                          </span>
                        )}
                      </div>
                      {preset.description && (
                        <div className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">
                          {preset.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3-Color Swatch Pill */}
                  <div className="flex items-center gap-0.5 p-1 bg-[#0A0A0B] border border-[#2A2A2E] rounded-sm flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorA }} title={colorA} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorB }} title={colorB} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorC }} title={colorC} />
                  </div>
                </div>

                {/* Morph Chain Sequence Route Pill */}
                <div className="mb-2 p-1.5 bg-[#0A0A0E] border border-[#22222A] flex items-center gap-1.5 flex-wrap text-[9px]">
                  <span className="text-gray-500 font-mono">체인:</span>
                  <span className="text-[#00F0FF] font-bold">
                    {preset.sourceShapeId ? getShapeName(preset.sourceShapeId) : '기본'}
                  </span>
                  {hasWaypoints && (preset.waypointShapeIds || []).map((wpId, idx) => (
                    <React.Fragment key={`${wpId}-${idx}`}>
                      <ArrowRight className="w-2.5 h-2.5 text-[#FFE600]" />
                      <span className="text-[#FFE600] font-bold">
                        {getShapeName(wpId)}
                      </span>
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-2.5 h-2.5 text-white" />
                  <span className="text-white font-bold">
                    {preset.targetShapeId ? getShapeName(preset.targetShapeId) : '기본'}
                  </span>
                </div>

                {/* Badges Info & Tags */}
                <div className="flex flex-wrap items-center gap-1 mb-2.5 text-[8px] font-mono uppercase text-gray-400">
                  {pConfig.particleCount && (
                    <span className="px-1.5 py-0.5 bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/30 font-bold">
                      {pConfig.particleCount.toLocaleString()}P
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                    SHAPE: <strong className="text-white">{pConfig.particleType || 'circle'}</strong>
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                    NOISE: <strong className="text-white">{pConfig.noiseType || 'curl'}</strong>
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                    COLOR: <strong className="text-white">{pConfig.colorMixMode || 'interpolate'}</strong>
                  </span>
                  {pConfig.trailsEnabled && (
                    <span className="px-1.5 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                      TRAIL {((pConfig.trailLength ?? 0.85) * 100).toFixed(0)}%
                    </span>
                  )}
                  {pConfig.motionBlurIntensity && pConfig.motionBlurIntensity > 1 && (
                    <span className="px-1.5 py-0.5 bg-purple-950/50 text-purple-300 border border-purple-800">
                      BLUR {pConfig.motionBlurIntensity.toFixed(1)}x
                    </span>
                  )}
                  {pConfig.bloomEnabled !== false && (
                    <span className="px-1.5 py-0.5 bg-pink-950/60 text-pink-300 border border-pink-700/80 flex items-center gap-1 font-bold">
                      <Sun className="w-2.5 h-2.5 text-pink-400" />
                      <span>BLOOM {((pConfig.bloomStrength ?? 1.2)).toFixed(1)}x</span>
                    </span>
                  )}

                  {/* Render Categorized Tags */}
                  {preset.tags && preset.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pl-1 border-l border-[#2A2A34] ml-0.5">
                      {preset.tags.map((tag) => {
                        const isTagActive = selectedTag === tag;
                        const isShapeTag = tag.startsWith('Shape:') || tag.startsWith('Morph:') || tag.startsWith('Chain:') || tag.startsWith('Category:') || shapes.some((s) => tag.toLowerCase().includes(s.id.toLowerCase())) || tag.includes('Stage');
                        const isCountTag = tag.includes('Particles') || tag.startsWith('Count') || tag.includes('Lite') || tag.includes('Standard') || tag.includes('Dense') || tag.includes('Extreme');
                        const isBloomTag = tag.includes('Bloom') || tag.includes('Post-Processing');

                        let chipStyle = 'bg-[#181824] text-gray-300 hover:text-white hover:bg-[#222232] border border-[#2E2E3E]';
                        if (isTagActive) {
                          chipStyle = 'bg-[#FFE600] text-black font-bold border border-[#FFE600] shadow-[0_0_6px_rgba(255,230,0,0.4)]';
                        } else if (isShapeTag) {
                          chipStyle = 'bg-cyan-950/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 border border-cyan-800/60';
                        } else if (isCountTag) {
                          chipStyle = 'bg-amber-950/40 text-amber-300 hover:text-white hover:bg-amber-900/60 border border-amber-800/60';
                        } else if (isBloomTag) {
                          chipStyle = 'bg-pink-950/40 text-pink-300 hover:text-white hover:bg-pink-900/60 border border-pink-800/60';
                        }

                        return (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(isTagActive ? null : tag);
                            }}
                            className={`px-1.5 py-0.5 rounded-[2px] transition cursor-pointer flex items-center gap-0.5 text-[8px] font-mono lowercase ${chipStyle}`}
                            title={`'#${tag}' 태그로 필터링`}
                          >
                            <Hash className="w-2 h-2 opacity-50" />
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#1E1E24]">
                  {isSelected ? (
                    <button
                      onClick={handleDeselectPreset}
                      className="flex-1 py-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700 transition cursor-pointer"
                      title="프리셋 선택 해제"
                    >
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>선택 취소 (DESELECT)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="flex-1 py-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition cursor-pointer bg-[#1A1A1E] text-white hover:bg-[#00F0FF] hover:text-black border border-[#2A2A2E]"
                    >
                      <Play className="w-3 h-3" />
                      <span>체인 전체 불러오기 (LOAD CHAIN)</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSaveToSlot(preset.slot, preset.name, preset.description)}
                    className="px-2.5 py-1.5 bg-[#0A0A0B] hover:bg-[#1A1A1E] text-gray-300 hover:text-[#00F0FF] border border-[#2A2A2E] text-[9px] font-mono uppercase transition cursor-pointer"
                    title="현재 캔버스 몰핑 체인과 파라미터로 이 슬롯 덮어쓰기"
                  >
                    <span>덮어쓰기</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPresetCard(preset)}
                    className="p-1.5 bg-[#0A0A0B] hover:bg-[#1A1A1E] text-[#00F0FF] hover:text-white border border-[#2A2A2E] text-[9px] transition cursor-pointer"
                    title="이 프리셋을 단일 .JSON 파일로 내보내기"
                  >
                    <Download className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDuplicatePreset(preset)}
                    className="p-1.5 bg-[#0A0A0B] hover:bg-[#1A1A1E] text-gray-400 hover:text-white border border-[#2A2A2E] text-[9px] transition cursor-pointer"
                    title="새 슬롯으로 복제"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {preset.category === 'user' && (
                    <button
                      onClick={() => handleDeletePreset(preset.slot)}
                      className="p-1.5 bg-[#0A0A0B] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-[#2A2A2E] hover:border-red-700 text-[9px] transition cursor-pointer"
                      title="이 사용자 프리셋 삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Named Preset Modal */}
      {isSaveNamedModalOpen && (
        <SaveNamedPresetModal
          isOpen={isSaveNamedModalOpen}
          onClose={() => setIsSaveNamedModalOpen(false)}
          config={config}
          sourceShapeId={sourceShapeId}
          targetShapeId={targetShapeId}
          waypointShapeIds={waypointShapeIds}
          shapes={shapes}
          onSaveToSlot={handleSaveImportedToSlot}
        />
      )}

      {/* Import Named Preset Modal */}
      {isImportNamedModalOpen && (
        <ImportNamedPresetModal
          isOpen={isImportNamedModalOpen}
          onClose={() => setIsImportNamedModalOpen(false)}
          onApplyPreset={handleApplyImportedPreset}
          onSaveToSlot={handleSaveImportedToSlot}
          availableShapes={shapes}
        />
      )}
    </div>
  );
};
