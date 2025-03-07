import { useEffect, useRef, useState, memo } from "react";
import { getLyricStatus } from "./lyricStatus";
import { JLF } from "../../types/lyrics";

export const BasicLyrics = memo(function BasicLyrics({
  lyrics,
  currentTime,
  isFullPage,
  isDisappearOnLineEnd,
}: {
  lyrics: JLF | null;
  currentTime: number;
  isFullPage: boolean;
  isDisappearOnLineEnd: boolean;
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
          behavior: hasJustLoaded && currentTime > 3 ? "smooth" : "instant",
          block: "center",
        });
        if (!hasJustLoaded) {
          setHasJustLoaded(true);
        }
      }
    }, 250); // Use timeout instead of interval
    return () => clearTimeout(timer);
    // we want this to *only* activate when the activeLyricRef changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          currentTime > 5 && currentTime < lines.lines[0]?.time
            ? activeLyricRef
            : null
        }
      />
      {lyrics?.lines.lines.map((line, i) => {
        const segStatus = getLyricStatus(
          currentTime,
          line.time,
          lines.lines[i + 1]?.time ?? lines.linesEnd,
          0.5, //1000
        );
        return (
          <div
            key={String(i) + line.text}
            className={`w-full max-w-full transition-transform bg-transparent duration-0 mb-6 md:mb-8 pl-2 text-left origin-left font-semibold text-4xl lg:text-5xl ${
              segStatus.isActive
                ? "scale-100 text-white"
                : segStatus.secondsBeforeActive || !isDisappearOnLineEnd
                  ? "scale-90 text-white/60"
                  : "text-white/0 scale-90"
            } ${isFullPage ? "2xl:text-6xl mb-6 md:mb-8 lg:mb-10 2xl:mb-12" : " mb-6 md:mb-8"} lg:transition-all lg:duration-500 ease-in-out`}
          >
            <div
              ref={
                (segStatus.secondsBeforeActive < 0.5 &&
                  segStatus.secondsBeforeActive > 0) ||
                (segStatus.isActive && segStatus.percentage < 50)
                  ? activeLyricRef
                  : null
              }
              className={`top-48 md:top-32 ${isFullPage && (isDisappearOnLineEnd ? "2xl:top-80" : "2xl:top-56")}  absolute rounded-full bg-blue-500`}
            />
            {line.text || "· · ·"}
          </div>
        );
      })}
    </div>
  );
});
