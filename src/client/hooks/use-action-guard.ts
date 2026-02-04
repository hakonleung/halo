import { useCallback } from 'react';

import { useConfirmDialogStore } from '@/client/store/confirm-dialog-store';

import type { ConfirmDialogConfig } from '@/client/store/confirm-dialog-store';

export function useActionGuard() {
  const openDialog = useConfirmDialogStore((state) => state.openDialog);

  const guard = useCallback(
    (
      config: Omit<ConfirmDialogConfig, 'onConfirm'> & {
        onConfirm: () => void | Promise<void>;
      },
    ) => {
      return () => {
        openDialog({
          ...config,
          onConfirm: config.onConfirm,
        });
      };
    },
    [openDialog],
  );

  return { guard };
}
