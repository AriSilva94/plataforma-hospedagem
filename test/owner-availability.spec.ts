import { expect, test, type Page } from "@playwright/test";
import { parseIsoDate } from "@/lib/availability";
import {
  findSeedRoom,
  getOwnerAvailability,
  getPublicAvailability,
  loginAsOwner,
  ownerDayButton,
  replaceAvailability,
  type AvailabilityBody,
} from "./support/availability-api";

function addDays(isoDate: string, offset: number) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + offset);
  return date;
}

async function reveal(page: Page, date: Date) {
  const day = ownerDayButton(page, date);
  while (!(await day.isVisible())) await page.getByRole("button", { name: "Próximo mês", exact: true }).click();
  return day;
}

test.describe("disponibilidade do dono", () => {
  test.describe.configure({ mode: "serial" });

  let room: Awaited<ReturnType<typeof findSeedRoom>>;
  let owner: Awaited<ReturnType<typeof loginAsOwner>>;
  let today: string;
  let previous: AvailabilityBody;

  test.beforeAll(async () => {
    room = await findSeedRoom();
    owner = await loginAsOwner(room.ownerEmail);
    ({ today } = await getPublicAvailability(room.roomId));
    previous = await getOwnerAvailability(owner, room.roomId);
    await replaceAvailability(owner, room.roomId, { blockedWeekdays: [], blockedDates: [] });
  });

  test.afterAll(async () => {
    await replaceAvailability(owner, room.roomId, previous);
    await owner.dispose();
  });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies((await owner.storageState()).cookies);
    await page.goto(`/meus-imoveis/${room.propertyId}/quartos/${room.roomId}?secao=disponibilidade`);
  });

  test("bloqueia dias, salva e mantém após recarregar", async ({ page }) => {
    const save = page.getByRole("button", { name: "Salvar", exact: true });
    await expect(save).toBeDisabled();

    const single = await reveal(page, addDays(today, 5));
    await single.click();
    await expect(single).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("1 alteração não salva", { exact: true })).toBeVisible();

    let offset = 10;
    while (addDays(today, offset).getMonth() !== addDays(today, offset + 2).getMonth()) offset++;
    const rangeDays = [0, 1, 2].map((step) => addDays(today, offset + step));
    await reveal(page, rangeDays[0]);
    await ownerDayButton(page, rangeDays[0]).hover();
    await page.mouse.down();
    await ownerDayButton(page, rangeDays[1]).hover();
    await ownerDayButton(page, rangeDays[2]).hover();
    await page.mouse.up();
    for (const day of rangeDays) await expect(ownerDayButton(page, day)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("4 alterações não salvas", { exact: true })).toBeVisible();

    await save.click();
    await expect(page.getByText("Disponibilidade salva.")).toBeVisible();

    await page.reload();
    for (const day of [addDays(today, 5), ...rangeDays]) {
      await expect(await reveal(page, day)).toHaveAttribute("aria-pressed", "true");
    }
  });

  test("arrastar para dias fora do período não os bloqueia", async ({ page }) => {
    test.skip(parseIsoDate(today).getDate() === 1, "dia anterior a hoje não está no mesmo mês");
    const first = ownerDayButton(page, parseIsoDate(today));
    const past = ownerDayButton(page, addDays(today, -1));
    await first.hover();
    await page.mouse.down();
    await past.hover();
    await page.mouse.up();
    await expect(past).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByText("1 alteração não salva", { exact: true })).toBeVisible();
  });

  test("chip de dia da semana bloqueia todas as ocorrências e ignora toque", async ({ page }) => {
    const sunday = addDays(today, (7 - parseIsoDate(today).getDay()) % 7);
    await page.getByRole("button", { name: "Dom", exact: true }).click();
    const firstSunday = await reveal(page, sunday);

    const sundaysInMonth = Array.from({ length: 31 }, (_, index) => new Date(sunday.getFullYear(), sunday.getMonth(), index + 1)).filter(
      (day) => day.getMonth() === sunday.getMonth() && day.getDay() === 0,
    );
    for (const day of sundaysInMonth) await expect(ownerDayButton(page, day)).toHaveAttribute("aria-pressed", "true");

    await firstSunday.click();
    await expect(firstSunday).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Domingos estão bloqueados toda semana. Desmarque abaixo para liberar.")).toBeVisible();
  });

  test("descartar volta ao estado salvo", async ({ page }) => {
    const day = await reveal(page, addDays(today, 3));
    const wasBlocked = await day.getAttribute("aria-pressed");
    await day.click();
    await expect(day).not.toHaveAttribute("aria-pressed", wasBlocked ?? "false");
    await page.getByRole("button", { name: "Descartar", exact: true }).click();
    await expect(day).toHaveAttribute("aria-pressed", wasBlocked ?? "false");
    await expect(page.getByText("Nenhuma alteração", { exact: true })).toBeVisible();
  });
});
