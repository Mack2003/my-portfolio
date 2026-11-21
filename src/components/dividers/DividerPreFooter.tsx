export default function DividerPreFooter() {
  return (
    <>
    <div className="w-full bg-surface-container-low overflow-hidden leading-none select-none">
      {"\n"}
      <svg className="block w-full h-10 md:h-16 text-surface-container-high" fill="currentColor" preserveAspectRatio="none" viewBox="0 0 1200 120">
        {"\n"}
        <path d="M0,0 C200,80 400,-20 600,50 C800,120 1000,10 1200,60 L1200,120 L0,120 Z"></path>
        {"\n"}
      </svg>
      {"\n"}
    </div>
    </>
  );
}
