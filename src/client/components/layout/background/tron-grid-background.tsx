'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { RAW_COLORS } from '@/client/theme/tokens/raw-values';
import { BackgroundType } from '@/client/types/background-client';

import { BACKGROUND_CONFIGS } from './configs';

export function TronGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceDetection();

  const config = useMemo(
    () => ({
      ...BACKGROUND_CONFIGS[BackgroundType.TRON_GRID],
      segmentCount: isMobile
        ? BACKGROUND_CONFIGS[BackgroundType.TRON_GRID].segmentCount.mobile
        : BACKGROUND_CONFIGS[BackgroundType.TRON_GRID].segmentCount.desktop,
    }),
    [isMobile],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Renderer (WebGL)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create grid geometry
    const geometry = new THREE.PlaneGeometry(200, 200, config.segmentCount, config.segmentCount);
    const material = new THREE.MeshBasicMaterial({
      color: RAW_COLORS.matrix,
      wireframe: true,
      transparent: true,
      opacity: 0.2, // 降低可见度：0.6 -> 0.2
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 3; // 60度旋转
    scene.add(plane);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += config.waveSpeed;

      // Update vertices for wave effect
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const positions = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] =
          Math.sin(x * 0.1 + time) * config.waveAmplitude +
          Math.cos(y * 0.1 + time) * config.waveAmplitude;
      }
      geometry.attributes.position.needsUpdate = true;

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
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [config]);

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
