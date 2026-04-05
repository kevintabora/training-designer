"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import NameEditModal from "@/components/modals/NameEditModal";

export default function NameHeader() {
  const currentProductName = useAppStore((s) => s.currentProductName);
  const currentProgramName = useAppStore((s) => s.currentProgramName);
  const [nameEditOpen, setNameEditOpen] = useState(false);

  const hasNames = currentProductName || currentProgramName;

  return (
    <>
      <div
        style={{
          padding: "20px 24px 4px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
          onClick={() => setNameEditOpen(true)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "var(--font-jakarta), sans-serif",
          }}
          title="Click to edit program details"
        >
          <span
            style={{
              display: "block",
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: currentProductName ? "var(--ink-primary)" : "var(--ink-tertiary)",
              lineHeight: 1.3,
              borderBottom: currentProductName ? "none" : "1px dashed var(--border-default)",
            }}
          >
            {currentProductName || "Click to set Product Name"}
          </span>
          <span
            style={{
              display: "block",
              fontSize: "var(--text-base)",
              color: currentProgramName ? "var(--ink-secondary)" : "var(--ink-tertiary)",
              lineHeight: 1.4,
              borderBottom: currentProgramName ? "none" : "1px dashed var(--border-default)",
            }}
          >
            {currentProgramName || "Click to set Program Name"}
          </span>
        </button>
      </div>

      <NameEditModal isOpen={nameEditOpen} onClose={() => setNameEditOpen(false)} />
    </>
  );
}
