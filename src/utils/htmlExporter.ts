import { MorphConfig, MorphShape } from '../types';
import { particleVertexShader, particleFragmentShader } from './shaders';

/**
 * Helper to serialize Float32Array to Base64
 */
function float32ToBase64(arr: Float32Array): string {
  const uint8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Generate full interactive Particle Morphing Studio HTML file
 * Includes real-time background color selector, full multi-stage waypoint morphing chain, and standalone download features.
 */
export function exportMorphToStandaloneHtml(
  sourceShape: MorphShape,
  targetShape: MorphShape,
  config: MorphConfig,
  allShapes: MorphShape[] = [],
  morphChain?: MorphShape[]
): string {
  const count = config.particleCount || 60000;
  const chain = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];

  // Serialize all shapes in the chain
  const chainPosB64List = chain.map((s) => float32ToBase64(s.positions.slice(0, count * 3)));
  const chainColB64List = chain.map((s) => float32ToBase64(s.colors.slice(0, count * 3)));
  const chainNames = chain.map((s) => s.name);

  // Generate random delay values
  const randDelays = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    randDelays[i] = Math.random();
  }
  const delaysB64 = float32ToBase64(randDelays);

  const noiseTypeInt =
    config.noiseType === 'simplex' ? 0 :
    config.noiseType === 'curl' ? 1 :
    config.noiseType === 'turbulence' ? 2 : 3;

  const delayModeInt =
    config.delayMode === 'random' ? 0 :
    config.delayMode === 'linear_y' ? 1 :
    config.delayMode === 'linear_x' ? 2 :
    config.delayMode === 'radial' ? 3 :
    config.delayMode === 'brightness' ? 4 : 0;

  const colorMixModeInt =
    config.colorMixMode === 'interpolate' ? 0 :
    config.colorMixMode === 'gradient' ? 1 :
    config.colorMixMode === 'velocity' ? 2 :
    config.colorMixMode === 'height' ? 3 :
    config.colorMixMode === 'radial' ? 4 :
    config.colorMixMode === 'additive_mix' ? 5 : 6;

  const colorModeInt =
    config.colorScheme === 'original' ? 0 :
    config.colorScheme === 'cyberpunk' ? 1 :
    config.colorScheme === 'fire' ? 2 :
    config.colorScheme === 'galaxy' ? 3 :
    config.colorScheme === 'emerald' ? 4 :
    config.colorScheme === 'sunset' ? 5 : 6;

  const particleTypeInt =
    config.particleType === 'circle' ? 0 :
    config.particleType === 'star' ? 1 :
    config.particleType === 'diamond' ? 2 :
    config.particleType === 'ring' ? 3 :
    config.particleType === 'hexagon' ? 4 :
    config.particleType === 'cube' ? 5 :
    config.particleType === 'cloud' ? 6 :
    config.particleType === 'bokeh' ? 7 :
    config.particleType === 'bird' ? 8 :
    config.particleType === 'feather' ? 9 : 10;

  const initialBgColor = config.backgroundColor || '#030712';

  // Escape shader strings
  const escapedVShader = JSON.stringify(particleVertexShader);
  const escapedFShader = JSON.stringify(particleFragmentShader);

  // Metadata JSON payload for lossless re-import & modification
  const metaJson = JSON.stringify({
    version: '3.5',
    sourceShapeId: sourceShape.id,
    sourceName: sourceShape.name,
    targetShapeId: targetShape.id,
    targetName: targetShape.name,
    chainNames: chainNames,
    numStages: chain.length,
    config: {
      ...config,
      backgroundColor: initialBgColor,
    },
    exportedAt: new Date().toISOString()
  });

  const chainTitle = chain.map(s => s.name.replace(/<[^>]*>/g, '')).join(' ➔ ');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Particle Morphing Studio - ${chainTitle}</title>
  <!-- Embedded Lossless Particle Morph State for In-App Editing -->
  <script id="particle-morph-meta" type="application/json">
