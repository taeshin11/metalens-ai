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
  'ADHD, methylphenidate',
  'pregnancy, folic acid',
  'cholesterol, statins',
  'sleep apnea, CPAP',
  'obesity, GLP-1, semaglutide',
  'heart failure, beta blockers',
  'stroke, thrombolysis',
  'arthritis, methotrexate',
  'anxiety, benzodiazepines',
  'epilepsy, valproate, levetiracetam',
  'prostate cancer, PSA',
  'sepsis, antibiotics',
  'chronic pain, opioids',
  'vitamin D, bone health',
  'hepatitis C, sofosbuvir',
  'anemia, iron supplementation',
  'COPD, tiotropium',
  'autism, early intervention',
  'malaria, artemisinin',
];

async function testQuery(browser, query, index) {
  const page = await browser.newPage();
  const start = Date.now();
  const result = { query, index: index + 1, status: 'unknown', papers: 0, time: 0, findings: '', error: '' };

  try {
    // Go to homepage
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Type in search box
    const input = await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await input.click({ clickCount: 3 }); // select all
    await input.type(query, { delay: 10 });

    // Click Analyze button
    const btn = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await btn.click();

    // Wait for results or error (up to 90 seconds)
    try {
      await page.waitForFunction(
        () => {
          const keyFindings = document.querySelector('[class*="prose"]');
          const errorEl = document.querySelector('[class*="text-red"]');
          return keyFindings || errorEl;
        },
        { timeout: 90000 }
      );
    } catch {
      result.status = 'TIMEOUT';
      result.time = ((Date.now() - start) / 1000).toFixed(1);
      await page.close();
      return result;
    }

    // Check for error
    const errorText = await page.evaluate(() => {
      const el = document.querySelector('[class*="text-red"]');
      return el ? el.textContent : null;
    });

    if (errorText) {
      result.status = 'ERROR';
      result.error = errorText.trim().substring(0, 100);
      result.time = ((Date.now() - start) / 1000).toFixed(1);
      await page.close();
      return result;
    }

    // Get paper count
    const paperCount = await page.evaluate(() => {
      const badge = document.querySelector('[class*="rounded-full"]');
      if (badge) {
        const match = badge.textContent.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    });

    // Get findings text
    const findings = await page.evaluate(() => {
      const prose = document.querySelector('[class*="prose"]');
      return prose ? prose.textContent.substring(0, 200) : 'No findings';
    });

    result.status = 'SUCCESS';
    result.papers = paperCount;
    result.findings = findings.trim().substring(0, 150);
    result.time = ((Date.now() - start) / 1000).toFixed(1);
  } catch (err) {
    result.status = 'CRASH';
    result.error = err.message.substring(0, 100);
    result.time = ((Date.now() - start) / 1000).toFixed(1);
  }

  await page.close();
  return result;
}

async function main() {
  console.log(`Starting Puppeteer test of ${QUERIES.length} queries...\n`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  // Run queries sequentially to avoid rate limiting
  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i];
    console.log(`[${i + 1}/${QUERIES.length}] Testing: "${query}"`);
    const result = await testQuery(browser, query, i);
    results.push(result);
    console.log(`  → ${result.status} | ${result.papers} papers | ${result.time}s${result.error ? ' | ' + result.error : ''}`);

    // Small delay between queries to avoid rate limiting
    if (i < QUERIES.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const success = results.filter(r => r.status === 'SUCCESS').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const timeouts = results.filter(r => r.status === 'TIMEOUT').length;
  const crashes = results.filter(r => r.status === 'CRASH').length;

  console.log(`Total: ${results.length} | Success: ${success} | Errors: ${errors} | Timeouts: ${timeouts} | Crashes: ${crashes}`);

  const avgTime = results.filter(r => r.status === 'SUCCESS').reduce((a, r) => a + parseFloat(r.time), 0) / (success || 1);
  console.log(`Average success time: ${avgTime.toFixed(1)}s`);

  if (errors > 0) {
    console.log('\nFailed queries:');
    results.filter(r => r.status !== 'SUCCESS').forEach(r => {
      console.log(`  #${r.index} "${r.query}" → ${r.status}: ${r.error}`);
    });
  }

  // Show first 100 chars of findings for successful ones
  console.log('\nSample findings:');
  results.filter(r => r.status === 'SUCCESS').slice(0, 5).forEach(r => {
    console.log(`  #${r.index} (${r.papers} papers, ${r.time}s): ${r.findings.substring(0, 120)}...`);
  });

  // Write full results to file
  const fs = await import('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('\nFull results saved to test-results.json');
}

main().catch(console.error);
