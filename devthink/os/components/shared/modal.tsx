"use client";

/* ==========================================================================
   Modal — wrapper fino do Radix Dialog com a estética do engine
   (overlay blur, .glass .card, riseIn). Usado por "criar projeto" e afins.
   ========================================================================== */

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="os-overlay" />
        <Dialog.Content className="glass os-dialog-content" aria-describedby={undefined}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-btn" aria-label="Fechar">
              <X size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </div>
          {description ? <Dialog.Description className="dlg-desc">{description}</Dialog.Description> : null}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
