import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Home, FileWarning, User, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { HEALTH_NOTIFICATIONS_CHANGED, getUnreadHealthNotificationCount } from "@/lib/notifications";

const items = [
  { to: "/app", icon: Home, label: "Home", exact: true },
  { to: "/app/notifications", icon: Bell, label: "Alerts" },
  { to: "/app/report", icon: FileWarning, label: "Report" },
  { to: "/app/profile", icon: User, label: "Profile" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [unread, setUnread] = useState(getUnreadHealthNotificationCount);

  useEffect(() => {
    const updateUnread = () => setUnread(getUnreadHealthNotificationCount());
    window.addEventListener(HEALTH_NOTIFICATIONS_CHANGED, updateUnread);
    return () => window.removeEventListener(HEALTH_NOTIFICATIONS_CHANGED, updateUnread);
  }, []);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors"
            >
              <span className="relative">
                <Icon
                  className={`h-5 w-5 transition-all ${active ? "text-primary scale-110" : "text-muted-foreground"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {it.to === "/app/notifications" && unread > 0 && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-destructive" />
                )}
              </span>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
