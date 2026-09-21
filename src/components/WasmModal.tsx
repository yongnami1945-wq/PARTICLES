import React, { useState } from 'react';
import { X, Code2, Copy, Check, Download, Terminal, Cpu, Sparkles } from 'lucide-react';
import { CPP_SOURCE_CODE } from '../utils/wasmEngine';

interface WasmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WasmModal: React.FC<WasmModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cpp' | 'cmake' | 'build'>('cpp');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCpp = () => {
    const blob = new Blob([CPP_SOURCE_CODE], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'particle_morph.cpp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CMAKE_CODE = `cmake_minimum_required(VERSION 3.15)
project(ParticleMorphEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(EMSCRIPTEN)
    add_executable(particle_morph particle_morph.cpp)
    set_target_properties(particle_morph PROPERTIES
        COMPILE_FLAGS "-O3 -msimd128 -flto"
        LINK_FLAGS "-O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS=['_init_particles','_step_particles','_get_pos_ptr','_get_col_ptr','_free_particles'] -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap']"
    )
else()
    add_library(particle_morph SHARED particle_morph.cpp)
    target_compile_options(particle_morph PRIVATE -O3 -march=native -ffast-math)
endif()
`;

  const BUILD_SCRIPT = `#!/bin/bash
# WebAssembly Compilation Script with Emscripten (emcc)
echo "Compiling Particle Morphing Engine to WebAssembly SIMD..."

emcc particle_morph.cpp -O3 -msimd128 \\
  -s WASM=1 \\
  -s ALLOW_MEMORY_GROWTH=1 \\
  -s EXPORTED_FUNCTIONS="['_init_particles','_step_particles','_get_pos_ptr','_get_col_ptr','_free_particles']" \\
  -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \\
  -o particle_morph.js

echo "Build Complete: particle_morph.wasm & particle_morph.js generated!"
`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#1A1A1E] text-[#00F0FF] border border-[#2A2A2E]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>C++ / WEBASSEMBLY SIMD SOURCE KERNEL</span>
                <span className="px-1.5 py-0.2 bg-[#00F0FF]/10 text-[#00F0FF] text-[9px] border border-[#00F0FF]/30">
                  SIMD128 // 0-COPY PTR
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                NATIVE CPU/WASM KERNEL FOR HIGH SPEED DETERMINISTIC VORTEX MORPHING
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

        {/* Tab Selection Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#2A2A2E] bg-[#0A0A0B] text-[10px]">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('cpp')}
              className={`px-3 py-1 font-bold uppercase transition border ${
                activeTab === 'cpp'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              particle_morph.cpp
            </button>
            <button
              onClick={() => setActiveTab('cmake')}
              className={`px-3 py-1 font-bold uppercase transition border ${
                activeTab === 'cmake'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              CMakeLists.txt
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`px-3 py-1 font-bold uppercase transition border ${
                activeTab === 'build'
                  ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                  : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
              }`}
            >
              build_wasm.sh
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleCopy(
                  activeTab === 'cpp'
                    ? CPP_SOURCE_CODE
                    : activeTab === 'cmake'
                    ? CMAKE_CODE
                    : BUILD_SCRIPT
                )
              }
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-[10px] uppercase transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#00F0FF]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'COPIED' : 'COPY BUFFER'}</span>
            </button>

            <button
              onClick={handleDownloadCpp}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF] hover:bg-white text-black font-bold text-[10px] uppercase transition shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>EXPORT .CPP FILE</span>
            </button>
          </div>
        </div>

        {/* Code Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#0A0A0B] font-mono text-xs text-gray-300 custom-scrollbar leading-relaxed">
          <pre className="p-4 bg-[#0F0F12] border border-[#2A2A2E] overflow-x-auto whitespace-pre text-[#E0E0E0]">
            <code>
              {activeTab === 'cpp' && CPP_SOURCE_CODE}
              {activeTab === 'cmake' && CMAKE_CODE}
              {activeTab === 'build' && BUILD_SCRIPT}
            </code>
          </pre>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 border-t border-[#2A2A2E] bg-[#0A0A0B] flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>BUILD CMD: <code className="text-[#00F0FF] font-mono">emcc particle_morph.cpp -O3 -msimd128 -s WASM=1</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1A1E] hover:border-[#00F0FF] text-gray-300 border border-[#2A2A2E] font-bold text-xs uppercase transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
