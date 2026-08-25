interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>This screen is pending the approved design handoff from docs/estateos/.</p>
    </section>
  );
}
