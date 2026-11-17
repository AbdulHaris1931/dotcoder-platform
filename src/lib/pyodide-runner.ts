// Client-side Pyodide WebAssembly Runner for zero-latency, $0-cost Python execution

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    pyodideInstance?: any;
    pyodideLoadingPromise?: Promise<any>;
  }
}

export async function getPyodide(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only run in the browser");
  }

  if (window.pyodideInstance) {
    return window.pyodideInstance;
  }

  if (window.pyodideLoadingPromise) {
    return window.pyodideLoadingPromise;
  }

  window.pyodideLoadingPromise = (async () => {
    // 1. Inject Pyodide script if not loaded
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

    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
    });

    window.pyodideInstance = pyodide;
    return pyodide;
  })();

  return window.pyodideLoadingPromise;
}

export async function runPythonCode(
  sourceCode: string,
  stdinInput: string
): Promise<{ stdout: string; stderr: string; executionTimeMs: number }> {
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

    await pyodide.runPythonAsync(wrapper);

    const stdout = pyodide.globals.get("output_stdout") || "";
    const stderr = pyodide.globals.get("output_stderr") || "";
    const executionTimeMs = Math.round(performance.now() - startTime);

    return { stdout, stderr, executionTimeMs };
  } catch (err: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      stdout: "",
      stderr: err.message || String(err),
      executionTimeMs,
    };
  }
}
