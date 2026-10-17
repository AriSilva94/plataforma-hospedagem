const tones = {
  success: "border-(--success)/38 bg-(--success-soft) text-(--success)",
  warning: "border-(--warning)/38 bg-(--warning-soft) text-(--warning)",
  danger: "border-(--error)/38 bg-(--error-soft) text-(--error)",
  neutral: "border-(--border) bg-(--surface-raised) text-(--text-secondary)",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof tones; children: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
