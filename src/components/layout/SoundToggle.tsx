export default function SoundToggle() {
  return (
    <>
    <div className="fixed bottom-space-md right-space-md z-40 group">
      <div className="absolute bottom-full right-0 mb-space-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest text-on-surface font-label-code-sm text-label-code-sm px-space-sm py-space-xs rounded border border-outline shadow-[2px_2px_0px_#080d22] whitespace-nowrap">
        {"Sound: Off"}
      </div>
      <button aria-label="Toggle Audio Wave" className="w-14 h-14 rounded-full bg-surface-container-high border-2 border-tertiary flex items-center justify-center shadow-[4px_4px_0px_#080d22] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#080d22] transition-all relative overflow-hidden" type="button">
        <div className="flex items-end justify-center gap-1 h-5 w-6">
          <span className="w-1 h-3 bg-tertiary rounded-full animate-pulse"></span>
          <span className="w-1 h-5 bg-tertiary-fixed rounded-full"></span>
          <span className="w-1 h-2 bg-tertiary-fixed-dim rounded-full animate-bounce"></span>
          <span className="w-1 h-4 bg-tertiary rounded-full"></span>
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border-2 border-surface"></span>
      </button>
    </div>
    </>
  );
}
