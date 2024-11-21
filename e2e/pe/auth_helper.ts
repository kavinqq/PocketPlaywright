export class AuthHelper {
    static readonly STORAGE_PATH = 'storageState.json';
    
    static async loginWithStorage(browser) {
      const context = await browser.newContext({
        storageState: this.STORAGE_PATH
      });
      const page = await context.newPage();
      await page.goto('https://www.pocket.tw/');
      await page.waitForTimeout(2000);

      return { context, page };
    }
  
    static async login(browser) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('https://www.pocket.tw/');
      await page.getByRole('textbox', { name: '請輸入身分證字號' }).fill('R124401004');
      await page.locator('#password').fill('950451qQ');
      
      console.log("請輸入驗證碼...");
      await page.pause();
      
      await page.getByRole('button', { name: '登入' }).click();
      await page.getByRole('button', { name: '關閉' }).click();
      await page.waitForTimeout(2000);
      
      await context.storageState({ path: this.STORAGE_PATH });
      return { context, page };
    }
  
    static async checkLoginStatus(page) {
      try {
        const idInput = await page.getByRole('textbox', { name: '請輸入身分證字號' });
        await idInput.waitFor({ timeout: 5000, state: 'visible' });
        return false;
      } catch {
        return true;
      }
    }
  }