${metaJson}
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-color: ${initialBgColor};
      --accent: #00F0FF;
      --accent-pink: #FF007F;
      --accent-yellow: #FFE600;
    }
    body {
      background-color: var(--bg-color);
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
      transition: background-color 0.3s ease;
    }
    #canvas-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    /* Floating Studio HUD Panels */
    .hud-panel {
      position: absolute;
      background: rgba(15, 15, 20, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 16px;
      z-index: 10;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      max-height: 92vh;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--accent) transparent;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .hud-panel::-webkit-scrollbar { width: 4px; }
    .hud-panel::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; }

    #main-controls {
      top: 20px;
      left: 20px;
      width: 330px;
    }

    #stage-indicator-banner {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      border-radius: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      pointer-events: none;
      background: rgba(10, 10, 14, 0.9);
      border: 1px solid rgba(0, 240, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      max-width: 90vw;
    }

    #bottom-timeline-dock {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 15, 20, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 15px 35px rgba(0,0,0,0.7);
    }

    /* Hidden UI State for Clean View */
    .hidden-ui {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(10px) !important;
    }

    #pure-mode-hint {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 11px;
      color: #94a3b8;
      z-index: 20;
      cursor: pointer;
      display: none;
    }

    h1 {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .subtitle {
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 8px;
      word-break: break-all;
    }

    .control-row { margin-bottom: 12px; }
    .control-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #cbd5e1;
      margin-bottom: 6px;
    }
    .control-val {
      font-family: monospace;
      color: var(--accent);
      font-weight: bold;
    }

    input[type=range] {
      width: 100%;
      height: 4px;
      background: #334155;
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: var(--accent);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 8px var(--accent);
    }

    .btn-group {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
    .btn {
      flex: 1;
      background: #1e293b;
      border: 1px solid #475569;
      color: #f8fafc;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .btn:hover {
      background: #334155;
      border-color: var(--accent);
      color: var(--accent);
    }
    .btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: #030712;
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
    }
    .btn-highlight {
      background: rgba(0, 240, 255, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }

    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    /* Color Selection Chips */
    .bg-color-chip {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }
    .bg-color-chip:hover {
      transform: scale(1.15);
    }
    .bg-color-chip.selected {
      border-color: var(--accent);
      box-shadow: 0 0 8px var(--accent);
      transform: scale(1.15);
    }

    /* Stage Steps Display */
    .stage-chain-row {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      font-size: 11px;
      white-space: nowrap;
    }
    .stage-node {
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .stage-node.active {
      background: rgba(0, 240, 255, 0.2);
      color: var(--accent);
      border: 1px solid var(--accent);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
    }
    .stage-node.holding {
      background: rgba(251, 191, 36, 0.25);
      color: #fbbf24;
      border: 1px solid #fbbf24;
      box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
      animation: pulse 1s infinite;
    }
    .stage-node.inactive {
      color: #64748b;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>

  <!-- Pure Particle Mode Floating Helper -->
  <div id="pure-mode-hint" onclick="toggleCleanParticleMode(false)">
    <span>✨ 순수 파티클 모드 활성 (H키 또는 더블클릭으로 UI 복원)</span>
  </div>

  <!-- Center Top Stage & Waypoint Indicator HUD Banner -->
  <div class="hud-panel" id="stage-indicator-banner">
    <div class="stage-chain-row" id="stage-chain-nodes">
      <!-- Injected via JS -->
    </div>
    <div id="hold-status-badge" style="display: none; font-size: 10px; font-weight: bold; color: #fbbf24; background: rgba(251, 191, 36, 0.15); border: 1px solid #fbbf24; padding: 2px 10px; border-radius: 10px; margin-top: 2px;">
      ⏱️ 1초간 정지 관찰 중
    </div>
  </div>

  <!-- Left Main Studio HUD Controls -->
  <div class="hud-panel" id="main-controls">
    <h1>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg>
      Particle Morphing Studio
    </h1>
    <div class="subtitle">${chainTitle}</div>

    <!-- 🎨 1. BACKGROUND COLOR SELECTION -->
    <div class="control-row">
      <div class="section-title">
        🎨 캔버스 배경색 지정 (Background Color)
      </div>
      <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
        <button class="bg-color-chip selected" style="background: #030712;" onclick="changeCanvasBg('#030712', this)" title="딥 스페이스 (#030712)"></button>
        <button class="bg-color-chip" style="background: #000000;" onclick="changeCanvasBg('#000000', this)" title="순수 블랙 (#000000)"></button>
        <button class="bg-color-chip" style="background: #0A0A0B;" onclick="changeCanvasBg('#0A0A0B', this)" title="흑요석 다크 (#0A0A0B)"></button>
        <button class="bg-color-chip" style="background: #0F172A;" onclick="changeCanvasBg('#0F172A', this)" title="미드나잇 네이비 (#0F172A)"></button>
        <button class="bg-color-chip" style="background: #18181B;" onclick="changeCanvasBg('#18181B', this)" title="차콜 징크 (#18181B)"></button>
        <button class="bg-color-chip" style="background: #FFFFFF;" onclick="changeCanvasBg('#FFFFFF', this)" title="퓨어 화이트 (#FFFFFF)"></button>
        <button class="bg-color-chip" style="background: #F1F5F9;" onclick="changeCanvasBg('#F1F5F9', this)" title="클린 라이트 (#F1F5F9)"></button>
        <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
          <input type="color" id="custom-bg-picker" value="${initialBgColor}" onchange="changeCanvasBg(this.value, null)" style="width: 24px; height: 24px; border: none; cursor: pointer; background: transparent;">
          <span id="bg-hex-display" style="font-family: monospace; font-size: 10px; color: var(--accent);">${initialBgColor}</span>
        </div>
      </div>
    </div>

    <!-- 💾 2. STANDALONE EXPORTERS (단독실행형 다운로드 & 순수 파티클 CMD) -->
    <div class="control-row" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); padding: 10px; border-radius: 8px; margin-bottom: 16px;">
      <div style="font-size: 11px; font-weight: bold; color: var(--accent); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        <span>✨ 단독실행형 다운로드 & UI 제어</span>
      </div>
      <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
        UI를 숨겨 순수 파티클만 감상하거나, 모든 경유지가 포함된 <strong>순수 파티클 HTML</strong> 또는 윈도우 원클릭 <strong>순수 파티클 CMD 파일 (.cmd)</strong>로 저장합니다.
      </div>
      <div class="btn-group" style="margin-bottom: 6px;">
        <button class="btn btn-highlight" onclick="toggleCleanParticleMode(true)" title="모든 UI를 숨기고 순수 3D 파티클 전체화면 감상 (단축키: H)">
          👁️ 순수 모드 (UI 숨김)
        </button>
        <button class="btn btn-highlight" onclick="exportPureParticleHtmlFile()" title="현재 모든 경유지/배경색이 적용된 순수 HTML로 저장">
          💾 순수 HTML 저장
        </button>
      </div>
      <button class="btn" style="width: 100%; background: rgba(255, 230, 0, 0.15); border-color: #FFE600; color: #FFE600; font-weight: bold; font-size: 10px; padding: 6px;" onclick="exportPureParticleCmdFile()" title="더블클릭 시 3D 파티클 뷰어를 즉시 브라우저에 띄우는 윈도우 단독실행 파일 (.cmd)">
        ⚡ 순수 파티클 CMD 내보내기 (.cmd)
      </button>
    </div>

    <!-- 3. TIMELINE & MORPH CONTROLS -->
    <div class="control-row">
      <div class="control-label">
        <span>전체 모핑 진행도 (Total Progress)</span>
        <span class="control-val" id="val-progress">${config.progress.toFixed(3)}</span>
      </div>
      <input type="range" id="slider-progress" min="0" max="1" step="0.001" value="${config.progress}">
    </div>

    <div class="control-row">
      <div class="btn-group">
        <button class="btn ${config.isPlaying ? 'active' : ''}" id="btn-play">
          <span id="play-icon">${config.isPlaying ? '❚❚' : '▶'}</span>
          <span id="play-text">${config.isPlaying ? '일시정지' : '재생'}</span>
        </button>
        <button class="btn" id="btn-reverse">⇄ 역방향</button>
        <button class="btn" id="btn-reset">↺ 초기화</button>
      </div>
    </div>

    <!-- 4. PHYSICS & NOISE -->
    <div class="section-title">🌊 유체 노이즈 & 시차 지연</div>
    <div class="control-row">
      <div class="control-label">
        <span>컬 노이즈 난류 강도 (Turbulence)</span>
        <span class="control-val" id="val-noise">${config.noiseAmp.toFixed(2)}</span>
      </div>
      <input type="range" id="slider-noise" min="0" max="6" step="0.05" value="${config.noiseAmp}">
    </div>

    <div class="control-row">
      <div class="control-label">
        <span>노이즈 주파수 (Noise Freq)</span>
        <span class="control-val" id="val-freq">${config.noiseFreq.toFixed(2)}</span>
      </div>
      <input type="range" id="slider-freq" min="0.1" max="3" step="0.05" value="${config.noiseFreq}">
    </div>

    <div class="control-row">
      <div class="control-label">
        <span>스태거 시차 지연 (Stagger Spread)</span>
        <span class="control-val" id="val-delay">${config.delaySpread.toFixed(2)}</span>
      </div>
      <input type="range" id="slider-delay" min="0" max="1" step="0.02" value="${config.delaySpread}">
    </div>

    <!-- 5. VISUALS -->
    <div class="section-title">✨ 파티클 크기 & 비주얼</div>
    <div class="control-row">
      <div class="control-label">
        <span>입자 포인트 크기 (Point Size)</span>
        <span class="control-val" id="val-size">${config.pointSize.toFixed(1)}</span>
      </div>
      <input type="range" id="slider-size" min="0.5" max="8" step="0.1" value="${config.pointSize}">
    </div>

    <div class="control-row">
      <div class="control-label">
        <span>발광 글로우 강도 (Glow)</span>
        <span class="control-val" id="val-glow">${config.glowIntensity.toFixed(1)}</span>
      </div>
      <input type="range" id="slider-glow" min="0" max="3" step="0.1" value="${config.glowIntensity}">
    </div>

    <div class="control-row">
      <div class="btn-group">
        <button class="btn ${config.trailsEnabled ? 'active' : ''}" id="btn-trail">
          <span>💫 고스트 궤적</span>
        </button>
        <button class="btn" id="btn-snapshot">
          <span>📷 스냅샷</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Floating Quick Timeline Dock -->
  <div class="hud-panel" id="bottom-timeline-dock">
    <button class="btn ${config.isPlaying ? 'active' : ''}" id="dock-btn-play" style="width: 32px; height: 32px; border-radius: 50%; padding: 0;">
      <span id="dock-play-icon">${config.isPlaying ? '❚❚' : '▶'}</span>
    </button>
    <div style="display: flex; align-items: center; gap: 8px; width: 220px;">
      <span style="font-size: 10px; color: #64748b; font-weight: bold;">0%</span>
      <input type="range" id="dock-slider-progress" min="0" max="1" step="0.001" value="${config.progress}" style="flex: 1;">
      <span style="font-size: 10px; color: var(--accent); font-family: monospace; font-weight: bold; width: 32px; text-align: right;" id="dock-val-progress">${Math.round(config.progress * 100)}%</span>
    </div>
    <div style="font-size: 10px; color: #94a3b8; font-family: monospace;" id="fps-counter">60 FPS</div>
  </div>

  <script>
    // --- Data Deserialization ---
    function base64ToFloat32(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return new Float32Array(bytes.buffer);
    }

    function hexToRgbVec3(hex) {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    }

    function applyMorphEasing(t, easing) {
      const clamped = Math.max(0, Math.min(1, t));
      switch (easing) {
        case 'linear':
          return clamped;
        case 'ease-in-out':
          return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
        case 'bounce': {
          const n1 = 7.5625;
          const d1 = 2.75;
          let x = clamped;
          if (x < 1 / d1) return n1 * x * x;
          else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
          else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
          else return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
        case 'elastic': {
          if (clamped === 0) return 0;
          if (clamped === 1) return 1;
          const c4 = (2 * Math.PI) / 3;
          return Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;
        }
        case 'cubic-in':
          return clamped * clamped * clamped;
        case 'cubic-out':
          return 1 - Math.pow(1 - clamped, 3);
        case 'back-out': {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
        }
        default:
          return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
      }
    }

    const chainPosB64List = ${JSON.stringify(chainPosB64List)};
    const chainColB64List = ${JSON.stringify(chainColB64List)};
    const chainNames = ${JSON.stringify(chainNames)};
    const chainLength = chainNames.length;
    const numSegments = Math.max(1, chainLength - 1);

    // Decode all chain position & color arrays
    const chainPositions = chainPosB64List.map(b64 => base64ToFloat32(b64));
    const chainColors = chainColB64List.map(b64 => base64ToFloat32(b64));
    const randVals = base64ToFloat32("${delaysB64}");

    let currentBgColor = "${initialBgColor}";

    // Build Stage Nodes UI
    const stageContainer = document.getElementById('stage-chain-nodes');
    function renderStageNodes(activeStationIndex, isHolding) {
      if (!stageContainer) return;
      let html = '<div style="width: 8px; height: 8px; border-radius: 50%; background: #00F0FF; margin-right: 4px;" class="pulse"></div>';
      for (let i = 0; i < chainLength; i++) {
        if (i > 0) {
          html += '<span style="color: #475569; font-family: monospace; font-size: 11px;">────▶</span>';
        }
        let tag = i === 0 ? '[출발]' : i === chainLength - 1 ? '[목표]' : '[경유' + i + ']';
        let cls = 'stage-node ' + (i === activeStationIndex ? (isHolding ? 'holding' : 'active') : 'inactive');
        html += '<span class="' + cls + '">' + tag + ' ' + chainNames[i] + '</span>';
      }
      stageContainer.innerHTML = html;

      const holdBadge = document.getElementById('hold-status-badge');
      if (holdBadge) {
        if (isHolding) {
          holdBadge.style.display = 'block';
          holdBadge.textContent = '⏱️ 1초간 정지 관찰 중: ' + chainNames[activeStationIndex];
        } else {
          holdBadge.style.display = 'none';
        }
      }
    }
    renderStageNodes(0, false);

    // --- Scene Setup ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const bgThreeCol = new THREE.Color(currentBgColor);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(bgThreeCol, 1);
    renderer.autoClear = true;
    container.appendChild(renderer.domElement);

    // Fade Scene for Ghost Trails
    const fadeScene = new THREE.Scene();
    const fadeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fadeMaterial = new THREE.MeshBasicMaterial({
      color: bgThreeCol,
      transparent: true,
      opacity: 0.15,
      depthTest: false,
      depthWrite: false,
    });
    const fadePlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMaterial);
    fadeScene.add(fadePlane);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 3;

    // --- Geometry & Shader Material ---
    const initialSrcPos = chainPositions[0];
    const initialSrcCol = chainColors[0];
    const initialDstPos = chainPositions[1] || chainPositions[0];
    const initialDstCol = chainColors[1] || chainColors[0];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(initialSrcPos.slice(), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(initialSrcCol.slice(), 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(initialSrcCol.slice(), 3));
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(initialDstPos.slice(), 3));
    geometry.setAttribute('aTargetColor', new THREE.BufferAttribute(initialDstCol.slice(), 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randVals, 1));
    geometry.setAttribute('aDelayVal', new THREE.BufferAttribute(randVals, 1));

    const uniforms = {
      uProgress: { value: ${config.progress} },
      uTime: { value: 0.0 },
      uNoiseAmp: { value: ${config.noiseAmp} },
      uNoiseFreq: { value: ${config.noiseFreq} },
      uNoiseSpeed: { value: ${config.noiseSpeed} },
      uDelaySpread: { value: ${config.delaySpread} },
      uNoiseType: { value: ${noiseTypeInt} },
      uDelayMode: { value: ${delayModeInt} },
      uPointSize: { value: ${config.pointSize} },
      uColorMixMode: { value: ${colorMixModeInt} },
      uColorMode: { value: ${colorModeInt} },
      uColorA: { value: hexToRgbVec3("${config.colorA || '#00F0FF'}") },
      uColorB: { value: hexToRgbVec3("${config.colorB || '#FF007F'}") },
      uColorC: { value: hexToRgbVec3("${config.colorC || '#FFE600'}") },
      uColorMixRatio: { value: ${config.colorMixRatio ?? 0.5} },
      uVelocityShift: { value: ${config.velocityColorShift ?? 1.0} },
      uColorGamma: { value: ${config.colorGamma ?? 1.0} },
      uGlowIntensity: { value: ${config.glowIntensity} },
      uParticleType: { value: ${particleTypeInt} },
      uShapeRotation: { value: ${((config.shapeRotation || 0) * Math.PI) / 180} },
      uCoreRatio: { value: ${config.coreRatio ?? 0.8} }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: ${escapedVShader},
      fragmentShader: ${escapedFShader},
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Dynamic Multi-Stage Segment Switcher ---
    let activeSegment = 0;
    function switchSegment(segIndex) {
      if (segIndex < 0 || segIndex >= numSegments) return;
      activeSegment = segIndex;

      const srcPos = chainPositions[segIndex];
      const srcCol = chainColors[segIndex];
      const dstPos = chainPositions[segIndex + 1];
      const dstCol = chainColors[segIndex + 1];

      const posAttr = geometry.getAttribute('position');
      const colAttr = geometry.getAttribute('color');
      const aColorAttr = geometry.getAttribute('aColor');
      const aTargetAttr = geometry.getAttribute('aTarget');
      const aTargetColorAttr = geometry.getAttribute('aTargetColor');

      posAttr.array.set(srcPos);
      posAttr.needsUpdate = true;

      colAttr.array.set(srcCol);
      colAttr.needsUpdate = true;

      aColorAttr.array.set(srcCol);
      aColorAttr.needsUpdate = true;

      aTargetAttr.array.set(dstPos);
      aTargetAttr.needsUpdate = true;

      aTargetColorAttr.array.set(dstCol);
      aTargetColorAttr.needsUpdate = true;
    }

    // --- Background Color Handler ---
    window.changeCanvasBg = function(hex, btnEl) {
      currentBgColor = hex;
      document.documentElement.style.setProperty('--bg-color', hex);
      document.body.style.backgroundColor = hex;
      
      const c = new THREE.Color(hex);
      renderer.setClearColor(c, 1);
      fadeMaterial.color.copy(c);

      const hexDisplay = document.getElementById('bg-hex-display');
      if (hexDisplay) hexDisplay.textContent = hex.toUpperCase();
      const picker = document.getElementById('custom-bg-picker');
      if (picker && picker.value !== hex) picker.value = hex;

      document.querySelectorAll('.bg-color-chip').forEach(el => el.classList.remove('selected'));
      if (btnEl) btnEl.classList.add('selected');
    };

    // --- UI Hide / Show (Clean Mode) ---
    let isCleanMode = false;
    window.toggleCleanParticleMode = function(clean) {
      isCleanMode = clean !== undefined ? clean : !isCleanMode;
      const panels = document.querySelectorAll('.hud-panel');
      panels.forEach(p => p.classList.toggle('hidden-ui', isCleanMode));
      const hint = document.getElementById('pure-mode-hint');
      if (hint) {
        hint.style.display = isCleanMode ? 'flex' : 'none';
        if (isCleanMode) {
          setTimeout(() => {
            if (isCleanMode) hint.style.display = 'none';
          }, 3500);
        }
      }
    };

    // Keyboard Shortcuts: H (Toggle UI), Space (Play/Pause)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        toggleCleanParticleMode();
      } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        isPlaying = !isPlaying;
        updatePlayBtn();
      }
    });

    window.addEventListener('dblclick', (e) => {
      if (e.target.tagName === 'CANVAS' || e.target.id === 'canvas-container') {
        toggleCleanParticleMode();
      }
    });

    // --- Export Pure HTML with Full Waypoint Chain ---
    window.exportPureParticleHtmlFile = function() {
      try {
        const pureHtml = exportPureHtmlString();
        const blob = new Blob([pureHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
        link.href = url;
        link.download = "pure_particles_chain_" + currentBgColor.replace('#', '') + "_" + timestamp + ".html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('순수 파티클 HTML 생성 중 오류: ' + err);
      }
    };

    // --- Export Pure Standalone CMD Launcher with Full Waypoint Chain ---
    window.exportPureParticleCmdFile = function() {
      try {
        const pureHtml = exportPureHtmlString();
        const utf8Bytes = new TextEncoder().encode(pureHtml);
        let binary = '';
        for (let i = 0; i < utf8Bytes.byteLength; i++) {
          binary += String.fromCharCode(utf8Bytes[i]);
        }
        const b64 = btoa(binary);

        const cmdScript = "@echo off\\r\\n" +
          "@chcp 65001 > nul\\r\\n" +
          "setlocal enabledelayedexpansion\\r\\n" +
          "title 3D Particle Morphing Pure Viewer - Standalone CMD\\r\\n\\r\\n" +
          "echo ===============================================================================\\r\\n" +
          "echo     3D PARTICLE MORPHING PURE VIEWER (STANDALONE CMD LAUNCHER)\\r\\n" +
          "echo ===============================================================================\\r\\n" +
          "echo   Status : Extracting hardware-accelerated 3D WebGL particle engine...\\r\\n" +
          "echo ===============================================================================\\r\\n\\r\\n" +
          'set "TEMP_DIR=%TEMP%\\\\ParticleMorph"\\r\\n' +
          'if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"\\r\\n' +
          'set "VIEWER_FILE=%TEMP_DIR%\\\\pure_particle_morph_%RANDOM%_%TIME:~6,2%.html"\\r\\n\\r\\n' +
          'powershell -NoProfile -ExecutionPolicy Bypass -Command "$b64 = \'' + b64 + '\'; $bytes = [System.Convert]::FromBase64String($b64); [System.IO.File]::WriteAllBytes(\'%VIEWER_FILE%\', $bytes);"\\r\\n\\r\\n' +
          'if exist "%VIEWER_FILE%" (\\r\\n' +
          '    echo [OK] Pure 3D Particle Viewer extracted successfully!\\r\\n' +
          '    echo [OK] Launching 3D Viewer in your default web browser...\\r\\n' +
          '    start "" "%VIEWER_FILE%"\\r\\n' +
          '    echo.\\r\\n' +
          '    echo ===============================================================================\\r\\n' +
          '    echo   Viewer is running in your browser!\\r\\n' +
          '    echo   This command window will close automatically in 3 seconds.\\r\\n' +
          '    echo ===============================================================================\\r\\n' +
          '    timeout /t 3 > nul\\r\\n' +
          ') else (\\r\\n' +
          '    echo [ERROR] Failed to extract standalone 3D particle viewer file.\\r\\n' +
          '    pause\\r\\n' +
          ')\\r\\n\\r\\n' +
          'endlocal\\r\\n' +
          'exit /b 0\\r\\n';

        const blob = new Blob([cmdScript], { type: 'application/cmd;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
        link.href = url;
        link.download = "pure_particles_chain_" + currentBgColor.replace('#', '') + "_" + timestamp + ".cmd";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert('순수 파티클 CMD 생성 중 오류: ' + err);
      }
    };

    function exportPureHtmlString() {
      const curPointSize = uniforms.uPointSize.value;
      const curParticleType = uniforms.uParticleType.value;
      const curColorMix = uniforms.uColorMixMode.value;

      return '<!DOCTYPE html>\\n' +
'<html lang="ko">\\n' +
'<head>\\n' +
'  <meta charset="UTF-8">\\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\\n' +
'  <title>Pure Particle Scene - ' + ${JSON.stringify(chainTitle)} + '</title>\\n' +
'  <style>\\n' +
'    * { box-sizing: border-box; margin: 0; padding: 0; }\\n' +
'    body {\\n' +
'      background-color: ' + currentBgColor + ';\\n' +
'      overflow: hidden;\\n' +
'      width: 100vw;\\n' +
'      height: 100vh;\\n' +
'      user-select: none;\\n' +
'      cursor: grab;\\n' +
'    }\\n' +
'    body:active { cursor: grabbing; }\\n' +
'    #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }\\n' +
'    #minimal-helper {\\n' +
'      position: absolute;\\n' +
'      bottom: 20px;\\n' +
'      left: 50%;\\n' +
'      transform: translateX(-50%);\\n' +
'      background: rgba(10, 10, 14, 0.85);\\n' +
'      backdrop-filter: blur(12px);\\n' +
'      border: 1px solid rgba(255, 255, 255, 0.15);\\n' +
'      border-radius: 30px;\\n' +
'      padding: 8px 18px;\\n' +
'      color: #94a3b8;\\n' +
'      font-family: monospace;\\n' +
'      font-size: 11px;\\n' +
'      display: flex;\\n' +
'      align-items: center;\\n' +
'      gap: 12px;\\n' +
'      z-index: 10;\\n' +
'    }\\n' +
'    .helper-btn {\\n' +
'      background: rgba(255, 255, 255, 0.1);\\n' +
'      border: 1px solid rgba(255, 255, 255, 0.2);\\n' +
'      color: #00F0FF;\\n' +
'      padding: 3px 10px;\\n' +
'      border-radius: 12px;\\n' +
'      cursor: pointer;\\n' +
'      font-weight: bold;\\n' +
'    }\\n' +
'  </style>\\n' +
'  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\\/script>\\n' +
'  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"><\\/script>\\n' +
'</head>\\n' +
'<body>\\n' +
'  <div id="canvas-container"></div>\\n' +
'  <div id="minimal-helper">\\n' +
'    <span id="stage-status-text">✨ Pure Multi-Stage Particle Scene</span>\\n' +
'    <button class="helper-btn" onclick="togglePlay()">⏯️ <span id="pure-play-btn">Pause</span></button>\\n' +
'    <button class="helper-btn" onclick="toggleAutoRotate()">🔄 Rotate</button>\\n' +
'  </div>\\n' +
'  <script>\\n' +
'    function base64ToFloat32(b64) {\\n' +
'      const bin = atob(b64);\\n' +
'      const bytes = new Uint8Array(bin.length);\\n' +
'      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);\\n' +
'      return new Float32Array(bytes.buffer);\\n' +
'    }\\n' +
'    function hexToRgbVec3(hex) {\\n' +
'      const c = new THREE.Color(hex);\\n' +
'      return new THREE.Vector3(c.r, c.g, c.b);\\n' +
'    }\\n\\n' +
'    function applyMorphEasing(t, easing) {\\n' +
'      const clamped = Math.max(0, Math.min(1, t));\\n' +
'      switch (easing) {\\n' +
'        case "linear": return clamped;\\n' +
'        case "ease-in-out": return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;\\n' +
'        case "bounce": {\\n' +
'          const n1 = 7.5625, d1 = 2.75;\\n' +
'          let x = clamped;\\n' +
'          if (x < 1 / d1) return n1 * x * x;\\n' +
'          else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;\\n' +
'          else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;\\n' +
'          else return n1 * (x -= 2.625 / d1) * x + 0.984375;\\n' +
'        }\\n' +
'        case "elastic": {\\n' +
'          if (clamped === 0) return 0; if (clamped === 1) return 1;\\n' +
'          const c4 = (2 * Math.PI) / 3;\\n' +
'          return Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;\\n' +
'        }\\n' +
'        case "cubic-in": return clamped * clamped * clamped;\\n' +
'        case "cubic-out": return 1 - Math.pow(1 - clamped, 3);\\n' +
'        case "back-out": {\\n' +
'          const c1 = 1.70158, c3 = c1 + 1;\\n' +
'          return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);\\n' +
'        }\\n' +
'        default: return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;\\n' +
'      }\\n' +
'    }\\n\\n' +
'    const chainPosB64List = ' + JSON.stringify(chainPosB64List) + ';\\n' +
'    const chainColB64List = ' + JSON.stringify(chainColB64List) + ';\\n' +
'    const chainNames = ' + JSON.stringify(chainNames) + ';\\n' +
'    const chainLength = chainNames.length;\\n' +
'    const numSegments = Math.max(1, chainLength - 1);\\n' +
'    const chainPositions = chainPosB64List.map(b => base64ToFloat32(b));\\n' +
'    const chainColors = chainColB64List.map(b => base64ToFloat32(b));\\n' +
'    const randVals = base64ToFloat32("' + delaysB64 + '");\\n\\n' +
'    const scene = new THREE.Scene();\\n' +
'    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);\\n' +
'    camera.position.set(0, 0, 15);\\n' +
'    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });\\n' +
'    renderer.setSize(window.innerWidth, window.innerHeight);\\n' +
'    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));\\n' +
'    renderer.setClearColor(new THREE.Color("' + currentBgColor + '"), 1);\\n' +
'    document.getElementById("canvas-container").appendChild(renderer.domElement);\\n' +
'    const controls = new THREE.OrbitControls(camera, renderer.domElement);\\n' +
'    controls.enableDamping = true;\\n' +
'    controls.dampingFactor = 0.05;\\n\\n' +
'    const geometry = new THREE.BufferGeometry();\\n' +
'    geometry.setAttribute("position", new THREE.BufferAttribute(chainPositions[0].slice(), 3));\\n' +
'    geometry.setAttribute("color", new THREE.BufferAttribute(chainColors[0].slice(), 3));\\n' +
'    geometry.setAttribute("aColor", new THREE.BufferAttribute(chainColors[0].slice(), 3));\\n' +
'    geometry.setAttribute("aTarget", new THREE.BufferAttribute((chainPositions[1] || chainPositions[0]).slice(), 3));\\n' +
'    geometry.setAttribute("aTargetColor", new THREE.BufferAttribute((chainColors[1] || chainColors[0]).slice(), 3));\\n' +
'    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randVals, 1));\\n' +
'    geometry.setAttribute("aDelayVal", new THREE.BufferAttribute(randVals, 1));\\n\\n' +
'    const uniforms = {\\n' +
'      uProgress: { value: 0.0 },\\n' +
'      uTime: { value: 0.0 },\\n' +
'      uNoiseAmp: { value: ' + config.noiseAmp + ' },\\n' +
'      uNoiseFreq: { value: ' + config.noiseFreq + ' },\\n' +
'      uNoiseSpeed: { value: ' + config.noiseSpeed + ' },\\n' +
'      uDelaySpread: { value: ' + config.delaySpread + ' },\\n' +
'      uNoiseType: { value: ' + noiseTypeInt + ' },\\n' +
'      uDelayMode: { value: ' + delayModeInt + ' },\\n' +
'      uPointSize: { value: ' + curPointSize + ' },\\n' +
'      uColorMixMode: { value: ' + curColorMix + ' },\\n' +
'      uColorMode: { value: ' + colorModeInt + ' },\\n' +
'      uColorA: { value: hexToRgbVec3("' + (config.colorA || '#00F0FF') + '") },\\n' +
'      uColorB: { value: hexToRgbVec3("' + (config.colorB || '#FF007F') + '") },\\n' +
'      uColorC: { value: hexToRgbVec3("' + (config.colorC || '#FFE600') + '") },\\n' +
'      uColorMixRatio: { value: ' + (config.colorMixRatio ?? 0.5) + ' },\\n' +
'      uVelocityShift: { value: ' + (config.velocityColorShift ?? 1.0) + ' },\\n' +
'      uColorGamma: { value: ' + (config.colorGamma ?? 1.0) + ' },\\n' +
'      uGlowIntensity: { value: ' + config.glowIntensity + ' },\\n' +
'      uParticleType: { value: ' + curParticleType + ' },\\n' +
'      uShapeRotation: { value: 0.0 },\\n' +
'      uCoreRatio: { value: ' + (config.coreRatio ?? 0.8) + ' }\\n' +
'    };\\n\\n' +
'    const material = new THREE.ShaderMaterial({\\n' +
'      vertexShader: ' + escapedVShader + ',\\n' +
'      fragmentShader: ' + escapedFShader + ',\\n' +
'      uniforms: uniforms,\\n' +
'      transparent: true,\\n' +
'      depthWrite: false,\\n' +
'      blending: THREE.AdditiveBlending\\n' +
'    });\\n' +
'    const particles = new THREE.Points(geometry, material);\\n' +
'    scene.add(particles);\\n\\n' +
'    let isPlaying = true;\\n' +
'    let autoRotate = true;\\n' +
'    let playDirection = 1;\\n' +
'    let curProgress = 0;\\n' +
'    let holdTimer = 0;\\n' +
'    let lastHeldStation = -1;\\n' +
'    let activeSegment = 0;\\n' +
'    const playSpeed = ' + (config.playSpeed || 0.8) + ';\\n\\n' +
'    function switchSegment(seg) {\\n' +
'      if (seg < 0 || seg >= numSegments) return;\\n' +
'      activeSegment = seg;\\n' +
'      geometry.getAttribute("position").array.set(chainPositions[seg]);\\n' +
'      geometry.getAttribute("position").needsUpdate = true;\\n' +
'      geometry.getAttribute("color").array.set(chainColors[seg]);\\n' +
'      geometry.getAttribute("color").needsUpdate = true;\\n' +
'      geometry.getAttribute("aColor").array.set(chainColors[seg]);\\n' +
'      geometry.getAttribute("aColor").needsUpdate = true;\\n' +
'      geometry.getAttribute("aTarget").array.set(chainPositions[seg + 1]);\\n' +
'      geometry.getAttribute("aTarget").needsUpdate = true;\\n' +
'      geometry.getAttribute("aTargetColor").array.set(chainColors[seg + 1]);\\n' +
'      geometry.getAttribute("aTargetColor").needsUpdate = true;\\n' +
'    }\\n\\n' +
'    window.togglePlay = function() {\\n' +
'      isPlaying = !isPlaying;\\n' +
'      document.getElementById("pure-play-btn").textContent = isPlaying ? "Pause" : "Play";\\n' +
'    };\\n' +
'    window.toggleAutoRotate = function() { autoRotate = !autoRotate; };\\n' +
'    window.addEventListener("resize", () => {\\n' +
'      camera.aspect = window.innerWidth / window.innerHeight;\\n' +
'      camera.updateProjectionMatrix();\\n' +
'      renderer.setSize(window.innerWidth, window.innerHeight);\\n' +
'    });\\n\\n' +
'    const clock = new THREE.Clock();\\n' +
'    function animate() {\\n' +
'      requestAnimationFrame(animate);\\n' +
'      const dt = clock.getDelta();\\n' +
'      const time = clock.getElapsedTime();\\n' +
'      uniforms.uTime.value = time;\\n\\n' +
'      if (holdTimer > 0) {\\n' +
'        holdTimer -= dt;\\n' +
'      } else if (isPlaying) {\\n' +
'        const effectiveSpeed = 0.5 * (1.0 / numSegments);\\n' +
'        const step = dt * playSpeed * effectiveSpeed * playDirection;\\n' +
'        const prevP = curProgress;\\n' +
'        let nextP = prevP + step;\\n\\n' +
'        let triggered = -1;\\n' +
'        for (let i = 0; i <= numSegments; i++) {\\n' +
'          const stP = i / numSegments;\\n' +
'          const passed = playDirection > 0 ? (prevP < stP && nextP >= stP) : (prevP > stP && nextP <= stP);\\n' +
'          if (passed && lastHeldStation !== i) { triggered = i; break; }\\n' +
'        }\\n\\n' +
'        if (triggered >= 0) {\\n' +
'          nextP = triggered / numSegments;\\n' +
'          holdTimer = 1.0;\\n' +
'          lastHeldStation = triggered;\\n' +
'          const statusEl = document.getElementById("stage-status-text");\\n' +
'          if (statusEl) statusEl.textContent = "⏱️ 1초간 정지: " + chainNames[triggered];\\n' +
'        } else {\\n' +
'          const curSegIdx = Math.min(Math.floor(nextP * numSegments), numSegments - 1);\\n' +
'          const statusEl = document.getElementById("stage-status-text");\\n' +
'          if (statusEl) statusEl.textContent = "✨ [" + (curSegIdx + 1) + "/" + numSegments + " Stage] " + chainNames[curSegIdx] + " ➔ " + chainNames[curSegIdx + 1];\\n' +
'        }\\n\\n' +
'        if (nextP >= 1.0) { nextP = 1.0; playDirection = -1; }\\n' +
'        else if (nextP <= 0.0) { nextP = 0.0; playDirection = 1; }\\n' +
'        curProgress = nextP;\\n' +
'      }\\n\\n' +
'      const clamped = Math.max(0, Math.min(0.999999, curProgress));\\n' +
'      const scaled = clamped * numSegments;\\n' +
'      const seg = Math.min(Math.floor(scaled), numSegments - 1);\\n' +
'      const local = scaled - seg;\\n' +
'      if (activeSegment !== seg) switchSegment(seg);\\n' +
'      uniforms.uProgress.value = applyMorphEasing(local, "' + (config.morphEasing || 'ease-in-out') + '");\\n\\n' +
'      if (autoRotate) {\\n' +
'        particles.rotation.y = time * 0.08;\\n' +
'        particles.rotation.x = Math.sin(time * 0.05) * 0.04;\\n' +
'      }\\n' +
'      controls.update();\\n' +
'      renderer.render(scene, camera);\\n' +
'    }\\n' +
'    animate();\\n' +
'  <\\/script>\\n' +
'</body>\\n' +
'</html>';
    }

    // --- UI Interactions & State ---
    let isPlaying = ${config.isPlaying};
    let playSpeed = ${config.playSpeed};
    let playDirection = 1;
    let autoRotate = true;
    let trailsEnabled = ${config.trailsEnabled ? 'true' : 'false'};
    let trailLength = ${config.trailLength ?? 0.85};
    let curTotalProgress = ${config.progress};
    let holdTimer = 0;
    let lastHeldStation = -1;

    const sliderProgress = document.getElementById('slider-progress');
    const dockSliderProgress = document.getElementById('dock-slider-progress');
    const valProgress = document.getElementById('val-progress');
    const dockValProgress = document.getElementById('dock-val-progress');
    const btnPlay = document.getElementById('btn-play');
    const dockBtnPlay = document.getElementById('dock-btn-play');
    const playIcon = document.getElementById('play-icon');
    const dockPlayIcon = document.getElementById('dock-play-icon');
    const playText = document.getElementById('play-text');
    const btnReverse = document.getElementById('btn-reverse');
    const btnReset = document.getElementById('btn-reset');
    const btnTrail = document.getElementById('btn-trail');
    const fpsVal = document.getElementById('fps-counter');

    function updateProgress(p) {
      curTotalProgress = Math.max(0, Math.min(1, p));
      sliderProgress.value = curTotalProgress;
      if (dockSliderProgress) dockSliderProgress.value = curTotalProgress;
      valProgress.textContent = curTotalProgress.toFixed(3);
      if (dockValProgress) dockValProgress.textContent = Math.round(curTotalProgress * 100) + '%';

      // Multi-stage local progress & segment calculation
      const clamped = Math.max(0, Math.min(0.999999, curTotalProgress));
      const scaled = clamped * numSegments;
      const seg = Math.min(Math.floor(scaled), numSegments - 1);
      const local = scaled - seg;

      if (activeSegment !== seg) {
        switchSegment(seg);
      }
      uniforms.uProgress.value = applyMorphEasing(local, "${config.morphEasing || 'ease-in-out'}");

      // Update stage UI nodes
      const activeNodeIndex = Math.min(Math.round(curTotalProgress * numSegments), chainLength - 1);
      renderStageNodes(activeNodeIndex, holdTimer > 0);
    }

    sliderProgress.addEventListener('input', (e) => {
      isPlaying = false;
      holdTimer = 0;
      lastHeldStation = -1;
      updatePlayBtn();
      updateProgress(parseFloat(e.target.value));
    });

    if (dockSliderProgress) {
      dockSliderProgress.addEventListener('input', (e) => {
        isPlaying = false;
        holdTimer = 0;
        lastHeldStation = -1;
        updatePlayBtn();
        updateProgress(parseFloat(e.target.value));
      });
    }

    function updatePlayBtn() {
      if (isPlaying) {
        btnPlay.classList.add('active');
        playIcon.textContent = '❚❚';
        playText.textContent = '일시정지';
        if (dockBtnPlay) {
          dockBtnPlay.classList.add('active');
          dockPlayIcon.textContent = '❚❚';
        }
      } else {
        btnPlay.classList.remove('active');
        playIcon.textContent = '▶';
        playText.textContent = '재생';
        if (dockBtnPlay) {
          dockBtnPlay.classList.remove('active');
          dockPlayIcon.textContent = '▶';
        }
      }
    }

    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updatePlayBtn();
    });

    if (dockBtnPlay) {
      dockBtnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        updatePlayBtn();
      });
    }

    btnReverse.addEventListener('click', () => {
      playDirection *= -1;
      holdTimer = 0;
    });

    btnReset.addEventListener('click', () => {
      updateProgress(0);
      playDirection = 1;
      holdTimer = 0;
      lastHeldStation = -1;
    });

    // Sliders
    document.getElementById('slider-noise').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      uniforms.uNoiseAmp.value = v;
      document.getElementById('val-noise').textContent = v.toFixed(2);
    });

    document.getElementById('slider-freq').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      uniforms.uNoiseFreq.value = v;
      document.getElementById('val-freq').textContent = v.toFixed(2);
    });

    document.getElementById('slider-delay').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      uniforms.uDelaySpread.value = v;
      document.getElementById('val-delay').textContent = v.toFixed(2);
    });

    document.getElementById('slider-size').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      uniforms.uPointSize.value = v;
      document.getElementById('val-size').textContent = v.toFixed(1);
    });

    document.getElementById('slider-glow').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      uniforms.uGlowIntensity.value = v;
      document.getElementById('val-glow').textContent = v.toFixed(1);
    });

    btnTrail.addEventListener('click', () => {
      trailsEnabled = !trailsEnabled;
      btnTrail.classList.toggle('active', trailsEnabled);
      if (!trailsEnabled) {
        renderer.clear();
      }
    });

    document.getElementById('btn-snapshot').addEventListener('click', () => {
      try {
        const dataUrl = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
        link.href = dataUrl;
        link.download = "particle_morph_snapshot_" + timestamp + ".png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error('Snapshot failed', e);
      }
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Main Render Loop with Multi-stage 1.0s Pause ---
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsUpdate = 0;

    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      frameCount++;
      if (time - lastFpsUpdate >= 0.5) {
        const curFps = Math.round(frameCount / (time - lastFpsUpdate));
        if (fpsVal) fpsVal.textContent = curFps + " FPS";
        frameCount = 0;
        lastFpsUpdate = time;
      }

      uniforms.uTime.value = time;

      // Multi-stage Morph Animation Loop with 1.0s Stop at Waypoints
      if (holdTimer > 0) {
        holdTimer -= dt;
        if (holdTimer <= 0) {
          holdTimer = 0;
          renderStageNodes(Math.min(Math.round(curTotalProgress * numSegments), chainLength - 1), false);
        }
      } else if (isPlaying) {
        const effectiveSpeed = 0.5 * (1.0 / numSegments);
        const step = dt * playSpeed * effectiveSpeed * playDirection;
        const prevP = curTotalProgress;
        let nextP = prevP + step;

        let triggeredStation = -1;
        for (let i = 0; i <= numSegments; i++) {
          const stP = i / numSegments;
          const passed = playDirection > 0 ? (prevP < stP && nextP >= stP) : (prevP > stP && nextP <= stP);
          if (passed && lastHeldStation !== i) {
            triggeredStation = i;
            break;
          }
        }

        if (triggeredStation >= 0) {
          nextP = triggeredStation / numSegments;
          holdTimer = 1.0;
          lastHeldStation = triggeredStation;
          renderStageNodes(triggeredStation, true);
        }

        if (nextP >= 1.0) {
          nextP = 1.0;
          playDirection = -1; // Ping-pong
        } else if (nextP <= 0.0) {
          nextP = 0.0;
          playDirection = 1;
        }

        updateProgress(nextP);
      }

      if (autoRotate) {
        particles.rotation.y = time * 0.08;
        particles.rotation.x = Math.sin(time * 0.05) * 0.05;
      }

      controls.update();

      if (trailsEnabled) {
        renderer.autoClearColor = false;
        const decayAlpha = Math.max(0.02, Math.min(0.95, 1.0 - trailLength));
        fadeMaterial.opacity = decayAlpha;
        renderer.render(fadeScene, fadeCamera);
        renderer.clearDepth();
        renderer.render(scene, camera);
      } else {
        renderer.autoClearColor = true;
        renderer.render(scene, camera);
      }
    }

    animate();
  </script>
</body>
</html>`;
}

/**
 * Directly generate a pure, clean standalone HTML file with NO HUD overlays
 * Supports complete multi-stage morphing chain (Source -> Waypoints -> Target)
 */
export function exportPureParticleHtml(
  sourceShape: MorphShape,
  targetShape: MorphShape,
  config: MorphConfig,
  customBgColor?: string,
  morphChain?: MorphShape[]
): string {
  const count = config.particleCount || 60000;
  const chain = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];

  const chainPosB64List = chain.map((s) => float32ToBase64(s.positions.slice(0, count * 3)));
  const chainColB64List = chain.map((s) => float32ToBase64(s.colors.slice(0, count * 3)));
  const chainNames = chain.map((s) => s.name);

  const randDelays = new Float32Array(count);
  for (let i = 0; i < count; i++) randDelays[i] = Math.random();
  const delaysB64 = float32ToBase64(randDelays);

  const noiseTypeInt =
    config.noiseType === 'simplex' ? 0 :
    config.noiseType === 'curl' ? 1 :
    config.noiseType === 'turbulence' ? 2 : 3;

  const delayModeInt =
    config.delayMode === 'random' ? 0 :
    config.delayMode === 'linear_y' ? 1 :
    config.delayMode === 'linear_x' ? 2 :
    config.delayMode === 'radial' ? 3 :
    config.delayMode === 'brightness' ? 4 : 0;

  const colorMixModeInt =
    config.colorMixMode === 'interpolate' ? 0 :
    config.colorMixMode === 'gradient' ? 1 :
    config.colorMixMode === 'velocity' ? 2 :
    config.colorMixMode === 'height' ? 3 :
    config.colorMixMode === 'radial' ? 4 :
    config.colorMixMode === 'additive_mix' ? 5 : 6;

  const colorModeInt =
    config.colorScheme === 'original' ? 0 :
    config.colorScheme === 'cyberpunk' ? 1 :
    config.colorScheme === 'fire' ? 2 :
    config.colorScheme === 'galaxy' ? 3 :
    config.colorScheme === 'emerald' ? 4 :
    config.colorScheme === 'sunset' ? 5 : 6;

  const particleTypeInt =
    config.particleType === 'circle' ? 0 :
    config.particleType === 'star' ? 1 :
    config.particleType === 'diamond' ? 2 :
    config.particleType === 'ring' ? 3 :
    config.particleType === 'hexagon' ? 4 :
    config.particleType === 'cube' ? 5 :
    config.particleType === 'cloud' ? 6 :
    config.particleType === 'bokeh' ? 7 :
    config.particleType === 'bird' ? 8 :
    config.particleType === 'feather' ? 9 : 10;

  const bgColor = customBgColor || config.backgroundColor || '#030712';
  const escapedVShader = JSON.stringify(particleVertexShader);
  const escapedFShader = JSON.stringify(particleFragmentShader);
  const chainTitle = chain.map((s) => s.name.replace(/<[^>]*>/g, '')).join(' ➔ ');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pure 3D Particle Scene - ${chainTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: ${bgColor};
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
      cursor: grab;
    }
    body:active { cursor: grabbing; }
    #canvas-container { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    #minimal-helper {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 10, 14, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 30px;
      padding: 8px 18px;
      color: #94a3b8;
      font-family: monospace;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 10;
    }
    .helper-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #00F0FF;
      padding: 3px 10px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: bold;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="minimal-helper">
    <span id="pure-stage-status">✨ ${chainTitle}</span>
    <button class="helper-btn" onclick="togglePlay()">⏯️ <span id="pure-play-btn">Pause</span></button>
    <button class="helper-btn" onclick="toggleAutoRotate()">🔄 Rotate</button>
  </div>
  <script>
    function base64ToFloat32(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Float32Array(bytes.buffer);
    }
    function hexToRgbVec3(hex) {
      const c = new THREE.Color(hex);
      return new THREE.Vector3(c.r, c.g, c.b);
    }

    function applyMorphEasing(t, easing) {
      const clamped = Math.max(0, Math.min(1, t));
      switch (easing) {
        case 'linear': return clamped;
        case 'ease-in-out': return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
        case 'bounce': {
          const n1 = 7.5625, d1 = 2.75;
          let x = clamped;
          if (x < 1 / d1) return n1 * x * x;
          else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
          else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
          else return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
        case 'elastic': {
          if (clamped === 0) return 0; if (clamped === 1) return 1;
          const c4 = (2 * Math.PI) / 3;
          return Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;
        }
        case 'cubic-in': return clamped * clamped * clamped;
        case 'cubic-out': return 1 - Math.pow(1 - clamped, 3);
        case 'back-out': {
          const c1 = 1.70158, c3 = c1 + 1;
          return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
        }
        default: return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
      }
    }

    const chainPosB64List = ${JSON.stringify(chainPosB64List)};
    const chainColB64List = ${JSON.stringify(chainColB64List)};
    const chainNames = ${JSON.stringify(chainNames)};
    const chainLength = chainNames.length;
    const numSegments = Math.max(1, chainLength - 1);
    const chainPositions = chainPosB64List.map(b => base64ToFloat32(b));
    const chainColors = chainColB64List.map(b => base64ToFloat32(b));
    const randVals = base64ToFloat32("${delaysB64}");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color("${bgColor}"), 1);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(chainPositions[0].slice(), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(chainColors[0].slice(), 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(chainColors[0].slice(), 3));
    geometry.setAttribute('aTarget', new THREE.BufferAttribute((chainPositions[1] || chainPositions[0]).slice(), 3));
    geometry.setAttribute('aTargetColor', new THREE.BufferAttribute((chainColors[1] || chainColors[0]).slice(), 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randVals, 1));
    geometry.setAttribute('aDelayVal', new THREE.BufferAttribute(randVals, 1));

    const uniforms = {
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uNoiseAmp: { value: ${config.noiseAmp} },
      uNoiseFreq: { value: ${config.noiseFreq} },
      uNoiseSpeed: { value: ${config.noiseSpeed} },
      uDelaySpread: { value: ${config.delaySpread} },
      uNoiseType: { value: ${noiseTypeInt} },
      uDelayMode: { value: ${delayModeInt} },
      uPointSize: { value: ${config.pointSize} },
      uColorMixMode: { value: ${colorMixModeInt} },
      uColorMode: { value: ${colorModeInt} },
      uColorA: { value: hexToRgbVec3("${config.colorA || '#00F0FF'}") },
      uColorB: { value: hexToRgbVec3("${config.colorB || '#FF007F'}") },
      uColorC: { value: hexToRgbVec3("${config.colorC || '#FFE600'}") },
      uColorMixRatio: { value: ${config.colorMixRatio ?? 0.5} },
      uVelocityShift: { value: ${config.velocityColorShift ?? 1.0} },
      uColorGamma: { value: ${config.colorGamma ?? 1.0} },
      uGlowIntensity: { value: ${config.glowIntensity} },
      uParticleType: { value: ${particleTypeInt} },
      uShapeRotation: { value: 0.0 },
      uCoreRatio: { value: ${config.coreRatio ?? 0.8} }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: ${escapedVShader},
      fragmentShader: ${escapedFShader},
      uniforms: uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let isPlaying = true;
    let autoRotate = true;
    let playDirection = 1;
    let curProgress = 0;
    let holdTimer = 0;
    let lastHeldStation = -1;
    let activeSegment = 0;
    const playSpeed = ${config.playSpeed || 0.8};

    function switchSegment(seg) {
      if (seg < 0 || seg >= numSegments) return;
      activeSegment = seg;
      geometry.getAttribute('position').array.set(chainPositions[seg]);
      geometry.getAttribute('position').needsUpdate = true;
      geometry.getAttribute('color').array.set(chainColors[seg]);
      geometry.getAttribute('color').needsUpdate = true;
      geometry.getAttribute('aColor').array.set(chainColors[seg]);
      geometry.getAttribute('aColor').needsUpdate = true;
      geometry.getAttribute('aTarget').array.set(chainPositions[seg + 1]);
      geometry.getAttribute('aTarget').needsUpdate = true;
      geometry.getAttribute('aTargetColor').array.set(chainColors[seg + 1]);
      geometry.getAttribute('aTargetColor').needsUpdate = true;
    }

    window.togglePlay = function() {
      isPlaying = !isPlaying;
      document.getElementById('pure-play-btn').textContent = isPlaying ? 'Pause' : 'Play';
    };

    window.toggleAutoRotate = function() {
      autoRotate = !autoRotate;
    };

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();
      uniforms.uTime.value = time;

      if (holdTimer > 0) {
        holdTimer -= dt;
      } else if (isPlaying) {
        const effectiveSpeed = 0.5 * (1.0 / numSegments);
        const step = dt * playSpeed * effectiveSpeed * playDirection;
        const prevP = curProgress;
        let nextP = prevP + step;

        let triggered = -1;
        for (let i = 0; i <= numSegments; i++) {
          const stP = i / numSegments;
          const passed = playDirection > 0 ? (prevP < stP && nextP >= stP) : (prevP > stP && nextP <= stP);
          if (passed && lastHeldStation !== i) { triggered = i; break; }
        }

        if (triggered >= 0) {
          nextP = triggered / numSegments;
          holdTimer = 1.0;
          lastHeldStation = triggered;
          const statusEl = document.getElementById('pure-stage-status');
          if (statusEl) statusEl.textContent = '⏱️ 1초간 정지: ' + chainNames[triggered];
        } else {
          const curSegIdx = Math.min(Math.floor(nextP * numSegments), numSegments - 1);
          const statusEl = document.getElementById('pure-stage-status');
          if (statusEl) statusEl.textContent = '✨ [' + (curSegIdx + 1) + '/' + numSegments + ' Stage] ' + chainNames[curSegIdx] + ' ➔ ' + chainNames[curSegIdx + 1];
        }

        if (nextP >= 1.0) { nextP = 1.0; playDirection = -1; }
        else if (nextP <= 0.0) { nextP = 0.0; playDirection = 1; }
        curProgress = nextP;
      }

      const clamped = Math.max(0, Math.min(0.999999, curProgress));
      const scaled = clamped * numSegments;
      const seg = Math.min(Math.floor(scaled), numSegments - 1);
      const local = scaled - seg;
      if (activeSegment !== seg) switchSegment(seg);
      uniforms.uProgress.value = applyMorphEasing(local, "${config.morphEasing || 'ease-in-out'}");

      if (autoRotate) {
        particles.rotation.y = time * 0.08;
        particles.rotation.x = Math.sin(time * 0.05) * 0.04;
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>`;
}

