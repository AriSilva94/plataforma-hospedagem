import type { IconType } from "react-icons";
import { LuBuilding2, LuHotel, LuHouse } from "react-icons/lu";
import { type PropertyType, propertyTypeLabels } from "@/lib/properties";

export const propertyTypeIcons: Record<PropertyType, IconType> = {
  HOUSE: LuHouse,
  APARTMENT: LuBuilding2,
  MOTEL: LuHotel,
};

const tagClassNames: Record<PropertyType, string> = {
  HOUSE: "border-(--terracotta)/40 bg-(--terracotta-soft) text-(--terracotta)",
  APARTMENT: "border-(--champagne)/40 bg-(--champagne-soft) text-(--champagne)",
  MOTEL: "border-(--lavender)/40 bg-(--lavender-soft) text-(--lavender)",
};

export function PropertyTypeTag({ type }: { type: PropertyType }) {
  const Icon = propertyTypeIcons[type];

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${tagClassNames[type]}`}>
      <Icon aria-hidden="true" size={13} />
      {propertyTypeLabels[type]}
    </span>
  );
}
