"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/lib/store/auth-store";
import { useThemeStore } from "@/lib/store/theme-store";

export function Providers({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initTheme = useThemeStore((s) => s.init);

  useEffect(() => {
    initialize();
    initTheme();
  }, [initialize, initTheme]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}
