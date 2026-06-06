/**
 * SmartHintSystem.jsx
 * Multi-level hints. Each level deducts points, triggers voice.
 * Optionally calls AI for a generated hint.
 */
import { useState } from 'react'
import { speak } from '../utils/voice'

const DEDUCTIONS = [0, 10, 25, 50]   // per level (level 0 = no hint yet)

const BASE_HINTS = {
  'Bubble Sort'     : [
    'Think about comparing adjacent elements.',
    'Use two nested loops. Outer loop controls passes.',
    'If arr[j] > arr[j+1], swap them. Track if any swap happened.',
  ],
  'Binary Search'   : [
    'The array must be sorted. Think about the midpoint.',
    'Compare the target with arr[mid]. Narrow the search range.',
    'lo=0, hi=n-1. mid=(lo+hi)//2. Move lo or hi based on comparison.',
  ],
  'Merge Sort'      : [
    'Divide and conquer: split the array in half.',
    'Recursively sort each half, then merge.',
    'Merge by comparing smallest elements from each half into a result array.',
  ],
  'default'         : [
    'Break the problem into smaller subproblems.',
    'Think about the base case first, then the recursive/iterative case.',
    'Draw a small example on paper and trace through it step by step.',
  ],
}

export default function SmartHintSystem({ topic = 'default', onDeduct, totalPoints = 100 }) {
  const [level,      setLevel]     = useState(0)
  const [totalDeducted, setTotalDeducted] = useState(0)
  const [aiHint,     setAiHint]    = useState('')
  const [loading,    setLoading]   = useState(false)

  const hints = BASE_HINTS[topic] || BASE_HINTS['default']
  const maxLevel = hints.length

  const requestHint = () => {
    if (level >= maxLevel) return
    const next = level + 1
    const deduction = DEDUCTIONS[next] || 50
    setLevel(next)
    setTotalDeducted(prev => prev + deduction)
    onDeduct?.(deduction)
    speak(`Hint level ${next}: ${hints[next - 1]}`, { rate: 0.9, pitch: 1.05 })
  }

  const requestAiHint = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          question: `Give a concise single-sentence hint (no solution) for: ${topic}`,
          code    : '',
          language: 'javascript',
        }),
      })
      const data = await res.json()
      const hint = data.analysis?.slice(0, 200) || 'Think about the algorithm pattern for this problem type.'
      setAiHint(hint)
      speak(`AI Hint: ${hint}`, { rate: 0.9 })
    } catch {
      setAiHint('Consider the time complexity requirement and choose an algorithm accordingly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background  : 'var(--surface)',
      border      : '1px solid var(--border)',
      borderRadius: 10,
      padding     : 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>💡 HINT SYSTEM</span>
        <span style={{
          fontSize: 10, fontFamily: 'JetBrains Mono',
          color: totalDeducted > 0 ? '#f59e0b' : 'var(--text3)',
        }}>
          -{totalDeducted} pts deducted
        </span>
      </div>

      {/* Revealed hints */}
      {level > 0 && (
        <div style={{ marginBottom: 10 }}>
          {hints.slice(0, level).map((h, i) => (
            <div key={i} style={{
              padding     : '8px 10px',
              background  : 'rgba(167,139,250,0.08)',
              border      : '1px solid rgba(167,139,250,0.2)',
              borderRadius: 6,
              marginBottom: 6,
              fontSize    : 12,
              color       : '#c4b5fd',
            }}>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', opacity: 0.7 }}>
                HINT {i + 1} (-{DEDUCTIONS[i + 1]}pts)
              </span>
              <div style={{ marginTop: 3 }}>{h}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI hint */}
      {aiHint && (
        <div style={{
          padding: '8px 10px', background: 'rgba(34,211,160,0.08)',
          border: '1px solid rgba(34,211,160,0.25)', borderRadius: 6,
          fontSize: 12, color: '#22d3a0', marginBottom: 10,
        }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', opacity: 0.7 }}>🤖 AI HINT</span>
          <div style={{ marginTop: 3 }}>{aiHint}</div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {level < maxLevel && (
          <button onClick={requestHint} style={hintBtn('#a78bfa')}>
            Hint {level + 1} (-{DEDUCTIONS[level + 1] || 50}pts)
          </button>
        )}
        <button onClick={requestAiHint} disabled={loading} style={hintBtn('#22d3a0', loading)}>
          {loading ? '...' : '🤖 AI Hint (-30pts)'}
        </button>
        {level >= maxLevel && (
          <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center' }}>
            All hints used
          </span>
        )}
      </div>
    </div>
  )
}

function hintBtn(color, disabled = false) {
  return {
    background  : `${color}15`,
    border      : `1px solid ${color}40`,
    color       : disabled ? 'var(--text3)' : color,
    borderRadius: 6,
    padding     : '5px 10px',
    fontSize    : 11,
    fontFamily  : 'JetBrains Mono',
    cursor      : disabled ? 'not-allowed' : 'pointer',
    fontWeight  : 600,
  }
}