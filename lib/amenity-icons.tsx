import type { IconType } from "react-icons";
import {
  LuAirVent,
  LuAppWindow,
  LuArchive,
  LuBlinds,
  LuBriefcase,
  LuFlame,
  LuHeater,
  LuUtensils,
  LuVault,
  LuWaves,
  LuCamera,
  LuChefHat,
  LuCigarette,
  LuConciergeBell,
  LuDoorOpen,
  LuKeyRound,
  LuLampDesk,
  LuLayers,
  LuLock,
  LuPawPrint,
  LuReceipt,
  LuRefrigerator,
  LuSofa,
  LuSparkles,
  LuTrees,
  LuTv,
  LuAccessibility,
  LuDroplet,
  LuWarehouse,
  LuWashingMachine,
  LuWifi,
  LuWind,
  LuArrowUpDown,
  LuHouse,
  LuCircleCheck,
  LuBed,
  LuBedDouble,
  LuBedSingle,
  LuCrown,
} from "react-icons/lu";
import type { BedType, propertyFeatures, roomAmenities, sharedAreaTypes } from "@/lib/properties";

export const bedTypeIcons: Record<BedType, IconType> = {
  SINGLE: LuBedSingle,
  DOUBLE: LuBedDouble,
  QUEEN: LuBed,
  KING: LuCrown,
  BUNK: LuLayers,
  SOFA_BED: LuSofa,
};

export function iconOf(icons: Partial<Record<string, IconType>>, key: string): IconType {
  return icons[key] ?? LuCircleCheck;
}

export const roomAmenityIcons: Record<(typeof roomAmenities)[number], IconType> = {
  AIR_CONDITIONING: LuAirVent,
  FAN: LuWind,
  WARDROBE: LuArchive,
  DESK: LuLampDesk,
  TV: LuTv,
  MINIBAR: LuRefrigerator,
  WINDOW: LuAppWindow,
  BALCONY: LuDoorOpen,
  BLACKOUT_CURTAINS: LuBlinds,
  DOOR_LOCK: LuLock,
  BED_LINEN: LuLayers,
  TOWELS: LuDroplet,
  SAFE: LuVault,
  HAIR_DRYER: LuHeater,
};

export const propertyFeatureIcons: Record<(typeof propertyFeatures)[number], IconType> = {
  WIFI: LuWifi,
  ELEVATOR: LuArrowUpDown,
  DOORMAN: LuConciergeBell,
  GATED_ACCESS: LuKeyRound,
  SECURITY_CAMERAS: LuCamera,
  ACCESSIBILITY: LuAccessibility,
  PETS_ALLOWED: LuPawPrint,
  SMOKING_ALLOWED: LuCigarette,
  CLEANING_SERVICE: LuSparkles,
  UTILITIES_INCLUDED: LuReceipt,
};

export const sharedAreaTypeIcons: Record<(typeof sharedAreaTypes)[number], IconType> = {
  LIVING_ROOM: LuSofa,
  KITCHEN: LuChefHat,
  DINING_ROOM: LuUtensils,
  LAUNDRY: LuWashingMachine,
  BALCONY: LuDoorOpen,
  OUTDOOR_AREA: LuTrees,
  POOL: LuWaves,
  BARBECUE: LuFlame,
  GARAGE: LuWarehouse,
  OFFICE: LuBriefcase,
  OTHER: LuHouse,
};
