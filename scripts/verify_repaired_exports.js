const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUTPUT_DIR = path.join(__dirname, '../qa_output/repaired');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Clean output dir
fs.readdirSync(OUTPUT_DIR).forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));

async function runVerification() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🔬 REPAIR VERIFICATION: SQUARE CORNERS & FULL-WIDTH BACKGROUND');
  console.log('═══════════════════════════════════════════════════════════════════');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: OUTPUT_DIR,
  });

  // Step 1: Open Single Anime Template
  console.log('\n▶ [1/4] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select "Tsuihou Sareta Cheat..." (1st card)
  console.log('  ⏳ Clicking Generate Poster for Tsuihou Sareta Cheat...');
  const genBtns = await page.$$('xpath///button[contains(., "Generate Poster")]');
  await genBtns[0].click();
  await new Promise(r => setTimeout(r, 4500));

  // Download Single 16:9
  console.log('  ⏳ Triggering Download for Single 16:9 Landscape...');
  const dlBtn = await page.waitForSelector('xpath///button[contains(., "Download Template (.png)")]');
  await dlBtn.click();
  await new Promise(r => setTimeout(r, 6000));

  // Switch to 1:1 Post
  console.log('  ⏳ Switching to 1:1 Square Post...');
  const squareBtn = await page.waitForSelector('button[value="1-1"]');
  await squareBtn.click();
  await new Promise(r => setTimeout(r, 4000));

  console.log('  ⏳ Triggering Download for Single 1:1 Square...');
  await dlBtn.click();
  await new Promise(r => setTimeout(r, 6000));

  // Switch to 9:16 Story
  console.log('  ⏳ Switching to 9:16 Portrait Story...');
  const storyBtn = await page.waitForSelector('button[value="9-16"]');
  await storyBtn.click();
  await new Promise(r => setTimeout(r, 4000));

  console.log('  ⏳ Triggering Download for Single 9:16 Story...');
  await dlBtn.click();
  await new Promise(r => setTimeout(r, 6000));

  // Step 2: Open Weekly Showcase
  console.log('\n▶ [2/4] Switching to Weekly Top 3 Showcase...');
  const weeklyTab = await page.waitForSelector('xpath///button[contains(., "Weekly")]');
  await weeklyTab.click();
  await new Promise(r => setTimeout(r, 2000));

  console.log('  ⏳ Clicking Auto-Generate This Week...');
  const autoGenBtn = await page.waitForSelector('xpath///button[contains(., "Auto-Generate This Week")]');
  await autoGenBtn.click();
  await new Promise(r => setTimeout(r, 9000));

  console.log('  ⏳ Triggering Download for Weekly Poster...');
  const dlWeeklyBtn = await page.waitForSelector('xpath///button[contains(., "Download") and (contains(., "Poster") or contains(., "Showcase"))]');
  await dlWeeklyBtn.click();
  await new Promise(r => setTimeout(r, 7000));

  // Step 3: Inspect all downloaded files
  console.log('\n▶ [3/4] Inspecting Exported Files in:', OUTPUT_DIR);
  const downloadedFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
  console.log('Found files:', downloadedFiles);

  const results = [];

  for (const filename of downloadedFiles) {
    const fullPath = path.join(OUTPUT_DIR, filename);
    const fileUrl = 'file:///' + fullPath.replace(/\\/g, '/');

    const inspPage = await browser.newPage();
    await inspPage.goto(fileUrl, { waitUntil: 'networkidle0' });

    const analysis = await inspPage.evaluate(() => {
      const img = document.querySelector('img');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const getPixel = (x, y) => Array.from(ctx.getImageData(x, y, 1, 1).data);

      // 4 extreme outer corners (pixel 0,0)
      const tl = getPixel(0, 0);
      const tr = getPixel(w - 1, 0);
      const bl = getPixel(0, h - 1);
      const br = getPixel(w - 1, h - 1);

      // Check alpha of all 4 corners
      const isSquare = (tl[3] === 255 && tr[3] === 255 && bl[3] === 255 && br[3] === 255);

      // Right edge seam analysis:
      // Sample rightmost 50 pixels at 5 vertical points
      const yPoints = [Math.floor(h * 0.1), Math.floor(h * 0.3), Math.floor(h * 0.5), Math.floor(h * 0.7), Math.floor(h * 0.9)];
      const rightEdgeSamples = yPoints.map(y => {
        const atEdge = getPixel(w - 1, y);
        const atInner5 = getPixel(w - 5, y);
        const atInner30 = getPixel(w - 30, y);
        return { y, atEdge, atInner5, atInner30 };
      });

      return { w, h, corners: { tl, tr, bl, br }, isSquare, rightEdgeSamples };
    });

    await inspPage.close();

    console.log('\n---------------------------------------------------');
    console.log(`FILE: ${filename}`);
    console.log(`Dimensions: ${analysis.w} x ${analysis.h}`);
    console.log(`Corners (0,0): TL=${JSON.stringify(analysis.corners.tl)}, TR=${JSON.stringify(analysis.corners.tr)}, BL=${JSON.stringify(analysis.corners.bl)}, BR=${JSON.stringify(analysis.corners.br)}`);
    console.log(`100% SQUARE CORNERS (All Alpha = 255): ${analysis.isSquare ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Right Edge Continuity Samples:`, JSON.stringify(analysis.rightEdgeSamples));

    results.push({ filename, ...analysis });
  }

  await browser.close();

  const allSquare = results.length >= 4 && results.every(r => r.isSquare);
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`FINAL VERIFICATION RESULT: ${allSquare ? '✅ ALL EXPORTS HAVE SQUARE CORNERS & FULL COVERAGE' : '❌ SOME EXPORTS FAILED'}`);
  console.log('═══════════════════════════════════════════════════════════════════');

  if (!allSquare) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
