import { Shield } from "lucide-react";
import { useEffect, useState } from "react";

export function Splash({ onDone }: { onDone?: () => void }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 1200);
    const t2 = setTimeout(() => onDone?.(), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-brand transition-opacity duration-500"
      style={{ opacity: hide ? 0 : 1, pointerEvents: hide ? "none" : "auto" }}
    >
      <div className="flex flex-col items-center animate-splash-pop">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/30 animate-pulse-ring" />
          <div className="relative w-24 h-24 rounded-3xl bg-white/95 flex items-center justify-center shadow-glow">
            <Shield className="w-12 h-12 text-primary" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">Atlas</h1>
        <p className="mt-1 text-sm text-white/80">Safety, together.</p>
      </div>
    </div>
  );
}
