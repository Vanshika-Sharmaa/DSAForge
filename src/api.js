const BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

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
    throw { errorCode: "NETWORK_ERROR", message: "Cannot reach backend." };
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

export async function checkHealth() {
  return request("GET", "/health");
}

export async function aiAnalyzeCode(code = "", question = "", language = "javascript") {
  return request("POST", "/analyze", { code, question, language });
}

export async function staticAnalyze(code) {
  return request("POST", "/static-analyze", { code });
}
