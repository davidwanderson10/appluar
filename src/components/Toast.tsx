"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((atual) => [...atual, { id, message, type }]);
    setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  function dismiss(id: number) {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.type === "error" ? "border-red-500/30 bg-red-500/10 text-red-500" : "border-accent/30 bg-panel text-text"
            }`}
          >
            <span className="shrink-0">{t.type === "error" ? "⚠️" : "✓"}</span>
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 text-muted hover:text-text" aria-label="Fechar">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
