import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";
import { Splash } from "@/components/Splash";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // wait one tick for auth hydration
    const t = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (user.role === "admin") { navigate({ to: "/admin" }); return; }
    if (!user.onboarded) { navigate({ to: "/onboarding" }); return; }
  }, [hydrated, user, navigate]);

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />;
  if (!user || user.role !== "user") return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
