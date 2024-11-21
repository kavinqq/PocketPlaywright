import { Page } from '@playwright/test';
import { PKMS_DOMAIN } from '../constants';

export async function login(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.goto(`${PKMS_DOMAIN}/login`);
  await page.getByPlaceholder('請輸入使用者名稱').fill('admin');
  await page.getByPlaceholder('請輸入密碼').fill('Pocketms6620');
  await page.getByRole('button', { name: '登入' }).click();
  await page.waitForTimeout(2000);
}