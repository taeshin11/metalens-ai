# Milestone 07 — Ultra 플랜 제거 (2026-04-15)

## 배경
결제 테스트 직전 단계에서 Ultra 플랜 운영 포기 결정. Pro만 유지하고 Ultra의 상위 기능은 모두 Pro에 포함.

## 코드 변경
- `lib/constants.ts`: `Tier = 'free' | 'pro'` (ultra 제거), `TIER_CONFIG.ultra` 삭제
- `lib/payments.ts`: `planKeyToTier` 반환 타입 `'pro'`로
- `lib/rate-limit.ts`: 주석에서 `pro/ultra` → `pro`
- `lib/usage-tracker.ts`: `ultraUsers`, `ultraFees`, tierBreakdown의 ultra 제거
- `components/HomeJsonLd.tsx`: Offer 배열에서 Ultra 제거, Pro 가격 $4.99로 업데이트
- `components/UpgradeGate.tsx`: `requiredTier: 'pro'`
- `components/UserMenu.tsx`: tierColors에서 ultra 제거
- `components/ResultsCard.tsx`: Meta-Analysis 탭 `requiredTier="pro"`
- `components/UpsellBanner.tsx`: 모든 미니 기능 tier="Pro"
- `app/api/synthesize/route.ts`: Admin tier를 'pro'로
- `app/[locale]/admin/page.tsx`: ultraUsers, Ultra 차트/테이블 컬럼 제거
- `app/[locale]/account/page.tsx`: tierStyles에서 ultra 제거
- `app/[locale]/about|how-it-works|terms|faq/page.tsx`: "Pro and Ultra" 텍스트 → "Pro"

## i18n (8개 언어)
- `faq2qBeta` 전체: `Pro/Ultra launch` → `Pro launch`
- `en.json`, `ko.json`의 `faq.a1`: Pro $2.99 → $4.99, Ultra 문구 삭제

## 설정
- `.env.local`: `LS_VARIANT_ULTRA_MONTHLY`, `LS_VARIANT_ULTRA_YEARLY` 제거

## 문서
- `CLAUDE.md`: 플랜 구조에서 Ultra 삭제, Pro 가격 반영
- `PAYMENT-SETUP-GUIDE.md`: Ultra 상품 라인 제거, 2개 상품으로 축소
- `PRD.md`: Ultra Tier 섹션을 "REMOVED" 표시로 교체

## 확인
- `npx tsc --noEmit` 통과
- 코드베이스 내 `ultra|Ultra|ULTRA` 검색: 기존 마일스톤 기록에만 남음 (역사적 기록 보존)

## 남은 작업 (수동)
- LemonSqueezy 대시보드에서 Ultra 상품 비활성화/삭제 (Variant 1531378, 1531379)
- Vercel 환경변수에서 `LS_VARIANT_ULTRA_*` 삭제 (설정돼 있었다면)
