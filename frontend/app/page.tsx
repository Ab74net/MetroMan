export default function HomePage() {
  return (
    <main className="home-shell">
      <section>
        <p className="eyebrow">Washington DC Metro</p>
        <h1>Real-Time 3D Map</h1>
        <p>
          This Next.js scaffold powers the App Router experience. Hooked into the backend, it
          will eventually visualize trains, alerts, and the city in immersive detail.
        </p>
        <div className="status-pill">Part 1: Foundations</div>
      </section>
    </main>
  );
}

export const runtime = "edge";
