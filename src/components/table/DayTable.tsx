"use client";

import { useId, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LearningActivity } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { calcDayTimes } from "@/lib/timeUtils";
import { LEARNER_ACTIVITY_GROUPS, ACTIVITY_GROUP_MAP } from "@/config/field-options";
import BreakRow from "./BreakRow";

// ── group label lookup ─────────────────────────────────────────────────────────

const GROUP_LABEL: Record<string, string> = Object.fromEntries(
  LEARNER_ACTIVITY_GROUPS.map((g) => [g.id, g.label])
);

function getGroupLabel(learnerActivity: string): string {
  const id = ACTIVITY_GROUP_MAP[learnerActivity];
  return id ? GROUP_LABEL[id] ?? "" : "";
}

// ── column count (including hidden cols) ──────────────────────────────────────
// Checkbox | Day | Unit | Module | Objective | Cog Task | Learner Act | Act Group
// Delivery | Media | Content | Duration | Time | Link | Plan | Notes | Edit | Delete
// = 18 total
const TOTAL_COLS = 18;

// ── props ──────────────────────────────────────────────────────────────────────

interface DayTableProps {
  day: number;
  /** activities for this day with their global indices */
  rows: { activity: LearningActivity; globalIndex: number }[];
  selectedIndices: Set<number>;
  onToggleSelect: (globalIndex: number) => void;
  isHidden: boolean;
}

// ── main component ─────────────────────────────────────────────────────────────

