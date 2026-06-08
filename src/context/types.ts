export interface Track {
  title: string;
  artists: Array<{ name: string }>;
  album: {
    title: string;
  };
  duration: number;
}

export interface NowPlayingData {
  item: Track;
  position: number;
  albumArt: string;
  artistArt: string;
  paused: boolean;
}

export type PlaybackMode = "main" | "lyrics";

export interface Config {
  apiUrl: string;
  apiKey: string;
  currentMode: PlaybackMode;
  fullmode: boolean;
  disappearOnLineEnd: boolean;
  umiBaseUrl: string;
}
