import { RendererType } from '@/client/types/background-client';

export async function checkWebGPUSupport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!navigator.gpu) return false;

  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function getRendererType(
  preferredType: RendererType,
  webgpuSupported: boolean,
): 'webgl' | 'webgpu' {
  if (preferredType === RendererType.WEBGL) return 'webgl';
  if (preferredType === RendererType.WEBGPU) {
    return webgpuSupported ? 'webgpu' : 'webgl'; // fallback
  }
  // AUTO: 优先 WebGPU
  return webgpuSupported ? 'webgpu' : 'webgl';
}
