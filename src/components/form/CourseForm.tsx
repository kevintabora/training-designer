"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { LearningActivity } from "@/types";
import {
  COGNITIVE_TASKS,
  LEARNER_ACTIVITY_GROUPS,
  DELIVERY_METHODS,
  MEDIA_GROUPS,
  CONTENT_TYPES,
  TRANSFER_LEVELS,
  INSTRUCTIONAL_MODES,
  ACTIVITY_GROUP_MAP,
} from "@/config/field-options";

// ── types ──────────────────────────────────────────────────────────────────────

interface ActivityBlock {
  objective: string;
  cognitiveTask: string;
  learnerActivity: string;
  deliveryMethod: string;
  media: string;
  contentType: string;
  duration: string;
  transferLevel: string;
  instructionalMode: string;
}

const emptyBlock = (): ActivityBlock => ({
  objective: "",
  cognitiveTask: COGNITIVE_TASKS[0],
  learnerActivity: LEARNER_ACTIVITY_GROUPS[0].activities[0],
  deliveryMethod: DELIVERY_METHODS[0],
  media: MEDIA_GROUPS[0].activities[0],
  contentType: CONTENT_TYPES[0],
  duration: "",
  transferLevel: "",
  instructionalMode: "",
});

// ── component ──────────────────────────────────────────────────────────────────

