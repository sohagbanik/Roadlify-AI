// dashboard.js — Roadlify AI

// ══════════════════════════════════════════════════
//  CORE SETUP
// ══════════════════════════════════════════════════

function setGoalAndBuild(data) {
  State.roadmapData = data;
  State.streakDays.add(State.todayStr);
  // Generate the full week-by-week schedule from phases
  State.weekSchedule = buildWeekSchedule(data);

  const u = State.user;
  if (u) {
    const av = document.getElementById("dash-avatar");
    const nm = document.getElementById("dash-name");
    const em = document.getElementById("dash-meta");
    if (av) av.textContent = u.avatar;
    if (nm) nm.textContent = u.name;
    if (em) em.textContent = `${data.goal} · ${data.totalDuration}`;
  }
  const pill = document.getElementById("nav-goal-text");
  if (pill) pill.textContent = data.goal;

  buildRoadmapTab(data);
  buildPlannerTab(data);
  buildStreaksTab();
  buildTodoTab(data);
  buildCareerIQTab(data);
  showScreen("dashboard");
}

function switchDashTab(name, el) {
  document.querySelectorAll(".dash-tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".dash-topnav-tab").forEach(b => b.classList.remove("active"));
  const panel = document.getElementById("dtab-" + name);
  if (panel) panel.classList.add("active");
  if (el) el.classList.add("active");
}

// ══════════════════════════════════════════════════
//  WEEK SCHEDULE ENGINE
//  Converts phases → array of weekly plans
//  Each entry: { weekNum, phaseIdx, phaseName, days: [{tag,tagClass,desc,type}] }
// ══════════════════════════════════════════════════

function buildWeekSchedule(data) {
  const schedule = [];
  const goal = (data.goal || "").toLowerCase();

  (data.phases || []).forEach((ph, phaseIdx) => {
    // Parse duration: "2 months", "6 weeks", "3 months"
    const dur = ph.duration || "1 month";
    let weeks = 4;
    const numMatch = dur.match(/(\d+(\.\d+)?)/);
    const num = numMatch ? parseFloat(numMatch[1]) : 1;
    if (dur.includes("week")) weeks = Math.round(num);
    else if (dur.includes("month")) weeks = Math.round(num * 4);

    // Build a day-plan for each week of this phase
    for (let w = 0; w < weeks; w++) {
      const weekNum = schedule.length + 1;
      const weekFraction = w / weeks; // 0 = start of phase, 1 = end

      const days = buildDaysForWeek(goal, phaseIdx, ph, w, weeks, weekFraction, data);
      schedule.push({
        weekNum,
        phaseIdx,
        phaseName: ph.name,
        phaseColor: ph.color || "var(--accent2)",
        days
      });
    }
  });

  return schedule;
}

// Returns 7 day objects for a specific week within a phase
function buildDaysForWeek(goal, phaseIdx, phase, weekInPhase, totalWeeks, fraction, data) {
  // Use AI-generated weeklyPlan if this is Phase 1 and the AI gave us one
  if (phaseIdx === 0 && phase.weeklyPlan && phase.weeklyPlan.length === 7) {
    // Rotate tasks slightly for later weeks in same phase
    const rotated = [...phase.weeklyPlan];
    if (weekInPhase > 0) {
      // Shift focus slightly — practice more in later weeks
      rotated[5] = "Project build — apply this week's concepts";
      rotated[6] = "Review + push code to GitHub";
    }
    return rotated.map((desc, i) => dayFromDesc(desc, i, goal, phaseIdx));
  }

  // Otherwise use our structured knowledge base per role + phase
  return getRoleWeekPlan(goal, phaseIdx, weekInPhase, totalWeeks, phase).map((desc, i) =>
    dayFromDesc(desc, i, goal, phaseIdx)
  );
}

function dayFromDesc(desc, dayIndex, goal, phaseIdx) {
  // Strip "Mon:", "Tue:" prefixes
  const clean = desc.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:\s*/i, "").trim();
  // Derive tag and type from content
  const tag = deriveTag(clean, dayIndex, goal, phaseIdx);
  return { desc: clean, tag: tag.label, tagClass: tag.cls, type: tag.type };
}

function deriveTag(desc, dayIndex, goal, phaseIdx) {
  const d = desc.toLowerCase();
  if (d.includes("rest") || dayIndex === 6) return { label: "REST", cls: "ptag-rest", type: "rest" };
  if (d.includes("review") || d.includes("revision") || d.includes("recap")) return { label: "REVIEW", cls: "ptag-review", type: "review" };
  if (d.includes("project") || d.includes("build") || d.includes("deploy") || d.includes("capstone")) return { label: "PROJECT", cls: "ptag-project", type: "project" };
  if (d.includes("git") || d.includes("github") || d.includes("push code")) return { label: "GIT", cls: "ptag-git", type: "git" };
  if (d.includes("practice") || d.includes("exercise") || d.includes("drill") || d.includes("leetcode") || d.includes("hackerrank")) return { label: "PRACTICE", cls: "ptag-practice", type: "practice" };
  // Role-specific tags
  const goalL = goal.toLowerCase();
  if (d.includes("html") || d.includes("css") || d.includes("flexbox") || d.includes("grid") || d.includes("responsive")) return { label: "HTML/CSS", cls: "ptag-python", type: "topic" };
  if (d.includes("javascript") || d.includes("js") || d.includes("dom") || d.includes("es6") || d.includes("async")) return { label: "JAVASCRIPT", cls: "ptag-func", type: "topic" };
  if (d.includes("react") || d.includes("vue") || d.includes("angular") || d.includes("next")) return { label: "REACT/FW", cls: "ptag-python", type: "topic" };
  if (d.includes("node") || d.includes("express") || d.includes("api") || d.includes("backend")) return { label: "BACKEND", cls: "ptag-func", type: "topic" };
  if (d.includes("mongodb") || d.includes("sql") || d.includes("database") || d.includes("postgres")) return { label: "DATABASE", cls: "ptag-project", type: "topic" };
  if (d.includes("python") || d.includes("numpy") || d.includes("pandas")) return { label: "PYTHON", cls: "ptag-python", type: "topic" };
  if (d.includes("docker") || d.includes("container") || d.includes("kubernetes")) return { label: "DOCKER/K8S", cls: "ptag-func", type: "topic" };
  if (d.includes("linux") || d.includes("bash") || d.includes("shell")) return { label: "LINUX", cls: "ptag-git", type: "topic" };
  if (d.includes("pytorch") || d.includes("tensorflow") || d.includes("keras") || d.includes("neural")) return { label: "DEEP LEARN", cls: "ptag-func", type: "topic" };
  if (d.includes("scikit") || d.includes("ml") || d.includes("model") || d.includes("train")) return { label: "ML MODEL", cls: "ptag-practice", type: "topic" };
  if (d.includes("solidity") || d.includes("smart contract") || d.includes("web3") || d.includes("ethers")) return { label: "WEB3", cls: "ptag-project", type: "topic" };
  if (d.includes("flutter") || d.includes("dart") || d.includes("react native") || d.includes("mobile")) return { label: "MOBILE", cls: "ptag-python", type: "topic" };
  if (d.includes("test") || d.includes("jest") || d.includes("cypress") || d.includes("debug")) return { label: "TESTING", cls: "ptag-review", type: "review" };
  return { label: "STUDY", cls: "ptag-python", type: "topic" };
}

// ══════════════════════════════════════════════════
//  ROLE-SPECIFIC WEEK PLANS (structured, progressive)
// ══════════════════════════════════════════════════

