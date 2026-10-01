import Link from "next/link";

export function HeroSection() {
  return (
    <section className="hero container">
      <div className="hero-orbits" aria-hidden="true">
        <i />
        <i />
        <i />
        <span />
      </div>
      <div className="hero-content">
        <p className="eyebrow hero-label">
          <span className="live-dot" /> A PERSONAL SPACE FOR ENDLESS
          POSSIBILITIES
        </p>
        <h1>
          LUCID <span>SPACE</span>
        </h1>
        <p className="hero-tagline">
          Explore <b>·</b> Create <b>·</b> Grow
        </p>
        <p className="hero-description">
          AI와 기술을 배우고 직접 만들며
          <br />
          새로운 가능성을 탐험하는 공간
        </p>
        <Link className="button primary" href="/projects">
          EXPLORE <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="hero-bottom">
        <span>EST. 2026 · ALWAYS IN EXPLORATION</span>
        <Link href="/projects">
          EXPLORE PROJECTS <span aria-hidden="true">↗</span>
        </Link>
        <span>BUILT ON EARTH</span>
      </div>
    </section>
  );
}
