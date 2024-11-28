export function useCache<T>(key: string, duration: number = 120000) {
  const getCachedData = () => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > duration) {
      localStorage.removeItem(key);
      return null;
    }

    return data as T;
  };

  const setCachedData = (data: T) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  };

  return { getCachedData, setCachedData };
}
