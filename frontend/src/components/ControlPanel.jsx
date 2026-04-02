function ControlPanel({
  canRun,
  isPlaying,
  speedMs,
  onSpeedChange,
  onRun,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
}) {
  return (
    <div className="glass fade-in rounded-2xl px-3 py-2.5 md:px-4 md:py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={!canRun}
          className="rounded-xl bg-teal-700 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Chạy
        </button>
        <button
          type="button"
          onClick={onPrevious}
          className="rounded-xl border border-slate-300 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Lùi
        </button>
        {isPlaying ? (
          <button
            type="button"
            onClick={onPause}
            className="rounded-xl border border-slate-300 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Tạm dừng
          </button>
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="rounded-xl border border-slate-300 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Phát
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl border border-slate-300 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Tiếp
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-slate-300 bg-white/85 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
        >
          Đặt lại
        </button>

        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600">
          Tốc độ
          <input
            type="range"
            min="250"
            max="1800"
            step="50"
            value={speedMs}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
            className="w-32 accent-teal-700"
          />
          <span className="rounded-lg bg-slate-200 px-2 py-1 text-[11px] text-slate-700">
            {speedMs}ms
          </span>
        </label>
      </div>
    </div>
  );
}

export default ControlPanel;
