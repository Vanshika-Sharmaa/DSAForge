/**
 * SmartTimerWidget.jsx
 * Drop-in timer bar with voice warnings.
 * Usage: <SmartTimerWidget totalSec={300} onExpire={() => {}} onWarning50={} onWarning80={} />
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { SmartTimer, formatTime, timerColor } from '../utils/timer'

export default function SmartTimerWidget({
  totalSec   = 300,
  autoStart  = false,
  onExpire,
  onWarning50,
  onWarning80,
  onTick,
  style = {},
}) {
  const [remaining, setRemaining] = useState(totalSec)
  const [running,   setRunning]   = useState(false)
  const [flashing,  setFlashing]  = useState(false)
  const timerRef = useRef(null)

  const color = timerColor(remaining, totalSec)
  const pct   = (remaining / totalSec) * 100

  const handleExpire = useCallback(() => {
    setRunning(false)
    setFlashing(true)
    setTimeout(() => setFlashing(false), 3000)
    onExpire?.()
  }, [onExpire])

  const handleWarning80 = useCallback((rem) => {
    setFlashing(true)
    setTimeout(() => setFlashing(false), 1500)
    onWarning80?.(rem)
  }, [onWarning80])

  useEffect(() => {
    timerRef.current = new SmartTimer(totalSec, {
      onTick      : (rem) => { setRemaining(rem); onTick?.(rem) },
      onWarning50 : onWarning50,
      onWarning80 : handleWarning80,
      onExpire    : handleExpire,
    })
    setRemaining(totalSec)
    if (autoStart) { timerRef.current.start(); setRunning(true) }
    return () => timerRef.current?.stop()
  }, [totalSec]) // eslint-disable-line

  const toggle = () => {
    if (!timerRef.current) return
    if (running) { timerRef.current.pause(); setRunning(false) }
    else         { timerRef.current.start(); setRunning(true)  }
  }

  const reset = () => {
    timerRef.current?.reset()
    setRemaining(totalSec)
    setRunning(false)
    setFlashing(false)
  }

  return (
    <div style={{
      background  : flashing ? 'rgba(244,63,94,0.08)' : 'var(--surface)',
      border      : `1px solid ${flashing ? 'rgba(244,63,94,0.4)' : 'var(--border)'}`,
      borderRadius: 10,
      padding     : '10px 14px',
      display     : 'flex',
      alignItems  : 'center',
      gap         : 12,
      transition  : 'all 0.3s',
      ...style,
    }}>
      {/* Time display */}
      <span style={{
        fontFamily: 'JetBrains Mono',
        fontSize  : 20,
        fontWeight: 700,
        color,
        minWidth  : 56,
        transition: 'color 0.5s',
      }}>
        {formatTime(remaining)}
      </span>

      {/* Progress bar */}
      <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width     : `${pct}%`,
          height    : '100%',
          background: color,
          borderRadius: 4,
          transition: 'width 1s linear, background 0.5s',
        }} />
      </div>

      {/* Controls */}
      <button onClick={toggle} style={btn(running ? '#f59e0b' : '#22d3a0')}>
        {running ? '⏸' : '▶'}
      </button>
      <button onClick={reset} style={btn('var(--text3)')}>↺</button>
    </div>
  )
}

function btn(color) {
  return {
    background: 'transparent',
    border    : `1px solid ${color}40`,
    color,
    borderRadius: 6,
    width     : 28,
    height    : 28,
    cursor    : 'pointer',
    fontSize  : 13,
    display   : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}