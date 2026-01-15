import { Page } from "@playwright/test";
export class SetupTestUser {
  constructor(private page: Page) {}

  async loginAsTestUser() {
    await this.page.goto("/api/auth/test-login");
    await this.page.goto("/feed");
  }
  async resetDatabase() {
    const response = await this.page.request.post("/api/test-utils/reset-db");
    if (!response.ok()) {
      throw new Error(`Database reset failed: ${response.status()}`);
    }
    await response.json();
  }
}
