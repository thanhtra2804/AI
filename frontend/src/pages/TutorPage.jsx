import { useMemo, useState } from "react";
import AlgorithmSelector from "../components/AlgorithmSelector";
import ChatPanel from "../components/ChatPanel";
import ControlPanel from "../components/ControlPanel";
import ExercisePanel from "../components/ExercisePanel";
import GraphRenderer from "../components/GraphRenderer";
import useAlgorithmPlayer from "../hooks/useAlgorithmPlayer";
import { runAlgorithm } from "../services/api";

const DEFAULT_GRAPH = {
  directed: false,
  weighted: true,
  nodes: ["A", "B", "C", "D", "E"],
  edges: [
    { from: "A", to: "B", weight: 2 },
    { from: "A", to: "C", weight: 5 },
    { from: "B", to: "D", weight: 1 },
    { from: "C", to: "D", weight: 2 },
    { from: "D", to: "E", weight: 3 },
  ],
};

function StateCard({ step }) {
  if (!step) {
    return (
      <div className="h-full rounded-xl border border-dashed border-slate-300 bg-white/65 p-3 text-sm text-slate-500">
        Chưa có state. Bấm Chạy để bắt đầu.
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700">
      <div className="mb-2 panel-title text-xs font-bold uppercase tracking-wide text-slate-500">
        Ảnh chụp Step
      </div>
      <div className="grid gap-1">
        <div>Step: {step.step}</div>
        <div>Node hiện tại: {step.current_node || "-"}</div>
        <div>Đã thăm: {JSON.stringify(step.visited || [])}</div>
        <div>Queue: {JSON.stringify(step.queue || [])}</div>
        <div>Stack: {JSON.stringify(step.stack || [])}</div>
        <div>Relaxed Edge: {JSON.stringify(step.relaxed_edge || null)}</div>
      </div>
      {step.distances ? (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-2 text-xs text-emerald-200">
          {JSON.stringify(step.distances, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function TutorPage() {
  const [algorithm, setAlgorithm] = useState("BFS");
  const [startNode, setStartNode] = useState("A");
  const [selectedNode, setSelectedNode] = useState("");
  const [graphText, setGraphText] = useState(
    JSON.stringify(DEFAULT_GRAPH, null, 2),
  );
  const [graph, setGraph] = useState(DEFAULT_GRAPH);
  const [steps, setSteps] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const player = useAlgorithmPlayer(steps);

  const currentStep = useMemo(
    () => steps[player.stepIndex] || null,
    [steps, player.stepIndex],
  );

  const desktopGridClass =
    showLeftPanel && showRightPanel
      ? "lg:grid-cols-[260px,minmax(0,1fr),360px]"
      : showLeftPanel
        ? "lg:grid-cols-[260px,minmax(0,1fr)]"
        : showRightPanel
          ? "lg:grid-cols-[minmax(0,1fr),360px]"
          : "lg:grid-cols-1";

  async function onRun() {
    try {
      setIsLoading(true);
      setError("");

      const parsedGraph = JSON.parse(graphText);
      setGraph(parsedGraph);

      const payload = {
        algorithm,
        graph: parsedGraph,
        startNode: startNode.trim() || undefined,
      };

      const result = await runAlgorithm(payload);
      setSteps(result.steps || []);
      setSummary(result.summary || {});
      player.reset();
    } catch (runError) {
      setError(runError.message || "Không thể chạy thuật toán");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full">
      <header className="border-b border-slate-800 bg-[#0a0f1a] text-slate-100">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 md:px-6">
          <div>
            <h1 className="panel-title text-2xl font-extrabold tracking-tight">
              AI Algorithm Tutor
            </h1>
            <p className="text-xs text-slate-300">
              Không gian học tập theo phong cách Visualgo, tối ưu cho luồng học.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLeftPanel((prev) => !prev)}
              className="rounded-lg border border-slate-600 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-400"
            >
              {showLeftPanel ? "Ẩn bảng trái" : "Hiện bảng trái"}
            </button>
            <button
              type="button"
              onClick={() => setShowRightPanel((prev) => !prev)}
              className="rounded-lg border border-slate-600 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-400"
            >
              {showRightPanel ? "Ẩn bảng phải" : "Hiện bảng phải"}
            </button>
            <div className="rounded-lg border border-teal-700/60 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-100">
              Step {currentStep?.step || 0} / {steps.length}
            </div>
          </div>
        </div>
      </header>

      <section
        className={`mx-auto grid w-full max-w-[1600px] gap-3 p-3 md:p-4 ${desktopGridClass}`}
      >
        {showLeftPanel ? (
          <aside className="glass h-fit rounded-2xl p-3 md:sticky md:top-4">
            <div className="mb-3 border-b border-slate-200 pb-3">
              <div className="panel-title text-xs font-bold uppercase tracking-wide text-slate-500">
                Bảng điều khiển học tập
              </div>
            </div>

            <AlgorithmSelector
              value={algorithm}
              onChange={setAlgorithm}
              startNode={startNode}
              onStartNodeChange={setStartNode}
            />

            <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600">
              <div>Node đã chọn: {selectedNode || "-"}</div>
              <div className="mt-1">
                Node hiện tại: {currentStep?.current_node || "-"}
              </div>
              <div className="mt-1">
                Số node đã thăm: {(currentStep?.visited || []).length}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEditor((prev) => !prev)}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {showEditor ? "Ẩn Graph JSON" : "Hiện Graph JSON"}
            </button>

            {showEditor ? (
              <textarea
                className="mt-2 h-56 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                value={graphText}
                onChange={(event) => setGraphText(event.target.value)}
              />
            ) : null}

            {showSummary ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white/85 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="panel-title text-xs font-bold uppercase tracking-wide text-slate-500">
                    Kết quả JSON
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-400"
                  >
                    Ẩn
                  </button>
                </div>
                <pre className="max-h-48 overflow-auto rounded-lg bg-slate-950 p-2 text-xs text-cyan-200">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
              >
                Hiện Output JSON
              </button>
            )}

            {error ? (
              <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            ) : null}
          </aside>
        ) : null}

        <section className="min-w-0 space-y-3">
          <GraphRenderer
            className="h-[62vh] min-h-[460px]"
            graph={graph}
            step={currentStep}
            onNodeClick={(nodeId) => {
              setSelectedNode(nodeId);
              setStartNode(nodeId);
            }}
          />
        </section>

        {showRightPanel ? (
          <aside className="space-y-3 md:sticky md:top-4 md:h-[calc(100vh-2.5rem)] md:overflow-auto">
            <StateCard step={currentStep} />
            <ChatPanel algorithm={algorithm} currentStep={currentStep} />
            <ExercisePanel />
          </aside>
        ) : null}
      </section>

      <div className="sticky bottom-0 z-30 border-t border-slate-300/70 bg-white/85 px-3 py-2 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1600px]">
          {showControls ? (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowControls(false)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  Ẩn bảng điều khiển
                </button>
              </div>
              <ControlPanel
                canRun={!isLoading}
                isPlaying={player.isPlaying}
                speedMs={player.speedMs}
                onSpeedChange={player.setSpeedMs}
                onRun={onRun}
                onPlay={player.play}
                onPause={player.pause}
                onNext={player.next}
                onPrevious={player.previous}
                onReset={player.reset}
              />
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowControls(true)}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-600"
              >
                Hiện bảng điều khiển
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TutorPage;
