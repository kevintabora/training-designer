"use client";

interface SelectionTallyProps {
  count: number;
  totalMinutes: number;
}

export default function SelectionTally({ count, totalMinutes }: SelectionTallyProps) {
  if (count === 0) return null;

  const hours = (totalMinutes / 60).toFixed(1);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 px-6 py-3 border-t"
      style={{
        backgroundColor: "var(--surface-0)",
        borderColor: "var(--border-default)",
        color: "var(--ink-primary)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
      }}
    >
      <span>{count} SELECTED</span>
      <span style={{ color: "var(--ink-tertiary)", fontWeight: 400 }}>·</span>
      <span>{totalMinutes} min</span>
      <span style={{ color: "var(--ink-tertiary)", fontWeight: 400 }}>·</span>
      <span>{hours} hrs</span>
    </div>
  );
}
