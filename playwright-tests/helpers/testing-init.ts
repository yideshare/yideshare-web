import { Page } from "@playwright/test";
export class SetupTestUser {
  constructor(private page: Page) {}

  async loginAsTestUser() {
    const secret = process.env.DEV_TEST_LOGIN_SECRET!;
    console.log(process.env.DEV_TEST_LOGIN_SECRET);
    const resp = await this.page.request.get("/api/auth/test-login", {
      headers: { "x-dev-login-secret": secret },
    });
    console.log("login status", resp.status());
    console.log("login location", resp.headers()["location"]);
    console.log("set-cookie", resp.headers()["set-cookie"]);
    await this.page.goto("/feed");
  }

  async resetDatabase() {
    await this.page.request.post("/api/test-utils/reset-db", {
      headers: { "x-test-utils-secret": process.env.PLAYWRIGHT_SECRET ?? "" },
    });
  }
}
