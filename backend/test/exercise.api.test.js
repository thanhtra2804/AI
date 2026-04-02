const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("POST /api/exercise/generate returns exercise payload", async () => {
  const response = await fetch(`${baseUrl}/api/exercise/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      algorithm: "BFS",
      difficulty: "easy",
      topic: "integration",
    }),
  });

  assert.equal(response.ok, true);
  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(typeof data.data.exercise_id, "string");
  assert.equal(data.data.algorithm, "BFS");
  assert.equal(Array.isArray(data.data.hints), true);
  assert.equal(typeof data.data.question, "string");
});

test("POST /api/exercise/grade grades generated answer", async () => {
  const generateResponse = await fetch(`${baseUrl}/api/exercise/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      algorithm: "DFS",
      difficulty: "easy",
      topic: "integration-grade",
    }),
  });

  const generated = await generateResponse.json();
  assert.equal(generated.success, true);

  const gradeResponse = await fetch(`${baseUrl}/api/exercise/grade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exercise_id: generated.data.exercise_id,
      algorithm: "DFS",
      user_answer: generated.data.answer,
    }),
  });

  assert.equal(gradeResponse.ok, true);
  const graded = await gradeResponse.json();

  assert.equal(graded.success, true);
  assert.equal(graded.data.correct, true);
  assert.equal(graded.data.score, 10);
  assert.equal(typeof graded.data.feedback_vi, "string");
});
