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

  get box() {
    this._scene.updateMatrixWorld(true);
    this._box.setFromObject(this._scene);
    return this._box;
  }

  get internalScene() {
    return this._scene;
  }

  get rootGroup() {
    return this._rootGroup;
  }

  rebase(origin: THREE.Vector2) {
    const rootGroup = this._rootGroup;
    this._rootGroup.traverse((obj) => {
      if (
        (obj as THREE.LineLoop).isLine ||
        (obj as THREE.Mesh).isMesh ||
        (obj as THREE.Points).isPoints
      ) {
        const object3D = obj as THREE.Object3D;
        object3D.updateMatrixWorld(true);
        const geometry = (object3D as any).geometry as THREE.BufferGeometry;
        if (geometry) {
          const translationMatrix = new THREE.Matrix4().makeTranslation(-origin.x, -origin.y, 0);
          geometry.applyMatrix4(object3D.matrix);
          geometry.applyMatrix4(translationMatrix);
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
        }
        object3D.position.set(0, 0, 0);
        object3D.rotation.set(0, 0, 0);
        object3D.scale.set(1, 1, 1);
        object3D.updateMatrix();
      }
    });
    rootGroup.position.set(0, 0, 0);
    rootGroup.rotation.set(0, 0, 0);
    rootGroup.scale.set(1, 1, 1);
    rootGroup.updateMatrix();
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
