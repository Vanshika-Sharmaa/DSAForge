import SearchVisualizer from '../components/SearchVisualizer'

export default function SearchPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 16px',
        display: 'flex', gap: 12, alignItems: 'center',
        flexShrink: 0, flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
          Search Algorithms
        </span>
        {[
          { label: 'Linear Worst', val: 'O(n)',     color: '#f43f5e' },
          { label: 'Binary Worst', val: 'O(log n)', color: '#22d3a0' },
          { label: 'Space',        val: 'O(1)',      color: '#38bdf8' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4,
            background: color + '18', border: `1px solid ${color}40`,
            fontFamily: 'JetBrains Mono', color
          }}>
            {label}: <b>{val}</b>
          </div>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginLeft: 'auto' }}>
          Enter a target number and press Search
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <SearchVisualizer />
      </div>
    </div>
  )
}