function getRoleWeekPlan(goal, phaseIdx, weekInPhase, totalWeeks, phase) {
  const g = goal;
  const isEarlyWeek = weekInPhase < totalWeeks / 2;

  // ── FULL STACK / WEB DEV ──
  if (g.includes("full stack") || g.includes("web dev") || g.includes("frontend") || g.includes("backend") || g.includes("mern")) {
    const webPhases = [
      // Phase 0: HTML + CSS (4 weeks)
      [
        ["HTML5 structure — doctype, semantic tags, forms, tables, links",
         "CSS basics — selectors, specificity, box model, typography",
         "CSS Flexbox — flex container, axes, justify-content, align-items",
         "CSS Grid — grid-template, areas, auto-fill, minmax",
         "Responsive design — media queries, mobile-first, viewport",
         "Project: Build 2 responsive static pages (portfolio + landing)",
         "Push to GitHub + write README + review week"],

        ["HTML forms — input types, validation, accessibility (ARIA)",
         "CSS animations + transitions + transform",
         "CSS variables + custom properties + reset/normalize",
         "Advanced selectors — pseudo-classes (:hover, :nth-child), combinators",
         "Practice: Recreate 3 UI components from scratch (card, navbar, hero)",
         "Project: Build a multi-page responsive website (3 pages)",
         "Code review + GitHub Pages deployment + week review"],

        ["CSS advanced — position (relative/absolute/sticky/fixed), z-index",
         "CSS advanced — overflow, clip, background properties, gradients",
         "Tailwind CSS intro — utility classes, config, responsive prefixes",
         "Practice: Convert your CSS project to Tailwind",
         "Figma basics — inspect designs, export assets, understand spacing",
         "Project: Clone a real landing page (Stripe, Vercel, or Notion)",
         "Polish project + write CSS notes + GitHub push"],

        ["HTML5 APIs — localStorage, sessionStorage, Canvas basics",
         "Accessibility deep-dive — WCAG, screen readers, semantic HTML",
         "CSS performance — critical CSS, will-change, layout thrashing",
         "Practice: Build a fully accessible form with validation",
         "Cross-browser testing — Chrome, Firefox, Safari quirks",
         "Project: Final HTML/CSS capstone — a complete portfolio site",
         "Deploy to GitHub Pages + Week 4 recap + prep for JavaScript"],
      ],

      // Phase 1: JavaScript (4 weeks)
      [
        ["JS fundamentals — variables (let/const), data types, operators",
         "JS control flow — if/else, switch, ternary, short-circuit",
         "JS functions — declarations, expressions, arrow functions, scope",
         "JS arrays — map, filter, reduce, forEach, spread, destructuring",
         "JS objects — creation, methods, this keyword, optional chaining",
         "Practice: 10 array/object challenges on HackerRank",
         "Review + push JS exercises to GitHub"],

        ["DOM manipulation — querySelector, createElement, innerHTML, events",
         "Event handling — addEventListener, event delegation, bubbling",
         "DOM project: Interactive to-do list with local storage",
         "ES6+ features — template literals, default params, rest params",
         "Async JS — callbacks, Promises, .then()/.catch()",
         "Project: Fetch API weather app (OpenWeather API)",
         "Review async concepts + debug + push to GitHub"],

        ["Async/Await — try/catch, Promise.all, error handling patterns",
         "Modules — ES6 import/export, Vite/Webpack bundler basics",
         "JS classes — constructor, inheritance, prototype chain",
         "Error handling — try/catch/finally, custom error classes",
         "Practice: Build a quiz app with timer + score tracking",
         "Project: JavaScript calculator with keyboard support",
         "LeetCode easy: 5 array + string problems"],

        ["JavaScript advanced — closures, IIFE, currying, memoization",
         "Browser APIs — Intersection Observer, Resize Observer, Web Workers",
         "TypeScript intro — types, interfaces, type assertions, generics",
         "Practice: Convert a JS project to TypeScript",
         "Testing basics — Jest setup, unit tests for pure functions",
         "Project: Full JS capstone — expense tracker with charts",
         "Week review + JavaScript notes + GitHub push"],
      ],

      // Phase 2: React (4+ weeks)
      [
        ["React setup — Vite + React, JSX syntax, functional components",
         "Props + state — useState hook, prop drilling, conditional rendering",
         "Lists + keys — .map() in JSX, fragments, dynamic rendering",
         "useEffect hook — lifecycle, cleanup, dependency array patterns",
         "React Router v6 — BrowserRouter, Route, Link, useNavigate, params",
         "Project: Build a React movie search app (TMDB API)",
         "React DevTools debug + GitHub push"],

        ["useContext + createContext — avoid prop drilling, global state",
         "useReducer — complex state, actions, reducers pattern",
         "Custom hooks — extract logic, useLocalStorage, useFetch hooks",
         "React Query / TanStack Query — caching, loading, error states",
         "Forms in React — controlled inputs, React Hook Form library",
         "Project: React e-commerce product page with cart state",
         "Component refactor + unit tests + GitHub push"],

        ["Redux Toolkit — store, slice, createAsyncThunk, RTK Query",
         "React performance — useMemo, useCallback, React.memo",
         "Code splitting — React.lazy, Suspense, dynamic imports",
         "Tailwind + CSS Modules in React — component styling patterns",
         "Storybook intro — document and test UI components",
         "Project: Full React dashboard with Redux state management",
         "Write tests (React Testing Library) + GitHub push"],

        ["Next.js — pages vs app router, SSR, SSG, ISR explained",
         "Next.js API routes — serverless functions, data fetching",
         "Next.js SEO — metadata API, Open Graph, sitemap",
         "Next.js deployment — Vercel deploy, env variables, domains",
         "TypeScript + Next.js — typed props, API types, generics",
         "Project: Full Next.js blog or portfolio with CMS",
         "Deploy to Vercel + week review + prep for backend"],
      ],

      // Phase 3: Node.js + Express + MongoDB
      [
        ["Node.js fundamentals — runtime, require, fs module, path, events",
         "Node.js HTTP module — create server, handle requests, status codes",
         "Express.js — app setup, routing, middleware, req/res cycle",
         "REST API design — CRUD routes, HTTP methods, status codes, Postman",
         "Middleware — cors, express.json, helmet, morgan, custom middleware",
         "Project: Build a REST API for a blog (CRUD posts, users)",
         "Test all routes in Postman + GitHub push"],

        ["MongoDB setup — Atlas cloud, Compass GUI, collections, documents",
         "Mongoose — schema, model, validation, virtuals, pre/post hooks",
         "MongoDB CRUD with Mongoose — find, create, updateOne, deleteOne",
         "MongoDB advanced — aggregation pipeline, $lookup, $group, $match",
         "Authentication — bcrypt password hashing, JWT token generation",
         "Project: Add user auth (register/login) to your blog API",
         "Postman auth testing + JWT decode + GitHub push"],

        ["Auth middleware — protect routes, verify JWT, role-based access",
         "File uploads — Multer middleware, Cloudinary integration",
         "Email service — Nodemailer, SendGrid, email templates",
         "Environment variables — dotenv, config patterns, secrets management",
         "Error handling — global error middleware, async error wrapper",
         "Project: Complete backend for e-commerce API (products, orders, auth)",
         "API documentation with Swagger/Postman + GitHub push"],

        ["SQL basics — PostgreSQL, CREATE TABLE, SELECT, JOINs, indexes",
         "Prisma ORM — schema.prisma, migrations, CRUD operations",
         "Redis basics — caching, session storage, rate limiting",
         "WebSockets — Socket.io setup, rooms, real-time events",
         "API security — rate limiting, input validation, XSS/CSRF protection",
         "Project: Real-time chat app with Socket.io + MongoDB",
         "Deploy backend to Railway/Render + week review"],
      ],

      // Phase 4: Full Stack Projects + Deployment
      [
        ["MERN project planning — wireframes, ERD, component tree, git setup",
         "MERN project — auth system (register, login, JWT, protected routes)",
         "MERN project — build core features (CRUD with React + Express)",
         "MERN project — add file upload, search, pagination",
         "MERN project — React frontend polish + responsive design",
         "MERN project — deploy backend (Railway) + frontend (Vercel)",
         "Project demo + bug fixes + README documentation"],

        ["Docker basics — Dockerfile, docker-compose, containerize MERN app",
         "CI/CD — GitHub Actions workflow, lint + test + deploy pipeline",
         "Testing — Jest + Supertest for API, React Testing Library",
         "System design basics — load balancer, CDN, caching, DB scaling",
         "AWS basics — S3 for files, EC2 overview, environment basics",
         "Portfolio project: Add 2nd full stack project to GitHub",
         "Write case study + review + prep for interviews"],
      ],
    ];

    const planSet = webPhases[Math.min(phaseIdx, webPhases.length - 1)];
    const weekPlans = planSet || webPhases[webPhases.length - 1];
    return weekPlans[Math.min(weekInPhase, weekPlans.length - 1)] || weekPlans[weekPlans.length - 1];
  }

  // ── AI/ML ENGINEER ──
  if (g.includes("ai") || g.includes("ml") || g.includes("machine learning") || g.includes("deep learning")) {
    const aiPhases = [
      // Phase 0: Python + Math (4 weeks)
      [
        ["Python basics — variables, data types, lists, dicts, loops, functions", "Python OOP — classes, inheritance, dunder methods, decorators", "NumPy — arrays, broadcasting, indexing, math operations", "Pandas — DataFrames, read_csv, loc/iloc, groupby, merge", "Matplotlib + Seaborn — line, bar, scatter, heatmap, subplots", "Practice: Analyze a real dataset (Titanic or Iris)", "Push Jupyter notebooks to GitHub"],
        ["Linear algebra — vectors, matrix multiplication, dot product, transpose", "Statistics — mean, std, variance, distributions, z-score, p-value", "Probability — Bayes theorem, conditional probability, random variables", "Calculus basics — derivatives, gradient, chain rule intuition", "Practice: Implement matrix operations from scratch with NumPy", "EDA project: Full exploratory analysis of a Kaggle dataset", "Review math notes + Jupyter notebook push"],
        ["Advanced Pandas — pivot_table, apply, lambda, datetime, string ops", "Data cleaning — missing values, outliers, encoding categorical data", "Feature engineering — normalization, standardization, log transform", "Data visualization — Plotly interactive charts, pair plots, correlation matrix", "Practice: Clean and prepare a messy real-world dataset", "Project: Complete EDA report on a business dataset", "Kaggle notebook submission + GitHub push"],
        ["Python for ML — Scikit-learn intro, pipelines, train/test split", "Jupyter best practices — markdown, export, reproducibility", "Virtual environments — venv, requirements.txt, project structure", "Git for data science — .gitignore for data, DVC basics", "Practice: 10 Python challenges on HackerRank (intermediate)", "Project: End-to-end data analysis mini project", "Week review + prep for ML algorithms"],
      ],
      // Phase 1: ML Core (4 weeks)
      [
        ["Supervised learning — linear regression, cost function, gradient descent", "Scikit-learn — LinearRegression, train_test_split, metrics (MSE, R2)", "Logistic regression — sigmoid, binary classification, confusion matrix", "Model evaluation — accuracy, precision, recall, F1, ROC-AUC", "Practice: Predict house prices (Boston dataset) + tune hyperparams", "Project: Binary classifier — spam email or credit card fraud detection", "GitHub push + document results"],
        ["Decision trees — entropy, information gain, Gini, max_depth", "Random Forest — bagging, feature importance, OOB error, tuning", "Gradient Boosting — XGBoost, LightGBM, GBDT explained", "Hyperparameter tuning — GridSearchCV, RandomizedSearchCV", "Cross-validation — k-fold, stratified k-fold, leave-one-out", "Project: Kaggle Titanic or House Prices competition", "Submit to Kaggle + notebook documentation + GitHub push"],
        ["Unsupervised learning — K-Means clustering, elbow method, silhouette", "PCA — dimensionality reduction, explained variance, scree plot", "Anomaly detection — Isolation Forest, One-Class SVM, DBSCAN", "Feature selection — RFE, SelectKBest, correlation filtering", "Pipeline — full Scikit-learn pipeline with preprocessing + model", "Project: Customer segmentation using clustering on retail data", "End-to-end ML pipeline project + GitHub push"],
        ["Model deployment — Flask/FastAPI ML endpoint, joblib model save/load", "Docker for ML — containerize your model API", "MLflow basics — experiment tracking, model registry", "ML project structure — src layout, configs, reproducibility", "Practice: Deploy a Scikit-learn model to Render or Railway", "Project: Production-ready ML API with docs (Swagger)", "Week review + prep for Deep Learning"],
      ],
      // Phase 2: Deep Learning
      [
        ["Neural networks — perceptron, activation functions, forward pass", "PyTorch fundamentals — tensors, autograd, GPU basics, .to(device)", "Build a neural net in PyTorch — nn.Module, layers, loss, optimizer", "Training loop — epochs, batch, loss.backward(), optimizer.step()", "Overfitting — dropout, L1/L2 regularization, early stopping", "Project: MNIST digit classifier in PyTorch from scratch", "GitHub push + training curves analysis"],
        ["CNNs — conv layers, pooling, feature maps, receptive field", "CNN architectures — LeNet, VGG, ResNet, transfer learning", "Transfer learning — torchvision pretrained, fine-tune on custom data", "Data augmentation — torchvision transforms, albumentations", "Practice: Image classification on CIFAR-10", "Project: Custom image classifier (your own dataset)", "Evaluate model + confusion matrix + GitHub push"],
        ["RNNs — sequence data, hidden state, vanishing gradient problem", "LSTMs + GRUs — gates, cell state, when to use each", "Text data — tokenization, padding, embedding layers (nn.Embedding)", "Sentiment analysis — LSTM model on IMDB reviews", "Practice: Time series forecasting with LSTM", "Project: Sentiment analysis app with PyTorch + FastAPI endpoint", "GitHub push + model eval + week review"],
        ["Transformers — attention mechanism, self-attention, positional encoding", "HuggingFace — transformers library, tokenizers, from_pretrained", "Fine-tuning BERT — classification head, training args, Trainer API", "Practice: Fine-tune DistilBERT on a custom text classification task", "Model evaluation — BLEU, ROUGE, perplexity for NLP", "Project: Custom text classifier fine-tuned on domain data", "Push to HuggingFace Hub + GitHub + week review"],
      ],
    ];

    const planSet = aiPhases[Math.min(phaseIdx, aiPhases.length - 1)];
    const weekPlans = planSet || aiPhases[aiPhases.length - 1];
    return weekPlans[Math.min(weekInPhase, weekPlans.length - 1)] || weekPlans[weekPlans.length - 1];
  }

  // ── DEVOPS / CLOUD ──
  if (g.includes("devops") || g.includes("cloud") || g.includes("sre")) {
    const devopsPhases = [
      [
        ["Linux fundamentals — filesystem, permissions, users, groups, sudo", "Linux commands — grep, awk, sed, find, ps, top, df, curl", "Bash scripting — variables, loops, conditionals, functions, cron", "Networking — IP, DNS, TCP/IP, HTTP/HTTPS, ports, netstat, ping", "SSH — key-based auth, config file, port forwarding, tunneling", "Practice: Write 5 bash scripts (backup, log rotation, system monitor)", "GitHub push + review Linux cheat sheet"],
        ["Git advanced — branching strategies, rebase, cherry-pick, conflicts", "Git workflows — GitFlow, trunk-based, PR reviews, protected branches", "YAML + JSON — syntax, schemas, writing configs for tools", "Regex — patterns, grep -E, sed with regex, log parsing", "Package managers — apt, yum, snap, pip — system package management", "Practice: Set up a Linux VM and configure it from scratch", "Write bash automation scripts + GitHub push"],
      ],
      [
        ["Docker — concepts, Dockerfile (FROM, RUN, COPY, CMD, EXPOSE)", "Docker — build, run, tag, push to Docker Hub, inspect images", "Docker networking — bridge, host, overlay, container communication", "Docker Compose — multi-service apps, volumes, env files, depends_on", "Practice: Containerize a Node.js + MongoDB app with docker-compose", "Project: Multi-container app deployed with docker-compose", "GitHub push + docker-compose documentation"],
        ["Kubernetes concepts — pods, nodes, clusters, control plane, kubelet", "kubectl — get, describe, apply, delete, logs, exec, port-forward", "K8s workloads — Deployments, ReplicaSets, DaemonSets, StatefulSets", "K8s networking — Services (ClusterIP, NodePort, LoadBalancer), Ingress", "K8s config — ConfigMaps, Secrets, resource limits, namespaces", "Practice: Deploy a full app to Minikube or kind cluster", "YAML manifests + Helm chart basics + GitHub push"],
      ],
      [
        ["CI/CD concepts — pipeline stages: build, test, scan, deploy", "GitHub Actions — workflow YAML, jobs, steps, secrets, matrix builds", "Jenkins — pipeline syntax (declarative), Jenkinsfile, plugins", "Testing in CI — run Jest/pytest in pipeline, fail-fast, artifacts", "Docker in CI — build + push image to registry in GitHub Actions", "Project: Full CI/CD pipeline for a sample app (lint+test+deploy)", "Pipeline runs + debugging + GitHub push"],
        ["Terraform fundamentals — providers, resources, variables, outputs, state", "Terraform — plan, apply, destroy, workspaces, modules", "AWS core — IAM, VPC, EC2, S3, RDS, Route53, CloudFront basics", "Infrastructure as Code — provision EC2 + RDS with Terraform on AWS", "Monitoring — Prometheus setup, metrics types (counter, gauge, histogram)", "Grafana — dashboards, data sources, alerting rules", "Project: Full AWS infra with Terraform + Prometheus + Grafana"],
      ],
    ];
    const planSet = devopsPhases[Math.min(phaseIdx, devopsPhases.length - 1)];
    const weekPlans = planSet || devopsPhases[devopsPhases.length - 1];
    return weekPlans[Math.min(weekInPhase, weekPlans.length - 1)] || weekPlans[weekPlans.length - 1];
  }

  // ── DATA SCIENCE ──
  if (g.includes("data sci")) {
    const dsPhases = [
      [
        ["SQL fundamentals — SELECT, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT", "SQL JOINs — INNER, LEFT, RIGHT, FULL, self-join, cross-join", "SQL window functions — ROW_NUMBER, RANK, LAG, LEAD, PARTITION BY", "SQL CTEs + subqueries — WITH clause, correlated subqueries", "SQL practice: 20 queries on a real schema (e-commerce or HR)", "Project: Analyze a business database (write 10 insight queries)", "SQL notes + GitHub push"],
      ],
      [
        ["EDA — Pandas profiling, missing data, outliers, skewness, kurtosis", "Feature engineering — binning, interactions, target encoding, date features", "Scikit-learn ML pipeline — imputer, encoder, scaler, model in sequence", "Model selection — learning curves, bias-variance tradeoff, validation", "Ensemble methods — bagging, boosting, stacking, voting classifier", "Project: End-to-end Kaggle competition (House Prices or Titanic)", "Notebook documentation + Kaggle submission"],
      ],
    ];
    const planSet = dsPhases[Math.min(phaseIdx, dsPhases.length - 1)];
    const weekPlans = planSet || dsPhases[dsPhases.length - 1];
    return weekPlans[Math.min(weekInPhase, weekPlans.length - 1)] || weekPlans[weekPlans.length - 1];
  }

  // ── CYBERSECURITY ──
  if (g.includes("cyber") || g.includes("security")) {
    const secPhases = [
      [
        ["Networking — OSI 7 layers, TCP/IP stack, DNS, DHCP, ARP, routing", "Networking tools — Wireshark, Nmap, netcat, tcpdump, traceroute", "Linux security — file permissions, sudoers, PAM, firewall (ufw/iptables)", "Cryptography — symmetric (AES), asymmetric (RSA), hashing (SHA), PKI", "Practice: Capture + analyze network traffic with Wireshark", "TryHackMe: Complete 'Pre-Security' learning path", "Review + notes + GitHub push"],
      ],
      [
        ["Web security — HTTP methods, cookies, sessions, headers, CORS", "OWASP Top 10 — SQLi, XSS, CSRF, IDOR, broken auth, SSRF, XXE", "Burp Suite — proxy, intercept, repeater, intruder, scanner", "HackTheBox — complete 2 easy-rated machines end-to-end", "Practice: Exploit DVWA (Damn Vulnerable Web App) locally", "Write a penetration test report for your lab findings", "Report documentation + GitHub push"],
      ],
    ];
    const planSet = secPhases[Math.min(phaseIdx, secPhases.length - 1)];
    const weekPlans = planSet || secPhases[secPhases.length - 1];
    return weekPlans[Math.min(weekInPhase, weekPlans.length - 1)] || weekPlans[weekPlans.length - 1];
  }

  // ── GENERIC FALLBACK ──
  const generic = [
    `Core concept study — read official docs + take notes on ${phase.name}`,
    `Hands-on practice — follow a tutorial for ${(phase.skills||["core skills"])[0]}`,
    `Build a small feature using ${(phase.skills||["the skill"])[1] || "this week's topic"}`,
    `Practice exercises — HackerRank or official exercises`,
    `Project work — implement this week's concepts in your project`,
    `Debug + refine + write documentation for what you built`,
    `Push to GitHub + review progress + plan next week`
  ];
  return generic;
}

