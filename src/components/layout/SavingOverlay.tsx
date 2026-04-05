"use client";

interface SavingOverlayProps {
  isVisible: boolean;
}

export default function SavingOverlay({ isVisible }: SavingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
    >
      <div
        className="flex flex-col items-center gap-3 px-10 py-8 rounded-xl shadow-xl"
        style={{
          backgroundColor: "var(--surface-0)",
          color: "var(--ink-primary)",
          fontSize: "var(--text-md)",
          fontWeight: 600,
        }}
      >
        <span>Saving</span>
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
