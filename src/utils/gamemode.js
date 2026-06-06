/**
 * gameMode.js — Game Mode definitions and state
 * Missions, Speed Challenge, Boss Mode — all lightweight, no heavy graphics.
 */

export const MISSIONS = [
  {
    id      : 'sort_basics',
    title   : 'Sorting Fundamentals',
    icon    : '🎯',
    desc    : 'Master the basics of sorting algorithms',
    timeSec : 300,
    topic   : 'Sorting',
    tasks   : [
      { id: 't1', label: 'Implement Bubble Sort',    difficulty: 'Easy',   points: 100 },
      { id: 't2', label: 'Implement Selection Sort', difficulty: 'Easy',   points: 100 },
      { id: 't3', label: 'Implement Merge Sort',     difficulty: 'Medium', points: 200 },
    ]
  },
  {
    id      : 'search_master',
    title   : 'Search Algorithms',
    icon    : '🔍',
    desc    : 'Binary search and beyond',
    timeSec : 240,
    topic   : 'Search',
    tasks   : [
      { id: 't1', label: 'Linear Search in O(n)',   difficulty: 'Easy',   points: 80  },
      { id: 't2', label: 'Binary Search in O(log n)', difficulty: 'Easy', points: 120 },
      { id: 't3', label: 'Search in rotated array', difficulty: 'Hard',   points: 300 },
    ]
  },
  {
    id      : 'graph_explorer',
    title   : 'Graph Explorer',
    icon    : '🕸️',
    desc    : 'Navigate BFS, DFS, and shortest paths',
    timeSec : 360,
    topic   : 'Graph',
    tasks   : [
      { id: 't1', label: 'BFS traversal',         difficulty: 'Easy',   points: 100 },
      { id: 't2', label: 'DFS traversal',         difficulty: 'Easy',   points: 100 },
      { id: 't3', label: 'Detect cycle in graph', difficulty: 'Medium', points: 200 },
    ]
  },
]

export const BOSS_CHALLENGES = [
  {
    id      : 'boss_sort',
    title   : 'Sort Boss',
    icon    : '👹',
    questions: ['Bubble Sort', 'Merge Sort', 'Quick Sort worst case'],
    timeSec : 600,
    reward  : 1000,
  },
  {
    id      : 'boss_dp',
    title   : 'DP Destroyer',
    icon    : '🔥',
    questions: ['Fibonacci DP', 'Longest Common Subsequence', 'Knapsack Problem'],
    timeSec : 900,
    reward  : 1500,
  },
]

const GAME_KEY = 'dsa_game_state'

function loadGame() {
  try { return JSON.parse(localStorage.getItem(GAME_KEY) || '{}') } catch { return {} }
}

function saveGame(s) {
  try { localStorage.setItem(GAME_KEY, JSON.stringify(s)) } catch {}
}

export function getGameState() {
  return {
    points        : 0,
    completedTasks: [],
    completedBoss : [],
    speedRecords  : {},
    ...loadGame(),
  }
}

export function addPoints(n) {
  const s = getGameState()
  s.points += n
  saveGame(s)
  return s.points
}

export function completeTask(missionId, taskId, points) {
  const s = getGameState()
  const key = `${missionId}:${taskId}`
  if (!s.completedTasks.includes(key)) {
    s.completedTasks.push(key)
    s.points += points
  }
  saveGame(s)
}

export function recordSpeedRun(missionId, timeSec) {
  const s = getGameState()
  if (!s.speedRecords[missionId] || timeSec < s.speedRecords[missionId]) {
    s.speedRecords[missionId] = timeSec
  }
  saveGame(s)
}

export function isTaskDone(missionId, taskId) {
  const s = getGameState()
  return s.completedTasks.includes(`${missionId}:${taskId}`)
}