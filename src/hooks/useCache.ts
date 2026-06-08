const LYRICS_KEY_PATTERN = /^lyrics-[^-]+-[^-]+-[^-]+$/;
const DEFAULT_TTL = 120_000;

function getLyricsCacheKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && LYRICS_KEY_PATTERN.test(key)) {
      keys.push(key);
    }
  }
  return keys;
}

function evictOldest(count: number) {
  const keys = getLyricsCacheKeys();
  if (keys.length === 0) return;

  const entries = keys
    .map((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { timestamp } = JSON.parse(raw);
        return { key, timestamp: timestamp ?? 0 };
      } catch {
        return { key, timestamp: 0 };
      }
    })
    .filter((e): e is { key: string; timestamp: number } => e !== null)
    .sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < Math.min(count, entries.length); i++) {
    localStorage.removeItem(entries[i].key);
  }
}

export function clearLyricsCache() {
  for (const key of getLyricsCacheKeys()) {
    localStorage.removeItem(key);
  }
}

export function useCache<T>(key: string, duration = DEFAULT_TTL) {
  const getCachedData = (): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > duration) {
        localStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  };

  const setCachedData = (data: T): void => {
    const payload = JSON.stringify({ data, timestamp: Date.now() });

    try {
      localStorage.setItem(key, payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        evictOldest(5);
        try {
          localStorage.setItem(key, payload);
        } catch {
          console.warn("Cache quota exceeded, unable to store data");
        }
      } else {
        throw error;
      }
    }
  };

  return { getCachedData, setCachedData };
}
