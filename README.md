# LUCID SPACE · LOTTO LAB V2

LUCID SPACE는 프로젝트와 배움의 기록을 모으는 개인 디지털 공간입니다. LOTTO LAB V2는 다섯 전략을 같은 회차에서 반복 비교하는 확률·데이터 실험입니다. 특정 번호의 당첨 가능성을 높인다고 주장하지 않습니다.

## 로컬 실행

Node.js 22.18 이상이 필요합니다. 데이터베이스와 로그인은 Supabase를 사용하며, 배포는 Vercel을 기준으로 구성합니다.

```bash
npm install
npm run dev
```

설정 전에도 http://localhost:3000 의 공개 화면을 볼 수 있습니다. 로그인과 실제 데이터 저장을 사용하려면 아래 설정을 마쳐야 합니다.

## Supabase와 로그인 설정

1. Supabase 프로젝트를 만들고 [Supabase 스키마](supabase/schema.sql)를 SQL Editor에서 한 번 실행합니다.
2. Supabase Dashboard의 Authentication > Providers에서 Google 로그인을 활성화합니다.
3. 프로젝트 루트의 `.env.local`에 아래 값을 설정합니다. 이 파일은 Git에서 제외됩니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
```

`SUPABASE_SECRET_KEY`는 서버 전용 비밀값입니다. `NEXT_PUBLIC_` 접두사를 붙이거나 브라우저 코드에 노출하거나 Git에 커밋하면 안 됩니다.

4. 패키지를 설치하고 Supabase 테이블 연결을 확인한 뒤 개발 서버를 시작합니다.

```bash
npm install
npm run db:setup
npm run dev
```

`db:setup`은 Supabase의 LOTTO LAB 필수 테이블이 존재하는지 확인합니다. 실제 테이블 생성은 `supabase/schema.sql`을 Supabase SQL Editor에서 실행해 처리합니다.

로컬 OAuth 로그인 완료 후 돌아올 앱 콜백은 `http://localhost:3000/auth/callback`입니다.

## Vercel 배포 설정

Vercel 프로젝트의 **Environment Variables**에 아래 세 값을 설정합니다. Production에 필수이며, Preview에서도 로그인과 LOTTO LAB을 확인하려면 Preview 환경에도 설정합니다. `.env.local` 파일 자체를 업로드하지 않습니다.

| 변수 | 사용 위치 | 값 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저·서버 | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 브라우저·서버 | publishable key |
| `SUPABASE_SECRET_KEY` | 서버 전용 | Supabase secret key |

배포 후 Supabase Dashboard의 **Authentication → URL Configuration**에서 Site URL을 실제 운영 도메인(예: `https://your-domain.example`)으로 바꾸고, Redirect URLs에 `https://your-domain.example/auth/callback`을 추가합니다. Vercel 기본 도메인으로 운영한다면 그 도메인을 사용합니다. 로컬 개발을 계속하려면 `http://localhost:3000/auth/callback`도 유지합니다. Preview 배포에서 Google 로그인을 시험한다면 해당 Preview 도메인의 `/auth/callback`을 허용 목록에 추가합니다. 이 앱의 로그인 코드가 `window.location.origin`으로 콜백을 구성하므로 허용 URL은 실제 접속 도메인과 일치해야 합니다.

Google Cloud OAuth 설정의 **Authorized redirect URI**는 앱의 `/auth/callback`이 아니라 Supabase Dashboard의 Google Provider 화면에 표시된 Supabase Auth 콜백 URL(`https://<project-ref>.supabase.co/auth/v1/callback`)입니다. Google Cloud의 Authorized JavaScript origins에도 운영 앱 도메인을 추가합니다. 설정을 바꾼 뒤 Vercel에서 재배포하고 로그인 왕복을 확인합니다.

로컬 빌드 후 `npm run verify:client-bundle`로 `.next/static`에 서버 비밀키가 포함되지 않았는지 검사할 수 있습니다.

## LOTTO LAB Data

