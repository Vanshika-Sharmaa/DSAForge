import AIAnalyzer from "../components/AIAnalyzer";

export default function AIPage({ initialCode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      {/* Banner */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "9px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            AI Code Analyzer
          </span>
          <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "JetBrains Mono" }}>
            Powered by Claude — paste DSA code or ask any algorithm question
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 4,
            background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)",
            fontFamily: "JetBrains Mono", color: "#a78bfa",
          }}>
            claude-opus-4-5
          </span>
          {initialCode && (
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 4,
              background: "rgba(34,211,160,0.1)", border: "1px solid rgba(34,211,160,0.25)",
              fontFamily: "JetBrains Mono", color: "#22d3a0",
            }}>
              ✓ Code loaded from Playground
            </span>
          )}
        </div>
      </div>

      {/* Analyzer — fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <AIAnalyzer initialCode={initialCode} />
      </div>
    </div>
  );
}