export default function DayTable({
  day,
  rows,
  selectedIndices,
  onToggleSelect,
  isHidden,
}: DayTableProps) {
  const dndId = useId();
  const tableRef = useRef<HTMLDivElement>(null);

  const activities = useAppStore((s) => s.activities);
  const defaultStartTime = useAppStore((s) => s.defaultStartTime);
  const areTimeColumnsHidden = useAppStore((s) => s.areTimeColumnsHidden);
  const arePlannerColumnsHidden = useAppStore((s) => s.arePlannerColumnsHidden);
  const areBreaksHidden = useAppStore((s) => s.areBreaksHidden);
  const pushUndo = useAppStore((s) => s.pushUndo);
  const reorderActivities = useAppStore((s) => s.reorderActivities);
  const deleteActivity = useAppStore((s) => s.deleteActivity);
  const setEditIndex = useAppStore((s) => s.setEditIndex);
  const setFormOpen = useAppStore((s) => s.setFormOpen);
  const addActivity = useAppStore((s) => s.addActivity);

  // Time slots for non-break rows
  const dayActivities = rows.map((r) => r.activity);
  const timeSlots = calcDayTimes(dayActivities, defaultStartTime);

  // Total duration for this day (excluding breaks)
  const totalMinutes = rows.reduce(
    (sum, r) => sum + (r.activity.isBreak ? 0 : r.activity.duration || 0),
    0
  );

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find positions in the local rows array
    const fromLocal = rows.findIndex((r) => r.globalIndex === active.id);
    const toLocal = rows.findIndex((r) => r.globalIndex === over.id);
    if (fromLocal === -1 || toLocal === -1) return;

    // Re-order the global activities array
    const newActivities = [...activities];
    // Extract this day's global indices in current order
    const dayGlobalIndices = rows.map((r) => r.globalIndex);
    const reordered = arrayMove(dayGlobalIndices, fromLocal, toLocal);

    // Build updated full activities list
    // Remove day's items from their current positions, then re-insert in new order
    // (simpler: build a new flat array preserving other days)
    const otherActivities: { idx: number; act: LearningActivity }[] = [];
    newActivities.forEach((act, idx) => {
      if (!dayGlobalIndices.includes(idx)) otherActivities.push({ idx, act });
    });

    // Build the full new array:
    // For each position in the original array, if it was one of this day's rows,
    // replace with the reordered version; otherwise keep as-is.
    const result: LearningActivity[] = [...newActivities];
    reordered.forEach((globalIdx, localPos) => {
      result[dayGlobalIndices[localPos]] = newActivities[globalIdx];
    });

    pushUndo(activities);
    reorderActivities(result);
  }

  function handleDelete(globalIndex: number) {
    pushUndo(activities);
    deleteActivity(globalIndex);
  }

  function handleEdit(globalIndex: number) {
    setEditIndex(globalIndex);
    setFormOpen(true);
    // scroll to form
    document.getElementById("courseFormAnchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAddBreak() {
    const breakRow: LearningActivity = {
      day,
      chapter: "",
      moduleTitle: "",
      objective: "",
      cognitiveTask: "",
      learnerActivity: "",
      deliveryMethod: "",
      media: "",
      contentType: "",
      duration: 15,
      isBreak: true,
      breakLabel: "Break",
    };
    pushUndo(activities);
    // Insert after the last row of this day
    // Find the last globalIndex for this day
    const lastGlobal = rows.length > 0 ? rows[rows.length - 1].globalIndex : -1;
    if (lastGlobal === -1) {
      addActivity(breakRow);
    } else {
      // Insert at position lastGlobal + 1 in the flat array
      const newActivities = [
        ...activities.slice(0, lastGlobal + 1),
        breakRow,
        ...activities.slice(lastGlobal + 1),
      ];
      reorderActivities(newActivities);
    }
  }

  if (isHidden) {
    return (
      <div
        id={`day-table-${day}`}
        style={{
          margin: "0 0 28px",
          padding: "12px 20px",
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: 8,
          color: "var(--ink-secondary)",
          fontSize: "var(--text-sm)",
        }}
      >
        ⚠️ Day {day} is hidden from Select All and schedule calculations.
      </div>
    );
  }

  return (
    <div
      id={`day-table-${day}`}
      ref={tableRef}
      style={{ marginBottom: 36, overflowX: "auto" }}
    >
      {/* ── day header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          borderBottom: "none",
          borderRadius: "8px 8px 0 0",
          position: "sticky",
          top: 52,
          zIndex: 10,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--ink-primary)" }}>
          Day {day}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-secondary)" }}>
            {totalMinutes} min · {(totalMinutes / 60).toFixed(1)} hrs
          </span>
          <button
            onClick={handleAddBreak}
            style={{
              fontSize: "var(--text-xs)",
              padding: "4px 10px",
              background: "none",
              border: "1px solid var(--border-default)",
              borderRadius: 5,
              cursor: "pointer",
              color: "var(--ink-secondary)",
              fontFamily: "var(--font-jakarta), sans-serif",
            }}
          >
            + Break
          </button>
        </div>
      </div>

      {/* ── table ── */}
      <table
        className="day-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--text-sm)",
          tableLayout: "fixed",
          border: "1px solid var(--border-default)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          overflow: "hidden",
        }}
      >
        <colgroup>
          <col style={{ width: 36 }} /> {/* checkbox */}
          <col style={{ width: 44 }} /> {/* day */}
          <col style={{ width: 120 }} /> {/* unit */}
          <col style={{ width: 130 }} /> {/* module */}
          <col style={{ width: 180 }} /> {/* objective */}
          <col style={{ width: 90 }} />  {/* cog task */}
          <col style={{ width: 150 }} /> {/* learner act */}
          <col style={{ width: 120 }} /> {/* act group */}
          <col style={{ width: 100 }} /> {/* delivery */}
          <col style={{ width: 130 }} /> {/* media */}
          <col style={{ width: 130 }} /> {/* content type */}
          <col style={{ width: 66 }} />  {/* duration */}
          <col style={{ width: 110, display: areTimeColumnsHidden ? "none" : undefined }} /> {/* time */}
          <col style={{ width: 80 }} />  {/* link */}
          <col style={{ width: 80, display: arePlannerColumnsHidden ? "none" : undefined }} /> {/* plan */}
          <col style={{ width: 100 }} /> {/* notes */}
          <col style={{ width: 44 }} />  {/* edit */}
          <col style={{ width: 44 }} />  {/* delete */}
        </colgroup>

        <thead>
          <tr style={{ background: "var(--surface-1)", borderBottom: "2px solid var(--border-default)" }}>
            {TH("")}
            {TH("Day")}
            {TH("Unit")}
            {TH("Module")}
            {TH("Learning Objective")}
            {TH("Cognitive Task")}
            {TH("Learner Activity")}
            {TH("Activity Group")}
            {TH("Delivery")}
            {TH("Media")}
            {TH("Content Type")}
            {TH("Min")}
            {!areTimeColumnsHidden && TH("Time")}
            {TH("Link")}
            {!arePlannerColumnsHidden && TH("Plan")}
            {TH("Notes")}
            {TH("")}
            {TH("")}
          </tr>
        </thead>

        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((r) => r.globalIndex)}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {rows.map(({ activity, globalIndex }, localIndex) => {
                if (activity.isBreak) {
                  return (
                    <BreakRow
                      key={globalIndex}
                      activity={activity}
                      globalIndex={globalIndex}
                      colSpan={TOTAL_COLS - (areTimeColumnsHidden ? 1 : 0) - (arePlannerColumnsHidden ? 1 : 0)}
                      isHidden={areBreaksHidden}
                      dragHandle={<DragHandle id={globalIndex} />}
                    />
                  );
                }

                const time = timeSlots[localIndex];
                return (
                  <SortableRow
                    key={globalIndex}
                    id={globalIndex}
                    activity={activity}
                    globalIndex={globalIndex}
                    isSelected={selectedIndices.has(globalIndex)}
                    onToggleSelect={() => onToggleSelect(globalIndex)}
                    timeSlot={time}
                    areTimeColumnsHidden={areTimeColumnsHidden}
                    arePlannerColumnsHidden={arePlannerColumnsHidden}
                    onEdit={() => handleEdit(globalIndex)}
                    onDelete={() => handleDelete(globalIndex)}
                  />
                );
              })}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  );
}

