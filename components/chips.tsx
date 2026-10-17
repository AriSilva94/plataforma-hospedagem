export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-(--border-accent) bg-(--surface-accent) px-3 py-1 text-xs font-semibold text-(--primary-text)">
          {item}
        </li>
      ))}
    </ul>
  );
}
