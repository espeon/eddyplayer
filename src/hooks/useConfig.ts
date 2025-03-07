import { useState, useEffect } from "react";

interface Config {
  apiUrl: string;
  apiKey: string;
  currentMode: string;
  fullmode: boolean;
  disappearOnLineEnd: boolean;
}

const CONFIG_KEY = "eddy-now-playing-config";

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          apiUrl: import.meta.env.VITE_API_BASE_URL || " ",
          apiKey: import.meta.env.VITE_API_KEY || "",
          currentMode: "lyrics",
          fullmode: false,
          disappearOnLineEnd: false,
        };
  });

  const [isConfigured, setIsConfigured] = useState(Boolean(config.apiUrl));

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    // check url /health to check validity
    fetch(`${config.apiUrl}/health`, {
      headers: {
        Authorization: config.apiKey,
      },
    })
      // if we get a 200 response, we're good
      .then(() => setIsConfigured(true))
      .catch(() => {
        setIsConfigured(false);
      });
  }, [config]);

  const updateConfig = (
    apiUrl: string,
    apiKey: string,
    fullmode: boolean,
    disappearOnLineEnd: boolean,
  ) => {
    // remove trailing slash from api url
    setConfig((prev) => ({
      ...prev,
      apiUrl: apiUrl.replace(/\/$/, ""),
      apiKey,
      fullmode,
      disappearOnLineEnd,
    }));
  };

  const updateMode = (mode: string) => {
    setConfig((prev) => ({
      ...prev,
      currentMode: mode,
    }));
  };

  return { config, isConfigured, updateConfig, updateMode };
}
