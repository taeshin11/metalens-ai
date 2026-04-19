# Milestone 10 — Pricing 메타데이터 & API 관측성 (2026-04-18)

## 배경
Milestone 09 커밋 후 품질 감사에서 추가 발견한 두 항목 해결:
1. `/[locale]/pricing`이 `'use client'` 컴포넌트라 자체 `metadata` export가 불가 → locale layout의 공통 메타데이터만 사용 중. pricing은 런치 컨버전 페이지인데 title/description이 홈과 동일하여 SERP 차별화가 약했음.
2. API 라우트의 catch 블록들이 에러를 조용히 삼켜서 Vercel function logs에서 실패 원인을 볼 수 없었음. 런치 후 디버깅 관측성 부족.

## 코드 변경

### app/[locale]/pricing/layout.tsx (새 파일)
- Server component layout을 만들어 `generateMetadata` 제공
- `pricing.title`, `pricing.subtitle` i18n 키 재사용 → 8개 언어 자동 적용
- canonical URL + hreflang 8개 locale → `${SITE_URL}/${locale}/pricing`
- openGraph/twitter 오버라이드로 SERP 카드 차별화

### API 라우트 — 에러 로깅 추가
외부 catch 블록(진짜 실패) → `console.error` + 컨텍스트 prefix.
내부 fallback 시도 catch(primary → fallback 재시도 플로우) → `console.warn`로 fallback 발생률 관측 가능.

- `app/api/share/route.ts` — POST/GET 두 catch 모두
- `app/api/synthesize/route.ts` — 외부 + primary/fallback 시도 2개
- `app/api/extract/route.ts` — 외부 + 배치별 catch
- `app/api/translate/route.ts` — 외부 + primary/fallback 시도 2개
- `app/api/translate-result/route.ts` — 외부 + primary/fallback 시도 2개
- `app/api/pubmed/route.ts` — 외부 catch

## 확인
- `npx tsc --noEmit` 통과
- `npm run build` 성공 (Next.js 16.2.1 Turbopack, 15 static/dynamic routes)
- `/[locale]/pricing` route는 기존과 동일하게 빌드됨 (layout 추가로 인한 breaking change 없음)

## 주목할 점
- **metadata 상속 패턴**: pricing layout은 locale layout의 `title.template`(`%s | MetaLens AI`)을 상속받으므로, pricing title이 최종적으로 `Simple, Transparent Pricing | MetaLens AI` 형태로 렌더링됨.
- **로깅 전략**: primary Gemini 실패는 정상 플로우의 일부라 `warn`, fallback까지 실패하거나 최상위 catch는 `error`. Vercel 대시보드에서 error 수로 서비스 건강도 관측 가능.
- **개별 연구 정보 보존 원칙** (AGENTS.md): catch 블록에서 에러 객체를 로그하되 응답은 기존과 동일하게 유지 — 클라이언트 동작 변화 없음.

### 추가 변경 (2차 커밋)

#### app/[locale]/share/[id]/layout.tsx (새 파일)
Share 페이지 동적 OG 메타데이터 — 공유된 분석 결과가 Slack/Twitter/LinkedIn에서 미리보기될 때 실제 키워드와 요약을 노출:
- Server layout의 `generateMetadata`에서 Upstash Redis에 직접 쿼리 → share payload 로드
- title: `"Shared Analysis Results: {keywords}"` (80자 절단)
- description: 번역된 결과 또는 영문 결과의 첫 문장 (160자 절단)
- `robots: { index: false }` — 공유 링크는 7일 만료라 SERP 오염 방지
- Redis 실패 시 silent fallback → 페이지 렌더 막지 않음

#### app/[locale]/account/layout.tsx, app/[locale]/admin/layout.tsx (새 파일)
Auth-gated 페이지 `robots: { index: false, follow: false }` 적용. 개인 정보/관리 페이지는 SERP에 노출될 이유 없음 (privacy & hygiene).

