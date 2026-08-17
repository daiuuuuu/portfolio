// 压缩作品集 PDF 用到的图片 → portfolio-pdf/img/comp/*.webp (max 1400px, q82)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'public', 'images');
const OUT = path.join(__dirname, '..', 'portfolio-pdf', 'img', 'comp');
fs.mkdirSync(OUT, { recursive: true });

const files = [
  '端浮-主海报-v2.png', '端浮-横幅海报.png',
  '科技园-主海报.png', '科技园-三折页正面设计稿.png', '科技园-三折页反面设计稿.png',
  '科技园-竞赛大屏亮色版.png', '科技园-竞赛大屏暗色版.png', '科技园-就业指导展板.png',
  '古籍-主海报.png', '古籍-原始扫描页.png', '古籍-横幅海报.png',
  '视频工厂-主海报.png', '视频工厂-横幅海报.png',
  '视频封面-AI视频制作.jpg', '视频封面-nano-talk.jpg', '视频封面-nano-tech-life.jpg', '视频封面-餐饮界现状.jpg',
  '图片工作流-主海报.png', '图片工作流-横幅海报.png',
  '啤酒工作流-01原图.jpg', '啤酒工作流-02抠图.png', '啤酒工作流-03调色.webp', '啤酒工作流-04成品详情页.webp',
  '作品集网站-主海报.png', '作品集网站-横幅海报.png', '首屏-天使雕塑-紫色.webp',
];
// scheme screenshots are already in portfolio-pdf/img/
const schemeFiles = ['scheme-1.png', 'scheme-2.png', 'scheme-3.png'];

(async () => {
  let ok = 0, totalIn = 0, totalOut = 0;
  for (const f of files) {
    const srcPath = path.join(SRC, f);
    if (!fs.existsSync(srcPath)) { console.log('✗ 缺:', f); continue; }
    const outName = path.basename(f, path.extname(f)) + '.webp';
    const buf = await sharp(srcPath).resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer();
    fs.writeFileSync(path.join(OUT, outName), buf);
    totalIn += fs.statSync(srcPath).size;
    totalOut += buf.length;
    ok++;
  }
  // scheme screenshots from portfolio-pdf/img/
  const schemeSrc = path.join(__dirname, '..', 'portfolio-pdf', 'img');
  for (const f of schemeFiles) {
    const srcPath = path.join(schemeSrc, f);
    if (!fs.existsSync(srcPath)) continue;
    const outName = 'scheme-' + f.match(/(\d)/)[1] + '.webp';
    const buf = await sharp(srcPath).resize({ width: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 }).toBuffer();
    fs.writeFileSync(path.join(OUT, outName), buf);
    totalIn += fs.statSync(srcPath).size;
    totalOut += buf.length;
    ok++;
  }
  console.log('压缩完成:', ok, '张 | 原', (totalIn / 1048576).toFixed(1), 'MB → 压', (totalOut / 1048576).toFixed(1), 'MB');
})();
