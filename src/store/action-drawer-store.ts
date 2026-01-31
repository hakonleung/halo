'use client';

import { create } from 'zustand';
import { ActionDrawerTab } from '@/types/drawer';

interface ActionDrawerStore {
  isOpen: boolean;
  activeTab: ActionDrawerTab;
  openDrawer: (tab?: ActionDrawerTab) => void;
  closeDrawer: () => void;
  setActiveTab: (tab: ActionDrawerTab) => void;
}

export const useActionDrawerStore = create<ActionDrawerStore>((set) => ({
  isOpen: false,
  activeTab: ActionDrawerTab.Record,
  openDrawer: (tab) => {
    if (tab) {
      set({ activeTab: tab, isOpen: true });
    } else {
      set({ isOpen: true });
    }
  },
  closeDrawer: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
