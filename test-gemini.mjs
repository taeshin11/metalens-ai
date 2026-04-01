import puppeteer from 'puppeteer';

const BASE_URL = 'https://metalens-ai.vercel.app/en';

const QUERIES = [
  'aspirin, cardiovascular, prevention',
  'metformin, weight loss, obesity',
  'COVID-19, vaccine, efficacy',
  'depression, SSRI, therapy',
  'hypertension, ACE inhibitors',
  'diabetes, insulin, HbA1c',
  'cancer, immunotherapy, PD-1',
  'alzheimer, donepezil, memantine',
  'asthma, inhaled corticosteroids',
  'migraine, triptans, prevention',
  'osteoporosis, bisphosphonates',
  'obesity, GLP-1, semaglutide',
  'heart failure, beta blockers',
  'cholesterol, statins, risk',
  'chronic pain, opioids, alternatives',
];

async function testQuery(browser, query, index) {
  const page = await browser.newPage();
  const start = Date.now();
  const result = { query, index: index + 1, status: 'unknown', papers: 0, time: 0, findingsPreview: '', error: '' };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Type in search box
    const input = await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await input.click({ clickCount: 3 });
    await input.type(query, { delay: 5 });

    // Click Analyze button
    const btn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await btn.click();

    // Wait for results or error (up to 60 seconds)
    await page.waitForFunction(
      () => {
        // Check for translated summary, key findings, or error
        const proseElements = document.querySelectorAll('.prose, [class*="prose"]');
        const errorEl = document.querySelector('[class*="text-red"]');
        return proseElements.length > 0 || errorEl;
      },
      { timeout: 60000 }
    );

    // Small delay for content to fully render
    await new Promise(r => setTimeout(r, 1000));

    // Check for error
    const errorText = await page.evaluate(() => {
      const el = document.querySelector('[class*="text-red"]');
      return el ? el.textContent.trim() : null;
    });

    if (errorText) {
      result.status = 'ERROR';
      result.error = errorText.substring(0, 100);
      result.time = ((Date.now() - start) / 1000).toFixed(1);
      await page.close();
      return result;
    }

    // Get paper count from the badge
    const paperCount = await page.evaluate(() => {
      const allText = document.body.innerText;
      const match = allText.match(/(\d+)\s*(papers found|건의 논문)/);
      return match ? parseInt(match[1]) : 0;
    });

    // Get findings preview
    const findings = await page.evaluate(() => {
      const proseEls = document.querySelectorAll('.prose, [class*="prose"]');
      if (proseEls.length > 0) {
        return proseEls[0].textContent.substring(0, 200).trim();
      }
      return 'No findings';
    });

    // Check if translated summary exists
    const hasTranslation = await page.evaluate(() => {
      return document.body.innerText.includes('Summary in Your Language') ||
             document.body.innerText.includes('한국어 요약');
    });

    result.status = 'SUCCESS';
    result.papers = paperCount;
    result.findingsPreview = findings.substring(0, 150);
    result.hasTranslation = hasTranslation;
    result.time = ((Date.now() - start) / 1000).toFixed(1);
  } catch (err) {
    result.status = err.message.includes('timeout') ? 'TIMEOUT' : 'CRASH';
    result.error = err.message.substring(0, 100);
    result.time = ((Date.now() - start) / 1000).toFixed(1);
  }

  await page.close();
  return result;
}

async function main() {
  console.log(`\n🔬 MetaLens AI — Gemini 2.5 Flash Test (${QUERIES.length} queries)\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i];
    process.stdout.write(`[${i + 1}/${QUERIES.length}] "${query}" `);
    const result = await testQuery(browser, query, i);
    results.push(result);
    console.log(`→ ${result.status} | ${result.papers} papers | ${result.time}s${result.error ? ' | ' + result.error : ''}`);

    if (i < QUERIES.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(70));

  const success = results.filter(r => r.status === 'SUCCESS').length;
  const errors = results.filter(r => r.status !== 'SUCCESS').length;

  console.log(`Total: ${results.length} | Success: ${success} | Failed: ${errors}`);
  console.log(`Success Rate: ${((success / results.length) * 100).toFixed(0)}%`);

  const times = results.filter(r => r.status === 'SUCCESS').map(r => parseFloat(r.time));
  if (times.length > 0) {
    console.log(`Avg Time: ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)}s`);
    console.log(`Min Time: ${Math.min(...times).toFixed(1)}s | Max Time: ${Math.max(...times).toFixed(1)}s`);
  }

  if (errors > 0) {
    console.log('\nFailed:');
    results.filter(r => r.status !== 'SUCCESS').forEach(r => {
      console.log(`  #${r.index} "${r.query}" → ${r.status}: ${r.error}`);
    });
  }

  console.log('\nFindings samples:');
  results.filter(r => r.status === 'SUCCESS').slice(0, 5).forEach(r => {
    console.log(`  #${r.index} (${r.papers} papers, ${r.time}s): ${r.findingsPreview.substring(0, 120)}...`);
  });

  const fs = await import('fs');
  fs.writeFileSync('test-gemini-results.json', JSON.stringify(results, null, 2));
  console.log('\nFull results: test-gemini-results.json');
}

main().catch(console.error);
