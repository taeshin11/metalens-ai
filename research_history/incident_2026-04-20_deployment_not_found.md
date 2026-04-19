# Incident — Production DEPLOYMENT_NOT_FOUND (2026-04-20)

## 발견
2026-04-20, 사용자가 `https://metalens-ai.com/` 접속 시 아무것도 뜨지 않는다고 보고. Milestone 10까지의 13개 로컬 커밋은 아직 origin에 푸시되지 않은 상태.

## 진단
```bash
$ curl -sSI -L https://metalens-ai.com/
HTTP/1.1 404 Not Found
X-Vercel-Error: DEPLOYMENT_NOT_FOUND
Server: Vercel

$ curl -sSI -L https://metalens-ai.vercel.app/
HTTP/1.1 404 Not Found
X-Vercel-Error: DEPLOYMENT_NOT_FOUND

$ nslookup metalens-ai.com
Address: 76.76.21.21  # Vercel anycast IP — DNS 정상
```

두 도메인 모두 `X-Vercel-Error: DEPLOYMENT_NOT_FOUND`. DNS는 Vercel을 정상적으로 가리키나 Vercel 쪽에 **활성 production 배포가 존재하지 않음**.

## 근본 원인 후보 (Vercel 대시보드 확인 필요)
1. Vercel 프로젝트 자체가 삭제/아카이브됨 (SpinAIceo Team)
2. GitHub 통합 끊김 → 최근 빌드 없음 + 기존 프로덕션 자동 만료
3. Production 배포가 수동 Archive/Delete 됨
4. 도메인(`metalens-ai.com`, `metalens-ai.vercel.app`)이 프로젝트에서 해제됨

## 코드 측 상태 (문제 원인 아님)
- Origin master HEAD: `87c29d2` (milestone 08 stable, 이전에 정상 배포되던 상태)
- Local master HEAD: `4abd5d0` (milestone 10 part 9 + FEATURES.md)
- 로컬 13 커밋은 아직 미푸시 — **이 커밋들이 인시던트의 원인 아님** (푸시 전에도 프로덕션이 돌고 있었어야 함)
- 코드 변경으로 해결 불가. Vercel 대시보드 복구 필수.

## 영향
- 프로덕션 접속 불가 → 전체 사용자 차단
- 런치 준비 체크리스트 (Bing/Yandex/Baidu 등록, LemonSqueezy 테스트 등) 진행 불가
- 13 커밋(i18n 완성 + SEO 메타데이터 + 구조화 로깅 + 클라이언트 계측)의 효과 검증 불가능

## 복구 절차 (사용자 수행)
1. **Vercel Dashboard 상태 확인**: `https://vercel.com/spinaiceo/metalens-ai`
   - 프로젝트 존재 여부
   - Deployments 탭의 최근 빌드 상태
   - Settings → Domains (2개 도메인 연결 확인)
   - Settings → Git (`taeshin11/metalens-ai` 연결 확인)
2. **프로젝트 남아 있으면**: `git push origin master` → 13 커밋 푸시 → Vercel 자동 빌드 → 배포 복구
3. **프로젝트 사라졌으면**:
   - Vercel에서 신규 import (GitHub → `taeshin11/metalens-ai`)
   - Env vars 전체 복원 (Clerk, Upstash, Gemini, LemonSqueezy 키)
   - Domains에 `metalens-ai.com` 재연결 (DNS는 이미 맞음)
   - `master` 푸시 → 배포

## 필요 env vars (복구 시 재입력)
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `GEMINI_API_KEY`
- `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `LEMONSQUEEZY_STORE_ID`, `LS_VARIANT_PRO_MONTHLY`, `LS_VARIANT_PRO_YEARLY`, `LEMONSQUEEZY_PORTAL_URL`
- `NEXT_PUBLIC_SITE_URL=https://metalens-ai.com`
- (옵션) `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_BING_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION`, `NEXT_PUBLIC_BAIDU_VERIFICATION`, `NEXT_PUBLIC_SHEETS_WEBHOOK`

## 상태
- 발견: 2026-04-20
- 진단 완료
- **복구 대기**: 사용자의 Vercel 대시보드 확인 필요

## 교훈
- **Deploy healthcheck 누락**: Vercel 프로젝트 상태를 외부에서 감지할 수단 없었음. 향후 UptimeRobot / Vercel 자체 모니터링 / cron ping 등 고려.
- **푸시 병목**: taeshin11 계정으로의 푸시가 Claude 세션에서 막혀 12일간(2026-04-08 ~ 04-20) 로컬에만 13 커밋이 쌓임. 사용자 수동 푸시 필요한 구조가 배포 지연 위험.