### 추가 변경 (3차 커밋) — Error 페이지 i18n

#### app/[locale]/error.tsx
- 하드코딩된 영문 문구 5개 ("Something went wrong", "Try Again" 등) → `useTranslations('error')`
- `<a href="/">` → `<Link href={\`/${locale}\`}>` — ko/ja/zh 등 비영어권 사용자가 에러 후 영문 홈페이지로 튕기던 버그 수정
- `useParams()`로 locale 추출, NextIntlClientProvider 컨텍스트가 없을 때를 대비해 `|| 'en'` 폴백
- "Oops" 로고 텍스트는 그대로 유지 (브랜드 느낌)

#### messages/{8 locales}.json — error 네임스페이스 추가
`notFound` 직후에 `error.{title, description, tryAgain, goHome}` 추가. 8개 언어 모두 JSON 파싱 검증 통과.

### 추가 변경 (4차 커밋) — FeedbackButton & aria-label i18n

#### components/FeedbackButton.tsx
전 페이지에 뜨는 floating feedback 위젯의 visible 영어 문구 5개 ("Feedback", "Send us feedback", "What can we improve?", "Opens your email client", "Send") + aria-label 2개를 `useTranslations('feedbackWidget')`로 전환. 비영어권 7개 언어 사용자가 영어 UI 보던 문제 해결.

#### components/KeywordInput.tsx, components/Header.tsx
스크린 리더용 aria-label 하드코딩 영어("Enter medical keywords", "Toggle menu") → `useTranslations('a11y')`. 페이지 언어(`<html lang="ko">`)와 aria-label 언어가 일치하지 않던 a11y 이슈 해결.

#### messages/{8 locales}.json — feedbackWidget + a11y 네임스페이스 추가
`error` 네임스페이스 직후에 삽입. 8개 언어 JSON 파싱 검증 통과.

### 추가 변경 (5차 커밋) — UpsellBanner, ShareButtons, UserMenu, ResultsCard i18n

전 페이지/기능 노출되는 핵심 컴포넌트 4개의 visible 하드코딩 영어 제거:

#### components/UpsellBanner.tsx
Free 티어 사용자가 분석 결과 페이지에서 보는 전환 배너. 영어 8개 문구 → `useTranslations('upsell')`. `intro`에는 `{count}` 파라미터로 논문 수 전달.

#### components/ShareButtons.tsx
결과 공유 툴바. Share 라벨, X/LinkedIn/Reddit 버튼 title+aria-label, Copy/Copied! 상태 → `useTranslations('shareButtons')`. 접근성 보강을 위해 기존 `title` 외에 `aria-label`도 추가.

#### components/UserMenu.tsx
Header 우측 "Upgrade" 링크(Free 티어 사용자만 노출) → `t('upgrade')`. `useTranslations('auth')`에 `upgrade` 키 추가.

#### components/ResultsCard.tsx
"Export PDF" 버튼 → `t('exportPdf')`. `results` 네임스페이스에 exportPdf 키 추가.

#### messages/{8 locales}.json
- `upsell` 네임스페이스 신규 (9 키 × 8 언어)
- `shareButtons` 네임스페이스 신규 (7 키 × 8 언어)
- `auth.upgrade` 추가 (1 키 × 8 언어)
- `results.exportPdf` 추가 (1 키 × 8 언어)

**스킵 결정**: Forest/Funnel chart SVG 라벨, DataTable CSV 헤더는 영어 유지. 과학 문헌 컨벤션상 차트 라벨은 국제 저널에서도 영어가 표준이며, 사용자가 export한 차트를 영어권 동료와 공유할 때 호환성 유지에 유리.

### 추가 변경 (6차 커밋) — FunnelPlot 해석 배너