기준 데이터는 [동행복권 공식 로또6/45 결과 페이지](https://www.dhlottery.co.kr/lt645/result)입니다. 이 페이지가 사용하는 동행복권 도메인의 JSON 응답에서 회차, 추첨일, 당첨번호 6개를 읽습니다. 보너스번호는 분석·결과 비교·화면에 사용하지 않습니다.

```bash
npm run lotto:sync:all  # 최초 설치 또는 과거 누락 회차 점검: 1회차~최신
npm run lotto:sync      # 평상시 증분 업데이트: DB의 최신 완료 회차 이후
```

동기화는 번호가 1~45인 서로 다른 정수 6개인지, 날짜가 유효한지, 공식 회차와 날짜 순서가 이어지는지 확인합니다. 저장된 완료 회차와 공식 값이 같으면 건너뛰고, 다르면 덮어쓰지 않고 중단합니다. 새 회차의 추천번호는 당첨번호 6개와 비교해 `match_count`만 저장합니다. 최신 완료 회차의 다음 번호와 7일 뒤 날짜로 `open` 회차를 만듭니다. 추천은 추첨일 **18:00 KST 이전**에만 가능합니다.

동행복권 페이지의 내부 JSON 응답과 HTML 선택 목록은 공개된 고정 API 계약이 아니므로 사이트 구조 변경 시 파서 수정이 필요할 수 있습니다. 접근 실패나 잘못된 응답에서는 기존 데이터와 추천 기록을 지우지 않습니다. 자동 동기화에 문제가 생긴 경우 관리자용 수동 복구 명령을 유지합니다.

```json
[{ "drawNumber": 1243, "drawDate": "2026-09-26", "numbers": [9, 18, 24, 38, 43, 44] }]
```

```bash
npm run lotto:import -- C:\path\to\verified-draws.json
```

수동 파일은 [공식 결과](https://www.dhlottery.co.kr/lt645/result)와 대조해 사용하고 Git에 커밋하기 전에 내용을 확인하세요. Synology DSM에서는 공식 결과가 게시된 뒤 작업 스케줄러로 `npm run lotto:sync`를 주기적으로 실행할 수 있습니다. 상세 흐름과 오류 복구는 [데이터 동기화 문서](docs/lotto-data-sync.md)에 있습니다.

## V2 동작

- 공개: 지난 완료 회차, 현재 회차, 다섯 전략 설명
- 로그인: Supabase Auth를 통한 Google OAuth 로그인
- 추천: 회차당 RANDOM, FREQUENCY, RECENCY, BALANCED, LUCID MODEL 각각 한 게임, 총 5게임을 한 번에 DB에 저장
- 제한: 다섯 게임을 한 번에 저장하는 DB 요청과 `user_id + draw_number + strategy` 고유 제약으로 중복 생성 방지
- 비교: 공식 당첨번호 6개와 추천번호 6개의 일치 개수만 계산해 저장
- 성적: 참여 회차·게임 수·0~6개 일치 분포·평균·최고 기록·전략별 평균 및 3개 이상 횟수
- 그래프: 회차별 평균, 누적 평균, 전략별 평균, 전략별 3개 이상 횟수
- 기록: 본인의 전체 추천 내역과 비교 결과

로그인하지 않은 사람은 추천 생성과 개인 성적 조회를 할 수 없습니다. 각 요청에서 서버가 세션을 확인합니다. 개인 추천은 같은 회차에 다시 만들 수 없습니다.

전략의 현재 계산 방식은 [알고리즘 문서](docs/lotto-strategies.md)에 적었습니다. 데이터가 부족할 때 임의의 과거 당첨번호나 성적을 꾸며 표시하지 않습니다.

## 주요 파일

```text
app/projects/lotto/page.tsx       LOTTO LAB 화면
app/api/lotto/picks/route.ts     로그인한 사용자만 추천 저장
app/auth/callback/route.ts       Supabase OAuth 콜백
components/lotto/               카드·성적·차트·로그인 UI
lib/supabase/                   브라우저·서버·관리자 Supabase 클라이언트
lib/lotto/strategies.ts         다섯 전략
lib/lotto/results.ts            추첨 결과 비교
lib/lotto/stats.ts              DB와 분리된 개인·전략 통계
lib/lotto/storage-supabase.ts   회차·추천·결과 Supabase 처리
supabase/schema.sql             PostgreSQL 테이블과 고유 제약
scripts/check-supabase.ts       Supabase 스키마 연결 확인
scripts/import-draws.ts         당첨 결과 가져오기
scripts/sync-lotto.ts           공식 데이터 전체·증분 동기화
```

## 검증

```bash
npm run lint
npm test
npm run build
npm run verify:client-bundle
```

공식 데이터 동기화는 서버 또는 CLI에서만 수행합니다. 실제 로그인과 추천 생성은 Supabase Auth와 Google OAuth가 설정된 환경에서 확인할 수 있습니다.

LUCID SPACE의 나머지 페이지는 V1 구조를 유지합니다. 제품 기준은 `prd.md`, `tech-stack.md`, `codex-prompt.md`와 이번 LOTTO LAB V2 요구사항입니다.
