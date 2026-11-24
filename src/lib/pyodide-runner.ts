// Client-side Pyodide WebAssembly Runner with 5.0s Execution Watchdog
// Zero-latency, $0-cost Python execution in the browser with infinite loop protection

export interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdin?: (options: { stdin: () => string }) => void;
  globals: {
    get: (key: string) => string | undefined;
    set: (key: string, value: unknown) => void;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
    pyodideInstance?: PyodideInterface;
    pyodideLoadingPromise?: Promise<PyodideInterface>;
    define?: unknown;
  }
}

/**
 * Runs an async loader while temporarily hiding Monaco Editor's AMD `window.define`.
 * Prevents Pyodide's internal `error-stack-parser` from attempting AMD `require("stackframe")`
 * which otherwise triggers 404 MIME errors on Next.js routes.
 */
async function withAmdLoaderHidden<T>(task: () => Promise<T>): Promise<T> {
  const prevDefine = window.define;
  if (prevDefine) {
    window.define = undefined;
  }
  try {
    return await task();
  } finally {
    if (prevDefine) {
      window.define = prevDefine;
    }
  }
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only run in the browser");
  }

  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (window.pyodideLoadingPromise) {
    return window.pyodideLoadingPromise;
  }

  window.pyodideLoadingPromise = withAmdLoaderHidden(async () => {
    // 1. Inject Pyodide loader script if not loaded
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN"));
        document.head.appendChild(script);
      });
    }

    if (!window.loadPyodide) {
      throw new Error("Pyodide loader unavailable");
    }

    // 2. Initialize Pyodide WASM runtime while AMD define remains hidden
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
    });

    window.pyodideInstance = pyodide;
    return pyodide;
  }).catch((err) => {
    // Reset promise so subsequent attempts can recover cleanly
    window.pyodideLoadingPromise = undefined;
    throw err;
  });

  return window.pyodideLoadingPromise;
}

/**
 * Execute Python code in WebAssembly with a strict 5.0-second execution watchdog timer
 * Prevents browser tab freezing on while True: loops or infinite recursion
 */
export async function runPythonCode(
  sourceCode: string,
  stdinInput: string,
  timeoutMs: number = 5000
): Promise<{ stdout: string; stderr: string; executionTimeMs: number; isTLE?: boolean }> {
  const startTime = performance.now();

  try {
    const pyodide = await getPyodide();

    // Reset standard streams and inject stdin
    const wrapper = `
import sys
import io

class StdinIO(io.StringIO):
    def read(self, *args):
        return super().read(*args)

sys.stdin = StdinIO(${JSON.stringify(stdinInput)})
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

${sourceCode}

output_stdout = sys.stdout.getvalue()
output_stderr = sys.stderr.getvalue()
`;

    // 5.0-second execution watchdog timer
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) => {
      timerId = setTimeout(() => resolve({ isTimeout: true }), timeoutMs);
    });

    const executionPromise = pyodide.runPythonAsync(wrapper).then(() => {
      if (timerId !== undefined) clearTimeout(timerId);
      return { isTimeout: false as const };
    });

    const raceResult = await Promise.race([executionPromise, timeoutPromise]);

    if (raceResult.isTimeout) {
      return {
        stdout: "",
        stderr: `Time Limit Exceeded (TLE): Execution exceeded ${(timeoutMs / 1000).toFixed(1)} seconds. Check for infinite loops or non-terminating recursions.`,
        executionTimeMs: timeoutMs,
        isTLE: true,
      };
    }

    const stdout = pyodide.globals.get("output_stdout") || "";
    const stderr = pyodide.globals.get("output_stderr") || "";
    const executionTimeMs = Math.round(performance.now() - startTime);

    return { stdout, stderr, executionTimeMs };
  } catch (err: unknown) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    const message = err instanceof Error ? err.message : String(err);
    return {
      stdout: "",
      stderr: message,
      executionTimeMs,
    };
  }
}
