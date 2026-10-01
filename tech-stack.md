# LUCID SPACE
## Technical Stack & Architecture

**Version:** 0.2 (Supabase / Vercel)  
**Project:** LUCID SPACE  
**Repository:** `parksangho-home/lucid`

---

# 1. 목적

이 문서는 LUCID SPACE의 기술 선택과 기본 개발 원칙을 정의한다.

주요 목표:
- 개발 경험이 많지 않은 개인도 지속적으로 관리할 수 있을 것
- 새로운 프로젝트와 도구를 쉽게 추가할 수 있을 것
- 코드가 지나치게 복잡해지지 않을 것
- 로컬 PC에서 쉽게 개발할 수 있을 것
- GitHub를 통해 버전 관리할 것
- Synology NAS에서 운영할 수 있을 것
- 향후 Database, API, 자동화 기능을 단계적으로 추가할 수 있을 것

**Simple → Modular → Expandable** 원칙을 따른다.

---

# 2. Core Stack

## Framework
**Next.js**

용도:
- 전체 웹 애플리케이션 구조
- Routing
- React 기반 UI
- 향후 Server/API 기능
- SEO
- Backend 기능 확장

App Router를 사용한다.

## Language
**TypeScript**

불필요하게 복잡한 TypeScript 패턴은 사용하지 않는다.

## UI
**React**

화면을 재사용 가능한 Component 단위로 구성한다.

## Styling
**Tailwind CSS**

복잡한 Animation이나 전역 Style이 필요한 경우 적절한 CSS를 사용할 수 있다.

---

# 3. Architecture Principle

가장 중요한 기술 원칙은 **Modular Architecture**다.

```text
app
components
data
lib
public
```

역할:
- `app` → 페이지와 Routing
- `components` → 재사용 가능한 UI
- `data` → Project / Tool / Navigation 등의 콘텐츠 데이터
- `lib` → 공통 함수 및 Utility
- `public` → 이미지 및 정적 파일

---

# 4. Data Driven UI

프로젝트 목록, Tool 목록, Navigation 등 반복되는 콘텐츠는 가능한 한 데이터와 UI를 분리한다.

```ts
export const projects = [
  {
    id: "lotto",
    name: "LOTTO LAB",
    category: "Probability · Data",
    description: "확률과 데이터를 이용한 로또 실험",
    status: "active",
    href: "/projects/lotto"
  }
]
```

목표:
```text
새 프로젝트 추가
↓
projects.ts 수정
↓
ProjectCard 자동 생성
```

---

# 5. Component Structure

```text
components/

layout/
 ├─ Header
 ├─ Navigation
 └─ Footer

home/
 ├─ HeroSection
 ├─ IdentitySection
 ├─ ProjectsSection
 ├─ LottoPreview
 ├─ ToolsSection
 └─ NotesSection

projects/
 ├─ ProjectCard
 ├─ ProjectGrid
 └─ ProjectStatus

space/
 ├─ SpaceBackground
 ├─ StarField
 ├─ GlowEffect
 └─ PlanetCard

ui/
 ├─ Button
 ├─ Card
 ├─ SectionTitle
 └─ Badge
```

필요하지 않은 Component는 만들지 않는다.

---

# 6. Space Visual System

V1에서는 다음 기술을 우선 사용한다.
- CSS
- CSS Gradient
- CSS Animation
- Lightweight JavaScript

필요하면 Canvas를 제한적으로 사용할 수 있다.

V1에서 기본적으로 사용하지 않는다.
- Three.js
- WebGL 기반 복잡한 3D Scene
- 대용량 Background Video
- 무거운 Particle Library

---

# 7. Animation

권장:
- Star movement
- Fade
- Glow
- Hover
- Scroll reveal
- 아주 약한 Parallax

`prefers-reduced-motion`을 존중한다.

---

# 8. LOTTO LAB V1

V1에서는 Client Side 기능으로 구현한다.

```text
1~45
↓
6개 Random Selection
↓
중복 제거
↓
Ascending Sort
↓
Display
```

V1에서는 Database를 사용하지 않는다.

번호 생성 기능은 독립적인 Utility 함수로 분리한다.

```text
lib/
 └─ lotto/
     └─ generateNumbers.ts
```

---

# 9. LOTTO LAB Future Architecture

```text
LOTTO UI
   ↓
API
   ↓
Strategy Engine
   ↓
Database
```

현재 Database: **Supabase PostgreSQL**

향후 저장 데이터:
- lotto_draws
- lotto_predictions
- lotto_strategies
- lotto_results

구체적인 Schema는 LOTTO LAB V2에서 별도로 설계한다.

---

# 10. BADUK LAB

BADUK LAB은 LUCID SPACE와 독립적으로 개발할 수 있다.

LUCID SPACE에서는 다음 정보만 관리할 수 있다.
- Name
- Description
- Status
- Thumbnail
- Repository URL
- Application URL

---

# 11. NOTES

초기에는 Placeholder 수준으로 구현한다.

향후 콘텐츠가 늘어나면 Markdown 또는 MDX 기반 구조를 검토한다.

V1에서는 별도의 CMS를 구축하지 않는다.

---

# 12. Database

현재 Database: **Supabase PostgreSQL**

운영 목표: **Vercel + Supabase**

