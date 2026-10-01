import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-top">
        <div>
          <p className="eyebrow">THE JOURNEY CONTINUES</p>
          <h2>
            KEEP EXPLORING<span>.</span>
          </h2>
          <p className="muted">Explore · Create · Grow</p>
        </div>
        <Link className="text-link" href="/projects">
          다음 탐험 시작하기 ↗
        </Link>
      </div>
      <div className="footer-bottom">
        <Link href="/" className="footer-brand">
          LUCID SPACE
        </Link>
        <span>© 2026 LUCID SPACE</span>
        <a
          href="https://github.com/parksangho-home/lucid"
          target="_blank"
          rel="noopener noreferrer"
        >
          GITHUB ↗
        </a>
      </div>
    </footer>
  );
}
