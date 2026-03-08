'use client';
import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { RAW_COLORS } from '@/client/theme/tokens/raw-values';
import { BackgroundType } from '@/client/types/background-client';

import { BACKGROUND_CONFIGS } from './configs';

export function MatrixRainBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceDetection();

  const config = useMemo(
    () => ({
      ...BACKGROUND_CONFIGS[BackgroundType.MATRIX_RAIN],
      columnCount: isMobile
        ? BACKGROUND_CONFIGS[BackgroundType.MATRIX_RAIN].columnCount.mobile
        : BACKGROUND_CONFIGS[BackgroundType.MATRIX_RAIN].columnCount.desktop,
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
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create character texture
    const canvas = document.createElement('canvas');
    canvas.width = config.charSize;
    canvas.height = config.charSize;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = RAW_COLORS.matrix;
      ctx.font = `${config.charSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ01';
      ctx.fillText(
        chars[Math.floor(Math.random() * chars.length)],
        config.charSize / 2,
        config.charSize / 2,
      );
    }

    const texture = new THREE.CanvasTexture(canvas);

    // Create particles for each column
    const particles: Array<{
      mesh: THREE.Mesh;
      speed: number;
      resetY: number;
    }> = [];

    for (let i = 0; i < config.columnCount; i++) {
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.3, // 降低可见度：0.8 -> 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (i - config.columnCount / 2) * 2.5;
      mesh.position.y = Math.random() * 100 - 50;

      const speed =
        config.fallSpeed[0] + Math.random() * (config.fallSpeed[1] - config.fallSpeed[0]);
      const resetY = 60;

      particles.push({ mesh, speed, resetY });
      scene.add(mesh);
    }

    // Animation
    let frameCount = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      frameCount++;

      // Update every 3 frames for performance
      if (frameCount % 3 === 0) {
        particles.forEach((particle) => {
          particle.mesh.position.y -= particle.speed;
          if (particle.mesh.position.y < -60) {
            particle.mesh.position.y = particle.resetY;
          }
        });
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
      particles.forEach((particle) => {
        particle.mesh.geometry.dispose();
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (particle.mesh.material as THREE.Material).dispose();
      });
      texture.dispose();
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
