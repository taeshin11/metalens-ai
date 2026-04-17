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

## 커밋
- (next commit) perf: pricing metadata layout + API error observability

## ⚠️ 인계
Milestone 09의 푸시 대기 상태와 함께 이 커밋도 local-only로 쌓임. 사용자가 VS Code Source Control 또는 taeshin11 크리덴셜 터미널에서 `git push origin master`로 일괄 푸시하면 Vercel 자동 배포.
