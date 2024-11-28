import { useState, useEffect } from "react";
import { JLF, SyncedLines, SyncedMetadata } from "../types/lyrics";
import { useCache } from "./useCache";

interface LRCLibResponse {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

export interface ParsedLyric {
  time: number;
  text: string;
}

export function lrcToJlf(
  lrcContent: string,
  metadata: SyncedMetadata,
  source = "LRCLib",
): JLF {
  const lines = lrcContent.split("\n");
  const syncedLines: SyncedLines = {
    lines: [],
    linesEnd: 0,
  };

  lines.forEach((line) => {
    const timeMatch = line.match(/\[(\d{2}):(\d{2}\.\d{2})\]/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseFloat(timeMatch[2]);
      const timeInMs = (minutes * 60 + seconds) * 1000;
      const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/, "").trim();

      syncedLines.lines.push({ time: timeInMs, text });
      syncedLines.linesEnd = Math.max(syncedLines.linesEnd, timeInMs);
    }
  });

  return {
    lines: syncedLines,
    source: source,
    metadata: metadata,
  };
}

async function fetchLRCLib(
  artistName: string,
  trackName: string,
  albumName?: string,
  duration?: number,
): Promise<JLF> {
  const params = new URLSearchParams({
    artist_name: artistName,
    track_name: trackName,
    ...(albumName && { album_name: albumName }),
    ...(duration && { duration: duration.toString() }),
  });

  const response = await fetch(`https://lrclib.net/api/get?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch lyrics from LRCLib");
  }

  const data: LRCLibResponse = await response.json();

  if (data.syncedLyrics) {
    return lrcToJlf(data.syncedLyrics, {
      Album: data.albumName,
      Artist: data.artistName,
      Title: data.trackName,
    });
  } else {
    throw new Error("Failed to fetch synced lyrics from LRCLib");
  }
}

async function fetchWithTimeout(url: string, timeout = 1750) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  }
}

// Fetch lyrics from Umi
// https://umi.bna.lut.li/lyrics?track=Favor&artist=Julien%20Baker&album=Little%20Oblivions
async function fetchUMI(
  artistName: string,
  trackName: string,
  albumName?: string,
): Promise<JLF> {
  const params = new URLSearchParams({
    artist: artistName,
    track: trackName,
    ...(albumName && { album: albumName }),
  });

  const response = await fetchWithTimeout(
    // todo: configure umi endpoint!!!
    `https://umi.uwu.wang/lyrics?${params}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lyrics from Umi");
  }

  const data: JLF = await response.json();

  return data;
}

export function useLyrics(
  artistName?: string,
  trackName?: string,
  albumName?: string,
  duration?: number,
) {
  const [lyrics, setLyrics] = useState<JLF | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `lyrics-${artistName}-${trackName}-${albumName ?? ""}`;
  const { getCachedData, setCachedData } = useCache<JLF>(cacheKey);

  useEffect(() => {
    if (!artistName || !trackName) {
      setLyrics(null);
      return;
    }

    const cachedLyrics = getCachedData();
    if (cachedLyrics) {
      setLyrics(cachedLyrics);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch from both sources concurrently
        const [umiResult, lrcLibResult] = await Promise.allSettled([
          fetchUMI(artistName, trackName, albumName),
          fetchLRCLib(artistName, trackName, albumName, duration),
        ]);

        // Process UMI result
        const umiLyrics =
          umiResult.status === "fulfilled" ? umiResult.value : null;

        // Process LRCLib result
        const lrcLibLyrics =
          lrcLibResult.status === "fulfilled" ? lrcLibResult.value : null;

        // Decide which lyrics to use
        if (umiLyrics?.richsync) {
          // If UMI has richsync, use it
          setLyrics(umiLyrics);
          setCachedData(umiLyrics);
        } else if (
          lrcLibLyrics &&
          (lrcLibLyrics as JLF).lines?.lines?.length > 0
        ) {
          // If LRCLib has lyrics, use it
          setLyrics(lrcLibLyrics);
          setCachedData(lrcLibLyrics);
        } else if (umiLyrics) {
          // Fallback to UMI if available
          setLyrics(umiLyrics);
          setCachedData(umiLyrics);
        } else if (lrcLibLyrics) {
          // Last resort: use LRCLib even if empty
          setLyrics(lrcLibLyrics);
          setCachedData(lrcLibLyrics);
        } else {
          // No lyrics found from either source
          throw new Error("No lyrics found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch lyrics");
        setLyrics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [artistName, trackName, albumName, duration]);

  return { lyrics, isLoading, error };
}
