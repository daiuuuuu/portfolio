const { chromium } = require('playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const state = () => page.evaluate(() => {
    const s = document.querySelector('[data-hero="sculpture"]');
    const b = document.querySelector('.ticker-band');
    return {
      bootRevealed: window.__bootRevealed,
      bootMounted: !!document.querySelector('[data-boot-logo]'),
      sculp: s ? getComputedStyle(s).transform : 'NO-HERO',
      band: b ? getComputedStyle(b).transform : 'NO-BAND',
    };
  });

  // Simulate: user lands DIRECTLY on a project page (reload/bookmark), then clicks HOME
  console.log('== STEP 1: direct load on project page ==');
  await page.goto('http://localhost:5173/portfolio/project/duanfu', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-boot-logo]', { state: 'detached', timeout: 20000 }).catch(() => {});
  await sleep(1500);
  console.log('  on project page, __bootRevealed =', JSON.stringify(await state()));

  console.log('== STEP 2: click HOME, sample over time ==');
  const t0 = Date.now();
  await page.locator('nav a:has-text("HOME")').first().click();
  for (const [label, wait] of [['+300ms',300],['+700ms',400],['+1200ms',500],['+1700ms',500],['+2200ms',500],['+2800ms',600],['+3400ms',600],['+4200ms',800]]) {
    await sleep(wait);
    const st = await state();
    const elapsed = Date.now() - t0;
    console.log(`  ${label} (t=${elapsed}ms): sculp=${st.sculp.slice(0,34)} band=${st.band.slice(0,34)} bootRevealed=${st.bootRevealed}`);
  }
  await page.screenshot({ path: 'D:/6_work/项目/作品集本体/repro-reload-project-home.png' });
  await browser.close();
})();
