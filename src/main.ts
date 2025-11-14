import * as THREE from 'three';
import './style.css';
import { View2d } from './view';
import { Drawing } from './drawing';

const drawing = new Drawing();
const canvas = document.getElementById('cad-viewer-canvas') as HTMLCanvasElement;
const view2d = new View2d(canvas, drawing);

// Fit camera AFTER canvas is ready
setTimeout(() => {
  view2d.zoomToFit();
}, 0);

const btnRebase = document.getElementById('btn-rebase') as HTMLButtonElement;
btnRebase.addEventListener('click', () => {
  view2d.rebase();
  view2d.zoomToFit();
  btnRebase.disabled = true;
});

const labelX = document.getElementById('mouse-x')!;
const labelY = document.getElementById('mouse-y')!;

// Convert mouse -> world coordinate
view2d.canvas.addEventListener('mousemove', (event) => {
  const rect = view2d.canvas.getBoundingClientRect();
  const cx = event.clientX - rect.left;
  const cy = event.clientY - rect.top;

  const world = view2d.cwcs2Wcs(new THREE.Vector2(cx, cy));

  labelX.textContent = `X: ${world.x.toFixed(2)}`;
  labelY.textContent = `Y: ${world.y.toFixed(2)}`;
});
