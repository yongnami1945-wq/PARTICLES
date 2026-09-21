import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, Terminal, Sparkles, Play, Layers } from 'lucide-react';
import { 
  PYTHON_NUMPY_SIMULATION_SCRIPT, 
  PYTHON_OPEN3D_EXPORT_SCRIPT, 
  BLENDER_PYTHON_SCRIPT,
  downloadPythonScript 
} from '../utils/pythonExporter';

interface PythonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonModal: React.FC<PythonModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'numpy' | 'open3d' | 'blender'>('numpy');

  if (!isOpen) return null;

  const currentCode = 
    activeTab === 'numpy' ? PYTHON_NUMPY_SIMULATION_SCRIPT :
    activeTab === 'open3d' ? PYTHON_OPEN3D_EXPORT_SCRIPT : BLENDER_PYTHON_SCRIPT;

  const currentFilename = 
    activeTab === 'numpy' ? 'particle_morph_sim.py' :
    activeTab === 'open3d' ? 'export_pointcloud_open3d.py' : 'blender_particle_nodes.py';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadPythonScript(currentFilename, currentCode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1A1A1E] text-[#FFE600] border border-[#2A2A2E]">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>PYTHON 파티클 시뮬레이터 & 스크립트 엔진</span>
                <span className="px-1.5 py-0.2 bg-[#FFE600]/10 text-[#FFE600] text-[9px] border border-[#FFE600]/30 font-bold">
                  PYTHON 3.x // NUMPY // MATPLOTLIB
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                별도 C++ 컴파일 빌드 없이 브라우저 WebGL과 Python 환경에서 100% 즉시 구동 가능한 시뮬레이션 파이프라인
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

        {/* Tab Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-b border-[#2A2A2E] bg-[#0A0A0B] text-[10px]">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('numpy')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer ${
                activeTab === 'numpy'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              1. NumPy 실시간 3D 시뮬레이터 (.py)
            </button>
            <button
              onClick={() => setActiveTab('open3d')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer ${
                activeTab === 'open3d'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              2. Open3D PLY 포인트클라우드 내보내기
            </button>
            <button
              onClick={() => setActiveTab('blender')}
              className={`px-3 py-1 font-bold uppercase transition border cursor-pointer ${
                activeTab === 'blender'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              3. Blender 3D 파이썬 스크립트
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-[10px] uppercase transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#00F0FF]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨' : '코드 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF] hover:bg-white text-black font-bold text-[10px] uppercase transition shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>.PY 파일 다운로드</span>
            </button>
          </div>
        </div>

        {/* Code Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#0A0A0B] font-mono text-xs text-gray-300 custom-scrollbar leading-relaxed">
          <div className="mb-3 p-3 bg-[#141417] border border-[#2A2A2E] text-[11px] text-gray-300 flex items-start gap-2">
            <Terminal className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#00F0FF] font-bold">Python 실행 방법:</span>
              <div className="mt-1 font-mono text-[10px] bg-black/60 px-2 py-1 border border-[#2A2A2E] text-[#FFE600]">
                pip install numpy matplotlib open3d<br/>
                python {currentFilename} --particles 30000 --source sphere --target torus
              </div>
            </div>
          </div>

          <pre className="p-4 bg-[#0F0F12] border border-[#2A2A2E] overflow-x-auto whitespace-pre text-[#E0E0E0]">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Footer Info */}
        <div className="px-4 sm:px-5 py-3 border-t border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>브라우저 미리보기는 100% WebGL GPU 셰이더와 웹 네이티브 엔진으로 즉시 실행됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-xs uppercase transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
