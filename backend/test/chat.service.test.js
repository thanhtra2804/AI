const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeHistory,
  buildPrompt,
  buildSuggestedQuestions,
} = require("../src/services/chat.service");

test("normalizeHistory keeps only valid user/assistant entries", () => {
  const history = normalizeHistory([
    { role: "user", message: " Xin chao " },
    { role: "assistant", message: " Hello " },
    { role: "system", message: "ignored role should become user" },
    { role: "assistant", message: "   " },
    null,
  ]);

  assert.equal(history.length, 3);
  assert.equal(history[0].message, "Xin chao");
  assert.equal(history[1].role, "assistant");
  assert.equal(history[2].role, "user");
});

test("buildSuggestedQuestions includes algorithm in first suggestion", () => {
  const suggested = buildSuggestedQuestions({
    algorithm: "BFS",
    state: { current_node: "A" },
  });

  assert.equal(Array.isArray(suggested), true);
  assert.equal(suggested.length, 3);
  assert.equal(suggested[0].includes("BFS"), true);
});

test("buildPrompt includes BFS queue from state", () => {
  const prompt = buildPrompt({
    algorithm: "BFS",
    state: {
      step: 2,
      current_node: "A",
      queue: ["B", "C"],
      visited: ["A"],
    },
    question: "Tai sao queue co B va C?",
    history: [{ role: "user", message: "Giai thich BFS" }],
    references: [],
  });

  assert.equal(prompt.includes('"queue": [\n    "B",\n    "C"\n  ]'), true);
  assert.equal(prompt.includes("Algorithm: BFS"), true);
});

test("buildPrompt includes Dijkstra distances from state", () => {
  const prompt = buildPrompt({
    algorithm: "DIJKSTRA",
    state: {
      step: 3,
      current_node: "B",
      distances: { A: 0, B: 2, C: 5, D: 3 },
      predecessor: { B: "A", D: "B" },
    },
    question: "Vi sao distance den D la 3?",
    history: [],
    references: [],
  });

  assert.equal(prompt.includes('"distances": {'), true);
  assert.equal(prompt.includes('"D": 3'), true);
  assert.equal(prompt.includes("Algorithm: DIJKSTRA"), true);
});
