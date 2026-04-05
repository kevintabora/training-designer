"use client";

import { useState, useEffect, useCallback } from "react";
import MobileNotice from "@/components/layout/MobileNotice";
import Toolbar from "@/components/layout/Toolbar";
import DialogOverlay from "@/components/modals/DialogOverlay";
import SelectionTally from "@/components/layout/SelectionTally";
import SavingOverlay from "@/components/layout/SavingOverlay";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import { useAppStore } from "@/store/useAppStore";
import { getSelectableIndices } from "@/components/table/DayTablesContainer";

interface AppShellProps {
  children: React.ReactNode;
  selectedIndices: Set<number>;
  onToggleSelect: (idx: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function AppShell({
  children,
  selectedIndices,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
}: AppShellProps) {
  const activities = useAppStore((s) => s.activities);
  const [savedVisible, setSavedVisible] = useState(false);

  // Autosave indicator — every 60s when there's data
  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setSavedVisible(true);
      setTimeout(() => setSavedVisible(false), 2000);
    }, 60_000);
    return () => clearInterval(interval);
  }, [activities.length]);

  // Compute tally
  const selectedList = [...selectedIndices];
  const totalMinutes = selectedList.reduce((sum, idx) => {
    const act = activities[idx];
    return act && !act.isBreak ? sum + (act.duration || 0) : sum;
  }, 0);

  return (
    <>
      {/* Mobile notice */}
      <MobileNotice />

      {/* Sticky toolbar — receives selection controls */}
      <Toolbar onSelectAll={onSelectAll} onClearSelection={onClearSelection} selectedIndices={selectedIndices} />

      {/* Main content */}
      <main id="mainContent" style={{ paddingTop: 52, minHeight: "100vh" }}>
        {children}
      </main>

      {/* Dialogs */}
      <DialogOverlay />

      {/* Selection tally */}
      <SelectionTally count={selectedList.length} totalMinutes={totalMinutes} />

      {/* Autosave toast */}
      {savedVisible && (
        <div
          style={{
            position: "fixed",
            bottom: selectedList.length > 0 ? 56 : 16,
            right: 20,
            zIndex: 200,
            background: "var(--surface-1)",
            border: "1px solid var(--border-default)",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: "var(--text-xs)",
            color: "var(--ink-secondary)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            pointerEvents: "none",
          }}
        >
          ✓ Saved
        </div>
      )}

      {/* Saving overlay */}
      <SavingOverlay isVisible={false} />

      {/* Loading overlay */}
      <LoadingOverlay />
    </>
  );
}
