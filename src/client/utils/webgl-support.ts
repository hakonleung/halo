/**
 * WebGL Support Detection
 *
 * Detects if the browser supports WebGL for 3D rendering.
 */

/**
 * Check if WebGL is supported in the current browser
 * @returns true if WebGL is available, false otherwise
 */
export function checkWebGLSupport(): boolean {
  try {
    // Create a test canvas
    const canvas = document.createElement('canvas');

    // Try to get WebGL context (or experimental-webgl for older browsers)
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2');

    // If we got a context, WebGL is supported
    return !!gl;
  } catch {
    // If any error occurs, WebGL is not supported
    return false;
  }
}

/**
 * Get WebGL support information including version and capabilities
 */
export interface WebGLInfo {
  supported: boolean;
  version: 'webgl' | 'webgl2' | null;
  renderer?: string;
  vendor?: string;
  maxTextureSize?: number;
}

/**
 * Get detailed WebGL support information
 * @returns WebGL support info including version and capabilities
 */
export function getWebGLInfo(): WebGLInfo {
  try {
    const canvas = document.createElement('canvas');

    // Try WebGL 2 first
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    let gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    let version: 'webgl' | 'webgl2' | null = gl ? 'webgl2' : null;

    // Fallback to WebGL 1
    if (!gl) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      gl = (canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        version = 'webgl';
      }
    }

    if (!gl) {
      return { supported: false, version: null };
    }

    // Get renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : undefined;
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : undefined;

    // Get capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

    return {
      supported: true,
      version,
      renderer,
      vendor,
      maxTextureSize,
    };
  } catch {
    return { supported: false, version: null };
  }
}

/**
 * Check if the device meets minimum requirements for 3D scene
 * @returns true if device can handle 3D rendering well
 */
export function meetsMinimumRequirements(): boolean {
  const info = getWebGLInfo();

  if (!info.supported) {
    return false;
  }

  // Check minimum texture size (at least 1024x1024)
  if (info.maxTextureSize && info.maxTextureSize < 1024) {
    return false;
  }

  // Prefer WebGL 2 for better performance
  // But WebGL 1 is acceptable
  return true;
}

/**
 * Get a user-friendly message about WebGL support status
 */
export function getWebGLMessage(): string {
  const info = getWebGLInfo();

  if (!info.supported) {
    return 'Your browser does not support WebGL, which is required for 3D features. Please try using a modern browser like Chrome, Firefox, or Edge.';
  }

  if (info.maxTextureSize && info.maxTextureSize < 1024) {
    return 'Your device may not have sufficient graphics capabilities for optimal 3D performance.';
  }

  return '3D features are available!';
}
