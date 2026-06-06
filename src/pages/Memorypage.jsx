/**
 * MemoryTrainer.jsx — DSA MEMORY ARCADE v3.3
 * CHANGES from v3.2:
 *  1. New Game now shows a dedicated animated "NewGameScreen" instead of inline confirm
 *  2. All topics shown locked with staggered drop animation
 *  3. Arrays tile glows unlocked from the start
 *  4. Single-click START FROM ARRAYS launches the game
 *  5. All other v3.2 features preserved (auto-unlock, warning, no repeats, combo)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

const TOPICS = [
  { id: 'arrays',        name: 'Arrays',          icon: '▦',  color: '#22d3ee' },
  { id: 'strings',       name: 'Strings',         icon: '≈≈', color: '#a78bfa' },
  { id: 'stack',         name: 'Stack',           icon: '⊟',  color: '#34d399' },
  { id: 'queue',         name: 'Queue',           icon: '⊞',  color: '#fbbf24' },
  { id: 'linkedlist',    name: 'Linked List',     icon: '⊸',  color: '#f472b6' },
  { id: 'recursion',     name: 'Recursion',       icon: '↺',  color: '#fb923c' },
  { id: 'binsearch',     name: 'Binary Search',   icon: '⌖',  color: '#38bdf8' },
  { id: 'trees',         name: 'Trees',           icon: '⌥',  color: '#4ade80' },
  { id: 'graphs',        name: 'Graphs',          icon: '⊛',  color: '#e879f9' },
  { id: 'heap',          name: 'Heap',            icon: '△',  color: '#facc15' },
  { id: 'greedy',        name: 'Greedy',          icon: '⚡',  color: '#f87171' },
  { id: 'slidingwindow', name: 'Sliding Window',  icon: '⊡',  color: '#2dd4bf' },
  { id: 'twopointer',    name: 'Two Pointer',     icon: '⇌',  color: '#818cf8' },
  { id: 'backtracking',  name: 'Backtracking',    icon: '⤾',  color: '#fb7185' },
  { id: 'dp',            name: 'Dynamic Prog.',   icon: '⊕',  color: '#a3e635' },
]

const CHALLENGES = {
  arrays: [
    { type: 'sequence', label: 'Insertion Sort Steps', nodes: ['5','3','8','1','4'], order: [1,0,2,3,4], hint: 'Compare & shift left each pass' },
    { type: 'code', label: 'Two Sum Core', lines: ['function twoSum(nums, target) {', '  const map = {}', '  for (let i = 0; i < nums.length; i++) {', '    const comp = target - nums[i]', '    if (map[comp] !== undefined) return [map[comp], i]', '    map[nums[i]] = i', '  }', '}'], blankLine: 4, options: ['if (map[comp] === undefined)', 'if (map[comp] !== undefined) return [map[comp], i]', 'if (comp in nums)', 'if (nums[comp])'], correct: 1, hint: 'O(n): store index, check complement' },
    { type: 'grid', label: 'Prefix Sum Table', size: 4, pattern: [0,1,2,3,4,5,6,7], hint: 'Prefix fills row-by-row left to right' },
    { type: 'sequence', label: 'Merge Sort Split', nodes: ['[8,4,2,6]','[8,4]','[2,6]','[8]','[4]'], order: [0,1,2,3,4], hint: 'Split in halves recursively, left first' },
    { type: 'code', label: 'Binary Search Array', lines: ['function bs(arr, t) {', '  let lo = 0, hi = arr.length - 1', '  while (lo <= hi) {', '    const mid = (lo + hi) >> 1', '    if (arr[mid] === t) return mid', '    else if (arr[mid] < t) lo = mid + 1', '    else hi = mid - 1', '  }', '  return -1', '}'], blankLine: 3, options: ['const mid = lo + hi', 'const mid = (lo + hi) >> 1', 'const mid = lo / hi', 'const mid = hi - lo'], correct: 1, hint: 'Bitshift >> 1 = safe divide by 2' },
    { type: 'grid', label: 'Sliding Window k=3', size: 5, pattern: [0,1,2,5,6,7,10,11,12], hint: 'Fixed window slides one step right' },
    { type: 'sequence', label: 'Kadane Algorithm', nodes: ['currMax=nums[0]','globalMax=nums[0]','loop i=1','currMax=max(n[i],curr+n[i])','update globalMax'], order: [0,1,2,3,4], hint: 'Track local and global max subarray' },
    { type: 'code', label: 'Remove Duplicates', lines: ['function removeDups(nums) {', '  let k = 1', '  for (let i = 1; i < nums.length; i++) {', '    if (nums[i] !== nums[i-1]) {', '      nums[k] = nums[i]', '      k++', '    }', '  }', '  return k', '}'], blankLine: 3, options: ['if (nums[i] === nums[i-1])', 'if (nums[i] !== nums[i-1])', 'if (k !== i)', 'if (nums[i] > 0)'], correct: 1, hint: 'Write pointer k advances only on new unique value' },
  ],
  strings: [
    { type: 'sequence', label: 'KMP Failure Array', nodes: ['A','B','A','B','C'], order: [0,1,2,3,4], hint: 'Track longest proper prefix-suffix' },
    { type: 'code', label: 'Palindrome Check', lines: ['function isPalin(s) {', '  let l = 0, r = s.length - 1', '  while (l < r) {', '    if (s[l] !== s[r]) return false', '    l++; r--', '  }', '  return true', '}'], blankLine: 3, options: ['if (s[l] === s[r]) return false', 'if (s[l] !== s[r]) return false', 'if (l !== r) return false', 'if (s[l] > s[r]) return false'], correct: 1, hint: 'Compare chars converging inward' },
    { type: 'grid', label: 'Anagram Freq Map', size: 4, pattern: [0,5,10,15,1,6], hint: 'Character frequency diagonal pattern' },
    { type: 'sequence', label: 'Reverse Words', nodes: ['split spaces','reverse array','join spaces'], order: [0,1,2], hint: 'Split → reverse → join' },
    { type: 'code', label: 'Longest No-Repeat', lines: ['function maxLen(s) {', '  let map = {}, l = 0, max = 0', '  for (let r = 0; r < s.length; r++) {', '    if (map[s[r]] >= l) l = map[s[r]] + 1', '    map[s[r]] = r', '    max = Math.max(max, r - l + 1)', '  }', '  return max', '}'], blankLine: 3, options: ['if (map[s[r]] > l)', 'if (map[s[r]] >= l) l = map[s[r]] + 1', 'if (s[r] in map)', 'if (map[s[r]] < l)'], correct: 1, hint: 'Move left pointer past last duplicate' },
    { type: 'sequence', label: 'Rabin-Karp Steps', nodes: ['hash(pattern)','hash(window)','match? check chars','slide window','update rolling hash'], order: [0,1,2,3,4], hint: 'Rolling hash avoids full recomputation' },
    { type: 'grid', label: 'Z-Algorithm Match', size: 4, pattern: [0,2,3,5,6,8,9,11], hint: 'Z-value offsets for string matching' },
    { type: 'code', label: 'Count Vowels', lines: ['function countV(s) {', "  const v = new Set('aeiouAEIOU')", '  let c = 0', '  for (const ch of s)', '    if (v.has(ch)) c++', '  return c', '}'], blankLine: 4, options: ['if (v.has(ch)) c++', 'if (v.includes(ch)) c++', 'if (ch in v) c++', 'if (v[ch]) c++'], correct: 0, hint: 'Set.has() is O(1) vs array includes O(n)' },
  ],
  stack: [
    { type: 'sequence', label: 'Stack Operations', nodes: ['PUSH 3','PUSH 7','PEEK','POP','PUSH 1','POP'], order: [0,1,2,3,4,5], hint: 'LIFO — last in, first out' },
    { type: 'code', label: 'Valid Parentheses', lines: ['function isValid(s) {', '  const st = []', '  for (const c of s) {', '    if ("([{".includes(c)) st.push(c)', '    else {', '      if (!st.length) return false', '      const top = st.pop()', '      if (!matches(top, c)) return false', '    }', '  }', '  return st.length === 0', '}'], blankLine: 3, options: ['"([{".includes(c) && st.push(c)', 'if ("([{".includes(c)) st.push(c)', '")}]".includes(c) && st.pop()', 'if (c === "(") st.push(c)'], correct: 1, hint: 'Push openers, pop & match closers' },
    { type: 'grid', label: 'Monotonic Stack', size: 4, pattern: [3,7,11,12,13,14,15], hint: 'Decreasing elements highlight diagonal' },
    { type: 'sequence', label: 'Infix to Postfix', nodes: ['A','+','B','*','C'], order: [0,2,4,1,3], hint: 'Operators stack; operands output directly' },
    { type: 'code', label: 'Min Stack O(1)', lines: ['push(val) {', '  this.stack.push(val)', '  const m = this.minStack.at(-1)', '  this.minStack.push(m === undefined ? val : Math.min(m, val))', '}'], blankLine: 3, options: ['Math.max(m, val)', 'Math.min(m, val)', 'val - m', 'm + val'], correct: 1, hint: 'Shadow stack tracks running minimum' },
    { type: 'sequence', label: 'Evaluate Postfix', nodes: ['read 3','push 3','read 4','push 4','read + → pop 4,3','push 7'], order: [0,1,2,3,4,5], hint: 'Operands push; operators pop two, push result' },
    { type: 'grid', label: 'Call Stack Frames', size: 3, pattern: [0,1,2,3,4,5], hint: 'Frame added on call, removed on return' },
    { type: 'code', label: 'Next Greater Element', lines: ['for (let i = n-1; i >= 0; i--) {', '  while (st.length && st.at(-1) <= nums[i])', '    st.pop()', '  res[i] = st.length ? st.at(-1) : -1', '  st.push(nums[i])', '}'], blankLine: 1, options: ['while (st.length && st.at(-1) >= nums[i])', 'while (st.length && st.at(-1) <= nums[i])', 'while (st.length && st[0] <= nums[i])', 'while (!st.length)'], correct: 1, hint: 'Pop smaller elements — monotonic decreasing stack' },
  ],
  queue: [
    { type: 'sequence', label: 'Queue Operations', nodes: ['ENQUEUE 1','ENQUEUE 2','DEQUEUE','ENQUEUE 3','PEEK','DEQUEUE'], order: [0,1,2,3,4,5], hint: 'FIFO — first in, first out' },
    { type: 'code', label: 'BFS Level Order', lines: ['function bfs(root) {', '  const q = [root], res = []', '  while (q.length) {', '    const node = q.shift()', '    res.push(node.val)', '    if (node.left) q.push(node.left)', '    if (node.right) q.push(node.right)', '  }', '  return res', '}'], blankLine: 3, options: ['const node = q.pop()', 'const node = q[0]', 'const node = q.shift()', 'const node = q.unshift()'], correct: 2, hint: 'shift() dequeues from front' },
    { type: 'grid', label: 'Circular Queue', size: 4, pattern: [0,1,2,3,7,11,15,14,13,12], hint: 'Circular buffer wraps: rear mod capacity' },
    { type: 'sequence', label: 'Priority Queue Pop', nodes: ['insert 5','insert 2','insert 8','poll → 2','poll → 5'], order: [0,1,2,3,4], hint: 'Min-heap pops smallest regardless of order' },
    { type: 'code', label: 'Sliding Window Max', lines: ['for (let i = 0; i < nums.length; i++) {', '  while (dq.length && dq[0] < i - k + 1) dq.shift()', '  while (dq.length && nums[dq.at(-1)] <= nums[i]) dq.pop()', '  dq.push(i)', '  if (i >= k-1) res.push(nums[dq[0]])', '}'], blankLine: 2, options: ['nums[dq[0]] <= nums[i]', 'nums[dq.at(-1)] <= nums[i]', 'dq.at(-1) <= i', 'nums[i] >= nums[dq[0]]'], correct: 1, hint: 'Remove from back while smaller — monotonic deque' },
    { type: 'sequence', label: 'BFS Frontier Spread', nodes: ['level 0: root','level 1: children','level 2: grandchildren','enqueue next level','dequeue current level'], order: [0,1,2,4,3], hint: 'BFS expands like a ripple level by level' },
    { type: 'grid', label: 'BFS Ripple Pattern', size: 4, pattern: [5,6,9,10,1,4,11,14,0,3,12,15], hint: 'Concentric squares = BFS distance layers' },
    { type: 'code', label: 'Deque Both Ends', lines: ['const dq = []', 'dq.push(1)      // add rear', 'dq.unshift(0)   // add front', 'dq.pop()        // remove rear', 'dq.shift()      // remove front'], blankLine: 2, options: ['dq.push(0)', 'dq.unshift(0)', 'dq.splice(0,0,0)', 'dq[0] = 0'], correct: 1, hint: 'unshift() inserts at index 0 — front of array' },
  ],
  linkedlist: [
    { type: 'sequence', label: 'LL Reversal Steps', nodes: ['prev=null','curr=head','next=curr.next','curr.next=prev','prev=curr','curr=next'], order: [0,1,2,3,4,5], hint: 'Three-pointer: save next before unlinking' },
    { type: 'code', label: 'Reverse Linked List', lines: ['function reverse(head) {', '  let prev = null, curr = head', '  while (curr) {', '    const next = curr.next', '    curr.next = prev', '    prev = curr', '    curr = next', '  }', '  return prev', '}'], blankLine: 4, options: ['curr.next = next', 'curr.next = prev', 'curr.next = curr', 'prev.next = curr'], correct: 1, hint: 'Point curr.next backward to prev each step' },
    { type: 'grid', label: 'Floyd Cycle Detection', size: 4, pattern: [0,1,2,3,7,6,5,4,8,9,10], hint: 'Slow+fast pointers; fast moves 2x speed' },
    { type: 'sequence', label: 'Find Middle of LL', nodes: ['slow=head','fast=head','slow=slow.next','fast=fast.next.next','slow is middle'], order: [0,1,2,3,4], hint: 'Fast 2x speed: when fast ends, slow=mid' },
    { type: 'code', label: 'Detect Cycle', lines: ['function hasCycle(head) {', '  let s = head, f = head', '  while (f && f.next) {', '    s = s.next', '    f = f.next.next', '    if (s === f) return true', '  }', '  return false', '}'], blankLine: 5, options: ['if (s === null)', 'if (s === f) return true', 'if (f === null)', 'if (s !== f) return false'], correct: 1, hint: 'Pointers meet only if cycle exists' },
    { type: 'sequence', label: 'Merge Two Sorted LL', nodes: ['compare heads','pick smaller','advance pointer','attach rest','return dummy.next'], order: [0,1,2,3,4], hint: 'Dummy head simplifies edge cases' },
    { type: 'grid', label: 'Doubly Linked List', size: 4, pattern: [0,1,2,3,4,7,8,11,12,13,14,15], hint: 'Doubly linked: arrows go both directions' },
    { type: 'code', label: 'Delete Nth From End', lines: ['function removeNth(head, n) {', '  const dummy = new Node(0, head)', '  let fast = dummy, slow = dummy', '  for (let i = 0; i <= n; i++) fast = fast.next', '  while (fast) { fast = fast.next; slow = slow.next }', '  slow.next = slow.next.next', '  return dummy.next', '}'], blankLine: 3, options: ['for (let i = 0; i < n; i++)', 'for (let i = 0; i <= n; i++) fast = fast.next', 'while (n--) fast = fast.next', 'fast = fast.next.next'], correct: 1, hint: 'Gap of n between fast and slow; when fast=null, slow is before target' },
  ],
  recursion: [
    { type: 'sequence', label: 'Fibonacci Call Stack', nodes: ['fib(4)','fib(3)','fib(2)','fib(1)','fib(0)'], order: [0,1,2,3,4], hint: 'Call stack unwinds DFS style' },
    { type: 'code', label: 'Factorial Recursive', lines: ['function fact(n) {', '  if (n <= 1) return 1', '  return n * fact(n - 1)', '}'], blankLine: 2, options: ['return n + fact(n - 1)', 'return n * fact(n - 1)', 'return fact(n) * fact(n-1)', 'return (n-1) * fact(n)'], correct: 1, hint: 'Base case + n × recurse(n-1)' },
    { type: 'grid', label: 'Recursion Tree', size: 4, pattern: [1,4,5,8,9,10,12,13,14,15], hint: 'Each node spawns two children below' },
    { type: 'sequence', label: 'Tower of Hanoi n=3', nodes: ['A→C','A→B','C→B','A→C','B→A','B→C','A→C'], order: [0,1,2,3,4,5,6], hint: '2^n - 1 moves; move n-1 to spare peg' },
    { type: 'code', label: 'Power Function', lines: ['function pow(x, n) {', '  if (n === 0) return 1', '  if (n % 2 === 0) {', '    const half = pow(x, n / 2)', '    return half * half', '  }', '  return x * pow(x, n - 1)', '}'], blankLine: 3, options: ['const half = pow(x, n)', 'const half = pow(x, n / 2)', 'const half = pow(x, n - 1)', 'const half = x * n'], correct: 1, hint: 'Even exponent: halve problem, square result' },
    { type: 'sequence', label: 'Merge Sort Full', nodes: ['split left','split right','recurse left','recurse right','merge sorted halves'], order: [0,1,2,3,4], hint: 'Divide then conquer: recurse both sides before merging' },
    { type: 'grid', label: 'Memoisation Table', size: 4, pattern: [0,1,2,3,4,5,6,7,8,9,10], hint: 'Each cell computed once; rest cached' },
    { type: 'code', label: 'Flatten Nested Array', lines: ['function flat(arr) {', '  const res = []', '  for (const x of arr) {', '    if (Array.isArray(x)) res.push(...flat(x))', '    else res.push(x)', '  }', '  return res', '}'], blankLine: 3, options: ['res.push(flat(x))', 'res.push(...flat(x))', 'res.concat(flat(x))', 'flat(x).forEach(v=>res.push(v))'], correct: 1, hint: 'Spread flattened sub-array into result' },
  ],
  binsearch: [
    { type: 'sequence', label: 'Binary Search Steps', nodes: ['lo=0, hi=7','mid=3 too small','lo=4, mid=5 too big','hi=4, mid=4 FOUND'], order: [0,1,2,3], hint: 'Halve search space each step' },
    { type: 'code', label: 'Classic Binary Search', lines: ['function bs(arr, t) {', '  let lo = 0, hi = arr.length - 1', '  while (lo <= hi) {', '    const mid = (lo + hi) >> 1', '    if (arr[mid] === t) return mid', '    else if (arr[mid] < t) lo = mid + 1', '    else hi = mid - 1', '  }', '  return -1', '}'], blankLine: 3, options: ['const mid = lo + hi', 'const mid = (lo + hi) >> 1', 'const mid = lo / hi', 'const mid = hi - lo >> 1'], correct: 1, hint: 'Bitshift >> 1 avoids overflow vs division' },
    { type: 'grid', label: 'Search Space Halving', size: 4, pattern: [0,1,2,3,4,5,6,7,8], hint: 'Each step eliminates exactly half' },
    { type: 'sequence', label: 'Left Boundary Search', nodes: ['lo=0, hi=n-1','mid=(lo+hi)>>1','arr[mid]<target? lo=mid+1','else hi=mid-1','return lo'], order: [0,1,2,3,4], hint: 'No early return; always narrow to left boundary' },
    { type: 'code', label: 'Integer Square Root', lines: ['function sqrt(x) {', '  let lo = 0, hi = x', '  while (lo <= hi) {', '    const mid = (lo + hi) >> 1', '    if (mid * mid === x) return mid', '    else if (mid * mid < x) lo = mid + 1', '    else hi = mid - 1', '  }', '  return hi', '}'], blankLine: 5, options: ['else if (mid * mid > x) lo = mid + 1', 'else if (mid * mid < x) lo = mid + 1', 'else if (mid < x) lo = mid + 1', 'else if (mid * mid < x) hi = mid - 1'], correct: 1, hint: 'midSquare < x means answer is in right half' },
    { type: 'sequence', label: 'Rotated Array Search', nodes: ['find pivot','determine sorted half','is target in sorted half?','search that half','else search other half'], order: [0,1,2,3,4], hint: 'One half is always sorted — use that to decide' },
    { type: 'grid', label: 'BS on Answer Space', size: 4, pattern: [0,4,8,12,13,14,15,11,7,3], hint: 'Binary search on value range, not array index' },
    { type: 'code', label: 'First Bad Version', lines: ['function firstBad(n) {', '  let lo = 1, hi = n', '  while (lo < hi) {', '    const mid = (lo + hi) >> 1', '    if (isBad(mid)) hi = mid', '    else lo = mid + 1', '  }', '  return lo', '}'], blankLine: 4, options: ['if (isBad(mid)) lo = mid', 'if (isBad(mid)) hi = mid', 'if (!isBad(mid)) hi = mid', 'if (isBad(mid)) hi = mid - 1'], correct: 1, hint: 'First bad: hi=mid keeps it in range; lo converges to answer' },
  ],
  trees: [
    { type: 'sequence', label: 'Inorder Traversal', nodes: ['go left','visit root','go right'], order: [0,1,2], hint: 'Left → Root → Right gives sorted BST output' },
    { type: 'code', label: 'BST Insert', lines: ['function insert(node, val) {', '  if (!node) return new Node(val)', '  if (val < node.val)', '    node.left = insert(node.left, val)', '  else', '    node.right = insert(node.right, val)', '  return node', '}'], blankLine: 2, options: ['if (val === node.val)', 'if (val < node.val)', 'if (val > node.val)', 'if (val <= node.val)'], correct: 1, hint: 'BST: less goes left, greater goes right' },
    { type: 'grid', label: 'Tree Level Map', size: 4, pattern: [1,4,5,8,9,10,11], hint: 'Level 0: root, Level 1: 2, Level 2: 4 nodes' },
    { type: 'sequence', label: 'Preorder Traversal', nodes: ['visit root','go left','go right'], order: [0,1,2], hint: 'Root → Left → Right — serialize tree structure' },
    { type: 'code', label: 'Max Depth', lines: ['function maxDepth(root) {', '  if (!root) return 0', '  return 1 + Math.max(', '    maxDepth(root.left),', '    maxDepth(root.right)', '  )', '}'], blankLine: 2, options: ['return Math.max(root.left, root.right)', 'return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))', 'return maxDepth(root.left) + maxDepth(root.right)', 'return 1 + maxDepth(root.left)'], correct: 1, hint: '1 for current node + max of subtree depths' },
    { type: 'sequence', label: 'Level Order BFS', nodes: ['enqueue root','dequeue node','enqueue left child','enqueue right child','process next level'], order: [0,1,2,3,4], hint: 'Queue drives BFS; process level by level' },
    { type: 'grid', label: 'AVL Balance Pattern', size: 4, pattern: [2,5,6,8,9,10,11], hint: 'AVL rebalances when height diff > 1' },
    { type: 'code', label: 'Is Valid BST', lines: ['function isValid(node, min, max) {', '  if (!node) return true', '  if (node.val <= min || node.val >= max) return false', '  return isValid(node.left, min, node.val)', '      && isValid(node.right, node.val, max)', '}'], blankLine: 2, options: ['if (node.val === min || node.val === max) return false', 'if (node.val <= min || node.val >= max) return false', 'if (node.val < min || node.val > max) return false', 'if (node.val !== min && node.val !== max) return false'], correct: 1, hint: 'Every node must be strictly inside (min, max) bounds' },
  ],
  graphs: [
    { type: 'sequence', label: 'BFS Order A→F', nodes: ['A','B','C','D','E','F'], order: [0,1,2,3,4,5], hint: 'Visit level by level outward from source' },
    { type: 'code', label: "Dijkstra's Core", lines: ['while (pq.length) {', '  const [d, u] = pq.shift()', '  if (d > dist[u]) continue', '  for (const [v, w] of adj[u]) {', '    if (dist[u] + w < dist[v]) {', '      dist[v] = dist[u] + w', '      pq.push([dist[v], v])', '    }', '  }', '}'], blankLine: 2, options: ['if (d < dist[u]) continue', 'if (d > dist[u]) continue', 'if (d === dist[u]) continue', 'if (visited[u]) break'], correct: 1, hint: 'Stale entry: queued dist > known dist → skip' },
    { type: 'grid', label: 'Adjacency Matrix', size: 4, pattern: [1,2,4,6,8,9,11,13], hint: 'Undirected: matrix is symmetric about diagonal' },
    { type: 'sequence', label: 'DFS Order', nodes: ['A','B','D','E','C','F'], order: [0,1,2,3,4,5], hint: 'Dive deep before backtracking' },
    { type: 'code', label: 'Union Find', lines: ['function find(p, id) {', '  while (p[id] !== id) {', '    p[id] = p[p[id]]', '    id = p[id]', '  }', '  return id', '}'], blankLine: 2, options: ['p[id] = id', 'p[id] = p[p[id]]', 'p[id] = p[id] + 1', 'p[id] = 0'], correct: 1, hint: 'Path compression: point node to grandparent' },
    { type: 'sequence', label: 'Topological Sort', nodes: ['compute in-degrees','enqueue zero in-degree','dequeue node','reduce neighbour in-degrees','enqueue new zeros'], order: [0,1,2,3,4], hint: "Kahn's algorithm: BFS on in-degree 0 nodes" },
    { type: 'grid', label: 'Topological Order', size: 4, pattern: [0,4,8,12,1,5,9,13,2,6,10,14], hint: 'Left-to-right = topological processing order' },
    { type: 'code', label: 'Has Path DFS', lines: ['function hasPath(graph, src, dst, seen = new Set()) {', '  if (src === dst) return true', '  if (seen.has(src)) return false', '  seen.add(src)', '  for (const n of graph[src])', '    if (hasPath(graph, n, dst, seen)) return true', '  return false', '}'], blankLine: 2, options: ['if (seen.has(dst)) return false', 'if (seen.has(src)) return false', 'if (!seen.has(src)) return false', 'if (src in seen) return true'], correct: 1, hint: 'Already visited src → cycle detected → return false' },
  ],
  heap: [
    { type: 'sequence', label: 'Min-Heap Insert', nodes: ['insert 10','heapify up','insert 5','5 bubbles to root','insert 8'], order: [0,1,2,3,4], hint: 'Each insert: add at end, bubble up' },
    { type: 'code', label: 'Heapify Up', lines: ['function heapifyUp(heap, i) {', '  while (i > 0) {', '    const p = Math.floor((i - 1) / 2)', '    if (heap[p] <= heap[i]) break', '    [heap[p], heap[i]] = [heap[i], heap[p]]', '    i = p', '  }', '}'], blankLine: 2, options: ['const p = Math.floor(i / 2)', 'const p = Math.floor((i - 1) / 2)', 'const p = i - 1', 'const p = (i + 1) / 2'], correct: 1, hint: 'Parent of node i: floor((i-1)/2)' },
    { type: 'grid', label: 'Heap Array Layout', size: 4, pattern: [0,1,2,3,4,5,6], hint: 'Root at 0; children of i at 2i+1 and 2i+2' },
    { type: 'sequence', label: 'Extract-Min Steps', nodes: ['swap root & last','remove last leaf','sift root down','compare children','swap with smaller child'], order: [0,1,2,3,4], hint: 'Move last to root then bubble down' },
    { type: 'code', label: 'Heapify Down', lines: ['function down(h, i, n) {', '  while (true) {', '    let sm = i, l = 2*i+1, r = 2*i+2', '    if (l < n && h[l] < h[sm]) sm = l', '    if (r < n && h[r] < h[sm]) sm = r', '    if (sm === i) break', '    [h[sm], h[i]] = [h[i], h[sm]]; i = sm', '  }', '}'], blankLine: 3, options: ['if (l < n && h[l] > h[sm]) sm = l', 'if (l < n && h[l] < h[sm]) sm = l', 'if (l < n && h[l] === h[sm]) sm = l', 'if (l <= n && h[l] < h[sm]) sm = l'], correct: 1, hint: 'Find smallest among node and its two children' },
    { type: 'sequence', label: 'Top-K Elements', nodes: ['build min-heap size K','for each remaining item','if item > heap.min','replace min with item','heapify'], order: [0,1,2,3,4], hint: 'Min-heap of size K: kick out smaller elements' },
    { type: 'grid', label: 'Heap Sort Pattern', size: 4, pattern: [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0], hint: 'Heap sort fills result array right-to-left' },
    { type: 'code', label: 'Kth Largest', lines: ['function kthLargest(nums, k) {', '  const heap = nums.slice(0, k)', '  buildMinHeap(heap)', '  for (let i = k; i < nums.length; i++) {', '    if (nums[i] > heap[0]) {', '      heap[0] = nums[i]', '      heapifyDown(heap, 0)', '    }', '  }', '  return heap[0]', '}'], blankLine: 4, options: ['if (nums[i] < heap[0])', 'if (nums[i] > heap[0])', 'if (nums[i] === heap[0])', 'if (i > heap[0])'], correct: 1, hint: 'Keep K largest: replace root(min) only if new item is bigger' },
  ],
  greedy: [
    { type: 'sequence', label: 'Activity Selection', nodes: ['[1,3]','[2,5]','[4,7]','[6,9]','[8,10]'], order: [0,2,4], hint: 'Pick earliest ending non-overlapping activity' },
    { type: 'code', label: "Kruskal's MST", lines: ['edges.sort((a,b) => a.w - b.w)', 'const mst = []', 'for (const e of edges) {', '  if (find(e.u) !== find(e.v)) {', '    mst.push(e)', '    union(e.u, e.v)', '  }', '}'], blankLine: 0, options: ['edges.sort((a,b) => b.w - a.w)', 'edges.sort((a,b) => a.w - b.w)', 'edges.reverse()', 'edges.sort()'], correct: 1, hint: 'Process edges cheapest-first, skip cycles' },
    { type: 'grid', label: 'Coin Change Greedy', size: 4, pattern: [0,3,4,7,8,11,12,15], hint: 'Always pick largest denomination ≤ remaining' },
    { type: 'sequence', label: 'Huffman Build', nodes: ['sort by freq','merge 2 min-freq','create parent node','reinsert parent','repeat until 1 tree'], order: [0,1,2,3,4], hint: 'Always merge two nodes with lowest frequency' },
    { type: 'code', label: 'Jump Game', lines: ['function canJump(nums) {', '  let reach = 0', '  for (let i = 0; i < nums.length; i++) {', '    if (i > reach) return false', '    reach = Math.max(reach, i + nums[i])', '  }', '  return true', '}'], blankLine: 4, options: ['reach = Math.min(reach, i + nums[i])', 'reach = Math.max(reach, i + nums[i])', 'reach = reach + nums[i]', 'reach = i + nums[i]'], correct: 1, hint: 'Greedily extend farthest reachable index' },
    { type: 'sequence', label: 'Fractional Knapsack', nodes: ['sort by value/weight','take highest ratio first','if full item fits take it','else take fraction','stop when capacity 0'], order: [0,1,2,3,4], hint: 'Greedy ratio sort; fractions allowed unlike 0/1 knapsack' },
    { type: 'grid', label: "Prim's Visited Set", size: 4, pattern: [0,1,4,5,2,6,8,9], hint: "Prim's MST grows from one seed node outward" },
    { type: 'code', label: 'Assign Cookies', lines: ['function cookies(g, s) {', '  g.sort((a,b) => a-b)', '  s.sort((a,b) => a-b)', '  let i = 0, j = 0', '  while (i < g.length && j < s.length) {', '    if (s[j] >= g[i]) i++', '    j++', '  }', '  return i', '}'], blankLine: 5, options: ['if (s[j] <= g[i]) i++', 'if (s[j] >= g[i]) i++', 'if (s[j] === g[i]) i++', 'if (g[i] >= s[j]) j++'], correct: 1, hint: 'Cookie satisfies child only if cookie size ≥ greed factor' },
  ],
  slidingwindow: [
    { type: 'sequence', label: 'Max Sum k=3', nodes: ['window [1,2,3] sum=6','slide: -1+4=[2,3,4] sum=9','slide: -2+5=[3,4,5] sum=12'], order: [0,1,2], hint: 'Subtract element leaving, add element entering' },
    { type: 'code', label: 'Longest No-Repeat Window', lines: ['function maxLen(s) {', '  let map = {}, l = 0, max = 0', '  for (let r = 0; r < s.length; r++) {', '    if (map[s[r]] >= l) l = map[s[r]] + 1', '    map[s[r]] = r', '    max = Math.max(max, r - l + 1)', '  }', '  return max', '}'], blankLine: 3, options: ['if (map[s[r]] > l)', 'if (map[s[r]] >= l) l = map[s[r]] + 1', 'if (s[r] in map)', 'if (map[s[r]] < l)'], correct: 1, hint: 'Move left pointer past the previous occurrence' },
    { type: 'grid', label: 'Fixed Window Slide', size: 5, pattern: [0,1,2,6,7,8,12,13,14], hint: 'Window of size 3 slides one step right each time' },
    { type: 'sequence', label: 'Min Window Substring', nodes: ['expand right pointer','check all chars covered','shrink left pointer','record current window','continue expanding'], order: [0,1,2,3,4], hint: 'Two-phase: expand until valid, contract to minimise' },
    { type: 'code', label: 'Fruit Into Baskets', lines: ['function fruits(t) {', '  const map = new Map()', '  let l = 0, max = 0', '  for (let r = 0; r < t.length; r++) {', '    map.set(t[r], (map.get(t[r])||0) + 1)', '    while (map.size > 2) {', '      map.set(t[l], map.get(t[l]) - 1)', '      if (!map.get(t[l])) map.delete(t[l])', '      l++', '    }', '    max = Math.max(max, r - l + 1)', '  }', '  return max', '}'], blankLine: 5, options: ['while (map.size < 2)', 'while (map.size > 2)', 'while (map.size === 2)', 'while (map.size !== 0)'], correct: 1, hint: 'Shrink left when more than 2 distinct fruit types' },
    { type: 'sequence', label: 'Variable Window Expand', nodes: ['right expands','constraint ok? keep','constraint broken','shrink left until ok','update max window'], order: [0,1,2,3,4], hint: 'Right always moves; left only moves when constraint breaks' },
    { type: 'grid', label: 'Two-Sum Pair Window', size: 4, pattern: [0,1,4,5,10,11,14,15], hint: 'Pairs that sum to target — complement lookup' },
    { type: 'code', label: 'Max Consecutive Ones III', lines: ['function longestOnes(nums, k) {', '  let l = 0, zeros = 0, max = 0', '  for (let r = 0; r < nums.length; r++) {', '    if (nums[r] === 0) zeros++', '    while (zeros > k) {', '      if (nums[l] === 0) zeros--', '      l++', '    }', '    max = Math.max(max, r - l + 1)', '  }', '  return max', '}'], blankLine: 4, options: ['if (nums[r] === 1) zeros++', 'if (nums[r] === 0) zeros++', 'if (zeros < k) zeros++', 'zeros += nums[r]'], correct: 1, hint: 'Track zero count; shrink when zeros exceed k flips allowed' },
  ],
  twopointer: [
    { type: 'sequence', label: 'Two Sum Sorted', nodes: ['lo=0, hi=n-1','sum=arr[lo]+arr[hi]','sum > target → hi--','sum < target → lo++','sum === target → FOUND'], order: [0,1,2,3,4], hint: 'Converge from both ends inward' },
    { type: 'code', label: 'Container With Water', lines: ['function maxWater(h) {', '  let l = 0, r = h.length-1, max = 0', '  while (l < r) {', '    max = Math.max(max, Math.min(h[l],h[r]) * (r-l))', '    if (h[l] < h[r]) l++', '    else r--', '  }', '  return max', '}'], blankLine: 4, options: ['if (h[l] > h[r]) l++', 'if (h[l] < h[r]) l++', 'if (l < r) l++', 'if (h[l] === h[r]) r--'], correct: 1, hint: 'Always move the shorter wall inward' },
    { type: 'grid', label: 'Converging Pointers', size: 4, pattern: [0,3,4,7,1,2,5,6], hint: 'Pointers start at ends and meet in middle' },
    { type: 'sequence', label: '3Sum Steps', nodes: ['sort array','fix pointer i','lo=i+1, hi=n-1','sum<0→lo++, sum>0→hi--','skip duplicates, advance i'], order: [0,1,2,3,4], hint: 'Sort + fix one element + two-pointer inner loop' },
    { type: 'code', label: 'Remove Duplicates Sorted', lines: ['function removeDups(nums) {', '  let k = 1', '  for (let i = 1; i < nums.length; i++) {', '    if (nums[i] !== nums[i-1]) {', '      nums[k] = nums[i]', '      k++', '    }', '  }', '  return k', '}'], blankLine: 3, options: ['if (nums[i] === nums[i-1])', 'if (nums[i] !== nums[i-1])', 'if (nums[i] < nums[i-1])', 'if (k !== i)'], correct: 1, hint: 'Write pointer k advances only on new unique value' },
    { type: 'sequence', label: 'Dutch Flag Problem', nodes: ['lo=0, mid=0, hi=n-1','nums[mid]=0 → swap lo,mid; lo++,mid++','nums[mid]=1 → mid++','nums[mid]=2 → swap mid,hi; hi--','stop when mid>hi'], order: [0,1,2,3,4], hint: 'Three-way partition with low/mid/high pointers' },
    { type: 'grid', label: 'Fast-Slow Pointers', size: 4, pattern: [0,2,4,6,8,10,12,14], hint: 'Fast pointer skips every other element' },
    { type: 'code', label: 'Is Palindrome String', lines: ['function isPalin(s) {', '  let l = 0, r = s.length - 1', '  while (l < r) {', '    if (s[l] !== s[r]) return false', '    l++; r--', '  }', '  return true', '}'], blankLine: 3, options: ['if (s[l] === s[r]) return false', 'if (s[l] !== s[r]) return false', 'if (l >= r) return false', 'if (s[l] > s[r]) return false'], correct: 1, hint: 'Any mismatch from both ends → not palindrome' },
  ],
  backtracking: [
    { type: 'sequence', label: 'N-Queens States', nodes: ['place col 1','try each row','conflict? skip','recurse next col','no row left? backtrack'], order: [0,1,2,3,4], hint: 'Try, recurse, undo on conflict' },
    { type: 'code', label: 'Permutations', lines: ['function perms(nums, curr = [], res = []) {', '  if (curr.length === nums.length) { res.push([...curr]); return }', '  for (let i = 0; i < nums.length; i++) {', '    if (curr.includes(nums[i])) continue', '    curr.push(nums[i])', '    perms(nums, curr, res)', '    curr.pop()', '  }', '  return res', '}'], blankLine: 3, options: ['if (curr.indexOf(nums[i]) > -1) break', 'if (curr.includes(nums[i])) continue', 'if (!curr.includes(nums[i])) continue', 'if (nums.includes(curr[i])) skip'], correct: 1, hint: 'Skip already-used elements in current path' },
    { type: 'grid', label: 'Decision Tree Grid', size: 4, pattern: [0,1,2,3,5,6,7,9,10,11,13,14,15], hint: 'Backtracking prunes constraint-violating branches' },
    { type: 'sequence', label: 'Subset Generation', nodes: ['[]','[1]','[1,2]','[1,2,3]','[1,3]','[2]','[2,3]','[3]'], order: [0,1,2,3,4,5,6,7], hint: 'Include or exclude each element — 2^n subsets' },
    { type: 'code', label: 'Combination Sum', lines: ['function combo(cands, target, start, path, res) {', '  if (target === 0) { res.push([...path]); return }', '  if (target < 0) return', '  for (let i = start; i < cands.length; i++) {', '    path.push(cands[i])', '    combo(cands, target - cands[i], i, path, res)', '    path.pop()', '  }', '}'], blankLine: 4, options: ['path.push(cands[i] + 1)', 'path.push(cands[i])', 'cands.push(path[i])', 'res.push(cands[i])'], correct: 1, hint: 'Add candidate to path before recurse, pop after' },
    { type: 'sequence', label: 'Word Search DFS', nodes: ['mark cell visited','check all 4 directions','found full word? return true','backtrack: unmark cell','try next starting cell'], order: [0,1,2,3,4], hint: 'DFS + backtrack: mark visited to avoid cycles, unmark on return' },
    { type: 'grid', label: 'Sudoku Constraints', size: 4, pattern: [0,5,10,15,3,6,9,12,1,4,11,14], hint: 'No repeats in row, col, or 3×3 box' },
    { type: 'code', label: 'Letter Combinations', lines: ['function letterCombo(digits) {', '  const map = {2:"abc",3:"def",4:"ghi",5:"jkl",6:"mno",7:"pqrs",8:"tuv",9:"wxyz"}', '  const res = []', '  function bt(i, curr) {', '    if (i === digits.length) { res.push(curr); return }', '    for (const c of map[digits[i]]) bt(i+1, curr+c)', '  }', '  bt(0, "")', '  return res', '}'], blankLine: 4, options: ['if (i > digits.length)', 'if (i === digits.length) { res.push(curr); return }', 'if (curr.length === digits.length)', 'if (i < digits.length)'], correct: 1, hint: 'Base case: processed all digit positions → push result' },
  ],
  dp: [
    { type: 'sequence', label: 'Knapsack DP Fill', nodes: ['dp[0][*]=0','dp[*][0]=0','fill row 1','fill row 2','dp[n][W]=answer'], order: [0,1,2,3,4], hint: 'Build table bottom-up; each cell: take or skip' },
    { type: 'code', label: 'Longest Common Subseq', lines: ['function lcs(a, b) {', '  const dp = Array(a.length+1).fill(0).map(()=>Array(b.length+1).fill(0))', '  for (let i = 1; i <= a.length; i++)', '    for (let j = 1; j <= b.length; j++)', '      if (a[i-1] === b[j-1]) dp[i][j] = dp[i-1][j-1] + 1', '      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])', '  return dp[a.length][b.length]', '}'], blankLine: 4, options: ['dp[i][j] = dp[i-1][j-1] + 1', 'dp[i][j] = dp[i][j-1] + 1', 'dp[i][j] = dp[i-1][j]', 'dp[i][j] = 1'], correct: 0, hint: 'Match: extend diagonal+1. No match: max of up or left' },
    { type: 'grid', label: 'DP Table Fill Order', size: 4, pattern: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], hint: 'Fill left→right, top→bottom; each cell uses previous' },
    { type: 'sequence', label: 'Coin Change Steps', nodes: ['dp[0]=0','set dp[1..n]=Infinity','for each coin c','dp[i]=min(dp[i], dp[i-c]+1)','return dp[amount]'], order: [0,1,2,3,4], hint: 'Build from smaller amounts; each coin updates reachable amounts' },
    { type: 'code', label: 'Climbing Stairs', lines: ['function climbStairs(n) {', '  if (n <= 2) return n', '  let a = 1, b = 2', '  for (let i = 3; i <= n; i++) {', '    const c = a + b', '    a = b', '    b = c', '  }', '  return b', '}'], blankLine: 4, options: ['const c = a * b', 'const c = a + b', 'const c = b - a', 'const c = a + 1'], correct: 1, hint: 'Ways to reach step i = ways from (i-1) + ways from (i-2)' },
    { type: 'sequence', label: 'LIS (Longest Inc Subseq)', nodes: ['dp[i]=1 for all i','for each i, check all j<i','if nums[j]<nums[i]: dp[i]=max(dp[i],dp[j]+1)','answer = max(dp)'], order: [0,1,2,3], hint: 'Each element extends subsequences ending at smaller elements' },
    { type: 'grid', label: 'Edit Distance Table', size: 4, pattern: [0,1,2,3,4,5,8,9,12,13], hint: 'Edit distance: deletions, insertions, substitutions' },
    { type: 'code', label: 'House Robber', lines: ['function rob(nums) {', '  let prev = 0, curr = 0', '  for (const n of nums) {', '    const next = Math.max(curr, prev + n)', '    prev = curr', '    curr = next', '  }', '  return curr', '}'], blankLine: 3, options: ['const next = Math.min(curr, prev + n)', 'const next = Math.max(curr, prev + n)', 'const next = curr + prev', 'const next = Math.max(prev, curr + n)'], correct: 1, hint: 'Rob current house (prev+n) vs skip it (curr) — take max' },
  ],
}

const ROUNDS_TO_UNLOCK = 3
const MAX_LIVES = 3
const neon = (c, s = 1) => `0 0 ${5*s}px ${c}88, 0 0 ${12*s}px ${c}44`
const hexToRgb = h => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16); return `${r},${g},${b}` }

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createQueue(items) {
  let q = shuffle(items)
  let ptr = 0
  return {
    next() {
      if (ptr >= q.length) { q = shuffle(items); ptr = 0 }
      return q[ptr++]
    }
  }
}

const STORAGE_KEY = 'dsa_unlocked_v2'
function loadUnlocked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '["arrays"]') }
  catch { return ['arrays'] }
}
function saveUnlocked(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

// ─── MAIN HOOK ────────────────────────────────────────────────
function useGame() {
  const [screen, setScreen]           = useState('home')
  const [unlockedTopics, setUnlocked] = useState(loadUnlocked)
  const [activeTopic, setActiveTopic] = useState(null)

  const queueRef = useRef(null)
  const [currentChallenge, setCurrentChallenge] = useState(null)

  const [phase, setPhase]             = useState('show')
  const [score, setScore]             = useState(0)
  const [combo, setCombo]             = useState(0)
  const [lives, setLives]             = useState(MAX_LIVES)
  const [level, setLevel]             = useState(1)
  const [feedback, setFeedback]       = useState(null)
  const [timeLeft, setTimeLeft]       = useState(0)
  const [roundsPlayed, setRoundsPlayed]   = useState(0)
  const [roundsCorrect, setRoundsCorrect] = useState(0)
  const [playerSeq, setPlayerSeq]         = useState([])
  const [selectedCells, setSelectedCells] = useState([])
  const [codeAnswer, setCodeAnswer]       = useState(null)
  const [unlockCelebration, setUnlockCelebration] = useState(null)

  const timerRef           = useRef(null)
  const phaseRef           = useRef('show')
  const roundsCorrectRef   = useRef(0)
  const livesRef           = useRef(MAX_LIVES)
  const activeTopicRef     = useRef(null)
  const unlockedRef        = useRef(loadUnlocked())
  const roundsPlayedRef    = useRef(0)
  const levelRef           = useRef(1)
  const unlockedThisSessionRef = useRef(false)

  phaseRef.current         = phase
  roundsCorrectRef.current = roundsCorrect
  livesRef.current         = lives
  activeTopicRef.current   = activeTopic
  unlockedRef.current      = unlockedTopics
  roundsPlayedRef.current  = roundsPlayed
  levelRef.current         = level

  const showDuration = useMemo(() => Math.max(1500, 4500 - level * 400), [level])
  const recallTime   = useMemo(() => Math.max(6, 22 - level * 2), [level])
  const topicData    = useMemo(() => TOPICS.find(t => t.id === activeTopic) || null, [activeTopic])

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const startTopic = useCallback((topicId) => {
    stopTimer()
    const items = CHALLENGES[topicId] || []
    queueRef.current = createQueue(items)
    const first = queueRef.current.next()

    setActiveTopic(topicId)
    setCurrentChallenge(first)
    setScore(0); setCombo(0)
    livesRef.current = MAX_LIVES; setLives(MAX_LIVES)
    levelRef.current = 1; setLevel(1)
    roundsCorrectRef.current = 0; setRoundsCorrect(0)
    roundsPlayedRef.current  = 0; setRoundsPlayed(0)
    setPhase('show'); phaseRef.current = 'show'
    setFeedback(null)
    setPlayerSeq([]); setSelectedCells([]); setCodeAnswer(null)
    setUnlockCelebration(null)
    unlockedThisSessionRef.current = false
    setScreen('playing')
  }, [stopTimer])

  const nextRound = useCallback(() => {
    setFeedback(null)
    if (roundsCorrectRef.current > 0 && roundsCorrectRef.current % 3 === 0) {
      const nl = Math.min(levelRef.current + 1, 8)
      levelRef.current = nl; setLevel(nl)
    }
    const next = queueRef.current?.next()
    if (next) setCurrentChallenge(next)
    setPhase('show'); phaseRef.current = 'show'
    setPlayerSeq([]); setSelectedCells([]); setCodeAnswer(null)
  }, [])

  const doUnlock = useCallback((correct) => {
    // try unlock silently (celebration may have already fired mid-session)
    const topic    = activeTopicRef.current
    const unlocked = unlockedRef.current
    if (correct >= ROUNDS_TO_UNLOCK && topic && !unlockedThisSessionRef.current) {
      const idx = TOPICS.findIndex(t => t.id === topic)
      if (idx >= 0 && idx < TOPICS.length - 1) {
        const nextId = TOPICS[idx + 1].id
        if (!unlocked.includes(nextId)) {
          const updated = [...unlocked, nextId]
          unlockedRef.current = updated
          setUnlocked(updated)
          saveUnlocked(updated)
          unlockedThisSessionRef.current = true
        }
      }
    }
    setScreen('result')
  }, [])

  const handleTimeout = useCallback(() => {
    if (phaseRef.current !== 'recall') return
    stopTimer()
    setFeedback('wrong'); setPhase('feedback'); phaseRef.current = 'feedback'
    setCombo(0)
    roundsPlayedRef.current += 1; setRoundsPlayed(roundsPlayedRef.current)
    const nl = livesRef.current - 1
    livesRef.current = nl; setLives(nl)
    if (nl <= 0) setTimeout(() => doUnlock(roundsCorrectRef.current), 1800)
    else         setTimeout(nextRound, 1800)
  }, [stopTimer, doUnlock, nextRound])

  const applyResult = useCallback((ok) => {
    stopTimer()
    roundsPlayedRef.current += 1; setRoundsPlayed(roundsPlayedRef.current)

    if (ok) {
      const newCorrect = roundsCorrectRef.current + 1
      roundsCorrectRef.current = newCorrect
      setRoundsCorrect(newCorrect)
      setFeedback('correct'); setPhase('feedback'); phaseRef.current = 'feedback'
      setCombo(c => {
        const nc   = c + 1
        const mult = Math.min(5, 1 + Math.floor(nc / 3))
        setScore(s => s + 100 * mult)
        return nc
      })

      if (newCorrect === ROUNDS_TO_UNLOCK && !unlockedThisSessionRef.current) {
        const topic    = activeTopicRef.current
        const unlocked = unlockedRef.current
        const idx      = TOPICS.findIndex(t => t.id === topic)
        if (idx >= 0 && idx < TOPICS.length - 1) {
          const nextTopicData = TOPICS[idx + 1]
          if (!unlocked.includes(nextTopicData.id)) {
            const updated = [...unlocked, nextTopicData.id]
            unlockedRef.current = updated
            setUnlocked(updated)
            saveUnlocked(updated)
            unlockedThisSessionRef.current = true
            setTimeout(() => {
              setFeedback(null)
              setUnlockCelebration({
                topicName: nextTopicData.name,
                topicColor: nextTopicData.color,
                topicIcon: nextTopicData.icon,
                nextTopicId: nextTopicData.id,
              })
            }, 1400)
            return
          }
        }
      }

      setTimeout(nextRound, 1400)
    } else {
      setFeedback('wrong'); setPhase('feedback'); phaseRef.current = 'feedback'
      setCombo(0)
      const nl = livesRef.current - 1
      livesRef.current = nl; setLives(nl)
      if (nl <= 0) setTimeout(() => doUnlock(roundsCorrectRef.current), 1800)
      else         setTimeout(nextRound, 1800)
    }
  }, [stopTimer, nextRound, doUnlock])

  // Auto show → recall
  useEffect(() => {
    if (phase !== 'show' || screen !== 'playing' || !currentChallenge) return
    const dur = currentChallenge.type === 'code' ? showDuration + 1000 : showDuration
    const t = setTimeout(() => {
      setPhase('recall'); phaseRef.current = 'recall'
      setPlayerSeq([]); setSelectedCells([]); setCodeAnswer(null)
      setTimeLeft(recallTime)
    }, dur)
    return () => clearTimeout(t)
  }, [phase, screen, currentChallenge, showDuration, recallTime])

  // Countdown
  useEffect(() => {
    if (phase !== 'recall' || screen !== 'playing') return
    stopTimer()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { stopTimer(); handleTimeout(); return 0 }
        return t - 1
      })
    }, 1000)
    return stopTimer
  }, [phase, screen]) // eslint-disable-line

  const submitSequence = useCallback((seq) => {
    if (!currentChallenge) return
    const ok = seq.length === currentChallenge.order.length && seq.every((v,i) => v === currentChallenge.order[i])
    applyResult(ok)
  }, [currentChallenge, applyResult])

  const submitGrid = useCallback((cells) => {
    if (!currentChallenge) return
    const s1 = [...cells].sort((a,b)=>a-b)
    const s2 = [...currentChallenge.pattern].sort((a,b)=>a-b)
    applyResult(s1.length === s2.length && s1.every((v,i)=>v===s2[i]))
  }, [currentChallenge, applyResult])

  const submitCode = useCallback((idx) => {
    if (!currentChallenge) return
    applyResult(idx === currentChallenge.correct)
  }, [currentChallenge, applyResult])

  const dismissCelebration = useCallback((goNext) => {
    const celebration = unlockCelebration
    setUnlockCelebration(null)
    if (goNext && celebration?.nextTopicId) {
      startTopic(celebration.nextTopicId)
    } else {
      nextRound()
    }
  }, [unlockCelebration, startTopic, nextRound])

  // ── NEW GAME: reset everything, go to dedicated newgame screen ──
  const newGame = useCallback(() => {
    stopTimer()
    const fresh = ['arrays']
    unlockedRef.current = fresh
    setUnlocked(fresh)
    saveUnlocked(fresh)
    setActiveTopic(null)
    setScreen('newgame')   // ← goes to NewGameScreen, not 'home'
  }, [stopTimer])

  return {
    screen, setScreen, unlockedTopics,
    activeTopic, topicData, currentChallenge,
    phase, score, combo, lives, level, feedback,
    timeLeft, recallTime, roundsPlayed, roundsCorrect,
    playerSeq, setPlayerSeq, selectedCells, setSelectedCells,
    codeAnswer, setCodeAnswer, showDuration,
    unlockCelebration, dismissCelebration,
    startTopic, submitSequence, submitGrid, submitCode,
    finishGame: () => doUnlock(roundsCorrectRef.current),
    newGame,
  }
}

// ─── UI HELPERS ───────────────────────────────────────────────
const S = {
  root: { fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", background: '#060c12', color: '#e2f0ff', minHeight: '100%', position: 'relative', overflow: 'hidden' },
  scanlines: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,230,180,.012) 2px,rgba(0,230,180,.012) 4px)' },
  grid: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(34,211,238,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.03) 1px,transparent 1px)', backgroundSize: '48px 48px' },
  inner: { position: 'relative', zIndex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '14px 10px 48px' },
}
const hudCell = c => ({ background: `rgba(${hexToRgb(c)},.06)`, border: `1px solid rgba(${hexToRgb(c)},.2)`, borderRadius: 10, padding: '7px 10px', textAlign: 'center' })
const actionBtn = (c, full) => ({ background: `rgba(${hexToRgb(c)},.1)`, border: `1px solid ${c}`, color: c, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 900, padding: full ? '11px 0' : '9px 22px', width: full ? '100%' : 'auto', borderRadius: 9, cursor: 'pointer', letterSpacing: 2, textShadow: neon(c,.4) })
const syntaxColor = l => /function|return|const|let|if|else|while|for|new/.test(l) ? '#a78bfa' : /\/\//.test(l) ? 'rgba(226,240,255,.3)' : /#|'|"/.test(l) ? '#86efac' : '#e2f0ff'

// ─── NEW GAME SCREEN ─────────────────────────────────────────
function NewGameScreen({ onStart }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 16 }}>
      <style>{`
        @keyframes bigLockIn {
          0%   { opacity:0; transform:scale(.5) rotate(-10deg); }
          60%  { transform:scale(1.12) rotate(2deg); }
          100% { opacity:1; transform:scale(1) rotate(0deg); }
        }
        @keyframes lockDrop {
          0%   { opacity:0; transform:translateY(-18px) scale(.7); }
          60%  { transform:translateY(4px) scale(1.08); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes ngFade {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes glitchBar {
          0%,100% { opacity:0; }
          10%,30% { opacity:1; }
          20%,40% { opacity:0; }
        }
        @keyframes startPulse {
          0%,100% { box-shadow: 0 0 14px rgba(34,211,238,.25); }
          50%     { box-shadow: 0 0 30px rgba(34,211,238,.55); }
        }
      `}</style>

      {/* Glitch horizontal bars */}
      {[18, 42, 67, 83].map((top, i) => (
        <div key={i} style={{
          position: 'fixed', left: 0, right: 0, top: `${top}%`, height: 1,
          background: 'rgba(248,113,113,.35)', pointerEvents: 'none', zIndex: 2,
          animation: `glitchBar .8s ease ${i * 0.1}s forwards`,
        }} />
      ))}

      {/* Big lock */}
      <div style={{
        fontSize: 72, marginBottom: 10,
        animation: 'bigLockIn .6s cubic-bezier(.34,1.56,.64,1) forwards',
        opacity: 0,
        filter: 'drop-shadow(0 0 24px rgba(248,113,113,.55))',
      }}>🔒</div>

      <div style={{ fontSize: 10, letterSpacing: 6, color: '#f87171', textShadow: neon('#f87171',.6), marginBottom: 6, opacity: 0, animation: 'ngFade .4s ease .4s forwards' }}>
        ● FULL RESET ●
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 3, color: '#fff', lineHeight: 1, opacity: 0, animation: 'ngFade .4s ease .5s forwards' }}>
        NEW GAME
      </div>
      <div style={{ fontSize: 10, color: 'rgba(226,240,255,.35)', letterSpacing: 3, marginBottom: 28, opacity: 0, animation: 'ngFade .4s ease .6s forwards' }}>
        ALL TOPICS LOCKED · START FROM ARRAYS
      </div>

      <div style={{ fontSize: 9, color: 'rgba(226,240,255,.3)', letterSpacing: 2, marginBottom: 14, opacity: 0, animation: 'ngFade .4s ease .7s forwards' }}>
        GET {ROUNDS_TO_UNLOCK}+ CORRECT → AUTO-UNLOCK NEXT TOPIC
      </div>

      {/* Topics grid — all locked except arrays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 7, marginBottom: 26 }}>
        {TOPICS.map((t, i) => (
          <div key={t.id} style={{
            background: i === 0 ? `rgba(${hexToRgb(t.color)},.05)` : 'rgba(255,255,255,.02)',
            border: `1px solid ${i === 0 ? `rgba(${hexToRgb(t.color)},.3)` : 'rgba(255,255,255,.06)'}`,
            borderRadius: 10, padding: '10px 6px', textAlign: 'center',
            opacity: 0,
            animation: `lockDrop .4s cubic-bezier(.34,1.56,.64,1) ${(0.75 + i * 0.045).toFixed(2)}s forwards`,
          }}>
            <div style={{
              fontSize: 15, marginBottom: 3,
              filter: i === 0 ? `drop-shadow(0 0 6px ${t.color})` : 'none',
            }}>
              {i === 0 ? t.icon : '🔒'}
            </div>
            <div style={{
              fontSize: 8, fontWeight: 900,
              color: i === 0 ? t.color : 'rgba(226,240,255,.35)',
              letterSpacing: 1, lineHeight: 1.3,
              textShadow: i === 0 ? neon(t.color, .4) : 'none',
            }}>
              {t.name}
            </div>
            <div style={{ fontSize: 7, color: 'rgba(226,240,255,.2)', marginTop: 2 }}>
              TOPIC {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart('arrays')}
        style={{
          background: 'rgba(34,211,238,.1)',
          border: '2px solid #22d3ee',
          color: '#22d3ee',
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 11, fontWeight: 900,
          padding: '13px 0', width: '100%',
          borderRadius: 9, cursor: 'pointer',
          letterSpacing: 3,
          textShadow: neon('#22d3ee', .6),
          opacity: 0,
          animation: 'ngFade .4s ease 1.45s forwards, startPulse 2s ease 1.85s infinite',
        }}
      >
        ▶ START FROM ARRAYS
      </button>
    </div>
  )
}

// ─── HUD ─────────────────────────────────────────────────────
function HUD({ score, lives, combo, level, timeLeft, phase, recallTime, topicData, roundsCorrect }) {
  const col  = topicData?.color || '#22d3ee'
  const mult = Math.min(5, 1 + Math.floor(combo / 3))
  const pct  = phase === 'recall' ? (timeLeft / recallTime) * 100 : 100
  const tc   = timeLeft > recallTime * 0.5 ? '#22d3ee' : timeLeft > recallTime * 0.25 ? '#fbbf24' : '#f87171'
  const progressPct = Math.min(100, (roundsCorrect / ROUNDS_TO_UNLOCK) * 100)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8, marginBottom: 12 }}>
      <div style={hudCell(col)}>
        <div style={{ fontSize: 8, color: col, letterSpacing: 2, opacity: .6 }}>SCORE</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: col, textShadow: neon(col) }}>{score.toString().padStart(6,'0')}</div>
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 7, color: 'rgba(226,240,255,.35)', letterSpacing: 1, marginBottom: 2 }}>
            {roundsCorrect}/{ROUNDS_TO_UNLOCK} UNLOCK
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct >= 100 ? '#22d3ee' : col, boxShadow: `0 0 4px ${col}`, borderRadius: 2, transition: 'width .4s ease' }} />
          </div>
        </div>
      </div>
      <div style={hudCell('#f87171')}>
        <div style={{ fontSize: 8, color: '#f87171', letterSpacing: 2, opacity: .6 }}>LIVES</div>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
          {[0,1,2].map(i => <span key={i} style={{ fontSize: 13, opacity: i < lives ? 1 : .15, textShadow: i < lives ? neon('#f87171',.7) : 'none', transition: 'all .3s' }}>♥</span>)}
        </div>
        {combo >= 3 && <div style={{ fontSize: 8, color: '#fbbf24', textShadow: neon('#fbbf24',.4), marginTop: 2 }}>×{mult} COMBO!</div>}
      </div>
      <div style={hudCell('#a78bfa')}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 8, color: '#a78bfa', letterSpacing: 2, opacity: .6 }}>LVL</span>
          <span style={{ fontSize: 8, color: tc }}>{phase === 'recall' ? `${timeLeft}s` : '—'}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#a78bfa', textShadow: neon('#a78bfa'), lineHeight: 1 }}>{String(level).padStart(2,'0')}</div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: tc, boxShadow: `0 0 4px ${tc}`, borderRadius: 2, transition: 'width 1s linear, background .3s' }} />
        </div>
      </div>
    </div>
  )
}

function FeedbackFlash({ feedback }) {
  if (!feedback) return null
  const ok = feedback === 'correct'
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, pointerEvents: 'none', background: ok ? 'rgba(34,211,238,.06)' : 'rgba(248,113,113,.09)', border: `2px solid ${ok ? '#22d3ee' : '#f87171'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 56, textShadow: neon(ok ? '#22d3ee' : '#f87171', 2) }}>{ok ? '✓' : '✗'}</div>
    </div>
  )
}

function UnlockCelebration({ data, onDismiss }) {
  if (!data) return null
  const { topicName, topicColor, topicIcon } = data
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(6,12,18,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeInScale { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({length: 18}, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, width: 4, height: 4, borderRadius: '50%', background: topicColor, opacity: Math.random()*.7+.3, boxShadow: `0 0 8px ${topicColor}`, animation: `floatUp ${1.5+Math.random()*2}s ease-in-out infinite`, animationDelay: `${Math.random()}s` }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '32px 28px', position: 'relative', animation: 'fadeInScale .4s ease' }}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: 'floatUp 2s ease-in-out infinite', filter: `drop-shadow(0 0 20px ${topicColor})` }}>🔓</div>
        <div style={{ fontSize: 9, letterSpacing: 5, color: '#22d3ee', textShadow: neon('#22d3ee',.6), marginBottom: 6 }}>● UNLOCK ●</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: topicColor, textShadow: neon(topicColor,1.5), letterSpacing: 2, marginBottom: 4 }}>{topicIcon} {topicName.toUpperCase()}</div>
        <div style={{ fontSize: 10, color: 'rgba(226,240,255,.5)', marginBottom: 4, letterSpacing: 1 }}>3 correct — next topic unlocked!</div>
        <div style={{ fontSize: 9, color: 'rgba(226,240,255,.3)', marginBottom: 28, letterSpacing: 1 }}>Keep going or stay here to practice more</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => onDismiss(true)} style={{ background: `rgba(${hexToRgb(topicColor)},.15)`, border: `2px solid ${topicColor}`, color: topicColor, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 900, padding: '10px 20px', borderRadius: 9, cursor: 'pointer', letterSpacing: 2, textShadow: neon(topicColor,.5), boxShadow: `0 0 20px rgba(${hexToRgb(topicColor)},.2)` }}>
            ▶▶ START {topicName.toUpperCase()}
          </button>
          <button onClick={() => onDismiss(false)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(226,240,255,.6)', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 900, padding: '10px 16px', borderRadius: 9, cursor: 'pointer', letterSpacing: 1 }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function LowScoreWarning({ roundsCorrect }) {
  if (roundsCorrect >= ROUNDS_TO_UNLOCK) return null
  const needed = ROUNDS_TO_UNLOCK - roundsCorrect
  return (
    <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.4)', borderRadius: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 16, marginBottom: 6 }}>⚠️</div>
      <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 900, letterSpacing: 1, textShadow: neon('#fbbf24',.4), marginBottom: 4 }}>NEXT TOPIC UNLOCK NAHI HUA</div>
      <div style={{ fontSize: 9, color: 'rgba(251,191,36,.7)', letterSpacing: 1, lineHeight: 1.6 }}>
        {roundsCorrect} sahi hue, {needed} aur chahiye the.<br/>
        Kam se kam <span style={{ color: '#fbbf24', fontWeight: 900 }}>{ROUNDS_TO_UNLOCK} sahi</span> karo next level unlock karne ke liye.
      </div>
    </div>
  )
}

function HomeScreen({ unlockedTopics, onStart }) {
  const [hov, setHov] = useState(null)
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24, paddingTop: 6 }}>
        <div style={{ fontSize: 9, letterSpacing: 6, color: '#22d3ee', textShadow: neon('#22d3ee',.5), marginBottom: 6 }}>◈ DSA ◈</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: '#fff', lineHeight: 1 }}>MEMORY</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: '#22d3ee', textShadow: neon('#22d3ee',1.1), lineHeight: 1 }}>ARCADE</div>
        <div style={{ fontSize: 9, color: 'rgba(226,240,255,.3)', letterSpacing: 3, marginTop: 8 }}>15 TOPICS · NO REPEATS · UNLOCK SYSTEM · COMBO</div>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(226,240,255,.4)', letterSpacing: 2, marginBottom: 10, textAlign: 'center' }}>
        GET {ROUNDS_TO_UNLOCK}+ CORRECT → AUTO-UNLOCK NEXT TOPIC
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8 }}>
        {TOPICS.map((t, i) => {
          const locked = !unlockedTopics.includes(t.id)
          const isHov  = hov === t.id
          return (
            <button key={t.id}
              onClick={() => !locked && onStart(t.id)}
              onMouseEnter={() => setHov(t.id)} onMouseLeave={() => setHov(null)}
              disabled={locked}
              style={{ background: locked ? 'rgba(255,255,255,.02)' : isHov ? `rgba(${hexToRgb(t.color)},.1)` : `rgba(${hexToRgb(t.color)},.04)`, border: `1px solid ${locked ? 'rgba(255,255,255,.06)' : isHov ? t.color : `rgba(${hexToRgb(t.color)},.3)`}`, borderRadius: 10, padding: '12px 8px', cursor: locked ? 'not-allowed' : 'pointer', transition: 'all .16s', textAlign: 'center', transform: isHov && !locked ? 'translateY(-2px)' : 'none', boxShadow: isHov && !locked ? `0 4px 20px rgba(${hexToRgb(t.color)},.18)` : 'none', opacity: locked ? .45 : 1 }}
            >
              <div style={{ fontSize: 18, marginBottom: 4, filter: !locked && isHov ? `drop-shadow(0 0 6px ${t.color})` : 'none' }}>{locked ? '🔒' : t.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: locked ? 'rgba(226,240,255,.4)' : t.color, letterSpacing: 1, lineHeight: 1.3 }}>{t.name}</div>
              <div style={{ fontSize: 7, color: 'rgba(226,240,255,.3)', marginTop: 3 }}>TOPIC {i+1}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PhaseBadge({ phase, label }) {
  const cfg = { show: ['👁 MEMORIZE','#22d3ee'], recall: ['⚡ RECALL','#fbbf24'], feedback: ['● RESULT','#a78bfa'] }
  const [text, col] = cfg[phase] || cfg.show
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: col, padding: '3px 10px', border: `1px solid ${col}`, borderRadius: 5, background: `rgba(${hexToRgb(col)},.08)`, textShadow: neon(col,.6) }}>{text}</span>
      {label && <span style={{ fontSize: 10, color: 'rgba(226,240,255,.45)' }}>{label}</span>}
    </div>
  )
}

function SequenceMode({ item, phase, playerSeq, setPlayerSeq, onSubmit, color }) {
  const handleClick = (i) => {
    if (phase !== 'recall' || playerSeq.includes(i)) return
    const next = [...playerSeq, i]
    setPlayerSeq(next)
    if (next.length === item.order.length) onSubmit(next)
  }
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(226,240,255,.4)', marginBottom: 12, letterSpacing: 1.5 }}>
        {phase === 'show' ? 'Watch the ORDER carefully...' : 'Tap nodes in the EXACT sequence you saw →'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        {item.nodes.map((n, i) => {
          const sel      = playerSeq.includes(i)
          const showNum  = phase === 'show'
          const orderPos = item.order.indexOf(i)
          return (
            <button key={i} onClick={() => handleClick(i)} disabled={phase !== 'recall' || sel}
              style={{ minWidth: 60, height: 60, maxWidth: '100%', borderRadius: 10, padding: '4px 8px', border: sel ? `2px solid ${color}` : showNum ? `2px solid rgba(${hexToRgb(color)},.5)` : '1px solid rgba(255,255,255,.08)', background: sel ? `rgba(${hexToRgb(color)},.14)` : showNum ? `rgba(${hexToRgb(color)},.08)` : 'rgba(255,255,255,.02)', color: sel ? color : '#e2f0ff', fontFamily: 'inherit', fontSize: 10, fontWeight: 900, cursor: phase === 'recall' && !sel ? 'pointer' : 'default', textShadow: sel ? neon(color,.8) : 'none', transition: 'all .13s', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              {showNum && <div style={{ position: 'absolute', top: 3, left: 5, fontSize: 8, color, opacity: .7 }}>{orderPos >= 0 ? orderPos + 1 : ''}</div>}
              <div style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.3 }}>{n}</div>
              {sel && <div style={{ fontSize: 8, color }}>#{playerSeq.indexOf(i)+1}</div>}
            </button>
          )
        })}
      </div>
      {phase === 'recall' && (
        <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(playerSeq.length/item.order.length)*100}%`, background: `linear-gradient(90deg,${color},#a78bfa)`, transition: 'width .2s', borderRadius: 2 }} />
        </div>
      )}
      {phase === 'show' && (
        <div style={{ marginTop: 10, padding: '7px 12px', background: `rgba(${hexToRgb(color)},.07)`, border: `1px solid rgba(${hexToRgb(color)},.2)`, borderRadius: 8, fontSize: 10, color: 'rgba(226,240,255,.5)' }}>💡 {item.hint}</div>
      )}
    </div>
  )
}

function GridMode({ item, phase, selectedCells, setSelectedCells, onSubmit, color }) {
  const { size, pattern } = item
  const toggle = (i) => {
    if (phase !== 'recall') return
    setSelectedCells(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(226,240,255,.4)', marginBottom: 12, letterSpacing: 1.5 }}>
        {phase === 'show' ? 'Memorize the highlighted cells...' : 'Tap all cells you remember →'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 6, maxWidth: '100%', margin: '0 auto 14px' }}>
        {Array.from({ length: size * size }, (_, i) => {
          const lit = phase === 'show' && pattern.includes(i)
          const sel = selectedCells.includes(i)
          return (
            <button key={i} onClick={() => toggle(i)} disabled={phase !== 'recall'}
              style={{ aspectRatio: '1', borderRadius: 7, border: lit ? `2px solid ${color}` : sel ? `1px solid rgba(${hexToRgb(color)},.6)` : '1px solid rgba(255,255,255,.06)', background: lit ? `rgba(${hexToRgb(color)},.3)` : sel ? `rgba(${hexToRgb(color)},.15)` : 'rgba(255,255,255,.02)', boxShadow: lit ? `0 0 8px rgba(${hexToRgb(color)},.45)` : 'none', cursor: phase === 'recall' ? 'pointer' : 'default', fontSize: 11, color: lit ? color : sel ? `rgba(${hexToRgb(color)},.8)` : 'transparent', fontFamily: 'inherit', transition: 'all .1s' }}
            >{lit ? '●' : sel ? '◆' : ''}</button>
          )
        })}
      </div>
      {phase === 'recall' && (
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => onSubmit(selectedCells)} style={{ background: `rgba(${hexToRgb(color)},.12)`, border: `1px solid ${color}`, color, fontFamily: 'inherit', fontSize: 10, fontWeight: 900, padding: '8px 24px', borderRadius: 8, cursor: 'pointer', letterSpacing: 2, textShadow: neon(color,.5) }}>SUBMIT PATTERN</button>
        </div>
      )}
      {phase === 'show' && (
        <div style={{ marginTop: 10, padding: '7px 12px', background: `rgba(${hexToRgb(color)},.07)`, border: `1px solid rgba(${hexToRgb(color)},.2)`, borderRadius: 8, fontSize: 10, color: 'rgba(226,240,255,.5)' }}>💡 {item.hint}</div>
      )}
    </div>
  )
}

function CodeMode({ item, phase, codeAnswer, setCodeAnswer, onSubmit, color }) {
  const { lines, blankLine } = item
  const pick = (i) => { if (phase !== 'recall') return; setCodeAnswer(i); onSubmit(i) }
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(226,240,255,.4)', marginBottom: 10, letterSpacing: 1.5 }}>
        {phase === 'show' ? 'Read every line carefully...' : `What was line ${blankLine + 1}?`}
      </div>
      <div style={{ background: 'rgba(0,0,0,.55)', border: `1px solid rgba(${hexToRgb(color)},.22)`, borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ background: `rgba(${hexToRgb(color)},.07)`, borderBottom: `1px solid rgba(${hexToRgb(color)},.15)`, padding: '5px 12px', display: 'flex', gap: 5, alignItems: 'center' }}>
          {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c, opacity: .7 }} />)}
          <span style={{ fontSize: 8, color: `rgba(${hexToRgb(color)},.7)`, marginLeft: 4, letterSpacing: 2 }}>{item.label}.js</span>
        </div>
        <div style={{ padding: '10px 0' }}>
          {lines.map((line, i) => {
            const blank = i === blankLine && phase === 'recall'
            const hl    = i === blankLine && phase === 'show'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '2px 12px', background: hl ? `rgba(${hexToRgb(color)},.1)` : 'transparent', borderLeft: hl ? `2px solid ${color}` : '2px solid transparent' }}>
                <span style={{ width: 20, fontSize: 9, color: 'rgba(226,240,255,.2)', textAlign: 'right', marginRight: 10, userSelect: 'none' }}>{i+1}</span>
                {blank
                  ? <span style={{ flex: 1, height: 16, borderRadius: 4, background: `rgba(${hexToRgb(color)},.12)`, border: `1px dashed rgba(${hexToRgb(color)},.4)`, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: 8, color: `rgba(${hexToRgb(color)},.6)`, letterSpacing: 2 }}>??? SELECT BELOW ???</span>
                  : <span style={{ flex: 1, fontSize: 10, fontFamily: 'inherit', color: syntaxColor(line), whiteSpace: 'pre', overflowX: 'auto' }}>{line}</span>
                }
              </div>
            )
          })}
        </div>
      </div>
      {phase === 'recall' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {item.options.map((opt, i) => (
            <button key={i} onClick={() => pick(i)} style={{ background: codeAnswer === i ? `rgba(${hexToRgb(color)},.14)` : 'rgba(255,255,255,.02)', border: `1px solid ${codeAnswer === i ? color : 'rgba(255,255,255,.07)'}`, borderRadius: 8, padding: '9px 12px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: '#e2f0ff', fontSize: 10, whiteSpace: 'pre', transition: 'all .13s' }}>
              <span style={{ color: `rgba(${hexToRgb(color)},.5)`, marginRight: 8, fontSize: 9 }}>[{String.fromCharCode(65+i)}]</span>{opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ResultScreen({ score, roundsPlayed, roundsCorrect, level, topicData, onHome, onReplay, onContinue, onNewGame, unlockedTopics }) {
  const acc        = roundsPlayed ? Math.round((roundsCorrect / roundsPlayed) * 100) : 0
  const grade      = acc >= 90 ? 'S' : acc >= 70 ? 'A' : acc >= 50 ? 'B' : 'C'
  const gc         = { S: '#22d3ee', A: '#a78bfa', B: '#fbbf24', C: '#f87171' }[grade]
  const didUnlock  = roundsCorrect >= ROUNDS_TO_UNLOCK
  const topicIdx   = TOPICS.findIndex(t => t.id === topicData?.id)
  const nextTopic  = TOPICS[topicIdx + 1]
  const nextUnlocked = TOPICS.slice(topicIdx + 1).find(t => unlockedTopics.includes(t.id))
  const color = topicData?.color || '#22d3ee'

  return (
    <div style={{ textAlign: 'center', paddingTop: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(226,240,255,.3)', marginBottom: 10 }}>SESSION COMPLETE</div>
      <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, color: gc, textShadow: neon(gc,2), marginBottom: 2 }}>{grade}</div>
      <div style={{ fontSize: 9, color: 'rgba(226,240,255,.3)', letterSpacing: 3, marginBottom: 20 }}>RANK</div>

      <LowScoreWarning roundsCorrect={roundsCorrect} />

      {didUnlock && nextTopic && (
        <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(34,211,238,.07)', border: '1px solid rgba(34,211,238,.35)', borderRadius: 10, fontSize: 10, color: '#22d3ee', textShadow: neon('#22d3ee',.4) }}>
          🔓 UNLOCKED: {nextTopic.name.toUpperCase()}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8, marginBottom: 12 }}>
        {[['SCORE', score.toString().padStart(6,'0'), '#22d3ee'], ['ACCURACY', `${acc}%`, '#a78bfa'], ['LEVEL', String(level).padStart(2,'0'), '#fbbf24']].map(([l,v,c]) => (
          <div key={l} style={{ background: `rgba(${hexToRgb(c)},.06)`, border: `1px solid rgba(${hexToRgb(c)},.2)`, borderRadius: 10, padding: '10px 8px' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: c, textShadow: neon(c,.5) }}>{v}</div>
            <div style={{ fontSize: 7, color: 'rgba(226,240,255,.3)', letterSpacing: 2, marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18, fontSize: 10, color: 'rgba(226,240,255,.35)' }}>
        {roundsCorrect}/{roundsPlayed} correct · need {ROUNDS_TO_UNLOCK} to unlock next
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {nextUnlocked && (
          <button onClick={() => onContinue(nextUnlocked.id)} style={{ ...actionBtn(nextUnlocked.color, true), border: `2px solid ${nextUnlocked.color}`, boxShadow: `0 0 18px rgba(${hexToRgb(nextUnlocked.color)},.18)` }}>
            ▶▶ CONTINUE → {nextUnlocked.icon} {nextUnlocked.name.toUpperCase()}
          </button>
        )}
        <button onClick={onReplay} style={actionBtn(color, true)}>▶ RETRY SAME TOPIC</button>
        <button onClick={onHome} style={actionBtn('#a78bfa', true)}>◀ TOPIC MAP</button>
      </div>

      {/* New Game — single button, goes straight to NewGameScreen */}
      <button
        onClick={onNewGame}
        style={{ background: 'none', border: '1px solid rgba(248,113,113,.25)', color: 'rgba(248,113,113,.55)', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: '7px 20px', borderRadius: 7, cursor: 'pointer', letterSpacing: 2, width: '100%' }}
      >
        🔄 NEW GAME — Reset all topics
      </button>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function MemoryTrainer() {
  const game = useGame()
  const {
    screen, setScreen, unlockedTopics,
    activeTopic, topicData, currentChallenge,
    phase, score, combo, lives, level, feedback,
    timeLeft, recallTime, roundsPlayed, roundsCorrect,
    playerSeq, setPlayerSeq, selectedCells, setSelectedCells,
    codeAnswer, setCodeAnswer,
    unlockCelebration, dismissCelebration,
    startTopic, submitSequence, submitGrid, submitCode,
    finishGame, newGame,
  } = game

  const color = topicData?.color || '#22d3ee'

  return (
    <div style={S.root}>
      <style>{`
        @keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:.5} }
        * { box-sizing: border-box; }
        button:active { transform: scale(0.96) !important; }
      `}</style>
      <div style={S.scanlines} />
      <div style={S.grid} />
      <FeedbackFlash feedback={feedback} />
      <UnlockCelebration data={unlockCelebration} onDismiss={dismissCelebration} />
      <div style={S.inner}>

        {screen === 'home' && (
          <HomeScreen unlockedTopics={unlockedTopics} onStart={startTopic} />
        )}

        {/* ── NEW: dedicated new-game screen ── */}
        {screen === 'newgame' && (
          <NewGameScreen onStart={startTopic} />
        )}

        {screen === 'playing' && currentChallenge && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color, textShadow: neon(color,.4), fontWeight: 900, letterSpacing: 1 }}>
                {topicData?.icon} {topicData?.name?.toUpperCase()}
              </div>
              <button onClick={finishGame} style={{ fontSize: 8, color: 'rgba(226,240,255,.3)', background: 'none', border: '1px solid rgba(255,255,255,.07)', padding: '3px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 1 }}>
                ✕ END
              </button>
            </div>
            <HUD score={score} lives={lives} combo={combo} level={level} timeLeft={timeLeft} phase={phase} recallTime={recallTime} topicData={topicData} roundsCorrect={roundsCorrect} />
            <PhaseBadge phase={phase} label={currentChallenge.label} />
            {currentChallenge.type === 'sequence' && <SequenceMode item={currentChallenge} phase={phase} playerSeq={playerSeq} setPlayerSeq={setPlayerSeq} onSubmit={submitSequence} color={color} />}
            {currentChallenge.type === 'grid'     && <GridMode item={currentChallenge} phase={phase} selectedCells={selectedCells} setSelectedCells={setSelectedCells} onSubmit={submitGrid} color={color} />}
            {currentChallenge.type === 'code'     && <CodeMode item={currentChallenge} phase={phase} codeAnswer={codeAnswer} setCodeAnswer={setCodeAnswer} onSubmit={submitCode} color={color} />}
          </div>
        )}

        {screen === 'result' && (
          <ResultScreen
            score={score} roundsPlayed={roundsPlayed} roundsCorrect={roundsCorrect}
            level={level} topicData={topicData} unlockedTopics={unlockedTopics}
            onHome={() => setScreen('home')}
            onReplay={() => startTopic(activeTopic)}
            onContinue={(id) => startTopic(id)}
            onNewGame={newGame}
          />
        )}

      </div>
    </div>
  )
}