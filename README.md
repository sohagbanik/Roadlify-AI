<p align="center">
  <img src="https://img.shields.io/badge/Roadlify-AI-00C2FF?style=for-the-badge&logo=robot&logoColor=white" alt="Roadlify AI" />
  <img src="https://img.shields.io/badge/Status-Beta-yellow?style=for-the-badge" alt="Status: Beta" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT" />
</p>

<h1 align="center">🚀 Roadlify AI</h1>
<h3 align="center">Bridge Your College Syllabus to Tech Reality</h3>

<p align="center">
  An AI-powered career navigation platform that generates personalised, industry-ready learning roadmaps for college students — turning academic foundations into real-world expertise.
</p>

---

## 🌟 Overview

**Roadlify AI** is an intelligent career guidance tool designed specifically for college students who want to transition from academic knowledge to industry-ready skills. Using the **Groq LLM API** (LLaMA 3.3 70B), it creates deeply personalised, week-by-week career roadmaps tailored to a student's current skills, career goal, and available time.

Unlike generic career advice, Roadlify AI generates **role-specific, structured learning plans** with real resources, time-boxed daily tasks, and milestone-based progress tracking — all within a beautiful, modern dashboard.

---

## ✨ Features

### 🤖 AI-Powered Chat Interface
- Conversational AI that understands your skills, goals, and timeline
- Generates detailed JSON roadmaps using Groq's LLaMA 3.3 70B model
- Supports **15+ career paths** including Full Stack, AI/ML, Data Science, DevOps, Cybersecurity, Web3, Mobile Dev, and more

### 🗺️ Interactive Roadmap Dashboard
- **Phase-by-phase timeline** with expandable cards showing skills, milestones, and resources
- **Checkable milestones** with real-time progress tracking
- Week-by-week breakdowns with role-specific curriculum
- Free & paid resource recommendations (The Odin Project, freeCodeCamp, Coursera, etc.)

### 📅 Smart Day Planner
- **Calendar-aware weekly planner** that syncs with your roadmap phases
- Navigate between weeks to see past and future tasks
- Contextual day tags (STUDY, PROJECT, REVIEW, GIT, REST, etc.)
- Shows which roadmap phase and week you're currently in

### 🔥 Streak & Momentum Tracker
- GitHub-style activity chain calendar
- Consistency percentage and missed-day analytics
- Visual motivation to maintain learning momentum

### ✅ To-Do List
- Auto-generated tasks from your current roadmap week
- Add custom tasks alongside AI-generated ones
- Filter by All / Pending / Done with progress bar
- Category tags: learning, coding, milestone, review

### 📊 Career IQ Dashboard
- Role-specific skill analytics and career intelligence overview
- Dynamic stats tailored to the user's chosen career path

### 🔐 Firebase Authentication
- **Email/Password** sign-up and sign-in
- **Google Sign-In** via popup
- **Guest/Anonymous** login for quick exploration
- Persistent auth state with Firebase `onAuthStateChanged`

