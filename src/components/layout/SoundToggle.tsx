"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { backgroundMusic } from "../../lib/backgroundMusic";

interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element;
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissedSnapshot(): boolean {
  try {
    return Boolean(sessionStorage.getItem("malay-audio-overlay-dismissed"));
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export default function SoundToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isPreviouslyDismissed = useSyncExternalStore(
    subscribeStorage,
    getDismissedSnapshot,
    getServerSnapshot,
  );
  const [manuallyDismissed, setManuallyDismissed] = useState(false);
  const overlayActive = !isPreviouslyDismissed && !manuallyDismissed;
  const [overlayRendered, setOverlayRendered] = useState(true);

  useEffect(() => {
    return backgroundMusic.subscribe((playing) => {
      setIsPlaying(playing);
    });
  }, []);

  const handleDismissOverlay = () => {
    setManuallyDismissed(true);
    try {
      sessionStorage.setItem("malay-audio-overlay-dismissed", "true");
    } catch {}
    setTimeout(() => {
      setOverlayRendered(false);
    }, 750);
  };

  useEffect(() => {
    const onDismissEvent = () => {
      handleDismissOverlay();
    };
    window.addEventListener("portfolio:dismiss-audio-overlay", onDismissEvent);
    return () => {
      window.removeEventListener("portfolio:dismiss-audio-overlay", onDismissEvent);
    };
  }, []);

  const handleMusicClick = () => {
    if (overlayActive) {
      handleDismissOverlay();
      if (!isPlaying) {
        void backgroundMusic.play();
      }
    } else {
      void backgroundMusic.toggle();
    }
  };

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

  if (isFullscreen) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes voicenote-wave-1 {
          0%, 100% { transform: scaleY(0.25); }
          20% { transform: scaleY(0.85); }
          45% { transform: scaleY(0.35); }
          70% { transform: scaleY(0.92); }
          85% { transform: scaleY(0.48); }
        }
        @keyframes voicenote-wave-2 {
          0%, 100% { transform: scaleY(0.45); }
          25% { transform: scaleY(1.05); }
          50% { transform: scaleY(0.3); }
          75% { transform: scaleY(1.15); }
          90% { transform: scaleY(0.55); }
        }
        @keyframes voicenote-wave-3 {
          0%, 100% { transform: scaleY(0.65); }
          20% { transform: scaleY(0.32); }
          40% { transform: scaleY(1.3); }
          65% { transform: scaleY(0.48); }
          85% { transform: scaleY(1.22); }
        }
        @keyframes voicenote-wave-4 {
          0%, 100% { transform: scaleY(0.48); }
          30% { transform: scaleY(1.1); }
          55% { transform: scaleY(0.32); }
          80% { transform: scaleY(1.02); }
        }
        @keyframes voicenote-wave-5 {
          0%, 100% { transform: scaleY(0.28); }
          25% { transform: scaleY(0.78); }
          50% { transform: scaleY(0.22); }
          75% { transform: scaleY(0.88); }
        }

        .vn-bar-1 { animation: voicenote-wave-1 1.25s ease-in-out infinite; }
        .vn-bar-2 { animation: voicenote-wave-2 1.05s ease-in-out infinite 0.15s; }
        .vn-bar-3 { animation: voicenote-wave-3 1.35s ease-in-out infinite 0.08s; }
        .vn-bar-4 { animation: voicenote-wave-4 1.12s ease-in-out infinite 0.2s; }
        .vn-bar-5 { animation: voicenote-wave-5 1.28s ease-in-out infinite 0.1s; }

        @media (prefers-reduced-motion: reduce) {
          .vn-bar-1, .vn-bar-2, .vn-bar-3, .vn-bar-4, .vn-bar-5 {
            animation: none !important;
          }
        }
      `}</style>

      {/* Initial Entry Fullscreen Overlay System */}
      {overlayRendered && !isPreviouslyDismissed && (
        <>
          {/* Fullscreen Backdrop covering the entire rendered web page */}
          <div
            className={`fixed inset-0 z-[60] bg-surface/90 backdrop-blur-md transition-opacity duration-700 ${
              overlayActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden="true"
          />

          {/* Small Cross Button beside the center voice note button */}
          <button
            type="button"
            aria-label="Close music prompt without playing"
            onClick={handleDismissOverlay}
            className={`fixed z-[75] w-10 h-10 rounded-full bg-surface-container-high border-2 border-outline-variant hover:border-error text-on-surface-variant hover:text-error hover:scale-105 active:scale-95 shadow-[3px_3px_0px_#080d22] flex items-center justify-center cursor-pointer transition-all duration-300 ${
              overlayActive ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"
            }`}
            style={{
              bottom: "calc(50vh - 1.25rem)",
              left: "calc(50vw + 2.5rem)",
            }}
            title="Close without playing music"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">
              close
            </span>
          </button>

          {/* Light text below: Scroll through page while listening to music */}
          <div
            className={`fixed z-[75] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 w-max max-w-[calc(100vw-1.5rem)] px-2 sm:px-4 text-center ${
              overlayActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              top: "calc(50vh + 3.25rem)",
            }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-surface-container-high/90 border border-surface-variant backdrop-blur-md shadow-[3px_3px_0px_#080d22] whitespace-nowrap">
              <span className="material-symbols-outlined text-xs sm:text-sm text-tertiary shrink-0" aria-hidden="true">
                headphones
              </span>
              <span className="font-label-code-sm text-[11px] sm:text-sm text-on-surface font-semibold tracking-wide">
                Scroll through page while listening to music
              </span>
            </div>
          </div>
        </>
      )}

      {/* Music Voice Note Button - animates smoothly from screen center to bottom-right corner */}
      <div
        data-sound-toggle="true"
        className="fixed z-[70] group"
        style={{
          bottom: overlayActive ? "calc(50vh - 1.75rem)" : "1rem",
          right: overlayActive ? "calc(50vw - 1.75rem)" : "1rem",
          transition:
            "bottom 750ms cubic-bezier(0.16, 1, 0.3, 1), right 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms ease, box-shadow 200ms ease",
        }}
      >
        {!overlayActive && (
          <div className="absolute bottom-full right-0 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest text-on-surface font-label-code-sm text-xs px-2.5 py-1 rounded-md border border-outline shadow-[2px_2px_0px_#080d22] whitespace-nowrap">
            {isPlaying ? "Music: Playing (Click to mute)" : "Music: Off (Click to play)"}
          </div>
        )}

        <button
          aria-label={isPlaying ? "Mute background music" : "Play background music"}
          aria-pressed={isPlaying}
          onClick={handleMusicClick}
          className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-tertiary flex items-center justify-center shadow-[4px_4px_0px_#080d22] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#080d22] transition-all relative overflow-hidden cursor-pointer"
          type="button"
          title={overlayActive ? "Play music and explore" : isPlaying ? "Mute music" : "Play music"}
        >
          <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
            aria-hidden="true"
          >
            {/* Bar 1 */}
            <path
              d="M 4 6 L 4 22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`text-tertiary-fixed-dim ${isPlaying ? "vn-bar-1" : ""}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isPlaying ? undefined : "scaleY(0.28)",
                transition: "transform 0.3s ease",
              }}
            />
            {/* Bar 2 */}
            <path
              d="M 9 4 L 9 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`text-tertiary ${isPlaying ? "vn-bar-2" : ""}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isPlaying ? undefined : "scaleY(0.5)",
              }}
            />
            {/* Bar 3 (Center Wave Peak) */}
            <path
              d="M 14 3 L 14 25"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`text-tertiary-fixed ${isPlaying ? "vn-bar-3" : ""}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isPlaying ? undefined : "scaleY(0.75)",
              }}
            />
            {/* Bar 4 */}
            <path
              d="M 19 4 L 19 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`text-tertiary ${isPlaying ? "vn-bar-4" : ""}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isPlaying ? undefined : "scaleY(0.5)",
              }}
            />
            {/* Bar 5 */}
            <path
              d="M 24 6 L 24 22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`text-tertiary-fixed-dim ${isPlaying ? "vn-bar-5" : ""}`}
              style={{
                transformBox: "fill-box",
                transformOrigin: "50% 50%",
                transform: isPlaying ? undefined : "scaleY(0.28)",
              }}
            />
          </svg>

          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface transition-colors duration-300 ${
              isPlaying ? "bg-tertiary animate-pulse" : "bg-error"
            }`}
          />
        </button>
      </div>
    </>
  );
}
