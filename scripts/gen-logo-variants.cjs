// 从 XCU 源 logo 生成全彩/白/黑三个变体 → public/images/
const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', '2_xcu', '科技园形象', '科技园logo.png');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');

async function mono(fill, size) {
  const { data, info } = await sharp(SRC).ensureAlpha().resize(size, size).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] > 0) { out[i] = fill[0]; out[i + 1] = fill[1]; out[i + 2] = fill[2]; }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

(async () => {
  const m = await sharp(SRC).metadata();
  console.log('源 logo:', m.width, 'x', m.height, 'alpha:', !!m.hasAlpha);
  await sharp(SRC).resize(160, 160).png().toFile(path.join(OUT_DIR, '科技园-logo.png'));
  await sharp(await mono([255, 255, 255], 160)).toFile(path.join(OUT_DIR, '科技园-logo-white.png'));
  await sharp(await mono([0, 0, 0], 160)).toFile(path.join(OUT_DIR, '科技园-logo-black.png'));
  console.log('已生成: 全彩 / 白 / 黑 三个 logo 变体');
})();
