import { test, expect } from "@playwright/test";
import { SetupTestUser } from "../helpers/testing-init";
import { RideFunctions } from "../helpers/ride-functions";
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context, page }) => {
  const setupTestUser = new SetupTestUser(page);
  await setupTestUser.resetDatabase();
  await setupTestUser.loginAsTestUser();
});

test("Created ride shows up in Your Rides", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page.getByRole("link", { name: "My Posts" }).click();
  await expect(page.getByText("Test User").first()).toBeVisible();
});
test("Delete Ride", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page.getByRole("link", { name: "My Posts" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Test User").first()).not.toBeVisible();
});
test("Edit Ride Destination", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page.getByRole("link", { name: "My Posts" }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("textbox", { name: "Heading to *" }).click();
  await page.getByRole("textbox", { name: "Heading to *" }).fill("Nashville");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Nashville")).toBeVisible();
});
