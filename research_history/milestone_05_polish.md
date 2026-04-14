# Milestone 05 — 광고 제거, AI 업그레이드, 인용/합의 기능

**날짜:** 2026-04-15  
**커밋:** `70d6983`  
**상태:** 완료

## 개요

광고 완전 제거, Pro 유저 Claude API 전환, Citation Generator + Consensus Meter 추가, 각국 포털 SEO 강화.

## 완성된 기능

| ID | 기능 |
|----|------|
| 37 | Google AdSense 완전 제거 |
| 38 | Pro/Ultra 유저 → Claude Sonnet 4.6 API (Gemini fallback) |
| 39 | Citation Generator (APA / MLA / Vancouver) |
| 40 | Consensus Meter (근거 합의 수준 게이지) |
| 41 | 각국 포털 SEO 강화 (Naver/Baidu/Yandex/Bing 메타태그) |

## 세부 사항

### AdSense 제거 (#37)
- `app/[locale]/layout.tsx`: AdSense 스크립트 + meta 태그 삭제
- `components/ResultsCard.tsx`: AdBanner import + 렌더링 삭제
- `privacy/page.tsx`: AdSense 쿠키 섹션 삭제, 메타 설명 업데이트
- `faq/page.tsx`: AdSense 언급 → Google Analytics만 남김
- `terms/page.tsx`: 서드파티 서비스 목록에서 AdSense 제거
- `components/AdBanner.tsx` 파일은 그대로 유지 (참조용, 사용 안 함)

### Claude API (#38)
- `lib/constants.ts`: pro/ultra 모델 → `claude-sonnet-4-6`
- `app/api/synthesize/route.ts`: Pro/Ultra → Claude 먼저 시도 → 실패시 Gemini 2.5 Flash → Gemini Flash-Lite 순서
- 필요 env var: `ANTHROPIC_API_KEY` (Vercel에 추가 필요)

### Citation Generator (#39)
- Writing Tools 탭에 새 섹션 추가
- 3가지 포맷: APA / MLA / Vancouver
- 서버 호출 없음 — 기존 articles 데이터로 클라이언트에서 포맷
- "Copy All" 버튼, 복사 완료 피드백
- 8개 언어 i18n

### Consensus Meter (#40)
- Summary 탭 Key Findings 카드 아래 위치
- 원형 게이지 (SVG), 점수 0~100%
- 4단계: Strong / Moderate / Mixed / Limited
- AI 요약 텍스트에서 합의/불일치 키워드 휴리스틱 분석
- 8개 언어 i18n

### 각국 포털 SEO (#41)
- `app/[locale]/layout.tsx` 메타태그 강화:
  - Naver: `NaverBot`, `Yeti`, `me2:post_tag` (한국어 태그 포함)
  - Baidu: `Cache-Control: no-transform`, zh 로케일 notranslate
  - Bing: `msnbot` 명시
  - Yandex: `yandex: all`
  - Yahoo Japan: `og:locale:alternate`

## Vercel 환경변수 추가 필요
- `ANTHROPIC_API_KEY` — Pro 유저 Claude API 사용에 필요

## 기존 확인 사항
- Advanced Filters: 이미 완전 구현 (KeywordInput + buildPubMedQuery)
- Research Gap Finder: 이미 완전 구현 (GAP_FINDER_PROMPT, mode prop)
- Google Search Console: layout.tsx에 2개의 google verification 코드 하드코딩 완료
