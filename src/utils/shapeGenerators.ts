// Procedural 3D Particle Shape Generators

/**
 * 01. 🪐 토성 및 행성 고리 (Saturn & Planetary Rings)
 * 구체 본체 + 카시니 간극이 있는 기울어진 3D 원반 고리
 */
export function generateSaturn(
  count: number,
  planetRadius = 2.6,
  ringInner = 3.6,
  ringOuter = 7.2
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const planetParticleCount = Math.floor(count * 0.38);

  // 1. Planet Sphere (38% of particles)
  for (let i = 0; i < planetParticleCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Oblate spheroid oblateness (slightly flattened at poles like Saturn)
    const r = planetRadius + (Math.random() - 0.5) * 0.15;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) * 0.9;
    const z = r * Math.sin(phi) * Math.sin(theta);

    // Apply 27-degree axial tilt
    const tilt = (27 * Math.PI) / 180;
    const tiltedX = x * Math.cos(tilt) - y * Math.sin(tilt);
    const tiltedY = x * Math.sin(tilt) + y * Math.cos(tilt);
    const tiltedZ = z;

    positions[i * 3 + 0] = tiltedX;
    positions[i * 3 + 1] = tiltedY;
    positions[i * 3 + 2] = tiltedZ;

    // Atmospheric cloud bands (Golden Ochre, Pale Amber, Sand Cream)
    const lat = (Math.cos(phi) + 1.0) * 0.5;
    const band = Math.sin(lat * 18.0);
    colors[i * 3 + 0] = 0.9 + band * 0.1;
    colors[i * 3 + 1] = 0.72 + band * 0.15;
    colors[i * 3 + 2] = 0.38 + band * 0.2;
  }

  // 2. Planetary Ring Disk (62% of particles) with Cassini Division
  for (let i = planetParticleCount; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Radius distribution with Cassini Division gap around 5.1 ~ 5.4
    let r = ringInner + Math.pow(Math.random(), 0.75) * (ringOuter - ringInner);
    if (r > 4.9 && r < 5.4 && Math.random() < 0.85) {
      r = Math.random() < 0.5 ? ringInner + Math.random() * 1.3 : 5.4 + Math.random() * 1.8;
    }
    const ringThickness = (Math.random() - 0.5) * 0.12 * (1 - (r - ringInner) / (ringOuter - ringInner));

    const x = r * Math.cos(angle);
    const y = ringThickness;
    const z = r * Math.sin(angle);

    // Apply same 27-degree tilt
    const tilt = (27 * Math.PI) / 180;
    const tiltedX = x * Math.cos(tilt) - y * Math.sin(tilt);
    const tiltedY = x * Math.sin(tilt) + y * Math.cos(tilt);
    const tiltedZ = z;

    positions[i * 3 + 0] = tiltedX;
    positions[i * 3 + 1] = tiltedY;
    positions[i * 3 + 2] = tiltedZ;

    // Ring dust coloring (Icy Blue / Opal / Pearlescent Platinum)
    const normR = (r - ringInner) / (ringOuter - ringInner);
    colors[i * 3 + 0] = 0.75 + normR * 0.25;
    colors[i * 3 + 1] = 0.82 + (1 - normR) * 0.15;
    colors[i * 3 + 2] = 1.0;
  }

  return { positions, colors };
}

/**
 * 02. 🛸 사이버 스타십 인터셉터 (Cybernetic Starship)
 * 뾰족한 기수 퓨슬라지, 델타 날개, 트윈 이온 엔진 추진 노즐 및 발광 콕핏
 */
export function generateStarship(count: number): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const part = Math.random();
    let x = 0, y = 0, z = 0;
    let rCol = 0, gCol = 0, bCol = 0;

    if (part < 0.35) {
      // Main Fuselage (Tapered needle body along Z from +4.5 to -3.0)
      const t = Math.random(); // 0 (tail) to 1 (nose)
      z = -3.5 + t * 8.0;
      const width = (1.0 - Math.pow(t, 1.8)) * 1.5;
      const height = (1.0 - Math.pow(t, 1.8)) * 0.8;
      const angle = Math.random() * Math.PI * 2;
      x = Math.cos(angle) * width * Math.random();
      y = Math.sin(angle) * height * Math.random();
      // Hull Titanium & Cyan Lines
      rCol = 0.15 + t * 0.4;
      gCol = 0.85 + t * 0.15;
      bCol = 1.0;
    } else if (part < 0.65) {
      // Swept Delta Wings (Left & Right)
      const side = Math.random() < 0.5 ? -1 : 1;
      const spanT = Math.random(); // 0 (root) to 1 (wingtip)
      const chordT = Math.random();
      const wingSpan = 5.2;
      x = side * (0.8 + spanT * wingSpan);
      // Sweep back along Z
      z = 0.5 - spanT * 3.8 + chordT * (1.8 - spanT * 1.4);
      y = (Math.random() - 0.5) * 0.15 + (spanT * 0.4); // slight dihedral angle
      // Wing Edge Cyberpunk Magenta / Cyan
      rCol = 0.95 * spanT;
      gCol = 0.3 + (1 - spanT) * 0.6;
      bCol = 1.0;
    } else if (part < 0.82) {
      // Twin Ion Engine Nacelles & Thruster Plume
      const side = Math.random() < 0.5 ? -1 : 1;
      const nozzleT = Math.random();
      x = side * 1.6 + (Math.random() - 0.5) * 0.5;
      y = (Math.random() - 0.5) * 0.5;
      z = -3.5 - nozzleT * 3.5; // Exhaust trail stretching back
      // Blazing Plasma Blue / Violet Flame
      const flameDist = nozzleT;
      rCol = 0.2 + flameDist * 0.7;
      gCol = 0.85 * (1 - flameDist);
      bCol = 1.0;
    } else {
      // Cockpit Canopy (Glowing Neon Gold / Green Crystal)
      const t = Math.random();
      z = 0.5 + t * 2.2;
      const width = (1.0 - t) * 0.65;
      const height = (1.0 - t) * 0.65;
      x = (Math.random() - 0.5) * 2 * width;
      y = 0.3 + Math.sqrt(Math.max(0, 1 - Math.pow(x / (width || 0.1), 2))) * height * Math.random();
      // Glowing Canopy
      rCol = 1.0;
      gCol = 0.9;
      bCol = 0.1;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3 + 0] = rCol;
    colors[i * 3 + 1] = gCol;
    colors[i * 3 + 2] = bCol;
  }

  return { positions, colors };
}

/**
 * 03. 🌳 생명의 나무 / 프랙탈 본사이 (Tree of Life & Fractal Canopy)
 * 견고한 뿌리와 줄기, 3D 프랙탈 가지, 풍성한 볼류메트릭 잎사귀 캐노피
 */
