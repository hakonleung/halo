/**
 * Camera Controls Hook
 *
 * Provides camera controls for zooming and rotating the 3D scene.
 * Uses OrbitControls from Three.js.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface CameraControlsOptions {
  camera: THREE.Camera | null;
  canvas: HTMLCanvasElement | null;
  enabled?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  target?: THREE.Vector3;
}

/**
 * Hook to add camera controls (zoom, rotate, pan)
 */
export function useCameraControls({
  camera,
  canvas,
  enabled = true,
  enableZoom = true,
  enableRotate = true,
  enablePan = false,
  minDistance = 3,
  maxDistance = 15,
  target = new THREE.Vector3(0, 1, 0),
}: CameraControlsOptions): void {
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!camera || !canvas || !enabled) return;

    // Create OrbitControls
    const controls = new OrbitControls(camera, canvas);

    // Configure controls
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.enablePan = enablePan;
    controls.enableDamping = true; // Smooth camera movement
    controls.dampingFactor = 0.05;
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
    controls.target.copy(target);

    // Limit vertical rotation (don't allow going underneath the floor)
    controls.minPolarAngle = Math.PI / 6; // 30 degrees from top
    controls.maxPolarAngle = Math.PI / 2; // 90 degrees (horizontal)

    // Zoom speed
    controls.zoomSpeed = 0.8;
    controls.rotateSpeed = 0.5;

    controlsRef.current = controls;

    // Update controls in animation loop
    const updateControls = () => {
      controls.update();
      requestAnimationFrame(updateControls);
    };
    updateControls();

    // Cleanup
    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, canvas, enabled, enableZoom, enableRotate, enablePan, minDistance, maxDistance]);
}

/**
 * Preset camera positions for different views
 */
export const CAMERA_PRESETS = {
  default: {
    position: new THREE.Vector3(0, 1.6, 5),
    target: new THREE.Vector3(0, 1, 0),
  },
  overview: {
    position: new THREE.Vector3(0, 4, 6),
    target: new THREE.Vector3(0, 0, 0),
  },
  closeUp: {
    position: new THREE.Vector3(-1, 1.8, 3),
    target: new THREE.Vector3(-2, 1.6, 0), // Look at character
  },
  screen: {
    position: new THREE.Vector3(0, 1.5, 2),
    target: new THREE.Vector3(0, 1.5, 0), // Look at screen
  },
  side: {
    position: new THREE.Vector3(4, 1.6, 0),
    target: new THREE.Vector3(0, 1, 0),
  },
} as const;

/**
 * Smoothly transition camera to a preset position
 */
export function transitionToPreset(
  camera: THREE.Camera,
  controls: OrbitControls | null,
  preset: keyof typeof CAMERA_PRESETS,
  duration = 1000,
): void {
  if (!controls) return;

  const targetPreset = CAMERA_PRESETS[preset];
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-in-out)
    const t = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate position
    camera.position.lerpVectors(startPosition, targetPreset.position, t);

    // Interpolate target
    controls.target.lerpVectors(startTarget, targetPreset.target, t);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}
