"use client";

import { useState } from "react";
import MobileNotice from "@/components/layout/MobileNotice";
import Toolbar from "@/components/layout/Toolbar";
import DialogOverlay from "@/components/modals/DialogOverlay";
import SelectionTally from "@/components/layout/SelectionTally";
import SavingOverlay from "@/components/layout/SavingOverlay";
import LoadingOverlay from "@/components/layout/LoadingOverlay";
import NameEditModal from "@/components/modals/NameEditModal";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [nameEditOpen, setNameEditOpen] = useState(false);
  const [isSaving] = useState(false);

  return (
    <>
      {/* Mobile notice — shown on screens < lg */}
      <MobileNotice />

      {/* Sticky top toolbar */}
      <Toolbar />

      {/* Main content — offset by toolbar height */}
      <main
        id="mainContent"
        style={{ paddingTop: 52, minHeight: "100vh" }}
      >
        {children}
      </main>

      {/* Global dialogs & overlays */}
      <DialogOverlay />
      <NameEditModal isOpen={nameEditOpen} onClose={() => setNameEditOpen(false)} />

      {/* Selection tally — rendered hidden until rows selected (Phase 3) */}
      <SelectionTally count={0} totalMinutes={0} />

      {/* Saving overlay */}
      <SavingOverlay isVisible={isSaving} />

      {/* Loading overlay — dismisses itself after 300ms */}
      <LoadingOverlay />
    </>
  );
}
