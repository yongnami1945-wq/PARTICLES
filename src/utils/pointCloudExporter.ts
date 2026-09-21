// 3D Point Cloud & CNC G-Code Exporter for Laser Engraving, 3D Printing, CAD/CAM & VFX
// Supports: .gcode, .nc, .xyz, .csv, .pts, .ply, .obj

export interface GCodeExportOptions {
  mode: 'laser_pulse' | 'laser_vector' | 'cnc_3d_relief';
  dialect: 'grbl' | 'marlin' | 'reprap' | 'mach3' | 'generic';
  bedWidth: number; // in mm, e.g. 200
  bedHeight: number; // in mm, e.g. 200
  origin: 'center' | 'bottom_left';
  scaleMm: number; // target bounding box size in mm, e.g. 100
  maxPoints: number; // point downsampling limit, e.g. 5000 or 60000
  laserPowerMax: number; // e.g. 1000 (GRBL) or 255 (Marlin)
  laserPowerMin: number; // e.g. 0
  feedrateEngrave: number; // mm/min, e.g. 1500
  feedrateTravel: number; // mm/min, e.g. 4000
  pulseDwellMs: number; // dwell time in ms for pulse mode, e.g. 10
  enableZRelief: boolean;
  zMaxDepth: number; // mm, e.g. 5.0
  zSafeHeight: number; // mm, e.g. 3.0
  laserOnCommand?: string; // default M3 or M4
  laserOffCommand?: string; // default M5
  invertPower?: boolean; // Invert luminance to power
}

export interface XYZExportOptions {
  includeColors?: boolean;
  includeNormals?: boolean;
  delimiter?: 'space' | 'comma' | 'tab' | 'semicolon';
  scaleMm?: number;
  maxPoints?: number;
  headerComment?: string;
}

export interface GCodeStats {
  pointCount: number;
  totalPointsOriginal: number;
  estimatedTimeSec: number;
  totalTravelMm: number;
  totalEngraveMm: number;
  boundsMm: {
    minX: number; maxX: number;
    minY: number; maxY: number;
    minZ: number; maxZ: number;
    sizeX: number; sizeY: number; sizeZ: number;
  };
}

/**
 * Standard Space/Delimiter Separated XYZ Point Cloud Exporter (.xyz, .pts, .txt)
 * Compatible with MeshLab, CloudCompare, AutoCAD, Rhino, SolidWorks, Blender, Geomagic, 3D Slicers
 */
export function exportPointCloudXYZ(
  positions: Float32Array,
  colors?: Float32Array,
  filename = 'particle_point_cloud.xyz',
  options: XYZExportOptions = {}
) {
  const delimiter = options.delimiter === 'comma' ? ',' : options.delimiter === 'tab' ? '\t' : options.delimiter === 'semicolon' ? ';' : ' ';
  const totalCount = Math.floor(positions.length / 3);
  const maxPts = options.maxPoints && options.maxPoints < totalCount ? options.maxPoints : totalCount;
  const step = Math.max(1, Math.floor(totalCount / maxPts));

  const lines: string[] = [];
  if (options.headerComment) {
    lines.push(`# ${options.headerComment}`);
  }
  lines.push(`# Particle Morphing Studio XYZ Point Cloud Export`);
  lines.push(`# Exported Points: ${Math.ceil(totalCount / step)} / Total Available: ${totalCount}`);

  for (let i = 0; i < totalCount; i += step) {
    const x = positions[i * 3].toFixed(4);
    const y = positions[i * 3 + 1].toFixed(4);
    const z = positions[i * 3 + 2].toFixed(4);

    if (options.includeColors && colors && colors.length >= (i + 1) * 3) {
      const r = Math.min(255, Math.max(0, Math.floor((colors[i * 3] || 1) * 255)));
      const g = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 1] || 1) * 255)));
      const b = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 2] || 1) * 255)));
      lines.push(`${x}${delimiter}${y}${delimiter}${z}${delimiter}${r}${delimiter}${g}${delimiter}${b}`);
    } else {
      lines.push(`${x}${delimiter}${y}${delimiter}${z}`);
    }
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Standard CSV Point Cloud Exporter (.csv)
 */
