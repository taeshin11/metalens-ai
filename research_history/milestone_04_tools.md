# Milestone 04 — Writing Tools 확장 + 블로그 확장

**날짜:** 2026-04-11 ~ 2026-04-15  
**상태:** 완료 (미커밋)

## 개요

프리미엄 Writing Tools에 Research Proposal 생성기 추가, PDF 내보내기 기능, 블로그 3개 → 10개 확장.

## 완성된 기능

### Feature #34 — Research Proposal Draft Generator
- **파일:** `components/ResultsCard.tsx`
- Tools 탭에 "Research Proposal Draft" 섹션 추가
- 메타분석 결과 기반으로 구조화된 연구제안서 생성
- 포함 섹션: Title, Introduction & Background, Research Objectives, Hypotheses, Methods (Study Design / Participants / Intervention / Outcomes / Statistical Analysis), Expected Outcomes, Limitations
- 복사 버튼, 재생성 버튼, 면책 문구
- i18n: `proposalTitle`, `proposalDesc`, `proposalBtn`, `proposalHint`, `proposalDisclaimer` (8개 언어)

### Feature #35 — PDF Report Export
- **파일:** `components/ResultsCard.tsx`
- 결과 헤더 영역 (공유 버튼 옆)에 "Export PDF" 버튼 추가
- 브라우저 `window.print()` 활용 — 서버 의존 없음
- 내보내기 내용: Keywords, 논문 수, 생성 날짜, AI 요약, 출처 목록 (PubMed 링크 포함)
- Print-ready HTML 스타일 (A4 레이아웃)

### Feature #36 — Blog Expansion (3 → 10개)
- **파일:** `app/[locale]/blog/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`, `messages/*.json`, `app/sitemap.ts`
- 신규 포스트 7개:
  - post4: Forest Plots and Funnel Plots (통계 시각화)
  - post5: How to Write a Systematic Review Protocol (PRISMA)
  - post6: Publication Bias (funnel plot 해석)
  - post7: p-Values and Statistical Significance
  - post8: Evidence-Based Medicine (EBM 실무 가이드)
  - post9: How to Write a Research Grant Proposal
  - post10: Systematic Review vs Meta-Analysis
- 신규 태그: Statistics, Clinical, Research
- sitemap.ts 업데이트

## i18n 변경

모든 8개 언어 파일 (`en`, `ko`, `ja`, `zh`, `de`, `fr`, `es`, `pt`) 동기화:
- Writing Tools: `proposalTitle`, `proposalDesc`, `proposalBtn`, `proposalHint`, `proposalDisclaimer`
- Blog: `tagStatistics`, `tagClinical`, `tagResearch`, post4~10 제목/요약

## 다음 고려사항

- [ ] 블로그 포스트 본문 실제 작성 (현재 excerpt만 있음)
- [ ] Writing Tools 프리미엄 게이팅 확인
- [ ] PDF 내보내기 모바일 테스트
