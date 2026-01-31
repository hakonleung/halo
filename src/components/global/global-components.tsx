'use client';

import { AnimatedBackground } from '@/components/layout/animated-background';
import { DetailDrawers } from '@/components/log/detail-drawers';
import { ActionDrawer } from '@/components/shared/action-drawer';
import { EditorModal } from '@/components/shared/editor-modal';

/**
 * Global components wrapper that includes all global UI elements
 * - AnimatedBackground: Background animation
 * - DetailDrawers: Detail drawers synced with URL query
 * - ActionDrawer: Action drawer for creating records/goals/notes
 * - EditorModal: Global editor modal for rich text and markdown editing
 */
export function GlobalComponents({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      {children}
      <DetailDrawers />
      <ActionDrawer />
      <EditorModal />
    </>
  );
}