export function generateTreeOfLife(count: number): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const isCanopy = Math.random() < 0.65; // 65% leaves/canopy, 35% trunk/branches
    let x = 0, y = 0, z = 0;
    let rCol = 0, gCol = 0, bCol = 0;

    if (!isCanopy) {
      // Trunk & Major Branches (Y from -4.5 to 1.0)
      const t = Math.random(); // 0 = base root, 1 = crown fork
      y = -4.5 + t * 5.0;
      const trunkRadius = 0.9 * (1.1 - t * 0.7) + (Math.random() - 0.5) * 0.15;
      
      // Add subtle organic twist & branch divergence near top
      let angle = Math.random() * Math.PI * 2;
      let branchSpread = 0;
      if (t > 0.5) {
        const branchT = (t - 0.5) * 2.0;
        branchSpread = branchT * 1.8;
      }
      x = Math.cos(angle) * (trunkRadius + branchSpread);
      z = Math.sin(angle) * (trunkRadius + branchSpread);

      // Root flare at bottom
      if (t < 0.2) {
        const rootT = (0.2 - t) / 0.2;
        x *= 1.0 + rootT * 2.2;
        z *= 1.0 + rootT * 2.2;
      }

      // Ancient Bark Brown / Bronze
      rCol = 0.65 - t * 0.2;
      gCol = 0.45 + t * 0.2;
      bCol = 0.2;
    } else {
      // Dense Foliage Spherical Clusters (Canopy)
      // 5 cluster centers around top
      const clusterIdx = Math.floor(Math.random() * 5);
      let cx = 0, cy = 2.0, cz = 0;
      if (clusterIdx === 1) { cx = 2.2; cy = 1.2; cz = 0.8; }
      else if (clusterIdx === 2) { cx = -2.2; cy = 1.4; cz = -0.6; }
      else if (clusterIdx === 3) { cx = 0.5; cy = 1.6; cz = 2.0; }
      else if (clusterIdx === 4) { cx = -0.8; cy = 1.8; cz = -1.9; }

      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rad = Math.cbrt(Math.random()) * 2.2;

      x = cx + rad * Math.sin(phi) * Math.cos(theta);
      y = cy + rad * Math.cos(phi) * 0.9;
      z = cz + rad * Math.sin(phi) * Math.sin(theta);

      // Bioluminescent Emerald / Lime / Golden Leaves
      const heightNorm = (y + 1.0) / 4.5;
      rCol = 0.1 + heightNorm * 0.4;
      gCol = 0.95;
      bCol = 0.4 + heightNorm * 0.5;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3 + 0] = rCol;
    colors[i * 3 + 1] = gCol;
    colors[i * 3 + 2] = bCol;
  }

  return { positions, colors };
}

/**
 * 04. 🪽 천사의 날개 (Cybernetic Angel Wings)
 * 양옆으로 웅장하게 펼쳐지는 3D 곡면 깃털 날개와 네온 오로라 빛줄기
 */
export function generateAngelWings(count: number): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const featherRow = Math.random(); // 0 (primary outer feathers) to 1 (inner soft down)
    const t = Math.random(); // 0 (wing root) to 1 (wing tip)

    // Sweeping parabolic arch
    const span = 0.5 + t * 5.8;
    const archY = Math.sin(t * Math.PI * 0.85) * 4.2 - (1 - featherRow) * 2.5;
    const sweepZ = Math.cos(t * Math.PI * 0.6) * 1.8 - (featherRow * 1.2);

    const jitter = (Math.random() - 0.5) * 0.25;
    const x = side * (span + jitter);
    const y = archY + (Math.random() - 0.5) * 0.4;
    const z = sweepZ + (Math.random() - 0.5) * 0.35;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Iridescent Divine Cyan ➔ Magenta ➔ Pure White
    if (t > 0.8) {
      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3 + 0] = 0.3 + t * 0.65;
      colors[i * 3 + 1] = 0.8 - t * 0.4;
      colors[i * 3 + 2] = 1.0;
    }
  }

  return { positions, colors };
}

/**
 * 05. 💎 다면체 스타 다이아몬드 (Prismatic Star Diamond / Gem)
 * 상하 쌍각 다면체 다이아몬드 크리스털 + 궤도 프리즘 파편
 */
export function generateDiamondCrystal(count: number, scale = 4.2): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const facetCount = 8; // 8-fold faceted octahedron gem

  for (let i = 0; i < count; i++) {
    const isOrbitShard = Math.random() < 0.15; // 15% orbiting prism sparkles
    let x = 0, y = 0, z = 0;

    if (!isOrbitShard) {
      const facet = Math.floor(Math.random() * facetCount);
      const isTop = Math.random() < 0.55;
      const angle1 = (facet * 2 * Math.PI) / facetCount;
      const angle2 = ((facet + 1) * 2 * Math.PI) / facetCount;

      // Triangle interpolation on facet
      const u = Math.random();
      const v = Math.random() * (1 - u);
      const w = 1 - u - v;

      const crownY = isTop ? 1.0 : -1.3;
      const girdleY = isTop ? 0.2 : -0.1;
      const girdleR = scale * 0.85;

      const p1x = 0, p1y = crownY * scale, p1z = 0;
      const p2x = Math.cos(angle1) * girdleR, p2y = girdleY * scale, p2z = Math.sin(angle1) * girdleR;
      const p3x = Math.cos(angle2) * girdleR, p3y = girdleY * scale, p3z = Math.sin(angle2) * girdleR;

      x = u * p1x + v * p2x + w * p3x + (Math.random() - 0.5) * 0.1;
      y = u * p1y + v * p2y + w * p3y + (Math.random() - 0.5) * 0.1;
      z = u * p1z + v * p2z + w * p3z + (Math.random() - 0.5) * 0.1;
    } else {
      // Orbiting prism halo
      const angle = Math.random() * Math.PI * 2;
      const r = scale * (1.1 + Math.random() * 0.6);
      x = Math.cos(angle) * r;
      y = (Math.random() - 0.5) * scale * 1.2;
      z = Math.sin(angle) * r;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Prismatic Dispersion (Cyan / Violet / Neon Yellow-Green)
    const angleRatio = (Math.atan2(z, x) + Math.PI) / (2 * Math.PI);
    colors[i * 3 + 0] = 0.5 + 0.5 * Math.sin(angleRatio * Math.PI * 3);
    colors[i * 3 + 1] = 0.6 + 0.4 * Math.cos(angleRatio * Math.PI * 2);
    colors[i * 3 + 2] = 1.0;
  }

  return { positions, colors };
}

/**
 * 06. 🌀 3D 토러스 매듭 / 뫼비우스 볼텍스 (Trefoil Knot & Vortex)
 * 3차원 위상수학 토러스 매듭 (p=2, q=3)
 */
export function generateTrefoilKnot(count: number, scale = 1.4, tubeRadius = 0.85): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = 2; // Winding number around axis
    const q = 3; // Winding number through hole

    // Trefoil centerline parametric curve
    const rCurve = (2.0 + Math.cos(q * t)) * scale;
    const cx = rCurve * Math.cos(p * t);
    const cy = Math.sin(q * t) * scale * 1.8;
    const cz = rCurve * Math.sin(p * t);

    // Tube cross-section random angle
    const tubeAngle = Math.random() * Math.PI * 2;
    const rTube = tubeRadius * (0.8 + Math.random() * 0.4);

    const nx = Math.cos(tubeAngle) * rTube;
    const ny = Math.sin(tubeAngle) * rTube;
    const nz = (Math.random() - 0.5) * 0.2;

    positions[i * 3 + 0] = cx + nx;
    positions[i * 3 + 1] = cy + ny;
    positions[i * 3 + 2] = cz + nz;

    // High energy electric plasma rainbow
    const normT = t / (Math.PI * 2);
    colors[i * 3 + 0] = 0.5 + 0.5 * Math.sin(normT * Math.PI * 2);
    colors[i * 3 + 1] = 0.5 + 0.5 * Math.sin(normT * Math.PI * 2 + (2 * Math.PI) / 3);
    colors[i * 3 + 2] = 0.5 + 0.5 * Math.sin(normT * Math.PI * 2 + (4 * Math.PI) / 3);
  }

  return { positions, colors };
}

