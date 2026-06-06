import SortVisualizer from '../components/SortVisualizer'
import { algoData }   from '../utils/algoData'

export default function VisualizerPage({ algo, sortHook }) {
  const info = algoData[algo]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* Complexity banner */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '8px 14px',
        display: 'flex', flexWrap: 'wrap', gap: 10,
        alignItems: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{info?.name}</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { label: 'Best',  val: info?.best,  color: '#22d3a0' },
            { label: 'Avg',   val: info?.avg,   color: '#f59e0b' },
            { label: 'Worst', val: info?.worst, color: '#f43f5e' },
            { label: 'Space', val: info?.space, color: '#38bdf8' },
          ].map(({ label, val, color }) => (
            <span key={label} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: 'var(--bg2)', border: `1px solid ${color}30`,
              color,
            }}>{label}: {val}</span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SortVisualizer algo={algo} sortHook={sortHook} />
      </div>
    </div>
  )
}
