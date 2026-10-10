# study_notes 적용 및 실제 로컬 검증
2026-10-10. 사용자 승인으로 기존 LucidSpace Supabase에 새 study_notes만 적용했다. 운영 배포·Git 커밋/푸시·기존 Dashboard 자원 삭제 없음.

## SQL 검토 7항목
1. 기존 Lotto 테이블·인증 테이블/함수/권한에는 변경문이 없다. 새 테이블이 auth.users(id)를 외래키로 참조할 뿐 기존 인증 행을 수정하지 않는다. 단, 학습 글을 가진 계정의 삭제는 ON DELETE RESTRICT로 막힌다. 기존 Google 로그인·Lotto 사용에는 이 계정 삭제 제약이 영향을 주지 않는다.
2. study_notes는 UUID PK, user_id, 제목·본문·카테고리·북마크·생성/수정 시각의 8컬럼이다. RLS 활성화/강제, SELECT/INSERT/UPDATE/DELETE 4정책, 사용자별 수정일 인덱스가 있다. INSERT와 UPDATE의 WITH CHECK를 포함한다.
3. 메뉴·페이지·API는 동일한 서버 getClaims/getUser·확인된 Google 신원·본인 UUID·활성 세션 검사를 쓴다. DB는 본인 UUID + auth.uid() = user_id + dashboard_session_active() 모두 요구한다. 익명과 서비스 역할의 새 테이블 권한은 회수했고, authenticated의 user_id/id/created_at UPDATE 권한도 없다. 사용자 세션으로 DB 요청하며 클라이언트 UUID로 신원을 대체하지 않는다. [공식 RLS 권한 기준](https://supabase.com/docs/guides/database/postgres/row-level-security).
4. 기존 승인 계정의 UUID를 설정 후보로 가져온 후 현재 Google 로그인에서 서버 getUser와 활성 세션 검사를 통과하는 것을 확인했다. 값은 코드·Git 문서에 넣지 않고 Git 제외된 LucidSpace .env.local의 DASHBOARD_OWNER_UUID에만 설정했다. 실제 UUID·이메일·토큰·쿠키·비밀키 값을 출력하지 않았다. DB 정책에는 메모리에서 치환한 동일 UUID를 바인딩했으며 저장된 초안은 자리표시자를 유지한다.
5. 같은 SQL을 두 번 실행하면 기존 테이블 존재를 감지해 트랜잭션이 중단된다. 성공하는 no-op 방식은 아니지만 기존 자료를 덮어쓰지 않는다. 로컬 격리 Postgres에서 기존 TEST 행을 가진 상태의 재실행 거절과 내용 유지 확인. 실제 DB에는 중복 적용하지 않았다.
6. 복구 초안은 새 테이블이 비었을 때만 study_notes와 그 자체 인덱스/정책을 제거한다. 자료가 있으면 거절하고 CASCADE가 없다. 이번에는 복구 SQL을 실행하지 않았다. 실제 기존 자료나 기존 테이블 삭제 없음.
7. 개발 internal/운영 legacy 기본값과 beforeFiles rewrite를 유지했다. 실제 Vercel 설정·upstream·운영 앱은 변경하지 않았다. 기존 Dashboard는 별도 앱/DB 그대로 존재한다.

## 실제 적용과 보존
- 대상: 기존 LucidSpace 프로젝트 gcjjktxhypwjnnwkpaxt. 변경: public.study_notes, 인덱스 1, RLS 4, 해당 새 테이블 권한. 검토 원문을 BEGIN/COMMIT 단일 트랜잭션으로 실행.
- 변경 원문 SHA256: CED7FE55DCCDC063A18E13454A8F0760F8935294F7E1C7B7445180A681F51552.
- 복구 원문 SHA256: B1F460C44552E8BFA1D2430E732464E4D39E794858C2F20FCBCFA71126A1EE3C.
- Git 밖에 기존 public/auth의 컬럼·제약·인덱스·정책·권한·함수 정의를 보관하고 파일 파싱을 확인했다. 자료 자체의 전체 덤프는 아니며 Lotto 건수·내용 해시를 별도로 기록했다.
- 적용 직후 및 로컬 검증 후 기존 컬럼·제약·인덱스·정책·함수·권한 동일. Lotto 원본 1246, 예측 15, 결과 15의 건수·내용 해시 동일. auth.users 2 / identities 2 건수 동일. 로그인 과정의 정상 세션 갱신은 이 스키마/자료 변경과 구분한다.
- 보안 advisor에서 새 study_notes 지적 없음. 기존 Lotto RLS 정책 없음 INFO 3건, 검토된 세션 확인 SECURITY DEFINER의 authenticated 실행 WARN 1건, 유출 비밀번호 보호 미설정 WARN 1건은 기존 상태로 남겨 두었다. 인증/외부 설정을 바꾸지 않았다.
- 기존 별도 Dashboard DB는 읽기만 수행했다. 현재 학습 글 2 / 요청 9 / 이용 허용 1을 확인했다. 이전 문서의 옛 건수를 이번 사전 비교 기준으로 사용하지 않았다.

## 실제 로컬 검증 결과
| 항목 | 결과 | 확인 범위 |
|---|---|---|
| 본인 Google 로그인 / 메뉴 / 추가 로그인 없는 접근 | 통과 | localhost:3000, 공통 서버 권한 검사 통과 |
| TEST 글 작성·실제 저장 | 통과 | 실제 사용자 세션으로 새 LucidSpace DB에 저장 |
| 새로고침 후 별도 요청 재조회 | 통과 | 제목·본문이 최초 붙여넣기와 일치하는지 편집 입력란까지 확인 |
| 제목·본문·카테고리 수정 | 통과 | 수정 저장 후 새로고침에서도 유지 |
| 제목/본문 검색 및 불일치 검색 | 통과 | 일치 결과 1건 / 없는 검색 0건 |
| 카테고리 | 통과 | 다른 카테고리 0건 / 실제 카테고리 1건 |
| 북마크 추가·해제·필터 | 통과 | 새로고침 유지, 해제 글 제외·설정 글 포함 |
| Markdown 안전 표시 | 통과 | 표/코드 표시, 스크립트 실행·javascript 링크·이미지 요청 없음 |
| 새 TEST 1개 삭제 / 재조회 차단 | 통과 | 실행 직전 사용자 추가 승인 후 삭제, 자료 없음 표시, 최종 DB 0건 |
| 비로그인 페이지/API | 통과 | 페이지 307 홈 복귀, GET/POST/PATCH/DELETE 401 |
| 익명 직접 Supabase REST 접근 | 통과 | 실제 DB HTTP 401 |
| 허용되지 않은 합성 세션 DB 검사 | 통과(제한적) | 실제 DB에서 활성 세션 false/보이는 행 0; 실제 다른 Google 로그인이나 자료 분리 실험을 대신하지 않음 |
| 기존 로그인·Lotto / 운영 홈·Lotto | 통과(범위 한정) | 로그인된 로컬 Lotto 화면과 세션 유지, 운영 두 페이지 HTTP 200, 원본 데이터 해시 유지 |
| 다른 실제 Google 계정 / 새 Dashboard 운영 검증 | 아직 검증 불가 | 다른 계정 로그인 및 내부 Dashboard 운영 배포를 하지 않음 |

최종 study_notes는 0건이다. 삭제한 것은 이번에 새로 만든 TEST 글 1개뿐이며 이전 별도 Dashboard TEST와 Lotto 기록은 삭제하지 않았다.
SQL 초안과 복구 초안은 보존했다. 앱 코드 변경은 없고 본인 UUID 로컬 설정과 검증 문서만 추가했다. 기존 28개 자동 검사·타입/lint/빌드는 직전 구현 검증 결과이며, 이번에는 실제 DB/브라우저 검증과 재실행 안전성 검사에 집중했다.
