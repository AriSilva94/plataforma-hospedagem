import { expect, test } from "@playwright/test";

test("envia cabeçalhos de segurança e CSP com nonce por requisição", async ({ request }) => {
  const first = await request.get("/login");
  const second = await request.get("/login");
  const headers = first.headers();

  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();

  const csp = headers["content-security-policy"];
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(csp).not.toEqual(second.headers()["content-security-policy"]);

  const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
  const html = await first.text();
  expect(html).toContain(`nonce="${nonce}"`);
});

test("bloqueia script inline injetado na página", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Content Security Policy")) violations.push(message.text());
  });

  await page.goto("/login");
  const executed = await page.evaluate(async () => {
    const container = document.createElement("div");
    container.innerHTML = '<img src="/csp-check.png" onerror="window.cspCheck = true">';
    document.body.appendChild(container);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return (window as Window & { cspCheck?: boolean }).cspCheck === true;
  });

  expect(executed).toBe(false);
  expect(violations.length).toBeGreaterThan(0);
});
