import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { AlertTriangle, Bell, MapPin, ShieldAlert, ArrowRight, Activity } from "lucide-react";
import { getReports } from "@/lib/reports";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [recent, setRecent] = useState(getReports().slice(0, 3));

  useEffect(() => { setRecent(getReports().slice(0, 3)); }, []);

  useEffect(() => {
    if (!holding) { setProgress(0); return; }
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 1500) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setHolding(false);
        setTriggered(true);
        toast.success("Help is on the way. Your location and contacts were alerted.");
        setTimeout(() => setTriggered(false), 4000);
      }
    }, 30);
    return () => clearInterval(id);
  }, [holding]);

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hi, {user?.displayName ?? user?.username}</p>
          <h1 className="text-2xl font-bold tracking-tight">Stay alert, stay safe</h1>
        </div>
        <button className="rounded-full border bg-card p-2.5 hover:bg-muted">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      {/* Panic button */}
      <div className="mt-10 flex flex-col items-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Hold to call for help</p>
        <button
          onMouseDown={() => setHolding(true)}
          onMouseUp={() => setHolding(false)}
          onMouseLeave={() => setHolding(false)}
          onTouchStart={() => setHolding(true)}
          onTouchEnd={() => setHolding(false)}
          className="relative mt-4 h-48 w-48 select-none rounded-full bg-gradient-danger text-white shadow-danger transition active:scale-95"
        >
          {(holding || triggered) && <span className="absolute inset-0 rounded-full bg-destructive/40 animate-pulse-ring" />}
          {(holding || triggered) && <span className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" style={{ animationDelay: "0.4s" }} />}
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-2">
            <ShieldAlert className="h-12 w-12" strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-wide">{triggered ? "ALERTED" : "SOS"}</span>
            <span className="text-xs text-white/85">{triggered ? "Help on the way" : "Hold 1.5s"}</span>
          </div>
          {/* progress ring */}
          {holding && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="2" strokeDasharray={`${(progress / 100) * 301} 301`} className="opacity-90" />
            </svg>
          )}
        </button>
        <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
          Hold the button to alert your emergency contact and share your live location.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid grid-cols-2 gap-3">
        <Link to="/app/report" className="group rounded-3xl border bg-card p-4 hover:shadow-glow transition">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="mt-3 font-semibold">Report</p>
          <p className="text-xs text-muted-foreground">Crime or suspicion</p>
          <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
        <div className="rounded-3xl bg-gradient-soft p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <p className="mt-3 font-semibold">Safe Zone</p>
          <p className="text-xs text-muted-foreground">Your area is calm</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Nearby activity</h2>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Live</span>
        </div>
        <div className="mt-3 space-y-2">
          {recent.map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </div>
                <SeverityBadge s={r.severity} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SeverityBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning/20 text-warning",
    high: "bg-destructive/15 text-destructive",
    critical: "bg-destructive text-destructive-foreground",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[s]}`}>{s}</span>;
}
