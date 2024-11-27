import { useEffect, useState } from "react";
import { AlbumCover } from "./components/AlbumCover";
import { TrackInfo } from "./components/TrackInfo";
import { ProgressBar } from "./components/ProgressBar";
import { ConfigMenu } from "./components/ConfigMenu";
import { Lyrics } from "./components/lyrics/Lyrics";
import { useConfig } from "./hooks/useConfig";
import { useAlbumColors } from "./hooks/useAlbumColors";
import MeshBg from "./components/MeshBg";
import { LyricsToggle } from "./components/LyricsToggle";
import { FancyBox } from "./components/FancyBox";

interface NowPlayingResponse {
  item: {
    title: string;
    artists: [
      {
        name: string;
      },
    ];
    album: {
      title: string;
      vibrantColor: string;
    };
    duration: number;
  };
  position: number;
  albumArt: string;
  artistArt: string;
  paused: boolean;
}

function App() {
  const { config, isConfigured, updateConfig, updateMode } = useConfig();
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [showLyrics, setShowLyrics] = useState(config.currentMode === "lyrics");
  const { colors } = useAlbumColors(nowPlaying?.albumArt || "");

  useEffect(() => {
    if (!isConfigured) return;

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/now-playing`, {
          headers: {
            Authorization: config.apiKey,
          },
        });
        const data = await response.json();
        const prevNowPlaying = nowPlaying;
        setNowPlaying(data);

        // HACK:
        // if weve changed tracks and we're playing
        // flick pause on and off to sync lyrics and progress bar
        if (
          prevNowPlaying?.item.title &&
          prevNowPlaying?.item.title !== data.item.title &&
          !data.paused
        ) {
          console.log(
            "Flicking pause",
            prevNowPlaying?.item.title,
            data.item.title,
          );
          setNowPlaying((prev) => prev && { ...prev, paused: true });
          setTimeout(() => {
            setNowPlaying((prev) => prev && { ...prev, paused: false });
          }, 50);
        }
      } catch (error) {
        console.error("Failed to fetch now playing:", error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
    // no need to re-run this effect if now playing changes - we run that in a loop anyways
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-xl rounded-xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6">
            Get started with EddyPlayer
          </h1>
          <p className="text-white/70 mb-8">
            Please configure your API settings to continue.
          </p>
          <ConfigMenu
            onSave={updateConfig}
            currentApiUrl={config.apiUrl}
            currentApiKey={config.apiKey}
            currentFullmode={config.fullmode}
          />
        </div>
      </div>
    );
  }

  if (!nowPlaying) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
        <ConfigMenu
          onSave={updateConfig}
          currentApiUrl={config.apiUrl}
          currentApiKey={config.apiKey}
          currentFullmode={config.fullmode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center transition-all duration-1000 relative">
      <MeshBg colors={colors} />

      <ConfigMenu
        onSave={updateConfig}
        currentApiUrl={config.apiUrl}
        currentApiKey={config.apiKey}
        currentFullmode={config.fullmode}
      />

      <LyricsToggle
        showLyrics={showLyrics}
        onToggle={() => {
          setShowLyrics(!showLyrics);
          updateMode(!showLyrics ? "lyrics" : "main");
        }}
      />

      <FancyBox showLyrics={showLyrics} isFullPage={!config.fullmode}>
        <div
          className={`flex-col ${
            showLyrics
              ? "lg:border-white/10 lg:pr-6 lg:border-r"
              : "md:flex-row"
          } items-center gap-8 ${config.fullmode ? `col-span-2 grid place-items-center py-16 ${showLyrics && "xl:pr-[3vw]  justify-end"}` : "flex md:pr-8"}`}
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
              className={`flex flex-col justify-center
                ${showLyrics ? "space-y-4" : `${config.fullmode ? "md:max-w-sm xl:max-w-sm 2xl:max-w-md" : "md:max-w-sm"} space-y-6`}`}
            >
              <TrackInfo
                title={nowPlaying.item.title}
                artists={nowPlaying.item.artists}
                albumTitle={nowPlaying.item.album.title}
              />
              <ProgressBar
                progress={
                  (nowPlaying.position / nowPlaying.item.duration) * 100
                }
                position={nowPlaying.position}
                duration={nowPlaying.item.duration}
                paused={nowPlaying.paused}
              />
            </div>
          </div>
        </div>
        {showLyrics && (
          <div
            className={`flex-1 md:h-auto ml-3 md:min-h-fit -my-8 ${config.fullmode ? "grid place-items-center max-w-max w-full pt-32 pl-[2vw] pr-8 col-span-4 max-h-full" : "-mb-48"}`}
          >
            <Lyrics
              artistName={nowPlaying.item.artists[0].name}
              trackName={nowPlaying.item.title}
              albumName={nowPlaying.item.album.title}
              duration={nowPlaying.item.duration}
              position={nowPlaying.position}
              paused={nowPlaying.paused}
              isFullPage={config.fullmode}
            />
          </div>
        )}
      </FancyBox>
    </div>
  );
}

export default App;
