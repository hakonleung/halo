'use client';

import { create } from 'zustand';
import { DetailDrawerType } from '@/types/drawer';

interface DetailDrawerStore {
  drawerType: DetailDrawerType | null;
  drawerId: string | null;
  setDrawer: (type: DetailDrawerType | null, id: string | null) => void;
  closeDrawer: () => void;
}

export const useDetailDrawerStore = create<DetailDrawerStore>((set) => ({
  drawerType: null,
  drawerId: null,
  setDrawer: (type, id) => set({ drawerType: type, drawerId: id }),
  closeDrawer: () => set({ drawerType: null, drawerId: null }),
}));
