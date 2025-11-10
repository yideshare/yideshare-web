import { Page, expect } from "@playwright/test";
export class RideFunctions {
  constructor(private page: Page) {}

  getTodayDayNumber(): string {
    const today = new Date();
    return today.getDate().toString();
  }
  private async clickCalendarDay(date: Date) {
    const day = date.getDate();
    const exactDayLocator = this.page.getByRole("gridcell", {
      name: new RegExp(`^${day}$`),
    });
    if (await exactDayLocator.count()) {
      await exactDayLocator.first().click();
      return;
    }
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const fullDatePattern = new RegExp(
  `${monthName}\\s+${day}(?:st|nd|rd|th)?(?:,)?\\s+${year}`,
      "i"
    );
    await this.page
      .getByRole("gridcell", { name: fullDatePattern })
      .first()
      .click();
  }

  async selectDepartureDate(date: Date) {
    await this.page
      .getByRole("combobox", { name: /select departure date/i })
      .click();
    await this.clickCalendarDay(date);
    await this.page.keyboard.press("Escape");
  }
  async selectDepartureDateToday() {
    await this.selectDepartureDate(new Date());
  }

  async createValidRideViaPopup(date?: Date) {
    //temp: first fill in date in the top-bar because it's not yet in the ShareYideDialog
    await this.page
      .getByRole("combobox", { name: /select departure date/i })
      .click();
    await this.clickCalendarDay(date ?? new Date());
    await this.page.keyboard.press("Escape");
    const openBtn = this.page.getByRole("button", { name: /^post ride$/i });
    await openBtn.waitFor({ state: "visible" });
    await openBtn.click();

    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // await dialog
    //   .getByRole("textbox", { name: /organizer name/i })
    //   .fill("Bob Dylan");
    const nameInput = dialog.getByRole("textbox", { name: /organizer name/i });
    await expect(nameInput).toHaveAttribute("readonly", "");
    await expect(nameInput).toHaveValue(/.+/);

    await dialog.locator('input[type="tel"]').fill("+1 615 123 4567");

    const emailInput = dialog.getByRole("textbox", { name: /email address/i });
    await expect(emailInput).toHaveAttribute("readonly", "");
    await expect(emailInput).toHaveValue(/@/);
    
    await dialog
      .getByRole("textbox", { name: /leaving from \*/i })
      .fill("Vegas");
    await dialog.getByRole("textbox", { name: /heading to \*/i }).fill("Miami");

    await dialog.getByRole("combobox").nth(1).click();
    await this.page.getByRole("option", { name: "12:00 AM" }).click();

    await dialog.getByRole("combobox").filter({ hasText: /--:--/ }).click();
    await this.page.getByRole("option", { name: "01:00 AM" }).click();

    await dialog.getByText(/do you have your own car\?/i).click();
    await this.page.getByRole("option", { name: /^yes$/i }).click();

    await dialog
      .getByRole("spinbutton", { name: /number of open seats \*/i })
      .fill("4");

    await dialog.getByRole("button", { name: /^post ride$/i }).click();

    await expect(dialog).toBeHidden();
  }

  async fillNavBarMinusTime() {
    await this.page
      .getByRole("combobox", { name: /select departure date/i })
      .click();
    await this.clickCalendarDay(new Date());
    await this.page.keyboard.press("Escape");

    await this.page
      .getByRole("combobox", { name: /select departure location/i })
      .click();
    const departureInput = this.page
      .getByPlaceholder("Search or type to create…")
      .first();
    await departureInput.waitFor({ state: "visible" });
    await departureInput.fill("Vegas");
    await departureInput.press("Enter");
    await this.page.waitForLoadState("networkidle");

    await this.page
      .getByRole("combobox", { name: /select destination location/i })
      .click();
    const destinationInput = this.page
      .getByPlaceholder("Search or type to create…")
      .last();
    await destinationInput.waitFor({ state: "visible" });
    await destinationInput.fill("Miami");
    await destinationInput.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }
  async fillNavBarMinusTimeDayBeforeToday() {
    await this.page
      .getByRole("combobox", { name: /select departure date/i })
      .click();
    await this.clickCalendarDay(new Date(Date.now() - 86400000));
    await this.page.keyboard.press("Escape");

    await this.page
      .getByRole("combobox", { name: /select departure location/i })
      .click();
    const departureInput = this.page
      .getByPlaceholder("Search or type to create…")
      .first();
    await departureInput.waitFor({ state: "visible" });
    await departureInput.fill("Vegas");
    await departureInput.press("Enter");
    await this.page.waitForLoadState("networkidle");

    await this.page
      .getByRole("combobox", { name: /select destination location/i })
      .click();
    const destinationInput = this.page
      .getByPlaceholder("Search or type to create…")
      .last();
    await destinationInput.waitFor({ state: "visible" });
    await destinationInput.fill("Miami");
    await destinationInput.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }
}
