/**
 * modal.tsx — a thin Radix Dialog wrapper with the Windows float grammar:
 * the acrylic panel (rgb(36 36 36 / 80%) + saturate(3) blur(20px), 8px
 * corners, one flat elevation, p-6 padding) enters and exits on the
 * Windows cubic-bezier(.79,.14,.15,.86) slide-cum-fade — the mount state
 * keeps the panel in the DOM through the exit (the ShellChrome start-menu
 * recipe). Focus-visible keeps the var(--dt-blue) ring (global pass).
 * Used by "create project" and its siblings.
 */

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** the exit unmount delay: the 200ms exit transition plus one buffer frame. */
const EXIT_MS = 210;

/** the panel padding: the p-6 equivalent of the surface contract. */
const PANEL_PAD = 24;

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
  /* the Windows mount state: mounted keeps the panel rendered through the
     exit, visible flips one frame after the mount so the enter transition
     plays (the ShellChrome start-menu recipe) */
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (exitTimer.current !== null) {
        window.clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
      setMounted(true);
      return;
    }
    setVisible(false);
    exitTimer.current = window.setTimeout(() => setMounted(false), EXIT_MS);
  }, [open]);

  /* mounting flips the visible state one frame later (the enter transition) */
  useEffect(() => {
    if (!mounted || !open) return undefined;
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, open]);

  /* the exit timer never outlives the dialog */
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
    },
    [],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {mounted ? (
        <Dialog.Portal forceMount>
          <Dialog.Overlay className="os-overlay" forceMount data-open={visible ? "true" : "false"} />
          <Dialog.Content
            className="os-dialog-content"
            forceMount
            data-open={visible ? "true" : "false"}
            aria-describedby={undefined}
            style={{ padding: PANEL_PAD }}
          >
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Close className="icon-btn" aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </Dialog.Close>
            </div>
            {description ? <Dialog.Description className="dlg-desc">{description}</Dialog.Description> : null}
            {children}
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
