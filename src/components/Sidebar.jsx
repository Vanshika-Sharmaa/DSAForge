import { useState } from 'react'

const algos = ['bubble','selection','insertion','merge','quick']

const pages = [
  { id: 'visualizer', icon: '📊', label: 'Visualizer' },
  { id: 'search',     icon: '🔍', label: 'Search' },
  { id: 'graph',      icon: '🕸️', label: 'Graph BFS/DFS' },
  { id: 'complexity', icon: '📈', label: 'Complexity' },
  { id: 'playground', icon: '⚡', label: 'Playground' },
  { id: 'ai',         icon: '🤖', label: 'AI Analyzer' },
  { id: 'history',    icon: '📋', label: 'History' },
]

const gamingPages = [
  { id: 'practice', icon: '🎯', label: 'Practice Mode'},
  { id: 'game',     icon: '🎮', label: 'Vice City' },
  { id: 'memory',   icon: '🧠', label: 'Memory Arcade'},
]

export default function Sidebar({ currentPage, setPage, currentAlgo, setAlgo }) {
  return (
    <div style={{
      width: 220, background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'auto', overflowX: 'hidden',
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 15, fontWeight: 800,
          fontFamily: "'Syne', sans-serif",
          background: 'linear-gradient(135deg,#a78bfa,#38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '0.02em',
        }}>DSA Analyzer</div>
        <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 3, letterSpacing: '0.12em' }}>
          AI POWERED · v2.0
        </div>
      </div>

      {/* Tools nav */}
      <nav style={{ padding: '10px 8px' }}>
        <SectionLabel>TOOLS</SectionLabel>
        {pages.map(p => (
          <NavItem key={p.id} p={p} currentPage={currentPage} setPage={setPage} />
        ))}
      </nav>

      {/* Gaming section */}
      <nav style={{ padding: '0 8px 10px', borderTop: '1px solid var(--border)' }}>
        <SectionLabel color="#a78bfa">✨ ENHANCED</SectionLabel>
        {gamingPages.map(p => (
          <NavItem key={p.id} p={p} currentPage={currentPage} setPage={setPage} />
        ))}
      </nav>

      {/* Algorithm chips */}
      <div style={{ padding: '10px 10px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <SectionLabel>ALGORITHMS</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {algos.map(a => (
            <AlgoChip key={a} a={a} active={currentAlgo === a} onClick={() => setAlgo(a)} />
          ))}
        </div>
      </div>

    </div>
  )
}

function SectionLabel({ children, color }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: '0.12em',
      color: color || 'var(--text3)',
      padding: '8px 10px 6px',
      fontWeight: 700, textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function NavItem({ p, currentPage, setPage }) {
  const active = currentPage === p.id
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={() => setPage(p.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setPage(p.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
        borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
        color: active ? '#a78bfa' : hov ? 'var(--text)' : 'var(--text2)',
        background: active ? 'rgba(108,99,255,0.1)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: active ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
        marginBottom: 2, transition: 'all 0.14s',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{p.icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
      </div>
      {p.badge && (
        <span style={{
          fontSize: 7, padding: '2px 5px', borderRadius: 3,
          background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.35)',
          color: '#a78bfa', fontWeight: 700, letterSpacing: '0.05em',
          flexShrink: 0,
        }}>{p.badge}</span>
      )}
    </div>
  )
}

function AlgoChip({ a, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', padding: '4px 8px',
        background: active ? 'var(--surface)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent)' : hov ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 5, fontSize: 10,
        color: active ? '#a78bfa' : 'var(--text2)',
        cursor: 'pointer', transition: 'all 0.14s',
        textTransform: 'capitalize', userSelect: 'none',
      }}
    >{a}</span>
  )
}