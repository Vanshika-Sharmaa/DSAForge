const STORAGE_KEY = 'dsa_history'
const MAX_ENTRIES = 100

function timestamp() {
  const now = new Date()
  return {
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

export function addHistory({ type, meta = {} }) {
  console.log('[DSA] addHistory called:', type)
  try {
    const existing = getHistory()
    const next = [
      { type, meta, ...timestamp() },
      ...existing,
    ].slice(0, MAX_ENTRIES)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    console.log('[DSA] Saved to localStorage ✅')
    window.dispatchEvent(new CustomEvent('dsa_history_updated'))
  } catch (e) {
    console.warn('[DSA History] Could not save entry:', e.message)
  }
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('dsa_history_updated'))
}