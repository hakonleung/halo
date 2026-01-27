/**
 * Base API Service
 * 提供基础的 fetch 方法
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

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

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return res.json() as Promise<T>;
  }

  /**
   * Fetch streaming response (for Server-Sent Events)
   */
  static async fetchStream(
    url: string,
    options?: globalThis.RequestInit,
  ): Promise<ReadableStream<Uint8Array> | null> {
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

    return res.body;
  }
}
