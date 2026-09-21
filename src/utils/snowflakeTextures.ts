import * as THREE from 'three';

// Generate procedural 6-fold crystal snowflake canvas textures matching Three.js webgl_points_sprites
export function createSnowflakeCanvasTexture(type: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const cx = 128;
  const cy = 128;
  ctx.clearRect(0, 0, 256, 256);

  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 12;

  // 6 radial spokes
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);

    if (type === 1) {
      // ❄️ Snowflake 1: Broad dendritic branch with diamond nodes
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -110);
      ctx.stroke();

      // Main branches at 60 deg
      for (const [offsetY, bLen] of [[-40, 35], [-70, 45], [-95, 25]]) {
        ctx.save();
        ctx.translate(0, offsetY);
        // Right barb
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bLen * 0.866, -bLen * 0.5);
        ctx.stroke();
        // Left barb
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-bLen * 0.866, -bLen * 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // Small hexagonal facet at center
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

    } else if (type === 2) {
      // ❄️ Snowflake 2: Stellar Cross Needle & Prism Star
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -115);
      ctx.stroke();

      // Diamond tips
      ctx.beginPath();
      ctx.moveTo(0, -115);
      ctx.lineTo(12, -95);
      ctx.lineTo(0, -75);
      ctx.lineTo(-12, -95);
      ctx.closePath();
      ctx.fill();

      // Secondary spurs
      ctx.save();
      ctx.translate(0, -50);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -14);
      ctx.moveTo(0, 0);
      ctx.lineTo(-24, -14);
      ctx.stroke();
      ctx.restore();

    } else if (type === 3) {
      // ❄️ Snowflake 3: Intricate Multi-tiered Fern Dendrite
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -112);
      ctx.stroke();

      // High-density fern needles
      for (let y = -25; y >= -105; y -= 16) {
        const factor = (120 + y) / 120;
        const needleLen = 32 * factor;
        ctx.save();
        ctx.translate(0, y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(needleLen * 0.866, -needleLen * 0.5);
        ctx.moveTo(0, 0);
        ctx.lineTo(-needleLen * 0.866, -needleLen * 0.5);
        ctx.stroke();
        ctx.restore();
      }

      // Center ring
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.stroke();

    } else if (type === 4) {
      // ❄️ Snowflake 4: Hexagonal Plate with Concentric Star Ring
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -105);
      ctx.stroke();

      // Side arrowheads
      ctx.save();
      ctx.translate(0, -65);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(20, -15);
      ctx.lineTo(20, -5);
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, -15);
      ctx.lineTo(-20, -5);
      ctx.stroke();
      ctx.restore();

      // Concentric inner ring
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // ❄️ Snowflake 5: Micro Crystal Prism & Diamond Dust
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -100);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -100);
      ctx.lineTo(15, -60);
      ctx.lineTo(0, -20);
      ctx.lineTo(-15, -60);
      ctx.closePath();
      ctx.stroke();

      // Center diamond
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// Convert user uploaded file or URL into a high-grade THREE.Texture for particle appearance
export async function loadCustomParticleSpriteTexture(fileOrUrl: File | string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    let url: string;
    if (typeof fileOrUrl === 'string') {
      url = fileOrUrl;
    } else {
      url = URL.createObjectURL(fileOrUrl);
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.generateMipmaps = true;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      (err) => {
        console.error('Failed to load particle sprite texture:', err);
        reject(err);
      }
    );
  });
}
