"use client";
import { ObsidianSelect } from "@/components/ui/obsidian-select";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  MoreVertical,
  X,
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
    <div className="flex-1 p-8 sm:p-10 max-w-7xl mx-auto space-y-7 font-sans text-[#F4F7F5]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F7F5]">
            Problem Management
          </h1>
          <p className="text-xs sm:text-sm text-[#99A9A0] mt-1">
            Create, edit and organize coding problems.
          </p>
        </div>

        {/* Top Actions: Problems/Assessments Switcher & Add Problem Button */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center bg-[#121B16] p-1 rounded-xl border border-[#1E2C24]">
            <button
              onClick={() => router.push("/admin/problems")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#9DFF00] text-[#070B09] cursor-pointer"
            >
              Problems
            </button>
            <button
              onClick={() => router.push("/admin/assessments")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors cursor-pointer"
            >
              Assessments
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold text-xs transition-all shadow-md shadow-[#9DFF00]/20 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#070B09] stroke-[3]" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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
              onClick={() => setActiveTab(tab.id as "all" | "published" | "drafts")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#9DFF00] text-[#070B09]"
                  : "bg-[#0C120F] border border-[#1E2C24] text-[#D5E0D9] hover:border-[#2C4034] hover:bg-[#18241D]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Dropdown Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#85998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            aria-label="Search problems"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-2 rounded-xl text-[#D5E0D9]">
            <span className="text-[#85998D]">Difficulty:</span>
            <ObsidianSelect value={String(difficultyFilter)} onChange={(val) => setDifficultyFilter(val)} options={[{ value: "All", label: "All" }, { value: "Easy", label: "Easy" }, { value: "Medium", label: "Medium" }, { value: "Hard", label: "Hard" }]} buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] focus:outline-none cursor-pointer" />
          </div>

          <div className="flex items-center gap-1.5 bg-[#070B09] border border-[#1E2C24] px-3 py-2 rounded-xl text-[#D5E0D9]">
            <span className="text-[#85998D]">Topic:</span>
            <ObsidianSelect value={String(topicFilter)} onChange={(val) => setTopicFilter(val)} options={[{ value: "All", label: "All" }, { value: "Arrays", label: "Arrays" }, { value: "Stack", label: "Stack" }, { value: "Linked List", label: "Linked List" }, { value: "Design", label: "Design" }]} buttonClassName="bg-[#070B09] font-semibold text-[#F4F7F5] focus:outline-none cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-2xl bg-[#0C120F] border border-[#1E2C24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121B16] border-b border-[#1E2C24] text-[#99A9A0] font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Title</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2C24] text-[#D5E0D9]">
              {filteredProblems.map((problem) => (
                <tr key={problem.id} className="hover:bg-[#18241D] transition-colors">
                  <td className="p-4 font-mono tabular-nums text-[#85998D] text-center">
                    {problem.id}
                  </td>
                  <td className="p-4 font-semibold text-[#F4F7F5]">
                    {problem.title}
                  </td>
                  <td className="p-4 font-medium text-[#99A9A0] font-mono">
                    {problem.topic}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                          : problem.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-sans font-semibold text-[11px] ${
                        problem.status === "Published"
                          ? "bg-[#9DFF00]/15 text-[#9DFF00] border border-[#9DFF00]/30"
                          : "bg-[#121B16] text-[#99A9A0] border border-[#1E2C24]"
                      }`}
                    >
                      {problem.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 text-[#85998D]">
                      <button
                        type="button"
                        onClick={() => router.push(`/practice/two-sum`)}
                        title="Preview Problem"
                        className="p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit Problem"
                        className="p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Options"
                        className="p-1 text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#121B16] rounded-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0C120F] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#1E2C24] space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2C24] pb-3">
              <h3 className="font-display text-base font-bold tracking-tight text-[#F4F7F5]">Create New Problem</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#85998D] hover:text-[#F4F7F5] hover:bg-[#18241D] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProblem} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Problem Title</label>
                <input
                  type="text"
                  name="title"
                  aria-label="Problem Title"
                  required
                  placeholder="e.g. Subarray Sum Equals K"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] text-xs focus:border-[#9DFF00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Topic</label>
                <ObsidianSelect value={String(newTopic)} onChange={(val) => setNewTopic(val)} options={[{ value: "Arrays", label: "Arrays" }, { value: "Stack", label: "Stack" }, { value: "Linked List", label: "Linked List" }, { value: "Design", label: "Design" }, { value: "Trees", label: "Trees" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:border-[#9DFF00] focus:outline-none" />
              </div>

              <div>
                <label className="block font-semibold text-[#D5E0D9] mb-1">Difficulty</label>
                <ObsidianSelect value={String(newDifficulty)} onChange={(val) => setNewDifficulty(val as "Easy" | "Medium" | "Hard")} options={[{ value: "Easy", label: "Easy" }, { value: "Medium", label: "Medium" }, { value: "Hard", label: "Hard" }]} buttonClassName="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] text-xs focus:border-[#9DFF00] focus:outline-none" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#121B16] border border-[#1E2C24] text-[#D5E0D9] hover:bg-[#18241D] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold shadow-md shadow-[#9DFF00]/20 cursor-pointer"
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
