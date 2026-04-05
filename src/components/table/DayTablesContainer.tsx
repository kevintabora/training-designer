"use client";

import { useAppStore } from "@/store/useAppStore";
import DayTable from "./DayTable";
import EmptyState from "@/components/layout/EmptyState";

interface DayTablesContainerProps {
  selectedIndices: Set<number>;
  onToggleSelect: (globalIndex: number) => void;
}

export default function DayTablesContainer({
  selectedIndices,
  onToggleSelect,
}: DayTablesContainerProps) {
  const activities = useAppStore((s) => s.activities);
  const hiddenDays = useAppStore((s) => s.hiddenDays);

  // Group activities by day, preserving global indices
  const dayMap = new Map<number, { activity: (typeof activities)[0]; globalIndex: number }[]>();
  activities.forEach((act, idx) => {
    if (!dayMap.has(act.day)) dayMap.set(act.day, []);
    dayMap.get(act.day)!.push({ activity: act, globalIndex: idx });
  });

  const days = [...dayMap.keys()].sort((a, b) => a - b);

  if (activities.length === 0) return <EmptyState />;

  return (
    <div id="programDetails" style={{ padding: "0 24px 48px" }}>
      {days.map((day) => {
        const rows = dayMap.get(day)!;
        const hidden = !!hiddenDays[day];
        return (
          <DayTable
            key={day}
            day={day}
            rows={rows}
            selectedIndices={selectedIndices}
            onToggleSelect={onToggleSelect}
            isHidden={hidden}
          />
        );
      })}
    </div>
  );
}

/** Returns all global indices that are selectable (non-break, non-hidden-day) */
export function getSelectableIndices(
  activities: { day: number; isBreak?: boolean }[],
  hiddenDays: Record<number, boolean>
): number[] {
  return activities.reduce<number[]>((acc, act, idx) => {
    if (!act.isBreak && !hiddenDays[act.day]) acc.push(idx);
    return acc;
  }, []);
}
