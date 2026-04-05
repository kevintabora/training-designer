"use client";

import { useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import NameHeader from "@/components/layout/NameHeader";
import CourseForm from "@/components/form/CourseForm";
import DayTablesContainer, { getSelectableIndices } from "@/components/table/DayTablesContainer";
import { useAppStore } from "@/store/useAppStore";

export default function Home() {
  const activities = useAppStore((s) => s.activities);
  const hiddenDays = useAppStore((s) => s.hiddenDays);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelect = useCallback((idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const selectable = getSelectableIndices(activities, hiddenDays);
    setSelectedIndices(new Set(selectable));
  }, [activities, hiddenDays]);

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  return (
    <AppShell
      selectedIndices={selectedIndices}
      onToggleSelect={toggleSelect}
      onSelectAll={selectAll}
      onClearSelection={clearSelection}
    >
      {/* Name header — clickable product/program labels */}
      <NameHeader />

      {/* Course form anchor + the form itself */}
      <div id="courseFormAnchor" style={{ padding: "0 24px" }}>
        <CourseForm />
      </div>

      {/* Day tables or empty state */}
      <DayTablesContainer
        selectedIndices={selectedIndices}
        onToggleSelect={toggleSelect}
      />

      {/* Report section placeholder (Phase 4) */}
      <div id="programReport" />
    </AppShell>
  );
}
