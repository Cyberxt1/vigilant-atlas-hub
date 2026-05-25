import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { addReport, CATEGORIES, type ReportSeverity } from "@/lib/reports";
import { Camera, MapPin, Send, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/report")({
  component: ReportPage,
});

const severities: { value: ReportSeverity; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Medium", color: "bg-warning/20 text-warning" },
  { value: "high", label: "High", color: "bg-destructive/15 text-destructive" },
  { value: "critical", label: "Critical", color: "bg-destructive text-destructive-foreground" },
];

function ReportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<ReportSeverity>("medium");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f); setImage(url);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) return toast.error("Please fill in title, description and location");
    setLoading(true);
    setTimeout(() => {
      addReport({
        title, category, description, location, severity,
        reportedBy: user?.username ?? "anonymous",
        hasImage: !!image,
      });
      setLoading(false);
      toast.success("Report submitted. Stay safe.");
      navigate({ to: "/app" });
    }, 600);
  };

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app" })} className="rounded-full border bg-card p-2"><ChevronLeft className="h-5 w-5" /></button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New report</h1>
          <p className="text-xs text-muted-foreground">All reports are reviewed by trained responders.</p>
        </div>
      </header>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's happening?" className="w-full rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </Field>

        <Field label="Category">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe what you saw — when, who, what stood out." className="w-full resize-none rounded-xl border bg-card px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        </Field>

        <Field label="Location">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address or landmark" className="w-full rounded-xl border bg-card pl-9 pr-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
          </div>
        </Field>

        <Field label="Severity">
          <div className="grid grid-cols-4 gap-2">
            {severities.map((s) => (
              <button key={s.value} type="button" onClick={() => setSeverity(s.value)}
                className={`rounded-xl py-2 text-xs font-semibold transition border ${severity === s.value ? "border-primary ring-2 ring-primary/30" : "border-transparent"} ${s.color}`}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Photo (optional)">
          {image ? (
            <div className="relative rounded-2xl overflow-hidden border">
              <img src={image} alt="evidence" className="h-40 w-full object-cover" />
              <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card py-8 text-muted-foreground hover:bg-muted">
              <Camera className="h-6 w-6" />
              <span className="text-sm">Add a photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
          )}
        </Field>

        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60">
          <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
