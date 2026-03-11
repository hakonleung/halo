/**
 * 3D Chat Scene Container
 *
 * Main component that initializes and manages the 3D cyberpunk chat scene.
 * Handles dynamic import to avoid SSR issues.
 */

'use client';

import { Box, Spinner, Center, IconButton, VisuallyHidden } from '@chakra-ui/react';
import { Settings } from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { useDeviceDetection } from '@/client/hooks/use-device-detection';
import { useSettings } from '@/client/hooks/use-settings';
import { useChat3DStore } from '@/client/store/chat-3d-store';

import { CharacterModel } from './character-model';
import { CharacterSettingsPanel } from './character-settings-panel';
import { ComputerScreen } from './computer-screen';
import { CyberpunkRoom } from './cyberpunk-room';
import { applyMobileOptimizations } from './mobile-optimizations';
import { SpeechBubble } from './speech-bubble';
import { useCameraControls } from './use-camera-controls';
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

  // Detect reduced motion preference for accessibility
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Load user settings
  const { settings } = useSettings();

  // 3D chat state
  const {
    selectedCharacter,
    characterCustomization,
    inputBoxVisible,
    toggleInputBox,
    setCharacter,
    setCustomization,
  } = useChat3DStore();

  // Character interaction state
  const [isHovering, setIsHovering] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const characterRef = useRef<THREE.Object3D | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  // Capture canvas element from callback ref
  const handleCanvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      canvasElementRef.current = canvas;
      canvasRef(canvas);
    },
    [canvasRef],
  );

  // Load saved settings on mount
  useEffect(() => {
    if (settings?.chat3DSettings) {
      const saved = settings.chat3DSettings;
      if (saved.selectedCharacter) {
        setCharacter(saved.selectedCharacter);
      }
      if (saved.customization) {
        setCustomization(saved.customization);
      }
    }
  }, [settings, setCharacter, setCustomization]);

  // Apply mobile optimizations when scene is ready
  useEffect(() => {
    if (!scene || !renderer) return;
    applyMobileOptimizations(scene, renderer, isMobile);
  }, [scene, renderer, isMobile]);

  // Handle WebGL context lost/restored
  useEffect(() => {
    const canvas = canvasElementRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
      console.warn('WebGL context lost');
    };

    const handleContextRestored = () => {
      setContextLost(false);
      console.log('WebGL context restored');
      // Reload page to reinitialize scene
      window.location.reload();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

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
    target: characterRef,
    canvas: canvasElementRef,
    enabled: true,
    onHit: handleCharacterClick,
  });

  // Hover detection
  useHoverDetection({
    camera,
    target: characterRef,
    canvas: canvasElementRef,
    enabled: true,
    onHoverStart: () => setIsHovering(true),
    onHoverEnd: () => setIsHovering(false),
  });

  // Camera controls (zoom and rotate)
  useCameraControls({
    camera,
    canvas: canvasElementRef.current,
    enabled: true,
    enableZoom: true,
    enableRotate: true,
    enablePan: false,
    minDistance: 1, // Allow zooming in much closer
    maxDistance: 15,
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

  // Check if scene is ready
  const isLoading = !scene || !camera || !renderer;

  return (
    <>
      {/* Screen reader announcement */}
      <VisuallyHidden role="status" aria-live="polite">
        3D chat scene active. Click on character to send a message.
      </VisuallyHidden>

      {/* Always render canvas so handleCanvasRef can fire */}
      <Box
        as="canvas"
        ref={handleCanvasRef}
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        style={{ touchAction: 'none', cursor: isHovering ? 'pointer' : 'default' }}
        aria-label="3D chat scene"
        role="img"
      />

      {/* Loading overlay */}
      {isLoading && (
        <Center position="absolute" top={0} left={0} w="full" h="full" zIndex={10}>
          <Spinner color="brand.matrix" size="lg" />
        </Center>
      )}

      {/* Context lost overlay */}
      {contextLost && (
        <Center
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          zIndex={20}
          bg="rgba(0, 0, 0, 0.9)"
        >
          <Box textAlign="center" p={6}>
            <Box color="brand.error" mb={4} fontSize="xl">
              ⚠️
            </Box>
            <Box color="text.neon" mb={2} fontWeight="bold">
              WebGL Context Lost
            </Box>
            <Box color="text.mist" fontSize="sm">
              The 3D scene will reload automatically when context is restored.
            </Box>
          </Box>
        </Center>
      )}

      {/* 3D scene components - only render when ready */}
      {!isLoading && (
        <>
          <CyberpunkRoom scene={scene} />
          <ComputerScreen scene={scene} messages={messages} isMobile={isMobile} />
          <CharacterModel
            scene={scene}
            preset={selectedCharacter}
            customization={characterCustomization}
            isHovering={isHovering}
            prefersReducedMotion={prefersReducedMotion}
          />
          <SpeechBubble
            camera={camera}
            visible={inputBoxVisible}
            onSend={handleSend}
            onClose={handleCloseBubble}
          />

          {/* Floating settings button */}
          <IconButton
            aria-label="Character settings"
            position="fixed"
            bottom={6}
            right={6}
            onClick={() => setSettingsPanelOpen(true)}
            size="lg"
            variant="solid"
            bg="rgba(0, 255, 65, 0.1)"
            borderWidth="1px"
            borderColor="brand.matrix"
            color="brand.matrix"
            _hover={{
              bg: 'rgba(0, 255, 65, 0.2)',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
            }}
            boxShadow="0 0 10px rgba(0, 255, 65, 0.3)"
            zIndex={100}
          >
            <Settings size={20} />
          </IconButton>

          {/* Character settings panel */}
          <CharacterSettingsPanel
            isOpen={settingsPanelOpen}
            onClose={() => setSettingsPanelOpen(false)}
          />
        </>
      )}
    </>
  );
}
