"use client"

export default function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="size-full flex flex-col gap-4 items-center justify-center text-white text-2xl md:text-4xl font-semibold bg-black/20 backdrop-blur-md absolute z-50 top-0 left-0 border border-white/10 rounded-lg shadow-2xl shadow-black/50">
      {children}
    </div>
  );
}