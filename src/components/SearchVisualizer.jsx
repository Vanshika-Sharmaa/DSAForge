import { useEffect, useState } from 'react'
import { useSearch } from '../hooks/useSearch'

export default function SearchVisualizer() {
  const [type, setType] = useState('linear')
  const [target, setTarget] = useState('')
  const [speed, setSpeed] = useState(5)
  const sh = useSearch()

  useEffect(() => { sh.generate(type === 'binary') }, [type])

  const cellColor = (i) => {
    if (sh.found === i)        return { bg: '#22d3a0', color: '#000', border: '#22d3a0' }
    if (sh.active.includes(i)) return { bg: '#f59e0b', color: '#000', border: '#f59e0b' }
    if (sh.visited.includes(i))return { bg: 'rgba(108,99,255,0.2)', color: '#a78bfa', border: '#6c63ff' }
    return { bg: 'var(--surface)', color: 'var(--text2)', border: 'var(--border)' }
  }

  const handleSearch = () => {
    const t = parseInt(target)
    if (isNaN(t)) return alert('Enter Number!')
    if (type === 'linear') sh.runLinear(t, speed)
    else sh.runBinary(t, speed)
  }

  return (
    <>
      <style>{`
        .sv-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .sv-main {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sv-body {
          padding: 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .sv-cells {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
          padding-bottom: 6px;
        }
        .sv-cell {
          width: clamp(34px, 10vw, 48px);
          height: clamp(34px, 10vw, 48px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 2px solid;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s;
          position: relative;
          flex-shrink: 0;
        }
        .sv-cell-idx {
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: var(--text3);
          font-family: 'JetBrains Mono', monospace;
        }
        .sv-stats {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 16px;
        }
        .sv-stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 10px;
          flex: 1;
          min-width: 0;
        }
        .sv-stat-label {
          font-size: 9px;
          color: var(--text2);
          letter-spacing: 0.1em;
          margin-bottom: 3px;
          font-family: 'JetBrains Mono', monospace;
        }
        .sv-stat-val {
          font-size: 16px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sv-log {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          max-height: 160px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .sv-controls {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          align-items: center;
          flex-shrink: 0;
          background: var(--bg2);
        }
        .sv-target-input {
          background: var(--bg);
          border: 1px solid var(--border2);
          border-radius: 6px;
          padding: 8px 10px;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          width: 130px;
          height: 36px;
          outline: none;
          box-sizing: border-box;
        }
        .sv-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .sv-root {
            flex-direction: row;
          }
          .sv-main {
            flex: 1;
            min-width: 0;
          }
          .sv-body {
            overflow-y: auto;
          }
          .sv-info {
            width: 280px;
            flex-shrink: 0;
          }
        }
      `}</style>

      <div className="sv-root">
        {/* ── Main panel ── */}
        <div className="sv-main">
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>SEARCH VISUALIZER</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['linear', 'binary'].map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: type === t ? 'var(--accent)' : 'var(--surface)',
                  border: `1px solid ${type === t ? 'var(--accent)' : 'var(--border)'}`,
                  color: type === t ? '#fff' : 'var(--text2)', fontFamily: 'JetBrains Mono',
                }}>{t === 'linear' ? 'Linear' : 'Binary'}</button>
              ))}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="sv-body">
            {/* Cells */}
            <div className="sv-cells">
              {sh.arr.map((v, i) => {
                const c = cellColor(i)
                return (
                  <div key={i} className="sv-cell" style={{ background: c.bg, borderColor: c.border, color: c.color }}>
                    {v}
                    <span className="sv-cell-idx">{i}</span>
                  </div>
                )
              })}
            </div>

            {/* Stats */}
            <div className="sv-stats">
              {[
                ['Steps',  sh.steps],
                ['Target', target || '—'],
                ['Result', sh.found >= 0 ? `idx ${sh.found}` : sh.found === -2 ? 'Not found' : '—'],
              ].map(([l, v]) => (
                <div key={l} className="sv-stat">
                  <div className="sv-stat-label">{l.toUpperCase()}</div>
                  <div className="sv-stat-val">{v}</div>
                </div>
              ))}
            </div>

            {/* Step log */}
            <div className="sv-log">
              <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>STEP LOG</div>
              {sh.log.length === 0
                ? <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>Start searching...</div>
                : sh.log.map((l, i) => (
                  <div key={i} style={{
                    fontSize: 11, fontFamily: 'JetBrains Mono', lineHeight: 1.8,
                    color: l.includes('FOUND') ? '#22d3a0' : l.includes('not found') ? '#f43f5e' : 'var(--text2)',
                  }}>{l}</div>
                ))
              }
            </div>
          </div>

          {/* Controls */}
          <div className="sv-controls">
            <input
              className="sv-target-input"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="Target number..."
              type="number"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Btn onClick={handleSearch} disabled={sh.running} primary>▶ Search</Btn>
            <Btn onClick={() => sh.generate(type === 'binary')} green>⟳ New</Btn>
            <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
              Speed:
              <input type="range" min={1} max={10} value={speed}
                onChange={e => setSpeed(+e.target.value)}
                style={{ accentColor: 'var(--accent)', width: 70 }} />
            </div>
          </div>
        </div>

        {/* ── Info panels ── */}
        <div className="sv-info">
          <InfoPanel title="How It Works" content={type === 'linear'
    ? 'Checks each element from left to right until the target is found or the array ends.'
    : 'Checks the middle of a sorted array. Target smaller → left half, larger → right half. Repeat.'} />
          <CxPanel rows={type === 'linear'
            ? [['Best', 'O(1)', '#22d3a0'], ['Worst', 'O(n)', '#f43f5e'], ['Space', 'O(1)', '#38bdf8']]
            : [['Best', 'O(1)', '#22d3a0'], ['Worst', 'O(log n)', '#f59e0b'], ['Space', 'O(1)', '#38bdf8'], ['Req.', 'Sorted array', 'var(--text)']]} />
          <InfoPanel title="Tip 💡" content={type === 'linear'
    ? 'Linear search works on unsorted arrays but is slow for large data.'
    : 'Binary search only works on sorted arrays — finds in just 20 steps among 1M elements!'} />
        </div>
      </div>
    </>
  )
}

function Btn({ children, onClick, disabled, primary, green }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.15)' : 'var(--surface)',
      color: primary ? '#fff' : green ? '#22d3a0' : 'var(--text2)',
      border: `1px solid ${primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`,
      borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700,
      height: 36, boxSizing: 'border-box',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      fontFamily: 'JetBrains Mono',
    }}>{children}</button>
  )
}

function InfoPanel({ title, content }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.08em', marginBottom: 8 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>{content}</div>
    </div>
  )
}

function CxPanel({ rows }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.08em', marginBottom: 8 }}>COMPLEXITY</div>
      {rows.map(([k, v, c]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
          <span style={{ color: 'var(--text2)', fontFamily: 'JetBrains Mono' }}>{k}</span>
          <span style={{ color: c, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{v}</span>
        </div>
      ))}
    </div>
  )
}