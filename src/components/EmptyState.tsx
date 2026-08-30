import React from "react";
import { Plus } from "lucide-react";

interface Props {
  icon?: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  testID?: string;
}

export function EmptyState({
  title,
  subtitle,
  ctaLabel,
  onPressCta,
  testID,
}: Props) {
  return (
    <div
      data-testid={testID}
      className="flex flex-col items-center justify-center text-center p-8 py-16 max-w-md mx-auto"
    >
      <div className="w-20 h-20 rounded-3xl bg-[#EEF2FF] dark:bg-[#312E81]/50 flex items-center justify-center text-4xl mb-6 shadow-inner border border-[#6366F1]/20 animate-pop">
        ✨
      </div>
      <h3 className="font-display font-black text-2xl text-[#0F172A] dark:text-[#F8FAFC] mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6">
        {subtitle}
      </p>
      {ctaLabel && onPressCta && (
        <button
          onClick={onPressCta}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display font-black text-sm shadow-md hover:shadow-lg shadow-[#6366F1]/25 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
