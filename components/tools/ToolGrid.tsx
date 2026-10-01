import { tools } from "@/data/tools";
import Link from "next/link";

export function ToolGrid() {
  return (
    <div className="tool-grid">
      {tools.map((tool) => (
        <article key={tool.id} className="tool-card">
          <span className="tool-symbol" aria-hidden="true">
            {tool.symbol}
          </span>
          <span className="coming-label">{tool.href ? "AVAILABLE" : "COMING SOON"}</span>
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
          {tool.href && <Link className="text-link" href={tool.href}>도구 열기 ↗</Link>}
        </article>
      ))}
    </div>
  );
}
