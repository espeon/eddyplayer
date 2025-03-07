import React, { useState } from "react";
import { Settings, X } from "lucide-react";

interface ConfigMenuProps {
  onSave: (
    apiUrl: string,
    apiKey: string,
    fullmode: boolean,
    disappearOnLineEnd: boolean,
  ) => void;
  currentApiUrl: string;
  currentApiKey: string;
  currentFullmode: boolean;
  currentDisappearOnLineEnd: boolean;
}

export function ConfigMenu({
  onSave,
  currentApiUrl,
  currentApiKey,
  currentFullmode,
  currentDisappearOnLineEnd,
}: ConfigMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(currentApiUrl);
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [fullmode, setFullmode] = useState(currentFullmode);
  const [disappearOnLineEnd, setDisappearOnLineEnd] = useState(
    currentDisappearOnLineEnd,
  );

  const handleSave = () => {
    onSave(apiUrl, apiKey, fullmode, disappearOnLineEnd);
    setIsOpen(false);
  };

  const handleClear = () => {
    setApiUrl("");
    setApiKey("");
    onSave("", "", false, false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Settings className="w-5 h-5 text-white/60" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-3">Configuration</h2>

            <div className="mb-1 -mr-2">
              When eddyPlayer is served over HTTPS, connecting to a local
              eddyAPI instance may need a TLS proxy to work.
            </div>

            <div className="mb-3 -mr-2">
              You can use{" "}
              <a className="text-blue-400" href="https://try.cloudflare.com/">
                TryCloudflare
              </a>{" "}
              for this.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  API URL
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-white/10 focus:border-white/30 focus:outline-none"
                  placeholder="Enter API URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  API key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-white/10 focus:border-white/30 focus:outline-none"
                  placeholder="Enter API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Full page mode
                </label>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Full page mode is meant for larger, widescreen screens. It
                  will make the player take up the full height and width of the
                  screen.
                </label>
                <input
                  type="checkbox"
                  checked={fullmode}
                  onChange={(e) => setFullmode(e.target.checked)}
                  className="w-4 h-4 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Disappear on line end
                </label>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  When a line is finished, it will fade out similarly to Apple
                  Music.
                </label>
                <input
                  type="checkbox"
                  checked={disappearOnLineEnd}
                  onChange={(e) => setDisappearOnLineEnd(e.target.checked)}
                  className="w-4 h-4 text-white border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
