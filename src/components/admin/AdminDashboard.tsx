"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  adminFetch,
  clearStoredAdminPassword,
  getStoredAdminPassword,
  setStoredAdminPassword,
} from "@/lib/admin-client";
import { AboutManager } from "@/components/admin/AboutManager";
import { ProductManager } from "@/components/admin/ProductManager";
import { RaffleManager } from "@/components/admin/RaffleManager";
import { VideoManager } from "@/components/admin/VideoManager";

type Tab = "products" | "videos" | "about" | "raffle";

export function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [pageViews, setPageViews] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    const stored = getStoredAdminPassword();

    async function verify() {
      if (!stored) return false;
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: stored }),
      });
      return response.ok;
    }

    verify().then((ok) => {
      if (ignore) return;
      if (ok) {
        setUnlocked(true);
        adminFetch("/api/views")
          .then((response) => response.json())
          .then((data: { page_views?: number }) => {
            if (!ignore && typeof data.page_views === "number") {
              setPageViews(data.page_views);
            }
          });
      } else if (stored) {
        clearStoredAdminPassword();
      }
      setChecking(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("סיסמה שגויה. נסו שוב.");
      return;
    }

    setStoredAdminPassword(password.trim());
    setUnlocked(true);
    adminFetch("/api/views")
      .then((response) => response.json())
      .then((data: { page_views?: number }) => {
        if (typeof data.page_views === "number") setPageViews(data.page_views);
      });
  }

  function handleLogout() {
    clearStoredAdminPassword();
    setPassword("");
    setUnlocked(false);
  }

  if (checking) {
    return (
      <div className="rounded-3xl bg-squishy-yellow-soft p-8 text-center font-bold">
        בודקים גישה...
      </div>
    );
  }

  if (!unlocked) {
    return (
      <form
        onSubmit={handleLogin}
        className="pop-in space-y-4 rounded-3xl bg-white p-5 shadow-md ring-2 ring-squishy-yellow"
      >
        <div className="text-center">
          <div className="mb-2 text-4xl" aria-hidden>
            🔐
          </div>
          <h2 className="text-xl font-extrabold">כניסת מנהלות</h2>
          <p className="mt-1 text-sm font-medium text-ink/70">
            הזינו סיסמה כדי להוסיף סקווישים, סרטונים, הגרלה וטקסט עלינו
          </p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">סיסמה</span>
          <input
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border-2 border-squishy-pink/40 bg-squishy-pink-soft px-4 py-3 text-center text-lg font-bold outline-none focus:border-squishy-pink"
            placeholder="••••••"
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <p className="rounded-2xl bg-squishy-pink px-3 py-2 text-center text-sm font-bold text-white">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-2xl bg-squishy-yellow py-3 text-lg font-extrabold shadow-sm active:scale-95"
        >
          כניסה
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl bg-squishy-blue-soft px-4 py-3">
        <p className="text-sm font-extrabold">שלום ליהי וארי ✨</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold">
            👀 {pageViews ?? "…"} צפיות
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink/70"
          >
            יציאה
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <TabButton
          active={tab === "products"}
          onClick={() => setTab("products")}
          label="מוצרים"
        />
        <TabButton
          active={tab === "videos"}
          onClick={() => setTab("videos")}
          label="סרטונים"
        />
        <TabButton
          active={tab === "raffle"}
          onClick={() => setTab("raffle")}
          label="הגרלה"
        />
        <TabButton
          active={tab === "about"}
          onClick={() => setTab("about")}
          label="עלינו"
        />
      </div>

      {tab === "products" ? <ProductManager /> : null}
      {tab === "videos" ? <VideoManager /> : null}
      {tab === "raffle" ? <RaffleManager /> : null}
      {tab === "about" ? <AboutManager /> : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl py-2.5 text-xs font-extrabold active:scale-95 sm:text-sm ${
        active
          ? "bg-squishy-pink text-white shadow-sm"
          : "bg-white text-ink/60 ring-1 ring-pink-100"
      }`}
    >
      {label}
    </button>
  );
}