/**
 * 07. 💀 사이버네틱 3D 스컬 (Cybernetic Visage Skull)
 * 3차원 두개골 안면 구조, 안와 구멍, 광대뼈, 턱 관절 라인
 */
export function generateCyberSkull(count: number, scale = 0.72): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const part = Math.random();
    let x = 0, y = 0, z = 0;
    let rCol = 0.2, gCol = 0.8, bCol = 1.0;

    if (part < 0.45) {
      // Cranium Upper Dome (Ellipsoid Sphere)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.6 + (Math.random() - 0.5) * 0.3;
      x = r * Math.sin(phi) * Math.cos(theta) * 0.95;
      y = 1.0 + r * Math.cos(phi) * 0.9;
      z = r * Math.sin(phi) * Math.sin(theta) * 1.1;
      // Filter out lower front where face is
      if (y < 0.5 && z > 0) {
        y += 2.0;
      }
    } else if (part < 0.70) {
      // Facial Bone Structure (Cheeks, Nose Bridge)
      const side = Math.random() < 0.5 ? -1 : 1;
      const t = Math.random();
      x = side * (0.8 + t * 2.2);
      y = -0.5 - t * 1.8;
      z = 2.4 - t * 0.8 + (Math.random() - 0.5) * 0.3;
      // Hollow eye sockets check
      if (Math.abs(x) < 2.0 && Math.abs(x) > 0.7 && y > -1.4 && y < -0.1) {
        // Push particles to eye orbit rim
        const eyeAngle = Math.random() * Math.PI * 2;
        x = side * 1.4 + Math.cos(eyeAngle) * 0.8;
        y = -0.7 + Math.sin(eyeAngle) * 0.7;
        z = 2.8;
        rCol = 1.0; gCol = 0.1; bCol = 0.4; // Glowing Red/Magenta Eye Rim
      }
    } else {
      // Jawline and Teeth Array
      const t = (Math.random() - 0.5) * 2.0; // -1 to 1 across jaw
      const jawY = -3.2 - Math.abs(t) * 0.8;
      const jawZ = 2.2 - Math.abs(t) * 1.4;
      x = t * 1.8 + (Math.random() - 0.5) * 0.2;
      y = jawY + (Math.random() - 0.5) * 0.3;
      z = jawZ + (Math.random() - 0.5) * 0.3;

      // Teeth highlights
      rCol = 0.9; gCol = 0.95; bCol = 1.0;
    }

    positions[i * 3 + 0] = x * scale;
    positions[i * 3 + 1] = y * scale;
    positions[i * 3 + 2] = z * scale;

    colors[i * 3 + 0] = rCol;
    colors[i * 3 + 1] = gCol;
    colors[i * 3 + 2] = bCol;
  }

  return { positions, colors };
}

export function generateSphere(count: number, radius = 4.0): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Slight shell thickness
    const r = radius + (Math.random() - 0.5) * 0.4;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Cyan / Electric Blue gradient
    const normY = (y / radius + 1) * 0.5;
    colors[i * 3 + 0] = 0.1 + normY * 0.2;
    colors[i * 3 + 1] = 0.6 + normY * 0.4;
    colors[i * 3 + 2] = 0.95 + normY * 0.05;
  }

  return { positions, colors };
}

export function generateTorus(count: number, R = 4.2, rTube = 1.6): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2.0;
    const v = Math.random() * Math.PI * 2.0;
    const r = rTube + (Math.random() - 0.5) * 0.3;

    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Magenta / Amber gradient
    const angleRatio = (Math.atan2(y, x) + Math.PI) / (2 * Math.PI);
    colors[i * 3 + 0] = 0.95;
    colors[i * 3 + 1] = 0.2 + 0.6 * Math.sin(angleRatio * Math.PI);
    colors[i * 3 + 2] = 0.5 + 0.4 * Math.cos(angleRatio * Math.PI);
  }

  return { positions, colors };
}

export function generateGalaxy(count: number, radius = 5.0, arms = 4): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const isCore = Math.random() < 0.25;
    let r: number, theta: number, z: number;

    if (isCore) {
      r = Math.pow(Math.random(), 2) * (radius * 0.4);
      theta = Math.random() * Math.PI * 2;
      z = (Math.random() - 0.5) * 1.6 * (1 - r / (radius * 0.4));
    } else {
      r = Math.sqrt(Math.random()) * radius + 0.8;
      const armIndex = Math.floor(Math.random() * arms);
      const armOffset = (armIndex * 2 * Math.PI) / arms;
      const spiral = (r / radius) * Math.PI * 2.5;
      theta = armOffset + spiral + (Math.random() - 0.5) * 0.5;
      z = (Math.random() - 0.5) * (0.8 / (1 + r * 0.3));
    }

    const x = r * Math.cos(theta);
    const y = z; // Orient along XZ horizontal plane with Y as height
    const posZ = r * Math.sin(theta);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = posZ;

    // Cosmic violet / gold center to deep blue outer
    const distRatio = Math.min(r / radius, 1.0);
    if (distRatio < 0.3) {
      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.85;
      colors[i * 3 + 2] = 0.4;
    } else {
      colors[i * 3 + 0] = 0.6 - distRatio * 0.4;
      colors[i * 3 + 1] = 0.2 + distRatio * 0.3;
      colors[i * 3 + 2] = 1.0;
    }
  }

  return { positions, colors };
}

export function generateDNA(count: number, height = 9.0, radius = 2.4, turns = 3.5): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const isBridge = Math.random() < 0.22;
    const t = Math.random(); // 0 ~ 1 along height
    const y = (t - 0.5) * height;
    const angle = t * turns * 2 * Math.PI;

    let x = 0, z = 0;
    let rCol = 0.2, gCol = 0.8, bCol = 0.6;

    if (isBridge) {
      // Base pair bridge between strands
      const bridgeT = (Math.random() - 0.5) * 2; // -1 to 1
      x = bridgeT * radius * Math.cos(angle);
      z = bridgeT * radius * Math.sin(angle);
      rCol = 0.95; gCol = 0.85; bCol = 0.2;
    } else {
      // One of two helical backbones
      const strand = Math.random() < 0.5 ? 0 : Math.PI;
      const strandAngle = angle + strand;
      const jitter = (Math.random() - 0.5) * 0.3;
      const curRadius = radius + jitter;
      x = curRadius * Math.cos(strandAngle);
      z = curRadius * Math.sin(strandAngle);
      
      if (strand === 0) {
        rCol = 0.2; gCol = 0.7; bCol = 1.0; // Strand 1
      } else {
        rCol = 1.0; gCol = 0.3; bCol = 0.6; // Strand 2
      }
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3 + 0] = rCol;
    colors[i * 3 + 1] = gCol;
    colors[i * 3 + 2] = bCol;
  }

  return { positions, colors };
}

export function generateHeart(count: number, scale = 0.28): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // 3D Heart surface equation
    const t = Math.random() * Math.PI * 2;
    const u = Math.random() * Math.PI;
    const jitter = (Math.random() - 0.5) * 0.15;

    // Cardioid parametric formula
    const xBase = 16 * Math.pow(Math.sin(t), 3);
    const yBase = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const zBase = Math.sin(u) * Math.sin(t) * 8 * (Math.random() - 0.5);

    const x = (xBase + jitter) * scale;
    const y = (yBase + jitter) * scale;
    const z = (zBase + jitter) * scale;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Glowing crimson / fiery pink
    const heat = Math.abs(x) / (16 * scale);
    colors[i * 3 + 0] = 1.0;
    colors[i * 3 + 1] = 0.1 + heat * 0.3;
    colors[i * 3 + 2] = 0.35 + (1 - heat) * 0.35;
  }

  return { positions, colors };
}

