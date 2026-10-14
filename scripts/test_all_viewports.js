const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const QA_OUTPUT_DIR = path.resolve('C:/Users/Juyel Rana/Desktop/Fix Github/qa_output');
if (!fs.existsSync(QA_OUTPUT_DIR)) {
  fs.mkdirSync(QA_OUTPUT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const VIEWPORTS = [
  { name: 'large_desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'standard_desktop_1440x900', width: 1440, height: 900 },
  { name: 'laptop_1366x768', width: 1366, height: 768 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'narrow_mobile_320x640', width: 320, height: 640 },
];

async function runComprehensiveVerification() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🔍 FULL COMPREHENSIVE VIEWPORT & WORKFLOW VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    // 1. Test Homepage across all 6 viewports
    console.log('\n📱 Testing Homepage Across All 6 Required Viewports...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 600));
      const shotPath = path.join(QA_OUTPUT_DIR, `vp_home_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  📸 Captured vp_home_${vp.name}.png (${vp.width}x${vp.height})`);
    }

    // 2. Test Studio with an anime card
    console.log('\n🎬 Testing Single Poster Studio with anime card selection...');
    await page.setViewport({ width: 1440, height: 900 });
    const firstGenerateBtn = await page.waitForSelector('button[aria-label="Add to selection"]');
    await firstGenerateBtn.click();
    console.log('  ⏳ Opened Studio, waiting for artwork rendering...');
    await new Promise(r => setTimeout(r, 3500));

    // Capture Studio action bar and dock across key viewports
    const studioShot1440 = path.join(QA_OUTPUT_DIR, 'vp_studio_1440x900.png');
    await page.screenshot({ path: studioShot1440 });
    console.log('  📸 Captured vp_studio_1440x900.png (Clean Back Button & Aligned Dock)');

    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, 'vp_studio_tablet_768x1024.png') });
    console.log('  📸 Captured vp_studio_tablet_768x1024.png');

    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, 'vp_studio_mobile_390x844.png') });
    console.log('  📸 Captured vp_studio_mobile_390x844.png');

    // 3. Test Back to Search navigation
    console.log('\n🔙 Testing Back to Search navigation...');
    const backBtn = await page.waitForSelector('xpath///button[contains(., "Back to Search")]');
    await backBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // 4. Test Manual / Custom Entry Workflow
    console.log('\n✍️ Testing Manual Entry Workflow...');
    await page.setViewport({ width: 1440, height: 900 });
    const manualTabBtn = await page.waitForSelector('xpath///button[contains(., "Custom / Manual Entry")]');
    await manualTabBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // Load sample data
    const loadSampleBtn = await page.waitForSelector('xpath///button[contains(., "Load Sample Data")]');
    await loadSampleBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, 'vp_manual_entry_form.png') });
    console.log('  📸 Captured vp_manual_entry_form.png (Manual Entry Form with Sample Data)');

    // Generate Poster from manual entry
    const submitBtn = await page.waitForSelector('xpath///button[contains(., "Generate Recommendation Poster")]');
    await submitBtn.click();
    console.log('  ⏳ Submitted manual anime entry, opening studio...');
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: path.join(QA_OUTPUT_DIR, 'vp_manual_entry_studio.png') });
    console.log('  📸 Captured vp_manual_entry_studio.png');

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('✅ ALL VIEWPORT & WORKFLOW TESTS COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════════');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runComprehensiveVerification();
