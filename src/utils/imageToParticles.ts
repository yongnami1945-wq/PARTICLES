import { ImageProcessingOptions } from '../types';

export interface ProcessedImageResult {
  positions: Float32Array;
  colors: Float32Array;
  sampledCount: number;
  previewUrl: string;
}

export async function processImageToParticles(
  imageSource: string | File | HTMLImageElement,
  targetCount: number,
  options: Partial<ImageProcessingOptions> = {}
): Promise<ProcessedImageResult> {
  const opts: ImageProcessingOptions = {
    threshold: options.threshold ?? 30,
    invert: options.invert ?? false,
    sampleDensity: options.sampleDensity ?? 2,
    depthScale: options.depthScale ?? 1.8,
    distribution: options.distribution ?? 'luminance_prob',
    targetSize: options.targetSize ?? 8.0,
    colorBoost: options.colorBoost ?? 1.1,
  };

  // Load image
  let img: HTMLImageElement;
  if (typeof imageSource === 'string') {
    img = await loadImageFromUrl(imageSource);
  } else if (imageSource instanceof File) {
    const url = URL.createObjectURL(imageSource);
    img = await loadImageFromUrl(url);
  } else {
    img = imageSource;
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  const maxDim = 512;
  let width = img.naturalWidth || img.width || 300;
  let height = img.naturalHeight || img.height || 300;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Collect candidate pixels
  interface Candidate {
    x: number;
    y: number;
    z: number;
    r: number;
    g: number;
    b: number;
    weight: number;
  }

  const candidates: Candidate[] = [];
  const aspect = width / height;

  for (let y = 0; y < height; y += opts.sampleDensity) {
    for (let x = 0; x < width; x += opts.sampleDensity) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 15) continue; // transparent

      // Luminance (Perceived Brightness)
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (opts.invert) {
        lum = 255 - lum;
      }

      if (lum >= opts.threshold) {
        // Normalize coordinates to -0.5 ~ +0.5
        const normX = (x / width - 0.5) * opts.targetSize * aspect;
        const normY = -(y / height - 0.5) * opts.targetSize;
        // 3D Depth extrusion from luminance + slight jitter
        const normZ = ((lum / 255) - 0.5) * opts.depthScale + (Math.random() - 0.5) * 0.15;

        // Weight for probability sampling
        let weight = lum / 255;
        if (opts.distribution === 'grid') weight = 1.0;

        // Color boost
        const cr = Math.min(1.0, (r / 255) * opts.colorBoost);
        const cg = Math.min(1.0, (g / 255) * opts.colorBoost);
        const cb = Math.min(1.0, (b / 255) * opts.colorBoost);

        candidates.push({
          x: normX,
          y: normY,
          z: normZ,
          r: cr,
          g: cg,
          b: cb,
          weight,
        });
      }
    }
  }

  // If no candidates found (e.g. all black/transparent), create fallback fallback grid
  if (candidates.length === 0) {
    for (let i = 0; i < 100; i++) {
      candidates.push({
        x: (Math.random() - 0.5) * opts.targetSize,
        y: (Math.random() - 0.5) * opts.targetSize,
        z: 0,
        r: 0.5,
        g: 0.8,
        b: 1.0,
        weight: 1.0,
      });
    }
  }

  // Populate targetCount buffers
  const positions = new Float32Array(targetCount * 3);
  const colors = new Float32Array(targetCount * 3);

  // Cumulative distribution for luminance sampling
  const cumulativeWeights = new Float64Array(candidates.length);
  let totalWeight = 0;
  for (let i = 0; i < candidates.length; i++) {
    totalWeight += candidates[i].weight;
    cumulativeWeights[i] = totalWeight;
  }

  for (let i = 0; i < targetCount; i++) {
    let chosen: Candidate;
    if (opts.distribution === 'luminance_prob') {
      const rVal = Math.random() * totalWeight;
      // Binary search
      let low = 0, high = candidates.length - 1;
      let foundIdx = 0;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (cumulativeWeights[mid] >= rVal) {
          foundIdx = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      chosen = candidates[foundIdx];
    } else {
      chosen = candidates[Math.floor(Math.random() * candidates.length)];
    }

    // Micro-jitter to spread points smoothly
    const jitterX = (Math.random() - 0.5) * (opts.targetSize / width) * opts.sampleDensity * 0.9;
    const jitterY = (Math.random() - 0.5) * (opts.targetSize / height) * opts.sampleDensity * 0.9;
    const jitterZ = (Math.random() - 0.5) * 0.1;

    positions[i * 3 + 0] = chosen.x + jitterX;
    positions[i * 3 + 1] = chosen.y + jitterY;
    positions[i * 3 + 2] = chosen.z + jitterZ;

    colors[i * 3 + 0] = chosen.r;
    colors[i * 3 + 1] = chosen.g;
    colors[i * 3 + 2] = chosen.b;
  }

  return {
    positions,
    colors,
    sampledCount: candidates.length,
    previewUrl: canvas.toDataURL('image/png'),
  };
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = url;
  });
}
