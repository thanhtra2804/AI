const ALGORITHMS = ["BFS", "DFS", "DIJKSTRA", "KRUSKAL", "FLOYD"];

function AlgorithmSelector({ value, onChange, startNode, onStartNodeChange }) {
  return (
    <div className="glass fade-in rounded-2xl px-3 py-3">
      <div className="grid gap-2.5">
        <label className="block text-sm">
          <span className="mb-1 block panel-title text-xs font-bold uppercase tracking-wide text-slate-600">
            Thuật toán (Algorithm)
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {ALGORITHMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block panel-title text-xs font-bold uppercase tracking-wide text-slate-600">
            Điểm bắt đầu (Start Node)
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
            value={startNode}
            onChange={(event) => onStartNodeChange(event.target.value)}
            placeholder="A"
          />
        </label>
      </div>
    </div>
  );
}

export default AlgorithmSelector;
