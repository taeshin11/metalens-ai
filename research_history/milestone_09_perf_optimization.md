# Milestone 09 — 프로덕션 최적화 & 정리 (2026-04-17)

## 배경
Milestone 08 완료 후 정기 품질 감사에서 발견된 low-risk 최적화 항목들을 적용. Next.js 16 App Router 기준으로 production checklist 기본값을 맞추고, AdSense 제거 잔재, i18n 버그를 정리.

## 코드 변경

### next.config.ts — production best practices
- `compress: true` (명시적 gzip)
- `poweredByHeader: false` (`X-Powered-By` 헤더 제거)
- `experimental.optimizePackageImports`: `framer-motion`, `next-intl`, `@clerk/nextjs` — barrel import tree-shaking

### app/[locale]/layout.tsx
- `Viewport` export 추가 (Next.js 15+ 표준 패턴): device-width, initialScale, prefers-color-scheme 기반 themeColor
- `pagead2.googlesyndication.com` preconnect 제거 — AdSense 제거 milestone 05에서 누락된 잔재

### components/ShareButtons.tsx
- 하드코딩된 `/en` locale을 `useLocale()`로 수정 — ja/zh/de/fr/es/pt/ko 사용자가 공유한 링크가 영어로 열리던 i18n 버그 수정

### .gitignore
- `/.claude/scheduled_tasks.lock` 추가 (Claude Code runtime artifact)

### 파일 정리
- U+F022 (PUA) 유니코드로 이름 지어진 0-byte junk file 삭제 (실수로 생성된 것)

## 확인
- `npx tsc --noEmit` 통과
- `npm run build` 성공 (Next.js 16.2.1 Turbopack, 15 static pages)
- 모든 route가 기존과 동일하게 빌드됨 (/api/*, /[locale]/*, /sitemap.xml 등)

## 주목할 점
- **Beta 기간 만료**: `BETA_END = 2026-04-16T00:00:00Z`. 오늘(2026-04-17)부터는 logged-in 유저도 일반 rate limit 적용 — 의도된 동작.
- metadataBase 경고는 기존부터 있던 것. 자식 페이지들이 OG 이미지를 자체 설정하지 않으므로 실무적으로 문제 없음.
