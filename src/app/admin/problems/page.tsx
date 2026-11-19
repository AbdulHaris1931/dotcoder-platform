"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataService } from "@/lib/supabase/db";
import { Problem, ProblemDifficulty } from "@/types";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  MoreVertical,
  CheckCircle2,
  X,
  Code2,
} from "lucide-react";

interface ProblemRow {
  id: number;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Published" | "Draft";
}

const INITIAL_PROBLEMS: ProblemRow[] = [
  { id: 1, title: "Two Sum", topic: "Arrays", difficulty: "Easy", status: "Published" },
  { id: 2, title: "Longest Subarray", topic: "Arrays", difficulty: "Medium", status: "Published" },
  { id: 3, title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", status: "Published" },
  { id: 4, title: "Merge Two Lists", topic: "Linked List", difficulty: "Medium", status: "Draft" },
  { id: 5, title: "LRU Cache", topic: "Design", difficulty: "Hard", status: "Published" },
];

export default function AdminProblemManagementPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemRow[]>(INITIAL_PROBLEMS);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New problem form
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Arrays");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");

  const filteredProblems = problems.filter((p) => {
    if (activeTab === "published" && p.status !== "Published") return false;
    if (activeTab === "drafts" && p.status !== "Draft") return false;
    if (difficultyFilter !== "All" && p.difficulty !== difficultyFilter) return false;
    if (topicFilter !== "All" && p.topic !== topicFilter) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const added: ProblemRow = {
      id: problems.length + 1,
      title: newTitle,
      topic: newTopic,
      difficulty: newDifficulty,
      status: "Published",
    };
    setProblems([added, ...problems]);
    setShowAddModal(false);
    setNewTitle("");
  };

  return (
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans">
      {/* Top Header matching Screen 08 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Problem Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit and organize coding problems.
          </p>
        </div>

        {/* Lime Green Add Problem Button matching Screen 08 */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black font-bold text-xs transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Filter Tabs matching Screen 08 */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Problems (512)" },
          { id: "published", label: "Published (486)" },
          { id: "drafts", label: "Drafts (26)" },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                isSelected
                  ? "bg-[#C4F82A] text-black"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Dropdown Filters Row matching Screen 08 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#C4F82A] shadow-2xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 shadow-2xs">
            <span className="text-slate-400">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 shadow-2xs">
            <span className="text-slate-400">Topic:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Arrays">Arrays</option>
              <option value="Stack">Stack</option>
              <option value="Linked List">Linked List</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems Table matching Screen 08 */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Title</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-center">
                    {problem.id}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {problem.title}
                  </td>
                  <td className="p-4 font-medium text-slate-600 font-mono">
                    {problem.topic}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        problem.difficulty === "Easy"
                          ? "bg-[#C4F82A]/20 text-[#2D5A12] border border-[#C4F82A]/40"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-500/15 text-amber-800 border border-amber-300"
                          : "bg-rose-500/15 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-sans font-semibold text-[11px] ${
                        problem.status === "Published"
                          ? "bg-[#C4F82A]/20 text-[#2D5A12] border border-[#C4F82A]/40"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {problem.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => router.push(`/practice/two-sum`)}
                        title="Preview Problem"
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit Problem"
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Options"
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Problem</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProblem} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subarray Sum Equals K"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C4F82A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C4F82A]"
                >
                  <option value="Arrays">Arrays</option>
                  <option value="Stack">Stack</option>
                  <option value="Linked List">Linked List</option>
                  <option value="Design">Design</option>
                  <option value="Trees">Trees</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#C4F82A]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C4F82A] hover:bg-[#B5EA20] text-black font-bold shadow-xs"
                >
                  Create Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