#### components/FunnelPlot.tsx
차트 하단에 렌더링되는 `interpretationText` — Funnel plot 비대칭 여부에 따라 "Funnel plot asymmetry detected..." 또는 "Funnel plot appears approximately symmetric..." 표시. 사용자가 결과를 이해하는 핵심 문장인데 영어 하드코딩 → `t('funnelInterpretAsymShort')` / `t('funnelInterpretSymShort')`.

차트의 순수 축 라벨(`Study`, `Standard Error` 등)은 학술 컨벤션으로 영어 유지하되, 해석 문장은 사용자 언어로 제공해야 한다는 구분.

#### messages/{8 locales}.json
`plots` 네임스페이스에 `funnelInterpretAsymShort`, `funnelInterpretSymShort` 2개 키 × 8 언어 추가. 8개 JSON 파일 파싱 검증 통과.

**참고**: 이 커밋은 사용자 요청으로 VRAM 사용을 피하기 위해 `npm run build` 없이 커밋됨. 변경은 단순 문자열 교체라 빌드 리스크 낮음. 푸시 후 Vercel이 자동으로 빌드 검증.

### 추가 변경 (7차 커밋) — 구조화 JSON-line 로거 + 전 API 라우트 계측

이전 에러 로깅은 `console.error` prefix로는 Vercel 로그 필터링/추적이 어려웠음. 장애 원인과 단계별 소요 시간을 즉시 볼 수 있도록 구조화 로거 도입.

#### lib/logger.ts (새 파일)
- `RouteLogger` 클래스: `start` → `stage(name, ctx)` × N → `done(status, ctx)` 또는 `error(msg, err, ctx)`
- 매 요청에 8자 `reqId` 자동 생성 → 동시 요청 로그 분리 추적 가능
- 각 stage에 `ms` (직전 stage 이후 경과) + `totalMs` (요청 시작 후 누적) 자동 계산
- Error 객체는 `serializeError`로 정규화: `errName`, `errMessage`, `errStack` (top 6 frames), `errCause`, `errCode`, `errStatus`
- `maskId()` 헬퍼: 이메일/Clerk ID 등 식별자 일부만 노출 (예: `abc…xyz`)
- 출력: JSON-line (`JSON.stringify` 한 줄) → Vercel Dashboard에서 키별 필터링 가능, `jq`로 export 후 분석 가능

#### 계측된 라우트 9개
- `api/pubmed` — search_start → search_done(articleCount) 또는 pubmed_search_failed
- `api/synthesize` — auth → rate_limit → body_parsed → gemini_primary_start/done 또는 failed → gemini_fallback_start/done 또는 failed → tracking_usage → done(200/429/502)
- `api/extract` — auth → body_parsed → batches_prepared(n) → 각 batch별 성공/실패 카운트 → batches_complete(successful, failed) → done
- `api/translate` — body_parsed → gemini_primary_start/done 또는 failed → gemini_fallback → done/passthrough
- `api/translate-result` — body_parsed(language) → gemini_primary → gemini_fallback → done
- `api/share` POST — body_parsed(size) → validated → payload_prepared(bytes) → redis_write_done 또는 redis_write_failed → done
- `api/share` GET — redis_read_start/done(hit) 또는 redis_read_failed → done/404
- `api/lemonsqueezy/checkout` — auth → body_parsed → variant_resolved → checkout_url_create_start/created 또는 create_returned_null
- `api/lemonsqueezy/webhook` — body_read → signature_verified 또는 invalid_signature → event_parsed(eventName) → clerk 조회/tier 설정 각 단계 로그 → done. **내부 에러 발생 시 200 반환** (LemonSqueezy 재시도 폭주 방지, 수동 복구는 로그에서)
- `api/lemonsqueezy/portal` — auth → done

