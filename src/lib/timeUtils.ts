import { LearningActivity } from "@/types";

/** Parse "HH:MM" into total minutes from midnight */
function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Format total minutes from midnight into "h:MM AM/PM" */
export function formatTime(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export interface TimeSlot {
  start: string;
  end: string;
}

/**
 * Given all activities for a single day (in order) and the default start time,
 * returns an array of TimeSlot objects. Break rows get empty strings.
 * Breaks are SKIPPED — they do not advance the clock.
 */
export function calcDayTimes(
  dayActivities: LearningActivity[],
  defaultStartTime: string
): TimeSlot[] {
  let cursor = parseMinutes(defaultStartTime);
  return dayActivities.map((act) => {
    if (act.isBreak) return { start: "", end: "" };
    const start = cursor;
    const end = cursor + (act.duration || 0);
    cursor = end;
    return { start: formatTime(start), end: formatTime(end) };
  });
}
