"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";

export function AboutManager() {
  const [aboutText, setAboutText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    fetch("/api/settings")
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setAboutText(data.settings?.about_text ?? "");
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await adminFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ about_text: aboutText }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(data.error || "השמירה נכשלה");
      return;
    }

    setMessage("הטקסט נשמר!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-squishy-pink-soft"
    >
      <h3 className="text-lg font-extrabold">טקסט עמוד עלינו</h3>
      <textarea
        rows={10}
        value={aboutText}
        onChange={(event) => setAboutText(event.target.value)}
        className="w-full resize-none rounded-2xl border-2 border-squishy-pink/30 bg-squishy-pink-soft px-4 py-3 leading-7 outline-none"
        placeholder="כתבו כאן על עולם הסקווישים של ליהי וארי..."
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-squishy-pink py-3 font-extrabold text-white active:scale-95 disabled:opacity-60"
      >
        {saving ? "שומרות..." : "שמירת טקסט"}
      </button>
      {message ? (
        <p className="text-center text-sm font-bold text-ink/80">{message}</p>
      ) : null}
    </form>
  );
}
