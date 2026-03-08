import { BackgroundType } from '@/client/types/background-client';

export interface TronGridConfig {
  segmentCount: { desktop: number; mobile: number };
  waveAmplitude: number;
  waveSpeed: number;
}

export interface MatrixRainConfig {
  columnCount: { desktop: number; mobile: number };
  fallSpeed: [number, number];
  charSize: number;
}

export interface ParticleFieldConfig {
  particleCount: { desktop: number; mobile: number };
  moveSpeed: number;
  connectionDistance: number;
}

export interface DataFlowConfig {
  lineCount: { desktop: number; mobile: number };
  lineSpeed: [number, number];
  curveSegments: number;
}

export const BACKGROUND_CONFIGS = {
  [BackgroundType.TRON_GRID]: {
    segmentCount: { desktop: 40, mobile: 20 }, // 减少网格密度：100 -> 40
    waveAmplitude: 8,
    waveSpeed: 0.015,
  } satisfies TronGridConfig,
  [BackgroundType.MATRIX_RAIN]: {
    columnCount: { desktop: 25, mobile: 15 }, // 减少列数：60 -> 25
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    fallSpeed: [0.005, 0.02] as [number, number],
    charSize: 24,
  } satisfies MatrixRainConfig,
  [BackgroundType.PARTICLE_FIELD]: {
    particleCount: { desktop: 1500, mobile: 500 }, // 减少粒子：5000 -> 1500
    moveSpeed: 0.2,
    connectionDistance: 80, // 减少连接距离：100 -> 80
  } satisfies ParticleFieldConfig,
  [BackgroundType.DATA_FLOW]: {
    lineCount: { desktop: 15, mobile: 8 }, // 减少线条：40 -> 15
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    lineSpeed: [0.002, 0.01] as [number, number],
    curveSegments: 20, // 减少曲线段：30 -> 20
  } satisfies DataFlowConfig,
} as const;
