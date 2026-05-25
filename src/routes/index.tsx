import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Zap, Brain, Users, ArrowRight, Phone, FileWarning, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — Report. Prevent. Protect." },
      { name: "description", content: "Atlas empowers communities to report suspicious activity before it escalates, with AI-assisted analysis for responders." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">Atlas</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Log in</Link>
            <Link to="/signup" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-destructive/20 blur-3xl animate-float-slow" style={{ animationDelay: "1.5s" }} />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur animate-slide-up">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live in your community
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Spot it. Report it. <br />
            <span className="text-gradient-brand">Prevent it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Atlas turns everyday awareness into community safety. Quick reports,
            AI-assisted analysis, and a panic button when seconds matter.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:scale-105">
              Get Atlas free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl border bg-card px-6 py-3 text-base font-semibold hover:bg-muted">
              I have an account
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Demo: <code className="rounded bg-muted px-1.5 py-0.5">user / user123</code> · admin: <code className="rounded bg-muted px-1.5 py-0.5">admin / admin123</code></p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Phone, title: "Panic Button", desc: "One tap alerts your circle and local responders with location." },
            { icon: FileWarning, title: "Report Anything", desc: "Suspicious people, vandalism, threats. With photos, optional." },
            { icon: Brain, title: "AI Triage", desc: "Reports are analyzed for risk patterns before reaching responders." },
            { icon: Zap, title: "Built for Speed", desc: "Designed for the 30 seconds you actually have." },
            { icon: Users, title: "Community First", desc: "Anonymous when you need it. Verified when it counts." },
            { icon: BarChart3, title: "Insights", desc: "Admins see escalation patterns, hotspots, and trends." },
          ].map((f, i) => (
            <div key={f.title} className="group rounded-3xl border bg-card p-6 transition hover:shadow-glow animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-8 md:p-12 text-center shadow-glow">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Your neighborhood, watching out for itself.</h2>
          <p className="mt-3 text-white/85">Join Atlas and turn awareness into action.</p>
          <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-primary hover:scale-105 transition">
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Atlas. Built for safer communities.
      </footer>
    </div>
  );
}
