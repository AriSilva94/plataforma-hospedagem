import type { ReactNode } from "react";

const tones = {
  error: {
    role: "alert",
    className:
      "border-(--error)/35 bg-(--error-soft) text-(--error)",
  },
  success: {
    role: "status",
    className:
      "border-(--success)/35 bg-(--success-soft) text-(--success)",
  },
} as const;

export function FormFeedback({
  tone,
  children,
}: {
  tone: keyof typeof tones;
  children: ReactNode;
}) {
  const { role, className } = tones[tone];

  return (
    <p role={role} className={`rounded-xl border p-3 text-sm ${className}`}>
      {children}
    </p>
  );
}
