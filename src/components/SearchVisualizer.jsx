import { useEffect, useState } from 'react'
import { useSearch } from '../hooks/useSearch'

export default function SearchVisualizer() {
  const [type, setType] = useState('linear')
  const [target, setTarget] = useState('')
  const [speed, setSpeed] = useState(5)
  const sh = useSearch()

  useEffect(() => { sh.generate(type === 'binary') }, [type])

  const cellColor = (i) => {
    if (sh.found === i) return { bg: '#22d3a0', color: '#000', border: '#22d3a0' }
    if (sh.active.includes(i)) return { bg: '#f59e0b', color: '#000', border: '#f59e0b' }
    if (sh.visited.includes(i)) return { bg: 'rgba(108,99,255,0.2)', color: '#a78bfa', border: '#6c63ff' }
    return { bg: 'var(--surface)', color: 'var(--text2)', border: 'var(--border)' }
  }

  const handleSearch = () => {
    const t = parseInt(target)
    if (isNaN(t)) return alert('Number daalo!')
    if (type === 'linear') sh.runLinear(t, speed)
    else sh.runBinary(t, speed)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 14, height: '100%' }} className="search-grid">
      <style>{`@media(min-width:768px){ .search-grid { grid-template-columns: minmax(0,1fr) 280px !important; } }`}</style>
      <div style={panel}>
        <PanelHead title="Search Visualizer">
          <div style={{ display: 'flex', gap: 6 }}>
            {['linear', 'binary'].map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: type === t ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${type === t ? 'var(--accent)' : 'var(--border)'}`,
                color: type === t ? '#fff' : 'var(--text2)', fontFamily: 'JetBrains Mono'
              }}>{t === 'linear' ? 'Linear' : 'Binary'}</button>
            ))}
          </div>
        </PanelHead>

        <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
          {/* Cells */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {sh.arr.map((v, i) => {
              const c = cellColor(i)
              return (
                <div key={i} style={{
                  width: 'clamp(32px,8vw,48px)', height: 'clamp(32px,8vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: c.bg, border: `2px solid ${c.border}`, borderRadius: 8,
                  fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: c.color,
                  transition: 'all 0.2s', position: 'relative'
                }}>
                  {v}
                  <span style={{ position: 'absolute', bottom: -18, fontSize: 9, color: 'var(--text3)' }}>{i}</span>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginTop: 24, marginBottom: 16 }}>
            {[['Steps', sh.steps], ['Target', target || '—'], ['Result', sh.found >= 0 ? `idx ${sh.found}` : sh.found === -2 ? 'Not found' : '—']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', flex: 1 }}>
                <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '0.1em', marginBottom: 3 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Log */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, maxHeight: 200, overflow: 'auto' }}>
            <div style={{ fontSize: 9, color: 'var(--text2)', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>STEP LOG</div>
            {sh.log.length === 0
              ? <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>Search start karo...</div>
              : sh.log.map((l, i) => <div key={i} style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: l.includes('FOUND') ? '#22d3a0' : l.includes('not found') ? '#f43f5e' : 'var(--text2)', lineHeight: 1.8 }}>{l}</div>)
            }
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Target number..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ background: 'var(--bg)', border: '1px solid var(--border2 )', borderRadius: 6, padding: '7px 10px', color: 'var(--text)', fontFamily: 'JetBrains Mono', fontSize: 12, width: 140, outline: 'none' }} />
          <Btn onClick={handleSearch} disabled={sh.running} primary>▶ Search</Btn>
          <Btn onClick={() => sh.generate(type === 'binary')} green>⟳ New</Btn>
          <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5 }}>
            Speed: <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ accentColor: 'var(--accent)', width: 70 }} />
          </div>
        </div>
      </div>

      {/* Right info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InfoPanel title="How It Works" content={type === 'linear'
          ? 'Har element ko left se right check karta hai jab tak target mile ya array khatam ho.'
          : 'Sorted array mein middle check karta hai. Target chota → left half, bada → right half. Repeat.'} />
        <CxPanel rows={type === 'linear'
          ? [['Best', 'O(1)', '#22d3a0'], ['Worst', 'O(n)', '#f43f5e'], ['Space', 'O(1)', '#38bdf8']]
          : [['Best', 'O(1)', '#22d3a0'], ['Worst', 'O(log n)', '#f59e0b'], ['Space', 'O(1)', '#38bdf8'], ['Req.', 'Sorted array', 'var(--text)']]} />
        <InfoPanel title="Tip 💡" content={type === 'linear'
          ? 'Linear search unsorted arrays pe kaam karta hai lekin slow hai large data ke liye.'
          : 'Binary search sirf sorted arrays pe kaam karta hai — 1M elements mein sirf 20 steps!'} />
      </div>
    </div>
  )
}

// Shared mini components
const panel = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }

function PanelHead({ title, children }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>{title.toUpperCase()}</span>
      {children}
    </div>
  )
}

function Btn({ children, onClick, disabled, primary, green }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.15)' : 'var(--surface)',
      color: primary ? '#fff' : green ? '#22d3a0' : 'var(--text2)',
      border: `1px solid ${primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`,
      borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      fontFamily: 'JetBrains Mono'
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