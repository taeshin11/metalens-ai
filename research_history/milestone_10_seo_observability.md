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

## 커밋
- `fda712e` feat: pricing metadata layout + API error observability
- `32c6c6a` feat: share OG metadata + account/admin noindex
- `8518933` fix: i18n error page + locale-aware home link
- `d40b551` fix: i18n FeedbackButton + aria-labels
- (next commit) fix: i18n UpsellBanner + ShareButtons + UserMenu + Export PDF

## ⚠️ 인계
Milestone 09의 푸시 대기 상태와 함께 이 커밋도 local-only로 쌓임. 사용자가 VS Code Source Control 또는 taeshin11 크리덴셜 터미널에서 `git push origin master`로 일괄 푸시하면 Vercel 자동 배포.
