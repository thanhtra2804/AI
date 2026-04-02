const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeAlgorithm,
  normalizeDifficulty,
  stringifyAnswerFromSummary,
} = require("../src/services/exercise.service");

test("normalizeAlgorithm uppercases and trims", () => {
  assert.equal(normalizeAlgorithm("  bfs  "), "BFS");
  assert.equal(normalizeAlgorithm(), "BFS");
});

test("normalizeDifficulty handles invalid input", () => {
  assert.equal(normalizeDifficulty("hard"), "hard");
  assert.equal(normalizeDifficulty("unknown"), "easy");
});

test("stringifyAnswerFromSummary formats traversal", () => {
  const out = stringifyAnswerFromSummary("BFS", {
    traversal_order: ["A", "B", "C"],
  });
  assert.equal(out, "A -> B -> C");
});

test("stringifyAnswerFromSummary formats dijkstra distances JSON", () => {
  const out = stringifyAnswerFromSummary("DIJKSTRA", {
    distances: { A: 0, B: 2 },
  });
  assert.equal(typeof out, "string");
  assert.equal(out.includes('"A":0') || out.includes('"A": 0'), true);
});
