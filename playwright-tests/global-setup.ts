import { request, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Ensure env vars loaded (mirrors config loader safety)
const projectRoot = path.resolve(__dirname, '../');
[ '.env', '.env.local' ].forEach(f => {
  const p = path.join(projectRoot, f);
  if (fs.existsSync(p)) dotenv.config({ path: p });
});

const storageStatePath = path.join(__dirname, 'storageState.json');

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string || 'http://localhost:3000';

  // Reset DB if secret present (optional)
  if (process.env.PLAYWRIGHT_SECRET) {
    const api = await request.newContext({ baseURL });
    await api.post('/api/test-utils/reset-db', {
      headers: { 'x-test-utils-secret': process.env.PLAYWRIGHT_SECRET }
    }).catch(() => {/* ignore if route absent */});
    await api.dispose();
  }

  const devSecret = process.env.DEV_TEST_LOGIN_SECRET;
  if (!devSecret) {
    console.warn('[global-setup] DEV_TEST_LOGIN_SECRET missing; tests may fail auth');
    return;
  }

  const context = await request.newContext({ baseURL });
  const resp = await context.get('/api/auth/test-login', {
    headers: { 'x-dev-login-secret': devSecret }
  });

  if (resp.status() !== 302) {
    const body = await resp.text();
    console.error('[global-setup] test-login failed', resp.status(), body.slice(0,300));
    await context.dispose();
    throw new Error(`test-login failed: ${resp.status()}`);
  }

  // Capture cookies into storageState for browser contexts
  const state = await context.storageState();
  fs.writeFileSync(storageStatePath, JSON.stringify(state, null, 2));
  console.log('[global-setup] Auth state saved to', storageStatePath);
  await context.dispose();
}
