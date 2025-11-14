import * as THREE from 'three';

/**
 * Create a circle as a LineLoop.
 * @param centerX  X coordinate of circle center
 * @param centerY  Y coordinate of circle center
 * @param radius   Circle radius
 * @param segments Number of segments (default: 128)
 * @param color    Line color (default: red)
 */
export function createCircleLine(
  centerX: number,
  centerY: number,
  radius: number,
  segments: number = 128,
  color: number = 0xff0000
): THREE.LineLoop {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(centerX + Math.cos(theta) * radius, centerY + Math.sin(theta) * radius, 0)
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });

  return new THREE.LineLoop(geometry, material);
}
