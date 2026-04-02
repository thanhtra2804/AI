function assertGraphPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const { algorithm, graph } = body;
  if (!algorithm || typeof algorithm !== "string") {
    throw new Error("algorithm is required");
  }

  if (!graph || typeof graph !== "object") {
    throw new Error("graph is required");
  }

  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    throw new Error("graph.nodes must be a non-empty array");
  }

  if (!Array.isArray(graph.edges)) {
    throw new Error("graph.edges must be an array");
  }

  for (const edge of graph.edges) {
    if (!edge || typeof edge !== "object") {
      throw new Error("Each edge must be an object");
    }
    if (!edge.from || !edge.to) {
      throw new Error("Each edge requires from and to");
    }
    if (graph.weighted && typeof edge.weight !== "number") {
      throw new Error("Weighted graph edge requires numeric weight");
    }
  }
}

function assertDocumentUploadPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (!body.text || typeof body.text !== "string") {
    throw new Error("text is required");
  }

  if (body.text.trim().length < 10) {
    throw new Error("text is too short");
  }

  if (body.metadata && typeof body.metadata !== "object") {
    throw new Error("metadata must be an object");
  }
}

function assertChatPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (!body.question || typeof body.question !== "string") {
    throw new Error("question is required");
  }

  if (!body.algorithm || typeof body.algorithm !== "string") {
    throw new Error("algorithm is required");
  }

  if (!body.state || typeof body.state !== "object") {
    throw new Error("state is required");
  }

  if (body.chat_history && !Array.isArray(body.chat_history)) {
    throw new Error("chat_history must be an array");
  }
}

function assertExerciseGeneratePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (body.algorithm && typeof body.algorithm !== "string") {
    throw new Error("algorithm must be a string");
  }

  if (body.topic && typeof body.topic !== "string") {
    throw new Error("topic must be a string");
  }

  if (body.difficulty) {
    const value = String(body.difficulty).toLowerCase();
    if (!["easy", "medium", "hard"].includes(value)) {
      throw new Error("difficulty must be one of easy|medium|hard");
    }
  }
}

function assertExerciseGradePayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  if (!body.exercise_id || typeof body.exercise_id !== "string") {
    throw new Error("exercise_id is required");
  }

  if (!body.user_answer || typeof body.user_answer !== "string") {
    throw new Error("user_answer is required");
  }

  if (body.user_answer.trim().length < 1) {
    throw new Error("user_answer is empty");
  }
}

module.exports = {
  assertGraphPayload,
  assertDocumentUploadPayload,
  assertChatPayload,
  assertExerciseGeneratePayload,
  assertExerciseGradePayload,
};
