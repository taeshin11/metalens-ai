# Milestone 11 — Hybrid retrieval over papers.db + PubMed (2026-04-27)

## 배경
사용자가 HemoChat에서 운영 중인 `D:/HemoChat/data/papers.db` (82GB SQLite, ~9M PubMed 논문, 44개 specialty 태그, 707K full-text via PMC)를 MetaLens 합성에 활용하면 정확도가 오를지 검토. 분석 결과:
- **검색 랭킹**은 PubMed의 MeSH 튜닝이 우월 — 그대로 유지
- **본문 정확도**는 papers.db의 full text 활용이 큰 차이 — 메타분석 숫자 추출(sample size, effect size, CI) 신뢰도 향상의 핵심
- 82GB는 Vercel(250MB Lambda 한계)로 못 올리므로 별도 프로세스가 답

→ "검색=PubMed / 본문=papers.db 우선, 없으면 PubMed efetch 폴백" 하이브리드로 결정.

## 코드 변경

### `papers-api/` (새 디렉토리, Vercel 배포 제외)
- `papers-api/package.json` — Node 20+, `better-sqlite3` 단일 의존
- `papers-api/server.js` — readonly + WAL로 papers.db 오픈 (HemoChat writer와 락 충돌 없음)
- 엔드포인트:
  - `GET /healthz` — unauth, 모니터링용
  - `GET /stats` — 총 논문 수
  - `POST /papers/batch` — PMID 배열 → `{papers, missing}`, full text 옵션
  - `GET /search?q=...&specialty=...&limit=...` — FTS5 BM25 검색
- 인증: `X-API-Key` 헤더
- 로깅: JSON-line, lib/logger.ts와 동일 포맷 (`route: 'papers-api'`)
- FTS5 쿼리 sanitize (특수문자 제거, 토큰 제한)
- Graceful shutdown (SIGINT/SIGTERM)
- `.env.example`, `README.md` (Cloudflare Tunnel / Tailscale Funnel 설정 가이드 포함), `.gitignore`

### `.vercelignore` (새 파일)
`papers-api/`, `research_history/`, `memory/`, `.claude/` 제외 — Vercel 배포 슬림화.

### `lib/papers-db.ts` (새 파일)
- `isPapersDbEnabled()` — `PAPERS_API_URL` + `PAPERS_API_KEY` 둘 다 있을 때만 활성
- `fetchPapersBatch(pmids, opts, log)` — RouteLogger 스레딩, 8s timeout, 실패 시 null 반환 (block 안 함)
- 모든 stage가 reqId와 함께 로그됨

### `lib/pubmed.ts` 수정
- `PubMedArticle` 인터페이스에 `fullText?`, `fullTextTruncated?`, `specialty?`, `source?: 'papers-db' | 'pubmed'` 필드 추가
- `fetchAbstracts(pmids, log)` 로직 변경:
  1. papers-db enabled면 `fetchPapersBatch` 먼저 호출 → DB hit 처리
  2. miss된 PMID만 PubMed efetch로 폴백
  3. esearch 원래 순서 보존하여 articles 재조립
- 각 단계 stage 로그: `papers_db_lookup_resolved`, `papers_db_unavailable_falling_back`, `fetch_abstracts_done` (DB/PubMed/full-text 카운트 모두 노출)

### `lib/synthesis.ts` 수정
- `buildPrompt(articles, pointCount, mode, opts={useFullText})` 시그니처 확장
- `useFullText` 활성 시:
  - 토큰 예산 30K → 60K chars
  - 각 paper에 full text 첫 4K chars 인라인
  - `[CACHED]`, `[oncology]` 같은 source/specialty 라벨 추가 → 모델이 컨텍스트 인식 가능
- `synthesizeWithAI` 시그니처에도 `opts` 통과

### `app/[locale]/page.tsx` 수정
- `useFullText = tier === 'pro'` — Pro 티어만 full text 사용 (Free는 비용 예측 가능)
- `synthesizeWithAI(papers, language, pointCount, mode, { useFullText })`

### `FEATURES.md` 갱신 (의무)
- "Last synced" 2026-04-27로 bump
- §15 Infrastructure 표에 "Hybrid retrieval" 행 추가
- **§16 Hybrid Retrieval (papers.db + PubMed)** 신규 섹션:
  - 16.1 아키텍처 (검색=PubMed, 본문=papers.db→PubMed 폴백)
  - 16.2 papers-api 서버 사양 + 엔드포인트
  - 16.3 MetaLens 클라이언트
  - 16.4 PubMedArticle 새 필드
  - 16.5 티어별 동작
- Maintenance Rules에 항목 9 ("Touching hybrid retrieval / papers-api") 추가

## 운영 토폴로지
```
[Vercel: MetaLens]
   │ esearch (PubMed) → PMID list (relevance-ranked)
   ▼
[Vercel: lib/pubmed.ts:fetchAbstracts]
   │ POST /papers/batch (X-API-Key)
   ▼
[Cloudflare Tunnel / Tailscale Funnel]
   ▼
[로컬 머신: papers-api (Node) → papers.db (SQLite WAL readonly)]
   │ miss된 PMID는 PubMed efetch로 폴백
   ▼
[Gemini 2.5 Flash: full text 포함 prompt]
```

## 활성화 절차 (사용자 수행 필요)
1. `cd papers-api && npm install`
2. `cp .env.example .env` → `PAPERS_API_KEY` 32자+ 랜덤 문자열로 설정
3. `npm start` (포그라운드) 또는 `pm2`/`nssm`으로 데몬화
4. Cloudflare Tunnel: `cloudflared tunnel --url http://127.0.0.1:4319` → 받은 공개 URL 메모
5. Vercel 대시보드에서 두 env var 추가:
   - `PAPERS_API_URL` = 터널 공개 URL
   - `PAPERS_API_KEY` = 위 .env와 동일 값
6. Vercel 자동 재배포 → Pro 티어 분석부터 full text 자동 활용

미설정 시 자동 폴백: `isPapersDbEnabled()` false → 기존 PubMed-only 경로 그대로.

## 검증 (로컬, 빌드 X — 사용자 VRAM 절약 정책 유지)
- 코드 리뷰 통과:
  - `lib/papers-db.ts` 환경변수 둘 다 있을 때만 활성, 미설정 시 null 반환
  - `lib/pubmed.ts` 변경은 추가-온리 (fullText 등 optional 필드만 추가, 기존 호출자 영향 없음)
  - `lib/synthesis.ts` opts 파라미터는 default `{}` — 기존 호출자 변경 불필요한데도 page.tsx까지 명시적 통과
- Vercel 배포 시 자동 빌드 검증
- `npm install` 후 `npm start`로 papers-api 동작 검증 가능 (사용자 측)

## 예상 효과
- 검색 결과 50개 중 papers.db hit율 (대다수 specialty 분야 800K+ 보유): **80%+ 예상**
- 그중 PMC full text 보유율: ~7-8% (papers.db 전체 707K/9M)
- 즉 50건 검색 시 평균 3-4건이 full text 포함 분석 가능 → 효과 큰 분야는 oncology(1.6M), cardio(928K), neuro(801K) 등

## 커밋
- (next commit) feat: hybrid retrieval — papers-api server + PubMed/papers.db merge in fetchAbstracts + full text in synthesis