export function exportPointCloudCSV(
  positions: Float32Array,
  colors?: Float32Array,
  filename = 'particle_point_cloud.csv',
  options: XYZExportOptions = {}
) {
  const totalCount = Math.floor(positions.length / 3);
  const maxPts = options.maxPoints && options.maxPoints < totalCount ? options.maxPoints : totalCount;
  const step = Math.max(1, Math.floor(totalCount / maxPts));

  const lines: string[] = ['x,y,z,r,g,b,intensity'];

  for (let i = 0; i < totalCount; i += step) {
    const x = positions[i * 3].toFixed(4);
    const y = positions[i * 3 + 1].toFixed(4);
    const z = positions[i * 3 + 2].toFixed(4);

    let r = 255, g = 255, b = 255;
    if (colors && colors.length >= (i + 1) * 3) {
      r = Math.min(255, Math.max(0, Math.floor((colors[i * 3] || 1) * 255)));
      g = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 1] || 1) * 255)));
      b = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 2] || 1) * 255)));
    }
    const intensity = ((0.299 * r + 0.587 * g + 0.114 * b) / 255).toFixed(3);
    lines.push(`${x},${y},${z},${r},${g},${b},${intensity}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Standard PLY Exporter (.ply)
 */
export function exportPointCloudPLY(
  positions: Float32Array,
  colors: Float32Array,
  filename = 'particle_morph_cloud.ply'
) {
  const count = Math.floor(positions.length / 3);
  const header = [
    'ply',
    'format ascii 1.0',
    'comment Particle Morphing Studio 3D Point Cloud Export',
    `element vertex ${count}`,
    'property float x',
    'property float y',
    'property float z',
    'property uchar red',
    'property uchar green',
    'property uchar blue',
    'end_header',
  ].join('\n');

  const lines: string[] = [header];
  for (let i = 0; i < count; i++) {
    const x = positions[i * 3].toFixed(4);
    const y = positions[i * 3 + 1].toFixed(4);
    const z = positions[i * 3 + 2].toFixed(4);
    const r = Math.min(255, Math.max(0, Math.floor((colors[i * 3] || 1) * 255)));
    const g = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 1] || 1) * 255)));
    const b = Math.min(255, Math.max(0, Math.floor((colors[i * 3 + 2] || 1) * 255)));
    lines.push(`${x} ${y} ${z} ${r} ${g} ${b}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Standard Wavefront OBJ Point Cloud Exporter (.obj)
 */
export function exportPointCloudOBJ(
  positions: Float32Array,
  colors: Float32Array,
  filename = 'particle_morph_cloud.obj'
) {
  const count = Math.floor(positions.length / 3);
  const lines: string[] = [
    '# Particle Morphing Studio 3D Point Cloud OBJ Export',
    `# Vertex Count: ${count}`,
  ];

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3].toFixed(4);
    const y = positions[i * 3 + 1].toFixed(4);
    const z = positions[i * 3 + 2].toFixed(4);
    const r = (colors[i * 3] || 1).toFixed(4);
    const g = (colors[i * 3 + 1] || 1).toFixed(4);
    const b = (colors[i * 3 + 2] || 1).toFixed(4);
    lines.push(`v ${x} ${y} ${z} ${r} ${g} ${b}`);
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Calculate Bounding Box and Transformed Points for CNC & 3D Printing
 */
export function prepareCNCPoints(
  positions: Float32Array,
  colors: Float32Array | undefined,
  options: GCodeExportOptions
): {
  points: Array<{ x: number; y: number; z: number; power: number; intensity: number }>;
  stats: GCodeStats;
} {
  const totalCount = Math.floor(positions.length / 3);
  const maxPts = options.maxPoints && options.maxPoints < totalCount ? options.maxPoints : totalCount;
  const step = Math.max(1, Math.floor(totalCount / maxPts));

  // 1. Calculate raw bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < totalCount; i += step) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  if (!isFinite(minX)) {
    minX = -1; maxX = 1; minY = -1; maxY = 1; minZ = -1; maxZ = 1;
  }

  const spanX = Math.max(0.001, maxX - minX);
  const spanY = Math.max(0.001, maxY - minY);
  const spanZ = Math.max(0.001, maxZ - minZ);
  const maxSpan = Math.max(spanX, spanY);

  // Target scale in mm
  const scale = (options.scaleMm || 100) / maxSpan;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  // Origin offset
  const offsetX = options.origin === 'bottom_left' ? (options.bedWidth || 200) / 2 : 0;
  const offsetY = options.origin === 'bottom_left' ? (options.bedHeight || 200) / 2 : 0;

  const points: Array<{ x: number; y: number; z: number; power: number; intensity: number }> = [];

  for (let i = 0; i < totalCount; i += step) {
    const rawX = positions[i * 3];
    const rawY = positions[i * 3 + 1];
    const rawZ = positions[i * 3 + 2];

    const posX = (rawX - cx) * scale + offsetX;
    const posY = (rawY - cy) * scale + offsetY;
    const posZ = options.enableZRelief ? (rawZ - minZ) * (options.zMaxDepth / spanZ) : 0;

    let intensity = 1.0;
    if (colors && colors.length >= (i + 1) * 3) {
      const r = colors[i * 3] || 1;
      const g = colors[i * 3 + 1] || 1;
      const b = colors[i * 3 + 2] || 1;
      intensity = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const effectiveIntensity = options.invertPower ? 1.0 - intensity : intensity;
    const powerRange = (options.laserPowerMax || 1000) - (options.laserPowerMin || 0);
    const power = Math.round((options.laserPowerMin || 0) + effectiveIntensity * powerRange);

    points.push({
      x: parseFloat(posX.toFixed(3)),
      y: parseFloat(posY.toFixed(3)),
      z: parseFloat(posZ.toFixed(3)),
      power: Math.max(0, power),
      intensity
    });
  }

  // Optimize ordering if vector mode
  if (options.mode === 'laser_vector' && points.length > 1 && points.length <= 15000) {
    // Nearest-neighbor TSP heuristic to reduce rapid travel jumps
    const optimized: typeof points = [];
    const unvisited = new Set(points.map((_, idx) => idx));
    let curIdx = 0;
    optimized.push(points[curIdx]);
    unvisited.delete(curIdx);

    while (unvisited.size > 0 && optimized.length < points.length) {
      const curPt = points[curIdx];
      let nearestIdx = -1;
      let minDistSq = Infinity;

      // Sample a subset for performance if very large
      let checkCount = 0;
      for (const candidateIdx of unvisited) {
        const candidate = points[candidateIdx];
        const dx = curPt.x - candidate.x;
        const dy = curPt.y - candidate.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          nearestIdx = candidateIdx;
        }
        checkCount++;
        if (checkCount > 150) break; // Fast search
      }

      if (nearestIdx >= 0) {
        optimized.push(points[nearestIdx]);
        unvisited.delete(nearestIdx);
        curIdx = nearestIdx;
      } else {
        const next = unvisited.values().next().value;
        if (next !== undefined) {
          optimized.push(points[next]);
          unvisited.delete(next);
          curIdx = next;
        }
      }
    }
    points.length = 0;
    points.push(...optimized);
  } else if (options.mode === 'cnc_3d_relief') {
    // Sort by Z layer from bottom to top
    points.sort((a, b) => a.z - b.z);
  }

  // Calculate stats
  let totalTravelMm = 0;
  let totalEngraveMm = 0;
  let prevX = 0, prevY = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const dx = pt.x - prevX;
    const dy = pt.y - prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (options.mode === 'laser_vector') {
      totalEngraveMm += dist;
    } else {
      totalTravelMm += dist;
    }
    prevX = pt.x;
    prevY = pt.y;
  }

  const travelSpeedMmS = (options.feedrateTravel || 4000) / 60;
  const engraveSpeedMmS = (options.feedrateEngrave || 1500) / 60;
  const pulseDwellSec = ((options.pulseDwellMs || 10) / 1000) * points.length;
  
  const estimatedTimeSec = Math.round(
    (totalTravelMm / travelSpeedMmS) + 
    (totalEngraveMm / engraveSpeedMmS) + 
    (options.mode === 'laser_pulse' ? pulseDwellSec : 0) + 
    10 // Start/End buffer
  );

  let bMinX = Infinity, bMaxX = -Infinity;
  let bMinY = Infinity, bMaxY = -Infinity;
  let bMinZ = Infinity, bMaxZ = -Infinity;

  for (const pt of points) {
    if (pt.x < bMinX) bMinX = pt.x;
    if (pt.x > bMaxX) bMaxX = pt.x;
    if (pt.y < bMinY) bMinY = pt.y;
    if (pt.y > bMaxY) bMaxY = pt.y;
    if (pt.z < bMinZ) bMinZ = pt.z;
    if (pt.z > bMaxZ) bMaxZ = pt.z;
  }

  return {
    points,
    stats: {
      pointCount: points.length,
      totalPointsOriginal: totalCount,
      estimatedTimeSec,
      totalTravelMm: Math.round(totalTravelMm),
      totalEngraveMm: Math.round(totalEngraveMm),
      boundsMm: {
        minX: parseFloat(bMinX.toFixed(2)),
        maxX: parseFloat(bMaxX.toFixed(2)),
        minY: parseFloat(bMinY.toFixed(2)),
        maxY: parseFloat(bMaxY.toFixed(2)),
        minZ: parseFloat(bMinZ.toFixed(2)),
        maxZ: parseFloat(bMaxZ.toFixed(2)),
        sizeX: parseFloat((bMaxX - bMinX).toFixed(2)),
        sizeY: parseFloat((bMaxY - bMinY).toFixed(2)),
        sizeZ: parseFloat((bMaxZ - bMinZ).toFixed(2)),
      }
    }
  };
}

