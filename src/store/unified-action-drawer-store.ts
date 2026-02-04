'use client';

import { create } from 'zustand';
import type { ActionType } from '@/types/drawer';

export const useUnifiedActionDrawerStore = create<{
  actionType: ActionType | null;
  actionDataId: string | null;
  isEditMode: boolean;
  setAction: (type: ActionType | null, dataId: string | null) => void;
  setEditMode: (isEdit: boolean) => void;
  closeDrawer: () => void;
}>((set) => ({
  actionType: null,
  actionDataId: null,
  isEditMode: false,
  setAction: (type, dataId) =>
    set({
      actionType: type,
      actionDataId: dataId,
      isEditMode: false,
    }),
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  closeDrawer: () =>
    set({
      actionType: null,
      actionDataId: null,
      isEditMode: false,
    }),
}));
