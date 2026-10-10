# 내부 Dashboard 구현
NOTES(/notes)와 Lotto Lab은 유지한다. Dashboard는 ChatGPT 답변을 직접 붙여 넣는 개인 학습 자료실이며 AI API를 호출하지 않는다.

## 환경과 전환
- 개발은 내부 페이지가 기본이다. 운영은 기존 Multi-Zones 연결이 기본이다.
- DASHBOARD_ROUTING_MODE=internal: 내부 /dashboard 및 /api/dashboard/notes 사용.
- DASHBOARD_ROUTING_MODE=legacy: 기존 DASHBOARD_UPSTREAM_ORIGIN 연결. 내부 데이터 API는 거절.
- DASHBOARD_OWNER_UUID: auth.getUser()로 확인한 본인 Google UUID. 공개 환경변수가 아니며 메뉴·페이지·API에 동일하게 적용한다.
- 기존 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY와 Google 쿠키 세션을 재사용한다. Dashboard용 비밀키나 외부 DB는 사용하지 않는다.
- 운영 전환은 별도 승인 후 internal 설정 및 배포로 진행한다. 현재 외부 설정과 실제 환경 파일은 변경하지 않았다.

## DB 적용 승인 전
supabase/study-notes.draft.sql은 단일 트랜잭션 초안이다. UUID 자리표시자를 검증된 본인 UUID로 치환해야 하며, 존재하는 테이블은 덮어쓰지 않는다. 기존 활성 세션 함수는 재사용하고 변경하지 않는다.
SQL은 새 study_notes 테이블·인덱스·4개 RLS 정책·해당 테이블 권한만 추가한다. RLS는 본인 UUID, 행 소유자, 활성 세션을 모두 요구한다. 사용자 세션으로 조회·쓰기하며 서비스 역할 키는 사용하지 않는다. 기존 auth.users에는 외래키 참조만 추가한다.
DB가 미적용이면 API는 503과 설정 필요 메시지를 반환한다. 저장 실패 시 입력이 유지되며 성공으로 표시하지 않는다.
복구 초안은 새 테이블이 비었을 때만 제거할 수 있다. 자료가 있으면 중단한다. 실제 적용 전 스키마·자료 백업과 SQL 원문 검토 및 재승인이 필요하다.

## 데이터와 화면
제목·본문·카테고리·북마크, 작성·조회·수정·삭제, 제목·본문 검색, 안전한 Markdown 표시만 제공한다.
붙여 넣은 HTML은 실행하지 않고 javascript/data 링크와 원격 이미지 요청을 막는다.
새 이동은 Next.js Link와 router.push를 사용한다. 계정 변경·로그아웃 시 Dashboard 화면을 제거하고 로컬 편집 상태를 초기화한다. 저장 직전 활성 세션을 다시 확인하며 DB RLS에서도 확인한다.

## 남은 실제 검증
DB 적용과 본인 UUID 설정은 승인 후 진행한다. 실제 Google 로그인 후 메뉴·접근·글 저장·수정·검색·카테고리·북마크·새로고침 재조회·삭제를 확인해야 한다.
현재 자동 검사는 실제 DB 적용·실제 로그인 검증을 대신하지 않는다. 운영 배포·기존 Dashboard 프로젝트 제거는 승인되지 않았다.

## 구현 검증 결과 (2026-10-10)
개발 브랜치: codex/internal-dashboard. 코드 구현 완료, 커밋·푸시·외부 배포 없음.
- 통과: TypeScript, lint, 전체 자동 테스트 28개(기존 Google 복귀/Lotto 18개 포함), Next.js 16.3.8 Turbopack 운영 빌드.
- 통과: 새 API 실제 코드의 인증·활성 세션·쓰기 직전 재검증·사용자 필터, 잘못된 본문/소유자 주입·교차 출처 거절, 누락 DB 오류 처리(격리 테스트).
- 통과: 실제 Markdown 렌더러의 표/코드 표시, HTML·javascript/data 링크·원격 이미지 요청 차단(자동 테스트).
- 통과: SQL 초안을 별도 로컬 Postgres(PGlite)에서 실행해 본인 CRUD, B/C 조회·수정·삭제·삽입 차단, 익명 차단, 폐기 세션 차단, 자료가 있으면 복구 거절 및 비었을 때만 복구 확인. 실제 Supabase 실행은 아님.
- 통과: 로컬 포트 3004 비로그인 /dashboard 및 /dashboard/new → 307 홈 복귀, 목록/상세 GET·POST·PATCH·DELETE → 401, 메뉴 권한 false. 홈·NOTES·Lotto → 200.
- 통과: 빌드된 브라우저 자산 21개에 기존 Supabase 비밀키 값 없음. 운영 의존성 보안 감사 0건.
- 보존: NOTES/Lotto/공통 Google 로그인/세션/전역 스타일/기존 DB SQL의 Git 수정 없음. 실제 DB·TEST 자료·OAuth·환경 파일·외부 프로젝트 불변.
- 아직 검증 불가: 실제 본인 Google 로그인으로 새 화면의 메뉴·CRUD·검색·카테고리·북마크·재조회·로그아웃 화면 초기화. DB 적용과 서버 본인 UUID 설정 후 검증 필요.
- 아직 검증 불가: 새 Dashboard의 운영 검증. production 기본 legacy 및 beforeFiles rewrite를 유지하며, internal 운영 전환은 별도 승인 필요.
기존 저장 목록의 카드/검색/북마크 구성과 Neutral 가독성 기준을 사용했으며 AI provider·Groq·기존 DB 연결 코드는 이식하지 않았다.

