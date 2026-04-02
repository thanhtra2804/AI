const PRIMARY_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787/api";

const API_BASE_URL_CANDIDATES = [
  PRIMARY_API_BASE_URL,
  "http://localhost:8787/api",
  "http://localhost:8080/api",
  "http://localhost:8081/api",
].filter((url, index, arr) => arr.indexOf(url) === index);

let activeApiBaseUrl = PRIMARY_API_BASE_URL;

async function postJson(baseUrl, path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.success) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.isHttpError = true;
    throw error;
  }

  return data.data;
}

async function requestJson(path, payload, fallbackMessage) {
  const candidates = [
    activeApiBaseUrl,
    ...API_BASE_URL_CANDIDATES.filter((item) => item !== activeApiBaseUrl),
  ];

  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const data = await postJson(baseUrl, path, payload);
      activeApiBaseUrl = baseUrl;
      return data;
    } catch (error) {
      lastError = error;
      if (error?.isHttpError) {
        throw error;
      }
    }
  }

  throw new Error(lastError?.message || fallbackMessage);
}

export async function runAlgorithm(payload) {
  return requestJson("/algorithm/run", payload, "Không thể chạy algorithm");
}

export async function askChat(payload) {
  return requestJson("/chat", payload, "Không thể gửi câu hỏi Chat");
}

export async function generateExercise(payload) {
  return requestJson("/exercise/generate", payload, "Không thể tạo exercise");
}

export async function gradeExercise(payload) {
  return requestJson("/exercise/grade", payload, "Không thể chấm exercise");
}
