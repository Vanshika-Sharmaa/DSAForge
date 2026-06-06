import { useState, useEffect, useRef, useCallback } from 'react'
import SmartTimerWidget  from '../components/SmartTimerWidget'
import SmartHintSystem   from '../components/SmartHintSystem'
import PostSolveModal    from '../components/PostSolveModal'
import { speak, VoiceEvents } from '../utils/voice'
import { recordSolved, getDueRevisions } from '../utils/memory'
import { recordMistake, MistakeType } from '../utils/mistakes'
import { addHistory } from '../utils/history'
import { QUESTION_BANK, TOPICS } from '../data/questionBank'

const QUESTIONS = (QUESTION_BANK && QUESTION_BANK.length > 0 ? QUESTION_BANK : [])
  .map((q, i) => ({
    id         : q.id          || `q_${i}`,
    title      : q.title       || q.name        || `Question ${i + 1}`,
    topic      : q.topic       || q.category    || 'DSA',
    difficulty : q.difficulty  || 'Medium',
    timeSec    : q.timeSec     || q.timeLimit    || 300,
    optimalSec : q.optimalSec  || q.optimal      || 90,
    desc       : q.desc        || q.description  || q.problem || '',
    example    : q.example     || q.examples     || '',
    constraints: q.constraints || q.constraint   || '',
    starterCode: q.starterCode || q.starter      || q.code    ||
      `// ${q.title || 'Solve the problem'}\nfunction solution() {\n  // your code here\n}\n`,
  }))

const ALL_TOPICS = ['All', ...(
  Array.isArray(TOPICS) && TOPICS.length > 0
    ? TOPICS
    : [...new Set(QUESTIONS.map(q => q.topic))]
)]

function pickRandom(list) {
  if (!list || list.length === 0) return null
  return list[Math.floor(Math.random() * list.length)]
}

function voiceSpeak(text) {
  try {
    if (!window.speechSynthesis) return
    const doSpeak = () => {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 0.92; u.volume = 1; u.pitch = 1
      window.speechSynthesis.speak(u)
    }
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
    } else { doSpeak() }
  } catch (_) {}
}

const THINK_DURATION = 120

