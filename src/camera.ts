import * as THREE from 'three';

export class Camera {
  private _camera: THREE.OrthographicCamera;

  constructor(camera: THREE.OrthographicCamera) {
    this._camera = camera;
  }

  get position() {
    return this._camera.position;
  }

  get left() {
    return this._camera.left;
  }
  set left(value: number) {
    this._camera.left = value;
  }

  get right() {
    return this._camera.right;
  }
  set right(value: number) {
    this._camera.right = value;
  }

  get top() {
    return this._camera.top;
  }
  set top(value: number) {
    this._camera.top = value;
  }

  get bottom() {
    return this._camera.bottom;
  }
  set bottom(value: number) {
    this._camera.bottom = value;
  }

  get zoom() {
    return this._camera.zoom;
  }
  set zoom(value: number) {
    this._camera.zoom = value;
  }

  /**
   * The internal THREE.js camera.
   */
  get internalCamera() {
    return this._camera;
  }

  lookAt(vector: THREE.Vector3) {
    this._camera.lookAt(vector);
  }

  setRotationFromEuler(euler: THREE.Euler) {
    this._camera.setRotationFromEuler(euler);
  }

  updateProjectionMatrix() {
    this._camera.updateProjectionMatrix();
  }

  /**
   * Convert point cooridinate from the client window coordinate system to the world coordinate system.
   * The origin of the client window coordinate system is the left-top corner of the client window.
   * @param point Input point to convert
   * @param width Input width of the client window
   * @param height Input height of the client window
   * @returns Return point coordinate in the world coordinate system
   */
  cwcs2Wcs(point: THREE.Vector2Like, width: number, height: number) {
    const cwcsPos = new THREE.Vector3(point.x, point.y, 0);
    cwcsPos.x = (point.x / width) * 2 - 1;
    cwcsPos.y = -(point.y / height) * 2 + 1;
    const wcsPos = cwcsPos.unproject(this._camera);
    return new THREE.Vector2(wcsPos.x, wcsPos.y);
  }
  /**
   * Convert point cooridinate from the world coordinate system to the client window coordinate system.
   * The origin of the client window coordinate system is the left-top corner of the client window.
   * @param point Input point to convert
   * @param width Input width of the client window
   * @param height Input height of the client window
   * @returns Return point coordinate in the client window coordinate system
   */
  wcs2Cwcs(point: THREE.Vector2Like, width: number, height: number) {
    const wcsPos = new THREE.Vector3(point.x, point.y, 0);
    const cwcsPos = wcsPos.project(this._camera);
    return new THREE.Vector2(((cwcsPos.x + 1) / 2) * width, ((-cwcsPos.y + 1) / 2) * height);
  }

  /**
   * Convert point cooridinate from the world coordinate system to the normalized device coordinate.
   * Bottom-left cooridinate in NDC (Normalized screen coordinate) is (-1, -1) and top-right is (1, 1).
   */
  public wcs2Ndc(point: THREE.Vector2Like, width: number, height: number) {
    const cwcsCoord = this.wcs2Cwcs(point, width, height);
    return this.cwcs2Ndc(cwcsCoord, width, height);
  }

  /**
   * Convert point cooridinate from the client window coordinate system to the normalized device coordinate.
   * Bottom-left cooridinate in NDC (Normalized screen coordinate) is (-1, -1) and top-right is (1, 1).
   */
  public cwcs2Ndc(point: THREE.Vector2Like, width: number, height: number) {
    return new THREE.Vector2((point.x / width) * 2 - 1, -(point.y / height) * 2 + 1);
  }
}
