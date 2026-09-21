import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Sliders, Sparkles, Image as ImageIcon, Eye, Check } from 'lucide-react';
import { ImageProcessingOptions, MorphShape } from '../types';
import { processImageToParticles } from '../utils/imageToParticles';

interface ImageUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShape: (shape: MorphShape) => void;
  particleCount: number;
}

// Built-in sample vector/svg images for quick testing
const SAMPLE_PRESETS = [
  {
    name: '인공지능 로고 (AI Node)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="%23050814"/><circle cx="100" cy="100" r="70" fill="none" stroke="%2338bdf8" stroke-width="8"/><circle cx="100" cy="100" r="30" fill="%23ec4899"/><circle cx="100" cy="40" r="14" fill="%2338bdf8"/><circle cx="100" cy="160" r="14" fill="%2338bdf8"/><circle cx="40" cy="100" r="14" fill="%2338bdf8"/><circle cx="160" cy="100" r="14" fill="%2338bdf8"/><line x1="100" y1="40" x2="100" y2="160" stroke="%2338bdf8" stroke-width="4"/><line x1="40" y1="100" x2="160" y2="100" stroke="%2338bdf8" stroke-width="4"/></svg>',
  },
  {
    name: '빛나는 다이아몬드',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="%23050814"/><polygon points="100,20 170,75 100,180 30,75" fill="%2306b6d4" stroke="%23ffffff" stroke-width="4"/><polygon points="100,20 140,75 100,180 60,75" fill="%233b82f6" opacity="0.8"/><line x1="30" y1="75" x2="170" y2="75" stroke="%23ffffff" stroke-width="3"/></svg>',
  },
  {
    name: '사이버 스컬 (Cyber Skull)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="%23050814"/><circle cx="100" cy="90" r="60" fill="%23f43f5e"/><circle cx="75" cy="85" r="15" fill="%23050814"/><circle cx="125" cy="85" r="15" fill="%23050814"/><rect x="80" y="130" width="40" height="35" rx="5" fill="%23f43f5e"/><line x1="90" y1="140" x2="90" y2="160" stroke="%23050814" stroke-width="4"/><line x1="100" y1="140" x2="100" y2="160" stroke="%23050814" stroke-width="4"/><line x1="110" y1="140" x2="110" y2="160" stroke="%23050814" stroke-width="4"/></svg>',
  },
  {
    name: '황금 별 (Golden Star)',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="%23050814"/><polygon points="100,20 125,75 185,80 140,120 155,180 100,145 45,180 60,120 15,80 75,75" fill="%23eab308" stroke="%23ffffff" stroke-width="3"/></svg>',
  }
];

