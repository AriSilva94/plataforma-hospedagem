const tones = {
  success: "border-(--success)/38 bg-(--success)/10 text-(--success)",
  warning: "border-(--warning)/38 bg-(--warning)/10 text-(--warning)",
  neutral: "border-(--line-strong) bg-(--surface-raised) text-(--gray)",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof tones; children: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
