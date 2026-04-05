"use client";

import { useState } from "react";
import { LearningActivity } from "@/types";
import {
  calcCognitiveMatrix,
  COG_MATRIX_ROWS,
  COG_MATRIX_COLS,
  MatrixData,
} from "@/lib/reportUtils";

interface CognitiveMatrixProps {
  activities: LearningActivity[];
}

export default function CognitiveMatrix({ activities }: CognitiveMatrixProps) {
  const [showDays, setShowDays] = useState(false);

  const allDays = [...new Set(activities.filter((a) => !a.isBreak).map((a) => a.day))].sort(
    (a, b) => a - b
  );
  const overallMatrix = calcCognitiveMatrix(activities);

  return (
    <div style={{ marginBottom: 44 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: "2px solid var(--border-default)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--ink-primary)" }}>
          Cognitive Task × Content Type Matrix
        </h3>
        {allDays.length > 1 && (
          <button
            onClick={() => setShowDays((v) => !v)}
            style={{
              fontSize: "var(--text-xs)",
              padding: "4px 12px",
              background: showDays ? "var(--accent)" : "none",
              color: showDays ? "#fff" : "var(--ink-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: 5,
              cursor: "pointer",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontWeight: 600,
            }}
          >
            {showDays ? "Hide Days" : "Show Days"}
          </button>
        )}
      </div>

      {/* Overall matrix */}
      <MatrixTable matrix={overallMatrix} label="All Days" />

      {/* Per-day sub-tables */}
      {showDays &&
        allDays.map((day) => (
          <div key={day} style={{ marginTop: 24 }}>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--ink-secondary)",
              }}
            >
              Day {day}
            </p>
            <MatrixTable matrix={calcCognitiveMatrix(activities, day)} label={`Day ${day}`} />
          </div>
        ))}
    </div>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────────

function MatrixTable({ matrix, label }: { matrix: MatrixData; label: string }) {
  // Row totals
  const rowTotals = COG_MATRIX_ROWS.map((row) =>
    COG_MATRIX_COLS.reduce((s, col) => s + matrix[row][col.key].minutes, 0)
  );
  // Col totals
  const colTotals = COG_MATRIX_COLS.map((col) =>
    COG_MATRIX_ROWS.reduce((s, row) => s + matrix[row][col.key].minutes, 0)
  );
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid var(--border-default)",
          borderRadius: 8,
          overflow: "hidden",
          fontSize: "var(--text-sm)",
        }}
      >
        <thead>
          <tr style={{ background: "var(--surface-1)", borderBottom: "2px solid var(--border-default)" }}>
            {/* top-left cell */}
            <th
              style={{
                padding: "10px 14px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "var(--text-xs)",
                color: "var(--ink-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                width: 140,
              }}
            >
              Cognitive Task
            </th>
            {COG_MATRIX_COLS.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "var(--text-xs)",
                  color: "var(--ink-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {col.label}
              </th>
            ))}
            <th
              style={{
                padding: "10px 14px",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "var(--text-xs)",
                color: "var(--ink-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {COG_MATRIX_ROWS.map((row, ri) => (
            <tr
              key={row}
              style={{
                borderBottom: "1px solid var(--border-default)",
                background: ri % 2 === 0 ? "var(--surface-0)" : "var(--surface-1)",
              }}
            >
              <td
                style={{
                  padding: "10px 14px",
                  fontWeight: 600,
                  color: "var(--ink-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {row}
              </td>
              {COG_MATRIX_COLS.map((col) => {
                const mins = matrix[row][col.key].minutes;
                return (
                  <td
                    key={col.key}
                    style={{
                      padding: "10px 14px",
                      textAlign: "center",
                      color: mins > 0 ? "var(--ink-primary)" : "var(--ink-tertiary)",
                      fontWeight: mins > 0 ? 600 : 400,
                    }}
                  >
                    {mins > 0 ? `${mins} min` : "-"}
                  </td>
                );
              })}
              <td
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--ink-secondary)",
                }}
              >
                {rowTotals[ri] > 0 ? `${rowTotals[ri]} min` : "-"}
              </td>
            </tr>
          ))}

          {/* column totals row */}
          <tr
            style={{
              background: "var(--surface-1)",
              borderTop: "2px solid var(--border-default)",
              fontWeight: 700,
            }}
          >
            <td style={{ padding: "10px 14px", color: "var(--ink-tertiary)", fontSize: "var(--text-xs)", textTransform: "uppercase" }}>
              Total
            </td>
            {COG_MATRIX_COLS.map((col, ci) => (
              <td
                key={col.key}
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  color: "var(--ink-secondary)",
                  fontWeight: 700,
                }}
              >
                {colTotals[ci] > 0 ? `${colTotals[ci]} min` : "-"}
              </td>
            ))}
            <td
              style={{
                padding: "10px 14px",
                textAlign: "center",
                fontWeight: 800,
                color: "var(--ink-primary)",
              }}
            >
              {grandTotal > 0 ? `${grandTotal} min` : "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
