export function detectDNA(code) {
  const c = code.toLowerCase()
  if (/for.*for|while.*while|bubble|selection|insertion|merge|quick|heap/.test(c))
    return { pattern: 'sorting', confidence: 'high', tags: ['loop', 'comparison', 'swap'] }
  if (/binary|linear|search|indexOf|find/.test(c))
    return { pattern: 'searching', confidence: 'high', tags: ['search', 'index'] }
  if (/graph|bfs|dfs|adjacen|queue|visited/.test(c))
    return { pattern: 'graph', confidence: 'high', tags: ['graph', 'traversal'] }
  if (/recur|factorial|fibonacci|function.*\(.*\).*{[\s\S]*\1/.test(c))
    return { pattern: 'recursion', confidence: 'medium', tags: ['recursion', 'stack'] }
  return { pattern: 'unknown', confidence: 'low', tags: [] }
}

export function generateELI5(pattern) {
  const map = {
    sorting:   'Imagine sorting books on a shelf by size. This code does that with numbers — comparing and swapping until everything is in order.',
    searching: 'Like finding a word in a dictionary. This code looks through data to find exactly what you need.',
    graph:     'Think of a map with cities and roads. This code travels between connected points to find a path.',
    recursion: 'Like mirrors facing each other. The function calls itself, each time with a smaller problem, until it hits the simplest case.',
    unknown:   'This code processes data in a structured way. Add more context for a detailed explanation.',
  }
  return map[pattern] || map.unknown
}

export function generateEdgeCases(pattern) {
  const base = [
    'Empty input: [] or ""',
    'Large input: 10,000+ elements',
    'Duplicates: [1,1,1,1]',
    'Invalid input: null, undefined, non-numeric',
  ]
  const extra = {
    sorting:   ['Already sorted: [1,2,3,4,5]', 'Reverse sorted: [5,4,3,2,1]'],
    searching: ['Target not in array', 'Target at first/last index'],
    graph:     ['Disconnected graph', 'Graph with cycles'],
    recursion: ['Base case missing', 'Stack overflow on deep recursion'],
  }
  return [...base, ...(extra[pattern] || [])]
}

export function generateDryRun(pattern) {
  const map = {
    sorting: [
      'Step 1: Start with unsorted array [5, 3, 1, 4, 2]',
      'Step 2: Compare adjacent elements, swap if out of order',
      'Step 3: After pass 1 → [3, 1, 4, 2, 5] (5 bubbled up)',
      'Step 4: Repeat for remaining unsorted portion',
      'Step 5: Final sorted array → [1, 2, 3, 4, 5]',
    ],
    searching: [
      'Step 1: Target = 7, Array = [1, 3, 5, 7, 9]',
      'Step 2: Check mid = index 2 → value 5 < 7, go right',
      'Step 3: New mid = index 3 → value 7 === target',
      'Step 4: Found at index 3',
      'Step 5: Return index 3',
    ],
    graph: [
      'Step 1: Start at node A, mark visited',
      'Step 2: Add neighbors B, C to queue',
      'Step 3: Visit B, add its unvisited neighbors',
      'Step 4: Visit C, add its unvisited neighbors',
      'Step 5: Continue until queue empty',
    ],
    recursion: [
      'Step 1: Call f(5)',
      'Step 2: f(5) calls f(4), f(4) calls f(3)...',
      'Step 3: f(1) hits base case, returns 1',
      'Step 4: Results bubble back up the call stack',
      'Step 5: f(5) returns final result',
    ],
  }
  return map[pattern] || ['Step 1: Parse input', 'Step 2: Process data', 'Step 3: Return result']
}

export function analyzeCode(code) {
  if (!code.trim()) return null
  const { pattern, confidence, tags } = detectDNA(code)
  const complexityMap = {
    sorting:   { time: 'O(n²) average, O(n log n) best case', space: 'O(1) to O(n)' },
    searching: { time: 'O(log n) binary, O(n) linear',        space: 'O(1)'          },
    graph:     { time: 'O(V + E)',                             space: 'O(V)'          },
    recursion: { time: 'O(2ⁿ) worst case',                    space: 'O(n) stack'    },
    unknown:   { time: 'Unable to determine',                  space: 'Unable to determine' },
  }
  return {
    pattern,
    confidence,
    tags,
    timeComplexity:  complexityMap[pattern].time,
    spaceComplexity: complexityMap[pattern].space,
    eli5:            generateELI5(pattern),
    edgeCases:       generateEdgeCases(pattern),
    steps:           generateDryRun(pattern),
  }
}