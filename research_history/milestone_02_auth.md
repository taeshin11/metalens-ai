# Milestone 02 — 인증 / 결제 / 요금제

**날짜:** 2026-04-06  
**커밋:** `0de1b08` ~ `d3a36e7`  
**상태:** 완료

## 개요

무료 서비스에서 유료 SaaS로 전환. Clerk 인증, Upstash Redis 속도 제한, Lemon Squeezy 결제를 한 번에 붙임.

## 완성된 기능

### 인증 (Clerk)
- 로그인/회원가입 (Google, 이메일)
- 미로그인 사용자: 검색 1회 허용 → 로그인 유도
- 로그인 무료 사용자: 5회/일
- 관리자 이메일 (taeshinkim11@gmail.com): 제한 없음

### 속도 제한 (Upstash Redis)
- 서버사이드 rate limit (`/api/search`)
- Redis 연결 실패 시 fallback → 제한 없이 통과 (서비스 중단 방지)
- 무료 플랜: 5/일, 프리미엄: 무제한

### 결제 (Lemon Squeezy)
- `/api/lemonsqueezy` 체크아웃 API
- Pricing 페이지 체크아웃 버튼 활성화
- Webhook 처리 (구매 완료 → 사용자 티어 업그레이드)
- 미들웨어에서 `/api/*` 경로 intl 리다이렉트 제외 처리

### 검색 이력
- localStorage에 최대 20개 저장
- 이력 클릭 시 저장된 결과 바로 표시 (재검색 없음)
- 탭 발견 카드 (홈 화면 하단)

## 기술 결정

- Stripe → Lemon Squeezy 교체 (VAT 자동 처리, 개인 개발자 친화)
- Redis PubSub 실패 시 graceful degradation
- 관리자 우회 로직: 이메일 화이트리스트

## 요금제 구조

| 플랜 | 가격 | 검색 | Writing Tools |
|------|------|------|---------------|
| Free | $0 | 5/일 | 제한 |
| Premium | $X/월 | 무제한 | 전체 |
