export function OptionalTag() {
  return <span className="font-normal text-(--gray)/80"> (opcional)</span>;
}

export function FieldHint({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1 text-xs leading-relaxed text-(--gray)">
      {children}
    </p>
  );
}

export function CharacterCount({ id, length, max }: { id: string; length: number; max: number }) {
  return (
    <p id={id} className={`mt-1 text-right text-xs tabular-nums ${length > max ? "text-(--danger)" : "text-(--gray)"}`}>
      {length}/{max}
    </p>
  );
}