Database는 외부 인터넷에 직접 공개하지 않는다.

```text
Internet
   ↓
Web Application
   ↓
Server/API
   ↓
Supabase PostgreSQL
```

브라우저는 publishable key로 인증하고, LOTTO LAB 데이터 작업은 Next.js 서버에서 수행한다. secret key는 서버 전용이다.

---

# 13. Security Principle

- HTTPS 사용
- Database Port 외부 직접 공개 금지
- 비밀번호 또는 API Key 소스코드 저장 금지
- 환경변수 사용
- 관리자 기능과 일반 사용자 기능 분리
- 필요한 서비스만 외부 공개
- Synology 관리자 화면을 웹 애플리케이션과 불필요하게 연결하지 않음

`.env` 파일은 Git Repository에 Commit하지 않는다.

---

# 14. Development Environment

```text
Windows 11
VS Code
Git
Node.js
npm
```

개발 서버:
```bash
npm run dev
```

기본 로컬 URL:
```text
http://localhost:3000
```

---

# 15. Source Control

Source Control: **Git**

Remote Repository: **GitHub**

Repository: `parksangho-home/lucid`

현재 저장소의 실제 브랜치 상태를 확인한 뒤 사용한다.

---

# 16. Git Ignore

다음 파일은 Repository에 포함하지 않는다.

```text
node_modules
.next
.env
.env.local
```

---

# 17. Deployment

Production Hosting: **Vercel**

```text
Development PC
      ↓
    Git
      ↓
   GitHub
      ↓
Vercel + Supabase
      ↓
LUCID SPACE
```

초기에는 수동 배포도 허용한다.
사이트가 안정화된 후 자동 배포를 구축한다.

---

# 18. NAS Deployment (향후 대안)

실제 배포 방법은 NAS 환경을 확인한 후 결정한다.

확인할 항목:
- Synology 모델
- DSM Version
- Container Manager 또는 Docker 지원 여부
- Node.js 실행 방법
- Reverse Proxy 지원
- Domain
- HTTPS Certificate
- Router / Network 환경

환경을 확인하기 전에 특정 배포 방식을 확정하지 않는다.

---

# 19. Future CI/CD

```text
Local Development
       ↓
git push
       ↓
GitHub
       ↓
Automated Build / Deployment
       ↓
Vercel
       ↓
Production
```

V1에서는 필수 사항이 아니다.

---

# 20. Development Tools

## ChatGPT
- 요구사항 정리
- PRD
- Architecture
- 문제 분석
- 코드 리뷰
- 세부 수정

## Codex
- 초기 프로젝트 구축
- 다수 파일 구현
- 대규모 기능 추가
- Refactoring
- Test / Build 확인

## GPT Bridge
- 로컬 VS Code Workspace 확인
- 현재 코드 확인
- 세부 수정
- Debugging
- 빠른 반복 작업

---

# 21. Coding Agent Rules

1. 작업 전 `prd.md`와 `tech-stack.md`를 읽는다.
2. 기존 파일을 수정하기 전에 현재 구현 상태를 확인한다.
3. 기존 기능을 불필요하게 삭제하지 않는다.
4. 대규모 Architecture 변경이 필요하면 임의로 진행하지 않는다.
5. 새로운 Dependency 추가를 최소화한다.
6. 단일 파일이 지나치게 커지지 않도록 Component를 적절히 분리한다.
7. 동일 코드를 반복하지 않는다.
8. 지나친 추상화는 하지 않는다.
9. V1 Scope 밖의 기능을 임의로 구현하지 않는다.

---

# 22. Code Quality

우선순위:
```text
Readability
   ↓
Maintainability
   ↓
Modularity
   ↓
Performance
   ↓
Cleverness
```

복잡하고 영리한 코드보다 이해하기 쉬운 코드를 선호한다.

---

# 23. Testing

V1 최소 검증:
- Development Server 정상 실행
- Production Build 성공
- Console Error 없음
- Desktop Layout 확인
- Mobile Layout 확인
- Navigation 정상 동작
- LOTTO 번호 생성 정상 동작
- Internal Link 정상 동작
- Runtime Error 없음

반드시 실행:
```bash
npm run build
```

프로젝트에 lint 또는 test 명령이 정의되어 있다면 함께 실행한다.

---

# 24. Accessibility

- Semantic HTML
- Keyboard Navigation
- 적절한 Contrast
- Button과 Link 구분
- 이미지 Alt Text
- Focus State
- Reduced Motion

---

# 25. SEO

기본 Title: `LUCID SPACE`

기본 Description:
`AI와 기술을 배우고 직접 만들며 새로운 가능성을 탐험하는 개인 디지털 공간`

---

# 26. V1 Technical Goal

- 코드 구조를 쉽게 이해할 수 있다.
- 새로운 Project를 쉽게 추가할 수 있다.
- Component를 독립적으로 수정할 수 있다.
- Desktop과 Mobile에서 정상 작동한다.
- LOTTO LAB 기본 기능이 작동한다.
- Production Build가 성공한다.
- 향후 Database를 붙일 수 있다.
- Synology NAS로 이전할 수 있는 구조다.

---

# 27. Final Principle

**Keep it simple.  
Keep it modular.  
Keep it expandable.**
