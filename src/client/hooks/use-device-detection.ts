'use client';
import { useMemo } from 'react';

export function useDeviceDetection() {
  return useMemo(() => {
    if (typeof window === 'undefined')
      return { isMobile: false, isTablet: false, isDesktop: false };
    const width = window.innerWidth;
    return {
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
    };
  }, []);
}
