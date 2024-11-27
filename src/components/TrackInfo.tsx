import React, { useEffect } from "react";
import { ScrollingText } from "./scrollText";

interface TrackInfoProps {
  title: string;
  artists: [
    {
      name: string;
    },
  ];
  albumTitle: string;
}

export function TrackInfo({ title, artists, albumTitle }: TrackInfoProps) {
  useEffect(() => {
    document.title = "Eddy - " + title;
  }, [title]);
  return (
    <div className="md:mb-4 w-screen max-w-xs sm:max-w-lg md:max-w-full">
      <ScrollingText
        text={title}
        className="text-3xl 2xl:text-4xl font-bold w-full max-w-xs sm:max-w-lg md:max-w-sm 2xl:max-w-md"
      />
      <ScrollingText
        text={artists.map((a) => a.name).join(", ")}
        className="text-xl 2xl:text-2xl text-white/80 max-w-xs sm:max-w-lg md:max-w-sm 2xl:max-w-md"
      />
      <ScrollingText
        text={albumTitle}
        className="text-xl 2xl:text-2xl text-white/80 max-w-xs sm:max-w-lg md:max-w-sm 2xl:max-w-md"
      />
    </div>
  );
}
