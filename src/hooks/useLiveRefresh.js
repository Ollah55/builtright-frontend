import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 4000;

export default function useLiveRefresh(refresh, options = {}) {
  const { enabled = true, intervalMs = DEFAULT_INTERVAL_MS } = options;
  const refreshRef = useRef(refresh);
  const runningRef = useRef(false);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    const runRefresh = async () => {
      if (document.visibilityState !== "visible" || runningRef.current) return;
      runningRef.current = true;
      try {
        await refreshRef.current?.({ silent: true });
      } finally {
        runningRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") runRefresh();
    };

    const intervalId = window.setInterval(runRefresh, intervalMs);
    window.addEventListener("focus", runRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", runRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
