import type { IconType } from "react-icons";
import { LuBuilding2, LuHotel, LuHouse } from "react-icons/lu";
import { type PropertyType, propertyTypeLabels } from "@/lib/properties";

const tagStyles: Record<PropertyType, { icon: IconType; className: string }> = {
  HOUSE: { icon: LuHouse, className: "border-(--terracotta)/40 bg-(--terracotta-soft) text-(--terracotta)" },
  APARTMENT: { icon: LuBuilding2, className: "border-(--champagne)/40 bg-(--champagne-soft) text-(--champagne)" },
  MOTEL: { icon: LuHotel, className: "border-(--lavender)/40 bg-(--lavender-soft) text-(--lavender)" },
};

export function PropertyTypeTag({ type }: { type: PropertyType }) {
  const { icon: Icon, className } = tagStyles[type];

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>
      <Icon aria-hidden="true" size={13} />
      {propertyTypeLabels[type]}
    </span>
  );
}
