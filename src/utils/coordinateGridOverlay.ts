import * as THREE from 'three';
import { MorphConfig } from '../types';

export class CoordinateGridVisualizer {
  public group: THREE.Group;

  // Sub-groups
  private xzFloorGrid: THREE.GridHelper | null = null;
  private xyFrontGrid: THREE.GridHelper | null = null;
  private yzSideGrid: THREE.GridHelper | null = null;
  private axesGroup: THREE.Group;
  private boundsBox: THREE.LineSegments | null = null;
  private labelsGroup: THREE.Group;
  private originPivot: THREE.Mesh | null = null;

  // Materials & cached textures
  private lineMaterials: THREE.Material[] = [];
  private labelTextures: THREE.CanvasTexture[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CoordinateGridVisualizer';

    this.axesGroup = new THREE.Group();
    this.axesGroup.name = 'AxesGroup';
    this.group.add(this.axesGroup);

    this.labelsGroup = new THREE.Group();
    this.labelsGroup.name = 'LabelsGroup';
    this.group.add(this.labelsGroup);

    this.buildAxes();
    this.buildOriginPivot();
    this.buildBoundingBox(14);
    this.buildGrids(24, 24);
    this.buildAxisLabels();
  }

  /**
   * Builds high-visibility 3D RGB coordinate axes with directional cones and shafts
   */
  private buildAxes(): void {
    const axisLength = 12;
    const arrowLength = 1.2;
    const arrowRadius = 0.35;

    // X Axis: Red (#FF0055)
    const dirX = new THREE.Vector3(1, 0, 0);
    const arrowX = new THREE.ArrowHelper(dirX, new THREE.Vector3(0, 0, 0), axisLength, 0xff0055, arrowLength, arrowRadius);
    this.axesGroup.add(arrowX);

    // Negative X Dashed / subtle line
    const negXGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-axisLength * 0.8, 0, 0)]);
    const negMatX = new THREE.LineDashedMaterial({ color: 0x882244, dashSize: 0.5, gapSize: 0.3 });
    const negXLine = new THREE.Line(negXGeo, negMatX);
    negXLine.computeLineDistances();
    this.axesGroup.add(negXLine);

    // Y Axis: Green (#00FF66)
    const dirY = new THREE.Vector3(0, 1, 0);
    const arrowY = new THREE.ArrowHelper(dirY, new THREE.Vector3(0, 0, 0), axisLength, 0x00ff66, arrowLength, arrowRadius);
    this.axesGroup.add(arrowY);

    // Negative Y Dashed
    const negYGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -axisLength * 0.8, 0)]);
    const negMatY = new THREE.LineDashedMaterial({ color: 0x228844, dashSize: 0.5, gapSize: 0.3 });
    const negYLine = new THREE.Line(negYGeo, negMatY);
    negYLine.computeLineDistances();
    this.axesGroup.add(negYLine);

    // Z Axis: Blue / Cyan (#00F0FF)
    const dirZ = new THREE.Vector3(0, 0, 1);
    const arrowZ = new THREE.ArrowHelper(dirZ, new THREE.Vector3(0, 0, 0), axisLength, 0x00f0ff, arrowLength, arrowRadius);
    this.axesGroup.add(arrowZ);

    // Negative Z Dashed
    const negZGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -axisLength * 0.8)]);
    const negMatZ = new THREE.LineDashedMaterial({ color: 0x116688, dashSize: 0.5, gapSize: 0.3 });
    const negZLine = new THREE.Line(negZGeo, negMatZ);
    negZLine.computeLineDistances();
    this.axesGroup.add(negZLine);
  }

  /**
   * Origin Point Crosshair Marker (0,0,0)
   */
  private buildOriginPivot(): void {
    const geo = new THREE.SphereGeometry(0.18, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    this.originPivot = new THREE.Mesh(geo, mat);
    this.group.add(this.originPivot);
  }

  /**
   * Creates 3D wireframe bounding box representing standard shape boundary space
   */
  private buildBoundingBox(size: number): void {
    if (this.boundsBox) {
      this.group.remove(this.boundsBox);
      this.boundsBox.geometry.dispose();
    }

    const boxGeo = new THREE.BoxGeometry(size, size, size);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      depthTest: false,
    });
    this.lineMaterials.push(boxMat);

    this.boundsBox = new THREE.LineSegments(edges, boxMat);
    this.boundsBox.name = 'BoundsBox';
    this.group.add(this.boundsBox);
  }

  /**
   * Builds XZ Floor Grid, XY Front Grid, and YZ Side Grid helpers
   */
  private buildGrids(size: number, divisions: number): void {
    // Remove old grids if existing
    if (this.xzFloorGrid) this.group.remove(this.xzFloorGrid);
    if (this.xyFrontGrid) this.group.remove(this.xyFrontGrid);
    if (this.yzSideGrid) this.group.remove(this.yzSideGrid);

    // 1. XZ Ground Floor Grid (y = 0)
    const xzGrid = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x1e293b);
    (xzGrid.material as THREE.Material).transparent = true;
    (xzGrid.material as THREE.Material).opacity = 0.45;
    (xzGrid.material as THREE.Material).depthWrite = false;
    this.xzFloorGrid = xzGrid;
    this.group.add(xzGrid);

    // 2. XY Front Alignment Grid (rotated around X by 90 deg, z = 0)
    const xyGrid = new THREE.GridHelper(size, divisions, 0xff007f, 0x1e293b);
    xyGrid.rotation.x = Math.PI / 2;
    (xyGrid.material as THREE.Material).transparent = true;
    (xyGrid.material as THREE.Material).opacity = 0.25;
    (xyGrid.material as THREE.Material).depthWrite = false;
    this.xyFrontGrid = xyGrid;
    this.group.add(xyGrid);

    // 3. YZ Side Profile Grid (rotated around Z by 90 deg, x = 0)
    const yzGrid = new THREE.GridHelper(size, divisions, 0x00ff66, 0x1e293b);
    yzGrid.rotation.z = Math.PI / 2;
    (yzGrid.material as THREE.Material).transparent = true;
    (yzGrid.material as THREE.Material).opacity = 0.25;
    (yzGrid.material as THREE.Material).depthWrite = false;
    this.yzSideGrid = yzGrid;
    this.group.add(yzGrid);
  }

  /**
   * Generate 2D Canvas text label sprite in 3D scene
   */
  private createTextSprite(text: string, colorHex: string, bgColorHex = 'rgba(10, 10, 14, 0.85)'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = bgColorHex;
      ctx.fillRect(0, 0, 256, 80);

      // Border
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 248, 72);

      // Text
      ctx.fillStyle = colorHex;
      ctx.font = 'bold 36px monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    this.labelTextures.push(texture);

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.8, 0.55, 1);
    return sprite;
  }

  /**
   * Build Axis and Scale Graduation Number Labels
   */
  private buildAxisLabels(): void {
    while (this.labelsGroup.children.length > 0) {
      const child = this.labelsGroup.children[0];
      this.labelsGroup.remove(child);
    }

    const axisLimit = 12.5;

    // +X Label
    const spriteX = this.createTextSprite('+X WIDTH', '#FF0055');
    spriteX.position.set(axisLimit, 0.3, 0);
    this.labelsGroup.add(spriteX);

    // +Y Label
    const spriteY = this.createTextSprite('+Y HEIGHT', '#00FF66');
    spriteY.position.set(0, axisLimit, 0);
    this.labelsGroup.add(spriteY);

    // +Z Label
    const spriteZ = this.createTextSprite('+Z DEPTH', '#00F0FF');
    spriteZ.position.set(0, 0.3, axisLimit);
    this.labelsGroup.add(spriteZ);

    // Origin (0,0,0) Label
    const spriteOrigin = this.createTextSprite('ORIGIN (0,0,0)', '#FFFFFF', 'rgba(0, 240, 255, 0.4)');
    spriteOrigin.position.set(0, -0.6, 0);
    spriteOrigin.scale.set(2.2, 0.6, 1);
    this.labelsGroup.add(spriteOrigin);

    // Major Distance Ticks (-10, -5, +5, +10)
    const tickDistances = [-10, -5, 5, 10];
    tickDistances.forEach((d) => {
      // X ticks
      const tX = this.createTextSprite(`X:${d > 0 ? '+' : ''}${d}`, '#FF88AA', 'rgba(20,20,30,0.7)');
      tX.position.set(d, -0.2, 0);
      tX.scale.set(1.2, 0.35, 1);
      this.labelsGroup.add(tX);

      // Y ticks
      const tY = this.createTextSprite(`Y:${d > 0 ? '+' : ''}${d}`, '#88FFAA', 'rgba(20,20,30,0.7)');
      tY.position.set(0.3, d, 0);
      tY.scale.set(1.2, 0.35, 1);
      this.labelsGroup.add(tY);

      // Z ticks
      const tZ = this.createTextSprite(`Z:${d > 0 ? '+' : ''}${d}`, '#88EAFF', 'rgba(20,20,30,0.7)');
      tZ.position.set(0, -0.2, d);
      tZ.scale.set(1.2, 0.35, 1);
      this.labelsGroup.add(tZ);
    });
  }

  /**
   * Update Coordinate Grid state from MorphConfig
   */
  public update(config: MorphConfig): void {
    const enabled = config.gridOverlayEnabled ?? false;
    this.group.visible = enabled;

    if (!enabled) return;

    const planeMode = config.gridOverlayPlane || 'xz';
    const showAxes = config.gridOverlayShowAxes ?? true;
    const showBounds = config.gridOverlayShowBounds ?? true;
    const showLabels = config.gridOverlayShowLabels ?? true;
    const opacity = config.gridOverlayOpacity ?? 0.6;

    // Plane Visibility
    if (this.xzFloorGrid) {
      this.xzFloorGrid.visible = planeMode === 'xz' || planeMode === 'all';
      (this.xzFloorGrid.material as THREE.Material).opacity = opacity * 0.7;
    }

    if (this.xyFrontGrid) {
      this.xyFrontGrid.visible = planeMode === 'xy' || planeMode === 'all';
      (this.xyFrontGrid.material as THREE.Material).opacity = opacity * 0.45;
    }

    if (this.yzSideGrid) {
      this.yzSideGrid.visible = planeMode === 'yz' || planeMode === 'all';
      (this.yzSideGrid.material as THREE.Material).opacity = opacity * 0.45;
    }

    // Axes & Pivot
    this.axesGroup.visible = showAxes;
    if (this.originPivot) {
      this.originPivot.visible = showAxes;
    }

    // Bounding Box
    if (this.boundsBox) {
      this.boundsBox.visible = showBounds;
      (this.boundsBox.material as THREE.Material).opacity = opacity * 0.35;
    }

    // Scale Labels
    this.labelsGroup.visible = showLabels;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.labelTextures.forEach((t) => t.dispose());
    this.lineMaterials.forEach((m) => m.dispose());
    if (this.originPivot) {
      this.originPivot.geometry.dispose();
      (this.originPivot.material as THREE.Material).dispose();
    }
    if (this.boundsBox) {
      this.boundsBox.geometry.dispose();
      (this.boundsBox.material as THREE.Material).dispose();
    }
  }
}
