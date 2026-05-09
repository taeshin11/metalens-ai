// Upload top_papers.db to Turso cloud via HTTP API
// Batch inserts: 50 rows per request to stay under payload limits

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../data/top_papers.db');
const TURSO_URL = 'https://papersdb-spinaiceo.aws-ap-northeast-1.turso.io';
const TURSO_AUTH = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJnaWQiOiJiOTczOTljYS1mNTVhLTRiNGQtOGVjOC1hNzNmMjM0ZTZjZmUiLCJpYXQiOjE3NzgyODI5MDEsInJpZCI6ImFkMTgxNGI0LTQwMGEtNDZkYS04MGMzLWZmNGEyODY2YzY1NiJ9.Cv9TjWdHoeZDQnISpVupDm715OsfW8jU3CvkYXfFWc6q17aOBPsAG0LTUWKo311K-qLqdFyZ2H-KFkMtsXZACw';

const BATCH_SIZE = 50;
const CONCURRENT = 3;

async function sendBatch(rows) {
  const requests = rows.map(r => ({
    type: 'execute',
    stmt: {
      sql: 'INSERT OR IGNORE INTO papers (pmid, title, authors, journal, year, abstract, specialty) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        { type: 'text', value: r.pmid },
        { type: 'text', value: r.title || '' },
        { type: 'text', value: r.authors || '' },
        { type: 'text', value: r.journal || '' },
        { type: 'text', value: r.year || '' },
        { type: 'text', value: (r.abstract || '').slice(0, 4000) },
        { type: 'text', value: r.specialty || '' },
      ],
    },
  }));
  requests.push({ type: 'close' });

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_AUTH}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return rows.length;
}

async function main() {
  console.log('Opening local DB...');
  const db = new Database(DB_PATH, { readonly: true });
  const total = db.prepare('SELECT COUNT(*) AS c FROM papers').get().c;
  console.log(`Total papers to upload: ${total.toLocaleString()}`);

  const stmt = db.prepare('SELECT * FROM papers LIMIT ? OFFSET ?');
  let uploaded = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let offset = 0; offset < total; offset += BATCH_SIZE * CONCURRENT) {
    const promises = [];
    for (let i = 0; i < CONCURRENT; i++) {
      const batchOffset = offset + i * BATCH_SIZE;
      if (batchOffset >= total) break;
      const rows = stmt.all(BATCH_SIZE, batchOffset);
      if (rows.length === 0) break;
      promises.push(
        sendBatch(rows)
          .then(n => { uploaded += n; })
          .catch(err => {
            errors++;
            if (errors <= 5) console.error(`  Error at offset ${batchOffset}: ${err.message}`);
          })
      );
    }
    await Promise.all(promises);

    if (uploaded % 10000 < BATCH_SIZE * CONCURRENT) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = Math.round(uploaded / elapsed);
      const eta = Math.round((total - uploaded) / rate / 60);
      process.stdout.write(`\r  ${uploaded.toLocaleString()} / ${total.toLocaleString()} (${Math.round(uploaded/total*100)}%) | ${rate}/s | ETA: ${eta}min | errors: ${errors}`);
    }
  }

  console.log(`\n\nDone! Uploaded: ${uploaded.toLocaleString()}, Errors: ${errors}`);
  db.close();
}

main().catch(e => console.error('FATAL:', e.message));
