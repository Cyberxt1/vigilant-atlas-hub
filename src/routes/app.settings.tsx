import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ChevronLeft, Bell, MapPin, Shield, Eye, Moon } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    emergencyContact: user?.emergencyContact ?? "",
  });
  const [toggles, setToggles] = useState({ alerts: true, location: true, anon: false, dark: false });

  const save = () => {
    updateUser(form);
    toast.success("Profile updated");
  };

  return (
    <div className="px-5 pt-6">
      <header className="flex items-center gap-3">
        <button onClick={() => navigate({ to: "/app/profile" })} className="rounded-full border bg-card p-2"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <Input label="Display name" value={form.displayName} onChange={(v) => setForm({ ...form, displayName: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Input label="Emergency contact" value={form.emergencyContact} onChange={(v) => setForm({ ...form, emergencyContact: v })} />
          <button onClick={save} className="w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-glow">Save changes</button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h2>
        <div className="divide-y rounded-2xl border bg-card">
          <Toggle icon={Bell} label="Push alerts" desc="Get notified about nearby incidents" value={toggles.alerts} onChange={(v) => setToggles({ ...toggles, alerts: v })} />
          <Toggle icon={MapPin} label="Share location" desc="Used during emergencies" value={toggles.location} onChange={(v) => setToggles({ ...toggles, location: v })} />
          <Toggle icon={Eye} label="Anonymous reports" desc="Hide your name by default" value={toggles.anon} onChange={(v) => setToggles({ ...toggles, anon: v })} />
          <Toggle icon={Moon} label="Dark theme" desc="Coming soon" value={toggles.dark} onChange={(v) => setToggles({ ...toggles, dark: v })} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Safety</h2>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary"><Shield className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-medium">Verify identity</p>
              <p className="text-xs text-muted-foreground">Verified reports are prioritized by responders.</p>
              <button className="mt-2 rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted">Start verification</button>
            </div>
          </div>
        </div>
      </section>

      <button onClick={() => { logout(); navigate({ to: "/" }); }} className="mt-6 w-full rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10">
        Log out
      </button>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
    </div>
  );
}

function Toggle({ icon: Icon, label, desc, value, onChange }: { icon: any; label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary"><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} className={`h-6 w-11 rounded-full p-0.5 transition ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
