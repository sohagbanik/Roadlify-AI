const State = {
  user:                null,
  groqKey:             (typeof GROQ_API_KEY !== "undefined" ? GROQ_API_KEY : ""),
  conversationHistory: [],
  roadmapData:         null,
  weekSchedule:        [],       // full week-by-week plan built from phases
  plannerStartDate:    null,     // date user started the roadmap
  todoItems:           [],
  checkedMilestones:   {},
  streakDays:          new Set(),
  todoFilter:          "all",
  weekOffset:          0,        // 0 = current real week, maps to roadmap week 1
  todayStr:            new Date().toDateString(),
};
