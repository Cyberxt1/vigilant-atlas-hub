import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { getReportsBy } from "@/lib/reports";
import { useMemo } from "react";
import { LogOut, Settings, Shield, MapPin, Phone, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const reports = useMemo(() => (user ? getReportsBy(user.username) : []), [user]);

  const initials = (user?.displayName ?? user?.username ?? "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <button onClick={() => { logout(); navigate({ to: "/" }); }} className="rounded-full border bg-card p-2"><LogOut className="h-4 w-4" /></button>
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-brand p-6 text-white shadow-glow">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold">{user?.displayName ?? user?.username}</p>
            <p className="text-sm text-white/80">@{user?.username}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Reports" value={reports.length} />
          <Stat label="Resolved" value={reports.filter(r => r.status === "resolved").length} />
          <Stat label="Active" value={reports.filter(r => r.status !== "resolved" && r.status !== "dismissed").length} />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <InfoRow icon={Phone} label="Phone" value={user?.phone ?? "Not set"} />
        <InfoRow icon={MapPin} label="Address" value={user?.address ?? "Not set"} />
        <InfoRow icon={Shield} label="Emergency contact" value={user?.emergencyContact ?? "Not set"} />
      </div>

      <button onClick={() => navigate({ to: "/app/settings" })} className="mt-4 flex w-full items-center justify-between rounded-2xl border bg-card p-4 hover:bg-muted">
        <span className="flex items-center gap-3 font-medium"><Settings className="h-4 w-4" /> Settings</span>
        <span className="text-muted-foreground">›</span>
      </button>

      <h2 className="mt-8 font-semibold">Your reports</h2>
      <div className="mt-3 space-y-2">
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports yet. Tap Report to submit one.</p>}
        {reports.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize">{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 py-3 backdrop-blur">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/80">{label}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
