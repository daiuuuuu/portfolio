const PDFMerger = require('pdf-merger-js').default;

(async () => {
  const merger = new PDFMerger();
  await merger.add('portfolio-pdf/作品集-孔得宇-AIGC设计师.pdf');
  for (const f of ['home', 'duanfu', 'xcu', 'guji', 'video-factory', 'image-workflow', 'portfolio-site']) {
    await merger.add('site-pdf-tmp/' + f + '.pdf');
  }
  await merger.save('portfolio-pdf/作品集-完整版-极简+网站.pdf');
  console.log('合并完成');
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });
