import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Shield, ArrowRight, ArrowLeft, User, Phone, MapPin, HeartHandshake } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Atlas" }] }),
  component: Onboarding,
});

const steps = [
  { key: "displayName", label: "What should we call you?", placeholder: "Full name or nickname", icon: User },
  { key: "phone", label: "Phone number", placeholder: "+1 555 123 4567", icon: Phone },
  { key: "address", label: "Your neighborhood", placeholder: "Street, City", icon: MapPin },
  { key: "emergencyContact", label: "Emergency contact", placeholder: "Name & number", icon: HeartHandshake },
] as const;

function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user === null) {
      // give auth a tick to hydrate from localStorage
      const t = setTimeout(() => {
        const stored = typeof window !== "undefined" && localStorage.getItem("atlas_user");
        if (!stored) navigate({ to: "/login" });
      }, 300);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  const current = steps[step];
  const Icon = current.icon;

  const next = () => {
    if (!values[current.key]?.trim()) return toast.error("Please fill this in");
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };
  const finish = () => {
    updateUser({ ...values, onboarded: true });
    toast.success("All set! Welcome to Atlas.");
    navigate({ to: "/app" });
  };
  const skip = () => { updateUser({ onboarded: true }); navigate({ to: "/app" }); };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg">Atlas</span>
        </div>

        {/* progress */}
        <div className="mb-6 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div key={step} className="rounded-3xl border bg-card p-6 shadow-glow animate-slide-up">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{current.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Step {step + 1} of {steps.length} · Helps us protect you better</p>

          <input
            autoFocus
            value={values[current.key] ?? ""}
            onChange={(e) => setValues({ ...values, [current.key]: e.target.value })}
            placeholder={current.placeholder}
            onKeyDown={(e) => e.key === "Enter" && next()}
            className="mt-6 w-full rounded-2xl border bg-background px-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step > 0 ? setStep(step - 1) : skip())}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {step > 0 ? <><ArrowLeft className="h-4 w-4" /> Back</> : "Skip for now"}
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-5 py-2.5 font-semibold text-white shadow-glow hover:scale-105 transition"
            >
              {step === steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
