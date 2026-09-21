import * as THREE from 'three';
import { MorphConfig, MorphShape } from '../types';

// Fast Simplex-like 3D Noise approximation for field visualization
function hash33(x: number, y: number, z: number): [number, number, number] {
  const pX = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  const pY = Math.sin(x * 39.346 + y * 11.135 + z * 83.155) * 43758.5453;
  const pZ = Math.sin(x * 73.156 + y * 52.453 + z * 28.193) * 43758.5453;
  return [
    (pX - Math.floor(pX)) * 2 - 1,
    (pY - Math.floor(pY)) * 2 - 1,
    (pZ - Math.floor(pZ)) * 2 - 1,
  ];
}

export function sampleNoiseVector(
  x: number,
  y: number,
  z: number,
  time: number,
  noiseType: string,
  freq: number,
  speed: number,
  amp: number
): [number, number, number] {
  const t = time * speed;
  const fx = x * freq * 0.15;
  const fy = y * freq * 0.15;
  const fz = z * freq * 0.15;

  if (noiseType === 'vortex') {
    const r = Math.sqrt(x * x + z * z) + 0.001;
    const angle = Math.atan2(z, x) + t * 0.8;
    const vX = -Math.sin(angle) * (1.0 / (r * 0.2 + 1.0)) * amp;
    const vY = Math.sin(r * 0.5 - t * 1.5) * amp * 0.5;
    const vZ = Math.cos(angle) * (1.0 / (r * 0.2 + 1.0)) * amp;
    return [vX, vY, vZ];
  }

  if (noiseType === 'turbulence') {
    const vX = Math.sin(fy + t) * Math.cos(fz * 0.8 - t * 0.5) * amp;
    const vY = Math.cos(fx + t * 0.7) * Math.sin(fz + t) * amp;
    const vZ = Math.sin(fx * 0.8 - t * 0.6) * Math.cos(fy + t * 0.8) * amp;
    return [vX, vY, vZ];
  }

  if (noiseType === 'simplex') {
    const [h1x, h1y, h1z] = hash33(Math.floor(fx + t * 0.3), Math.floor(fy), Math.floor(fz));
    const [h2x, h2y, h2z] = hash33(Math.floor(fx), Math.floor(fy + t * 0.3), Math.floor(fz));
    return [h1x * amp, (h1y + h2y) * 0.5 * amp, h2z * amp];
  }

  // Default: Curl Noise (divergence-free rotational field)
  const eps = 0.1;
  const n1 = Math.sin((fy + eps) + t) * Math.cos(fz) - Math.sin((fy - eps) + t) * Math.cos(fz);
  const n2 = Math.sin(fx) * Math.cos((fz + eps) + t) - Math.sin(fx) * Math.cos((fz - eps) + t);
  const n3 = Math.sin((fx + eps) + t) * Math.cos(fy) - Math.sin((fx - eps) + t) * Math.cos(fy);

  const curlX = (n1 / (2 * eps)) * amp;
  const curlY = (n2 / (2 * eps)) * amp;
  const curlZ = (n3 / (2 * eps)) * amp;
  return [curlX, curlY, curlZ];
}

export interface PhysicsDebugMetrics {
  totalAttractionForce: number;
  noiseVorticity: number;
  gravityMagnitude: number;
  netKineticEnergy: number;
  activeVectorsCount: number;
}

export class PhysicsFieldVisualizer {
  public group: THREE.Group;

  // Visual sub-elements
  private noiseLines: THREE.LineSegments;
  private attractionLines: THREE.LineSegments;
  private gravityLines: THREE.LineSegments;
  private velocityLines: THREE.LineSegments;
  private boundingBoxHelper: THREE.Box3Helper;
  private mouseInfluenceMesh: THREE.Mesh;
  private blackHoleMesh: THREE.Mesh;

