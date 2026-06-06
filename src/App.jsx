import { useState, useCallback, useEffect } from 'react'
import Sidebar         from './components/Sidebar'
import VoiceToggle     from './components/VoiceToggle'
import VisualizerPage  from './pages/VisualizerPage'
import SearchPage      from './pages/SearchPage'
import GraphPage       from './pages/GraphPage'
import ComplexityPage  from './pages/ComplexityPage'
import PlaygroundPage  from './pages/PlaygroundPage'
import AIPage          from './pages/AIPage'
import HistoryPage     from './pages/HistoryPage'
import PracticePage    from './pages/PracticePage'
import GameModePage    from './pages/Gamemodepage'
import MemoryPage      from './pages/Memorypage'
import { useSort }     from './hooks/useSort'

const TITLES = {
  visualizer: 'Sorting Visualizer',
  search:     'Search Visualizer',
  graph:      'Graph BFS / DFS',
  complexity: 'Big-O Complexity',
  playground: 'Code Playground',
  ai:         'AI Analyzer',
  history:    'History',
  practice:   '🎯 Practice Mode',
  game:       '🎮 Game Mode',
  memory:     '🧠 Memory Trainer',
}

const LAYOUT_CSS = `
  .app-shell { display:flex; height:100vh; overflow:hidden; background:var(--bg); }
  .app-sidebar { width:220px; flex-shrink:0; }
  .app-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .app-content { flex:1; overflow:auto; padding:14px; -webkit-overflow-scrolling:touch; }
  .topbar-mobile-btn { display:none!important; }
  .algo-badge { display:inline!important; }

  @media(max-width:768px){
    .app-sidebar {
      position:fixed; top:0; left:0; bottom:0; z-index:50;
      transform:translateX(-100%); transition:transform 0.25s ease;
      width:220px;
    }
    .app-sidebar.open { transform:translateX(0); }
    .topbar-mobile-btn { display:flex!important; }
    .algo-badge { display:none!important; }
    .app-content { padding:8px; }
  }
`

export default function App() {
  const [page, setPage]         = useState('visualizer')
  const [algo, setAlgo]         = useState('bubble')
  const [aiCode, setAiCode]     = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sortHook = useSort()

  const handleAlgoChange = useCallback((a) => {
    setAlgo(a); setPage('visualizer')
  }, [])

  const handleAnalyzeWithAI = useCallback((code) => {
    setAiCode(code); setPage('ai')
  }, [])

  const handleSetPage = useCallback((p) => {
    setPage(p)
    if (p !== 'ai') setAiCode('')
    setSidebarOpen(false)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Game mode — fullscreen portal
  if (page === 'game') {
    return (
      <>
        <style>{LAYOUT_CSS}</style>
        <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
          <button
            onClick={() => handleSetPage('visualizer')}
            style={{
              position: 'fixed', top: 10, right: 10, zIndex: 9999,
              background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(245,158,11,0.6)',
              color: 'rgba(245,158,11,1)', padding: '6px 14px', borderRadius: 6,
              fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono',
              letterSpacing: 1, fontWeight: 700,
            }}
          >✕ EXIT GAME</button>
          <GameModePage />
        </div>
      </>
    )
  }

  return (
    <>
      <style>{LAYOUT_CSS}</style>
      <div className="app-shell">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)',
            }}
          />
        )}

        {/* Sidebar */}
        <div className={`app-sidebar${sidebarOpen ? ' open' : ''}`}>
          <Sidebar
            currentPage={page}
            setPage={handleSetPage}
            currentAlgo={algo}
            setAlgo={handleAlgoChange}
          />
        </div>

        {/* Main */}
        <div className="app-main">
          {/* Topbar */}
          <div style={{
            background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
            padding: '0 12px', height: 52,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, gap: 8, overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
              <button
                className="topbar-mobile-btn"
                onClick={() => setSidebarOpen(o => !o)}
                style={{
                  background: 'none', border: '1px solid var(--border2)',
                  color: 'var(--text2)', borderRadius: 6, padding: '5px 9px',
                  cursor: 'pointer', fontSize: 15, lineHeight: 1, flexShrink: 0,
                }}
              >☰</button>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, fontFamily: "'Syne',sans-serif",
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{TITLES[page]}</div>
                <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>
                  DSA Analyzer · AI Powered · v2.0
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <VoiceToggle />
              {page === 'visualizer' && (
                <span className="algo-badge" style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
                  color: '#a78bfa', fontFamily: 'JetBrains Mono', textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}>{algo} sort</span>
              )}
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4,
                background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.25)',
                color: '#22d3a0', fontFamily: 'JetBrains Mono', whiteSpace: 'nowrap',
              }}>● Live</span>
            </div>
          </div>

          {/* Page content */}
          <div className="app-content" key={page} style={{ animation: 'fadeSlideIn 0.18s ease-out' }}>
            {page === 'visualizer' && <VisualizerPage  algo={algo} sortHook={sortHook} />}
            {page === 'search'     && <SearchPage />}
            {page === 'graph'      && <GraphPage />}
            {page === 'complexity' && <ComplexityPage />}
            {page === 'playground' && <PlaygroundPage onAnalyzeWithAI={handleAnalyzeWithAI} />}
            {page === 'ai'         && <AIPage initialCode={aiCode} />}
            {page === 'history'    && <HistoryPage />}
            {page === 'practice'   && <PracticePage />}
            {page === 'memory'     && <MemoryPage />}
          </div>
        </div>
      </div>
    </>
  )
}
