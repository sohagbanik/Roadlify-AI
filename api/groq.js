// Vercel Serverless Function — Groq API Proxy
// Keeps the GROQ_API_KEY secret on the server side

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "GROQ_API_KEY not configured on server", code: "missing_key" } });
  }

  try {
    const { model, messages, temperature, max_completion_tokens } = req.body;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        messages,
        temperature: temperature ?? 0.7,
        max_completion_tokens: max_completion_tokens ?? 4000,
      }),
    });

    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Server error: " + err.message } });
  }
}
