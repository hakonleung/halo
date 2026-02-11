import { notFound } from 'next/navigation';

import { PlaygroundContent } from '@/client/components/dev/playground-content';

export default function PlaygroundPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return <PlaygroundContent />;
}
