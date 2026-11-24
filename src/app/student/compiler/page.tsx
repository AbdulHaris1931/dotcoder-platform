"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Terminal,
  ChevronDown,
  Trash2,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  History,
  Wand2,
  WrapText,
  X,
  MoreHorizontal,
  Code2,
  FileText,
} from "lucide-react";
import { SupportedLanguage } from "@/types";
import { runPythonCode } from "@/lib/pyodide-runner";
import { EqAiDrawer } from "@/components/ai/eq-ai-drawer";

// History item interface persisted in localStorage
interface RunHistoryItem {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  executionTimeMs: number;
  engine: string;
  status: "success" | "error";
  stdoutPreview: string;
  stderrPreview?: string;
  code: string;
}

// Preset algorithm templates for students to instantly experiment
interface CodePreset {
  id: string;
  title: string;
  description: string;
  code: string;
}

const ALGORITHM_PRESETS: Record<SupportedLanguage, CodePreset[]> = {
  python: [
    {
      id: "bin_search",
      title: "Binary Search (O(log N))",
      description: "Classic iterative binary search on sorted array",
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Interactive Demo
numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
result = binary_search(numbers, target)
print(f"Array: {numbers}")
print(f"Target {target} found at index: {result}")
`,
    },
    {
      id: "two_pointers",
      title: "Two Pointers - Two Sum",
      description: "Find pair in sorted array that sums to target",
      code: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        curr_sum = arr[left] + arr[right]
        if curr_sum == target:
            return (left, right)
        elif curr_sum < target:
            left += 1
        else:
            right -= 1
    return None

arr = [1, 2, 4, 6, 8, 11, 15]
target = 10
indices = two_sum_sorted(arr, target)
print(f"Array: {arr}, Target: {target}")
print(f"Indices: {indices} (Values: {arr[indices[0]]} + {arr[indices[1]]} = {target})")
`,
    },
    {
      id: "bfs_graph",
      title: "Graph BFS Traversal",
      description: "Breadth-First Search using deque queue",
      code: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    traversal = []

    while queue:
        vertex = queue.popleft()
        traversal.append(vertex)
        for neighbor in graph.get(vertex, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return traversal

graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E']
}

print("BFS Traversal from node 'A':", bfs(graph, 'A'))
`,
    },
    {
      id: "dp_fib",
      title: "Dynamic Programming - Memoization",
      description: "O(N) Fibonacci with memo cache",
      code: `def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

for i in range(15):
    print(f"fib({i}) = {fib_memo(i)}")
`,
    },
  ],
  java: [
    {
      id: "java_bin_search",
      title: "Java Binary Search",
      description: "Iterative binary search implementation",
      code: `public class Main {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] numbers = {3, 7, 12, 19, 24, 38, 45, 62};
        int target = 24;
        int idx = binarySearch(numbers, target);
        System.out.println("Target " + target + " found at index: " + idx);
    }
}
`,
    },
  ],
  cpp: [
    {
      id: "cpp_vector",
      title: "C++ STL Vector & Sort",
      description: "Modern C++ vector sorting and lambda usage",
      code: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {42, 17, 89, 5, 23, 71};
    std::sort(nums.begin(), nums.end());

    std::cout << "Sorted elements: ";
    for (int n : nums) {
        std::cout << n << " ";
    }
    std::cout << "\\n";
    return 0;
}
`,
    },
  ],
  c: [
    {
      id: "c_pointers",
      title: "C Pointer Arithmetic",
      description: "Array iteration and pointer dereferencing",
      code: `#include <stdio.h>

void reverseArray(int *arr, int size) {
    int *start = arr;
    int *end = arr + size - 1;
    while (start < end) {
        int temp = *start;
        *start = *end;
        *end = temp;
        start++;
        end--;
    }
}

int main() {
    int data[] = {10, 20, 30, 40, 50};
    int n = sizeof(data) / sizeof(data[0]);

    printf("Reversing array...\\n");
    reverseArray(data, n);

    for (int i = 0; i < n; i++) {
        printf("%d ", data[i]);
    }
    printf("\\n");
    return 0;
}
`,
    },
  ],
  sql: [
    {
      id: "sql_table_ops",
      title: "SQL Table & Aggregation",
      description: "CREATE TABLE, INSERT, and GROUP BY query",
      code: `CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT,
    gpa REAL
);

INSERT INTO students VALUES 
    (1, 'Aarav Sharma', 'CSE', 8.9),
    (2, 'Diya Patel', 'BCA', 9.2),
    (3, 'Rohan Kumar', 'CSE', 7.8),
    (4, 'Ananya Sen', 'IT', 8.5),
    (5, 'Karthik Raja', 'BCA', 8.8);

SELECT department, COUNT(*) as student_count, ROUND(AVG(gpa), 2) as avg_gpa
FROM students
GROUP BY department
ORDER BY avg_gpa DESC;
`,
    },
  ],
};

