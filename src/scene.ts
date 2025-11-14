import * as THREE from 'three';

export class Scene {
  private _scene: THREE.Scene;
  private _rootGroup: THREE.Group;
  private _box: THREE.Box3;

  constructor() {
    this._scene = new THREE.Scene();
    this._rootGroup = new THREE.Group();
    this._scene.add(this._rootGroup);
    this._box = new THREE.Box3();
  }

  /**
   * The bounding box of the visibile objects in this secene
   */
  get box() {
    this._scene.updateMatrixWorld(true);
    this._box.setFromObject(this._scene);
    return this._box;
  }

  get internalScene() {
    return this._scene;
  }

  moveToCenter() {
    if (this.box) {
      const center = new THREE.Vector3();
      this.box.getCenter(center);
      this._rootGroup.position.sub(center);
      this.box.translate(new THREE.Vector3(-center.x, -center.y, -center.z));
    }
  }

  clear() {
    this._rootGroup.clear();
    this._scene.clear();
    this._scene.add(this._rootGroup);
    return this;
  }

  add(object: THREE.Object3D) {
    this._rootGroup.add(object);
    return this;
  }
}
