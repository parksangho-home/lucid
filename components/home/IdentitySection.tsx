import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function IdentitySection() {
  return (
    <section id="identity" className="section container identity">
      <SectionTitle label="01 / IDENTITY" title="ABOUT LUCID" />
      <div>
        <h3 className="identity-title">
          사람을 위한 고민에서,
          <br />
          <span>새로운 가능성의 탐험으로.</span>
        </h3>
        <p className="body-copy">
          소방공무원으로서 사람의 안전을 고민하고,
          <br className="desktop-break" /> AI와 기술을 활용하여 더 나은 방법을
          탐구합니다.
        </p>
        <p className="body-copy">
          단순히 배우는 것보다 직접 만들고 사용하며
          <br className="desktop-break" /> 아이디어의 가능성을 확인하는 과정을
          좋아합니다.
        </p>
        <div className="tags">
          {["FIRE & SAFETY", "AI", "PRODUCTIVITY", "CREATION"].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <Link href="/about" className="text-link">
          MORE ABOUT LUCID ↗
        </Link>
      </div>
    </section>
  );
}
