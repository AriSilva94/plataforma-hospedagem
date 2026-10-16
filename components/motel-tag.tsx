import { LuHotel } from "react-icons/lu";

export function MotelTag() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-(--border) bg-(--surface-raised) px-2.5 py-1 text-xs font-bold text-(--text-secondary)">
      <LuHotel aria-hidden="true" size={13} />
      Motel
    </span>
  );
}