export default function CourseForm() {
  const isFormOpen = useAppStore((s) => s.isFormOpen);
  const editIndex = useAppStore((s) => s.editIndex);
  const activities = useAppStore((s) => s.activities);
  const setFormOpen = useAppStore((s) => s.setFormOpen);
  const setEditIndex = useAppStore((s) => s.setEditIndex);
  const addActivity = useAppStore((s) => s.addActivity);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const pushUndo = useAppStore((s) => s.pushUndo);

  // top-level fields
  const [day, setDay] = useState("1");
  const [chapter, setChapter] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");

  // activity blocks
  const [blocks, setBlocks] = useState<ActivityBlock[]>([emptyBlock()]);

  // field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill when editing
  useEffect(() => {
    if (isFormOpen && editIndex !== null) {
      const act = activities[editIndex];
      if (!act) return;
      setDay(String(act.day));
      setChapter(act.chapter);
      setModuleTitle(act.moduleTitle);
      setBlocks([
        {
          objective: act.objective,
          cognitiveTask: act.cognitiveTask || COGNITIVE_TASKS[0],
          learnerActivity: act.learnerActivity || LEARNER_ACTIVITY_GROUPS[0].activities[0],
          deliveryMethod: act.deliveryMethod || DELIVERY_METHODS[0],
          media: act.media || MEDIA_GROUPS[0].activities[0],
          contentType: act.contentType || CONTENT_TYPES[0],
          duration: String(act.duration),
          transferLevel: act.transferLevel || "",
          instructionalMode: act.instructionalMode || "",
        },
      ]);
    } else if (isFormOpen && editIndex === null) {
      // reset to blank (keep day as last used or 1)
      setChapter("");
      setModuleTitle("");
      setBlocks([emptyBlock()]);
      setErrors({});
    }
  }, [isFormOpen, editIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── block helpers ────────────────────────────────────────────────────────────

  function updateBlock(i: number, key: keyof ActivityBlock, value: string) {
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [key]: value } : b))
    );
  }

  function addBlock() {
    setBlocks((prev) => [...prev, emptyBlock()]);
  }

  function removeBlock(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── validation ───────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!day || isNaN(Number(day)) || Number(day) < 1)
      errs["day"] = "Day is required (must be a positive number).";
    if (!chapter.trim()) errs["chapter"] = "Unit / Main Topic is required.";
    if (!moduleTitle.trim()) errs["moduleTitle"] = "Module / Subtopic is required.";
    blocks.forEach((b, i) => {
      if (!b.objective.trim())
        errs[`obj_${i}`] = "Learning Objective is required.";
      if (!b.duration || isNaN(Number(b.duration)) || Number(b.duration) <= 0)
        errs[`dur_${i}`] = "Duration must be a positive number.";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── submit ───────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    pushUndo(activities);

    if (editIndex !== null) {
      // Edit mode — update single row
      const b = blocks[0];
      const updated: LearningActivity = {
        ...activities[editIndex],
        day: Number(day),
        chapter: chapter.trim(),
        moduleTitle: moduleTitle.trim(),
        objective: b.objective.trim(),
        cognitiveTask: b.cognitiveTask,
        learnerActivity: b.learnerActivity,
        deliveryMethod: b.deliveryMethod,
        media: b.media,
        contentType: b.contentType,
        duration: Number(b.duration),
        transferLevel: b.transferLevel || undefined,
        instructionalMode: b.instructionalMode || undefined,
      };
      updateActivity(editIndex, updated);
    } else {
      // Add mode — one row per block
      blocks.forEach((b) => {
        const act: LearningActivity = {
          day: Number(day),
          chapter: chapter.trim(),
          moduleTitle: moduleTitle.trim(),
          objective: b.objective.trim(),
          cognitiveTask: b.cognitiveTask,
          learnerActivity: b.learnerActivity,
          deliveryMethod: b.deliveryMethod,
          media: b.media,
          contentType: b.contentType,
          duration: Number(b.duration),
          transferLevel: b.transferLevel || undefined,
          instructionalMode: b.instructionalMode || undefined,
          isBreak: false,
        };
        addActivity(act);
      });
    }

    handleClose();
  }

  function handleClose() {
    setFormOpen(false);
    setEditIndex(null);
    setBlocks([emptyBlock()]);
    setErrors({});
  }

  if (!isFormOpen) return null;

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        padding: "24px 28px",
        marginBottom: 28,
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* ── header ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: "var(--ink-primary)",
            }}
          >
            {editIndex !== null ? "Edit Activity" : "Add Course"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--ink-tertiary)",
              lineHeight: 1,
              padding: "0 4px",
            }}
            aria-label="Close form"
          >
            ✕
          </button>
        </div>

        {/* ── top-level fields ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 1fr",
            gap: "12px 16px",
            marginBottom: 24,
          }}
        >
          <div>
            <FormLabel htmlFor="f-day">Day *</FormLabel>
            <input
              id="f-day"
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              style={inputStyle}
              placeholder="1"
            />
            {errors["day"] && <FieldError msg={errors["day"]} />}
          </div>

          <div>
            <FormLabel htmlFor="f-chapter">Unit / Main Topic *</FormLabel>
            <input
              id="f-chapter"
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              style={inputStyle}
              placeholder="e.g., Salesforce, Leadership"
            />
            {errors["chapter"] && <FieldError msg={errors["chapter"]} />}
          </div>

          <div>
            <FormLabel htmlFor="f-module">Module / Subtopic *</FormLabel>
            <input
              id="f-module"
              type="text"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              style={inputStyle}
              placeholder="e.g., Navigating the Homepage, Running Meetings"
            />
            {errors["moduleTitle"] && <FieldError msg={errors["moduleTitle"]} />}
          </div>
        </div>

        {/* ── activity blocks ── */}
        {blocks.map((b, i) => (
          <ActivityBlockForm
            key={i}
            index={i}
            block={b}
            errors={errors}
            isOnly={blocks.length === 1}
            editMode={editIndex !== null}
            onChange={(key, val) => updateBlock(i, key, val)}
            onRemove={() => removeBlock(i)}
          />
        ))}

        {/* Add activity button — only in add mode */}
        {editIndex === null && (
          <button
            type="button"
            onClick={addBlock}
            style={{
              marginBottom: 20,
              padding: "6px 14px",
              fontSize: "var(--text-sm)",
              background: "none",
              border: "1px dashed var(--border-default)",
              borderRadius: 6,
              cursor: "pointer",
              color: "var(--ink-secondary)",
            }}
          >
            + Learning Activity
          </button>
        )}

        {/* ── form actions ── */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              ...btnBase,
              background: "none",
              border: "1px solid var(--border-default)",
              color: "var(--ink-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...btnBase,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
            }}
          >
            {editIndex !== null ? "Save Changes" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Activity block sub-component ───────────────────────────────────────────────

interface BlockProps {
  index: number;
  block: ActivityBlock;
  errors: Record<string, string>;
  isOnly: boolean;
  editMode: boolean;
  onChange: (key: keyof ActivityBlock, val: string) => void;
  onRemove: () => void;
}

function ActivityBlockForm({
  index,
  block,
  errors,
  isOnly,
  editMode,
  onChange,
  onRemove,
}: BlockProps) {
  return (
    <div
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--border-default)",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 16,
        position: "relative",
      }}
    >
      {/* block header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--ink-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Learning Activity {!editMode && index + 1}
        </span>
        {!isOnly && (
          <button
            type="button"
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "var(--ink-tertiary)",
              padding: "0 4px",
              lineHeight: 1,
            }}
            aria-label="Remove activity"
          >
            ×
          </button>
        )}
      </div>

      {/* 3-col row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 16px", marginBottom: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <FormLabel htmlFor={`f-obj-${index}`}>Learning Objective *</FormLabel>
          <input
            id={`f-obj-${index}`}
            type="text"
            value={block.objective}
            onChange={(e) => onChange("objective", e.target.value)}
            style={inputStyle}
            placeholder="What learners will be able to do..."
          />
          {errors[`obj_${index}`] && <FieldError msg={errors[`obj_${index}`]} />}
        </div>

        <div>
          <FormLabel htmlFor={`f-cog-${index}`}>Cognitive Task</FormLabel>
          <select
            id={`f-cog-${index}`}
            value={block.cognitiveTask}
            onChange={(e) => onChange("cognitiveTask", e.target.value)}
            style={selectStyle}
          >
            {COGNITIVE_TASKS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel htmlFor={`f-la-${index}`}>Learner Activity</FormLabel>
          <select
            id={`f-la-${index}`}
            value={block.learnerActivity}
            onChange={(e) => onChange("learnerActivity", e.target.value)}
            style={selectStyle}
          >
            {LEARNER_ACTIVITY_GROUPS.map((g) => (
              <optgroup key={g.id} label={g.label}>
                {g.activities.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <FormLabel htmlFor={`f-dm-${index}`}>Delivery Method</FormLabel>
          <select
            id={`f-dm-${index}`}
            value={block.deliveryMethod}
            onChange={(e) => onChange("deliveryMethod", e.target.value)}
            style={selectStyle}
          >
            {DELIVERY_METHODS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-col row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 16px", marginBottom: 12 }}>
        <div>
          <FormLabel htmlFor={`f-media-${index}`}>Media</FormLabel>
          <select
            id={`f-media-${index}`}
            value={block.media}
            onChange={(e) => onChange("media", e.target.value)}
            style={selectStyle}
          >
            {MEDIA_GROUPS.map((g) => (
              <optgroup key={g.id} label={g.label}>
                {g.activities.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <FormLabel htmlFor={`f-ct-${index}`}>Type of Content</FormLabel>
          <select
            id={`f-ct-${index}`}
            value={block.contentType}
            onChange={(e) => onChange("contentType", e.target.value)}
            style={selectStyle}
          >
            {CONTENT_TYPES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel htmlFor={`f-dur-${index}`}>Duration (min) *</FormLabel>
          <input
            id={`f-dur-${index}`}
            type="number"
            min={1}
            value={block.duration}
            onChange={(e) => onChange("duration", e.target.value)}
            style={inputStyle}
            placeholder="15"
          />
          {errors[`dur_${index}`] && <FieldError msg={errors[`dur_${index}`]} />}
        </div>
      </div>

      {/* optional fields row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
        <div>
          <FormLabel htmlFor={`f-tl-${index}`}>Transfer Level <span style={{ color: "var(--ink-tertiary)", fontWeight: 400 }}>(optional)</span></FormLabel>
          <select
            id={`f-tl-${index}`}
            value={block.transferLevel}
            onChange={(e) => onChange("transferLevel", e.target.value)}
            style={selectStyle}
          >
            <option value="">— select —</option>
            {TRANSFER_LEVELS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <FormLabel htmlFor={`f-im-${index}`}>Instructional Mode <span style={{ color: "var(--ink-tertiary)", fontWeight: 400 }}>(optional)</span></FormLabel>
          <select
            id={`f-im-${index}`}
            value={block.instructionalMode}
            onChange={(e) => onChange("instructionalMode", e.target.value)}
            style={selectStyle}
          >
            <option value="">— select —</option>
            {INSTRUCTIONAL_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────────

function FormLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        marginBottom: 4,
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--ink-secondary)",
      }}
    >
      {children}
    </label>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs)", color: "#dc2626" }}>
      {msg}
    </p>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  fontSize: "var(--text-sm)",
  border: "1px solid var(--border-default)",
  borderRadius: 6,
  background: "var(--surface-0)",
  color: "var(--ink-primary)",
  fontFamily: "var(--font-jakarta), sans-serif",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "auto",
};

const btnBase: React.CSSProperties = {
  padding: "8px 18px",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "var(--font-jakarta), sans-serif",
};

// Export helper used in DayTable for activity group lookup
export { ACTIVITY_GROUP_MAP };
