import CodePlayground from '../components/CodePlayground'

export default function PlaygroundPage({ onAnalyzeWithAI }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', gap: 8
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Code Playground</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
            Write, run, and analyze JavaScript live in the browser
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Language', val: 'JavaScript', color: '#f59e0b' },
            { label: 'Runtime',  val: 'Browser V8', color: '#22d3a0' },
            { label: 'AI',       val: 'Claude',     color: '#a78bfa' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: color + '18', border: `1px solid ${color}40`,
              fontFamily: 'JetBrains Mono', color
            }}>
              {label}: <b>{val}</b>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <CodePlayground onAnalyzeWithAI={onAnalyzeWithAI} />
      </div>
    </div>
  )
}