# Milestone 03 — UX 개선 & AI 안정화

**날짜:** 2026-04-07 ~ 2026-04-11  
**커밋:** `06e0dc1` ~ `46bd663`  
**상태:** 완료

## 개요

사용자 경험 개선과 AI 파이프라인 안정화. Pollinations 완전 제거, 추출 로딩 UX 개선, SEO 강화.

## 주요 변경

### AI 안정화
- **Pollinations 완전 제거** — Gemini 단일 소스로 통합 (신뢰성 확보)
- `reasoning_content` 필드 무시 처리 (AI 응답 파싱 버그 수정)
- AI 실패 감지 + 모델 폴백 로직 추가 (Feature #32)
- PubMed API 재시도 로직 (Feature #33, 3회 재시도)

### 추출 로딩 UX (Feature a6c2f57)
- 단계별 진행 메시지 표시 ("Searching PubMed...", "Extracting data...", etc.)
- 경과 시간 카운터 (extractSeconds i18n 키)
- 배치 카운트 메시지 제거 → 더 깔끔한 UI

### SEO 강화
- Naver/Baidu/Yandex/Bing 크롤러 허용 (`robots.txt`)
- Naver 사이트 인증 메타태그 추가
- AdSense 준비 인프라

### 기타 UX
- Writing Tools 탭 i18n 완성 (abstract, journal 버튼 번역)
- 검색 시작 시 로딩 영역으로 자동 스크롤
- 로고 클릭 시 홈으로 리셋
- 번역 요약 섹션 (Feature #28)

## 제거된 것들

- Pollinations.ai 관련 모든 코드 및 문서
- SPINAI 관련 `free`/`equality` 문구
- AI 응답에서 Gemini 브랜딩 노출

## 기술 결정

- AI: Gemini 단일화 → 응답 일관성 향상
- i18n: 8개 언어 모두 동기화 유지 규칙 확립
