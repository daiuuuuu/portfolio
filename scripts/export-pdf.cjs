// 导出作品集 PDF + 长图（1920×1080 横版, portfolio-pdf/index.html）
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const fileUrl = 'file://' + path.resolve('portfolio-pdf/index.html').split(path.sep).join('/');
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(1500);

  const pageCount = await page.evaluate(() => document.querySelectorAll('.page').length);
  const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('页数:', pageCount, '| 总高:', totalH, 'px');

  await page.pdf({ path: 'portfolio-pdf/作品集-孔得宇-AIGC设计师.pdf', printBackground: true, preferCSSPageSize: true });
  await page.screenshot({ path: 'portfolio-pdf/作品集-长图.png', fullPage: true });
  await browser.close();
  console.log('导出完成');
})();
