const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureAll() {
  console.log('[CAPTURE] Launching browser for README screenshot generation...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  try {
    // 1. Application Interface
    console.log('1. Capturing Application Interface...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForSelector('button[aria-label="Add to selection"]', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'application-interface.png'),
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    });
    console.log('   ✓ application-interface.png saved');

    // 2. Open Single Studio
    console.log('2. Opening Single Studio...');
    const cardBtn = await page.$('button[aria-label="Add to selection"]');
    if (cardBtn) {
      await cardBtn.click();
      await page.waitForSelector('#anime-recommendation-card', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 1200));

      // Single anime studio stage view
      const stageWrapper = await page.$('[data-testid="studio-stage-wrapper"]');
      if (stageWrapper) {
        await stageWrapper.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'single-anime-output.png')
        });
        console.log('   ✓ single-anime-output.png saved');
      }

      // 3. Landscape Output (16:9 Banner)
      console.log('3. Capturing 16:9 Landscape Graphic...');
      const posterCard = await page.$('#anime-recommendation-card');
      if (posterCard) {
        await posterCard.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'landscape-output.png')
        });
        console.log('   ✓ landscape-output.png saved');
      }

      // 4. Switch to 1:1 Square
      console.log('4. Switching to 1:1 Square Ratio...');
      const squareBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.includes('1:1 Square') || b.innerText.includes('Square'));
      });
      if (squareBtn) {
        await squareBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const squareCard = await page.$('#anime-recommendation-card');
        if (squareCard) {
          await squareCard.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'square-output.png')
          });
          console.log('   ✓ square-output.png saved');
        }
      }

      // 5. Switch to 9:16 Portrait / Story
      console.log('5. Switching to 9:16 Story Ratio...');
      const portraitBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.includes('9:16') || b.innerText.includes('Story'));
      });
      if (portraitBtn) {
        await portraitBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const portraitCard = await page.$('#anime-recommendation-card');
        if (portraitCard) {
          await portraitCard.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'portrait-output.png')
          });
          console.log('   ✓ portrait-output.png saved');
        }
      }
    }

    // 6. Switch to Weekly Mode
    console.log('6. Switching to Weekly Showcase Mode...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Find weekly tab in navbar
    const weeklyTab = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      return tabs.find(b => b.innerText.includes('Weekly Top 3') || b.innerText.includes('Weekly'));
    });
    if (weeklyTab) {
      await weeklyTab.click();
      await page.waitForSelector('.glass-panel', { timeout: 8000 });
      await new Promise(r => setTimeout(r, 600));

      // Auto-generate weekly picks
      const autoGenBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find(b => b.innerText.includes('Auto-Generate Picks') || b.innerText.includes('Generate'));
      });
      if (autoGenBtn) {
        await autoGenBtn.click();
        await new Promise(r => setTimeout(r, 1500));
      }

      await page.waitForSelector('#weekly-anime-poster', { timeout: 8000 });
      const weeklyPoster = await page.$('#weekly-anime-poster');
      if (weeklyPoster) {
        await weeklyPoster.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'weekly-anime-output.png')
        });
        console.log('   ✓ weekly-anime-output.png saved');
      }
    }

    console.log('[CAPTURE] Completed successfully! Checking files in docs/screenshots:');
    const files = fs.readdirSync(SCREENSHOTS_DIR);
    files.forEach(f => {
      const s = fs.statSync(path.join(SCREENSHOTS_DIR, f));
      console.log(`   - ${f} (${Math.round(s.size / 1024)} KB)`);
    });
  } catch (err) {
    console.error('[CAPTURE ERROR]:', err);
  } finally {
    await browser.close();
  }
}

captureAll();
