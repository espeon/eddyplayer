import { createContext, useMemo, useCallback, useState, useEffect, ReactNode } from "react";
import type { NowPlayingData } from "./types";

interface NowPlayingContextValue {
  nowPlaying: NowPlayingData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  togglePause: () => void;
}

export const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

export function NowPlayingProvider({
  children,
  apiUrl,
  apiKey,
}: {
  children: ReactNode;
  apiUrl: string;
  apiKey: string;
}) {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    if (!apiUrl) return;

    try {
      const response = await fetch(`${apiUrl}/now-playing`, {
        headers: { Authorization: apiKey },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch now playing");
      }

      const data = await response.json();
      setNowPlaying((prev) => {
        const needsPauseFlick =
          prev?.item.title &&
          prev.item.title !== data.item.title &&
          !data.paused;

        if (needsPauseFlick) {
          setTimeout(() => {
            setNowPlaying((p) => p && { ...p, paused: true });
            setTimeout(() => {
              setNowPlaying((p) => p && { ...p, paused: false });
            }, 50);
          }, 0);
        }

        return data;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiKey]);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, [fetchNowPlaying]);

  const togglePause = useCallback(() => {
    setNowPlaying((prev) => prev && { ...prev, paused: !prev.paused });
  }, []);

  const value = useMemo(
    () => ({ nowPlaying, isLoading, error, refresh: fetchNowPlaying, togglePause }),
    [nowPlaying, isLoading, error, fetchNowPlaying, togglePause],
  );

  return (
    <NowPlayingContext.Provider value={value}>{children}</NowPlayingContext.Provider>
  );
}
