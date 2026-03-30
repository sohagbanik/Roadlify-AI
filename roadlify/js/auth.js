// ============================================================
//  auth.js — Firebase Authentication
//  Handles Email/Password, Google Sign-In, and Anonymous login
//  Uses Firebase Auth SDK (compat) loaded via CDN
// ============================================================

// ── Auth mode state ──
let isSignUpMode = true;

// ── Initialize Auth — listen for Firebase auth state changes ──
function initAuth() {
  applyTheme(State.theme);

  // Listen for Firebase auth state changes
  firebaseAuth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      // User is signed in — map Firebase user to our State
      State.user = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student",
        email: firebaseUser.email || "anonymous@roadlify.ai",
        avatar: makeInitials(firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student"),
        photoURL: firebaseUser.photoURL || null,
        loginMethod: firebaseUser.isAnonymous ? "guest" : (firebaseUser.providerData[0]?.providerId || "email"),
      };

      // Wire up Groq key
      if (typeof GROQ_API_KEY === "string" && GROQ_API_KEY.startsWith("gsk_")) {
        State.groqKey = GROQ_API_KEY;
      }

      // Go to chat if we're still on landing or auth screen
      const currentScreen = document.querySelector(".screen.active");
      const screenId = currentScreen?.id || "";
      if (screenId === "screen-landing" || screenId === "screen-auth") {
        showScreen("chat");
        initChat();
      }
    }
  });
}

// ── Toggle between Sign Up and Sign In ──
function toggleAuthMode() {
  isSignUpMode = !isSignUpMode;
  const heading = document.getElementById("auth-heading");
  const subtext = document.getElementById("auth-subtext");
  const submitBtn = document.getElementById("auth-submit-btn");
  const toggleLink = document.getElementById("auth-toggle-link");
  const nameWrap = document.getElementById("auth-name-wrap");

  if (isSignUpMode) {
    if (heading) heading.textContent = "Create Your Account";
    if (subtext) subtext.textContent = "Start your personalised career journey with AI-powered guidance.";
    if (submitBtn) submitBtn.innerHTML = `<div class="btn-icon"><span class="material-symbols-outlined" style="font-size:1rem;">person_add</span></div>Sign Up with Email`;
    if (toggleLink) toggleLink.innerHTML = `Already have an account? <a href="#" onclick="event.preventDefault();toggleAuthMode()" style="color:var(--accent2);font-weight:600;text-decoration:none;">Sign In</a>`;
    if (nameWrap) nameWrap.style.display = "";
  } else {
    if (heading) heading.textContent = "Welcome Back";
    if (subtext) subtext.textContent = "Sign in to continue your career roadmap.";
    if (submitBtn) submitBtn.innerHTML = `<div class="btn-icon"><span class="material-symbols-outlined" style="font-size:1rem;">login</span></div>Sign In with Email`;
    if (toggleLink) toggleLink.innerHTML = `Don't have an account? <a href="#" onclick="event.preventDefault();toggleAuthMode()" style="color:var(--accent2);font-weight:600;text-decoration:none;">Sign Up</a>`;
    if (nameWrap) nameWrap.style.display = "none";
  }
  hideAuthError();
}

// ── Email/Password Auth ──
async function loginWithEmail() {
  const nameVal = document.getElementById("auth-name")?.value?.trim();
  const emailVal = document.getElementById("auth-email")?.value?.trim();
  const passVal = document.getElementById("auth-password")?.value?.trim();

  // Validate
  if (isSignUpMode && !nameVal) {
    shakeInput("auth-name");
    showAuthError("Please enter your name.");
    return;
  }
  if (!emailVal) {
    shakeInput("auth-email");
    showAuthError("Please enter your email address.");
    return;
  }
  if (!passVal || passVal.length < 6) {
    shakeInput("auth-password");
    showAuthError("Password must be at least 6 characters.");
    return;
  }

  hideAuthError();
  setAuthLoading(true);

  try {
    if (isSignUpMode) {
      // Create new account
      const cred = await firebaseAuth.createUserWithEmailAndPassword(emailVal, passVal);
      // Set display name
      if (nameVal) {
        await cred.user.updateProfile({ displayName: nameVal });
      }
    } else {
      // Sign in existing account
      await firebaseAuth.signInWithEmailAndPassword(emailVal, passVal);
    }
    // onAuthStateChanged will handle the rest
    animateAuthOut();
  } catch (err) {
    setAuthLoading(false);
    handleAuthError(err);
  }
}

