/**
 * DSA Analyzer — Frontend API Client
 * All requests go through Vite's proxy: /api → localhost:3000
 * Never use absolute URLs here — proxy handles it.
 */

const BASE = "/api";

async function request(method, path, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch {
    throw { errorCode: "NETWORK_ERROR", message: "Cannot reach backend. Is npm run server running?" };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      errorCode: data?.errorCode || "HTTP_ERROR",
      message: data?.error || `HTTP ${res.status}`,
    };
  }

  return data;
}

/** Check backend health — returns { status, ai, provider } */
export async function checkHealth() {
  return request("GET", "/health");
}

/** AI-powered analysis via Groq */
export async function aiAnalyzeCode(code = "", question = "", language = "javascript") {
  return request("POST", "/analyze", { code, question, language });
}

/** Fast static pattern detection — no AI needed */
export async function staticAnalyze(code) {
  return request("POST", "/static-analyze", { code });
}
