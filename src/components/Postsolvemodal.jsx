/**
 * PostSolveModal.jsx
 * After solving: shows time taken, optimal time, mistakes, improvement tips.
 * Speaks feedback via voice coach.
 */
import { useEffect, useState } from 'react'
import { speak } from '../utils/voice'
import { formatTime } from '../utils/timer'

export default function PostSolveModal({ isOpen, onClose, solveData = {} }) {
  const {
    timeSec      = 0,
    optimalSec   = 60,
    mistakes     = 0,
    hintsUsed    = 0,
    pointsEarned = 100,
    topic        = 'Algorithm',
    tips         = [],
  } = solveData

  const [aiFeedback, setAiFeedback] = useState('')
  const [loading,    setLoading]    = useState(false)

  const efficiency = Math.min(100, Math.round((optimalSec / Math.max(timeSec, 1)) * 100))
  const grade      = efficiency >= 90 ? 'S' : efficiency >= 75 ? 'A' : efficiency >= 55 ? 'B' : 'C'
  const gradeColor = { S: '#22d3a0', A: '#a78bfa', B: '#f59e0b', C: '#f43f5e' }[grade]

  useEffect(() => {
    if (!isOpen) return

    // Voice feedback
    const msg = `You solved the ${topic} problem in ${timeSec} seconds with ${mistakes} mistake${mistakes !== 1 ? 's' : ''}. Grade: ${grade}. ${grade === 'S' ? 'Outstanding performance!' : grade === 'A' ? 'Excellent work!' : 'Good effort, keep practicing!'}`
    speak(msg, { priority: true })

    // AI tips
    fetchAITips()
  }, [isOpen]) // eslint-disable-line

  const fetchAITips = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          question: `The student solved "${topic}" in ${timeSec}s (optimal: ${optimalSec}s) with ${mistakes} mistakes and ${hintsUsed} hints. Give 2-3 concise improvement tips in plain text, no markdown.`,
          code    : '',
          language: 'text',
        }),
      })
      const data = await res.json()
      setAiFeedback(data.analysis || '')
    } catch {
      setAiFeedback(`Practice ${topic} daily. Focus on edge cases. Try to reduce hints.`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position  : 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display   : 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex    : 1000,
    }}>
      <div style={{
        background  : 'var(--bg2)',
        border      : '1px solid var(--border)',
        borderRadius: 16,
        padding     : 28,
        width       : '90vw', maxWidth: 420,
        maxWidth    : '92vw',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>
            {grade === 'S' ? '🏆' : grade === 'A' ? '🌟' : grade === 'B' ? '💪' : '📚'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Problem Solved!</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{topic}</div>
        </div>

        {/* Grade + Points */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 18 }}>
          <StatBox label="Grade" value={grade} color={gradeColor} />
          <StatBox label="Points" value={`+${pointsEarned}`} color="#22d3a0" />
          <StatBox label="Efficiency" value={`${efficiency}%`} color="#a78bfa" />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <InfoRow label="Your Time"     value={formatTime(timeSec)}     />
          <InfoRow label="Optimal Time"  value={formatTime(optimalSec)}  />
          <InfoRow label="Mistakes"      value={mistakes}                 />
          <InfoRow label="Hints Used"    value={hintsUsed}               />
        </div>

        {/* AI Tips */}
        <div style={{
          background  : 'rgba(34,211,160,0.06)',
          border      : '1px solid rgba(34,211,160,0.2)',
          borderRadius: 8,
          padding     : '10px 12px',
          marginBottom: 16,
          fontSize    : 12,
          color       : 'var(--text2)',
          lineHeight  : 1.6,
          minHeight   : 56,
        }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#22d3a0', marginBottom: 4 }}>🤖 AI IMPROVEMENT TIPS</div>
          {loading ? <span style={{ color: 'var(--text3)' }}>Generating tips...</span> : aiFeedback}
        </div>

        {/* User-provided tips */}
        {tips.length > 0 && (
          <ul style={{ paddingLeft: 16, margin: '0 0 16px', fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}

        <button onClick={onClose} style={{
          width       : '100%',
          padding     : '10px',
          background  : '#6c63ff',
          color       : '#fff',
          border      : 'none',
          borderRadius: 8,
          fontSize    : 13,
          fontWeight  : 700,
          cursor      : 'pointer',
        }}>
          Continue Practicing →
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      textAlign   : 'center',
      background  : `${color}10`,
      border      : `1px solid ${color}30`,
      borderRadius: 8,
      padding     : '8px 16px',
      minWidth    : 80,
    }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'JetBrains Mono' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      background  : 'var(--surface)',
      border      : '1px solid var(--border)',
      borderRadius: 6,
      padding     : '6px 10px',
      textAlign   : 'center',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'JetBrains Mono' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{label}</div>
    </div>
  )
}