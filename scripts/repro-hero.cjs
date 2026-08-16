const { chromium } = require('playwright');
const BASE = 'http://localhost:5173/portfolio/';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (let run = 1; run <= 5; run++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-boot-logo]', { state: 'detached', timeout: 20000 }).catch(() => {});
    await sleep(2500);
    await page.locator('[data-project-index] a').first().click();
    await sleep(2500);

    // arm an observer for the sculpture (home will mount during the curtain)
    await page.evaluate(() => {
      window.__mut = [];
      let el = null;
      const iv = setInterval(() => {
        el = document.querySelector('[data-hero="sculpture"]');
        if (el) {
          clearInterval(iv);
          new MutationObserver(() => {
            window.__mut.push({ t: Math.round(performance.now()), x: getComputedStyle(el).transform });
          }).observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        }
      }, 50);
    });

    await page.locator('nav a:has-text("HOME")').first().click();
    await sleep(4500);
    const info = await page.evaluate(() => {
      const s = document.querySelector('[data-hero="sculpture"]');
      const t = s ? getComputedStyle(s).transform : 'MISSING';
      return { final: t, bootRevealed: window.__bootRevealed, mut: (window.__mut || []).slice(0, 12) };
    });
    const ok = info.final === 'matrix(1, 0, 0, 1, 0, 0)';
    results.push({ run, ok, ...info, errors: errors.length });
    await page.close();
  }
  console.table(results.map(r => ({ run: r.run, OK: r.ok, bootRevealed: r.bootRevealed, err: r.errors })));
  const fail = results.find(r => !r.ok);
  if (fail) {
    console.log('FAILING RUN mutations:'); console.log(JSON.stringify(fail.mut, null, 1));
    console.log('FAILING RUN final:', fail.final);
  } else {
    console.log('All runs OK — bug not reproduced in this batch.');
  }
  await browser.close();
})();
