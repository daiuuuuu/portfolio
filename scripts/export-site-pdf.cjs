// 把网站本身导出为 PDF（reduced-motion 静态化 + 图片路由拦截压缩）
// 用法: node scripts/export-site-pdf.cjs [routeIndex]   // 可传单个索引测一条
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 尾斜杠必须有——React Router basename '/portfolio/' 需要匹配，否则内容不渲染
const BASE = 'http://localhost:5173/portfolio/';
const ROUTES = ['', 'project/duanfu', 'project/xcu', 'project/guji', 'project/video-factory', 'project/image-workflow', 'project/portfolio-site'];
const OUT = 'site-pdf-tmp';
const COMP = path.join('portfolio-pdf', 'img', 'comp');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const only = process.argv[2] !== undefined ? parseInt(process.argv[2]) : -1;
  const idxs = only >= 0 ? [only] : ROUTES.map((_, i) => i);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  // Serve compressed jpg when available (cuts PDF size massively)
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
    await page.waitForTimeout(2500);
    await page.evaluate(() => { document.querySelectorAll('img, video, iframe').forEach((el) => { el.loading = 'eager'; }); });

    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 800) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(40); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.evaluate(async () => { await document.fonts.ready; });

    // Print-friendly: force reveals visible; hide only fixed chrome/overlays (keep hero ticker)
    await page.addStyleTag({ content: `
      [data-reveal],[data-reveal-group],[data-reveal] *,[data-reveal-group] *,[data-animate],[data-hero] {
        opacity:1 !important; transform:none !important; clip-path:inset(0 0 0 0) !important; visibility:visible !important;
      }
      nav,.fixed,[data-curtain-overlay],[data-boot],#mobile-menu { display:none !important; }
      html,body { overflow:visible !important; }
    ` });
    await page.waitForTimeout(800);

    const name = i === 0 ? 'home' : ROUTES[i].split('/').pop();
    await page.pdf({ path: `${OUT}/${name}.pdf`, width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    console.log('✓', name, '导出完成');
  }
  await browser.close();
  console.log('done →', OUT);
})();
