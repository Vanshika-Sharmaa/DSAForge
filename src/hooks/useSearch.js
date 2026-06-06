import { useState, useRef } from 'react'
import { addHistory } from '../utils/history'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export function useSearch() {
  const [arr, setArr] = useState([])
  const [active, setActive] = useState([])
  const [visited, setVisited] = useState([])
  const [found, setFound] = useState(-1)
  const [steps, setSteps] = useState(0)
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)
  const stopRef = useRef(false)

  const generate = (sorted = false) => {
    const a = Array.from({ length: 18 }, () => Math.floor(Math.random() * 98) + 1)
    if (sorted) a.sort((x, y) => x - y)
    setArr(a); setActive([]); setVisited([]); setFound(-1); setSteps(0); setLog([])
  }

  const stop = () => { stopRef.current = true; setRunning(false) }

  const runLinear = async (target, speed) => {
    stopRef.current = false; setRunning(true)
    setActive([]); setVisited([]); setFound(-1); setSteps(0); setLog([])
    const vis = []
    for (let i = 0; i < arr.length && !stopRef.current; i++) {
      setActive([i]); setSteps(i + 1)
      setLog(l => [...l, `Step ${i + 1}: arr[${i}] = ${arr[i]} ${arr[i] === target ? '✅ FOUND!' : '❌ Not a match'}`])
      await sleep(310 - speed * 25)
      if (arr[i] === target) {
        setFound(i); setRunning(false)
        // ── HISTORY FIX: search never wrote to history before ──
        addHistory({
          type: 'Search',
          meta: { algorithm: 'Linear Search', target, foundAt: `index ${i}`, steps: i + 1 },
        })
        return
      }
      vis.push(i); setVisited([...vis])
    }
    setLog(l => [...l, `${target} not found in array`])
    setActive([]); setRunning(false)
    addHistory({
      type: 'Search',
      meta: { algorithm: 'Linear Search', target, result: 'Not found', steps: arr.length },
    })
  }

  const runBinary = async (target, speed) => {
    stopRef.current = false; setRunning(true)
    setActive([]); setVisited([]); setFound(-1); setSteps(0); setLog([])
    let lo = 0, hi = arr.length - 1, step = 0
    const vis = []
    while (lo <= hi && !stopRef.current) {
      const mid = Math.floor((lo + hi) / 2); step++
      setActive([lo, mid, hi]); setSteps(step)
      setLog(l => [...l, `Step ${step}: lo=${lo} mid=${mid} hi=${hi} → arr[${mid}]=${arr[mid]}`])
      await sleep(400 - speed * 30)
      if (arr[mid] === target) {
        setFound(mid); setRunning(false)
        addHistory({
          type: 'Search',
          meta: { algorithm: 'Binary Search', target, foundAt: `index ${mid}`, steps: step },
        })
        return
      }
      vis.push(mid); setVisited([...vis])
      if (arr[mid] < target) lo = mid + 1; else hi = mid - 1
    }
    setLog(l => [...l, `${target} not found in array`])
    setActive([]); setRunning(false)
    addHistory({
      type: 'Search',
      meta: { algorithm: 'Binary Search', target, result: 'Not found', steps: step },
    })
  }

  return { arr, active, visited, found, steps, log, running, generate, runLinear, runBinary, stop }
}