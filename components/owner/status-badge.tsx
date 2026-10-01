const tones = {
  success: "border-[rgba(47,191,135,.38)] bg-[rgba(47,191,135,.1)] text-(--success)",
  warning: "border-[rgba(232,177,58,.38)] bg-[rgba(232,177,58,.1)] text-(--warning)",
  neutral: "border-(--line-strong) bg-(--surface-raised) text-(--gray)",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof tones; children: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
