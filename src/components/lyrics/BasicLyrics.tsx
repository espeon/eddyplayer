import { useEffect, useRef, useState, memo } from "react";
import { getLyricStatus } from "./Lyrics";
import { JLF } from "../../types/lyrics";

export const BasicLyrics = memo(function BasicLyrics({
  lyrics,
  currentTime,
  isFullPage,
}: {
  lyrics: JLF | null;
  currentTime: number;
  isFullPage: boolean;
}) {
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  // for instant scroll on first load
  const [hasJustLoaded, setHasJustLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeLyricRef.current) {
        activeLyricRef.current.scrollIntoView({
          // if we are after the first three seconds and we've just loaded, we want to scroll instantly no matter device size
          //behavior: isMd && (hasJustLoaded && currentTime * 1000 > 3) ? "smooth" : "instant",
          behavior:
            hasJustLoaded && currentTime * 1000 > 3 ? "smooth" : "instant",
          block: "center",
        });
        if (!hasJustLoaded) {
          setHasJustLoaded(true);
        }
      }
    }, 250); // Use timeout instead of interval
    return () => clearTimeout(timer);
  }, [activeLyricRef.current]);

  if (lyrics == null) {
    return null;
  }

  const lines = lyrics.lines;

  return (
    <div className="flex flex-col hide-scrollbar w-full">
      {/* if we are in the first like three seconds and no line is active, we set ref to this to scroll up */}
      <div
        ref={
          currentTime * 1000 > 5 && currentTime < lines.lines[0]?.time
            ? activeLyricRef
            : null
        }
      />
      {lyrics?.lines.lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime * 1000,
          line.time,
          lines.lines[i + 1]?.time ?? lines.linesEnd,
          500, //1000
        );
        return (
          <div
            key={String(i) + line.text}
            className={`w-full max-w-full transition-transform bg-transparent duration-0 mb-6 md:mb-8 pl-2 text-left origin-left font-semibold text-4xl lg:text-5xl ${
              segStatus.isActive
                ? "scale-100 text-white"
                : "scale-90 text-white/60"
            } ${isFullPage ? "xl:text-6xl mb-6 md:mb-8 lg:mb-10 xl:mb-12" : " mb-6 md:mb-8"} lg:transition-all lg:duration-500 ease-in-out`}
          >
            <div
              ref={
                (segStatus.secondsBeforeActive < 500 &&
                  segStatus.secondsBeforeActive > 0) ||
                (segStatus.isActive && segStatus.percentage < 50)
                  ? activeLyricRef
                  : null
              }
              className={`top-32 absolute rounded-full bg-blue-500`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
});
