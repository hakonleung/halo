/**
 * Click Detection Hook
 *
 * Uses Three.js Raycaster to detect clicks on 3D objects.
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface ClickDetectionOptions {
  camera: THREE.Camera | null;
  target: THREE.Object3D | null;
  canvas: HTMLCanvasElement | null;
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
      if (!camera || !target || !canvas || !enabled) return;

      // Get canvas bounding rect
      const rect = canvas.getBoundingClientRect();

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
      const intersects = raycasterRef.current.intersectObject(target, true);

      if (intersects.length > 0) {
        // Hit detected!
        onHit?.();
      }
    },
    [camera, target, canvas, enabled, onHit],
  );

  useEffect(() => {
    if (!canvas || !enabled) return;

    // Add event listeners
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchend', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchend', handleClick);
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
      if (!camera || !target || !canvas || !enabled) return;

      const rect = canvas.getBoundingClientRect();

      // Convert to normalized device coordinates
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Check for intersections
      const intersects = raycasterRef.current.intersectObject(target, true);

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
    if (!canvas || !enabled) return;

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      // Reset hover state on cleanup
      if (isHoveringRef.current) {
        isHoveringRef.current = false;
        onHoverEnd?.();
      }
    };
  }, [canvas, enabled, handleMouseMove, onHoverEnd]);
}
