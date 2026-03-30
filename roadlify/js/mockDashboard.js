// ============================================================
//  mockDashboard.js — Role-specific Career IQ data
// ============================================================

const ROLE_DASHBOARD_DATA = {

  "full stack": {
    employability: 52, employabilityDelta: "+3.1%", employabilityTrend: "up",
    skillMatch: 44, curriculumLag: "3.8 yrs", selfUpskilling: 71, upskillingDelta: "+9%",
    nextMilestone: "Build & Deploy MERN App",
    skillGaps: [
      { name: "React / Next.js",   college: 20, industry: 88, gap: 68 },
      { name: "Node.js + Express", college: 18, industry: 82, gap: 64 },
      { name: "TypeScript",        college: 10, industry: 79, gap: 69 },
      { name: "Docker / CI-CD",    college:  8, industry: 74, gap: 66 },
      { name: "MongoDB / SQL",     college: 35, industry: 77, gap: 42 },
      { name: "REST API Design",   college: 25, industry: 85, gap: 60 },
      { name: "HTML / CSS",        college: 72, industry: 65, gap: -7  },
    ],
    hotSkills: ["React 19", "Next.js App Router", "TypeScript", "Docker", "tRPC", "Prisma ORM", "Redis"],
    demandSurge: [
      { year: "2021", fullstack: 45, cloud: 38 },
      { year: "2022", fullstack: 62, cloud: 50 },
      { year: "2023", fullstack: 81, cloud: 68 },
      { year: "2024", fullstack: 118, cloud: 92 },
      { year: "2025", fullstack: 157, cloud: 118 },
    ],
    demandLabels: ["Full Stack Dev", "Cloud-native Dev"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+157%", "+118%"],
    upskillPie: [
      { name: "Projects", value: 38, color: "#006479" },
      { name: "Courses",  value: 27, color: "#40cef3" },
      { name: "Bootcamp", value: 16, color: "#006575" },
      { name: "Internship",value:12, color: "#96e6f6" },
      { name: "OSS",      value:  7, color: "#d6dee1" },
    ],
    funnel: [100, 78, 55, 44],
    aiTip: "Focus on <strong>Next.js + Vercel</strong> deployments — it's the #1 gap in Full Stack hiring right now."
  },

  "frontend": {
    employability: 48, employabilityDelta: "+1.8%", employabilityTrend: "up",
    skillMatch: 41, curriculumLag: "3.2 yrs", selfUpskilling: 68, upskillingDelta: "+7%",
    nextMilestone: "Ship a React project to Vercel",
    skillGaps: [
      { name: "React / Hooks",    college: 22, industry: 90, gap: 68 },
      { name: "TypeScript",       college: 12, industry: 85, gap: 73 },
      { name: "CSS-in-JS / Tailwind", college: 18, industry: 80, gap: 62 },
      { name: "Web Performance",  college:  8, industry: 71, gap: 63 },
      { name: "Testing (Cypress)",college:  5, industry: 65, gap: 60 },
      { name: "Accessibility",    college: 15, industry: 70, gap: 55 },
      { name: "HTML/CSS basics",  college: 78, industry: 65, gap: -13 },
    ],
    hotSkills: ["React 19", "TypeScript", "Tailwind CSS", "Framer Motion", "Vitest", "Web Components", "WCAG 2.2"],
    demandSurge: [
      { year: "2021", fullstack: 38, cloud: 28 },
      { year: "2022", fullstack: 55, cloud: 40 },
      { year: "2023", fullstack: 74, cloud: 55 },
      { year: "2024", fullstack: 105, cloud: 78 },
      { year: "2025", fullstack: 138, cloud: 99 },
    ],
    demandLabels: ["Frontend Dev", "UI/UX Eng"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+138%", "+99%"],
    upskillPie: [
      { name: "Projects",  value: 40, color: "#006479" },
      { name: "Courses",   value: 30, color: "#40cef3" },
      { name: "Bootcamp",  value: 14, color: "#006575" },
      { name: "Internship",value: 11, color: "#96e6f6" },
      { name: "OSS",       value:  5, color: "#d6dee1" },
    ],
    funnel: [100, 75, 52, 41],
    aiTip: "Focus on <strong>TypeScript + Accessibility</strong> — companies are actively filtering for both in 2025 FE roles."
  },

  "ai": {
    employability: 41, employabilityDelta: "-2.4%", employabilityTrend: "down",
    skillMatch: 38, curriculumLag: "4.2 yrs", selfUpskilling: 68, upskillingDelta: "+12%",
    nextMilestone: "TensorFlow Developer Certification",
    skillGaps: [
      { name: "LLM / GenAI",      college: 15, industry: 89, gap: 74 },
      { name: "Cloud (AWS/GCP)",  college: 30, industry: 86, gap: 56 },
      { name: "MLOps / DevOps",   college: 25, industry: 78, gap: 53 },
      { name: "PyTorch / TF",     college: 28, industry: 82, gap: 54 },
      { name: "RAG Pipelines",    college:  5, industry: 72, gap: 67 },
      { name: "SQL + Pandas",     college: 45, industry: 80, gap: 35 },
      { name: "OOP / Java",       college: 95, industry: 42, gap: -53 },
    ],
    hotSkills: ["Prompt Engineering", "Vector DBs", "RAG Pipelines", "Kubernetes", "TypeScript", "CI/CD", "LangChain"],
    demandSurge: [
      { year: "2021", fullstack: 58, cloud: 40 },
      { year: "2022", fullstack: 80, cloud: 55 },
      { year: "2023", fullstack: 112, cloud: 75 },
      { year: "2024", fullstack: 165, cloud: 108 },
      { year: "2025", fullstack: 242, cloud: 158 },
    ],
    demandLabels: ["AI/ML Engineering", "Cloud-native Dev"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+184%", "+92%"],
    upskillPie: [
      { name: "Projects",  value: 34, color: "#006479" },
      { name: "Courses",   value: 28, color: "#40cef3" },
      { name: "Bootcamp",  value: 18, color: "#006575" },
      { name: "Internship",value: 13, color: "#96e6f6" },
      { name: "OSS",       value:  7, color: "#d6dee1" },
    ],
    funnel: [100, 74, 51, 41],
    aiTip: "Focus on <strong>RAG Pipelines</strong> to leverage your existing Python knowledge for the highest ROI in the next 6 months."
  },

  "data sci": {
    employability: 46, employabilityDelta: "+1.2%", employabilityTrend: "up",
    skillMatch: 42, curriculumLag: "3.5 yrs", selfUpskilling: 73, upskillingDelta: "+10%",
    nextMilestone: "Complete Kaggle Competition (Top 25%)",
    skillGaps: [
      { name: "ML in Production",  college: 12, industry: 80, gap: 68 },
      { name: "Cloud (BigQuery)",  college: 18, industry: 76, gap: 58 },
      { name: "Spark / Databricks",college:  8, industry: 72, gap: 64 },
      { name: "dbt / Data Eng",    college:  5, industry: 68, gap: 63 },
      { name: "A/B Testing",       college: 20, industry: 74, gap: 54 },
      { name: "SQL Advanced",      college: 40, industry: 85, gap: 45 },
      { name: "Python / Pandas",   college: 60, industry: 88, gap: 28 },
    ],
    hotSkills: ["dbt", "Spark", "BigQuery", "Snowflake", "MLflow", "LLM Fine-tuning", "Causal Inference"],
    demandSurge: [
      { year: "2021", fullstack: 50, cloud: 38 },
      { year: "2022", fullstack: 68, cloud: 52 },
      { year: "2023", fullstack: 92, cloud: 70 },
      { year: "2024", fullstack: 130, cloud: 98 },
      { year: "2025", fullstack: 178, cloud: 130 },
    ],
    demandLabels: ["Data Scientist", "ML Engineer"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+178%", "+130%"],
    upskillPie: [
      { name: "Kaggle",    value: 35, color: "#006479" },
      { name: "Courses",   value: 30, color: "#40cef3" },
      { name: "Research",  value: 18, color: "#006575" },
      { name: "Internship",value: 12, color: "#96e6f6" },
      { name: "OSS",       value:  5, color: "#d6dee1" },
    ],
    funnel: [100, 71, 49, 39],
    aiTip: "Bridge to <strong>ML Engineering</strong> by adding FastAPI model deployment — it's the #1 differentiator vs. pure analysts."
  },

  "devops": {
    employability: 55, employabilityDelta: "+4.2%", employabilityTrend: "up",
    skillMatch: 35, curriculumLag: "5.1 yrs", selfUpskilling: 76, upskillingDelta: "+15%",
    nextMilestone: "AWS Solutions Architect Associate Cert",
    skillGaps: [
      { name: "Kubernetes",        college:  5, industry: 88, gap: 83 },
      { name: "Terraform / IaC",   college:  8, industry: 82, gap: 74 },
      { name: "GitHub Actions CI", college: 12, industry: 84, gap: 72 },
      { name: "Prometheus/Grafana",college:  5, industry: 70, gap: 65 },
      { name: "Docker",            college: 22, industry: 86, gap: 64 },
      { name: "Linux / Bash",      college: 48, industry: 90, gap: 42 },
      { name: "Cloud Platforms",   college: 15, industry: 88, gap: 73 },
    ],
    hotSkills: ["Kubernetes", "Terraform", "ArgoCD", "eBPF", "Platform Engineering", "OpenTelemetry", "Cilium"],
    demandSurge: [
      { year: "2021", fullstack: 42, cloud: 55 },
      { year: "2022", fullstack: 58, cloud: 72 },
      { year: "2023", fullstack: 80, cloud: 98 },
      { year: "2024", fullstack: 115, cloud: 140 },
      { year: "2025", fullstack: 155, cloud: 192 },
    ],
    demandLabels: ["DevOps Engineer", "Cloud / SRE"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+155%", "+192%"],
    upskillPie: [
      { name: "Labs/Projects",value: 42, color: "#006479" },
      { name: "Certs",       value: 28, color: "#40cef3" },
      { name: "Bootcamp",    value: 15, color: "#006575" },
      { name: "Internship",  value: 10, color: "#96e6f6" },
      { name: "OSS Contrib", value:  5, color: "#d6dee1" },
    ],
    funnel: [100, 82, 61, 55],
    aiTip: "<strong>Kubernetes + Terraform</strong> is the power combo — 83% of senior DevOps JDs require both simultaneously."
  },

  "cyber": {
    employability: 58, employabilityDelta: "+5.8%", employabilityTrend: "up",
    skillMatch: 32, curriculumLag: "5.8 yrs", selfUpskilling: 80, upskillingDelta: "+18%",
    nextMilestone: "CompTIA Security+ Certification",
    skillGaps: [
      { name: "Penetration Testing", college:  5, industry: 85, gap: 80 },
      { name: "SIEM / Splunk",       college:  8, industry: 80, gap: 72 },
      { name: "Cloud Security",      college: 10, industry: 82, gap: 72 },
      { name: "Incident Response",   college: 12, industry: 78, gap: 66 },
      { name: "Threat Modelling",    college: 15, industry: 75, gap: 60 },
      { name: "Networking / TCP-IP", college: 50, industry: 90, gap: 40 },
      { name: "Linux Administration",college: 45, industry: 88, gap: 43 },
    ],
    hotSkills: ["OSCP", "Cloud Security", "Threat Hunting", "Zero Trust", "SOAR", "Bug Bounty", "DevSecOps"],
    demandSurge: [
      { year: "2021", fullstack: 55, cloud: 45 },
      { year: "2022", fullstack: 75, cloud: 60 },
      { year: "2023", fullstack: 105, cloud: 85 },
      { year: "2024", fullstack: 150, cloud: 122 },
      { year: "2025", fullstack: 210, cloud: 168 },
    ],
    demandLabels: ["Cybersecurity Eng", "Cloud Security"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+210%", "+168%"],
    upskillPie: [
      { name: "CTF/Labs",  value: 45, color: "#006479" },
      { name: "Certs",     value: 28, color: "#40cef3" },
      { name: "Bootcamp",  value: 14, color: "#006575" },
      { name: "Bug Bounty",value:  8, color: "#96e6f6" },
      { name: "Research",  value:  5, color: "#d6dee1" },
    ],
    funnel: [100, 85, 65, 58],
    aiTip: "Prioritise <strong>TryHackMe + OSCP path</strong> — hands-on lab hours are weighted 3x more than certs in 2025 hiring."
  },

  "default": {
    employability: 43, employabilityDelta: "+1.5%", employabilityTrend: "up",
    skillMatch: 38, curriculumLag: "4.0 yrs", selfUpskilling: 65, upskillingDelta: "+8%",
    nextMilestone: "Complete first portfolio project",
    skillGaps: [
      { name: "Cloud Platforms",  college: 15, industry: 80, gap: 65 },
      { name: "Modern Frameworks",college: 20, industry: 82, gap: 62 },
      { name: "Testing / QA",     college: 12, industry: 70, gap: 58 },
      { name: "CI/CD Pipelines",  college: 10, industry: 75, gap: 65 },
      { name: "System Design",    college: 18, industry: 72, gap: 54 },
      { name: "Core CS",          college: 70, industry: 65, gap: -5  },
    ],
    hotSkills: ["Cloud", "TypeScript", "Docker", "CI/CD", "System Design", "Open Source"],
    demandSurge: [
      { year: "2021", fullstack: 45, cloud: 38 },
      { year: "2022", fullstack: 65, cloud: 52 },
      { year: "2023", fullstack: 90, cloud: 72 },
      { year: "2024", fullstack: 125, cloud: 100 },
      { year: "2025", fullstack: 165, cloud: 130 },
    ],
    demandLabels: ["Your Target Role", "Adjacent Role"],
    demandColors: ["#006479", "#40cef3"],
    demandPct: ["+165%", "+130%"],
    upskillPie: [
      { name: "Projects",  value: 36, color: "#006479" },
      { name: "Courses",   value: 28, color: "#40cef3" },
      { name: "Bootcamp",  value: 17, color: "#006575" },
      { name: "Internship",value: 12, color: "#96e6f6" },
      { name: "OSS",       value:  7, color: "#d6dee1" },
    ],
    funnel: [100, 74, 51, 43],
    aiTip: "Complete one <strong>real project in your target stack</strong> and push it to GitHub — it's the single highest-impact action for new grads."
  }
};

function getMockDashboardData(goal) {
  const g = (goal || "").toLowerCase();
  if (g.includes("full stack") || g.includes("web dev") || g.includes("mern") || g.includes("backend")) return ROLE_DASHBOARD_DATA["full stack"];
  if (g.includes("frontend") || g.includes("front-end") || g.includes("react dev") || g.includes("ui dev")) return ROLE_DASHBOARD_DATA["frontend"];
  if (g.includes("ai") || g.includes("ml") || g.includes("machine learning") || g.includes("deep learning") || g.includes("nlp")) return ROLE_DASHBOARD_DATA["ai"];
  if (g.includes("data sci") || g.includes("data analyst") || g.includes("analyst")) return ROLE_DASHBOARD_DATA["data sci"];
  if (g.includes("devops") || g.includes("cloud") || g.includes("sre") || g.includes("platform")) return ROLE_DASHBOARD_DATA["devops"];
  if (g.includes("cyber") || g.includes("security") || g.includes("pentest") || g.includes("ethical hack")) return ROLE_DASHBOARD_DATA["cyber"];
  return ROLE_DASHBOARD_DATA["default"];
}

// ══════════════════════════════════════════════════
//  DYNAMIC DASHBOARD — generates data from any
//  AI roadmap, works for ALL roles (tech + non-tech)
// ══════════════════════════════════════════════════

function buildDynamicDashboardData(roadmapData) {
  if (!roadmapData) return null;

  const goal     = roadmapData.goal || "Career Goal";
  const phases   = roadmapData.phases || [];
  const duration = roadmapData.totalDuration || "6 months";
  const hpd      = roadmapData.hoursPerDay || 2;

  // ── Derive skill gaps from ALL phase skills ──
  const allSkills = [];
  phases.forEach((ph, pi) => {
    (ph.skills || []).forEach(s => {
      // Earlier phases have higher college coverage (foundational)
      // Later phases have higher industry demand (specialised)
      const collegeBase = Math.max(5, 60 - pi * 18 + Math.random() * 15);
      const industryBase = Math.min(95, 55 + pi * 12 + Math.random() * 20);
      const gap = Math.round(industryBase - collegeBase);
      if (allSkills.length < 8) {
        allSkills.push({
          name: s.length > 28 ? s.substring(0, 26) + "…" : s,
          college: Math.round(collegeBase),
          industry: Math.round(industryBase),
          gap: gap
        });
      }
    });
  });
  // Ensure at least some skills
  if (allSkills.length === 0) {
    allSkills.push(
      { name: "Core Concepts",    college: 55, industry: 80, gap: 25 },
      { name: "Practical Skills", college: 20, industry: 78, gap: 58 },
      { name: "Industry Tools",   college: 10, industry: 75, gap: 65 },
      { name: "Advanced Topics",  college:  8, industry: 70, gap: 62 }
    );
  }

  // ── Derive hot skills from phase 2+ skills (advanced ones) ──
  const hotSkills = [];
  phases.slice(1).forEach(ph => {
    (ph.skills || []).slice(0, 2).forEach(s => {
      if (hotSkills.length < 7 && !hotSkills.includes(s)) hotSkills.push(s);
    });
  });
  if (hotSkills.length < 3) {
    (phases[0]?.skills || []).forEach(s => {
      if (hotSkills.length < 6) hotSkills.push(s);
    });
  }

  // ── Derive next milestone from first incomplete phase ──
  const firstMilestone = phases[0]?.milestones?.[0] || "Complete first milestone";
  const shortMilestone = firstMilestone.length > 50
    ? firstMilestone.substring(0, 48) + "…"
    : firstMilestone;

  // ── Generate demand labels from goal ──
  const goalWords = goal.split(" ").slice(0, 3).join(" ");
  const demandLabels = [goalWords, "Adjacent Role"];

  // ── Demand surge data — scale by hours commitment ──
  const growthRate = Math.min(250, 80 + hpd * 20);
  const demandSurge = [
    { year: "2021", fullstack: Math.round(growthRate * 0.3),  cloud: Math.round(growthRate * 0.22) },
    { year: "2022", fullstack: Math.round(growthRate * 0.45), cloud: Math.round(growthRate * 0.35) },
    { year: "2023", fullstack: Math.round(growthRate * 0.62), cloud: Math.round(growthRate * 0.50) },
    { year: "2024", fullstack: Math.round(growthRate * 0.82), cloud: Math.round(growthRate * 0.67) },
    { year: "2025", fullstack: growthRate,                    cloud: Math.round(growthRate * 0.82) },
  ];

  // ── Employability — more phases + more hours = higher employability ──
  const empBase = Math.min(72, 32 + phases.length * 4 + hpd * 2);
  const skillMatchBase = Math.min(85, 28 + phases.length * 6 + hpd * 3);

  // ── AI tip from roadmap certifications or last phase ──
  const cert = roadmapData.certifications?.[0];
  const lastPhase = phases[phases.length - 1]?.name || "the final phase";
  const aiTip = cert
    ? `Prioritise the <strong>${cert}</strong> certification — it signals industry readiness and opens doors faster than a degree alone.`
    : `Complete the projects in <strong>${lastPhase}</strong> and document them on GitHub — employers care more about what you've built than what you've studied.`;

  return {
    employability: empBase,
    employabilityDelta: `+${(Math.random() * 4 + 0.5).toFixed(1)}%`,
    employabilityTrend: "up",
    skillMatch: skillMatchBase,
    curriculumLag: `${(Math.random() * 2 + 2.5).toFixed(1)} yrs`,
    selfUpskilling: Math.round(60 + hpd * 4),
    upskillingDelta: `+${Math.round(hpd * 3)}%`,
    nextMilestone: shortMilestone,
    skillGaps: allSkills,
    hotSkills: hotSkills.slice(0, 7),
    demandSurge,
    demandLabels,
    demandColors: ["#006479", "#40cef3"],
    demandPct: [`+${growthRate}%`, `+${Math.round(growthRate * 0.82)}%`],
    upskillPie: [
      { name: "Projects",   value: 36, color: "#006479" },
      { name: "Courses",    value: 27, color: "#40cef3" },
      { name: "Bootcamp",   value: 18, color: "#006575" },
      { name: "Internship", value: 12, color: "#96e6f6" },
      { name: "OSS",        value:  7, color: "#d6dee1" },
    ],
    funnel: [100, Math.round(72 + phases.length * 2), Math.round(48 + phases.length * 2), empBase],
    aiTip
  };
}

// ── Updated selector: tries dynamic first, falls back to role-match, then default ──
function getSmartDashboardData(goal, roadmapData) {
  const g = (goal || "").toLowerCase();

  // Known tech roles — use curated data
  const techMatch =
    (g.includes("full stack") || g.includes("web dev") || g.includes("mern") || g.includes("backend"))   ? "full stack"  :
    (g.includes("frontend") || g.includes("front-end") || g.includes("react dev"))                        ? "frontend"    :
    (g.includes("ai") || g.includes("ml") || g.includes("machine learning") || g.includes("deep learning"))? "ai"          :
    (g.includes("data sci") || g.includes("data analyst"))                                                 ? "data sci"    :
    (g.includes("devops") || g.includes("cloud") || g.includes("sre"))                                    ? "devops"      :
    (g.includes("cyber") || g.includes("security") || g.includes("pentest"))                              ? "cyber"       :
    null;

  if (techMatch) return ROLE_DASHBOARD_DATA[techMatch];

  // Non-tech or unknown role — generate from the AI roadmap itself
  if (roadmapData?.phases?.length) {
    return buildDynamicDashboardData(roadmapData);
  }

  return ROLE_DASHBOARD_DATA["default"];
}
