-- Extract top 3M papers from papers.db for cloud deployment
-- Strategy: proportional allocation per specialty, ranked by quality
-- Quality score = length(abstract) + (has_full_text * 2000)
-- Output: lightweight SQLite without full_text column

-- Step 1: Create output table
CREATE TABLE IF NOT EXISTS top_papers (
  pmid TEXT PRIMARY KEY,
  title TEXT,
  authors TEXT,
  journal TEXT,
  year TEXT,
  abstract TEXT,
  specialty TEXT
);

-- Step 2: Insert top papers per specialty, proportionally
-- Total target: 3,000,000
-- Allocation: proportional to specialty size, min 10K per specialty

-- oncology: ~450K (15%)
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'oncology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 450000;

-- cardiology: ~280K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'cardiology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 280000;

-- neurology: ~240K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'neurology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 240000;

-- endocrinology: ~180K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'endocrinology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 180000;

-- psychiatry: ~180K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'psychiatry' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 180000;

-- gastroenterology: ~165K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'gastroenterology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 165000;

-- infectious_disease: ~130K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'infectious_disease' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 130000;

-- pathology: ~125K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'pathology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 125000;

-- radiology: ~120K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'radiology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 120000;

-- hematology: ~120K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'hematology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 120000;

-- emergency_medicine: ~105K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'emergency_medicine' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 105000;

-- pulmonology: ~105K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'pulmonology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 105000;

-- musculoskeletal: ~75K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'musculoskeletal' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 75000;

-- nephrology: ~72K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'nephrology' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 72000;

-- surgery: ~70K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty = 'surgery' AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 70000;

-- remaining specialties: catch-all ~200K
INSERT OR IGNORE INTO top_papers
SELECT pmid, title, authors, journal, year, abstract, specialty
FROM papers
WHERE specialty NOT IN ('oncology','cardiology','neurology','endocrinology','psychiatry','gastroenterology','infectious_disease','pathology','radiology','hematology','emergency_medicine','pulmonology','musculoskeletal','nephrology','surgery')
  AND abstract IS NOT NULL AND length(abstract) > 200
ORDER BY length(abstract) + (CASE WHEN full_text IS NOT NULL AND length(full_text) > 100 THEN 2000 ELSE 0 END) DESC
LIMIT 200000;

-- Step 3: Create FTS index
CREATE VIRTUAL TABLE IF NOT EXISTS top_papers_fts USING fts5(
  title, abstract, specialty,
  content='top_papers',
  content_rowid='rowid'
);

INSERT INTO top_papers_fts(rowid, title, abstract, specialty)
SELECT rowid, title, abstract, specialty FROM top_papers;

-- Step 4: Verify
SELECT COUNT(*) AS total_papers FROM top_papers;
SELECT specialty, COUNT(*) as cnt FROM top_papers GROUP BY specialty ORDER BY cnt DESC;
