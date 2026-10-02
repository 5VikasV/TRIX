import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.TRIX_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });

try {
  const hostContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  await host.goto(base);
  await host.evaluate(() => localStorage.setItem("trix.activeRoom", "ABCDE"));
  await host.reload();
  await host.getByRole("button", { name: "Create a room" }).waitFor();
  assert.equal(new URL(host.url()).pathname, "/", "A stale saved room must not bypass the lobby");
  await host.screenshot({ path: "/tmp/trix-lobby-desktop.png" });
  await host.getByLabel("YOUR NAME").fill("HOST");
  await host.getByRole("button", { name: "Create a room" }).click();
  await host.waitForURL(/\/room\/[A-HJ-NP-Z2-9]{5}$/);
  const code = new URL(host.url()).pathname.split("/").pop();
  assert.ok(code);
  await host.getByText("Waiting for a friend").waitFor();
  await host.reload();
  await host.getByText("Waiting for a friend").waitFor();
  assert.equal(new URL(host.url()).pathname, `/room/${code}`, "An explicit room URL must survive refresh");
  await host.screenshot({ path: "/tmp/trix-waiting-desktop.png" });
  await host.setViewportSize({ width: 390, height: 844 });
  await host.screenshot({ path: "/tmp/trix-waiting-mobile.png", fullPage: true });
  await host.setViewportSize({ width: 1440, height: 900 });

  await guest.goto(`${base}/join/${code}`);
  await guest.screenshot({ path: "/tmp/trix-invite-mobile.png" });
  await guest.getByLabel("YOUR NAME").fill("GUEST");
  await guest.getByRole("button", { name: "Join the match" }).click();
  await guest.waitForURL(new RegExp(`/room/${code}$`));
  await host.locator(".ultimate-board .cell").first().waitFor();
  await guest.locator(".ultimate-board .cell").first().waitFor();
  assert.equal(await host.locator(".ultimate-board .cell").count(), 81);

  const current = await host.locator(".match-panel .side-detail").filter({ hasText: "CURRENT TURN" }).locator("strong").textContent();
  const hostMark = await host.locator(".player-card").filter({ has: host.getByText("HOST", { exact: true }) }).locator(".player-token").textContent();
  assert.ok(hostMark === "X" || hostMark === "O", "The host receives a mark when the guest joins");
  assert.equal(await host.locator(".player-card").first().locator("strong").textContent(), "HOST", "Host must see their own card first");
  assert.equal(await guest.locator(".player-card").first().locator("strong").textContent(), "GUEST", "Guest must see their own card first");
  const guestMark = await guest.locator(".player-card").first().locator(".player-token").textContent();
  assert.equal(guestMark, hostMark === "X" ? "O" : "X", "Each player's first card must retain their assigned mark");
  assert.equal(await guest.locator(".player-card").last().locator(".player-token").textContent(), hostMark, "Opponent mark must agree in both views");
  const player = current === hostMark ? host : guest;
  await player.locator(".cell:not([disabled])").first().click();
  await host.waitForFunction(() => document.querySelectorAll(".cell.x,.cell.o").length === 1);

  await guest.reload();
  await guest.waitForFunction(() => document.querySelectorAll(".cell.x,.cell.o").length === 1);
  assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await guest.screenshot({ path: "/tmp/trix-game-mobile.png" });
  await host.screenshot({ path: "/tmp/trix-game-desktop.png" });
  for (const page of [host, guest]) {
    const geometry = await page.locator(".ultimate-board").evaluate((board) => {
      const boxes = [...board.querySelectorAll(".mini-board")].map(el => el.getBoundingClientRect());
      const cells = [...board.querySelectorAll(".cell")].map(el => el.getBoundingClientRect());
      return { squares: [...boxes, ...cells].every(r => Math.abs(r.width - r.height) < 1), equal: boxes.every(r => Math.abs(r.width - boxes[0].width) < 1 && Math.abs(r.height - boxes[0].height) < 1) };
    });
    assert.ok(geometry.squares, "All boards and cells must be square after a move");
    assert.ok(geometry.equal, "Active and inactive mini-boards must have equal dimensions");
  }
  const columns = await host.evaluate(() => ({
    players: document.querySelector(".players-panel").getBoundingClientRect(),
    arena: document.querySelector(".board-stage").getBoundingClientRect(),
    match: document.querySelector(".match-panel").getBoundingClientRect(),
    rail: document.querySelector(".players-rail").getBoundingClientRect(),
    status: document.querySelector(".match-status").getBoundingClientRect(),
  }));
  assert.ok(columns.players.right < columns.arena.left && columns.arena.right < columns.match.left, "Desktop arena must sit between both side panels");
  assert.ok(columns.arena.width >= 600, "Desktop arena must remain prominent");
  assert.ok(Math.abs(columns.arena.top - columns.rail.top) < 1, "Arena must begin at the top of the center rail");
  assert.ok(columns.status.right < columns.arena.left && columns.status.top > columns.players.bottom, "Match status must sit below Players in the left rail");

  for (const width of [320, 768, 1920]) {
    await guest.setViewportSize({ width, height: 1080 });
    assert.ok(await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No match overflow at ${width}px`);
    assert.ok(await guest.locator(".player-card").evaluateAll(cards => cards[0].getBoundingClientRect().bottom < cards[1].getBoundingClientRect().top), `Own card must stay above the opponent at ${width}px`);
    assert.ok(await guest.locator(".mini-board").evaluateAll(boards => boards.every(board => {
      const rect = board.getBoundingClientRect();
      return Math.abs(rect.width - rect.height) < 1;
    })), `Square mini-boards at ${width}px`);
  }
  await host.getByRole("button", { name: "Leave Match" }).click();
  await host.getByRole("dialog").waitFor();
  await host.screenshot({ path: "/tmp/trix-leave-desktop.png" });
  await host.setViewportSize({ width: 390, height: 844 });
  await host.screenshot({ path: "/tmp/trix-leave-mobile.png" });
  await host.getByRole("button", { name: "Leave match", exact: true }).click();
  await guest.getByText("Room unavailable").waitFor();
  await guest.getByRole("button", { name: "Return home" }).click();
  for (const width of [320, 390, 768, 1920]) {
    await guest.setViewportSize({ width, height: 844 });
    assert.ok(await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No lobby overflow at ${width}px`);
    if (width === 390) await guest.screenshot({ path: "/tmp/trix-lobby-mobile.png", fullPage: true });
  }
  console.log(`Browser smoke passed for room ${code}`);
} finally {
  await browser.close();
}
