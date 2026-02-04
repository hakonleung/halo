import type { Metadata } from 'next';
import { GlobalComponents } from '@/client/components/global-components';
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
        <GlobalComponents>{children}</GlobalComponents>
      </body>
    </html>
  );
}
