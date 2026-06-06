import { useState, useRef, useEffect, useCallback } from "react";
import { checkHealth, aiAnalyzeCode } from "../api";
import { addHistory } from "../utils/history";

const WELCOME = `**Welcome to DSA AI Analyzer 🚀**

Ask any algorithm question or paste code for a full analysis:

• **Time & Space Complexity** — Big-O with explanations
• **Step-by-step Dry Runs** — trace through real examples
• **Optimization Tips** — better approaches and trade-offs
• **Edge Case Detection** — inputs that could break your code

Try a quick prompt on the right, or paste your code below!`;

const QUICK_PROMPTS = [
  { label: "Bubble Sort complexity", q: "Explain time and space complexity of bubble sort with a dry run" },
  { label: "Binary vs Linear Search", q: "Binary search vs Linear search — when to use each?" },
  { label: "Merge Sort walkthrough", q: "Explain merge sort with a step-by-step dry run example" },
  { label: "BFS vs DFS", q: "What is the difference between BFS and DFS? When to use each?" },
  { label: "Dynamic Programming", q: "What is dynamic programming? Explain with the Fibonacci example" },
  { label: "Hash Table collisions", q: "How does a hash table handle collisions? Explain chaining vs open addressing" },
  { label: "QuickSort worst case", q: "When does quicksort degrade to O(n²)? How to avoid it?" },
  { label: "Linked List vs Array", q: "Linked list vs Array — pros, cons, and when to use each" },
];

function renderMarkdown(raw) {
  if (!raw) return "";
  return raw
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b5fd">$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code style="background:#1a1d2e;padding:1px 5px;border-radius:3px;color:#22d3a0;font-size:0.95em">$1</code>')
    .replace(/^#{1,3} (.+)$/gm, '<div style="font-weight:700;color:#e8eaf6;margin:10px 0 4px;font-size:13px;border-bottom:1px solid #2a2e45;padding-bottom:3px">$1</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="padding-left:14px;color:#9095b0;margin:1px 0">▸ $1</div>')
    .replace(/^\d+\. (.+)$/gm, '<div style="padding-left:14px;color:#9095b0;margin:1px 0">$1</div>')
    .replace(/\n/g, "<br/>");
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#a78bfa",
          animation: `aiDotPulse 1.2s ${d}s ease-in-out infinite`,
        }} />
      ))}
      <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: 4, fontFamily: "JetBrains Mono" }}>
        Groq AI is thinking...
      </span>
    </div>
  );
}

function StatusBadge({ status, apiKey }) {
  const cfg = {
    connected:   { color: "#22d3a0", bg: "rgba(34,211,160,0.1)",  border: "rgba(34,211,160,0.3)",  dot: "●", label: "Connected"   },
    missing_key: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  dot: "●", label: "No API Key"  },
    offline:     { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.3)",   dot: "○", label: "Offline"     },
    checking:    { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)", dot: "◌", label: "Checking..." },
  };
  const s = status === "connected" && !apiKey ? "missing_key" : status;
  const c = cfg[s] || cfg.checking;
  return (
    <span style={{
      fontSize: 10, padding: "2px 9px", borderRadius: 4, fontFamily: "JetBrains Mono",
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
    }}>
      {c.dot} {c.label}
    </span>
  );
}

function StatusRow({ label, ok, pending, okText, failText }) {
  const color = pending ? "#6b7280" : ok ? "#22d3a0" : "#f43f5e";
  const icon  = pending ? "◌" : ok ? "✓" : "✗";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "5px 0", borderBottom: "1px solid var(--border)",
      fontSize: 10, fontFamily: "JetBrains Mono",
    }}>
      <span style={{ color: "var(--text3)" }}>{label}</span>
      <span style={{ color }}>{icon} {pending ? "..." : ok ? okText : failText}</span>
    </div>
  );
}

