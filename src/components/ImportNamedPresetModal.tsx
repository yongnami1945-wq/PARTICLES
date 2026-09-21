import React, { useState, useRef } from 'react';
import { 
  X, Upload, FileJson, Check, ArrowRight, Sparkles, 
  AlertCircle, CheckCircle2, Sliders, HardDrive, Layers
} from 'lucide-react';
import { MorphConfig, MorphShape, ImportedPresetResult } from '../types';
import { parseNamedPresetJson } from '../utils/presetManager';

interface ImportNamedPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (result: ImportedPresetResult) => void;
  onSaveToSlot?: (slot: number, result: ImportedPresetResult) => void;
  availableShapes: MorphShape[];
}

export const ImportNamedPresetModal: React.FC<ImportNamedPresetModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
  onSaveToSlot,
  availableShapes,
}) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ImportedPresetResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [saveSlotNum, setSaveSlotNum] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setJsonInput(text);
    setErrorMsg(null);
    if (!text.trim()) {
      setParsedResult(null);
      return;
    }

    const result = parseNamedPresetJson(text);
    if (result.isValid) {
      setParsedResult(result);
      setErrorMsg(null);
    } else {
      setParsedResult(null);
      setErrorMsg('유효하지 않은 프리셋 JSON 파일입니다. 올바른 .json 형식을 확인해주세요.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
    e.target.value = '';
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleParse(content);
      }
    };
    reader.onerror = () => {
      setErrorMsg('파일을 읽는 도중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      readFile(file);
    } else {
      setErrorMsg('.json 확장자의 프리셋 파일만 지원됩니다.');
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;
    onApplyPreset(parsedResult);
    onClose();
  };

  const handleApplyAndSave = () => {
    if (!parsedResult) return;
    onApplyPreset(parsedResult);
    if (onSaveToSlot) {
      onSaveToSlot(saveSlotNum, parsedResult);
    }
    onClose();
  };

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
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>JSON 프리셋 파일 가져오기 (Import Preset)</span>
              <span className="text-[10px] px-2 py-0.5 bg-[#00F0FF] text-black font-mono font-bold">
                RE-IMPORT
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              이전에 저장된 .json 프리셋 파일을 선택하거나 드래그하여 몰핑 시퀀스와 파라미터를 즉시 복원합니다.
            </p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-[#00F0FF] bg-[#00F0FF]/10'
              : 'border-[#2A2A38] bg-[#07070A] hover:border-[#00F0FF]/60 hover:bg-[#0B0B10]'
          }`}
        >
          <div className="p-3 bg-[#14141E] rounded-full border border-[#2A2A38]">
            <FileJson className="w-8 h-8 text-[#00F0FF]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              클릭하여 .JSON 파일 선택 또는 여기에 드래그 앤 드롭
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              단일 프리셋 패키지(.json), 다중 슬롯 라이브러리, 워크스페이스 세션 JSON 자동 지원
            </p>
          </div>
        </div>

        {/* Direct JSON Text Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            또는 JSON 코드 직접 붙여넣기:
          </label>
          <textarea
            rows={3}
            value={jsonInput}
            onChange={(e) => handleParse(e.target.value)}
            placeholder='{"schema": "particle-morph-single-preset-v2", "name": "...", "config": { ... }}'
            className="w-full bg-[#070709] border border-[#2A2A34] focus:border-[#00F0FF] p-2.5 text-xs text-emerald-400 font-mono outline-none resize-none"
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-2.5 bg-red-950/60 border border-red-700 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Preset Summary Preview */}
        {parsedResult && (
          <div className="p-4 bg-[#12121A] border border-[#00F0FF] space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-bold text-white uppercase">
                  프리셋 검증 성공: <strong className="text-[#00F0FF]">{parsedResult.name}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#FFE600] font-bold">
                READY TO APPLY
              </span>
            </div>

            {parsedResult.description && (
              <p className="text-[11px] text-gray-300 italic border-l-2 border-[#00F0FF] pl-2">
                {parsedResult.description}
              </p>
            )}

            {/* Sequence Chain Preview */}
            <div className="p-2.5 bg-[#0A0A0F] border border-[#22222E] space-y-1">
              <div className="text-[9px] text-gray-400 font-mono uppercase">복원될 몰핑 시퀀스 체인:</div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold text-white">
                <span className="px-2 py-0.5 bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] text-[10px]">
                  출발: {parsedResult.sourceShapeId}
                </span>

                {(parsedResult.waypointShapeIds || []).map((wpId, i) => (
                  <React.Fragment key={i}>
                    <ArrowRight className="w-3 h-3 text-[#FFE600]" />
                    <span className="px-2 py-0.5 bg-[#FFE600]/20 border border-[#FFE600] text-[#FFE600] text-[10px]">
                      경유#{i + 1}: {wpId}
                    </span>
                  </React.Fragment>
                ))}

                <ArrowRight className="w-3 h-3 text-white" />
                <span className="px-2 py-0.5 bg-white/20 border border-white text-white text-[10px]">
                  목표: {parsedResult.targetShapeId}
                </span>
              </div>
            </div>

            {/* Included Shapes & Config Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 bg-[#0A0A0E] border border-[#22222A]">
                <span className="text-gray-400 block">파티클 형태:</span>
                <span className="text-[#00F0FF] font-bold">{parsedResult.config.particleType || 'default'}</span>
              </div>
              <div className="p-2 bg-[#0A0A0E] border border-[#22222A]">
                <span className="text-gray-400 block">노이즈 유형:</span>
                <span className="text-white font-bold">{parsedResult.config.noiseType || 'simplex'}</span>
              </div>
              <div className="p-2 bg-[#0A0A0E] border border-[#22222A]">
                <span className="text-gray-400 block">색상 테마:</span>
                <span className="text-[#FFE600] font-bold">{parsedResult.config.colorScheme || 'cyberpunk'}</span>
              </div>
              <div className="p-2 bg-[#0A0A0E] border border-[#22222A]">
                <span className="text-gray-400 block">내장 커스텀 형상:</span>
                <span className="text-emerald-400 font-bold">{parsedResult.shapes.length}개 포함</span>
              </div>
            </div>

            {/* Parsed Preset Tags */}
            {parsedResult.tags && parsedResult.tags.length > 0 && (
              <div className="p-2 bg-[#0A0A0E] border border-[#22222A] space-y-1">
                <div className="text-[9px] text-gray-400 font-mono uppercase flex items-center gap-1">
                  <span>포함된 자동/사용자 태그:</span>
                  <span className="text-[#00F0FF] font-bold">({parsedResult.tags.length}개)</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {parsedResult.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-[#161622] border border-[#2E2E40] text-gray-300 text-[9px] font-mono rounded-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#22222A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleApply}
              disabled={!parsedResult}
              className={`py-3 px-4 font-bold text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer ${
                parsedResult
                  ? 'bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-black shadow-[0_0_20px_rgba(0,240,255,0.35)]'
                  : 'bg-[#181820] text-gray-500 border border-[#2A2A34] cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>지금 즉시 3D 캔버스에 적용 (APPLY PRESET)</span>
            </button>

            {onSaveToSlot && (
              <div className="flex items-center gap-2">
                <select
                  value={saveSlotNum}
                  onChange={(e) => setSaveSlotNum(parseInt(e.target.value, 10))}
                  className="bg-[#0A0A0E] border border-[#2A2A34] text-[#FFE600] text-xs p-2.5 font-mono outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((s) => (
                    <option key={s} value={s}>슬롯 #{s}</option>
                  ))}
                </select>
                <button
                  onClick={handleApplyAndSave}
                  disabled={!parsedResult}
                  className={`flex-1 py-2.5 px-3 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    parsedResult
                      ? 'bg-[#FFE600]/15 hover:bg-[#FFE600] text-[#FFE600] hover:text-black border-[#FFE600]'
                      : 'bg-[#181820] text-gray-500 border-[#2A2A34] cursor-not-allowed'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>슬롯 #{saveSlotNum} 등록 후 적용</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
