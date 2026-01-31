import type { Metadata } from 'next';
import { ChakraProvider } from '@/lib/chakra-provider';
import { AnimatedBackground } from '@/components/layout/animated-background';
import { ActionDrawerProvider } from '@/components/shared/action-drawer-context';
import { DetailDrawerProvider } from '@/components/log/detail-drawer-provider';
import { DetailDrawers } from '@/components/log/detail-drawers';
import './fonts.css';

export const metadata: Metadata = {
  title: 'NEO-LOG | Log your life. Hack your future.',
  description: 'AI-native life tracking system with cyberpunk aesthetics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ChakraProvider>
          <ActionDrawerProvider>
            <DetailDrawerProvider>
              <AnimatedBackground />
              {children}
              <DetailDrawers />
            </DetailDrawerProvider>
          </ActionDrawerProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
