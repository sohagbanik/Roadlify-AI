async function callGroq(history) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history];
  const apiKey = (typeof GROQ_API_KEY !== "undefined" && GROQ_API_KEY) ? GROQ_API_KEY.trim() : (State.groqKey ? State.groqKey.trim() : "");
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_completion_tokens: 4000 }),
  });
  const data = await res.json();
  if (data.error) {
    const msg = data.error.message || "";
    if (data.error.code === "invalid_api_key" || msg.includes("Invalid API Key")) throw new Error("INVALID_KEY");
    if (res.status === 429 || msg.includes("rate_limit")) throw new Error("QUOTA_EXCEEDED");
    throw new Error("API_ERROR: " + msg);
  }
  return data.choices?.[0]?.message?.content || "";
}
function parseRoadmap(reply) {
  const m = reply.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}
