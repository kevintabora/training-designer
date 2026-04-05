"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDialog } from "@/store/useDialogStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StartTimeModal from "@/components/modals/StartTimeModal";
import ScheduleModal from "@/components/modals/ScheduleModal";
import { loadFromXlsx, downloadTemplate } from "@/lib/io";
import { openGuide } from "@/lib/guide";

interface ToolbarProps {
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectedIndices: Set<number>;
}

export default function Toolbar({ onSelectAll, onClearSelection, selectedIndices }: ToolbarProps) {
  const activities           = useAppStore((s) => s.activities);
  const undoStack            = useAppStore((s) => s.undoStack);
  const arePlannerColumnsHidden = useAppStore((s) => s.arePlannerColumnsHidden);
  const areTimeColumnsHidden = useAppStore((s) => s.areTimeColumnsHidden);
  const areBreaksHidden      = useAppStore((s) => s.areBreaksHidden);
  const hiddenDays           = useAppStore((s) => s.hiddenDays);
  const undo                 = useAppStore((s) => s.undo);
  const setPlannerColumnsHidden = useAppStore((s) => s.setPlannerColumnsHidden);
  const setTimeColumnsHidden = useAppStore((s) => s.setTimeColumnsHidden);
  const setBreaksHidden      = useAppStore((s) => s.setBreaksHidden);
  const setHiddenDay         = useAppStore((s) => s.setHiddenDay);
  const setFormOpen          = useAppStore((s) => s.setFormOpen);
  const setEditIndex         = useAppStore((s) => s.setEditIndex);
  const pushUndo             = useAppStore((s) => s.pushUndo);
  const setActivities        = useAppStore((s) => s.setActivities);
  const setProductName       = useAppStore((s) => s.setProductName);
  const setProgramName       = useAppStore((s) => s.setProgramName);
  const reset                = useAppStore((s) => s.reset);

  const { open: openDialog } = useDialog();

  const [collapsed, setCollapsed] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActivities = activities.length > 0;
  const canUndo       = undoStack.length > 0;
  const hasSelected   = selectedIndices.size > 0;

  const days = [...new Set(activities.map((a) => a.day))].sort((a, b) => a - b);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  // ── File menu handlers ───────────────────────────────────────────────────────

  function handleLoadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so the same file can be re-loaded
    setIsLoading(true);
    try {
      const result = await loadFromXlsx(file);
      setActivities(result.activities);
      if (result.productName) setProductName(result.productName);
      if (result.programName) setProgramName(result.programName);
    } catch (err) {
      openDialog({
        type: "error",
        title: "Load Failed",
        message: err instanceof Error ? err.message : "An unexpected error occurred while loading the file.",
        buttons: [{ label: "OK", onClick: () => {}, variant: "primary" }],
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveClick() {
    if (activities.length === 0) {
      openDialog({
        type: "warning",
        title: "Nothing to Save",
        message: "Nothing to save. Add at least one course before saving.",
        buttons: [{ label: "OK", onClick: () => {}, variant: "primary" }],
      });
      return;
    }
    setScheduleOpen(true);
  }

  async function handleDownloadTemplate() {
    setIsLoading(true);
    try {
      await downloadTemplate();
    } catch (err) {
      openDialog({
        type: "error",
        title: "Template Error",
        message: err instanceof Error ? err.message : "Failed to generate template.",
        buttons: [{ label: "OK", onClick: () => {}, variant: "primary" }],
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    openDialog({
      type: "error",
      title: "Reset App",
      message: "This will clear all activities and reset the app. This cannot be undone. Are you sure?",
      buttons: [
        { label: "Cancel", onClick: () => {}, variant: "secondary" },
        { label: "Reset", variant: "danger", onClick: () => { reset(); onClearSelection(); } },
      ],
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      {/* Hidden file input for Load */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* Loading overlay for file operations */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9600,
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--surface-0)",
              borderRadius: 12,
              padding: "24px 40px",
              fontSize: "var(--text-md)",
              fontWeight: 600,
              color: "var(--ink-primary)",
            }}
          >
            Working…
          </div>
        </div>
      )}

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
              style={{ fontFamily: "var(--font-jakarta), sans-serif", fontSize: "var(--text-sm)", minWidth: 180 }}
            >
              {/* Cloud section */}
              <DropdownMenuLabel style={{ color: "var(--ink-tertiary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Cloud
              </DropdownMenuLabel>

              <Tooltip>
                <TooltipTrigger style={{ display: "block" }}>
                  <DropdownMenuItem
                    disabled
                    style={{ opacity: 0.45, cursor: "not-allowed" }}
                  >
                    My Curricula
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="right">Sign in to access your saved curricula</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger style={{ display: "block" }}>
                  <DropdownMenuItem
                    disabled
                    style={{ opacity: 0.45, cursor: "not-allowed" }}
                  >
                    Save to Cloud
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="right">Sign in to save to the cloud</TooltipContent>
              </Tooltip>

              <DropdownMenuSeparator />

              {/* Local section */}
              <DropdownMenuLabel style={{ color: "var(--ink-tertiary)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Local
              </DropdownMenuLabel>

              <DropdownMenuItem onSelect={handleLoadClick}>
                Load from Excel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSaveClick}>
                Save to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadTemplate}>
                Download Template
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={openGuide}>
                Guide
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onSelect={handleReset}
              >
                Reset
              </DropdownMenuItem>
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

          {/* Report down */}
          {hasActivities && (
            <button className="menu-btn" onClick={scrollToReport}>
              Report{" "}
              <svg width="9" height="11" viewBox="0 0 11 14" fill="none">
                <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="currentColor" strokeWidth="2.2" />
                <polyline points="1,7 5.5,12.5 10,7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Design up */}
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

        {/* right — Sign In button (always visible) */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 16 }}>
          {/* TODO Phase 6: wire Sign In button to NextAuth signIn() */}
          <button
            className="menu-btn"
            style={{
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              padding: "3px 12px",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--ink-secondary)",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
            onClick={() => { /* Phase 6 */ }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Sign In
          </button>
        </div>
      </nav>

      {/* Modals */}
      <StartTimeModal isOpen={startTimeOpen} onClose={() => setStartTimeOpen(false)} />
      <ScheduleModal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </TooltipProvider>
  );
}