export const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({
  isOpen,
  onClose,
  onAddShape,
  particleCount,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRESETS[0].url);
  const [shapeName, setShapeName] = useState<string>('사용자 이미지');
  const [threshold, setThreshold] = useState<number>(35);
  const [depthScale, setDepthScale] = useState<number>(2.2);
  const [invert, setInvert] = useState<boolean>(false);
  const [distribution, setDistribution] = useState<'luminance_prob' | 'grid'>('luminance_prob');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [extractedPoints, setExtractedPoints] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-process preview when parameters change
  useEffect(() => {
    if (!isOpen || !selectedImage) return;

    let isMounted = true;
    setIsProcessing(true);

    processImageToParticles(selectedImage, Math.min(particleCount, 20000), {
      threshold,
      depthScale,
      invert,
      distribution,
      sampleDensity: 2,
    })
      .then((res) => {
        if (isMounted) {
          setPreviewDataUrl(res.previewUrl);
          setExtractedPoints(res.sampledCount);
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setIsProcessing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedImage, threshold, depthScale, invert, distribution, particleCount]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setShapeName(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmAdd = async () => {
    setIsProcessing(true);
    try {
      const result = await processImageToParticles(selectedImage, 100000, {
        threshold,
        depthScale,
        invert,
        distribution,
      });

      const newShape: MorphShape = {
        id: `img-${Date.now()}`,
        name: shapeName || '커스텀 파티클',
        type: 'image',
        positions: result.positions,
        colors: result.colors,
        previewUrl: result.previewUrl,
        description: `사용자 이미지로부터 추출된 3D 포인트 클라우드`,
      };

      onAddShape(newShape);
      onClose();
    } catch (err) {
      alert('이미지 파티클 변환 중 오류가 발생했습니다: ' + err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1A1A1E] text-[#00F0FF] border border-[#2A2A2E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>IMAGE TO 3D POINT-CLOUD TRANSLATOR</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">V2.4</span>
              </div>
              <p className="text-[10px] text-gray-500">
                LUMINANCE & CHROMINANCE SAMPLING ➔ 3D VIRTUAL COORD MATRIX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1A1A1E] border border-transparent hover:border-[#2A2A2E] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          {/* File Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#3A3A3E] hover:border-[#00F0FF] bg-[#141417] hover:bg-[#1A1A1E] p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] group-hover:border-[#00F0FF] text-gray-400 group-hover:text-[#00F0FF] transition">
              <Upload className="w-5 h-5" />
            </div>
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              CLICK OR DROP CUSTOM IMAGE FILE (.PNG, .JPG, .SVG)
            </div>
            <div className="text-gray-500 text-[10px] uppercase">
              HIGH CONTRAST & ALPHA TRANSPARENCY PREFERRED
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Quick Preset Samples */}
          <div>
            <div className="text-[10px] text-[#00F0FF] uppercase tracking-widest font-bold mb-2">
              OR SELECT PRESET VECTOR ASSET:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(sample.url);
                    setShapeName(sample.name);
                  }}
                  className={`p-2 border text-left flex items-center gap-2 transition ${
                    selectedImage === sample.url
                      ? 'bg-[#1A1A1E] border-[#00F0FF] text-[#00F0FF]'
                      : 'bg-[#141417] border-[#2A2A2E] text-gray-400 hover:text-white'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-7 h-7 bg-[#0A0A0B] object-contain border border-[#2A2A2E]" />
                  <span className="truncate font-bold text-[10px]">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview & Parameter Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#141417] p-4 border border-[#2A2A2E]">
            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center bg-[#0A0A0B] p-3 border border-[#2A2A2E] relative min-h-[160px]">
              {selectedImage && (
                <img
                  src={previewDataUrl || selectedImage}
                  alt="Preview"
                  className="max-h-32 max-w-full object-contain"
                />
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-[#0A0A0B]/80 flex items-center justify-center text-[#00F0FF] font-bold text-xs uppercase tracking-wider">
                  SAMPLING POINT MATRIX...
                </div>
              )}
              <div className="mt-2 text-[10px] text-gray-400 text-center font-mono">
                SAMPLED POINTS: <strong className="text-[#00F0FF]">{extractedPoints.toLocaleString()}</strong> PTS
              </div>
            </div>

            {/* Tuning Controls */}
            <div className="space-y-3">
              {/* Shape Name Input */}
              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">NODE IDENTIFIER</label>
                <input
                  type="text"
                  value={shapeName}
                  onChange={(e) => setShapeName(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-[#2A2A2E] px-2.5 py-1.5 text-white text-xs focus:border-[#00F0FF] focus:outline-none font-mono"
                  placeholder="e.g., Cyber_Glyph_01"
                />
              </div>

              {/* Threshold */}
              <div className="bg-[#0A0A0B] border border-[#2A2A2E] p-2.5 space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase text-gray-400">
                  <span>LUMINANCE THRESHOLD</span>
                  <span className="font-bold text-[#00F0FF]">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="240"
                  step="5"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>

              {/* 3D Depth Scale */}
              <div className="bg-[#0A0A0B] border border-[#2A2A2E] p-2.5 space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase text-gray-400">
                  <span>Z-DEPTH EXTRUSION</span>
                  <span className="font-bold text-[#00F0FF]">{depthScale.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.2"
                  value={depthScale}
                  onChange={(e) => setDepthScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#2A2A2E] appearance-none cursor-pointer"
                />
              </div>

              {/* Invert toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] uppercase text-gray-400">INVERT CHROMINANCE</span>
                <button
                  type="button"
                  onClick={() => setInvert(!invert)}
                  className={`px-3 py-1 border text-[10px] font-bold uppercase transition ${
                    invert ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#0A0A0B] text-gray-400 border-[#2A2A2E]'
                  }`}
                >
                  {invert ? 'INVERT: ON' : 'INVERT: OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#2A2A2E] flex items-center justify-end gap-3 bg-[#0A0A0B]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-xs uppercase transition"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmAdd}
            disabled={isProcessing}
            className="px-5 py-2 bg-[#00F0FF] hover:bg-white text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(0,240,255,0.4)] transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>INJECT INTO MORPH LIST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