// ── Google Sign-In ──
async function loginWithGoogle() {
  hideAuthError();
  setAuthLoading(true);

  try {
    await firebaseAuth.signInWithPopup(googleProvider);
    animateAuthOut();
  } catch (err) {
    setAuthLoading(false);
    if (err.code !== "auth/popup-closed-by-user") {
      handleAuthError(err);
    }
  }
}

// ── Guest (Anonymous) Login ──
async function guestLogin() {
  hideAuthError();
  setAuthLoading(true);

  try {
    await firebaseAuth.signInAnonymously();
    animateAuthOut();
  } catch (err) {
    setAuthLoading(false);
    handleAuthError(err);
  }
}

// ── Logout (called from dashboard) ──
async function logout() {
  try {
    await firebaseAuth.signOut();
  } catch (e) {
    console.error("Logout error:", e);
  }

  // Clear app state
  State.user = null;
  State.conversationHistory = [];
  State.roadmapData = null;
  State.todoItems = [];
  State.checkedMilestones = {};
  State.streakDays = new Set();
  State.weekOffset = 0;

  // Reset auth card appearance
  const card = document.querySelector(".auth-card");
  if (card) { card.style.opacity = "1"; card.style.transform = "none"; }

  // Reset to sign-up mode
  isSignUpMode = true;
  setAuthLoading(false);

  showScreen("auth");
}

// ── Auth Error Handler ──
function handleAuthError(err) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Try signing in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email. Try signing up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please check and try again.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/too-many-requests": "Too many failed attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups for this site.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Check Firebase Console.",
    "auth/configuration-not-found": "Email/Password sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.",
  };
  showAuthError(messages[err.code] || `Authentication error: ${err.message}`);
}

// ── Animation & UI Helpers ──
function animateAuthOut() {
  const card = document.querySelector(".auth-card");
  if (card) {
    card.style.transition = "opacity .25s, transform .25s";
    card.style.opacity = "0";
    card.style.transform = "translateY(-12px) scale(0.98)";
    setTimeout(() => { showScreen("chat"); initChat(); setAuthLoading(false); }, 240);
  } else {
    showScreen("chat");
    initChat();
    setAuthLoading(false);
  }
}

function setAuthLoading(loading) {
  const btns = document.querySelectorAll(".auth-login-btn, .auth-guest-btn");
  btns.forEach(btn => {
    btn.disabled = loading;
    btn.style.opacity = loading ? "0.6" : "";
    btn.style.cursor = loading ? "wait" : "";
  });

  const inputs = document.querySelectorAll(".auth-inp");
  inputs.forEach(inp => inp.disabled = loading);
}

// ── Enter key on inputs ──
function handleAuthKey(e) {
  if (e.key === "Enter") loginWithEmail();
}

// ── Helpers ──
function makeInitials(name) {
  return name.split(" ").filter(Boolean).map(w => w[0].toUpperCase()).join("").slice(0, 2) || "U";
}

function showAuthError(msg) {
  let el = document.getElementById("auth-error");
  if (!el) {
    el = document.createElement("div");
    el.id = "auth-error";
    el.style.cssText = `
      color: var(--red); font-size: .82rem;
      background: rgba(248,81,73,.1); border: 1px solid rgba(248,81,73,.25);
      border-radius: 10px; padding: .6rem .9rem; margin-bottom: .75rem;
      animation: fadeUp .2s ease;
    `;
    const inputs = document.querySelector(".auth-inputs");
    if (inputs) inputs.insertAdjacentElement("beforebegin", el);
  }
  el.textContent = msg;
  el.style.display = "block";
}

function hideAuthError() {
  const el = document.getElementById("auth-error");
  if (el) el.style.display = "none";
}

function shakeInput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = "none";
  el.style.borderColor = "var(--red)";
  el.style.transition = "border-color .2s";
  // Add shake via keyframes
  el.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(-4px)" },
    { transform: "translateX(4px)" },
    { transform: "translateX(0)" },
  ], { duration: 300, easing: "ease" });
  setTimeout(() => { el.style.borderColor = ""; }, 1500);
}
