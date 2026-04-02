import { useEffect, useMemo, useState } from "react";

const DEFAULT_SPEED_MS = 900;

export default function useAlgorithmPlayer(steps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(DEFAULT_SPEED_MS);

  const safeSteps = useMemo(() => (Array.isArray(steps) ? steps : []), [steps]);
  const maxIndex = Math.max(safeSteps.length - 1, 0);

  useEffect(() => {
    if (!isPlaying || safeSteps.length === 0) return undefined;
    if (stepIndex >= maxIndex) return undefined;

    const timer = window.setTimeout(() => {
      setStepIndex((prev) => {
        const next = Math.min(prev + 1, maxIndex);
        if (next >= maxIndex) {
          setIsPlaying(false);
        }
        return next;
      });
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, safeSteps.length, maxIndex, speedMs]);

  const controls = {
    stepIndex,
    setStepIndex,
    isPlaying,
    speedMs,
    setSpeedMs,
    play: () => {
      if (safeSteps.length === 0) return;
      if (stepIndex >= maxIndex) {
        setStepIndex(0);
      }
      setIsPlaying(true);
    },
    pause: () => setIsPlaying(false),
    next: () => {
      setIsPlaying(false);
      setStepIndex((prev) => Math.min(prev + 1, maxIndex));
    },
    previous: () => {
      setIsPlaying(false);
      setStepIndex((prev) => Math.max(prev - 1, 0));
    },
    reset: () => {
      setIsPlaying(false);
      setStepIndex(0);
    },
  };

  return controls;
}
