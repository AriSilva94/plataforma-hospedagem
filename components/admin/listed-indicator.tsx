import { LuEye, LuEyeOff } from "react-icons/lu";

export function ListedIndicator({ listed, hiddenLabel }: { listed: boolean; hiddenLabel: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-sm text-(--gray)">
      {listed ? <LuEye aria-hidden="true" size={15} className="shrink-0 text-(--success)" /> : <LuEyeOff aria-hidden="true" size={15} className="shrink-0 text-(--warning)" />}
      {listed ? "Visível na home" : hiddenLabel}
    </p>
  );
}
