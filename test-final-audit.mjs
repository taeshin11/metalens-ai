import puppeteer from 'puppeteer';

const BASE = 'https://metalens-ai.vercel.app';
const results = { passed: 0, failed: 0, details: [] };

function log(status, msg) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${msg}`);
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  results.details.push({ status, msg });
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // ====== 1. CHECK ALL PAGES ======
  console.log('\n=== PAGE CHECKS ===');
  const pages = [
    ['/en', 'Homepage EN'],
    ['/ko', 'Homepage KO'],
    ['/en/about', 'About'],
    ['/en/faq', 'FAQ'],
    ['/en/privacy', 'Privacy'],
    ['/en/terms', 'Terms'],
    ['/en/how-it-works', 'How It Works'],
    ['/en/use-cases', 'Use Cases'],
    ['/en/blog', 'Blog Index'],
    ['/en/blog/what-is-meta-analysis', 'Blog Post'],
    ['/en/compare/pranlukast-vs-montelukast', 'Compare Page'],
    ['/ko/about', 'About KO'],
    ['/ko/faq', 'FAQ KO'],
  ];

  for (const [path, name] of pages) {
    try {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 20000 });
      const status = res?.status();
      const title = await page.title();
      if (status === 200 && title) {
        log('pass', `${name} (${path}) — ${status}`);
      } else {
        log('fail', `${name} (${path}) — status=${status}, title="${title}"`);
      }
    } catch (e) {
      log('fail', `${name} (${path}) — ${e.message}`);
    }
  }

  // ====== 2. FAVICON ======
  console.log('\n=== FAVICON ===');
  try {
    const res = await page.goto(`${BASE}/favicon.ico`, { waitUntil: 'networkidle2', timeout: 10000 });
    log(res?.status() === 200 ? 'pass' : 'fail', `favicon.ico — ${res?.status()}`);
  } catch (e) {
    log('fail', `favicon.ico — ${e.message}`);
  }

  // ====== 3. ICON.SVG ======
  try {
    const res = await page.goto(`${BASE}/icon.svg`, { waitUntil: 'networkidle2', timeout: 10000 });
    log(res?.status() === 200 ? 'pass' : 'fail', `icon.svg — ${res?.status()}`);
  } catch (e) {
    log('fail', `icon.svg — ${e.message}`);
  }

  // ====== 4. ADS.TXT ======
  console.log('\n=== SEO & ADS ===');
  try {
    const res = await page.goto(`${BASE}/ads.txt`, { waitUntil: 'networkidle2', timeout: 10000 });
    const text = await page.evaluate(() => document.body.innerText);
    log(res?.status() === 200 && text.includes('pub-7098271335538021') ? 'pass' : 'fail', `ads.txt — ${res?.status()}`);
  } catch (e) {
    log('fail', `ads.txt — ${e.message}`);
  }

  // ====== 5. ADSENSE META TAG ======
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 20000 });
  const adsenseMeta = await page.$eval('meta[name="google-adsense-account"]', el => el.content).catch(() => null);
  log(adsenseMeta === 'ca-pub-7098271335538021' ? 'pass' : 'fail', `AdSense meta tag — ${adsenseMeta || 'NOT FOUND'}`);

  // ====== 6. ADSENSE SCRIPT ======
  const adsenseScript = await page.$('script[src*="adsbygoogle"]');
  log(adsenseScript ? 'pass' : 'fail', `AdSense script tag`);

  // ====== 7. JSON-LD ======
  const jsonLdCount = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);
  log(jsonLdCount > 0 ? 'pass' : 'fail', `JSON-LD blocks: ${jsonLdCount}`);

  // ====== 8. ROBOTS.TXT ======
  try {
    const res = await page.goto(`${BASE}/robots.txt`, { waitUntil: 'networkidle2', timeout: 10000 });
    const text = await page.evaluate(() => document.body.innerText);
    log(text.includes('Sitemap') ? 'pass' : 'fail', `robots.txt`);
  } catch (e) {
    log('fail', `robots.txt — ${e.message}`);
  }

  // ====== 9. SITEMAP ======
  try {
    const res = await page.goto(`${BASE}/sitemap.xml`, { waitUntil: 'networkidle2', timeout: 10000 });
    log(res?.status() === 200 ? 'pass' : 'fail', `sitemap.xml — ${res?.status()}`);
  } catch (e) {
    log('fail', `sitemap.xml — ${e.message}`);
  }

  // ====== 10. 404 PAGE ======
  console.log('\n=== 404 PAGE ===');
  try {
    await page.goto(`${BASE}/nonexistent-xyz`, { waitUntil: 'networkidle2', timeout: 10000 });
    const text = await page.evaluate(() => document.body.innerText);
    log(text.includes('404') && text.includes('Home') ? 'pass' : 'fail', `Root 404 page — has content: ${text.length > 30}`);
  } catch (e) {
    log('fail', `Root 404 — ${e.message}`);
  }

  // ====== 11. MOBILE CHECK ======
  console.log('\n=== MOBILE ===');
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  for (const [path, name] of [['/en', 'Home'], ['/en/about', 'About'], ['/ko', 'Home KO']]) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: 20000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    log(overflow ? 'fail' : 'pass', `Mobile ${name} — overflow: ${overflow}`);
  }
  await page.setViewport({ width: 1280, height: 900 });

  // ====== 12. SEARCH FUNCTION ======
  console.log('\n=== SEARCH FUNCTION ===');
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: 20000 });

  const input = await page.$('input');
  if (input) {
    log('pass', 'Search input found');
    await input.click({ clickCount: 3 });
    await input.type('aspirin ibuprofen pain', { delay: 20 });

    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes('Analyze')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) await page.keyboard.press('Enter');

    log('pass', 'Search submitted');

    // Wait for either success or failure
    try {
      await page.waitForFunction(() => {
        const body = document.body.innerText;
        return body.includes('PMID') || body.includes('Finding') ||
               body.includes('Something went wrong') || body.includes('Try Again') ||
               body.includes('결과');
      }, { timeout: 90000 });

      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Something went wrong') || bodyText.includes('Try Again')) {
        log('fail', 'Search returned error');
      } else if (bodyText.includes('PMID') || bodyText.includes('Finding') || bodyText.includes('결과')) {
        log('pass', 'Search returned results!');
        const pmidLinks = await page.evaluate(() => document.querySelectorAll('a[href*="pubmed"]').length);
        log(pmidLinks > 0 ? 'pass' : 'warn', `PubMed links: ${pmidLinks}`);
      } else {
        log('warn', 'Search completed but unclear result');
      }
    } catch {
      log('fail', 'Search timed out (90s)');
    }
  } else {
    log('fail', 'Search input not found');
  }

  // Take final screenshot
  await page.screenshot({ path: 'test-final-result.png', fullPage: true });

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log(`  FINAL AUDIT: ${results.passed} passed, ${results.failed} failed`);
  console.log('========================================\n');

  if (results.failed > 0) {
    console.log('FAILURES:');
    results.details.filter(d => d.status === 'fail').forEach(d => console.log(`  ❌ ${d.msg}`));
  }
}

run().catch(console.error);