export function generateCube(count: number, size = 5.0): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const half = size / 2;

  for (let i = 0; i < count; i++) {
    const face = Math.floor(Math.random() * 6);
    const u = (Math.random() - 0.5) * size;
    const v = (Math.random() - 0.5) * size;
    const jitter = (Math.random() - 0.5) * 0.1;

    let x = 0, y = 0, z = 0;
    switch (face) {
      case 0: x = half + jitter; y = u; z = v; break;
      case 1: x = -half - jitter; y = u; z = v; break;
      case 2: y = half + jitter; x = u; z = v; break;
      case 3: y = -half - jitter; x = u; z = v; break;
      case 4: z = half + jitter; x = u; y = v; break;
      case 5: z = -half - jitter; x = u; y = v; break;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Emerald / Teal / Neon Gold
    colors[i * 3 + 0] = 0.2 + Math.abs(x / half) * 0.7;
    colors[i * 3 + 1] = 0.95;
    colors[i * 3 + 2] = 0.5 + Math.abs(z / half) * 0.4;
  }

  return { positions, colors };
}

/**
 * 13. 🌌 자유 부유 우주 입자장 (Cosmic Free-Floating Ambient Field)
 * 공간 전체를 자유롭게 떠돌며 부유하는 우주 성간 분진 및 마우스 중력장에 반응하는 유체 입자장
 */
export function generateCosmicAmbientDrift(
  count: number,
  volumeRadius = 9.5
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Volumetric 3D spatial distribution with slight center density falloff
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Non-uniform power distribution creates dense core + expansive deep-space wandering halo
    const r = Math.pow(Math.random(), 0.65) * volumeRadius;

    const x = r * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 1.2;
    const y = r * Math.cos(phi) * 0.85 + (Math.random() - 0.5) * 1.2;
    const z = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 1.2;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Celestial Cosmic Stardust Palette (Electric Cyan, Stellar Opal, Deep Sapphire, Starlight White)
    const distNorm = r / volumeRadius;
    const colorMix = Math.sin(distNorm * Math.PI * 2.5 + theta);
    
    if (distNorm < 0.35) {
      // Hot luminous core (Starlight White / Neon Cyan)
      colors[i * 3 + 0] = 0.75 + Math.random() * 0.25;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    } else if (colorMix > 0.2) {
      // Ambient Aurora Cyan & Aquamarine
      colors[i * 3 + 0] = 0.05 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
    } else if (colorMix > -0.4) {
      // Deep Space Violet & Neon Magenta
      colors[i * 3 + 0] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 1] = 0.15 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.95;
    } else {
      // Golden Stardust Flare
      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.35 + Math.random() * 0.2;
    }
  }

  return { positions, colors };
}

/**
 * 14. 🌀 마우스 중력 와류 성운 (Interactive Gravity Vortex Nebula)
 * 마우스 커서의 인력/척력 및 와류 중력장에 실시간 반응하는 3차원 나선형 성운
 */
export function generateGravityVortexNebula(
  count: number,
  radius = 8.5
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const arms = 5;

  for (let i = 0; i < count; i++) {
    const isCore = Math.random() < 0.25;
    if (isCore) {
      // Gravitational Singularity Core
      const r = Math.pow(Math.random(), 1.5) * (radius * 0.35);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2.0 * Math.random() - 1.0);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      colors[i * 3 + 0] = 1.0;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 0.7;
    } else {
      // Logarithmic Spiral Vortex Arms
      const armIndex = Math.floor(Math.random() * arms);
      const armOffset = (armIndex * 2 * Math.PI) / arms;
      const dist = Math.pow(Math.random(), 0.75) * radius;
      const spiralAngle = dist * 1.8 + armOffset;

      const scatterX = (Math.random() - 0.5) * (0.8 + dist * 0.25);
      const scatterY = (Math.random() - 0.5) * (0.6 + dist * 0.2);
      const scatterZ = (Math.random() - 0.5) * (0.8 + dist * 0.25);

      positions[i * 3 + 0] = dist * Math.cos(spiralAngle) + scatterX;
      positions[i * 3 + 1] = Math.sin(dist * 2.0) * 0.6 + scatterY;
      positions[i * 3 + 2] = dist * Math.sin(spiralAngle) + scatterZ;

      // Color transition from core gold to turquoise to magenta tips
      const t = dist / radius;
      colors[i * 3 + 0] = 0.2 + 0.8 * Math.sin(t * Math.PI);
      colors[i * 3 + 1] = 0.8 * (1.0 - t * 0.5);
      colors[i * 3 + 2] = 0.4 + 0.6 * t;
    }
  }

  return { positions, colors };
}

/**
 * 15. ⚡ 양자 진동 에너지장 (Quantum Fluctuation Field)
 * 정상파 3D 격자 및 미세 양자 진동 노이즈가 결합된 에너지 파동 형태
 */
export function generateQuantumField(
  count: number,
  size = 8.0
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const half = size / 2;

  for (let i = 0; i < count; i++) {
    const u = (Math.random() - 0.5) * size;
    const v = (Math.random() - 0.5) * size;
    const w = (Math.random() - 0.5) * size;

    // Harmonic quantum standing wave perturbation
    const wave = Math.sin(u * 1.2) * Math.cos(v * 1.2) * Math.sin(w * 1.2);
    const x = u + Math.sin(v * 2.0) * 0.4 + wave * 0.8;
    const y = v + Math.cos(w * 2.0) * 0.4 + wave * 0.8;
    const z = w + Math.sin(u * 2.0) * 0.4 + wave * 0.8;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Emerald Matrix & Radiant Cyan
    const energy = Math.abs(wave);
    colors[i * 3 + 0] = 0.1 + energy * 0.8;
    colors[i * 3 + 1] = 0.95;
    colors[i * 3 + 2] = 0.4 + (1.0 - energy) * 0.6;
  }

  return { positions, colors };
}

/**
 * 14. ✍️ 2D 고선명도 텍스트 파티클 생성기 (2D Typography Auto-Centered & Canvas Auto-Fit Generator)
 * - 텍스트 길이 기준 중심점(가운데 지점)이 캔버스 정중앙(0, 0, 0)에 완벽 일치하도록 정렬
 * - 텍스트 길이가 아무리 길더라도 카메라 뷰포트(Frustum Safe Bounds) 내에서 자동으로 최적 축소(Auto-Fit)
 * - 사용자가 줄바꿈을 입력하지 않은 긴 텍스트는 가독성을 위해 2~3줄로 지능적 밸런스 자동 줄바꿈 지원
 * - 가독성과 선명도를 극대화하기 위해 Z=0.0 2D 완전 평면 고밀도 픽셀 매핑
 * - HY태고딕 (한글) 및 Impact/Arial Black (영문 유사 고딕) 적용
 */
