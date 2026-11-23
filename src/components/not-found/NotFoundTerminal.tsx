"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundTerminal() {
  const router = useRouter();
  const [isDiagnosticFixed, setIsDiagnosticFixed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [output, setOutput] = useState<{ text: string; colorClass: string } | null>(null);

  const handleCommand = () => {
    const cmd = inputValue.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === "home" || cmd === "desk") {
      setOutput({
        text: ">> Routing to /#desk-stage in 1s...",
        colorClass: "text-xs text-tertiary font-label-code-sm block",
      });
      setTimeout(() => {
        router.push("/#desk-stage");
      }, 800);
    } else if (cmd === "game") {
      setOutput({
        text: ">> Teleporting to /#game arena...",
        colorClass: "text-xs text-tertiary-fixed font-label-code-sm block",
      });
      setTimeout(() => {
        router.push("/#game");
      }, 800);
    } else if (cmd === "skills") {
      setOutput({
        text: ">> Calibrating skills matrix...",
        colorClass: "text-xs text-primary font-label-code-sm block",
      });
      setTimeout(() => {
        router.push("/#skills");
      }, 800);
    } else if (cmd === "projects") {
      setOutput({
        text: ">> Opening project catalog...",
        colorClass: "text-xs text-secondary-fixed font-label-code-sm block",
      });
      setTimeout(() => {
        router.push("/#projects");
      }, 800);
    } else if (cmd === "about") {
      setOutput({
        text: ">> Navigating to operator profile...",
        colorClass: "text-xs text-primary-fixed font-label-code-sm block",
      });
      setTimeout(() => {
        router.push("/#about");
      }, 800);
    } else if (cmd === "help") {
      setOutput({
        text: ">> Available commands: home, desk, game, skills, projects, about, reload, clear",
        colorClass: "text-xs text-secondary font-label-code-sm block",
      });
    } else if (cmd === "clear") {
      setOutput(null);
    } else if (cmd === "reload") {
      setOutput({
        text: ">> Refreshing viewport cache...",
        colorClass: "text-xs text-tertiary font-label-code-sm block",
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setOutput({
        text: `>> Unknown command: "${cmd}". Type "help" for options.`,
        colorClass: "text-xs text-error font-label-code-sm block",
      });
    }

    setInputValue("");
  };

  return (
    <div className="w-full bg-surface-container-low rounded-xl shadow-[8px_8px_0px_#080d22] overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-error rounded-full"></span>
          <span className="w-3 h-3 bg-secondary rounded-full"></span>
          <span className="w-3 h-3 bg-tertiary rounded-full"></span>
          <span className="ml-2 font-label-code-sm text-label-code-sm text-on-surface-variant font-bold">
            malay-shell // error-trace.log
          </span>
        </div>
        <span className="material-symbols-outlined text-outline text-sm">terminal</span>
      </div>

      {/* Terminal Content Body */}
      <div className="p-space-md font-label-code-sm text-label-code-sm text-on-surface flex flex-col gap-3">
        <div className="flex items-center justify-between bg-surface-container px-3 py-1.5 rounded">
          <span className="text-error font-bold">STATUS: 404_ROUTE_NOT_FOUND</span>
          <span className="text-outline text-xs">PID: 9021</span>
        </div>

        <div className="space-y-1 text-on-surface-variant font-medium">
          <p>
            <span className="text-tertiary">CURRENT_COORDS:</span> X: -999.00 | Y: 0.00 | Z: ???
          </p>
          <p>
            <span className="text-primary">LAST_KNOWN_STOP:</span> 1. overview (desk_stage)
          </p>
          <p>
            <span className="text-secondary">SCENE_RENDERER:</span> WebGL2 / High-Z Clipping
          </p>
          <p>
            <span className="text-outline">FRAME_TIME:</span> 16.6ms [STALLED]
          </p>
        </div>

        {/* Mini Debug Checklist */}
        <div className="bg-surface-container-highest p-3 rounded-lg flex flex-col gap-2 mt-1">
          <div className="text-xs uppercase tracking-wider font-bold text-on-surface">
            Auto-Diagnostic Routine
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
            <input
              checked
              readOnly
              className="w-4 h-4 rounded bg-surface-container text-tertiary accent-tertiary focus:ring-0 cursor-pointer"
              type="checkbox"
            />
            <span className="text-on-surface font-semibold">[✓] Check camera position matrix</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
            <input
              checked
              readOnly
              className="w-4 h-4 rounded bg-surface-container text-tertiary accent-tertiary focus:ring-0 cursor-pointer"
              type="checkbox"
            />
            <span className="text-on-surface font-semibold">[✓] Verify registered glTF desk assets</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
            <input
              checked={isDiagnosticFixed}
              onChange={(e) => setIsDiagnosticFixed(e.target.checked)}
              className="w-4 h-4 rounded bg-surface-container text-error accent-error focus:ring-0 cursor-pointer"
              id="diagnostic-fix"
              type="checkbox"
            />
            <span
              className={
                isDiagnosticFixed
                  ? "text-tertiary font-bold"
                  : "text-error font-bold"
              }
              id="diagnostic-text"
            >
              {isDiagnosticFixed
                ? "[✓] Scene outliner synced & recovered!"
                : "[!] Object & route in scene outliner"}
            </span>
          </label>
        </div>

        {/* Interactive Mini CLI Input */}
        <div className="flex items-center gap-2 mt-2 bg-surface px-3 py-2 rounded">
          <span className="text-tertiary font-bold">&gt;</span>
          <input
            className="bg-transparent border-none outline-none text-on-surface font-label-code-sm text-label-code-sm w-full placeholder:text-outline-variant"
            id="terminal-input"
            placeholder="type 'help', 'home', or 'clear'..."
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCommand();
            }}
          />
          <button
            className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded text-xs font-bold uppercase hover:bg-tertiary hover:text-on-tertiary transition-colors cursor-pointer"
            id="terminal-exec-btn"
            type="button"
            onClick={handleCommand}
          >
            Run
          </button>
        </div>

        {output && (
          <div className={`px-1 ${output.colorClass}`} id="terminal-output">
            {output.text}
          </div>
        )}
      </div>

      {/* Terminal Window Footer Status Bar */}
      <div className="bg-surface-container px-4 py-2 flex items-center justify-between text-xs font-label-code-sm text-outline">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span> READY_FOR_DISPATCH
        </span>
        <span>MEM: 64.2 MB // OK</span>
      </div>
    </div>
  );
}
