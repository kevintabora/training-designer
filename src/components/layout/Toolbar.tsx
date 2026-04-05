"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StartTimeModal from "@/components/modals/StartTimeModal";
import ScheduleModal from "@/components/modals/ScheduleModal";

export default function Toolbar() {
  const activities = useAppStore((s) => s.activities);
  const undoStack = useAppStore((s) => s.undoStack);
  const arePlannerColumnsHidden = useAppStore((s) => s.arePlannerColumnsHidden);
  const undo = useAppStore((s) => s.undo);
  const setPlannerColumnsHidden = useAppStore((s) => s.setPlannerColumnsHidden);

  const [collapsed, setCollapsed] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const hasActivities = activities.length > 0;
  const canUndo = undoStack.length > 0;

  const days = [...new Set(activities.map((a) => a.day))].sort((a, b) => a - b);

  return (
    <TooltipProvider>
      {/* ── hamburger toggle — always visible ── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Show toolbar" : "Hide toolbar"}
        className="menu-btn"
        style={{
          position: "fixed",
          top: 14,
          left: 16,
          zIndex: 1010,
          height: "auto",
          padding: 0,
          fontSize: 20,
          lineHeight: 1,
        }}
      >
        {collapsed ? "☰" : "✕"}
      </button>

      {/* ── toolbar bar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 52,
          zIndex: 1005,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: "1px solid var(--border-default)",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          transform: collapsed ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* left — title */}
        <div style={{ paddingLeft: 56 }}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger style={{ background: "none", border: "none", padding: 0, cursor: "default" }}>
                <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--accent)", userSelect: "none" }}>
                  TD
                </span>
              </TooltipTrigger>
              <TooltipContent>Training Designer</TooltipContent>
            </Tooltip>
          ) : (
            <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--accent)", userSelect: "none" }}>
              Training Designer
            </span>
          )}
        </div>

        {/* center — buttons */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* + Add Course */}
          <button className="menu-btn" onClick={() => { /* stub — Phase 3 */ }}>
            + Add Course
          </button>

          {/* File dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="menu-btn">File</DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "var(--text-sm)", minWidth: 130 }}
            >
              <DropdownMenuItem onSelect={() => { /* stub */ }}>Load</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { /* stub */ }}>Save</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { /* stub */ }}>Reset</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { /* stub */ }}>Guide</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { /* stub */ }}>Template</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="menu-btn" onClick={() => { /* stub */ }}>Hide Breaks</button>
          <button className="menu-btn" onClick={() => { /* stub */ }}>Delete Breaks</button>

          {hasActivities && (
            <button className="menu-btn" onClick={() => { /* stub */ }}>Select All</button>
          )}

          {/* Days dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="menu-btn">Days</DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "var(--text-sm)", minWidth: 240, padding: "8px 0" }}
            >
              <p style={{ margin: "4px 16px 10px", fontSize: "var(--text-xs)", color: "var(--ink-tertiary)", textAlign: "center", lineHeight: 1.5 }}>
                <strong>Note:</strong> Uncheck to hide a day. A warning appears when days are hidden.
                Hidden days ignore Select All. Click a day to scroll to it.
              </p>
              {days.length === 0 ? (
                <p style={{ margin: "0 16px 8px", fontSize: "var(--text-xs)", color: "var(--ink-tertiary)", textAlign: "center" }}>
                  No days yet.
                </p>
              ) : (
                days.map((day) => (
                  <DropdownMenuItem key={day} onSelect={() => { /* stub */ }}>
                    Day {day}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="menu-btn" onClick={() => setStartTimeOpen(true)}>Start Time</button>
          <button className="menu-btn" onClick={() => setScheduleOpen(true)}>Show Schedule</button>

          <button
            className={`menu-btn${!arePlannerColumnsHidden ? " menu-btn-active" : ""}`}
            onClick={() => setPlannerColumnsHidden(!arePlannerColumnsHidden)}
          >
            View Planner
          </button>

          {hasActivities && (
            <button className="menu-btn" onClick={() => { /* stub */ }}>
              Report{" "}
              <svg width="9" height="11" viewBox="0 0 11 14" fill="none">
                <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="currentColor" strokeWidth="2.2" />
                <polyline points="1,7 5.5,12.5 10,7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {hasActivities && (
            <button className="menu-btn" onClick={() => { /* stub */ }}>
              Design{" "}
              <svg width="9" height="11" viewBox="0 0 11 14" fill="none">
                <line x1="5.5" y1="14" x2="5.5" y2="3" stroke="currentColor" strokeWidth="2.2" />
                <polyline points="1,7 5.5,1.5 10,7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <button
            className="menu-btn"
            onClick={canUndo ? undo : undefined}
            disabled={!canUndo}
            title={canUndo ? "Undo" : "Nothing to undo"}
            style={{ fontSize: "var(--text-lg)", letterSpacing: 0 }}
          >
            ↺
          </button>
        </div>

        {/* right — spacer */}
        <div />
      </nav>

      {/* Modals */}
      <StartTimeModal isOpen={startTimeOpen} onClose={() => setStartTimeOpen(false)} />
      <ScheduleModal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </TooltipProvider>
  );
}
