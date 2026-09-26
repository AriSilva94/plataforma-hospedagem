import type { ReactNode } from "react";

const tones = {
  error: {
    role: "alert",
    className:
      "border-[rgba(229,98,75,.35)] bg-[rgba(229,98,75,.12)] text-[#ff9b8a]",
  },
  success: {
    role: "status",
    className:
      "border-[rgba(47,191,135,.35)] bg-[rgba(47,191,135,.12)] text-[#7be0b6]",
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
