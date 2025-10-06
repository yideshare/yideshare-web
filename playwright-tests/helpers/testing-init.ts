import { Page } from "@playwright/test";
export class SetupTestUser {
  constructor(private page: Page) {}

  async loginAsTestUser() {
    const secret = process.env.DEV_TEST_LOGIN_SECRET!;
    console.log(process.env.DEV_TEST_LOGIN_SECRET);
    const resp = await this.page.request.get("/api/auth/test-login", {
      headers: { "x-dev-login-secret": secret },
    });
    await this.page.goto("/feed");
  }

  async resetDatabase() {
    await this.page.request.post("/api/test-utils/reset-db", {
      headers: { "x-test-utils-secret": process.env.PLAYWRIGHT_SECRET ?? "" },
    });
  }
}
