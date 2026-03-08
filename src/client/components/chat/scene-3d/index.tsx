/**
 * 3D Chat Scene Container
 *
 * Main component that initializes and manages the 3D cyberpunk chat scene.
 * Handles dynamic import to avoid SSR issues.
 */

'use client';

import { Box, Spinner, Center } from '@chakra-ui/react';
import { useEffect, useRef, useState, useCallback } from 'react';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { useChat3DStore } from '@/client/store/chat-3d-store';

import { CharacterModel } from './character-model';
import { ComputerScreen } from './computer-screen';
import { CyberpunkRoom } from './cyberpunk-room';
import { SpeechBubble } from './speech-bubble';
import { useClickDetection, useHoverDetection } from './use-click-detection';
import { useSceneSetup } from './use-scene-setup';

import type { UIMessage } from '@ai-sdk/react';
import type * as THREE from 'three';

interface Scene3DProps {
  messages: UIMessage[];
  onSendMessage?: (message: string) => void;
}

export function Scene3D({ messages, onSendMessage }: Scene3DProps) {
  const { scene, camera, renderer, canvasRef } = useSceneSetup();
  const deviceInfo = useDeviceDetection();
  const isMobile = deviceInfo.isMobile;
  const animationFrameRef = useRef<number | undefined>(undefined);

  // 3D chat state
  const { selectedCharacter, characterCustomization, inputBoxVisible, toggleInputBox } =
    useChat3DStore();

  // Character interaction state
  const [isHovering, setIsHovering] = useState(false);
  const characterRef = useRef<THREE.Object3D | null>(null);

  // Get character object from scene
  useEffect(() => {
    if (!scene) return;

    const findCharacter = () => {
      const char = scene.getObjectByName('character');
      if (char) {
        characterRef.current = char;
      }
    };

    // Try to find character periodically
    const interval = setInterval(findCharacter, 100);

    return () => {
      clearInterval(interval);
    };
  }, [scene]);

  // Click detection
  const handleCharacterClick = useCallback(() => {
    toggleInputBox();
  }, [toggleInputBox]);

  useClickDetection({
    camera,
    target: characterRef.current,
    canvas: canvasRef.current,
    enabled: true,
    onHit: handleCharacterClick,
  });

  // Hover detection
  useHoverDetection({
    camera,
    target: characterRef.current,
    canvas: canvasRef.current,
    enabled: true,
    onHoverStart: () => setIsHovering(true),
    onHoverEnd: () => setIsHovering(false),
  });

  // Handle message send from speech bubble
  const handleSend = useCallback(
    (message: string) => {
      onSendMessage?.(message);
    },
    [onSendMessage],
  );

  const handleCloseBubble = useCallback(() => {
    if (inputBoxVisible) {
      toggleInputBox();
    }
  }, [inputBoxVisible, toggleInputBox]);

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
        style={{ touchAction: 'none', cursor: isHovering ? 'pointer' : 'default' }}
      />
      <CyberpunkRoom scene={scene} />
      <ComputerScreen scene={scene} messages={messages} isMobile={isMobile} />
      <CharacterModel
        scene={scene}
        preset={selectedCharacter}
        customization={characterCustomization}
        isHovering={isHovering}
      />
      <SpeechBubble
        camera={camera}
        visible={inputBoxVisible}
        onSend={handleSend}
        onClose={handleCloseBubble}
      />
    </>
  );
}
