'use client';

import { Provider } from '@/components/ui/provider';

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
