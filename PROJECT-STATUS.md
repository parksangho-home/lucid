# LucidSpace — PROJECT-STATUS

> 최종 갱신: 2026-10-12
> GitHub: `parksangho-home/lucid`
> 목적: 서로 다른 ChatGPT 채팅창에서 홈페이지 개발 상태를 이어가기 위한 공통 기록.
> 원칙: GitHub 기본 브랜치의 코드·README 확인 사항과 이전 대화의 사용자 보고를 구분한다. 현재 실행/배포 상태는 별도 검증 전까지 단정하지 않는다.

## 1. 프로젝트 개요
- 개인 웹사이트 **LucidSpace**, 운영 도메인: `https://www.lucidspace.kr` (2026-10-05 대화에서 접속 및 Google 로그인 정상화 보고).
- 로컬 작업 폴더: `C:\aiwork\lucidspace` (이전 대화 기준, 현 세션 미검증).
- Next.js App Router, TypeScript, Tailwind CSS, Supabase(PostgreSQL/Auth), Google OAuth, Vercel 배포.
- GitHub 기본 브랜치 `package.json` 확인: Next.js 16.3.8, React 19.2.8, `react-markdown` 및 `remark-gfm` 포함.
- 홈페이지는 개별 실험 기능을 **Projects** 아래에 추가하는 방향. Lotto Lab, Baduk Lab 및 향후 Music Lab, Image Lab 구상. 별도의 거창한 AI Playground를 기본 전제로 만들지 않음.

## 2. 확인된 기능 및 진행 내용
### Lotto Lab V2
- GitHub 기본 브랜치 README에 명시된 기능:
  - 공식 동행복권 6/45 데이터 동기화.
  - Supabase Auth + Google OAuth 로그인.
  - RANDOM, FREQUENCY, RECENCY, BALANCED, LUCID MODEL 5개 전략에서 회차당 총 5게임 생성.
  - DB 고유 제약으로 같은 회차·사용자·전략의 중복 추천 방지.
  - 보너스번호를 제외한 6개 번호 일치 비교.
  - 개인 기록, 통계 및 차트.
- 실제 운영 환경의 최신 회차·현재 데이터 상태는 이 문서 작성 시 직접 확인하지 않음.

### 홈페이지·로그인·배포
- 2026-10-05 사용자 대화에서 `www.lucidspace.kr` 접속 정상, 루트 도메인 리디렉션 및 Google 로그인 문제 해결 보고.
- 현재 시점 실서비스 재검증은 미실시.

### Dashboard / Notes 통합
- 과거 별도 `lucid-dashboard` 프로젝트는 폐기하고 LucidSpace 내부 기능으로 통합하는 방향.
- 2026-10-10 대화상 내부 Dashboard 통합 브랜치 `codex/internal-dashboard`, 커밋 `65dbd58`, 타입·린트·28개 테스트·빌드 통과 보고. 당시에는 푸시/운영 배포가 미완료였음.
- 이후 대화에서 **`lucidspace.kr/dashboard` 실제 배포 반영 및 게시판/노트 글 작성 확인**. 사용자는 ChatGPT에서 보이는 이미지·선·서식까지 게시판에 표시되는 방법을 검토함.
- 별도 Dashboard 프로젝트 및 관련 Supabase/Vercel/GitHub 리소스는 사용자가 삭제했다고 보고.
- **주의:** GitHub 기본 브랜치 README는 주로 Lotto Lab을 설명하고 있어 Dashboard 최신 구현·배포 상태를 충분히 반영하지 않을 수 있음. 실제 코드·배포 확인 시 이 항목 갱신.

## 3. 사용자 결정 및 제약
- LucidSpace를 개인 실험·프로젝트 모음 사이트로 운영.
- 기능은 가볍게 추가·시험하고 필요 없으면 제거. 과도한 별도 시스템 구축 지양.
- Dashboard의 1차 저장은 Supabase 중심. Google Drive 백업은 1차 범위에서 제외.
- 코드 저장은 GitHub, 웹 배포는 Vercel, 데이터베이스·인증은 Supabase.
- API 비밀키나 인증 토큰을 GitHub에 커밋하지 않음.

## 4. 다음 확인·작업
1. 실제 GitHub 기본 브랜치에 반영된 Dashboard/Notes 구현과 배포 버전 대조.
2. Dashboard 게시글에 ChatGPT의 Markdown/GFM 및 이미지·구분선 등 표현을 어떻게 재현할지 결정하고 검증.
3. Notes의 사용자별 접근 제어, 저장·재조회 동작 확인.
4. Lotto Lab 최신 회차 동기화와 로그인 상태 확인.
5. 새로운 Lab 추가는 필요할 때 기존 Projects 구조에 가볍게 통합.

## 5. 채팅 연속성 규칙
1. 새 ChatGPT 채팅에서는 **GitHub 기본 브랜치의 이 문서를 우선 확인**한다.
2. 완료·진행 중·계획·폐기·미검증을 구분한다. 오래된 README만으로 최근 배포를 부정하지 않는다.
3. 사용자가 '프로젝트 상태 갱신해 줘'라고 요청하면 이 문서를 읽고 **현재 대화에서 확인된 최신 사항만** 반영하여 GitHub에 커밋한다.
4. GitHub 상태 파일은 대화 원문 전체의 자동 백업이 아니다. 다른 채팅의 내용을 확인할 수 없다면 사용자에게 로그·결과를 요청한다.
5. 다른 저장소(바둑게임·음악)의 상태 파일과 혼동하지 않는다.
6. 프로젝트 소스에 올라간 사본은 GitHub와 자동 동기화되지 않는다.

## 6. 변경 이력
- 2026-10-05: 운영 도메인 및 Google 로그인 정상화 보고.
- 2026-10-10~12: Dashboard/Notes의 LucidSpace 통합 및 운영 반영, 별도 Dashboard 프로젝트 폐기 보고.
- 2026-10-12: ChatGPT 채팅 연속성용 GitHub 상태 문서 최초 작성.
