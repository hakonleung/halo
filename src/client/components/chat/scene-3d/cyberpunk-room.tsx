/**
 * Cyberpunk Room Environment
 *
 * Creates the 3D room environment with neon floor/ceiling strips,
 * glowing corner posts, wall decorations, and atmospheric lighting.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { RAW_COLORS } from '@/client/theme/tokens/raw-values';

import { ROOM_SIZE, WINDOW_CONFIG } from './configs';

interface CyberpunkRoomProps {
  scene: THREE.Scene;
}

const NEON = {
  green: 0x00ff41,
  cyan: 0x00d4ff,
  orange: 0xff6b35,
} as const;

function makNeonMat(color: number, intensity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.1,
    metalness: 0.0,
  });
}

export function CyberpunkRoom({ scene }: CyberpunkRoomProps) {
  const neonRef = useRef<{ mat: THREE.MeshStandardMaterial; base: number }[]>([]);

  useEffect(() => {
    if (!scene) return;

    const roomObjects: THREE.Object3D[] = [];
    const neonItems: { mat: THREE.MeshStandardMaterial; base: number }[] = [];

    const hw = ROOM_SIZE.width / 2;
    const hd = ROOM_SIZE.depth / 2;
    const rh = ROOM_SIZE.height;

    const trackNeon = (mat: THREE.MeshStandardMaterial, base: number) => {
      neonItems.push({ mat, base });
      return mat;
    };

    // ── Floor ──────────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(ROOM_SIZE.width, ROOM_SIZE.depth);
    const floorMat = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgCarbon,
      roughness: 0.25,
      metalness: 0.45,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    roomObjects.push(floor);

    const gridHelper = new THREE.GridHelper(ROOM_SIZE.width, 20, NEON.green, RAW_COLORS.bgDark);
    gridHelper.position.y = 0.01;
    roomObjects.push(gridHelper);

    // ── Floor neon edge strips ─────────────────────────────────────────────
    const addStrip = (w: number, d: number, pos: THREE.Vector3, color: number, base: number) => {
      const mat = trackNeon(makNeonMat(color, base), base);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), mat);
      mesh.position.copy(pos);
      roomObjects.push(mesh);
    };

    const sy = 0.02;
    addStrip(ROOM_SIZE.width, 0.04, new THREE.Vector3(0, sy, hd), NEON.green, 1.2);
    addStrip(ROOM_SIZE.width, 0.04, new THREE.Vector3(0, sy, -hd), NEON.green, 1.2);
    addStrip(0.04, ROOM_SIZE.depth, new THREE.Vector3(-hw, sy, 0), NEON.cyan, 1.2);
    addStrip(0.04, ROOM_SIZE.depth, new THREE.Vector3(hw, sy, 0), NEON.cyan, 1.2);

    // ── Ceiling neon edge strips ───────────────────────────────────────────
    const cy = rh - 0.02;
    addStrip(ROOM_SIZE.width, 0.04, new THREE.Vector3(0, cy, hd), NEON.cyan, 1.0);
    addStrip(ROOM_SIZE.width, 0.04, new THREE.Vector3(0, cy, -hd), NEON.orange, 1.0);
    addStrip(0.04, ROOM_SIZE.depth, new THREE.Vector3(-hw, cy, 0), NEON.cyan, 1.0);
    addStrip(0.04, ROOM_SIZE.depth, new THREE.Vector3(hw, cy, 0), NEON.orange, 1.0);

    // ── Back wall ──────────────────────────────────────────────────────────
    const backWallGeo = new THREE.BoxGeometry(ROOM_SIZE.width, rh, 0.1);
    const backWall = new THREE.Mesh(
      backWallGeo,
      new THREE.MeshStandardMaterial({
        color: RAW_COLORS.bgDark,
        emissive: RAW_COLORS.matrix,
        emissiveIntensity: 0.04,
      }),
    );
    backWall.position.set(0, rh / 2, -hd);
    roomObjects.push(backWall);

    // Back wall horizontal neon bars
    const addWallBar = (y: number, color: number, base: number) => {
      const mat = trackNeon(makNeonMat(color, base), base);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE.width * 0.85, 0.06, 0.06), mat);
      mesh.position.set(0, y, -hd + 0.1);
      roomObjects.push(mesh);
    };
    addWallBar(0.4, NEON.green, 1.4);
    addWallBar(1.5, NEON.cyan, 1.3);
    addWallBar(2.6, NEON.orange, 1.2);

    // Back wall edge lines
    const backEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(backWallGeo),
      new THREE.LineBasicMaterial({ color: NEON.green }),
    );
    backEdges.position.copy(backWall.position);
    roomObjects.push(backEdges);

    // ── Side walls ────────────────────────────────────────────────────────
    const addSideWall = (x: number) => {
      const geo = new THREE.BoxGeometry(0.1, rh, ROOM_SIZE.depth);
      const mat = new THREE.MeshStandardMaterial({
        color: RAW_COLORS.bgDark,
        emissive: RAW_COLORS.cyber,
        emissiveIntensity: 0.05,
      });
      const wall = new THREE.Mesh(geo, mat);
      wall.position.set(x, rh / 2, 0);
      roomObjects.push(wall);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: NEON.cyan }),
      );
      edges.position.copy(wall.position);
      roomObjects.push(edges);
    };
    addSideWall(-hw);
    addSideWall(hw);

    // ── Ceiling ────────────────────────────────────────────────────────────
    const ceilingGeo = new THREE.PlaneGeometry(ROOM_SIZE.width, ROOM_SIZE.depth);
    const ceiling = new THREE.Mesh(
      ceilingGeo,
      new THREE.MeshStandardMaterial({
        color: RAW_COLORS.bgDeep,
        emissive: RAW_COLORS.matrix,
        emissiveIntensity: 0.02,
      }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = rh;
    roomObjects.push(ceiling);

    // ── Corner neon posts ─────────────────────────────────────────────────
    const addPost = (x: number, z: number, color: number, base: number) => {
      const mat = trackNeon(makNeonMat(color, base), base);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, rh, 8), mat);
      mesh.position.set(x, rh / 2, z);
      roomObjects.push(mesh);
    };
    addPost(-hw + 0.1, -hd + 0.1, NEON.green, 2.0);
    addPost(hw - 0.1, -hd + 0.1, NEON.cyan, 2.0);
    addPost(-hw + 0.1, hd - 0.1, NEON.orange, 2.0);
    addPost(hw - 0.1, hd - 0.1, NEON.green, 2.0);

    // ── Window ────────────────────────────────────────────────────────────
    const winPos = WINDOW_CONFIG.position;
    const winSize = WINDOW_CONFIG.size;
    const winMat = trackNeon(
      new THREE.MeshStandardMaterial({
        color: RAW_COLORS.cyber,
        emissive: new THREE.Color(RAW_COLORS.cyber),
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.65,
      }),
      0.8,
    );
    const windowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(winSize.width, winSize.height),
      winMat,
    );
    windowMesh.position.set(winPos.x, winPos.y, winPos.z);
    roomObjects.push(windowMesh);

    // Window neon frame
    const addWinFrame = (w: number, h: number, pos: THREE.Vector3, color: number) => {
      const mat = trackNeon(makNeonMat(color, 2.2), 2.2);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), mat);
      mesh.position.copy(pos);
      roomObjects.push(mesh);
    };
    const fx = winPos.x;
    const fy = winPos.y;
    const fz = winPos.z + 0.06;
    addWinFrame(
      winSize.width + 0.1,
      0.06,
      new THREE.Vector3(fx, fy + winSize.height / 2, fz),
      NEON.cyan,
    );
    addWinFrame(
      winSize.width + 0.1,
      0.06,
      new THREE.Vector3(fx, fy - winSize.height / 2, fz),
      NEON.cyan,
    );
    addWinFrame(
      0.06,
      winSize.height + 0.1,
      new THREE.Vector3(fx - winSize.width / 2, fy, fz),
      NEON.cyan,
    );
    addWinFrame(
      0.06,
      winSize.height + 0.1,
      new THREE.Vector3(fx + winSize.width / 2, fy, fz),
      NEON.cyan,
    );

    roomObjects.forEach((obj) => scene.add(obj));
    neonRef.current = neonItems;

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
      neonRef.current = [];
    };
  }, [scene]);

  // Neon pulse / flicker animation
  useEffect(() => {
    if (!scene) return;

    let frameId: number;
    let time = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      time += (now - last) / 1000;
      last = now;

      neonRef.current.forEach(({ mat, base }, i) => {
        const flicker = base * (0.88 + Math.sin(time * 1.8 + i * 0.65) * 0.12);
        mat.emissiveIntensity = flicker;
      });

      frameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameId);
  }, [scene]);

  return null;
}
