// 把网站每个页面截成整页长图（reduced-motion 静态化 + 图片压缩）→ site-longimg/
// 用法: node scripts/export-site-longimage.cjs [routeIndex]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173/portfolio/';
const ROUTES = ['', 'project/duanfu', 'project/xcu', 'project/guji', 'project/video-factory', 'project/image-workflow', 'project/portfolio-site'];
const OUT = 'site-longimg';
const COMP = path.join('portfolio-pdf', 'img', 'comp');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const only = process.argv[2] !== undefined ? parseInt(process.argv[2]) : -1;
  const idxs = only >= 0 ? [only] : ROUTES.map((_, i) => i);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.route('**/portfolio/images/**', async (route) => {
    const url = new URL(route.request().url());
    const name = decodeURIComponent(url.pathname.split('/').pop());
    const base = name.replace(/\.(png|jpe?g|webp)$/i, '');
    const jpg = path.join(COMP, base + '.jpg');
    if (fs.existsSync(jpg)) return route.fulfill({ path: jpg, contentType: 'image/jpeg' });
    return route.continue();
  });

  for (const i of idxs) {
    await page.goto(BASE + ROUTES[i], { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-boot-logo]', { state: 'detached', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2200);
    await page.evaluate(() => { document.querySelectorAll('img, video, iframe').forEach((el) => { el.loading = 'eager'; }); });

    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(40); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    await page.evaluate(async () => { await document.fonts.ready; });

    const name = i === 0 ? 'home' : ROUTES[i].split('/').pop();
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    const size = fs.statSync(`${OUT}/${name}.png`).size / 1048576;
    console.log('✓', name, (h / 1000).toFixed(0) + 'kpx', size.toFixed(1) + 'MB');
  }
  await browser.close();
  console.log('done →', OUT);
})();
