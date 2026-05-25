import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — Atlas" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = login(username.trim(), password);
      setLoading(false);
      if (!res.ok) { toast.error(res.error ?? "Login failed"); return; }
      toast.success(`Welcome back, ${res.user?.displayName ?? res.user?.username}`);
      if (res.user?.role === "admin") navigate({ to: "/admin" });
      else if (!res.user?.onboarded) navigate({ to: "/onboarding" });
      else navigate({ to: "/app" });
    }, 400);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left visual */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-brand">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-destructive/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 m-auto px-12 text-white">
          <Shield className="h-14 w-14 mb-6" strokeWidth={2.5} />
          <h2 className="text-4xl font-bold leading-tight">Welcome back to Atlas.</h2>
          <p className="mt-3 text-white/85 max-w-sm">Your community is reporting in real time. Let's keep them safe.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Atlas</span>
          </Link>

          <div className="mb-8 animate-slide-up">
            <p className="text-sm font-medium text-primary">Step into Atlas</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Log in to your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <FloatingField label="Username" value={username} onChange={setU} delay="0.1s" />
            <FloatingField label="Password" value={password} onChange={setP} type={showPwd ? "text" : "password"} delay="0.15s"
              suffix={
                <button type="button" onClick={() => setShowPwd(s => !s)} className="text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              } />

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {loading ? "Logging in..." : (<>Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
            </button>

            <div className="rounded-2xl border border-dashed bg-muted/40 p-4 text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <p className="font-semibold text-foreground">Demo accounts</p>
              <p className="mt-1">User: <code className="rounded bg-background px-1.5 py-0.5">user</code> / <code className="rounded bg-background px-1.5 py-0.5">user123</code></p>
              <p>Admin: <code className="rounded bg-background px-1.5 py-0.5">admin</code> / <code className="rounded bg-background px-1.5 py-0.5">admin123</code></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FloatingField({
  label, value, onChange, type = "text", suffix, delay,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; suffix?: React.ReactNode; delay?: string }) {
  return (
    <div className="relative animate-slide-up" style={{ animationDelay: delay }}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder=" "
        className="peer w-full rounded-2xl border bg-card px-4 pt-6 pb-2 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <label className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground/70 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
        {label}
      </label>
      {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}
