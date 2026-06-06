/**
 * VoiceToggle.jsx
 * Tiny toggle button to enable/disable Voice Coach.
 * Place anywhere in the UI — usually Topbar.
 */
import { useState } from 'react'
import { setVoiceEnabled, isVoiceEnabled, speak } from '../utils/voice'

export default function VoiceToggle() {
  const [enabled, setEnabled] = useState(isVoiceEnabled())

  const toggle = () => {
    const next = !enabled
    setVoiceEnabled(next)
    setEnabled(next)
    if (next) speak('Voice coach enabled. I will guide you during practice.', { priority: true })
  }

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Voice Coach ON — click to mute' : 'Voice Coach OFF — click to enable'}
      style={{
        display    : 'flex',
        alignItems : 'center',
        gap        : 5,
        padding    : '3px 9px',
        borderRadius: 6,
        fontSize   : 10,
        fontFamily : 'JetBrains Mono',
        fontWeight : 700,
        cursor     : 'pointer',
        background : enabled ? 'rgba(167,139,250,0.12)' : 'var(--surface)',
        border     : `1px solid ${enabled ? 'rgba(167,139,250,0.4)' : 'var(--border)'}`,
        color      : enabled ? '#a78bfa' : 'var(--text3)',
        transition : 'all 0.2s',
      }}
    >
      {enabled ? '🔊' : '🔇'} {enabled ? 'Voice ON' : 'Voice OFF'}
    </button>
  )
}