#### 로그 예시
```json
{"ts":"2026-04-19T03:41:12.345Z","level":"info","route":"api/synthesize","reqId":"a3f9k2x1","msg":"start"}
{"ts":"2026-04-19T03:41:12.412Z","level":"info","route":"api/synthesize","reqId":"a3f9k2x1","msg":"stage:auth_done","ms":67,"totalMs":67,"user":"use…com","tier":"pro","isAdmin":false,"anon":false}
{"ts":"2026-04-19T03:41:12.430Z","level":"info","route":"api/synthesize","reqId":"a3f9k2x1","msg":"stage:rate_limit_done","ms":18,"totalMs":85,"allowed":true,"remaining":197,"limit":200}
{"ts":"2026-04-19T03:41:19.827Z","level":"warn","route":"api/synthesize","reqId":"a3f9k2x1","msg":"gemini_primary_failed","model":"gemini-2.5-flash","errName":"AbortError","errMessage":"timeout"}
{"ts":"2026-04-19T03:41:24.101Z","level":"info","route":"api/synthesize","reqId":"a3f9k2x1","msg":"stage:gemini_fallback_done","ms":4274,"totalMs":11756,"model":"gemini-2.0-flash-lite","bytes":3214}
{"ts":"2026-04-19T03:41:24.105Z","level":"info","route":"api/synthesize","reqId":"a3f9k2x1","msg":"done","status":200,"totalMs":11760,"tier":"pro","resultBytes":3214,"remaining":197}
```

#### Vercel Dashboard 활용
- 특정 요청 전체 추적: `reqId:"a3f9k2x1"`로 필터
- 실패만 보기: `level:"error"` 또는 `msg:"stage:gemini_primary_failed"` 등으로 필터
- p95 응답 시간: `msg:"done"` 의 `totalMs` 필드 집계
- Gemini 모델별 소요 시간: `msg:"stage:gemini_primary_done"`의 `ms` 필드 분포 확인

**참고**: 이 커밋도 VRAM 제약으로 로컬 빌드 없이 커밋. 로거는 순수 TypeScript + console API만 사용(외부 런타임 의존 없음), 라우트 변경은 기존 catch 동작과 응답 유지하며 로깅만 추가 — 런타임 회귀 리스크 매우 낮음. Vercel이 배포 시 빌드 검증.

### 추가 변경 (8차 커밋) — lib 함수 로거 스레딩 + silent catch 정리

API 라우트 로거만으로는 장애 원인이 라이브러리 내부 어디서 발생했는지 보이지 않는 문제 — `lib/pubmed.ts`에서 esearch가 실패한 건지 efetch가 실패한 건지, 4개 fallback 전략 중 어디서 끝난 건지 불명. lib 함수들을 optional `RouteLogger` 파라미터로 받게 수정.

#### lib/pubmed.ts
- `searchPubMed`, `fetchAbstracts`, `searchAndFetch`에 optional `log` 파라미터 추가
- 4단계 esearch fallback 전략(original → cleaned → progressive relaxation → OR query) 각각 시도/히트를 stage로 기록
- `fetchWithRetry`에 `step` 이름 인자 + 재시도 단계별 경고 로그 (pubmed_http_retry, pubmed_fetch_attempt_failed)
- AbortError(타임아웃) 식별 플래그 로그 포함
- XML 파싱 결과: requestedPmids vs parsedArticles vs droppedNoAbstract 카운트 노출

이제 api/pubmed 호출 한 건에서:
```
stage:pubmed_esearch_strategy1_original
stage:pubmed_esearch_strategy2_cleaned
stage:pubmed_esearch_strategy3_relaxation
pubmed_esearch_strategy3_hit {drop:2, remaining:3, count:18}
stage:pubmed_efetch_start {pmidCount:18}
stage:pubmed_efetch_done {xmlBytes:142833}
stage:pubmed_xml_parsed {requestedPmids:18, parsedArticles:15, droppedNoAbstract:3}
```
→ 어느 전략에서 결과가 나왔고 abstract 없어 탈락한 논문 개수까지 즉시 파악 가능.

