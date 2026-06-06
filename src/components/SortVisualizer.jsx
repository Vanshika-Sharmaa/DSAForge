import { useEffect, useState } from 'react'
import { algoData } from '../utils/algoData'

export default function SortVisualizer({ algo, sortHook }) {
  const { arr, comparing, sortedIdx, pivot, stats, running, generate, runSort, stop } = sortHook
  const [speed, setSpeed] = useState(5)
  const [size, setSize]   = useState(40)
  const info = algoData[algo]
  const maxVal = Math.max(...arr, 1)

  useEffect(() => { generate(size) }, [algo])

  const barColor = (i) => {
    if (pivot === i)          return '#f43f5e'
    if (comparing.includes(i)) return '#f59e0b'
    if (sortedIdx.includes(i)) return '#22d3a0'
    return '#6c63ff'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Responsive: stack on mobile, side-by-side on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: 12, flex: 1,
      }}>
        <style>{`
          @media(min-width:768px){
            .sort-grid { grid-template-columns: minmax(0,1fr) 300px !important; }
          }
        `}</style>
        <div className="sort-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
          gap: 12, flex: 1,
        }}>
          {/* Left — Bars */}
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>
                ARRAY VISUALIZATION
              </span>
              <span style={{
                fontSize: 10, padding: '3px 8px',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 4, color: '#f59e0b', fontFamily: 'JetBrains Mono',
              }}>
                {stats.comparisons} comparisons
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px 0', flexWrap: 'wrap' }}>
              {[['Comparisons', stats.comparisons], ['Swaps', stats.swaps], ['Size', arr.length], ['Time', stats.time + 'ms']].map(([l, v]) => (
                <div key={l} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '7px 10px', flex: 1, minWidth: 60,
                }}>
                  <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '0.1em', marginBottom: 2 }}>{l.toUpperCase()}</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div style={{
              flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              gap: 2, padding: '12px 14px', minHeight: 150,
            }}>
              {arr.map((v, i) => (
                <div key={i} style={{
                  flex: 1, maxWidth: 28, minWidth: 2,
                  height: `${(v / maxVal) * 100}%`,
                  background: barColor(i),
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.08s ease, background 0.1s',
                  minHeight: 4,
                }} />
              ))}
            </div>

            {/* Controls */}
            <div style={{
              padding: '10px 14px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <button
                onClick={() => { stop(); generate(size) }}
                disabled={running}
                style={{
                  padding: '7px 14px', background: 'var(--surface)',
                  border: '1px solid var(--border2)', borderRadius: 6,
                  color: 'var(--text2)', fontSize: 11, cursor: 'pointer',
                }}
              >↺ Reset</button>
              <button
                onClick={() => runSort(algo, speed)}
                disabled={running}
                style={{
                  padding: '7px 16px',
                  background: running ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.9)',
                  border: '1px solid var(--accent)', borderRadius: 6,
                  color: '#fff', fontSize: 11, cursor: running ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                }}
              >{running ? '▶ Running...' : '▶ Sort'}</button>
              {running && (
                <button
                  onClick={stop}
                  style={{
                    padding: '7px 14px', background: 'rgba(244,63,94,0.15)',
                    border: '1px solid rgba(244,63,94,0.5)', borderRadius: 6,
                    color: '#f43f5e', fontSize: 11, cursor: 'pointer',
                  }}
                >■ Stop</button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                <label style={{ fontSize: 10, color: 'var(--text2)' }}>Speed</label>
                <input
                  type="range" min={1} max={10} value={speed}
                  onChange={e => setSpeed(+e.target.value)}
                  style={{ width: 70, accentColor: '#6c63ff' }}
                />
                <label style={{ fontSize: 10, color: 'var(--text2)', marginLeft: 6 }}>Size</label>
                <input
                  type="range" min={10} max={80} value={size}
                  onChange={e => { setSize(+e.target.value); if (!running) generate(+e.target.value) }}
                  style={{ width: 70, accentColor: '#6c63ff' }}
                />
              </div>
            </div>
          </div>

          {/* Right — Info panel */}
          <AlgoInfoPanel info={info} />
        </div>
      </div>
    </div>
  )
}

function AlgoInfoPanel({ info }) {
  const [showCode, setShowCode] = useState(false)
  if (!info) return null
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{info.name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { label: 'Best', val: info.best,   color: '#22d3a0' },
            { label: 'Avg',  val: info.avg,    color: '#f59e0b' },
            { label: 'Worst',val: info.worst,  color: '#f43f5e' },
            { label: 'Space',val: info.space,  color: '#38bdf8' },
            { label: 'Stable',val: info.stable ? 'Yes' : 'No', color: info.stable ? '#22d3a0' : '#f43f5e' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 10px',
            }}>
              <div style={{ fontSize: 9, color: 'var(--text2)', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 10,
      }}>
        <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6 }}>HOW IT WORKS</div>
        <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.7 }}>{info.description}</div>
      </div>

      <div>
        <button
          onClick={() => setShowCode(s => !s)}
          style={{
            width: '100%', padding: '8px 12px',
            background: showCode ? 'var(--surface)' : 'transparent',
            border: '1px solid var(--border2)', borderRadius: 6,
            color: 'var(--text2)', fontSize: 11, cursor: 'pointer', textAlign: 'left',
          }}
        >{showCode ? '▼' : '▶'} Code Snippet</button>
        {showCode && (
          <pre style={{
            margin: '8px 0 0', padding: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 10, color: 'var(--text)',
            overflowX: 'auto', fontFamily: 'JetBrains Mono',
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>
            {info.code}
          </pre>
        )}
      </div>
    </div>
  )
}
