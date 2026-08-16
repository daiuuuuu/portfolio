import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.mouse.move(720,450)

  // rapid scroll
  const samples = []
  for(let i=0;i<20;i++){await page.mouse.wheel(0,100);await page.waitForTimeout(15);samples.push(Math.round(await page.evaluate('window.scrollY')))}
  const mono = samples.every((v,i)=>i===0||v>=samples[i-1])
  const d = []
  for(let i=1;i<samples.length;i++) d.push(samples[i]-samples[i-1])
  console.log('monotonic:', mono, 'deltas:', d.join(','))
  console.log('range:', samples[0], '→', samples[samples.length-1])

  // coast after stop
  const b4 = samples[samples.length-1]
  await page.waitForTimeout(2000)
  const after = await page.evaluate('window.scrollY')
  console.log('coast after stop:', Math.round(after - b4), 'px')

  // inner scroller
  await page.goto('http://localhost:5173/portfolio/project/guji',{waitUntil:'networkidle'})
  await page.waitForTimeout(2000)
  await page.evaluate('window.scrollTo(0,2800)')
  await page.waitForTimeout(500)
  const pane = page.locator('[style*="max-height: 32"]').first()
  const box = await pane.boundingBox()
  if(box){await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,200);await page.waitForTimeout(500);console.log('OCR inner:',await pane.evaluate((e:any)=>e.scrollTop),'px')}
  await browser.close()
}
main().catch(e=>{console.error(e);process.exit(1)})
