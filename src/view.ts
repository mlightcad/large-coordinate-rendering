import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class View2d {
  private _camera: THREE.OrthographicCamera;
  private _cameraControls: THREE.OrbitControls;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _isDirty: boolean;

  constructor() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer = renderer;
    _camera: THREE.OrthographicCamera;
    this._scene = new THREE.Scene();
    this.animate();
    this._isDirty = true;
  }

  get isDirty() {
    return this._isDirty;
  }
  set isDirty(value: boolean) {
    this._isDirty = value;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this._isDirty) {
      this._isDirty = false;
    }
  }

  zoomTo(box: AcGeBox2d, margin: number = 1.1) {
    this._isDirty = true;
  }

  zoomToFit(timeout: number = 0) {
    const waiter = new AcEdConditionWaiter(
      () => this._numOfEntitiesToProcess <= 0,
      () => {
        if (this._scene.box) {
          const box = AcTrGeometryUtil.threeBox3dToGeBox2d(this._scene.box);
          this.zoomTo(box);
          this._isDirty = true;
        }
      },
      300, // check every 200 ms
      timeout
    );
    waiter.start();
  }

  clear() {
    this._scene.clear();
  }

  zoomTo(box: AcGeBox2d, margin: number = 1.1) {
    const size = new AcGeVector2d();
    box.getSize(size);

    const center = new AcGeVector2d();
    box.getCenter(center);

    const threeCenter = new THREE.Vector3(center.x, center.y, 0);
    this._camera.position.set(center.x, center.y, this._camera.position.z);
    this._camera.lookAt(threeCenter);
    this._camera.setRotationFromEuler(new THREE.Euler(0, 0, 0));

    const width = size.x * margin;
    const height = size.y * margin;
    const widthRatio = this._width / width;
    const heightRatio = this._height / height;
    this._camera.zoom = Math.min(widthRatio, heightRatio);

    this._cameraControls.target = threeCenter;
    this.updateCameraFrustum();
  }

  protected updateCameraFrustum(width?: number, height?: number) {
    const aspect = (width ?? this._width) / (height ?? this._height);
    this._camera.left = -aspect * this._frustum;
    this._camera.right = aspect * this._frustum;
    this._camera.top = this._frustum;
    this._camera.bottom = -this._frustum;
    this._camera.updateProjectionMatrix();
    this._cameraControls.update();
  }

  private createCamera() {
    const cameraLen = 500;
    const camera = new THREE.OrthographicCamera(
      -this._width / 2,
      this._width / 2,
      this._height / 2,
      -this._height / 2,
      0.1,
      1000
    );
    camera.position.set(0, 0, cameraLen);
    camera.up.set(0, 1, 0);
    camera.updateProjectionMatrix();
    return camera;
  }

  private createCameraControls() {
    const cameraControls = new OrbitControls(
      this._camera.internalCamera,
      this._renderer.domElement
    );
    cameraControls.enableDamping = false;
    cameraControls.autoRotate = false;
    cameraControls.enableRotate = false;
    cameraControls.zoomSpeed = 5;
    cameraControls.mouseButtons = {
      MIDDLE: THREE.MOUSE.PAN,
    };
    cameraControls.update();
    return cameraControls;
  }
}
