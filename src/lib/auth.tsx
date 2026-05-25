import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "user";
export interface AuthUser {
  username: string;
  role: Role;
  displayName?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  avatar?: string;
  onboarded?: boolean;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (username: string, password: string) => { ok: boolean; error?: string; user?: AuthUser };
  signup: (username: string, password: string) => { ok: boolean; error?: string; user?: AuthUser };
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

type Account = AuthUser & { password: string };

const PRESET: Account[] = [
  { username: "admin", password: "admin123", role: "admin", displayName: "Atlas Admin", onboarded: true },
  { username: "user", password: "user123", role: "user", displayName: "Demo User", onboarded: true },
];

const Ctx = createContext<AuthCtx | null>(null);

function readAccounts(): Account[] {
  if (typeof window === "undefined") return [...PRESET];
  try {
    const raw = localStorage.getItem("atlas_accounts");
    if (!raw) return [...PRESET];
    return JSON.parse(raw) as Account[];
  } catch {
    return [...PRESET];
  }
}
function writeAccounts(a: Account[]) {
  localStorage.setItem("atlas_accounts", JSON.stringify(a));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // seed accounts
    if (!localStorage.getItem("atlas_accounts")) writeAccounts(PRESET);
    const raw = localStorage.getItem("atlas_user");
    if (raw) {
      try { setUser(JSON.parse(raw) as AuthUser); } catch {
        setUser(null);
      }
    }
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem("atlas_user", JSON.stringify(u));
    else localStorage.removeItem("atlas_user");
  };

  const login: AuthCtx["login"] = (username, password) => {
    const accounts = readAccounts();
    const acc = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase() && a.password === password);
    if (!acc) return { ok: false, error: "Invalid credentials" };
    const u: AuthUser = {
      username: acc.username, role: acc.role,
      displayName: acc.displayName, phone: acc.phone,
      address: acc.address, emergencyContact: acc.emergencyContact,
      avatar: acc.avatar, onboarded: acc.onboarded ?? true,
    };
    persist(u);
    return { ok: true, user: u };
  };

  const signup: AuthCtx["signup"] = (username, password) => {
    const accounts = readAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: "Username already exists" };
    const acc: Account = { username, password, role: "user", onboarded: false };
    accounts.push(acc);
    writeAccounts(accounts);
    const u: AuthUser = { username, role: "user", onboarded: false };
    persist(u);
    return { ok: true, user: u };
  };

  const updateUser: AuthCtx["updateUser"] = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
    const accounts = readAccounts();
    const idx = accounts.findIndex((a) => a.username === user.username);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...patch };
      writeAccounts(accounts);
    }
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, signup, updateUser, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
