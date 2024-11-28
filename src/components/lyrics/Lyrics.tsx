import { useEffect, useRef } from "react";
import { ParsedLyric, useLyrics } from "../../hooks/useLyrics";
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
}

export function getLyricStatus(
  currentTime: number,
  lyricStart: number,
  lyricEnd: number,
  offset: number = 0,
) {
  // default offset (animations look weird without this)
  offset = offset + 0.1;

  // add the offset to the current time
  currentTime = Number(currentTime.toFixed(3)) + offset;

  // Check if the lyric is active
  const isActive = currentTime > lyricStart && currentTime < lyricEnd;
  // Initialize variables for percentage and elapsed seconds
  let percentage = 0;
  let secondsAfterActive = 0;

  if (isActive) {
    const duration = lyricEnd - lyricStart;
    secondsAfterActive = currentTime - lyricStart;
    percentage = (secondsAfterActive / duration) * 100;
  } else if (currentTime > lyricEnd) {
    secondsAfterActive = currentTime - lyricEnd;
  }

  return {
    currentTimePlusOffset: currentTime,
    isActive: isActive,
    percentage: Number(percentage.toFixed(2)),
    secondsAfterActive: secondsAfterActive,
    secondsBeforeActive: lyricStart - currentTime,
  };
}

export function Lyrics({
  artistName,
  trackName,
  albumName,
  duration,
  position,
  paused,
  isFullPage,
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
          <h2 className="absolute top-8 text-xl font-semibold hidden md:block">
            Lyrics
          </h2>
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
          <h2 className="absolute top-8 text-xl font-semibold hidden md:block">
            Lyrics
          </h2>
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
      <h2 className="z-10 absolute top-8 text-xl font-semibold hidden md:block">
        Lyrics
      </h2>
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
            <RichLyrics lyrics={lyrics as JLF} copyright={""} smt={smt} isFullPage={isFullPage} />
          ) : (
            <BasicLyrics
              lyrics={lyrics as JLF}
              currentTime={smt.currentTime}
              isFullPage={isFullPage}
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
