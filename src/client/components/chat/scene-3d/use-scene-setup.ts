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
    newScene.fog = new THREE.FogExp2(0x0a0a0a, 0.035); // Atmospheric depth fog

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
    // Tone mapping enhances neon glow contrast
    newRenderer.toneMapping = THREE.ReinhardToneMapping;
    newRenderer.toneMappingExposure = 1.1;

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
  // Low ambient — let neon emissives do the work
  const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
  scene.add(ambientLight);

  // Soft fill light from above
  const mainLight = new THREE.DirectionalLight(0x334455, 0.5);
  mainLight.position.set(0, 6, 4);
  scene.add(mainLight);

  // Matrix green point light (back-left, strong)
  const matrixLight = new THREE.PointLight(
    LIGHTING_CONFIG.matrixLight.color,
    2.5,
    LIGHTING_CONFIG.matrixLight.distance,
  );
  matrixLight.position.set(
    LIGHTING_CONFIG.matrixLight.position.x,
    LIGHTING_CONFIG.matrixLight.position.y,
    LIGHTING_CONFIG.matrixLight.position.z,
  );
  scene.add(matrixLight);

  // Cyber blue point light (back-right)
  const cyberLight = new THREE.PointLight(
    LIGHTING_CONFIG.cyberLight.color,
    2.0,
    LIGHTING_CONFIG.cyberLight.distance,
  );
  cyberLight.position.set(
    LIGHTING_CONFIG.cyberLight.position.x,
    LIGHTING_CONFIG.cyberLight.position.y,
    LIGHTING_CONFIG.cyberLight.position.z,
  );
  scene.add(cyberLight);

  // Alert orange accent (front-right corner, low)
  const orangeLight = new THREE.PointLight(0xff6b35, 1.5, 8);
  orangeLight.position.set(4, 0.5, 4);
  scene.add(orangeLight);

  // Character spotlight
  const characterLight = new THREE.SpotLight(0xffffff, 2.0);
  characterLight.position.set(-2, 3.5, 3);
  characterLight.target.position.set(-2, 1, 0);
  characterLight.angle = Math.PI / 5;
  characterLight.penumbra = 0.4;
  scene.add(characterLight);
  scene.add(characterLight.target);

  // Under-floor neon bounce (green, below the grid)
  const floorBounce = new THREE.PointLight(0x00ff41, 0.8, 6);
  floorBounce.position.set(0, -0.5, 0);
  scene.add(floorBounce);
}