export default function PracticePage() {
  const [qIndex,        setQIndex]        = useState(0)
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [code,          setCode]          = useState('')
  const [output,        setOutput]        = useState('')
  const [status,        setStatus]        = useState('idle')

  const filteredQuestions = selectedTopic === 'All' ? QUESTIONS : QUESTIONS.filter(q => q.topic === selectedTopic)
  const q = filteredQuestions[qIndex] || filteredQuestions[0] || QUESTIONS[0]

  const [thinkMode,   setThinkMode]   = useState(true)
  const [thinkRemain, setThinkRemain] = useState(THINK_DURATION)
  const thinkRef = useRef(null)

  const [mistakes,    setMistakes]    = useState(0)
  const [hintsUsed,   setHintsUsed]   = useState(0)
  const [points,      setPoints]      = useState(100)
  const [runCount,    setRunCount]    = useState(0)
  const [lastRunCode, setLastRunCode] = useState('')
  const [solveModal,  setSolveModal]  = useState(false)
  const [solveData,   setSolveData]   = useState({})
  const [dueRevisions,setDueRevisions]= useState([])

  const startTimeRef = useRef(Date.now())
  const idleTimer    = useRef(null)

  useEffect(() => {
    setCode(q.starterCode); setOutput(''); setStatus('idle')
    setMistakes(0); setHintsUsed(0); setPoints(100); setRunCount(0); setLastRunCode('')
    setThinkMode(true); setThinkRemain(THINK_DURATION)
    startTimeRef.current = Date.now()
    VoiceEvents.thinkMode()
    voiceSpeak(`Solve this: ${q.title}`)
    setDueRevisions(getDueRevisions())
    clearInterval(thinkRef.current)
    let t = THINK_DURATION
    thinkRef.current = setInterval(() => {
      t -= 1; setThinkRemain(t)
      if (t <= 0) { clearInterval(thinkRef.current); setThinkMode(false); VoiceEvents.thinkModeUnlock() }
    }, 1000)
    return () => clearInterval(thinkRef.current)
  }, [qIndex]) // eslint-disable-line

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => VoiceEvents.idle(), 90_000)
  }, [])
  useEffect(() => { resetIdle(); return () => clearTimeout(idleTimer.current) }, [code, resetIdle])

  const runCode = () => {
    if (thinkMode) { speak('Think mode active. Wait for the editor to unlock before running.', { priority: true }); return }
    const newCount = runCount + 1; setRunCount(newCount)
    if (newCount > 5 && code === lastRunCode) VoiceEvents.tooManyRuns()
    setLastRunCode(code)
    const logs = []
    const fakeConsole = { log: (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')) }
    try {
      new Function('console', 'performance', code)(fakeConsole, performance)
      const txt = logs.join('\n') || '// No output'
      setOutput(txt); setStatus('success')
      addHistory({ type: 'Practice Run', meta: { question: q.title, status: 'success' } })
    } catch (e) {
      setOutput('Error: ' + e.message); setStatus('error')
      setMistakes(m => m + 1); setPoints(p => Math.max(0, p - 10))
      VoiceEvents.mistake(e.message.slice(0, 60))
      recordMistake({ questionId: q.id, questionTitle: q.title, topic: q.topic, type: MistakeType.SYNTAX_ERROR, code })
    }
  }

  const submit = () => {
    if (status !== 'success') { speak('Run your code first and verify the output before submitting.'); return }
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const finalPts = Math.max(0, points - hintsUsed * 5)
    recordSolved({ id: q.id, title: q.title, topic: q.topic, code, timeSec: elapsed, mistakes })
    addHistory({ type: 'Practice Solved', meta: { question: q.title, timeSec: elapsed, points: finalPts } })
    setSolveData({ timeSec: elapsed, optimalSec: q.optimalSec, mistakes, hintsUsed, pointsEarned: finalPts, topic: q.title })
    setSolveModal(true)
  }

  const skipThinkMode = () => {
    clearInterval(thinkRef.current); setThinkMode(false); setThinkRemain(0); VoiceEvents.thinkModeUnlock()
  }

  const nextQuestion = () => {
    const pool = filteredQuestions.length > 1 ? filteredQuestions.filter((_, i) => i !== qIndex) : filteredQuestions
    const next = pickRandom(pool); if (!next) return
    const idx = filteredQuestions.indexOf(next); setQIndex(idx >= 0 ? idx : 0)
  }

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic)
    const nf = topic === 'All' ? QUESTIONS : QUESTIONS.filter(q => q.topic === topic)
    const next = pickRandom(nf); const newIdx = next ? nf.indexOf(next) : 0
    setQIndex(newIdx >= 0 ? newIdx : 0)
  }

  return (
    <>
      <style>{`
        .pp-page { display:flex; flex-direction:column; gap:10px; height:100%; overflow-y:auto; }

        /* ── Question card header ── */
        .pp-qhdr { display:flex; flex-direction:column; gap:6px; }
        .pp-qhdr-top { display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap; }
        .pp-title { font-size:13px; font-weight:700; color:var(--text); flex:1; min-width:0; }
        .pp-controls { display:flex; gap:6px; align-items:center; flex-wrap:wrap; flex-shrink:0; }
        .pp-tags { display:flex; gap:5px; flex-wrap:wrap; }
        .pp-badge-row { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:2px; }

        /* ── Main editor+side layout ── */
        .pp-main { display:flex; flex-direction:column; gap:10px; flex:1; min-height:0; }
        .pp-editor-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:12px; display:flex; flex-direction:column;
          overflow:hidden; min-height:300px;
        }
        .pp-editor-card textarea {
          flex:1; background:var(--bg); border:none;
          padding:14px; font-family:'JetBrains Mono',monospace;
          font-size:12px; color:var(--text); resize:none; outline:none;
          line-height:1.8; min-height:200px;
        }
        .pp-side { display:flex; flex-direction:column; gap:10px; }

        @media(min-width:768px){
          .pp-main { flex-direction:row; }
          .pp-editor-card { flex:1; min-width:0; }
          .pp-editor-card textarea { min-height:unset; }
          .pp-side { width:300px; flex-shrink:0; overflow-y:auto; }
        }
      `}</style>

      <div className="pp-page">

        {/* ── Question Card ── */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
          <div className="pp-qhdr">
            {/* Title row */}
            <div className="pp-qhdr-top">
              <span className="pp-title">{q.title}</span>
              <div className="pp-controls">
                <select value={selectedTopic} onChange={e => handleTopicChange(e.target.value)} style={{
                  background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text)',
                  borderRadius:6, padding:'4px 8px', fontSize:10, fontFamily:'JetBrains Mono',
                  cursor:'pointer', outline:'none',
                }}>
                  {ALL_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={nextQuestion} style={sBtn('var(--text3)')}>Next →</button>
              </div>
            </div>

            {/* Tags + badge row */}
            <div className="pp-badge-row">
              <div className="pp-tags">
                <Tag label={q.topic} color="#a78bfa" />
                <Tag label={q.difficulty} color={q.difficulty==='Easy'?'#22d3a0':q.difficulty==='Medium'?'#f59e0b':'#f43f5e'} />
                <Tag label={`⭐ ${points}pts`} color="#f59e0b" />
                {mistakes > 0 && <Tag label={`✗ ${mistakes}`} color="#f43f5e" />}
              </div>
              {dueRevisions.length > 0 && (
                <span style={{
                  fontSize:10, padding:'3px 8px', borderRadius:5,
                  background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)',
                  color:'#f59e0b', fontFamily:'JetBrains Mono',
                }}>
                  📅 {dueRevisions.length} due for revision
                </span>
              )}
            </div>
          </div>

          <p style={{ fontSize:12, color:'var(--text2)', marginTop:8, lineHeight:1.5, marginBottom:0 }}>{q.desc}</p>

          {q.example && (
            <div style={{ marginTop:8, padding:'8px 10px', background:'var(--bg2)', borderRadius:6, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#a78bfa', marginBottom:4, fontFamily:'JetBrains Mono' }}>EXAMPLE</div>
              <pre style={{ fontSize:11, color:'var(--text2)', margin:0, whiteSpace:'pre-wrap', fontFamily:'JetBrains Mono' }}>{q.example}</pre>
            </div>
          )}
          {q.constraints && (
            <div style={{ marginTop:6, padding:'6px 10px', background:'rgba(244,63,94,0.05)', borderRadius:6, border:'1px solid rgba(244,63,94,0.2)' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#f43f5e', marginBottom:4, fontFamily:'JetBrains Mono' }}>CONSTRAINTS</div>
              <pre style={{ fontSize:11, color:'var(--text2)', margin:0, whiteSpace:'pre-wrap', fontFamily:'JetBrains Mono' }}>{q.constraints}</pre>
            </div>
          )}
        </div>

        {/* Timer */}
        <SmartTimerWidget totalSec={q.timeSec} autoStart />

        {/* Think Mode Banner */}
        {thinkMode && (
          <div style={{
            background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.4)',
            borderRadius:8, padding:'10px 14px',
            display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8,
          }}>
            <div>
              <span style={{ fontSize:13, fontWeight:700, color:'#a78bfa' }}>🧠 THINK MODE</span>
              <span style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>
                Editor unlocks in {thinkRemain}s
              </span>
            </div>
            <button onClick={skipThinkMode} style={sBtn('#a78bfa')}>Skip Think</button>
          </div>
        )}

        {/* Editor + Side */}
        <div className="pp-main">
          <div className="pp-editor-card" style={{ opacity:thinkMode?0.45:1, transition:'opacity 0.4s' }}>
            <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', fontSize:11, fontWeight:700, color:'var(--text2)' }}>
              CODE EDITOR {thinkMode && '🔒'}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={thinkMode}
              spellCheck={false}
              style={{ cursor: thinkMode ? 'not-allowed' : 'text' }}
            />
            <div style={{
              borderTop:'1px solid var(--border)', padding:'8px 12px',
              maxHeight:90, overflow:'auto', fontFamily:'JetBrains Mono',
              fontSize:11, color:status==='error'?'#f43f5e':'#22d3a0', whiteSpace:'pre-wrap',
            }}>
              {output || '// Output appears here'}
            </div>
            <div style={{ display:'flex', gap:8, padding:'10px 12px', borderTop:'1px solid var(--border)', flexWrap:'wrap' }}>
              <button onClick={runCode} style={aBtn('#6c63ff')}>▶ Run</button>
              <button onClick={submit}  style={aBtn('#22d3a0')}>✓ Submit</button>
            </div>
          </div>

          <div className="pp-side">
            <SmartHintSystem
              topic={q.title}
              totalPoints={points}
              onDeduct={d => { setPoints(p => Math.max(0, p - d)); setHintsUsed(h => h + 1) }}
            />
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text2)', marginBottom:8 }}>📊 SESSION STATS</div>
              {[['Runs',runCount],['Mistakes',mistakes,'#f43f5e'],['Hints',hintsUsed,'#f59e0b'],['Points',points,'#22d3a0']].map(([l,v,c])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid var(--border)', fontSize:11 }}>
                  <span style={{ color:'var(--text3)' }}>{l}</span>
                  <span style={{ fontFamily:'JetBrains Mono', color:c||'var(--text)', fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <PostSolveModal
        isOpen={solveModal}
        solveData={solveData}
        onClose={() => { setSolveModal(false); nextQuestion() }}
      />
    </>
  )
}

function Tag({ label, color }) {
  return (
    <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:`${color}15`, border:`1px solid ${color}35`, color, fontFamily:'JetBrains Mono', fontWeight:600 }}>
      {label}
    </span>
  )
}
function sBtn(c) {
  return { background:'transparent', border:`1px solid ${c}50`, color:c, borderRadius:6, padding:'4px 10px', fontSize:10, fontFamily:'JetBrains Mono', cursor:'pointer' }
}
function aBtn(c) {
  return { background:c, color:'#fff', border:'none', borderRadius:7, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'JetBrains Mono' }
}