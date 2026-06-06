import ComplexityChart from '../components/ComplexityChart'

const ALGO_TABLE = [
  { name: 'Bubble Sort',    best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',      space: 'O(1)',      stable: true  },
  { name: 'Selection Sort', best: 'O(n²)',      avg: 'O(n²)',      worst: 'O(n²)',      space: 'O(1)',      stable: false },
  { name: 'Insertion Sort', best: 'O(n)',       avg: 'O(n²)',      worst: 'O(n²)',      space: 'O(1)',      stable: true  },
  { name: 'Merge Sort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)',      stable: true  },
  { name: 'Quick Sort',     best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)',      space: 'O(log n)', stable: false },
  { name: 'Heap Sort',      best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)',      stable: false },
  { name: 'Linear Search',  best: 'O(1)',       avg: 'O(n)',       worst: 'O(n)',        space: 'O(1)',      stable: null  },
  { name: 'Binary Search',  best: 'O(1)',       avg: 'O(log n)',   worst: 'O(log n)',    space: 'O(1)',      stable: null  },
  { name: 'BFS / DFS',      best: 'O(V+E)',     avg: 'O(V+E)',     worst: 'O(V+E)',     space: 'O(V)',      stable: null  },
]

const getColor = (val) => {
  if (!val) return 'var(--text2)'
  if (val.includes('n²') || val.includes('2ⁿ')) return '#f43f5e'
  if (val.includes('n log n'))                   return '#f59e0b'
  if (val.includes('log n'))                     return '#22d3a0'
  if (val === 'O(n)' || val.includes('V+E'))     return '#f59e0b'
  if (val === 'O(1)' || val === 'O(V)')          return '#22d3a0'
  return 'var(--text2)'
}

export default function ComplexityPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>

      {/* Interactive Chart */}
      <ComplexityChart />

      {/* Comparison Table */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden', flexShrink: 0
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em'
        }}>
          FULL COMPARISON TABLE
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'JetBrains Mono' }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                {['Algorithm', 'Best Case', 'Average Case', 'Worst Case', 'Space', 'Stable'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontSize: 10,
                    color: 'var(--text3)', letterSpacing: '0.08em', fontWeight: 700,
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap'
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALGO_TABLE.map((row, i) => (
                <tr key={row.name} style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                }}>
                  <td style={{ padding: '10px 14px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '10px 14px', color: getColor(row.best),  fontWeight: 600 }}>{row.best}</td>
                  <td style={{ padding: '10px 14px', color: getColor(row.avg),   fontWeight: 600 }}>{row.avg}</td>
                  <td style={{ padding: '10px 14px', color: getColor(row.worst), fontWeight: 600 }}>{row.worst}</td>
                  <td style={{ padding: '10px 14px', color: getColor(row.space), fontWeight: 600 }}>{row.space}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {row.stable === null
                      ? <span style={{ color: 'var(--text3)' }}>—</span>
                      : row.stable
                        ? <span style={{ color: '#22d3a0' }}>✅ Yes</span>
                        : <span style={{ color: '#f43f5e' }}>❌ No</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cheat Sheet */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 16, flexShrink: 0
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em', marginBottom: 12 }}>
          BIG-O CHEAT SHEET — FASTEST TO SLOWEST
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'O(1)',       desc: 'Constant',     color: '#22d3a0', example: 'Array access, Hash lookup'   },
            { label: 'O(log n)',   desc: 'Logarithmic',  color: '#38bdf8', example: 'Binary search, BST ops'      },
            { label: 'O(n)',       desc: 'Linear',       color: '#f59e0b', example: 'Linear search, Array scan'   },
            { label: 'O(n log n)', desc: 'Linearithmic', color: '#a78bfa', example: 'Merge sort, Heap sort'       },
            { label: 'O(n²)',      desc: 'Quadratic',    color: '#f43f5e', example: 'Bubble sort, Nested loops'   },
            { label: 'O(2ⁿ)',      desc: 'Exponential',  color: '#f43f5e', example: 'Naive Fibonacci, Subsets'    },
          ].map(({ label, desc, color, example }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: `1px solid ${color}33`,
              borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 130
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'JetBrains Mono', marginBottom: 3 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{desc}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>{example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}