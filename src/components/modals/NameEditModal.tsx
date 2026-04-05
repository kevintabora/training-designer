"use client";

import { useState, useEffect } from "react";
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

interface NameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NameEditModal({ isOpen, onClose }: NameEditModalProps) {
  const currentProductName = useAppStore((s) => s.currentProductName);
  const currentProgramName = useAppStore((s) => s.currentProgramName);
  const setProductName = useAppStore((s) => s.setProductName);
  const setProgramName = useAppStore((s) => s.setProgramName);

  const [product, setProduct] = useState(currentProductName);
  const [program, setProgram] = useState(currentProgramName);

  useEffect(() => {
    if (isOpen) {
      setProduct(currentProductName);
      setProgram(currentProgramName);
    }
  }, [isOpen, currentProductName, currentProgramName]);

  function handleSave() {
    setProductName(product.trim());
    setProgramName(program.trim());
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--ink-primary)" }}>Program Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div>
            <Label htmlFor="productName" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
              Product Name <span style={{ color: "var(--ink-tertiary)" }}>(max 50 chars)</span>
            </Label>
            <Input
              id="productName"
              value={product}
              maxLength={50}
              onChange={(e) => setProduct(e.target.value)}
              className="mt-1"
              placeholder="e.g., Salesforce CRM"
              style={{ fontSize: "var(--text-base)" }}
            />
          </div>

          <div>
            <Label htmlFor="programName" style={{ color: "var(--ink-secondary)", fontSize: "var(--text-sm)" }}>
              Training Program <span style={{ color: "var(--ink-tertiary)" }}>(max 70 chars)</span>
            </Label>
            <Input
              id="programName"
              value={program}
              maxLength={70}
              onChange={(e) => setProgram(e.target.value)}
              className="mt-1"
              placeholder="e.g., New Hire Onboarding"
              style={{ fontSize: "var(--text-base)" }}
            />
          </div>
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
