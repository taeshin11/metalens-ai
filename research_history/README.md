# MetaLens Research History

마일스톤별 개발 기록. 커밋 단위가 아닌 의미있는 변화 단위로 기록.

## 파일 구조

```
research_history/
  README.md              — 이 파일 (인덱스)
  registrations.md       — 외부 서비스 등록/제출 현황 (항상 최신 유지)
  milestone_00_mvp.md    — MVP 출시 (2026-03-31)
  milestone_01_seo.md    — SEO & 콘텐츠 인프라 (2026-03-31)
  milestone_02_auth.md   — 인증/결제/요금제 (2026-04-06)
  milestone_03_ux.md     — UX 개선 & AI 안정화 (2026-04-07~09)
  milestone_04_tools.md  — Writing Tools 확장 (2026-04-11~15)
  milestone_05_polish.md — 광고 제거, Claude API, Citation, Consensus (2026-04-15)
  milestone_06_share_blog.md — Share, 7-lang 블로그, Claude 롤백 (2026-04-15)
  milestone_07_remove_ultra.md — Ultra 플랜 제거 (2026-04-15)
  milestone_08_i18n_quality.md — i18n 완성 & 품질 개선 (2026-04-16)
  milestone_09_perf_optimization.md — 프로덕션 최적화 & 정리 (2026-04-17)
  milestone_10_seo_observability.md — Pricing 메타데이터 & API 관측성 (2026-04-18~19)
  incident_2026-04-20_deployment_not_found.md — 프로덕션 배포 실종 (2026-04-20) ← 현재
```

## 마일스톤 요약

| # | 이름 | 날짜 | 주요 변경 |
|---|------|------|-----------|
| 00 | MVP | 2026-03-31 | 핵심 기능 완성 |
| 01 | SEO & 콘텐츠 | 2026-03-31 | 블로그, 비교 페이지, RSS |
| 02 | 인증/결제 | 2026-04-06 | Clerk + Redis + LemonSqueezy |
| 03 | UX & AI 안정화 | 2026-04-07~09 | 로딩 개선, AI 폴백, SEO 강화 |
| 04 | Writing Tools 확장 | 2026-04-11~15 | Proposal 생성기, PDF 내보내기, 블로그 10개 |
| 05 | 광고 제거 & AI 업그레이드 | 2026-04-15 | AdSense 제거, Claude API, Citation, Consensus Meter |
| 06 | Share & 다국어 블로그 | 2026-04-15 | Share Results, 블로그 7개 언어 추가, Claude API 롤백 |
| 07 | Ultra 플랜 제거 | 2026-04-15 | 티어 시스템을 free/pro 2단계로 축소, i18n/문서 정리 |
| 08 | i18n 완성 & 품질 개선 | 2026-04-16 | 6개 언어 48키 번역, 에러 바운더리, BETA_END 통합 |
| 09 | 프로덕션 최적화 & 정리 | 2026-04-17 | next.config 튜닝, viewport export, Share 링크 i18n 버그 수정 |
| 10 | Pricing 메타데이터 & API 관측성 | 2026-04-18 | pricing layout metadata (8 locale), API catch 로깅 7개 라우트 |
