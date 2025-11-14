import * as THREE from 'three';
import { createCircleLine } from './utils';

export class Drawing {
  private _basePoint: THREE.Vector2;
  private _rootGroup: THREE.Object3D;

  constructor() {
    this._basePoint = new THREE.Vector2();
    this._rootGroup = new THREE.Group();
    this.buildDraw();
  }

  get rootGroup() {
    return this._rootGroup;
  }

  get basePoint() {
    return this._basePoint;
  }
  set basePoint(value: THREE.Vector2) {
    this._basePoint.copy(value);
    this.clear();
    this.buildDraw();
  }

  clear() {
    const group = this._rootGroup;
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);

      // Optional: dispose of geometry and material to free memory
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    }
  }

  private buildDraw() {
    const basePoint = this._basePoint;
    const circle = createCircleLine(10e8 * 4 - basePoint.x, 10e8 * 4 - basePoint.y, 1000);
    this._rootGroup.add(circle);
  }
}
