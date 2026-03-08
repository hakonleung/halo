/**
 * Click Detection Hook
 *
 * Uses Three.js Raycaster to detect clicks on 3D objects.
 */

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import * as THREE from 'three';

interface ClickDetectionOptions {
  camera: THREE.Camera | null;
  target: RefObject<THREE.Object3D | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  enabled?: boolean;
  onHit?: () => void;
}

/**
 * Detect clicks on a 3D object using raycasting
 */
export function useClickDetection({
  camera,
  target,
  canvas,
  enabled = true,
  onHit,
}: ClickDetectionOptions): void {
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Read current values from refs
      const currentTarget = target.current;
      const currentCanvas = canvas.current;

      if (!camera || !currentTarget || !currentCanvas || !enabled) return;

      // Get canvas bounding rect
      const rect = currentCanvas.getBoundingClientRect();

      // Get pointer position (mouse or touch)
      let clientX: number;
      let clientY: number;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        // Touch event
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      // Convert to normalized device coordinates (-1 to +1)
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Check for intersections
      const intersects = raycasterRef.current.intersectObject(currentTarget, true);

      if (intersects.length > 0) {
        // Hit detected!
        onHit?.();
      }
    },
    [camera, target, canvas, enabled, onHit],
  );

  useEffect(() => {
    const currentCanvas = canvas.current;
    if (!currentCanvas || !enabled) return;

    // Add event listeners
    currentCanvas.addEventListener('click', handleClick);
    currentCanvas.addEventListener('touchend', handleClick);

    return () => {
      currentCanvas.removeEventListener('click', handleClick);
      currentCanvas.removeEventListener('touchend', handleClick);
    };
  }, [canvas, enabled, handleClick]);
}

/**
 * Detect hover on a 3D object using raycasting
 */
export function useHoverDetection({
  camera,
  target,
  canvas,
  enabled = true,
  onHoverStart,
  onHoverEnd,
}: ClickDetectionOptions & {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}): void {
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isHoveringRef = useRef(false);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      // Read current values from refs
      const currentTarget = target.current;
      const currentCanvas = canvas.current;

      if (!camera || !currentTarget || !currentCanvas || !enabled) return;

      const rect = currentCanvas.getBoundingClientRect();

      // Convert to normalized device coordinates
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Check for intersections
      const intersects = raycasterRef.current.intersectObject(currentTarget, true);

      const wasHovering = isHoveringRef.current;
      const isNowHovering = intersects.length > 0;

      if (isNowHovering && !wasHovering) {
        // Hover started
        isHoveringRef.current = true;
        onHoverStart?.();
      } else if (!isNowHovering && wasHovering) {
        // Hover ended
        isHoveringRef.current = false;
        onHoverEnd?.();
      }
    },
    [camera, target, canvas, enabled, onHoverStart, onHoverEnd],
  );

  useEffect(() => {
    const currentCanvas = canvas.current;
    if (!currentCanvas || !enabled) return;

    currentCanvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      currentCanvas.removeEventListener('mousemove', handleMouseMove);
      // Reset hover state on cleanup
      if (isHoveringRef.current) {
        isHoveringRef.current = false;
        onHoverEnd?.();
      }
    };
  }, [canvas, enabled, handleMouseMove, onHoverEnd]);
}
