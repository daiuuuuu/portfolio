// 把站点内的组件库复制件(public/design-system + public/组件库)改成自包含:
// 用 Playwright 加载每个文件 → 等 Tailwind CDN 编译 → 提取生成的 CSS → 内联进文件,
// 同时移除 CDN script 与 tailwind.config 块。原件(8_作品集参考/)绝不动。
// 用法: node scripts/selfcontain-lib.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public');
const BASE = 'http://localhost:5173/portfolio/';

const CDN_RE = /<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>/g;
const CONFIG_RE = /<script>\s*tailwind\.config = \{[\s\S]*?<\/script>/;

function collectFiles() {
  const list = [];
  const ds = path.join(ROOT, 'design-system', 'index.html');
  if (fs.existsSync(ds)) list.push('design-system/index.html');
  const compDir = path.join(ROOT, '组件库');
  if (fs.existsSync(compDir)) {
    for (const f of fs.readdirSync(compDir).filter((x) => x.endsWith('.html'))) {
      list.push(path.join('组件库', f).replace(/\\/g, '/'));
    }
  }
  return list;
}

async function compileCss(page, url, label) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  let css = '';
  for (let i = 0; i < 40; i++) {
    css = await page.evaluate(() => {
      const s = [...document.querySelectorAll('style')].map((x) => x.textContent || '');
      return s.find((t) => t.includes('@layer') || t.includes('--tw-') || t.includes('.bg-surface')) || '';
    });
    if (css && (i === 0 || await page.evaluate(() => {
      const s = [...document.querySelectorAll('style')].map((x) => (x.textContent || '').length);
      return s.length;
    }))) break;
    if (css && css.length > 5000) break; // good enough, stable size
    await page.waitForTimeout(400);
  }
  if (!css) throw new Error('未编译出 CSS: ' + label);
  return css;
}

(async () => {
  const files = collectFiles();
  console.log('待处理文件数:', files.length);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let ok = 0, fail = [];
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    try {
      const url = BASE + rel.split('/').map(encodeURIComponent).join('/');
      const css = await compileCss(page, url, rel);
      // Rewrite the file
      const html = fs.readFileSync(abs, 'utf8');
      const noCdn = html.replace(CDN_RE, '');
      const noConfig = noCdn.replace(CONFIG_RE, '');
      if (noConfig === noCdn) {
        throw new Error('未找到 tailwind.config 块');
      }
      const styleTag = `<style>\n${css}\n</style>`;
      const final = noConfig.replace('</head>', `${styleTag}\n</head>`);
      fs.writeFileSync(abs, final, 'utf8');
      ok++;
      console.log('✓', rel, '(' + css.length + 'B css)');
    } catch (e) {
      fail.push(rel + ' → ' + e.message);
    }
  }
  await browser.close();
  console.log('\n完成:', ok, '/', files.length, '成功');
  if (fail.length) { console.log('失败:', fail.join('\n')); }
})();
