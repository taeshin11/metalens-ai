# Milestone 01 — SEO & 콘텐츠 인프라

**날짜:** 2026-03-31 (오후)  
**커밋:** `19:16` ~ `19:53`  
**상태:** 완료

## 개요

MVP 이후 SEO 트래픽 확보를 위한 콘텐츠 인프라 구축. 블로그, 비교 페이지, 동적 OG 이미지, RSS 피드.

## 완성된 기능

| ID | 기능 |
|----|------|
| 18 | How It Works Page |
| 19 | FAQ Page with Schema |
| 20 | Custom 404 Page |
| 21 | Floating Feedback Button |
| 22 | Blog Pages (3 SEO 포스트) |
| 23 | Use Cases Page |
| 24 | Programmatic Drug Comparison Pages (6개) |
| 25 | Homepage Below-the-Fold Sections |
| 26 | Blog RSS Feed |
| 27 | Next.js 16 Proxy Migration |

## 세부 사항

### 블로그 (초기 3개 포스트)
- "What Is a Meta-Analysis?" (입문자용)
- "How AI Is Transforming Medical Research in 2026"
- "How to Compare Drug Efficacy"

### 약물 비교 페이지 (Programmatic SEO)
- aspirin-vs-ibuprofen, metformin-vs-glipizide 등 6개
- `/compare/[slug]` 동적 라우트
- 키워드 자동 채워서 분석 트리거

### 기술 변경
- middleware.ts → proxy.ts (Next.js 16 호환)
- 동적 OG 이미지 생성 (`/api/og`)
- RSS 피드: `/feed.xml`

## 목표

Google 자연 검색 트래픽 유입. "meta-analysis", "drug comparison" 키워드 타겟.
