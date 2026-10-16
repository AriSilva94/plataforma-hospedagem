import type { IconType } from "react-icons";
import {
  LuAirVent,
  LuAppWindow,
  LuArchive,
  LuBath,
  LuBedDouble,
  LuBedSingle,
  LuBlinds,
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
} from "react-icons/lu";
import type { propertyFeatures, roomAmenities, sharedAreaTypes } from "@/lib/properties";

export function iconOf(icons: Partial<Record<string, IconType>>, key: string): IconType {
  return icons[key] ?? LuCircleCheck;
}

export const roomAmenityIcons: Record<(typeof roomAmenities)[number], IconType> = {
  AIR_CONDITIONING: LuAirVent,
  FAN: LuWind,
  DOUBLE_BED: LuBedDouble,
  SINGLE_BED: LuBedSingle,
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
  SHARED_BATHROOM: LuBath,
  LAUNDRY: LuWashingMachine,
  OUTDOOR_AREA: LuTrees,
  GARAGE: LuWarehouse,
  OTHER: LuHouse,
};
