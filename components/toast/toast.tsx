"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastContext = { showToast: (message: string) => void };

const Ctx = createContext<ToastContext>({ showToast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2000);
  }, []);

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-fg px-4 py-2 text-[13px] font-medium text-bg shadow-[var(--shadow-lg)]"
        >
          {message}
        </div>
      )}
    </Ctx.Provider>
  );
}
