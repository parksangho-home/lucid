export function PageIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{label}</p>
      <h1>
        {title}
        <span>.</span>
      </h1>
      <p>{description}</p>
    </div>
  );
}
