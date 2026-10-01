export function CompletenessMeter({ score, label = "Completude do anúncio" }: { score: number; label?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-(--gray)">{label}</span>
        <span className="font-bold text-white">{score}%</span>
      </div>
      <progress
        value={score}
        max={100}
        aria-label={label}
        className="mt-2 block h-2 w-full appearance-none overflow-hidden rounded-full bg-(--surface-raised) [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-(--blue-light) [&::-webkit-progress-bar]:bg-(--surface-raised) [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-(--blue-light)"
      />
    </div>
  );
}
