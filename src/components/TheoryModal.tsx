import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, BookOpen, Layers, Wind, Sparkles, Sliders, 
  Bookmark, Download, Cpu, Zap, Radio,
  Compass, MousePointer, Palette, CheckCircle2, 
  ChevronLeft, ChevronRight, Search, FileText, Music,
  Folder, ArrowRight, ExternalLink, HardDrive, Disc
} from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose, initialPage = 13 }) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'physics' | 'advanced' | 'new_13_16'>('all');

  useEffect(() => {
    if (isOpen && initialPage) {
      setCurrentPage(initialPage);
    }
  }, [isOpen, initialPage]);

  const manualPages = useMemo(() => [
    {
      page: 1,
      title: '01. 시스템 개요 및 3D GPU 파이프라인 아키텍처',
      category: 'basics',
      subtitle: 'System Architecture & WebGL Shader Pipeline',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 3D 파티클 몰핑 스튜디오의 핵심 구조
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              본 시스템은 최대 <strong>100,000개 이상의 3D 입자</strong>를 브라우저 GPU에서 60 FPS 무감속으로 실시간 제어하는 차세대 WebGL 파티클 시뮬레이션 환경입니다. CPU의 병목 현상을 방지하기 위해 입자의 위치 보간, 노이즈 왜곡, 지연 시간, 색상 블렌딩 연산이 <strong>Custom GLSL Vertex Shader</strong> 내부에서 전적으로 수행됩니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#00F0FF] font-bold uppercase mb-1">⚡ GPU 인스턴싱 & VBO</div>
                <div className="text-[9px] text-gray-400">Position, Target, Color, Random Seed 속성을 단일 버텍스 버퍼 객체로 전송하여 드로우 콜을 1회로 극소화</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#00F0FF] font-bold uppercase mb-1">🌊 실시간 컬 노이즈</div>
                <div className="text-[9px] text-gray-400">3차원 편미분을 통한 무발산(Divergence=0) 유체 와류를 셰이더 내에서 실시간 합성</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#00F0FF] font-bold uppercase mb-1">🚀 13p~16p 최신 확장</div>
                <div className="text-[9px] text-gray-400">자유 부유 입자장, 마우스 중력장, 오디오 반응형 비주얼라이저, 블랙홀 및 3D PLY/OBJ 내보내기 통합</div>
              </div>
            </div>
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-white font-bold text-xs uppercase">셰이더 데이터 흐름 (Data Flow Pipeline)</h4>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] font-mono text-[10px] text-gray-300 overflow-x-auto">
              [Source Points aPos] ──────┐<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──▶ [GLSL Vertex Shader: Time/Noise/Gravity/Audio] ──▶ [Screen Rasterization]<br />
              [Target Points aTarget] ───┘&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼<br />
              [Point Types: Star/Ring/Cloud] ◀────────── [GLSL Fragment Shader: Glow & Color Mixing] ◀────┘
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 2,
      title: '02. 3D 뷰포트 조작, 궤도 카메라 및 HD 스냅샷',
      category: 'basics',
      subtitle: '3D Viewport Controls, Orbit Controls & Snapshot',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> 뷰포트 내비게이션 & 제어 가이드
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#00F0FF] font-bold uppercase mb-1">🖱️ 마우스 좌클릭 + 드래그</div>
                <div className="text-[9px] text-gray-300">오브젝트 중심 3D 자유 궤도 회전 (Orbit Rotation). 각도를 자유롭게 돌려가며 입체감을 관찰합니다.</div>
              </div>
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#FF007F] font-bold uppercase mb-1">🖱️ 마우스 우클릭 + 드래그</div>
                <div className="text-[9px] text-gray-300">화면 평면 이동 (Pan Translation). 피사체를 화면 중심에서 원하는 위치로 오프셋합니다.</div>
              </div>
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[10px] text-[#FFE600] font-bold uppercase mb-1">🔍 마우스 휠 스크롤</div>
                <div className="text-[9px] text-gray-300">카메라 줌인/줌아웃 (Dolly Zoom). 개별 입자의 미세 구조부터 전체 거시 우주장까지 확인합니다.</div>
              </div>
            </div>
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-white font-bold text-xs uppercase">하단 뷰포트 퀵 툴바 기능</h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-gray-300">
              <li><strong>RESET CAMERA:</strong> 카메라 시점 및 타깃 좌표를 초기값(0, 1.5, 14)으로 원터치 복원합니다.</li>
              <li><strong>중력 모드 토글:</strong> 캔버스 내 마우스 커서의 중력 작용(인력 ➔ 와류 ➔ 척력 ➔ OFF)을 즉시 전환합니다.</li>
              <li><strong>ORBIT: ON/OFF:</strong> Y축 중심의 자동 회전 카메라 턴테이블을 활성화합니다.</li>
              <li><strong>SNAPSHOT:</strong> 현재 렌더링된 3D 뷰포트를 알파 채널이 보존된 고해상도 PNG 파일로 즉시 다운로드합니다.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      page: 3,
      title: '03. 15종 3D 절차적 기하체 & 자유 부유 우주 입자장',
      category: 'basics',
      subtitle: '15 Procedural Geometries & Cosmic Drift Asset Library',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 출발(Source) 및 도착(Target) 형상 라이브러리
            </h4>
            <p className="text-[11px] text-gray-300">
              입자들은 임의의 3D 공간을 자유롭게 부유하다가, 사용자가 선택한 정밀 기하체 형상으로 질서정연하게 수렴한 뒤 다시 다른 형태로 흩어집니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🌌 자유 부유 우주 입자장 (Cosmic Drift)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🌀 중력 와류 성운 (Vortex Nebula)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">⚛️ 양자 요동 장 (Quantum Field)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🌐 UV 피보나치 구체 (Sphere)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🪐 토러스 매듭 (Torus Knot)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🧬 DNA 이중나선 (DNA Helix)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🌪️ 로렌츠 끌개 (Lorenz Attractor)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🏺 4D 클라인 병 (Klein Bottle)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🔲 정이십면체 (Icosahedron)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">⭐ 3D 슈퍼토로이드 (Super-torus)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">📐 뫼비우스 띠 (Möbius Strip)</div>
              <div className="p-2 bg-[#0A0A0B] border border-[#2A2A2E] text-white">🌌 은하수 나선 나선팔 (Galaxy Spiral)</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 4,
      title: '04. 사용자 커스텀 이미지 변환 & 3D 텍스트 클라우드',
      category: 'basics',
      subtitle: 'Image-to-Particle Conversion & 3D Text Cloud Generation',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              2D 비트맵 픽셀의 3D 파티클화 알고리즘
            </h4>
            <p className="text-[11px] text-gray-300">
              PNG/JPG/SVG/WebP 이미지를 드래그 앤 드롭하면, 브라우저 Canvas2D 엔진이 픽셀 데이터를 분석하여 <strong>알파 투명도 및 밝기 임계값(Threshold)</strong> 이상의 픽셀을 3D 포인트 클라우드로 자동 변환합니다.
            </p>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] space-y-2 text-[10px]">
              <div><strong>1. 격자 균일 분포 (Uniform Grid):</strong> 일정한 간격으로 픽셀을 샘플링하여 정밀한 원본 재현율을 확보합니다.</div>
              <div><strong>2. 소벨 엣지 감지 (Sobel Edge Detection):</strong> 이미지의 경계선 윤곽선에 파티클을 집중 배치하여 엣지 강조 효과를 냅니다.</div>
              <div><strong>3. 휘도 확률 분포 (Luminance PDF):</strong> 밝은 영역일수록 밀도가 높아지는 사진 음영 기반 배치입니다.</div>
              <div><strong>4. 3D 돌출 깊이 (Depth Extrusion):</strong> 픽셀의 밝기(Luminance)에 따라 Z축으로 입자를 돌출시켜 입체 3D 부조를 완성합니다.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 5,
      title: '05. 타임라인 재생 제어 & 스태거 지연 매트릭스',
      category: 'physics',
      subtitle: 'Timeline Engine & Stagger Delay Distribution Matrix',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              비동기 파티클 출발 (Stagger Delay) 메커니즘
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              모든 파티클이 동시에 일률적으로 움직이지 않고, 지리적/물리적 기준에 따라 순차적으로 출발하도록 시차(Time Offset)를 부여하는 핵심 기술입니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">• 수직 상하 지연 (Linear Y-Axis)</div>
                <div className="text-gray-400">아래쪽(바닥) 입자부터 위쪽 순서로 물결처럼 솟구쳐 오르며 이동</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">• 방사형 중심 지연 (Radial Center)</div>
                <div className="text-gray-400">중심 코어에서 외곽으로 충격파가 퍼져나가듯 순차적 출발</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">• 수평 좌우 지연 (Linear X-Axis)</div>
                <div className="text-gray-400">좌측에서 우측으로 스위프(Sweep)하며 차례로 모핑</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">• 휘도 밝기 지연 (Brightness Map)</div>
                <div className="text-gray-400">이미지의 밝은 하이라이트 지점부터 먼저 분해되어 출발</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 6,
      title: '06. 3D 컬 노이즈 & 유체 무발산(Divergence=0) 물리학',
      category: 'physics',
      subtitle: '3D Curl Noise Fluid Dynamics & Turbulence Field',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              Curl Noise (회전 벡터장) 수학적 정의
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              일반적인 Perlin/Simplex 노이즈는 입자들이 특정 위치로 뭉치거나 사라지는 압축 현상이 발생합니다. 반면 <strong>Curl Noise</strong>는 3차원 잠재 벡터장 <code className="text-[#00F0FF]">Ψ = (Ψx, Ψy, Ψz)</code>의 회전(Curl)을 취함으로써, <strong>∇·v = 0 (비압축성 무발산)</strong>을 수학적으로 보장하여 실제 물이나 연기 같은 완벽한 유체 소용돌이를 생성합니다.
            </p>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] font-mono text-[10px] text-gray-300">
              v = ∇ × Ψ = (<br />
              &nbsp;&nbsp;∂Ψz/∂y - ∂Ψy/∂z,<br />
              &nbsp;&nbsp;∂Ψx/∂z - ∂Ψz/∂x,<br />
              &nbsp;&nbsp;∂Ψy/∂x - ∂Ψx/∂y<br />
              )
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 7,
      title: '07. 8종 프로시저럴 파티클 타입 & 코어 광학 렌더링',
      category: 'advanced',
      subtitle: '8 Procedural Particle Shapes & Core Optics',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              프래그먼트 셰이더 기반 8종 기하 입자
            </h4>
            <p className="text-[11px] text-gray-300">
              텍스처 이미지 로딩 없이 순수 수학적 거리장(SDF) 계산을 통해 날카롭고 선명한 다양한 광학 입자를 렌더링합니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">1. Circle (원형)</div>
                <div className="text-gray-400">부드러운 가우시안 글로우 중심핵</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">2. Star (별/크로스)</div>
                <div className="text-gray-400">4축/8축 광학 회절 스파클 광선</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">3. Diamond (다이아몬드)</div>
                <div className="text-gray-400">마름모꼴 샤프 결정체</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">4. Ring (네온 링)</div>
                <div className="text-gray-400">도넛형 발광 토러스 외곽선</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">5. Hexagon (육각형)</div>
                <div className="text-gray-400">사이버네틱 폴리곤 그리드</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">6. Cube (디지털 픽셀)</div>
                <div className="text-gray-400">정사각 블록 복셀 표현</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">7. Nebula (성운 연기)</div>
                <div className="text-gray-400">유기적 연막 기체 텍스처</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">8. Bokeh (보케 플레어)</div>
                <div className="text-gray-400">카메라 조리개 림 조명 효과</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 8,
      title: '08. 7종 멀티 모드 색혼합 & 속도 변색 도플러 효과',
      category: 'advanced',
      subtitle: 'Color Mixing Solvers & Kinetic Velocity Doppler Shift',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              동적 색상 변조 엔진 (Color Solvers)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">1. 형상 원본 색상 보간 (Interpolate)</div>
                <div className="text-gray-400">출발 형상 고유 RGB에서 도착 형상 고유 RGB로 부드러운 전환</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">2. 3-Stop 듀얼/트라이 그라데이션 (Gradient)</div>
                <div className="text-gray-400">Color A, B, C 파라미터로 정의된 3색 램프 맵핑</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FF007F] font-bold">3. 운동 속도 기반 도플러 색천이 (Velocity Shift)</div>
                <div className="text-gray-400">노이즈 난류 및 중력 가속도가 높은 입자일수록 Peak Color(Color C)로 고에너지 발광</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold">4. Y축 수직 고도 그라데이션 (Height Spectrum)</div>
                <div className="text-gray-400">3D 공간의 높이에 따라 층별 색조 분기</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 9,
      title: '09. WebGL 잔상 궤적 렌더링 (Motion Ghost Trails)',
      category: 'advanced',
      subtitle: 'WebGL FBO Ping-Pong Motion Trails & Trail Persistence',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              고스트 잔상 지속(Persistence) 메커니즘
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              기존의 매 프레임 버퍼 지우기(<code className="text-[#00F0FF]">glClear</code>)를 대체하여, 이전 프레임의 렌더링 결과를 어두운 알파 쿼드로 덮어씌움으로써 입자의 비행 궤적이 환상적인 네온 유성 꼬리(Neon Meteor Tail)처럼 길게 남는 렌더링 기법입니다.
            </p>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] text-[10px] text-gray-300">
              <strong>트레일 지속 계수 (Trail Length):</strong> 0.10(짧은 스파크)부터 0.98(우주 장노출 궤적)까지 정밀 조절 가능합니다.
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 10,
      title: '10. 프리셋 매니저 12슬롯 저장 및 JSON 내보내기/불러오기',
      category: 'advanced',
      subtitle: 'Preset Manager, 12 Custom Slots & JSON Schema',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              프리셋 라이브러리 및 커스텀 슬롯
            </h4>
            <p className="text-[11px] text-gray-300">
              사이버펑크 네온, 태양 플레어, 은하수 성운 등 8개의 시네마틱 내장 프리셋과 사용자가 자유롭게 저장하고 불러올 수 있는 12개의 로컬 브라우저 슬롯을 제공합니다. 전체 설정을 JSON 파일로 백업하거나 다른 작업자와 공유할 수 있습니다.
            </p>
          </div>
        </div>
      ),
    },
    {
      page: 11,
      title: '11. 후디니(Houdini) POP 네트워크 VEX 수학 공식',
      category: 'advanced',
      subtitle: 'Houdini POP Wrangle VEX Code & Mathematical Equations',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Houdini Point Wrangle (VEX) 등가 구현
            </h4>
            <pre className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] font-mono text-[9px] text-[#00F0FF] overflow-x-auto">
{`// Houdini 20.0 POP Wrangle (Point Level)
float progress = chf("morph_progress");
float noiseAmp = chf("noise_amplitude");
float noiseFreq = chf("noise_frequency");
float stagger = chf("stagger_spread");

// 1. Calculate Per-Particle Normalized Time
float ptNorm = float(@ptnum) / float(@numpt);
float localT = clamp((progress - ptNorm * stagger) / (1.0 - stagger + 0.0001), 0.0, 1.0);
float smoothT = smoothstep(0.0, 1.0, localT);

// 2. Linear Position Lerp
vector targetPos = point(1, "P", @ptnum);
vector basePos = lerp(@P, targetPos, smoothT);

// 3. Curl Noise Divergence-Free Distortion
float mask = sin(smoothT * 3.14159265);
vector curl = curlnoise(basePos * noiseFreq + @Time * 0.4);
@P = basePos + curl * (noiseAmp * mask);

// 4. Kinetic Velocity Color Shift
@Cd = lerp(chv("color_source"), chv("color_target"), smoothT) + length(curl) * mask * 0.3;`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      page: 12,
      title: '12. 무의존성 단일 HTML 자립형 번들 익스포터',
      category: 'advanced',
      subtitle: 'Zero-Dependency Standalone Single-File HTML Exporter',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> 독립 실행형 HTML 파일 생성 기술
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              작업한 모든 파티클 형상 좌표, 커스텀 GLSL 셰이더 소스, 물리 파라미터가 내장된 <strong>단 하나의 순수 HTML 파일</strong>로 압축 생성됩니다. 인터넷 연결이나 웹 서버 없이도 더블 클릭만으로 어떤 브라우저에서든 60 FPS로 즉시 구동됩니다.
            </p>
          </div>
        </div>
      ),
    },

    // ========================================================
    // ⭐ PAGES 13 ~ 16: NEW ADVANCED ENGINE FEATURES
    // ========================================================
    {
      page: 13,
      title: '13. 🌌 자유 부유 입자장 & 마우스 3D 실시간 중력장 물리',
      category: 'new_13_16',
      subtitle: 'Free-Floating Ambient Cosmic Drift & 3D Mouse Gravity Attractor / Vortex',
      content: (
        <div className="space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 신규 추가 기능 (Page 13 Manual Specification)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" /> 1. 자유 부유 우주 입자장 (Cosmic Ambient Field)
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              출발 형상으로 <strong>"자유 부유 우주 입자장"</strong>을 선택하면 수만 개의 입자가 정형화된 형태 없이 3차원 공간 전체에 유유히 표류합니다. 3D Simplex 브라운 운동(Brownian Motion) 알고리즘이 적용되어 각 파티클이 유기적인 궤적으로 흩날리며, 모핑이 시작되면 하나의 응집된 피사체(구체, 토러스, 텍스트, 사용자 이미지)로 질서 있게 뭉쳤다가 다시 우주로 해체됩니다.
            </p>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] font-mono text-[10px] text-gray-300">
              vec3 wanderDrift = vec3(<br />
              &nbsp;&nbsp;snoise(pos * 0.18 + vec3(uTime * 0.22, aRandom * 12.0, 0.0)),<br />
              &nbsp;&nbsp;snoise(pos * 0.18 + vec3(0.0, uTime * 0.22, aRandom * 18.0)),<br />
              &nbsp;&nbsp;snoise(pos * 0.18 + vec3(aRandom * 25.0, uTime * 0.22, 0.0))<br />
              ) * (uAmbientDrift * (1.0 - smoothT));
            </div>
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 2. 3D 레이캐스팅 마우스 중력장 물리 (Mouse Gravity Interaction)
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              화면 위에서 마우스를 움직이면 2D 스크린 좌표가 3D 가상 평면으로 역투영(Unproject Raycast)되어 <strong>3D 마우스 중력장 구체(Gravity Sphere)</strong>를 형성합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold uppercase mb-1">🧲 인력 수렴 (Attract)</div>
                <div className="text-gray-400">마우스 커서 방향으로 모든 입자가 강력하게 끌려오며 밀집 코어를 형성합니다.</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FF007F] font-bold uppercase mb-1">🌀 와류 회전 (Vortex Swirl)</div>
                <div className="text-gray-400">마우스 위치를 중심으로 접선 벡터(Tangent)를 따라 소용돌이치며 나선 궤도를 돕니다.</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FFE600] font-bold uppercase mb-1">💥 척력 산란 (Repel)</div>
                <div className="text-gray-400">마우스 커서에 접근하는 입자들을 바깥으로 폭발적으로 밀어냅니다.</div>
              </div>
            </div>
            <div className="p-2.5 bg-[#0A0A0B] border border-[#00F0FF]/30 text-[10px] text-gray-300">
              💡 <strong>마우스 클릭 증폭:</strong> 캔버스 클릭 시 중력 가속도가 1.8배로 순간 폭발하여 입자들이 즉각적인 충격파 반응을 보입니다.
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 14,
      title: '14. 🎵 실시간 오디오 반응형 비주얼라이저 & 주파수 스펙트럼 모핑',
      category: 'new_13_16',
      subtitle: 'Real-time Audio Reactive FFT Spectrum, Bass Kick Pulse & Treble Glitter',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FF007F]/15 border border-[#FF007F] text-[#FF007F] text-[10px] font-bold uppercase tracking-wider">
            <Music className="w-3 h-3" /> 신규 추가 기능 (Page 14 Manual Specification)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#FF007F] font-bold text-xs uppercase flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Web Audio API 실시간 FFT 256밴드 분석 엔진
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              본 시스템은 마이크 입력, 내장 절차적 EDM 신디사이저, 또는 커스텀 MP3/WAV 오디오 파일의 주파수 대역을 60 FPS로 실시간 분해(Fast Fourier Transform)하여 셰이더 유니폼으로 직결합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FF007F] font-bold uppercase mb-1">🥁 저음 (Bass Kick Pulse)</div>
                <div className="text-gray-400">20Hz ~ 250Hz 대역의 킥 드럼 감지 시 파티클 전체가 외곽으로 방사형 팽창 폭발을 일으킵니다.</div>
              </div>
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold uppercase mb-1">✨ 고음 (Treble Glitter)</div>
                <div className="text-gray-400">2kHz ~ 16kHz 하이햇/신스 대역 감지 시 입자 표면에 섬세한 마이크로 지터와 반짝임이 발생합니다.</div>
              </div>
              <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FFE600] font-bold uppercase mb-1">⚡ 트랜지언트 비트 스파이크</div>
                <div className="text-gray-400">급격한 음압 변화(RMS Spike) 발생 시 피크 컬러(Color C) 발광 강도가 급증합니다.</div>
              </div>
            </div>
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-white font-bold text-xs uppercase">오디오 소스 선택 모드</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
              <li><strong>내장 신디사이저 (EDM Beat Synth):</strong> 마이크 허용 없이도 내장 124 BPM 전자음 비트로 즉시 반응형 테스트 가능</li>
              <li><strong>실시간 마이크 (Microphone Live):</strong> 사용자 음성 및 주변 스피커 음악에 실시간으로 파티클 댄싱</li>
              <li><strong>커스텀 오디오 파일 (Audio File Upload):</strong> MP3/WAV/OGG 음악 파일을 드래그하여 배경음악 재생 및 파티클 연동</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      page: 15,
      title: '15. 🌀 다중 역학 포스 필드 & 블랙홀 특이점(Singularity)',
      category: 'new_13_16',
      subtitle: 'Multi-Attractor Force Fields, Black Hole Singularity & Event Horizon',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFE600]/15 border border-[#FFE600] text-[#FFE600] text-[10px] font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3" /> 신규 추가 기능 (Page 15 Manual Specification)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#FFE600] font-bold text-xs uppercase flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> 블랙홀 특이점 강착원반 시뮬레이션
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              3D 공간의 원점(0,0,0)에 초거대 질량의 <strong>블랙홀 특이점(Black Hole Singularity)</strong>을 생성합니다. 사건의 지평선(Event Horizon Radius) 내에 진입한 파티클들은 뉴턴-아인슈타인 중력 공식에 의해 중심 방향으로 강력히 끌려가며 나선형 강착원반(Accretion Disk)을 형성합니다.
            </p>
            <div className="p-3 bg-[#0A0A0B] border border-[#2A2A2E] font-mono text-[10px] text-gray-300">
              float bhFalloff = pow(1.0 - (distBH / uBlackHoleRadius), 1.6);<br />
              vec3 dirBH = normalize(toBH);<br />
              vec3 tangentBH = normalize(cross(dirBH, vec3(0.0, 1.0, 0.0)));<br />
              finalPos += (dirBH * 0.45 + tangentBH * 1.25) * bhFalloff * (uBlackHoleMass * 2.2);
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FFE600] font-bold">블랙홀 질량 (Singularity Mass)</div>
                <div className="text-gray-400">흡입력 크기 조절 (0.5 ~ 8.0). 강력할수록 빛의 속도로 소용돌이 침</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FFE600] font-bold">사건의 지평선 반경 (Horizon Radius)</div>
                <div className="text-gray-400">중력 영향 유효 거리 (1.0 ~ 12.0 월드 단위)</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      page: 16,
      title: '16. 🎬 시네마틱 포스트 FX & 3D 포인트 클라우드(.PLY/.OBJ) 내보내기',
      category: 'new_13_16',
      subtitle: 'Cinematic Glitch FX & Export 3D Point Cloud for Blender / Unreal Engine / Houdini',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider">
            <Download className="w-3 h-3" /> 신규 추가 기능 (Page 16 Manual Specification)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> 1. 전문 3D 소프트웨어 연동 포인트 클라우드 내보내기
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              현재 모핑 중인 특정 프레임의 모든 3D 파티클 좌표(X, Y, Z)와 RGB 색상값을 표준 산업 규격 파일(<strong>.PLY</strong> 및 <strong>.OBJ</strong>)로 추출합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px]">
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#00F0FF] font-bold uppercase mb-1">📦 Stanford .PLY (ASCII Vertex Color)</div>
                <div className="text-gray-400">Blender, Houdini, MeshLab, CloudCompare에서 정밀 버텍스 컬러를 완벽히 로드 가능</div>
              </div>
              <div className="p-2.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                <div className="text-[#FF007F] font-bold uppercase mb-1">📦 Wavefront .OBJ (Point Vertices)</div>
                <div className="text-gray-400">Unreal Engine 5 Niagara 파티클 이미터, Maya, Cinema4D 등으로의 다이렉트 임포트</div>
              </div>
            </div>
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase">
              2. 시네마틱 디지털 글리치 (Digital Glitch Jitter FX)
            </h4>
            <p className="text-[11px] text-gray-300">
              사이버네틱 SF 분위기를 연출하기 위해 시간에 따른 고주파 난수 펄스로 파티클의 X/Y축을 순간적으로 분쇄 왜곡시키는 후처리 셰이더 효과입니다.
            </p>
          </div>
        </div>
      ),
    },
  ], []);

  const filteredPages = useMemo(() => {
    return manualPages.filter((item) => {
      const matchCat =
        activeCategory === 'all' ? true :
        activeCategory === 'new_13_16' ? item.page >= 13 && item.page <= 16 :
        item.category === activeCategory;
      
      const matchQuery =
        searchQuery.trim() === '' ? true :
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [manualPages, activeCategory, searchQuery]);

  const activePageData = manualPages.find((p) => p.page === currentPage) || manualPages[12];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-mono text-[#E0E0E0]">
      <div className="bg-[#0F0F12] border border-[#2A2A2E] w-full max-w-5xl shadow-[0_0_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#2A2A2E] flex items-center justify-between bg-[#0A0A0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1A1A1E] text-[#00F0FF] border border-[#2A2A2E] shadow-[0_0_10px_rgba(0,240,255,0.2)]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>3D 파티클 몰핑 스튜디오 공식 사용설명서</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] text-[9px] border border-[#00F0FF]/30 font-bold">
                  TOTAL 16 PAGES
                </span>
              </h2>
              <div className="text-[9px] text-gray-400 flex items-center gap-1 font-mono truncate max-w-lg">
                <Folder className="w-2.5 h-2.5 text-[#00F0FF] flex-shrink-0" />
                <span className="text-[#00F0FF] font-semibold">문서 경로:</span>
                <span className="text-gray-300 truncate">I:\다른 컴퓨터\내 Mac\yoonhtml\particleworld\particle-morphing-studio\사용설명서</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1A1A1E] border border-transparent hover:border-[#2A2A2E] transition cursor-pointer"
            title="창 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 13p~16p Quick Feature Highlight Banner */}
        <div className="bg-[#141418] border-b border-[#2A2A2E] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F] font-bold uppercase">
              ⭐ 13p ~ 16p 신규 확장 기능
            </span>
            <span className="text-gray-300 hidden md:inline">
              자유 부유 입자장 · 마우스 3D 중력장 · 오디오 주파수 비주얼라이저 · 블랙홀 · 3D PLY/OBJ 내보내기
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[13, 14, 15, 16].map((pNum) => (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`px-2 py-0.5 text-[9px] font-bold border transition cursor-pointer ${
                  currentPage === pNum
                    ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                    : 'bg-[#0A0A0B] text-gray-400 border-[#2A2A2E] hover:text-[#00F0FF] hover:border-[#00F0FF]'
                }`}
              >
                {pNum}P {pNum === 13 ? '중력장' : pNum === 14 ? '오디오' : pNum === 15 ? '블랙홀' : '3D내보내기'}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-4 py-2 border-b border-[#2A2A2E] bg-[#0A0A0B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'all' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              전체 목차 (1~16P)
            </button>
            <button
              onClick={() => setActiveCategory('new_13_16')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'new_13_16' ? 'bg-[#FF007F] text-white border-[#FF007F]' : 'bg-[#141417] text-[#FF007F] border-[#2A2A2E]'
              }`}
            >
              ⭐ 13p~16p 핵심 신기능
            </button>
            <button
              onClick={() => setActiveCategory('basics')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'basics' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              기초/뷰포트 (1~4P)
            </button>
            <button
              onClick={() => setActiveCategory('physics')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'physics' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              물리/노이즈 (5~6P)
            </button>
            <button
              onClick={() => setActiveCategory('advanced')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'advanced' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              고급/VEX (7~12P)
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="설명서 내용 실시간 검색..."
              className="w-full bg-[#141417] border border-[#2A2A2E] text-white pl-7 pr-3 py-1 text-[10px] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>

        {/* Main Body: Left Sidebar Page List + Right Page Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Table of Contents Sidebar */}
          <div className="w-full md:w-64 border-r border-[#2A2A2E] bg-[#0A0A0B] overflow-y-auto custom-scrollbar p-2 space-y-1 flex-shrink-0 max-h-40 md:max-h-none">
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>TABLE OF CONTENTS</span>
              <span>{filteredPages.length} PAGES</span>
            </div>
            {filteredPages.map((item) => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full text-left px-2.5 py-2 text-[10px] font-mono transition flex items-start justify-between gap-1.5 border cursor-pointer ${
                  currentPage === item.page
                    ? 'bg-[#1A1A22] text-[#00F0FF] border-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                    : 'bg-[#0F0F12] text-gray-400 border-[#1E1E22] hover:bg-[#141418] hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="truncate flex items-center gap-1">
                    {item.page >= 13 && <span className="text-[#FF007F] font-bold">★</span>}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="text-[8px] text-gray-500 truncate">{item.subtitle}</div>
                </div>
                <span className={`text-[9px] px-1 py-0.2 font-mono flex-shrink-0 ${
                  item.page >= 13 ? 'bg-[#FF007F]/20 text-[#FF007F]' : 'bg-[#1E1E24] text-gray-400'
                }`}>
                  P.{item.page}
                </span>
              </button>
            ))}
          </div>

          {/* Right Main Page Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0F0F12]">
            {/* Page Header */}
            <div className="p-4 border-b border-[#2A2A2E] bg-[#121216] flex items-center justify-between">
              <div>
                <div className="text-[9px] text-[#00F0FF] uppercase tracking-widest font-bold">
                  PAGE {activePageData.page} OF 16 — OFFICIAL USER MANUAL
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {activePageData.title}
                </h3>
                <div className="text-[10px] text-gray-400 font-mono">{activePageData.subtitle}</div>
              </div>

              {/* Prev / Next Page Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-[#1A1A1E] text-gray-300 hover:text-white hover:border-[#00F0FF] border border-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="이전 페이지"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2 py-1 bg-[#0A0A0B] border border-[#2A2A2E] text-[10px] text-white font-bold">
                  {currentPage} / 16
                </div>
                <button
                  disabled={currentPage >= 16}
                  onClick={() => setCurrentPage((p) => Math.min(16, p + 1))}
                  className="p-1.5 bg-[#1A1A1E] text-gray-300 hover:text-white hover:border-[#00F0FF] border border-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="다음 페이지"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Page Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar text-xs">
              {activePageData.content}
            </div>

            {/* Bottom Footer Page Jump Bar */}
            <div className="p-2.5 border-t border-[#2A2A2E] bg-[#0A0A0B] flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400">
              <div className="flex items-center gap-1">
                <span>페이지 이동:</span>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-5 h-5 text-[9px] font-mono font-bold border transition cursor-pointer flex items-center justify-center ${
                      currentPage === pNum
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : pNum >= 13
                        ? 'bg-[#FF007F]/20 text-[#FF007F] border-[#FF007F]/40 hover:bg-[#FF007F] hover:text-white'
                        : 'bg-[#141417] text-gray-400 border-[#2A2A2E] hover:text-white'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <div className="text-[9px] text-gray-500 font-mono">
                문서 위치: I:\다른 컴퓨터\내 Mac\yoonhtml\particleworld\particle-morphing-studio\사용설명서
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
