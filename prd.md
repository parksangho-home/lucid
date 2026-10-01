# LUCID SPACE
## Product Requirements Document

**Version:** 0.1  
**Project:** LUCID SPACE  
**Repository:** `parksangho-home/lucid`  
**Purpose:** 개인 홈페이지 · 프로젝트 허브 · 디지털 실험 공간

---

# 1. 프로젝트 개요

LUCID SPACE는 개인 소개만을 목적으로 하는 일반적인 포트폴리오 홈페이지가 아니다.

AI, 개발, 생산성, 게임, 데이터 분석 등 다양한 관심 분야에서 직접 만든 프로젝트와 도구를 연결하고, 학습 과정과 실험 결과를 기록하는 **확장형 개인 디지털 공간**을 목표로 한다.

사이트 전체는 하나의 **우주(SPACE)** 로 표현하며, 각각의 프로젝트와 관심 분야는 독립적인 **행성(Planet)** 또는 탐사 영역으로 표현한다.

향후 새로운 프로젝트가 계속 추가될 것을 전제로 설계한다.

---

# 2. Brand Identity

## Name
**LUCID SPACE**

## Tagline
**Explore · Create · Grow**

## Brand Concept

- Space
- Exploration
- Technology
- Creation
- Growth
- Experiment

LUCID SPACE는 새로운 기술과 아이디어를 탐색하고, 직접 만들고 실험하면서 성장하는 개인 공간을 의미한다.

---

# 3. Design Direction

전체 디자인은 **Deep Space + Minimal + Futuristic**를 기본 방향으로 한다.

과도하게 게임 같은 SF 디자인보다는 세련되고 차분한 우주 분위기를 지향한다.

## Visual

기본 배경:
- Black
- Deep Navy
- Dark Blue

Accent:
- Blue
- Cyan
- Violet
- White

표현 요소:
- 별
- 희미한 성운
- Glow
- 부드러운 Gradient
- Glass 효과
- 미세한 애니메이션

## 중요 원칙

우주 효과가 콘텐츠의 가독성을 방해해서는 안 된다.
애니메이션은 느리고 자연스럽게 구현한다.
지나친 WebGL, 3D 효과 또는 높은 GPU 사용량을 요구하는 효과는 V1에서 사용하지 않는다.
모바일 환경에서도 자연스럽게 작동해야 한다.

---

# 4. Site Architecture

```text
LUCID SPACE

HOME

PROJECTS
 ├─ LOTTO LAB
 ├─ BADUK LAB
 ├─ AI LAB (Future)
 └─ Future Projects

TOOLS
 └─ Small Web Utilities

NOTES
 ├─ AI
 ├─ Development
 ├─ Productivity
 └─ Etc.

ABOUT
```

각 영역은 향후 독립적으로 확장 가능해야 한다.

---

# 5. Core Concept — SPACE & PLANETS

LUCID SPACE 전체를 하나의 우주로 간주한다.
각 프로젝트 또는 주요 분야는 하나의 Planet으로 표현할 수 있다.

V1에서는 실제 3D 우주 지도를 구현하지 않는다.
단, 향후 SPACE MAP 또는 인터랙티브 프로젝트 탐색 화면으로 확장할 수 있도록 데이터 구조와 컴포넌트를 설계한다.

---

# 6. HOME

메인 페이지 구성 순서는 다음과 같다.

```text
Navigation
Hero
Identity / About Preview
Projects
Current Experiment / Lotto Preview
Tools
Notes
Footer
```

각 영역은 독립적인 React Component로 구현한다.

---

# 7. Navigation

메뉴:
- HOME
- PROJECTS
- TOOLS
- NOTES
- ABOUT

Desktop에서는 상단 고정 Navigation을 사용한다.
반투명 배경 및 Blur 효과를 사용할 수 있다.
Mobile에서는 햄버거 메뉴 또는 모바일 친화적인 Navigation을 사용한다.

---

# 8. Hero

표시 내용:

```text
LUCID SPACE

Explore · Create · Grow

AI와 기술을 배우고 직접 만들며
새로운 가능성을 탐험하는 공간

[ EXPLORE ]
```

배경에는 미세하게 움직이는 별과 은은한 빛을 사용한다.

---

# 9. Identity

Section Label: `01 / IDENTITY`

Title: `ABOUT LUCID`

핵심 메시지:

소방공무원으로서 사람의 안전을 고민하고, AI와 기술을 활용하여 더 나은 방법을 탐구한다.

새로운 기술을 단순히 배우는 것보다 직접 만들고 사용하면서 가능성을 확인하는 것을 중요하게 생각한다.

주요 관심 분야:
- FIRE & SAFETY
- AI
- PRODUCTIVITY
- CREATION

상세 소속기관, 연락처 또는 불필요한 개인정보는 노출하지 않는다.

---

# 10. Projects

Section Label: `02 / EXPLORATION`

Title: `PROJECTS`

Message:

**Ideas become experiments.  
Experiments become projects.**

## LOTTO LAB
Category: `Probability · Data`

로또 데이터를 이용하여 확률, 통계와 다양한 번호 생성 전략을 실험하는 데이터 프로젝트.

Status: `Active`

## BADUK LAB
Category: `Game · Learning`

바둑을 직접 배우기 위해 제작하는 개인 바둑 학습 및 게임 프로젝트.

Status: `Development`

별도의 프로젝트 또는 저장소로 개발할 수 있으며 LUCID SPACE에서 연결한다.

## NEXT MISSION
향후 프로젝트를 위한 Placeholder.

표시 문구: `Something new is coming...`

---

# 11. Project Data Architecture

프로젝트 정보를 페이지 내부에 반복적으로 Hard Coding하지 않는다.
가능하면 프로젝트 데이터를 별도의 데이터 파일에서 관리한다.

예:

```ts
{
  id: "lotto",
  name: "LOTTO LAB",
  category: "Probability · Data",
  description: "확률과 데이터를 이용한 로또 실험",
  status: "active",
  href: "/projects/lotto"
}
```

새로운 프로젝트를 추가할 때 프로젝트 데이터 추가만으로 주요 프로젝트 목록에 표시할 수 있는 구조를 우선한다.

---

# 12. LOTTO LAB

LOTTO LAB은 LUCID SPACE의 첫 번째 데이터 기반 실험 프로젝트다.

단순한 로또 번호 추천 서비스가 아니라 **확률 및 데이터 실험 프로젝트**로 정의한다.

## V1 기능

- 1~45 번호
- 중복 없는 번호 6개 생성
- 오름차순 정렬
- 번호별 색상 표현
- 다시 생성
- 최근 생성 번호 표시

홈 화면에서는 간단한 Preview만 제공한다.
상세 기능은 `/projects/lotto`에서 제공한다.

---

# 13. LOTTO LAB Future

향후 다음 기능을 구현할 수 있도록 확장성을 고려한다.

## Lottery Database
- 회차
- 추첨일
- 당첨번호
- 보너스번호

## Prediction Database
- 생성일
- 대상 회차
- 전략
- 추천번호
- 실제 일치 개수

## Strategies
- Random
- Frequency
- Long Absence
- Balanced
- LUCID Algorithm

각 전략의 결과를 장기간 비교할 수 있도록 한다.

과거 데이터가 미래의 독립적인 추첨 결과를 예측한다는 전제를 두지 않는다.
실험 및 통계 비교 목적으로 제공한다.

---

# 14. Lotto Statistics

향후 제공 가능한 통계:

- 번호별 출현 횟수
- 번호별 출현 비율
- 홀짝 분포
- 번호 구간 분포
- 연속 번호 발생
- 번호 합계 분포
- 전략별 평균 일치 번호
- 전략별 3개 이상 일치 횟수
- 전략별 4개 이상 일치 횟수
- 누적 추천 결과

그래프를 이용하여 시각화한다.

---

# 15. BADUK LAB

BADUK LAB은 별도 프로젝트로 개발할 수 있다.
LUCID SPACE에서는 프로젝트 정보와 실행 링크를 제공한다.

향후:
- 바둑 게임
- 바둑 학습
- AI 대국
- 기보 저장
- 대국 분석

등으로 확장할 수 있다.

LUCID SPACE와 BADUK 프로젝트의 코드가 불필요하게 강하게 결합되지 않도록 한다.

---

# 16. TOOLS

Section Label: `UTILITIES`

직접 제작한 작은 웹 도구를 모아두는 공간.

각 Tool 역시 데이터 기반으로 추가 및 제거하기 쉽게 설계한다.

향후 예:
- Random Generator
- Calculator
- Converter
- AI Utility
- Productivity Tool
- Personal Utility

---

# 17. NOTES

Section Label: `LOGBOOK`