// ══════════════════════════════════════════════════
//  ROADMAP TAB
// ══════════════════════════════════════════════════
function buildRoadmapTab(data) {
  const el = document.getElementById("dtab-roadmap");
  if (!el) return;
  el.innerHTML = `
    <div class="dash-section-header">
      <span class="dash-eyebrow">AI-Generated Pathway</span>
      <h2 class="dash-title">Your Career <span class="text-accent">Luminous Path</span></h2>
      <p class="dash-sub">${data.currentLevel || ""} · ${data.totalDuration} · ${data.hoursPerDay || 2}h/day</p>
    </div>
    <div class="rm-stats-row">
      <div class="rm-stat"><div class="rm-stat-val accent">${data.totalDuration}</div><div class="rm-stat-lbl">Duration</div></div>
      <div class="rm-stat"><div class="rm-stat-val">${(data.phases||[]).length}</div><div class="rm-stat-lbl">Phases</div></div>
      <div class="rm-stat"><div class="rm-stat-val amber">${data.hoursPerDay||2}h</div><div class="rm-stat-lbl">Daily</div></div>
      <div class="rm-stat"><div class="rm-stat-val green" id="overall-pct">0%</div><div class="rm-stat-lbl">Progress</div></div>
    </div>
    <div class="timeline-wrap" id="timeline-wrap"></div>`;

  const wrap = el.querySelector("#timeline-wrap");
  (data.phases||[]).forEach((ph,i) => {
    // Get week count for this phase
    const dur = ph.duration || "1 month";
    const numMatch = dur.match(/(\d+(\.\d+)?)/);
    const num = numMatch ? parseFloat(numMatch[1]) : 1;
    const weeks = dur.includes("week") ? Math.round(num) : Math.round(num * 4);

    const div = document.createElement("div");
    div.className = "tl-node" + (i>0?" locked":"");
    div.innerHTML = `
      <div class="tl-marker" style="background:${ph.color||'var(--accent2)'}"></div>
      <div class="tl-card glass-card" onclick="togglePhase(${i})" id="tlcard-${i}">
        <div class="tl-card-header">
          <div>
            <div class="tl-eyebrow">Phase ${i+1} · ${ph.duration} · ${weeks} weeks</div>
            <div class="tl-card-title">${ph.name}</div>
          </div>
          <div>${i===0
            ? `<div class="tl-progress-ring"><span id="tl-pct-${i}">0%</span></div>`
            : `<span class="material-symbols-outlined tl-lock-icon">lock</span>`}
          </div>
        </div>
        <div class="tl-body" id="tl-body-${i}">
          <div class="tl-skills">${(ph.skills||[]).map(s=>`<span class="skill-chip">${s}</span>`).join("")}</div>
          <div class="tl-milestones">${(ph.milestones||[]).map((m,mi)=>`
            <div class="tl-milestone" onclick="toggleMilestone(event,${i},${mi})">
              <div class="tl-check" id="tmc-${i}-${mi}"></div>
              <span id="tmt-${i}-${mi}">${m}</span>
            </div>`).join("")}</div>
          <div class="tl-sub-label">Week-by-week breakdown (${weeks} weeks)</div>
          <div class="tl-chips">${buildWeekChipsForPhase(i, weeks, data)}</div>
          ${ph.resources&&ph.resources.length?`<div class="tl-sub-label">Resources</div><div class="tl-chips">${ph.resources.map(r=>`<span class="res-chip ${r.type||''}">${r.name}</span>`).join("")}</div>`:""}
          <div class="tl-hackathon"><span class="material-symbols-outlined" style="font-size:13px">event</span>Recommended: Join a hackathon during this phase!</div>
        </div>
      </div>`;
    wrap.appendChild(div);
  });
}

function buildWeekChipsForPhase(phaseIdx, weeks, data) {
  const goal = (data.goal||"").toLowerCase();
  let chips = "";
  for (let w = 0; w < weeks; w++) {
    const plan = getRoleWeekPlan(goal, phaseIdx, w, weeks, (data.phases||[])[phaseIdx] || {});
    // Use first day as the week summary
    const summary = plan[0].replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:\s*/i,"");
    const short = summary.length > 50 ? summary.substring(0, 47) + "…" : summary;
    chips += `<span class="res-chip" style="cursor:default;"><strong>Wk ${w+1}:</strong> ${short}</span>`;
  }
  return chips;
}

