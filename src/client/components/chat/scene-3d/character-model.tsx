/**
 * Character Model Component
 *
 * Renders a 3D character model with customization and hover effects.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { RAW_COLORS } from '@/client/theme/tokens/raw-values';

import { IdleAnimation, applyHoverGlow } from './animations';
import { CHARACTER_CONFIG } from './configs';
import { useModelLoader } from './use-model-loader';

import type { CharacterPreset, CharacterCustomization } from '@/client/types/chat-3d-client';

interface CharacterModelProps {
  scene: THREE.Scene;
  preset: CharacterPreset;
  customization: CharacterCustomization;
  isHovering?: boolean;
  prefersReducedMotion?: boolean;
}

export function CharacterModel({
  scene,
  preset,
  customization,
  isHovering = false,
  prefersReducedMotion = false,
}: CharacterModelProps) {
  const { model, loading, error } = useModelLoader(preset);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const idleAnimationRef = useRef(new IdleAnimation());
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef<number | null>(null);

  // Initialize character model
  useEffect(() => {
    if (!scene) return;

    const characterGroup = new THREE.Group();
    characterGroup.position.set(
      CHARACTER_CONFIG.position.x,
      CHARACTER_CONFIG.position.y,
      CHARACTER_CONFIG.position.z,
    );
    characterGroup.scale.setScalar(customization.scale);
    characterGroup.rotation.y = -Math.PI / 4; // Rotate 45° right from forward (45° angle)
    characterGroup.name = 'character';

    scene.add(characterGroup);
    characterGroupRef.current = characterGroup;

    return () => {
      scene.remove(characterGroup);
      characterGroupRef.current = null;
    };
  }, [scene, customization.scale]);

  // Load model or create fallback
  useEffect(() => {
    if (!characterGroupRef.current) return;

    const group = characterGroupRef.current;

    // Clear existing children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    console.log('[CharacterModel] State:', { loading, error, hasModel: !!model, preset });

    if (loading) {
      // Show loading placeholder
      console.log('[CharacterModel] Showing loading placeholder');
      createPlaceholder(group, 'loading');
      return;
    }

    if (error || !model) {
      // Show error placeholder
      console.log('[CharacterModel] Showing error placeholder:', error);
      createPlaceholder(group, 'error');
      return;
    }

    // Clone the loaded model
    console.log('[CharacterModel] Model loaded successfully, cloning...');
    const modelClone = model.scene.clone();

    // Calculate bounding box to position model on ground
    const box = new THREE.Box3().setFromObject(modelClone);
    const minY = box.min.y;

    // Adjust model position so bottom touches the ground (y=0)
    if (minY < 0) {
      modelClone.position.y = -minY; // Lift model up
      console.log('[CharacterModel] Adjusted model Y position:', -minY);
    }

    // Log model structure
    console.log('[CharacterModel] Model structure:', {
      children: modelClone.children.length,
      boundingBox: { min: box.min, max: box.max },
      adjustedPosition: modelClone.position,
    });

    group.add(modelClone);

    // Apply customization only if not in keepOriginalMaterials list
    const shouldKeepOriginal = (
      CHARACTER_CONFIG.keepOriginalMaterials as readonly string[]
    ).includes(preset);
    if (shouldKeepOriginal) {
      console.log('[CharacterModel] Keeping original materials for:', preset);
      // Just ensure materials are visible
      ensureMaterialsVisible(modelClone);
    } else {
      console.log('[CharacterModel] Applying customization:', customization);
      applyCustomization(modelClone, customization);
    }

    // Setup animations if available
    if (model.animations && model.animations.length > 0) {
      console.log('[CharacterModel] Setting up animations:', model.animations.length);
      const mixer = new THREE.AnimationMixer(modelClone);
      mixerRef.current = mixer;

      // Play idle animation (first animation)
      const action = mixer.clipAction(model.animations[0]);
      action.play();
    } else {
      console.log('[CharacterModel] No animations found in model');
    }

    console.log('[CharacterModel] Model setup complete, group children:', group.children.length);
  }, [model, loading, error, customization, preset]);

  // Update hover effect
  useEffect(() => {
    if (!characterGroupRef.current) return;
    applyHoverGlow(characterGroupRef.current, isHovering);
  }, [isHovering]);

  // Animation loop
  useEffect(() => {
    if (!characterGroupRef.current) return;

    const animate = () => {
      const delta = clockRef.current.getDelta();

      // Update GLTF animations if available
      if (!prefersReducedMotion) {
        mixerRef.current?.update(delta);
      }

      // Update idle animation (breathing, swaying) - skip if reduced motion
      if (characterGroupRef.current && !prefersReducedMotion) {
        idleAnimationRef.current.update(characterGroupRef.current, delta);
      }

      // Store frame ID in ref (not state) to avoid re-renders
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      // Cancel animation on cleanup
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      mixerRef.current = null;
    };
  }, [model]);

  return null; // This component doesn't render React elements
}

/**
 * Create a placeholder geometry when model is not available
 */
function createPlaceholder(group: THREE.Group, type: 'loading' | 'error'): void {
  // Simple humanoid shape made of primitives
  const color = type === 'error' ? RAW_COLORS.error : RAW_COLORS.matrix;

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.1,
    roughness: 0.7,
    metalness: 0.3,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 1.0;
  group.add(body);

  // Head
  const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.2,
    roughness: 0.6,
    metalness: 0.4,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.8;
  group.add(head);

  // Arms
  const armGeometry = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
  const armMaterial = bodyMaterial.clone();

  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.4, 1.0, 0);
  leftArm.rotation.z = Math.PI / 6;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, armMaterial.clone());
  rightArm.position.set(0.4, 1.0, 0);
  rightArm.rotation.z = -Math.PI / 6;
  group.add(rightArm);

  // Legs
  const legGeometry = new THREE.CapsuleGeometry(0.12, 0.8, 4, 8);
  const legMaterial = bodyMaterial.clone();

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, 0.4, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial.clone());
  rightLeg.position.set(0.15, 0.4, 0);
  group.add(rightLeg);
}

/**
 * Ensure materials are visible without changing colors
 * Used for models that should keep their original appearance
 */
function ensureMaterialsVisible(model: THREE.Object3D): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Keep original material but ensure it's visible
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          mat.visible = true;
          mat.needsUpdate = true;
        });
      }
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Apply customization to character model
 */
function applyCustomization(model: THREE.Object3D, customization: CharacterCustomization): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Create new MeshStandardMaterial with custom colors
      const newMaterial = new THREE.MeshStandardMaterial({
        color: customization.primaryColor,
        emissive: customization.secondaryColor,
        emissiveIntensity: 0.2,
        roughness:
          customization.materialType === 'glossy'
            ? 0.2
            : customization.materialType === 'matte'
              ? 0.8
              : 0.3,
        metalness:
          customization.materialType === 'metallic'
            ? 1.0
            : customization.materialType === 'glossy'
              ? 0.1
              : 0.0,
      });

      // Dispose old material if it's not an array
      if (child.material && !Array.isArray(child.material)) {
        child.material.dispose();
      }

      // Apply new material
      child.material = newMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
