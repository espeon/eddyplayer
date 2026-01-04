import { useContext } from "react";
import { NowPlayingContext } from "../context/NowPlayingContext";

export function useNowPlaying() {
  const context = useContext(NowPlayingContext);
  if (!context) {
    throw new Error("useNowPlaying must be used within NowPlayingProvider");
  }
  return context;
}
