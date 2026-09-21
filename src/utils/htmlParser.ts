import { MorphConfig, MorphShape } from '../types';
import { generateSphere, generateTorus } from './shapeGenerators';

export interface ParsedHtmlResult {
  isSuccess: boolean;
  title: string;
  sourceShape: MorphShape;
  targetShape: MorphShape;
  config: Partial<MorphConfig>;
  rawHtml: string;
  error?: string;
}

// Convert Base64 string to Float32Array
function base64ToFloat32Array(b64: string): Float32Array | null {
  try {
    const binStr = atob(b64.trim());
    const len = binStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
  } catch (err) {
    console.error('Failed to decode Base64 Float32Array', err);
    return null;
  }
}

/**
 * Parse an exported HTML particle file or custom particle HTML
 */
export function parseParticleHtml(htmlContent: string, fallbackCount = 60000): ParsedHtmlResult {
  try {
    const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : 'Loaded Particle HTML';

    // 1. Try to find structured metadata tag: <script id="particle-morph-meta" type="application/json">
    const metaTagMatch = htmlContent.match(/<script\s+id=["']particle-morph-meta["'][^>]*>([\s\S]*?)<\/script>/i);
    if (metaTagMatch && metaTagMatch[1]) {
      try {
        const meta = JSON.parse(metaTagMatch[1].trim());
        if (meta && meta.config) {
          // Parse positions if embedded in metadata
          let srcPositions: Float32Array | null = null;
          let srcColors: Float32Array | null = null;
          let dstPositions: Float32Array | null = null;
          let dstColors: Float32Array | null = null;

          if (meta.srcPosB64) srcPositions = base64ToFloat32Array(meta.srcPosB64);
          if (meta.srcColB64) srcColors = base64ToFloat32Array(meta.srcColB64);
          if (meta.dstPosB64) dstPositions = base64ToFloat32Array(meta.dstPosB64);
          if (meta.dstColB64) dstColors = base64ToFloat32Array(meta.dstColB64);

          const defaultSphere = generateSphere(meta.config.particleCount || fallbackCount);
          const defaultTorus = generateTorus(meta.config.particleCount || fallbackCount);

          const sourceShape: MorphShape = {
            id: meta.sourceShapeId || 'imported_src',
            name: meta.sourceName || 'HTML 출발 형상 (Source)',
            type: 'preset',
            positions: srcPositions || defaultSphere.positions,
            colors: srcColors || defaultSphere.colors,
            description: '가져온 HTML 파일에서 복원된 출발 파티클 지오메트리',
          };

          const targetShape: MorphShape = {
            id: meta.targetShapeId || 'imported_dst',
            name: meta.targetName || 'HTML 도착 형상 (Target)',
            type: 'preset',
            positions: dstPositions || defaultTorus.positions,
            colors: dstColors || defaultTorus.colors,
            description: '가져온 HTML 파일에서 복원된 도착 파티클 지오메트리',
          };

          return {
            isSuccess: true,
            title: pageTitle,
            sourceShape,
            targetShape,
            config: meta.config,
            rawHtml: htmlContent,
          };
        }
      } catch (e) {
        console.warn('Metadata tag found but JSON parse failed, falling back to regex extractor', e);
      }
    }

    // 2. Fallback: Extract Base64 arrays from JS script content
    const srcPosMatch = htmlContent.match(/srcPos\s*=\s*base64ToFloat32\(["']([^"']+)["']\)/i) ||
                        htmlContent.match(/["']([A-Za-z0-9+/=]{1000,})["']/);
    const srcColMatch = htmlContent.match(/srcCol\s*=\s*base64ToFloat32\(["']([^"']+)["']\)/i);
    const dstPosMatch = htmlContent.match(/dstPos\s*=\s*base64ToFloat32\(["']([^"']+)["']\)/i);
    const dstColMatch = htmlContent.match(/dstCol\s*=\s*base64ToFloat32\(["']([^"']+)["']\)/i);

    let srcPositions = srcPosMatch ? base64ToFloat32Array(srcPosMatch[1]) : null;
    let srcColors = srcColMatch ? base64ToFloat32Array(srcColMatch[1]) : null;
    let dstPositions = dstPosMatch ? base64ToFloat32Array(dstPosMatch[1]) : null;
    let dstColors = dstColMatch ? base64ToFloat32Array(dstColMatch[1]) : null;

    // Extract particle count
    const countMatch = htmlContent.match(/PARTICLE_COUNT\s*=\s*(\d+)/i) ||
                       htmlContent.match(/particleCount:\s*(\d+)/i) ||
                       htmlContent.match(/Particles:\s*<strong[^>]*>([\d,]+)<\/strong>/i);
    let particleCount = fallbackCount;
    if (countMatch && countMatch[1]) {
      particleCount = parseInt(countMatch[1].replace(/,/g, ''), 10);
    } else if (srcPositions) {
      particleCount = Math.floor(srcPositions.length / 3);
    }

    // Extract Uniform numbers
    const extractUniform = (key: string, defaultVal: number): number => {
      const regex = new RegExp(`${key}:\\s*\\{\\s*value:\\s*([0-9.]+)`, 'i');
      const m = htmlContent.match(regex);
      return m ? parseFloat(m[1]) : defaultVal;
    };

    // Extract Colors (hex / rgb)
    const extractColor = (key: string, defaultVal: string): string => {
      const regex = new RegExp(`hexToRgbVec3\\(["'](#[A-Fa-f0-9]{6})["']\\)`, 'i');
      const m = htmlContent.match(regex);
      return m ? m[1] : defaultVal;
    };

    const noiseAmp = extractUniform('uNoiseAmp', 1.5);
    const noiseFreq = extractUniform('uNoiseFreq', 0.8);
    const noiseSpeed = extractUniform('uNoiseSpeed', 0.7);
    const delaySpread = extractUniform('uDelaySpread', 0.45);
    const pointSize = extractUniform('uPointSize', 2.5);
    const progress = extractUniform('uProgress', 0.0);
    const glowIntensity = extractUniform('uGlowIntensity', 1.4);
    const particleTypeInt = Math.floor(extractUniform('uParticleType', 0));
    const colorMixModeInt = Math.floor(extractUniform('uColorMixMode', 0));

    // Particle Type Mapping
    const particleTypes: MorphConfig['particleType'][] = [
      'circle', 'star', 'diamond', 'ring', 'hexagon', 'cube', 'cloud', 'bokeh'
    ];
    const particleType = particleTypes[particleTypeInt] || 'circle';

    // Color Mix Mode Mapping
    const colorMixModes: MorphConfig['colorMixMode'][] = [
      'interpolate', 'gradient', 'velocity', 'height', 'radial', 'additive_mix'
    ];
    const colorMixMode = colorMixModes[colorMixModeInt] || 'interpolate';

    // Subtitle shape names if available
    const subtitleMatch = htmlContent.match(/<div class="subtitle">([^<]+)<\/div>/i);
    let srcName = 'HTML 출발 형상 (Source)';
    let dstName = 'HTML 도착 형상 (Target)';
    if (subtitleMatch && subtitleMatch[1].includes('➔')) {
      const parts = subtitleMatch[1].split('➔').map((s) => s.trim());
      if (parts[0]) srcName = parts[0];
      if (parts[1]) dstName = parts[1];
    }

    const defaultSphere = generateSphere(particleCount);
    const defaultTorus = generateTorus(particleCount);

    const sourceShape: MorphShape = {
      id: 'html_extracted_source',
      name: srcName,
      type: 'preset',
      positions: srcPositions || defaultSphere.positions,
      colors: srcColors || defaultSphere.colors,
      description: 'HTML 파일 코드에서 성공적으로 추출된 3D 포인트 클라우드',
    };

    const targetShape: MorphShape = {
      id: 'html_extracted_target',
      name: dstName,
      type: 'preset',
      positions: dstPositions || defaultTorus.positions,
      colors: dstColors || defaultTorus.colors,
      description: 'HTML 파일 코드에서 성공적으로 추출된 3D 도착 포인트 클라우드',
    };

    const parsedConfig: Partial<MorphConfig> = {
      particleCount: Math.min(particleCount, 120000),
      progress,
      noiseAmp,
      noiseFreq,
      noiseSpeed,
      delaySpread,
      pointSize,
      glowIntensity,
      particleType,
      colorMixMode,
      colorA: extractColor('uColorA', '#00F0FF'),
      colorB: extractColor('uColorB', '#FF007F'),
      colorC: extractColor('uColorC', '#FFE600'),
    };

    return {
      isSuccess: true,
      title: pageTitle,
      sourceShape,
      targetShape,
      config: parsedConfig,
      rawHtml: htmlContent,
    };
  } catch (err: any) {
    return {
      isSuccess: false,
      title: 'HTML 파싱 실패',
      sourceShape: { id: 'err', name: '오류', type: 'preset', positions: new Float32Array(0), colors: new Float32Array(0), description: '' },
      targetShape: { id: 'err', name: '오류', type: 'preset', positions: new Float32Array(0), colors: new Float32Array(0), description: '' },
      config: {},
      rawHtml: htmlContent,
      error: err.message || '알 수 없는 HTML 파싱 오류가 발생했습니다.',
    };
  }
}
