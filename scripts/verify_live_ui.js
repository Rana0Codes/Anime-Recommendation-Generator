const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const QA_OUTPUT_DIR = path.join(__dirname, '../qa_output/ui_verify');

if (!fs.existsSync(QA_OUTPUT_DIR)) {
  fs.mkdirSync(QA_OUTPUT_DIR, { recursive: true });
}

async function verifyUI() {
  const startTime = Date.now();
  console.log('[FAST VERIFY] Starting rapid UI verification...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();
    
    // Step 1: Rapid load of homepage
    console.log('1. Loading http://localhost:3000 (DOM ready)...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('button[aria-label="Add to selection"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 400));

    // Capture Home
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '01_home_fullpage.png'), fullPage: true });
    console.log('   ✓ Saved 01_home_fullpage.png');

    // Verify footer full-width
    const footerWidth = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? Math.round(footer.getBoundingClientRect().width) : 0;
    });
    console.log(`   ✓ Footer width: ${footerWidth}px (expected ~1920px)`);

    // Step 2: Open single studio
    console.log('2. Opening Single Studio view...');
    const cardBtn = await page.$('button[aria-label="Add to selection"]');
    if (cardBtn) {
      await cardBtn.click();
      await page.waitForSelector('.glass-panel', { timeout: 5000 });
      await new Promise(r => setTimeout(r, 500));

      await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '02_single_studio_fullpage.png'), fullPage: true });
      console.log('   ✓ Saved 02_single_studio_fullpage.png');

      const panels = await page.$$('.glass-panel');
      if (panels.length >= 1) {
        await panels[0].screenshot({ path: path.join(QA_OUTPUT_DIR, '03_customization_dock.png') });
        console.log('   ✓ Saved 03_customization_dock.png');
      }
      if (panels.length >= 2) {
        await panels[1].screenshot({ path: path.join(QA_OUTPUT_DIR, '04_studio_canvas_stage.png') });
        console.log('   ✓ Saved 04_studio_canvas_stage.png');
      }
    }

    // Step 3: Switch to Weekly mode
    console.log('3. Switching to Weekly Top 3 Showcase...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const weeklyTab = tabs.find(t => t.textContent.includes('Weekly'));
      if (weeklyTab) {
        weeklyTab.click();
      } else {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText.includes('Weekly'));
        if (btn) btn.click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '05_weekly_studio_fullpage.png'), fullPage: true });
    console.log('   ✓ Saved 05_weekly_studio_fullpage.png');

    // Step 4: Auto-populate weekly showcase
    console.log('4. Auto-generating Weekly picks...');
    const autoGenTriggered = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Auto-Generate'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (autoGenTriggered) {
      // Wait for slots to populate or max 2.5s
      await new Promise(r => setTimeout(r, 2200));
      await page.screenshot({ path: path.join(QA_OUTPUT_DIR, '06_weekly_populated_fullpage.png'), fullPage: true });
      console.log('   ✓ Saved 06_weekly_populated_fullpage.png');

      const weeklyPanels = await page.$$('.glass-panel');
      if (weeklyPanels.length > 1) {
        await weeklyPanels[weeklyPanels.length - 1].screenshot({ path: path.join(QA_OUTPUT_DIR, '07_weekly_canvas_stage.png') });
        console.log('   ✓ Saved 07_weekly_canvas_stage.png');
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[FAST VERIFY] Completed successfully in ${elapsed}s! All screenshots saved in qa_output/ui_verify.`);
  } finally {
    await browser.close();
  }
}

verifyUI().catch(err => {
  console.error('[FAST VERIFY] Error:', err);
  process.exit(1);
});