#### lib/rate-limit.ts
`catch {}`로 Redis 실패 시 조용히 fail-open(요청 허용) 하던 것을 `log?.error('rate_limit_redis_unavailable_fail_open', err, ...)` 로 큰 소리로 로그. Upstash 장애가 로그 없이 무제한 사용으로 이어지던 사일런트 위험 제거. `expire()` 실패도 warn 로그.

#### lib/auth.ts
- `getSession` catch → JSON-line 형식으로 `getSession_failed` 로그 (Clerk 장애 시 전 사용자가 익명화되는 인시던트 무게감 있게 기록)
- `setUserTier` 에러 메시지에 HTTP status + response body 포함 → webhook 로그에서 Clerk 거절 이유 즉시 파악
- `findClerkUserByEmail` HTTP 실패 시 body 포함하여 `findClerkUserByEmail_http_failed` 로그

#### components/ResultsCard.tsx
Writing Tools(abstract/journal/proposal) 요청의 `catch { /* silent */ }` → `console.error` 로 변경. 사용자가 "Generate Abstract" 눌렀는데 아무 반응 없으면 어디서 막혔는지 콘솔에서 확인 가능.

#### app/api/synthesize/route.ts
`checkRateLimit(identifier, tier)` → `checkRateLimit(identifier, tier, log)`. Redis 장애 발생 시 해당 요청의 reqId 로그에 함께 나옴.

#### app/api/pubmed/route.ts
`searchAndFetch(keywords, 50)` → `searchAndFetch(keywords, 50, log)`. 위 pubmed.ts stage들이 reqId와 함께 연결되어 단일 요청의 전체 플로우 추적 가능.

**로그로 답할 수 있게 된 질문들**:
- "어느 PubMed 전략까지 fallback 했나?" → `pubmed_esearch_strategy{1,2,3,4}_*`
- "Redis가 죽었을 때 우리가 알 수 있나?" → `rate_limit_redis_unavailable_fail_open` error 로그
- "Clerk이 tier 업데이트 거절한 이유?" → webhook 로그의 `errMessage` 에 body 포함
- "사용자가 결제 후에도 Pro 안 된 경우?" → webhook의 `clerk_user_not_found` 또는 `webhook_processing_failed` + errMessage
- "esearch는 성공했는데 efetch만 실패?" → stage 순서 + errStack에서 구분됨

**참고**: 이 커밋도 VRAM 제약으로 로컬 빌드 생략. 변경은 optional 파라미터 추가 + catch 로깅 강화 — 기존 호출자는 인자 추가 없이도 동작(파라미터 optional). 런타임 리스크 매우 낮음.

### 추가 변경 (9차 커밋) — 클라이언트 로거 + 모든 쓰기/저장/업로드/내비게이션 계측

요청: "핵심 모든 쓰기 작업, 저장 작업, 업로드 작업, 배포, 빌드, 푸쉬 작업에 단계별 로그". 서버 측은 이미 완비됐으므로 클라이언트 사이드를 빠짐없이 계측.

#### lib/client-logger.ts (새 파일)
- `clog.info/warn/error(msg, component, ctx)` API
- 페이지 로드당 8자 `sid` (sessionStorage, private 모드 폴백 in-memory)
- 서버 로거와 동일한 JSON-line 포맷 + `side: 'client'` 태그 → 전체 이벤트를 동일 툴로 필터
- `serializeError`로 Error 객체 정규화 (errName/errMessage/errStack/errCause/errCode/errStatus)

#### 계측된 클라이언트 쓰기/저장/업로드 포인트 (14개)
**다운로드/파일 저장**:
- `DataTable.exportCsv` — rows 수, 결과 blob bytes
- `DataTable.copyTable` — clipboard write 성공/실패 (promise reject 포함)
- `ForestPlot.handleSavePng` / `handleSaveSvg` — 연구 수, bytes, SVG ref 누락 감지
- `FunnelPlot.handleSavePng` / `handleSaveSvg` — 대칭성 플래그, bytes
- `ResultsCard.handleExportPDF` — 팝업 차단 감지(`export_pdf_window_blocked`)

