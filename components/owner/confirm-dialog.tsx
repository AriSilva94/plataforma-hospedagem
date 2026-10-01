"use client";

import { Modal } from "@/components/owner/modal";
import { dangerButtonClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel = "Aguarde...",
  cancelLabel = "Cancelar",
  tone = "danger",
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} title={title} description={description} dismissible={!pending} onClose={onCancel}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" autoFocus disabled={pending} onClick={onCancel} className={secondaryButtonClassName}>
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className={tone === "danger" ? dangerButtonClassName : primaryButtonClassName}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
