/** Transitional bridge for the existing storefront while sections are migrated. */
export default function LegacyFrame() {
  return (
    <main className="legacy-frame" aria-label="HubinBD homepage">
      <iframe title="HubinBD homepage" src="/hubinbd-legacy.html" className="legacy-frame__content" />
    </main>
  );
}
