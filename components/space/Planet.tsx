export function Planet({
  theme = "cyan",
}: {
  theme?: "cyan" | "violet" | "muted";
}) {
  return (
    <div className={`planet-scene ${theme}`} aria-hidden="true">
      <div className="planet-orbit" />
      <div className="planet" />
      <span className="planet-satellite" />
    </div>
  );
}
