import { spawn } from 'child_process';
import { createInterface } from 'readline';

/** Run a Python script with args, return parsed JSON from stdout */
export function runPython<T>(scriptPath: string, args: string[], stdinData?: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    py.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });
    if (stdinData !== undefined) {
      py.stdin.write(stdinData);
      py.stdin.end();
    }
    py.on('close', (code) => {
      if (stderr) console.error('[python] stderr:', stderr);
      if (code !== 0) {
        reject(new Error(`Python exited ${code}: ${stderr || stdout}`));
        return;
      }
      try {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error(`Python stdout not valid JSON: ${stdout}`));
      }
    });
    py.on('error', reject);
  });
}

/**
 * Spawn a Python script and process each NDJSON line with an async callback.
 * Awaits each onLine call before processing the next line (backpressure).
 */
export async function processNdjsonLines(
  scriptPath: string,
  args: string[],
  stdinData: string,
  onLine: (obj: Record<string, unknown>) => Promise<void>,
): Promise<void> {
  const py = spawn('python3', [scriptPath, ...args]);
  py.stdin.write(stdinData);
  py.stdin.end();
  py.stderr.on('data', (d: Buffer) => console.error('[python] stderr:', d.toString()));

  // Register close handler immediately to avoid race condition
  const closePromise = new Promise<void>((resolve, reject) => {
    py.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Python exited ${code}`))));
    py.on('error', reject);
  });

  const rl = createInterface({ input: py.stdout, crlfDelay: Infinity });
  try {
    for await (const line of rl) {
      if (!line.trim()) continue;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      await onLine(JSON.parse(line) as Record<string, unknown>);
    }
    // Readline ended normally — check process exit code
    await closePromise;
  } catch (e) {
    // Either onLine threw or closePromise rejected (non-zero exit).
    // Kill the process if still running, silence the dangling closePromise.
    py.kill();
    closePromise.catch(() => {});
    throw e;
  }
}

/** Wrap a ReadableStream as an NDJSON streaming Response */
export function createNdjsonResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
