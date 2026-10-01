import Link from "next/link";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { STRATEGIES, STRATEGY_DETAILS } from "@/lib/lotto/types";

export function LottoPreview() {
  return (
    <section className="section container">
      <div className="experiment-panel">
        <div>
          <SectionTitle
            label="03 / CURRENT EXPERIMENT"
            title={"FIVE STRATEGIES.\nONE EXPERIMENT."}
          />
          <p className="body-copy">
            매주 다섯 전략으로 한 게임씩 추천하고, 실제 당첨 결과와 비교합니다.
            데이터가 쌓일수록 전략의 성적을 살펴볼 수 있습니다.
          </p>
          <Link className="text-link" href="/projects/lotto">
            EXPLORE LOTTO LAB ↗
          </Link>
        </div>
        <div className="preview-strategies">
          <span className="eyebrow">5 WEEKLY PICKS / 5 STRATEGIES</span>
          {STRATEGIES.map((strategy, index) => (
            <div key={strategy}>
              <span className="mono">
                GAME {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{STRATEGY_DETAILS[strategy].name}</strong>
              <span className="muted">↗</span>
            </div>
          ))}
          <p>실제 추천번호는 로그인 후 회차별로 한 번 생성됩니다.</p>
        </div>
      </div>
    </section>
  );
}
