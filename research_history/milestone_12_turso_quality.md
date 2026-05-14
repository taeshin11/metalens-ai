# Milestone 12 — Turso 마이그레이션 & AI 합성 품질 개선 (2026-05-11)

## 배경
Milestone 11에서 구축한 papers-api(로컬 SQLite + Cloudflare Tunnel) 방식은 PC가 꺼지면 작동하지 않는 한계. Turso(libSQL edge DB)로 마이그레이션하여 24/7 상시 가동 + 동시에 AI 합성 품질을 대폭 개선.

## 코드 변경

### `lib/papers-db.ts` (전면 리라이트)
- HTTP REST 클라이언트 → `@libsql/client` 직접 쿼리
- `getClient()`: 싱글턴 libSQL 클라이언트 (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
- `fetchPapersBatch()`: PMID 배열 → SQL `WHERE pmid IN (?)` 배치 조회
- `parseAuthors()`: 쉼표 구분 문자열 + JSON 배열 양쪽 파싱, "et al." 제거
- 기존 인터페이스(`PapersDbPaper`, `BatchResponse`) 유지 → pubmed.ts 변경 불필요

### `lib/constants.ts` (프롬프트 강화)
- META_ANALYSIS_PROMPT:
  - "ONLY use numbers verbatim from abstracts" 규칙 추가
  - "Ranges like 20-30% are FORBIDDEN" 명시
  - PMID 규칙을 "COPY-PASTE ONLY" 섹션으로 강화
  - BAD example에 fabricated range 추가
- GAP_FINDER_PROMPT:
  - 동일한 PMID/수치 날조 방지 규칙 추가

### `lib/synthesis.ts` (VALID PMIDs 주입)
- `buildPrompt()`에 `VALID PMIDs (use ONLY these, copy exact digits): ...` 줄 추가
- `[CACHED]` 라벨 제거 (불필요)

### `app/api/synthesize/route.ts` (후처리 강화)
- PMID 자동 보정: truncated PMID를 입력 PMID과 prefix/suffix 매칭으로 복구
- fakePmid 감지 범위: 1-5자리 → 1-4자리 (5~6자리는 자동 보정 대상)
- 로그: `pmids_auto_corrected` info 레벨 추가

### `components/ResultsCard.tsx` (Consensus Meter 개선)
- agree 패턴: 15개 → 30+ 개 (significantly, beneficial, recommended, validated 등)
- disagree 패턴: 15개 → 25+ 개 (remains unknown, paucity, citation needed 등)
- "Limited"에만 빠지던 문제 해결

### `.env.local`
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` 추가
- `UPSTASH_REDIS_REST_URL/TOKEN` 업데이트 (hemochat DB 공유)

### `package.json`
- `@libsql/client` 의존성 추가

## 검증 (10건 자동 테스트)

| 지표 | 개선 전 | 개선 후 |
|------|---------|---------|
| Valid PMID 평균 | 3.3개 | 8.7개 (+164%) |
| Invalid PMID | 다수 | 0개 |
| [citation needed] | 평균 6.3개 | 0개 |
| Fabricated ranges | 1건 | 0건 |
| Consensus 분포 | 전부 Limited | Strong 5, Moderate 2, Mixed 2, Limited 1 |

테스트 키워드: SGLT2 vs GLP-1, preterm infants, robotic vs laparoscopic rectal cancer, nivolumab+ipilimumab NSCLC, Mediterranean diet Alzheimer, mRNA vs adenoviral COVID booster, TAVR vs SAVR, FMT for depression, AI diabetic retinopathy, CRISPR sickle cell

## Vercel 반영 필요 (수동)
- TURSO_DATABASE_URL, TURSO_AUTH_TOKEN
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
