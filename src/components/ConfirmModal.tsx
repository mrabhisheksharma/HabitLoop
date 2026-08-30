import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-pop">
      <div className="bg-white dark:bg-[#1C1F21] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8EAEF] dark:border-[#282C2F]">
        <div className="w-12 h-12 rounded-2xl bg-[#FFEBEB] dark:bg-[#4D1111]/40 flex items-center justify-center text-[#FF6B6B] mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-display font-extrabold text-xl text-[#1A1D1E] dark:text-[#F5F6F7] mb-2">
          {title}
        </h3>
        <p className="text-sm font-medium text-[#686D73] dark:text-[#9BA1A6] leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[#F0F0F5] dark:bg-[#282C2F] text-[#1A1D1E] dark:text-[#F5F6F7] font-bold text-sm hover:bg-black/10 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#E55555] text-white font-bold text-sm shadow-md transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
