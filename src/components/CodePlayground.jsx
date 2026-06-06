import { useState } from 'react'
import { addHistory } from '../utils/history'

const TEMPLATES = {
  bubble: `// Bubble Sort
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1])
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
    }
  }
  return arr;
}
const arr = [64, 34, 25, 12, 22, 11, 90];
console.log("Input:", arr.join(", "));
console.log("Sorted:", bubbleSort([...arr]).join(", "));`,

  binary: `// Binary Search
function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1, steps = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2); steps++;
    console.log(\`Step \${steps}: checking [\${mid}] = \${arr[mid]}\`);
    if (arr[mid] === target) return { index: mid, steps };
    arr[mid] < target ? lo = mid + 1 : hi = mid - 1;
  }
  return { index: -1, steps };
}
const sorted = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log("Array:", sorted.join(", "));
console.log("Result:", JSON.stringify(binarySearch(sorted, 23)));`,

  linkedlist: `// Linked List
class Node { constructor(v) { this.val = v; this.next = null; } }
class LinkedList {
  constructor() { this.head = null; }
  append(v) {
    const node = new Node(v);
    if (!this.head) { this.head = node; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
  print() {
    const vals = []; let cur = this.head;
    while (cur) { vals.push(cur.val); cur = cur.next; }
    console.log(vals.join(" → ") + " → null");
  }
  reverse() {
    let prev = null, cur = this.head;
    while (cur) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; }
    this.head = prev;
  }
}
const ll = new LinkedList();
[10,20,30,40,50].forEach(v => ll.append(v));
console.log("Original:"); ll.print();
ll.reverse();
console.log("Reversed:"); ll.print();`,

  stack: `// Stack + Balanced Parentheses
class Stack {
  constructor() { this.items = []; }
  push(e) { this.items.push(e); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}
function isBalanced(str) {
  const stack = new Stack();
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of str) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (')]}'.includes(ch)) {
      if (stack.isEmpty() || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.isEmpty();
}
const tests = ['({[]})', '((())', '{[}]', ''];
tests.forEach(t => console.log(\`"\${t}" → \${isBalanced(t) ? 'Balanced' : 'Not balanced'}\`));`,

  fibonacci: `// Fibonacci — 3 Approaches Comparison
// 1. Recursive O(2^n)
function fibRec(n) { return n<=1 ? n : fibRec(n-1)+fibRec(n-2); }

// 2. Memoization O(n)
function fibMemo(n, memo={}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fibMemo(n-1,memo)+fibMemo(n-2,memo);
}

// 3. Bottom-up DP O(n)
function fibDP(n) {
  if (n<=1) return n;
  let a=0, b=1;
  for(let i=2;i<=n;i++) [a,b]=[b,a+b];
  return b;
}

console.log("n  | Recursive | Memo    | DP");
console.log("---|-----------|---------|--------");
[1,5,10,20,30,40].forEach(n => {
  const t1=performance.now(); const r=n<=25?fibRec(n):'skip'; const e1=(performance.now()-t1).toFixed(2);
  const t2=performance.now(); const m=fibMemo(n); const e2=(performance.now()-t2).toFixed(2);
  const t3=performance.now(); const d=fibDP(n); const e3=(performance.now()-t3).toFixed(2);
  console.log(\`\${String(n).padEnd(3)}| \${String(r).padEnd(10)}| \${String(m).padEnd(8)}| \${d}  [\${e1}ms vs \${e2}ms]\`);
});`,

  queue: `// Queue + BFS shortest path
class Queue {
  constructor() { this.items = []; }
  enqueue(e) { this.items.push(e); }
  dequeue() { return this.items.shift(); }
  isEmpty() { return this.items.length === 0; }
}
function bfsShortestPath(graph, start, end) {
  const q = new Queue(), visited = new Set([start]);
  q.enqueue([start, [start]]);
  while (!q.isEmpty()) {
    const [node, path] = q.dequeue();
    if (node === end) return path;
    for (const nb of (graph[node] || [])) {
      if (!visited.has(nb)) { visited.add(nb); q.enqueue([nb, [...path, nb]]); }
    }
  }
  return null;
}
const graph = { A:['B','C'], B:['A','D','E'], C:['A','F'], D:['B'], E:['B','F'], F:['C','E'] };
const path = bfsShortestPath(graph, 'A', 'F');
console.log("Graph:", JSON.stringify(graph));
console.log("Shortest A→F:", path?.join(" → "));
console.log("Path length:", path?.length - 1, "edges");`
}

