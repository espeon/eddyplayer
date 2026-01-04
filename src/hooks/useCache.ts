export function useCache<T>(key: string, duration = 120_000) {
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
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        const lyricsKeyRegex = /^lyrics-[^-]+-[^-]+-[^-]+$/;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length && keysToRemove.length < 3; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && lyricsKeyRegex.test(storageKey)) {
            keysToRemove.push(storageKey);
          }
        }

        for (const k of keysToRemove) {
          localStorage.removeItem(k);
        }

        try {
          localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
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
