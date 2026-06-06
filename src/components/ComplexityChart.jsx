import { useState, useEffect, useRef } from 'react'

const FNS = [
  { label: 'O(1)',       fn: () => 1,                  color: '#22d3a0' },
  { label: 'O(log n)',   fn: n => Math.log2(n || 1),   color: '#38bdf8' },
  { label: 'O(n)',       fn: n => n,                   color: '#f59e0b' },
  { label: 'O(n log n)', fn: n => n * Math.log2(n||1), color: '#a78bfa' },
  { label: 'O(n²)',      fn: n => n * n,               color: '#f43f5e' },
]

export default function ComplexityChart() {
  const [n, setN] = useState(50)
  const [active, setActive] = useState(new Set(['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)']))
  const svgRef = useRef()

  const toggle = label => setActive(a => {
    const s = new Set(a)
    s.has(label) ? s.delete(label) : s.add(label)
    return s
  })

  const W = 560, H = 300, PL = 55, PR = 20, PT = 20, PB = 40
  const cW = W - PL - PR, cH = H - PT - PB

  const maxY = Math.max(...FNS.filter(f => active.has(f.label)).map(f => {
    let m = 0; for (let i = 1; i <= n; i++) m = Math.max(m, f.fn(i)); return m
  }), 1)

  const px = v => PL + (v / n) * cW
  const py = v => PT + cH - Math.min((v / maxY) * cH, cH)

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map(r => PT + r * cH)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>BIG-O COMPLEXITY CHART</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FNS.map(f => (
              <button key={f.label} onClick={() => toggle(f.label)} style={{
                padding: '3px 10px', borderRadius: 5, fontSize: 11, fontFamily: 'JetBrains Mono',
                fontWeight: 700, cursor: 'pointer', border: `1px solid ${f.color}`,
                background: active.has(f.label) ? f.color + '22' : 'transparent',
                color: active.has(f.label) ? f.color : 'var(--text3)',
                opacity: active.has(f.label) ? 1 : 0.5
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, color: 'var(--text2)' }}>
            n = <b style={{ color: 'var(--text)', fontFamily: 'JetBrains Mono' }}>{n}</b>
            <input type="range" min={5} max={100} value={n} onChange={e => setN(+e.target.value)}
              style={{ accentColor: 'var(--accent)', width: '100%', maxWidth: 200 }} />
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: 340 }}>
            {/* Grid */}
            {gridYs.map((y, i) => (
              <line key={i} x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--border)" strokeWidth={0.5} />
            ))}
            {/* Axes */}
            <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="var(--border2)" strokeWidth={1.5} />
            <line x1={PL} y1={PT + cH} x2={W - PR} y2={PT + cH} stroke="var(--border2)" strokeWidth={1.5} />
            {/* Axis labels */}
            <text x={W / 2} y={H - 5} textAnchor="middle" fill="var(--text3)" fontSize={11} fontFamily="JetBrains Mono">Input size (n)</text>
            <text x={12} y={H / 2} textAnchor="middle" fill="var(--text3)" fontSize={11} fontFamily="JetBrains Mono" transform={`rotate(-90 12 ${H / 2})`}>Operations</text>

            {/* Lines */}
            {FNS.filter(f => active.has(f.label)).map(f => {
              const pts = []
              for (let v = 1; v <= n; v++) {
                const y = py(f.fn(v))
                if (y < PT) break
                pts.push(`${v === 1 ? 'M' : 'L'}${px(v)},${y}`)
              }
              return <path key={f.label} d={pts.join('')} fill="none" stroke={f.color} strokeWidth={2.5} strokeLinecap="round" />
            })}

            {/* Labels at end */}
            {FNS.filter(f => active.has(f.label)).map(f => {
              let lastV = n
              while (lastV > 1 && py(f.fn(lastV)) < PT + 4) lastV--
              const y = py(f.fn(lastV))
              if (y < PT + 10) return null
              return <text key={f.label} x={px(lastV) - 4} y={y - 6} fontSize={10} fontFamily="JetBrains Mono" fill={f.color} textAnchor="end">{f.label}</text>
            })}
          </svg>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.08em', marginBottom: 12 }}>VALUES AT n = {n}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FNS.map(f => (
            <div key={f.label} style={{ background: 'var(--surface)', border: `1px solid ${f.color}44`, borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 90 }}>
              <div style={{ fontSize: 10, color: f.color, fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text)' }}>
                {Math.round(f.fn(n)).toLocaleString()}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>operations</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}