import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera } from './camera';
import { Scene } from './scene';

export class View2d {
  protected _frustum = 400;
  protected _canvas: HTMLCanvasElement;
  private _width: number;
  private _height: number;
  private _camera: Camera;
  private _cameraControls: OrbitControls;
  private _renderer: THREE.WebGLRenderer;
  private _scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer = renderer;

    this._canvas = renderer.domElement;
    const rect = this._canvas.getBoundingClientRect();
    this._width = rect.width;
    this._height = rect.height;

    const camera = this.createCamera();
    this._camera = new Camera(camera);
    this._cameraControls = this.createCameraControls();

    this._scene = new Scene();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  add(object: THREE.Object3D) {
    this._scene.add(object);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this._renderer.render(this._scene.internalScene, this._camera.internalCamera);
  }

  clear() {
    this._scene.clear();
  }

  zoomTo(box: THREE.Box3, margin: number = 1.1) {
    const size = new THREE.Vector3();
    box.getSize(size);

    const center = new THREE.Vector3();
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

  zoomToFit() {
    const box = this._scene.box;
    // this._scene.moveToCenter()
    this.zoomTo(box);
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

  protected onWindowResize() {
    this._width = this._canvas.clientWidth;
    this._height = this._canvas.clientHeight;
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
