/**
 * memory.js — Spaced Repetition System
 * Intervals: Day 1, Day 3, Day 7
 * Stores solved questions in localStorage and surfaces due revisions.
 */

const KEY = 'dsa_memory'

const INTERVALS_DAYS = [1, 3, 7]   // after solve, re-show at these offsets

function now() { return Date.now() }

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch {}
}

/**
 * Record a solved question.
 * @param {{ id, title, topic, difficulty, code, timeSec, mistakes }} question
 */
export function recordSolved(question) {
  const data = load()
  const existing = data[question.id] || { attempts: 0, mistakes: 0, history: [] }

  const nextRevisions = INTERVALS_DAYS.map(d => now() + d * 86_400_000)

  data[question.id] = {
    ...existing,
    ...question,
    solvedAt     : now(),
    attempts     : existing.attempts + 1,
    mistakes     : existing.mistakes + (question.mistakes || 0),
    nextRevisions,
    lastRevision : null,
    revisionsDone: existing.revisionsDone || 0,
    history      : [...existing.history, { at: now(), timeSec: question.timeSec }],
  }

  save(data)
}

/**
 * Get all questions due for revision today.
 * @returns {Array}
 */
export function getDueRevisions() {
  const data  = load()
  const today = now()

  return Object.values(data).filter(q => {
    if (!q.nextRevisions?.length) return false
    return q.nextRevisions.some(ts => ts <= today)
  })
}

/**
 * Mark a revision as done for question id.
 */
export function markRevisionDone(id) {
  const data = load()
  if (!data[id]) return

  const remaining = (data[id].nextRevisions || []).filter(ts => ts > now())
  data[id].nextRevisions  = remaining
  data[id].lastRevision   = now()
  data[id].revisionsDone  = (data[id].revisionsDone || 0) + 1
  save(data)
}

/**
 * Get weak topics — sorted by mistake count descending.
 */
export function getWeakTopics() {
  const data = load()
  const topicMap = {}

  Object.values(data).forEach(q => {
    const t = q.topic || 'General'
    if (!topicMap[t]) topicMap[t] = { topic: t, mistakes: 0, count: 0 }
    topicMap[t].mistakes += q.mistakes || 0
    topicMap[t].count    += 1
  })

  return Object.values(topicMap)
    .sort((a, b) => b.mistakes - a.mistakes)
}

/**
 * Get all stored questions.
 */
export function getAllSolved() {
  return Object.values(load())
}

export function clearMemory() {
  localStorage.removeItem(KEY)
}