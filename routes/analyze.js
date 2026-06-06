import express from 'express'
const router = express.Router()

// Legacy static analysis route (kept for backward compatibility)
router.post('/', (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'No code provided' })

  const c = code.toLowerCase()
  let pattern = 'unknown'
  if (/for.*for|while.*while|bubble|selection|insertion|merge|quick|heap/.test(c)) pattern = 'sorting'
  else if (/binary|linear|search|indexof|find/.test(c)) pattern = 'searching'
  else if (/graph|bfs|dfs|adjacen|queue|visited/.test(c)) pattern = 'graph'
  else if (/recur|factorial|fibonacci/.test(c)) pattern = 'recursion'

  const map = {
    sorting:   { time: 'O(n²)', space: 'O(1)' },
    searching: { time: 'O(log n)', space: 'O(1)' },
    graph:     { time: 'O(V+E)', space: 'O(V)' },
    recursion: { time: 'O(2ⁿ)', space: 'O(n)' },
    unknown:   { time: 'O(n)', space: 'O(1)' },
  }

  res.json({
    pattern,
    timeComplexity: map[pattern].time,
    spaceComplexity: map[pattern].space,
  })
})

export default router
