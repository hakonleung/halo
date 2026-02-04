'use client';

import { useState, useEffect, useRef, type RefObject } from 'react';

/**
 * Hook to track content position relative to viewport center
 * Uses contentRef's parent as the container
 * Calculates translate based on the distance between container center and viewport center
 * @param scrollContainerRef - Optional ref to the scrollable container (if not provided, uses window)
 */
export function useViewportPosition(scrollContainerRef?: RefObject<HTMLElement | null>): {
  translateX: number;
  contentRef: RefObject<HTMLDivElement | null>;
} {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const parentElement = contentElement.parentElement;
    if (!parentElement) return;

    const updatePosition = () => {
      const parentRect = parentElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();

      // Get viewport center - either from scroll container or window
      let viewportCenter: number;
      if (scrollContainerRef?.current) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        viewportCenter = containerRect.left + containerRect.width / 2;
      } else {
        viewportCenter = window.innerWidth / 2;
      }

      // Calculate parent container center
      const parentCenter = parentRect.left + parentRect.width / 2;

      // Calculate translate: distance from parent center to viewport center
      // This moves content center from parent center to viewport center
      let translate = viewportCenter - parentCenter;

      // Clamp translate to ensure content doesn't exceed parent boundaries
      const contentWidth = contentRect.width;
      const parentLeft = parentRect.left;
      const parentRight = parentRect.right;

      // Content's left edge after translate: parentCenter - contentWidth/2 + translate
      // Content's right edge after translate: parentCenter + contentWidth/2 + translate
      // Both must be within [parentLeft, parentRight]
      const minTranslate = parentLeft - (parentCenter - contentWidth / 2);
      const maxTranslate = parentRight - (parentCenter + contentWidth / 2);

      translate = Math.max(minTranslate, Math.min(maxTranslate, translate));

      setTranslateX(translate);
    };

    // Initial calculation
    updatePosition();

    // Update on scroll and resize
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.addEventListener('scroll', updatePosition, { passive: true });
    } else {
      window.addEventListener('scroll', updatePosition, { passive: true });
    }
    window.addEventListener('resize', updatePosition);

    // Use ResizeObserver to track parent and content size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(parentElement);
    resizeObserver.observe(contentElement);

    // Also observe scroll container size changes if it exists
    if (scrollContainerRef?.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.removeEventListener('scroll', updatePosition);
      } else {
        window.removeEventListener('scroll', updatePosition);
      }
      window.removeEventListener('resize', updatePosition);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef]);

  return { translateX, contentRef };
}
