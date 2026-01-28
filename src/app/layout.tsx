import type { Metadata } from 'next';
import { ChakraProvider } from '@/lib/chakra-provider';
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
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