export default function AIAnalyzer({ initialCode = "" }) {
  const [messages,      setMessages]      = useState([{ role: "ai", text: WELCOME }]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [apiKeyReady,   setApiKeyReady]   = useState(false);
  const chatRef       = useRef(null);
  const inputRef      = useRef(null);
  const healthTimer   = useRef(null);

  // ── Health polling ────────────────────────────────────────────────────────
  const pollHealth = useCallback(async () => {
    try {
      const data = await checkHealth();
      setBackendStatus("connected");
      setApiKeyReady(!!data.ai);
    } catch {
      setBackendStatus("offline");
      setApiKeyReady(false);
    }
  }, []);

  useEffect(() => {
    pollHealth();
    healthTimer.current = setInterval(pollHealth, 5000);
    return () => clearInterval(healthTimer.current);
  }, [pollHealth]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // ── Pre-fill from Playground ──────────────────────────────────────────────
  useEffect(() => {
    if (initialCode) { setInput(initialCode); inputRef.current?.focus(); }
  }, [initialCode]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const send = useCallback(async (overrideText) => {
    const raw = (overrideText ?? input).trim();
    if (!raw || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: raw }]);
    setLoading(true);

    const looksLikeCode =
      raw.includes("function ") || raw.includes("def ") || raw.includes("class ") ||
      (raw.includes("{") && raw.includes("}") && raw.split("\n").length > 2);

    try {
      const data = await aiAnalyzeCode(
        looksLikeCode ? raw : "",
        looksLikeCode ? "" : raw
      );

      if (data?.errorCode) {
        const isMissingKey = data.errorCode === "MISSING_API_KEY";
        setMessages(prev => [...prev, {
          role: "ai", isError: true, errorCode: data.errorCode,
          text: isMissingKey
            ? `**Groq API Key Not Configured** ⚠️\n\n${data.error}\n\n**Steps to fix:**\n1. Open \`.env\` file in project root\n2. Set \`GROQ_API_KEY=gsk_your_key\`\n3. Restart: \`npm run server\``
            : `**Analysis Error** ❌\n\n${data.error}`,
        }]);
        if (isMissingKey) setApiKeyReady(false);
      } else {
        setMessages(prev => [...prev, { role: "ai", text: data.analysis }]);
        setBackendStatus("connected");
        setApiKeyReady(true);
        addHistory({ type: "AI Analysis", meta: { query: raw.slice(0, 80), mode: "groq-ai" } });
      }
    } catch (err) {
      setBackendStatus("offline");
      setMessages(prev => [...prev, {
        role: "ai", isError: true, errorCode: "NETWORK_ERROR",
        text: `**Backend Offline** ❌\n\n${err.message || "Cannot reach server."}\n\n**Run in a new terminal:**\n\`npm run server\``,
      }]);
    }

    setLoading(false);
  }, [input, loading]);

  const clearChat = useCallback(() => {
    setMessages([{ role: "ai", text: WELCOME }]);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes aiDotPulse { 0%,100%{opacity:.25;transform:scale(.75)} 50%{opacity:1;transform:scale(1)} }
        .ai-input:focus { border-color: rgba(108,99,255,0.7) !important; outline: none; }
        .qprompt-btn:hover { background: rgba(108,99,255,0.15) !important; border-color: rgba(108,99,255,0.4) !important; color: #c4b5fd !important; }
      `}</style>

      <style>{`@media(min-width:768px){ .ai-layout-grid { grid-template-columns: minmax(0,1fr) 270px !important; } }`}</style>
      <div className="ai-layout-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 14, height: "100%", minHeight: 0 }}>

        {/* ── Chat Panel ── */}
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "11px 16px", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", letterSpacing: "0.07em" }}>
                AI ANALYZER
              </span>
              <span style={{
                fontSize: 9, padding: "2px 6px", borderRadius: 3,
                background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)",
                color: "#a78bfa", fontFamily: "JetBrains Mono",
              }}>llama-3.3-70b</span>
            </div>
            <StatusBadge status={backendStatus} apiKey={apiKeyReady} />
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{
            flex: 1, overflow: "auto", padding: "14px 16px",
            display: "flex", flexDirection: "column", gap: 10, minHeight: 0,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: msg.role === "user" ? "75%" : "96%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                fontSize: 12, lineHeight: 1.85, fontFamily: "JetBrains Mono",
                background: msg.role === "user"
                  ? "rgba(108,99,255,0.18)"
                  : msg.isError ? "rgba(244,63,94,0.07)" : "var(--bg)",
                border: `1px solid ${msg.role === "user"
                  ? "rgba(108,99,255,0.35)"
                  : msg.isError ? "rgba(244,63,94,0.25)" : "var(--border)"}`,
                color: msg.role === "user" ? "#d4caff" : "var(--text2)",
                animation: "fadeSlideIn 0.15s ease",
              }}>
                {msg.role === "ai"
                  ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                  : <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                }
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: "flex-start",
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "12px 12px 12px 4px",
              }}>
                <TypingDots />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <textarea
              ref={inputRef}
              className="ai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Paste code or ask a DSA question...  (Enter ↵ to send, Shift+Enter for new line)"
              rows={3}
              style={{
                width: "100%", background: "var(--bg)",
                border: "1px solid var(--border2)", borderRadius: 8,
                padding: "10px 12px", fontFamily: "JetBrains Mono",
                fontSize: 12, color: "var(--text)", resize: "none",
                lineHeight: 1.7, boxSizing: "border-box", transition: "border-color 0.2s",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                style={{
                  flex: 1, padding: "9px 0",
                  background: loading || !input.trim() ? "#3d3a5e" : "#6c63ff",
                  color: loading || !input.trim() ? "#6b7280" : "#fff",
                  border: "none", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontFamily: "JetBrains Mono", transition: "all 0.2s", letterSpacing: "0.03em",
                }}
              >
                {loading ? "Analyzing..." : "Analyze ↗"}
              </button>
              <button
                onClick={clearChat}
                style={{
                  padding: "9px 16px", background: "var(--surface)",
                  color: "var(--text3)", border: "1px solid var(--border)",
                  borderRadius: 7, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "JetBrains Mono",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto", minHeight: 0 }}>

          {/* Status Card */}
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 14px 12px",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 10 }}>
              BACKEND STATUS
            </div>
            <StatusRow label="Server" ok={backendStatus === "connected"} pending={backendStatus === "checking"} okText="localhost:3000" failText="Run: npm run server" />
            <StatusRow label="API Key" ok={apiKeyReady} pending={backendStatus === "checking"} okText="Configured ✓" failText="Missing in .env" />
            <StatusRow label="Model" ok={apiKeyReady} pending={backendStatus === "checking"} okText="llama-3.3-70b" failText="—" />

            {!apiKeyReady && backendStatus === "connected" && (
              <div style={{
                marginTop: 10, padding: "8px 10px", borderRadius: 6,
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
                fontSize: 10, fontFamily: "JetBrains Mono", color: "#f59e0b", lineHeight: 1.6,
              }}>
                Add to <span style={{ color: "#22d3a0" }}>.env</span> file:<br />
                <span style={{ color: "#e8eaf6" }}>GROQ_API_KEY=gsk_...</span><br />
                Then restart: <span style={{ color: "#e8eaf6" }}>npm run server</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 10 }}>
              QUICK PROMPTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  className="qprompt-btn"
                  onClick={() => send(p.q)}
                  disabled={loading}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "7px 10px", fontSize: 10,
                    color: "var(--text2)", cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "left", fontFamily: "JetBrains Mono",
                    opacity: loading ? 0.5 : 1, transition: "all 0.15s",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 8 }}>
              TIPS
            </div>
            {[
              "Paste full function code for best results",
              'Ask "explain with dry run" for walkthroughs',
              "Use Playground → AI Analyze button",
              "Enter to send, Shift+Enter for new line",
            ].map((t, i, arr) => (
              <div key={i} style={{
                fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono",
                padding: "4px 0", lineHeight: 1.5,
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                · {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
