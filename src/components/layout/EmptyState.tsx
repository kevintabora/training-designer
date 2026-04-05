"use client";

export default function EmptyState() {
  return (
    <div
      className="flex items-center justify-center px-8 py-24 text-center"
      style={{ color: "var(--ink-secondary)", fontSize: "var(--text-md)" }}
    >
      <p className="max-w-lg leading-relaxed">
        Select <strong>+ Add Course</strong> to build from scratch, or{" "}
        <strong>File &gt; Load</strong> to import an existing Excel file with
        the required column headers. For a full walkthrough of the app, go to{" "}
        <strong>File &gt; Guide</strong>.
      </p>
    </div>
  );
}
