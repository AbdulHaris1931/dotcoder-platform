// Client-side Pyodide WebAssembly Runner with Dedicated Web Worker Isolation
// True 5.0s hardware-level termination (`worker.terminate()`) for infinite `while True:` loops
// + Dual-CDN failover (jsDelivr -> unpkg) + Idle Background Prefetching for 400-seat labs

export interface PyodideRunResult {
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  isTLE?: boolean;
}

interface WorkerPendingJob {
  resolve: (res: PyodideRunResult) => void;
  reject: (err: Error) => void;
  timerId: ReturnType<typeof setTimeout>;
  startTime: number;
  timeoutMs: number;
}

interface WorkerResponsePayload {
  id: number;
  ok: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

const PYODIDE_CDNS = [
  "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
  "https://unpkg.com/pyodide@0.25.1/",
];

const WORKER_SCRIPT = `
const CDNS = ${JSON.stringify(PYODIDE_CDNS)};
let pyodideReadyPromise = null;

async function ensurePyodide() {
  if (pyodideReadyPromise) return pyodideReadyPromise;

  pyodideReadyPromise = (async () => {
    let lastError = null;
    for (const base of CDNS) {
      try {
        importScripts(base + "pyodide.js");
        const instance = await self.loadPyodide({ indexURL: base });
        return instance;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Failed to load Pyodide WebAssembly from CDN.");
  })().catch((err) => {
    pyodideReadyPromise = null;
    throw err;
  });

  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const data = event.data || {};
  if (data.type === "PREFETCH") {
    try {
      await ensurePyodide();
      self.postMessage({ id: data.id, ok: true, stdout: "", stderr: "" });
    } catch (err) {
      self.postMessage({ id: data.id, ok: false, error: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (data.type === "RUN") {
    try {
      const pyodide = await ensurePyodide();
      const wrapper = [
        "import sys, io",
        "class StdinIO(io.StringIO):",
        "    def read(self, *args):",
        "        return super().read(*args)",
        "sys.stdin = StdinIO(" + JSON.stringify(data.stdinInput || "") + ")",
        "sys.stdout = io.StringIO()",
        "sys.stderr = io.StringIO()",
        data.sourceCode || "",
        "output_stdout = sys.stdout.getvalue()",
        "output_stderr = sys.stderr.getvalue()",
      ].join("\\n");

      await pyodide.runPythonAsync(wrapper);
      const stdout = pyodide.globals.get("output_stdout") || "";
      const stderr = pyodide.globals.get("output_stderr") || "";
      self.postMessage({ id: data.id, ok: true, stdout, stderr });
    } catch (err) {
      self.postMessage({
        id: data.id,
        ok: false,
        error: String(err && err.message ? err.message : err),
      });
    }
  }
};
`;

let sharedWorker: Worker | null = null;
let sharedWorkerBlobUrl: string | null = null;
let jobSeq = 1;
const pendingJobs = new Map<number, WorkerPendingJob>();

function terminateSharedWorker(): void {
  if (sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
  }
  if (sharedWorkerBlobUrl) {
    URL.revokeObjectURL(sharedWorkerBlobUrl);
    sharedWorkerBlobUrl = null;
  }
}

function getOrCreatePyodideWorker(): Worker {
  if (sharedWorker) return sharedWorker;

  const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);

  worker.onmessage = (event: MessageEvent<WorkerResponsePayload>) => {
    const payload = event.data;
    if (!payload || typeof payload.id !== "number") return;
    const job = pendingJobs.get(payload.id);
    if (!job) return;

    clearTimeout(job.timerId);
    pendingJobs.delete(payload.id);
    const executionTimeMs = Math.max(1, Math.round(performance.now() - job.startTime));

    if (payload.ok) {
      job.resolve({
        stdout: payload.stdout || "",
        stderr: payload.stderr || "",
        executionTimeMs,
      });
    } else {
      job.resolve({
        stdout: "",
        stderr: payload.error || "Python runtime error.",
        executionTimeMs,
      });
    }
  };

  worker.onerror = (err) => {
    const message = err.message || "Pyodide worker crashed.";
    pendingJobs.forEach((job) => {
      clearTimeout(job.timerId);
      job.resolve({
        stdout: "",
        stderr: message,
        executionTimeMs: Math.max(1, Math.round(performance.now() - job.startTime)),
      });
    });
    pendingJobs.clear();
    terminateSharedWorker();
  };

  sharedWorker = worker;
  sharedWorkerBlobUrl = url;
  return worker;
}

/**
 * Silently warms Pyodide WASM in the background during idle dashboard time
 * so 400 lab PCs cache the runtime before an exam starts.
 */
export function prefetchPyodideRuntime(): void {
  if (typeof window === "undefined" || typeof Worker === "undefined") return;
  if (sharedWorker) return;

  try {
    const worker = getOrCreatePyodideWorker();
    const id = jobSeq++;
    worker.postMessage({ id, type: "PREFETCH" });
  } catch {
    // Non-fatal if browser restricts Blob workers
  }
}

/**
 * Execute Python code inside an isolated Web Worker with a hard `worker.terminate()`
 * watchdog so `while True:` infinite loops never freeze low-RAM college lab PCs.
 */
export async function runPythonCode(
  sourceCode: string,
  stdinInput: string,
  timeoutMs: number = 5000
): Promise<PyodideRunResult> {
  if (typeof window === "undefined") {
    return {
      stdout: "",
      stderr: "Pyodide can only run in the browser.",
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();

  try {
    const worker = getOrCreatePyodideWorker();
    const id = jobSeq++;

    return await new Promise<PyodideRunResult>((resolve, reject) => {
      const timerId = setTimeout(() => {
        pendingJobs.delete(id);
        // Hardware-level kill of stuck WASM loop; fresh worker spawns on next run
        terminateSharedWorker();
        resolve({
          stdout: "",
          stderr: `Time Limit Exceeded (TLE): Execution exceeded ${(timeoutMs / 1000).toFixed(1)} seconds. Infinite loop terminated safely.`,
          executionTimeMs: timeoutMs,
          isTLE: true,
        });
      }, timeoutMs);

      pendingJobs.set(id, {
        resolve,
        reject,
        timerId,
        startTime,
        timeoutMs,
      });

      worker.postMessage({
        id,
        type: "RUN",
        sourceCode,
        stdinInput,
      });
    });
  } catch (err: unknown) {
    const executionTimeMs = Math.max(1, Math.round(performance.now() - startTime));
    return {
      stdout: "",
      stderr: err instanceof Error ? err.message : String(err),
      executionTimeMs,
    };
  }
}
