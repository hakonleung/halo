'use client';
import dynamic from 'next/dynamic';

import { BackgroundType } from '@/client/types/background-client';

// Dynamic imports to avoid SSR issues
const TronGridBackground = dynamic(
  () =>
    import('./tron-grid-background').then((m) => ({
      default: m.TronGridBackground,
    })),
  { ssr: false },
);
const MatrixRainBackground = dynamic(
  () =>
    import('./matrix-rain-background').then((m) => ({
      default: m.MatrixRainBackground,
    })),
  { ssr: false },
);
const ParticleFieldBackground = dynamic(
  () =>
    import('./particle-field-background').then((m) => ({
      default: m.ParticleFieldBackground,
    })),
  { ssr: false },
);
const DataFlowBackground = dynamic(
  () =>
    import('./data-flow-background').then((m) => ({
      default: m.DataFlowBackground,
    })),
  { ssr: false },
);

interface ThreeBackgroundProps {
  type: BackgroundType;
}

export function ThreeBackground({ type }: ThreeBackgroundProps) {
  switch (type) {
    case BackgroundType.TRON_GRID:
      return <TronGridBackground />;
    case BackgroundType.MATRIX_RAIN:
      return <MatrixRainBackground />;
    case BackgroundType.PARTICLE_FIELD:
      return <ParticleFieldBackground />;
    case BackgroundType.DATA_FLOW:
      return <DataFlowBackground />;
    default:
      return <TronGridBackground />;
  }
}
