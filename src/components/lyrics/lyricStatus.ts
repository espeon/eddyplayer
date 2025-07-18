const DEFAULT_ANIMATION_OFFSET = 0.1;

interface LyricStatus {
  currentTimePlusOffset: number;
  isActive: boolean;
  percentage: number;
  secondsAfterActive: number;
  secondsBeforeActive: number;
}

export function getLyricStatus(
  outsideCurrentTime: number,
  lyricStart: number,
  lyricEnd: number,
  offset: number = 0,
): LyricStatus {
  if (lyricEnd < lyricStart) {
    console.warn("lyricEnd must be greater than lyricStart");
    lyricEnd = lyricStart
  }
  if (
    isNaN(outsideCurrentTime) ||
    isNaN(lyricStart) ||
    isNaN(lyricEnd) ||
    isNaN(offset)
  ) {
    throw new Error("All parameters must be valid numbers");
  }

  const totalOffset = offset + DEFAULT_ANIMATION_OFFSET;
  const currentTime = outsideCurrentTime + totalOffset;

  const isActive = currentTime > lyricStart && currentTime < lyricEnd;
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
    isActive,
    percentage: Math.round(percentage * 100) / 100,
    secondsAfterActive,
    secondsBeforeActive: Math.max(0, lyricStart - currentTime),
  };
}
