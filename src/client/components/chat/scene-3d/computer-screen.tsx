/**
 * Computer Screen Component
 *
 * Renders a desk with computer monitor displaying chat messages on a canvas texture.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { RAW_COLORS, RAW_FONTS } from '@/client/theme/tokens/raw-values';

import { COMPUTER_CONFIG } from './configs';

import type { UIMessage } from '@ai-sdk/react';

interface ComputerScreenProps {
  scene: THREE.Scene;
  messages: UIMessage[];
  isMobile?: boolean;
}

export function ComputerScreen({ scene, messages, isMobile = false }: ComputerScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastMessageContentRef = useRef<string>('');

  // Initialize computer hardware (desk + monitor)
  useEffect(() => {
    if (!scene) return;

    const objects: THREE.Object3D[] = [];

    // Desk
    const deskGeometry = new THREE.BoxGeometry(
      COMPUTER_CONFIG.deskSize.width,
      COMPUTER_CONFIG.deskSize.height,
      COMPUTER_CONFIG.deskSize.depth,
    );
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgDark,
      roughness: 0.6,
      metalness: 0.3,
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(
      COMPUTER_CONFIG.position.x,
      COMPUTER_CONFIG.position.y,
      COMPUTER_CONFIG.position.z,
    );
    objects.push(desk);

    // Monitor frame
    const monitorGeometry = new THREE.BoxGeometry(
      COMPUTER_CONFIG.monitorSize.width,
      COMPUTER_CONFIG.monitorSize.height,
      COMPUTER_CONFIG.monitorSize.depth,
    );
    const monitorMaterial = new THREE.MeshStandardMaterial({
      color: RAW_COLORS.bgCarbon,
      roughness: 0.4,
      metalness: 0.6,
    });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.set(
      COMPUTER_CONFIG.position.x,
      COMPUTER_CONFIG.position.y +
        COMPUTER_CONFIG.deskSize.height +
        COMPUTER_CONFIG.monitorSize.height / 2,
      COMPUTER_CONFIG.position.z -
        COMPUTER_CONFIG.deskSize.depth / 2 +
        COMPUTER_CONFIG.monitorSize.depth / 2,
    );
    objects.push(monitor);

    // Screen (canvas texture)
    const resolution = isMobile
      ? COMPUTER_CONFIG.screenResolution.mobile
      : COMPUTER_CONFIG.screenResolution.desktop;

    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    const screenGeometry = new THREE.PlaneGeometry(
      COMPUTER_CONFIG.screenSize.width,
      COMPUTER_CONFIG.screenSize.height,
    );
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(
      monitor.position.x,
      monitor.position.y,
      monitor.position.z + COMPUTER_CONFIG.monitorSize.depth / 2 + 0.01,
    );
    screenMeshRef.current = screen;
    objects.push(screen);

    // Add objects to scene
    objects.forEach((obj) => scene.add(obj));
    objectsRef.current = objects;

    // Cleanup
    return () => {
      objects.forEach((obj) => {
        scene.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      texture.dispose();
      canvasRef.current = null;
      textureRef.current = null;
      screenMeshRef.current = null;
    };
  }, [scene, isMobile]);

  // Update screen texture continuously to support streaming messages
  useEffect(() => {
    if (!canvasRef.current || !textureRef.current) return;

    const updateLoop = () => {
      if (!canvasRef.current || !textureRef.current) return;

      const latestMessages = messages.slice(-COMPUTER_CONFIG.maxVisibleMessages);

      // Get current message content for comparison
      const currentContent = latestMessages.map((m) => extractText(m)).join('|');

      // Only update if content has changed (supports streaming)
      if (currentContent !== lastMessageContentRef.current) {
        updateScreenTexture(canvasRef.current, latestMessages);
        textureRef.current.needsUpdate = true;
        lastMessageContentRef.current = currentContent;
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    // Start update loop
    animationFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [messages]);

  return null; // This component doesn't render React elements
}

/**
 * Extract text content from UIMessage
 */
function extractText(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) return '';

  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => ('text' in part ? part.text : ''))
    .join(' ');
}

/**
 * Update canvas texture with chat messages
 * Messages are aligned to bottom and scroll up
 */
function updateScreenTexture(canvas: HTMLCanvasElement, messages: UIMessage[]): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = RAW_COLORS.bgDeep;
  ctx.fillRect(0, 0, width, height);

  // Draw scanline effect
  ctx.fillStyle = RAW_COLORS.matrix2;
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2);
  }

  // Draw border
  ctx.strokeStyle = RAW_COLORS.matrix30;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Setup text rendering
  const fontSize = Math.floor(width / 32); // Responsive font size
  ctx.font = `${fontSize}px ${RAW_FONTS.mono}`;
  ctx.textBaseline = 'top';

  const padding = 20;
  const lineHeight = fontSize * 1.5;
  const maxWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  // First pass: calculate total height needed for all messages
  interface RenderedLine {
    text: string;
    color: string;
    isRole: boolean;
  }
  const linesToRender: RenderedLine[] = [];

  messages.forEach((message) => {
    // Role label
    const roleColor = message.role === 'user' ? RAW_COLORS.cyber : RAW_COLORS.matrix;
    const roleLabel = message.role === 'user' ? '> USER:' : '> AI:';
    linesToRender.push({ text: roleLabel, color: roleColor, isRole: true });

    // Message content with word wrap
    const content = extractText(message);
    const words = content.split(' ');
    let line = '';

    words.forEach((word, index) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== '') {
        linesToRender.push({ text: line, color: RAW_COLORS.textNeon, isRole: false });
        line = word + ' ';
      } else {
        line = testLine;
      }

      // Last word
      if (index === words.length - 1 && line.trim()) {
        linesToRender.push({ text: line, color: RAW_COLORS.textNeon, isRole: false });
      }
    });

    // Add spacing line between messages
    linesToRender.push({ text: '', color: '', isRole: false });
  });

  // Second pass: render from bottom up
  const totalHeight = linesToRender.length * lineHeight;
  let startY: number;

  if (totalHeight > availableHeight) {
    // More content than fits - show only latest lines from bottom
    startY = height - padding;
    const linesToShow = Math.floor(availableHeight / lineHeight);
    const visibleLines = linesToRender.slice(-linesToShow);

    // Render from bottom
    visibleLines.reverse().forEach((lineData, index) => {
      const y = startY - (index + 1) * lineHeight;
      if (lineData.text) {
        ctx.fillStyle = lineData.color;
        ctx.fillText(lineData.text, padding, y);
      }
    });
  } else {
    // Content fits - align to bottom
    startY = height - padding - totalHeight;
    linesToRender.forEach((lineData, index) => {
      const y = startY + index * lineHeight;
      if (lineData.text) {
        ctx.fillStyle = lineData.color;
        ctx.fillText(lineData.text, padding, y);
      }
    });
  }
}
