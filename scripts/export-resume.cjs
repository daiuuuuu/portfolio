// 导出简历 A4 PDF（简历/index.html → 作品集交付/孔得宇-简历.pdf）
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  await page.goto('file://' + path.resolve('简历/index.html').split(path.sep).join('/'), { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(800);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('内容高度:', h, 'px (A4≈1123)');
  await page.pdf({
    path: '作品集交付/孔得宇-简历.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  await page.screenshot({ path: 'audit-shots/resume.png' });
  await browser.close();
  console.log('简历PDF已导出');
})();
