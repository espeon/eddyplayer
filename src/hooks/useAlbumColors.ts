import { useState, useEffect, useRef, useMemo } from "react";
import Vibrant from "node-vibrant";

type RGB = [number, number, number];
type ColorState = {
  current: RGB[];
  target: RGB[];
  transitioning: boolean;
};

function rgbToHex([r, g, b]: RGB): string {
  return (
    "#" +
    [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")
  );
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function interpolateColor(color1: RGB, color2: RGB, progress: number): RGB {
  return [
    color1[0] + (color2[0] - color1[0]) * progress,
    color1[1] + (color2[1] - color1[1]) * progress,
    color1[2] + (color2[2] - color1[2]) * progress,
  ];
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: unknown[]): void {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function useAlbumColors(imageUrl: string, transitionDuration = 1000) {
  const defaultColors: RGB[] = useMemo(
    () => [
      [26, 26, 26], // #1a1a1a
      [0, 0, 0], // #000000
      [51, 51, 51], // #333333
      [26, 26, 26], // #1a1a1a
      [0, 0, 0], // #000000
    ],
    [],
  );

  const [colorState, setColorState] = useState<ColorState>({
    current: defaultColors,
    target: defaultColors,
    transitioning: false,
  });

  const animationFrame = useRef<number>();
  const startTime = useRef<number>();

  useEffect(() => {
    if (!imageUrl) return;

    const getImage = async (): Promise<HTMLImageElement> => {
      // If imageSource is a URL string
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => {
          // try again, with cors this time
          img.crossOrigin = "anonymous";
          img.src = "https://api.cors.lol/?url=" + imageUrl;
          img.onload = () => resolve(img);
          img.onerror = reject;
        };
      });
    };

    const loadColors = async () => {
      try {
        const img = await getImage();
        // Create a new Vibrant instance with quality and samples options
        const v = new Vibrant(img, {
          quality: 1,
          colorCount: 64,
        });

        const palette = await v.getPalette();

        // Convert Vibrant swatches to RGB arrays and ensure we have valid colors
        const newColors: RGB[] = [];

        // Try to get colors in priority order
        const swatchTypes = [
          "Vibrant",
          "Muted",
          "DarkVibrant",
          "DarkMuted",
          "LightVibrant",
        ];

        for (const swatchType of swatchTypes) {
          const swatch = palette[swatchType];
          if (swatch && swatch.getRgb) {
            const rgb = swatch.getRgb();
            newColors.push([
              Math.round(rgb[0]),
              Math.round(rgb[1]),
              Math.round(rgb[2]),
            ]);
          }
        }

        // If we don't have enough colors, pad with random
        while (newColors.length < 5) {
          newColors.push(
            defaultColors[Math.floor(Math.random() * newColors.length)],
          );
        }

        // // Split first color off so we don't shuffle it
        // const [firstColor, ...restColors] = newColors;
        // shuffleArray(restColors);

        // const shuffledColors = [firstColor, ...restColors];

        // Start transition to new colors
        setColorState((prev) => ({
          ...prev,
          target: newColors, //shuffledColors,
          transitioning: true,
        }));
      } catch (error) {
        console.error("Failed to extract colors:", error);
        // On error, ensure we still have valid colors by using defaults
        setColorState((prev) => ({
          ...prev,
          target: defaultColors,
          transitioning: true,
        }));
      }
    };

    loadColors();

    // Cleanup
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [imageUrl]);

  // Handle the animation
  useEffect(() => {
    if (!colorState.transitioning) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const linearProgress = Math.min(
        1,
        (timestamp - startTime.current) / transitionDuration,
      );

      const progress = easeInOut(linearProgress);

      const interpolatedColors = colorState.current.map((currentColor, i) =>
        interpolateColor(currentColor, colorState.target[i], progress),
      );

      setColorState((prev) => ({
        ...prev,
        current: interpolatedColors,
        transitioning: progress < 1,
      }));

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        startTime.current = undefined;
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [colorState.transitioning, transitionDuration]);

  // Convert current colors to hex for consuming components
  const colors = colorState.current.map(rgbToHex);

  return { colors, isTransitioning: colorState.transitioning };
}

// Example usage:
/*
function AlbumArtwork({ imageUrl }) {
  const { colors, isTransitioning } = useAlbumColors(imageUrl, 1000); // 1 second transition

  return (
    <div
      style={{
        background: `linear-gradient(to bottom, ${colors.join(', ')})`,
        transition: isTransitioning ? 'none' : 'background 0.3s ease'
      }}
    >
      <img src={imageUrl} alt="Album artwork" />
    </div>
  );
}
*/
