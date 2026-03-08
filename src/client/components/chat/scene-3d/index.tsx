/**
 * 3D Chat Scene Container
 *
 * Main component that initializes and manages the 3D cyberpunk chat scene.
 * Handles dynamic import to avoid SSR issues.
 */

'use client';

import { Box, Spinner, Center } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';

import { ComputerScreen } from './computer-screen';
import { CyberpunkRoom } from './cyberpunk-room';
import { useSceneSetup } from './use-scene-setup';

import type { UIMessage } from '@ai-sdk/react';

interface Scene3DProps {
  messages: UIMessage[];
}

export function Scene3D({ messages }: Scene3DProps) {
  const { scene, camera, renderer, canvasRef } = useSceneSetup();
  const deviceInfo = useDeviceDetection();
  const isMobile = deviceInfo.isMobile;
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Render loop
  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    let lastTime = performance.now();
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const elapsed = now - lastTime;

      // Throttle to target FPS
      if (elapsed < frameInterval) return;

      lastTime = now - (elapsed % frameInterval);

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scene, camera, renderer, isMobile]);

  // Loading state
  if (!scene || !camera || !renderer) {
    return (
      <Center h="full" w="full">
        <Spinner color="brand.matrix" size="lg" />
      </Center>
    );
  }

  return (
    <>
      <Box
        as="canvas"
        ref={canvasRef}
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        style={{ touchAction: 'none' }}
      />
      <CyberpunkRoom scene={scene} />
      <ComputerScreen scene={scene} messages={messages} isMobile={isMobile} />
    </>
  );
}
