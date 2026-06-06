import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { createPortal } from 'react-dom';



// ══════════════════════════════════════

// DATA BANKS (QUESTIONS, MISSIONS, BOSSES)

// ══════════════════════════════════════

const QB = [

  {topic:'Arrays',diff:'Easy',q:'Time complexity of binary search?',opts:['O(n)','O(log n)','O(n²)','O(1)'],ans:'O(log n)',exp:'Halves the search space each step — O(log n).'},

  {topic:'Arrays',diff:'Medium',q:'Best comparison-based sort complexity?',opts:['O(n)','O(n log n)','O(n²)','O(log n)'],ans:'O(n log n)',exp:'Comparison-based sorting lower bound is Ω(n log n).'},

  {topic:'Arrays',diff:'Easy',q:'Array index access complexity?',opts:['O(n)','O(log n)','O(1)','O(n²)'],ans:'O(1)',exp:'Contiguous memory allocation allows direct indexing.'},

  {topic:'Linked List',diff:'Easy',q:'Insert at HEAD of linked list?',opts:['O(n)','O(log n)','O(1)','O(n²)'],ans:'O(1)',exp:'Just update head pointer — no list traversal required.'},

  {topic:'Linked List',diff:'Medium',q:'Best cycle detection algorithm?',opts:['BFS','Binary Search',"Floyd's Two Pointer",'Merge Sort'],ans:"Floyd's Two Pointer",exp:'Slow and fast pointers meet in a loop.'},

  {topic:'Linked List',diff:'Hard',q:'LRU Cache best implementation structure?',opts:['Array+Binary Search','HashMap+Doubly LL','Stack+Queue','Heap'],ans:'HashMap+Doubly LL',exp:'HashMap gives O(1) lookup, Doubly LL gives O(1) updates.'},

  {topic:'Stack',diff:'Easy',q:'Stack follows which principle?',opts:['FIFO','LIFO','LILO','Random'],ans:'LIFO',exp:'Last In First Out.'},

  {topic:'Stack',diff:'Easy',q:'Balanced parentheses validation uses?',opts:['Queue','Heap','Stack','Graph'],ans:'Stack',exp:'Push open brackets, pop and match on close brackets.'},

  {topic:'Stack',diff:'Medium',q:'Next Greater Element time complexity?',opts:['O(n²)','O(n log n)','O(n)','O(log n)'],ans:'O(n)',exp:'Monotonic stack processes elements in a single O(n) pass.'},

  {topic:'Queue',diff:'Easy',q:'Queue follows which principle?',opts:['LIFO','FIFO','LILO','Random'],ans:'FIFO',exp:'First In First Out.'},

  {topic:'Queue',diff:'Medium',q:'BFS traversal typically uses?',opts:['Stack','Heap','Queue','Trie'],ans:'Queue',exp:'Level-by-level tracking requires a queue.'},

  {topic:'Trees',diff:'Medium',q:'Height of balanced BST with n nodes?',opts:['O(n)','O(log n)','O(n²)','O(1)'],ans:'O(log n)',exp:'Balanced BST height ≈ log₂(n).'},

  {topic:'Trees',diff:'Easy',q:'Inorder traversal of BST gives?',opts:['Random order','Sorted ascending','Sorted descending','Level order'],ans:'Sorted ascending',exp:'Left subtree < Root < Right subtree yields sorted order.'},

  {topic:'Trees',diff:'Hard',q:'LCA in BST complexity?',opts:['O(n)','O(h) h=height','O(log n) always','O(n log n)'],ans:'O(h) h=height',exp:'Traverses down the height, O(log n) if balanced, O(n) if skewed.'},

  {topic:'Graphs',diff:'Medium',q:'DFS uses which underlying structure?',opts:['Queue','Heap','Stack/recursion','Array'],ans:'Stack/recursion',exp:'Explores deeply, using system call stack or explicit stack.'},

  {topic:'Graphs',diff:'Hard',q:"Dijkstra's shortest path requires?",opts:['No negative weights','No cycles','Directed only','Single source only'],ans:'No negative weights',exp:'Negative edges break greedy step (use Bellman-Ford).'},

  {topic:'Graphs',diff:'Hard',q:'Topological sort is applicable only to?',opts:['Undirected Graphs','Cyclic Graphs','DAGs','Complete Graphs'],ans:'DAGs',exp:'Directed Acyclic Graphs (requires no cycles).'},

  {topic:'DP',diff:'Easy',q:'Memoization in DP means?',opts:['Recursion only','Bottom-up table','Caching subproblems','Greedy choices'],ans:'Caching subproblems',exp:'Top-down technique of storing results to avoid recomputation.'},

  {topic:'DP',diff:'Medium',q:'0/1 Knapsack time complexity?',opts:['O(n)','O(n log n)','O(nW)','O(2ⁿ)'],ans:'O(nW)',exp:'DP table filled with n items and capacity W.'},

  {topic:'DP',diff:'Hard',q:'Edit Distance recurrence relation?',opts:['T[i-1][j-1]','1+min(T[i-1][j],T[i][j-1],T[i-1][j-1])','T[i][j-1]+1','T[i-1][j]+T[i][j-1]'],ans:'1+min(T[i-1][j],T[i][j-1],T[i-1][j-1])',exp:'Min cost of Insertion, Deletion, or Replacement + 1.'},

  {topic:'DP',diff:'Medium',q:'Optimal LIS complexity using binary search?',opts:['O(n²)','O(n log n)','O(n)','O(2ⁿ)'],ans:'O(n log n)',exp:'Patience sorting / active list updates using binary search.'}

];

const MISSIONS = [

  {

    id: 'arrays', icon: '💾', title: 'ARRAY HEIST',

    desc: 'Infiltrate the high-speed contiguous memory vaults.',

    color: '#4f9eff', topic: 'Arrays', reward: 2000,

    tasks: [

      { id: 't1', label: 'Two Sum', pts: 50, diff: 'Easy', topic: 'Arrays' },

      { id: 't2', label: "Kadane's Algorithm", pts: 80, diff: 'Medium', topic: 'Arrays' },

      { id: 't3', label: 'Binary Search', pts: 60, diff: 'Easy', topic: 'Arrays' },

      { id: 't4', label: 'Sliding Window Max', pts: 120, diff: 'Hard', topic: 'Arrays' },

      { id: 't5', label: 'Merge Sorted Arrays', pts: 70, diff: 'Medium', topic: 'Arrays' }

    ]

  },

  {

    id: 'linked', icon: '🔗', title: 'LINKED HUSTLE',

    desc: 'Snake through pointer addresses to bypass firewalls.',

    color: '#22d3a0', topic: 'Linked List', reward: 2500,

    tasks: [

      { id: 't1', label: 'Reverse List', pts: 60, diff: 'Easy', topic: 'Linked List' },

      { id: 't2', label: "Floyd's Cycle", pts: 80, diff: 'Medium', topic: 'Linked List' },

      { id: 't3', label: 'Merge Two Lists', pts: 80, diff: 'Medium', topic: 'Linked List' },

      { id: 't4', label: 'Find Middle', pts: 50, diff: 'Easy', topic: 'Linked List' },

      { id: 't5', label: 'LRU Cache', pts: 150, diff: 'Hard', topic: 'Linked List' }

    ]

  },

  {

    id: 'trees', icon: '🌳', title: 'TREE TERRITORY',

    desc: 'Climb the binary branches and control root networks.',

    color: '#a78bfa', topic: 'Trees', reward: 3000,

    tasks: [

      { id: 't1', label: 'Inorder Iterative', pts: 60, diff: 'Easy', topic: 'Trees' },

      { id: 't2', label: 'Level Order BFS', pts: 80, diff: 'Medium', topic: 'Trees' },

      { id: 't3', label: 'Validate BST', pts: 100, diff: 'Medium', topic: 'Trees' },

      { id: 't4', label: 'LCA of Binary Tree', pts: 120, diff: 'Hard', topic: 'Trees' },

      { id: 't5', label: 'Serialize Tree', pts: 150, diff: 'Hard', topic: 'Trees' }

    ]

  },

  {

    id: 'dp', icon: '👑', title: 'DP EMPIRE',

    desc: 'Memoize your state and maximize overlapping rewards.',

    color: '#f59e0b', topic: 'DP', reward: 5000,

    tasks: [

      { id: 't1', label: 'Fibonacci Memoized', pts: 40, diff: 'Easy', topic: 'DP' },

      { id: 't2', label: 'Coin Change', pts: 100, diff: 'Medium', topic: 'DP' },

      { id: 't3', label: 'LCS (Subsequence)', pts: 120, diff: 'Hard', topic: 'DP' },

      { id: 't4', label: 'Knapsack 0/1', pts: 120, diff: 'Hard', topic: 'DP' },

      { id: 't5', label: 'Edit Distance', pts: 150, diff: 'Hard', topic: 'DP' }

    ]

  }

];

const MISSION_QUESTIONS = {

  'arrays:t1': { q: 'How to optimize Two Sum from O(n²) to O(n)?', opts: ['Sort + binary search', 'Use a Hash Map to store elements & indices', 'Nested loops with pointers', 'Construct a Min-Heap'], ans: 'Use a Hash Map to store elements & indices', exp: 'Hash map lookups are O(1) on average, giving O(n) total time and O(n) space.' },

  'arrays:t2': { q: "What is the core recurrence in Kadane's algorithm?", opts: ['max_so_far = max(a[i], current_max)', 'current_max = max(a[i], current_max + a[i])', 'current_max = current_max + max_so_far', 'max_so_far = current_max + a[i]'], ans: 'current_max = max(a[i], current_max + a[i])', exp: 'At each position, we decide to extend the existing subarray or start a new one.' },

  'arrays:t3': { q: 'Under what condition does Binary Search work correctly?', opts: ['Array must be unsorted', 'Array must be sorted', 'Array must have unique elements', 'Array size must be power of 2'], ans: 'Array must be sorted', exp: 'Binary search splits the range by comparing the target with the middle element.' },

  'arrays:t4': { q: 'Which data structure gives O(n) sliding window maximum?', opts: ['Max-Heap', 'Monotonic Deque', 'Balanced BST', 'Hash Map'], ans: 'Monotonic Deque', exp: 'A deque maintains indices in decreasing order, allowing O(1) max queries per slide.' },

  'arrays:t5': { q: 'How to merge two sorted arrays in-place with O(1) space?', opts: ['Concatenate and sort', 'Three pointer method from the end', 'Insert one by one and shift', 'Binary search and swap'], ans: 'Three pointer method from the end', exp: 'Starting from the end prevents overwriting unmerged values.' },

  'linked:t1': { q: 'To reverse a singly linked list in O(n) time, O(1) space, you need?', opts: ['prev, curr, next', 'head, tail', 'slow, fast', 'root, child'], ans: 'prev, curr, next', exp: 'Three pointers track the previous, current, and next elements to rewrite links.' },

  'linked:t2': { q: "After Floyd's algorithm detects a cycle, how do you find the start?", opts: ['Move both at speed 1 from meet point', 'Reset slow to head, move both at speed 1 until they meet', 'Reset fast to head, move slow faster', 'Traversal from tail'], ans: 'Reset slow to head, move both at speed 1 until they meet', exp: 'The pointer offsets guarantee they meet exactly at the cycle start node.' },

  'linked:t3': { q: 'Best practice to merge two sorted lists avoiding edge cases?', opts: ['Use a temporary array', 'Use a dummy node as head', 'Pre-pend null pointers', 'Check length recursively'], ans: 'Use a dummy node as head', exp: 'A dummy node provides a concrete start pointer without special-casing the first element.' },

  'linked:t4': { q: 'How to find the middle of a linked list in a single pass?', opts: ['Count size and loop to size/2', 'Use slow (1 step) and fast (2 steps) pointers', 'Recursion with depth tracking', 'Binary search pointers'], ans: 'Use slow (1 step) and fast (2 steps) pointers', exp: 'When fast reaches the end, slow is exactly at the middle.' },

  'linked:t5': { q: 'Why does LRU Cache require BOTH a Hash Map and a Doubly Linked List?', opts: ['Doubly LL for O(1) get, Map for updates', 'Map for O(1) lookup, Doubly LL for O(1) node deletion/insertion', 'To sort elements on access', 'Stack properties'], ans: 'Map for O(1) lookup, Doubly LL for O(1) node deletion/insertion', exp: 'The map connects keys to nodes instantly; the doubly linked list handles constant-time order updates.' },

  'trees:t1': { q: 'How is iterative Inorder traversal implemented without recursion?', opts: ['Queue', 'Stack', 'Min-Heap', 'Hash Map'], ans: 'Stack', exp: 'We use an explicit stack to simulate the recursive call stack, pushing left children until null.' },

  'trees:t2': { q: 'Space complexity for level-order BFS of a balanced binary tree?', opts: ['O(log n)', 'O(1)', 'O(n) — max leaf nodes', 'O(n²)'], ans: 'O(n) — max leaf nodes', exp: 'For a balanced tree, the last level contains n/2 nodes, all loaded into the queue at once.' },

  'trees:t3': { q: 'What makes a binary tree a valid BST?', opts: ['Every node has exactly 2 children', 'Left child < Node < Right child for all subtrees', 'Inorder is descending', 'Height is O(log n)'], ans: 'Left child < Node < Right child for all subtrees', exp: 'A valid BST requires all keys in left subtree smaller, all keys in right subtree larger — recursively.' },

  'trees:t4': { q: 'In LCA recursion, when do you return a node?', opts: ['Only at leaf nodes', 'When node equals p or q, or p and q found in separate subtrees', 'When node is null', 'At maximum depth'], ans: 'When node equals p or q, or p and q found in separate subtrees', exp: 'If we find p or q, return it. Non-null returns from both sides means current node is their LCA.' },

  'trees:t5': { q: 'Which traversal best serializes/deserializes a binary tree?', opts: ['Inorder only', 'Preorder or Postorder with null markers', 'Random order', 'BFS level order only'], ans: 'Preorder or Postorder with null markers', exp: 'Root first (preorder) with null markers allows unique reconstruction.' },

  'dp:t1': { q: 'Difference between Top-down and Bottom-up DP?', opts: ['Top-down uses tables, Bottom-up uses memoization', 'Top-down is recursive with memoization, Bottom-up is iterative with tables', 'Top-down is always slower', 'Bottom-up uses call stack'], ans: 'Top-down is recursive with memoization, Bottom-up is iterative with tables', exp: 'Top-down computes lazily via recursion + caching; bottom-up solves all subproblems first in a grid.' },

  'dp:t2': { q: 'Recurrence for Coin Change (min coins to make total T)?', opts: ['dp[i] = min(dp[i], dp[i-coin] + 1)', 'dp[i] = dp[i-1] + dp[i-2]', 'dp[i] = max(dp[i], dp[i-coin])', 'dp[i] = dp[i] + 1'], ans: 'dp[i] = min(dp[i], dp[i-coin] + 1)', exp: 'Min coins = minimum of current or choosing the coin and adding 1 for the remainder.' },

  'dp:t3': { q: 'In LCS of A & B, if A[i] === B[j], what is dp[i][j]?', opts: ['dp[i-1][j] + dp[i][j-1]', 'dp[i-1][j-1] + 1', 'max(dp[i-1][j], dp[i][j-1])', '0'], ans: 'dp[i-1][j-1] + 1', exp: 'If characters match, they extend the LCS of the prefixes by 1.' },

  'dp:t4': { q: 'Why does DP solve 0/1 Knapsack but not Fractional optimally?', opts: ['Fractional requires sorting', '0/1 has discrete binary choices without greedy structure; Fractional has a greedy choice property', 'DP handles floats better', 'Wasted computations'], ans: '0/1 has discrete binary choices without greedy structure; Fractional has a greedy choice property', exp: 'For Fractional Knapsack, sorting by value-to-weight ratio gives the global optimum immediately.' },

  'dp:t5': { q: 'In Edit Distance, what does dp[i-1][j-1] represent when chars differ?', opts: ['Insertion', 'Deletion', 'Replacement/substitution', 'No change'], ans: 'Replacement/substitution', exp: 'Substituting a character moves diagonally from (i-1, j-1), changing both string prefixes.' }

};

