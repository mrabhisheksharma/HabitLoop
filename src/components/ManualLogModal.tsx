import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { TrackingType } from "../types";
import { unitLabel } from "../utils/format";

interface Props {
  isOpen: boolean;
  title: string;
  initial: number;
  type: TrackingType;
  unit?: string;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export function ManualLogModal({
  isOpen,
  title,
  initial,
  type,
  unit,
  onClose,
  onSubmit,
}: Props) {
  const [text, setText] = useState(String(initial || ""));
  const u = unitLabel(type, unit);

  useEffect(() => {
    if (isOpen) setText(initial ? String(initial) : "");
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(text);
    onSubmit(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-pop">
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-xl text-[#0F172A] dark:text-[#F8FAFC]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#334155]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-4">
          Enter exact progress in <span className="font-bold text-[#6366F1] dark:text-[#818CF8]">{u}</span>
        </p>

        <form onSubmit={handleSave}>
          <div className="relative mb-6">
            <input
              type="number"
              step="any"
              min="0"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="0"
              className="w-full h-16 text-center text-3xl font-black font-display rounded-2xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-transparent focus:border-[#6366F1] focus:outline-none transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              {u}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#F1F5F9] dark:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm hover:bg-[#E2E8F0] dark:hover:bg-[#475569] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
