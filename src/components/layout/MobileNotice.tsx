"use client";

export default function MobileNotice() {
  return (
    <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center px-8"
      style={{ backgroundColor: "var(--surface-1)" }}>
      <div className="text-5xl mb-6">💻</div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--ink-primary)" }}>
        Desktop Recommended
      </h2>
      <p className="max-w-sm leading-relaxed" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-md)" }}>
        Training Designer is built for desktop browsers. For the best experience
        with tables, drag-and-drop, and report charts, please open this on a
        laptop or desktop.
      </p>
    </div>
  );
}