const BOSSES = [

  {

    id: 'b1', icon: '🐙', title: 'ARRAY CARTEL', color: '#f43f5e', hp: 3, reward: 5000,

    taunt: ['YOUR ARRAYS ARE UNSORTED, WORM.', 'O(n²) WEAKLING!', 'SEGFAULT INCOMING!'],

    qs: [

      { q: 'Best data structure for O(1) average lookup and insertion?', opts: ['Array', 'Linked List', 'Hash Map', 'BST'], ans: 'Hash Map', exp: 'Hash maps use hash tables to map keys to slots, giving constant-time search on average.' },

      { q: 'Average and worst case time complexity of QuickSort?', opts: ['O(n) avg, O(n log n) worst', 'O(n log n) avg, O(n²) worst', 'O(n log n) both', 'O(n²) both'], ans: 'O(n log n) avg, O(n²) worst', exp: 'QuickSort average is O(n log n) but O(n²) with sorted input and bad pivot.' },

      { q: 'Dutch National Flag algorithm uses how many pointers?', opts: ['1', '2', '3', '4'], ans: '3', exp: 'It uses low, mid, and high pointers to partition elements into three zones.' }

    ]

  },

  {

    id: 'b2', icon: '🕷️', title: 'GRAPH MAFIA', color: '#8b5cf6', hp: 3, reward: 8000,

    taunt: ['YOUR TRAVERSALS ARE CYCLIC AND BROKEN.', 'NULL POINTER EXCEPTION!', 'GRAPH COLORING? YOU CANT EVEN COLOR WITHIN THE LINES!'],

    qs: [

      { q: 'Shortest path in unweighted graph in O(V + E)?', opts: ['DFS', 'Dijkstra', 'BFS', 'Bellman-Ford'], ans: 'BFS', exp: 'BFS visits nodes layer by layer, guaranteeing shortest path in unweighted graphs.' },

      { q: 'Which operation combines two disjoint sets in Union-Find (DSU)?', opts: ['Find-Set', 'Union-Set', 'Path Compression', 'Min-Cut'], ans: 'Union-Set', exp: 'Union combines sets. Path compression is an optimization during Find-Set.' },

      { q: "Why does Bellman-Ford run in O(V*E) vs Dijkstra's O((V+E) log V)?", opts: ['Processes edges randomly', 'Relaxes all edges V-1 times to handle negative cycles', 'Uses recursion', 'Converts graph to tree'], ans: 'Relaxes all edges V-1 times to handle negative cycles', exp: 'To handle negative edge weights, Bellman-Ford relaxes all edges V-1 times systematically.' }

    ]

  },

  {

    id: 'b3', icon: '🐉', title: 'DP SYNDICATE', color: '#ec4899', hp: 3, reward: 15000,

    taunt: ['YOUR RECURSION STACK OVERFLOWS LIKE YOUR LIFE.', 'NO MEMOIZATION? AMATEUR.', 'DP? MORE LIKE DEAD PROGRAMMER!'],

    qs: [

      { q: 'Top-down DP uses which method?', opts: ['Iteration and tabular loops', 'Recursion and memoization table', 'Greedy choices', 'Queue-based BFS'], ans: 'Recursion and memoization table', exp: 'Recursive calls explore paths, storing answers in a table to prevent recomputation.' },

      { q: 'Space-optimized Fibonacci needs how much auxiliary space?', opts: ['O(n) array', 'O(log n) stack', 'O(1) two variables', 'O(n²) matrix'], ans: 'O(1) two variables', exp: 'Only the previous two values are needed to determine the next Fibonacci number.' },

      { q: 'Longest Palindromic Subsequence of S equals LCS of?', opts: ['S and its sorted version', 'S and its reverse', 'S and its substrings', 'S and its subsequences'], ans: 'S and its reverse', exp: 'LPS of S equals LCS(S, reverse(S)).' }

    ]

  }

];



// ══ MEMORY TRAINER DATA ══

const MEMORY_SEQUENCES = [

  { level: 1, type: 'grid', size: 3, flashCount: 3, flashMs: 800, label: 'BOOT SEQUENCE' },

  { level: 2, type: 'grid', size: 3, flashCount: 4, flashMs: 700, label: 'LINK PROTOCOL' },

  { level: 3, type: 'grid', size: 4, flashCount: 4, flashMs: 650, label: 'HEAP SCAN' },

  { level: 4, type: 'grid', size: 4, flashCount: 5, flashMs: 550, label: 'STACK TRACE' },

  { level: 5, type: 'grid', size: 4, flashCount: 6, flashMs: 500, label: 'GRAPH TRAVERSE' },

  { level: 6, type: 'grid', size: 5, flashCount: 6, flashMs: 450, label: 'TREE DECODE' },

  { level: 7, type: 'grid', size: 5, flashCount: 7, flashMs: 400, label: 'DP CACHE BURST' },

  { level: 8, type: 'grid', size: 5, flashCount: 8, flashMs: 350, label: 'NEURAL OVERLOAD' },

];

const CODE_SNIPPETS = [

  { code: 'O(log n)', label: 'Binary Search complexity' },

  { code: 'O(n log n)', label: 'Merge Sort complexity' },

  { code: 'prev→curr→next', label: 'Linked List reversal' },

  { code: 'dp[i]=dp[i-1]+dp[i-2]', label: 'Fibonacci recurrence' },

  { code: 'slow/fast ptrs', label: "Floyd's cycle detect" },

  { code: 'stack.push/pop', label: 'DFS implementation' },

  { code: 'queue.enqueue', label: 'BFS implementation' },

  { code: 'left<node<right', label: 'BST property' },

];



const LANES = 4;

const EC = ['#ff3355', '#ff9900', '#cc44ff', '#ff6622', '#00ccff', '#ff1493', '#ffee00'];



function getDimensions() {

  const CW = window.innerWidth;

  const CH = window.innerHeight;

  const RW = Math.min(CW * 0.72, 380);

  const RX = (CW - RW) / 2;

  const LW = RW / LANES;

  const CRW = Math.min(42, LW * 0.65);

  const CRH = Math.min(72, LW * 0.95);

  const OW = CRW - 4;

  const OH = CRH - 12;

  return { CW, CH, RW, RX, LW, CRW, CRH, OW, OH };

}

function laneX(l) {

  const { RX, LW, CRW } = getDimensions();

  return RX + l * LW + (LW - CRW) / 2;

}



// ══════════════════════════════════════

// MEMORY TRAINER COMPONENT

// ══════════════════════════════════════

function MemoryTrainer({ onEarnCash, playSfx }) {

  // phase: 'menu' | 'flashing' | 'recall' | 'result' | 'gameover'

  const [mtPhase, setMtPhase] = useState('menu');

  const [level, setLevel] = useState(0);

  const [score, setScore] = useState(0);

  const [combo, setCombo] = useState(0);

  const [multiplier, setMultiplier] = useState(1);

  const [highScore, setHighScore] = useState(() => {

    try { return +localStorage.getItem('dsa_mt_hs') || 0; } catch { return 0; }

  });

  const [lives, setLives] = useState(3);

  const [activeGrid, setActiveGrid] = useState([]);   // indices that are "lit" for flash

  const [playerGrid, setPlayerGrid] = useState([]);   // indices the player has clicked

  const [flashPhase, setFlashPhase] = useState('waiting'); // 'showing' | 'waiting' | 'input'

  const [flashIdx, setFlashIdx] = useState(-1);         // which cell is currently lit during flash

  const [timeLeft, setTimeLeft] = useState(10);

  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', text: string }

  const [streakFire, setStreakFire] = useState(false);

  const timerRef = useRef(null);

  const flashTimerRef = useRef(null);



  const cfg = useMemo(() => MEMORY_SEQUENCES[Math.min(level, MEMORY_SEQUENCES.length - 1)], [level]);

  const gridTotal = useMemo(() => cfg.size * cfg.size, [cfg]);



  const saveHs = useCallback((s) => {

    try { localStorage.setItem('dsa_mt_hs', s); } catch {}

  }, []);



  const generateTarget = useCallback((cfg) => {

    const total = cfg.size * cfg.size;

    const indices = [];

    while (indices.length < cfg.flashCount) {

      const r = Math.floor(Math.random() * total);

      if (!indices.includes(r)) indices.push(r);

    }

    return indices.sort((a, b) => a - b);

  }, []);



  const startLevel = useCallback(() => {

    clearTimeout(flashTimerRef.current);

    clearInterval(timerRef.current);

    const target = generateTarget(cfg);

    setActiveGrid(target);

    setPlayerGrid([]);

    setFlashIdx(-1);

    setFlashPhase('showing');

    setFeedback(null);



    // Flash each cell one by one, then ALL at once, then wait for player

    let step = 0;

    const flashNext = () => {

      if (step < target.length) {

        setFlashIdx(target[step]);

        step++;

        flashTimerRef.current = setTimeout(flashNext, cfg.flashMs);

      } else {

        // Brief gap then all lit simultaneously

        setFlashIdx(-2); // -2 = show all simultaneously

        flashTimerRef.current = setTimeout(() => {

          setFlashIdx(-1);

          setFlashPhase('input');

          setMtPhase('recall');

          // Start countdown timer

          setTimeLeft(Math.max(5, cfg.flashCount * 2));

          timerRef.current = setInterval(() => {

            setTimeLeft(t => {

              if (t <= 1) {

                clearInterval(timerRef.current);

                handleTimeOut();

                return 0;

              }

              return t - 1;

            });

          }, 1000);

        }, cfg.flashMs * 1.5);

      }

    };

    setMtPhase('flashing');

    flashTimerRef.current = setTimeout(flashNext, 400);

  }, [cfg, generateTarget]);



  const handleTimeOut = useCallback(() => {

    setFeedback({ type: 'wrong', text: 'TIME EXPIRED — SYSTEM BREACH!' });

    setCombo(0); setMultiplier(1); setStreakFire(false);

    setLives(l => {

      const next = l - 1;

      if (next <= 0) { setMtPhase('gameover'); } else { setMtPhase('result'); }

      return next;

    });

  }, []);



  const handleCellClick = useCallback((idx) => {

    if (mtPhase !== 'recall' || flashPhase !== 'input') return;

    if (playerGrid.includes(idx)) return;

    const newGrid = [...playerGrid, idx];

    setPlayerGrid(newGrid);



    if (!activeGrid.includes(idx)) {

      // Wrong cell clicked

      clearInterval(timerRef.current);

      playSfx('wrong');

      setFeedback({ type: 'wrong', text: `WRONG CELL! Grid was: [${activeGrid.map(i => String.fromCharCode(65 + Math.floor(i / cfg.size)) + (i % cfg.size + 1)).join(', ')}]` });

      setCombo(0); setMultiplier(1); setStreakFire(false);

      setLives(l => {

        const next = l - 1;

        if (next <= 0) { setMtPhase('gameover'); } else { setMtPhase('result'); }

        return next;

      });

      return;

    }



    if (newGrid.length === activeGrid.length) {

      // All correct cells selected!

      clearInterval(timerRef.current);

      playSfx('correct');

      const newCombo = combo + 1;

      const newMult = Math.min(8, 1 + Math.floor(newCombo / 2));

      const basePoints = (level + 1) * 100;

      const earned = basePoints * newMult;

      setCombo(newCombo);

      setMultiplier(newMult);

      if (newCombo >= 3) { setStreakFire(true); playSfx('cash'); }

      setScore(s => {

        const ns = s + earned;

        if (ns > highScore) { setHighScore(ns); saveHs(ns); }

        return ns;

      });

      onEarnCash(earned);

      setFeedback({ type: 'correct', text: `+${earned} CREDITS${newMult > 1 ? ` × ${newMult} COMBO!` : ''}` });

      setMtPhase('result');

    }

  }, [mtPhase, flashPhase, playerGrid, activeGrid, combo, level, highScore, cfg, playSfx, onEarnCash, saveHs]);



  const nextLevel = useCallback(() => {

    setLevel(l => Math.min(l + 1, MEMORY_SEQUENCES.length - 1));

    setFeedback(null);

  }, []);



  useEffect(() => {

    if (mtPhase === 'result') {

      // auto-advance after 1.8s

      const t = setTimeout(() => {

        if (lives > 0) { nextLevel(); startLevel(); }

      }, 1800);

      return () => clearTimeout(t);

    }

  }, [mtPhase, lives]);



  useEffect(() => {

    if (mtPhase !== 'menu') startLevel();

    return () => { clearTimeout(flashTimerRef.current); clearInterval(timerRef.current); };

  }, [level]);



  const resetGame = useCallback(() => {

    clearTimeout(flashTimerRef.current);

    clearInterval(timerRef.current);

    setLevel(0); setScore(0); setCombo(0); setMultiplier(1);

    setLives(3); setStreakFire(false); setFeedback(null);

    setActiveGrid([]); setPlayerGrid([]); setFlashIdx(-1);

    setMtPhase('menu');

  }, []);



  const currentCfg = cfg;



  if (mtPhase === 'menu') {

    return (

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:20,animation:'tab-enter 0.3s ease-out'}}>

        <div style={{textAlign:'center'}}>

          <div style={{fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:900,color:'var(--neon-cyan)',letterSpacing:'3px',textShadow:'0 0 20px rgba(0,229,255,0.6)'}}>NEURAL CIPHER</div>

          <div style={{fontSize:'10px',color:'rgba(0,229,255,0.5)',letterSpacing:'4px',marginTop:4}}>MEMORY HACKING SYSTEM</div>

        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,width:'100%',maxWidth:320}}>

          {[

            { icon:'⚡', label:'FLASH GRID', desc:'Cells flash — memorize the pattern' },

            { icon:'🔗', label:'COMBO CHAIN', desc:'Consecutive hits = score multiplier' },

            { icon:'⏱', label:'TIME PRESSURE', desc:'Countdown — faster recall = more credits' },

            { icon:'💀', label:'3 LIVES', desc:'Wrong click or timeout = lose a life' },

          ].map(f => (

            <div key={f.label} style={{background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:8,padding:'10px 12px'}}>

              <div style={{fontSize:18,marginBottom:4}}>{f.icon}</div>

              <div style={{fontSize:'10px',fontFamily:'var(--font-display)',color:'var(--neon-cyan)',fontWeight:700,marginBottom:3}}>{f.label}</div>

              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',lineHeight:1.4}}>{f.desc}</div>

            </div>

          ))}

        </div>

        {highScore > 0 && <div style={{fontSize:'11px',color:'var(--neon-orange)',fontFamily:'var(--font-display)'}}>BEST: {highScore.toLocaleString()} CREDITS</div>}

        <button className="m-btn" style={{maxWidth:260,background:'linear-gradient(135deg,rgba(0,229,255,0.2),rgba(0,229,255,0.05))',border:'2px solid var(--neon-cyan)',color:'var(--neon-cyan)'}}

          onClick={() => { setMtPhase('start'); startLevel(); }}>

          ► INITIATE HACK

        </button>

      </div>

    );

  }



  if (mtPhase === 'gameover') {

    return (

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16,animation:'tab-enter 0.3s ease-out'}}>

        <div style={{fontFamily:'var(--font-display)',fontSize:'28px',fontWeight:900,color:'var(--neon-pink)',letterSpacing:'4px',textShadow:'0 0 30px rgba(244,63,94,0.8)'}}>MEMORY WIPED</div>

        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',letterSpacing:'2px'}}>NEURAL LINK SEVERED</div>

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'18px 28px',textAlign:'center',minWidth:220}}>

          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.35)',letterSpacing:'2px',marginBottom:6}}>FINAL CREDITS</div>

          <div style={{fontFamily:'var(--font-display)',fontSize:'28px',fontWeight:900,color:'var(--neon-cyan)'}}>{score.toLocaleString()}</div>

          {score >= highScore && <div style={{fontSize:'10px',color:'var(--neon-orange)',marginTop:6,fontWeight:700}}>★ NEW HIGH SCORE!</div>}

          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',marginTop:4}}>Level Reached: {level + 1} — {currentCfg.label}</div>

        </div>

        <button className="m-btn" style={{maxWidth:240,background:'rgba(0,229,255,0.08)',border:'2px solid var(--neon-cyan)',color:'var(--neon-cyan)'}} onClick={resetGame}>↺ REBOOT SYSTEM</button>

      </div>

    );

  }



  const isAllFlash = flashIdx === -2;

  const gridCells = Array.from({ length: gridTotal }, (_, i) => {

    const isTarget = activeGrid.includes(i);

    const isActive = (mtPhase === 'flashing' && (flashIdx === i || isAllFlash)) && isTarget;

    const isSelected = playerGrid.includes(i);

    const isCorrectSelected = isSelected && isTarget;

    const isWrongSelected = isSelected && !isTarget;

    return { i, isActive, isTarget, isSelected, isCorrectSelected, isWrongSelected };

  });



  return (

    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,height:'100%',paddingTop:8}}>

      {/* HUD */}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:360,gap:8}}>

        <div style={{display:'flex',gap:6}}>

          {Array.from({length:3}).map((_,i) => (

            <span key={i} style={{fontSize:16,opacity:i < lives ? 1 : 0.15,filter:i < lives ? 'none':'grayscale(1)',transition:'all 0.3s'}}>💀</span>

          ))}

        </div>

        <div style={{fontFamily:'var(--font-display)',fontSize:'11px',color:'var(--neon-cyan)',letterSpacing:'1px'}}>LVL {level+1} · {currentCfg.label}</div>

        <div style={{textAlign:'right'}}>

          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>CREDITS</div>

          <div style={{fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:700,color:'var(--neon-orange)'}}>{score.toLocaleString()}</div>

        </div>

      </div>



      {/* Combo bar */}

      {combo > 0 && (

        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:6,padding:'4px 12px'}}>

          <span style={{fontSize:streakFire?16:12,transition:'font-size 0.2s'}}>{streakFire ? '🔥' : '⚡'}</span>

          <span style={{fontFamily:'var(--font-display)',fontSize:'11px',color:'var(--neon-orange)',fontWeight:700}}>COMBO ×{multiplier}</span>

          <span style={{fontSize:'10px',color:'rgba(255,180,0,0.5)'}}>{combo} chain</span>

        </div>

      )}



      {/* Phase label */}

      <div style={{fontSize:'10px',letterSpacing:'3px',fontFamily:'var(--font-display)',

        color: mtPhase==='flashing' ? 'var(--neon-cyan)' : mtPhase==='recall' ? 'var(--neon-orange)' : 'var(--neon-green)',

        textShadow: mtPhase==='flashing' ? '0 0 10px rgba(0,229,255,0.8)' : 'none',

        transition:'color 0.3s'}}>

        {mtPhase === 'flashing' ? '◉ MEMORIZE PATTERN' : mtPhase === 'recall' ? `◉ RECALL — ${timeLeft}s` : feedback?.type === 'correct' ? '✓ CORRECT' : '✗ WRONG'}

      </div>



      {/* Grid */}

      <div style={{

        display:'grid',

        gridTemplateColumns:`repeat(${currentCfg.size}, 1fr)`,

        gap: currentCfg.size >= 5 ? 5 : 7,

        padding: 12,

        background:'rgba(0,0,0,0.4)',

        border:'1px solid rgba(0,229,255,0.12)',

        borderRadius:12,

      }}>

        {gridCells.map(({ i, isActive, isTarget, isSelected, isCorrectSelected, isWrongSelected }) => {

          const showReveal = mtPhase === 'result' || mtPhase === 'gameover';

          let bg = 'rgba(0,229,255,0.04)';

          let border = '1px solid rgba(0,229,255,0.12)';

          let shadow = 'none';

          if (isActive) { bg = 'rgba(0,229,255,0.85)'; border = '1px solid #00e5ff'; shadow = '0 0 18px rgba(0,229,255,0.9)'; }

          else if (isCorrectSelected) { bg = 'rgba(34,211,160,0.6)'; border = '1px solid #22d3a0'; shadow = '0 0 12px rgba(34,211,160,0.7)'; }

          else if (isWrongSelected) { bg = 'rgba(244,63,94,0.7)'; border = '1px solid #f43f5e'; shadow = '0 0 12px rgba(244,63,94,0.8)'; }

          else if (showReveal && isTarget && !isCorrectSelected) { bg = 'rgba(245,158,11,0.4)'; border = '1px solid #f59e0b'; }

          const cellSize = currentCfg.size >= 5 ? 44 : 54;

          return (

            <div key={i}

              onClick={() => handleCellClick(i)}

              style={{

                width:cellSize, height:cellSize,

                background:bg, border, borderRadius:6,

                cursor: mtPhase === 'recall' ? 'pointer' : 'default',

                transition:'background 0.12s, box-shadow 0.12s, transform 0.1s',

                boxShadow:shadow,

                transform: isActive ? 'scale(1.08)' : isCorrectSelected ? 'scale(1.04)' : 'scale(1)',

                display:'flex', alignItems:'center', justifyContent:'center',

                fontSize:10, color:'rgba(255,255,255,0.2)',

                fontFamily:'var(--font-display)', fontWeight:700,

              }}

            >

              {isActive || (showReveal && isTarget) ? '◈' : ''}

            </div>

          );

        })}

      </div>



      {/* Feedback */}

      {feedback && (

        <div style={{

          padding:'8px 18px', borderRadius:8, fontSize:'12px', fontWeight:700, textAlign:'center',

          fontFamily:'var(--font-display)', letterSpacing:'1px',

          background: feedback.type === 'correct' ? 'rgba(34,211,160,0.12)' : 'rgba(244,63,94,0.12)',

          border: `1px solid ${feedback.type === 'correct' ? 'rgba(34,211,160,0.4)' : 'rgba(244,63,94,0.4)'}`,

          color: feedback.type === 'correct' ? 'var(--neon-green)' : 'var(--neon-pink)',

          maxWidth:320, animation:'modal-enter 0.2s ease-out',

        }}>

          {feedback.text}

        </div>

      )}



      {mtPhase === 'result' && lives > 0 && (

        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',animation:'tab-enter 0.3s ease-out'}}>

          LOADING NEXT SEQUENCE...

        </div>

      )}

    </div>

  );

}



