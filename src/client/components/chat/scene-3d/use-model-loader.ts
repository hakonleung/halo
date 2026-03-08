/**
 * GLTF Model Loader Hook
 *
 * Loads and caches 3D character models using GLTFLoader.
 */

import { useState, useEffect, useRef } from 'react';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { CharacterPreset } from '@/client/types/chat-3d-client';

import { CHARACTER_CONFIG } from './configs';

// Global cache to persist across component unmounts
const modelCache = new Map<CharacterPreset, GLTF>();

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
  const loaderRef = useRef<GLTFLoader | null>(null);

  useEffect(() => {
    // Check cache first
    const cached = modelCache.get(preset);
    if (cached) {
      setModel(cached);
      setLoading(false);
      return;
    }

    // Initialize loader
    if (!loaderRef.current) {
      loaderRef.current = new GLTFLoader();
    }

    const loader = loaderRef.current;
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
  const loader = new GLTFLoader();

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
