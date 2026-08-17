// 把 7 张网站长图按网站顺序拼接成一张完整长图
const sharp = require('sharp');
const fs = require('fs');

const ORDER = ['home', 'duanfu', 'xcu', 'guji', 'video-factory', 'image-workflow', 'portfolio-site'];
const OUT = '作品集-网站完整版长图.png';

(async () => {
  const metas = [];
  let y = 0;
  for (const name of ORDER) {
    const p = `site-longimg/${name}.png`;
    const m = await sharp(p).metadata();
    metas.push({ name, height: m.height });
    y += m.height;
  }
  const totalH = y;
  console.log('总高:', totalH, 'px');

  const composites = [];
  let offset = 0;
  for (const { name } of metas) {
    composites.push({ input: `site-longimg/${name}.png`, top: offset, left: 0 });
    offset += metas.find((m) => m.name === name).height;
  }

  await sharp({
    create: { width: 1920, height: totalH, channels: 3, background: '#fcf9f8' },
  })
    .composite(composites)
    .png({ compressionLevel: 6 })
    .toFile(OUT);

  console.log('拼接完成 →', OUT);
  console.log('大小:', (fs.statSync(OUT).size / 1048576).toFixed(1), 'MB');
})();
