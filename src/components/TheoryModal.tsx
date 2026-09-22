import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, BookOpen, Layers, Wind, Sparkles, Sliders, 
  Bookmark, Download, Cpu, Zap, Radio,
  Compass, MousePointer, Palette, CheckCircle2, 
  ChevronLeft, ChevronRight, Search, FileText, Music,
  Folder, ArrowRight, ExternalLink, HardDrive, Disc,
  Video, Terminal, Eye, Type, Clock, Layout, Play,
  Move, RefreshCw, Key, HelpCircle, Camera, ShieldCheck
} from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'quick' | 'shapes' | 'physics' | 'visual' | 'export' | 'interactive'>('all');

  useEffect(() => {
    if (isOpen && initialPage) {
      setCurrentPage(initialPage);
    }
  }, [isOpen, initialPage]);

  const manualPages = useMemo(() => [
    // ----------------------------------------------------
    // PAGE 1: 시스템 개요 및 UI 조작
    // ----------------------------------------------------
    {
      page: 1,
      title: '01. 시스템 개요 & 상단 리본 메뉴바 / 하단 독 조작 가이드',
      category: 'quick',
      subtitle: 'Studio Layout, Ribbon Tabs, Bottom Dock & Workspace Navigation',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-3">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 3D 파티클 몰핑 스튜디오 개요
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              본 스튜디오는 최대 <strong>100,000개 이상의 3D 입자</strong>를 브라우저 WebGL GPU에서 60 FPS 무감속으로 실시간 제어하고, 복잡한 기하학 형상, 한글/영문 텍스트, 이미지 간의 유기적 모핑(Morphing)을 창작 및 내보내기하는 고성능 비주얼 스튜디오입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-1.5">
                <div><strong>1. 상단 리본 메뉴바 (Ribbon Bar):</strong> [01.형상], [02.물리/노이즈], [03.렌더/색상], [04.텍스트], [05.타임라인], [06.익스포트], [07.도구/고급] 7개 탭을 클릭하여 해당 기능의 세부 컨트롤 도구 모음을 즉시 펼칩니다.</div>
                <div><strong>2. 하단 퀵 컨트롤 독 (Bottom Dock):</strong> 화면 하단에 상시 고정되어 있으며, 재생/일시정지, 프로그레스 바(0~100%), 재생 속도(0.2x~3.0x), 자동 회전(R), 타임라인 에디터 열기 버튼을 원클릭 조작합니다.</div>
                <div><strong>3. 하단바 접기/펼치기 (Collapse Toggle):</strong> 하단 도크 우측 상단의 <code className="text-[#00F0FF]">▼ 접기</code> 버튼을 클릭하면 도크가 하단으로 숨겨져 3D 뷰포트를 전체 화면에 가깝게 시원하게 확장할 수 있습니다.</div>
                <div><strong>4. 좌측 도킹 제어판 (Side Panel):</strong> 탭 전환 없이 모든 물리, 형상, 텍스트 파라미터를 한눈에 스크롤하며 정밀 튜닝할 수 있습니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-1.5">
                <div><strong>• 즉각적인 60FPS 셰이더 반응:</strong> 슬라이더를 드래그하는 순간 GPU 유니폼(Uniform)이 업데이트되어 10만 개 파티클의 움직임이 버벅임 없이 실시간으로 변화합니다.</div>
                <div><strong>• 논블로킹 UI 인터랙션:</strong> 3D 렌더링 루프와 UI 조작 이벤트가 분리되어, 복잡한 시뮬레이션 중에도 탭 클릭이나 팝업 반응이 쾌적하게 동작합니다.</div>
                <div><strong>• 상태 기록 & 실행 취소:</strong> 슬라이더나 형상 변경 시 자동으로 히스토리에 기록되어 <kbd className="px-1 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[9px]">Ctrl+Z</kbd>(실행 취소)와 <kbd className="px-1 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[9px]">Ctrl+Y</kbd>(다시 실행)가 완벽 지원됩니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 2: 3D 뷰포트 제어 및 카메라 조작
    // ----------------------------------------------------
    {
      page: 2,
      title: '02. 3D 뷰포트 제어, 마우스 궤도 카메라 & 4K 투명 스냅샷',
      category: 'quick',
      subtitle: '3D Orbit Controls, Perspective Presets & 4K Transparent PNG Snapshot',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> 3D 뷰포트 카메라 네비게이션
            </h4>
            <p className="text-[11px] text-gray-300">
              Three.js 커스텀 궤도 카메라(Orbit Controls)를 통해 3차원 공간 속 파티클 피사체를 자유자재로 회전, 확대, 패닝 탐색합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 3D 궤도 회전 (Rotate):</strong> 캔버스 빈 공간에서 <span className="text-[#00F0FF] font-bold">마우스 좌클릭 드래그</span>. 원하는 앵글로 자유롭게 둘러봅니다.</div>
                <div><strong>• 공간 패닝 (Pan):</strong> <span className="text-[#00F0FF] font-bold">마우스 우클릭 드래그</span> 또는 <span className="text-[#00F0FF] font-bold">Shift + 좌클릭 드래그</span>로 뷰포트 중심을 이동합니다.</div>
                <div><strong>• 줌 인/아웃 (Zoom):</strong> <span className="text-[#00F0FF] font-bold">마우스 휠 스크롤</span>로 입자의 세부 코어까지 정밀 확대 및 축소합니다.</div>
                <div><strong>• 카메라 중심 리셋:</strong> 캔버스 빈 영역을 <span className="text-[#00F0FF] font-bold">더블 클릭</span>하거나 단축키 <kbd className="px-1 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[9px]">C</kbd>를 누르면 기본 정면 위치(Z=15)로 즉각 복귀합니다.</div>
                <div><strong>• 뷰포트 프리셋 버튼:</strong> 뷰포트 우측 상단 나침반의 [정면], [상단], [측면], [아이소메트릭] 버튼을 누르면 부드러운 카메라 트윈 애니메이션으로 시점이 전환됩니다.</div>
                <div><strong>• 4K 투명 스냅샷:</strong> 카메라 아이콘 클릭 시 배경이 투명한 고해상도 PNG 파일로 즉시 저장됩니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 구체적 원근감 (Perspective Depth):</strong> FOV 60도의 정밀 원근 투영으로 입자가 가까워질수록 크고 밝게 빛나며, 깊이감 있는 3D 입체감을 연출합니다.</div>
                <div><strong>• 자동 회전 (Auto-Turntable):</strong> 단축키 <kbd className="px-1 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[9px]">R</kbd>을 누르면 Y축 기준 부드러운 턴테이블 자전이 시작되어 갤러리 전시 모드를 구현합니다.</div>
                <div><strong>• 무손실 알파 투명 캡처:</strong> 3D 파티클 고유의 네온 발광과 트레일 잔상만이 보존된 투명 PNG 이미지가 생성되어 포토샵, 영상 합성 소스로 즉시 활용 가능합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 3: 텍스트 파티클 모핑 (정중앙 정렬 & 캔버스 자동 맞춤)
    // ----------------------------------------------------
    {
      page: 3,
      title: '03. ✍️ 텍스트 파티클: 텍스트 길이 기준 정중앙 정렬 & 캔버스 자동 맞춤(Auto-Fit)',
      category: 'shapes',
      subtitle: 'Length-Based Exact Center Alignment & Frustum Safe-Bounds Auto-Fit Typography',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 최신 강화 기능 (Text Particle Precision Auto-Centering Engine)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> 텍스트 파티클 중심 정렬 및 화면 자동 맞춤 원리
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              사용자가 입력한 텍스트의 실제 픽셀 바운딩 박스를 계산하여, <strong>텍스트들의 길이를 기준으로 가운데 지점이 캔버스의 정중앙 (0, 0, 0)에 완벽하게 위치</strong>합니다. 또한 텍스트 길이가 매우 길거나 여러 줄이더라도 카메라 가두리(Safe Bounds: 가로 13.5, 세로 8.2) 내로 <strong>비율을 유지하며 자동으로 최적 축소(Auto-Fit)</strong>되어 캔버스 화면 밖으로 잘림 없이 100% 안착됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 입력 영역 접근:</strong> 상단 리본 메뉴바의 <span className="text-[#00F0FF] font-bold">[04. 텍스트 파티클]</span> 탭을 클릭하거나 좌측 패널의 <span className="text-[#00F0FF] font-bold">[2D 멀티라인 텍스트]</span> 텍스트에어리어에 입력합니다.</div>
                <div><strong>2. 문구 작성:</strong> 원하는 단어, 문장 또는 줄바꿈(Enter)을 포함하여 1~3줄의 텍스트를 자유롭게 타이핑합니다. (예: "3D PARTICLE / 몰핑 스튜디오"). 줄바꿈이 없는 긴 문장도 자동으로 2~3줄로 지능 분할됩니다.</div>
                <div><strong>3. 슬롯 로딩:</strong>
                  <div className="mt-1 pl-2 space-y-1 text-gray-300">
                    <div>• <code className="text-[#00F0FF] font-bold">[출발] 로딩</code>: 모핑의 시작 형태(01.출발)로 즉시 장착</div>
                    <div>• <code className="text-amber-400 font-bold">[+경유] 로딩</code>: 중간을 거쳐가는 웨이포인트 형상으로 추가</div>
                    <div>• <code className="text-white font-bold">[목표] 로딩</code>: 최종 도달 형태(02.목표)로 장착</div>
                  </div>
                </div>
                <div><strong>4. 고속 단축키:</strong> 텍스트 입력 후 <kbd className="px-1.5 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[#00F0FF] text-[9px] font-bold">Ctrl + Enter</kbd>를 누르면 선택된 슬롯으로 즉각 로딩됩니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 캔버스 정중앙 완벽 안착 (Exact Centering):</strong> 텍스트의 좌우 가장자리와 상하 끝부분의 중간 좌표가 원점 (0,0,0)에 일치하여 카메라를 회전하거나 정면으로 보았을 때 완벽한 좌우 대칭을 이룹니다.</div>
                <div><strong>• 긴 텍스트 자동 축소 (Smart Auto-Fit):</strong> 한 글자(예: 'AI')부터 수십 글자의 긴 문장까지 가로 최대 13.5, 세로 8.2 월드 단위 내에 자동으로 스케일링되어 사이드바나 툴바에 가려지지 않고 깔끔하게 표시됩니다.</div>
                <div><strong>• HY태고딕 고선명도 2D 평면:</strong> Z축 깊이를 0.0으로 완전 고정하여 3D 왜곡 없이 한글 획과 글꼴의 엣지가 면도날처럼 선명하게 가독성을 유지합니다.</div>
                <div><strong>• 일렉트릭 네온 그라데이션:</strong> 사이안-화이트 발광 코어와 앰버-마젠타 외곽선이 어우러져 사이버펑크 네온 간판 스타일의 매혹적인 발광을 뿜어냅니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 4: 사용자 이미지 파티클 변환기
    // ----------------------------------------------------
    {
      page: 4,
      title: '04. 🖼️ 사용자 커스텀 이미지(PNG/JPG/SVG) 파티클 변환기',
      category: 'shapes',
      subtitle: 'Image-to-Particle Conversion, Luminance Threshold & 3D Extrusion',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" /> 2D 이미지의 3D 파티클 포인트 클라우드화
            </h4>
            <p className="text-[11px] text-gray-300">
              PNG, JPG, SVG, WebP 이미지 파일을 브라우저 픽셀 분석 엔진으로 읽어 들여 100,000개의 고밀도 3D 입자로 실시간 변환합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 파일 로딩:</strong> 이미지를 화면 아무 곳에나 <span className="text-[#00F0FF] font-bold">드래그 앤 드롭</span>하거나, 리본 메뉴바 [01.형상]의 <span className="text-[#00F0FF] font-bold">[이미지 업로드]</span> 버튼을 클릭하여 선택합니다.</div>
                <div><strong>2. 밝기 임계값 (Threshold) 조절:</strong> 슬라이더(0~255)로 배경과 피사체를 분리할 밝기 기준을 지정합니다. 투명 PNG는 알파 채널이 자동 인식됩니다.</div>
                <div><strong>3. 샘플링 모드 선택:</strong> 균일 격자(Uniform Grid), 엣지 윤곽선 집중(Sobel Edge), 밝기 확률 분포(Luminance PDF) 중 원하는 스타일을 클릭합니다.</div>
                <div><strong>4. 3D 돌출 깊이 (Extrusion):</strong> Z축 두께 슬라이더를 올려 평면 사진을 입체적인 3D 부조(Bas-relief) 형태로 돌출시킵니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 원본 색상 1:1 보존:</strong> 이미지의 각 픽셀 RGB가 파티클 정점 컬러로 전송되어 사진 고유의 색감과 음영이 생생하게 살아납니다.</div>
                <div><strong>• 형태 분해 및 재조립 모핑:</strong> 사진 속 인물이나 로고가 수만 개의 빛나는 입자로 산산이 부서지며 3D 은하수나 텍스트로 트랜스폼되는 영화 같은 시네마틱 효과를 감상할 수 있습니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 5: 15종 기하학 형상 라이브러리 & 조류 군집 비행
    // ----------------------------------------------------
    {
      page: 5,
      title: '05. 🌐 15종 기하학 형상 라이브러리 & 조류 군집 비행(Flocking Boids)',
      category: 'shapes',
      subtitle: '15 Procedural Mathematical Geometries & Craig Reynolds Boids Flocking',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 순수 수학 공식 기반 3D 절차적 형상들
            </h4>
            <p className="text-[11px] text-gray-300">
              외장 3D 모델 파일 없이 순수 수학 방정식으로 계산되는 15종의 기하학적 형상과 유기적 생명체 알고리즘이 탑재되어 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 형상 선택:</strong> 상단 리본 [01.형상] 메뉴 또는 좌측 패널 드롭다운에서 [출발 형상]과 [목표 형상]을 각각 클릭합니다.</div>
                <div><strong>2. 형상 스왑:</strong> 두 형상 사이의 <code className="text-[#00F0FF] font-bold">[⇄ 형상 스왑]</code> 버튼을 클릭하면 출발과 도착이 원클릭으로 반전됩니다.</div>
                <div><strong>3. 형상별 주요 목록:</strong>
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-gray-300 pt-1">
                    <div>• 구체 (Fibonacci Sphere)</div>
                    <div>• 큐브 격자 (Voxel Cube)</div>
                    <div>• 토러스 도넛 (Torus Ring)</div>
                    <div>• 3D 나선 원뿔 (Helix Spiral)</div>
                    <div>• 3D 심장 (Cardioid Heart)</div>
                    <div>• 은하수 나선팔 (Galaxy Spiral)</div>
                    <div>• DNA 이중나선 (DNA Helix)</div>
                    <div>• 로렌츠 카오스 끌개 (Lorenz)</div>
                    <div>• 4D 클라인 병 (Klein Bottle)</div>
                    <div>• 뫼비우스 띠 (Möbius Strip)</div>
                    <div>• 정이십면체 (Icosahedron)</div>
                    <div>• 조류 군집 비행 (Flocking Boids)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 조류 군집 비행 (Flocking Boids):</strong> 응집(Cohesion), 정렬(Alignment), 분리(Separation)의 3대 물리 규칙을 실시간 연산하여 마치 살아있는 철새 떼나 정어리 떼처럼 유기적으로 파동치며 유영합니다.</div>
                <div><strong>• 은하수 나선팔 회전:</strong> 3개의 대수 나선팔을 따라 고밀도 항성 코어와 우주 성간 물질의 나선 회전이 아름답게 펼쳐집니다.</div>
                <div><strong>• 위상수학적 비틀림 (Klein & Möbius):</strong> 안과 밖의 구분이 없는 4차원 클라인 병과 뫼비우스 곡면의 무한 궤적을 3차원 입체로 생생하게 투시할 수 있습니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 6: 타임라인 에디터 레이아웃 모드 & 하단바 접기
    // ----------------------------------------------------
    {
      page: 6,
      title: '06. ⏱️ 타임라인 에디터(Visual Timeline Editor) 레이아웃 모드 & 하단바 접기',
      category: 'physics',
      subtitle: 'Multi-Waypoint Sequence, Bottom-Drawer vs Side-Panel Layout & Dock Collapse',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFE600]/15 border border-[#FFE600] text-[#FFE600] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 최신 레이아웃 최적화 (Dual Layout & Dock Non-Overlap Engine)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" /> 타임라인 에디터 레이아웃 모드 개요
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              하단 메뉴바와 타임라인 에디터가 겹치지 않도록 <strong>[사이드 패널 모드]</strong>와 <strong>[하단 드로어 모드]</strong>의 자유로운 전환을 지원하며, <strong>[하단 메뉴바 접기/펼치기]</strong> 기능을 통해 작업 영역을 극대화할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 타임라인 에디터 열기:</strong> 하단 독의 <span className="text-[#00F0FF] font-bold">[⏱️ 타임라인 에디터]</span> 버튼을 클릭하여 창을 엽니다.</div>
                <div><strong>2. 레이아웃 위치 전환:</strong> 타임라인 에디터 상단 우측의 <code className="text-[#00F0FF] font-bold">[사이드 패널 ➔]</code> 버튼을 누르면 우측 도킹 사이드바로 이동하며, <code className="text-[#FFE600] font-bold">[하단 드로어 ⬇️]</code> 버튼을 누르면 하단 가로창으로 전환됩니다.</div>
                <div><strong>3. 하단 메뉴바 접기:</strong> 하단 퀵 독 우측 상단의 <code className="text-gray-300 font-bold">[▼ 메뉴바 접기]</code>를 누르면 하단 독이 컴팩트하게 접혀 겹침 없이 3D 화면을 넓게 볼 수 있습니다. 필요할 때 <code className="text-[#00F0FF] font-bold">[▲ 펼치기]</code>를 누르면 복원됩니다.</div>
                <div><strong>4. 다중 경유지(Waypoint) 제어:</strong>
                  <div className="mt-1 pl-2 space-y-1 text-gray-300">
                    <div>• <code className="text-[#00F0FF] font-bold">[+ 노드 추가]</code>: 모핑 중간 경유지를 무제한 확장</div>
                    <div>• <code className="text-red-400 font-bold">[삭제]</code>: 불필요한 경유지 노드 즉시 제거</div>
                    <div>• <code className="text-amber-400 font-bold">[드래그 앤 드롭]</code>: 노드 순서를 드래그하여 즉시 재배치</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 100% 겹침 방지 (Zero Interference):</strong> 사이드 패널 모드에서는 화면 오른쪽에 단독 수직 배치되어 하단 재생 독이나 조작 버튼을 전혀 가리지 않습니다.</div>
                <div><strong>• 구간별 개별 이징 (Per-Segment Easing):</strong> 출발 ➔ 경유1은 'Elastic Out(통통 튀는 반동)', 경유1 ➔ 목표는 'Smoothstep(부드러운 감속)' 등 구간마다 독립적인 이징 곡선과 대기 시간(Hold Time)이 적용됩니다.</div>
                <div><strong>• 실시간 헤드 바 동기화:</strong> 3D 화면에서 재생되는 현재 모핑 진행도(Progress)와 타임라인 눈금자의 주황색 인디케이터가 1밀리초 오차 없이 실시간으로 연동됩니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 7: 스태거 시차 지연 매트릭스 5종
    // ----------------------------------------------------
    {
      page: 7,
      title: '07. 🌊 5종 스태거 시차 지연(Stagger Delay) 매트릭스',
      category: 'physics',
      subtitle: 'Asynchronous Particle Wavefronts & Spatiotemporal Delay Matrices',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" /> 시차 출발(Stagger) 물리 메커니즘
            </h4>
            <p className="text-[11px] text-gray-300">
              10만 개 입자가 군대처럼 일률적으로 움직이지 않고, 지리적/물리적 기준에 따라 시간차(Offset)를 두고 순차 출발하여 환상적인 물결 파동을 만듭니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 스태거 모드 선택:</strong> 상단 리본 [02.물리/노이즈] 또는 좌측 패널에서 5개 모드 중 하나를 클릭합니다:
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <strong>수직 Y축 (Linear Y):</strong> 바닥부터 위로 솟구치며 출발</div>
                    <div>• <strong>수평 X축 (Linear X):</strong> 좌측에서 우측으로 빗자루 쓸듯 스위프</div>
                    <div>• <strong>방사형 중심 (Radial Center):</strong> 중심 핵에서 외곽으로 충격파 분출</div>
                    <div>• <strong>휘도 밝기 (Brightness):</strong> 사진의 밝은 하이라이트부터 해체</div>
                    <div>• <strong>랜덤 노이즈 (Random Seed):</strong> 무작위 불꽃놀이 파편 출발</div>
                  </div>
                </div>
                <div><strong>2. 시차 스프레드 슬라이더:</strong> 0.00(동시 출발)부터 0.85(극적인 시간차 물결)까지 간격을 미세 조절합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 유기적인 시공간 파동 (Spatiotemporal Wave):</strong> 형상이 단번에 변하지 않고, 파도나 바람에 모래가 날아가듯 입체적인 층위(Layer)를 이루며 순차 분해 후 재조립됩니다.</div>
                <div><strong>• 속도 대비 발광:</strong> 먼저 출발한 입자와 뒤따르는 입자 간의 속도 차이로 인해 도플러 색상 변조가 발생하여 드라마틱한 에너지 흐름이 연출됩니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 8: 3D 컬 노이즈 유체 역학 & 무발산 난류장
    // ----------------------------------------------------
    {
      page: 8,
      title: '08. 🌪️ 3D 컬 노이즈(Curl Noise) 유체 역학 & 무발산 난류장',
      category: 'physics',
      subtitle: 'Divergence-Free (∇·v = 0) Fluid Swirls & Turbulent Vortex Fields',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5" /> 무발산(Divergence=0) 유체 와류 역학
            </h4>
            <p className="text-[11px] text-gray-300">
              일반 노이즈처럼 입자가 뭉치거나 사라지지 않고, 실제 유체 역학(Navier-Stokes)의 부피 보존 와류를 셰이더 내에서 3차원 편미분으로 실시간 합성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 노이즈 강도 (Amplitude):</strong> 0.0(직선 이동) ~ 8.0(격렬한 폭풍우). 이동 경로의 소용돌이 왜곡 크기를 결정합니다.</div>
                <div><strong>2. 노이즈 주파수 (Frequency):</strong> 0.05(거대한 대기 소용돌이) ~ 2.0(미세한 아지랑이 난류). 와류의 밀도를 조절합니다.</div>
                <div><strong>3. 노이즈 속도 (Speed):</strong> 난류장 자체의 흐름 속도를 설정하여 시간 흐름에 따른 생동감을 더합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 연기 및 오로라 궤적:</strong> 입자들이 목적지를 향해 날아가는 도중 유려한 S자 곡선과 나선형 소용돌이를 그리며 흩날리다가, 목적지에 도달하는 순간 완벽한 정밀도로 다시 결합합니다.</div>
                <div><strong>• 중간점 피크 마스킹:</strong> 진행률 50% 지점에서 노이즈가 최고조에 달하고, 출발점(0%)과 도착점(100%)에서는 형상의 원래 형태를 칼같이 유지합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 9: 8종 프로시저럴 파티클 셰이프 & 스노우플레이크 눈결정
    // ----------------------------------------------------
    {
      page: 9,
      title: '09. 💎 8종 프로시저럴 파티클 셰이프 & 스노우플레이크 눈결정',
      category: 'visual',
      subtitle: '8 Procedural Point SDF Shapes & 5 Fractal Snowflake Textures',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 광학 거리장(SDF) 기반 다양한 입자 형태
            </h4>
            <p className="text-[11px] text-gray-300">
              무거운 비트맵 텍스처 대신 프래그먼트 셰이더 내 수학적 SDF(Signed Distance Field) 연산으로 날카로운 기하 입자와 로맨틱한 눈결정체를 렌더링합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 파티클 형태 선택:</strong> 상단 리본 [03.렌더/색상]에서 8종 셰이프 중 하나를 선택합니다:
                  <div className="grid grid-cols-2 gap-1 text-[9px] pt-1">
                    <div>• 원형 (Circle Glow)</div>
                    <div>• 별/크로스 (Cross Star)</div>
                    <div>• 다이아몬드 (Diamond)</div>
                    <div>• 네온 링 (Neon Ring)</div>
                    <div>• 육각형 (Hexagon)</div>
                    <div>• 큐브 픽셀 (Square)</div>
                    <div>• 성운 연막 (Nebula)</div>
                    <div>• 보케 플레어 (Bokeh)</div>
                  </div>
                </div>
                <div><strong>2. 눈결정체 모드 (Snowflake Mode):</strong> 5종의 프랙탈 눈꽃 결정 텍스처를 활성화하여 겨울 테마 비주얼을 연출합니다.</div>
                <div><strong>3. 파티클 크기 및 글로우:</strong> 입자 직경(0.01~0.3) 및 발광 강도를 슬라이더로 조작합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 회절 스파클 (Diffraction Sparkle):</strong> Star나 Diamond 선택 시 카메라 렌즈 앞의 다이아몬드 보석처럼 번쩍이는 4축 광학 회절 효과가 나타납니다.</div>
                <div><strong>• 가산 블렌딩 (Additive Glow):</strong> 수만 개의 입자가 겹치는 고밀도 영역일수록 백열(Pure White)로 타오르는 환상적인 빛의 깊이를 선사합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 10: 7종 멀티 모드 색상 혼합 & 속도 변색(도플러)
    // ----------------------------------------------------
    {
      page: 10,
      title: '10. 🌈 7종 멀티 모드 색상 혼합 & 속도 변색(도플러 시프트)',
      category: 'visual',
      subtitle: 'Color Mixing Engines & Kinetic Velocity Doppler Shift Lighting',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> 셰이더 기반 다이내믹 컬러 변조 엔진
            </h4>
            <p className="text-[11px] text-gray-300">
              형상 고유의 색상뿐 아니라 운동 에너지와 공간 좌표에 따라 색채가 실시간 진화하는 7가지 고급 색상 솔버가 내장되어 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 컬러 솔버 선택:</strong> 상단 리본 [03.렌더/색상]에서 원하는 모드를 클릭합니다:
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <strong>형상 원본 보간 (Interpolate):</strong> 출발 RGB ➔ 목표 RGB 부드러운 전환</div>
                    <div>• <strong>3-Stop 그라데이션 (Gradient):</strong> Color A, B, C 파라미터 3색 램프</div>
                    <div>• <strong>속도 변색 도플러 (Velocity Shift):</strong> 가속도가 높은 입자 발광 변색</div>
                    <div>• <strong>수직 고도 (Height):</strong> 3D Y축 높이에 따라 층별 색상 분기</div>
                    <div>• <strong>방사형 거리 (Radial):</strong> 중심 원점으로부터의 거리 기반 그라데이션</div>
                  </div>
                </div>
                <div><strong>2. 색상 피커 (Color A / B / C):</strong> 직관적인 헥스(HEX) 컬러 피커로 나만의 네온 팔레트를 커스텀합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 초고에너지 도플러 발광:</strong> 노이즈 난류나 마우스 인력에 의해 고속으로 가속된 입자들이 마젠타/골드 피크 컬러로 순간 발광하여 압도적인 역동성을 연출합니다.</div>
                <div><strong>• 자연스러운 감마 보정:</strong> 선형 sRGB 감마 공간에서 블렌딩되어 중간 색상이 칙칙해지지 않고 생생하고 화사한 네온 빛을 유지합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 11: WebGL FBO 핑퐁 잔상 모션 트레일
    // ----------------------------------------------------
    {
      page: 11,
      title: '11. 💫 WebGL FBO 핑퐁 잔상 모션 트레일(Motion Trails)',
      category: 'visual',
      subtitle: 'FBO Ping-Pong Motion Persistence & Neon Meteor Trails',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 유성 꼬리 같은 지속성(Persistence) 궤적
            </h4>
            <p className="text-[11px] text-gray-300">
              이전 프레임의 이미지를 FBO(Frame Buffer Object)에 누적 보존하여, 밤하늘을 가르는 유성(Meteor) 꼬리 같은 빛의 궤적을 렌더링합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 트레일 토글:</strong> 상단 리본 [03.렌더/색상] 또는 좌측 패널의 <span className="text-[#00F0FF] font-bold">[모션 트레일]</span> 스위치를 ON으로 켭니다.</div>
                <div><strong>2. 트레일 길이 슬라이더 (Trail Length):</strong>
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <code>0.10 ~ 0.40</code>: 짧고 경쾌한 광학 스파크</div>
                    <div>• <code>0.60 ~ 0.85</code>: 유려하고 매끄러운 유성우 궤적 (추천)</div>
                    <div>• <code>0.90 ~ 0.98</code>: 장노출 천체 사진 같은 몽환적 빛의 실크</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 빛의 실크 궤적:</strong> 입자의 빠른 비행 궤적이 허공에 그대로 남아 실타래처럼 엉키며 입체적인 오로라 커튼을 형성합니다.</div>
                <div><strong>• 부드러운 페이드아웃:</strong> 알파 감쇠 셰이더를 통해 잔상이 뚝 끊기지 않고 어둠 속으로 자연스럽게 녹아 사라집니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 12: 순수 파티클 HTML / CMD 내보내기 & 자동 숨김
    // ----------------------------------------------------
    {
      page: 12,
      title: '12. ✨ 순수 파티클 HTML / CMD 내보내기 & 마우스 미동작 시 자동 숨김',
      category: 'export',
      subtitle: 'Pure Particle Standalone Viewer with 2.5s Idle Auto-Hide for Pointer & HUD',
      content: (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 최신 몰입형 인터랙션 (Pure Particle Idle-Mode Auto-Hide)
          </div>

          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> 순수 파티클 뷰어의 자동 숨김 인터랙션
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              복잡한 메뉴나 사이드바 없이 오직 순수한 3D 파티클 예술만을 감상할 수 있는 독립형 파일입니다. 파일 실행 시 <strong>2.5초간 마우스가 움직이지 않으면 마우스 포인터(커서)와 하단 명령자막 HUD가 동시에 부드럽게 숨겨지고, 마우스를 움직이면 즉각 동시에 복원</strong>되어 완벽한 암전 몰입감을 선사합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 내보내기 실행:</strong> 상단 리본 [06.익스포트] 탭 또는 좌측 패널에서 <code className="text-[#00F0FF] font-bold">[✨ 순수 파티클 HTML 내보내기]</code> 또는 <code className="text-amber-400 font-bold">[⚡ 순수 파티클 CMD 내보내기]</code> 버튼을 클릭합니다.</div>
                <div><strong>2. 단일 파일 즉시 실행:</strong> 다운로드된 <code>.html</code> 파일이나 <code>.cmd</code> 배치 파일을 더블 클릭하면 브라우저에서 인터넷 없이 즉시 60FPS로 구동됩니다.</div>
                <div><strong>3. 내장 키보드 단축키 조작:</strong>
                  <div className="mt-1 pl-2 space-y-1 text-gray-300">
                    <div>• <kbd className="px-1.5 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[#00F0FF] text-[9px] font-bold">Space</kbd>: 모핑 애니메이션 일시정지 / 재생</div>
                    <div>• <kbd className="px-1.5 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[#00F0FF] text-[9px] font-bold">R</kbd>: 3D 카메라 자동 회전 켜기 / 끄기</div>
                    <div>• <kbd className="px-1.5 py-0.5 bg-[#0A0A0B] border border-gray-600 text-[#00F0FF] text-[9px] font-bold">F</kbd>: 전체화면(Fullscreen) 진입 / 해제</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 마우스 정지 시 자동 암전 숨김 (Idle Hide):</strong> 마우스 조작을 멈추면 2.5초 후 마우스 화살표 커서가 사라짐(<code>cursor: none</code>)과 동시에 하단 명령자막 HUD가 투명도 0으로 페이드아웃되어 검은 캔버스 위에 빛나는 파티클만 떠오릅니다.</div>
                <div><strong>• 마우스 이동 시 즉시 복원 (Awake):</strong> 마우스를 살짝만 건드려도 포인터와 조작 안내 자막이 부드럽게 다시 나타나 조작 상태를 즉시 확인할 수 있습니다.</div>
                <div><strong>• 미디어 아트 전시용 최적화:</strong> 전시장, 프로젝션 맵핑 키오스크, 로비 디스플레이 등에 띄워두었을 때 불필요한 마우스 커서나 UI 텍스트가 화면을 방해하지 않는 이상적인 순수 뷰어 환경을 제공합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 13: 단일 파일 독립 실행형 인터랙티브 HTML 스튜디오 내보내기
    // ----------------------------------------------------
    {
      page: 13,
      title: '13. 💾 단일 파일 독립 실행형 인터랙티브 HTML 스튜디오 내보내기',
      category: 'export',
      subtitle: 'Zero-Dependency Standalone Single-File HTML Studio Exporter',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> 모든 기능이 하나로 압축된 독립형 웹 앱
            </h4>
            <p className="text-[11px] text-gray-300">
              Three.js 라이브러리, GLSL 셰이더, 모든 형상 데이터, 제어판 UI가 단 하나의 .html 파일 안에 인라인 번들링되어 영구 보관됩니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 내보내기 클릭:</strong> 상단 리본 [06.익스포트] 탭의 <span className="text-[#00F0FF] font-bold">[독립형 HTML 내보내기]</span> 버튼을 클릭합니다.</div>
                <div><strong>2. 저장 및 공유:</strong> 다운로드된 HTML 파일을 USB에 담거나 이메일로 전송하면, 상대방 컴퓨터에 Node.js나 서버가 설치되어 있지 않아도 크롬, 엣지, 사파리에서 더블 클릭만으로 완벽하게 동작합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 완벽한 오프라인 구동:</strong> 와이파이나 인터넷 연결이 끊긴 환경에서도 10만 개 파티클의 모든 인터랙션과 물리 시뮬레이션이 100% 동일하게 재현됩니다.</div>
                <div><strong>• 포트폴리오 및 클라이언트 납품:</strong> 별도의 호스팅 비용 없이 단일 웹 페이지 형태로 클라이언트에게 완성작을 전달할 수 있습니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 14: 자유 부유 입자장 & 3D 마우스 중력 인력/와류 물리
    // ----------------------------------------------------
    {
      page: 14,
      title: '14. 🌌 자유 부유 입자장(Cosmic Drift) & 3D 마우스 중력 인력/와류 물리',
      category: 'interactive',
      subtitle: 'Free-Floating Ambient Cosmic Drift & 3D Mouse Gravity Attractor / Vortex',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" /> 마우스 커서와 우주 입자의 실시간 물리 상호작용
            </h4>
            <p className="text-[11px] text-gray-300">
              마우스 커서의 2D 화면 좌표를 3D 공간으로 역투영(Unproject Raycast)하여, 커서 주변에 강력한 중력 구체를 형성하고 입자들을 끌어당기거나 회전시킵니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 마우스 물리 켜기:</strong> 상단 리본 [02.물리/노이즈]의 <span className="text-[#00F0FF] font-bold">[마우스 중력장]</span> 스위치를 활성화합니다.</div>
                <div><strong>2. 상호작용 모드 선택:</strong>
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <strong className="text-[#00F0FF]">인력 수렴 (Attract):</strong> 자석처럼 마우스 커서로 입자가 모여듦</div>
                    <div>• <strong className="text-[#FF007F]">와류 회전 (Vortex Swirl):</strong> 커서 둘레를 따라 소용돌이치며 공전</div>
                    <div>• <strong className="text-[#FFE600]">척력 산란 (Repel):</strong> 커서에 닿으면 폭발하듯 튕겨 나감</div>
                  </div>
                </div>
                <div><strong>3. 마우스 클릭 충격파:</strong> 캔버스를 클릭하는 순간 중력 가속도가 1.8배로 순간 폭발하여 입자 파동이 사방으로 번져나갑니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 살아 숨 쉬는 촉각적 반응:</strong> 관객이 마우스를 움직이는 대로 파티클 무리가 꼬리를 물고 유영하여 높은 인터랙티브 몰입감을 선사합니다.</div>
                <div><strong>• 자유 부유 우주장 (Cosmic Field):</strong> 정형화된 모양 없이 온 우주에 부유하던 입자들이 마우스 인력에 의해 일순간 응집되는 장관을 연출합니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 15: 실시간 오디오 반응형 FFT 스펙트럼 비주얼라이저
    // ----------------------------------------------------
    {
      page: 15,
      title: '15. 🎵 실시간 오디오 반응형 FFT 스펙트럼 비주얼라이저',
      category: 'interactive',
      subtitle: 'Real-time Audio Reactive 256-band FFT Spectrum, Bass Pulse & Treble Glitter',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Web Audio API 실시간 256밴드 주파수 분해
            </h4>
            <p className="text-[11px] text-gray-300">
              마이크 입력, 내장 EDM 신스 비트, 또는 업로드된 음악의 주파수 스펙트럼을 60FPS로 분석하여 파티클의 팽창, 진동, 발광과 직결합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 오디오 소스 활성화:</strong> 상단 리본 [07.도구/고급]의 <span className="text-[#00F0FF] font-bold">[오디오 비주얼라이저]</span>를 켭니다.</div>
                <div><strong>2. 입력 소스 모드 선택:</strong>
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <strong>내장 신디사이저 (Synth):</strong> 마이크 권한 없이 124 BPM 전자음 즉시 테스트</div>
                    <div>• <strong>실시간 마이크 (Mic):</strong> 주변 목소리와 스피커 소리에 맞춰 댄싱</div>
                    <div>• <strong>오디오 파일 (MP3/WAV):</strong> 내 음악 파일을 업로드하여 감상</div>
                  </div>
                </div>
                <div><strong>3. 반응 강도 (Sensitivity):</strong> 슬라이더로 비트에 대한 파티클의 반응 민감도를 조절합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 킥 드럼 베이스 팽창 (Bass Kick):</strong> 20Hz~250Hz 저음 감지 시 입자 전체가 쿵쿵 뛰며 외부로 방사형 폭발 팽창을 일으킵니다.</div>
                <div><strong>• 하이햇 고음 글리터 (Treble Glitter):</strong> 2kHz~16kHz 고음 감지 시 입자 표면에 반짝이는 미세 지터 스파클이 번쩍입니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 16: 다중 인력자 & 블랙홀 특이점
    // ----------------------------------------------------
    {
      page: 16,
      title: '16. 🌀 다중 인력자(Multi-Attractor) & 블랙홀 특이점(Singularity)',
      category: 'interactive',
      subtitle: 'Black Hole Singularity, Event Horizon & Accretion Disk Simulation',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#FFE600] font-bold text-xs uppercase flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> 아인슈타인 중력 렌즈 및 강착원반 시뮬레이션
            </h4>
            <p className="text-[11px] text-gray-300">
              3D 공간 중심에 초거대 질량의 블랙홀을 배치하여, 사건의 지평선(Event Horizon) 내부로 모든 입자를 나선형으로 빨아들입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 블랙홀 스위치 ON:</strong> 상단 리본 [02.물리] 또는 좌측 패널의 <span className="text-[#FFE600] font-bold">[블랙홀 특이점]</span> 토글을 활성화합니다.</div>
                <div><strong>2. 특이점 질량 (Mass):</strong> 0.5 ~ 8.0. 숫자가 클수록 강력한 흡입력으로 파티클을 빛의 속도로 회전시킵니다.</div>
                <div><strong>3. 사건의 지평선 반경 (Event Horizon):</strong> 중력 유효 반경(1.0 ~ 12.0)을 설정합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 나선 강착원반 (Accretion Disk):</strong> 입자들이 중심 핵으로 빨려 들어가며 가속되어 빛나는 나선형 원반을 형성합니다.</div>
                <div><strong>• 우주 SF 영화 속 특이점:</strong> 인터스텔라 가르강튀아를 연상시키는 압도적인 천체 물리학적 시각 효과를 만끽할 수 있습니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 17: 시네마틱 글리치 FX & 3D 포인트 클라우드 내보내기
    // ----------------------------------------------------
    {
      page: 17,
      title: '17. 🎬 시네마틱 글리치 FX & 3D 포인트 클라우드(.PLY/.OBJ/.XYZ) 내보내기',
      category: 'export',
      subtitle: 'Cinematic Glitch Jitter FX & Export 3D Point Clouds for Blender / UE5 / Houdini',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> 전문 3D 소프트웨어와의 완벽한 데이터 연동
            </h4>
            <p className="text-[11px] text-gray-300">
              현재 모핑 프레임의 3D 정점 좌표(X, Y, Z)와 RGB 버텍스 컬러를 산업 표준 3D 포맷으로 추출하여 블렌더, 언리얼 엔진 5, 후디니로 전송합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 포맷 선택:</strong> 상단 리본 [06.익스포트] 탭의 <span className="text-[#00F0FF] font-bold">[3D 포인트 클라우드 내보내기]</span>에서 원하는 규격을 클릭합니다:
                  <div className="pl-2 mt-1 space-y-1">
                    <div>• <strong>Stanford .PLY:</strong> 버텍스 컬러가 포함되어 Blender/MeshLab 임포트에 최적</div>
                    <div>• <strong>Wavefront .OBJ:</strong> Unreal Engine 5 나이아가라(Niagara) 입자 이미터용</div>
                    <div>• <strong>Raw ASCII .XYZ:</strong> 과학 계산 및 포인트 클라우드 전용 포맷</div>
                  </div>
                </div>
                <div><strong>2. 시네마틱 글리치:</strong> 글리치 슬라이더를 올려 사이버네틱 디지털 잡음 왜곡을 연출합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 무손실 10만 포인트 보존:</strong> 브라우저 화면에서 보던 파티클의 위치와 컬러가 3D CAD/CG 프로그램에서 1밀리미터 오차 없이 그대로 로드됩니다.</div>
                <div><strong>• 모션 그래픽 파이프라인 완성:</strong> 웹에서 가볍게 시뮬레이션한 파티클 데이터를 4K 옥테인/사이클 렌더러로 옮겨 하이엔드 상업 영상으로 가공할 수 있습니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 18: 60FPS 풀HD 비디오 레코더 & CNC/레이저 G-Code 내보내기
    // ----------------------------------------------------
    {
      page: 18,
      title: '18. 🎥 60FPS 풀HD 비디오 레코더 & CNC/레이저 G-Code 내보내기',
      category: 'export',
      subtitle: 'Canvas MediaRecorder 60FPS WebM/MP4 Video Recording & CNC Laser G-Code',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> 실시간 고화질 영상 녹화 및 하드웨어 제조 연동
            </h4>
            <p className="text-[11px] text-gray-300">
              별도의 캡처 프로그램 없이 브라우저 캔버스를 60FPS로 직접 스트리밍 인코딩하고, CNC 조각기와 레이저 가공기를 위한 산업용 G-Code를 생성합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 🛠️ 조작 방법 (Operation Method)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>1. 비디오 녹화 시작:</strong> 상단 리본 [06.익스포트]의 <span className="text-[#00F0FF] font-bold">[비디오 레코더]</span> 모달을 열고 해상도(1080p/4K)와 비트레이트를 선택한 후 [녹화 시작]을 클릭합니다.</div>
                <div><strong>2. 녹화 종료 및 다운로드:</strong> 모핑이 끝난 후 [녹화 정지]를 누르면 브라우저 내에서 즉시 인코딩되어 WebM/MP4 영상 파일로 저장됩니다.</div>
                <div><strong>3. CNC G-Code 생성:</strong> [CNC/레이저 G-Code] 메뉴에서 레이저 파워(S), 이송 속도(F), 절삭 깊이를 입력하고 <code className="text-[#00F0FF]">.gcode</code> 파일을 다운로드합니다.</div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> ✨ 효과 및 시각적 반응 (Visual Effect)
              </h5>
              <div className="text-[10px] text-gray-300 space-y-2">
                <div><strong>• 깨끗한 60FPS 프레임 드랍 제로 녹화:</strong> 외부 화면 녹화 시 발생하는 버벅임이나 마우스 커서 방해 없이 캔버스 픽셀만을 선명하게 담아냅니다.</div>
                <div><strong>• 레이저 조각기 즉시 전송:</strong> 파티클 포인트 클라우드의 밀도에 따라 레이저 출력(PWM)이 조절되어 아크릴이나 목재 위에 점묘화 형태로 정밀 마킹됩니다.</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // ----------------------------------------------------
    // PAGE 19: 키보드 단축키 & 전체 기능 퀵 매핑 총람
    // ----------------------------------------------------
    {
      page: 19,
      title: '19. ⌨️ 키보드 단축키 & 전체 기능 퀵 매핑 총람',
      category: 'quick',
      subtitle: 'Complete Keyboard Shortcuts, Mouse Gestures & Quick Access Reference',
      content: (
        <div className="space-y-4">
          <div className="bg-[#141417] p-4 border border-[#2A2A2E] space-y-2">
            <h4 className="text-[#00F0FF] font-bold text-xs uppercase flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> 작업 효율을 극대화하는 프로 단축키 매핑
            </h4>
            <p className="text-[11px] text-gray-300">
              마우스 클릭 없이 키보드만으로 모든 재생, 카메라, 텍스트 로딩, 뷰포트 전환을 번개처럼 제어할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#00F0FF] font-bold text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> 글로벌 기본 단축키
              </h5>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">재생 / 일시정지 토글</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">Space</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">3D 카메라 자동 회전 (Turntable)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">R</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">전체화면 모드 (Fullscreen)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">F</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">전체 UI 숨김 / 표시 (Clean View)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">H</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">카메라 시점 원점 복구 (Reset)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">C</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">4K 투명 PNG 스냅샷 즉시 촬영</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">P</kbd>
                </div>
              </div>
            </div>

            <div className="bg-[#141417] p-3.5 border border-[#2A2A2E] space-y-2">
              <h5 className="text-[#FFE600] font-bold text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> 편집 및 히스토리 단축키
              </h5>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">텍스트 파티클 즉시 로딩</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#FFE600] border border-[#2A2A2E] font-bold">Ctrl + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">작업 실행 취소 (Undo)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-gray-200 border border-[#2A2A2E] font-bold">Ctrl + Z</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">작업 다시 실행 (Redo)</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-gray-200 border border-[#2A2A2E] font-bold">Ctrl + Y</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">시네마틱 프리셋 1~9 원클릭 호출</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#00F0FF] border border-[#2A2A2E] font-bold">1 ~ 9</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">출발/목표 형상 상호 스왑</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-gray-200 border border-[#2A2A2E] font-bold">S</kbd>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-[#0A0A0B] border border-[#2A2A2E]">
                  <span className="text-gray-300 font-bold">공식 사용설명서 열기</span>
                  <kbd className="px-2 py-0.5 bg-[#1E1E24] text-[#FF007F] border border-[#2A2A2E] font-bold">?</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ], []);

  const filteredPages = useMemo(() => {
    return manualPages.filter((item) => {
      const matchCat =
        activeCategory === 'all' ? true :
        item.category === activeCategory;
      
      const matchQuery =
        searchQuery.trim() === '' ? true :
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchQuery;
    });
  }, [manualPages, activeCategory, searchQuery]);

  const activePageData = manualPages.find((p) => p.page === currentPage) || manualPages[0];

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
                  TOTAL 19 PAGES
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

        {/* Quick Feature Jump Banner */}
        <div className="bg-[#141418] border-b border-[#2A2A2E] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> 주요 기능 바로가기:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(3)}
                className="px-2 py-0.5 bg-[#1E1E24] hover:bg-[#00F0FF] hover:text-black border border-[#2A2A2E] text-gray-300 text-[9px] transition cursor-pointer"
              >
                ✍️ 텍스트 정중앙&자동맞춤 (p.03)
              </button>
              <button
                onClick={() => setCurrentPage(6)}
                className="px-2 py-0.5 bg-[#1E1E24] hover:bg-[#FFE600] hover:text-black border border-[#2A2A2E] text-gray-300 text-[9px] transition cursor-pointer"
              >
                ⏱️ 타임라인 레이아웃 (p.06)
              </button>
              <button
                onClick={() => setCurrentPage(12)}
                className="px-2 py-0.5 bg-[#1E1E24] hover:bg-[#00F0FF] hover:text-black border border-[#2A2A2E] text-gray-300 text-[9px] transition cursor-pointer"
              >
                ✨ 순수 파티클 자동숨김 (p.12)
              </button>
              <button
                onClick={() => setCurrentPage(14)}
                className="px-2 py-0.5 bg-[#1E1E24] hover:bg-[#FF007F] hover:text-white border border-[#2A2A2E] text-gray-300 text-[9px] transition cursor-pointer"
              >
                🌌 3D 마우스 중력장 (p.14)
              </button>
              <button
                onClick={() => setCurrentPage(19)}
                className="px-2 py-0.5 bg-[#1E1E24] hover:bg-white hover:text-black border border-[#2A2A2E] text-gray-300 text-[9px] transition cursor-pointer"
              >
                ⌨️ 단축키 총람 (p.19)
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs & Search Bar */}
        <div className="px-4 sm:px-6 py-2 border-b border-[#2A2A2E] bg-[#0A0A0B] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'all' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              전체 (19P)
            </button>
            <button
              onClick={() => setActiveCategory('quick')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'quick' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              🚀 퀵 스타트 & UI
            </button>
            <button
              onClick={() => setActiveCategory('shapes')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'shapes' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              ✍️ 텍스트/형상
            </button>
            <button
              onClick={() => setActiveCategory('physics')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'physics' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              🌊 타임라인 & 물리
            </button>
            <button
              onClick={() => setActiveCategory('visual')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'visual' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              🎨 렌더/색상/잔상
            </button>
            <button
              onClick={() => setActiveCategory('export')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'export' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              💾 내보내기/HTML
            </button>
            <button
              onClick={() => setActiveCategory('interactive')}
              className={`px-2.5 py-1 uppercase font-bold border transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'interactive' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#141417] text-gray-400 border-[#2A2A2E]'
              }`}
            >
              🎮 인터랙션/오디오
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기능명, 조작법, 효과 검색..."
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
                    {(item.page === 3 || item.page === 6 || item.page === 12) && <span className="text-[#00F0FF] font-bold">★</span>}
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="text-[8px] text-gray-500 truncate">{item.subtitle}</div>
                </div>
                <span className={`text-[9px] px-1 py-0.2 font-mono flex-shrink-0 ${
                  item.page === 3 || item.page === 6 || item.page === 12 ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-[#1E1E24] text-gray-400'
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
                  PAGE {activePageData.page} OF 19 — OFFICIAL USER MANUAL
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
                  {currentPage} / 19
                </div>
                <button
                  disabled={currentPage >= 19}
                  onClick={() => setCurrentPage((p) => Math.min(19, p + 1))}
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
              <div className="flex items-center gap-1 flex-wrap">
                <span>페이지 이동:</span>
                {Array.from({ length: 19 }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-5 h-5 text-[9px] font-mono font-bold border transition cursor-pointer flex items-center justify-center ${
                      currentPage === pNum
                        ? 'bg-[#00F0FF] text-black border-[#00F0FF]'
                        : pNum === 3 || pNum === 6 || pNum === 12
                        ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/40 hover:bg-[#00F0FF] hover:text-black'
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
