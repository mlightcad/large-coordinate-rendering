import './style.css';
import { View2d } from './view';
import { createCircleLine } from './utils';

// Create view
const canvas = document.getElementById('cad-viewer-canvas') as HTMLCanvasElement;
const view2d = new View2d(canvas);

// Create a circle centered at (100, 50) with radius 30
const circle = createCircleLine(10e8 * 4, 10e8 * 4, 1000);

// Add to scene
view2d.add(circle);

// Fit camera AFTER canvas is ready
setTimeout(() => {
  view2d.zoomToFit();
}, 0);