  // Geometry attributes for real-time streaming
  private maxVectors: number = 3000;
  private noisePosAttr: THREE.BufferAttribute;
  private noiseColAttr: THREE.BufferAttribute;
  private attrPosAttr: THREE.BufferAttribute;
  private attrColAttr: THREE.BufferAttribute;
  private gravPosAttr: THREE.BufferAttribute;
  private gravColAttr: THREE.BufferAttribute;
  private velPosAttr: THREE.BufferAttribute;
  private velColAttr: THREE.BufferAttribute;

  public metrics: PhysicsDebugMetrics = {
    totalAttractionForce: 0,
    noiseVorticity: 0,
    gravityMagnitude: 0,
    netKineticEnergy: 0,
    activeVectorsCount: 0,
  };

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PhysicsFieldVisualizer';

    // 1. Noise Field Lines (Cyan #00F0FF)
    const noiseGeo = new THREE.BufferGeometry();
    const noisePositions = new Float32Array(this.maxVectors * 6);
    const noiseColors = new Float32Array(this.maxVectors * 6);
    this.noisePosAttr = new THREE.BufferAttribute(noisePositions, 3);
    this.noiseColAttr = new THREE.BufferAttribute(noiseColors, 3);
    noiseGeo.setAttribute('position', this.noisePosAttr);
    noiseGeo.setAttribute('color', this.noiseColAttr);
    const noiseMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.noiseLines = new THREE.LineSegments(noiseGeo, noiseMat);
    this.group.add(this.noiseLines);

    // 2. Attraction Force Lines (Gold / Neon Yellow #FFE600)
    const attrGeo = new THREE.BufferGeometry();
    const attrPositions = new Float32Array(this.maxVectors * 6);
    const attrColors = new Float32Array(this.maxVectors * 6);
    this.attrPosAttr = new THREE.BufferAttribute(attrPositions, 3);
    this.attrColAttr = new THREE.BufferAttribute(attrColors, 3);
    attrGeo.setAttribute('position', this.attrPosAttr);
    attrGeo.setAttribute('color', this.attrColAttr);
    const attrMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.attractionLines = new THREE.LineSegments(attrGeo, attrMat);
    this.group.add(this.attractionLines);

    // 3. Gravity Force Lines (Hot Pink / Magenta #FF007F)
    const gravGeo = new THREE.BufferGeometry();
    const gravPositions = new Float32Array(1000 * 6);
    const gravColors = new Float32Array(1000 * 6);
    this.gravPosAttr = new THREE.BufferAttribute(gravPositions, 3);
    this.gravColAttr = new THREE.BufferAttribute(gravColors, 3);
    gravGeo.setAttribute('position', this.gravPosAttr);
    gravGeo.setAttribute('color', this.gravColAttr);
    const gravMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.gravityLines = new THREE.LineSegments(gravGeo, gravMat);
    this.group.add(this.gravityLines);

    // 4. Instantaneous Velocity Vectors (Spring Green #00FF66)
    const velGeo = new THREE.BufferGeometry();
    const velPositions = new Float32Array(1500 * 6);
    const velColors = new Float32Array(1500 * 6);
    this.velPosAttr = new THREE.BufferAttribute(velPositions, 3);
    this.velColAttr = new THREE.BufferAttribute(velColors, 3);
    velGeo.setAttribute('position', this.velPosAttr);
    velGeo.setAttribute('color', this.velColAttr);
    const velMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.velocityLines = new THREE.LineSegments(velGeo, velMat);
    this.group.add(this.velocityLines);