개발 및 학습 기록 공간.

Category 예:
- AI
- DEVELOPMENT
- PRODUCTIVITY
- FIRE & SAFETY
- ETC

향후 Markdown 기반 콘텐츠 관리 방식을 검토할 수 있다.
V1에서는 구조와 Placeholder만 구현해도 된다.

---

# 18. Footer

```text
KEEP EXPLORING.

Explore · Create · Grow

LUCID SPACE

© 2026 LUCID SPACE
```

GitHub 링크 등을 추가할 수 있다.

---

# 19. Technical Stack

기본 기술:
- Next.js
- React
- TypeScript
- Tailwind CSS

Architecture:
- App Router
- Responsive Design
- Component Based Architecture

향후 Backend:
- Next.js API 또는 적절한 API 구조

Database/Auth:
- Supabase PostgreSQL / Supabase Auth (Google OAuth)

운영 배포는 Vercel과 Supabase를 기준으로 한다.

---

# 20. Deployment Architecture

개발:
```text
Local PC
↓
VS Code
↓
Git
↓
GitHub
```

운영:
```text
GitHub
↓
Vercel + Supabase
↓
LUCID SPACE
```

GitHub의 변경 사항을 Vercel에 배포하는 CI/CD 구조를 사용한다.

---

# 21. Development Workflow

```text
PRD
↓
Codex
↓
Implementation
↓
Local Test
↓
Fine Tuning
↓
Git
↓
GitHub
↓
NAS Deployment
```

대규모 기능 구현은 PRD를 기준으로 진행한다.

---

# 22. Modularity Requirements

1. 거대한 단일 `page.tsx`에 전체 홈페이지를 구현하지 않는다.
2. 주요 Section은 독립 Component로 분리한다.
3. Project, Tool, Navigation 등의 콘텐츠 데이터와 UI 코드를 가능한 한 분리한다.
4. 프로젝트 추가 또는 삭제 때문에 여러 파일을 반복 수정하는 구조를 피한다.
5. 공통 UI는 재사용 가능한 Component로 구현한다.
6. LOTTO LAB과 BADUK LAB 등 개별 프로젝트의 로직이 서로 의존하지 않도록 한다.
7. 향후 새로운 Planet/Project를 추가할 수 있도록 확장성을 고려한다.
8. 과도한 추상화는 피한다.

---

# 23. Suggested Structure

```text
app/
 ├─ page.tsx
 ├─ projects/
 │   ├─ page.tsx
 │   ├─ lotto/
 │   └─ baduk/
 ├─ tools/
 ├─ notes/
 └─ about/

components/
 ├─ layout/
 ├─ home/
 ├─ projects/
 ├─ space/
 └─ ui/

data/
 ├─ projects.ts
 ├─ tools.ts
 └─ navigation.ts

public/
 └─ images/
```

---

# 24. Performance

- 불필요한 대용량 영상 배경 금지
- 과도한 JavaScript animation 금지
- 이미지 최적화
- Lazy Loading
- 모바일 성능 고려
- Reduced Motion 지원

---

# 25. Responsive Design

다음 환경을 기본 지원한다.

- Desktop
- Tablet
- Smartphone

특히 스마트폰에서 프로젝트 탐색과 LOTTO LAB 사용에 불편함이 없어야 한다.

---

# 26. V1 Scope

## 구현
- LUCID SPACE Design System
- Navigation
- Hero
- Identity
- Projects
- LOTTO LAB 기본 번호 생성
- BADUK LAB Placeholder/Link 구조
- Tools Placeholder
- Notes Placeholder
- Footer
- Responsive Design
- 기본 우주 Background/Animation

## 구현하지 않음
- LOTTO Database
- 실제 당첨번호 자동 수집
- 고급 통계
- 사용자 계정
- 관리자 페이지
- AI 기능
- 복잡한 3D Space Map
- NAS 제어
- CI/CD 자동화

---

# 27. Development Principle

**Build small. Expand continuously.**

LUCID SPACE는 한 번 완성하고 끝나는 홈페이지가 아니다.

새로운 프로젝트, 관심 분야, 도구와 아이디어를 지속적으로 추가할 수 있는 개인 디지털 공간으로 발전시킨다.

---

# 28. Future Vision

**LUCID SPACE는 사용자의 프로젝트와 지식이 축적되면서 함께 성장하는 개인 디지털 우주를 목표로 한다.**
