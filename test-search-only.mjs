import puppeteer from 'puppeteer';

const BASE = 'https://metalens-ai.vercel.app';

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Testing search functionality...');
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 30000 });

  const input = await page.$('input[type="text"], input[placeholder]');
  if (!input) { console.log('❌ No input found'); await browser.close(); return; }

  await input.click();
  await input.type('aspirin vs ibuprofen', { delay: 30 });
  console.log('Typed: aspirin vs ibuprofen');

  const button = await page.$('button[type="submit"], form button');
  await button.click();
  console.log('Clicked submit');

  // Wait using setTimeout instead of deprecated waitForTimeout
  await new Promise(r => setTimeout(r, 3000));

  const bodyText1 = await page.$eval('body', el => el.innerText);
  const hasLoading = bodyText1.includes('PubMed') || bodyText1.includes('synthesiz') || bodyText1.includes('종합') || bodyText1.includes('검색');
  console.log(`Loading state: ${hasLoading ? '✅' : '⚠️ not detected'}`);

  // Wait for results
  console.log('Waiting for results (up to 90s)...');
  try {
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      return (body.includes('1.') || body.includes('**1')) &&
             (body.includes('Source') || body.includes('출처') || body.includes('PMID') || body.includes('pubmed'));
    }, { timeout: 90000 });

    console.log('✅ Results loaded!');

    const pmidLinks = await page.evaluate(() => {
      return document.querySelectorAll('a[href*="pubmed"]').length;
    });
    console.log(`PubMed links: ${pmidLinks}`);

    const bodyText = await page.$eval('body', el => el.innerText);
    const lines = bodyText.split('\n').filter(l => l.trim().length > 0);
    console.log(`Content lines: ${lines.length}`);

    // Check for finding markers
    const findings = bodyText.match(/\*\*\d+\./g) || bodyText.match(/^\d+\./gm) || [];
    console.log(`Findings found: ${findings.length}`);

    // Take screenshot
    await page.screenshot({ path: 'test-search-result.png', fullPage: true });
    console.log('Screenshot saved: test-search-result.png');

  } catch {
    console.log('❌ Results timeout');
    await page.screenshot({ path: 'test-search-timeout.png', fullPage: true });
    console.log('Screenshot saved: test-search-timeout.png');
  }

  // Test 404 page
  console.log('\nTesting 404 page...');
  await page.goto(`${BASE}/en/nonexistent-page-xyz`, { waitUntil: 'networkidle2', timeout: 30000 });
  const title404 = await page.title();
  const body404 = await page.$eval('body', el => el.innerText);
  console.log(`404 title: ${title404}`);
  console.log(`404 has content: ${body404.length > 50 ? '✅' : '❌'}`);

  // Check AdSense meta tag deployed
  console.log('\nChecking AdSense meta tag...');
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 30000 });
  const adsenseMeta = await page.$eval('meta[name="google-adsense-account"]', el => el.content).catch(() => null);
  console.log(`AdSense meta: ${adsenseMeta || '❌ NOT FOUND'}`);

  await browser.close();
  console.log('\nDone!');
}

run().catch(console.error);
