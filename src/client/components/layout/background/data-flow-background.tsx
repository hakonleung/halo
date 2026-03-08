'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { RAW_COLORS } from '@/client/theme/tokens/raw-values';
import { BackgroundType } from '@/client/types/background-client';

import { BACKGROUND_CONFIGS } from './configs';

export function DataFlowBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceDetection();

  const config = useMemo(
    () => ({
      ...BACKGROUND_CONFIGS[BackgroundType.DATA_FLOW],
      lineCount: isMobile
        ? BACKGROUND_CONFIGS[BackgroundType.DATA_FLOW].lineCount.mobile
        : BACKGROUND_CONFIGS[BackgroundType.DATA_FLOW].lineCount.desktop,
    }),
    [isMobile],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
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

    // Create flowing lines
    const lines: Array<{
      mesh: THREE.Mesh;
      speed: number;
      offset: number;
    }> = [];

    for (let i = 0; i < config.lineCount; i++) {
      // Generate random curve points
      const points: THREE.Vector3[] = [];
      const startX = Math.random() * 200 - 100;
      const startY = Math.random() * 200 - 100;
      const startZ = Math.random() * 100 - 50;

      for (let j = 0; j < 5; j++) {
        points.push(
          new THREE.Vector3(
            startX + (Math.random() - 0.5) * 50,
            startY + (Math.random() - 0.5) * 50,
            startZ + (Math.random() - 0.5) * 50,
          ),
        );
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, config.curveSegments, 0.5, 8, false);

      const material = new THREE.MeshBasicMaterial({
        color: RAW_COLORS.matrix,
        transparent: true,
        opacity: 0.15, // 降低可见度：0.4 -> 0.15
      });

      const mesh = new THREE.Mesh(tubeGeometry, material);
      const speed =
        config.lineSpeed[0] + Math.random() * (config.lineSpeed[1] - config.lineSpeed[0]);
      const offset = Math.random() * Math.PI * 2;

      lines.push({ mesh, speed, offset });
      scene.add(mesh);
    }

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      lines.forEach((line) => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const material = line.mesh.material as THREE.MeshBasicMaterial;
        // 降低动画透明度范围：0.2-0.5 -> 0.1-0.25
        material.opacity = 0.1 + Math.sin(time * line.speed + line.offset) * 0.15;

        // Slow rotation
        line.mesh.rotation.x += 0.001;
        line.mesh.rotation.y += 0.002;
      });

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
      lines.forEach((line) => {
        line.mesh.geometry.dispose();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (line.mesh.material as THREE.Material).dispose();
      });
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
