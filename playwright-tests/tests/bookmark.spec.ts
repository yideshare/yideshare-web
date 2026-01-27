import { test, expect } from "@playwright/test";
import { SetupTestUser } from "../helpers/testing-init";
import { RideFunctions } from "../helpers/ride-functions";
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context, page }) => {
  const setupTestUser = new SetupTestUser(page);
  await setupTestUser.resetDatabase();
  await setupTestUser.loginAsTestUser();
});

export async function bookmarkAndCheckSaved(page: any) {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page.getByRole("button").nth(3).click();
  await page.getByRole("button").nth(3).click();
  await page.getByRole("link", { name: "Saved Rides" }).click();
}

test("Bookmark a ride, shows up in Saved Rides", async ({ page }) => {
  await bookmarkAndCheckSaved(page);
  await expect(page.getByText("Test User")).toBeVisible();
});
test("Unbookmark a ride, does not show up in Saved Rides", async ({ page }) => {
  await bookmarkAndCheckSaved(page);

  await page.getByRole("button").nth(1).click();
  await expect(page.getByText("Test User")).not.toBeVisible();
});
