import { useState } from "react";
import { generateExercise, gradeExercise } from "../services/api";

function ExercisePanel() {
  const [algorithm, setAlgorithm] = useState("BFS");
  const [difficulty, setDifficulty] = useState("easy");
  const [topic, setTopic] = useState("graph");
  const [exercise, setExercise] = useState(null);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState("");

  async function onGenerate() {
    try {
      setIsLoading(true);
      setError("");
      setGrading(null);
      setAnswer("");

      const data = await generateExercise({ algorithm, difficulty, topic });
      setExercise(data);
    } catch (genError) {
      setError(genError.message || "Không thể tạo bài tập.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onGrade() {
    if (!exercise?.exercise_id) return;

    try {
      setIsGrading(true);
      setError("");
      const result = await gradeExercise({
        exercise_id: exercise.exercise_id,
        algorithm,
        user_answer: answer,
      });
      setGrading(result);
    } catch (gradeError) {
      setError(gradeError.message || "Không thể chấm điểm.");
    } finally {
      setIsGrading(false);
    }
  }

  return (
    <aside className="glass fade-in rounded-2xl p-3 md:p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="panel-title text-base font-bold text-slate-800">
          Khu vực bài tập (Exercise)
        </h2>
        <span className="text-[11px] font-semibold text-slate-500">
          Sprint 3
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option>BFS</option>
          <option>DFS</option>
          <option>DIJKSTRA</option>
          <option>KRUSKAL</option>
          <option>FLOYD</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="chủ đề"
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
        />
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading}
        className="mt-2 w-full rounded-xl bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Đang tạo bài..." : "Tạo Exercise"}
      </button>

      {exercise ? (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white/85 p-3">
          <div className="text-xs font-semibold text-slate-500">Câu hỏi</div>
          <div className="text-sm text-slate-800">{exercise.question}</div>

          <div className="text-xs font-semibold text-slate-500">Gợi ý</div>
          <ul className="space-y-1 text-xs text-slate-700">
            {(exercise.hints || []).map((item) => (
              <li key={item} className="rounded-lg bg-slate-100 px-2 py-1">
                {item}
              </li>
            ))}
          </ul>

          <details>
            <summary className="cursor-pointer text-xs font-semibold text-slate-600">
              Hiển thị Exercise Graph JSON
            </summary>
            <pre className="mt-2 max-h-44 overflow-auto rounded-lg bg-slate-950 p-2 text-xs text-cyan-200">
              {JSON.stringify(exercise.graph, null, 2)}
            </pre>
          </details>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Nhập đáp án của bạn..."
            className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          <button
            type="button"
            onClick={onGrade}
            disabled={isGrading || !answer.trim()}
            className="w-full rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGrading ? "Đang chấm..." : "Chấm điểm (Grade)"}
          </button>

          {grading ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-900">
              <div>Score: {grading.score}</div>
              <div>Đúng/Sai: {grading.correct ? "Đúng" : "Sai"}</div>
              <div className="mt-1">Nhận xét: {grading.feedback_vi}</div>
              <div className="mt-1">Đáp án mẫu: {grading.expected_answer}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
    </aside>
  );
}

export default ExercisePanel;
