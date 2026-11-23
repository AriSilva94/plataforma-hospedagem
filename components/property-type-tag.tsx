import type { IconType } from "react-icons";
import { LuBuilding2, LuHotel, LuHouse } from "react-icons/lu";
import { type PropertyType, propertyTypeLabels } from "@/lib/properties";

export const propertyTypeIcons: Record<PropertyType, IconType> = {
  HOUSE: LuHouse,
  APARTMENT: LuBuilding2,
  MOTEL: LuHotel,
};

export const propertyTypeColorClassNames: Record<PropertyType, string> = {
  HOUSE: "border-(--terracotta)/40 bg-(--terracotta-soft) text-(--terracotta)",
  APARTMENT: "border-(--champagne)/40 bg-(--champagne-soft) text-(--champagne)",
  MOTEL: "border-(--lavender)/40 bg-(--lavender-soft) text-(--lavender)",
};

export function PropertyTypeTag({ type, compact = false }: { type: PropertyType; compact?: boolean }) {
  const Icon = propertyTypeIcons[type];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border font-bold ${compact ? "-my-0.75 px-3 py-0.5 align-top text-[13px] leading-5" : "px-2.5 py-1 text-xs"} ${propertyTypeColorClassNames[type]}`}
    >
      <Icon aria-hidden="true" size={compact ? 15 : 13} />
      {propertyTypeLabels[type]}
    </span>
  );
}