function togglePhase(i) {
  document.getElementById("tl-body-"+i)?.classList.toggle("open");
  document.getElementById("tlcard-"+i)?.classList.toggle("expanded");
}

function toggleMilestone(e,pi,mi) {
  e.stopPropagation();
  const key=`${pi}-${mi}`;
  State.checkedMilestones[key]=!State.checkedMilestones[key];
  const done=State.checkedMilestones[key];
  const chk=document.getElementById(`tmc-${pi}-${mi}`);
  const txt=document.getElementById(`tmt-${pi}-${mi}`);
  if(chk) chk.classList.toggle("done",done);
  if(txt){txt.style.textDecoration=done?"line-through":"";txt.style.opacity=done?"0.45":"";}
  if(done) State.streakDays.add(State.todayStr);
  updatePhasePct(pi);
}

function updatePhasePct(pi) {
  const ph=State.roadmapData?.phases?.[pi]; if(!ph) return;
  const total=(ph.milestones||[]).length; if(!total) return;
  const done=Object.keys(State.checkedMilestones).filter(k=>k.startsWith(pi+"-")&&State.checkedMilestones[k]).length;
  const pct=Math.round(done/total*100);
  const lbl=document.getElementById(`tl-pct-${pi}`); if(lbl) lbl.textContent=pct+"%";
  const allTotal=(State.roadmapData?.phases||[]).reduce((s,p)=>s+(p.milestones||[]).length,0);
  const allDone=Object.values(State.checkedMilestones).filter(Boolean).length;
  const oel=document.getElementById("overall-pct");
  if(oel) oel.textContent=(allTotal?Math.round(allDone/allTotal*100):0)+"%";
}

// ══════════════════════════════════════════════════
//  PLANNER TAB — week-aware, progressive
// ══════════════════════════════════════════════════

function buildPlannerTab(data) {
  const el = document.getElementById("dtab-planner"); if(!el) return;
  // Week 0 = current real week, calculate from roadmap start (today)
  State.plannerStartDate = State.plannerStartDate || new Date();
  const today = new Date();
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - today.getDay());

  el.innerHTML = `
    <div class="planner-header">
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <div>
          <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);font-weight:700;margin-bottom:.2rem;">Weekly View</div>
          <div class="planner-week-title">Day Planner</div>
        </div>
        <div class="planner-week-nav" style="margin-left:auto;">
          <button class="planner-nav-btn" onclick="shiftWeek(-1)">‹</button>
          <span class="planner-week-range" id="planner-week-lbl"></span>
          <button class="planner-nav-btn" onclick="shiftWeek(1)">›</button>
        </div>
      </div>
      <div id="planner-phase-badge" style="margin-top:.65rem;font-size:.78rem;color:var(--accent2);font-weight:600;"></div>
    </div>
    <div class="planner-day-list" id="planner-day-list"></div>
    <button class="planner-add-fab" title="Add task">+</button>`;

  renderPlannerWeek(State.weekOffset, data);
}

function shiftWeek(delta) {
  State.weekOffset += delta;
  renderPlannerWeek(State.weekOffset, State.roadmapData);
}

function renderPlannerWeek(weekOffset, data) {
  const list = document.getElementById("planner-day-list"); if(!list) return;
  const lbl  = document.getElementById("planner-week-lbl");
  const badge = document.getElementById("planner-phase-badge");
  const DAYS  = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const today = new Date();

  // Compute actual calendar dates for this week
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - today.getDay());
  const weekStart = new Date(startOfThisWeek);
  weekStart.setDate(startOfThisWeek.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

  if(lbl) lbl.textContent = `${weekStart.toLocaleDateString("en",{month:"short",day:"numeric"})} – ${weekEnd.toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}`;

  // Which week of the roadmap is this? week 0 = roadmap week 1
  const roadmapWeekNum = weekOffset; // can be negative (before roadmap) or beyond schedule (after)

  // Find which schedule entry applies
  const schedule = State.weekSchedule || [];
  const scheduleEntry = roadmapWeekNum >= 0 && roadmapWeekNum < schedule.length
    ? schedule[roadmapWeekNum]
    : null;

  if(badge) {
    if(scheduleEntry) {
      badge.innerHTML = `<span style="background:rgba(64,206,243,.12);color:var(--accent2);padding:.2rem .75rem;border-radius:20px;font-size:.72rem;font-weight:700;display:inline-block;">
        📍 Roadmap Week ${roadmapWeekNum + 1} of ${schedule.length} · Phase ${scheduleEntry.phaseIdx + 1}: ${scheduleEntry.phaseName}
      </span>`;
    } else if(roadmapWeekNum < 0) {
      badge.innerHTML = `<span style="color:var(--text3);font-size:.75rem;">← Before your roadmap start date</span>`;
    } else {
      badge.innerHTML = `<span style="color:var(--green);font-size:.75rem;font-weight:600;">🎓 Roadmap complete — keep building & applying!</span>`;
    }
  }

  // Get days for this week
  const days = scheduleEntry?.days || getFallbackDays(data);
  list.innerHTML = "";

  for(let i = 0; i < 7; i++) {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    const isPast  = d < today && !isToday;
    const isFuture = d > today;
    const dayData = days[i] || { desc: "Rest day", tag: "REST", tagClass: "ptag-rest", type: "rest" };
    const progress = isToday ? 45 : isPast ? 100 : 0;

    const card = document.createElement("div");
    card.className = "planner-day-card" + (isToday ? " today" : "");
    card.innerHTML = `
      <div class="planner-day-header">
        <div class="planner-day-left">
          <div>
            <div class="planner-day-name">${DAYS[d.getDay()]}</div>
            <div class="planner-day-num">${d.getDate()}</div>
          </div>
          <div class="planner-day-tags">
            <span class="planner-day-tag ${dayData.tagClass}">${dayData.tag}</span>
            <span class="planner-day-duration">${data?.hoursPerDay || 2}h session</span>
          </div>
        </div>
        ${isToday ? `<div style="display:flex;gap:.4rem;">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer;" title="AI Help">
            <span class="material-symbols-outlined" style="font-size:.9rem;color:var(--text3)">smart_toy</span>
          </div>
          <div style="width:32px;height:32px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <span class="material-symbols-outlined" style="font-size:.9rem;color:var(--text3)">more_horiz</span>
          </div>
        </div>` : isFuture && i === 1 ? `<span class="material-symbols-outlined planner-day-lock">lock</span>` : ""}
      </div>
      <div class="planner-progress-bar">
        <div class="planner-progress-fill" style="width:${progress}%"></div>
      </div>
      <div style="padding:.4rem 1.35rem ${isToday ? ".1rem" : ".75rem"};font-size:.78rem;color:var(--text2);line-height:1.55;border-top:1px solid var(--border);">
        📌 ${escHtml(dayData.desc)}
      </div>
      ${isToday ? `<div class="planner-day-actions">
        <div class="planner-action"><span class="material-symbols-outlined">play_circle</span> Watch Video Guide</div>
        <div class="planner-action"><span class="material-symbols-outlined">code</span> Coding Exercises</div>
        <div class="planner-action"><span class="material-symbols-outlined">chat_bubble</span> Ask Roadlify AI</div>
      </div>` : ""}`;
    list.appendChild(card);
  }
}

function getFallbackDays(data) {
  return [
    { desc: "Study core concepts", tag: "STUDY", tagClass: "ptag-python", type: "topic" },
    { desc: "Hands-on practice session", tag: "PRACTICE", tagClass: "ptag-practice", type: "practice" },
    { desc: "Tutorial + coding along", tag: "CODING", tagClass: "ptag-func", type: "topic" },
    { desc: "Build project features", tag: "PROJECT", tagClass: "ptag-project", type: "project" },
    { desc: "Review + debug + document", tag: "REVIEW", tagClass: "ptag-review", type: "review" },
    { desc: "Portfolio project work + GitHub push", tag: "GIT", tagClass: "ptag-git", type: "git" },
    { desc: "Rest + plan next week", tag: "REST", tagClass: "ptag-rest", type: "rest" },
  ];
}

// ══════════════════════════════════════════════════
//  STREAKS TAB
// ══════════════════════════════════════════════════
function buildStreaksTab() {
  const el=document.getElementById("dtab-streaks"); if(!el) return;
  const today=new Date(), y=today.getFullYear(), m=today.getMonth();
  const first=new Date(y,m,1).getDay(), dim=new Date(y,m+1,0).getDate();
  const missed=Math.max(0,today.getDate()-State.streakDays.size);
  let chain="";
  for(let i=0;i<first;i++) chain+=`<div class="chain-day future" style="visibility:hidden"></div>`;
  for(let d=1;d<=dim;d++){
    const ds=new Date(y,m,d).toDateString();
    const isT=d===today.getDate();
    const done=State.streakDays.has(ds);
    const past=d<today.getDate();
    let cls=isT?"done":done?"done":past?"missed":"future";
    if(!done&&!past&&!isT&&new Date(y,m,d).getDay()===0) cls="planned";
    chain+=`<div class="chain-day ${cls}" onclick="toggleChainDay('${ds}',this)" title="${ds}">${String(d).padStart(2,'0')}</div>`;
  }
  const monthName=today.toLocaleDateString("en",{month:"long",year:"numeric"});
  const consistency=dim>0?Math.round(State.streakDays.size/Math.min(today.getDate(),dim)*100):0;
  const dash=`${consistency},100`;
  el.innerHTML=`
    <div class="dash-section-header">
      <span class="dash-eyebrow">Analytics Insight</span>
      <h2 class="dash-title">Your Career <span class="text-accent">Momentum</span></h2>
    </div>
    <div class="streaks-metrics">
      <div class="streaks-metric-card"><div><div class="sm-label">Current Momentum</div><div class="sm-value-row"><span class="sm-num">${State.streakDays.size}</span><span class="sm-unit">Day Streak</span></div></div><div class="sm-icon sm-icon-fire"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">local_fire_department</span></div></div>
      <div class="streaks-metric-card"><div><div class="sm-label">Milestones Reached</div><div class="sm-value-row"><span class="sm-num">${State.streakDays.size}</span><span class="sm-unit">Days Done</span></div></div><div class="sm-icon sm-icon-check"><span class="material-symbols-outlined">check_circle</span></div></div>
      <div class="streaks-metric-card"><div><div class="sm-label">Recovery Phase</div><div class="sm-value-row"><span class="sm-num">${missed}</span><span class="sm-unit">Missed</span></div></div><div class="sm-icon sm-icon-alert"><span class="material-symbols-outlined">notification_important</span></div></div>
    </div>
    <div class="momentum-card">
      <div style="margin-bottom:1.25rem;">
        <div class="momentum-eyebrow">Career Activity Chain</div>
        <div class="momentum-title">Your Activity Chain</div>
        <div class="momentum-sub">Tracing your ${State.roadmapData?.totalDuration||"36-month"} ${State.roadmapData?.goal||"Career"} trajectory</div>
        <div class="momentum-view-btns">
          <button class="mv-btn mv-btn-ghost" id="streak-lifetime-btn" onclick="toggleStreakView('lifetime')">Lifetime View</button>
          <button class="mv-btn mv-btn-primary" id="streak-yearly-btn" onclick="toggleStreakView('yearly')">Yearly Drilldown</button>
        </div>
      </div>
      <div class="year-section">
        <div class="year-header"><h3 class="year-title">Year 1: Foundation</h3><div class="year-divider"></div><span class="year-badge">${y} Season</span></div>
        <div class="month-section">
          <div class="month-label">${monthName} — Phase: Core Concepts</div>
          <div class="day-chain">${chain}</div>
          <div class="month-momentum">
            <div class="mm-ring"><svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface3)" stroke-width="3"/><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" stroke-dasharray="${dash}" stroke-width="3"/></svg><div class="mm-pct">${consistency}%</div></div>
            <div class="mm-text"><h4>${monthName.split(" ")[0]} Consistency</h4><p>${missed>5?"You've missed "+missed+" sessions. Try 15-min deep work blocks to restart your momentum.":"Great momentum! Keep showing up consistently every day."}</p></div>
          </div>
        </div>
      </div>
      <div class="year-section year-locked">
        <div class="year-header"><h3 class="year-title" style="color:var(--text3)">Year 2: Specialized Skills</h3><div class="year-divider"></div><span class="year-badge">Locked Future</span></div>
        <div class="day-chain">${Array(5).fill(0).map(()=>`<div class="chain-day future" style="border:1px dashed var(--border);background:transparent;opacity:.3"></div>`).join("")}</div>
      </div>
    </div>`;
}

