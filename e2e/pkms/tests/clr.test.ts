import { test, Page } from '@playwright/test';
import { PKMS_BE_DOMAIN, PKMS_DOMAIN } from '../constants';
import { login } from '../utils/auth';
import axios from 'axios';


const test_ino = "A122882221";
let case_id: any;


async function pre_test() {
  const url = `${PKMS_BE_DOMAIN}/managesystem/new_creditlinereview/`

  const response = await axios.post(url,  {
    id_card: test_ino, 
    apply_amount: 120, // 申請額度(萬元)
    max_amount: 200,
    attachment: "https://www.labpocket.tw/media/credit_apply/test/clr_test2.zip",
    trade_num: 10,
    is_breach: false,
    price_in_stock: 214.903,
    key: "BF66DB1B65D9A43093C908910EC58118A7A7800A0CE2EC0C26FD6AE8A2381D5D",
    case_type: 0,
    now_amount: 1000 // 現在額度(萬元)
  });

  case_id = response.data.data;
}


async function post_test() {
  const url = `${PKMS_BE_DOMAIN}/managesystem/clr/test/`

  const response = await axios.delete(url, {
    data: {
      case_id: case_id,
    }    
  })
};

async function create_b27() {
  const url = `${PKMS_BE_DOMAIN}/managesystem/clr/test_b27/`
  
  const response = await axios.post(url, {
    case_id: case_id,
    normal_open: 10,
    credit_open: 4,
    any_open: 4,
    breach: "N"
  });
};


function getFormattedDate(offset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}


test('test', async ({ page }) => {
  test.setTimeout(600000);

  // 預先建立測試資料
  await pre_test();

  // 登入
  await login(page);

  // 檢視 單日買賣額度進入頁面
  await page.getByText('審核').click();
  await page.getByRole('link', { name: '單日買賣額度' }).click();
  await page.waitForTimeout(5000)  
  
  // 單日買賣額度篩選身分證
  await page.getByPlaceholder('輸入身分證字號').fill(test_ino);
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  // 單日買賣額度篩選時間
  const today = getFormattedDate();
  const yesterday = getFormattedDate(-1);
  const tomorrow = getFormattedDate(1);
  
  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('incoming_start').fill(today);
  await page.getByLabel('incoming_end').fill(today);
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('incoming_start').fill(tomorrow);
  await page.getByLabel('incoming_end').fill(tomorrow);
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('closecase_start').fill(yesterday);
  await page.getByLabel('closecase_end').fill(yesterday);
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  // 單日買賣額度篩選狀態
  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('已結案').check();
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  // 單日買賣額度篩選身分證
  await page.getByRole('button', { name: '清除' }).click();
  await page.getByPlaceholder('輸入身分證字號').fill('NotExist');
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(5000);

  // 單日買賣額度篩選狀態
  await page.getByRole('button', { name: '清除' }).click();
  await page.getByLabel('待審核').check();  
  await page.getByRole('button', { name: '查詢' }).click();
  await page.waitForTimeout(3000);

  // 點進去查看  
  await page.getByRole('cell', { name: test_ino }).click();
  await page.waitForTimeout(2500);

  // 取得B27資料, 並觀察UI連動
  await create_b27();
  await page.getByRole('cell', { name: '查看 缺B27' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('(有此項情形者，本審核表應經由業務部門主管或其指派之人員複核)').fill('Hi');
  await page.getByPlaceholder('(依不動產評估單日買賣額度者，請說明評估其價值之一句或方法)').fill('Hi');
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: '儲存' }).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: '關閉' }).click();
  await page.waitForTimeout(3000);

  await page.getByRole('cell', { name: '查看 缺B27' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: '取得B27資料' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: '關閉' }).click();
  await page.waitForTimeout(3000);

  // 看風險
  await page.getByRole('cell', { name: '否 查看' }).locator('span').click();
  await page.waitForTimeout(3000);
  await page.locator('button.button_red', { hasText: '返回' }).click();

  // 看交易資料
  await page.getByRole('button', { name: '查看' }).nth(1).click();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: '關閉' }).click();

  // 送出 -> 財力核決
  await page.getByLabel('有，須請相關單位提供資產評估').check();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: '送出' }).click();
  await page.waitForTimeout(200);

  // 回到列表
  await page.goto(`${PKMS_DOMAIN}/Todo/QuotaAudit`);
  await page.waitForTimeout(3000);

  // 刪除測試資料
  await post_test();
});
