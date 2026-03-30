// app.js — Screen navigation & theme

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("roadlify-theme") || "dark";
  if (saved === "light") document.body.classList.add("light");
  updateThemeIcons();
  initAuth();
});

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    // Reset overflow for non-landing screens
    if (name !== "landing") s.style.overflowY = "";
  });
  const target = document.getElementById("screen-" + name);
  if (target) {
    target.classList.add("active");
    if (name === "landing") target.style.overflowY = "auto";
  }
}

function goToDashboard() { showScreen("dashboard"); }
function goToChat()      { showScreen("chat"); }

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  localStorage.setItem("roadlify-theme", isLight ? "light" : "dark");
  updateThemeIcons();
}

function updateThemeIcons() {
  const isLight = document.body.classList.contains("light");
  document.querySelectorAll(".theme-btn .material-symbols-outlined").forEach(icon => {
    icon.textContent = isLight ? "dark_mode" : "light_mode";
  });
}

function logout() {
  State.user = null;
  State.conversationHistory = [];
  State.roadmapData = null;
  showScreen("landing");
}
