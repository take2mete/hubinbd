/**
 * Migration bridge: the existing HubinBD experience remains available while
 * the single-file app is incrementally decomposed into typed components.
 * Preserved legacy source: public/hubinbd-legacy.html
 */
export default function HomePage() {
  return (
    <main className="legacy-frame" aria-label="HubinBD homepage">
      <iframe title="HubinBD homepage" src="/hubinbd-legacy.html" className="legacy-frame__content" />
    </main>
  );
}
