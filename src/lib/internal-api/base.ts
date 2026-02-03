/**
 * Base API Service
 * 提供基础的 fetch 方法
 */

// Generic API Response wrapper
export type ApiResponse<T> = { data: T } | { error: string };

export class BaseApiService {
  /**
   * Base fetch method with error handling
   */
  static async fetchApi<T>(url: string, options?: globalThis.RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  }
}
