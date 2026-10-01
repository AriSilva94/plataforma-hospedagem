"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function Modal({
  open,
  title,
  description,
  dismissible = true,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  dismissible?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-(--line-strong) bg-(--surface) p-0 text-white backdrop:bg-black/70"
    >
      <div className="flex flex-col gap-5 p-6">
        <div>
          <h2 id={titleId} className="text-lg font-bold">{title}</h2>
          {description ? <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-(--gray)">{description}</p> : null}
        </div>
        {children}
      </div>
    </dialog>
  );
}
