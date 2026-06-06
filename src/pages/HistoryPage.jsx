import { useState, useEffect } from 'react'
import { getHistory, clearHistory } from '../utils/history'

const TYPE_ICON = {
  'Graph BFS':  '🔵',
  'Graph DFS':  '🟢',
  'AI_ANALYSIS':'🤖',
  'Sorting':    '📊',
  'Search':     '🔍',
  'Code Run':   '💻',
}

const TYPE_COLOR = {
  'Graph BFS':  '#38bdf8',
  'Graph DFS':  '#22d3a0',
  'AI_ANALYSIS':'#a78bfa',
  'Sorting':    '#f59e0b',
  'Search':     '#22d3a0',
  'Code Run':   '#38bdf8',
}

const getIcon  = t => TYPE_ICON[t]  || '📋'
const getColor = t => TYPE_COLOR[t] || '#6c63ff'

export default function HistoryPage() {
  const [history, setHistory] = useState([])

  const load = () => setHistory(getHistory())

  useEffect(() => {
    load()
    // Re-sync whenever addHistory() fires the custom event (same tab, instant)
    window.addEventListener('dsa_history_updated', load)
    // Re-sync when user switches back from another browser tab
    window.addEventListener('focus', load)
    return () => {
      window.removeEventListener('dsa_history_updated', load)
      window.removeEventListener('focus', load)
    }
  }, [])

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  return (
    <div style={{ maxWidth: 720, width: '100%' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            Analysis History
          </div>
          <div style={{
            fontSize: 11, color: 'var(--text2)',
            fontFamily: 'JetBrains Mono', marginTop: 2
          }}>
            {history.length} session{history.length !== 1 ? 's' : ''} saved
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'JetBrains Mono', color: 'var(--text2)'
          }}>
            ↻ Refresh
          </button>
          {history.length > 0 && (
            <button onClick={handleClear} style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: '#f43f5e', borderRadius: 7, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'JetBrains Mono'
            }}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 48, textAlign: 'center'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ color: 'var(--text2)', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
            No history yet.
          </div>
          <div style={{ color: 'var(--text3)', fontFamily: 'JetBrains Mono', fontSize: 11, marginTop: 6 }}>
            Run BFS, DFS, a sort, a search, or use AI Analyzer to see entries here.
          </div>
        </div>
      ) : (
        history.map((h, i) => (
          <div key={i} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'flex-start', gap: 14,
            transition: 'border-color 0.15s'
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: 'var(--surface)',
              border: `1px solid ${getColor(h.type)}33`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, flexShrink: 0
            }}>
              {getIcon(h.type)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                {h.type}
              </div>
              <div style={{
                fontSize: 11, color: 'var(--text3)',
                fontFamily: 'JetBrains Mono', marginBottom: 6
              }}>
                {h.date} · {h.time}
              </div>

              {h.meta && Object.keys(h.meta).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(h.meta).slice(0, 4).map(([k, v]) => (
                    <span key={k} style={{
                      fontSize: 10, padding: '2px 8px',
                      background: 'var(--surface)',
                      border: `1px solid ${getColor(h.type)}33`,
                      borderRadius: 4, color: 'var(--text2)',
                      fontFamily: 'JetBrains Mono',
                      maxWidth: 260, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {k}: {String(v).slice(0, 50)}{String(v).length > 50 ? '…' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              width: 3, alignSelf: 'stretch', borderRadius: 2,
              background: getColor(h.type), opacity: 0.6, flexShrink: 0
            }} />
          </div>
        ))
      )}
    </div>
  )
}