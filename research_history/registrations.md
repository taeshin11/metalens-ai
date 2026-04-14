# 외부 서비스 등록 현황

사이트를 등록/제출한 외부 서비스 목록. 앞으로 새로 등록할 때마다 여기에 추가.

---

## 검색 엔진 / 포털 웹마스터 도구

| 서비스 | 상태 | 인증 방식 | 인증 코드 | 등록일 | 비고 |
|--------|------|----------|----------|--------|------|
| **Google Search Console** | ✅ 인증 완료 | 메타태그 | `WddgcbVJsL2BG...` (코드 1) `aNnJOiFANf2b...` (코드 2) | 2026-04-11 이전 | layout.tsx 하드코딩 |
| **Naver Search Advisor** | ✅ 인증 완료 | 메타태그 | `d181f015498ff7d7b280da0749bce165a3b44e01` | 2026-04-11 | layout.tsx `naver-site-verification` |
| **Bing Webmaster Tools** | ⏳ 인증 코드 대기 | 메타태그 | env: `NEXT_PUBLIC_BING_VERIFICATION` | 미등록 | Vercel 환경변수 설정 필요 |
| **Yandex Webmaster** | ⏳ 인증 코드 대기 | 메타태그 | env: `NEXT_PUBLIC_YANDEX_VERIFICATION` | 미등록 | Vercel 환경변수 설정 필요 |
| **Baidu Webmaster (站长工具)** | ⏳ 인증 코드 대기 | 메타태그 | env: `NEXT_PUBLIC_BAIDU_VERIFICATION` | 미등록 | Vercel 환경변수 설정 필요 |
| **Daum / Kakao (다음)** | ❌ 미등록 | — | — | — | 트래픽 낮아 우선순위 낮음 |

---

## 결제 / 구독

| 서비스 | 상태 | 등록일 | 비고 |
|--------|------|--------|------|
| **Lemon Squeezy** | ✅ 코드 완성 | 2026-04-06 | checkout/webhook/portal API 라우트 구현 완료. env var 설정 필요: `LEMONSQUEEZY_API_KEY`, `LS_VARIANT_PRO_MONTHLY`, `LS_VARIANT_PRO_YEARLY`, `LS_WEBHOOK_SECRET` |

---

## 인증 / 분석

| 서비스 | 상태 | 등록일 | 비고 |
|--------|------|--------|------|
| **Clerk (Auth)** | ✅ 운영 중 | 2026-04-06 | env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| **Upstash Redis** | ✅ 운영 중 | 2026-04-06 | rate limit용. env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| **Google Analytics** | ✅ 코드 준비 | — | env: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (현재 `G-XXXXXXXXXX` 플레이스홀더) |
| **Google Gemini API** | ✅ 운영 중 | 2026-03-31 | env: `GEMINI_API_KEY` |
| **Anthropic Claude API** | ✅ 코드 준비 | 2026-04-15 | Pro/Ultra 유저용. env: `ANTHROPIC_API_KEY` (Vercel에 추가 필요) |

---

## 디렉토리 / 커뮤니티 제출 (미완)

| 서비스 | 상태 | 비고 |
|--------|------|------|
| Product Hunt | ❌ 미제출 | 론칭 준비 되면 제출 |
| Hacker News (Show HN) | ❌ 미제출 | |
| Reddit (r/medicalschool 등) | ❌ 미제출 | |
| AlternativeTo.net | ❌ 미제출 | |
| Indie Hackers | ❌ 미제출 | |

---

## Vercel 환경변수 상태

아래 env vars가 Vercel에 설정되어 있어야 정상 동작:

```
# 필수 (운영 중)
GEMINI_API_KEY               ✅
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  ✅
CLERK_SECRET_KEY             ✅
UPSTASH_REDIS_REST_URL       ✅
UPSTASH_REDIS_REST_TOKEN     ✅
NEXT_PUBLIC_SITE_URL         ✅

# 추가 필요
ANTHROPIC_API_KEY            ❌ Pro/Ultra 유저 Claude API
NEXT_PUBLIC_GA_MEASUREMENT_ID  ❌ Google Analytics 실제 ID
NEXT_PUBLIC_BING_VERIFICATION  ❌ Bing 웹마스터 인증
NEXT_PUBLIC_YANDEX_VERIFICATION ❌ Yandex 웹마스터 인증
NEXT_PUBLIC_BAIDU_VERIFICATION  ❌ Baidu 웹마스터 인증
LEMONSQUEEZY_API_KEY         ❓ 설정 여부 미확인
LS_VARIANT_PRO_MONTHLY       ❓ 설정 여부 미확인
LS_VARIANT_PRO_YEARLY        ❓ 설정 여부 미확인
LS_WEBHOOK_SECRET            ❓ 설정 여부 미확인
```
