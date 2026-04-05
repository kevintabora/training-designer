"use client";

import { useState, useRef, useEffect } from "react";
import { LearningActivity } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface BreakRowProps {
  activity: LearningActivity;
  globalIndex: number;
  colSpan: number;
  isHidden: boolean;
  dragHandle?: React.ReactNode;
}

export default function BreakRow({
  activity,
  globalIndex,
  colSpan,
  isHidden,
  dragHandle,
}: BreakRowProps) {
  const activities = useAppStore((s) => s.activities);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const deleteActivity = useAppStore((s) => s.deleteActivity);
  const pushUndo = useAppStore((s) => s.pushUndo);

  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [labelValue, setLabelValue] = useState(activity.breakLabel || "Break");
  const [durationValue, setDurationValue] = useState(String(activity.duration || 15));

  const labelRef = useRef<HTMLInputElement>(null);
  const durRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingLabel) labelRef.current?.focus();
  }, [editingLabel]);

  useEffect(() => {
    if (editingDuration) durRef.current?.focus();
  }, [editingDuration]);

  function commitLabel() {
    const trimmed = labelValue.trim() || "Break";
    setLabelValue(trimmed);
    updateActivity(globalIndex, { ...activity, breakLabel: trimmed });
    setEditingLabel(false);
  }

  function commitDuration() {
    const n = parseInt(durationValue);
    const valid = !isNaN(n) && n > 0 ? n : 15;
    setDurationValue(String(valid));
    updateActivity(globalIndex, { ...activity, duration: valid });
    setEditingDuration(false);
  }

  function handleDelete() {
    pushUndo(activities);
    deleteActivity(globalIndex);
  }

  return (
    <tr
      data-break="true"
      style={{
        display: isHidden ? "none" : undefined,
        background: "var(--surface-1)",
        opacity: 0.85,
      }}
    >
      {/* drag handle + checkbox spacer */}
      <td
        colSpan={2}
        style={{
          padding: "6px 8px",
          verticalAlign: "middle",
          textAlign: "center",
          fontSize: "var(--text-xs)",
          color: "var(--ink-tertiary)",
        }}
      >
        {dragHandle}
      </td>

      {/* break label + duration spanning remaining cols */}
      <td
        colSpan={colSpan - 3}
        style={{
          padding: "6px 12px",
          verticalAlign: "middle",
          fontStyle: "italic",
          color: "var(--ink-secondary)",
          fontSize: "var(--text-sm)",
        }}
      >
        {editingLabel ? (
          <input
            ref={labelRef}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel();
              if (e.key === "Escape") setEditingLabel(false);
            }}
            style={{
              fontSize: "var(--text-sm)",
              border: "1px solid var(--border-default)",
              borderRadius: 4,
              padding: "2px 6px",
              fontStyle: "italic",
              width: 160,
              background: "var(--surface-0)",
              color: "var(--ink-primary)",
            }}
          />
        ) : (
          <span
            title="Click to edit label"
            onClick={() => setEditingLabel(true)}
            style={{ cursor: "text", borderBottom: "1px dashed var(--border-default)" }}
          >
            {labelValue}
          </span>
        )}{" "}
        —{" "}
        {editingDuration ? (
          <input
            ref={durRef}
            type="number"
            min={1}
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            onBlur={commitDuration}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitDuration();
              if (e.key === "Escape") setEditingDuration(false);
            }}
            style={{
              fontSize: "var(--text-sm)",
              border: "1px solid var(--border-default)",
              borderRadius: 4,
              padding: "2px 6px",
              width: 60,
              background: "var(--surface-0)",
              color: "var(--ink-primary)",
            }}
          />
        ) : (
          <span
            title="Click to edit duration"
            onClick={() => setEditingDuration(true)}
            style={{ cursor: "text", borderBottom: "1px dashed var(--border-default)" }}
          >
            {durationValue} min
          </span>
        )}
      </td>

      {/* delete */}
      <td
        colSpan={1}
        style={{ padding: "6px 8px", verticalAlign: "middle", textAlign: "center" }}
      >
        <button
          onClick={handleDelete}
          title="Delete break"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink-tertiary)",
            fontSize: 14,
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