/**
 * Generate Industrial Standard G-Code (.gcode / .nc)
 * Supports LaserGRBL, LightBurn, Marlin, RepRap, Mach3, LinuxCNC
 */
export function generateGCode(
  positions: Float32Array,
  colors: Float32Array | undefined,
  options: GCodeExportOptions
): { gcode: string; stats: GCodeStats } {
  const { points, stats } = prepareCNCPoints(positions, colors, options);

  const laserOn = options.laserOnCommand || (options.dialect === 'grbl' ? 'M3' : 'M3');
  const laserOff = options.laserOffCommand || 'M5';
  const fTravel = options.feedrateTravel || 4000;
  const fEngrave = options.feedrateEngrave || 1500;
  const dwellP = (options.pulseDwellMs || 10).toFixed(0);

  const lines: string[] = [
    '; ===================================================================',
    '; Particle Morphing Studio - CNC Laser & 3D Point G-Code Export',
    `; Generator Version: 3.5-CNC / Dialect: ${options.dialect.toUpperCase()}`,
    `; Mode: ${options.mode.toUpperCase()}`,
    `; Total Generated Points: ${points.length} (Sampled from ${stats.totalPointsOriginal} pts)`,
    `; Work Area Bounding Box: ${stats.boundsMm.sizeX}mm x ${stats.boundsMm.sizeY}mm x ${stats.boundsMm.sizeZ}mm`,
    `; Coordinate Origin: ${options.origin === 'center' ? 'Center (0,0)' : 'Bottom-Left (Bed Offset)'}`,
    `; Feedrate: Travel F${fTravel} mm/min | Engrave F${fEngrave} mm/min`,
    `; Max Laser Power: S${options.laserPowerMax}`,
    `; Estimated Machining Time: ~${Math.floor(stats.estimatedTimeSec / 60)}m ${stats.estimatedTimeSec % 60}s`,
    '; ===================================================================',
    '',
    '; --- Machine Initialization ---',
    'G21          ; Set units to millimeters',
    'G90          ; Absolute positioning mode',
    'G94          ; Feedrate per minute mode',
    laserOff + '         ; Ensure laser/spindle is OFF',
  ];

  if (options.enableZRelief) {
    lines.push(`G0 Z${options.zSafeHeight.toFixed(2)} F${fTravel} ; Retract to safe Z height`);
  }

  if (options.dialect === 'marlin') {
    lines.push('M106 S0      ; Turn off fan/spindle');
  }

  lines.push('');
  lines.push('; --- Begin Toolpath Execution ---');

  if (options.mode === 'laser_pulse') {
    // Mode 1: Dot Pulse Firing (Ideal for point cloud halftone & laser stippling)
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      lines.push(`G0 X${pt.x} Y${pt.y} F${fTravel}`);
      if (options.enableZRelief) {
        lines.push(`G1 Z${pt.z} F${fEngrave}`);
      }
      lines.push(`${laserOn} S${pt.power}`);
      lines.push(`G4 P${dwellP}  ; Pulse dwell ${dwellP}ms`);
      lines.push(laserOff);
      if (options.enableZRelief) {
        lines.push(`G0 Z${options.zSafeHeight.toFixed(2)} F${fTravel}`);
      }
    }
  } else if (options.mode === 'laser_vector') {
    // Mode 2: Continuous Laser Vector Trace with Dynamic Power
    if (points.length > 0) {
      lines.push(`G0 X${points[0].x} Y${points[0].y} F${fTravel}`);
      lines.push(`${laserOn} S${points[0].power}`);
      for (let i = 1; i < points.length; i++) {
        const pt = points[i];
        lines.push(`G1 X${pt.x} Y${pt.y} S${pt.power} F${fEngrave}`);
      }
      lines.push(laserOff);
    }
  } else {
    // Mode 3: 3D Relief Layered Toolpath
    let curZ = -999;
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      if (Math.abs(pt.z - curZ) > 0.05) {
        curZ = pt.z;
        lines.push(`; --- Layer Z = ${curZ.toFixed(2)}mm ---`);
        lines.push(`G0 Z${options.zSafeHeight.toFixed(2)} F${fTravel}`);
        lines.push(`G0 X${pt.x} Y${pt.y} F${fTravel}`);
        lines.push(`G1 Z${pt.z} F${fEngrave}`);
        lines.push(`${laserOn} S${pt.power}`);
      } else {
        lines.push(`G1 X${pt.x} Y${pt.y} Z${pt.z} S${pt.power} F${fEngrave}`);
      }
    }
    lines.push(laserOff);
    lines.push(`G0 Z${options.zSafeHeight.toFixed(2)} F${fTravel}`);
  }

  lines.push('');
  lines.push('; --- Program End & Safe Park ---');
  lines.push(laserOff + '         ; Turn off laser');
  if (options.enableZRelief) {
    lines.push(`G0 Z${options.zSafeHeight.toFixed(2)} F${fTravel} ; Retract Z`);
  }
  lines.push(`G0 X0 Y0 F${fTravel}  ; Return to origin`);
  lines.push('M2           ; End of program');

  return {
    gcode: lines.join('\n'),
    stats
  };
}

/**
 * Export and Download G-Code File (.gcode / .nc / .tap)
 */
export function exportGCodeFile(
  positions: Float32Array,
  colors: Float32Array | undefined,
  filename = 'particle_laser_engraving.gcode',
  options: GCodeExportOptions
) {
  const { gcode } = generateGCode(positions, colors, options);
  const blob = new Blob([gcode], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
