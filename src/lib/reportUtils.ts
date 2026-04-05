import { LearningActivity } from "@/types";
import {
  ACTIVITY_GROUP_MAP,
  MEDIA_GROUP_MAP,
  LEARNER_ACTIVITY_GROUPS,
  COGNITIVE_TASKS,
} from "@/config/field-options";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BreakdownRow {
  group?: string;
  label: string;
  count: number;
  durationMinutes: number;
}

export interface SummaryData {
  totalMinutes: number;
  totalActivities: number;
  totalDays: number;
  minutesPerDay: Record<number, number>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Filter to non-break activities only */
export function nonBreak(activities: LearningActivity[]): LearningActivity[] {
  return activities.filter((a) => !a.isBreak);
}

// ── Summary ────────────────────────────────────────────────────────────────────

export function calcSummary(activities: LearningActivity[]): SummaryData {
  const filtered = nonBreak(activities);
  const totalMinutes = filtered.reduce((s, a) => s + (a.duration || 0), 0);
  const totalActivities = filtered.length;
  const days = [...new Set(filtered.map((a) => a.day))].sort((a, b) => a - b);
  const minutesPerDay: Record<number, number> = {};
  days.forEach((d) => {
    minutesPerDay[d] = filtered
      .filter((a) => a.day === d)
      .reduce((s, a) => s + (a.duration || 0), 0);
  });
  return { totalMinutes, totalActivities, totalDays: days.length, minutesPerDay };
}

// ── Generic field aggregation ──────────────────────────────────────────────────

export function aggregateByField(
  activities: LearningActivity[],
  field: keyof LearningActivity,
  groupFn?: (val: string) => string | undefined
): BreakdownRow[] {
  const filtered = nonBreak(activities);
  const map = new Map<string, { count: number; duration: number }>();

  filtered.forEach((a) => {
    const val = String(a[field] ?? "");
    if (!val) return;
    const prev = map.get(val) ?? { count: 0, duration: 0 };
    map.set(val, { count: prev.count + 1, duration: prev.duration + (a.duration || 0) });
  });

  return [...map.entries()].map(([label, { count, duration }]) => ({
    group: groupFn ? groupFn(label) : undefined,
    label,
    count,
    durationMinutes: duration,
  }));
}

// ── Activity breakdown ─────────────────────────────────────────────────────────

export function calcActivityBreakdown(activities: LearningActivity[]): BreakdownRow[] {
  return aggregateByField(
    activities,
    "learnerActivity",
    (val) => ACTIVITY_GROUP_MAP[val]
  ).sort((a, b) => b.durationMinutes - a.durationMinutes);
}

// ── Activity chart colors (group-clustered) ────────────────────────────────────

export function activityChartColors(rows: BreakdownRow[]): string[] {
  const groupColorMap: Record<string, string> = Object.fromEntries(
    LEARNER_ACTIVITY_GROUPS.map((g) => [g.id, g.chartColor])
  );
  return rows.map((r) => (r.group ? groupColorMap[r.group] ?? "#999" : "#999"));
}

// ── Media breakdown ────────────────────────────────────────────────────────────

const MEDIA_GROUP_COLORS: Record<string, string> = {
  document: "#378ADD",
  "visual-presentation": "#1D9E75",
  "audio-video": "#BA7517",
  "interactive-digital": "#993C1D",
  collaborative: "#534AB7",
  "live-experiential": "#3B6D11",
};

export function calcMediaBreakdown(activities: LearningActivity[]): BreakdownRow[] {
  return aggregateByField(
    activities,
    "media",
    (val) => MEDIA_GROUP_MAP[val]
  ).sort((a, b) => b.durationMinutes - a.durationMinutes);
}

export function mediaChartColors(rows: BreakdownRow[]): string[] {
  return rows.map((r) => (r.group ? MEDIA_GROUP_COLORS[r.group] ?? "#999" : "#999"));
}

// ── Method breakdown ───────────────────────────────────────────────────────────

export function calcMethodBreakdown(activities: LearningActivity[]): BreakdownRow[] {
  return aggregateByField(activities, "deliveryMethod").sort(
    (a, b) => b.durationMinutes - a.durationMinutes
  );
}

// ── Type (content type) breakdown ─────────────────────────────────────────────

export function calcTypeBreakdown(activities: LearningActivity[]): BreakdownRow[] {
  return aggregateByField(activities, "contentType").sort(
    (a, b) => b.durationMinutes - a.durationMinutes
  );
}

// ── Task (cognitive task) breakdown ───────────────────────────────────────────

export function calcTaskBreakdown(activities: LearningActivity[]): BreakdownRow[] {
  const rows = aggregateByField(activities, "cognitiveTask");
  // Fixed cognitive order
  const order = COGNITIVE_TASKS; // ["Remember","Explain","Apply","Evaluate","Create"]
  return order
    .map((task) => rows.find((r) => r.label === task) ?? { label: task, count: 0, durationMinutes: 0 })
    .filter((r) => r.count > 0 || true); // keep all fixed rows (even zeros)
}

// ── Cognitive Matrix ───────────────────────────────────────────────────────────

export const COG_MATRIX_ROWS = ["Remember", "Explain", "Apply", "Evaluate", "Create"];

export const COG_MATRIX_COLS: { key: string; label: string; contentTypes: string[] }[] = [
  {
    key: "information",
    label: "Information (Facts, Concepts & Workflows)",
    contentTypes: [
      "Facts / Concepts",
      "Workflow - Operations / Admin / Support",
    ],
  },
  {
    key: "procedural",
    label: "Procedural (Software, Tools & Communication)",
    contentTypes: [
      "Procedural - Software / Tools",
      "Procedural - Communication Skills",
    ],
  },
  {
    key: "problem-solving",
    label: "Problem-Solving (Software, Tools & Communication)",
    contentTypes: [
      "Problem-Solving - Software / Tools",
      "Problem-Solving - Communication Skills",
    ],
  },
];

export interface MatrixCell {
  minutes: number;
}

export type MatrixData = Record<string, Record<string, MatrixCell>>;

export function calcCognitiveMatrix(
  activities: LearningActivity[],
  filterDay?: number
): MatrixData {
  const filtered = nonBreak(activities).filter(
    (a) => filterDay === undefined || a.day === filterDay
  );

  const matrix: MatrixData = {};
  COG_MATRIX_ROWS.forEach((row) => {
    matrix[row] = {};
    COG_MATRIX_COLS.forEach((col) => {
      matrix[row][col.key] = { minutes: 0 };
    });
  });

  filtered.forEach((a) => {
    const rowKey = a.cognitiveTask;
    if (!COG_MATRIX_ROWS.includes(rowKey)) return;
    const col = COG_MATRIX_COLS.find((c) => c.contentTypes.includes(a.contentType));
    if (!col) return;
    matrix[rowKey][col.key].minutes += a.duration || 0;
  });

  return matrix;
}