function toggleChainDay(ds, el) {
  if(State.streakDays.has(ds)){State.streakDays.delete(ds);el.className="chain-day missed";}
  else{State.streakDays.add(ds);el.className="chain-day done";}
  const nums=document.querySelectorAll(".sm-num");
  if(nums[0]) nums[0].textContent=State.streakDays.size;
  if(nums[1]) nums[1].textContent=State.streakDays.size;
}

// ══════════════════════════════════════════════════
//  TO-DO TAB — shows current week's tasks
// ══════════════════════════════════════════════════
function buildTodoTab(data) {
  State.todoItems = [];
  // Pull from current roadmap week's tasks
  const roadmapWeekNum = Math.max(0, State.weekOffset || 0);
  const schedule = State.weekSchedule || [];
  const scheduleEntry = schedule[roadmapWeekNum] || schedule[0];
  const days = scheduleEntry?.days || getFallbackDays(data);

  // Add this week's daily tasks (Mon–Fri, skip rest day)
  days.forEach((day, i) => {
    if(day.type !== "rest") {
      State.todoItems.push({
        id: i,
        text: day.desc,
        done: false,
        cat: day.type === "project" ? "coding" : day.type === "review" ? "review" : "learning",
        phase: (scheduleEntry?.phaseIdx || 0) + 1,
        dayLabel: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]
      });
    }
  });

  // Add phase milestones for current phase
  const currentPhase = data?.phases?.[scheduleEntry?.phaseIdx || 0];
  (currentPhase?.milestones||[]).forEach((m,i) => {
    State.todoItems.push({ id: 100+i, text: m, done: false, cat: "milestone", phase: (scheduleEntry?.phaseIdx||0)+1 });
  });

  renderTodos();
}

function renderTodos() {
  const el=document.getElementById("dtab-todo"); if(!el) return;
  const all=State.todoItems, f=State.todoFilter;
  const shown=f==="all"?all:f==="done"?all.filter(t=>t.done):all.filter(t=>!t.done);
  const done=all.filter(t=>t.done).length, pct=all.length?Math.round(done/all.length*100):0;
  const catCls={coding:"cat-accent",learning:"cat-teal",milestone:"cat-amber",review:"cat-green",other:"cat-muted"};
  const roadmapWeekNum = Math.max(0, State.weekOffset || 0);
  const schedule = State.weekSchedule || [];
  const scheduleEntry = schedule[roadmapWeekNum];
  const weekLabel = scheduleEntry ? `Week ${roadmapWeekNum+1} — Phase ${scheduleEntry.phaseIdx+1}: ${scheduleEntry.phaseName}` : "Current Week";

  el.innerHTML=`
    <div class="dash-section-header">
      <span class="dash-eyebrow">Daily Tasks</span>
      <h2 class="dash-title">To-Do <span class="text-accent">List</span></h2>
      <p class="dash-sub" style="margin-top:.35rem;">📍 ${weekLabel}</p>
    </div>
    <div class="todo-add-row">
      <input class="todo-input" id="todo-inp" placeholder="Add a custom task..." onkeydown="if(event.key==='Enter')addTodo()"/>
      <button class="todo-add-btn" onclick="addTodo()">+ Add</button>
    </div>
    <div class="todo-filters">
      <button class="todo-filter${f==="all"?" active":""}" onclick="setFilter('all')">All (${all.length})</button>
      <button class="todo-filter${f==="pending"?" active":""}" onclick="setFilter('pending')">Pending (${all.length-done})</button>
      <button class="todo-filter${f==="done"?" active":""}" onclick="setFilter('done')">Done (${done})</button>
    </div>
    <div class="todo-progress"><div class="todo-progress-fill" style="width:${pct}%"></div></div>
    <div class="todo-pct-lbl">${pct}% complete · ${done}/${all.length} tasks</div>
    <div class="todo-list">
      ${shown.map(t=>`
        <div class="todo-item">
          <div class="todo-check${t.done?" done":""}" onclick="toggleTodo(${t.id})"></div>
          <div style="flex:1;min-width:0;">
            ${t.dayLabel ? `<div style="font-size:.68rem;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.15rem;">${t.dayLabel}</div>` : ""}
            <span class="todo-text${t.done?" done-txt":""}">${escHtml(t.text)}</span>
          </div>
          <div class="todo-meta">
            <span class="todo-cat ${catCls[t.cat]||"cat-muted"}">${t.cat}</span>
            <button class="todo-del" onclick="deleteTodo(${t.id})">✕</button>
          </div>
        </div>`).join("")}
    </div>`;
}

