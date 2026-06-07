import { useState, useRef, useCallback } from 'react'
import { addHistory } from '../utils/history'

const sleep = ms => new Promise(r => setTimeout(r, ms))

const NODES = [
  { id: 0, x: 280, y: 55,  label: 'A' },
  { id: 1, x: 140, y: 145, label: 'B' },
  { id: 2, x: 420, y: 145, label: 'C' },
  { id: 3, x: 75,  y: 255, label: 'D' },
  { id: 4, x: 205, y: 255, label: 'E' },
  { id: 5, x: 355, y: 255, label: 'F' },
  { id: 6, x: 490, y: 255, label: 'G' },
  { id: 7, x: 140, y: 345, label: 'H' },
  { id: 8, x: 290, y: 345, label: 'I' },
]

const EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[4,8],[5,8],[6,8]]

const ADJ = {}
NODES.forEach(n => { ADJ[n.id] = [] })
EDGES.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a) })

const gpStyles = [
  '.gp-page { display:flex; flex-direction:column; gap:12px; overflow-y:auto; height:100%; }',
  '.gp-svg-card { background:var(--bg2); border:1px solid var(--border); border-radius:12px; display:flex; flex-direction:column; overflow:hidden; flex-shrink:0; }',
  '.gp-svg-wrap { height:340px; flex-shrink:0; }',
  '.gp-svg-wrap svg { width:100%; height:100%; }',
  '.gp-btns { display:flex; gap:8px; padding:10px 14px; border-top:1px solid var(--border); align-items:center; flex-wrap:wrap; flex-shrink:0; }',
  '.gp-info { display:grid; grid-template-columns:1fr 1fr; gap:10px; }',
  '.gp-info-full { grid-column:1/-1; }',
  '@media (min-width:768px) {',
  '  .gp-page { flex-direction:row; overflow:hidden; }',
  '  .gp-svg-card { flex:1; min-width:0; }',
  '  .gp-svg-wrap { height:unset; flex:1; }',
  '  .gp-info { width:260px; flex-shrink:0; display:flex; flex-direction:column; overflow-y:auto; }',
  '  .gp-info-full { grid-column:unset; }',
  '}',
].join('\n')

