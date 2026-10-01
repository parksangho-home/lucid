import { LottoBalls } from "./LottoBalls";
import { AuthControls } from "./AuthControls";
import { GenerateWeeklyButton } from "./GenerateWeeklyButton";
import {
  STRATEGIES,
  STRATEGY_DETAILS,
  type Draw,
  type Prediction,
} from "@/lib/lotto/types";
import { summarize } from "@/lib/lotto/stats";

type Current = { drawNumber: number; drawDate: string; open: boolean } | null;

function DrawDate({ value }: { value: string }) {
  return <time dateTime={value}>{value}</time>;
}

function StrategyCards({ games }: { games: Prediction[] }) {
  return (
    <div className="strategy-grid">
      {STRATEGIES.map((strategy, index) => {
        const game = games.find((item) => item.strategy === strategy);
        return (
          <article className="strategy-card" key={strategy}>
            <div className="strategy-card-top">
              <span className="eyebrow">
                GAME {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mono">{game ? "SAVED" : "WAITING"}</span>
            </div>
            <h3>{STRATEGY_DETAILS[strategy].name}</h3>
            <p className="muted small">
              {STRATEGY_DETAILS[strategy].description}
            </p>
            {game ? (
              <LottoBalls numbers={game.numbers} />
            ) : (
              <p className="strategy-empty">— · — · — · — · — · —</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Performance({ predictions }: { predictions: Prediction[] }) {
  const stats = summarize(predictions);
  const checked = predictions.filter((item) => item.matchCount !== null);
  const byDraw = [...new Set(checked.map((item) => item.drawNumber))]
    .sort((a, b) => a - b)
    .map((drawNumber) => {
      const items = checked.filter((item) => item.drawNumber === drawNumber);
      const matches = items.reduce(
        (sum, item) => sum + Number(item.matchCount),
        0,
      );
      return {
        drawNumber,
        average: matches / items.length,
        matches,
        games: items.length,
      };
    });
  const cumulative = byDraw.reduce<
    Array<{
      drawNumber: number;
      matches: number;
      games: number;
      average: number;
    }>
  >((all, item) => {
    const previous = all.at(-1);
    const matches = (previous?.matches ?? 0) + item.matches;
    const games = (previous?.games ?? 0) + item.games;
    return [
      ...all,
      { drawNumber: item.drawNumber, matches, games, average: matches / games },
    ];
  }, []);
  return (
    <>
      <section className="lotto-block">
        <p className="eyebrow">MY PERFORMANCE</p>
        <h2>나의 누적 성적</h2>
        <div className="performance-grid">
          <div>
            <span>참여 회차</span>
            <strong>{stats.participation}</strong>
          </div>
          <div>
            <span>추천 게임</span>
            <strong>{stats.games}</strong>
          </div>
          <div>
            <span>평균 일치</span>
            <strong>
              {stats.average === null ? "—" : stats.average.toFixed(2)}
            </strong>
          </div>
          <div>
            <span>최고 기록</span>
            <strong>{stats.best === null ? "—" : `${stats.best}개`}</strong>
          </div>
        </div>
        <p className="muted small">
          당첨 결과가 등록된 {stats.checked}게임을 기준으로 평균을 계산합니다.
        </p>
      </section>
      <section className="lotto-block">
        <p className="eyebrow">STRATEGY PERFORMANCE</p>
        <h2>전략별 성적</h2>
        <div className="table-scroll">
          <table className="lotto-table">
            <thead>
              <tr>
                <th scope="col">전략</th>
                <th scope="col">참여</th>
                <th scope="col">평균 일치</th>
                <th scope="col">3개 이상</th>
              </tr>
            </thead>
            <tbody>
              {stats.strategies.map((row) => (
                <tr key={row.strategy}>
                  <th scope="row">{STRATEGY_DETAILS[row.strategy].name}</th>
                  <td>{row.games}</td>
                  <td>{row.average === null ? "—" : row.average.toFixed(2)}</td>
                  <td>{row.threePlus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="chart-grid">
          <div>
            <h3>전략별 평균 일치</h3>
            {stats.strategies.map((row) => (
              <div className="bar-row" key={row.strategy}>
                <span>{STRATEGY_DETAILS[row.strategy].name}</span>
                <div className="bar-track">
                  <i style={{ width: `${((row.average ?? 0) / 6) * 100}%` }} />
                </div>
                <b>{row.average?.toFixed(2) ?? "—"}</b>
              </div>
            ))}
          </div>
          <div>
            <h3>전략별 3개 이상</h3>
            {stats.strategies.map((row) => (
              <div className="bar-row" key={row.strategy}>
                <span>{STRATEGY_DETAILS[row.strategy].name}</span>
                <div className="bar-track">
                  <i
                    style={{
                      width: `${stats.checked ? (row.threePlus / Math.max(1, ...stats.strategies.map((item) => item.threePlus))) * 100 : 0}%`,
                    }}
                  />
                </div>
                <b>{row.threePlus}</b>
              </div>
            ))}
          </div>
        </div>
        <h3 className="trend-title">최근 회차별 평균 일치</h3>
        <div className="trend-chart">
          {byDraw.length ? (
            byDraw.slice(-12).map((item) => (
              <div key={item.drawNumber} className="trend-column">
                <span>{item.average.toFixed(1)}</span>
                <i
                  style={{
                    height: `${Math.max(3, (item.average / 6) * 100)}%`,
                  }}
                />
                <small>{item.drawNumber}회</small>
              </div>
            ))
          ) : (
            <p className="muted small">비교된 회차가 아직 없습니다.</p>
          )}
        </div>
        <h3 className="trend-title">누적 평균 일치 추이</h3>
        <div className="trend-chart">
          {cumulative.length ? (
            cumulative.slice(-12).map((item) => (
              <div key={item.drawNumber} className="trend-column">
                <span>{item.average.toFixed(2)}</span>
                <i
                  style={{
                    height: `${Math.max(3, (item.average / 6) * 100)}%`,
                  }}
                />
                <small>{item.drawNumber}회</small>
              </div>
            ))
          ) : (
            <p className="muted small">비교된 회차가 아직 없습니다.</p>
          )}
        </div>
        <h3 className="trend-title">일치 개수 분포</h3>
        <div className="distribution">
          {stats.distribution.map((count, matches) => (
            <div key={matches}>
              <span>{matches}개</span>
              <div className="bar-track">
                <i
                  style={{
                    width: `${stats.checked ? (count / stats.checked) * 100 : 0}%`,
                  }}
                />
              </div>
              <b>{count}</b>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function LottoDashboard({
  current,
  previous,
  predictions,
  userName,
  authReady,
  dataReady,
  dataError,
}: {
  current: Current;
  previous: Draw | null;
  predictions: Prediction[];
  userName?: string;
  authReady: boolean;
  dataReady: boolean;
  dataError?: boolean;
}) {
  const weekly = current
    ? predictions.filter((item) => item.drawNumber === current.drawNumber)
    : [];
  const complete = weekly.length === 5;
  return (
    <div className="lotto-v2">
      <div className="lotto-overview">
        <section className="lotto-block">
          <p className="eyebrow">CURRENT DRAW</p>
          <h2>현재 대상 회차</h2>
          {current ? (
            <>
              <strong className="draw-number">{current.drawNumber}회</strong>
              <p>
                추첨일 <DrawDate value={current.drawDate} />
              </p>
              <span
                className={`status ${current.open ? "active" : "development"}`}
              >
                {current.open ? "추천 진행 중" : "추첨 결과 반영 대기"}
              </span>
            </>
          ) : (
            <p className="muted">{previous ? "다음 회차 준비 중입니다." : "당첨 데이터가 아직 초기화되지 않았습니다."}</p>
          )}
        </section>
        <section className="lotto-block">
          <p className="eyebrow">PREVIOUS DRAW</p>
          <h2>지난 회차 당첨번호</h2>
          {previous ? (
            <>
              <p>
                <strong>{previous.drawNumber}회</strong> ·{" "}
                <DrawDate value={previous.drawDate} />
              </p>
              <LottoBalls numbers={previous.numbers} />
            </>
          ) : (
            <p className="muted">당첨 데이터가 아직 초기화되지 않았습니다.</p>
          )}
        </section>
      </div>
      {!dataReady && (
        <section className="lotto-block" role="status">
          <h2>데이터 연결 준비 중</h2>
          <p className="body-copy">
            Supabase와 Google 로그인을 설정하면 실제 회차·추천·성적이 이곳에
            표시됩니다. 예시 당첨번호나 성적은 표시하지 않습니다.
          </p>
        </section>
      )}
      {dataError && (
        <p className="form-error" role="alert">
          데이터를 불러오지 못했습니다. DB 연결과 마이그레이션을 확인해 주세요.
        </p>
      )}
      <section className="lotto-block">
        <div className="lotto-heading">
          <div>
            <p className="eyebrow">THIS WEEK / 5 STRATEGIES</p>
            <h2>
              이번 주 추천{" "}
              <span className="muted">{weekly.length} / 5 GAME</span>
            </h2>
          </div>
          {userName && <AuthControls name={userName} />}
        </div>
        {!userName && (
          <div className="login-callout">
            <p>
              {current ? "추천과 개인 기록을 이용하려면 로그인하세요." : "지난 회차와 전략 설명은 누구나 볼 수 있습니다."}
            </p>
            {authReady ? (
              <AuthControls />
            ) : (
              <span className="muted small">
                로그인 설정을 기다리고 있습니다.
              </span>
            )}
          </div>
        )}
        {userName && current?.open && !complete && weekly.length === 0 && (
          <div className="generate-callout">
            <p>
              5개 전략이 각각 1게임을 생성합니다. 생성 후 해당 회차에서는 다시 변경할 수 없습니다.
            </p>
            <GenerateWeeklyButton />
          </div>
        )}
        {userName && complete && (
          <p className="success-callout" role="status">
            이번 회차 5게임이 저장되었습니다.
          </p>
        )}
        {userName && weekly.length > 0 && !complete && (
          <p className="form-error">
            저장된 게임이 5개 미만입니다. 데이터 무결성을 확인해 주세요.
          </p>
        )}
        {userName && current && !current.open && (
          <p className="muted small">
            최신 당첨 결과 반영 대기 중입니다.
          </p>
        )}
        <StrategyCards games={weekly} />
      </section>
      {userName && (
        <>
          <Performance predictions={predictions} />
          <section className="lotto-block">
            <p className="eyebrow">HISTORY</p>
            <h2>추천 기록</h2>
            {predictions.length ? (
              <div className="history-list">
                {predictions.map((item) => (
                  <article key={item.id}>
                    <div>
                      <span className="mono">
                        {item.drawNumber}회 · {item.drawDate}
                      </span>
                      <h3>{STRATEGY_DETAILS[item.strategy].name}</h3>
                      <span className="muted small">
                        {item.matchCount === null
                          ? "결과 대기"
                          : `${item.matchCount}개 일치`}
                      </span>
                    </div>
                    <LottoBalls numbers={item.numbers} />
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">아직 추천 기록이 없습니다.</p>
            )}
          </section>
        </>
      )}
      <p className="lotto-disclaimer">
        LOTTO LAB은 과거 당첨 데이터를 활용해 번호 선택 전략의 결과를 비교하는
        통계 실험입니다. 추천번호는 실제 추첨 결과를 예측하지 않으며, 다섯 전략의
        결과는 같은 회차에서 장기간 비교하기 위한 기록입니다.
      </p>
    </div>
  );
}
