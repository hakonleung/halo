import { create } from 'zustand';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColorScheme?: 'red' | 'green' | 'blue';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

interface ConfirmDialogStore {
  isOpen: boolean;
  config: ConfirmDialogConfig | null;
  openDialog: (config: ConfirmDialogConfig) => void;
  closeDialog: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
  isOpen: false,
  config: null,
  openDialog: (config) => set({ isOpen: true, config }),
  closeDialog: () => set({ isOpen: false, config: null }),
  setLoading: (isLoading) =>
    set((state) => ({
      config: state.config ? { ...state.config, isLoading } : null,
    })),
}));
