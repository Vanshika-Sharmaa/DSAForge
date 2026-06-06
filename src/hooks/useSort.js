import { useState, useRef, useCallback } from 'react'
import { addHistory } from '../utils/history'

const sleep = ms => new Promise(r => setTimeout(r, ms))

export function useSort() {
  const [arr, setArr] = useState([])
  const [comparing, setComparing] = useState([])
  const [sortedIdx, setSortedIdx] = useState([])
  const [pivot, setPivot] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 })
  const [running, setRunning] = useState(false)
  const stopRef = useRef(false)

  const generate = useCallback((size = 40) => {
    stopRef.current = true
    setTimeout(() => {
      const a = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5)
      setArr(a)
      setComparing([])
      setSortedIdx([])
      setPivot(-1)
      setStats({ comparisons: 0, swaps: 0, time: 0 })
      setRunning(false)
      stopRef.current = false
    }, 50)
  }, [])

  const stop = () => { stopRef.current = true; setRunning(false) }

  const runSort = async (algo, speed) => {
    if (running) return
    stopRef.current = false
    setRunning(true)
    setSortedIdx([])
    setComparing([])
    const a = [...arr]
    const sorted = new Set()
    let c = 0, s = 0
    const delay = () => sleep(210 - speed * 19)
    const startTime = Date.now()

    const upd = (comp, sw, pv = -1) => {
      c = comp; s = sw
      setComparing([...comp])
      setPivot(pv)
      setStats({ comparisons: c, swaps: s, time: Date.now() - startTime })
    }

    if (algo === 'bubble') {
      for (let i = 0; i < a.length && !stopRef.current; i++) {
        let swapped = false
        for (let j = 0; j < a.length - i - 1 && !stopRef.current; j++) {
          upd([j, j + 1], s)
          c++
          if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; s++ }
          setArr([...a])
          await delay()
          swapped = true
        }
        sorted.add(a.length - 1 - i)
        setSortedIdx([...sorted])
        if (!swapped) break
      }
    } else if (algo === 'selection') {
      for (let i = 0; i < a.length - 1 && !stopRef.current; i++) {
        let minIdx = i
        for (let j = i + 1; j < a.length && !stopRef.current; j++) {
          upd([j, minIdx], s); c++
          if (a[j] < a[minIdx]) minIdx = j
          setArr([...a]); await delay()
        }
        if (minIdx !== i) { [a[i], a[minIdx]] = [a[minIdx], a[i]]; s++ }
        sorted.add(i); setSortedIdx([...sorted]); setArr([...a])
      }
      sorted.add(a.length - 1); setSortedIdx([...sorted])
    } else if (algo === 'insertion') {
      sorted.add(0)
      for (let i = 1; i < a.length && !stopRef.current; i++) {
        let key = a[i], j = i - 1
        while (j >= 0 && a[j] > key && !stopRef.current) {
          upd([j, j + 1], s); c++
          a[j + 1] = a[j]; j--; s++
          setArr([...a]); await delay()
        }
        a[j + 1] = key; sorted.add(i)
        setSortedIdx([...sorted]); setArr([...a])
      }
    } else if (algo === 'merge') {
      const mergeSort = async (lo, hi) => {
        if (lo >= hi || stopRef.current) return
        const mid = Math.floor((lo + hi) / 2)
        await mergeSort(lo, mid); await mergeSort(mid + 1, hi)
        const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1)
        let i = 0, j = 0, k = lo
        while (i < L.length && j < R.length && !stopRef.current) {
          upd([k], s); c++
          a[k++] = L[i] <= R[j] ? L[i++] : R[j++]
          setArr([...a]); await delay()
        }
        while (i < L.length && !stopRef.current) { a[k++] = L[i++]; setArr([...a]); await sleep(delay() / 2) }
        while (j < R.length && !stopRef.current) { a[k++] = R[j++]; setArr([...a]); await sleep(delay() / 2) }
        for (let x = lo; x <= hi; x++) sorted.add(x)
        setSortedIdx([...sorted])
      }
      await mergeSort(0, a.length - 1)
    } else if (algo === 'quick') {
      const partition = async (lo, hi) => {
        const pv = a[hi]; let i = lo - 1
        setPivot(hi)
        for (let j = lo; j < hi && !stopRef.current; j++) {
          upd([j, hi], s, hi); c++
          if (a[j] <= pv) { i++; [a[i], a[j]] = [a[j], a[i]]; s++ }
          setArr([...a]); await delay()
        }
        ;[a[i + 1], a[hi]] = [a[hi], a[i + 1]]; s++
        setArr([...a]); return i + 1
      }
      const qs = async (lo, hi) => {
        if (lo >= hi || stopRef.current) return
        const pi = await partition(lo, hi)
        sorted.add(pi); setSortedIdx([...sorted])
        await qs(lo, pi - 1); await qs(pi + 1, hi)
      }
      await qs(0, a.length - 1)
    }

    if (!stopRef.current) {
      for (let i = 0; i < a.length; i++) sorted.add(i)
      setSortedIdx([...sorted])
      setComparing([]); setPivot(-1)

      const finalTime = Date.now() - startTime
      setStats(prev => ({ ...prev, time: finalTime }))

      // ── HISTORY FIX: sorting never wrote to history before ──
      addHistory({
        type: 'Sorting',
        meta: {
          algorithm: algo.charAt(0).toUpperCase() + algo.slice(1) + ' Sort',
          arraySize: a.length,
          comparisons: c,
          swaps: s,
          timeMs: finalTime,
        },
      })
    }
    setRunning(false)
  }

  return { arr, comparing, sortedIdx, pivot, stats, running, generate, runSort, stop }
}
