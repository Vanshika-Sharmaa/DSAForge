import Groq from "groq-sdk";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env file ─────────────────────────────────────────────────────────
try {
  const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
} catch { /* no .env file — fine */ }

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: "*" }));

// ── Lazy Groq client ───────────────────────────────────────────────────────
let _client = null;
function getClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("MISSING_API_KEY");
  if (!_client) _client = new Groq({ apiKey: key });
  return _client;
}

// ── Health — always 200 ────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    ai: !!process.env.GROQ_API_KEY,
    provider: "Groq",
    version: "2.0",
  });
});

app.get("/", (_req, res) => res.json({ status: "ok", version: "2.0" }));

// ── Main AI analysis ───────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  const { code = "", question = "", language = "javascript" } = req.body;
  const query = (question || code || "").trim();

  if (!query) {
    return res.status(400).json({
      errorCode: "EMPTY_INPUT",
      error: "Please provide code or a question.",
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({
      errorCode: "MISSING_API_KEY",
      error: "GROQ_API_KEY not set. Add it to your .env file and restart the server.",
    });
  }

  try {
    const groq = getClient();
    const isCodeInput = code.trim().length > 20 && !question.trim();

    const systemPrompt = `You are an expert DSA (Data Structures & Algorithms) tutor and code analyzer.
Provide clear, structured analysis using **bold headers** for sections.
Be concise but thorough. Always include concrete examples.`;

    const userPrompt = isCodeInput
      ? `Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Cover these sections:
1. **Algorithm / Pattern** — what is this?
2. **Time Complexity** — Big-O with explanation
3. **Space Complexity** — with explanation
4. **Dry Run Example** — step-by-step with small input
5. **Edge Cases** — inputs that could cause issues
6. **Optimization** — how could this be improved?`
      : query;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    });

    return res.json({
      analysis: completion.choices[0].message.content,
      model: completion.model,
      inputTokens:  completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
    });

  } catch (err) {
    console.error("[/api/analyze]", err.message);
    const isKeyError =
      err.status === 401 ||
      err.message?.includes("API key") ||
      err.message?.includes("auth") ||
      err.message?.includes("MISSING_API_KEY");

    return res.status(200).json({
      errorCode: isKeyError ? "MISSING_API_KEY" : "API_ERROR",
      error: isKeyError
        ? "Invalid or missing GROQ_API_KEY. Check .env and restart."
        : `Analysis failed: ${err.message}`,
    });
  }
});

// ── Static fallback — no AI needed ────────────────────────────────────────
app.post("/api/static-analyze", (req, res) => {
  const { code = "" } = req.body;
  if (!code.trim()) return res.status(400).json({ error: "Code required" });

  const c = code.toLowerCase();
  let pattern = "unknown";
  if (/for.*for|bubble|selection|insertion|merge|quick|heap/.test(c)) pattern = "sorting";
  else if (/binary|linear|search|indexof|find/.test(c)) pattern = "searching";
  else if (/graph|bfs|dfs|adjacen|queue|visited/.test(c)) pattern = "graph";
  else if (/recur|factorial|fibonacci/.test(c)) pattern = "recursion";

  const map = {
    sorting:   { time: "O(n²) average", space: "O(1)–O(n)" },
    searching: { time: "O(log n) binary / O(n) linear", space: "O(1)" },
    graph:     { time: "O(V + E)", space: "O(V)" },
    recursion: { time: "O(2ⁿ) worst case", space: "O(n) stack" },
    unknown:   { time: "O(n) estimated", space: "O(1) estimated" },
  };

  res.json({ pattern, timeComplexity: map[pattern].time, spaceComplexity: map[pattern].space });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running → http://localhost:${PORT}`);
  console.log(process.env.GROQ_API_KEY
    ? "   ✅ GROQ API KEY SET"
    : "   ⚠️  GROQ_API_KEY missing — add to .env"
  );
  console.log();
});
