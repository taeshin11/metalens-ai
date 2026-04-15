# Milestone 06 — Share 결과, 7개 언어 블로그, Claude API 롤백

**날짜:** 2026-04-15
**커밋:** `4709f0b` → `8d6a945` → `48f1fa1`
**상태:** 완료

## 개요

Milestone 05 직후 후속 작업. Pro 유저용 Claude API 통합을 비용/안정성 이유로 롤백하고 전 티어 Gemini로 통일. Share Results 기능 추가, 블로그 콘텐츠를 7개 언어로 확장, 핸드오프용 CLAUDE.md 정비.

## 변경 사항

| ID | 항목 | 비고 |
|----|------|------|
| 42 | Claude API 롤백 | 전 티어 Gemini 유지 (CLAUDE.md에 변경 금지 명시) |
| 43 | Share Results 기능 | `/api/share` + `/[locale]/share/[id]` Redis 7일 TTL |
| 44 | 블로그 7개 언어 확장 | ko/ja/zh/de/fr/es/pt 추가 (en 포함 8개 언어 완비) |
| 45 | CLAUDE.md 핸드오프 정비 | 스택, 플랜, 결정사항, 수작업 항목 정리 |
| 46 | registrations.md 추가 | 외부 서비스 등록 현황 추적 |

## 세부 사항

### Claude API 롤백 (#42)
- `app/api/synthesize/route.ts`: Claude 호출 분기 제거, Gemini 단일 경로
- `lib/constants.ts`: pro/ultra 모델 다시 Gemini 2.5 Flash로
- 사유: 비용 + Gemini 품질 충분
- **제약:** 향후에도 Claude 재도입 금지 (CLAUDE.md "Pro/Ultra 유저도 Claude API 아닌 Gemini 사용 (변경 금지)")

### Share Results (#43)
- `app/api/share/route.ts`: POST → Redis 저장, GET → 조회
- `app/[locale]/share/[id]/page.tsx`: 공유 링크 렌더링 페이지
- `components/ResultsCard.tsx`: Share 버튼 + 링크 복사 UX
- TTL 7일 (Upstash Redis)

### 블로그 7개 언어 (#44)
- `lib/blog-content-{ko,ja,zh,de,fr,es,pt}.ts` 신규
- 포스트당 8개 언어 동시 제공
- `app/[locale]/blog/[slug]/page.tsx` 다국어 라우팅 정리

### CLAUDE.md 정비 (#45)
- 프로젝트 개요 / 스택 / 플랜 / 핵심 결정사항 / 수작업 항목
- "PRD.md 절대 삭제 금지" 명시
- 피드백 기억 (요약 우선순위, 임휘빈 피드백) 포함

### registrations.md (#46)
- Google/Naver/Bing/Yandex/Baidu 웹마스터 등록 상태
- LemonSqueezy / Clerk 설정 체크리스트

## Milestone 05 정정

`milestone_05_polish.md` #38 (Claude API)는 본 마일스톤에서 롤백됨. 문서 자체는 역사 기록으로 보존.
