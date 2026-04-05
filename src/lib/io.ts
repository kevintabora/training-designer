// NOTE: The original vanilla app used different activity and media names
// (e.g. "Module Interaction", "Navigation Practice", "Watching").
// Files saved by the original app will load with the old names as-is.
// A legacy name migration map will be added in a future release when
// we have active users to consider. See field-options.ts for the mapping.

import { LearningActivity } from "@/types";
import { generateFileName, getFormattedUTCTimestamp } from "@/lib/utils";

// ── Column definitions ─────────────────────────────────────────────────────────

const COLUMNS = [
  { header: "Product",            key: "product",           width: 22 },
  { header: "Program",            key: "program",           width: 22 },
  { header: "Day",                key: "day",               width: 8  },
  { header: "Day Order",          key: "dayOrder",          width: 10 },
  { header: "Unit (Main Topic)",  key: "chapter",           width: 26 },
  { header: "Module (Subtopic)",  key: "moduleTitle",       width: 26 },
  { header: "Learning Objective", key: "objective",         width: 36 },
  { header: "Cognitive Task",     key: "cognitiveTask",     width: 16 },
  { header: "Learner Activity",   key: "learnerActivity",   width: 30 },
  { header: "Delivery Method",    key: "deliveryMethod",    width: 18 },
  { header: "Media",              key: "media",             width: 26 },
  { header: "Content Type",       key: "contentType",       width: 32 },
  { header: "Duration",           key: "duration",          width: 10 },
  { header: "Link",               key: "link",              width: 30 },
  { header: "Plan",               key: "plan",              width: 16 },
  { header: "Notes",              key: "notes",             width: 30 },
  { header: "Transfer Level",     key: "transferLevel",     width: 16 },
  { header: "Instructional Mode", key: "instructionalMode", width: 18 },
  { header: "Is Break",           key: "isBreak",           width: 10 },
  { header: "Break Label",        key: "breakLabel",        width: 20 },
] as const;

const HEADER_BG  = "FF1B4332";
const ROW_EVEN   = "FFF0F7F4";
const ROW_ODD    = "FFFFFFFF";

// ── Shared helpers ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyHeaderStyle(row: any) {
  row.eachCell((cell: any) => {
    cell.font  = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.border = {
      top:    { style: "thin" },
      left:   { style: "thin" },
      bottom: { style: "thin" },
      right:  { style: "thin" },
    };
    cell.alignment = { vertical: "middle" };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRowStyle(row: any, isEven: boolean) {
  row.eachCell({ includeEmpty: true }, (cell: any) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isEven ? ROW_EVEN : ROW_ODD },
    };
  });
}

