# Milestone 00 — MVP 출시

**날짜:** 2026-03-31  
**커밋:** `2026-03-31 18:34` ~ `18:56`  
**상태:** 완료

## 개요

MetaLens AI 최초 동작 버전. PubMed API + AI 합성 파이프라인으로 키워드 입력 → 메타분석 결과 출력.

## 완성된 기능

| ID | 기능 |
|----|------|
| 1 | Project Setup & Scaffold (Next.js) |
| 2 | Landing Page & Hero |
| 3 | PubMed API Integration |
| 4 | AI Synthesis Engine (Gemini) |
| 5 | Results Display |
| 6 | Responsive Design |
| 7 | Soft Color Theme |
| 8 | Google Sheets Silent Data Collection |
| 9 | Feedback mailto Link |
| 10 | SEO Optimization |
| 11 | i18n Auto-Detection (8개 언어: en, ko, ja, zh, de, fr, es, pt) |
| 12 | About/Privacy/Terms Pages |
| 13 | Loading States & Error Handling |
| 14 | Vercel Deployment |
| 15 | GitHub Repo Setup |
| 16 | Non-English Keyword Translation |
| 17 | JSON-LD Structured Data |

## 핵심 결정사항

- AI: Pollinations.ai → 이후 Gemini로 교체 (무료 API)
- 서버사이드 API 라우트로 AI 호출 (CORS 우회)
- i18n: next-intl, 8개 언어 자동 감지
- 배포: Vercel

## 기술 스택

- Next.js 16, TypeScript, Tailwind CSS
- PubMed E-utilities API
- Google Gemini API
- Vercel (배포)
