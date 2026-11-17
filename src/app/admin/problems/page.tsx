"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DataService } from "@/lib/supabase/db";
import { Problem, ProblemDifficulty, SupportedLanguage } from "@/types";
import {
  Code2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Terminal,
  Sparkles,
  Eye,
  EyeOff,
  Send,
  X,
} from "lucide-react";

export default function QuestionBankManagerPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Problem Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>("Easy");
  const [companyTagsInput, setCompanyTagsInput] = useState("TCS NQT, Zoho");
  const [descriptionMd, setDescriptionMd] = useState("");

  // Starter Code Tabs
  const [selectedLangTab, setSelectedLangTab] = useState<SupportedLanguage>("python");
  const [starterCodes, setStarterCodes] = useState<Record<SupportedLanguage, string>>({
    python: 'import sys\n\ndef solve():\n    # Read input from standard input\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
    java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Code here\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}\n',
  });

  // Test Cases
  const [testCases, setTestCases] = useState<
    Array<{ input: string; expected_output: string; is_hidden: boolean }>
  >([
    { input: "1 2 3", expected_output: "6", is_hidden: false },
    { input: "10 20", expected_output: "30", is_hidden: true },
  ]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await DataService.getProblems();
      setProblems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: "", expected_output: "", is_hidden: false }]);
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases(testCases.filter((_, i) => i !== idx));
  };

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const tags = companyTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await DataService.createProblem(
      {
        title,
        slug,
        difficulty,
        company_tags: tags,
        type: "coding",
        description_md: descriptionMd,
        starter_code_json: starterCodes,
        is_public: true,
      },
      testCases
    );

    setSaving(false);

    if (res.success) {
      setFeedback("Success! New coding challenge added to the Question Bank.");
      setShowAddModal(false);
      // reload
      const updated = await DataService.getProblems();
      setProblems(updated);
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback(`Error: ${res.error}`);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Question Bank Manager
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Curriculum Store
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Campus Coding Repository & Test Case Builder
            </h1>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Problem</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Existing Problem List */}
      <div className="card-luxury rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              Active Question Bank ({problems.length})
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Live coding problems available across all college practice labs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-mono uppercase text-slate-500 bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Company Tags</th>
                <th className="py-3 px-3">Test Cases</th>
                <th className="py-3 px-3 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {problems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{p.title}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{p.slug}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                        p.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.difficulty === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {p.company_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">
                    {(p.test_cases || []).length} Cases
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => router.push(`/student/lab/${p.slug}`)}
                      className="text-indigo-600 hover:text-indigo-700 font-mono text-[11px] font-bold"
                    >
                      Open IDE &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Problem Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-y-auto p-7 space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Coding Problem</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Publish directly to the open Supabase problem repository.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProblem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Problem Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reverse Linked List"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Slug (URL Identifier)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. reverse-linked-list"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Company Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TCS NQT, Zoho, Infosys"
                      value={companyTagsInput}
                      onChange={(e) => setCompanyTagsInput(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                    Markdown Description & Specifications
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the problem, input format, constraints..."
                    value={descriptionMd}
                    onChange={(e) => setDescriptionMd(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono shadow-sm leading-relaxed"
                  />
                </div>

                {/* Starter Code Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Starter Code Templates
                    </label>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      {(["python", "java", "cpp", "c"] as SupportedLanguage[]).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSelectedLangTab(lang)}
                          className={`px-2.5 py-0.5 rounded-lg capitalize transition-all ${
                            selectedLangTab === lang
                              ? "bg-indigo-600 text-white font-bold shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={starterCodes[selectedLangTab]}
                    onChange={(e) =>
                      setStarterCodes({
                        ...starterCodes,
                        [selectedLangTab]: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-inner"
                  />
                </div>

                {/* Test Cases Builder */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-600">
                      Assertion Test Cases ({testCases.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Case
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl items-center text-xs font-mono shadow-sm"
                      >
                        <div className="col-span-5">
                          <input
                            type="text"
                            placeholder="Stdin input"
                            value={tc.input}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].input = e.target.value;
                              setTestCases(updated);
                            }}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-[11px] focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Expected stdout"
                            value={tc.expected_output}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].expected_output = e.target.value;
                              setTestCases(updated);
                            }}
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold text-[11px] focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="col-span-2 flex items-center gap-1.5">
                          <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.is_hidden}
                              onChange={(e) => {
                                const updated = [...testCases];
                                updated[idx].is_hidden = e.target.checked;
                                setTestCases(updated);
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Hidden</span>
                          </label>
                        </div>

                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{saving ? "Inserting into Database..." : "Commit Problem to Database"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
