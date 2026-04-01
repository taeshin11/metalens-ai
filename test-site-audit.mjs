import puppeteer from 'puppeteer';

const BASE = 'https://metalens-ai.vercel.app';
const LOCALES = ['en', 'ko'];
const TIMEOUT = 30000;

const results = {
  pages: [],
  issues: [],
  suggestions: [],
};

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

async function checkPage(page, path, description) {
  const url = `${BASE}${path}`;
  log(`Checking: ${description} (${url})`);

  const startTime = Date.now();
  let status = 0;
  let errors = [];

  // Listen for console errors
  const consoleErrors = [];
  const onConsole = (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  };
  page.on('console', onConsole);

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
    status = response?.status() || 0;
    const loadTime = Date.now() - startTime;

    // Check title exists
    const title = await page.title();
    if (!title || title === '') errors.push('Missing page title');

    // Check for 404 content
    const bodyText = await page.$eval('body', el => el.innerText).catch(() => '');
    if (bodyText.includes('404') && !path.includes('nonexistent')) {
      errors.push('Page shows 404 content');
    }

    // Check meta description
    const metaDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
    if (!metaDesc) errors.push('Missing meta description');

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const broken = [];
      imgs.forEach(img => {
        if (img.naturalWidth === 0 && img.src) broken.push(img.src);
      });
      return broken;
    });
    if (brokenImages.length > 0) errors.push(`Broken images: ${brokenImages.join(', ')}`);

    // Check viewport / mobile responsiveness
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) errors.push('Horizontal scroll detected (mobile overflow)');

    // Check for visible error text
    const hasErrorText = await page.evaluate(() => {
      const body = document.body.innerText.toLowerCase();
      return body.includes('error') && body.includes('unhandled') ||
             body.includes('internal server error') ||
             body.includes('application error');
    });
    if (hasErrorText) errors.push('Error text visible on page');

    const result = {
      path,
      description,
      status,
      loadTime: `${loadTime}ms`,
      title: title?.substring(0, 60),
      errors,
      consoleErrors: consoleErrors.filter(e => !e.includes('adsbygoogle') && !e.includes('ERR_BLOCKED')),
    };

    results.pages.push(result);

    if (errors.length > 0) {
      log(`  ❌ Issues: ${errors.join('; ')}`);
    } else {
      log(`  ✅ OK (${loadTime}ms) — "${title?.substring(0, 50)}"`);
    }

    if (loadTime > 5000) {
      results.suggestions.push(`${path} loads slowly (${loadTime}ms)`);
    }

  } catch (err) {
    log(`  ❌ FAILED: ${err.message}`);
    results.pages.push({ path, description, status, errors: [err.message] });
  }

  page.off('console', onConsole);
}

async function testSearch(page) {
  log('=== Testing Search Functionality ===');

  const url = `${BASE}/en`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });

  // Find the search input
  const input = await page.$('input[type="text"], input[placeholder]');
  if (!input) {
    results.issues.push('Search input not found on homepage');
    log('  ❌ Search input not found');
    return;
  }
  log('  ✅ Search input found');

  // Type keywords
  await input.click();
  await input.type('aspirin vs ibuprofen', { delay: 30 });
  log('  Typed keywords: aspirin vs ibuprofen');

  // Find and click submit button
  const button = await page.$('button[type="submit"], form button');
  if (!button) {
    results.issues.push('Submit button not found');
    log('  ❌ Submit button not found');
    return;
  }

  await button.click();
  log('  Clicked submit button');

  // Wait for loading state
  await page.waitForTimeout(2000);

  // Check if loading skeleton appeared
  const hasLoading = await page.evaluate(() => {
    const body = document.body.innerText;
    return body.includes('PubMed') || body.includes('검색') || body.includes('synthesiz') || body.includes('종합');
  });
  log(`  Loading state visible: ${hasLoading ? '✅' : '⚠️'}`);

  // Wait for results (up to 60 seconds)
  log('  Waiting for results (up to 60s)...');
  try {
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      return body.includes('**') || body.includes('Key Finding') || body.includes('핵심') ||
             body.includes('Source') || body.includes('출처') || body.length > 2000;
    }, { timeout: 60000 });

    log('  ✅ Results loaded');

    // Check results content
    const resultsText = await page.evaluate(() => document.body.innerText);

    // Check for PMID links
    const hasPMID = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="pubmed"]');
      return links.length;
    });
    log(`  PubMed links found: ${hasPMID}`);

    if (hasPMID === 0) {
      results.issues.push('No PubMed links in search results');
    }

    // Check for AI synthesis content
    const hasFindings = resultsText.includes('1.') || resultsText.includes('**1');
    if (!hasFindings) {
      results.issues.push('AI findings not structured properly');
      log('  ⚠️ AI findings format might be wrong');
    } else {
      log('  ✅ AI findings structured correctly');
    }

  } catch {
    log('  ❌ Results did not load within 60s');
    results.issues.push('Search results timeout — AI synthesis may be failing');

    // Screenshot for debugging
    await page.screenshot({ path: 'test-results-timeout.png', fullPage: true });
  }
}

