# Milestone 08 — i18n 완성 & 품질 개선 (2026-04-16)

## 배경
6개 비영어 언어(ja, zh, de, fr, es, pt)에 48개 번역 키가 누락된 채 배포되어 있었음. FAQ 6-10, Terms 전체, Privacy 11-12, About 팀 소개 등.

## 코드 변경

### i18n 완성 (6개 언어 × 48키)
- `messages/ja.json`: FAQ subtitle, q6-q10/a6-a10, privacy s11-s12, terms s1-s14 추가
- `messages/zh.json`: 동일 48키 추가 (간체 중국어)
- `messages/de.json`: 동일 48키 추가 (독일어)
- `messages/fr.json`: 동일 48키 추가 (프랑스어)
- `messages/es.json`: 동일 48키 추가 (스페인어)
- `messages/pt.json`: 동일 48키 추가 (브라질 포르투갈어)
- 결과: 8개 언어 모두 468키로 동일

### 에러 바운더리
- `app/[locale]/error.tsx`: 런타임 에러 시 빈 화면 대신 "Try Again" / "Go Home" UI 표시

### BETA_END 상수 통합
- `lib/constants.ts`: `BETA_END` 상수 추가
- `lib/rate-limit.ts`: 로컬 상수 → import로 변경
- `app/[locale]/page.tsx`: 로컬 상수 → import로 변경

### 보안
- `.gitignore`: `/_transfer/` 추가 (`.env.local` 포함 폴더)

## 확인
- `npx tsc --noEmit` 통과
- 8개 언어 키 카운트 동일 (468)
- `git push origin master` 성공

## 커밋
- `f16ff92` chore: gitignore _transfer/
- `16e568e` feat: complete i18n for 6 languages, add error boundary, consolidate beta date
