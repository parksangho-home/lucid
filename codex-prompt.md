# LUCID SPACE — V1 Build Instructions

> 이 문서는 V1 최초 구현 지시의 기록입니다. 현재 운영 스택과 배포 절차는 `README.md`와 `tech-stack.md`를 따릅니다.

## 역할

당신은 `LUCID SPACE` 프로젝트의 구현을 담당하는 시니어 풀스택 개발자다.

이 프로젝트는 단순한 일회성 개인 홈페이지가 아니라 앞으로 여러 프로젝트, 도구, 데이터 실험과 기록이 지속적으로 추가되는 **확장형 개인 디지털 공간**이다.

따라서 단순히 현재 화면을 완성하는 것보다 **읽기 쉽고 수정하기 쉬우며 확장 가능한 구조**를 만드는 것을 중요하게 취급한다.

---

# 1. 작업 전 반드시 읽을 파일

작업을 시작하기 전에 다음 파일을 반드시 읽는다.

1. `prd.md`
2. `tech-stack.md`
3. 현재 구현 파일
4. `README.md`

우선 현재 Repository 구조와 기존 코드를 확인한다.

`prd.md`는 제품 요구사항의 기준이다.
`tech-stack.md`는 기술 및 Architecture 기준이다.
기존 구현은 참고할 수 있지만 유지할 필요는 없다.

---

# 2. 작업 목표

현재 Repository를 **LUCID SPACE V1 Next.js Application**으로 구축한다.

V1의 핵심 목표:
- LUCID SPACE 브랜드 구현
- 우주 기반 Visual Identity
- 확장 가능한 Component Architecture
- Data Driven Project 구조
- LOTTO LAB 기본 기능
- BADUK LAB 확장 구조
- Tools / Notes 확장 구조
- Responsive Design
- Production Build 성공

---

# 3. 기존 프로젝트 활용

현재 Repository에 Next.js 프로젝트가 이미 존재하는 경우 그 기반을 활용한다.

기존 UI와 페이지 구현은 유지할 필요 없다.
필요하면 전면 교체한다.

기본 기술:
- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router

불필요한 외부 Dependency를 추가하지 않는다.
특히 Three.js 또는 무거운 Particle Library를 설치하지 않는다.

---

# 4. 기존 파일 보호

기존 Prototype이나 Reference 파일은 명확한 이유 없이 삭제하지 않는다.
필요하면 `legacy/` 폴더로 이동한다.

---

# 5. 홈페이지 구현

메인 페이지는 다음 순서를 기본으로 구현한다.

```text
Navigation
↓
Hero
↓
Identity
↓
Projects
↓
Current Experiment / Lotto Preview
↓
Tools
↓
Notes
↓
Footer
```

각 Section은 독립적인 Component로 구현한다.
하나의 거대한 `page.tsx`에 전체 UI를 작성하지 않는다.

---

# 6. LUCID SPACE Visual

사이트 디자인 Concept:

**Deep Space · Minimal · Futuristic**

사용 가능한 표현:
- Deep Navy Background
- Stars
- Subtle Nebula Gradient
- Glow
- Glass Effect
- Slow Animation
- Hover Effect
- Subtle Parallax

사용하지 말 것:
- 대용량 Background Video
- 과도한 3D
- 무거운 WebGL
- 불필요한 Animation Library
- 지나치게 화려한 Gaming UI

전체 인상은 **미래적이지만 차분하고 전문적인 개인 디지털 공간**이어야 한다.

---

# 7. Hero

```text
LUCID SPACE

Explore · Create · Grow

AI와 기술을 배우고 직접 만들며
새로운 가능성을 탐험하는 공간

[ EXPLORE ]
```

배경에는 가벼운 Star Field 또는 Space Effect를 구현한다.

---

# 8. Identity

```text
01 / IDENTITY

ABOUT LUCID
```

내용:

소방공무원으로서 사람의 안전을 고민하고,
AI와 기술을 활용하여 더 나은 방법을 탐구한다.

새로운 기술을 단순히 배우는 것보다
직접 만들고 사용하면서 가능성을 확인하는 것을 중요하게 생각한다.

Interest:
- FIRE & SAFETY
- AI
- PRODUCTIVITY
- CREATION

민감한 개인정보는 추가하지 않는다.

---

# 9. Projects

## LOTTO LAB
Category: `Probability · Data`
Status: `ACTIVE`

## BADUK LAB
Category: `Game · Learning`
Status: `DEVELOPMENT`

## NEXT MISSION
`Something new is coming...`

---

# 10. Planet Concept

각 Project는 하나의 Planet이라는 Visual Concept을 사용한다.

V1에서는 복잡한 실제 태양계 Simulation을 만들지 않는다.
Project Card 등에 Planet, Orbit, Glow, Star 등의 Visual Motif를 사용할 수 있다.

---

# 11. Project Data

프로젝트 정보를 UI Component에 직접 반복 작성하지 않는다.

예:
```text
data/
└── projects.ts
```

새로운 Project를 추가할 때 가능한 한 Project Data 추가만으로 Project List에 표시되도록 한다.

---

# 12. LOTTO LAB V1

경로:
```text
/projects/lotto
```

기본 기능:
- 1~45 번호
- 중복 없는 6개 번호
- Random 생성
- 오름차순 정렬
- 번호별 Ball 표시
- 다시 생성
- 최근 생성 번호 표시