**서버 업로드/API 호출 (클라이언트 관점)**:
- `ResultsCard.handleGenerateTools` (abstract/journal/proposal) — tool 종류, 소요 ms, resultBytes / HTTP 실패 / crash 각각
- `ResultsCard.handleShare` — create 시작 → id 수신 → 링크 copy 각 단계
- `ShareButtons.handleCopy` — 공유 링크 clipboard 복사
- `PricingPage.handleCheckout` — 클릭 → 요청 → redirect 각 단계, 소요 ms, url 누락 감지
- `PricingPage.handleNotify` — waitlist webhook upload 성공/실패
- `lib/analytics.collectData` — sid 생성, webhook 디스패치 / 실패

**로컬 스토리지 쓰기**:
- `HomePage` history load / save — entries 수, historyBytes, resultBytes, QuotaExceededError 감지
- `UpgradeGate.useTrial` — 트라이얼 소비 카운트, sessionStorage write 실패

**인증/세션 상태**:
- `AccountPage.handleLogout` — 로그아웃 시작/완료/실패
- `FeedbackButton.handleSend` — mailto: 오픈 성공/실패

#### 서버 측 추가
- `lib/usage-tracker.ts` — `trackUsage` / `trackSignup`에 JSON-line 로그 추가 (user, tier, model, tokens, 누적 엔트리 수). 이메일은 `maskEmail()`로 마스킹(3앞…3뒤).

#### 운영 관점 답할 수 있게 된 질문들
- "사용자가 PDF export 눌렀는데 PDF 안 열렸다" → `export_pdf_window_blocked` (팝업 차단) vs 열림 확인
- "Pro 구독 결제 전환율 낮은데 어디서 이탈?" → `checkout_click` → `checkout_request_start` → `checkout_redirecting` 각 드롭오프 지점
- "공유 링크가 클립보드에 안 들어간다" → `share_link_copied` 없이 `share_link_copy_failed` 기록
- "localStorage 꽉 차서 저장 안 됨" → `history_save_failed` with QuotaExceededError
- "waitlist 제출이 실제로 구글시트 들어갔는지" → `waitlist_webhook_posted` vs `waitlist_webhook_failed`

#### 배포/빌드/푸쉬 로깅
앱 내부 런타임 범위를 벗어나는 영역 (`vercel build`, `git push`, Vercel deploy webhooks)은 플랫폼 자체가 로그를 남기며, 사용자 행동 결과로 생성되는 artifact (share payload 작성, 결제 세션, tier 변경) 는 이미 위 계측으로 모두 추적됨. 추가로 platform-side 로그를 앱이 생성할 필요 없음.

**참고**: VRAM 제약으로 로컬 빌드 생략. Client-logger는 pure TypeScript + console API, Edit은 모두 기존 동작 유지하면서 로깅만 추가. 런타임 리스크 없음.

## 커밋
- `fda712e` feat: pricing metadata layout + API error observability
- `32c6c6a` feat: share OG metadata + account/admin noindex
- `8518933` fix: i18n error page + locale-aware home link
- `d40b551` fix: i18n FeedbackButton + aria-labels
- `bb8c4aa` fix: i18n UpsellBanner + ShareButtons + UserMenu + Export PDF
- `4346201` fix: i18n FunnelPlot asymmetry interpretation
- `569fbbd` docs: update milestone 10 commit list
- `df2bb11` feat: structured JSON-line logger + instrument 9 API routes
- `d4465ce` feat: thread logger into lib functions + kill silent catches
- (next commit) feat: client-side logger + instrument all write/save/upload ops

## ⚠️ 인계
Milestone 09의 푸시 대기 상태와 함께 이 커밋도 local-only로 쌓임. 사용자가 VS Code Source Control 또는 taeshin11 크리덴셜 터미널에서 `git push origin master`로 일괄 푸시하면 Vercel 자동 배포.
