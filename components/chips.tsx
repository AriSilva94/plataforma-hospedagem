export function Chips({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full bg-(--surface-raised) px-3 py-1 text-xs font-semibold text-white">
          {item}
        </li>
      ))}
    </ul>
  );
}
