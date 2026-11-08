import { z } from "@/lib/zod";

export const roomAvailabilitySchema = z.object({
  today: z.string(),
  windowEnd: z.string(),
  blockedWeekdays: z.array(z.number().int().min(0).max(6)),
  blockedDates: z.array(z.string()),
});

export type RoomAvailability = z.infer<typeof roomAvailabilitySchema>;

export const weekdayNames = ["Domingos", "Segundas", "Terças", "Quartas", "Quintas", "Sextas", "Sábados"];
export const weekdayShortLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isBlockedDay(day: Date, availability: RoomAvailability) {
  return availability.blockedWeekdays.includes(day.getDay()) || availability.blockedDates.includes(toIsoDate(day));
}

export function isOutsideWindow(day: Date, availability: RoomAvailability) {
  return day < parseIsoDate(availability.today) || day > parseIsoDate(availability.windowEnd);
}