// ══════════════════════════════════════

// BOSS BATTLE COMPONENT — Full screen combat UI

// ══════════════════════════════════════

function BossBattle({ boss, playerHp, playerMaxHp, onDamagePlayer, onBossDefeated, onExit, playSfx, triggerNarrator }) {

  // Self-contained state machine: intro → combat → question → damage_anim → victory/defeat

  const [phase, setPhase] = useState('intro'); // intro|combat|question|player_hit|boss_hit|victory|defeat

  const [bossHp, setBossHp] = useState(boss.hp);

  const [bossHpMax] = useState(boss.hp);

  const [currentQ, setCurrentQ] = useState(null);

  const [qIdx, setQIdx] = useState(0);

  const [selectedOpt, setSelectedOpt] = useState(null);

  const [result, setResult] = useState(null); // null | {correct, exp, reward}

  const [bossFlash, setBossFlash] = useState(false);

  const [playerFlash, setPlayerFlash] = useState(false);

  const [tauntText, setTauntText] = useState('');

  const [showTaunt, setShowTaunt] = useState(false);

  const [attackAnim, setAttackAnim] = useState(false);

  const [shakePlayer, setShakePlayer] = useState(false);

  const [localPlayerHp, setLocalPlayerHp] = useState(playerHp);

  const [internalQIdx, setInternalQIdx] = useState(0);

  const introTimerRef = useRef(null);

  const tauntTimerRef = useRef(null);



  const showBossTaunt = useCallback((text, duration = 2200) => {

    if (tauntTimerRef.current) clearTimeout(tauntTimerRef.current);

    setTauntText(text);

    setShowTaunt(true);

    tauntTimerRef.current = setTimeout(() => setShowTaunt(false), duration);

  }, []);



  // Intro sequence

  useEffect(() => {

    if (phase !== 'intro') return;

    playSfx('boss');

    showBossTaunt(boss.taunt[0] || `FACE ME, CODER!`, 2000);

    introTimerRef.current = setTimeout(() => {

      setPhase('combat');

    }, 2400);

    return () => clearTimeout(introTimerRef.current);

  }, [phase]);



  // Trigger next question when entering combat

  useEffect(() => {

    if (phase !== 'combat') return;

    const t = setTimeout(() => {

      const q = boss.qs[internalQIdx % boss.qs.length];

      setCurrentQ(q);

      setSelectedOpt(null);

      setResult(null);

      setPhase('question');

      showBossTaunt(boss.taunt[internalQIdx % boss.taunt.length] || 'ANSWER IF YOU DARE!', 1800);

    }, 600);

    return () => clearTimeout(t);

  }, [phase, internalQIdx]);



  const handleAnswer = useCallback((opt) => {

    if (selectedOpt !== null || phase !== 'question') return;

    setSelectedOpt(opt);

    const isCorrect = opt === currentQ.ans;



    if (isCorrect) {

      playSfx('correct');

      const nextBossHp = bossHp - 1;

      setBossFlash(true);

      setTimeout(() => setBossFlash(false), 600);

      setAttackAnim(true);

      setTimeout(() => setAttackAnim(false), 500);



      if (nextBossHp <= 0) {

        setBossHp(0);

        playSfx('trophy');

        triggerNarrator(`${boss.title} TERMINATED!`, 3000);

        setResult({ correct: true, exp: currentQ.exp, reward: `+$${boss.reward.toLocaleString()} REWARD UNLOCKED!` });

        setTimeout(() => setPhase('victory'), 1400);

      } else {

        setBossHp(nextBossHp);

        setResult({ correct: true, exp: currentQ.exp, reward: 'CRITICAL DAMAGE! Boss shields collapsing!' });

        setTimeout(() => {

          setPhase('combat');

          setInternalQIdx(i => i + 1);

        }, 1600);

      }

    } else {

      playSfx('wrong');

      setShakePlayer(true);

      setPlayerFlash(true);

      setTimeout(() => { setShakePlayer(false); setPlayerFlash(false); }, 700);

      const dmg = 25;

      const nextPHp = Math.max(0, localPlayerHp - dmg);

      setLocalPlayerHp(nextPHp);

      onDamagePlayer(dmg);

      triggerNarrator('BOSS COUNTERED — HULL BREACH!', 2000);

      showBossTaunt('HAHAHA! WRONG ANSWER, FOOL!', 2000);

      setResult({ correct: false, exp: currentQ.exp });



      if (nextPHp <= 0) {

        setTimeout(() => setPhase('defeat'), 1200);

      } else {

        setTimeout(() => {

          setPhase('combat');

          setInternalQIdx(i => i + 1);

        }, 1800);

      }

    }

  }, [selectedOpt, phase, currentQ, bossHp, localPlayerHp, boss, playSfx, triggerNarrator, onDamagePlayer, showBossTaunt]);



  useEffect(() => {

    if (phase === 'victory') onBossDefeated(boss);

  }, [phase]);



  const bossHpPct = (bossHp / bossHpMax) * 100;

  const playerHpPct = (localPlayerHp / playerMaxHp) * 100;



  return (

    <div style={{

      position:'absolute',inset:0,background:'#020008',

      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',

      overflow:'hidden',zIndex:50,

      animation: phase === 'intro' ? 'boss-intro 0.5s ease-out' : 'none',

    }}>

      <style>{`

        @keyframes boss-intro { 0%{opacity:0;transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }

        @keyframes boss-flash { 0%,100%{opacity:1} 25%,75%{opacity:0.2;filter:brightness(5) saturate(0)} }

        @keyframes player-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }

        @keyframes atk-beam { 0%{width:0;opacity:1} 100%{width:100%;opacity:0} }

        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.8);opacity:0} }

        @keyframes taunt-in { 0%{transform:translateX(120%) skewX(-8deg);opacity:0} 70%{transform:translateX(-8px) skewX(-4deg)} 100%{transform:translateX(0) skewX(-3deg);opacity:1} }

        @keyframes result-pop { 0%{transform:scale(0.7) translateY(10px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }

        @keyframes victory-glow { 0%,100%{text-shadow:0 0 20px #22d3a0} 50%{text-shadow:0 0 60px #22d3a0, 0 0 100px #22d3a0} }

        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }

      `}</style>



      {/* Scanline overlay */}

      <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:100}}>

        <div style={{position:'absolute',left:0,right:0,height:'2px',background:'rgba(244,63,94,0.08)',animation:'scanline 4s linear infinite'}}/>

        <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0px,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 4px)',pointerEvents:'none'}}/>

      </div>



      {/* Top: Boss health bar */}

      <div style={{width:'100%',padding:'12px 16px 0',position:'relative',zIndex:5}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>

          <div style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:900,color:boss.color,letterSpacing:'1.5px',textShadow:`0 0 12px ${boss.color}`}}>

            {boss.icon} {boss.title}

          </div>

          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-display)'}}>

            HP: {bossHp} / {bossHpMax}

          </div>

        </div>

        <div style={{height:10,background:'rgba(255,255,255,0.07)',borderRadius:5,overflow:'hidden',boxShadow:`0 0 8px ${boss.color}40`}}>

          <div style={{

            height:'100%',

            width:`${bossHpPct}%`,

            background:`linear-gradient(90deg, ${boss.color}, ${boss.color}aa)`,

            transition:'width 0.5s cubic-bezier(0.22,1,0.36,1)',

            boxShadow:`0 0 10px ${boss.color}`,

            borderRadius:5,

          }}/>

        </div>

      </div>



      {/* Boss arena */}

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'100%',padding:'8px 16px',position:'relative'}}>



        {/* Attack beam */}

        {attackAnim && (

          <div style={{position:'absolute',top:'30%',left:'50%',height:3,background:`linear-gradient(90deg, transparent, var(--neon-cyan), transparent)`,animation:'atk-beam 0.4s ease-out forwards',zIndex:20}}/>

        )}



        {/* Boss character */}

        <div style={{

          position:'relative',textAlign:'center',

          animation: bossFlash ? 'boss-flash 0.6s ease-in-out' : 'none',

          filter: phase === 'victory' ? 'grayscale(1) brightness(0.3)' : 'none',

          transition:'filter 0.5s',

        }}>

          {/* Pulse ring behind boss */}

          {phase === 'combat' && (

            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:100,height:100,borderRadius:'50%',border:`2px solid ${boss.color}`,animation:'pulse-ring 2s ease-out infinite',pointerEvents:'none'}}/>

          )}

          <div style={{fontSize:'clamp(56px,12vw,80px)',lineHeight:1,display:'inline-block',

            filter:`drop-shadow(0 0 20px ${boss.color}) drop-shadow(0 0 40px ${boss.color}60)`,

          }}>{boss.icon}</div>

          <div style={{

            fontFamily:'var(--font-display)',fontSize:'clamp(14px,3vw,18px)',fontWeight:900,

            color:boss.color,letterSpacing:'2px',marginTop:6,

            textShadow:`0 0 15px ${boss.color}`,

          }}>

            {phase === 'victory' ? '☠ DEFEATED' : phase === 'intro' ? 'ACTIVATING...' : boss.title}

          </div>



          {/* Taunt bubble */}

          {showTaunt && (

            <div style={{

              position:'absolute',top:-48,left:'50%',transform:'translateX(-50%)',

              background:'rgba(0,0,0,0.9)',border:`1.5px solid ${boss.color}`,

              borderRadius:8,padding:'6px 14px',whiteSpace:'nowrap',

              fontFamily:'var(--font-display)',fontSize:'10px',fontWeight:700,

              color:boss.color,letterSpacing:'1px',

              animation:'taunt-in 0.35s ease-out',

              zIndex:30,pointerEvents:'none',

              boxShadow:`0 0 15px ${boss.color}40`,

            }}>

              {tauntText}

              <div style={{position:'absolute',bottom:-8,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'8px solid transparent',borderRight:'8px solid transparent',borderTop:`8px solid ${boss.color}`}}/>

            </div>

          )}

        </div>



        {/* VS divider */}

        <div style={{display:'flex',alignItems:'center',width:'100%',gap:8}}>

          <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1))'}}/>

          <div style={{fontFamily:'var(--font-display)',fontSize:'9px',color:'rgba(255,255,255,0.2)',letterSpacing:'3px'}}>VS</div>

          <div style={{flex:1,height:1,background:'linear-gradient(90deg,rgba(255,255,255,0.1),transparent)'}}/>

        </div>



        {/* Player stats */}

        <div style={{

          width:'100%',background:'rgba(8,8,20,0.8)',border:'1px solid rgba(0,229,255,0.2)',

          borderRadius:10,padding:'10px 14px',

          animation: shakePlayer ? 'player-shake 0.5s ease-in-out' : 'none',

          boxShadow: playerFlash ? '0 0 20px rgba(244,63,94,0.5),inset 0 0 20px rgba(244,63,94,0.1)' : '0 0 15px rgba(0,229,255,0.08)',

          transition:'box-shadow 0.2s',

        }}>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>

            <div style={{fontFamily:'var(--font-display)',fontSize:'11px',color:'var(--neon-cyan)',fontWeight:700,letterSpacing:'1px'}}>⚡ YOU — CODER</div>

            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontFamily:'var(--font-display)'}}>

              {localPlayerHp} / {playerMaxHp} HP

            </div>

          </div>

          <div style={{height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}>

            <div style={{

              height:'100%',

              width:`${playerHpPct}%`,

              background: playerHpPct > 50 ? 'linear-gradient(90deg,#22d3a0,#4f9eff)' : playerHpPct > 25 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#f43f5e,#ec4899)',

              transition:'width 0.4s ease-out, background 0.4s',

              borderRadius:4,

              boxShadow: playerHpPct < 30 ? '0 0 8px rgba(244,63,94,0.6)' : 'none',

            }}/>

          </div>

        </div>

      </div>



      {/* Question area */}

      {phase === 'question' && currentQ && (

        <div style={{

          width:'100%',padding:'0 14px 14px',

          animation:'tab-enter 0.25s ease-out',

          maxHeight:'55vh',overflowY:'auto',

        }}>

          <div style={{

            background:'rgba(0,0,0,0.7)',border:`1.5px solid ${boss.color}40`,

            borderRadius:10,padding:'12px 14px',marginBottom:10,

          }}>

            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.3)',letterSpacing:'2px',marginBottom:6,fontFamily:'var(--font-display)'}}>COMBAT QUERY</div>

            <div style={{fontSize:'13px',color:'#fff',lineHeight:1.6}}>{currentQ.q}</div>

          </div>

          <div style={{display:'flex',flexDirection:'column',gap:7}}>

            {currentQ.opts.map((opt, i) => {

              let borderCol = 'rgba(255,255,255,0.1)';

              let bg = 'rgba(255,255,255,0.03)';

              let col = 'rgba(255,255,255,0.85)';

              if (selectedOpt !== null) {

                if (opt === currentQ.ans) { borderCol = '#22d3a0'; bg = 'rgba(34,211,160,0.12)'; col = '#22d3a0'; }

                else if (opt === selectedOpt && opt !== currentQ.ans) { borderCol = '#f43f5e'; bg = 'rgba(244,63,94,0.12)'; col = '#f43f5e'; }

              }

              return (

                <button key={i}

                  onClick={() => handleAnswer(opt)}

                  disabled={selectedOpt !== null}

                  style={{

                    width:'100%',padding:'10px 14px',

                    background:bg,border:`1.5px solid ${borderCol}`,

                    borderRadius:8,color:col,fontSize:'12px',

                    cursor:selectedOpt !== null ? 'default' : 'pointer',

                    textAlign:'left',fontFamily:'var(--font-mono)',

                    transition:'all 0.15s',

                    transform: selectedOpt === null ? 'none' : 'none',

                  }}

                  onMouseEnter={e => { if (selectedOpt === null) { e.currentTarget.style.background=`${boss.color}15`; e.currentTarget.style.borderColor=`${boss.color}80`; e.currentTarget.style.transform='translateX(4px)'; }}}

                  onMouseLeave={e => { if (selectedOpt === null) { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.transform='none'; }}}

                >

                  <span style={{color:`${boss.color}80`,fontFamily:'var(--font-display)',marginRight:8}}>{String.fromCharCode(65+i)}.</span>{opt}

                </button>

              );

            })}

          </div>

          {result && (

            <div style={{

              marginTop:10,padding:'10px 14px',borderRadius:8,

              background: result.correct ? 'rgba(34,211,160,0.08)' : 'rgba(244,63,94,0.08)',

              border: `1px solid ${result.correct ? 'rgba(34,211,160,0.3)' : 'rgba(244,63,94,0.3)'}`,

              color: result.correct ? 'var(--neon-green)' : 'var(--neon-pink)',

              fontSize:'12px',lineHeight:1.6,

              animation:'result-pop 0.25s ease-out',

            }}>

              <strong>{result.correct ? '✓ CORRECT — ' : '✗ WRONG — '}</strong>{result.exp}

              {result.reward && <div style={{color:'var(--neon-orange)',fontWeight:700,marginTop:4,fontFamily:'var(--font-display)',fontSize:'11px'}}>{result.reward}</div>}

            </div>

          )}

        </div>

      )}



      {/* Victory / Defeat overlay */}

      {(phase === 'victory' || phase === 'defeat') && (

        <div style={{

          position:'absolute',inset:0,background:'rgba(0,0,0,0.85)',

          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',

          gap:16,zIndex:200,animation:'tab-enter 0.3s ease-out',

        }}>

          {phase === 'victory' ? (

            <>

              <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(22px,6vw,32px)',fontWeight:900,color:'var(--neon-green)',letterSpacing:'3px',animation:'victory-glow 1.5s ease-in-out infinite',textAlign:'center'}}>

                ✓ SYNDICATE ELIMINATED

              </div>

              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',letterSpacing:'2px'}}>{boss.title} has been defeated</div>

              <div style={{fontFamily:'var(--font-display)',fontSize:'20px',color:'var(--neon-orange)',fontWeight:700}}>

                +${boss.reward.toLocaleString()}

              </div>

              <button className="m-btn" style={{maxWidth:240,marginTop:8}} onClick={onExit}>← RETURN TO CITY</button>

            </>

          ) : (

            <>

              <div style={{fontFamily:'var(--font-display)',fontSize:'clamp(22px,6vw,32px)',fontWeight:900,color:'var(--neon-pink)',letterSpacing:'3px',textAlign:'center'}}>DEFEATED</div>

              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',letterSpacing:'2px'}}>{boss.title} was too strong</div>

              <button className="m-btn" style={{maxWidth:240,background:'rgba(244,63,94,0.08)',border:'1.5px solid var(--neon-pink)',color:'var(--neon-pink)',marginTop:8}} onClick={onExit}>← RETREAT</button>

            </>

          )}

        </div>

      )}



      {/* Exit button (top right) */}

      {phase !== 'victory' && phase !== 'defeat' && (

        <button onClick={onExit} style={{

          position:'absolute',top:12,right:12,

          background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',

          color:'rgba(255,255,255,0.3)',borderRadius:6,padding:'4px 10px',

          fontSize:'10px',cursor:'pointer',fontFamily:'var(--font-display)',zIndex:200,

        }}>✕ FLEE</button>

      )}

    </div>

  );

}