const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `# EQLV CODE - Python 3.12 Isolated Sandbox
# Write any algorithmic code or experiment freely. Zero constraints.

def main():
    print("Welcome to EQLV Freeform Sandbox!")
    print("Zero-Latency Client WebAssembly Execution.")

if __name__ == "__main__":
    main()
`,
  java: `// EQLV CODE - Java 15 OpenJDK Sandbox
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to EQLV Java Sandbox!");
    }
}
`,
  cpp: `// EQLV CODE - C++ 17 Sandbox
#include <iostream>

int main() {
    std::cout << "Welcome to EQLV C++ Sandbox!\\n";
    return 0;
}
`,
  c: `// EQLV CODE - C 11 Sandbox
#include <stdio.h>

int main() {
    printf("Welcome to EQLV C Sandbox!\\n");
    return 0;
}
`,
  sql: `-- EQLV CODE - SQLite 3.36 Sandbox
CREATE TABLE demo (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO demo VALUES (1, 'EQLV Code');
SELECT * FROM demo;
`,
};

const LANG_CONFIG: Record<
  SupportedLanguage,
  { label: string; monacoLang: string; fileName: string; runtime: string }
> = {
  python: {
    label: "Python 3.12",
    monacoLang: "python",
    fileName: "solution.py",
    runtime: "Pyodide WASM",
  },
  java: {
    label: "Java 15",
    monacoLang: "java",
    fileName: "Main.java",
    runtime: "OpenJDK Server",
  },
  cpp: {
    label: "C++ 17",
    monacoLang: "cpp",
    fileName: "main.cpp",
    runtime: "GCC 10.2 Server",
  },
  c: {
    label: "C 11",
    monacoLang: "c",
    fileName: "main.c",
    runtime: "GCC 10.2 Server",
  },
  sql: {
    label: "SQLite 3",
    monacoLang: "sql",
    fileName: "query.sql",
    runtime: "SQLite 3.36 Server",
  },
};

// Dynamically load Monaco Editor without SSR
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#070B09] flex items-center justify-center text-[#85998D] font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#9DFF00] animate-pulse" />
        <span>Initializing Freeform Monaco Engine...</span>
      </div>
    </div>
  ),
});

