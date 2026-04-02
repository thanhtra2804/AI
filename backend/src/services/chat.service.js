const { randomUUID } = require("crypto");
const OpenAI = require("openai");
const { query } = require("../db/query");
const { retrieveRelevantDocs } = require("./rag.service");
const {
  aiProvider,
  aiTimeoutMs,
  aiMaxRetries,
  aiRetryDelayMs,
  openAiApiKey,
  openAiModel,
  geminiApiKey,
  geminiModel,
  groqApiKey,
  groqModel,
} = require("../config");

const openAiClient = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout(taskFactory, timeoutMs, label) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([taskFactory(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withRetry(taskFactory, label) {
  let lastError;

  for (let attempt = 0; attempt <= aiMaxRetries; attempt += 1) {
    try {
      return await withTimeout(taskFactory, aiTimeoutMs, label);
    } catch (error) {
      lastError = error;
      if (attempt >= aiMaxRetries) break;
      await sleep(aiRetryDelayMs * (attempt + 1));
    }
  }

  throw lastError;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );
}

function normalizeHistory(chatHistory) {
  if (!Array.isArray(chatHistory)) return [];

  return chatHistory
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      message: String(item.message || "").trim(),
    }))
    .filter((item) => item.message.length > 0)
    .slice(-8);
}

function buildPrompt({ algorithm, state, question, history, references }) {
  const contextText = references
    .map(
      (doc, idx) =>
        `[#${idx + 1}] score=${doc.score.toFixed(4)} id=${doc.document_id}\n${doc.content}`,
    )
    .join("\n\n");

  const historyText = history
    .map(
      (item) =>
        `${item.role === "assistant" ? "Tutor" : "Student"}: ${item.message}`,
    )
    .join("\n");

  return [
    "You are a data structures and algorithms tutor.",
    "Explain in Vietnamese, concise and clear.",
    "Ground the answer using provided context and current algorithm state.",
    "If context is weak, say uncertainty and still provide practical guidance.",
    "",
    `Algorithm: ${algorithm}`,
    `State JSON: ${JSON.stringify(state || {}, null, 2)}`,
    "",
    "Conversation history:",
    historyText || "(empty)",
    "",
    "Retrieved context:",
    contextText || "(no reference documents found)",
    "",
    "Student question:",
    question,
    "",
    "Return only Vietnamese answer text.",
  ].join("\n");
}

function fallbackAnswer({ question, algorithm, state, references }) {
  const currentNode = state?.current_node || "-";
  const topRef = references[0];
  const hint = topRef
    ? `Tài liệu tham khảo gần nhất có độ tương đồng ${topRef.score.toFixed(3)}.`
    : "Chưa có tài liệu tham khảo phù hợp trong bộ nhớ RAG.";

  return [
    `Câu hỏi của bạn: \"${question}\"`,
    `Mình đang giải thích theo thuật toán ${algorithm} ở node hiện tại ${currentNode}.`,
    hint,
    "Hãy đối chiếu với nguyên tắc của thuật toán và state hiện tại để kiểm tra bước tiếp theo.",
  ].join(" ");
}

function buildSuggestedQuestions({ algorithm, state }) {
  const node = state?.current_node || "node hiện tại";
  return [
    `Tại sao ${node} được xử lý trước ở ${algorithm}?`,
    "Nếu thay đổi trọng số cạnh thì đường đi ngắn nhất đổi thế nào?",
    "Bước tiếp theo nên kiểm tra điều kiện gì để tránh sai sót?",
  ];
}

async function callOpenAi(prompt) {
  if (!openAiClient) throw new Error("OPENAI_API_KEY is missing");

  const response = await withRetry(
    () =>
      openAiClient.chat.completions.create({
        model: openAiModel,
        temperature: 0.3,
        messages: [
          { role: "system", content: "You are a Vietnamese algorithm tutor." },
          { role: "user", content: prompt },
        ],
      }),
    "openai-chat",
  );

  return response.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(prompt) {
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY is missing");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent` +
    `?key=${geminiApiKey}`;

  const response = await withRetry(
    () =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      }),
    "gemini-chat",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini chat failed: ${errorText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function callGroq(prompt) {
  if (!groqApiKey) throw new Error("GROQ_API_KEY is missing");

  const response = await withRetry(
    () =>
      fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: groqModel,
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: "You are a Vietnamese algorithm tutor.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }),
    "groq-chat",
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq chat failed: ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callLlm(prompt) {
  if (aiProvider === "openai") return callOpenAi(prompt);
  if (aiProvider === "gemini") return callGemini(prompt);
  if (aiProvider === "groq") return callGroq(prompt);
  throw new Error(`Unsupported AI_PROVIDER: ${aiProvider}`);
}

async function saveChatMessage({ userId, role, message }) {
  const safeUserId = isUuid(userId) ? userId : null;
  await query(
    `INSERT INTO chat_history(user_id, message, role)
     VALUES ($1, $2, $3)`,
    [safeUserId, message, role],
  );
}

async function askContextAwareQuestion({
  question,
  algorithm,
  state,
  chat_history: chatHistory,
  user_id: userId,
}) {
  const traceId = randomUUID();
  const history = normalizeHistory(chatHistory);
  const references = await retrieveRelevantDocs(question, 5);
  const prompt = buildPrompt({
    algorithm,
    state,
    question,
    history,
    references,
  });

  let answerVi = "";
  try {
    answerVi = await callLlm(prompt);
  } catch (error) {
    process.stderr.write(
      `[chat:${traceId}] provider fallback due to error: ${error.message}\n`,
    );
  }

  if (!answerVi) {
    answerVi = fallbackAnswer({ question, algorithm, state, references });
  }

  await saveChatMessage({ userId, role: "user", message: question });
  await saveChatMessage({ userId, role: "assistant", message: answerVi });

  return {
    answer_vi: answerVi,
    references,
    suggested_questions: buildSuggestedQuestions({ algorithm, state }),
    trace_id: traceId,
  };
}

module.exports = {
  askContextAwareQuestion,
  buildPrompt,
  normalizeHistory,
  buildSuggestedQuestions,
};
