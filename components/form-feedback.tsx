import type { ReactNode } from "react";

const tones = {
  error: {
    role: "alert",
    className:
      "border-(--danger)/35 bg-(--danger)/12 text-(--danger-soft)",
  },
  success: {
    role: "status",
    className:
      "border-(--success)/35 bg-(--success)/12 text-(--success-soft)",
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
