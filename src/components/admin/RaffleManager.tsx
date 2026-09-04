"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { AdminRaffleState, Raffle } from "@/lib/types";

type FormState = {
  title: string;
  description: string;
  endsAt: string;
  imageFile: File | null;
  imagePreview: string;
};

const emptyForm: FormState = {
  title: "הגרלת סקווישי",
  description: "",
  endsAt: "",
  imageFile: null,
  imagePreview: "",
};

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RaffleManager() {
  const [state, setState] = useState<AdminRaffleState | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creatingNew, setCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await adminFetch("/api/raffle");
    const data = (await response.json()) as AdminRaffleState;
    setState(data);
    setCreatingNew(false);
    if (data.raffle && !data.isEnded) {
      setForm({
        title: data.raffle.title,
        description: data.raffle.description ?? "",
        endsAt: toLocalInput(data.raffle.ends_at),
        imageFile: null,
        imagePreview: data.raffle.image_url,
      });
    }
  }

  useEffect(() => {
    let ignore = false;
    adminFetch("/api/raffle")
      .then((response) => response.json())
      .then((data: AdminRaffleState) => {
        if (ignore) return;
        setState(data);
        if (data.raffle && !data.isEnded) {
          setForm({
            title: data.raffle.title,
            description: data.raffle.description ?? "",
            endsAt: toLocalInput(data.raffle.ends_at),
            imageFile: null,
            imagePreview: data.raffle.image_url,
          });
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let imageUrl = form.imagePreview;
      if (form.imageFile) {
        const payload = new FormData();
        payload.set("file", form.imageFile);
        payload.set("folder", "raffles");
        const upload = await adminFetch("/api/upload", {
          method: "POST",
          body: payload,
        });
        const uploaded = await upload.json();
        if (!upload.ok) {
          throw new Error(uploaded.error || "העלאת התמונה נכשלה");
        }
        imageUrl = uploaded.url;
      }

      if (!imageUrl) {
        throw new Error("צריך תמונה של הסקווישי להגרלה");
      }
      if (!form.endsAt) {
        throw new Error("בחרו מתי ההגרלה נגמרת");
      }

      const body = {
        title: form.title.trim() || "הגרלת סקווישי",
        description: form.description.trim(),
        image_url: imageUrl,
        ends_at: new Date(form.endsAt).toISOString(),
      };

      const current = state?.raffle;
      const canEdit = Boolean(current && !state?.isEnded);
      const response = await adminFetch(
        canEdit ? `/api/raffle/${current!.id}` : "/api/raffle",
        {
          method: canEdit ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "השמירה נכשלה");
      }

      setMessage(canEdit ? "ההגרלה עודכנה!" : "ההגרלה נפתחה!");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "משהו השתבש");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(raffle: Raffle) {
    if (!confirm("למחוק את ההגרלה ואת כל הנרשמים?")) return;
    const response = await adminFetch(`/api/raffle/${raffle.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setState({
        raffle: null,
        entries: [],
        entryCount: 0,
        isOpen: false,
        isEnded: false,
      });
      setForm(emptyForm);
      setCreatingNew(false);
      setMessage("ההגרלה נמחקה");
    }
  }

  function startNew() {
    setForm(emptyForm);
    setCreatingNew(true);
    setMessage("");
  }

  const raffle = state?.raffle ?? null;
  const showForm = !raffle || !state?.isEnded || creatingNew;

  return (
    <div className="space-y-4">
      {raffle && state?.isEnded ? (
        <div className="rounded-3xl bg-squishy-yellow-soft p-4 text-center">
          <p className="text-sm font-bold">ההגרלה הסתיימה</p>
          <p className="mt-1 text-xl font-extrabold">
            {raffle.winner_name || "אין זוכה"}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={startNew}
              className="rounded-full bg-squishy-pink px-4 py-2 text-sm font-extrabold text-white"
            >
              הגרלה חדשה
            </button>
            <button
              type="button"
              onClick={() => handleDelete(raffle)}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold"
            >
              מחיקה
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-squishy-yellow-soft"
        >
          <h3 className="text-lg font-extrabold">
            {raffle && !state?.isEnded ? "עריכת ההגרלה" : "הגרלה חדשה"}
          </h3>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">תמונת הסקווישי</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setForm((current) => ({
                  ...current,
                  imageFile: file,
                  imagePreview: file
                    ? URL.createObjectURL(file)
                    : current.imagePreview,
                }));
              }}
              className="w-full rounded-2xl bg-squishy-yellow-soft px-3 py-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-squishy-pink file:px-3 file:py-1 file:font-bold file:text-white"
            />
          </label>

          {form.imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imagePreview}
              alt="תצוגה מקדימה"
              className="h-36 w-full rounded-2xl object-cover"
            />
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-bold">כותרת</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-2xl border-2 border-squishy-pink/40 bg-squishy-pink-soft px-4 py-3 font-bold outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">תיאור (לא חובה)</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full resize-none rounded-2xl border-2 border-squishy-blue/40 bg-squishy-blue-soft px-4 py-3 outline-none"
              placeholder="מה מרוויחים בהגרלה"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold">עד מתי אפשר להירשם</span>
            <input
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, endsAt: event.target.value }))
              }
              className="w-full rounded-2xl border-2 border-squishy-yellow/50 bg-squishy-yellow-soft px-4 py-3 font-bold outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-squishy-yellow py-3 font-extrabold active:scale-95 disabled:opacity-60"
          >
            {saving ? "שומרות..." : raffle && !state?.isEnded ? "עדכון" : "פתיחת הגרלה"}
          </button>
          {message ? (
            <p className="text-center text-sm font-bold text-ink/80">{message}</p>
          ) : null}
        </form>
      ) : null}

      {raffle && !state?.isEnded ? (
        <button
          type="button"
          onClick={() => handleDelete(raffle)}
          className="w-full rounded-2xl bg-white py-2 text-sm font-bold text-ink/60 ring-1 ring-pink-100"
        >
          מחיקת ההגרלה
        </button>
      ) : null}

      {state && state.entries.length > 0 ? (
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="mb-3 font-extrabold">נרשמים · {state.entryCount}</p>
          <ul className="space-y-2">
            {state.entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-2xl bg-squishy-pink-soft px-3 py-2"
              >
                <span className="font-bold">{entry.name}</span>
                <span className="text-xs font-bold text-ink/55" dir="ltr">
                  {entry.phone || "בלי טלפון"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center text-sm font-bold text-ink/50">
          עוד אין נרשמים להגרלה
        </p>
      )}
    </div>
  );
}
