"use client";

import { useDialogStore } from "@/store/useDialogStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TYPE_ICON: Record<string, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
};

export default function DialogOverlay() {
  const { isOpen, type, title, message, buttons, showInput, inputPlaceholder, inputValue, close, setInputValue } =
    useDialogStore();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent style={{ fontFamily: "var(--font-jakarta), sans-serif", maxWidth: 420 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: "var(--ink-primary)" }}>
            <span>{TYPE_ICON[type]}</span>
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-1">
          <p style={{ color: "var(--ink-secondary)", fontSize: "var(--text-base)", lineHeight: 1.6 }}>
            {message}
          </p>
          {showInput && (
            <Input
              className="mt-3"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ fontSize: "var(--text-base)" }}
            />
          )}
        </div>

        {buttons.length > 0 && (
          <DialogFooter>
            {buttons.map((btn, i) => {
              const isPrimary = btn.variant === "primary";
              const isDanger = btn.variant === "danger";
              return (
                <Button
                  key={i}
                  variant={isPrimary || isDanger ? "default" : "outline"}
                  onClick={() => { btn.onClick(); close(); }}
                  style={{
                    fontSize: "var(--text-sm)",
                    ...(isPrimary && { backgroundColor: "var(--accent)", color: "#fff" }),
                    ...(isDanger && { backgroundColor: "#dc2626", color: "#fff" }),
                  }}
                >
                  {btn.label}
                </Button>
              );
            })}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
