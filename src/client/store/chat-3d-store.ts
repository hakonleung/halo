/**
 * 3D Chat Scene Store
 *
 * Zustand store for managing 3D chat view state and character customization.
 */

import { create } from 'zustand';

import { CharacterPreset, DEFAULT_CUSTOMIZATION } from '@/client/types/chat-3d-client';

import type { CharacterCustomization } from '@/client/types/chat-3d-client';

interface Chat3DStore {
  /** Whether 3D mode is currently active */
  is3DMode: boolean;

  /** Currently selected character preset */
  selectedCharacter: CharacterPreset;

  /** Current character customization settings */
  characterCustomization: CharacterCustomization;

  /** Whether the input box/speech bubble is visible */
  inputBoxVisible: boolean;

  /** Toggle between 2D and 3D mode */
  toggle3DMode: () => void;

  /** Set the selected character preset */
  setCharacter: (preset: CharacterPreset) => void;

  /** Update character customization (partial update) */
  setCustomization: (custom: Partial<CharacterCustomization>) => void;

  /** Toggle input box visibility */
  toggleInputBox: () => void;

  /** Reset to default state */
  reset: () => void;
}

const initialState = {
  is3DMode: false,
  selectedCharacter: CharacterPreset.HACKER,
  characterCustomization: DEFAULT_CUSTOMIZATION,
  inputBoxVisible: false,
};

export const useChat3DStore = create<Chat3DStore>((set) => ({
  ...initialState,

  toggle3DMode: () => set((state) => ({ is3DMode: !state.is3DMode })),

  setCharacter: (preset: CharacterPreset) => set({ selectedCharacter: preset }),

  setCustomization: (custom: Partial<CharacterCustomization>) =>
    set((state) => ({
      characterCustomization: {
        ...state.characterCustomization,
        ...custom,
      },
    })),

  toggleInputBox: () => set((state) => ({ inputBoxVisible: !state.inputBoxVisible })),

  reset: () => set(initialState),
}));
