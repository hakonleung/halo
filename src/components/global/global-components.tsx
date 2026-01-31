'use client';

import { AnimatedBackground } from '@/components/layout/animated-background';
import { DetailDrawers } from '@/components/log/detail-drawers';
import { ActionDrawer } from '@/components/shared/action-drawer';

/**
 * Global components wrapper that includes all global UI elements
 * - AnimatedBackground: Background animation
 * - DetailDrawers: Detail drawers synced with URL query
 * - ActionDrawer: Action drawer for creating records/goals/notes
 */
export function GlobalComponents({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      {children}
      <DetailDrawers />
      <ActionDrawer />
    </>
  );
}