### 🎨 Premium UI/UX
- Dark & light theme toggle with smooth transitions
- Glassmorphism cards, gradient accents, and micro-animations
- Fully responsive — works on desktop, tablet, and mobile
- Custom typography with Plus Jakarta Sans & DM Sans

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **AI Engine** | [Groq API](https://groq.com/) — LLaMA 3.3 70B Versatile |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) (Email, Google, Anonymous) |
| **Fonts** | Google Fonts (Plus Jakarta Sans, DM Sans, Material Symbols) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
Roadlify AI/
├── roadlify/
│   ├── index.html              # Single-page app (Landing, Auth, Chat, Dashboard)
│   ├── css/
│   │   └── style.css           # Complete design system (76K+ lines of polished CSS)
│   └── js/
│       ├── config.js           # Groq API key, model config, system prompt
│       ├── state.js            # Global application state
│       ├── firebase-config.js  # Firebase project configuration & initialization
│       ├── api.js              # Groq API call handler & JSON roadmap parser
│       ├── auth.js             # Firebase Auth (email, Google, guest, logout)
│       ├── chat.js             # Chat UI, message rendering, typing indicators
│       ├── dashboard.js        # Roadmap, Planner, Streaks, To-Do, Career IQ tabs
│       ├── mockDashboard.js    # Fallback/demo dashboard data
│       └── app.js              # Screen navigation & theme toggle
├── vercel.json                 # Vercel rewrite rules for deployment
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A free [Groq API key](https://console.groq.com/keys) — required for AI chat
- (Optional) A [Firebase project](https://console.firebase.google.com/) if you want your own auth

### 1. Clone the Repository

```bash
git clone https://github.com/sohagbanik/Roadlify-AI.git
cd Roadlify-AI
```

### 2. Add Your Groq API Key

Open `roadlify/js/config.js` and paste your key on **line 4**:

```js
const GROQ_API_KEY = "gsk_your_api_key_here";   // ← paste here
```

> 💡 Get a free key at [console.groq.com/keys](https://console.groq.com/keys)

### 3. (Optional) Configure Firebase

If you want to use your own Firebase project, update `roadlify/js/firebase-config.js` with your project credentials. Make sure the following sign-in methods are enabled in **Firebase Console → Authentication → Sign-in method**:
- Email/Password
- Google
- Anonymous

### 4. Run Locally

Since this is a static site with no build step, simply serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Or just open roadlify/index.html directly in your browser
```

Then visit `http://localhost:8000/roadlify/` in your browser.

---

## 🎯 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌────────────────┐
│  Landing     │────▶│  Auth Screen  │────▶│  AI Chat      │────▶│  Dashboard     │
│  Page        │     │  (Firebase)   │     │  (Groq LLM)   │     │  (Roadmap +    │
│              │     │              │     │              │     │   Planner +    │
│              │     │              │     │              │     │   Streaks +    │
│              │     │              │     │              │     │   To-Do)       │
└─────────────┘     └──────────────┘     └───────────────┘     └────────────────┘
```

1. **Sign up / Log in** via Email, Google, or Guest mode
2. **Tell the AI** your current skills, career goal, and desired timeline
3. The AI generates a **structured JSON roadmap** with phases, milestones, resources, and daily plans
4. Click **"Set as my Goal"** to unlock the full dashboard
5. **Track progress** through the Roadmap, Day Planner, Streaks, and To-Do tabs

---

## 🎨 Supported Career Paths

Roadlify AI includes deep, role-specific knowledge bases for:

| Category | Roles |
|----------|-------|
| **Web Development** | Full Stack, Frontend, Backend, MERN Stack |
| **AI & Data** | AI/ML Engineer, Data Scientist, Data Analyst |
| **Infrastructure** | DevOps, Cloud Engineer, SRE |
| **Security** | Cybersecurity Engineer |
| **Emerging Tech** | Web3/Blockchain Developer |
| **Mobile** | React Native, Flutter Developer |
| **Other** | Game Dev, UI/UX Designer, Product Manager, and more |

Each role includes structured phases covering foundational → advanced skills, with real tools, frameworks, certifications, and project ideas.

---

## 🌐 Deployment

The project is configured for **Vercel** deployment out of the box:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The included `vercel.json` handles URL rewrites to serve the app from the `/roadlify/` subdirectory.

---

## 📸 Screenshots

> *Coming soon — the app features a sleek dark-mode interface with glassmorphism cards, gradient accents, and smooth animations across all screens.*

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Groq](https://groq.com/) — Lightning-fast LLM inference
- [Firebase](https://firebase.google.com/) — Authentication services
- [roadmap.sh](https://roadmap.sh/) — Career roadmap inspiration
- [Google Fonts](https://fonts.google.com/) — Plus Jakarta Sans, DM Sans & Material Symbols
- [Vercel](https://vercel.com/) — Hosting & deployment

---

<p align="center">
  Made with ❤️ for students navigating their tech careers
  <br/>
  <strong>Roadlify AI</strong> — Don't just graduate, evolve with intelligence.
</p>



