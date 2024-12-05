"use client";
import { useEffect, useRef, useMemo, useCallback, CSSProperties } from "react";
import { JLF } from "../../types/lyrics";
import { mapRange } from "../../helpers/animath";
import { getLyricStatus } from "./Lyrics";
import { TimerControls } from "../../hooks/useSmoothTimer";

export function RichLyrics({
  lyrics,
  copyright,
  smt,
  isFullPage,
}: {
  lyrics: JLF;
  copyright: string | null;
  smt: TimerControls;
  isFullPage: boolean;
}) {
  const OFFSET = 0;
  const activeLyricRef = useRef<HTMLDivElement>(null);

  const rich = lyrics.richsync;

  const memoizedRichSections = useMemo(() => {
    if (!rich) return [];
    return rich.sections.map((section) => ({
      ...section,
      lyricPos:
        rich.agents.find((a) => a.id === section.lines[0].agent)?.type ===
        "group"
          ? "center"
          : "left",
    }));
  }, [rich]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeLyricRef.current) {
        activeLyricRef.current.scrollIntoView({
          // if we are after the first three seconds and we've just loaded, we want to scroll instantly no matter device size
          //behavior: isMd && (hasJustLoaded && currentTime * 1000 > 3) ? "smooth" : "instant",
          behavior: "smooth",
          block: "center",
        });
      }
    }, 250); // Use timeout instead of interval
    return () => clearTimeout(timer);
  }, [rich, activeLyricRef.current]);

  const getLyricStyles = useCallback(
    (
      segStatus: {
        secondsAfterActive: number;
        secondsBeforeActive: number;
        percentage: number;
      },
      seg: { timeEnd: number; timeStart: number },
      activeColor: string = "rgb(255 255 255)",
    ) => ({
      ["--lyric-seg-percentage"]: `${
        // set post-active range
        mapRange(
          segStatus.secondsAfterActive -
            (seg.timeEnd - seg.timeStart) * segStatus.percentage,
          0.1,
          2.1,
          100,
          0,
        ) *
        // set pre-active range
        mapRange(segStatus.secondsBeforeActive, 0, 0.3, 1, 0)
      }%`,
      color: `color-mix(in sRGB, ${activeColor} var(--lyric-seg-percentage), rgb(220 220 220 / 0.70))`,
      filter: `drop-shadow(0 0px 4px ${activeColor.substring(0, -1)} / calc(var(--lyric-seg-percentage) * 0.35)))`,
    }),
    [], // Include dependencies if needed
  );

  if (!lyrics || (lyrics && !lyrics.richsync)) return null;
  return (
    <div className="flex flex-col flex-1 w-full items-center">
      <div className="flex flex-col flex-1 w-full font-semibold">
        {rich ? (
          <div className="flex flex-col">
            {memoizedRichSections.map((section, i) => (
              <div
                key={i + section.lines[0].text + "section"}
                className={`text-3xl md:text-4xl lg:text-5xl ${isFullPage && "2xl:text-6xl"} text-gray-400`}
              >
                {section.lines.map((line, j) => {
                  const segStatus = getLyricStatus(
                    smt.currentTime,
                    line.timeStart,
                    line.timeEnd,
                    -OFFSET,
                  );

                  let currentLine = line.text;
                  let bgline = line.bgVox?.text;

                  const bgStatus =
                    line.bgVox &&
                    getLyricStatus(
                      smt.currentTime,
                      line.bgVox?.timeStart,
                      line.bgVox?.timeEnd,
                      -OFFSET,
                    );

                  return (
                    <div
                      key={i + j + line.text}
                      style={
                        {
                          ["--lyric-line-dir"]: section.lyricPos,
                          textAlign: section.lyricPos as "center" | "left",
                        } as CSSProperties
                      }
                      className={`transition-all bg-transparent duration-1000 ease-in-out lg:mb-2 2xl:mb-4 py-3 leading-tight origin-[--lyric-line-dir]
                        ${segStatus.isActive ? "text-gray-200/75 scale-100" : "scale-90"}`}
                    >
                      <div
                        ref={
                          (segStatus.secondsBeforeActive < 0.5 + OFFSET &&
                            segStatus.secondsBeforeActive > 0) ||
                          (segStatus.isActive && segStatus.percentage < 50)
                            ? activeLyricRef
                            : null
                        }
                        className={`top-48 md:top-32 ${isFullPage && "2xl:top-56"}  absolute rounded-full bg-blue-500`}
                      />
                      {line.segments.map((seg, k) => {
                        const segStatus = getLyricStatus(
                          smt.currentTime,
                          seg.timeStart,
                          seg.timeEnd,
                          -OFFSET,
                        );

                        // check if there is a space after the text
                        const spaceAfter = currentLine[seg.text.length] === " ";
                        // remove the text
                        currentLine = currentLine.slice(
                          seg.text.length + (spaceAfter ? 1 : 0),
                        );

                        const styles = getLyricStyles(segStatus, seg);

                        return (
                          <span
                            key={i + j + k + seg.text}
                            className={`transition-all bg-transparent duration-100 ease-in mb-2`}
                            style={styles}
                          >
                            {seg.text}
                            {spaceAfter && " "}
                          </span>
                        );
                      })}
                      {line.bgVox && (
                        <div
                          className={`transition-all bg-transparent duration-700 text-2xl md:text-3xl lg:text-4xl ${isFullPage && "xl:text-5xl"} origin-[--lyric-line-dir] ${
                            bgStatus?.isActive
                              ? "text-gray-200/75 scale-100"
                              : "scale-95"
                          }`}
                        >
                          {line.bgVox.segments.map((seg, k) => {
                            const segStatus = getLyricStatus(
                              smt.currentTime,
                              seg.timeStart,
                              seg.timeEnd,
                              -OFFSET,
                            );

                            // check if there is a space after the text
                            const spaceAfter =
                              bgline && bgline[seg.text.length] === " ";
                            // remove the text
                            bgline =
                              bgline &&
                              bgline.slice(
                                seg.text.length + (spaceAfter ? 1 : 0),
                              );

                            const styles = getLyricStyles(
                              segStatus,
                              seg,
                              "oklch(1 0.155 350.94)",
                            );

                            return (
                              <span
                                key={i + j + k + "bgVox-seg" + seg.text}
                                className={`transition-all bg-transparent duration-100 ease-in mb-2`}
                                style={styles}
                              >
                                {seg.text}
                                {spaceAfter && " "}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {section.lines[section.lines.length - 1].timeEnd + 5 <
                  rich.sections[i + 1]?.lines[0]?.timeStart && "· · ·"}
              </div>
            ))}
          </div>
        ) : null}
        {copyright && (
          <div className="text-sm font-mono text-left text-gray-500/50">
            {copyright.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <br />
            Timings may differ among releases, especially with fan-submitted
            lyrics.
          </div>
        )}
      </div>
      <div className="h-[33vh]" />
    </div>
  );
}
