export type ReportSeverity = "low" | "medium" | "high" | "critical";
export type ReportStatus = "new" | "investigating" | "resolved" | "dismissed";

export interface Report {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  severity: ReportSeverity;
  status: ReportStatus;
  reportedBy: string;
  createdAt: string;
  hasImage?: boolean;
}

export const CATEGORIES = [
  "Suspicious Activity",
  "Theft",
  "Vandalism",
  "Assault",
  "Drug Activity",
  "Trespassing",
  "Harassment",
  "Other",
];

const seed: Report[] = [
  { id: "r1", title: "Suspicious van near school", category: "Suspicious Activity", description: "White van idling near Lincoln Elementary for over an hour. Tinted windows, no plates.", location: "Lincoln Elementary, 4th Ave", severity: "high", status: "investigating", reportedBy: "user", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "r2", title: "Broken window at corner store", category: "Vandalism", description: "Front window smashed overnight.", location: "Mike's Corner Store, Elm St", severity: "medium", status: "new", reportedBy: "alice", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "r3", title: "Group loitering with weapons", category: "Suspicious Activity", description: "Four individuals seen with what appeared to be knives behind the warehouse.", location: "Riverside Warehouse District", severity: "critical", status: "new", reportedBy: "bob", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "r4", title: "Bike stolen from rack", category: "Theft", description: "Red mountain bike taken between 2-4pm.", location: "Central Park entrance", severity: "low", status: "resolved", reportedBy: "user", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "r5", title: "Verbal harassment at bus stop", category: "Harassment", description: "Individual yelling threats at commuters.", location: "Main & 7th bus stop", severity: "medium", status: "investigating", reportedBy: "carol", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: "r6", title: "Possible drug exchange", category: "Drug Activity", description: "Repeated short visits to a parked sedan.", location: "Maple Heights parking lot", severity: "high", status: "new", reportedBy: "dan", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
];

const KEY = "atlas_reports";

function read(): Report[] {
  if (typeof window === "undefined") return seed;
  const raw = localStorage.getItem(KEY);
  if (!raw) { localStorage.setItem(KEY, JSON.stringify(seed)); return seed; }
  try { return JSON.parse(raw); } catch { return seed; }
}
function write(r: Report[]) { localStorage.setItem(KEY, JSON.stringify(r)); }

export function getReports(): Report[] { return read().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); }
export function getReportsBy(username: string): Report[] { return getReports().filter(r => r.reportedBy === username); }
export function addReport(r: Omit<Report, "id" | "createdAt" | "status">): Report {
  const all = read();
  const created: Report = { ...r, id: "r" + Math.random().toString(36).slice(2, 9), createdAt: new Date().toISOString(), status: "new" };
  all.unshift(created); write(all); return created;
}
export function updateReport(id: string, patch: Partial<Report>) {
  const all = read();
  const i = all.findIndex(r => r.id === id);
  if (i >= 0) { all[i] = { ...all[i], ...patch }; write(all); }
}

export function analyzeReport(r: Report) {
  // Simple deterministic "AI" simulation
  const text = (r.title + " " + r.description + " " + r.category).toLowerCase();
  let risk = 20;
  const flags: string[] = [];
  const keywords: Record<string, number> = {
    weapon: 35, knife: 30, gun: 45, firearm: 45, threat: 25, drug: 25,
    child: 30, school: 20, blood: 30, break: 15, smash: 10, steal: 10,
    stalk: 25, follow: 15, suspicious: 10, harass: 15, assault: 35,
  };
  Object.entries(keywords).forEach(([k, v]) => {
    if (text.includes(k)) { risk += v; flags.push(k); }
  });
  if (r.severity === "critical") risk += 25;
  else if (r.severity === "high") risk += 15;
  else if (r.severity === "medium") risk += 5;
  risk = Math.min(99, risk);

  const priority = risk >= 75 ? "Immediate dispatch" : risk >= 50 ? "Within 1 hour" : risk >= 30 ? "Within 24 hours" : "Routine review";
  const escalation = risk >= 75
    ? "High likelihood of escalation. Recommend immediate patrol response and area canvas."
    : risk >= 50
    ? "Moderate escalation risk. Assign officer to investigate and monitor location."
    : risk >= 30
    ? "Low escalation risk. Log and route to community liaison for follow-up."
    : "Minimal threat indicators. File for pattern analysis.";

  const similarPatterns = risk >= 50 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2);
  return { risk, flags, priority, escalation, similarPatterns };
}
