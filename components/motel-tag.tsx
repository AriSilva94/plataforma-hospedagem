import { LuHotel } from "react-icons/lu";

export function MotelTag() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-(--lavender)/40 bg-(--lavender-soft) px-2.5 py-1 text-xs font-bold text-(--lavender)">
      <LuHotel aria-hidden="true" size={13} />
      Motel
    </span>
  );
}
