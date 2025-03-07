import { useRef } from "react";
import { useLyrics } from "../../hooks/useLyrics";
import { useSmoothTimer } from "../../hooks/useSmoothTimer";
import { JLF } from "../../types/lyrics";
import { BasicLyrics } from "./BasicLyrics";
import { RichLyrics } from "./RichLyrics";

interface LyricsProps {
  artistName?: string;
  trackName?: string;
  albumName?: string;
  duration: number;
  position: number;
  paused: boolean;
  isFullPage: boolean;
  isDisappearOnLineEnd: boolean;
}

export function Lyrics({
  artistName,
  trackName,
  albumName,
  duration,
  position,
  paused,
  isFullPage,
  isDisappearOnLineEnd,
}: LyricsProps) {
  const { lyrics, isLoading, error } = useLyrics(
    artistName,
    trackName,
    albumName,
    duration,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const smt = useSmoothTimer({
    duration: duration,
    currentTime: position,
    throttleBy: 150,
    isActivelyPlaying: !paused,
  });

  if (isLoading) {
    return (
      <div className="flex-1 h-full relative text-white -mx-8 px-4 md:px-8 min-h-max">
        <div
          className={`h-screen max-h-[88vh] ${isFullPage ? "md:max-h-[76vh]" : "md:max-h-[calc(33.5rem)] -mb-36"}`}
        >
          <div className="text-white/60 text-6xl pt-16">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full relative text-white -mx-8 px-4 md:px-8 min-h-max">
        <div
          className={`h-screen max-h-[88vh] ${isFullPage ? "md:max-h-[76vh]" : "md:max-h-[calc(33.5rem)] -mb-36"}`}
        >
          <div className="text-white/60 text-6xl pt-16">No lyrics found</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const lessThanMd = window.innerWidth < 1024;

  // get the type of lyrics. is it jlf or parsed lyrics
  return (
    <div className="flex-1 h-full relative overflow-x-hidden text-white -mx-8 px-4 md:px-8 min-h-max">
      <div className="blur-vignette" />
      <div
        ref={scrollContainerRef}
        className={`hide-scrollbar space-y-4 overflow-y-auto ml-4 md:ml-0 max-h-[88vh] ${isFullPage ? "md:max-h-[calc(95vh-9rem)]" : "md:max-h-[calc(33.5rem)] md:mb-0"} pr-4`}
        style={{
          maskImage: `linear-gradient(to bottom, transparent 0rem, black 8rem, black 50%, #000${lessThanMd ? "1" : "5"} 85%, transparent 98%)`,
          maskComposite: "intersect",
        }}
      >
        <div className="h-[12rem]"></div>
        {lyrics && (lyrics as JLF).lines !== undefined ? (
          lyrics && (lyrics as JLF).richsync ? (
            <RichLyrics
              lyrics={lyrics as JLF}
              copyright={""}
              smt={smt}
              isFullPage={isFullPage}
              isDisappearOnLineEnd={isDisappearOnLineEnd}
            />
          ) : (
            <BasicLyrics
              lyrics={lyrics as JLF}
              currentTime={smt.currentTime}
              isFullPage={isFullPage}
              isDisappearOnLineEnd={isDisappearOnLineEnd}
            />
          )
        ) : (
          <div className="text-white/80 text-6xl">Instrumental</div>
        )}
        <div className="h-screen"></div>
      </div>
    </div>
  );
}
