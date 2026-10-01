import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
export const metadata = { title: "ABOUT" };
export default function AboutPage() {
  return (
    <div className="container inner-page about-page">
      <PageIntro
        label="IDENTITY / THE EXPLORER"
        title="ABOUT LUCID"
        description="Explore · Create · Grow"
      />
      <div className="about-content">
        <p className="eyebrow">SAFETY MEETS POSSIBILITY</p>
        <h2>
          더 나은 방법은
          <br />
          작은 질문에서 시작됩니다.
        </h2>
        <p className="body-copy">
          소방공무원으로서 사람의 안전을 고민하고, AI와 기술을 활용하여 더 나은
          방법을 탐구합니다. 현장에서 마주하는 문제와 일상의 작은 불편함은
          새로운 배움의 출발점이 됩니다.
        </p>
        <p className="body-copy">
          새로운 기술을 단순히 배우는 것보다 직접 만들고 사용하면서 가능성을
          확인하는 것을 중요하게 생각합니다. 확률 실험, 바둑 학습, 작은 생산성
          도구까지 관심이 생긴 주제를 하나씩 프로젝트로 만들어 갑니다.
        </p>
        <div className="tags">
          {["FIRE & SAFETY", "AI", "PRODUCTIVITY", "CREATION"].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <h3>Build small. Expand continuously.</h3>
        <p className="body-copy">
          LUCID SPACE는 프로젝트와 지식이 쌓이면서 함께 성장하는 개인 디지털
          우주입니다. 완성된 결과뿐 아니라 배우고 실험하는 과정도 이곳에
          담아가려 합니다.
        </p>
        <Link href="/projects" className="button primary">
          프로젝트 탐험하기 ↗
        </Link>
      </div>
    </div>
  );
}
