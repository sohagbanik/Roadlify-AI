// ============================================================
//  chat.js — Chat screen
// ============================================================

function initChat() {
  State.conversationHistory = [];
  const msgsEl = document.getElementById("chat-messages");
  if (msgsEl) msgsEl.innerHTML = "";

  // Update user chip in topbar if it exists
  const u = State.user;
  if (u) {
    // Update sidebar avatar/name on dashboard too
    const av = document.getElementById("dash-avatar");
    const nm = document.getElementById("dash-name");
    const mt = document.getElementById("dash-meta");
    if (av) av.textContent = u.avatar || "U";
    if (nm) nm.textContent = u.name   || "Student";
    if (mt) mt.textContent = u.email  || "Roadlify AI";
  }

  addBotMessage(
    `👋 Welcome to **Roadlify AI**${u?.name ? ", " + u.name.split(" ")[0] : ""}!\n\n` +
    `Tell me:\n` +
    `- **Your current skills** (e.g. "I know basic C, 1st year college")\n` +
    `- **Your career goal** (e.g. "I want to become a Full Stack Developer")\n` +
    `- **Your time duration** (e.g. "I want to achieve this in 12 months")\n\n` +
    `I'll generate a personalised industry-ready roadmap for you! 🚀`
  );
}

function addBotMessage(text, showGoalBtn = false, roadmap = null) {
  const msgs    = document.getElementById("chat-messages");
  if (!msgs) return;
  const wrapper = document.createElement("div");
  wrapper.className = "msg bot";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble bot-bubble";
  bubble.innerHTML  = formatMd(text);
  wrapper.appendChild(bubble);

  if (showGoalBtn && roadmap) {
    const btn = document.createElement("button");
    btn.className = "set-goal-btn";
    btn.innerHTML = `<span class="material-symbols-outlined">flag</span> Set as my Goal &amp; Open Dashboard`;
    btn.onclick   = () => {
      setGoalAndBuild(roadmap);
      btn.disabled    = true;
      btn.innerHTML   = `<span class="material-symbols-outlined">check_circle</span> Goal Set — Dashboard Open!`;
    };
    wrapper.appendChild(btn);
  }
  msgs.appendChild(wrapper);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById("chat-messages");
  if (!msgs) return;
  const wrapper = document.createElement("div");
  wrapper.className = "msg user";
  wrapper.innerHTML = `<div class="msg-bubble user-bubble">${escHtml(text)}</div>`;
  msgs.appendChild(wrapper);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById("chat-messages");
  if (!msgs) return;
  const div = document.createElement("div");
  div.className = "msg bot";
  div.id        = "typing-ind";
  div.innerHTML = `<div class="msg-bubble bot-bubble typing-bubble"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typing-ind");
  if (el) el.remove();
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const text  = input?.value?.trim();
  if (!text) return;

  input.value      = "";
  input.style.height = "auto";
  addUserMessage(text);
  State.conversationHistory.push({ role: "user", content: text });
  showTyping();

  try {
    const reply = await callGroq(State.conversationHistory);
    hideTyping();
    State.conversationHistory.push({ role: "assistant", content: reply });

    const roadmap = parseRoadmap(reply);
    if (roadmap) {
      State.roadmapData = roadmap;
      const clean = reply.replace(/```json[\s\S]*?```/, "").trim();
      addBotMessage(clean || `Here's your roadmap for **${roadmap.goal}**! 🎯`, true, roadmap);
      const vdb = document.getElementById("view-dash-btn");
      if (vdb) vdb.style.display = "flex";
    } else {
      addBotMessage(reply);
    }
  } catch (err) {
    hideTyping();
    const errs = {
      INVALID_KEY:    "❌ **Invalid Groq API key.** Open `js/config.js` and check line 14.",
      QUOTA_EXCEEDED: "⏳ **Rate limit hit.** Wait 30 seconds and try again.",
    };
    addBotMessage(errs[err.message] || `⚠️ Error: ${err.message}`);
  }
}

function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function formatMd(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g,     "<em>$1</em>")
    .replace(/^- (.+)$/gm,    "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/, s => `<ul>${s}</ul>`)
    .replace(/\n/g, "<br>");
}

function escHtml(t) {
  return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
