/**
 * GLTF Model Loader Hook
 *
 * Loads and caches 3D character models using GLTFLoader.
 */

import { useState, useEffect } from 'react';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { CharacterPreset } from '@/client/types/chat-3d-client';

import { CHARACTER_CONFIG } from './configs';

// Global cache to persist across component unmounts
const modelCache = new Map<CharacterPreset, GLTF>();

// Global loader instance with decoder configured
let globalLoader: GLTFLoader | null = null;

/**
 * Get or create a configured GLTFLoader with decoders
 */
function getLoader(): GLTFLoader {
  if (!globalLoader) {
    globalLoader = new GLTFLoader();
    // Set Meshopt decoder for compressed models
    globalLoader.setMeshoptDecoder(MeshoptDecoder);
  }
  return globalLoader;
}

interface ModelLoaderResult {
  model: GLTF | null;
  loading: boolean;
  error: string | null;
}

/**
 * Load a character model with caching
 */
export function useModelLoader(preset: CharacterPreset): ModelLoaderResult {
  const [model, setModel] = useState<GLTF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check cache first
    const cached = modelCache.get(preset);
    if (cached) {
      setModel(cached);
      setLoading(false);
      return;
    }

    // Get configured loader
    const loader = getLoader();
    const modelPath = `${CHARACTER_CONFIG.modelPath}${preset}.glb`;

    setLoading(true);
    setError(null);

    loader.load(
      modelPath,
      (gltf) => {
        // Cache the loaded model
        modelCache.set(preset, gltf);
        setModel(gltf);
        setLoading(false);
      },
      (progress) => {
        // Optional: track loading progress
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`Loading ${preset}: ${percentComplete.toFixed(0)}%`);
      },
      (err) => {
        console.error(`Failed to load model ${preset}:`, err);
        setError(`Failed to load character model: ${preset}`);
        setLoading(false);
      },
    );

    // No cleanup needed - cache persists
  }, [preset]);

  return { model, loading, error };
}

/**
 * Preload all character models
 */
export function preloadAllModels(): void {
  const loader = getLoader();

  Object.values(CharacterPreset).forEach((preset) => {
    if (!modelCache.has(preset)) {
      const modelPath = `${CHARACTER_CONFIG.modelPath}${preset}.glb`;
      loader.load(
        modelPath,
        (gltf) => {
          modelCache.set(preset, gltf);
          console.log(`Preloaded model: ${preset}`);
        },
        undefined,
        (err) => {
          console.error(`Failed to preload model ${preset}:`, err);
        },
      );
    }
  });
}

/**
 * Clear the model cache (for memory management)
 */
export function clearModelCache(): void {
  modelCache.clear();
}
