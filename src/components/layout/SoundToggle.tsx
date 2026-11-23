"use client";

import { useEffect, useRef, useState } from "react";

interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element;
}

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkFullscreenState = () => {
      const doc = typeof document !== "undefined" ? (document as ExtendedDocument) : null;
      const isDocFs = Boolean(doc?.fullscreenElement || doc?.webkitFullscreenElement);
      const isBodyFs =
        typeof document !== "undefined" &&
        document.body.getAttribute("data-scene-fullscreen") === "true";
      setIsFullscreen(isDocFs || isBodyFs);
    };

    checkFullscreenState();

    const handleCustomFs = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsFullscreen(Boolean(detail?.active));
    };

    window.addEventListener("portfolio:scene-fullscreen", handleCustomFs);
    document.addEventListener("fullscreenchange", checkFullscreenState);
    document.addEventListener("webkitfullscreenchange", checkFullscreenState);

    const observer = new MutationObserver(checkFullscreenState);
    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-scene-fullscreen"],
      });
    }

    return () => {
      window.removeEventListener("portfolio:scene-fullscreen", handleCustomFs);
      document.removeEventListener("fullscreenchange", checkFullscreenState);
      document.removeEventListener("webkitfullscreenchange", checkFullscreenState);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/audio/3D_scene violin_auto_music.mp3");
    audio.loop = true;
    audio.volume = 0.65;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Audio autoplay blocked or user interaction required:", err);
      });
    }
  };

  if (isFullscreen) {
    return null;
  }

  return (
    <div data-sound-toggle="true" className="fixed bottom-4 right-4 z-40 group">
      <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest text-on-surface font-label-code-sm text-xs px-2.5 py-1 rounded-md border border-outline shadow-[2px_2px_0px_#080d22] whitespace-nowrap">
        {isPlaying ? "Music: Playing (Click to mute)" : "Music: Off (Click to play)"}
      </div>
      <button
        aria-label={isPlaying ? "Mute background music" : "Play background music"}
        aria-pressed={isPlaying}
        onClick={toggleSound}
        className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-tertiary flex items-center justify-center shadow-[4px_4px_0px_#080d22] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#080d22] transition-all relative overflow-hidden cursor-pointer"
        type="button"
      >
        <div className="flex items-end justify-center gap-1 h-5 w-6">
          <span
            className={`w-1 bg-tertiary rounded-full transition-all duration-300 ${
              isPlaying ? "h-4 animate-pulse" : "h-2"
            }`}
          />
          <span
            className={`w-1 bg-tertiary-fixed rounded-full transition-all duration-300 ${
              isPlaying ? "h-5 animate-[bounce_1s_infinite_100ms]" : "h-3"
            }`}
          />
          <span
            className={`w-1 bg-tertiary-fixed-dim rounded-full transition-all duration-300 ${
              isPlaying ? "h-3 animate-[pulse_0.8s_infinite_200ms]" : "h-1.5"
            }`}
          />
          <span
            className={`w-1 bg-tertiary rounded-full transition-all duration-300 ${
              isPlaying ? "h-4 animate-[bounce_1.2s_infinite_300ms]" : "h-2.5"
            }`}
          />
        </div>
        <span
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface transition-colors duration-300 ${
            isPlaying ? "bg-tertiary" : "bg-error"
          }`}
        />
      </button>
    </div>
  );
}
