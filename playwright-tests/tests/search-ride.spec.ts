import { test, expect } from "@playwright/test";
import { SetupTestUser } from "../helpers/testing-init";
import { RideFunctions } from "../helpers/ride-functions";
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context, page }) => {
  const setupTestUser = new SetupTestUser(page);
  await setupTestUser.resetDatabase();
  await setupTestUser.loginAsTestUser();
});

test("Search Ride - exact posting time", async ({ page }) => {
  await helper(page, "12:00 AM", "01:00 AM");
  await expect(page.getByText("Test User")).toBeVisible({ timeout: 10000 });
});

test("Search Ride - time in range (within 15 minutes)", async ({ page }) => {
  await helper(page, "12:15 AM", "01:15 AM");
  await expect(page.getByText("Test User")).toBeVisible({ timeout: 10000 });
});

test("Search Ride - time overlapping window", async ({ page }) => {
  await helper(page, "12:15 AM", "12:45 AM");
  await expect(page.getByText("Test User")).toBeVisible({ timeout: 10000 });
});

test("Search Ride - time out of range", async ({ page }) => {
  await helper(page, "01:15 AM", "02:15 AM");
  await expect(page.getByText("Test User")).toBeHidden();
});

test("Search Ride - from only filter", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page
    .getByRole("combobox", { name: /select departure location/i })
    .click();
  const departureInput = page
    .getByPlaceholder("Search or type to create…")
    .first();
  await departureInput.fill("Vegas");
  await departureInput.press("Enter");

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - to only filter", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await page
    .getByRole("combobox", { name: /select destination location/i })
    .click();
  const destinationInput = page
    .getByPlaceholder("Search or type to create…")
    .last();
  await destinationInput.fill("Miami");
  await destinationInput.press("Enter");

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - date only filter (today)", async ({ page }) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await rideFunctions.selectDepartureDateToday();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - time only equal start=end treated as point-in-time", async ({
  page,
}) => {
  await helper(page, "12:30 AM", "12:30 AM");
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - time window without date (across all dates)", async ({
  page,
}) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();

  // Only set time window, no date or location
  await page.getByRole("combobox").filter({ hasText: "Select time" }).click();
  await page
    .getByRole("combobox", { name: "Select earliest departure time" })
    .click();
  await page.getByRole("option", { name: "12:00 AM" }).click();

  await page
    .getByRole("combobox", { name: "Select latest departure time" })
    .click();
  await page.getByRole("option", { name: "01:00 AM" }).click();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - only start time (end defaults to 11:59 PM)", async ({
  page,
}) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();

  // Only set start time, end time should default to 11:59 PM
  await page.getByRole("combobox").filter({ hasText: "Select time" }).click();
  await page
    .getByRole("combobox", { name: "Select earliest departure time" })
    .click();
  await page.getByRole("option", { name: "12:00 AM" }).click();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

test("Search Ride - only end time (start defaults to 12:00 AM)", async ({
  page,
}) => {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();

  // Only set end time, start time should default to 12:00 AM
  await page.getByRole("combobox").filter({ hasText: "Select time" }).click();
  await page
    .getByRole("combobox", { name: "Select latest departure time" })
    .click();
  await page.getByRole("option", { name: "01:00 AM" }).click();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Test User")).toBeVisible();
});

async function helper(page: any, startTime: string, endTime: string) {
  const rideFunctions = new RideFunctions(page);
  await rideFunctions.createValidRideViaPopup();
  await rideFunctions.fillNavBarMinusTime();

  await page.getByRole("combobox").filter({ hasText: "Select time" }).click();
  await page
    .getByRole("combobox", { name: "Select earliest departure time" })
    .click();
  await page.getByRole("option", { name: startTime }).click();

  await page
    .getByRole("combobox", { name: "Select latest departure time" })
    .click();
  await page.getByRole("option", { name: endTime }).click();
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByRole("button", { name: "Clear" })).toBeVisible();
}

