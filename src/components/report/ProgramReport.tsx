"use client";

import { useAppStore } from "@/store/useAppStore";
import NameHeader from "@/components/layout/NameHeader";
import SummaryStats from "./SummaryStats";
import BreakdownSection from "./BreakdownSection";
import CognitiveMatrix from "./CognitiveMatrix";
import {
  calcSummary,
  calcActivityBreakdown,
  calcMediaBreakdown,
  calcMethodBreakdown,
  calcTypeBreakdown,
  calcTaskBreakdown,
  activityChartColors,
  mediaChartColors,
  nonBreak,
} from "@/lib/reportUtils";

export default function ProgramReport() {
  const activities = useAppStore((s) => s.activities);

  if (activities.length === 0) return null;

  const filtered = nonBreak(activities);
  const totalDuration = filtered.reduce((s, a) => s + (a.duration || 0), 0);

  // ── Summary ──────────────────────────────────────────────────────────────────
  const summaryData = calcSummary(activities);

  // ── Table 1 — Activity ───────────────────────────────────────────────────────
  const activityRows = calcActivityBreakdown(activities);
  const activityColors = activityChartColors(activityRows);

  // ── Table 2 — Media ──────────────────────────────────────────────────────────
  const mediaRows = calcMediaBreakdown(activities);
  const mediaCols = mediaChartColors(mediaRows);

  // ── Table 3 — Method ─────────────────────────────────────────────────────────
  const methodRows = calcMethodBreakdown(activities);
  const methodColors = ["#378ADD", "#1D9E75", "#BA7517", "#993C1D"];

  // ── Table 4 — Type ───────────────────────────────────────────────────────────
  const typeRows = calcTypeBreakdown(activities);

  // ── Table 5 — Task ───────────────────────────────────────────────────────────
  const taskRows = calcTaskBreakdown(activities);

  return (
    <section
      id="programReport"
      style={{
        padding: "48px 24px 80px",
        borderTop: "3px solid var(--border-default)",
        marginTop: 48,
      }}
    >
      {/* Report header with shared NameHeader */}
      <div style={{ marginBottom: 36 }}>
        <NameHeader />
        <h2
          style={{
            margin: "12px 24px 0",
            fontSize: "var(--text-xl)",
            fontWeight: 800,
            color: "var(--ink-primary)",
          }}
        >
          Program Report
        </h2>
      </div>

      <div style={{ maxWidth: 1200 }}>
        {/* 1 — Summary Stats */}
        <SummaryStats data={summaryData} />

        {/* 2 — Activity breakdown */}
        <BreakdownSection
          title="Learner Activity"
          rows={activityRows}
          totalDuration={totalDuration}
          chartType="pie"
          chartColors={activityColors}
          showGroupColumn={true}
          labelHeader="Activity"
        />

        {/* 3 — Cognitive Task Matrix */}
        <CognitiveMatrix activities={activities} />

        {/* 4 — Media breakdown */}
        <BreakdownSection
          title="Media"
          rows={mediaRows}
          totalDuration={totalDuration}
          chartType="pie"
          chartColors={mediaCols}
          showGroupColumn={true}
          labelHeader="Media"
        />

        {/* 5 — Delivery Method breakdown */}
        <BreakdownSection
          title="Delivery Method"
          rows={methodRows}
          totalDuration={totalDuration}
          chartType="pie"
          chartColors={methodColors}
          showGroupColumn={false}
          labelHeader="Method"
        />

        {/* 6 — Content Type breakdown */}
        <BreakdownSection
          title="Type of Content"
          rows={typeRows}
          totalDuration={totalDuration}
          chartType="bar"
          chartColors={["#534AB7"]}
          showGroupColumn={false}
          labelHeader="Type"
        />

        {/* 7 — Cognitive Task breakdown */}
        <BreakdownSection
          title="Cognitive Task"
          rows={taskRows}
          totalDuration={totalDuration}
          chartType="bar"
          chartColors={["#BA7517"]}
          showGroupColumn={false}
          labelHeader="Task"
        />
      </div>
    </section>
  );
}