## 변경 파일
- 페이지: app/dashboard/layout.tsx, app/dashboard/page.tsx, app/dashboard/new/page.tsx, app/dashboard/[id]/page.tsx
- API: app/api/dashboard/notes/route.ts, app/api/dashboard/notes/[id]/route.ts, app/api/dashboard-access/route.ts
- UI: components/dashboard/library.tsx, editor.tsx, detail.tsx, markdown.tsx, session-boundary.tsx, client.ts, dashboard.module.css
- 서버 처리: lib/dashboard/auth.ts, auth-policy.ts, domain.ts, notes.ts, http.ts, routing.ts
- 연결·의존성: components/layout/Header.tsx, app/layout.tsx, next.config.ts, package.json, package-lock.json
- 검증·SQL: tests/dashboard.test.mjs, tests/dashboard-rls.test.mjs, supabase/study-notes.draft.sql, supabase/study-notes-rollback.draft.sql
- 문서: 본 문서, 기존 Dashboard docs/20-single-app-dashboard-plan.md 및 docs/decisions.md에 승인/진행 상태 추가.

## 실제 DB 적용 및 로컬 검증 완료
2026-10-10 사용자 승인으로 study_notes/RLS만 실제 적용했다. 본인 UUID는 Git 제외된 .env.local에 설정하고 서버 getUser·활성 세션으로 확인했다. 실제 저장·별도 재조회·수정·검색·카테고리·북마크·새 TEST 1개의 승인된 삭제 검증 통과. 최종 study_notes 0건. 기존 Lotto 자료 해시와 인증/DB 구조 보존. 복구 SQL 미실행, 운영 배포·Git 푸시 없음. 상세 docs/study-notes-live-validation.md. 이전 '미적용' 문단은 적용 전 기록으로 읽는다.
## 운영 전환 전 최종 준비 (2026-10-10)
- 사용자 승인 범위: 통합 파일의 Git 커밋까지. GitHub 푸시·Vercel 설정 변경·운영 배포·기존 프로젝트 삭제는 미승인.
- TypeScript, lint, 자동 테스트 28개, internal 모드 프로덕션 빌드 통과. 기존 로그인/Lotto 테스트 18개 포함.
- 다른 계정의 목록/상세 조회·생성·수정·삭제 API는 모두 403이며 데이터 계층을 호출하지 않음. 별도 로컬 Postgres에서 RLS도 재검증. 실제 다른 Google 계정으로 로그인한 테스트는 미실시.
- 빌드 manifest에서 외부 rewrite 없음 및 내부 Dashboard·NOTES·Lotto 경로 확인. NOTES/Lotto 전용 코드·인증 코드 변경 없음.
- 운영 Vercel 환경변수의 실제 등록 여부는 조회 인증 오류(403)로 미확인. 로컬 필수 설정 존재 및 본인 UUID 형식은 확인했으며 값은 기록하지 않음.
- 배포 승인 후 Production에 DASHBOARD_ROUTING_MODE=internal 및 DASHBOARD_OWNER_UUID(실제 DB RLS와 동일한 본인 UUID, 서버 전용)를 먼저 설정하고 새로 빌드한다. 기존 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY / NEXT_PUBLIC_SITE_URL 설정은 유지·확인한다. UUID에 NEXT_PUBLIC_ 접두사를 붙이지 않는다.
- 기존 DASHBOARD_UPSTREAM_ORIGIN은 보존해도 internal 모드에서는 사용하지 않는다. 원복이 필요하면 이전 정상 Vercel 배포로 되돌리며 study_notes나 기존 데이터를 삭제하지 않는다.
- 운영 배포 후 실제 Google 로그인·메뉴·학습 저장/재조회와 NOTES/Lotto를 확인해야 한다. 현재 통과는 로컬/자동 검증 범위이며 운영 완료를 뜻하지 않는다.
- 기존 별도 Dashboard 앱·DB·TEST 자료는 보존한다. 기존 자료의 자동 이전과 이전 앱 URL의 변경은 이번 작업에 포함하지 않는다.
