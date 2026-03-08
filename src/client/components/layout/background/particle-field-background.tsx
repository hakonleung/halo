'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { RAW_COLORS } from '@/client/theme/tokens/raw-values';
import { BackgroundType } from '@/client/types/background-client';

import { BACKGROUND_CONFIGS } from './configs';

export function ParticleFieldBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceDetection();

  const config = useMemo(
    () => ({
      ...BACKGROUND_CONFIGS[BackgroundType.PARTICLE_FIELD],
      particleCount: isMobile
        ? BACKGROUND_CONFIGS[BackgroundType.PARTICLE_FIELD].particleCount.mobile
        : BACKGROUND_CONFIGS[BackgroundType.PARTICLE_FIELD].particleCount.desktop,
    }),
    [isMobile],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 100;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const velocities: number[] = [];

    for (let i = 0; i < config.particleCount; i++) {
      positions.push(
        Math.random() * 200 - 100,
        Math.random() * 200 - 100,
        Math.random() * 200 - 100,
      );
      velocities.push(
        (Math.random() - 0.5) * config.moveSpeed,
        (Math.random() - 0.5) * config.moveSpeed,
        (Math.random() - 0.5) * config.moveSpeed,
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: RAW_COLORS.matrix,
      size: 1.2, // 减小粒子大小：1.5 -> 1.2
      transparent: true,
      opacity: 0.3, // 降低可见度：0.8 -> 0.3
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Create connection lines (only on desktop)
    let lines: THREE.LineSegments | null = null;
    if (!isMobile) {
      const lineGeometry = new THREE.BufferGeometry();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: RAW_COLORS.matrix,
        transparent: true,
        opacity: 0.08, // 降低连接线可见度：0.2 -> 0.08
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Update particle positions
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const posArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < posArray.length; i += 3) {
        posArray[i] += velocities[i];
        posArray[i + 1] += velocities[i + 1];
        posArray[i + 2] += velocities[i + 2];

        // Wrap around boundaries
        if (Math.abs(posArray[i]) > 100) velocities[i] *= -1;
        if (Math.abs(posArray[i + 1]) > 100) velocities[i + 1] *= -1;
        if (Math.abs(posArray[i + 2]) > 100) velocities[i + 2] *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Update connection lines (desktop only)
      if (lines && !isMobile) {
        const linePositions: number[] = [];
        for (let i = 0; i < posArray.length; i += 3) {
          for (let j = i + 3; j < posArray.length; j += 3) {
            const dx = posArray[i] - posArray[j];
            const dy = posArray[i + 1] - posArray[j + 1];
            const dz = posArray[i + 2] - posArray[j + 2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < config.connectionDistance) {
              linePositions.push(posArray[i], posArray[i + 1], posArray[i + 2]);
              linePositions.push(posArray[j], posArray[j + 1], posArray[j + 2]);
            }
          }
        }
        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      if (lines) {
        lines.geometry.dispose();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (lines.material as THREE.Material).dispose();
      }
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [config, isMobile]);

  return (
    <Box
      ref={containerRef}
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100%"
      zIndex={0}
      pointerEvents="none"
      overflow="hidden"
    />
  );
}
