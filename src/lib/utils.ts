import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getFormattedUTCTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateFileName(
  product: string,
  program: string,
  timestamp: string
): string {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
  return `${clean(product)}_${clean(program)}_${timestamp}.xlsx`;
}
