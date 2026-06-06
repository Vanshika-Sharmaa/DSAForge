/**
 * mistakes.js — Mistake Tracker
 * Saves wrong submissions with type, re-queues similar questions.
 */

const KEY = 'dsa_mistakes'

export const MistakeType = {
  WRONG_OUTPUT  : 'Wrong Output',
  TIMEOUT       : 'Time Limit',
  SYNTAX_ERROR  : 'Syntax Error',
  LOGIC_ERROR   : 'Logic Error',
  HINT_OVERUSED : 'Hint Overused',
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data.slice(0, 200))) } catch {}
}

/**
 * Record a mistake.
 * @param {{ questionId, questionTitle, topic, type, code, expected, got }} info
 */
export function recordMistake(info) {
  const mistakes = load()
  mistakes.unshift({
    ...info,
    at      : Date.now(),
    dateStr : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    reviewed: false,
  })
  save(mistakes)
  window.dispatchEvent(new CustomEvent('dsa_mistake_added'))
}

/** Get all mistakes */
export function getMistakes() { return load() }

/** Get unreviewed mistakes count */
export function getUnreviewedCount() { return load().filter(m => !m.reviewed).length }

/** Mark mistake as reviewed */
export function markReviewed(idx) {
  const data = load()
  if (data[idx]) { data[idx].reviewed = true; save(data) }
}

/** Get similar questions to retry (same topic, not yet reviewed) */
export function getSimilarRetries(topic) {
  return load().filter(m => m.topic === topic && !m.reviewed)
}

/** Clear all mistakes */
export function clearMistakes() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent('dsa_mistake_added'))
}