/**
 * timer.js — Smart Timer System
 * Tracks time-per-question, fires warnings at 50% and 80%, auto-action on expire.
 */

import { VoiceEvents } from './voice.js'

export class SmartTimer {
  /**
   * @param {number} totalSeconds - Total allowed time
   * @param {object} callbacks
   * @param {{ onWarning50, onWarning80, onExpire, onTick }} callbacks
   */
  constructor(totalSeconds, { onWarning50, onWarning80, onExpire, onTick } = {}) {
    this.total       = totalSeconds
    this.remaining   = totalSeconds
    this.interval    = null
    this.fired50     = false
    this.fired80     = false
    this.expired     = false
    this.startedAt   = null

    this.onWarning50 = onWarning50
    this.onWarning80 = onWarning80
    this.onExpire    = onExpire
    this.onTick      = onTick
  }

  start() {
    this.startedAt = Date.now()
    this.interval  = setInterval(() => this._tick(), 1000)
  }

  pause() { clearInterval(this.interval); this.interval = null }

  resume() { if (!this.interval && !this.expired) this.start() }

  stop() {
    clearInterval(this.interval)
    this.interval = null
  }

  reset(newTotal) {
    this.stop()
    this.total     = newTotal ?? this.total
    this.remaining = this.total
    this.fired50   = false
    this.fired80   = false
    this.expired   = false
  }

  /** Elapsed seconds since start */
  elapsed() {
    return this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0
  }

  _tick() {
    if (this.remaining <= 0) {
      this.expired = true
      this.stop()
      VoiceEvents.timerExpired()
      this.onExpire?.()
      return
    }

    this.remaining -= 1
    this.onTick?.(this.remaining)

    const pct = (this.total - this.remaining) / this.total

    if (!this.fired50 && pct >= 0.5) {
      this.fired50 = true
      VoiceEvents.timerWarning50(this.remaining)
      this.onWarning50?.(this.remaining)
    }

    if (!this.fired80 && pct >= 0.8) {
      this.fired80 = true
      VoiceEvents.timerWarning80(this.remaining)
      this.onWarning80?.(this.remaining)
    }
  }
}

/** Format seconds → "mm:ss" */
export function formatTime(sec) {
  const m = Math.floor(Math.abs(sec) / 60).toString().padStart(2, '0')
  const s = (Math.abs(sec) % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/** Return color based on time remaining ratio */
export function timerColor(remaining, total) {
  const ratio = remaining / total
  if (ratio > 0.5) return '#22d3a0'   // green
  if (ratio > 0.2) return '#f59e0b'   // amber
  return '#f43f5e'                     // red
}