    // 5. Bounding Box & 3D Lattice Helper
    const box = new THREE.Box3(new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, 10, 10));
    this.boundingBoxHelper = new THREE.Box3Helper(box, new THREE.Color(0x334455));
    this.group.add(this.boundingBoxHelper);

    // 6. Mouse Influence Sphere
    const mouseGeo = new THREE.SphereGeometry(1, 16, 16);
    const mouseMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.mouseInfluenceMesh = new THREE.Mesh(mouseGeo, mouseMat);
    this.mouseInfluenceMesh.visible = false;
    this.group.add(this.mouseInfluenceMesh);

    // 7. Black Hole Event Horizon Singularity Sphere
    const bhGeo = new THREE.SphereGeometry(1, 24, 24);
    const bhMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.blackHoleMesh = new THREE.Mesh(bhGeo, bhMat);
    this.blackHoleMesh.visible = false;
    this.group.add(this.blackHoleMesh);
  }

  public setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  public update(
    time: number,
    config: MorphConfig,
    sourceShape: MorphShape,
    targetShape: MorphShape,
    mouse3D: THREE.Vector3,
    isMouseActive: boolean,
    currentProgress: number,
    particleRotation: number = 0
  ) {
    if (!config.physicsDebugEnabled) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    const vScale = (config.physicsDebugVectorScale ?? 1.0) * 1.5;
    const density = Math.max(3, Math.min(10, config.physicsDebugDensity ?? 6));
    const showNoise = config.physicsDebugShowNoise !== false;
    const showAttr = config.physicsDebugShowAttraction !== false;
    const showGrav = config.physicsDebugShowGravity !== false;
    const showVel = config.physicsDebugShowVelocity !== false;
    const showGrid = config.physicsDebugShowGrid !== false;

    this.boundingBoxHelper.visible = showGrid;
    this.noiseLines.visible = showNoise;
    this.attractionLines.visible = showAttr;
    this.gravityLines.visible = showGrav;
    this.velocityLines.visible = showVel;

    // -------------------------------------------------------------
    // 1. Compute & Render 3D Noise Flow Field (Grid Sampling)
    // -------------------------------------------------------------
    let noiseVecCount = 0;
    let totalVorticity = 0;
    const nPosArr = this.noisePosAttr.array as Float32Array;
    const nColArr = this.noiseColAttr.array as Float32Array;

    if (showNoise) {
      const step = 16.0 / (density - 1);
      const half = 8.0;

      for (let x = -half; x <= half; x += step) {
        for (let y = -half; y <= half; y += step) {
          for (let z = -half; z <= half; z += step) {
            if (noiseVecCount >= this.maxVectors) break;

            const [vx, vy, vz] = sampleNoiseVector(
              x,
              y,
              z,
              time,
              config.noiseType,
              config.noiseFreq,
              config.noiseSpeed,
              config.noiseAmp
            );

            const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
            totalVorticity += mag;

            const idx = noiseVecCount * 6;
            // Line Start
            nPosArr[idx] = x;
            nPosArr[idx + 1] = y;
            nPosArr[idx + 2] = z;

            // Line End (Scaled Vector Tip)
            nPosArr[idx + 3] = x + vx * vScale * 0.7;
            nPosArr[idx + 4] = y + vy * vScale * 0.7;
            nPosArr[idx + 5] = z + vz * vScale * 0.7;

            // Color Gradient: Cyan root -> White tip based on magnitude
            const intensity = Math.min(1.0, mag * 0.5);
            nColArr[idx] = 0.0;
            nColArr[idx + 1] = 0.5 + intensity * 0.5;
            nColArr[idx + 2] = 1.0;

            nColArr[idx + 3] = 0.4 + intensity * 0.6;
            nColArr[idx + 4] = 0.9 + intensity * 0.1;
            nColArr[idx + 5] = 1.0;

            noiseVecCount++;
          }
        }
      }
    }
    this.noisePosAttr.needsUpdate = true;
    this.noiseColAttr.needsUpdate = true;
    this.noiseLines.geometry.setDrawRange(0, noiseVecCount * 2);

    // -------------------------------------------------------------
    // 2. Compute & Render Morph Attraction Vectors (Sampled Particles)
    // -------------------------------------------------------------
    let attrVecCount = 0;
    let totalAttrForce = 0;
    const aPosArr = this.attrPosAttr.array as Float32Array;
    const aColArr = this.attrColAttr.array as Float32Array;

    if (showAttr && sourceShape && targetShape) {
      const srcPos = sourceShape.positions;
      const dstPos = targetShape.positions;
      const sampleStride = Math.max(1, Math.floor(srcPos.length / (3 * 250)));
      const t = currentProgress;

      for (let i = 0; i < srcPos.length / 3; i += sampleStride) {
        if (attrVecCount >= this.maxVectors) break;

        const idx3 = i * 3;
        const sx = srcPos[idx3 % srcPos.length];
        const sy = srcPos[(idx3 + 1) % srcPos.length];
        const sz = srcPos[(idx3 + 2) % srcPos.length];

        const dx = dstPos[idx3 % dstPos.length];
        const dy = dstPos[(idx3 + 1) % dstPos.length];
        const dz = dstPos[(idx3 + 2) % dstPos.length];

        // Current interpolated pos
        const curX = sx + (dx - sx) * t;
        const curY = sy + (dy - sy) * t;
        const curZ = sz + (dz - sz) * t;

        // Attraction vector toward target destination
        const toDstX = dx - curX;
        const toDstY = dy - curY;
        const toDstZ = dz - curZ;
        const dist = Math.sqrt(toDstX * toDstX + toDstY * toDstY + toDstZ * toDstZ) + 0.001;
        totalAttrForce += dist;

        const lIdx = attrVecCount * 6;
        aPosArr[lIdx] = curX;
        aPosArr[lIdx + 1] = curY;
        aPosArr[lIdx + 2] = curZ;

        // Vector arrow points toward target
        aPosArr[lIdx + 3] = curX + toDstX * 0.45 * vScale;
        aPosArr[lIdx + 4] = curY + toDstY * 0.45 * vScale;
        aPosArr[lIdx + 5] = curZ + toDstZ * 0.45 * vScale;

        // Gold / Neon Yellow Gradient
        aColArr[lIdx] = 1.0;
        aColArr[lIdx + 1] = 0.85;
        aColArr[lIdx + 2] = 0.0;

        aColArr[lIdx + 3] = 1.0;
        aColArr[lIdx + 4] = 1.0;
        aColArr[lIdx + 5] = 0.5;

        attrVecCount++;
      }
    }
    this.attrPosAttr.needsUpdate = true;
    this.attrColAttr.needsUpdate = true;
    this.attractionLines.geometry.setDrawRange(0, attrVecCount * 2);

    // -------------------------------------------------------------
    // 3. Compute & Render Gravity & Singularity Vectors
    // -------------------------------------------------------------
    let gravVecCount = 0;
    let totalGravMag = 0;
    const gPosArr = this.gravPosAttr.array as Float32Array;
    const gColArr = this.gravColAttr.array as Float32Array;

    const mouseGravityRadius = config.mouseGravityRadius ?? 6.0;
    const mouseGravityStrength = config.mouseGravityStrength ?? 3.5;
    const isMouseGravActive = config.mouseGravityEnabled !== false && isMouseActive;

    // Mouse Influence Mesh
    if (isMouseGravActive && showGrav) {
      this.mouseInfluenceMesh.visible = true;
      this.mouseInfluenceMesh.position.copy(mouse3D);
      this.mouseInfluenceMesh.scale.setScalar(mouseGravityRadius);
    } else {
      this.mouseInfluenceMesh.visible = false;
    }

    // Black Hole Singularity Mesh
    if (config.blackHoleEnabled && showGrav) {
      this.blackHoleMesh.visible = true;
      const bhRadius = config.blackHoleRadius ?? 7.0;
      this.blackHoleMesh.scale.setScalar(bhRadius * 0.3);
      this.blackHoleMesh.rotation.y = time * 0.5;
    } else {
      this.blackHoleMesh.visible = false;
    }

    if (showGrav) {
      // Sample radial ring of gravity vectors converging on mouse position
      if (isMouseGravActive) {
        const rings = 32;
        for (let i = 0; i < rings; i++) {
          if (gravVecCount >= 1000) break;
          const theta = (i / rings) * Math.PI * 2;
          const rx = mouse3D.x + Math.cos(theta) * mouseGravityRadius;
          const ry = mouse3D.y + Math.sin(theta) * mouseGravityRadius;
          const rz = mouse3D.z;

          let dirX = mouse3D.x - rx;
          let dirY = mouse3D.y - ry;
          let dirZ = mouse3D.z - rz;

          if (config.mouseGravityMode === 'repel') {
            dirX = -dirX;
            dirY = -dirY;
            dirZ = -dirZ;
          } else if (config.mouseGravityMode === 'vortex') {
            const tempX = -dirY;
            const tempY = dirX;
            dirX = tempX;
            dirY = tempY;
          }

          const mag = mouseGravityStrength;
          totalGravMag += mag;

          const lIdx = gravVecCount * 6;
          gPosArr[lIdx] = rx;
          gPosArr[lIdx + 1] = ry;
          gPosArr[lIdx + 2] = rz;

          gPosArr[lIdx + 3] = rx + dirX * 0.3 * vScale;
          gPosArr[lIdx + 4] = ry + dirY * 0.3 * vScale;
          gPosArr[lIdx + 5] = rz + dirZ * 0.3 * vScale;

          // Hot Magenta / Pink Gradient
          gColArr[lIdx] = 1.0;
          gColArr[lIdx + 1] = 0.0;
          gColArr[lIdx + 2] = 0.5;

          gColArr[lIdx + 3] = 1.0;
          gColArr[lIdx + 4] = 0.6;
          gColArr[lIdx + 5] = 0.9;

          gravVecCount++;
        }
      }

      // Black Hole Accretion Vectors
      if (config.blackHoleEnabled) {
        const bhRings = 24;
        const bhMass = config.blackHoleMass ?? 3.0;
        const bhRadius = config.blackHoleRadius ?? 7.0;

        for (let i = 0; i < bhRings; i++) {
          if (gravVecCount >= 1000) break;
          const angle = (i / bhRings) * Math.PI * 2 + time * 0.6;
          const bx = Math.cos(angle) * bhRadius;
          const by = Math.sin(angle * 2) * (bhRadius * 0.25);
          const bz = Math.sin(angle) * bhRadius;

          const toCenterX = -bx;
          const toCenterY = -by;
          const toCenterZ = -bz;

          totalGravMag += bhMass;

          const lIdx = gravVecCount * 6;
          gPosArr[lIdx] = bx;
          gPosArr[lIdx + 1] = by;
          gPosArr[lIdx + 2] = bz;

          // Inward spiral vector
          const spiralX = toCenterX * 0.5 - Math.sin(angle) * (bhRadius * 0.3);
          const spiralY = toCenterY * 0.5;
          const spiralZ = toCenterZ * 0.5 + Math.cos(angle) * (bhRadius * 0.3);

          gPosArr[lIdx + 3] = bx + spiralX * 0.4 * vScale;
          gPosArr[lIdx + 4] = by + spiralY * 0.4 * vScale;
          gPosArr[lIdx + 5] = bz + spiralZ * 0.4 * vScale;

          gColArr[lIdx] = 0.7;
          gColArr[lIdx + 1] = 0.0;
          gColArr[lIdx + 2] = 1.0;

          gColArr[lIdx + 3] = 1.0;
          gColArr[lIdx + 4] = 0.3;
          gColArr[lIdx + 5] = 0.8;

          gravVecCount++;
        }
      }
    }
    this.gravPosAttr.needsUpdate = true;
    this.gravColAttr.needsUpdate = true;
    this.gravityLines.geometry.setDrawRange(0, gravVecCount * 2);

    // -------------------------------------------------------------
    // 4. Compute & Render Instantaneous Net Velocity Vectors
    // -------------------------------------------------------------
    let velVecCount = 0;
    let netKinetic = 0;
    const vPosArr = this.velPosAttr.array as Float32Array;
    const vColArr = this.velColAttr.array as Float32Array;

    if (showVel && sourceShape && targetShape) {
      const srcPos = sourceShape.positions;
      const dstPos = targetShape.positions;
      const sampleStride = Math.max(1, Math.floor(srcPos.length / (3 * 180)));
      const t = currentProgress;

      for (let i = 0; i < srcPos.length / 3; i += sampleStride) {
        if (velVecCount >= 1500) break;
        const idx3 = i * 3;
        const sx = srcPos[idx3 % srcPos.length];
        const sy = srcPos[(idx3 + 1) % srcPos.length];
        const sz = srcPos[(idx3 + 2) % srcPos.length];

        const dx = dstPos[idx3 % dstPos.length];
        const dy = dstPos[(idx3 + 1) % dstPos.length];
        const dz = dstPos[(idx3 + 2) % dstPos.length];

        const curX = sx + (dx - sx) * t;
        const curY = sy + (dy - sy) * t;
        const curZ = sz + (dz - sz) * t;

        // Sample noise at this position
        const [nx, ny, nz] = sampleNoiseVector(
          curX,
          curY,
          curZ,
          time,
          config.noiseType,
          config.noiseFreq,
          config.noiseSpeed,
          config.noiseAmp
        );

        // Target morph attraction delta
        const toDstX = (dx - sx) * (config.playSpeed || 1.0) * 0.6;
        const toDstY = (dy - sy) * (config.playSpeed || 1.0) * 0.6;
        const toDstZ = (dz - sz) * (config.playSpeed || 1.0) * 0.6;

        // Net combined vector
        const netVx = toDstX + nx * 0.8;
        const netVy = toDstY + ny * 0.8;
        const netVz = toDstZ + nz * 0.8;
        const vMag = Math.sqrt(netVx * netVx + netVy * netVy + netVz * netVz);
        netKinetic += vMag * vMag * 0.5;

        const lIdx = velVecCount * 6;
        vPosArr[lIdx] = curX;
        vPosArr[lIdx + 1] = curY;
        vPosArr[lIdx + 2] = curZ;

        vPosArr[lIdx + 3] = curX + netVx * 0.25 * vScale;
        vPosArr[lIdx + 4] = curY + netVy * 0.25 * vScale;
        vPosArr[lIdx + 5] = curZ + netVz * 0.25 * vScale;

        // Spring Green #00FF66 -> Emerald
        vColArr[lIdx] = 0.0;
        vColArr[lIdx + 1] = 1.0;
        vColArr[lIdx + 2] = 0.4;

        vColArr[lIdx + 3] = 0.8;
        vColArr[lIdx + 4] = 1.0;
        vColArr[lIdx + 5] = 0.8;

        velVecCount++;
      }
    }
    this.velPosAttr.needsUpdate = true;
    this.velColAttr.needsUpdate = true;
    this.velocityLines.geometry.setDrawRange(0, velVecCount * 2);

    // Update real-time metrics
    this.metrics = {
      totalAttractionForce: parseFloat((totalAttrForce / Math.max(1, attrVecCount)).toFixed(2)),
      noiseVorticity: parseFloat((totalVorticity / Math.max(1, noiseVecCount)).toFixed(2)),
      gravityMagnitude: parseFloat(totalGravMag.toFixed(2)),
      netKineticEnergy: parseFloat((netKinetic / Math.max(1, velVecCount)).toFixed(2)),
      activeVectorsCount: noiseVecCount + attrVecCount + gravVecCount + velVecCount,
    };
  }

  public dispose() {
    this.noiseLines.geometry.dispose();
    (this.noiseLines.material as THREE.Material).dispose();
    this.attractionLines.geometry.dispose();
    (this.attractionLines.material as THREE.Material).dispose();
    this.gravityLines.geometry.dispose();
    (this.gravityLines.material as THREE.Material).dispose();
    this.velocityLines.geometry.dispose();
    (this.velocityLines.material as THREE.Material).dispose();
    this.mouseInfluenceMesh.geometry.dispose();
    (this.mouseInfluenceMesh.material as THREE.Material).dispose();
    this.blackHoleMesh.geometry.dispose();
    (this.blackHoleMesh.material as THREE.Material).dispose();
    this.boundingBoxHelper.dispose();
  }
}
