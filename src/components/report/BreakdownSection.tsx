"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { BreakdownRow } from "@/lib/reportUtils";

interface BreakdownSectionProps {
  title: string;
  rows: BreakdownRow[];
  totalDuration: number;
  chartType: "pie" | "bar";
  chartColors: string[];
  showGroupColumn: boolean;
  labelHeader: string;
}

export default function BreakdownSection({
  title,
  rows,
  totalDuration,
  chartType,
  chartColors,
  showGroupColumn,
  labelHeader,
}: BreakdownSectionProps) {
  if (rows.length === 0) return null;

  const grandTotal = rows.reduce((s, r) => s + r.durationMinutes, 0);
  const grandCount = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div style={{ marginBottom: 44 }}>
      <h3 style={sectionHeading}>{title}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: chartType === "pie" ? "1fr 380px" : "1fr 440px",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* ── Table ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: "var(--surface-1)", borderBottom: "2px solid var(--border-default)" }}>
                {showGroupColumn && <TH>Group</TH>}
                <TH>{labelHeader}</TH>
                <TH align="right">Count</TH>
                <TH align="right">Duration</TH>
                <TH align="right">Time %</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid var(--border-default)",
                    background: i % 2 === 0 ? "var(--surface-0)" : "var(--surface-1)",
                  }}
                >
                  {showGroupColumn && (
                    <TD>
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: chartColors[i] ?? "#999",
                          marginRight: 6,
                          flexShrink: 0,
                        }}
                      />
                      {row.group ?? "-"}
                    </TD>
                  )}
                  <TD>
                    {!showGroupColumn && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: chartColors[i % chartColors.length] ?? "#999",
                          marginRight: 6,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {row.label}
                  </TD>
                  <TD align="right">{row.count}</TD>
                  <TD align="right">{row.durationMinutes} min</TD>
                  <TD align="right">
                    {totalDuration > 0
                      ? ((row.durationMinutes / totalDuration) * 100).toFixed(1) + "%"
                      : "0%"}
                  </TD>
                </tr>
              ))}
              {/* totals row */}
              <tr style={{ background: "var(--surface-1)", fontWeight: 700, borderTop: "2px solid var(--border-default)" }}>
                {showGroupColumn && <TD>-</TD>}
                <TD>Total</TD>
                <TD align="right">{grandCount}</TD>
                <TD align="right">{grandTotal} min</TD>
                <TD align="right">
                  {totalDuration > 0
                    ? ((grandTotal / totalDuration) * 100).toFixed(1) + "%"
                    : "100%"}
                </TD>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Chart ── */}
        <div>
          {chartType === "pie" ? (
            <PieChartView rows={rows} colors={chartColors} total={grandTotal} />
          ) : (
            <BarChartView rows={rows} colors={chartColors} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pie chart ──────────────────────────────────────────────────────────────────

interface PieChartViewProps {
  rows: BreakdownRow[];
  colors: string[];
  total: number;
}

function PieChartView({ rows, colors, total }: PieChartViewProps) {
  const data = rows.map((r, i) => ({
    name: r.label,
    value: r.durationMinutes,
    pct: total > 0 ? ((r.durationMinutes / total) * 100).toFixed(1) : "0",
    color: colors[i] ?? "#999",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius="40%"
          outerRadius="65%"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const v = Number(value);
            const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0";
            return [`${v} min (${pct}%)`, String(name)];
          }}
          contentStyle={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 12,
            border: "1px solid var(--border-default)",
            borderRadius: 6,
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={10}
          formatter={(value, entry) => {
            const d = entry.payload as { pct?: string } | undefined;
            return (
              <span style={{ fontSize: 11, color: "var(--ink-secondary)" }}>
                {value} {d?.pct ? `(${d.pct}%)` : ""}
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────────

interface BarChartViewProps {
  rows: BreakdownRow[];
  colors: string[];
}

function BarChartView({ rows, colors }: BarChartViewProps) {
  const data = rows.map((r) => ({
    name: r.label,
    minutes: r.durationMinutes,
    count: r.count,
  }));

  const primaryColor = colors[0] ?? "#534AB7";

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 42)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          dataKey="minutes"
          tick={{ fontSize: 11, fill: "var(--ink-tertiary)" }}
          axisLine={false}
          tickLine={false}
          label={{ value: "min", position: "insideBottomRight", offset: -4, fontSize: 10, fill: "var(--ink-tertiary)" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={180}
          tick={{ fontSize: 11, fill: "var(--ink-secondary)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value, _name, props) => [
            `${Number(value)} min - ${(props.payload as { count?: number })?.count ?? 0} activities`,
            "Duration",
          ]}
          contentStyle={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize: 12,
            border: "1px solid var(--border-default)",
            borderRadius: 6,
          }}
        />
        <Bar dataKey="minutes" fill={primaryColor} radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Cell helpers ───────────────────────────────────────────────────────────────

function TH({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      style={{
        padding: "8px 10px",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--ink-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        textAlign: align,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function TD({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td
      style={{
        padding: "8px 10px",
        fontSize: "var(--text-sm)",
        color: "var(--ink-primary)",
        textAlign: align,
        verticalAlign: "middle",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {children}
      </span>
    </td>
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: "var(--text-md)",
  fontWeight: 700,
  color: "var(--ink-primary)",
  margin: "0 0 16px",
  paddingBottom: 8,
  borderBottom: "2px solid var(--border-default)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  overflow: "hidden",
};
