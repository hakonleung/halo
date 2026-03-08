export enum BackgroundType {
  TRON_GRID = 'tron-grid',
  MATRIX_RAIN = 'matrix-rain',
  PARTICLE_FIELD = 'particle-field',
  DATA_FLOW = 'data-flow',
}

export enum RendererType {
  AUTO = 'auto', // 自动检测（优先 WebGPU）
  WEBGL = 'webgl', // 强制 WebGL
  WEBGPU = 'webgpu', // 强制 WebGPU（可能不支持）
}

export interface BackgroundConfig {
  type: BackgroundType;
  rendererType: RendererType;
  enabled: boolean;
}
