export type NotificationLevel = "preventive" | "danger";

export type HealthNotification = {
  id: string;
  level: NotificationLevel;
  title: string;
  disease: string;
  summary: string;
  location: string;
  action: string;
  createdAt: string;
  read: boolean;
};

const KEY = "atlas_health_notifications";
export const HEALTH_NOTIFICATIONS_CHANGED = "atlas_health_notifications_changed";

const seed: HealthNotification[] = [
  {
    id: "hn1",
    level: "danger",
    title: "Cholera cases reported nearby",
    disease: "Cholera",
    summary: "Multiple suspected cases were reported within the community health zone.",
    location: "Riverside and Central Market area",
    action: "Use only treated water, avoid street drinks, and visit a clinic immediately for severe diarrhea.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    read: false,
  },
  {
    id: "hn2",
    level: "preventive",
    title: "Flu prevention advisory",
    disease: "Seasonal Influenza",
    summary: "Clinics are seeing a rise in flu-like symptoms this week.",
    location: "Citywide",
    action: "Wash hands often, wear a mask in crowded rooms, and stay home if you have fever or cough.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    read: false,
  },
  {
    id: "hn3",
    level: "danger",
    title: "Measles exposure alert",
    disease: "Measles",
    summary: "A confirmed exposure was linked to a public transit route and nearby waiting area.",
    location: "Main bus terminal",
    action: "Check vaccination status and call a health provider if rash, fever, or red eyes appear.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    read: true,
  },
  {
    id: "hn4",
    level: "preventive",
    title: "Malaria prevention notice",
    disease: "Malaria",
    summary: "Recent rains may increase mosquito breeding around standing water.",
    location: "Low-lying residential blocks",
    action: "Clear stagnant water, use insecticide-treated nets, and seek testing for fever.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    read: true,
  },
];

function read(): HealthNotification[] {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as HealthNotification[];
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}

function write(notifications: HealthNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event(HEALTH_NOTIFICATIONS_CHANGED));
}

export function getHealthNotifications() {
  return read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getUnreadHealthNotificationCount() {
  return read().filter((notification) => !notification.read).length;
}

export function markHealthNotificationRead(id: string) {
  const notifications = read().map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification,
  );
  write(notifications);
  return notifications;
}

export function markAllHealthNotificationsRead() {
  const notifications = read().map((notification) => ({ ...notification, read: true }));
  write(notifications);
  return notifications;
}
