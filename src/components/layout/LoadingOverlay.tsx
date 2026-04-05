"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function LoadingOverlay() {
  const isLoading = useAppStore((s) => s.isLoading);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [setLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center"
      style={{ backgroundColor: "var(--surface-1)" }}
    >
      <div
        className="flex flex-col items-center gap-3"
        style={{ color: "var(--ink-primary)", fontSize: "var(--text-md)", fontWeight: 600 }}
      >
        <span>Loading</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: "var(--accent)",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
