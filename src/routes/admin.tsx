import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { getReports, updateReport, analyzeReport, type Report, type ReportStatus } from "@/lib/reports";
import {
  Shield, LogOut, Search, Filter, TrendingUp, AlertTriangle, CheckCircle2,
  Activity, Brain, Sparkles, MapPin, Clock, X, ChevronRight, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Atlas" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<"overview" | "reports" | "ai">("overview");
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const stored = typeof window !== "undefined" && localStorage.getItem("atlas_user");
      if (!stored) { navigate({ to: "/login" }); return; }
      const u = JSON.parse(stored);
      if (u.role !== "admin") navigate({ to: "/app" });
    }, 50);
  }, [navigate]);

  const refresh = () => setReports(getReports());
  useEffect(refresh, []);

  const filtered = useMemo(() => reports.filter(r =>
    (filter === "all" || r.status === filter) &&
    (query === "" || (r.title + r.description + r.location + r.category).toLowerCase().includes(query.toLowerCase()))
  ), [reports, filter, query]);

  const stats = useMemo(() => ({
    total: reports.length,
    new: reports.filter(r => r.status === "new").length,
    investigating: reports.filter(r => r.status === "investigating").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    critical: reports.filter(r => r.severity === "critical").length,
  }), [reports]);

  if (!user || user.role !== "admin") return null;

  const setStatus = (id: string, status: ReportStatus) => {
    updateReport(id, { status });
    refresh();
    toast.success(`Marked ${status}`);
    setSelected(s => s && s.id === id ? { ...s, status } : s);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow"><Shield className="h-5 w-5 text-white" /></div>
            <div>
              <p className="text-sm font-bold leading-tight">Atlas Command</p>
              <p className="text-xs text-muted-foreground">Logged in as {user.username}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate({ to: "/" }); }} className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-medium hover:bg-muted">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl gap-1 px-4">
          {(["overview", "reports", "ai"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize transition ${tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "ai" ? "AI Analysis" : t}
              {tab === t && <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "overview" && <Overview stats={stats} reports={reports} onOpen={setSelected} />}
        {tab === "reports" && (
          <ReportsTab
            reports={filtered} filter={filter} setFilter={setFilter}
            query={query} setQuery={setQuery} onOpen={setSelected}
          />
        )}
        {tab === "ai" && <AITab reports={reports} onOpen={setSelected} />}
      </main>

      {selected && <ReportDrawer report={selected} onClose={() => setSelected(null)} setStatus={setStatus} />}
    </div>
  );
}

type ReportStats = {
  total: number;
  new: number;
  investigating: number;
  resolved: number;
  critical: number;
};

function Overview({ stats, reports, onOpen }: { stats: ReportStats; reports: Report[]; onOpen: (r: Report) => void }) {
  const recent = reports.slice(0, 6);
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    reports.forEach(r => { m[r.category] = (m[r.category] ?? 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total reports" value={stats.total} icon={Activity} />
        <StatCard label="New" value={stats.new} icon={AlertTriangle} accent />
        <StatCard label="Investigating" value={stats.investigating} icon={Clock} />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} />
        <StatCard label="Critical" value={stats.critical} icon={TrendingUp} danger />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-5">
          <h3 className="font-semibold">Latest reports</h3>
          <div className="mt-4 space-y-2">
            {recent.map(r => (
              <button key={r.id} onClick={() => onOpen(r)} className="flex w-full items-center justify-between rounded-2xl border p-3 text-left hover:bg-muted transition">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.location} · {new Date(r.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge s={r.severity} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-5">
          <h3 className="font-semibold">Top categories</h3>
          <div className="mt-4 space-y-3">
            {byCategory.map(([cat, count]) => {
              const max = byCategory[0][1];
              const pct = (count / max) * 100;
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{cat}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ reports, filter, setFilter, query, setQuery, onOpen }: {
  reports: Report[]; filter: ReportStatus | "all"; setFilter: (value: ReportStatus | "all") => void; query: string; setQuery: (v: string) => void; onOpen: (r: Report) => void;
}) {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports..." className="w-full rounded-2xl border bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "new", "investigating", "resolved", "dismissed"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${filter === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Report</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Location</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => onOpen(r)}>
                <td className="px-4 py-3"><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p></td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{r.category}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{r.location}</td>
                <td className="px-4 py-3"><SeverityBadge s={r.severity} /></td>
                <td className="px-4 py-3"><StatusBadge s={r.status} /></td>
                <td className="px-4 py-3 text-right"><ChevronRight className="inline h-4 w-4 text-muted-foreground" /></td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No reports match your filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AITab({ reports, onOpen }: { reports: Report[]; onOpen: (r: Report) => void }) {
  const analyzed = useMemo(() => reports.map(r => ({ r, a: analyzeReport(r) })).sort((x, y) => y.a.risk - x.a.risk), [reports]);
  const top = analyzed.slice(0, 5);
  const avgRisk = Math.round(analyzed.reduce((s, x) => s + x.a.risk, 0) / Math.max(1, analyzed.length));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-brand p-6 text-white shadow-glow">
        <div className="flex items-center gap-2 text-white/85"><Sparkles className="h-4 w-4" /> <span className="text-xs uppercase tracking-wider">Atlas AI</span></div>
        <h2 className="mt-2 text-2xl font-bold">Live threat synthesis</h2>
        <p className="mt-1 text-white/85 text-sm max-w-xl">Reports are scored on language signals, severity, and historical patterns. Higher scores indicate higher likelihood of escalation.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Pill label="Avg risk" value={`${avgRisk}%`} />
          <Pill label="High-risk" value={analyzed.filter(a => a.a.risk >= 70).length} />
          <Pill label="Patterns" value={analyzed.reduce((s, x) => s + x.a.similarPatterns, 0)} />
        </div>
      </div>

      <div>
        <h3 className="font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Top risk reports</h3>
        <div className="mt-3 space-y-3">
          {top.map(({ r, a }) => (
            <button key={r.id} onClick={() => onOpen(r)} className="block w-full text-left rounded-3xl border bg-card p-5 hover:shadow-glow transition">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge s={r.severity} />
                    <span className="text-xs text-muted-foreground">{r.category}</span>
                  </div>
                  <p className="mt-1 font-semibold">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.escalation}</p>
                  {a.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.flags.slice(0, 5).map(f => <span key={f} className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">#{f}</span>)}
                    </div>
                  )}
                </div>
                <RiskGauge risk={a.risk} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportDrawer({ report, onClose, setStatus }: { report: Report; onClose: () => void; setStatus: (id: string, s: ReportStatus) => void }) {
  const a = analyzeReport(report);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Report detail</h3>
          <button onClick={onClose} className="rounded-full border p-1.5"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <SeverityBadge s={report.severity} />
          <StatusBadge s={report.status} />
          <span className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</span>
        </div>

        <h4 className="mt-3 text-xl font-bold">{report.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{report.category} · Reported by @{report.reportedBy}</p>

        <div className="mt-4 rounded-2xl border bg-card p-4 text-sm">{report.description}</div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{report.location}</div>

        <div className="mt-6 rounded-3xl border bg-gradient-soft p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Analysis</span></div>
            <RiskGauge risk={a.risk} />
          </div>
          <p className="mt-3 text-sm font-medium">{a.priority}</p>
          <p className="mt-1 text-sm text-muted-foreground">{a.escalation}</p>
          {a.flags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {a.flags.map(f => <span key={f} className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">#{f}</span>)}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Similar patterns in last 30 days: <strong className="text-foreground">{a.similarPatterns}</strong></p>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Update status</p>
          <div className="grid grid-cols-2 gap-2">
            {(["new", "investigating", "resolved", "dismissed"] as ReportStatus[]).map(s => (
              <button key={s} onClick={() => setStatus(report.id, s)} className={`rounded-xl border py-2.5 text-sm font-medium capitalize ${report.status === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, danger }: { label: string; value: number; icon: LucideIcon; accent?: boolean; danger?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${danger ? "bg-destructive/5 border-destructive/30" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className={`mt-2 text-3xl font-bold ${danger ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
      <p className="text-[10px] uppercase tracking-wider text-white/80">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function RiskGauge({ risk }: { risk: number }) {
  const color = risk >= 75 ? "text-destructive" : risk >= 50 ? "text-warning" : "text-success";
  const stroke = risk >= 75 ? "stroke-destructive" : risk >= 50 ? "stroke-warning" : "stroke-success";
  const c = 2 * Math.PI * 18;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r="18" className="fill-none stroke-muted" strokeWidth="3" />
        <circle cx="20" cy="20" r="18" className={`fill-none ${stroke}`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(risk / 100) * c} ${c}`} />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>{risk}</div>
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
function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    new: "bg-primary/15 text-primary",
    investigating: "bg-warning/20 text-warning",
    resolved: "bg-success/15 text-success",
    dismissed: "bg-muted text-muted-foreground",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[s]}`}>{s}</span>;
}
