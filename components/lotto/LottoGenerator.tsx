"use client";

import { useState } from "react";
import { generateNumbers } from "@/lib/lotto/generateNumbers";
import { LottoBalls } from "./LottoBalls";

export function LottoGenerator({ preview = false }: { preview?: boolean }) {
  const [history, setHistory] = useState<number[][]>([]);
  const [count, setCount] = useState(0);
  function generate() {
    const numbers = generateNumbers();
    setHistory((previous) => [numbers, ...previous].slice(0, 5));
    setCount((previous) => previous + 1);
  }
  return (
    <div className="generator">
      <div className="generator-heading">
        <span className="eyebrow">RANDOM EXPLORATION</span>
        <span className="mono">6 / 45</span>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true">
        <LottoBalls numbers={history[0] ?? []} />
        <p className="generator-hint">
          {count
            ? `${count}번째 실험 · 무작위로 생성한 번호입니다`
            : "버튼을 눌러 첫 번째 실험을 시작하세요"}
        </p>
      </div>
      <button
        type="button"
        className="button primary generate-button"
        onClick={generate}
      >
        <span aria-hidden="true">⤨</span> {count ? "다시 생성" : "번호 생성"}
        <span className="mono">GENERATE</span>
      </button>
      <p className="disclaimer">
        본 기능은 데이터 및 확률 실험을 위한 프로젝트이며
        <br />
        당첨을 예측하거나 보장하지 않습니다.
      </p>
      {!preview && (
        <div className="history">
          <div className="generator-heading">
            <h2>최근 생성 번호</h2>
            <span className="mono">최근 5회 · 현재 페이지</span>
          </div>
          {history.length ? (
            <ol>
              {history.map((numbers, index) => (
                <li key={count - index}>
                  <span className="mono">
                    #{String(count - index).padStart(2, "0")}
                  </span>
                  <LottoBalls numbers={numbers} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="body-copy">아직 생성한 번호가 없습니다.</p>
          )}
          <p className="muted small">
            페이지를 새로고침하거나 이동하면 기록이 초기화됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
