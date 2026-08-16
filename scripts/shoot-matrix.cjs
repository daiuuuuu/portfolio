// 端适配截图矩阵 — 各分辨率下首页 Hero / 移动菜单 / 作品卡片 / 详情页
// 用法: node scripts/shoot-matrix.cjs  (需 dev server 在 5173)
// 输出: audit-shots/resp-<viewport>-<scene>.png
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173/portfolio/';
const OUT = path.join(__dirname, '..', 'audit-shots', 'resp');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const VIEWPORTS = [
  { name: '320',  width: 320,  height: 568 },
  { name: '375',  width: 375,  height: 667 },
  { name: '390',  width: 390,  height: 844 },
  { name: '768',  width: 768,  height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
  { name: '2560', width: 2560, height: 1440 },
];

// Horizontal-overflow audit: returns {docW, vw, worst} — docW vs innerWidth and
// the widest overflowing element (its width + a truncated label).
const auditOverflow = async (page) => page.evaluate(() => {
  const vw = window.innerWidth;
  const docW = document.documentElement.scrollWidth;
  let worst = null, worstW = 0;
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 2 && r.width > worstW && !el.closest('[data-curtain-overlay]')) {
      // Only elements whose own box is wider than the viewport (ignore clipped
      // decorative full-bleed / rotated tickers with overflow-hidden parents).
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) {
        const cs = getComputedStyle(p);
        if (cs.overflowX === 'hidden' || cs.overflowX === 'clip') { clipped = true; break; }
        p = p.parentElement;
      }
      if (!clipped) { worstW = r.width; worst = `${el.tagName}.${(el.className || '').toString().slice(0, 40)}`; }
    }
  });
  return { docW, vw, overflow: docW > vw + 2, worst: worst ? `${worst} ${Math.round(worstW)}px` : null };
});

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.setDefaultTimeout(8000);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-boot-logo]', { state: 'detached', timeout: 20000 }).catch(() => {});
    await sleep(3000); // let the hero entrance finish

    const heroOverflow = await auditOverflow(page);
    report.push({ vp: vp.name, scene: 'hero', ...heroOverflow });

    // Scene 1: home top (hero + nav)
    await page.screenshot({ path: path.join(OUT, `${vp.name}-hero.png`) });

    // Scene 2: mobile drawer open (only < lg)
    if (vp.width < 1024) {
      // aria-controls stays "mobile-menu" whether open or closed, so the same
      // locator toggles reliably (aria-label flips to "Close menu").
      const hamburger = page.locator('button[aria-controls="mobile-menu"]').first();
      const visible = await hamburger.isVisible().catch(() => false);
      if (visible) {
        try {
          await hamburger.click({ force: true });
        } catch (e) {
          await page.screenshot({ path: path.join(OUT, `${vp.name}-menu-fail.png`) });
          console.log(`hamburger click failed at ${vp.name}:`, e.message.split('\n')[0]);
        }
        await sleep(600);
        await page.screenshot({ path: path.join(OUT, `${vp.name}-menu.png`) });
        await hamburger.click({ force: true }).catch(() => {}); // close
        await sleep(400);
      }
    }

    // Scene 3: a project card (jump straight to the works section — the wheel
    // model scrolls smoothly and slowly, so a direct scrollTo is more reliable
    // for a screenshot; smoothWheel's onScroll syncs its proxy to the jump).
    await page.evaluate(() => {
      const el = document.querySelector('[data-project-index]');
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-card.png`) });
    report.push({ vp: vp.name, scene: 'card', ...(await auditOverflow(page)) });

    // Scene 4: project detail hero + overflow audit
    await page.evaluate(() => { window.scrollTo(0, 0); });
    await page.goto(BASE + 'project/duanfu', { waitUntil: 'domcontentloaded' });
    await sleep(2800); // curtain + entrance
    await page.screenshot({ path: path.join(OUT, `${vp.name}-detail.png`) });
    report.push({ vp: vp.name, scene: 'detail', ...(await auditOverflow(page)) });

    await page.close();
  }

  // WeChat-ish narrow vertical at 390 with the drawer still interactive
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + 'project/guji', { waitUntil: 'domcontentloaded' });
  await sleep(3200);
  await page.screenshot({ path: path.join(OUT, '390-guji-detail.png') });
  await page.close();

  await browser.close();
  console.table(report.filter(r => r.overflow).map(r => ({ vp: r.vp, scene: r.scene, docW: r.docW, vw: r.vw, worst: r.worst })));
  console.log('overflow rows above (empty table = no horizontal overflow) · done →', OUT);
})();