export default function FreeformCompilerPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [sourceCode, setSourceCode] = useState<string>(STARTER_TEMPLATES.python);
  const [stdinInput, setStdinInput] = useState<string>("");
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [executionEngine, setExecutionEngine] = useState<string | null>(null);
  const [fontSize] = useState<number>(13);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isDotAiOpen, setIsDotAiOpen] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<RunHistoryItem[]>([]);
  const [isWordWrap, setIsWordWrap] = useState<boolean>(false);

  // Unified Split View & Bottom Panel State
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(36);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Left Pane Tabs: 'stdin' | 'presets' | 'notes'
  const [activeLeftTab, setActiveLeftTab] = useState<"stdin" | "presets" | "notes">("stdin");
  const [scratchpadNotes, setScratchpadNotes] = useState<string>("");

  const editorRef = useRef<any>(null);
  const handleRunCodeRef = useRef<() => void>(() => {});

  // Load persisted history and notes from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("eqlv_freeform_history");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedNotes = localStorage.getItem("eqlv_sandbox_notes");
      if (storedNotes) {
        setScratchpadNotes(storedNotes);
      }
    } catch {
      // Ignore storage read failures
    }
  }, []);

  // Click-outside listener for More Options overflow menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMoreMenuOpen]);

  // Handle Splitter Resizing
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(Math.max(rawPercent, 20), 50);
      setLeftWidthPercent(clamped);
    };
    const handleMouseUp = () => setIsDraggingSplitter(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplitter]);

  // Save execution to local history
  const saveToHistory = useCallback(
    (item: Omit<RunHistoryItem, "id" | "timestamp">) => {
      const newItem: RunHistoryItem = {
        ...item,
        id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 30);
        try {
          localStorage.setItem("eqlv_freeform_history", JSON.stringify(updated));
        } catch {
          // Ignore storage quota errors
        }
        return updated;
      });
    },
    []
  );

  const handleNotesChange = (val: string) => {
    setScratchpadNotes(val);
    try {
      localStorage.setItem("eqlv_sandbox_notes", val);
    } catch {
      // Ignore
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("eqlv_freeform_history");
    } catch {
      // Ignore
    }
  };

  // Load fresh starter templates whenever the student selects a language
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setSourceCode(STARTER_TEMPLATES[newLang] || "");
    setSelectedPresetId("");
    setStdout("");
    setStderr("");
    setExecutionTimeMs(null);
    setExecutionEngine(null);
  };

  // Load preset algorithm
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const presets = ALGORITHM_PRESETS[language] || [];
    const matched = presets.find((p) => p.id === presetId);
    if (matched) {
      setSourceCode(matched.code);
      setStdout(`[Algorithm Preset Loaded: ${matched.title}]\n${matched.description}\nClick "Run" or press ⌘↵ to execute.`);
      setStderr("");
      setIsBottomCollapsed(false);
    }
  };

  // Format Code via Monaco Action
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
      setIsFormatted(true);
      setTimeout(() => setIsFormatted(false), 2000);
    }
  };

  // Reset to initial clean boilerplate
  const handleResetCode = () => {
    setSourceCode(STARTER_TEMPLATES[language] || "");
    setSelectedPresetId("");
    setStdout("");
    setStderr("");
    setExecutionTimeMs(null);
  };

  // Copy code to clipboard with visual confirmation
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sourceCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  // Download code as a file
  const handleDownloadFile = () => {
    const config = LANG_CONFIG[language];
    const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = config.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Execute Code (Zero Rules Sandbox with 5.0-second watchdog)
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStdout("");
    setStderr("");
    setExecutionTimeMs(null);
    setIsBottomCollapsed(false);

    const startTime = performance.now();

    try {
      if (language === "python") {
        const res = await runPythonCode(sourceCode, stdinInput, 5000);
        setStdout(res.stdout);
        setStderr(res.stderr);
        setExecutionTimeMs(res.executionTimeMs);
        setExecutionEngine("Pyodide Client WASM ($0 cost)");

        saveToHistory({
          language: "python",
          executionTimeMs: res.executionTimeMs,
          engine: "Pyodide WASM",
          status: res.stderr ? "error" : "success",
          stdoutPreview: res.stdout.slice(0, 100),
          stderrPreview: res.stderr.slice(0, 100),
          code: sourceCode,
        });
      } else {
        const payload = {
          language,
          code: sourceCode,
          stdin: stdinInput || "",
        };

        const resp = await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await resp.json();
        const duration = Math.round(performance.now() - startTime);

        if (resp.ok && data.success) {
          const out = data.output || data.stdout || "";
          const err = data.stderr || "";
          setStdout(out);
          setStderr(err);
          setExecutionTimeMs(data.execution_time_ms || duration);
          setExecutionEngine(data.engine || "Compiler Engine");

          saveToHistory({
            language,
            executionTimeMs: data.execution_time_ms || duration,
            engine: data.engine || "Compiler Engine",
            status: err ? "error" : "success",
            stdoutPreview: out.slice(0, 100),
            stderrPreview: err.slice(0, 100),
            code: sourceCode,
          });
        } else {
          const errMsg = data.error || "Execution failed on remote compiler.";
          setStderr(errMsg);
          setExecutionTimeMs(duration);
          saveToHistory({
            language,
            executionTimeMs: duration,
            engine: "Compiler Engine",
            status: "error",
            stdoutPreview: "",
            stderrPreview: errMsg.slice(0, 100),
            code: sourceCode,
          });
        }
      }
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - startTime);
      const message = err instanceof Error ? err.message : String(err);
      setStderr(`Execution Error: ${message}`);
      setExecutionTimeMs(duration);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, sourceCode, stdinInput, saveToHistory]);

  handleRunCodeRef.current = handleRunCode;

  // Global window keyboard listener for Cmd+Enter / Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCodeRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Monaco Editor onMount handler: bind inside-editor ⌘↵
  const handleEditorDidMount = (
    editor: { addCommand: (keybinding: number, handler: () => void) => void },
    monaco: { KeyMod: { CtrlCmd: number }; KeyCode: { Enter: number } }
  ) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCodeRef.current();
    });
  };

  return (
    <div className="h-screen w-full bg-[#070B09] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* ================================================================= */}
      {/* 1. TOP GLOBAL NAVBAR (Identical Standard Layout to SplitPaneIDE)   */}
      {/* ================================================================= */}
      <header className="h-16 border-b border-[#1E2C24] bg-[#070B09] px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-xs">
        {/* Left: Brand Logo & Back to Dashboard */}
        <div className="flex items-center gap-4">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            title="EQLV CODE Platform"
          >
            <Image
              src="/logo.png"
              alt="EQLV CODE"
              width={30}
              height={30}
              priority
              className="w-7 h-7 object-contain rounded-lg flex-shrink-0"
            />
            <span className="inline-flex items-baseline gap-1.5 text-base">
              <span className="font-sans font-black tracking-tight text-white">
                EQLV
              </span>
              <span className="font-mono font-bold tracking-wider text-xs text-[#9DFF00]">
                CODE
              </span>
            </span>
          </Link>

          <div className="h-5 w-px bg-slate-800" />

          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Center: Clean Workspace Title & Rule-Free Tag */}
        <div className="hidden sm:flex items-center gap-2 bg-[#121B16] border border-[#20293D] rounded-xl px-3 py-1 shadow-2xs">
          <div className="w-2 h-2 rounded-full bg-[#9DFF00] shadow-[0_0_8px_#9DFF00]" />
          <span className="text-xs font-mono font-bold text-slate-200">
            Sandbox IDE
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Zero Rules
          </span>
        </div>

        {/* Right: User Avatar */}
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="w-8 h-8 rounded-full bg-[#9DFF00] hover:bg-[#8CE600] text-black font-extrabold text-xs flex items-center justify-center font-mono shadow-sm cursor-pointer transition-transform active:scale-95"
            title="Account & Dashboard"
          >
            K
          </Link>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. MAIN BODY (Split Two-Pane Workspace)                           */}
      {/* ================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={splitContainerRef}
          className={`flex-1 flex overflow-hidden ${
            isDraggingSplitter ? "select-none cursor-col-resize" : ""
          }`}
        >
          {/* =============================================================== */}
          {/* 2A. LEFT WORKSPACE PANE: Stdin, Presets & Scratchpad             */}
          {/* =============================================================== */}
          <div
            style={{ width: isMaximized ? "0%" : `${leftWidthPercent}%` }}
            className={`${
              isMaximized ? "hidden" : "flex"
            } flex-col border-r border-[#1E2C24] bg-[#070B09] overflow-hidden shrink-0`}
          >
            {/* Left Header Section */}
            <div className="p-4 pb-0 border-b border-[#1E2C24]/80 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#9DFF00]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Workspace Panel
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {LANG_CONFIG[language].runtime}
                </span>
              </div>

              {/* Tabs: Custom Stdin, Presets, Scratchpad */}
              <div className="flex items-center gap-4 text-xs font-mono border-b border-[#1E2C24]">
                <button
                  type="button"
                  onClick={() => setActiveLeftTab("stdin")}
                  className={`pb-2.5 font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeLeftTab === "stdin"
                      ? "border-[#9DFF00] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Custom Input</span>
                  {stdinInput.trim() && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLeftTab("presets")}
                  className={`pb-2.5 font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeLeftTab === "presets"
                      ? "border-[#9DFF00] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Presets</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLeftTab("notes")}
                  className={`pb-2.5 font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeLeftTab === "notes"
                      ? "border-[#9DFF00] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Scratchpad</span>
                </button>
              </div>
            </div>

            {/* Left Body Content */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs select-text">
              {/* Tab 1: Custom STDIN */}
              {activeLeftTab === "stdin" && (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Standard Input (stdin):</span>
                    {stdinInput && (
                      <button
                        type="button"
                        onClick={() => setStdinInput("")}
                        className="text-rose-400 hover:text-rose-300 text-[10px] cursor-pointer"
                      >
                        Clear Input
                      </button>
                    )}
                  </div>
                  <textarea
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Enter custom inputs here. Each newline represents a separate input line..."
                    className="flex-1 w-full p-3 rounded-xl bg-[#070A10] border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#9DFF00] resize-none"
                  />
                  <div className="text-[10px] text-[#85998D]">
                    Passed line-by-line to sys.stdin, Scanner, or cin during execution.
                  </div>
                </div>
              )}

              {/* Tab 2: Algorithm Presets */}
              {activeLeftTab === "presets" && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 mb-2">
                    Click any preset algorithm to load it into the editor:
                  </div>
                  {(ALGORITHM_PRESETS[language] || []).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPresetId === preset.id
                          ? "bg-[#121B16] border-[#9DFF00] text-white"
                          : "bg-[#0C120F] border-[#1E2C24] text-slate-300 hover:border-slate-600 hover:bg-[#121B16]"
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{preset.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{preset.description}</div>
                    </button>
                  ))}
                  {(!ALGORITHM_PRESETS[language] || ALGORITHM_PRESETS[language].length === 0) && (
                    <div className="p-4 text-center text-[#85998D] text-xs">
                      No built-in presets for {LANG_CONFIG[language].label}. You can code freely directly in the editor!
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Scratchpad */}
              {activeLeftTab === "notes" && (
                <div className="h-full flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Personal Scratchpad:</span>
                    <span className="text-[10px] text-emerald-400">Auto-saved</span>
                  </div>
                  <textarea
                    value={scratchpadNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Jot down notes, logic drafts, complexity analysis, or test cases here..."
                    className="flex-1 w-full p-3 rounded-xl bg-[#070A10] border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#9DFF00] resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Adjustable Splitter Divider */}
          <div
            onMouseDown={handleSplitterMouseDown}
            className="w-1.5 bg-[#070B09] hover:bg-[#9DFF00] active:bg-[#9DFF00] cursor-col-resize transition-colors flex-shrink-0 z-10 flex items-center justify-center group"
            title="Drag to resize workspace split"
          >
            <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-black rounded-full" />
          </div>

          {/* =============================================================== */}
          {/* 2B. RIGHT WORKSPACE PANE: Monaco Editor & Output Console        */}
          {/* =============================================================== */}
          <div className="flex-1 flex flex-col bg-[#070B09] overflow-hidden min-w-0">
            {/* Editor Action Toolbar (Low amount of buttons - Essential Only!) */}
            <div className="h-10 border-b border-[#1E2C24] bg-[#0C120F] px-4 flex items-center justify-between flex-shrink-0">
              {/* Left: Language Dropdown & File Indicator */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ObsidianSelect value={String(language)} onChange={(val) => handleLanguageChange(val as SupportedLanguage)} options={[{ value: "python", label: "Python 3.12 (WASM)" }, { value: "java", label: "Java 15 (OpenJDK)" }, { value: "cpp", label: "C++ 17 (GCC 10.2)" }, { value: "c", label: "C 11 (GCC 10.2)" }, { value: "sql", label: "SQLite 3.36" }]} buttonClassName="appearance-none bg-[#121B16] border border-[#20293D] hover:border-slate-600 rounded-lg px-2.5 py-1 pr-7 text-xs font-mono font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#9DFF00] transition-colors cursor-pointer" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                  <span className="font-semibold">{LANG_CONFIG[language].fileName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-[#85998D] hidden sm:inline">Auto-saved</span>
                </div>
              </div>

              {/* Right: Essential Buttons (EQ AI + Overflow Menu + Run) */}
              <div className="flex items-center gap-2">
                {/* EQ AI Assistant */}
                <button
                  type="button"
                  onClick={() => setIsDotAiOpen(!isDotAiOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 ${
                    isDotAiOpen
                      ? "bg-[#9DFF00] text-black border-[#9DFF00] shadow-[0_0_12px_rgba(157,255,0,0.35)]"
                      : "bg-[#161D2E] hover:bg-[#1f283e] border-[#9DFF00]/40 text-[#9DFF00] hover:border-[#9DFF00]"
                  }`}
                  title="Ask EQ AI Socratic Mentor for guidance"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>EQ AI</span>
                </button>

                {/* Clean '⋯' Overflow Menu (Format, Reset, Copy, Download, History, Fullscreen) */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen((v) => !v)}
                    className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                      isMoreMenuOpen
                        ? "bg-white/15 text-white border-slate-500"
                        : "bg-[#121B16] border-[#20293D] text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="More options (Format, Reset, Copy, Download, History, Fullscreen)"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isMoreMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#0C120F] border border-[#1E2C24] shadow-2xl p-1.5 z-50 text-xs font-sans space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleFormatCode();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isFormatted ? "Formatted!" : "Format Code"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleResetCode();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Boilerplate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleCopyCode();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleDownloadFile();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Download Script</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsHistoryOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Run History ({history.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMaximized((m) => !m);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                      >
                        {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-slate-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{isMaximized ? "Restore Split View" : "Maximize Editor"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-5 bg-[#1E2C24]" />

                {/* Primary Run Code Button */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950/70 to-[#152033] hover:from-emerald-900/80 hover:to-[#1c2c47] text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold shadow-[0_0_14px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Shortcut: Ctrl+Enter / ⌘Enter"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#9DFF00]" />
                  <span>{isRunning ? "Running..." : "Run"}</span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-mono font-semibold">⌘↵</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Component */}
            <div className="flex-1 relative overflow-hidden bg-[#070B09]">
              <MonacoEditor
                height="100%"
                language={LANG_CONFIG[language].monacoLang}
                theme="vs-dark"
                value={sourceCode}
                onMount={handleEditorDidMount}
                onChange={(val) => setSourceCode(val || "")}
                options={{
                  fontSize: fontSize,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  lineNumbers: "on",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                  wordWrap: isWordWrap ? "on" : "off",
                }}
              />
            </div>

            {/* Bottom Collapsible Output Console */}
            <div
              className={`border-t border-[#1E2C24] bg-[#0C120F] flex flex-col transition-all duration-200 ${
                isBottomCollapsed ? "h-10" : "h-64"
              } flex-shrink-0`}
            >
              {/* Bottom Console Header */}
              <div className="h-10 border-b border-[#1E2C24] px-4 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Terminal className="w-3.5 h-3.5 text-[#9DFF00]" />
                    <span>Output Terminal</span>
                    {stdout && <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00]" />}
                  </div>

                  {executionTimeMs !== null && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-[#85998D]" />
                      <span>{executionTimeMs} ms</span>
                      {executionEngine && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {executionEngine}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Clear Output */}
                  {(stdout || stderr) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStdout("");
                        setStderr("");
                        setExecutionTimeMs(null);
                      }}
                      className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                      title="Clear terminal output"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}

                  {/* Word Wrap */}
                  <button
                    type="button"
                    onClick={() => setIsWordWrap(!isWordWrap)}
                    className={`p-1 rounded hover:bg-white/10 transition-colors text-xs cursor-pointer ${
                      isWordWrap ? "text-emerald-400" : "text-slate-400"
                    }`}
                    title={isWordWrap ? "Word Wrap: ON" : "Word Wrap: OFF"}
                  >
                    <WrapText className="w-3.5 h-3.5" />
                  </button>

                  {/* Collapse / Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={isBottomCollapsed ? "Expand Terminal" : "Collapse Terminal"}
                  >
                    {isBottomCollapsed ? "Expand ∧" : "Collapse ∨"}
                  </button>
                </div>
              </div>

              {/* Console Body Content */}
              {!isBottomCollapsed && (
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed select-text min-h-0">
                  {/* Stdout Output Stream */}
                  {stdout && (
                    <div>
                      <div className="text-[10px] text-[#85998D] font-bold uppercase tracking-wider mb-1">
                        STDOUT:
                      </div>
                      <pre className="text-slate-200 whitespace-pre-wrap font-mono bg-[#070A10] p-3 rounded-xl border border-slate-800/80 overflow-x-auto selection:bg-emerald-500/30">
                        {stdout}
                      </pre>
                    </div>
                  )}

                  {/* Stderr Error Stream */}
                  {stderr && (
                    <div className="mt-2">
                      <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>STDERR:</span>
                      </div>
                      <pre className="text-rose-300 whitespace-pre-wrap font-mono bg-rose-950/30 p-3 rounded-xl border border-rose-900/50 overflow-x-auto selection:bg-rose-500/30">
                        {stderr}
                      </pre>
                    </div>
                  )}

                  {/* Empty State */}
                  {!stdout && !stderr && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#85998D] space-y-1.5 py-6">
                      <Terminal className="w-6 h-6 text-[#85998D]" />
                      <p className="text-xs">No output generated yet.</p>
                      <p className="text-[11px] text-[#85998D]">
                        Click <span className="text-[#9DFF00] font-bold">&lsquo;Run&rsquo;</span> or press{" "}
                        <span className="px-1 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">
                          ⌘+Enter
                        </span>{" "}
                        to execute without rules.
                      </p>
                    </div>
                  )}

                  {/* Loading Spinner */}
                  {isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2 py-6">
                      <span className="w-5 h-5 rounded-full border-2 border-[#9DFF00] border-t-transparent animate-spin" />
                      <p className="text-xs font-mono">Executing in isolated sandbox...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. EXECUTION HISTORY SLIDE-OVER DRAWER                            */}
      {/* ================================================================= */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F1523] border-l border-[#1E2C24] flex flex-col h-full shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1E2C24] flex items-center justify-between bg-[#12192A]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm text-white">Execution History</span>
                <span className="text-xs text-slate-400 font-mono">({history.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-950/30 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {history.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-[#85998D] space-y-2">
                  <History className="w-8 h-8 text-slate-700" />
                  <p>No executions recorded yet.</p>
                  <p className="text-[11px] text-[#85998D]">
                    Run code in the editor to see historical outputs and benchmarks here.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#121B16] border border-[#1E2C24] hover:border-slate-600 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === "success" ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        <span className="font-bold text-white uppercase">{item.language}</span>
                        <span className="text-[#85998D]">{item.engine}</span>
                      </div>
                      <span className="text-slate-400">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Runtime: {item.executionTimeMs} ms</span>
                    </div>

                    {item.stdoutPreview && (
                      <div className="bg-[#090D16] p-2 rounded text-[11px] text-slate-300 font-mono max-h-16 overflow-hidden text-ellipsis whitespace-pre-wrap">
                        {item.stdoutPreview}
                      </div>
                    )}

                    {item.stderrPreview && (
                      <div className="bg-rose-950/20 p-2 rounded text-[11px] text-rose-300 font-mono max-h-16 overflow-hidden text-ellipsis whitespace-pre-wrap">
                        {item.stderrPreview}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSourceCode(item.code);
                          setLanguage(item.language);
                          setIsHistoryOpen(false);
                        }}
                        className="text-[11px] text-[#9DFF00] hover:underline cursor-pointer"
                      >
                        Restore Code to Editor &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EQ AI Socratic Assistant Drawer */}
      <EqAiDrawer
        isOpen={isDotAiOpen}
        onClose={() => setIsDotAiOpen(false)}
        activeCode={sourceCode}
        language={language}
        problemTitle={selectedPresetId ? `Preset: ${selectedPresetId}` : "Freeform Sandbox"}
        problemDescription=""
        isExamMode={false}
      />
    </div>
  );
}
