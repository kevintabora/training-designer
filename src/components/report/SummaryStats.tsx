"use client";

import { SummaryData } from "@/lib/reportUtils";

interface SummaryStatsProps {
  data: SummaryData;
}

export default function SummaryStats({ data }: SummaryStatsProps) {
  const { totalMinutes, totalActivities, totalDays, minutesPerDay } = data;
  const totalHours = (totalMinutes / 60).toFixed(1);

  const days = Object.entries(minutesPerDay).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div style={{ marginBottom: 36 }}>
      <h3 style={sectionHeading}>Summary</h3>

      {/* top-level stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Duration" value={`${totalMinutes} min`} sub={`${totalHours} hrs`} />
        <StatCard label="Activities" value={String(totalActivities)} />
        <StatCard label="Days" value={String(totalDays)} />
        <StatCard
          label="Avg per Day"
          value={totalDays > 0 ? `${Math.round(totalMinutes / totalDays)} min` : "—"}
          sub={totalDays > 0 ? `${(totalMinutes / totalDays / 60).toFixed(1)} hrs` : undefined}
        />
      </div>

      {/* per-day breakdown */}
      {days.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          {days.map(([day, mins]) => (
            <StatCard
              key={day}
              label={`Day ${day}`}
              value={`${mins} min`}
              sub={`${(mins / 60).toFixed(1)} hrs`}
              small
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  small?: boolean;
}

function StatCard({ label, value, sub, small }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-default)",
        borderRadius: 8,
        padding: small ? "10px 14px" : "14px 18px",
      }}
    >
      <div
        style={{
          fontSize: small ? "var(--text-xs)" : "var(--text-sm)",
          color: "var(--ink-tertiary)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: small ? "var(--text-md)" : "var(--text-xl)",
          fontWeight: 700,
          color: "var(--ink-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
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
