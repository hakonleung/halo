'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useConfirmDialogStore } from '@/store/confirm-dialog-store';

export function GlobalConfirmDialog() {
  const { isOpen, config, closeDialog, setLoading } = useConfirmDialogStore();

  const handleConfirm = async () => {
    if (!config) return;

    try {
      setLoading(true);
      await config.onConfirm();
      closeDialog();
    } catch {
      // Error handling is done by the caller
      setLoading(false);
    }
  };

  if (!config) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={closeDialog}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      confirmColorScheme={config.confirmColorScheme}
      isLoading={config.isLoading}
    />
  );
}
