export function useCache<T>(key: string, duration: number = 120000) {
  const getCachedData = (): T | null => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > duration) {
        localStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      localStorage.removeItem(key); // File corrupted like a soggy kroket
      return null;
    }
  };

  const setCachedData = (data: T) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error: any) {
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.warn("🧼 Quota is full — time for tidy time!");

        // Remove the current key first
        localStorage.removeItem(key);

        // Then remove just a *few* lyrics-* keys, not all — we are polite burglars
        const lyricsKeyRegex = /^lyrics-[^-]+-[^-]+-[^-]+$/;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && lyricsKeyRegex.test(storageKey)) {
            keysToRemove.push(storageKey);
            if (keysToRemove.length >= 3) break; // Just a few! Like a friendly Dutch tax
          }
        }

        for (const k of keysToRemove) {
          try {
            localStorage.removeItem(k);
            console.log(`🧽 Removed: ${k}`);
          } catch (removalError) {
            console.warn(`⚠️ Failed to remove ${k}`, removalError);
          }
        }

        // Try one more time, with feeling
        try {
          localStorage.setItem(
            key,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            }),
          );
        } catch (finalError) {
          console.warn("😖 Even after cleanup, still no space... helaas pindakaas.");
        }
      } else {
        throw error; // Not quota-related? We scream internally!
      }
    }
  };

  return { getCachedData, setCachedData };
}
