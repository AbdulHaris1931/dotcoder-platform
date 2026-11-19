import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    // Tokens for inline code `...` and bold **...**
    const parts: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-[#161D2E] text-[#9DFF00] font-mono text-[11px] border border-white/10"
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="text-white font-semibold">
            {token.slice(2, -2)}
          </strong>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : [text];
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 ml-4 list-disc text-slate-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4
          key={`h3-${idx}`}
          className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mt-5 mb-2 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#9DFF00]" />
          <span>{line.replace("### ", "")}</span>
        </h4>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3
          key={`h2-${idx}`}
          className="text-sm font-sans font-bold text-white mt-6 mb-2 border-b border-white/10 pb-1"
        >
          {line.replace("## ", "")}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      currentList.push(
        <li key={`li-${idx}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {parseInline(line.replace("- ", ""))}
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
          {parseInline(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className={`space-y-1 font-sans ${className}`}>{elements}</div>;
}