/**
 * Generate Pure Particle Standalone Windows CMD Launcher File (.cmd)
 * Runs the hardware-accelerated pure 3D particle morphing viewer offline in default browser with 1 click.
 * Supports full multi-stage waypoint chain sequence.
 */
export function exportPureParticleCmd(
  sourceShape: MorphShape,
  targetShape: MorphShape,
  config: MorphConfig,
  morphChain?: MorphShape[]
): string {
  const chain = morphChain && morphChain.length >= 2 ? morphChain : [sourceShape, targetShape];
  const htmlContent = exportPureParticleHtml(sourceShape, targetShape, config, config.backgroundColor, chain);
  
  // Encode HTML to Base64 in UTF-8
  const utf8Bytes = new TextEncoder().encode(htmlContent);
  let binary = '';
  const len = utf8Bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Html = btoa(binary);

  const cleanChainTitle = chain.map((s) => (s.name || '').replace(/["\r\n]/g, '')).join(' -> ');

  return `@echo off
@chcp 65001 > nul
setlocal enabledelayedexpansion
title 3D Particle Morphing Pure Viewer - ${cleanChainTitle}

echo ===============================================================================
echo     3D PARTICLE MORPHING PURE VIEWER (STANDALONE CMD LAUNCHER)
echo ===============================================================================
echo   - Sequence : ${cleanChainTitle}
echo   - Stages   : ${chain.length} Shapes (${Math.max(1, chain.length - 1)} Morph Transitions)
echo   - Status   : Extracting hardware-accelerated 3D WebGL particle engine...
echo ===============================================================================

set "TEMP_DIR=%TEMP%\\ParticleMorph"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
set "VIEWER_FILE=%TEMP_DIR%\\pure_particle_morph_%RANDOM%_%TIME:~6,2%.html"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$b64 = '${base64Html}'; $bytes = [System.Convert]::FromBase64String($b64); [System.IO.File]::WriteAllBytes('%VIEWER_FILE%', $bytes);"

if exist "%VIEWER_FILE%" (
    echo [OK] Pure 3D Particle Viewer extracted successfully!
    echo [OK] Launching 3D Viewer in your default web browser...
    start "" "%VIEWER_FILE%"
    echo.
    echo ===============================================================================
    echo   Viewer is running in your browser!
    echo   This command window will close automatically in 3 seconds.
    echo ===============================================================================
    timeout /t 3 > nul
) else (
    echo [ERROR] Failed to extract standalone 3D particle viewer file.
    echo Please ensure you have write permissions to your %%TEMP%% directory.
    pause
)

endlocal
exit /b 0
`;
}