async function testComparePages(page) {
  log('=== Testing Compare Pages ===');

  const comparePaths = [
    '/en/compare/pranlukast-vs-montelukast',
    '/en/compare/metformin-vs-insulin',
    '/en/compare/ibuprofen-vs-acetaminophen',
  ];

  for (const path of comparePaths) {
    await checkPage(page, path, `Compare: ${path.split('/').pop()}`);

    // Check if auto-analysis triggers
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2', timeout: TIMEOUT });

    const hasAnalyzeButton = await page.$('button');
    if (hasAnalyzeButton) {
      log(`  Compare page has button`);
    }
  }
}

async function testMobileView(page) {
  log('=== Testing Mobile Viewport ===');

  await page.setViewport({ width: 375, height: 812, isMobile: true });

  const mobilePaths = ['/', '/about', '/faq', '/privacy'];
  for (const path of mobilePaths) {
    const url = `${BASE}/en${path === '/' ? '' : path}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasOverflow) {
      results.issues.push(`Mobile overflow on /en${path}`);
      log(`  ❌ Mobile overflow: /en${path}`);
      await page.screenshot({ path: `test-mobile-overflow${path.replace(/\//g, '-')}.png`, fullPage: false });
    } else {
      log(`  ✅ Mobile OK: /en${path}`);
    }
  }

  // Reset viewport
  await page.setViewport({ width: 1280, height: 800 });
}

async function testNavigation(page) {
  log('=== Testing Navigation Links ===');

  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: TIMEOUT });

  // Get all internal links
  const links = await page.evaluate((base) => {
    const anchors = document.querySelectorAll('a[href]');
    const hrefs = new Set();
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href.startsWith('/') || href.startsWith(base)) && !href.includes('#') && !href.includes('mailto:')) {
        hrefs.add(href.startsWith('/') ? href : href.replace(base, ''));
      }
    });
    return [...hrefs];
  }, BASE);

  log(`  Found ${links.length} internal links on homepage`);

  // Check header nav links
  const headerLinks = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return [];
    const anchors = header.querySelectorAll('a[href]');
    return [...anchors].map(a => ({ href: a.getAttribute('href'), text: a.innerText.trim() }));
  });

  log(`  Header links: ${headerLinks.map(l => l.text).join(', ')}`);

  // Check footer links
  const footerLinks = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return [];
    const anchors = footer.querySelectorAll('a[href]');
    return [...anchors].map(a => ({ href: a.getAttribute('href'), text: a.innerText.trim() }));
  });

  log(`  Footer links: ${footerLinks.map(l => l.text).join(', ')}`);
}

