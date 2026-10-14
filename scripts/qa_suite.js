const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const QA_OUTPUT_DIR = path.resolve('C:/Users/Juyel Rana/Desktop/Fix Github/qa_output');
if (!fs.existsSync(QA_OUTPUT_DIR)) {
  fs.mkdirSync(QA_OUTPUT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function runQASuite() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🎯 MASTER QA SUITE: SAAS REDESIGN, LOGO, WATERMARK & REGRESSION');
  console.log('═══════════════════════════════════════════════════════════════════');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Clean output directory
  try {
    const existing = fs.readdirSync(QA_OUTPUT_DIR);
    for (const f of existing) {
      fs.unlinkSync(path.join(QA_OUTPUT_DIR, f));
    }
  } catch (_) {}

  // Enable CDP download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: QA_OUTPUT_DIR,
  });

  try {
    console.log('\n🌐 [Step 1/7] Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // 00: Capture SaaS Homepage
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '00_saas_homepage.png') });
    console.log('  📸 Captured 00_saas_homepage.png (SaaS Redesign Baseline)');

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: Test Creator Identity Dialog
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 2/7] Testing Creator Profile Dialog...');
    try {
      const creatorBtn = await page.waitForSelector('xpath///button[contains(., "@Rana0Codes")]', { timeout: 5000 });
      if (creatorBtn) {
        await creatorBtn.click();
        await new Promise(r => setTimeout(r, 800));
        await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '00_creator_dialog.png') });
        console.log('  📸 Captured 00_creator_dialog.png');
        const doneBtn = await page.waitForSelector('xpath///button[contains(., "Done")]');
        if (doneBtn) await doneBtn.click();
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (e) {
      console.warn('  Creator profile dialog notice:', e.message);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 3: Single Anime 16:9 Landscape (Sunset Theme)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 3/7] Single Anime Recommendation — 16:9 Landscape');
    const singleTabBtn = await page.waitForSelector('xpath///button[contains(., "Single")]');
    await singleTabBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const searchInput = await page.waitForSelector('input[label="Search Anime"], input[aria-label="Search Anime"], input.MuiOutlinedInput-input');
    await searchInput.type('Hajime no Ippo');
    await new Promise(r => setTimeout(r, 3500));

    const addCardBtn = await page.waitForSelector('button[aria-label="Add to selection"]');
    await addCardBtn.click();
    console.log('  ⏳ Selected Hajime no Ippo, waiting for Base64 artwork...');
    await new Promise(r => setTimeout(r, 4500));

    // Switch theme to Sunset Synthwave
    try {
      const themeSelect = await page.$('#theme-select-label + div, div[aria-haspopup="listbox"]');
      if (themeSelect) {
        await themeSelect.click();
        await new Promise(r => setTimeout(r, 500));
        const sunsetOpt = await page.waitForSelector('xpath///li[contains(., "Sunset Synthwave")]', { timeout: 3000 });
        if (sunsetOpt) {
          await sunsetOpt.click();
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (e) {
      console.warn('  Theme switch warning:', e.message);
    }

    // Verify watermark exists in DOM
    const watermarkExists = await page.evaluate(() => {
      const wm = document.querySelector('[data-arg-watermark="true"]');
      return !!wm;
    });
    console.log('  🔍 Bottom-left watermark detected in DOM:', watermarkExists);

    // Capture preview design area
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '01_single_16-9_preview.png') });
    console.log('  📸 Captured 01_single_16-9_preview.png');

    // Trigger download
    const dlBtn1 = await page.waitForSelector('xpath///button[contains(., "Download Template (.png)")]');
    await dlBtn1.click();
    console.log('  ⏳ Triggered 16:9 download...');
    await new Promise(r => setTimeout(r, 5000));

    // ─────────────────────────────────────────────────────────────────
    // TEST 4: Single Anime 1:1 Square (Instagram Format)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 4/7] Single Anime Recommendation — 1:1 Square (Instagram)');
    const squareBtn = await page.waitForSelector('xpath///button[contains(., "1:1 Post")]');
    await squareBtn.click();
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '02_single_1-1_preview.png') });
    console.log('  📸 Captured 02_single_1-1_preview.png');

    await dlBtn1.click();
    console.log('  ⏳ Triggered 1:1 download...');
    await new Promise(r => setTimeout(r, 5000));

    // ─────────────────────────────────────────────────────────────────
    // TEST 5: Single Anime 9:16 Portrait (Story Format)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 5/7] Single Anime Recommendation — 9:16 Portrait (Story)');
    const portraitBtn = await page.waitForSelector('xpath///button[contains(., "9:16 Story")]');
    await portraitBtn.click();
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '03_single_9-16_preview.png') });
    console.log('  📸 Captured 03_single_9-16_preview.png');

    await dlBtn1.click();
    console.log('  ⏳ Triggered 9:16 download...');
    await new Promise(r => setTimeout(r, 5000));

    // ─────────────────────────────────────────────────────────────────
    // TEST 6: Weekly Anime Top 3 Showcase (16:9 Showcase Poster)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 6/7] Weekly Anime Recommendation — Top 3 Showcase');
    const weeklyTabBtn = await page.waitForSelector('xpath///button[contains(., "Weekly")]');
    await weeklyTabBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    const autoGenBtn = await page.waitForSelector('xpath///button[contains(., "Auto-Generate This Week")]');
    await autoGenBtn.click();
    console.log('  ⏳ Auto-fetching top 3 trending anime from AniList...');
    await new Promise(r => setTimeout(r, 9000));

    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '04_weekly_16-9_preview.png') });
    console.log('  📸 Captured 04_weekly_16-9_preview.png');

    const dlWeeklyBtn = await page.waitForSelector('xpath///button[contains(., "Download") and (contains(., "Poster") or contains(., "Showcase"))]');
    await dlWeeklyBtn.click();
    console.log('  ⏳ Triggered Weekly Poster download...');
    await new Promise(r => setTimeout(r, 6000));

    // ─────────────────────────────────────────────────────────────────
    // TEST 7: Responsive Verification
    // ─────────────────────────────────────────────────────────────────
    console.log('\n▶ [Step 7/7] Responsive Verification — Tablet & Mobile Viewports');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '05_tablet_viewport.png') });
    console.log('  📸 Captured 05_tablet_viewport.png');

    await page.setViewport({ width: 375, height: 812 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '06_mobile_viewport.png') });
    console.log('  📸 Captured 06_mobile_viewport.png');

    // Inspect QA outputs
    const downloadedFiles = fs.readdirSync(QA_OUTPUT_DIR);
    console.log('\n📁 [QA Files Produced]:', downloadedFiles);

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('✅ ALL MASTER QA SUITE TESTS COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════════════');
  } catch (err) {
    console.error('❌ QA Suite Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQASuite();