// ── Sortable row ───────────────────────────────────────────────────────────────

interface SortableRowProps {
  id: number;
  activity: LearningActivity;
  globalIndex: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  timeSlot: { start: string; end: string };
  areTimeColumnsHidden: boolean;
  arePlannerColumnsHidden: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({
  id,
  activity,
  isSelected,
  onToggleSelect,
  timeSlot,
  areTimeColumnsHidden,
  arePlannerColumnsHidden,
  onEdit,
  onDelete,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isSelected ? "rgba(var(--accent-rgb, 59,130,246), 0.06)" : "var(--surface-0)",
    opacity: isDragging ? 0.5 : 1,
    borderBottom: "1px solid var(--border-default)",
  };

  const cellStyle: React.CSSProperties = {
    padding: "8px 8px",
    verticalAlign: "top",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "var(--ink-primary)",
    fontSize: "var(--text-sm)",
  };

  return (
    <tr ref={setNodeRef} style={style}>
      {/* checkbox */}
      <td style={{ ...cellStyle, textAlign: "center", padding: "8px 4px" }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          style={{ cursor: "pointer" }}
        />
      </td>

      {/* day */}
      <td style={{ ...cellStyle, textAlign: "center", color: "var(--ink-secondary)" }}>
        {activity.day}
      </td>

      {/* unit */}
      <td style={cellStyle} title={activity.chapter}>{activity.chapter}</td>

      {/* module */}
      <td style={cellStyle} title={activity.moduleTitle}>{activity.moduleTitle}</td>

      {/* objective */}
      <td style={{ ...cellStyle, whiteSpace: "normal" }} title={activity.objective}>
        {activity.objective}
      </td>

      {/* cognitive task */}
      <td style={cellStyle}>{activity.cognitiveTask}</td>

      {/* learner activity */}
      <td style={cellStyle} title={activity.learnerActivity}>{activity.learnerActivity}</td>

      {/* activity group */}
      <td style={{ ...cellStyle, color: "var(--ink-secondary)" }}>
        {getGroupLabel(activity.learnerActivity)}
      </td>

      {/* delivery */}
      <td style={cellStyle}>{activity.deliveryMethod}</td>

      {/* media */}
      <td style={cellStyle} title={activity.media}>{activity.media}</td>

      {/* content type */}
      <td style={cellStyle} title={activity.contentType}>{activity.contentType}</td>

      {/* duration */}
      <td style={{ ...cellStyle, textAlign: "right" }}>{activity.duration}</td>

      {/* time */}
      {!areTimeColumnsHidden && (
        <td style={{ ...cellStyle, color: "var(--ink-secondary)", fontSize: "var(--text-xs)" }}>
          {timeSlot?.start && timeSlot?.end ? `${timeSlot.start} – ${timeSlot.end}` : ""}
        </td>
      )}

      {/* link */}
      <td style={cellStyle}>
        {activity.link ? (
          <a href={activity.link} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            Link
          </a>
        ) : null}
      </td>

      {/* plan */}
      {!arePlannerColumnsHidden && (
        <td style={cellStyle}>{activity.plan ?? ""}</td>
      )}

      {/* notes */}
      <td style={cellStyle} title={activity.notes}>{activity.notes ?? ""}</td>

      {/* edit */}
      <td style={{ ...cellStyle, textAlign: "center", padding: "6px 4px" }}>
        <button
          onClick={onEdit}
          title="Edit"
          style={actionBtnStyle}
        >
          ✎
        </button>
      </td>

      {/* delete */}
      <td style={{ ...cellStyle, textAlign: "center", padding: "6px 4px" }}>
        <button
          onClick={onDelete}
          title="Delete"
          style={{ ...actionBtnStyle, color: "#dc2626" }}
        >
          ✕
        </button>
      </td>

      {/* drag handle — invisible overlay attached to the row via dnd-kit */}
      <td
        {...attributes}
        {...listeners}
        style={{
          display: "none", // handle is provided via row cursor
        }}
      />
    </tr>
  );
}

// ── drag handle standalone (for break rows) ────────────────────────────────────

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <span
      {...attributes}
      {...listeners}
      title="Drag to reorder"
      style={{ cursor: "grab", color: "var(--ink-tertiary)", fontSize: 14, userSelect: "none" }}
    >
      ⠿
    </span>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────────

function TH(label: string) {
  return (
    <th
      style={{
        padding: "8px 8px",
        textAlign: "left",
        fontWeight: 600,
        fontSize: "var(--text-xs)",
        color: "var(--ink-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {label}
    </th>
  );
}

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 15,
  color: "var(--ink-secondary)",
  padding: "2px 4px",
  borderRadius: 4,
  lineHeight: 1,
};
