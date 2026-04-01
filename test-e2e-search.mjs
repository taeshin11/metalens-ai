import puppeteer from 'puppeteer';

const BASE = 'https://metalens-ai.vercel.app';

async function run() {
  const browser = await puppeteer.launch({
    headless: false,  // visible browser for debugging
    args: ['--no-sandbox'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  // Capture all network requests and console logs
  const networkErrors = [];
  const consoleMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') console.log(`  CONSOLE ERROR: ${text}`);
  });

  page.on('requestfailed', req => {
    networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
    console.log(`  NET FAIL: ${req.method()} ${req.url().substring(0, 100)}`);
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('adsbygoogle')) {
      console.log(`  HTTP ${res.status()}: ${res.url().substring(0, 100)}`);
    }
  });

  console.log('1. Loading homepage...');
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 30000 });
  console.log('   Homepage loaded.');

  console.log('2. Typing search...');
  const input = await page.$('input');
  await input.click({ clickCount: 3 });
  await input.type('aspirin vs ibuprofen pain', { delay: 20 });

  console.log('3. Clicking Analyze...');
  const buttons = await page.$$('button');
  let analyzeBtn = null;
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && (text.includes('Analyze') || text.includes('분석'))) {
      analyzeBtn = btn;
      break;
    }
  }

  if (!analyzeBtn) {
    // Try form submit
    await page.keyboard.press('Enter');
    console.log('   Pressed Enter (no Analyze button found)');
  } else {
    await analyzeBtn.click();
    console.log('   Clicked Analyze button');
  }

  console.log('4. Waiting for result (up to 120s)...');
  const startTime = Date.now();

  try {
    // Wait for either results or error
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      // Success: findings appeared
      if ((body.includes('**1.') || body.includes('1.')) && body.includes('PMID')) return true;
      // Error: error message appeared
      if (body.includes('Something went wrong') || body.includes('try again') || body.includes('Try Again')) return true;
      // Also check for result card
      if (document.querySelector('[class*="result"]') || document.querySelector('[class*="Result"]')) return true;
      return false;
    }, { timeout: 120000 });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   Completed in ${elapsed}s`);

    // Check what we got
    const bodyText = await page.$eval('body', el => el.innerText);

    if (bodyText.includes('Something went wrong') || bodyText.includes('Try Again')) {
      console.log('   ❌ GOT ERROR: "Something went wrong"');
      console.log('\n   === Console messages around failure ===');
      consoleMessages.slice(-10).forEach(m => console.log(`   ${m}`));
    } else {
      console.log('   ✅ Got results!');
      // Count findings
      const findingCount = (bodyText.match(/\*\*\d+\./g) || []).length;
      console.log(`   Findings: ${findingCount}`);

      // Count PMID links
      const pmidLinks = await page.evaluate(() => document.querySelectorAll('a[href*="pubmed"]').length);
      console.log(`   PubMed links: ${pmidLinks}`);
    }

  } catch {
    console.log('   ❌ TIMEOUT after 120s');
  }

  // Screenshot
  await page.screenshot({ path: 'test-e2e-result.png', fullPage: true });
  console.log('5. Screenshot: test-e2e-result.png');

  console.log('\n=== Network Errors ===');
  networkErrors.forEach(e => console.log(`  ${e}`));

  console.log('\n=== All Console Errors ===');
  consoleMessages.filter(m => m.startsWith('[error]')).forEach(m => console.log(`  ${m}`));

  await browser.close();
  console.log('\nDone!');
}

run().catch(console.error);