// ══════════════════════════════════════

// INNER GAME COMPONENT (renders via portal to document.body)

// ══════════════════════════════════════

function GameModeInner({ onNewGame }) {

  const [score, setScore] = useState(0);

  const [cash, setCash] = useState(0);

  const [hp, setHp] = useState(100);

  const [maxHp, setMaxHp] = useState(100);

  const [ammo, setAmmo] = useState(12);

  const [maxAmmo, setMaxAmmo] = useState(12);

  const [damage, setDamage] = useState(1);

  const [wanted, setWanted] = useState(0);

  const [highScore, setHighScore] = useState(0);

  const [doneTasks, setDoneTasks] = useState({});

  const [activeTab, setActiveTab] = useState('drive');

  const [phase, setPhase] = useState('idle');

  const [activeMission, setActiveMission] = useState(null);

  const [activeBossUI, setActiveBossUI] = useState(null); // boss being fought in full-screen UI

  const [boosting, setBoosting] = useState(false);

  const [narrator, setNarrator] = useState({ text: '', show: false });

  const narratorTimerRef = useRef(null);

  const [modal, setModal] = useState(null);

  const [achievement, setAchievement] = useState(null);

  const canvasRef = useRef(null);

  const menuCanvasRef = useRef(null);



  // ── PERFORMANCE: use refs for rapidly-mutating game state ──

  const scoreRef = useRef(0);

  const cashRef = useRef(0);

  const hpRef = useRef(100);

  const wantedRef = useRef(0);

  const damageRef = useRef(1);

  const maxHpRef = useRef(100);

  const maxAmmoRef = useRef(12);



  const physicsRef = useRef({

    px: 0, py: 0, tLane: 1, spd: 4, frame: 0, roadY: 0, cityOff: 0,

    obs: [], bullets: [], particles: [], explosions: [], npcCars: [],

    buildings: [], lights: [], wantedTimer: 0, boostTime: 0, shooting: false,

    keys: {}, nextObs: 60, nextMcq: 360,

  });

  const audioContextRef = useRef(null);

  const musicIntervalRef = useRef(null);

  const musicStepRef = useRef(0);

  const musicGainRef = useRef(null);

  const engineIntervalRef = useRef(null);

  // Stable refs to avoid stale closures in RAF loop

  const phaseRef = useRef('idle');

  const ammoRef = useRef(12);

  const pendingScoreRef = useRef(0);  // batch score updates

  const pendingCashRef = useRef(0);   // batch cash updates

  const flushRafRef = useRef(null);

  const mcqActiveRef = useRef(false);

  // Stable ref so triggerGameOverRaf (defined before startNewGame) can call it
  const startNewGameRef = useRef(null);



  // Sync state → refs when state changes

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => { hpRef.current = hp; }, [hp]);

  useEffect(() => { damageRef.current = damage; }, [damage]);

  useEffect(() => { maxHpRef.current = maxHp; }, [maxHp]);

  useEffect(() => { maxAmmoRef.current = maxAmmo; }, [maxAmmo]);



  const isDone = useCallback((key) => !!doneTasks[key], [doneTasks]);

  const randQ = useCallback(() => QB[Math.floor(Math.random() * QB.length)], []);



  useEffect(() => {

    try {

      const hs = +localStorage.getItem('dsa_vc_hs') || 0;

      setHighScore(hs);

      const gs = JSON.parse(localStorage.getItem('dsa_vc_gs'));

      if (gs) {

        const c = gs.cash || 0; const s = gs.score || 0;

        setCash(c); cashRef.current = c;

        setScore(s); scoreRef.current = s;

        setDoneTasks(gs.done || {});

        const mh = gs.maxHp || 100; setMaxHp(mh); maxHpRef.current = mh;

        const ma = gs.maxAmmo || 12; setMaxAmmo(ma); maxAmmoRef.current = ma;

        const dm = gs.damage || 1; setDamage(dm); damageRef.current = dm;

        setHighScore(Math.max(hs, gs.hs || 0));

      }

    } catch(e) {}

  }, []);



  // Batched save — never calls setState inside RAF

  const triggerSave = useCallback((updates = {}) => {

    try {

      const c = updates.cash !== undefined ? updates.cash : cashRef.current;

      const s = updates.score !== undefined ? updates.score : scoreRef.current;

      const d = updates.done !== undefined ? updates.done : doneTasks;

      const mh = updates.maxHp !== undefined ? updates.maxHp : maxHpRef.current;

      const ma = updates.maxAmmo !== undefined ? updates.maxAmmo : maxAmmoRef.current;

      const dm = updates.damage !== undefined ? updates.damage : damageRef.current;

      const hs = Math.max(highScore, s);

      localStorage.setItem('dsa_vc_gs', JSON.stringify({ cash:c, score:s, done:d, maxHp:mh, maxAmmo:ma, damage:dm, hs }));

      localStorage.setItem('dsa_vc_hs', hs);

      setHighScore(hs);

    } catch(e) {}

  }, [doneTasks, highScore]);



  // PERFORMANCE: Batched score/cash flush — only calls setState once per "flush" outside RAF

  const flushPending = useCallback(() => {

    if (pendingScoreRef.current !== 0) {

      const add = pendingScoreRef.current; pendingScoreRef.current = 0;

      setScore(s => { const ns = s + add; scoreRef.current = ns; return ns; });

    }

    if (pendingCashRef.current !== 0) {

      const add = pendingCashRef.current; pendingCashRef.current = 0;

      setCash(c => { const nc = c + add; cashRef.current = nc; return nc; });

    }

  }, []);



  const scheduleFlush = useCallback(() => {

    if (flushRafRef.current) return;

    flushRafRef.current = requestAnimationFrame(() => {

      flushRafRef.current = null;

      flushPending();

    });

  }, [flushPending]);



  // Safe way to add score/cash from RAF — no setState inside loop

  const addScoreRaf = useCallback((amount) => {

    pendingScoreRef.current += amount;

    scheduleFlush();

  }, [scheduleFlush]);

  const addCashRaf = useCallback((amount) => {

    pendingCashRef.current += amount;

    scheduleFlush();

  }, [scheduleFlush]);



  const triggerNarrator = useCallback((text, dur = 2400) => {

    if (narratorTimerRef.current) clearTimeout(narratorTimerRef.current);

    setNarrator({ text, show: true });

    narratorTimerRef.current = setTimeout(() => setNarrator(prev => ({ ...prev, show: false })), dur);

  }, []);



  // ══ AUDIO ══

  const getAudioContext = useCallback(() => {

    if (!audioContextRef.current) {

      try { audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}

    }

    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();

    return audioContextRef.current;

  }, []);



  const playSfx = useCallback((type) => {

    try {

      const ctx = getAudioContext();

      if (!ctx) return;

      const gain = ctx.createGain();

      gain.connect(ctx.destination);

      const t = ctx.currentTime;

      if (type === 'shoot') {

        const bufferSize = ctx.sampleRate * 0.08;

        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);

        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);

        const src = ctx.createBufferSource(); src.buffer = buffer;

        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400;

        src.connect(f); f.connect(gain);

        gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        src.start(t); src.stop(t + 0.1);

      } else if (type === 'hit') {

        const bufferSize = ctx.sampleRate * 0.22;

        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);

        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.4);

        const src = ctx.createBufferSource(); src.buffer = buffer;

        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350;

        src.connect(f); f.connect(gain);

        gain.gain.setValueAtTime(0.6, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        src.start(t); src.stop(t + 0.25);

      } else if (type === 'correct') {

        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {

          const osc = ctx.createOscillator(); const og = ctx.createGain();

          osc.type = 'triangle'; osc.frequency.value = freq;

          og.gain.setValueAtTime(0, t + idx * 0.08); og.gain.linearRampToValueAtTime(0.12, t + idx * 0.08 + 0.02); og.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

          osc.connect(og); og.connect(gain); osc.start(t + idx * 0.08); osc.stop(t + idx * 0.08 + 0.3);

        });

        gain.gain.setValueAtTime(0.7, t);

      } else if (type === 'wrong') {

        const osc = ctx.createOscillator(); osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(180, t); osc.frequency.linearRampToValueAtTime(70, t + 0.35);

        gain.gain.setValueAtTime(0.22, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain); osc.start(t); osc.stop(t + 0.4);

      } else if (type === 'cash') {

        [987.77, 1318.51].forEach((freq, idx) => {

          const osc = ctx.createOscillator(); const og = ctx.createGain();

          osc.type = 'sine'; osc.frequency.value = freq;

          og.gain.setValueAtTime(0, t + idx * 0.06); og.gain.linearRampToValueAtTime(0.14, t + idx * 0.06 + 0.02); og.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.2);

          osc.connect(og); og.connect(gain); osc.start(t + idx * 0.06); osc.stop(t + idx * 0.06 + 0.25);

        });

        gain.gain.setValueAtTime(0.65, t);

      } else if (type === 'engine') {

        const osc = ctx.createOscillator(); osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(52 * Math.min(2.5, physicsRef.current.spd / 3), t);

        gain.gain.setValueAtTime(0.012, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain); osc.start(t); osc.stop(t + 0.13);

      } else if (type === 'trophy') {

        [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50].forEach((freq, idx) => {

          const osc = ctx.createOscillator(); const og = ctx.createGain();

          osc.type = 'sine'; osc.frequency.value = freq;

          og.gain.setValueAtTime(0, t + idx * 0.08); og.gain.linearRampToValueAtTime(0.08, t + idx * 0.08 + 0.02); og.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

          osc.connect(og); og.connect(gain); osc.start(t + idx * 0.08); osc.stop(t + idx * 0.08 + 0.5);

        });

        gain.gain.setValueAtTime(0.7, t);

      } else if (type === 'boss') {

        [110, 110, 98, 98].forEach((freq, idx) => {

          const osc = ctx.createOscillator(); const og = ctx.createGain();

          osc.type = 'sawtooth'; osc.frequency.value = freq;

          og.gain.setValueAtTime(0, t + idx * 0.18); og.gain.linearRampToValueAtTime(0.18, t + idx * 0.18 + 0.03); og.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.3);

          osc.connect(og); og.connect(gain); osc.start(t + idx * 0.18); osc.stop(t + idx * 0.18 + 0.35);

        });

      }

    } catch(e) {}

  }, [getAudioContext]);



  const startEngineSFX = useCallback(() => { if (!engineIntervalRef.current) engineIntervalRef.current = setInterval(() => playSfx('engine'), 115); }, [playSfx]);

  const stopEngineSFX = useCallback(() => { if (engineIntervalRef.current) { clearInterval(engineIntervalRef.current); engineIntervalRef.current = null; } }, []);

  const playMusicStep = useCallback(() => {

    try {

      const ctx = getAudioContext(); if (!ctx) return;

      const t = ctx.currentTime; const step = musicStepRef.current % 32;

      const bassOsc = ctx.createOscillator(); const bassGain = ctx.createGain(); const bassFilter = ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth'; bassFilter.type = 'lowpass'; bassFilter.frequency.value = 240;

      const BL = [55,55,55,55,55,55,55,55,43.65,43.65,43.65,43.65,43.65,43.65,43.65,43.65,65.41,65.41,65.41,65.41,65.41,65.41,65.41,65.41,49,49,49,49,49,49,49,49];

      bassOsc.frequency.setValueAtTime(BL[step], t);

      bassGain.gain.setValueAtTime(0, t); bassGain.gain.linearRampToValueAtTime(0.08, t + 0.01); bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      bassOsc.connect(bassFilter); bassFilter.connect(bassGain); bassGain.connect(musicGainRef.current);

      bassOsc.start(t); bassOsc.stop(t + 0.15);

      if (step % 8 === 0) {

        const CL = [[220,261.63,329.63],[174.61,220,261.63],[261.63,329.63,392],[196,246.94,293.66]];

        CL[Math.floor(step/8)].forEach(chordFreq => {

          const osc = ctx.createOscillator(); const og = ctx.createGain(); const cf = ctx.createBiquadFilter();

          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(chordFreq * 2, t);

          cf.type = 'lowpass'; cf.frequency.setValueAtTime(450, t); cf.frequency.exponentialRampToValueAtTime(950, t + 0.85);

          og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(0.02, t + 0.12); og.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

          osc.connect(cf); cf.connect(og); og.connect(musicGainRef.current); osc.start(t); osc.stop(t + 1.3);

        });

      }

      musicStepRef.current++;

    } catch(e) {}

  }, [getAudioContext]);



  const startMusicSoundtrack = useCallback(() => {

    const ctx = getAudioContext(); if (!ctx || musicIntervalRef.current) return;

    musicGainRef.current = ctx.createGain(); musicGainRef.current.gain.value = 0.5; musicGainRef.current.connect(ctx.destination);

    musicStepRef.current = 0; musicIntervalRef.current = setInterval(playMusicStep, 150);

  }, [getAudioContext, playMusicStep]);



  const stopMusicSoundtrack = useCallback(() => { if (musicIntervalRef.current) { clearInterval(musicIntervalRef.current); musicIntervalRef.current = null; } }, []);



  useEffect(() => { return () => { stopEngineSFX(); stopMusicSoundtrack(); }; }, []);



  // ══ KEY LISTENERS ══

  useEffect(() => {

    if (phase !== 'playing') return;

    const p = physicsRef.current;

    const handleKeyDown = (e) => {

      if (['ArrowLeft','ArrowRight','Space','KeyZ','KeyR'].includes(e.code)) e.preventDefault();

      p.keys[e.code] = true;

    };

    const handleKeyUp = (e) => { p.keys[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);

    window.addEventListener('keyup', handleKeyUp);

    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };

  }, [phase]);



  // ══ CANVAS DRAW HELPERS ══

  const rr = (ctx, x, y, w, h, r) => {

    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }

    const R = Math.min(r, w/2, h/2);

    ctx.beginPath();

    ctx.moveTo(x+R,y); ctx.lineTo(x+w-R,y); ctx.arcTo(x+w,y,x+w,y+R,R);

    ctx.lineTo(x+w,y+h-R); ctx.arcTo(x+w,y+h,x+w-R,y+h,R);

    ctx.lineTo(x+R,y+h); ctx.arcTo(x,y+h,x,y+h-R,R);

    ctx.lineTo(x,y+R); ctx.arcTo(x,y,x+R,y,R); ctx.closePath();

  };



  const drawSkyLocal = (ctx, W, H) => {

    const sg = ctx.createLinearGradient(0, 0, 0, H * 0.38);

    sg.addColorStop(0, '#020108'); sg.addColorStop(0.6, '#07061a'); sg.addColorStop(1, '#0e0926');

    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.38);

    for (let i = 0; i < 60; i++) {

      const sx = (i * 137 + physicsRef.current.frame * 0.02) % W;

      const sy = (i * 83) % (H * 0.35);

      const brightness = 0.3 + (i % 7) * 0.1;

      ctx.fillStyle = `rgba(255,255,255,${brightness})`; ctx.fillRect(sx, sy, 1.5, 1.5);

    }

    const gl1 = ctx.createRadialGradient(W*0.25, H*0.08, 0, W*0.25, H*0.08, W*0.3);

    gl1.addColorStop(0,'rgba(140,0,255,0.08)'); gl1.addColorStop(1,'transparent');

    ctx.fillStyle = gl1; ctx.fillRect(0, 0, W, H * 0.38);

    const gl2 = ctx.createRadialGradient(W*0.75, H*0.1, 0, W*0.75, H*0.1, W*0.25);

    gl2.addColorStop(0,'rgba(0,120,255,0.07)'); gl2.addColorStop(1,'transparent');

    ctx.fillStyle = gl2; ctx.fillRect(0, 0, W, H * 0.38);

  };



  const drawCityLocal = (ctx, cityOff, W, H) => {

    const { RX, RW } = getDimensions();

    const buildings = physicsRef.current.buildings;

    const lights = physicsRef.current.lights;

    buildings.forEach(b => {

      const by = ((b.off + cityOff) % (H + 400)) - 400;

      ctx.fillStyle = b.col; ctx.fillRect(b.x, H * 0.38 - b.h + by * 0.05, b.w, b.h);

      ctx.strokeStyle = b.acc; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.25;

      ctx.strokeRect(b.x, H * 0.38 - b.h + by * 0.05, b.w, b.h); ctx.globalAlpha = 1;

      for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 3; wx++) {

        if (Math.random() < 0.55) {

          ctx.fillStyle = `rgba(255,${180+Math.floor(Math.random()*75)},50,${0.3 + Math.random()*0.4})`;

          ctx.fillRect(b.x + 4 + wx * (b.w/3), H * 0.38 - b.h + by * 0.05 + 6 + wy * 14, 5, 4);

        }

      }

    });

    lights.forEach(l => {

      const ly = ((l.off + cityOff) % (H + 400)) - 400;

      ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 8;

      ctx.fillStyle = '#ffee88'; ctx.fillRect(l.x - 2, H * 0.38 + ly * 0.1, 4, 4);

      ctx.shadowBlur = 0;

    });

  };



  const drawRoadLocal = (ctx, roadY, W, H) => {

    const { RX, RW, LW } = getDimensions();

    const rg = ctx.createLinearGradient(RX, H*0.38, RX, H);

    rg.addColorStop(0,'#09091b'); rg.addColorStop(1,'#05050d');

    ctx.fillStyle = rg; ctx.fillRect(RX, H*0.38, RW, H*0.62);

    ctx.fillStyle = 'rgba(0,229,255,0.02)'; ctx.fillRect(RX, H*0.58, RW, H*0.42);

    const vpx = RX + RW/2, vpy = H*0.38;

    for (let i = 0; i <= LANES; i++) {

      const bx = RX + i * LW;

      ctx.strokeStyle = 'rgba(0,229,255,0.12)'; ctx.lineWidth = 1;

      ctx.beginPath(); ctx.moveTo(vpx + (bx - vpx)*0.08, vpy); ctx.lineTo(bx, H); ctx.stroke();

    }

    ctx.setLineDash([24,22]); ctx.lineWidth = 2;

    for (let i = 1; i < LANES; i++) {

      const x = RX + i * LW;

      ctx.strokeStyle = 'rgba(255,255,255,0.07)';

      ctx.beginPath(); ctx.moveTo(vpx + (x - vpx)*0.08, vpy+5); ctx.lineTo(x, H); ctx.stroke();

    }

    ctx.setLineDash([]);

    const step = 56;

    for (let y = (roadY % step) - step; y < H + step; y += step) {

      const depth = Math.max(0, (y - H*0.38) / (H - H*0.38));

      const ledSz = 1.5 + depth * 4;

      ctx.fillStyle = `rgba(0,229,255,${0.25 + depth*0.7})`;

      ctx.fillRect(RX+3, y, ledSz, ledSz*2); ctx.fillRect(RX+RW-3-ledSz, y+step/2, ledSz, ledSz*2);

    }

  };



  const drawPlayerCarLocal = (ctx, x, y, boost, frame) => {

    const { CRW, CRH } = getDimensions();

    const primaryCol = boost ? '#00e5ff' : '#cc44ff';

    const glowCol = boost ? '#00e5ff' : '#ff00ff';

    ctx.shadowColor = glowCol; ctx.shadowBlur = boost ? 30 : 18;

    ctx.fillStyle = boost ? '#008bba' : '#7a1fa2'; rr(ctx, x+3, y+CRH*0.44, CRW-6, CRH*0.52, 6); ctx.fill();

    ctx.fillStyle = primaryCol; rr(ctx, x+4, y+CRH*0.18, CRW-8, CRH*0.34, 7); ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#060410'; rr(ctx, x+7, y+CRH*0.26, CRW-14, CRH*0.18, 3); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(ctx, x+8, y+CRH*0.20, CRW-16, CRH*0.05, 1); ctx.fill();

    ctx.shadowColor = boost ? '#e0ffff' : '#ffffdd'; ctx.shadowBlur = boost ? 20 : 12; ctx.fillStyle = '#ffffff';

    ctx.beginPath(); ctx.ellipse(x+9, y+CRH*0.22, 5, 3, 0, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.ellipse(x+CRW-9, y+CRH*0.22, 5, 3, 0, 0, Math.PI*2); ctx.fill();

    ctx.shadowBlur = 0; ctx.shadowColor = '#f43f5e'; ctx.shadowBlur = 12; ctx.fillStyle = '#ff1155';

    ctx.beginPath(); ctx.ellipse(x+8, y+CRH*0.88, 4.5, 2.5, 0, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.ellipse(x+CRW-8, y+CRH*0.88, 4.5, 2.5, 0, 0, Math.PI*2); ctx.fill();

    ctx.shadowBlur = 0;

    [[x+1,y+CRH*0.28],[x+CRW-9,y+CRH*0.28],[x+1,y+CRH*0.66],[x+CRW-9,y+CRH*0.66]].forEach(([wx,wy]) => {

      ctx.fillStyle = '#06060c'; rr(ctx, wx, wy, 8, CRH*0.2, 2.5); ctx.fill();

    });

    ctx.fillStyle = '#666'; rr(ctx, x+CRW-2, y+CRH*0.36, 8, 4, 1); ctx.fill();

    if (boost) {

      const fl = ctx.createLinearGradient(0, y+CRH, 0, y+CRH+35);

      fl.addColorStop(0,'#00e5ff'); fl.addColorStop(0.4,'#f59e0b'); fl.addColorStop(1,'rgba(0,0,0,0)');

      ctx.fillStyle = fl;

      const flicker = Math.sin(frame * 0.6) * 5;

      ctx.beginPath(); ctx.moveTo(x+10, y+CRH); ctx.lineTo(x+CRW/2+flicker, y+CRH+35); ctx.lineTo(x+CRW-10, y+CRH); ctx.fill();

    }

  };



  const drawEnemyCarLocal = (ctx, x, y, col) => {

    const { OW, OH } = getDimensions();

    ctx.shadowColor = col; ctx.shadowBlur = 14;

    ctx.fillStyle = col; rr(ctx, x+2, y+OH*0.42, OW-4, OH*0.55, 5); ctx.fill();

    ctx.fillStyle = col + 'cc'; rr(ctx, x+3, y+OH*0.16, OW-6, OH*0.32, 6); ctx.fill();

    ctx.shadowBlur = 0; ctx.fillStyle = '#060410'; rr(ctx, x+5, y+OH*0.22, OW-10, OH*0.18, 2); ctx.fill();

    ctx.shadowColor = '#ffffaa'; ctx.shadowBlur = 8; ctx.fillStyle = '#ffffcc';

    ctx.beginPath(); ctx.ellipse(x+7, y+OH*0.88, 4, 2, 0, 0, Math.PI*2); ctx.fill();

    ctx.beginPath(); ctx.ellipse(x+OW-7, y+OH*0.88, 4, 2, 0, 0, Math.PI*2); ctx.fill();

    ctx.shadowBlur = 0;

    [[x+1,y+OH*0.28],[x+OW-8,y+OH*0.28],[x+1,y+OH*0.66],[x+OW-8,y+OH*0.66]].forEach(([wx,wy]) => {

      ctx.fillStyle = '#06060c'; rr(ctx, wx, wy, 7, OH*0.2, 2); ctx.fill();

    });

  };



  // ══ GAME LOOP — PERFORMANCE FIXED ══

  // Dependencies: only [phase]. Score/cash mutated via refs, flushed in batches.

  useEffect(() => {

    if (phase !== 'playing') return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const p = physicsRef.current;

    let localRAF = null;



    const gameFrame = () => {

      // Use ref instead of closure to always get fresh phase

      if (phaseRef.current !== 'playing') return;

      if (mcqActiveRef.current) { localRAF = requestAnimationFrame(gameFrame); return; }



      const { CW: CW_local, CH: CH_local, RW, RX, LW, CRW, CRH, OW, OH } = getDimensions();

      canvas.width = CW_local; canvas.height = CH_local;

      p.frame++;

      p.spd = 4 + p.frame * 0.0003 + (p.boostTime > 0 ? 3.5 : 0);

      if (p.boostTime > 0) { p.boostTime--; if (p.boostTime === 0) setBoosting(false); }

      p.roadY = (p.roadY + p.spd * 1.3) % 56;

      p.cityOff = (p.cityOff + p.spd * 0.8) % (CH_local + 400);

      if (p.keys['ArrowLeft'] && p.tLane > 0) { p.tLane--; p.keys['ArrowLeft'] = false; }

      if (p.keys['ArrowRight'] && p.tLane < LANES-1) { p.tLane++; p.keys['ArrowRight'] = false; }

      if ((p.keys['Space'] || p.keys['KeyZ']) && !p.shooting) {

        p.shooting = true;

        setTimeout(() => { p.shooting = false; }, 160);

        if (ammoRef.current > 0) {

          playSfx('shoot');

          p.bullets.push({ x: p.px + CRW - 4, y: p.py + CRH * 0.36, vy: -14, dmg: damageRef.current });

          ammoRef.current = ammoRef.current - 1;

          setAmmo(ammoRef.current);

        }

      }

      if (p.keys['KeyR']) { p.keys['KeyR'] = false; triggerReloadRaf(); }

      const tpx = laneX(p.tLane);

      if (Math.abs(p.px - tpx) > 1) { p.px += (tpx - p.px) * 0.18; } else { p.px = tpx; }

      p.bullets = p.bullets.filter(b => b.y > -20);

      p.bullets.forEach(b => { b.y += b.vy; });

      if (p.frame >= p.nextObs) {

        p.nextObs = p.frame + 80 + Math.floor(Math.random() * 120);

        const ln = Math.floor(Math.random() * LANES);

        p.obs.push({ x: laneX(ln), y: -OH - 10, lane: ln, col: EC[Math.floor(Math.random() * EC.length)], hp: 2 });

      }

      p.npcCars.forEach(n => {

        n.y += n.spd;

        if (n.y > CH_local + 100) {

          n.y = -300 - Math.random() * 200;

          n.lane = Math.floor(Math.random() * LANES);

          n.col = EC[Math.floor(Math.random() * EC.length)];

        }

      });

      p.obs = p.obs.filter(o => {

        o.y += p.spd * 0.85;

        let hit = false;

        p.bullets = p.bullets.filter(b => {

          const dx = Math.abs(b.x - (o.x + OW/2)); const dy = Math.abs(b.y - (o.y + OH/2));

          if (dx < OW*0.6 && dy < OH*0.6) {

            hit = true;

            for (let i = 0; i < 6; i++) p.particles.push({ x: o.x+OW/2, y: o.y+OH/2, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5, life: 20, col: o.col });

            return false;

          }

          return true;

        });

        if (hit) {

          o.hp -= damageRef.current;

          if (o.hp <= 0) {

            playSfx('hit');

            p.explosions.push({ x: o.x+OW/2, y: o.y+OH/2, r: 0, maxR: 40, life: 18 });

            addScoreRaf(100);

            addCashRaf(200);

            wantedRef.current = Math.min(5, wantedRef.current + 1);

            setWanted(wantedRef.current);

            return false;

          }

          playSfx('hit'); return true;

        }

        const pdx = Math.abs(p.px + CRW/2 - (o.x + OW/2)); const pdy = Math.abs(p.py + CRH/2 - (o.y + OH/2));

        if (pdx < (CRW+OW)*0.4 && pdy < (CRH+OH)*0.4) {

          playSfx('hit');

          hpRef.current = Math.max(0, hpRef.current - 15);

          setHp(hpRef.current);

          if (hpRef.current <= 0) triggerGameOverRaf();

          p.explosions.push({ x: o.x+OW/2, y: o.y+OH/2, r: 0, maxR: 35, life: 15 });

          return false;

        }

        return o.y < CH_local + 100;

      });

      p.particles = p.particles.filter(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.life--; return pt.life > 0; });

      p.explosions = p.explosions.filter(ex => { ex.r += 3; ex.life--; return ex.life > 0; });

      p.wantedTimer++;

      if (p.wantedTimer > 600) { p.wantedTimer = 0; wantedRef.current = Math.max(0, wantedRef.current - 1); setWanted(wantedRef.current); }

      if (p.frame >= p.nextMcq && !mcqActiveRef.current) { p.nextMcq = p.frame + 9999; triggerMCQCheckpointRaf(); }



      ctx.clearRect(0, 0, CW_local, CH_local);

      drawSkyLocal(ctx, CW_local, CH_local);

      drawCityLocal(ctx, p.cityOff, CW_local, CH_local);

      drawRoadLocal(ctx, p.roadY, CW_local, CH_local);

      p.npcCars.forEach(n => { if (n.y > p.py) drawEnemyCarLocal(ctx, laneX(n.lane), n.y, n.col); });

      p.obs.forEach(o => drawEnemyCarLocal(ctx, o.x, o.y, o.col));

      drawPlayerCarLocal(ctx, p.px, p.py, p.boostTime > 0, p.frame);

      p.npcCars.forEach(n => { if (n.y <= p.py) drawEnemyCarLocal(ctx, laneX(n.lane), n.y, n.col); });

      p.bullets.forEach(b => {

        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10; ctx.fillStyle = '#00e5ff';

        ctx.fillRect(b.x-1, b.y-6, 3, 12); ctx.shadowBlur = 0;

      });

      p.particles.forEach(pt => { ctx.globalAlpha = pt.life/20; ctx.fillStyle = pt.col; ctx.fillRect(pt.x-2, pt.y-2, 4, 4); });

      ctx.globalAlpha = 1;

      p.explosions.forEach(ex => {

        ctx.globalAlpha = ex.life/18; ctx.strokeStyle = '#ff6600'; ctx.lineWidth = 3;

        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI*2); ctx.stroke();

        ctx.globalAlpha = (ex.life/18)*0.4; ctx.fillStyle = '#ff9900';

        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r*0.5, 0, Math.PI*2); ctx.fill();

        ctx.globalAlpha = 1;

      });

      localRAF = requestAnimationFrame(gameFrame);

    };

    localRAF = requestAnimationFrame(gameFrame);

    return () => { if (localRAF) cancelAnimationFrame(localRAF); };

  }, [phase]); // ← Only [phase] — no more cash/wanted/damage in deps!



  // ══ MENU CANVAS ══

  useEffect(() => {

    if (phase !== 'idle') return;

    const cv = menuCanvasRef.current;

    if (!cv) return;

    const ctx = cv.getContext('2d');

    let mRAF = null;

    const frameMenu = () => {

      if (phaseRef.current !== 'idle') return;

      const W = window.innerWidth; const H = window.innerHeight;

      // Cap canvas size on mobile to reduce memory/lag
      const scale = window.devicePixelRatio > 1 && W < 768 ? 0.75 : 1;
      cv.width = Math.floor(W * scale); cv.height = Math.floor(H * scale);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';

      const time = Date.now() * 0.001;

      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, 0, H);

      bg.addColorStop(0,'#020108'); bg.addColorStop(0.65,'#070314'); bg.addColorStop(1,'#110526');

      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(245,158,11,0.07)'; ctx.lineWidth = 1;

      const vp = { x: W/2, y: H*0.52 };

      for (let i = -10; i <= 24; i++) {

        const sx = i * (W/14);

        ctx.beginPath(); ctx.moveTo(vp.x + (sx - W/2)*0.08, vp.y); ctx.lineTo(sx, H); ctx.stroke();

      }

      for (let i = 0; i < 9; i++) {

        const ratio = i/8; const y = vp.y + Math.pow(ratio, 2) * (H - vp.y);

        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

      }

      const pulse = Math.sin(time * 6.5) > 0;

      ctx.fillStyle = pulse ? 'rgba(244,63,94,0.04)' : 'rgba(0,229,255,0.03)';

      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 3; i++) {

        const y = ((time * 60 + i * 220) % H);

        ctx.strokeStyle = `rgba(245,158,11,${0.05 + Math.sin(time+i)*0.03})`; ctx.lineWidth = 1;

        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

      }

      mRAF = requestAnimationFrame(frameMenu);

    };

    mRAF = requestAnimationFrame(frameMenu);

    return () => { cancelAnimationFrame(mRAF); };

  }, [phase]);



  // ══ HELPERS (RAF-safe, no setState inside RAF) ══

  const triggerReloadRaf = () => {

    if (ammoRef.current >= maxAmmoRef.current) return;

    playSfx('shoot'); triggerNarrator("RELOADING MODULES...", 1000);

    setTimeout(() => { ammoRef.current = maxAmmoRef.current; setAmmo(maxAmmoRef.current); }, 800);

  };



  const triggerGameOverRaf = () => {

    phaseRef.current = 'over';

    setPhase('over'); stopEngineSFX(); stopMusicSoundtrack(); playSfx('wrong'); triggerNarrator('WASTED', 3500);

    triggerSave({});

    setTimeout(() => {

      setModal({

        title: 'WASTED', sub: 'YOUR STACK OVERFLOWED.',

        q: `High Score: ${highScore.toLocaleString()}\nYour Score: ${scoreRef.current.toLocaleString()}\nCash: $${cashRef.current.toLocaleString()}`,

        opts: ['TRY AGAIN', 'MAIN MENU'], noScore: true,

        onAns: (opt) => { setModal(null); if (opt.includes('AGAIN')) startNewGameRef.current?.(); else showMenuScreen(); },

        onClose: () => {}

      });

    }, 1200);

  };



  const triggerMCQCheckpointRaf = () => {

    mcqActiveRef.current = true;

    phaseRef.current = 'mcq';

    setPhase('mcq'); stopEngineSFX();

    const question = QB[Math.floor(Math.random() * QB.length)];

    playSfx('boss'); triggerNarrator('DSA CHECKPOINT: RED LIGHT ALERT!', 3000);

    setModal({

      title: 'DSA ROADBLOCK', sub: `${question.topic} · ${question.diff}`,

      q: question.q, opts: question.opts, ans: question.ans,

      onAns: (selected) => {

        const isCorrect = selected === question.ans;

        if (isCorrect) {

          physicsRef.current.boostTime = 250; setBoosting(true);

          ammoRef.current = Math.min(maxAmmoRef.current, ammoRef.current + 4);

          setAmmo(ammoRef.current);

          addCashRaf(600); addScoreRaf(500); playSfx('correct'); playSfx('cash');

          triggerNarrator('CODE COMPILED! BOOST ENABLED!', 2500);

          return { correct: true, exp: question.exp, reward: '+$600 CASH | NITROUS CHARGED | +4 AMMO' };

        } else {

          hpRef.current = Math.max(0, hpRef.current - 20);

          setHp(hpRef.current);

          if (hpRef.current <= 0) triggerGameOverRaf();

          playSfx('wrong'); triggerNarrator('SEGFAULT! SYSTEM DAMAGED!', 2000);

          return { correct: false, exp: question.exp };

        }

      },

      onClose: () => {

        mcqActiveRef.current = false;

        physicsRef.current.nextMcq = physicsRef.current.frame + 340 + Math.floor(Math.random()*200);

        phaseRef.current = 'playing';

        setPhase('playing'); startEngineSFX();

      }

    });

  };



  const showMenuScreen = useCallback(() => { phaseRef.current = 'idle'; setPhase('idle'); stopEngineSFX(); stopMusicSoundtrack(); }, [stopEngineSFX, stopMusicSoundtrack]);



  const initPlay = useCallback(() => {

    const { CH, CRH } = getDimensions();

    const p = physicsRef.current;

    phaseRef.current = 'playing';

    setPhase('playing');

    p.px = laneX(1); p.py = CH - CRH - 100; p.tLane = 1;

    p.obs = []; p.frame = 0; p.roadY = 0; p.spd = 4;

    p.nextObs = 60; p.nextMcq = 360; p.boostTime = 0;

    p.bullets = []; p.particles = []; p.explosions = []; p.wantedTimer = 0; p.cityOff = 0;

    hpRef.current = maxHpRef.current;

    ammoRef.current = maxAmmoRef.current;

    setHp(maxHpRef.current); setAmmo(maxAmmoRef.current); setWanted(0); setBoosting(false); setActiveTab('drive');

    p.npcCars = [];

    for (let i = 0; i < 3; i++) p.npcCars.push({ lane: Math.floor(Math.random()*LANES), y: -200-i*320, col: EC[Math.floor(Math.random()*EC.length)], spd: 1.0+Math.random()*1.8 });

    p.buildings = []; p.lights = [];

    const BH = CH + 400;

    for (let i = 0; i < 10; i++) {

      p.buildings.push({ side:'L', x: Math.random()*(getDimensions().RX-40), w: 30+Math.random()*60, h: 90+Math.random()*210, col:['#0d0620','#07111d','#0a140a','#14080a'][Math.floor(Math.random()*4)], acc:EC[Math.floor(Math.random()*EC.length)], off: i*(BH/10) });

      const rx2 = getDimensions().RX + getDimensions().RW + 20;

      p.buildings.push({ side:'R', x: rx2+Math.random()*(window.innerWidth-rx2-75), w: 30+Math.random()*60, h: 90+Math.random()*210, col:['#0d0620','#07111d','#0a140a','#14080a'][Math.floor(Math.random()*4)], acc:EC[Math.floor(Math.random()*EC.length)], off: i*(BH/10)+50 });

      p.lights.push({ x: getDimensions().RX-16, off: i*220 }); p.lights.push({ x: getDimensions().RX+getDimensions().RW+16, off: i*220+110 });

    }

    mcqActiveRef.current = false;

    // Cancel any pending flush RAF to avoid stale score/cash batches carrying over
    if (flushRafRef.current) { cancelAnimationFrame(flushRafRef.current); flushRafRef.current = null; }
    pendingScoreRef.current = 0;
    pendingCashRef.current = 0;

    startEngineSFX(); startMusicSoundtrack();

  }, [maxHpRef, maxAmmoRef, startEngineSFX, startMusicSoundtrack]);



  // ══ NEW GAME — complete fresh start ══
  // Delegates localStorage wipe + component remount to the parent GameMode wrapper,
  // which bumps gameKey causing React to fully unmount/remount GameModeInner.
  // This is the ONLY correct way to guarantee zero stale state.
  const startNewGame = useCallback(() => {
    // Stop all audio loops
    try { stopEngineSFX(); } catch(e) {}
    try { stopMusicSoundtrack(); } catch(e) {}

    // Wipe saved session (keep high score)
    try { localStorage.removeItem('dsa_vc_gs'); } catch(e) {}

    // Reset ALL game state to defaults
    scoreRef.current = 0;    setScore(0);
    cashRef.current = 0;     setCash(0);
    hpRef.current = 100;     setHp(100);
    maxHpRef.current = 100;  setMaxHp(100);
    maxAmmoRef.current = 12; setMaxAmmo(12);
    ammoRef.current = 12;    setAmmo(12);
    damageRef.current = 1;   setDamage(1);
    wantedRef.current = 0;   setWanted(0);
    setDoneTasks({});
    setModal(null);
    setActiveMission(null);
    setActiveBossUI(null);
    setBoosting(false);

    // Cancel any pending RAF batches
    if (flushRafRef.current) { cancelAnimationFrame(flushRafRef.current); flushRafRef.current = null; }
    pendingScoreRef.current = 0;
    pendingCashRef.current = 0;
    mcqActiveRef.current = false;

    // Start the game directly
    initPlay();
  }, [stopEngineSFX, stopMusicSoundtrack, initPlay]);

  // Keep the ref current so triggerGameOverRaf (a plain closure, defined earlier) can call it
  startNewGameRef.current = startNewGame;



  const showHelp = useCallback(() => {

    setModal({

      title: 'HOW TO PLAY', sub: 'DSA VICE CITY RUNTIME INSTRUCTIONS',

      q: `• GOAL: Cruise the grid, blast compiler bugs for cash, solve checkpoints.\n\n• CONTROLS (DESKTOP):\n  ← / → Arrow Keys = Steer Lanes\n  SPACE / Z Key = Fire Laser Weapon\n  R Key = Reload Ammo\n\n• CONTROLS (MOBILE):\n  Use screen touch buttons at the bottom.\n\n• OVERLAYS:\n  JOBS — solve specialized structure challenges.\n  UPGRADES — upgrade car with earned Cash.\n  BOSS — fight DSA syndicates in full combat UI.\n  NEURAL — Memory hacking minigame.`,

      opts: ["LET'S GO!"], noScore: true,

      onAns: () => setModal(null)

    });

  }, []);



  useEffect(() => { showMenuScreen(); }, []);



  const switchTab = useCallback((tabId) => {

    setActiveTab(tabId);

    if (tabId === 'drive') {

      if (phaseRef.current !== 'playing') { phaseRef.current = 'playing'; setPhase('playing'); startEngineSFX(); startMusicSoundtrack(); }

    } else {

      if (phaseRef.current === 'playing') { phaseRef.current = 'paused'; setPhase('paused'); stopEngineSFX(); stopMusicSoundtrack(); }

    }

  }, [startEngineSFX, startMusicSoundtrack, stopEngineSFX, stopMusicSoundtrack]);



  // ══ BOSS FIGHTS — Full-screen component, no more modal chain ══

  const startBossFight = useCallback((boss) => {

    playSfx('boss');

    triggerNarrator(`INCOMING: ${boss.title}`, 2000);

    setActiveBossUI(boss);

  }, [playSfx, triggerNarrator]);



  const handleBossDefeated = useCallback((boss) => {

    const bKey = `boss:${boss.id}`;

    setDoneTasks(prev => {

      const updated = { ...prev, [bKey]: true };

      triggerSave({ done: updated });

      return updated;

    });

    addCashRaf(boss.reward);

    addScoreRaf(boss.reward);

    scheduleFlush();

    playSfx('trophy');

    setAchievement(`${boss.title.toUpperCase()} TERMINATOR`);

    setTimeout(() => setAchievement(null), 4500);

  }, [playSfx, triggerSave, addCashRaf, addScoreRaf, scheduleFlush]);



  const handleBossPlayerDamage = useCallback((dmg) => {

    hpRef.current = Math.max(0, hpRef.current - dmg);

    setHp(hpRef.current);

  }, []);



  const handleBossExit = useCallback(() => {

    setActiveBossUI(null);

  }, []);



  // ══ UPGRADES ══

  const healCost = 500;

  const hpUpgradeCost = useMemo(() => 1500 + (maxHp - 100) * 40, [maxHp]);

  const ammoUpgradeCost = useMemo(() => 1200 + (maxAmmo - 12) * 50, [maxAmmo]);

  const dmgUpgradeCost = useMemo(() => 2500 + (damage - 1) * 1500, [damage]);



  const buyHeal = useCallback(() => {

    if (cashRef.current >= healCost && hpRef.current < maxHpRef.current) {

      const nc = cashRef.current - healCost; cashRef.current = nc; setCash(nc);

      hpRef.current = maxHpRef.current; setHp(maxHpRef.current);

      playSfx('cash'); triggerSave({cash:nc}); triggerNarrator('HULL REPAIRED!', 1500);

    }

  }, [playSfx, triggerSave, triggerNarrator]);



  const buyMaxHp = useCallback(() => {

    if (cashRef.current >= hpUpgradeCost) {

      const nc=cashRef.current-hpUpgradeCost; const nm=maxHpRef.current+20;

      cashRef.current = nc; setCash(nc); maxHpRef.current = nm; setMaxHp(nm);

      hpRef.current = nm; setHp(nm);

      playSfx('cash'); triggerSave({cash:nc,maxHp:nm}); triggerNarrator(`ARMOR INCREASED TO ${nm} HP!`, 1800);

    }

  }, [hpUpgradeCost, playSfx, triggerSave, triggerNarrator]);



  const buyMaxAmmo = useCallback(() => {

    if (cashRef.current >= ammoUpgradeCost) {

      const nc=cashRef.current-ammoUpgradeCost; const na=maxAmmoRef.current+2;

      cashRef.current = nc; setCash(nc); maxAmmoRef.current = na; setMaxAmmo(na);

      ammoRef.current = na; setAmmo(na);

      playSfx('cash'); triggerSave({cash:nc,maxAmmo:na}); triggerNarrator(`CLIP UPGRADED TO ${na}!`, 1800);

    }

  }, [ammoUpgradeCost, playSfx, triggerSave, triggerNarrator]);



  const buyDamage = useCallback(() => {

    if (cashRef.current >= dmgUpgradeCost) {

      const nc=cashRef.current-dmgUpgradeCost; const nd=damageRef.current+1;

      cashRef.current = nc; setCash(nc); damageRef.current = nd; setDamage(nd);

      playSfx('cash'); triggerSave({cash:nc,damage:nd}); triggerNarrator(`LASER UPGRADED TO LVL ${nd}!`, 1800);

    }

  }, [dmgUpgradeCost, playSfx, triggerSave, triggerNarrator]);



  const launchMissionTask = useCallback((task, mission) => {

    const qKey = `${mission.id}:${task.id}`;

    const q = MISSION_QUESTIONS[qKey] || randQ();

    setModal({

      title: `CRACKING: ${task.label}`, sub: `Job: ${mission.title}`,

      q: q.q, opts: q.opts, ans: q.ans,

      onAns: (opt) => {

        const ok = opt === q.ans;

        if (ok) {

          setDoneTasks(prev => {

            const updated = { ...prev, [qKey]: true };

            let doneAll = true;

            mission.tasks.forEach(t => { if (!updated[`${mission.id}:${t.id}`]) doneAll = false; });

            const bonus = doneAll ? mission.reward : 0;

            addCashRaf(400 + bonus); addScoreRaf(400 + bonus);

            scheduleFlush();

            playSfx('correct'); playSfx('cash');

            const bonusStr = doneAll ? ` | CHAPTER BONUS +$${mission.reward.toLocaleString()}!` : '';

            triggerSave({ done: updated });

            return updated;

          });

          return { correct: true, exp: q.exp, reward: `+$400 CASH REWARD` };

        } else { playSfx('wrong'); return { correct: false, exp: q.exp }; }

      },

      onClose: () => setModal(null)

    });

  }, [randQ, playSfx, addCashRaf, addScoreRaf, scheduleFlush, triggerSave]);



  // ══ TAB RENDERS ══

  const renderMissionsTab = useCallback(() => {

    if (activeMission) {

      return (

        <div style={{animation:'tab-enter 0.22s ease-out'}}>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px',paddingBottom:'10px',borderBottom:'1px solid rgba(245,158,11,0.2)'}}>

            <span style={{fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:700,color:activeMission.color}}>{activeMission.icon} {activeMission.title}</span>

            <button className="solve-btn" style={{background:'#444',color:'#fff',fontSize:'10px'}} onClick={() => setActiveMission(null)}>← BACK</button>

          </div>

          <p style={{fontSize:'11px',color:'#aaa',marginBottom:'14px'}}>{activeMission.desc}</p>

          {activeMission.tasks.map(task => {

            const key = `${activeMission.id}:${task.id}`;

            const done = isDone(key);

            const diffColor = task.diff === 'Easy' ? 'var(--neon-green)' : task.diff === 'Medium' ? 'var(--neon-orange)' : 'var(--neon-pink)';

            return (

              <div className={`m-task-row ${done ? 'task-done' : ''}`} key={task.id}>

                <div>

                  <div style={{fontSize:'13px',color:done?'var(--neon-green)':'#ffffff',fontWeight:700}}>{done?'✓ ':''}{task.label}</div>

                  <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{task.topic} · <span style={{color:diffColor}}>{task.diff}</span></div>

                </div>

                <div>{done ? <span style={{fontSize:'11px',color:'var(--neon-green)'}}>COMPLETED</span> : <button className="solve-btn" style={{background:activeMission.color}} onClick={() => launchMissionTask(task, activeMission)}>SOLVE →</button>}</div>

              </div>

            );

          })}

        </div>

      );

    }

    return (

      <div style={{animation:'tab-enter 0.22s ease-out'}}>

        <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:700,color:'var(--neon-orange)',marginBottom:'14px',letterSpacing:'2px'}}>JOBS DATABASE</div>

        <p style={{fontSize:'11px',color:'#888',marginBottom:'18px'}}>Execute critical coding heists across specialized structures.</p>

        {MISSIONS.map(m => {

          let completed = 0; m.tasks.forEach(t => { if (isDone(`${m.id}:${t.id}`)) completed++; });

          return (

            <div className="m-card" style={{borderLeft:`4px solid ${m.color}`}} key={m.id} onClick={() => setActiveMission(m)}>

              <div className="m-card-header">

                <span className="m-card-title" style={{color:m.color}}>{m.icon} {m.title}</span>

                <span style={{fontSize:'11px',color:'#fff'}}>{completed} / {m.tasks.length} DONE</span>

              </div>

              <div className="m-card-desc">{m.desc}</div>

              <div className="m-card-footer">

                <span>Topic: {m.topic}</span>

                <span style={{color:'var(--neon-orange)',fontWeight:700}}>+${m.reward.toLocaleString()} Reward</span>

              </div>

            </div>

          );

        })}

      </div>

    );

  }, [activeMission, isDone, launchMissionTask]);



  const renderBossTab = useCallback(() => (

    <div style={{animation:'tab-enter 0.22s ease-out'}}>

      <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:700,color:'var(--neon-orange)',marginBottom:'14px',letterSpacing:'2px'}}>BOSS SYNDICATES</div>

      <p style={{fontSize:'11px',color:'#888',marginBottom:'18px'}}>Confront algorithmic syndicates in real-time combat. Answer DSA questions to deal damage.</p>

      {BOSSES.map(b => {

        const beaten = isDone(`boss:${b.id}`);

        return (

          <div className="boss-card" style={{borderColor:b.color}} key={b.id}>

            <div style={{fontSize:'36px',marginBottom:'8px'}}>{b.icon}</div>

            <div style={{fontFamily:'var(--font-display)',fontSize:'16px',fontWeight:900,color:b.color,letterSpacing:'1px'}}>{b.title}</div>

            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',margin:'6px 0',fontStyle:'italic'}}>"{b.taunt[0]}"</div>

            <div className="boss-hp-bar"><div className="boss-hp-fill" style={{width:beaten?'0%':'100%',background:b.color}}></div></div>

            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'#aaa',marginBottom:'12px'}}>

              <span>Rounds: {b.qs.length} Questions</span>

              <span style={{color:'var(--neon-orange)',fontWeight:700}}>+${b.reward.toLocaleString()} Reward</span>

            </div>

            <div>{beaten

              ? <span style={{color:'var(--neon-green)',fontWeight:700,letterSpacing:'1.5px'}}>✓ CONQUERED</span>

              : <button className="m-btn" style={{background:b.color,color:'#000',width:'240px',margin:'0 auto',display:'block'}} onClick={() => startBossFight(b)}>⚔ CONFRONT SYNDICATE</button>

            }</div>

          </div>

        );

      })}

    </div>

  ), [isDone, startBossFight]);



  const renderUpgradesTab = useCallback(() => (

    <div style={{animation:'tab-enter 0.22s ease-out'}}>

      <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:700,color:'var(--neon-orange)',marginBottom:'14px',letterSpacing:'2px'}}>GRID UPGRADE GARAGE</div>

      <div style={{fontSize:'11px',color:'#888',marginBottom:'16px',display:'flex',justifyContent:'space-between'}}>

        <span>Upgrade car attributes.</span>

        <span style={{color:'#fff'}}>Balance: <span style={{color:'var(--neon-orange)',fontWeight:700}}>${cash.toLocaleString()}</span></span>

      </div>

      <div className="shop-grid">

        <div className="shop-card">

          <div><div className="shop-title">🔧 HULL REPAIR</div><div className="shop-desc">Restore vehicle to 100%. Current HP: {hp}/{maxHp}.</div></div>

          <div className="shop-buy-row"><span className="shop-cost">${healCost}</span><button className="buy-btn" onClick={buyHeal} disabled={hp >= maxHp || cash < healCost}>REPAIR</button></div>

        </div>

        <div className="shop-card">

          <div><div className="shop-title">🛡️ CHASSIS ARMOR</div><div className="shop-desc">Fortify hull limits. Current: {maxHp} HP.</div></div>

          <div className="shop-buy-row"><span className="shop-cost">${hpUpgradeCost}</span><button className="buy-btn" onClick={buyMaxHp} disabled={cash < hpUpgradeCost}>UPGRADE</button></div>

        </div>

        <div className="shop-card">

          <div><div className="shop-title">🔋 LASER MAGAZINE</div><div className="shop-desc">Enlarge clip limits. Current: {maxAmmo} Rounds.</div></div>

          <div className="shop-buy-row"><span className="shop-cost">${ammoUpgradeCost}</span><button className="buy-btn" onClick={buyMaxAmmo} disabled={cash < ammoUpgradeCost}>UPGRADE</button></div>

        </div>

        <div className="shop-card">

          <div><div className="shop-title">⚡ LASER DYNAMO</div><div className="shop-desc">Enhance energy particles. Current: Lvl {damage}.</div></div>

          <div className="shop-buy-row"><span className="shop-cost">${dmgUpgradeCost}</span><button className="buy-btn" onClick={buyDamage} disabled={cash < dmgUpgradeCost}>UPGRADE</button></div>

        </div>

      </div>

    </div>

  ), [cash, hp, maxHp, maxAmmo, damage, hpUpgradeCost, ammoUpgradeCost, dmgUpgradeCost, buyHeal, buyMaxHp, buyMaxAmmo, buyDamage]);



  const renderStatsTab = useCallback(() => {

    let tasksSolved = 0; MISSIONS.forEach(m => m.tasks.forEach(t => { if (isDone(`${m.id}:${t.id}`)) tasksSolved++; }));

    let bossDefeated = 0; BOSSES.forEach(b => { if (isDone(`boss:${b.id}`)) bossDefeated++; });

    let rankTitle = 'STREET PUNK (Lvl 1)', rankCol = '#888';

    if (score >= 60000) { rankTitle = 'DSA GODFATHER (Lvl 5)'; rankCol = 'var(--neon-pink)'; }

    else if (score >= 25000) { rankTitle = 'ALGORITHM KINGPIN (Lvl 4)'; rankCol = 'var(--neon-orange)'; }

    else if (score >= 10000) { rankTitle = 'POINTER OUTLAW (Lvl 3)'; rankCol = '#a78bfa'; }

    else if (score >= 3000) { rankTitle = 'BYTE HUSTLER (Lvl 2)'; rankCol = '#00e5ff'; }

    return (

      <div style={{animation:'tab-enter 0.22s ease-out'}}>

        <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:700,color:'var(--neon-orange)',marginBottom:'14px',letterSpacing:'2px'}}>ORGANIZATION PROFILE</div>

        <div className="stats-container" style={{borderLeft:`4px solid ${rankCol}`}}>

          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>CREDIBILITY RANK</div>

          <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:900,color:rankCol,marginTop:'4px',letterSpacing:'1px'}}>{rankTitle}</div>

        </div>

        <div className="stats-container">

          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:'8px'}}>Conquest Trophies</div>

          <div style={{display:'flex',gap:'12px',justifyContent:'space-around'}}>

            {BOSSES.map(b => { const beaten = isDone(`boss:${b.id}`); return (

              <div style={{flex:1,textAlign:'center',opacity:beaten?1:0.2,filter:beaten?'none':'grayscale(100%)',transition:'all 0.3s'}} key={b.id}>

                <div style={{fontSize:'38px',margin:'10px 0',display:'inline-block'}}>🏆</div>

                <div style={{fontSize:'9px',fontWeight:700,color:b.color,marginTop:'4px'}}>{b.title}</div>

                <div style={{fontSize:'8px',color:'#aaa',marginTop:'2px'}}>{beaten?'ACQUIRED':'LOCKED'}</div>

              </div>

            ); })}

          </div>

        </div>

        <div className="stats-container">

          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',textTransform:'uppercase'}}>Operational stats</div>

          <div className="stats-grid">

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>CASH EARNED</div><div className="stat-val" style={{color:'var(--neon-orange)'}}>${cash.toLocaleString()}</div></div>

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>HIGH SCORE</div><div className="stat-val" style={{color:'#00e5ff'}}>{highScore.toLocaleString()}</div></div>

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>JOBS EXECUTED</div><div className="stat-val" style={{color:'var(--neon-green)'}}>{tasksSolved} / 20</div></div>

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>SYNDICATES DOWN</div><div className="stat-val" style={{color:'#f43f5e'}}>{bossDefeated} / 3</div></div>

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>WEAPON TECH</div><div className="stat-val" style={{color:'#a78bfa'}}>Lvl {damage} LASER</div></div>

            <div className="stat-item"><div style={{fontSize:'9px',color:'#888'}}>MAX STABILITY</div><div className="stat-val">{maxHp} HP</div></div>

          </div>

        </div>

      </div>

    );

  }, [score, cash, highScore, damage, maxHp, isDone]);



  // ══ MODAL ══

  const renderActiveModal = useCallback(() => {

    if (!modal) return null;

    return (

      <div id="modal-overlay" className="active" style={{display:'flex'}}>

        <div id="modal-box">

          <div className="m-title">{modal.title}</div>

          <div className="m-sub">{modal.sub || ''}</div>

          {modal.q && <div className="m-q" style={modal.noScore ? {fontFamily:'var(--font-display)',fontSize:'13px',color:'var(--neon-orange)',textAlign:'center',whiteSpace:'pre-line'} : {}}>{modal.q}</div>}

          <div id="modal-options-block">

            {modal.opts && !modal.noScore && modal.opts.map((o, i) => (

              <button className="m-opt" id={`mo-${i}`} key={i} onClick={() => selectModalOption(i)}>{String.fromCharCode(65+i)}. {o}</button>

            ))}

            {modal.opts && modal.noScore && modal.opts.map((o, i) => (

              <button className="m-opt" key={i} onClick={() => selectRawOption(o)}>{o}</button>

            ))}

          </div>

          <div id="m-fb"></div>

        </div>

      </div>

    );

  }, [modal]);



  const selectModalOption = useCallback((idx) => {

    const o = modal.opts[idx];

    const res = modal.onAns(o);

    if (!res) return;

    for (let j = 0; j < modal.opts.length; j++) {

      const btn = document.getElementById(`mo-${j}`);

      if (btn) { btn.disabled = true; if (modal.opts[j] === modal.ans || (res.correct && j === idx)) btn.classList.add('correct'); else if (j === idx && !res.correct) btn.classList.add('wrong'); }

    }

    const fbBlock = document.getElementById('m-fb');

    if (fbBlock) {

      fbBlock.innerHTML = `<div class="${res.correct ? 'm-fb-ok' : 'm-fb-bad'}" style="margin-top:14px"><strong>${res.correct ? '✓ SUCCESS' : '✗ COMPILE ERROR'}</strong><br>${res.exp}${res.reward ? `<div style="color:var(--neon-orange);margin-top:6px;font-weight:700">${res.reward}</div>` : ''}</div><button class="m-btn" id="m-close-trigger-btn" style="margin-top:10px">${res.correct ? 'BACK TO MISSION' : 'CONTINUE'}</button>`;

      const cBtn = document.getElementById('m-close-trigger-btn');

      if (cBtn) cBtn.onclick = () => { setModal(null); if (modal.onClose) modal.onClose(); };

    }

  }, [modal]);



  const selectRawOption = useCallback((optionText) => { setModal(null); if (modal.onAns) modal.onAns(optionText); if (modal.onClose) modal.onClose(); }, [modal]);



  const hpPercent = useMemo(() => (hp / maxHp) * 100, [hp, maxHp]);



  // ══ STYLES ══

  const STYLES = `

    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

    :root {

      --neon-orange: #f59e0b; --neon-cyan: #00e5ff; --neon-pink: #f43f5e;

      --neon-green: #22d3a0; --neon-purple: #a78bfa; --dark-bg: #03020c;

      --font-display: 'Orbitron', monospace; --font-mono: 'JetBrains Mono', monospace;

      --glow-shadow: 0 0 20px rgba(245,158,11,0.5);

    }

    #vc-root { position:fixed; inset:0; background:var(--dark-bg); font-family:var(--font-mono); overflow:hidden; z-index:9000; }

    #crt-overlay { position:absolute; inset:0; background:linear-gradient(rgba(18,16,16,0) 50%,rgba(0,0,0,0.25) 50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04)); background-size:100% 4px,6px 100%; pointer-events:none; z-index:999; }

    #crt-scanner { position:absolute; top:0; left:0; right:0; height:100px; background:linear-gradient(to bottom,rgba(245,158,11,0),rgba(245,158,11,0.04),rgba(245,158,11,0)); animation:crt-scan 8s linear infinite; pointer-events:none; z-index:1000; }

    @keyframes crt-scan { 0%{transform:translateY(-100px)} 100%{transform:translateY(100vh)} }

    #menu-screen { position:absolute; inset:0; background:var(--dark-bg); z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; }

    #menu-canvas { position:absolute; inset:0; }

    #menu-content { position:relative; z-index:2; text-align:center; padding:24px; width:100%; max-width:440px; }

    #menu-logo { font-family:var(--font-display); font-size:clamp(32px,7vw,54px); font-weight:900; color:var(--neon-orange); text-shadow:0 0 30px var(--neon-orange),0 0 60px rgba(245,158,11,0.4); letter-spacing:4px; margin-bottom:6px; line-height:1.1; font-style:italic; animation:logo-flicker 3s infinite alternate; }

    @keyframes logo-flicker { 0%,19%,21%,23%,25%,54%,56%,100%{text-shadow:0 0 25px var(--neon-orange),0 0 50px rgba(245,158,11,0.4)} 20%,24%,55%{text-shadow:none;opacity:0.7} }

    #menu-sub { font-size:clamp(9px,2vw,13px); color:rgba(255,180,0,0.55); letter-spacing:6px; margin-bottom:8px; font-family:var(--font-display); font-weight:700; }

    #menu-tag { font-size:clamp(10px,1.8vw,13px); color:rgba(255,255,255,0.3); margin-bottom:36px; letter-spacing:1.5px; }

    .menu-btn { display:block; width:240px; padding:14px 28px; margin:10px auto; border:2px solid var(--neon-orange); color:var(--neon-orange); background:rgba(3,2,12,0.88); border-radius:4px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:2px; font-family:var(--font-display); transition:all 0.25s; text-align:center; box-shadow:inset 0 0 10px rgba(245,158,11,0.1); }

    .menu-btn:hover { background:var(--neon-orange); color:#000; box-shadow:0 0 30px rgba(245,158,11,0.7); transform:scale(1.05); }

    #tab-bar { position:absolute; top:0; left:0; right:0; height:48px; background:rgba(3,2,12,0.95); border-bottom:1.5px solid rgba(245,158,11,0.25); display:flex; align-items:center; z-index:15; box-shadow:0 3px 15px rgba(0,0,0,0.6); }

    .tab { flex:1; height:100%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); cursor:pointer; font-family:var(--font-display); letter-spacing:1px; transition:all 0.2s; border-bottom:2px solid transparent; }

    .tab:hover { color:rgba(255,255,255,0.85); background:rgba(245,158,11,0.03); }

    .tab.active { color:var(--neon-orange); border-bottom-color:var(--neon-orange); background:rgba(245,158,11,0.08); text-shadow:0 0 8px rgba(245,158,11,0.25); }

    #game-canvas { position:absolute; inset:0; z-index:1; }

    #overlay-tab { position:absolute; top:48px; left:0; right:0; bottom:80px; background:rgba(3,2,12,0.97); z-index:12; overflow-y:auto; padding:20px 16px; font-family:var(--font-mono); animation:tab-enter 0.22s ease-out; }

    @keyframes tab-enter { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }

    #ui { position:absolute; inset:0; pointer-events:none; z-index:10; display:grid; grid-template-columns:1fr 1fr; padding:16px; top:48px; bottom:80px; }

    #hud-tl { justify-self:start; align-self:start; }

    #hud-tr { justify-self:end; align-self:start; text-align:right; }

    .hud-box { background:rgba(8,8,20,0.85); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:8px 14px; margin-bottom:8px; backdrop-filter:blur(8px); pointer-events:all; box-shadow:0 4px 12px rgba(0,0,0,0.5); }

    .hud-label { font-size:9px; color:rgba(255,180,0,0.65); letter-spacing:2px; text-transform:uppercase; }

    .hud-val { font-size:20px; font-weight:900; color:#fff; font-family:var(--font-display); line-height:1.25; }

    #hb-bg { height:8px; background:rgba(255,255,255,0.1); border-radius:4px; margin-top:5px; overflow:hidden; width:140px; }

    #hb-fill { height:100%; border-radius:4px; transition:width 0.3s,background-color 0.3s; }

    #wanted-stars { display:flex; gap:4px; margin-top:4px; }

    .star { font-size:16px; color:#fff; opacity:0.15; transition:all 0.3s; }

    .star.on { opacity:1; color:var(--neon-orange); filter:drop-shadow(0 0 6px var(--neon-orange)); transform:scale(1.2); }

    #ammo-bar { display:flex; gap:3px; flex-wrap:wrap; max-width:130px; margin-top:5px; justify-content:flex-end; }

    .bullet { width:6px; height:14px; background:var(--neon-orange); border-radius:1px; box-shadow:0 0 4px rgba(245,158,11,0.6); }

    .bullet.used { opacity:0.12; background:#444; box-shadow:none; }

    #narrator { position:absolute; top:40%; left:50%; transform:translate(-50%,-50%) scale(0.85); background:rgba(3,2,12,0.95); border:2px solid var(--neon-orange); border-radius:8px; padding:12px 26px; color:var(--neon-orange); font-size:14px; font-weight:700; letter-spacing:1.5px; text-align:center; transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1),opacity 0.2s; opacity:0; pointer-events:none; white-space:nowrap; font-family:var(--font-display); text-shadow:0 0 10px var(--neon-orange); max-width:90%; z-index:15; }

    #narrator.show { transform:translate(-50%,-50%) scale(1); opacity:1; }

    #touch-ctrl { position:absolute; bottom:0; left:0; right:0; height:80px; display:flex; justify-content:space-between; align-items:center; padding:0 20px; background:rgba(3,2,12,0.92); border-top:1px solid rgba(245,158,11,0.25); z-index:20; }

    .tc-btn { background:rgba(245,158,11,0.08); border:1.5px solid rgba(245,158,11,0.45); border-radius:50%; color:var(--neon-orange); font-size:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; touch-action:manipulation; width:58px; height:58px; transition:all 0.1s; }

    .tc-btn:active { background:rgba(245,158,11,0.35); border-color:#fff; transform:scale(0.92); }

    #modal-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.88); z-index:100; display:none; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px); }

    #modal-overlay.active { display:flex; }

    #modal-box { background:#080814; border:2px solid var(--neon-orange); border-radius:14px; padding:24px; width:100%; max-width:460px; max-height:90vh; overflow-y:auto; font-family:var(--font-mono); box-shadow:0 0 35px rgba(245,158,11,0.3); animation:modal-enter 0.25s cubic-bezier(0.34,1.56,0.64,1); }

    @keyframes modal-enter { 0%{transform:scale(0.9);opacity:0} 100%{transform:scale(1);opacity:1} }

    .m-title { font-family:var(--font-display); font-size:18px; font-weight:900; color:var(--neon-orange); margin-bottom:4px; letter-spacing:2px; }

    .m-sub { font-size:11px; color:rgba(255,255,255,0.45); letter-spacing:2px; margin-bottom:18px; }

    .m-q { font-size:14px; color:#fff; line-height:1.7; margin-bottom:18px; padding:14px; background:rgba(245,158,11,0.05); border-left:3px solid var(--neon-orange); border-radius:0 8px 8px 0; }

    .m-opt { width:100%; padding:12px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:rgba(255,255,255,0.85); font-size:13px; cursor:pointer; text-align:left; font-family:var(--font-mono); margin-bottom:8px; transition:all 0.15s; }

    .m-opt:hover:not([disabled]) { background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.5); color:var(--neon-orange); transform:translateX(4px); }

    .m-opt.correct { background:rgba(34,211,160,0.12)!important; border-color:var(--neon-green)!important; color:var(--neon-green)!important; font-weight:700; }

    .m-opt.wrong { background:rgba(244,63,94,0.12)!important; border-color:var(--neon-pink)!important; color:var(--neon-pink)!important; font-weight:700; }

    .m-fb-ok { padding:12px 14px; border-radius:8px; font-size:13px; line-height:1.7; margin-bottom:14px; background:rgba(34,211,160,0.08); border:1px solid rgba(34,211,160,0.3); color:var(--neon-green); }

    .m-fb-bad { padding:12px 14px; border-radius:8px; font-size:13px; line-height:1.7; margin-bottom:14px; background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.3); color:var(--neon-pink); }

    .m-btn { width:100%; padding:12px; background:var(--neon-orange); color:#000; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; border:none; font-family:var(--font-display); letter-spacing:1.5px; margin-top:6px; transition:transform 0.1s,opacity 0.15s; }

    .m-btn:hover { opacity:0.9; }

    .m-card { background:rgba(255,255,255,0.02); border:1.5px solid rgba(255,255,255,0.07); border-radius:10px; padding:16px; margin-bottom:12px; cursor:pointer; transition:all 0.2s; }

    .m-card:hover { transform:translateY(-2px); background:rgba(255,255,255,0.04); }

    .m-card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }

    .m-card-title { font-family:var(--font-display); font-weight:700; font-size:14px; }

    .m-card-desc { font-size:11px; color:rgba(255,255,255,0.4); line-height:1.5; margin-bottom:12px; }

    .m-card-footer { display:flex; justify-content:space-between; font-size:11px; color:rgba(255,255,255,0.3); }

    .m-task-row { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; }

    .m-task-row.task-done { background:rgba(34,211,160,0.05); border-color:rgba(34,211,160,0.2); }

    .solve-btn { padding:7px 14px; color:#000; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; border:none; font-family:var(--font-mono); transition:transform 0.1s; }

    .solve-btn:hover { transform:scale(1.05); }

    .boss-card { background:rgba(255,255,255,0.02); border:2px solid rgba(255,255,255,0.06); border-radius:12px; padding:18px; margin-bottom:16px; text-align:center; }

    .boss-hp-bar { height:6px; background:rgba(255,255,255,0.1); border-radius:3px; width:100%; margin:12px 0 16px; overflow:hidden; }

    .boss-hp-fill { height:100%; background:var(--neon-pink); transition:width 0.4s; }

    .shop-grid { display:grid; grid-template-columns:1fr; gap:12px; margin-top:14px; }

    @media(min-width:480px) { .shop-grid { grid-template-columns:1fr 1fr; } }

    .shop-card { background:rgba(8,8,20,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s; }

    .shop-card:hover { border-color:var(--neon-cyan); transform:translateY(-2px); }

    .shop-title { font-family:var(--font-display); font-size:13px; font-weight:700; margin-bottom:4px; color:#fff; }

    .shop-desc { font-size:11px; color:rgba(255,255,255,0.4); line-height:1.4; margin-bottom:12px; }

    .shop-buy-row { display:flex; justify-content:space-between; align-items:center; }

    .shop-cost { color:var(--neon-orange); font-weight:700; font-size:13px; }

    .buy-btn { padding:6px 12px; background:var(--neon-cyan); color:#000; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer; border:none; }

    .buy-btn:disabled { background:#333; color:#666; cursor:not-allowed; }

    .stats-container { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin-bottom:16px; }

    .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:14px; }

    .stat-item { background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; }

    .stat-val { font-family:var(--font-display); font-size:18px; font-weight:700; margin-top:4px; color:#fff; }

    .achievement-popup { position:absolute; bottom:92px; right:16px; background:rgba(8,8,20,0.95); border:2px solid var(--neon-orange); border-radius:8px; padding:12px 18px; z-index:99; display:flex; align-items:center; gap:12px; box-shadow:0 0 25px rgba(245,158,11,0.4); animation:slide-in-ach 0.4s cubic-bezier(0.34,1.56,0.64,1); }

    @keyframes slide-in-ach { 0%{transform:translateX(120%);opacity:0} 100%{transform:translateX(0);opacity:1} }


    /* ── MOBILE RESPONSIVE ── */
    @media(max-width:480px) {
      #menu-content { padding:16px 12px; }
      .menu-btn { width:200px; font-size:12px; padding:12px 20px; }
      #overlay-tab { padding:14px 10px; }
      .m-q { font-size:13px; padding:12px; }
      .m-opt { font-size:12px; padding:10px 12px; }
      .m-title { font-size:16px; }
      .tab { font-size:9px; letter-spacing:0.5px; }
      .hud-box { padding:6px 10px; }
      .hud-val { font-size:16px; }
      #hb-bg { width:100px; }
      .tc-btn { width:52px; height:52px; font-size:18px; }
      .stats-grid { grid-template-columns:1fr 1fr; gap:10px; }
    }

  `;



  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);



  return (

    <div id="vc-root">

      <style>{STYLES}</style>

      <div id="crt-overlay"><div id="crt-scanner"></div></div>



      {phase === 'idle' && (

        <div id="menu-screen">

          <canvas id="menu-canvas" ref={menuCanvasRef}></canvas>

          <div id="menu-content">

            <div id="menu-logo">DSA VICE CITY</div>

            <div id="menu-sub">DATA STRUCTURES & ALGORITHMS</div>

            <div id="menu-tag">Master code. Rule the city.</div>

            <button className="menu-btn" onClick={startNewGame}>▶ NEW GAME</button>

            {(cash > 0 || score > 0) && <button className="menu-btn" onClick={initPlay}>► CONTINUE</button>}

            <button className="menu-btn" onClick={showHelp}>? HOW TO PLAY</button>

            <div style={{marginTop:'22px',fontSize:'9px',color:'rgba(255,255,255,0.22)',letterSpacing:'2px'}}>DRIVE · JOBS · BOSS COMBAT · NEURAL MEMORY · UPGRADES</div>

          </div>

        </div>

      )}



      {phase !== 'idle' && (

        <>

          <div id="tab-bar">

            <div className={`tab ${activeTab==='drive'?'active':''}`} onClick={() => switchTab('drive')}>DRIVE</div>

            <div className={`tab ${activeTab==='missions'?'active':''}`} onClick={() => switchTab('missions')}>JOBS</div>

            <div className={`tab ${activeTab==='boss'?'active':''}`} onClick={() => switchTab('boss')}>BOSS</div>

            <div className={`tab ${activeTab==='neural'?'active':''}`} onClick={() => switchTab('neural')}>NEURAL</div>

            <div className={`tab ${activeTab==='skills'?'active':''}`} onClick={() => switchTab('skills')}>UPGRADES</div>

            <div className={`tab ${activeTab==='rank'?'active':''}`} onClick={() => switchTab('rank')}>STATS</div>

          </div>



          <canvas id="game-canvas" ref={canvasRef} style={{display: activeTab==='drive' ? 'block' : 'none'}}></canvas>



          {activeTab !== 'drive' && (

            <div id="overlay-tab">

              {activeTab === 'missions' && renderMissionsTab()}

              {activeTab === 'boss' && renderBossTab()}

              {activeTab === 'neural' && (

                <MemoryTrainer

                  onEarnCash={(amount) => { addCashRaf(amount); addScoreRaf(amount); scheduleFlush(); playSfx('cash'); }}

                  playSfx={playSfx}

                />

              )}

              {activeTab === 'skills' && renderUpgradesTab()}

              {activeTab === 'rank' && renderStatsTab()}

            </div>

          )}



          <div id="ui" style={{display: activeTab==='drive' ? 'grid' : 'none'}}>

            <div id="hud-tl">

              <div className="hud-box"><div className="hud-label">SCORE</div><div className="hud-val">{score}</div></div>

              <div className="hud-box">

                <div className="hud-label">HEALTH</div>

                <div className="hud-val">{hp} / {maxHp}</div>

                <div id="hb-bg"><div id="hb-fill" style={{width:`${hpPercent}%`,background: hpPercent>50?'var(--neon-green)':hpPercent>25?'var(--neon-orange)':'var(--neon-pink)'}}></div></div>

              </div>

              <div className="hud-box">

                <div className="hud-label">WANTED</div>

                <div id="wanted-stars">{[1,2,3,4,5].map(n => <span className={`star ${n<=wanted?'on':''}`} key={n}>★</span>)}</div>

              </div>

            </div>

            <div id="hud-tr">

              <div className="hud-box"><div className="hud-label">CASH</div><div className="hud-val" style={{color:'var(--neon-orange)'}}>${cash.toLocaleString()}</div></div>

              <div className="hud-box">

                <div className="hud-label">AMMO</div>

                <div id="ammo-bar">{Array.from({length:maxAmmo}).map((_,i) => <div className={`bullet ${i>=ammo?'used':''}`} key={i}></div>)}</div>

              </div>

              {boosting && <div className="hud-box"><div className="hud-val" style={{fontSize:'12px',color:'var(--neon-cyan)'}}>BOOSTING!</div></div>}

            </div>

            <div id="narrator" className={narrator.show ? 'show' : ''}>{narrator.text}</div>

          </div>



          <div id="touch-ctrl" style={{display: isMobile ? 'flex' : 'none'}}>

            <div style={{display:'flex',gap:'12px'}}>

              <button className="tc-btn" onTouchStart={() => { physicsRef.current.keys['ArrowLeft']=true; }} onTouchEnd={() => { physicsRef.current.keys['ArrowLeft']=false; }}>◀</button>

              <button className="tc-btn" onTouchStart={() => { physicsRef.current.keys['ArrowRight']=true; }} onTouchEnd={() => { physicsRef.current.keys['ArrowRight']=false; }}>▶</button>

            </div>

            <div style={{fontSize:'10px',color:'rgba(245,158,11,0.35)',letterSpacing:'2px',fontFamily:'var(--font-display)',fontWeight:700}}>VICE CITY</div>

            <div style={{display:'flex',gap:'12px'}}>

              <button className="tc-btn" onTouchStart={() => { physicsRef.current.keys['Space']=true; }} onTouchEnd={() => { physicsRef.current.keys['Space']=false; }}>🔥</button>

              <button className="tc-btn" onTouchStart={() => { physicsRef.current.keys['KeyR']=true; }} onTouchEnd={() => { physicsRef.current.keys['KeyR']=false; }}>🔄</button>

            </div>

          </div>

        </>

      )}



      {/* Full-screen Boss Battle UI — rendered over everything */}

      {activeBossUI && (

        <BossBattle

          boss={activeBossUI}

          playerHp={hp}

          playerMaxHp={maxHp}

          onDamagePlayer={handleBossPlayerDamage}

          onBossDefeated={handleBossDefeated}

          onExit={handleBossExit}

          playSfx={playSfx}

          triggerNarrator={triggerNarrator}

        />

      )}



      {renderActiveModal()}



      {achievement && (

        <div className="achievement-popup">

          <div style={{fontSize:'28px'}}>🏆</div>

          <div>

            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>ACHIEVEMENT CONQUERED</div>

            <div style={{fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:900,color:'var(--neon-orange)'}}>{achievement}</div>

          </div>

        </div>

      )}

    </div>

  );

}



// ══════════════════════════════════════

// PORTAL WRAPPER — renders game directly to document.body

// so position:fixed/absolute elements own the true viewport

// ══════════════════════════════════════

export default function GameMode() {

  const [mounted, setMounted] = useState(false);

  // gameKey forces a full remount of GameModeInner on New Game,
  // guaranteeing zero stale state survives across sessions.
  const [gameKey, setGameKey] = useState(0);

  const handleNewGame = useCallback(() => {
    // Wipe ALL persisted game data BEFORE the new instance mounts
    try {
      localStorage.removeItem('dsa_vc_gs');
      // Note: we intentionally keep 'dsa_vc_hs' (high score) and
      // 'dsa_mt_hs' (memory trainer high score) — those are records, not session state.
    } catch(e) {}
    // Bump key → React unmounts old GameModeInner and mounts a brand-new one
    setGameKey(k => k + 1);
  }, []);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  if (!mounted) return null;

  return createPortal(
    <GameModeInner key={gameKey} onNewGame={handleNewGame} />,
    document.body
  );

}