export function generateTextShape(
  text: string,
  count: number,
  _targetSize = 13.5
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // 1. 텍스트 라인 분석 및 자동 줄바꿈 처리
  const rawText = (text || 'PARTICLE').trim();
  let lines: string[] = [];

  if (rawText.includes('\n')) {
    // 사용자가 직접 줄바꿈한 경우
    lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).slice(0, 4);
  } else if (rawText.length > 10) {
    // 텍스트가 긴 경우 (10자 초과): 공백 단어 기준 또는 글자 수 기준으로 2~3줄 자동 분할
    const words = rawText.split(' ').filter(Boolean);
    if (words.length >= 2) {
      if (words.length <= 4) {
        const mid = Math.ceil(words.length / 2);
        lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
      } else {
        const third = Math.ceil(words.length / 3);
        lines = [
          words.slice(0, third).join(' '),
          words.slice(third, third * 2).join(' '),
          words.slice(third * 2).join(' '),
        ].filter(Boolean);
      }
    } else {
      // 공백 없는 긴 단어의 경우 균등 분할
      if (rawText.length > 18) {
        const chunk = Math.ceil(rawText.length / 3);
        lines = [rawText.slice(0, chunk), rawText.slice(chunk, chunk * 2), rawText.slice(chunk * 2)];
      } else {
        const chunk = Math.ceil(rawText.length / 2);
        lines = [rawText.slice(0, chunk), rawText.slice(chunk)];
      }
    }
  } else {
    lines = [rawText];
  }

  if (lines.length === 0) lines = ['PARTICLE'];
  const lineCount = lines.length;

  // 가장 긴 라인의 글자 수 탐색
  let maxChars = 1;
  lines.forEach((l) => {
    if (l.length > maxChars) maxChars = l.length;
  });

  // 고해상도 Canvas2D 생성
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(3200, Math.max(1600, maxChars * 220));
  canvas.height = Math.max(800, lineCount * 300 + 240);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return generateSphere(count);
  }

  // 완전 블랙 배경 클리어
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 동적 폰트 크기 계산
  const calculatedFontByWidth = Math.floor((canvas.width * 0.88) / Math.max(maxChars, 2.5));
  const calculatedFontByHeight = Math.floor((canvas.height * 0.72) / (lineCount * 1.35));
  const fontSize = Math.min(260, Math.max(80, Math.min(calculatedFontByWidth, calculatedFontByHeight)));

  ctx.font = `900 ${fontSize}px "HYGothic-Extra", "HYTaegothic", "HYGothic", "Impact", "Arial Black", "NanumSquareNeo-Heavy", "Black Han Sans", "Noto Sans KR", "Malgun Gothic", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.lineWidth = Math.max(8, Math.floor(fontSize * 0.08));
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';

  // 텍스트 블록의 수직 정중앙 시작점 계산
  const lineHeight = fontSize * 1.28;
  const totalBlockHeight = (lineCount - 1) * lineHeight;
  const startY = canvas.height / 2 - totalBlockHeight / 2;

  // 각 줄 렌더링 (가로 중앙 기준)
  lines.forEach((line, idx) => {
    const lineY = startY + idx * lineHeight;
    ctx.strokeText(line, canvas.width / 2, lineY);
    ctx.fillText(line, canvas.width / 2, lineY);
  });

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 실제 그려진 텍스트 픽셀의 타이트한 바운딩 박스(Bounding Box) 추출
  let minX = canvas.width;
  let maxX = 0;
  let minY = canvas.height;
  let maxY = 0;
  const validPixels: [number, number, number][] = []; // [x, y, luminance]

  const step = canvas.width > 2000 ? 2 : 1;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      const lum = imgData.data[idx];
      if (lum > 45) {
        validPixels.push([x, y, lum]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (validPixels.length === 0) {
    return generateSphere(count);
  }

  // 텍스트의 실제 픽셀 너비/높이 및 정확한 기하학적 중심점 계산
  const textWidth = Math.max(1, maxX - minX);
  const textHeight = Math.max(1, maxY - minY);
  const textCenterX = (minX + maxX) * 0.5;
  const textCenterY = (minY + maxY) * 0.5;

  // 캔버스 카메라 화각(Camera FOV 60°, Z=15) 기준 안전 가두리 영역 (Frustum Safe Limits)
  // 텍스트 길이가 아무리 길더라도 캔버스 밖으로 벗어나지 않도록 자동 스케일링 (Auto-Fit)
  const SAFE_MAX_WORLD_WIDTH = 13.5;  // 캔버스 가로 안전 가두리 (좌우 여백 확보)
  const SAFE_MAX_WORLD_HEIGHT = 8.2;  // 캔버스 세로 안전 가두리 (상하 툴바/도크 여백 확보)

  const scaleW = SAFE_MAX_WORLD_WIDTH / textWidth;
  const scaleH = SAFE_MAX_WORLD_HEIGHT / textHeight;
  
  // 짧은 단어(예: 'AI')의 경우 글자가 과도하게 거대해지는 것을 방지하는 최대 높이 상한
  const maxSingleFontHeight = 4.2;
  const scaleMax = maxSingleFontHeight / Math.max(fontSize, 40);

  // 가로와 세로 가두리 중 더 타이트한 비율을 취하여 완벽한 비율 유지 및 캔버스 100% 안착 보장
  const scale = Math.min(scaleW, scaleH, scaleMax);

  for (let i = 0; i < count; i++) {
    const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];

    // 텍스트의 가운데 지점(textCenterX, textCenterY)을 원점(0, 0, 0)으로 정렬
    // (minX - textCenterX) * scale = -0.5 * textWidth * scale
    // (maxX - textCenterX) * scale = +0.5 * textWidth * scale
    // 즉, 캔버스 좌우 대칭 및 정중앙에 완벽히 위치함
    const normX = (pixel[0] - textCenterX) * scale;
    const normY = -(pixel[1] - textCenterY) * scale;
    const normZ = 0.0; // 2D 완전 평면

    positions[i * 3 + 0] = normX;
    positions[i * 3 + 1] = normY;
    positions[i * 3 + 2] = normZ;

    // 네온 타이포그래피 팔레트 (Electric Cyan ~ Pure Laser White / Vivid Amber)
    const t = Math.min(1, Math.max(0, (pixel[0] - minX) / textWidth));
    const lineRatio = Math.min(1, Math.max(0, (pixel[1] - minY) / textHeight));
    const lumRatio = pixel[2] / 255;

    if (lumRatio > 0.85) {
      // 밝은 코어 광선 (White / High-Luminance Cyan)
      colors[i * 3 + 0] = 0.5 + 0.5 * Math.sin(t * Math.PI);
      colors[i * 3 + 1] = 0.98;
      colors[i * 3 + 2] = 1.0;
    } else {
      // 폰트 외곽 본체 그라데이션
      colors[i * 3 + 0] = 0.05 + 0.9 * t;
      colors[i * 3 + 1] = 0.85 + 0.15 * Math.sin((t + lineRatio * 0.5) * Math.PI * 2);
      colors[i * 3 + 2] = 1.0 - 0.35 * t;
    }
  }

  return { positions, colors };
}

/**
 * 09. 🦅 GPGPU 군집 비행 (Flocking Birds & Boids Swarm)
 * 첨부파일(webgl_gpgpu_birds.html)의 BirdGeometry(몸통/날개 3개 삼각형)와
 * Boids 군집 알고리즘(Separation, Alignment, Cohesion, Predator Avoidance)을
 * 3D 파티클 포인트 클라우드로 완벽 재현한 유선형 조류 군집 비행 형상
 */
export function generateFlockingBirds(count: number): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // 120 individual 3D Birds in flock
  const numBirds = 120;
  const particlesPerBird = Math.floor((count * 0.78) / numBirds);
  const ambientStreamParticles = count - (particlesPerBird * numBirds);

  // Bird local triangle vertices (from attached BirdGeometry: wingsSpan = 20, scale = 0.045)
  // Body: (0, 0, -0.9), (0, 0.18, -0.9), (0, 0, 1.35)
  // Left Wing: (0, 0, -0.67), (-0.95, 0, 0), (0, 0, 0.67)
  // Right Wing: (0, 0, 0.67), (0.95, 0, 0), (0, 0, -0.67)
  const wingsSpan = 0.95;

  let pIdx = 0;

  for (let b = 0; b < numBirds; b++) {
    // 3D Flocking Path trajectory: Dynamic double-spiral vortex flocking formation
    const t = b / numBirds;
    const pathAngle = t * Math.PI * 6.5 + (Math.sin(t * Math.PI * 4) * 0.4);
    const pathRadius = 2.0 + 3.8 * Math.sin(t * Math.PI * 0.95) + (Math.random() - 0.5) * 0.8;
    const pathHeight = -4.5 + t * 9.0 + (Math.sin(pathAngle * 2) * 0.6);

    // Leader / Follower Boid Center
    const boidCenterX = pathRadius * Math.cos(pathAngle) + (Math.random() - 0.5) * 0.4;
    const boidCenterY = pathHeight + (Math.random() - 0.5) * 0.4;
    const boidCenterZ = pathRadius * Math.sin(pathAngle) + (Math.random() - 0.5) * 0.4;

    // Velocity Tangent Direction
    const nextAngle = pathAngle + 0.05;
    const nextR = pathRadius;
    const nextX = nextR * Math.cos(nextAngle);
    const nextZ = nextR * Math.sin(nextAngle);
    const dirX = nextX - boidCenterX;
    const dirY = 0.12 + Math.cos(pathAngle) * 0.08;
    const dirZ = nextZ - boidCenterZ;
    const dirLen = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ) || 1;
    const fwdX = dirX / dirLen;
    const fwdY = dirY / dirLen;
    const fwdZ = dirZ / dirLen;

    // Right & Up Vectors
    const rightX = -fwdZ;
    const rightY = 0;
    const rightZ = fwdX;
    const rLen = Math.sqrt(rightX * rightX + rightZ * rightZ) || 1;
    const normRX = rightX / rLen;
    const normRZ = rightZ / rLen;

    const upX = -fwdY * normRZ;
    const upY = fwdX * normRZ - fwdZ * normRX;
    const upZ = fwdY * normRX;

    // Wing flapping phase offset
    const flapPhase = (t * 24.0 + b * 1.3) % (Math.PI * 2);
    const flapAngle = Math.sin(flapPhase) * 0.38; // Wing flap deflection

    for (let p = 0; p < particlesPerBird; p++) {
      const u = Math.random();
      const v = Math.random();
      const partChoice = Math.random();

      let localX = 0, localY = 0, localZ = 0;
      let isWingTip = false;

      if (partChoice < 0.28) {
        // Body Triangle: (0, 0, -0.9) to (0, 0.18, -0.9) to (0, 0, 1.35)
        const w1 = 1 - Math.sqrt(u);
        const w2 = Math.sqrt(u) * (1 - v);
        const w3 = Math.sqrt(u) * v;

        localX = (Math.random() - 0.5) * 0.06;
        localY = w1 * 0.0 + w2 * 0.18 + w3 * 0.0;
        localZ = w1 * (-0.9) + w2 * (-0.9) + w3 * 1.35;
      } else if (partChoice < 0.64) {
        // Left Wing Triangle: (0, 0, -0.67) to (-wingsSpan, 0, 0) to (0, 0, 0.67)
        const w1 = 1 - Math.sqrt(u);
        const w2 = Math.sqrt(u) * (1 - v);
        const w3 = Math.sqrt(u) * v;

        const baseWingX = w1 * 0.0 + w2 * (-wingsSpan) + w3 * 0.0;
        const wingTipWeight = w2; // Higher near wingtip
        localX = baseWingX;
        localY = (w1 * 0.0 + w2 * 0.0 + w3 * 0.0) + (baseWingX * flapAngle) + (Math.random() - 0.5) * 0.04;
        localZ = w1 * (-0.67) + w2 * 0.0 + w3 * 0.67;
        if (wingTipWeight > 0.7) isWingTip = true;
      } else {
        // Right Wing Triangle: (0, 0, 0.67) to (wingsSpan, 0, 0) to (0, 0, -0.67)
        const w1 = 1 - Math.sqrt(u);
        const w2 = Math.sqrt(u) * (1 - v);
        const w3 = Math.sqrt(u) * v;

        const baseWingX = w1 * 0.0 + w2 * wingsSpan + w3 * 0.0;
        const wingTipWeight = w2;
        localX = baseWingX;
        localY = (w1 * 0.0 + w2 * 0.0 + w3 * 0.0) - (baseWingX * flapAngle) + (Math.random() - 0.5) * 0.04;
        localZ = w1 * 0.67 + w2 * 0.0 + w3 * (-0.67);
        if (wingTipWeight > 0.7) isWingTip = true;
      }

      // Rotate local coordinates to World Velocity Orientation
      const worldX = boidCenterX + (localX * normRX + localY * upX + localZ * fwdX);
      const worldY = boidCenterY + (localX * 0.0 + localY * upY + localZ * fwdY);
      const worldZ = boidCenterZ + (localX * normRZ + localY * upZ + localZ * fwdZ);

      positions[pIdx * 3 + 0] = worldX;
      positions[pIdx * 3 + 1] = worldY;
      positions[pIdx * 3 + 2] = worldZ;

      // Color Palette: GPGPU Aerodynamic iridescence (Cyan, Teal, Golden Wingtips, White beak)
      if (isWingTip) {
        // High-energy Wingtip Vortex (Electric Gold / Amber Glow)
        colors[pIdx * 3 + 0] = 1.0;
        colors[pIdx * 3 + 1] = 0.9;
        colors[pIdx * 3 + 2] = 0.2 + 0.5 * Math.sin(t * Math.PI * 4);
      } else if (localZ > 1.0) {
        // Beak / Head (Pure Laser White)
        colors[pIdx * 3 + 0] = 0.95;
        colors[pIdx * 3 + 1] = 1.0;
        colors[pIdx * 3 + 2] = 1.0;
      } else {
        // Body / Feather Plumes (Aerodynamic Cyan to Deep Indigo Gradient)
        const speedRatio = Math.sin(t * Math.PI) * 0.5 + 0.5;
        colors[pIdx * 3 + 0] = 0.05 + 0.25 * (1 - speedRatio);
        colors[pIdx * 3 + 1] = 0.75 + 0.25 * speedRatio;
        colors[pIdx * 3 + 2] = 1.0;
      }

      pIdx++;
    }
  }

  // 2. Ambient Aerodynamic Flowlines (Flocking Wind Streamlines)
  for (let i = pIdx; i < count; i++) {
    const t = Math.random();
    const angle = t * Math.PI * 6.5 + (Math.random() - 0.5) * 0.3;
    const r = 2.0 + 3.8 * Math.sin(t * Math.PI * 0.95) + (Math.random() - 0.5) * 1.5;
    const y = -4.5 + t * 9.0 + (Math.random() - 0.5) * 0.8;

    positions[i * 3 + 0] = r * Math.cos(angle);
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = r * Math.sin(angle);

    // Subtle Cyan Mist Streamlines
    colors[i * 3 + 0] = 0.1;
    colors[i * 3 + 1] = 0.55;
    colors[i * 3 + 2] = 0.9;
  }

  return { positions, colors };
}

/**
 * 23. ❄️ 3D 크리스탈 스노우 결정체 (Fractal Snowflake Dendrite Crystal)
 * 6방 대칭 덴드라이트 나뭇가지형 가지 + 육각 프리즘 코어 + 미세 얼음 결정 바늘
 */
/**
 * 24. 🌍 Three.js WebGPU 지구 & 대기권 글로브 (Earth Globe with Atmosphere & Continents)
 * 첨부파일(three.js webgpu - earth) 기반:
 * - 대륙(아시아, 유럽, 아메리카, 아프리카, 오세아니아, 남극) 지형 고도 및 식생/사막/빙하 색채
 * - 심해(Navy Blue) & 연안(Azure Cyan) 해양
 * - 3D 대기 구름층(Swirling Clouds)
 * - 1.04x 대기권 프레넬 글로우(#4db2ff 주간 대기색 + #bc490b 황혼 석양색)
 * - 야간 대륙 도시 불빛(City Night Lights)
 */
export function generateEarthGlobe(
  count: number,
  radius = 5.2
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Geographic continent test function based on spherical lat/lon
  const isLandmass = (latDeg: number, lonDeg: number): { isLand: boolean; elevation: number; type: 'polar' | 'forest' | 'desert' | 'mountain' } => {
    // 1. Antarctica
    if (latDeg < -62) {
      return { isLand: true, elevation: 0.12, type: 'polar' };
    }
    // 2. Greenland & Arctic
    if (latDeg > 60 && lonDeg > -60 && lonDeg < -15) {
      return { isLand: true, elevation: 0.1, type: 'polar' };
    }

    // Multi-octave spherical harmonic noise for organic coastlines
    const radLat = (latDeg * Math.PI) / 180;
    const radLon = (lonDeg * Math.PI) / 180;
    const nx = Math.cos(radLat) * Math.cos(radLon);
    const ny = Math.sin(radLat);
    const nz = Math.cos(radLat) * Math.sin(radLon);

    const n1 = Math.sin(nx * 4.2 + ny * 3.1) * Math.cos(nz * 4.5);
    const n2 = Math.sin(nx * 8.5 - nz * 7.2) * 0.4;
    const n3 = Math.sin(ny * 12.0 + nx * 10.0) * 0.2;
    const coastlineNoise = n1 + n2 + n3;

    let isLand = false;
    let type: 'polar' | 'forest' | 'desert' | 'mountain' = 'forest';
    let elevation = 0.05;

    // Eurasia
    if (latDeg > 5 && latDeg < 78 && lonDeg > -10 && lonDeg < 170) {
      if (coastlineNoise > -0.35) {
        isLand = true;
        if (latDeg > 18 && latDeg < 35 && lonDeg > 35 && lonDeg < 60) type = 'desert'; // Middle East
        else if (latDeg > 25 && latDeg < 40 && lonDeg > 70 && lonDeg < 105) {
          type = 'mountain'; // Himalayas / Tibet
          elevation = 0.22;
        } else if (latDeg > 65) type = 'polar';
        else type = 'forest';
      }
    }
    // Africa
    else if (latDeg > -36 && latDeg < 38 && lonDeg > -18 && lonDeg < 52) {
      if (coastlineNoise > -0.25) {
        isLand = true;
        if (latDeg > 12 && latDeg < 32) type = 'desert'; // Sahara
        else type = 'forest';
      }
    }
    // North America
    else if (latDeg > 10 && latDeg < 75 && lonDeg > -170 && lonDeg < -50) {
      if (coastlineNoise > -0.3) {
        isLand = true;
        if (lonDeg < -105 && latDeg > 30 && latDeg < 55) {
          type = 'mountain'; // Rockies
          elevation = 0.18;
        } else if (latDeg > 62) type = 'polar';
        else type = 'forest';
      }
    }
    // South America
    else if (latDeg > -56 && latDeg < 14 && lonDeg > -82 && lonDeg < -34) {
      if (coastlineNoise > -0.28) {
        isLand = true;
        if (lonDeg < -68) {
          type = 'mountain'; // Andes
          elevation = 0.2;
        } else type = 'forest'; // Amazon
      }
    }
    // Australia
    else if (latDeg > -44 && latDeg < -10 && lonDeg > 112 && lonDeg < 155) {
      if (coastlineNoise > -0.2) {
        isLand = true;
        if (lonDeg < 140) type = 'desert';
        else type = 'forest';
      }
    }

    return { isLand, elevation, type };
  };

  const atmosphereCount = Math.floor(count * 0.18);
  const cloudsCount = Math.floor(count * 0.14);
  const surfaceCount = count - atmosphereCount - cloudsCount;

  // 1. Earth Surface (Continents + Oceans + Mountains + Night Lights)
  for (let i = 0; i < surfaceCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI; // Longitude [0, 2pi]
    const phi = Math.acos(2.0 * v - 1.0); // Latitude [0, pi]

    const latDeg = 90 - (phi * 180) / Math.PI;
    let lonDeg = (theta * 180) / Math.PI - 180;

    const geo = isLandmass(latDeg, lonDeg);

    let r = radius;
    let rCol = 0.03, gCol = 0.12, bCol = 0.35; // Deep ocean base

    if (geo.isLand) {
      r = radius + geo.elevation + (Math.random() - 0.5) * 0.04;
      if (geo.type === 'polar') {
        rCol = 0.92; gCol = 0.96; bCol = 1.0;
      } else if (geo.type === 'desert') {
        rCol = 0.88; gCol = 0.68; bCol = 0.42; // Desert ochre
      } else if (geo.type === 'mountain') {
        rCol = 0.58; gCol = 0.45; bCol = 0.32; // Highland rock
      } else {
        // Forest / Plain
        rCol = 0.12 + Math.random() * 0.08;
        gCol = 0.52 + Math.random() * 0.18;
        bCol = 0.22 + Math.random() * 0.08;
      }

      // Night City Lights on night-facing hemisphere (30% probability)
      const sunAngle = Math.cos(theta);
      if (sunAngle < -0.2 && Math.random() < 0.35) {
        // Glowing warm amber city light cluster
        rCol = 1.0;
        gCol = 0.82 + Math.random() * 0.15;
        bCol = 0.35;
      }
    } else {
      // Ocean Coastal Shallows vs Abyssal Navy
      const shallowFactor = Math.sin(latDeg * 0.1) * 0.5 + 0.5;
      rCol = 0.02 + shallowFactor * 0.05;
      gCol = 0.18 + shallowFactor * 0.25;
      bCol = 0.55 + shallowFactor * 0.35;
    }

    // Apply Earth 23.5-degree axial tilt
    const tilt = (23.5 * Math.PI) / 180;
    const x0 = r * Math.sin(phi) * Math.cos(theta);
    const y0 = r * Math.cos(phi);
    const z0 = r * Math.sin(phi) * Math.sin(theta);

    const x = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
    const y = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
    const z = z0;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3 + 0] = rCol;
    colors[i * 3 + 1] = gCol;
    colors[i * 3 + 2] = bCol;
  }

  // 2. Swirling 3D Cloud Layer
  const cloudStart = surfaceCount;
  const cloudEnd = surfaceCount + cloudsCount;
  for (let i = cloudStart; i < cloudEnd; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    const r = radius + 0.14 + Math.random() * 0.06;
    const tilt = (23.5 * Math.PI) / 180;

    const x0 = r * Math.sin(phi) * Math.cos(theta);
    const y0 = r * Math.cos(phi);
    const z0 = r * Math.sin(phi) * Math.sin(theta);

    const x = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
    const y = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
    const z = z0;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Pure cloud white with subtle atmospheric tint
    colors[i * 3 + 0] = 0.95 + Math.random() * 0.05;
    colors[i * 3 + 1] = 0.97 + Math.random() * 0.03;
    colors[i * 3 + 2] = 1.0;
  }

  // 3. Atmosphere Fresnel Halo Layer (1.04x ~ 1.08x Scale Outer Glow)
  // Matching Three.js WebGPU atmosphereDayColor (#4db2ff) & atmosphereTwilightColor (#bc490b)
  for (let i = cloudEnd; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    // Outer atmosphere shell
    const r = radius * (1.04 + Math.pow(Math.random(), 1.5) * 0.08);
    const tilt = (23.5 * Math.PI) / 180;

    const x0 = r * Math.sin(phi) * Math.cos(theta);
    const y0 = r * Math.cos(phi);
    const z0 = r * Math.sin(phi) * Math.sin(theta);

    const x = x0 * Math.cos(tilt) - y0 * Math.sin(tilt);
    const y = x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
    const z = z0;

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Sun orientation simulation for twilight sunset gradient (#bc490b to #4db2ff)
    const sunOrientation = Math.cos(theta); // day vs twilight horizon
    if (sunOrientation > -0.1 && sunOrientation < 0.35) {
      // Twilight Sunset Horizon Glow (#bc490b -> rgb(0.737, 0.286, 0.043))
      const t = (sunOrientation + 0.1) / 0.45;
      colors[i * 3 + 0] = 0.74 * (1 - t) + 0.30 * t;
      colors[i * 3 + 1] = 0.29 * (1 - t) + 0.70 * t;
      colors[i * 3 + 2] = 0.04 * (1 - t) + 1.00 * t;
    } else if (sunOrientation >= 0.35) {
      // Day Atmosphere Azure Blue (#4db2ff -> rgb(0.302, 0.698, 1.0))
      colors[i * 3 + 0] = 0.30;
      colors[i * 3 + 1] = 0.70;
      colors[i * 3 + 2] = 1.0;
    } else {
      // Night auroral deep glow
      colors[i * 3 + 0] = 0.08;
      colors[i * 3 + 1] = 0.25;
      colors[i * 3 + 2] = 0.65;
    }
  }

  return { positions, colors };
}

export function generateSnowflakeCrystal(
  count: number,
  radius = 6.2,
  thickness = 0.85
): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // 6-fold symmetry configuration
  const numArms = 6;
  const armAngleStep = (Math.PI * 2) / numArms;

  // Sub-branch configuration (3 tiers of dendrite needles along each arm)
  const branchTiers = [
    { pos: 0.32, len: 1.4, angle: Math.PI / 3 },
    { pos: 0.55, len: 2.1, angle: Math.PI / 3 },
    { pos: 0.78, len: 1.6, angle: Math.PI / 3 },
    { pos: 0.92, len: 0.9, angle: Math.PI / 3 },
  ];

  for (let i = 0; i < count; i++) {
    const armIndex = i % numArms;
    const baseArmAngle = armIndex * armAngleStep;
    const sectionChoice = Math.random();

    let x = 0, y = 0, z = 0;
    let rCol = 0.85, gCol = 0.95, bCol = 1.0; // Glacial crystal white

    if (sectionChoice < 0.18) {
      // 1. Central Hexagonal Core Plate & Micro-Prism
      const u = Math.random();
      const hexR = Math.sqrt(u) * 1.6;
      const angle = (Math.floor(Math.random() * 6) * armAngleStep) + (Math.random() - 0.5) * (armAngleStep * 0.9);
      x = hexR * Math.cos(angle);
      y = (Math.random() - 0.5) * (thickness * 0.6);
      z = hexR * Math.sin(angle);

      // Diamond core sparkle
      rCol = 0.95;
      gCol = 0.98;
      bCol = 1.0;
    } else if (sectionChoice < 0.55) {
      // 2. Main 6 Radial Stem Spines
      const t = Math.pow(Math.random(), 0.85);
      const stemDist = t * radius;
      const stemThick = (1.0 - t * 0.7) * 0.25;

      const lx = stemDist + (Math.random() - 0.5) * stemThick;
      const ly = (Math.random() - 0.5) * (thickness * (1.0 - t * 0.5));
      const lz = (Math.random() - 0.5) * stemThick;

      // Rotate to arm angle
      x = lx * Math.cos(baseArmAngle) - lz * Math.sin(baseArmAngle);
      y = ly;
      z = lx * Math.sin(baseArmAngle) + lz * Math.cos(baseArmAngle);

      // Cyan to ice blue gradient along arm
      rCol = 0.7 + (1.0 - t) * 0.25;
      gCol = 0.88 + t * 0.1;
      bCol = 1.0;
    } else if (sectionChoice < 0.88) {
      // 3. Dendrite Side Needles & Secondary Branches
      const tier = branchTiers[Math.floor(Math.random() * branchTiers.length)];
      const sideSign = Math.random() < 0.5 ? 1 : -1;
      const branchProgress = Math.random();
      const bLen = tier.len * branchProgress;

      // Position along main stem
      const stemBaseX = tier.pos * radius;
      const branchAngle = baseArmAngle + (sideSign * tier.angle);

      const bx = stemBaseX * Math.cos(baseArmAngle) + bLen * Math.cos(branchAngle);
      const bz = stemBaseX * Math.sin(baseArmAngle) + bLen * Math.sin(branchAngle);
      const by = (Math.random() - 0.5) * (thickness * 0.45);

      // Sub-needle offshoot on secondary branches (fractal tier 3)
      if (branchProgress > 0.45 && Math.random() < 0.4) {
        const subAngle = branchAngle - (sideSign * (Math.PI / 3));
        const subLen = 0.45 * Math.random();
        x = bx + subLen * Math.cos(subAngle);
        z = bz + subLen * Math.sin(subAngle);
      } else {
        x = bx;
        z = bz;
      }
      y = by;

      // Crystalline frost highlights
      rCol = 0.6 + branchProgress * 0.35;
      gCol = 0.85 + (1.0 - branchProgress) * 0.15;
      bCol = 1.0;
    } else {
      // 4. Floating Atmospheric Frost Flakes & Stellar Ice Needles
      const u = Math.random();
      const v = Math.random();
      const starAngle = u * Math.PI * 2;
      const starR = Math.pow(v, 0.6) * (radius * 1.15);

      x = starR * Math.cos(starAngle);
      y = (Math.random() - 0.5) * (thickness * 2.2);
      z = starR * Math.sin(starAngle);

      // Shimmering prism violet-cyan ice tint
      rCol = 0.75 + Math.sin(starAngle * 3) * 0.2;
      gCol = 0.85 + Math.cos(starAngle * 3) * 0.15;
      bCol = 1.0;
    }

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    colors[i * 3 + 0] = Math.min(1.0, Math.max(0.0, rCol));
    colors[i * 3 + 1] = Math.min(1.0, Math.max(0.0, gCol));
    colors[i * 3 + 2] = Math.min(1.0, Math.max(0.0, bCol));
  }

  return { positions, colors };
}
