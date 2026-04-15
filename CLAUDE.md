@AGENTS.md

# MetaLens AI — 프로젝트 컨텍스트

## 개요
PubMed 기반 AI 메타분석 도구. 키워드 입력 → PubMed 검색 → Gemini AI 합성 → 결과 표시.
URL: https://metalens-ai.vercel.app | GitHub: https://github.com/taeshin11/metalens-ai

## 기술 스택
- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS
- **Auth**: Clerk
- **DB/Cache**: Upstash Redis (rate limit + share 결과 저장)
- **AI**: Google Gemini 2.5 Flash (전 티어 동일 — Claude API 사용 안 함)
- **Payments**: Lemon Squeezy
- **i18n**: next-intl, 8개 언어 (en, ko, ja, zh, de, fr, es, pt)
- **Hosting**: Vercel

## 플랜 구조
- **Free**: 평생 3회, Gemini 2.5 Flash
- **Pro**: 하루 200회, Gemini 2.5 Flash ($4.99/mo, $39.99/yr)
- Ultra 플랜은 제거됨 (2026-04-15)

## 핵심 결정사항
- Pro 유저도 Claude API 아닌 Gemini 사용 (변경 금지)
- AdSense 없음 (제거됨)
- PRD.md 절대 삭제 금지

## 주요 기능 (구현 완료)
- Meta-Analysis 모드 + Research Gap Finder 모드
- Advanced Filters (날짜, 연구 유형, 저자 수)
- Consensus Meter (SVG 게이지)
- Citation Generator (APA/MLA/Vancouver, 클라이언트 사이드)
- Share Results (/api/share → Redis 7일 TTL, /[locale]/share/[id])
- 블로그 10개 포스트 × 8개 언어 (lib/blog-content-*.ts)
- Export PDF (jsPDF)
- 검색엔진 최적화: Google(✅), Naver(✅), Bing/Yandex/Baidu(env var 대기)

## 수작업 필요 항목
- Vercel env vars: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_BING_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION`, `NEXT_PUBLIC_BAIDU_VERIFICATION`
- Bing/Yandex/Baidu 웹마스터 등록
- LemonSqueezy 결제 플로우 테스트
- Clerk 대시보드: Email magic link 활성화

## research_history/ 규칙
기능 묶음 완성될 때마다 `research_history/milestone_NN_*.md` 파일 자동 생성 + README.md 업데이트. 물어보지 않아도 알아서 할 것.

## 피드백 기억
- AI 요약은 가이드라인/메타분석 우선, 개별 연구 후순위
- 임휘빈 피드백: 유료 기능으로 초록 작성, SCI 저널 추천, 논문 초안 기능 추가 예정
