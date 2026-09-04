"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import type { Video } from "@/lib/types";

type FormState = {
  id?: string;
  title: string;
  video_url: string;
  videoFile: File | null;
};

const emptyForm: FormState = {
  title: "",
  video_url: "",
  videoFile: null,
};

export function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadVideos() {
    const response = await fetch("/api/videos");
    const data = await response.json();
    setVideos(data.videos ?? []);
  }

  useEffect(() => {
    let ignore = false;
    fetch("/api/videos")
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setVideos(data.videos ?? []);
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
      let videoUrl = form.video_url.trim();
      if (form.videoFile) {
        const payload = new FormData();
        payload.set("file", form.videoFile);
        payload.set("folder", "videos");
        const upload = await adminFetch("/api/upload", {
          method: "POST",
          body: payload,
        });
        const uploaded = await upload.json();
        if (!upload.ok) {
          throw new Error(uploaded.error || "העלאת הסרטון נכשלה");
        }
        videoUrl = uploaded.url;
      }

      if (!form.title.trim() || !videoUrl) {
        throw new Error("צריך כותרת וסרטון או קישור");
      }

      const response = await adminFetch(
        form.id ? `/api/videos/${form.id}` : "/api/videos",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify({ title: form.title, video_url: videoUrl }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "השמירה נכשלה");
      }

      setForm(emptyForm);
      setMessage(form.id ? "הסרטון עודכן!" : "סרטון חדש נוסף!");
      await loadVideos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "משהו השתבש");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הסרטון הזה?")) return;
    const response = await adminFetch(`/api/videos/${id}`, { method: "DELETE" });
    if (response.ok) {
      setVideos((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-squishy-blue-soft"
      >
        <h3 className="text-lg font-extrabold">
          {form.id ? "עריכת סרטון" : "הוספת סרטון חדש"}
        </h3>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">כותרת</span>
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className="w-full rounded-2xl border-2 border-squishy-pink/30 bg-squishy-pink-soft px-4 py-3 font-bold outline-none"
            placeholder="איך סוחטים את הסקווישי"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">העלאת קובץ סרטון</span>
          <input
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setForm((current) => ({ ...current, videoFile: file }));
            }}
            className="w-full rounded-2xl bg-squishy-blue-soft px-3 py-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-squishy-blue file:px-3 file:py-1 file:font-bold file:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">או קישור לסרטון</span>
          <input
            type="url"
            value={form.video_url}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                video_url: event.target.value,
              }))
            }
            className="w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none"
            placeholder="https://youtube.com/..."
            dir="ltr"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-squishy-blue py-3 font-extrabold text-white active:scale-95 disabled:opacity-60"
          >
            {saving ? "שומרות..." : form.id ? "עדכון" : "הוספה"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-2xl bg-white px-4 py-3 font-bold ring-1 ring-pink-100"
            >
              ביטול
            </button>
          ) : null}
        </div>
        {message ? (
          <p className="text-center text-sm font-bold text-ink/80">{message}</p>
        ) : null}
      </form>

      <ul className="space-y-3">
        {videos.map((video) => (
          <li key={video.id} className="rounded-3xl bg-white p-3 shadow-sm">
            <p className="font-extrabold">{video.title}</p>
            <p className="mt-1 truncate text-[11px] text-ink/40" dir="ltr">
              {video.video_url}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    id: video.id,
                    title: video.title,
                    video_url: video.video_url,
                    videoFile: null,
                  })
                }
                className="rounded-full bg-squishy-blue-soft px-3 py-1 text-xs font-bold"
              >
                עריכה
              </button>
              <button
                type="button"
                onClick={() => handleDelete(video.id)}
                className="rounded-full bg-squishy-pink-soft px-3 py-1 text-xs font-bold"
              >
                מחיקה
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