function setFilter(f)   { State.todoFilter=f; renderTodos(); }
function toggleTodo(id) { const t=State.todoItems.find(i=>i.id===id); if(t){t.done=!t.done;State.streakDays.add(State.todayStr);renderTodos();} }
function deleteTodo(id) { State.todoItems=State.todoItems.filter(t=>t.id!==id); renderTodos(); }
function addTodo() {
  const inp=document.getElementById("todo-inp"); const txt=inp?.value?.trim(); if(!txt) return;
  State.todoItems.push({id:Date.now(),text:txt,done:false,cat:"other",phase:0}); inp.value=""; renderTodos();
}
function escHtml(t){ return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

// ══════════════════════════════════════════════════
//  CAREER IQ DASHBOARD TAB
// ══════════════════════════════════════════════════

function buildCareerIQTab(data) {
  const el = document.getElementById("dtab-careeriq"); if(!el) return;
  const mock = getSmartDashboardData(data?.goal || "", data);
  const goal = data?.goal || "Your Career Goal";
  const role = data?.goal || "Tech Role";
  const duration = data?.totalDuration || "6 months";
  const progress = Math.min(100, Math.round((Object.values(State.checkedMilestones||{}).filter(Boolean).length /
    Math.max(1, (data?.phases||[]).reduce((s,p)=>s+(p.milestones||[]).length,0))) * 100));

  el.innerHTML = `
    <div class="ciq-root">

      <!-- Page Header -->
      <div class="ciq-header">
        <div>
          <span class="ciq-eyebrow">Market Intelligence</span>
          <h2 class="ciq-title">Career Gap Analysis</h2>
          <p class="ciq-subtitle">Personalised for: <strong>${escHtml(goal)}</strong> · ${duration}</p>
        </div>
        <div class="ciq-header-actions">
          <button class="ciq-btn-ghost" onclick="exportCareerReport()">
            <span class="material-symbols-outlined">file_download</span> Export Report
          </button>
          <button class="ciq-btn-primary" onclick="runAIOptimisation()">
            <span class="material-symbols-outlined">bolt</span> AI Optimisation
          </button>
        </div>
      </div>

      <!-- Top Metrics Row -->
      <div class="ciq-metrics-row">
        <div class="ciq-metric-card glass-card">
          <div class="ciq-metric-label">Employability Rate</div>
          <div class="ciq-metric-value-row">
            <div class="ciq-metric-num">${mock.employability}%</div>
            <span class="ciq-trend ${mock.employabilityTrend === 'up' ? 'up' : 'down'}">
              <span class="material-symbols-outlined">${mock.employabilityTrend === 'up' ? 'trending_up' : 'trending_down'}</span>
              ${mock.employabilityDelta}
            </span>
          </div>
          <div class="ciq-metric-sub">CS graduates, entry level segment</div>
        </div>

        <div class="ciq-metric-card glass-card" style="border-color:var(--accent-glow)">
          <div class="ciq-metric-label" style="color:var(--accent2)">Skill Match Score</div>
          <div class="ciq-metric-value-row">
            <div class="ciq-metric-num" style="color:var(--accent2)">${mock.skillMatch}/100</div>
          </div>
          <div class="ciq-skill-bar"><div class="ciq-skill-fill" style="width:${mock.skillMatch}%"></div></div>
          <div class="ciq-metric-sub">Curriculum vs. live job postings</div>
        </div>

        <div class="ciq-metric-card glass-card">
          <div class="ciq-metric-label">Curriculum Lag</div>
          <div class="ciq-metric-value-row">
            <div class="ciq-metric-num">${mock.curriculumLag}</div>
            <span class="material-symbols-outlined" style="font-size:1.4rem;color:var(--text3)">history</span>
          </div>
          <div class="ciq-metric-sub">Average behind industry standard</div>
        </div>

        <div class="ciq-metric-card glass-card">
          <div class="ciq-metric-label">Self-Upskilling</div>
          <div class="ciq-metric-value-row">
            <div class="ciq-metric-num">${mock.selfUpskilling}%</div>
            <span class="ciq-trend up">
              <span class="material-symbols-outlined">trending_up</span>
              ${mock.upskillingDelta}
            </span>
          </div>
          <div class="ciq-metric-sub">Grads learning outside college</div>
        </div>
      </div>

      <!-- Middle: Skill Coverage + Hot Skills -->
      <div class="ciq-mid-row">

        <!-- Skill Coverage Chart (SVG bars) -->
        <div class="ciq-skill-chart glass-card">
          <div class="ciq-chart-header">
            <div>
              <h4 class="ciq-chart-title">Skill Coverage</h4>
              <p class="ciq-chart-sub">College curriculum vs. Industry demand</p>
            </div>
            <div class="ciq-legend">
              <span class="ciq-legend-item"><span class="ciq-legend-dot" style="background:var(--surface3)"></span>College</span>
              <span class="ciq-legend-item"><span class="ciq-legend-dot" style="background:var(--accent)"></span>Industry</span>
            </div>
          </div>
          <div class="ciq-bars-wrap" id="ciq-skill-bars"></div>
        </div>

        <!-- Hot Skills + AI Tip -->
        <div class="ciq-hot-skills glass-card">
          <h4 class="ciq-chart-title">Hot Skills</h4>
          <p class="ciq-chart-sub">Emerging technologies missing from most curricula</p>
          <div class="ciq-skills-cloud" id="ciq-skills-cloud"></div>
          <div class="ciq-ai-tip">
            <div class="ciq-ai-tip-header">
              <span class="material-symbols-outlined" style="color:var(--accent2);font-size:1.1rem">auto_awesome</span>
              <strong>AI Recommendation</strong>
            </div>
            <p>${mock.aiTip}</p>
          </div>
        </div>
      </div>

      <!-- Bottom: Funnel + Pie + Demand Chart -->
      <div class="ciq-bottom-row">

        <!-- Graduate Funnel -->
        <div class="ciq-funnel glass-card">
          <h4 class="ciq-chart-title">Graduate Outcome Funnel</h4>
          <div class="ciq-funnel-bars" id="ciq-funnel"></div>
        </div>

        <!-- Upskill Pie -->
        <div class="ciq-pie glass-card">
          <h4 class="ciq-chart-title">How Grads Close the Gap</h4>
          <div class="ciq-pie-wrap">
            <div class="ciq-pie-chart" id="ciq-pie-svg"></div>
            <div class="ciq-pie-legend" id="ciq-pie-legend"></div>
          </div>
        </div>

        <!-- Demand Surge -->
        <div class="ciq-demand glass-card">
          <h4 class="ciq-chart-title">Demand Surge by Role</h4>
          <div class="ciq-demand-chart" id="ciq-demand-chart"></div>
          <div class="ciq-demand-labels" id="ciq-demand-labels"></div>
        </div>
      </div>

      <!-- Progress Footer -->
      <div class="ciq-footer glass-card">
        <div class="ciq-progress-section">
          <div class="ciq-progress-labels">
            <span>Roadmap Progress</span>
            <span style="color:var(--accent2);font-weight:700">${progress}% Completed</span>
          </div>
          <div class="ciq-progress-track"><div class="ciq-progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="ciq-next-milestone">
          <div>
            <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);font-weight:700">Next Milestone</div>
            <div style="font-size:.85rem;font-weight:600;color:var(--text)">${escHtml(mock.nextMilestone)}</div>
          </div>
          <button class="ciq-next-btn" onclick="switchTopNav(document.querySelector('.dash-topnav-tab[onclick*=roadmap]'), 'roadmap')">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

    </div>`;

  // Render all charts
  renderSkillBars(mock.skillGaps);
  renderSkillsCloud(mock.hotSkills);
  renderFunnel(mock.funnel);
  renderPieChart(mock.upskillPie);
  renderDemandChart(mock.demandSurge, mock.demandLabels, mock.demandColors, mock.demandPct);
}

// ── Skill Coverage Bar Chart ──
function renderSkillBars(gaps) {
  const el = document.getElementById("ciq-skill-bars"); if(!el) return;
  el.innerHTML = gaps.map(g => {
    const isGap = g.gap > 0;
    const gapLabel = isGap ? `+${g.gap}% Gap` : `${g.gap}% Oversupply`;
    const gapColor = isGap ? "var(--accent2)" : "var(--text3)";
    return `
      <div class="ciq-bar-row">
        <div class="ciq-bar-label">
          <span>${escHtml(g.name)}</span>
          <span style="color:${gapColor};font-size:.72rem;font-weight:700">${gapLabel}</span>
        </div>
        <div class="ciq-bar-track">
          <div class="ciq-bar-college" style="width:${g.college}%"></div>
          ${isGap ? `<div class="ciq-bar-industry" style="width:${Math.min(g.gap,100-g.college)}%;margin-left:0"></div>` : ""}
        </div>
      </div>`;
  }).join("");
}

// ── Hot Skills Cloud ──
function renderSkillsCloud(skills) {
  const el = document.getElementById("ciq-skills-cloud"); if(!el) return;
  const icons = ["local_fire_department","database","hub","cloud","code","sync_alt","memory","terminal","analytics","rocket_launch"];
  el.innerHTML = skills.map((s, i) => `
    <div class="ciq-skill-pill ${i===0?'hot':''}" onclick="drillIntoSkill('${escHtml(s)}')" title="Click to see where ${escHtml(s)} fits in your roadmap">
      <span class="material-symbols-outlined" style="font-size:.95rem${i===0?';font-variation-settings:\\"FILL\\" 1':''}">${icons[i%icons.length]}</span>
      ${escHtml(s)}
      <span class="ciq-pill-arrow material-symbols-outlined">arrow_forward</span>
    </div>`).join("");
}

// ── Graduate Funnel ──
function renderFunnel(funnel) {
  const el = document.getElementById("ciq-funnel"); if(!el) return;
  const labels = ["Graduated", "Applied to tech", "Got interviews", "Received offer"];
  const maxW = 100;
  el.innerHTML = funnel.map((v, i) => {
    const w = maxW - i * (maxW * 0.2 / (funnel.length - 1));
    const opacity = 0.15 + i * 0.28;
    return `
      <div class="ciq-funnel-row">
        <div class="ciq-funnel-bar" style="width:${w}%;background:rgba(0,100,121,${opacity})">
          <span class="ciq-funnel-lbl">${labels[i]}</span>
          <span class="ciq-funnel-val">${v}%</span>
        </div>
      </div>`;
  }).join("");
}

// ── Pie Chart (SVG conic) ──
function renderPieChart(slices) {
  const svgEl  = document.getElementById("ciq-pie-svg");
  const legEl  = document.getElementById("ciq-pie-legend");
  if(!svgEl || !legEl) return;

  // Build SVG pie using stroke-dasharray trick on a circle
  const r = 40, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;
  const segments = slices.map(s => {
    const dash = (s.value / 100) * circ;
    const offset = circ * (1 - cumPct / 100);
    cumPct += s.value;
    return { ...s, dash, offset };
  });

  svgEl.innerHTML = `
    <svg viewBox="0 0 100 100" style="width:100%;height:100%">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="18"/>
      ${segments.map(s => `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
          stroke="${s.color}" stroke-width="18"
          stroke-dasharray="${s.dash} ${circ - s.dash}"
          stroke-dashoffset="${s.offset}"
          transform="rotate(-90 ${cx} ${cy})" />`).join("")}
      <text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle"
        style="font-size:8px;font-weight:700;fill:var(--accent2);font-family:'Plus Jakarta Sans',sans-serif">
        ${slices[0].value}%
      </text>
    </svg>`;

  legEl.innerHTML = slices.map(s => `
    <div class="ciq-pie-leg-item">
      <span class="ciq-pie-dot" style="background:${s.color}"></span>
      <span>${s.name} (${s.value}%)</span>
    </div>`).join("");
}

// ── Demand Surge Line Chart (SVG polyline) ──
function renderDemandChart(data, labels, colors, pcts) {
  const el = document.getElementById("ciq-demand-chart");
  const labEl = document.getElementById("ciq-demand-labels");
  if(!el || !labEl) return;

  const W = 300, H = 100, pad = { t:10, b:20, l:10, r:10 };
  const years = data.map(d => d.year);
  const series1 = data.map(d => d.fullstack);
  const series2 = data.map(d => d.cloud);
  const allVals = [...series1, ...series2];
  const minV = Math.min(...allVals) * 0.85;
  const maxV = Math.max(...allVals) * 1.05;
  const scaleX = i => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const scaleY = v => pad.t + (1 - (v - minV) / (maxV - minV)) * (H - pad.t - pad.b);
  const toPoints = arr => arr.map((v,i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%" preserveAspectRatio="none">
      <!-- Grid lines -->
      ${[0,1,2,3].map(i => `<line x1="${pad.l}" x2="${W-pad.r}" y1="${pad.t + i*(H-pad.t-pad.b)/3}" y2="${pad.t + i*(H-pad.t-pad.b)/3}" stroke="var(--border)" stroke-width="0.5"/>`).join("")}
      <!-- Area fills -->
      <polygon points="${toPoints(series1)} ${scaleX(data.length-1)},${H-pad.b} ${scaleX(0)},${H-pad.b}" fill="${colors[0]}" opacity="0.08"/>
      <polygon points="${toPoints(series2)} ${scaleX(data.length-1)},${H-pad.b} ${scaleX(0)},${H-pad.b}" fill="${colors[1]}" opacity="0.08"/>
      <!-- Lines -->
      <polyline points="${toPoints(series1)}" fill="none" stroke="${colors[0]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${toPoints(series2)}" fill="none" stroke="${colors[1]}" stroke-width="1.5" stroke-dasharray="4,3" stroke-linecap="round"/>
      <!-- Dots at end -->
      <circle cx="${scaleX(data.length-1)}" cy="${scaleY(series1[series1.length-1])}" r="3" fill="${colors[0]}"/>
      <circle cx="${scaleX(data.length-1)}" cy="${scaleY(series2[series2.length-1])}" r="2.5" fill="${colors[1]}"/>
      <!-- Year labels -->
      ${years.map((y,i) => `<text x="${scaleX(i)}" y="${H-3}" text-anchor="middle" style="font-size:5.5px;fill:var(--text3)">${y}</text>`).join("")}
    </svg>`;

  labEl.innerHTML = labels.map((l, i) => `
    <div class="ciq-demand-leg">
      <span class="ciq-demand-dot" style="background:${colors[i]};${i===1?'opacity:.7':''}"></span>
      <span>${l}</span>
      <span style="color:${colors[i]};font-weight:700;margin-left:auto">${pcts[i]}</span>
    </div>`).join("");
}

function exportCareerReport() {
  alert("📊 Export feature coming soon — will generate a PDF career gap report!");
}

// ══════════════════════════════════════════════════
//  SKILL DRILL-DOWN — click hot skill → roadmap
// ══════════════════════════════════════════════════

// Rich knowledge base: skill → { phase fit, resources, why it matters, weekly tasks }
const SKILL_DETAIL = {
  // ── Web / Full Stack ──
  "React 19":          { phase:"Frontend Phase", color:"#006479", why:"React 19 introduces Server Components and the new compiler — essential for modern Full Stack roles. Most JDs list it as required.", resources:[{n:"React Docs (react.dev)",url:"https://react.dev",free:true},{n:"Scrimba React Course",url:"https://scrimba.com/learn/learnreact",free:true},{n:"Epic React by Kent C. Dodds",url:"https://epicreact.dev",free:false}], tasks:["Build a component library with React 19 features","Implement Server Components in a Next.js app","Add Error Boundaries and Suspense to a project"] },
  "Next.js App Router":{ phase:"Frontend Phase", color:"#006479", why:"App Router is now the default in Next.js 14+. It enables Server Components, streaming, and parallel routes — replacing Pages Router in most new projects.", resources:[{n:"Next.js Docs — App Router",url:"https://nextjs.org/docs/app",free:true},{n:"Next.js Learn (official)",url:"https://nextjs.org/learn",free:true}], tasks:["Migrate a Pages Router project to App Router","Build a blog with MDX + App Router","Deploy a Next.js app to Vercel with env vars"] },
  "TypeScript":        { phase:"JavaScript / Frontend Phase", color:"#3178c6", why:"TypeScript is now used in 78% of new JS projects. Interviewers filter by TS knowledge in senior roles.", resources:[{n:"TypeScript Handbook (free)",url:"https://www.typescriptlang.org/docs/handbook/intro.html",free:true},{n:"Matt Pocock's Total TypeScript",url:"https://www.totaltypescript.com",free:false},{n:"Execute Program — TypeScript",url:"https://www.executeprogram.com",free:false}], tasks:["Convert a JS project to TypeScript","Type a REST API with Zod for runtime validation","Write generics for a reusable fetch hook"] },
  "Docker":            { phase:"Backend / DevOps Phase", color:"#2496ed", why:"Docker is required in 82% of backend and DevOps job postings. Used in every stage of the deployment pipeline.", resources:[{n:"Docker Docs Get Started",url:"https://docs.docker.com/get-started/",free:true},{n:"TechWorld with Nana — Docker Tutorial",url:"https://www.youtube.com/watch?v=3c-iBn73dDE",free:true},{n:"Docker & Kubernetes Udemy (KodeKloud)",url:"https://kodekloud.com",free:false}], tasks:["Containerise a Node.js + MongoDB app","Write a docker-compose for full MERN stack","Push your image to Docker Hub"] },
  "tRPC":              { phase:"Full Stack Integration Phase", color:"#398CCB", why:"tRPC eliminates REST boilerplate entirely with end-to-end type safety. Fast adoption in TypeScript monorepos.", resources:[{n:"tRPC Docs",url:"https://trpc.io/docs",free:true},{n:"Theo's tRPC tutorial (YouTube)",url:"https://www.youtube.com/watch?v=2LYM8gf184U",free:true}], tasks:["Build a Next.js + tRPC CRUD app","Add Zod input validation to tRPC procedures","Replace a REST API with tRPC in an existing project"] },
  "Prisma ORM":        { phase:"Database Phase", color:"#5a67d8", why:"Prisma is the most-adopted ORM in TypeScript ecosystems, used with PostgreSQL, MySQL, SQLite and MongoDB.", resources:[{n:"Prisma Docs",url:"https://www.prisma.io/docs",free:true},{n:"Prisma Tutorial — official YouTube",url:"https://www.youtube.com/c/PrismaData",free:true}], tasks:["Set up Prisma with PostgreSQL on Railway","Write a schema with relations (User → Posts)","Run migrations and seed data"] },
  "Redis":             { phase:"Backend / Advanced Phase", color:"#dc382d", why:"Redis is required for caching, sessions, queues, and pub/sub in high-traffic backends. Appears in 65% of senior backend JDs.", resources:[{n:"Redis University (free)",url:"https://university.redis.com",free:true},{n:"Redis Docs",url:"https://redis.io/docs",free:true}], tasks:["Add Redis session caching to an Express app","Implement rate limiting with Redis in Node.js","Build a leaderboard using Redis sorted sets"] },

  // ── AI/ML ──
  "Prompt Engineering":{ phase:"GenAI / LLM Phase", color:"#7c3aed", why:"Prompt engineering is cited in 68% of GenAI job postings. It's the fastest way to add value to AI products right now.", resources:[{n:"DeepLearning.AI — ChatGPT Prompt Eng (free)",url:"https://learn.deeplearning.ai/chatgpt-prompt-eng",free:true},{n:"OpenAI Cookbook",url:"https://cookbook.openai.com",free:true},{n:"Learn Prompting (free)",url:"https://learnprompting.org",free:true}], tasks:["Build a few-shot prompting classifier","Implement chain-of-thought reasoning for maths","Create a system prompt for a role-specific chatbot"] },
  "Vector DBs":        { phase:"GenAI / LLM Phase", color:"#059669", why:"Vector databases (Pinecone, Weaviate, Chroma) are the backbone of RAG pipelines. Usage grew 400% in 2024.", resources:[{n:"Pinecone Docs & Learning Center",url:"https://docs.pinecone.io",free:true},{n:"LangChain Vectorstore Tutorial",url:"https://python.langchain.com/docs/modules/data_connection/vectorstores/",free:true}], tasks:["Store embeddings from a PDF in ChromaDB","Build a semantic search engine over documents","Compare cosine similarity of different text chunks"] },
  "RAG Pipelines":     { phase:"GenAI / LLM Phase", color:"#7c3aed", why:"Retrieval-Augmented Generation is now the standard way to build production LLM apps — prevents hallucination and adds domain knowledge.", resources:[{n:"LangChain RAG Tutorial (free)",url:"https://python.langchain.com/docs/use_cases/question_answering/",free:true},{n:"LlamaIndex Docs",url:"https://docs.llamaindex.ai",free:true},{n:"DeepLearning.AI RAG Course",url:"https://learn.deeplearning.ai",free:true}], tasks:["Build a PDF Q&A app with LangChain + ChromaDB","Add a reranker to improve RAG retrieval quality","Evaluate RAG with RAGAS metrics"] },
  "LangChain":         { phase:"GenAI / LLM Phase", color:"#059669", why:"LangChain is the most-starred AI framework on GitHub, used to build agents, chatbots, and RAG pipelines.", resources:[{n:"LangChain Python Docs",url:"https://python.langchain.com",free:true},{n:"LangChain YouTube channel",url:"https://www.youtube.com/@LangChain",free:true}], tasks:["Build a conversational agent with memory","Implement a tool-calling agent (search + calculator)","Chain multiple LLM calls with LCEL"] },

  // ── DevOps ──
  "Kubernetes":        { phase:"Container Orchestration Phase", color:"#326ce5", why:"Kubernetes is in 85% of DevOps/SRE job postings. CKA certification is one of the highest-ROI certs in tech.", resources:[{n:"Kubernetes Docs",url:"https://kubernetes.io/docs/home/",free:true},{n:"KodeKloud Kubernetes Course",url:"https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/",free:false},{n:"TechWorld with Nana — K8s",url:"https://www.youtube.com/watch?v=X48VuDVv0do",free:true}], tasks:["Deploy a containerised app to Minikube","Write Deployment + Service + Ingress manifests","Set up a Helm chart for a 3-tier app"] },
  "Terraform":         { phase:"Infrastructure as Code Phase", color:"#7b42bc", why:"Terraform is used by 74% of cloud infrastructure teams. HashiCorp Terraform cert is a top-5 DevOps credential.", resources:[{n:"Terraform Docs",url:"https://developer.hashicorp.com/terraform/docs",free:true},{n:"HashiCorp Learn Terraform",url:"https://developer.hashicorp.com/terraform/tutorials",free:true}], tasks:["Provision an EC2 instance + S3 bucket with Terraform","Use terraform workspaces for dev/staging/prod","Write a reusable Terraform module"] },
  "ArgoCD":            { phase:"GitOps / CD Phase", color:"#ef7b4d", why:"ArgoCD is the leading GitOps continuous delivery tool, adopted by 60% of K8s teams for declarative deployments.", resources:[{n:"ArgoCD Docs",url:"https://argo-cd.readthedocs.io",free:true},{n:"ArgoCD Getting Started Tutorial",url:"https://argo-cd.readthedocs.io/en/stable/getting_started/",free:true}], tasks:["Set up ArgoCD on a Minikube cluster","Sync a GitHub repo to a K8s namespace with ArgoCD","Implement a blue/green rollout strategy"] },

  // ── Cybersecurity ──
  "OSCP":              { phase:"Ethical Hacking Phase", color:"#dc2626", why:"OSCP (Offensive Security Certified Professional) is the gold standard penetration testing certification. Commands a 25–40% salary premium.", resources:[{n:"TryHackMe — OSCP Path",url:"https://tryhackme.com/path/outline/pentesting",free:false},{n:"HackTheBox Academy",url:"https://academy.hackthebox.com",free:false},{n:"PortSwigger Web Academy (free)",url:"https://portswigger.net/web-security",free:true}], tasks:["Complete 30 TryHackMe rooms","Root 10 HackTheBox Easy machines","Write a full penetration test report"] },
  "Cloud Security":    { phase:"Cloud Security Phase", color:"#dc2626", why:"Cloud Security is the fastest growing cybersecurity specialisation — 72% of new security roles are cloud-first.", resources:[{n:"AWS Security Specialty Docs",url:"https://aws.amazon.com/certification/certified-security-specialty/",free:true},{n:"Cloud Security Alliance (CSA)",url:"https://cloudsecurityalliance.org",free:true}], tasks:["Audit an AWS account with Scout Suite","Set up CloudTrail + GuardDuty + Security Hub","Implement IAM least-privilege policies"] },
  "Bug Bounty":        { phase:"Applied Security Phase", color:"#f59e0b", why:"Bug bounty experience counts as professional pentesting experience in job applications — and you can earn while learning.", resources:[{n:"HackerOne — Getting Started",url:"https://www.hackerone.com/hackers/get-started",free:true},{n:"Bugcrowd University",url:"https://www.bugcrowd.com/hackers/bugcrowd-university/",free:true},{n:"PortSwigger Web Security Academy",url:"https://portswigger.net/web-security",free:true}], tasks:["Complete all PortSwigger SQL Injection labs","Find and report your first bug on HackerOne","Build a methodology checklist for web app testing"] },

  // ── General / Defaults ──
  "CI/CD":             { phase:"DevOps / Backend Phase", color:"#0ea5e9", why:"CI/CD pipelines are expected in every modern engineering role. 89% of JDs mention it as either required or preferred.", resources:[{n:"GitHub Actions Docs",url:"https://docs.github.com/en/actions",free:true},{n:"GitHub Actions Full Course — TechWorld Nana",url:"https://www.youtube.com/watch?v=R8_veQiYBjI",free:true}], tasks:["Write a GitHub Actions workflow: lint → test → build","Add Docker image push to a CI pipeline","Set up environment secrets and deployment approvals"] },
  "System Design":     { phase:"Advanced / Senior Phase", color:"#8b5cf6", why:"System design interviews are required at FAANG and most mid-sized tech companies for roles above SDE I.", resources:[{n:"System Design Primer (GitHub)",url:"https://github.com/donnemartin/system-design-primer",free:true},{n:"ByteByteGo Newsletter",url:"https://bytebytego.com",free:false},{n:"Grokking System Design",url:"https://www.educative.io/courses/grokking-modern-system-design-interview",free:false}], tasks:["Design a URL shortener (LLD + HLD)","Study consistent hashing and its real-world uses","Design a notification system for 1M users"] },
};

function getSkillDetail(skillName) {
  // Direct match first
  if (SKILL_DETAIL[skillName]) return SKILL_DETAIL[skillName];
  // Case-insensitive fuzzy match
  const key = Object.keys(SKILL_DETAIL).find(k =>
    k.toLowerCase() === skillName.toLowerCase() ||
    skillName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(skillName.toLowerCase())
  );
  return key ? SKILL_DETAIL[key] : null;
}

function findSkillInRoadmap(skillName) {
  const data = State.roadmapData; if(!data) return [];
  const needle = skillName.toLowerCase();
  const results = [];
  (data.phases||[]).forEach((ph, pi) => {
    (ph.skills||[]).forEach(s => {
      if (s.toLowerCase().includes(needle) || needle.includes(s.toLowerCase().split(" ")[0])) {
        results.push({ type:"skill", phaseIdx:pi, phaseName:ph.name, text:s });
      }
    });
    (ph.milestones||[]).forEach((m, mi) => {
      if (m.toLowerCase().includes(needle)) {
        results.push({ type:"milestone", phaseIdx:pi, phaseName:ph.name, text:m, mi });
      }
    });
  });
  return results;
}

function drillIntoSkill(skillName) {
  // 1. Switch to roadmap tab
  const roadmapTopBtn = document.querySelector('.dash-topnav-tab[onclick*="roadmap"]');
  switchTopNav(roadmapTopBtn, "roadmap");

  // 2. Short delay so panel renders, then inject skill spotlight
  setTimeout(() => {
    injectSkillSpotlight(skillName);
  }, 80);
}

function injectSkillSpotlight(skillName) {
  const el = document.getElementById("dtab-roadmap"); if(!el) return;

  // Remove any existing spotlight
  document.getElementById("skill-spotlight")?.remove();

  const detail   = getSkillDetail(skillName);
  const matches  = findSkillInRoadmap(skillName);
  const color    = detail?.color || "var(--accent)";
  const phase    = detail?.phase || (matches[0]?.phaseName || "Your Roadmap");
  const why      = detail?.why  || `${skillName} is a key skill for your career goal.`;
  const resources= detail?.resources || [];
  const tasks    = detail?.tasks || [`Study the fundamentals of ${skillName}`, `Build a project using ${skillName}`, `Add ${skillName} to your portfolio`];

  // Build matched phases summary
  const matchHTML = matches.length
    ? `<div class="ss-matches">
        <div class="ss-match-title">Found in your roadmap:</div>
        ${matches.slice(0,4).map(m => `
          <div class="ss-match-item" onclick="highlightPhase(${m.phaseIdx})">
            <span class="material-symbols-outlined ss-match-icon">${m.type==='skill'?'check_circle':'flag'}</span>
            <span><strong>Phase ${m.phaseIdx+1}:</strong> ${escHtml(m.text)}</span>
            <span class="material-symbols-outlined ss-match-arrow">chevron_right</span>
          </div>`).join("")}
      </div>`
    : `<div class="ss-not-found">
        <span class="material-symbols-outlined" style="font-size:1rem">add_circle</span>
        <span><strong>${escHtml(skillName)}</strong> isn't explicitly in your roadmap yet — ask the AI to add it!</span>
        <button class="ss-ask-btn" onclick="askAIToAddSkill('${escHtml(skillName)}')">Ask AI to add →</button>
      </div>`;

  const spotlight = document.createElement("div");
  spotlight.id = "skill-spotlight";
  spotlight.className = "skill-spotlight";
  spotlight.innerHTML = `
    <div class="ss-header" style="border-left:4px solid ${color}">
      <div class="ss-header-left">
        <div class="ss-pill" style="background:${color}15;color:${color};border-color:${color}40">
          <span class="material-symbols-outlined" style="font-size:.9rem">bolt</span>
          Hot Skill Deep Dive
        </div>
        <h3 class="ss-title">${escHtml(skillName)}</h3>
        <p class="ss-phase">📍 Fits in: <strong>${escHtml(phase)}</strong></p>
      </div>
      <button class="ss-close" onclick="document.getElementById('skill-spotlight').remove()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="ss-body">
      <!-- Why it matters -->
      <div class="ss-section">
        <div class="ss-section-label">Why it matters</div>
        <p class="ss-why">${why}</p>
      </div>

      <!-- Roadmap matches -->
      <div class="ss-section">${matchHTML}</div>

      <!-- Suggested tasks -->
      <div class="ss-section">
        <div class="ss-section-label">Suggested tasks to add</div>
        <div class="ss-tasks">
          ${tasks.map((t,i) => `
            <div class="ss-task">
              <div class="ss-task-num">${i+1}</div>
              <span>${escHtml(t)}</span>
              <button class="ss-add-task" onclick="addHotSkillTask('${escHtml(t)}')" title="Add to To-Do">
                <span class="material-symbols-outlined">add_circle</span>
              </button>
            </div>`).join("")}
        </div>
      </div>

      ${resources.length ? `
      <!-- Resources -->
      <div class="ss-section">
        <div class="ss-section-label">Best resources</div>
        <div class="ss-resources">
          ${resources.map(r => `
            <a class="ss-resource ${r.free?'free':'paid'}" href="${r.url}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined">${r.free?'school':'workspace_premium'}</span>
              <span>${escHtml(r.n)}</span>
              <span class="ss-res-badge">${r.free?'FREE':'PAID'}</span>
              <span class="material-symbols-outlined ss-ext">open_in_new</span>
            </a>`).join("")}
        </div>
      </div>` : ""}
    </div>`;

  // Insert at top of roadmap tab
  el.insertBefore(spotlight, el.firstChild);
  spotlight.scrollIntoView({ behavior: "smooth", block: "start" });

  // Flash matching phase cards
  matches.forEach(m => highlightPhase(m.phaseIdx, true));
}

function highlightPhase(phaseIdx, auto) {
  const card = document.getElementById("tlcard-" + phaseIdx); if(!card) return;
  // Open the phase body
  document.getElementById("tl-body-" + phaseIdx)?.classList.add("open");
  card.classList.add("expanded");
  // Flash highlight
  card.classList.add("phase-highlight");
  setTimeout(() => card.classList.remove("phase-highlight"), 2200);
  if (!auto) card.scrollIntoView({ behavior: "smooth", block: "center" });
}

function addHotSkillTask(taskText) {
  if (!State.todoItems) State.todoItems = [];
  const exists = State.todoItems.some(t => t.text === taskText);
  if (exists) { showToast("Already in your To-Do list!", "info"); return; }
  State.todoItems.unshift({ id: Date.now(), text: taskText, done: false, cat: "coding", phase: 0 });
  showToast(`✅ Added to To-Do: "${taskText.substring(0,40)}..."`, "success");
  // Rebuild todo if visible
  const todoPanel = document.getElementById("dtab-todo");
  if (todoPanel?.classList.contains("active")) renderTodos();
}

function askAIToAddSkill(skillName) {
  // Switch to chat screen and pre-fill
  goToChat();
  setTimeout(() => {
    const inp = document.getElementById("chat-input");
    if (inp) {
      inp.value = `Please update my roadmap to include ${skillName} — add it to the most appropriate phase with specific learning tasks and resources.`;
      inp.dispatchEvent(new Event("input"));
      inp.focus();
    }
  }, 300);
}

function showToast(msg, type) {
  const existing = document.getElementById("roadlify-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "roadlify-toast";
  toast.className = "roadlify-toast " + (type || "success");
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 320); }, 3000);
}

// ══════════════════════════════════════════════════
//  AI OPTIMISATION — analyses gaps and goes to chat
// ══════════════════════════════════════════════════
function runAIOptimisation() {
  const data = State.roadmapData;
  if (!data) {
    showToast("⚠️ Generate a roadmap first, then use AI Optimisation!", "info");
    return;
  }
  const mock = getSmartDashboardData(data.goal, data);
  // Find the top 2 skill gaps
  const topGaps = (mock.skillGaps || [])
    .filter(g => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2)
    .map(g => g.name);

  const gapText = topGaps.length
    ? `My biggest skill gaps right now are: ${topGaps.join(" and ")}.`
    : "";

  const prompt = `I want to optimise my roadmap for ${data.goal}. ${gapText} Can you suggest the most impactful changes to my current roadmap to close these gaps faster and improve my employability? Focus on specific resources, projects, and any phases I should reorder or extend.`;

  // Show confirmation toast first
  showToast("🔍 Opening AI chat with your gap analysis...", "info");

  setTimeout(() => {
    goToChat();
    setTimeout(() => {
      const inp = document.getElementById("chat-input");
      if (inp) {
        inp.value = prompt;
        inp.dispatchEvent(new Event("input"));
        autoResize(inp);
        inp.focus();
      }
    }, 350);
  }, 600);
}

// ══════════════════════════════════════════════════
//  STREAK VIEW TOGGLE — Lifetime vs Yearly
// ══════════════════════════════════════════════════
function toggleStreakView(view) {
  // Update button states
  const lifetimeBtn = document.getElementById("streak-lifetime-btn");
  const yearlyBtn   = document.getElementById("streak-yearly-btn");
  if (lifetimeBtn && yearlyBtn) {
    if (view === "lifetime") {
      lifetimeBtn.className = "mv-btn mv-btn-primary";
      yearlyBtn.className   = "mv-btn mv-btn-ghost";
    } else {
      lifetimeBtn.className = "mv-btn mv-btn-ghost";
      yearlyBtn.className   = "mv-btn mv-btn-primary";
    }
  }

  const yearSection  = document.querySelector(".year-section:not(.year-locked)");
  const lockedYear   = document.querySelector(".year-locked");
  const chainEl      = document.querySelector(".day-chain");

  if (view === "lifetime") {
    // Lifetime: show all phases as a compact heatmap summary
    if (chainEl) {
      const data = State.roadmapData;
      const phases = data?.phases || [];
      let html = "";
      phases.forEach((ph, pi) => {
        const done = Object.keys(State.checkedMilestones || {})
          .filter(k => k.startsWith(pi + "-") && State.checkedMilestones[k]).length;
        const total = (ph.milestones || []).length || 1;
        const pct = Math.round(done / total * 100);
        const cls = pct >= 100 ? "done" : pct > 0 ? "planned" : pi === 0 ? "future" : "future";
        html += `
          <div class="chain-day ${cls}" style="width:auto;padding:0 .5rem;font-size:.6rem;border-radius:6px;" title="Phase ${pi+1}: ${ph.name} — ${pct}% done">
            P${pi + 1}
          </div>`;
      });
      chainEl.innerHTML = html || '<div style="font-size:.8rem;color:var(--text3);padding:.5rem">No phases found</div>';
    }
    // Show locked years too in a simplified way
    if (lockedYear) lockedYear.style.opacity = "0.5";
    showToast("📊 Lifetime view: showing all roadmap phases", "info");

  } else {
    // Yearly: rebuild the normal monthly calendar
    buildStreaksTab();
    showToast("📅 Yearly drilldown: showing this month", "info");
  }
}
