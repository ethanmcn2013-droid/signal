export default function SignalAnalyticsLoading() {
  return (
    <div className="signal-analytics" aria-busy="true" aria-live="polite">
      <div className="signal-app-grid">
        <aside className="signal-context-sidebar" aria-hidden="true" />
        <div className="signal-main">
          <header className="signal-header">
            <div className="signal-header-inner" style={{ minHeight: 240 }}>
              <p className="signal-eyebrow">Signal is reading the connected work</p>
              <h1 className="signal-title">Building your briefing…</h1>
              <p className="signal-subtitle">
                Scope, permission, and source coverage are being checked.
              </p>
            </div>
          </header>
          <div className="signal-content">
            <div className="signal-panel" style={{ minHeight: 180 }} />
          </div>
        </div>
      </div>
      <span className="signal-visually-hidden">Loading Signal analytics</span>
    </div>
  );
}