export default function GraphPage() {
  const [visited,    setVisited]    = useState(new Set())
  const [current,    setCurrent]    = useState(-1)
  const [queued,     setQueued]     = useState(new Set())
  const [order,      setOrder]      = useState([])
  const [queueList,  setQueueList]  = useState([])
  const [running,    setRunning]    = useState(false)
  const [speed,      setSpeed]      = useState(5)
  const [activeAlgo, setActiveAlgo] = useState('')

  const stopRef = useRef(false)

  const clearState = useCallback(() => {
    setVisited(new Set()); setCurrent(-1); setQueued(new Set())
    setOrder([]); setQueueList([]); setActiveAlgo('')
  }, [])

  const reset = useCallback(() => {
    stopRef.current = true; setRunning(false); clearState()
  }, [clearState])

  const traverse = useCallback(async (type) => {
    stopRef.current = true
    await sleep(60)
    stopRef.current = false
    setVisited(new Set()); setCurrent(-1); setQueued(new Set())
    setOrder([]); setQueueList([]); setActiveAlgo(type); setRunning(true)

    const delay = () => sleep(610 - speed * 50)
    const vis = new Set(); const ord = []; const isBFS = type === 'bfs'
    const structure = [0]; const inStructure = new Set([0])

    while (structure.length > 0 && !stopRef.current) {
      const node = isBFS ? structure.shift() : structure.pop()
      inStructure.delete(node)
      if (vis.has(node)) continue
      vis.add(node); ord.push(NODES[node].label)
      setCurrent(node); setVisited(new Set(vis)); setOrder([...ord])
      setQueueList([...structure].map(n => NODES[n].label))
      setQueued(new Set(inStructure))
      await delay()
      for (const nb of ADJ[node]) {
        if (!vis.has(nb) && !inStructure.has(nb)) { structure.push(nb); inStructure.add(nb) }
      }
      setQueued(new Set(inStructure))
    }

    if (!stopRef.current) {
      setCurrent(-1); setRunning(false); setQueueList([])
      addHistory({
        type: type === 'bfs' ? 'Graph BFS' : 'Graph DFS',
        meta: { algorithm: type.toUpperCase(), visitOrder: ord.join(' -> '), nodes: NODES.length, edges: EDGES.length },
      })
    }
  }, [speed])

  const nodeColor  = id => id === current ? '#f59e0b' : visited.has(id) ? '#6c63ff' : queued.has(id) ? 'rgba(34,211,160,0.25)' : 'var(--surface)'
  const nodeStroke = id => id === current ? '#f59e0b' : visited.has(id) ? '#a78bfa' : queued.has(id) ? '#22d3a0' : 'var(--border)'
  const edgeVisited = ([a, b]) => visited.has(a) && visited.has(b)

  return (
    <>
      <style>{gpStyles}</style>

      <div className="gp-page">
        <div className="gp-svg-card">
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:'var(--text2)', letterSpacing:'0.06em' }}>GRAPH TRAVERSAL</span>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[['#f59e0b','Current'],['#6c63ff','Visited'],['#22d3a0','Queued']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--text2)' }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:c }} />{l}
                </div>
              ))}
            </div>
          </div>
          <div className="gp-svg-wrap">
            <svg viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet">
              {EDGES.map(([a,b],i) => (
                <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
                  stroke={edgeVisited([a,b]) ? '#6c63ff' : 'var(--border)'}
                  strokeWidth={edgeVisited([a,b]) ? 2.5 : 1.5}
                  strokeOpacity={edgeVisited([a,b]) ? 1 : 0.4} />
              ))}
              {NODES.map(n => (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={22} fill={nodeColor(n.id)} stroke={nodeStroke(n.id)} strokeWidth={2} style={{ transition:'fill 0.2s, stroke 0.2s' }} />
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                    fill={visited.has(n.id) || n.id === current ? '#fff' : 'var(--text2)'}
                    fontSize={13} fontWeight={700} fontFamily="JetBrains Mono" style={{ pointerEvents:'none' }}>
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="gp-btns">
            <Btn onClick={() => traverse('bfs')} disabled={running} primary>Run BFS</Btn>
            <Btn onClick={() => traverse('dfs')} disabled={running} green>Run DFS</Btn>
            <Btn onClick={reset}>Reset</Btn>
            <div style={{ fontSize:11, color:'var(--text2)', display:'flex', alignItems:'center', gap:5 }}>
              Speed:
              <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ accentColor:'var(--accent)', width:70 }} />
              <span style={{ fontFamily:'JetBrains Mono', fontSize:10, minWidth:12 }}>{speed}</span>
            </div>
          </div>
        </div>

        <div className="gp-info">
          <InfoBox title={activeAlgo === 'dfs' ? 'DFS Stack' : 'BFS Queue'} color="#f59e0b">
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#f59e0b' }}>
              {queueList.length > 0 ? '[ ' + queueList.join(' -> ') + ' ]' : 'Empty'}
            </div>
          </InfoBox>
          <InfoBox title="Visit Order" color="#22d3a0">
            <div style={{ fontFamily:'JetBrains Mono', fontSize:12, color:'#22d3a0', lineHeight:2 }}>
              {order.length > 0 ? order.join(' -> ') : 'Not started yet'}
            </div>
          </InfoBox>
          <div className="gp-info-full" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text2)', letterSpacing:'0.08em', marginBottom:10 }}>COMPLEXITY</div>
            {[['Time','O(V + E)','#22d3a0'],['Space BFS','O(V)','#38bdf8'],['Space DFS','O(V)','#a78bfa'],['Vertices',NODES.length,'var(--text)'],['Edges',EDGES.length,'var(--text)']].map(([k,v,c]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                <span style={{ color:'var(--text2)', fontFamily:'JetBrains Mono' }}>{k}</span>
                <span style={{ color:c, fontWeight:700, fontFamily:'JetBrains Mono' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function InfoBox({ title, color, children }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
      <div style={{ fontSize:10, fontWeight:700, color, letterSpacing:'0.08em', marginBottom:8 }}>{title.toUpperCase()}</div>
      {children}
    </div>
  )
}

function Btn({ children, onClick, disabled, primary, green }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.15)' : 'var(--surface)',
      color: primary ? '#fff' : green ? '#22d3a0' : 'var(--text2)',
      border: '1px solid ' + (primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.3)' : 'var(--border)'),
      borderRadius:7, padding:'7px 14px', fontSize:12, fontWeight:700,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      fontFamily:'JetBrains Mono',
    }}>{children}</button>
  )
}