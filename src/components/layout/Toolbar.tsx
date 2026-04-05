"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDialog } from "@/store/useDialogStore";
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

interface ToolbarProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectedIndices: Set<number>;
}

export default function Toolbar({ onSelectAll, onClearSelection, selectedIndices }: ToolbarProps) {
  const activities = useAppStore((s) => s.activities);
  const undoStack = useAppStore((s) => s.undoStack);
  const arePlannerColumnsHidden = useAppStore((s) => s.arePlannerColumnsHidden);
  const areTimeColumnsHidden = useAppStore((s) => s.areTimeColumnsHidden);
  const areBreaksHidden = useAppStore((s) => s.areBreaksHidden);
  const hiddenDays = useAppStore((s) => s.hiddenDays);
  const undo = useAppStore((s) => s.undo);
  const setPlannerColumnsHidden = useAppStore((s) => s.setPlannerColumnsHidden);
  const setTimeColumnsHidden = useAppStore((s) => s.setTimeColumnsHidden);
  const setBreaksHidden = useAppStore((s) => s.setBreaksHidden);
  const setHiddenDay = useAppStore((s) => s.setHiddenDay);
  const setFormOpen = useAppStore((s) => s.setFormOpen);
  const setEditIndex = useAppStore((s) => s.setEditIndex);
  const pushUndo = useAppStore((s) => s.pushUndo);
  const setActivities = useAppStore((s) => s.setActivities);

  const { open: openDialog } = useDialog();

  const [collapsed, setCollapsed] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const hasActivities = activities.length > 0;
  const canUndo = undoStack.length > 0;
  const hasSelected = selectedIndices.size > 0;

  const days = [...new Set(activities.map((a) => a.day))].sort((a, b) => a - b);

  function handleAddCourse() {
    setEditIndex(null);
    setFormOpen(true);
    document.getElementById("courseFormAnchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDeleteBreaks() {
    const hasBreaks = activities.some((a) => a.isBreak);
    if (!hasBreaks) {
      openDialog({
        type: "info",
        title: "No Breaks",
        message: "There are no break rows to delete.",
        buttons: [{ label: "OK", onClick: () => {}, variant: "primary" }],
      });
      return;
    }
    openDialog({
      type: "error",
      title: "Delete All Breaks",
      message: "This will remove every break row from your training plan.",
      buttons: [
        { label: "Keep", onClick: () => {}, variant: "secondary" },
        {
          label: "Delete All",
          variant: "danger",
          onClick: () => {
            pushUndo(activities);
            setActivities(activities.filter((a) => !a.isBreak));
            onClearSelection();
          },
        },
      ],
    });
  }

  function scrollToDay(day: number) {
    document.getElementById(`day-table-${day}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToReport() {
    const el = document.getElementById("programReport");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function scrollToDesign() {
    document.getElementById("programDetails")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <TooltipProvider>
      {/* hamburger toggle */}
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

      {/* toolbar bar */}
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
          <button className="menu-btn" onClick={handleAddCourse}>
            + Add Course
          </button>

          {/* File dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="menu-btn">File</DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "var(--text-sm)", minWidth: 130 }}
            >
              <DropdownMenuItem onSelect={() => { /* Phase 4 */ }}>Load</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { /* Phase 4 */ }}>Save</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { /* Phase 4 */ }}>Reset</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { /* Phase 4 */ }}>Guide</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { /* Phase 4 */ }}>Template</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hide/Show Breaks */}
          <button
            className={`menu-btn${areBreaksHidden ? " menu-btn-active" : ""}`}
            onClick={() => setBreaksHidden(!areBreaksHidden)}
          >
            {areBreaksHidden ? "Show Breaks" : "Hide Breaks"}
          </button>

          {/* Delete Breaks */}
          <button className="menu-btn" onClick={handleDeleteBreaks}>
            Delete Breaks
          </button>

          {/* Select All */}
          {hasActivities && (
            <button
              className={`menu-btn${hasSelected ? " menu-btn-active" : ""}`}
              onClick={hasSelected ? onClearSelection : onSelectAll}
            >
              {hasSelected ? "Clear" : "Select All"}
            </button>
          )}

          {/* Days dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="menu-btn">Days</DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              style={{
                fontFamily: "var(--font-jakarta), sans-serif",
                fontSize: "var(--text-sm)",
                minWidth: 240,
                padding: "8px 0",
              }}
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
                  <DropdownMenuItem
                    key={day}
                    onSelect={(e) => {
                      e.preventDefault();
                      scrollToDay(day);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={!hiddenDays[day]}
                      onChange={(e) => {
                        e.stopPropagation();
                        setHiddenDay(day, !e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: "pointer" }}
                    />
                    <span onClick={() => scrollToDay(day)}>Day {day}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Start Time */}
          <button className="menu-btn" onClick={() => setStartTimeOpen(true)}>
            Start Time
          </button>

          {/* Show/Hide Schedule */}
          <button
            className={`menu-btn${!areTimeColumnsHidden ? " menu-btn-active" : ""}`}
            onClick={() => setTimeColumnsHidden(!areTimeColumnsHidden)}
          >
            {areTimeColumnsHidden ? "Show Schedule" : "Hide Schedule"}
          </button>

          {/* View/Hide Planner */}
          <button
            className={`menu-btn${!arePlannerColumnsHidden ? " menu-btn-active" : ""}`}
            onClick={() => setPlannerColumnsHidden(!arePlannerColumnsHidden)}
          >
            {arePlannerColumnsHidden ? "View Planner" : "Hide Planner"}
          </button>

          {/* Report ↓ */}
          {hasActivities && (
            <button className="menu-btn" onClick={scrollToReport}>
              Report{" "}
              <svg width="9" height="11" viewBox="0 0 11 14" fill="none">
                <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="currentColor" strokeWidth="2.2" />
                <polyline points="1,7 5.5,12.5 10,7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Design ↑ */}
          {hasActivities && (
            <button className="menu-btn" onClick={scrollToDesign}>
              Design{" "}
              <svg width="9" height="11" viewBox="0 0 11 14" fill="none">
                <line x1="5.5" y1="14" x2="5.5" y2="3" stroke="currentColor" strokeWidth="2.2" />
                <polyline points="1,7 5.5,1.5 10,7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Undo */}
          <Tooltip>
            <TooltipTrigger>
              <button
                className="menu-btn"
                onClick={canUndo ? undo : undefined}
                disabled={!canUndo}
                style={{ fontSize: "var(--text-lg)", letterSpacing: 0 }}
              >
                ↺
              </button>
            </TooltipTrigger>
            <TooltipContent>{canUndo ? "Undo last action" : "Nothing to undo"}</TooltipContent>
          </Tooltip>
        </div>

        {/* right spacer */}
        <div />
      </nav>

      {/* Modals */}
      <StartTimeModal isOpen={startTimeOpen} onClose={() => setStartTimeOpen(false)} />
      <ScheduleModal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </TooltipProvider>
  );
}
