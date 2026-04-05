"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIME_ZONES } from "@/config/field-options";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleModal({ isOpen, onClose }: ScheduleModalProps) {
  const [addDateTime, setAddDateTime] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [timeZone, setTimeZone] = useState("UTC-05:00");
  const [includeWeekends, setIncludeWeekends] = useState(false);

  function handleSave() {
    // stub — wired in Phase 3
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--ink-primary)" }}>Schedule Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="addDateTime"
              checked={addDateTime}
              onCheckedChange={(v) => setAddDateTime(!!v)}
            />
            <Label htmlFor="addDateTime" style={{ color: "var(--ink-primary)", fontSize: "var(--text-sm)", cursor: "pointer" }}>
              Add Date &amp; Time
            </Label>
          </div>

          {addDateTime && (
            <>
              <div>
                <Label htmlFor="schedDate" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
                  Date
                </Label>
                <Input
                  id="schedDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                  style={{ fontSize: "var(--text-base)" }}
                />
              </div>

              <div>
                <Label htmlFor="schedTime" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
                  Time
                </Label>
                <Input
                  id="schedTime"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1"
                  style={{ fontSize: "var(--text-base)" }}
                />
              </div>

              <div>
                <Label style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
                  Time Zone
                </Label>
                <Select value={timeZone} onValueChange={(v) => { if (v !== null) setTimeZone(v); }}>
                  <SelectTrigger className="mt-1" style={{ fontSize: "var(--text-base)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_ZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value} style={{ fontSize: "var(--text-sm)" }}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeWeekends"
                  checked={includeWeekends}
                  onCheckedChange={(v) => setIncludeWeekends(!!v)}
                />
                <Label htmlFor="includeWeekends" style={{ color: "var(--ink-primary)", fontSize: "var(--text-sm)", cursor: "pointer" }}>
                  Include Weekends
                </Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} style={{ fontSize: "var(--text-sm)" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontSize: "var(--text-sm)",
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
