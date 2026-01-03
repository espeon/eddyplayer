import { Suspense } from "react";
import { ConfigProvider } from "./context/ConfigContext";
import { NowPlayingProvider } from "./context/NowPlayingContext";
import { useConfig } from "./hooks/useConfig";
import { useNowPlaying } from "./hooks/useNowPlaying";
import { AlbumCover } from "./components/AlbumCover";
import { TrackInfo } from "./components/TrackInfo";
import { ProgressBar } from "./components/ProgressBar";
import { ConfigMenu } from "./components/ConfigMenu";
import { Lyrics } from "./components/lyrics/Lyrics";
import { LyricsToggle } from "./components/LyricsToggle";
import { FancyBox } from "./components/FancyBox";
import MeshArtBackground from "./components/Background";
import { Loader2 } from "lucide-react";
import { CrossFade } from "react-crossfade-simple";

function ConfigScreen() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-xl rounded-xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Get started with EddyPlayer</h1>
        <p className="text-white/70 mb-8">Please configure your API settings to continue.</p>
        <ConfigMenu
          onSave={updateConfig}
          currentApiUrl={config.apiUrl}
          currentApiKey={config.apiKey}
          currentFullmode={config.fullmode}
          currentDisappearOnLineEnd={config.disappearOnLineEnd}
        />
      </div>
    </div>
  );
}

function LoadingScreen() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="text-white text-xl">Loading...</span>
      </div>
      <ConfigMenu
        onSave={updateConfig}
        currentApiUrl={config.apiUrl}
        currentApiKey={config.apiKey}
        currentFullmode={config.fullmode}
        currentDisappearOnLineEnd={config.disappearOnLineEnd}
      />
    </div>
  );
}

function PlayerContent() {
  const { config, setMode, updateConfig } = useConfig();
  const { nowPlaying, isLoading, error, togglePause } = useNowPlaying();
  const showLyrics = config.currentMode === "lyrics";

  if (isLoading) return <LoadingScreen />;
  if (!nowPlaying || error) return <ConfigScreen />;

  return (
    <>
      <CrossFade timeout={600} contentKey={nowPlaying.albumArt}>
        <div
          className="fixed inset-0 -z-10"
          style={{
            opacity: 0.35,
            transition: "opacity 0.6s ease-in-out",
          }}
        >
          <MeshArtBackground imageUrl={nowPlaying.albumArt} backgroundOpacity={1} />
        </div>
      </CrossFade>

      <div className="min-h-screen flex items-center justify-center transition-all duration-1000 relative">
        <ConfigMenu
          onSave={updateConfig}
          currentApiUrl={config.apiUrl}
          currentApiKey={config.apiKey}
          currentFullmode={config.fullmode}
          currentDisappearOnLineEnd={config.disappearOnLineEnd}
        />

        <LyricsToggle
          showLyrics={showLyrics}
          onToggle={() => setMode(showLyrics ? "main" : "lyrics")}
        />

        <FancyBox showLyrics={showLyrics} isFullPage={!config.fullmode}>
          <div
            className={`flex-col ${
              showLyrics
                ? "lg:border-white/10 lg:pr-6 lg:border-r"
                : "md:flex-row"
            } items-center gap-8 ${config.fullmode ? `col-span-2 grid place-items-center py-16 ${showLyrics && "xl:pr-[3vw] justify-end"}` : "flex md:pr-8"}`}
            style={
              config.fullmode
                ? {
                    maskImage: `linear-gradient(to bottom, transparent 0%, black 15%, black 50%, black 85%, transparent 98%)`,
                    maskComposite: "intersect",
                  }
                : {}
            }
          >
            <div
              className={`flex space-y-4 ${config.fullmode ? "w-full max-w-xs xl:max-w-xs 2xl:max-w-md flex-col" : `${showLyrics ? " flex-col sm:max-w-lg" : "flex-col md:flex-row align-middle sm:max-w-sm lg:space-x-6"} max-w-xs md:max-w-xs`}`}
            >
              <div
                className={
                  showLyrics
                    ? `hidden md:block xl:max-w-sm 2xl:max-w-md`
                    : "max-w-xl"
                }
              >
                <AlbumCover
                  albumArt={nowPlaying.albumArt}
                  albumTitle={nowPlaying.item.album.title}
                  artistArt={nowPlaying.artistArt}
                />
              </div>
              <div
                className={`flex flex-col justify-center z-50
                  ${showLyrics ? "space-y-4" : `${config.fullmode ? "md:max-w-sm xl:max-w-sm 2xl:max-w-md" : "md:max-w-sm"} space-y-6`}`}
              >
                <TrackInfo
                  title={nowPlaying.item.title}
                  artists={nowPlaying.item.artists}
                  albumTitle={nowPlaying.item.album.title}
                />
                <ProgressBar
                  position={nowPlaying.position}
                  duration={nowPlaying.item.duration}
                  paused={nowPlaying.paused}
                  onToggle={togglePause}
                />
              </div>
            </div>
          </div>
          {showLyrics && (
            <div
              className={`flex-1 md:h-auto ml-3 md:min-h-fit -my-8 ${config.fullmode ? "grid place-items-center max-w-max w-full pt-32 pl-[2vw] pr-8 col-span-4 max-h-full" : "-mb-48"}`}
            >
              <Lyrics
                artistName={nowPlaying.item.artists[0]?.name ?? ""}
                trackName={nowPlaying.item.title}
                albumName={nowPlaying.item.album.title}
                duration={nowPlaying.item.duration}
                position={nowPlaying.position}
                paused={nowPlaying.paused}
                isFullPage={config.fullmode}
                isDisappearOnLineEnd={config.disappearOnLineEnd}
              />
            </div>
          )}
        </FancyBox>
      </div>
    </>
  );
}

function AppContent() {
  const { config, isConfigured } = useConfig();

  if (!isConfigured) {
    return <ConfigScreen />;
  }

  return (
    <NowPlayingProvider apiUrl={config.apiUrl} apiKey={config.apiKey}>
      <Suspense fallback={<LoadingScreen />}>
        <PlayerContent />
      </Suspense>
    </NowPlayingProvider>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;