export default function CodePlayground({ onAnalyzeWithAI }) {
  const [code, setCode] = useState(TEMPLATES.bubble)
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('idle')
  const [activeTemplate, setActiveTemplate] = useState('bubble')

  const runCode = () => {
    const logs = []
    const fakeConsole = {
      log: (...a) => logs.push(
        a.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ')
      )
    }
    const startTime = performance.now()
    try {
      new Function('console', 'performance', code)(fakeConsole, performance)
      const elapsed = (performance.now() - startTime).toFixed(1)
      setOutput(logs.join('\n') || '// No output')
      setStatus('success')

      // ── HISTORY FIX: code runs never wrote to history before ──
      addHistory({
        type: 'Code Run',
        meta: {
          template: activeTemplate,
          lines: code.split('\n').length,
          outputLines: logs.length,
          timeMs: elapsed,
          status: 'success',
        },
      })
    } catch (e) {
      setOutput('Error: ' + e.message)
      setStatus('error')
      addHistory({
        type: 'Code Run',
        meta: { template: activeTemplate, status: 'error', error: e.message.slice(0, 80) },
      })
    }
  }

  const loadTemplate = (key) => {
    setCode(TEMPLATES[key])
    setActiveTemplate(key)
    setOutput('')
    setStatus('idle')
  }

  return (
    <>
    <style>{`@media(min-width:768px){ .playground-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    <div className="playground-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 16, height: '100%' }}>
      {/* Editor */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>CODE EDITOR</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22d3a0', display: 'inline-block' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {Object.keys(TEMPLATES).map(k => (
            <button key={k} onClick={() => loadTemplate(k)} style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700, cursor: 'pointer',
              background: activeTemplate === k ? 'rgba(108,99,255,0.2)' : 'var(--surface)',
              border: `1px solid ${activeTemplate === k ? 'var(--accent)' : 'var(--border)'}`,
              color: activeTemplate === k ? '#a78bfa' : 'var(--text2)', textTransform: 'capitalize'
            }}>{k}</button>
          ))}
        </div>
        <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false} style={{
          flex: 1, background: 'var(--bg)', border: 'none', padding: 14, fontFamily: 'JetBrains Mono',
          fontSize: 12, color: 'var(--text)', resize: 'none', outline: 'none', lineHeight: 1.8, WebkitTextSizeAdjust: '100%'
        }} />
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
          <Btn onClick={runCode} primary>▶ Run</Btn>
          <Btn onClick={() => onAnalyzeWithAI(code)} green>🤖 AI Analyze</Btn>
          <Btn onClick={() => { setCode(''); setOutput(''); setStatus('idle') }}>✕ Clear</Btn>
        </div>
      </div>

      {/* Output */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: '0.06em' }}>OUTPUT</span>
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono', fontWeight: 700,
            background: status === 'success' ? 'rgba(34,211,160,0.1)' : status === 'error' ? 'rgba(244,63,94,0.1)' : 'var(--surface)',
            border: `1px solid ${status === 'success' ? 'rgba(34,211,160,0.3)' : status === 'error' ? 'rgba(244,63,94,0.3)' : 'var(--border)'}`,
            color: status === 'success' ? '#22d3a0' : status === 'error' ? '#f43f5e' : 'var(--text3)'
          }}>{status === 'success' ? '✓ Success' : status === 'error' ? '✗ Error' : '—'}</span>
        </div>
        <pre style={{ flex: 1, margin: 0, padding: 14, fontFamily: 'JetBrains Mono', fontSize: 12, color: status === 'error' ? '#f43f5e' : '#22d3a0', lineHeight: 1.8, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
          {output || '// Run code to see output here...'}
        </pre>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>
          Click "AI Analyze" to send this code for complexity analysis
        </div>
      </div>
    </div>
    </>
  )
}

function Btn({ children, onClick, primary, green }) {
  return <button onClick={onClick} style={{
    background: primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.15)' : 'var(--surface)',
    color: primary ? '#fff' : green ? '#22d3a0' : 'var(--text2)',
    border: `1px solid ${primary ? '#6c63ff' : green ? 'rgba(34,211,160,0.3)' : 'var(--border)'}`,
    borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'JetBrains Mono'
  }}>{children}</button>
}