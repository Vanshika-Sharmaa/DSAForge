import { useState } from 'react'


export default function GraphPage() {

  const [mode, setMode] = useState('')
  const [trigger, setTrigger] = useState(0)
  const [speed, setSpeed] = useState(5)

  const runBFS = () => {
    setMode('BFS')
    setTrigger(t => t + 1)
  }

  const runDFS = () => {
    setMode('DFS')
    setTrigger(t => t + 1)
  }

  const reset = () => {
    setMode('')
    setTrigger(t => t + 1)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      height: '100%',
      gap: 12
    }}>

      {/* TOP CONTROL BAR */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap'
      }}>

        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>
          GRAPH CONTROLS
        </span>

        <button onClick={runBFS} style={btn('#38bdf8')}>
          ▶ BFS
        </button>

        <button onClick={runDFS} style={btn('#22d3a0')}>
          ▶ DFS
        </button>

        <button onClick={reset} style={btn('#f59e0b')}>
          ⟳ Reset
        </button>

        {/* SPEED CONTROL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>Speed</span>
          <input
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
            style={{ width: 90 }}
          />
        </div>

        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          color: 'var(--text2)'
        }}>
          Mode: <b>{mode || 'NONE'}</b>
        </span>

      </div>

      {/* VISUALIZER */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <GraphVisualizer
          mode={mode}
          trigger={trigger}
          speed={speed}
        />
      </div>

    </div>
  )
}

function btn(color) {
  return {
    padding: '6px 12px',
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: 'transparent',
    color,
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer'
  }
}