function triggerDownload(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseMinutes(hhmm: string): number {
  const [h, m] = (hhmm || "09:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatHHMM(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function advanceWorkday(d: Date, includeWeekends: boolean): Date {
  const next = new Date(d);
  do {
    next.setDate(next.getDate() + 1);
  } while (!includeWeekends && (next.getDay() === 0 || next.getDay() === 6));
  return next;
}

// ── Save to XLSX ───────────────────────────────────────────────────────────────

export async function saveToXlsx(params: {
  activities: LearningActivity[];
  productName: string;
  programName: string;
  includeSchedule: boolean;
  startDate?: string;
  startTime?: string;
  timeZone?: string;
  includeWeekends?: boolean;
  defaultStartTime: string;
}): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  // ── Training Design sheet ──────────────────────────────────────────────────
  const ws = workbook.addWorksheet("Training Design");
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  applyHeaderStyle(ws.getRow(1));
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const product = params.productName || "Unnamed Product";
  const program = params.programName || "Unnamed Program";

  const sorted = [...params.activities].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return (a.dayOrder ?? 0) - (b.dayOrder ?? 0);
  });

  sorted.forEach((act, i) => {
    const row = ws.addRow({
      product,
      program,
      day: act.day,
      dayOrder: act.dayOrder ?? i + 1,
      chapter: act.chapter ?? "",
      moduleTitle: act.moduleTitle ?? "",
      objective: act.objective ?? "",
      cognitiveTask: act.cognitiveTask ?? "",
      learnerActivity: act.learnerActivity ?? "",
      deliveryMethod: act.deliveryMethod ?? "",
      media: act.media ?? "",
      contentType: act.contentType ?? "",
      duration: act.duration ?? 0,
      link: act.link ?? "",
      plan: act.plan ?? "",
      notes: act.notes ?? "",
      transferLevel: act.transferLevel ?? "",
      instructionalMode: act.instructionalMode ?? "",
      isBreak: act.isBreak ? "TRUE" : "FALSE",
      breakLabel: act.breakLabel ?? "",
    });
    applyRowStyle(row, i % 2 === 0);
  });

  // ── Schedule sheet (optional) ──────────────────────────────────────────────
  if (params.includeSchedule && params.startDate) {
    const sched = workbook.addWorksheet("Schedule");
    sched.columns = [
      { header: "Day",                key: "day",             width: 8  },
      { header: "Date",               key: "date",            width: 16 },
      { header: "Start Time",         key: "startTime",       width: 12 },
      { header: "End Time",           key: "endTime",         width: 12 },
      { header: "Unit",               key: "unit",            width: 26 },
      { header: "Module",             key: "module",          width: 26 },
      { header: "Learning Objective", key: "objective",       width: 36 },
      { header: "Learner Activity",   key: "learnerActivity", width: 30 },
      { header: "Duration",           key: "duration",        width: 10 },
      { header: "Time Zone",          key: "timeZone",        width: 16 },
    ];
    applyHeaderStyle(sched.getRow(1));
    sched.views = [{ state: "frozen", ySplit: 1 }];

    const includeWeekends = params.includeWeekends ?? false;
    let currentDate = new Date(params.startDate + "T00:00:00");

    // Advance start date off a weekend if needed
    if (!includeWeekends) {
      while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const days = [...new Set(sorted.map((a) => a.day))].sort((a, b) => a - b);
    const startTimeMins = parseMinutes(params.startTime || params.defaultStartTime);
    let schedRowIndex = 0;

    days.forEach((day, di) => {
      if (di > 0) currentDate = advanceWorkday(currentDate, includeWeekends);
      const dayActs = sorted.filter((a) => a.day === day);
      let cursor = startTimeMins;

      dayActs.forEach((act) => {
        const startT = act.isBreak ? "" : formatHHMM(cursor);
        const endT   = act.isBreak ? "" : formatHHMM(cursor + (act.duration || 0));
        if (!act.isBreak) cursor += act.duration || 0;

        const row = sched.addRow({
          day,
          date: formatDateLabel(currentDate),
          startTime: startT,
          endTime: endT,
          unit: act.chapter ?? "",
          module: act.moduleTitle ?? "",
          objective: act.objective ?? "",
          learnerActivity: act.isBreak
            ? (act.breakLabel || "Break")
            : (act.learnerActivity ?? ""),
          duration: act.duration ?? 0,
          timeZone: params.timeZone ?? "",
        });
        applyRowStyle(row, schedRowIndex % 2 === 0);
        schedRowIndex++;
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    buffer as ArrayBuffer,
    generateFileName(
      params.productName || "Unnamed_Product",
      params.programName || "Unnamed_Program",
      getFormattedUTCTimestamp()
    )
  );
}

// ── Load from XLSX ─────────────────────────────────────────────────────────────

export async function loadFromXlsx(file: File): Promise<{
  activities: LearningActivity[];
  productName: string;
  programName: string;
}> {
  const ExcelJS = (await import("exceljs")).default;
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const ws = workbook.worksheets[0];
  if (!ws) {
    throw new Error(
      "Invalid file format. Please use the Training Designer template or a previously saved file."
    );
  }

  // Build dynamic column map from header row
  const colMap: Record<string, number> = {};
  ws.getRow(1).eachCell((cell, colNum) => {
    const val = String(cell.value ?? "").trim();
    if (val) colMap[val] = colNum;
  });

  const REQUIRED = ["Day", "Unit (Main Topic)", "Module (Subtopic)"];
  if (!REQUIRED.some((h) => colMap[h] !== undefined)) {
    throw new Error(
      "Invalid file format. Please use the Training Designer template or a previously saved file."
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getCellStr(row: any, header: string): string {
    const colNum = colMap[header];
    if (colNum === undefined) return "";
    const val = row.getCell(colNum).value;
    if (val === null || val === undefined) return "";
    return String(val).trim();
  }

  const activities: LearningActivity[] = [];
  let productName = "";
  let programName = "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ws.eachRow((row: any, rowNum: number) => {
    if (rowNum === 1) return;
    const dayRaw = getCellStr(row, "Day");
    if (!dayRaw) return;
    const day = parseInt(dayRaw, 10);
    if (isNaN(day)) return;

    const duration  = parseFloat(getCellStr(row, "Duration")) || 0;
    const isBreakRaw = getCellStr(row, "Is Break");
    const isBreak   = ["TRUE", "true", "1"].includes(isBreakRaw);
    const dayOrderRaw = getCellStr(row, "Day Order");
    const dayOrder  = dayOrderRaw ? parseInt(dayOrderRaw, 10) : undefined;

    const product = getCellStr(row, "Product");
    const program = getCellStr(row, "Program");
    if (!productName && product) productName = product;
    if (!programName && program) programName = program;

    activities.push({
      day,
      chapter:          getCellStr(row, "Unit (Main Topic)"),
      moduleTitle:      getCellStr(row, "Module (Subtopic)"),
      objective:        getCellStr(row, "Learning Objective"),
      cognitiveTask:    getCellStr(row, "Cognitive Task"),
      learnerActivity:  getCellStr(row, "Learner Activity"),
      deliveryMethod:   getCellStr(row, "Delivery Method"),
      media:            getCellStr(row, "Media"),
      contentType:      getCellStr(row, "Content Type"),
      duration,
      link:             getCellStr(row, "Link") || undefined,
      plan:             getCellStr(row, "Plan") || undefined,
      notes:            getCellStr(row, "Notes") || undefined,
      transferLevel:    getCellStr(row, "Transfer Level") || undefined,
      instructionalMode: getCellStr(row, "Instructional Mode") || undefined,
      isBreak,
      breakLabel:       getCellStr(row, "Break Label") || undefined,
      dayOrder,
    });
  });

  return { activities, productName, programName };
}

// ── Download Template ──────────────────────────────────────────────────────────

export async function downloadTemplate(): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  // ── Training Design sheet with sample rows ─────────────────────────────────
  const ws = workbook.addWorksheet("Training Design");
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  applyHeaderStyle(ws.getRow(1));
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const SAMPLE_PRODUCT = "Sample Product";
  const SAMPLE_PROGRAM = "Sample Program";

  const sampleRows = [
    {
      product: SAMPLE_PRODUCT, program: SAMPLE_PROGRAM,
      day: 1, dayOrder: 1,
      chapter: "Product Knowledge",
      moduleTitle: "Introduction to the Product",
      objective: "Identify the key features of the product",
      cognitiveTask: "Remember",
      learnerActivity: "Lecture Participation",
      deliveryMethod: "Instructor-Led",
      media: "Slideshow",
      contentType: "Facts / Concepts",
      duration: 30,
      link: "", plan: "", notes: "", transferLevel: "", instructionalMode: "",
      isBreak: "FALSE", breakLabel: "",
    },
    {
      product: SAMPLE_PRODUCT, program: SAMPLE_PROGRAM,
      day: 1, dayOrder: 2,
      chapter: "Product Knowledge",
      moduleTitle: "Introduction to the Product",
      objective: "Explain how the product solves customer problems",
      cognitiveTask: "Explain",
      learnerActivity: "Q&A with Instructor / Expert",
      deliveryMethod: "Instructor-Led",
      media: "Slideshow",
      contentType: "Facts / Concepts",
      duration: 15,
      link: "", plan: "", notes: "", transferLevel: "", instructionalMode: "",
      isBreak: "FALSE", breakLabel: "",
    },
    {
      product: SAMPLE_PRODUCT, program: SAMPLE_PROGRAM,
      day: 2, dayOrder: 1,
      chapter: "System Navigation",
      moduleTitle: "Core Workflow",
      objective: "Demonstrate the end-to-end workflow in the system",
      cognitiveTask: "Apply",
      learnerActivity: "Software / Tool Practice",
      deliveryMethod: "Instructor-Led",
      media: "Live System / Application",
      contentType: "Procedural - Software / Tools",
      duration: 45,
      link: "", plan: "", notes: "", transferLevel: "", instructionalMode: "",
      isBreak: "FALSE", breakLabel: "",
    },
  ];

  sampleRows.forEach((data, i) => {
    applyRowStyle(ws.addRow(data), i % 2 === 0);
  });

  // ── Hidden Options sheet for Excel data validation ─────────────────────────
  const opts = workbook.addWorksheet("Options");
  opts.state = "hidden";

  const OPTIONS_COLS = [
    {
      header: "Cognitive Task",
      values: ["Remember", "Explain", "Apply", "Evaluate", "Create"],
    },
    {
      header: "Learner Activity",
      values: [
        "Lecture Participation", "Video / Recording Review", "Reading",
        "Podcast / Audio Review", "eLearning - Read, Watch, Listen",
        "eLearning - Interactive", "Q&A with Instructor / Expert",
        "Recap & Debrief", "Reflection", "Facilitated Group Activity",
        "Concept Mapping / Mind Mapping", "Pre-Training / Advance Organizer",
        "Worked Example Review", "eLearning - Simulate & Practice",
        "Software / Tool Practice", "Documentation Practice",
        "Job Aid & Reference Lookup Practice", "Shadowing & Job Observation",
        "Role Play / Mock Conversation", "Scenario-Based Exercise",
        "Live Group Discussion", "Asynchronous Group Discussion",
        "Peer Teaching", "Live Customer Practice", "Mentorship / Coaching",
        "Icebreaker / Community Building", "Knowledge Check", "Self Assessment",
        "Peer Assessment", "Procedural Skills Assessment",
        "Written Graded Assessment", "Graded Practice Conversation", "Learning Game",
      ],
    },
    {
      header: "Delivery Method",
      values: ["Instructor-Led", "Self-Paced", "On-the-Job Training", "Microlearning"],
    },
    {
      header: "Media",
      values: [
        "Text Document", "Spreadsheet", "Activity Sheet / Workbook",
        "Online Article / Web Page", "Slideshow", "Infographic / Visual Aid",
        "Audio Recording / Podcast", "Recorded Lecture", "Produced Instructional Video",
        "eLearning Module", "Quiz / Survey", "Live System / Application",
        "Digital Workspace / Notebook", "Collaborative Platform",
        "Discussion Channel", "Guest Speaker / SME Session", "VR / AR",
      ],
    },
    {
      header: "Content Type",
      values: [
        "Facts / Concepts", "Workflow - Operations / Admin / Support",
        "Procedural - Software / Tools", "Procedural - Communication Skills",
        "Problem-Solving - Software / Tools", "Problem-Solving - Communication Skills",
      ],
    },
    {
      header: "Transfer Level",
      values: ["Near Transfer", "Far Transfer"],
    },
    {
      header: "Instructional Mode",
      values: ["Receptive", "Directive", "Guided Discovery"],
    },
    {
      header: "Plan",
      values: [
        "Keep", "Remove", "Rebrand", "Minor Change", "Major Update",
        "Merge w/ Below", "Add to Above", "Split", "New Addition",
      ],
    },
  ];

  OPTIONS_COLS.forEach((col, ci) => {
    const colNum = ci + 1;
    const headerCell = opts.getCell(1, colNum);
    headerCell.value = col.header;
    headerCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    col.values.forEach((val, vi) => {
      opts.getCell(vi + 2, colNum).value = val;
    });
    opts.getColumn(colNum).width =
      Math.max(col.header.length, ...col.values.map((v) => v.length)) + 4;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as ArrayBuffer, "Training_Designer_Template.xlsx");
}
