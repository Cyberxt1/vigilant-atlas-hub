import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Check, CheckCheck, ShieldCheck } from "lucide-react";
import {
  getHealthNotifications,
  markAllHealthNotificationsRead,
  markHealthNotificationRead,
  type HealthNotification,
} from "@/lib/notifications";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState(getHealthNotifications);
  const unread = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const markRead = (id: string) => setNotifications(markHealthNotificationRead(id));
  const markAllRead = () => setNotifications(markAllHealthNotificationsRead());

  return (
    <div className="px-5 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Health alerts</p>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        </div>
        <button
          onClick={markAllRead}
          disabled={unread === 0}
          className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all
        </button>
      </header>

      <div className="mt-5 rounded-3xl border bg-gradient-soft p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{unread} unread health alert{unread === 1 ? "" : "s"}</p>
            <p className="text-xs text-muted-foreground">Color-coded local health updates.</p>
          </div>
        </div>
      </div>

      <section className="mt-5 space-y-2">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} onRead={() => markRead(notification.id)} />
        ))}
      </section>
    </div>
  );
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: HealthNotification;
  onRead: () => void;
}) {
  const isDanger = notification.level === "danger";
  const Icon = isDanger ? AlertTriangle : ShieldCheck;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-card p-3 transition ${
        isDanger
          ? "border-destructive/30"
          : "border-warning/40"
      } ${notification.read ? "opacity-75" : "shadow-sm"}`}
    >
      <span className={`absolute bottom-0 left-0 top-0 w-1 ${isDanger ? "bg-destructive" : "bg-warning"}`} />
      <div className="flex items-start gap-3 pl-1">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isDanger ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-warning"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{notification.title}</h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {notification.disease} - {notification.location}
              </p>
            </div>
            {notification.read ? (
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <button
                onClick={onRead}
                aria-label="Mark notification as read"
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:border-success hover:text-success"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-foreground">{notification.summary}</p>
          {notification.read && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{notification.action}</p>}
          <p className="mt-2 text-[10px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </article>
  );
}
