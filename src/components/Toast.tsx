import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "warning" | "info" | "error";

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-pop max-w-[90vw] md:max-w-md w-full px-4">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
              toast.type === "success"
                ? "bg-[#E5FAF2]/95 dark:bg-[#113826]/95 border-[#00D084]/40 text-[#053321] dark:text-[#00E691]"
                : toast.type === "warning"
                ? "bg-[#FFF9E6]/95 dark:bg-[#332200]/95 border-[#FFB320]/40 text-[#4D3400] dark:text-[#FFC44D]"
                : toast.type === "error"
                ? "bg-[#FFEBEB]/95 dark:bg-[#4D1111]/95 border-[#FF6B6B]/40 text-[#4D1111] dark:text-[#FF8585]"
                : "bg-[#EBF8FF]/95 dark:bg-[#002838]/95 border-[#00C2FF]/40 text-[#003647] dark:text-[#33CCFF]"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 text-[#00D084]" />}
            {toast.type === "warning" && <AlertCircle className="w-5 h-5 shrink-0 text-[#FFB320]" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 shrink-0 text-[#FF6B6B]" />}
            {toast.type === "info" && <Info className="w-5 h-5 shrink-0 text-[#00C2FF]" />}
            <span className="text-sm font-bold flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
