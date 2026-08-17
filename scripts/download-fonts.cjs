// 从 Google Fonts 下载 Inter/Geologica/JetBrains Mono 的 latin woff2 → public/fonts/
const https = require('https');
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const FAMILIES = [
  { name: 'Geologica',    css: 'family=Geologica:wght@400;600;700;800;900' },
  { name: 'Inter',        css: 'family=Inter:wght@400;600;700;800;900' },
  { name: 'JetBrains Mono', css: 'family=JetBrains+Mono:wght@400;700' },
];
const OUT = path.join(__dirname, '..', 'public', 'fonts');
fs.mkdirSync(OUT, { recursive: true });

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': UA } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return get(res.headers.location).then(resolve, reject);
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

(async () => {
  let total = 0;
  for (const fam of FAMILIES) {
    const cssUrl = `https://fonts.googleapis.com/css2?${fam.css}&display=swap`;
    const css = (await get(cssUrl)).toString();
    // Parse @font-face blocks (simple, no nested braces)
    const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
    const seen = new Set(); // keep LAST per family+weight (latin subset is last)
    const map = {};
    for (const body of faces) {
      const f = (body.match(/font-family:\s*'([^']+)'/) || [])[1];
      const w = (body.match(/font-weight:\s*(\d+)/) || [])[1];
      const u = (body.match(/url\(([^)]+)\)/) || [])[1];
      if (f && w && u) map[`${f} ${w}`] = { f, w, u };
    }
    const keys = Object.keys(map).filter((k) => k.startsWith(fam.name));
    console.log(`— ${fam.name}: ${keys.length} 个权重`);
    for (const k of keys) {
      const { f, w, u } = map[k];
      const slug = f.replace(/\s+/g, '-').toLowerCase();
      const file = `${slug}-${w}.woff2`;
      const buf = await get(u);
      fs.writeFileSync(path.join(OUT, file), buf);
      total += buf.length;
      console.log(`  ✓ ${file} (${(buf.length / 1024).toFixed(0)}KB)`);
    }
  }
  console.log(`\n字体下载完成, 共 ${(total / 1048576).toFixed(2)}MB`);
})();