번호 생성 로직은 UI Component에서 분리한다.

예:
```text
lib/
└── lotto/
    └── generateNumbers.ts
```

---

# 13. Lotto Preview

HOME에 LOTTO LAB Preview를 제공한다.

Preview에서는:
- LOTTO LAB 소개
- Random 번호 6개
- Generate 기능
- LOTTO LAB 이동

전체 통계 기능은 구현하지 않는다.

---

# 14. LOTTO Disclaimer

```text
본 기능은 데이터 및 확률 실험을 위한 프로젝트이며
당첨을 예측하거나 보장하지 않습니다.
```

---

# 15. BADUK LAB

경로:
```text
/projects/baduk
```

V1에서는 실제 바둑게임을 구현하지 않는다.
Project 소개와 현재 개발 상태를 표시한다.
향후 Application URL과 Repository URL을 연결할 수 있는 구조를 준비한다.

---

# 16. TOOLS

경로:
```text
/tools
```

V1에서는 Placeholder 및 기본 구조를 구현한다.

---

# 17. NOTES

경로:
```text
/notes
```

V1에서는 기본 Page와 Placeholder를 구현한다.
현재 단계에서 CMS를 구축하지 않는다.

---

# 18. ABOUT

경로:
```text
/about
```

HOME의 Identity 내용을 조금 더 확장하여 표현한다.
과도한 개인정보는 포함하지 않는다.

---

# 19. Navigation

Desktop:
```text
LUCID SPACE

HOME
PROJECTS
TOOLS
NOTES
ABOUT
```

Mobile에서도 모든 메뉴에 접근할 수 있어야 한다.

---

# 20. Responsive Design

다음 환경에서 정상 작동해야 한다.
- Desktop
- Tablet
- Smartphone

특히 확인:
- Navigation
- Hero Typography
- Project Cards
- LOTTO Balls
- Buttons
- Section Padding

모바일에서 가로 Scroll이 발생하지 않아야 한다.

---

# 21. Accessibility

- Semantic HTML
- Keyboard Navigation
- Focus State
- Contrast
- Alt Text
- Button / Link 역할 구분
- `prefers-reduced-motion`

---

# 22. SEO

기본 Title: `LUCID SPACE`

Description:
`AI와 기술을 배우고 직접 만들며 새로운 가능성을 탐험하는 개인 디지털 공간`

---

# 23. Modularity

반드시 지킬 것:
- 대형 단일 Component 금지
- Section별 Component 분리
- 반복 UI 재사용
- 콘텐츠와 UI 분리
- Business Logic과 UI 분리
- Project 간 불필요한 의존성 금지
- 새로운 Project 추가가 쉬운 구조
- 지나친 추상화 금지

---

# 24. 예상 구조

```text
app/
├── page.tsx
├── layout.tsx
├── projects/
│   ├── page.tsx
│   ├── lotto/
│   │   └── page.tsx
│   └── baduk/
│       └── page.tsx
├── tools/
│   └── page.tsx
├── notes/
│   └── page.tsx
└── about/
    └── page.tsx

components/
├── layout/
├── home/
├── projects/
├── lotto/
├── space/
└── ui/

data/
├── projects.ts
├── tools.ts
└── navigation.ts

lib/
└── lotto/

public/
└── images/
```

---

# 25. V1에서 구현하지 않을 기능

- MariaDB
- LOTTO 당첨번호 Database
- 실제 당첨번호 자동 수집
- LOTTO 고급 통계
- AI 예측
- 회원가입
- 로그인
- 관리자 페이지
- NAS 제어
- CI/CD
- 실제 BADUK Game
- CMS
- 복잡한 SPACE MAP
- Three.js 기반 3D Space

---

# 26. Dependency Policy

새로운 npm Package 추가를 최소화한다.
단순한 Animation 때문에 대형 Library를 추가하지 않는다.

---

# 27. 작업 완료 전 검증

반드시 실행:
```bash
npm run build
```

프로젝트에 lint/test 명령이 정의되어 있다면 함께 실행한다.

확인:
- HOME 정상 표시
- Navigation 정상
- Project Card 정상
- LOTTO 번호 생성 정상
- 중복 번호 없음
- LOTTO 번호 정렬
- BADUK Page 접근
- TOOLS Page 접근
- NOTES Page 접근
- ABOUT Page 접근
- Mobile Layout
- Console Error 없음

---

# 28. 작업 완료 보고

## 구현 내용
어떤 기능을 구현했는지 설명한다.

## 주요 파일
생성하거나 수정한 주요 파일을 설명한다.

## 테스트 결과
실행한 Test / Build 결과를 설명한다.

## 남은 작업
V1 Scope 밖이거나 추가 작업이 필요한 부분을 설명한다.

## 실행 방법
사용자가 로컬 PC에서 사이트를 실행하는 방법을 간단하게 설명한다.

---

# 29. 중요

사용자는 전문 개발자가 아니다.

따라서 불필요하게 복잡한 Architecture를 도입하지 않는다.
작은 기능을 수정하기 위해 전체 Architecture를 이해해야 하는 구조를 피한다.

---

# 30. 최종 목표

이번 작업의 목표는 LUCID SPACE를 완성하는 것이 아니다.

**앞으로 계속 성장시킬 수 있는 LUCID SPACE의 첫 번째 안정적인 기반을 만드는 것이다.**

Build the foundation.

Keep it simple.

Keep it modular.

Keep exploring.
