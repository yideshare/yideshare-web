import { test, expect } from "@playwright/test";
import { SetupTestUser } from "../helpers/testing-init";
import { RideFunctions } from "../helpers/ride-functions";
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context, page }) => {
  const setupTestUser = new SetupTestUser(page);
  await setupTestUser.resetDatabase();
  await setupTestUser.loginAsTestUser();
});

test("Correct buttons exist", async ({ page }) => {
  await expect(
    page.locator("label").filter({ hasText: "Leaving from" })
  ).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Going to" })
  ).toBeVisible();
  await expect(page.locator("label").filter({ hasText: "Date" })).toBeVisible();
  await expect(
    page.locator("label").filter({ hasText: "Departure Time Range (EST)" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Post Ride" })).toBeVisible();
});
test("Popup appears when clicking Post Ride", async ({ page }) => {
  await page.getByRole("button", { name: "Post Ride" }).click();
  await expect(
    page.getByRole("heading", { name: "Share a Ride" })
  ).toBeVisible();
  await expect(
    page.locator("div").filter({ hasText: /^Post Ride$/ })
  ).toBeVisible();
});
test("Create Valid Ride", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await expect(page.getByRole("link", { name: "Yideshare" })).toBeVisible();
  await expect(page.getByText("Test User")).toBeVisible();
});
//TODO: create invalid ride tests
