import { expect, test } from "@playwright/test";
import {
  findSeedRoom,
  getPublicAvailability,
  loginAsOwner,
  replaceAvailability,
} from "./support/availability-api";

const dateLabelFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric" });

function addDays(isoDate: string, offset: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day + offset);
}

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

test.describe("disponibilidade do quarto", () => {
  let room: Awaited<ReturnType<typeof findSeedRoom>>;
  let owner: Awaited<ReturnType<typeof loginAsOwner>>;
  let availability: Awaited<ReturnType<typeof getPublicAvailability>>;

  test.beforeAll(async () => {
    room = await findSeedRoom();
    owner = await loginAsOwner(room.ownerEmail);
    availability = await getPublicAvailability(room.roomId);
    await replaceAvailability(owner, room.roomId, { blockedWeekdays: [], blockedDates: [toIso(addDays(availability.today, 9))] });
  });

  test.afterAll(async () => {
    await replaceAvailability(owner, room.roomId, { blockedWeekdays: [], blockedDates: [] });
    await owner.dispose();
  });

  test("calendário do quarto desabilita dias bloqueados e encerra o intervalo no primeiro bloqueio", async ({ page }) => {
    const dayButton = (offset: number) => page.getByRole("button", { name: dateLabelFormatter.format(addDays(availability.today, offset)) });

    await page.goto(`/imoveis/${room.propertyId}/quartos/${room.roomId}`);
    await page.getByRole("button", { name: /Check-in/ }).click();

    await expect(dayButton(9)).toBeDisabled();
    await expect(dayButton(8)).toBeEnabled();

    await dayButton(7).click();
    await expect(dayButton(8)).toBeEnabled();
    await expect(dayButton(9)).toBeDisabled();
    await expect(dayButton(10)).toBeDisabled();

    const nextMonth = page.getByRole("button", { name: "Próximo mês" });
    for (let step = 0; step < 14 && (await nextMonth.isEnabled()); step += 1) {
      await nextMonth.click();
    }
    await expect(nextMonth).toBeDisabled();
  });
});
