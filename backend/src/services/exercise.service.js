const { query } = require("../db/query");
const { runAlgorithm } = require("./algorithm.service");

function normalizeAlgorithm(name) {
  return String(name || "BFS")
    .trim()
    .toUpperCase();
}

function normalizeDifficulty(difficulty) {
  const value = String(difficulty || "easy")
    .trim()
    .toLowerCase();
  if (["easy", "medium", "hard"].includes(value)) return value;
  return "easy";
}

function buildGraphTemplate(algorithm, difficulty) {
  const size = difficulty === "hard" ? 7 : difficulty === "medium" ? 6 : 5;
  const nodes = Array.from({ length: size }, (_, i) =>
    String.fromCharCode("A".charCodeAt(0) + i),
  );

  if (
    algorithm === "DIJKSTRA" ||
    algorithm === "KRUSKAL" ||
    algorithm === "FLOYD"
  ) {
    return {
      directed: false,
      weighted: true,
      nodes,
      edges: [
        { from: nodes[0], to: nodes[1], weight: 2 },
        { from: nodes[0], to: nodes[2], weight: 5 },
        { from: nodes[1], to: nodes[3], weight: 1 },
        { from: nodes[2], to: nodes[3], weight: 2 },
        { from: nodes[3], to: nodes[4], weight: 3 },
        ...(size > 5
          ? [
              { from: nodes[4], to: nodes[5], weight: 4 },
              { from: nodes[2], to: nodes[5], weight: 6 },
            ]
          : []),
        ...(size > 6
          ? [
              { from: nodes[5], to: nodes[6], weight: 2 },
              { from: nodes[1], to: nodes[6], weight: 7 },
            ]
          : []),
      ],
    };
  }

  return {
    directed: false,
    weighted: false,
    nodes,
    edges: [
      { from: nodes[0], to: nodes[1] },
      { from: nodes[0], to: nodes[2] },
      { from: nodes[1], to: nodes[3] },
      { from: nodes[2], to: nodes[4] },
      ...(size > 5 ? [{ from: nodes[4], to: nodes[5] }] : []),
      ...(size > 6 ? [{ from: nodes[3], to: nodes[6] }] : []),
    ],
  };
}

function stringifyAnswerFromSummary(algorithm, summary) {
  if (algorithm === "BFS" || algorithm === "DFS") {
    return (summary.traversal_order || []).join(" -> ");
  }

  if (algorithm === "DIJKSTRA") {
    return JSON.stringify(summary.distances || {});
  }

  if (algorithm === "KRUSKAL") {
    return `total_weight=${summary.total_weight}`;
  }

  if (algorithm === "FLOYD") {
    return JSON.stringify(summary.distance_matrix || {});
  }

  return JSON.stringify(summary || {});
}

function buildQuestion(algorithm, startNode, difficulty) {
  if (algorithm === "BFS" || algorithm === "DFS") {
    return `Thực hiện ${algorithm} từ node ${startNode} và ghi thứ tự thăm.`;
  }

  if (algorithm === "DIJKSTRA") {
    return `Chạy Dijkstra từ node ${startNode}, trả lời bằng JSON distances.`;
  }

  if (algorithm === "KRUSKAL") {
    return "Tìm cây khung nhỏ nhất bằng Kruskal và cho tổng trọng số.";
  }

  if (algorithm === "FLOYD") {
    return "Áp dụng Floyd-Warshall và trả về ma trận khoảng cách ngắn nhất.";
  }

  return `Giải bài tập ${algorithm} mức độ ${difficulty}.`;
}

function buildHints(algorithm) {
  if (algorithm === "BFS") {
    return ["Sử dụng queue FIFO", "Đánh dấu visited ngay khi enqueue"];
  }
  if (algorithm === "DFS") {
    return ["Sử dụng stack hoặc đệ quy", "Kiểm tra visited trước khi mở rộng"];
  }
  if (algorithm === "DIJKSTRA") {
    return ["Chọn node có distance nhỏ nhất", "Relax từng cạnh kề"];
  }
  if (algorithm === "KRUSKAL") {
    return ["Sắp xếp cạnh tăng dần", "Dùng DSU để tránh chu trình"];
  }
  return ["Cập nhật dist[i][j] qua node trung gian k"];
}

async function generateExercise({ algorithm, difficulty, topic }) {
  const normalizedAlgorithm = normalizeAlgorithm(algorithm);
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const graph = buildGraphTemplate(normalizedAlgorithm, normalizedDifficulty);
  const startNode = graph.nodes[0];

  const result = runAlgorithm({
    algorithm: normalizedAlgorithm,
    graph,
    startNode,
  });

  const answer = stringifyAnswerFromSummary(
    normalizedAlgorithm,
    result.summary,
  );
  const question = buildQuestion(
    normalizedAlgorithm,
    startNode,
    normalizedDifficulty,
  );

  const saved = await query(
    `INSERT INTO exercises(question, graph, answer)
     VALUES ($1, $2::jsonb, $3)
     RETURNING id`,
    [question, JSON.stringify(graph), answer],
  );

  return {
    exercise_id: saved.rows[0].id,
    algorithm: normalizedAlgorithm,
    difficulty: normalizedDifficulty,
    topic: String(topic || "general"),
    graph,
    question,
    answer,
    hints: buildHints(normalizedAlgorithm),
  };
}

function normalizeAnswer(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function similarityScore(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  let matches = 0;
  const minLen = Math.min(a.length, b.length);
  for (let i = 0; i < minLen; i += 1) {
    if (a[i] === b[i]) matches += 1;
  }

  return matches / Math.max(a.length, b.length);
}

async function gradeExercise({
  exercise_id: exerciseId,
  user_answer: userAnswer,
}) {
  const result = await query(
    `SELECT id, question, graph, answer
     FROM exercises
     WHERE id = $1
     LIMIT 1`,
    [exerciseId],
  );

  if (result.rowCount === 0) {
    const error = new Error("exercise_id not found");
    error.statusCode = 404;
    error.code = "EXERCISE_NOT_FOUND";
    throw error;
  }

  const exercise = result.rows[0];
  const expectedNormalized = normalizeAnswer(exercise.answer);
  const userNormalized = normalizeAnswer(userAnswer);

  const ratio = similarityScore(expectedNormalized, userNormalized);
  const score = Math.round(ratio * 100) / 10;
  const correct = ratio >= 0.98;

  const feedbackVi = correct
    ? "Chính xác. Bạn đã trả lời đúng kết quả mong đợi."
    : ratio >= 0.7
      ? "Bạn đã đúng phần lớn kết quả, cần điều chỉnh thêm chi tiết."
      : "Kết quả chưa đúng, hãy xem lại từng bước của thuật toán.";

  return {
    exercise_id: exercise.id,
    score,
    correct,
    feedback_vi: feedbackVi,
    expected_answer: exercise.answer,
  };
}

module.exports = {
  generateExercise,
  gradeExercise,
  normalizeAlgorithm,
  normalizeDifficulty,
  stringifyAnswerFromSummary,
};
