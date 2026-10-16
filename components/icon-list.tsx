import type { IconType } from "react-icons";

export function IconList({ items }: { items: { icon: IconType; label: string }[] }) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 text-sm text-(--text-secondary)">
          <Icon aria-hidden="true" size={16} className="shrink-0 text-(--primary-text)" />
          {label}
        </li>
      ))}
    </ul>
  );
}
