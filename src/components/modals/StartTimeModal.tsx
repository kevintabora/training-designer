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
import { useAppStore } from "@/store/useAppStore";

interface StartTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartTimeModal({ isOpen, onClose }: StartTimeModalProps) {
  const defaultStartTime = useAppStore((s) => s.defaultStartTime);
  const setDefaultStartTime = useAppStore((s) => s.setDefaultStartTime);
  const [time, setTime] = useState(defaultStartTime);

  function handleSave() {
    setDefaultStartTime(time);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--ink-primary)" }}>Default Start Time</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="startTime" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
            Start Time
          </Label>
          <Input
            id="startTime"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1"
            style={{ fontSize: "var(--text-base)" }}
          />
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
