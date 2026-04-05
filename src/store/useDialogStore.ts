"use client";

import { create } from "zustand";

export interface DialogButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface DialogConfig {
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  buttons: DialogButton[];
  showInput?: boolean;
  inputPlaceholder?: string;
  inputDefaultValue?: string;
}

interface DialogStore {
  isOpen: boolean;
  type: "info" | "warning" | "error";
  title: string;
  message: string;
  buttons: DialogButton[];
  showInput: boolean;
  inputPlaceholder: string;
  inputValue: string;
  open: (config: DialogConfig) => void;
  close: () => void;
  setInputValue: (value: string) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  type: "info",
  title: "",
  message: "",
  buttons: [],
  showInput: false,
  inputPlaceholder: "",
  inputValue: "",

  open: (config) =>
    set({
      isOpen: true,
      type: config.type,
      title: config.title,
      message: config.message,
      buttons: config.buttons,
      showInput: config.showInput ?? false,
      inputPlaceholder: config.inputPlaceholder ?? "",
      inputValue: config.inputDefaultValue ?? "",
    }),

  close: () => set({ isOpen: false }),

  setInputValue: (value) => set({ inputValue: value }),
}));

export function useDialog() {
  const open = useDialogStore((s) => s.open);
  const close = useDialogStore((s) => s.close);
  return { open, close };
}
