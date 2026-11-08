import { expect, test } from "@playwright/test";
import { parseIsoDate, toIsoDate } from "@/lib/availability";
import {
  dayButton,
  findSeedRoom,
  getOwnerAvailability,
  getPublicAvailability,
  loginAsOwner,
  replaceAvailability,
  type AvailabilityBody,
} from "./support/availability-api";

function addDays(isoDate: string, offset: number) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + offset);
  return date;
}

test.describe("disponibilidade do quarto", () => {
  let room: Awaited<ReturnType<typeof findSeedRoom>>;
  let owner: Awaited<ReturnType<typeof loginAsOwner>>;
  let availability: Awaited<ReturnType<typeof getPublicAvailability>>;
  let previous: AvailabilityBody;

  test.beforeAll(async () => {
    room = await findSeedRoom();
    owner = await loginAsOwner(room.ownerEmail);
    availability = await getPublicAvailability(room.roomId);
    previous = await getOwnerAvailability(owner, room.roomId);
    await replaceAvailability(owner, room.roomId, { blockedWeekdays: [], blockedDates: [toIsoDate(addDays(availability.today, 9))] });
  });

  test.afterAll(async () => {
    await replaceAvailability(owner, room.roomId, previous);
    await owner.dispose();
  });

  test("calendário do quarto desabilita dias bloqueados e encerra o intervalo no primeiro bloqueio", async ({ page }) => {
    const day = (offset: number) => dayButton(page, addDays(availability.today, offset));

    await page.goto(`/imoveis/${room.propertyId}/quartos/${room.roomId}`);
    await page.getByRole("button", { name: /Check-in/ }).click();

    await expect(day(9)).toBeDisabled();
    await expect(day(8)).toBeEnabled();

    await day(7).click();
    await expect(day(8)).toBeEnabled();
    await expect(day(9)).toBeDisabled();
    await expect(day(10)).toBeDisabled();

    const nextMonth = page.getByRole("button", { name: "Próximo mês" });
    for (let step = 0; step < 14 && (await nextMonth.isEnabled()); step += 1) {
      await nextMonth.click();
    }
    await expect(nextMonth).toBeDisabled();
  });
});
