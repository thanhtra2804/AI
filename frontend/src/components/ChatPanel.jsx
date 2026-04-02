import { useMemo, useState } from "react";
import { askChat } from "../services/api";

function ChatPanel({ algorithm, currentStep }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Tại sao bước này chọn node này trước?",
    "Nếu đổi trọng số cạnh thì kết quả thay đổi thế nào?",
    "Có cách tối ưu bộ nhớ cho thuật toán này không?",
  ]);

  const chatHistory = useMemo(
    () =>
      messages.map((item) => ({
        role: item.role,
        message: item.content,
      })),
    [messages],
  );

  async function sendMessage(rawQuestion) {
    const normalized = String(rawQuestion || "").trim();
    if (!normalized || isLoading) return;

    setError("");
    setIsLoading(true);
    setQuestion("");

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content: normalized },
    ]);

    try {
      const response = await askChat({
        question: normalized,
        algorithm,
        state: currentStep || { step: 0, algorithm },
        chat_history: chatHistory,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.answer_vi || "Không nhận được câu trả lời.",
          references: response.references || [],
          traceId: response.trace_id || "",
        },
      ]);

      if (Array.isArray(response.suggested_questions)) {
        setSuggestedQuestions(response.suggested_questions.slice(0, 3));
      }
    } catch (chatError) {
      setError(chatError.message || "Không thể gửi Chat.");
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    sendMessage(question);
  }

  return (
    <aside className="glass fade-in flex h-full min-h-0 flex-col rounded-2xl p-3 md:p-4">
      <h2 className="panel-title text-base font-bold text-slate-800">
        AI Chat
      </h2>
      <p className="mt-1 text-xs text-slate-600">
        Trợ giảng AI theo state hiện tại.
      </p>

      <div className="mt-2 rounded-xl border border-slate-200 bg-white/80 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Context
        </div>
        <div className="mt-1 text-sm text-slate-700">
          <div>Algorithm: {algorithm}</div>
          <div>Step: {currentStep?.step ?? 0}</div>
          <div>Node hiện tại: {currentStep?.current_node || "-"}</div>
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-white/70 p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-500">
            Đặt câu hỏi về bước hiện tại để nhận giải thích từ AI tutor.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-2.5 py-2 text-sm ${
                  item.role === "user"
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.role === "user" ? "Bạn" : "Tutor"}
                </div>
                <div className="mt-1 whitespace-pre-wrap text-xs leading-relaxed">
                  {item.content}
                </div>

                {item.role === "assistant" && item.references?.length ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Tài liệu tham khảo
                    </div>
                    <ul className="mt-1 space-y-1">
                      {item.references.slice(0, 3).map((ref) => (
                        <li
                          key={ref.document_id}
                          className="text-[11px] text-slate-700"
                        >
                          #{ref.document_id?.slice(0, 8)} | score{" "}
                          {Number(ref.score).toFixed(3)}
                        </li>
                      ))}
                    </ul>
                    {item.traceId ? (
                      <div className="mt-1 text-[10px] text-slate-400">
                        trace: {item.traceId}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-2 space-y-2">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Hỏi AI về step hiện tại..."
          className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Đang gửi..." : "Gửi"}
        </button>
      </form>

      {error ? (
        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-2 min-h-0 overflow-auto">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Câu hỏi gợi ý
        </div>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {suggestedQuestions.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => sendMessage(item)}
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-left text-xs transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default ChatPanel;
