import { test } from '@playwright/test';
import { AuthHelper } from '../base_test/auth_helper';
import * as fs from 'fs';


test('test', async ({ browser }) => {
  let context;
  let page;
  let isLoginSuccess = false;

  while (!isLoginSuccess) {
    try {
      if (fs.existsSync(AuthHelper.STORAGE_PATH)) {
        ({ context, page } = await AuthHelper.loginWithStorage(browser));
      } else {
        ({ context, page } = await AuthHelper.login(browser));
      }
      
      isLoginSuccess = await AuthHelper.checkLoginStatus(page);
      if (!isLoginSuccess) {
        fs.unlinkSync(AuthHelper.STORAGE_PATH);
        await context.close();
      }
    } catch (error) {
      console.error("發生錯誤:", error);
      await context?.close();
    }
  }
});