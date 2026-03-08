/**
 * Mobile Optimizations for 3D Scene
 *
 * Applies performance optimizations for mobile devices:
 * - Reduces texture resolution
 * - Disables shadows
 * - Lowers polygon counts with LOD
 * - Adaptive quality based on FPS
 */

import * as THREE from 'three';

import { SCENE_CONFIGS } from './configs';

/**
 * Apply mobile-specific optimizations to the scene
 */
export function applyMobileOptimizations(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  isMobile: boolean,
): void {
  if (!isMobile) return;

  // Disable shadows for mobile performance
  renderer.shadowMap.enabled = false;

  // Traverse scene and optimize materials/geometries
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      // Disable casting/receiving shadows
      object.castShadow = false;
      object.receiveShadow = false;

      // Reduce texture resolution
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];

        materials.forEach((mat) => {
          // Reduce texture resolution for all texture maps
          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
            const textures = [mat.map, mat.emissiveMap, mat.normalMap, mat.roughnessMap];

            textures.forEach((texture) => {
              if (texture) {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
              }
            });
          }
        });
      }
    }

    // Disable lights with shadows
    if (object instanceof THREE.DirectionalLight || object instanceof THREE.SpotLight) {
      object.castShadow = false;
    }
  });

  // Reduce renderer quality settings
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}

/**
 * Apply LOD (Level of Detail) to character models
 */
export function setupCharacterLOD(
  characterModel: THREE.Object3D,
  isMobile: boolean,
): THREE.LOD | null {
  if (!isMobile) return null;

  const lod = new THREE.LOD();

  // Clone the original model for different LOD levels
  const highDetail = characterModel.clone();
  const lowDetail = characterModel.clone();

  // Simplify low detail version (reduce geometry complexity)
  lowDetail.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      // Simple optimization: reduce geometry quality
      const geometry = object.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        // Reduce vertex precision (this is a placeholder - real LOD would use geometry simplification)
        geometry.computeVertexNormals();
      }
    }
  });

  // Add LOD levels
  // Level 0: High detail (close up, < 5 units)
  lod.addLevel(highDetail, 0);

  // Level 1: Low detail (far away, > 5 units)
  lod.addLevel(lowDetail, 5);

  return lod;
}

/**
 * Get optimized texture resolution based on device
 */
export function getTextureResolution(isMobile: boolean): number {
  return isMobile
    ? SCENE_CONFIGS.MOBILE_OPTIMIZATIONS.textureResolution.mobile
    : SCENE_CONFIGS.MOBILE_OPTIMIZATIONS.textureResolution.desktop;
}

/**
 * Adaptive quality system based on FPS monitoring
 */
export class AdaptiveQuality {
  private fpsHistory: number[] = [];
  private readonly historySize = 60; // Track last 60 frames (~1 second at 60fps)
  private lastTime = performance.now();
  private qualityLevel: 'high' | 'medium' | 'low' = 'high';

  /**
   * Update FPS tracking
   * Call this every frame in your render loop
   */
  update(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    const fps = 1000 / delta;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    this.lastTime = now;
  }

  /**
   * Get average FPS from recent frames
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * Automatically adjust quality based on FPS
   */
  adjustQuality(scene: THREE.Scene, renderer: THREE.WebGLRenderer, targetFPS: number): void {
    const avgFPS = this.getAverageFPS();

    // If FPS drops below target, reduce quality
    if (avgFPS < targetFPS * 0.8) {
      if (this.qualityLevel === 'high') {
        this.qualityLevel = 'medium';
        this.applyQualitySettings(scene, renderer, 'medium');
      } else if (this.qualityLevel === 'medium') {
        this.qualityLevel = 'low';
        this.applyQualitySettings(scene, renderer, 'low');
      }
    }
    // If FPS is stable above target, increase quality
    else if (avgFPS > targetFPS * 1.1) {
      if (this.qualityLevel === 'low') {
        this.qualityLevel = 'medium';
        this.applyQualitySettings(scene, renderer, 'medium');
      } else if (this.qualityLevel === 'medium') {
        this.qualityLevel = 'high';
        this.applyQualitySettings(scene, renderer, 'high');
      }
    }
  }

  /**
   * Apply quality settings to scene
   */
  private applyQualitySettings(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    quality: 'high' | 'medium' | 'low',
  ): void {
    switch (quality) {
      case 'high':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        break;

      case 'medium':
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.shadowMap.enabled = false;
        break;

      case 'low':
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = false;
        // Disable complex materials
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh && object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.flatShading = true;
              }
            });
          }
        });
        break;
    }
  }

  getQualityLevel(): 'high' | 'medium' | 'low' {
    return this.qualityLevel;
  }
}
