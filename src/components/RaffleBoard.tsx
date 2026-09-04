"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { PublicRaffleEntry, Raffle, RaffleState } from "@/lib/types";

function enteredKey(raffleId: string) {
  return `squishy-raffle-entered:${raffleId}`;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "הזמן נגמר";
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const clock = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return days > 0 ? `${days} ימים ו-${clock}` : clock;
}

export function RaffleBoard({ initial }: { initial: RaffleState }) {
  const [state, setState] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [entered, setEntered] = useState(() => {
    const raffleId = initial.raffle?.id;
    if (!raffleId || typeof window === "undefined") return false;
    return localStorage.getItem(enteredKey(raffleId)) === "1";
  });

  async function refresh() {
    const response = await fetch("/api/raffle", { cache: "no-store" });
    if (!response.ok) return;
    const next = (await response.json()) as RaffleState;
    setState(next);
  }

  useEffect(() => {
    const endsAt = state.raffle?.ends_at;
    const drawnAt = state.raffle?.drawn_at;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (endsAt && !drawnAt && current >= new Date(endsAt).getTime()) {
        void refresh();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.raffle?.ends_at, state.raffle?.drawn_at]);

  useEffect(() => {
    if (!state.isOpen) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 12000);
    return () => window.clearInterval(timer);
  }, [state.isOpen]);

  const remainingMs = useMemo(() => {
    if (!state.raffle) return 0;
    return new Date(state.raffle.ends_at).getTime() - now;
  }, [now, state.raffle]);

  async function handleEnter(event: FormEvent) {
    event.preventDefault();
    if (!state.raffle) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/raffle/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ההרשמה נכשלה");
      }
      localStorage.setItem(enteredKey(state.raffle.id), "1");
      setEntered(true);
      setName("");
      setPhone("");
      setMessage("נרשמת להגרלה! בהצלחה");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "משהו השתבש");
    } finally {
      setSaving(false);
    }
  }

  if (!state.raffle) {
    return null;
  }

  const raffle = state.raffle;
  const ended = remainingMs <= 0 || state.isEnded || Boolean(raffle.drawn_at);

  return (
    <div className="space-y-4">
      <article className="pop-in overflow-hidden rounded-3xl bg-white shadow-md ring-2 ring-squishy-yellow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={raffle.image_url}
          alt={raffle.title}
          className="h-56 w-full object-cover"
        />
        <div className="space-y-2 px-4 py-4">
          <h2 className="text-xl font-extrabold">{raffle.title}</h2>
          {raffle.description ? (
            <p className="text-sm leading-6 text-ink/75">{raffle.description}</p>
          ) : null}
          <p className="rounded-2xl bg-squishy-blue-soft px-3 py-2 text-center text-sm font-extrabold">
            {ended ? "ההגרלה הסתיימה" : `נשאר ${formatRemaining(remainingMs)}`}
          </p>
        </div>
      </article>

      {ended ? (
        <WinnerCard raffle={raffle} count={state.entryCount} />
      ) : entered ? (
        <div className="rounded-3xl bg-squishy-yellow-soft px-4 py-5 text-center shadow-sm">
          <p className="text-lg font-extrabold">נרשמת להגרלה</p>
          <p className="mt-1 text-sm font-medium text-ink/70">
            מחכים להגרלה האוטומטית בסוף הזמן
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleEnter}
          className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-squishy-pink/40"
        >
          <h3 className="text-lg font-extrabold">השתתפות בהגרלה</h3>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">שם</span>
            <input
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border-2 border-squishy-yellow/50 bg-squishy-yellow-soft px-4 py-3 font-bold outline-none"
              placeholder="השם שלכם"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">טלפון (מומלץ, לא חובה)</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-2xl border-2 border-squishy-blue/40 bg-squishy-blue-soft px-4 py-3 font-bold outline-none"
              placeholder="כדי שנדע ליצור קשר אם זכיתם"
              dir="ltr"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-squishy-pink py-3 text-lg font-extrabold text-white shadow-sm active:scale-95 disabled:opacity-60"
          >
            {saving ? "רושמות..." : "אני רוצה להשתתף"}
          </button>
        </form>
      )}

      {message ? (
        <p className="text-center text-sm font-bold text-ink/80">{message}</p>
      ) : null}

      <NamesList entries={state.entries} count={state.entryCount} />
    </div>
  );
}

function WinnerCard({ raffle, count }: { raffle: Raffle; count: number }) {
  return (
    <div className="pop-in rounded-3xl bg-gradient-to-b from-squishy-yellow via-squishy-yellow-soft to-squishy-pink-soft px-4 py-7 text-center shadow-md">
      <p className="text-4xl" aria-hidden>
        🎉
      </p>
      <h3 className="mt-2 text-xl font-extrabold">תוצאות ההגרלה</h3>
      {raffle.winner_name ? (
        <>
          <p className="mt-2 text-sm font-bold text-ink/70">הזוכה הוא</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {raffle.winner_name}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm font-bold text-ink/70">
          ההגרלה הסתיימה בלי משתתפים
        </p>
      )}
      <p className="mt-3 text-xs font-bold text-ink/55">
        {count} נרשמו להגרלה
      </p>
    </div>
  );
}

function NamesList({
  entries,
  count,
}: {
  entries: PublicRaffleEntry[];
  count: number;
}) {
  if (count === 0) {
    return (
      <p className="text-center text-sm font-bold text-ink/55">
        עוד אין נרשמים. תהיו הראשונים!
      </p>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-center text-sm font-extrabold">
        מי כבר נרשם · {count}
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-full bg-squishy-pink-soft px-3 py-1 text-sm font-bold"
          >
            {entry.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
