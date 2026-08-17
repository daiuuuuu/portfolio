// 压缩 public/images 里 >300KB 的图 → 1400px webp(q80),输出同名 .webp
// 之后手动更新 src 里的引用
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'images');
const MIN = 300 * 1024; // 300KB 以上才压

const SKIP = ['科技园-logo.png', '科技园-logo-white.png', '科技园-logo-black.png']; // logo 保留

(async () => {
  const files = fs.readdirSync(DIR).filter((f) => /\.(png|jpe?g)$/i.test(f) && !SKIP.includes(f));
  let totalIn = 0, totalOut = 0, ok = 0;
  for (const f of files) {
    const p = path.join(DIR, f);
    const size = fs.statSync(p).size;
    if (size < MIN) continue;
    const base = f.replace(/\.(png|jpe?g)$/i, '');
    const outName = base + '.webp';
    const buf = await sharp(p).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(path.join(DIR, outName), buf);
    totalIn += size; totalOut += buf.length;
    console.log(`✓ ${f} (${(size/1048576).toFixed(1)}MB) → ${outName} (${(buf.length/1048576).toFixed(2)}MB)`);
    ok++;
  }
  console.log(`\n压缩 ${ok} 张 | ${(totalIn/1048576).toFixed(1)}MB → ${(totalOut/1048576).toFixed(1)}MB`);
})();
