import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield, ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Atlas" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [confirm, setC] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    setTimeout(() => {
      const res = signup(username.trim(), password);
      setLoading(false);
      if (!res.ok) return toast.error(res.error ?? "Sign up failed");
      toast.success("Account created! Let's finish your profile.");
      navigate({ to: "/onboarding" });
    }, 500);
  };

  const checks = [
    { ok: username.length >= 3, label: "Username 3+ chars" },
    { ok: password.length >= 6, label: "Password 6+ chars" },
    { ok: confirm.length > 0 && confirm === password, label: "Passwords match" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-10 order-2 md:order-1">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Atlas</span>
          </Link>

          <div className="mb-8 animate-slide-up">
            <p className="text-sm font-medium text-primary">Join Atlas</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Already have one?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Log in</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <FloatingField label="Choose a username" value={username} onChange={setU} delay="0.1s" />
            <FloatingField label="Password" value={password} onChange={setP} type="password" delay="0.15s" />
            <FloatingField label="Confirm password" value={confirm} onChange={setC} type="password" delay="0.2s" />

            <ul className="space-y-1.5 animate-slide-up" style={{ animationDelay: "0.22s" }}>
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full transition ${c.ok ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                    <Check className="h-3 w-3" />
                  </span>
                  <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 animate-slide-up"
              style={{ animationDelay: "0.25s" }}
            >
              {loading ? "Creating..." : (<>Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>)}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-brand order-1 md:order-2">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-destructive/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 m-auto px-12 text-white">
          <Shield className="h-14 w-14 mb-6" strokeWidth={2.5} />
          <h2 className="text-4xl font-bold leading-tight">A safer block <br /> starts with you.</h2>
          <p className="mt-3 text-white/85 max-w-sm">Atlas connects neighbors and responders before situations escalate.</p>
        </div>
      </div>
    </div>
  );
}

function FloatingField({
  label, value, onChange, type = "text", delay,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; delay?: string }) {
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
    </div>
  );
}
