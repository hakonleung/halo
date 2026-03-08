/**
 * Cyberpunk Room Environment
 *
 * Creates the 3D room environment with floor, walls, window, and ambient lighting.
 */

import { useEffect } from 'react';
import * as THREE from 'three';

import { RAW_COLORS } from '@/client/theme/tokens/raw-values';

import { ROOM_SIZE, WINDOW_CONFIG } from './configs';

interface CyberpunkRoomProps {
  scene: THREE.Scene;
}

export function CyberpunkRoom({ scene }: CyberpunkRoomProps) {
  useEffect(() => {
    if (!scene) return;

    const roomObjects: THREE.Object3D[] = [];

    // Floor with grid pattern
    const floorGeometry = new THREE.PlaneGeometry(ROOM_SIZE.width, ROOM_SIZE.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgCarbon,
      roughness: 0.8,
      metalness: 0.2,
    });

    // Add grid lines to floor
    const gridHelper = new THREE.GridHelper(
      ROOM_SIZE.width,
      20,
      RAW_COLORS.matrix30,
      RAW_COLORS.bgDark,
    );
    gridHelper.position.y = 0.01; // Slightly above floor to avoid z-fighting

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to horizontal
    floor.position.y = 0;

    roomObjects.push(floor, gridHelper);

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(ROOM_SIZE.width, ROOM_SIZE.height, 0.1);
    const backWallMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgDark,
      emissive: RAW_COLORS.matrix,
      emissiveIntensity: 0.02,
    });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, ROOM_SIZE.height / 2, -ROOM_SIZE.depth / 2);
    roomObjects.push(backWall);

    // Left wall with window
    const leftWallGeometry = new THREE.BoxGeometry(0.1, ROOM_SIZE.height, ROOM_SIZE.depth);
    const leftWallMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgDark,
      emissive: RAW_COLORS.cyber,
      emissiveIntensity: 0.02,
    });
    const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
    leftWall.position.set(-ROOM_SIZE.width / 2, ROOM_SIZE.height / 2, 0);
    roomObjects.push(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(0.1, ROOM_SIZE.height, ROOM_SIZE.depth);
    const rightWallMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgDark,
      emissive: RAW_COLORS.cyber,
      emissiveIntensity: 0.02,
    });
    const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
    rightWall.position.set(ROOM_SIZE.width / 2, ROOM_SIZE.height / 2, 0);
    roomObjects.push(rightWall);

    // Ceiling (optional, darker)
    const ceilingGeometry = new THREE.PlaneGeometry(ROOM_SIZE.width, ROOM_SIZE.depth);
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgDeep,
      emissive: RAW_COLORS.matrix,
      emissiveIntensity: 0.01,
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2; // Rotate to horizontal, facing down
    ceiling.position.y = ROOM_SIZE.height;
    roomObjects.push(ceiling);

    // Window with city skyline (glowing plane)
    const windowGeometry = new THREE.PlaneGeometry(
      WINDOW_CONFIG.size.width,
      WINDOW_CONFIG.size.height,
    );
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.cyber,
      emissive: RAW_COLORS.cyber,
      emissiveIntensity: WINDOW_CONFIG.emissiveIntensity,
      transparent: true,
      opacity: 0.6,
    });
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(
      WINDOW_CONFIG.position.x,
      WINDOW_CONFIG.position.y,
      WINDOW_CONFIG.position.z,
    );
    roomObjects.push(window);

    // Add neon edge lighting to walls
    const edgeLight1 = new THREE.LineBasicMaterial({ color: RAW_COLORS.matrix });
    const edgeLight2 = new THREE.LineBasicMaterial({ color: RAW_COLORS.cyber });

    // Back wall edges
    const backEdgesGeometry = new THREE.EdgesGeometry(backWallGeometry);
    const backEdges = new THREE.LineSegments(backEdgesGeometry, edgeLight1);
    backEdges.position.copy(backWall.position);
    roomObjects.push(backEdges);

    // Left wall edges
    const leftEdgesGeometry = new THREE.EdgesGeometry(leftWallGeometry);
    const leftEdges = new THREE.LineSegments(leftEdgesGeometry, edgeLight2);
    leftEdges.position.copy(leftWall.position);
    roomObjects.push(leftEdges);

    // Right wall edges
    const rightEdgesGeometry = new THREE.EdgesGeometry(rightWallGeometry);
    const rightEdges = new THREE.LineSegments(rightEdgesGeometry, edgeLight2);
    rightEdges.position.copy(rightWall.position);
    roomObjects.push(rightEdges);

    // Add all objects to scene
    roomObjects.forEach((obj) => scene.add(obj));

    // Cleanup
    return () => {
      roomObjects.forEach((obj) => {
        scene.remove(obj);
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return null; // This component doesn't render React elements
}