async function testSEO(page) {
  log('=== Testing SEO Elements ===');

  // Check robots.txt
  await checkPage(page, '/robots.txt', 'robots.txt');

  // Check sitemap
  await checkPage(page, '/sitemap.xml', 'sitemap.xml');

  // Check ads.txt
  await checkPage(page, '/ads.txt', 'ads.txt');

  // Check homepage SEO
  await page.goto(`${BASE}/en`, { waitUntil: 'networkidle2', timeout: TIMEOUT });

  const seoData = await page.evaluate(() => {
    const getContent = (selector) => document.querySelector(selector)?.content || document.querySelector(selector)?.textContent || null;
    return {
      title: document.title,
      description: getContent('meta[name="description"]'),
      ogTitle: getContent('meta[property="og:title"]'),
      ogDesc: getContent('meta[property="og:description"]'),
      ogImage: getContent('meta[property="og:image"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      h1Count: document.querySelectorAll('h1').length,
      adsenseScript: !!document.querySelector('script[src*="adsbygoogle"]'),
      adsenseMeta: getContent('meta[name="google-adsense-account"]'),
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    };
  });

  log(`  Title: ${seoData.title}`);
  log(`  Description: ${seoData.description?.substring(0, 60)}...`);
  log(`  OG Image: ${seoData.ogImage ? '✅' : '❌'}`);
  log(`  Canonical: ${seoData.canonical ? '✅' : '❌'}`);
  log(`  H1 tags: ${seoData.h1Count} ${seoData.h1Count === 1 ? '✅' : '⚠️'}`);
  log(`  AdSense script: ${seoData.adsenseScript ? '✅' : '❌'}`);
  log(`  AdSense meta: ${seoData.adsenseMeta || '❌'}`);
  log(`  JSON-LD blocks: ${seoData.jsonLd}`);

  if (seoData.h1Count > 1) results.suggestions.push(`Homepage has ${seoData.h1Count} H1 tags — should have exactly 1`);
  if (!seoData.ogImage) results.issues.push('Missing OG image');
  if (!seoData.canonical) results.issues.push('Missing canonical URL');
  if (seoData.jsonLd === 0) results.issues.push('No JSON-LD structured data');
}

async function testKoreanLocale(page) {
  log('=== Testing Korean Locale ===');

  const koPaths = [
    { path: '/ko', desc: 'Korean Homepage' },
    { path: '/ko/about', desc: 'Korean About' },
    { path: '/ko/faq', desc: 'Korean FAQ' },
    { path: '/ko/privacy', desc: 'Korean Privacy' },
    { path: '/ko/terms', desc: 'Korean Terms' },
    { path: '/ko/how-it-works', desc: 'Korean How It Works' },
    { path: '/ko/use-cases', desc: 'Korean Use Cases' },
    { path: '/ko/blog', desc: 'Korean Blog' },
  ];

  for (const { path, desc } of koPaths) {
    await checkPage(page, path, desc);
  }
}

async function run() {
  log('Starting MetaLens AI Site Audit');
  log(`Target: ${BASE}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 1. Test all English pages
  log('\n=== Testing English Pages ===');
  const enPages = [
    { path: '/en', desc: 'Homepage' },
    { path: '/en/about', desc: 'About' },
    { path: '/en/faq', desc: 'FAQ' },
    { path: '/en/privacy', desc: 'Privacy' },
    { path: '/en/terms', desc: 'Terms' },
    { path: '/en/how-it-works', desc: 'How It Works' },
    { path: '/en/use-cases', desc: 'Use Cases' },
    { path: '/en/blog', desc: 'Blog Index' },
    { path: '/en/blog/what-is-meta-analysis', desc: 'Blog: Meta Analysis' },
    { path: '/en/blog/ai-in-medical-research', desc: 'Blog: AI in Medical' },
    { path: '/en/blog/how-to-compare-drug-efficacy', desc: 'Blog: Drug Efficacy' },
  ];

  for (const { path, desc } of enPages) {
    await checkPage(page, path, desc);
  }

  // 2. Test Korean pages
  await testKoreanLocale(page);

  // 3. Test compare pages
  await testComparePages(page);

  // 4. Test SEO elements
  await testSEO(page);

  // 5. Test navigation
  await testNavigation(page);

  // 6. Test mobile view
  await testMobileView(page);

  // 7. Test search functionality
  await testSearch(page);

  // 8. Check for 404 page
  log('\n=== Testing 404 Page ===');
  await checkPage(page, '/en/nonexistent-page', '404 Page');

  await browser.close();

  // Summary
  console.log('\n\n========================================');
  console.log('         SITE AUDIT SUMMARY');
  console.log('========================================\n');

  const failedPages = results.pages.filter(p => p.errors?.length > 0);
  const okPages = results.pages.filter(p => p.errors?.length === 0);

  console.log(`✅ Passed: ${okPages.length} pages`);
  console.log(`❌ Failed: ${failedPages.length} pages`);
  console.log(`⚠️  Issues: ${results.issues.length}`);
  console.log(`💡 Suggestions: ${results.suggestions.length}\n`);

  if (failedPages.length > 0) {
    console.log('--- FAILED PAGES ---');
    failedPages.forEach(p => {
      console.log(`  ${p.path}: ${p.errors.join('; ')}`);
    });
    console.log('');
  }

  if (results.issues.length > 0) {
    console.log('--- ISSUES ---');
    results.issues.forEach(i => console.log(`  • ${i}`));
    console.log('');
  }

  if (results.suggestions.length > 0) {
    console.log('--- SUGGESTIONS ---');
    results.suggestions.forEach(s => console.log(`  💡 ${s}`));
    console.log('');
  }

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('test-site-audit-results.json', JSON.stringify(results, null, 2));
  console.log('Full results saved to test-site-audit-results.json');
}

run().catch(console.error);
