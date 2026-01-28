import type { Metadata } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';
import { ChakraProvider } from '@/lib/chakra-provider';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${orbitron.variable} ${rajdhani.variable}`}
    >
      <body>
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
