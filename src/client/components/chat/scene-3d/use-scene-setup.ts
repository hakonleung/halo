/**
 * Scene Setup Hook
 *
 * Initializes and manages Three.js scene, camera, renderer, and lighting.
 */

import { useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

import { CAMERA_CONFIG, LIGHTING_CONFIG } from './configs';

interface SceneSetupResult {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  canvasRef: (canvas: HTMLCanvasElement | null) => void;
}

export function useSceneSetup(): SceneSetupResult {
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  // Use callback ref to initialize when canvas mounts
  const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    // Initialize scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x0a0a0a); // Deep space black

    // Initialize camera
    const newCamera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far,
    );
    newCamera.position.set(
      CAMERA_CONFIG.position.x,
      CAMERA_CONFIG.position.y,
      CAMERA_CONFIG.position.z,
    );
    newCamera.lookAt(0, 1, 0); // Look at center at eye level

    // Initialize renderer
    const newRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add lighting
    setupLighting(newScene);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
  }, []);

  // Handle window resize
  useEffect(() => {
    if (!camera || !renderer) return;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera, renderer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [renderer, scene]);

  return { scene, camera, renderer, canvasRef };
}

/**
 * Setup scene lighting
 */
function setupLighting(scene: THREE.Scene): void {
  // Stronger ambient light for better visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Main directional light (simulates sun/key light)
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);

  // Matrix green point light
  const matrixLight = new THREE.PointLight(
    LIGHTING_CONFIG.matrixLight.color,
    1.2, // Increased intensity
    LIGHTING_CONFIG.matrixLight.distance,
  );
  matrixLight.position.set(
    LIGHTING_CONFIG.matrixLight.position.x,
    LIGHTING_CONFIG.matrixLight.position.y,
    LIGHTING_CONFIG.matrixLight.position.z,
  );
  scene.add(matrixLight);

  // Cyber blue point light
  const cyberLight = new THREE.PointLight(
    LIGHTING_CONFIG.cyberLight.color,
    1.0, // Increased intensity
    LIGHTING_CONFIG.cyberLight.distance,
  );
  cyberLight.position.set(
    LIGHTING_CONFIG.cyberLight.position.x,
    LIGHTING_CONFIG.cyberLight.position.y,
    LIGHTING_CONFIG.cyberLight.position.z,
  );
  scene.add(cyberLight);

  // Character spotlight (illuminates character on the left)
  const characterLight = new THREE.SpotLight(0xffffff, 1.5);
  characterLight.position.set(-2, 3, 3);
  characterLight.target.position.set(-2, 1, 0); // Point at character position
  characterLight.angle = Math.PI / 6;
  characterLight.penumbra = 0.3;
  scene.add(characterLight);
  scene.add(characterLight.target);
}
