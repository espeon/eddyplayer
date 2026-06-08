import { createContext, useMemo, useCallback, useState, useEffect, ReactNode } from "react";
import type { Config, PlaybackMode } from "./types";

interface ConfigContextValue {
  config: Config;
  isConfigured: boolean;
  updateConfig: (config: Partial<Config>) => void;
  setMode: (mode: PlaybackMode) => void;
}

const CONFIG_KEY = "eddy-config";

const defaultConfig: Config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || "",
  apiKey: import.meta.env.VITE_API_KEY || "",
  currentMode: "lyrics",
  fullmode: false,
  disappearOnLineEnd: false,
  umiBaseUrl: "https://umi.uwu.wang/lyrics",
};

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(() => {
    if (typeof window === "undefined") return defaultConfig;
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return defaultConfig;
    try {
      return { ...defaultConfig, ...JSON.parse(stored) };
    } catch {
      return defaultConfig;
    }
  });

  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));

    if (!config.apiUrl) {
      setIsConfigured(false);
      return;
    }

    const controller = new AbortController();
    fetch(`${config.apiUrl}/health`, {
      headers: { Authorization: config.apiKey },
      signal: controller.signal,
    })
      .then(() => setIsConfigured(true))
      .catch(() => setIsConfigured(false));

    return () => controller.abort();
  }, [config]);

  const updateConfig = useCallback((updates: Partial<Config>) => {
    setConfig((prev) => {
      const normalized: Partial<Config> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (key === "apiUrl" && typeof value === "string") {
          (normalized as Record<string, unknown>)[key] = value.replace(/\/$/, "");
        } else {
          (normalized as Record<string, unknown>)[key] = value;
        }
      }
      return { ...prev, ...normalized };
    });
  }, []);

  const setMode = useCallback((mode: PlaybackMode) => {
    setConfig((prev) => ({ ...prev, currentMode: mode }));
  }, []);

  const value = useMemo(
    () => ({ config, isConfigured, updateConfig, setMode }),
    [config, isConfigured, updateConfig, setMode],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
