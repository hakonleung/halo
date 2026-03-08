/**
 * Scene Setup Hook
 *
 * Initializes and manages Three.js scene, camera, renderer, and lighting.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { CAMERA_CONFIG, LIGHTING_CONFIG } from './configs';

interface SceneSetupResult {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useSceneSetup(): SceneSetupResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

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
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add lighting
    setupLighting(newScene);

    // Handle window resize
    const handleResize = () => {
      if (!newCamera || !newRenderer) return;

      newCamera.aspect = window.innerWidth / window.innerHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      // Dispose renderer
      newRenderer.dispose();

      // Dispose scene resources
      newScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return { scene, camera, renderer, canvasRef };
}

/**
 * Setup scene lighting
 */
function setupLighting(scene: THREE.Scene): void {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(
    LIGHTING_CONFIG.ambient.color,
    LIGHTING_CONFIG.ambient.intensity,
  );
  scene.add(ambientLight);

  // Matrix green point light
  const matrixLight = new THREE.PointLight(
    LIGHTING_CONFIG.matrixLight.color,
    LIGHTING_CONFIG.matrixLight.intensity,
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
    LIGHTING_CONFIG.cyberLight.intensity,
    LIGHTING_CONFIG.cyberLight.distance,
  );
  cyberLight.position.set(
    LIGHTING_CONFIG.cyberLight.position.x,
    LIGHTING_CONFIG.cyberLight.position.y,
    LIGHTING_CONFIG.cyberLight.position.z,
  );
  scene.add(cyberLight);
}
